import { schedules } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { placeReminderCall } from "@/lib/twilio";
import { ReminderStatus } from "@prisma/client";

async function processWindow(
  userId: string,
  phoneNumber: string,
  voiceLanguage: string,
  reminderMinutes: number
) {
  const windowStart = new Date(Date.now() + (reminderMinutes - 1) * 60 * 1000);
  const windowEnd   = new Date(Date.now() + (reminderMinutes + 1) * 60 * 1000);

  const upcomingEvents = await db.calendarEvent.findMany({
    where: {
      userId,
      startTime: { gte: windowStart, lte: windowEnd },
      status: "confirmed",
      skipped: false,
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      joinUrl: true,
      reminders: {
        where: { userId },
        select: { id: true, status: true },
        take: 1,
      },
    },
  });

  let called = 0;

  for (const event of upcomingEvents) {
    const existing = event.reminders[0];
    if (existing && existing.status !== ReminderStatus.PENDING) {
      console.log(`[reminder-scheduler] Already processed event ${event.id} (${existing.status})`);
      continue;
    }

    const reminder = await db.reminder.upsert({
      where: { eventId_userId: { eventId: event.id, userId } },
      create: {
        eventId: event.id,
        userId,
        scheduledAt: new Date(event.startTime.getTime() - reminderMinutes * 60 * 1000),
        status: ReminderStatus.CALLING,
      },
      update: { status: ReminderStatus.CALLING },
    });

    try {
      console.log(`[reminder-scheduler] Placing call for "${event.title}" to ${phoneNumber}`);
      const callSid = await placeReminderCall(
        userId,
        event.id,
        phoneNumber,
        event.title,
        voiceLanguage,
        event.joinUrl
      );
      await db.reminder.update({
        where: { id: reminder.id },
        data: { status: ReminderStatus.SENT, sentAt: new Date(), callSid },
      });
      console.log(`[reminder-scheduler] Call placed for event ${event.id}, SID: ${callSid}`);
      called++;
    } catch (error) {
      console.error(`[reminder-scheduler] Failed to call for event ${event.id}:`, error);
      await db.reminder.update({
        where: { id: reminder.id },
        data: {
          status: ReminderStatus.FAILED,
          errorMsg: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  return { processed: upcomingEvents.length, called };
}

export const reminderSchedulerTask = schedules.task({
  id: "reminder-scheduler",
  cron: "* * * * *",
  maxDuration: 55,
  run: async () => {
    console.log("[reminder-scheduler] Checking for upcoming meetings");

    const usersWithSettings = await db.settings.findMany({
      where: { isActive: true, phoneNumber: { not: null } },
      select: {
        userId: true,
        phoneNumber: true,
        reminderMinutes: true,
        reminderMinutes2: true,
        voiceLanguage: true,
      },
    });

    if (usersWithSettings.length === 0) {
      console.log("[reminder-scheduler] No active users with phone numbers");
      return { processed: 0 };
    }

    let totalProcessed = 0;
    let totalCalled    = 0;

    for (const settings of usersWithSettings) {
      const { userId, phoneNumber, reminderMinutes, reminderMinutes2, voiceLanguage } = settings;

      const r1 = await processWindow(userId, phoneNumber!, voiceLanguage, reminderMinutes);
      totalProcessed += r1.processed;
      totalCalled    += r1.called;

      if (reminderMinutes2) {
        const r2 = await processWindow(userId, phoneNumber!, voiceLanguage, reminderMinutes2);
        totalProcessed += r2.processed;
        totalCalled    += r2.called;
      }
    }

    console.log(
      `[reminder-scheduler] Done. Processed ${totalProcessed} events, placed ${totalCalled} calls`
    );
    return { processed: totalProcessed, called: totalCalled };
  },
});

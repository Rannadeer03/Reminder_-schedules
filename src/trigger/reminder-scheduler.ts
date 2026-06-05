import { schedules } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { placeReminderCall } from "@/lib/twilio";
import { ReminderStatus } from "@prisma/client";

// Runs every minute — detects meetings coming up and places calls
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
        voiceLanguage: true,
      },
    });

    if (usersWithSettings.length === 0) {
      console.log("[reminder-scheduler] No active users with phone numbers");
      return { processed: 0 };
    }

    let processed = 0;
    let called = 0;

    for (const settings of usersWithSettings) {
      const { reminderMinutes } = settings;

      const windowStart = new Date(Date.now() + (reminderMinutes - 1) * 60 * 1000);
      const windowEnd   = new Date(Date.now() + (reminderMinutes + 1) * 60 * 1000);

      // Batch: fetch events + their reminder status in one query (no N+1)
      const upcomingEvents = await db.calendarEvent.findMany({
        where: {
          userId: settings.userId,
          startTime: { gte: windowStart, lte: windowEnd },
          status: "confirmed",
        },
        select: {
          id: true,
          title: true,
          startTime: true,
          reminders: {
            where: { userId: settings.userId },
            select: { id: true, status: true },
            take: 1,
          },
        },
      });

      for (const event of upcomingEvents) {
        processed++;

        const existing = event.reminders[0];

        if (existing && existing.status !== ReminderStatus.PENDING) {
          console.log(
            `[reminder-scheduler] Reminder already processed for event ${event.id} (${existing.status})`
          );
          continue;
        }

        const reminder = await db.reminder.upsert({
          where: { eventId_userId: { eventId: event.id, userId: settings.userId } },
          create: {
            eventId: event.id,
            userId: settings.userId,
            scheduledAt: new Date(event.startTime.getTime() - reminderMinutes * 60 * 1000),
            status: ReminderStatus.CALLING,
          },
          update: { status: ReminderStatus.CALLING },
        });

        try {
          console.log(
            `[reminder-scheduler] Placing call for event "${event.title}" to ${settings.phoneNumber}`
          );

          const callSid = await placeReminderCall(
            settings.userId,
            event.id,
            settings.phoneNumber!,
            event.title,
            settings.voiceLanguage
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
    }

    console.log(`[reminder-scheduler] Done. Processed ${processed} events, placed ${called} calls`);
    return { processed, called };
  },
});

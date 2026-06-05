import { task, wait } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { placeReminderCall } from "@/lib/twilio";
import { ReminderStatus } from "@prisma/client";

export const retryReminderTask = task({
  id: "retry-reminder",
  maxDuration: 180,
  machine: "small-1x",
  run: async ({ userId, eventId }: { userId: string; eventId: string }) => {
    console.log(`[retry-reminder] Waiting 2 min before retrying event ${eventId}`);
    await wait.for({ seconds: 120 });

    const [event, settings] = await Promise.all([
      db.calendarEvent.findUnique({
        where: { id: eventId },
        select: { title: true, joinUrl: true, skipped: true, status: true },
      }),
      db.settings.findUnique({
        where: { userId },
        select: { phoneNumber: true, voiceLanguage: true, isActive: true },
      }),
    ]);

    if (!event || event.skipped || event.status !== "confirmed") {
      console.log(`[retry-reminder] Event ${eventId} skipped or cancelled — no retry`);
      return { skipped: true };
    }

    if (!settings?.phoneNumber || !settings.isActive) {
      console.log(`[retry-reminder] User ${userId} has no phone or is inactive — no retry`);
      return { skipped: true };
    }

    try {
      const callSid = await placeReminderCall(
        userId,
        eventId,
        settings.phoneNumber,
        event.title,
        settings.voiceLanguage ?? "en-US",
        event.joinUrl
      );

      await db.reminder.updateMany({
        where: { eventId, userId },
        data: { status: ReminderStatus.SENT, sentAt: new Date(), callSid },
      });

      console.log(`[retry-reminder] Retry call placed, SID: ${callSid}`);
      return { callSid };
    } catch (error) {
      console.error(`[retry-reminder] Retry failed for event ${eventId}:`, error);
      return { error: String(error) };
    }
  },
});

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateTwilioWebhook, sendSmsReminder } from "@/lib/twilio";
import { tasks } from "@trigger.dev/sdk/v3";
import { CallStatus, ReminderStatus } from "@prisma/client";

const STATUS_MAP: Record<string, CallStatus> = {
  queued: CallStatus.INITIATED,
  initiated: CallStatus.INITIATED,
  ringing: CallStatus.RINGING,
  "in-progress": CallStatus.IN_PROGRESS,
  completed: CallStatus.COMPLETED,
  failed: CallStatus.FAILED,
  busy: CallStatus.BUSY,
  "no-answer": CallStatus.NO_ANSWER,
  canceled: CallStatus.CANCELLED,
};

export async function POST(request: NextRequest) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio`;
  const signature = request.headers.get("x-twilio-signature") ?? "";

  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => { params[key] = value.toString(); });

  if (process.env.NODE_ENV === "production") {
    const isValid = await validateTwilioWebhook(signature, url, params);
    if (!isValid) {
      console.warn("[webhooks/twilio] Invalid signature");
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const callSid = params["CallSid"];
  const callStatus = params["CallStatus"];
  const duration = params["CallDuration"] ? parseInt(params["CallDuration"]) : undefined;

  if (!callSid || !callStatus) return new NextResponse("Bad Request", { status: 400 });

  const mappedStatus = STATUS_MAP[callStatus] ?? CallStatus.FAILED;
  const isTerminal = ["completed", "failed", "busy", "no-answer", "canceled"].includes(callStatus);

  try {
    await db.callLog.updateMany({
      where: { callSid },
      data: {
        status: mappedStatus,
        duration: duration ?? null,
        endedAt: isTerminal ? new Date() : null,
      },
    });

    if (callStatus === "completed") {
      await db.reminder.updateMany({
        where: { callSid, status: { not: ReminderStatus.SENT } },
        data: { status: ReminderStatus.SENT },
      });
    }

    // SMS backup + auto-retry on no-answer or busy
    if (callStatus === "no-answer" || callStatus === "busy") {
      const log = await db.callLog.findUnique({
        where: { callSid },
        select: { userId: true, eventId: true },
      });

      if (log?.userId) {
        const [settings, reminder] = await Promise.all([
          db.settings.findUnique({
            where: { userId: log.userId },
            select: { smsBackup: true, phoneNumber: true, reminderMinutes: true },
          }),
          log.eventId
            ? db.reminder.findFirst({
                where: { eventId: log.eventId, userId: log.userId },
                select: { id: true, retried: true },
              })
            : Promise.resolve(null),
        ]);

        // SMS backup
        if (settings?.smsBackup && settings.phoneNumber && log.eventId) {
          const event = await db.calendarEvent.findUnique({
            where: { id: log.eventId },
            select: { title: true },
          });
          if (event) {
            await sendSmsReminder(
              settings.phoneNumber,
              event.title,
              settings.reminderMinutes ?? 10,
              log.userId
            ).catch((e) => console.error("[webhooks/twilio] SMS backup failed:", e));
          }
        }

        // Auto-retry once
        if (reminder && !reminder.retried && log.eventId) {
          await db.reminder.update({ where: { id: reminder.id }, data: { retried: true } });
          tasks
            .trigger("retry-reminder", { userId: log.userId, eventId: log.eventId })
            .catch((e) => console.error("[webhooks/twilio] Failed to trigger retry:", e));
        }
      }
    }

    console.log(`[webhooks/twilio] ${callSid} → ${callStatus}`);
  } catch (error) {
    console.error("[webhooks/twilio] DB update failed:", error);
  }

  return new NextResponse("OK", { status: 200 });
}

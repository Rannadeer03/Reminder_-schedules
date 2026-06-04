import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateTwilioWebhook } from "@/lib/twilio";
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
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  // Validate webhook authenticity in production
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

  if (!callSid || !callStatus) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const mappedStatus = STATUS_MAP[callStatus] ?? CallStatus.FAILED;

  try {
    await db.callLog.updateMany({
      where: { callSid },
      data: {
        status: mappedStatus,
        duration: duration ?? null,
        endedAt: ["completed", "failed", "busy", "no-answer", "canceled"].includes(callStatus)
          ? new Date()
          : null,
      },
    });

    // If call completed successfully, ensure reminder is marked SENT
    if (callStatus === "completed") {
      const log = await db.callLog.findUnique({ where: { callSid } });
      if (log?.eventId) {
        await db.reminder.updateMany({
          where: { callSid, status: { not: ReminderStatus.SENT } },
          data: { status: ReminderStatus.SENT },
        });
      }
    }

    console.log(`[webhooks/twilio] ${callSid} → ${callStatus}`);
  } catch (error) {
    console.error("[webhooks/twilio] DB update failed:", error);
  }

  return new NextResponse("OK", { status: 200 });
}

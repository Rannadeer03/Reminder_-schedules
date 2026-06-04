import twilio from "twilio";
import { db } from "@/lib/db";

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio credentials not configured");
  return twilio(sid, token);
}

export function buildReminderTwiml(eventTitle: string, language = "en-US"): string {
  const message = `Hello. You have a meeting in 10 minutes. Meeting title: ${eventTitle}.`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${language}">${escapeXml(message)}</Say>
  <Pause length="1"/>
  <Say voice="alice" language="${language}">${escapeXml(message)}</Say>
</Response>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function placeReminderCall(
  userId: string,
  eventId: string,
  toNumber: string,
  eventTitle: string,
  language = "en-US"
): Promise<string> {
  const client = getClient();
  const from = process.env.TWILIO_PHONE_NUMBER!;
  const webhookUrl = `${process.env.TWILIO_WEBHOOK_URL}`;
  const twiml = buildReminderTwiml(eventTitle, language);

  // Use TwiML Bins or a status callback URL
  const call = await client.calls.create({
    to: toNumber,
    from,
    twiml,
    statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio`,
    statusCallbackMethod: "POST",
    statusCallbackEvent: ["completed", "failed", "busy", "no-answer"],
    timeout: 30,
  });

  // Log the call
  await db.callLog.create({
    data: {
      userId,
      eventId,
      callSid: call.sid,
      toNumber,
      fromNumber: from,
      status: "INITIATED",
      twimlScript: twiml,
    },
  });

  return call.sid;
}

export async function sendTestCall(toNumber: string, userId: string): Promise<string> {
  const client = getClient();
  const from = process.env.TWILIO_PHONE_NUMBER!;
  const twiml = buildReminderTwiml("Test Meeting — this is a test reminder call");

  const call = await client.calls.create({
    to: toNumber,
    from,
    twiml,
    timeout: 30,
  });

  await db.callLog.create({
    data: {
      userId,
      callSid: call.sid,
      toNumber,
      fromNumber: from,
      status: "INITIATED",
      twimlScript: twiml,
    },
  });

  return call.sid;
}

export async function validateTwilioWebhook(
  signature: string,
  url: string,
  params: Record<string, string>
): Promise<boolean> {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;
  return twilio.validateRequest(authToken, signature, url, params);
}

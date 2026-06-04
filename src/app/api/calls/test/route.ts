import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendTestCall } from "@/lib/twilio";
import { testCallSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = testCallSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  try {
    const callSid = await sendTestCall(parsed.data.phoneNumber, session.user.id);
    return NextResponse.json({ callSid, message: "Test call initiated" });
  } catch (error) {
    console.error("[api/calls/test]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Call failed" },
      { status: 500 }
    );
  }
}

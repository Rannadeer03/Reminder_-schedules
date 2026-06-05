import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== "mig-2x9k-run-once-delete-after") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE "CalendarEvent" ADD COLUMN IF NOT EXISTS "joinUrl" TEXT`
    );
    await db.$executeRawUnsafe(
      `ALTER TABLE "CalendarEvent" ADD COLUMN IF NOT EXISTS "skipped" BOOLEAN NOT NULL DEFAULT false`
    );
    await db.$executeRawUnsafe(
      `ALTER TABLE "Reminder" ADD COLUMN IF NOT EXISTS "retried" BOOLEAN NOT NULL DEFAULT false`
    );
    await db.$executeRawUnsafe(
      `ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "reminderMinutes2" INTEGER`
    );
    return NextResponse.json({ ok: true, message: "Migration applied" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

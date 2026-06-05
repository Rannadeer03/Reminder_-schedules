import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { syncCalendarEvents } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const synced = await syncCalendarEvents(session.user.id);
    return NextResponse.json({ synced, message: `Synced ${synced} events` });
  } catch (error) {
    console.error("[api/calendar/sync]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}

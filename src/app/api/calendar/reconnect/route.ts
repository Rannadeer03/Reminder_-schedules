import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Deletes the Google Account link + CalendarConnection so that the user's
// next sign-in via Google triggers linkAccount and saves fresh OAuth tokens.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  await Promise.all([
    db.account.deleteMany({ where: { userId, provider: "google" } }),
    db.calendarConnection.deleteMany({ where: { userId } }),
  ]);

  return NextResponse.json({ success: true });
}

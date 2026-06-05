import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

  const events = await db.calendarEvent.findMany({
    where: {
      userId: session.user.id,
      startTime: { gte: new Date() },
      status: { not: "cancelled" },
    },
    orderBy: { startTime: "asc" },
    take: limit,
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      timezone: true,
      location: true,
      htmlLink: true,
      reminders: {
        select: { status: true, sentAt: true, callSid: true },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json({ events });
}

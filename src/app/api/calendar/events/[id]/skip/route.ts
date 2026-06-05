import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const event = await db.calendarEvent.findUnique({
    where: { id },
    select: { userId: true, skipped: true },
  });

  if (!event || event.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.calendarEvent.update({
    where: { id },
    data: { skipped: !event.skipped },
    select: { skipped: true },
  });

  return NextResponse.json({ skipped: updated.skipped });
}

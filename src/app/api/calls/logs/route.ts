import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const page = Math.max(parseInt(searchParams.get("page") ?? "1"), 1);
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    db.callLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    db.callLog.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({ logs, total, page, limit });
}

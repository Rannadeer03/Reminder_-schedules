import { auth } from "@/auth";
import { db } from "@/lib/db";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ConnectionStatus } from "@/components/dashboard/connection-status";
import { UpcomingMeetings } from "@/components/dashboard/upcoming-meetings";
import { CallLogs } from "@/components/dashboard/call-logs";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [settings, calendarConn, upcomingEvents, recentCalls, reminderStats] =
    await Promise.all([
      db.settings.findUnique({ where: { userId } }),
      db.calendarConnection.findUnique({
        where: { userId },
        select: { email: true, lastSyncedAt: true },
      }),
      db.calendarEvent.findMany({
        where: { userId, startTime: { gte: new Date() }, status: { not: "cancelled" } },
        orderBy: { startTime: "asc" },
        take: 10,
        include: {
          reminders: { select: { status: true, sentAt: true }, take: 1, orderBy: { createdAt: "desc" } },
        },
      }),
      db.callLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.reminder.groupBy({
        by: ["status"],
        where: { userId },
        _count: { status: true },
      }),
    ]);

  const sentCount   = reminderStats.find((s) => s.status === "SENT")?._count.status   ?? 0;
  const failedCount = reminderStats.find((s) => s.status === "FAILED")?._count.status ?? 0;

  return (
    <div className="space-y-10">

      {/* Page heading */}
      <div className="border-b pb-8" style={{ borderColor: "#E2DDD5" }}>
        <h1 className="font-display text-4xl italic" style={{ color: "#1C1914" }}>
          Dashboard
        </h1>
        <p className="font-body text-sm mt-1.5" style={{ color: "#7A756E" }}>
          Monitor your meeting reminders and call history.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-[#E2DDD5] bg-[#E2DDD5]">
        <StatsCard
          title="Reminders Sent"
          value={sentCount}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          }
          description="Total successful calls"
        />
        <StatsCard
          title="Upcoming Meetings"
          value={upcomingEvents.length}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          }
          description="Next 7 days"
        />
        <StatsCard
          title="Phone Number"
          value={settings?.phoneNumber ? "Set" : "—"}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63 19.79 19.79 0 01.01 1A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          }
          description={settings?.phoneNumber ?? "Configure in settings"}
        />
        <StatsCard
          title="System Status"
          value={settings?.isActive ? "On" : "Off"}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          }
          description={failedCount > 0 ? `${failedCount} failed` : "All systems normal"}
        />
      </div>

      {/* Connection + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ConnectionStatus
            calendarEmail={calendarConn?.email ?? null}
            lastSynced={calendarConn?.lastSyncedAt ?? null}
            phoneNumber={settings?.phoneNumber ?? null}
            isActive={settings?.isActive ?? false}
            reminderMinutes={settings?.reminderMinutes ?? 10}
          />
        </div>
        <div className="lg:col-span-2">
          <UpcomingMeetings events={upcomingEvents} timezone={settings?.timezone ?? "UTC"} />
        </div>
      </div>

      {/* Call Logs */}
      <CallLogs logs={recentCalls} />
    </div>
  );
}

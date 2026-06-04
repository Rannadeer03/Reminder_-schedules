import { auth } from "@/auth";
import { db } from "@/lib/db";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ConnectionStatus } from "@/components/dashboard/connection-status";
import { UpcomingMeetings } from "@/components/dashboard/upcoming-meetings";
import { CallLogs } from "@/components/dashboard/call-logs";
import { Phone, Calendar, Bell, CheckCircle } from "lucide-react";

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

  const totalCalls = recentCalls.length;
  const sentCount = reminderStats.find((s) => s.status === "SENT")?._count.status ?? 0;
  const failedCount = reminderStats.find((s) => s.status === "FAILED")?._count.status ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Monitor your meeting reminders and call history.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Reminders Sent"
          value={sentCount}
          icon={<Bell className="h-5 w-5 text-blue-500" />}
          description="Total successful calls"
        />
        <StatsCard
          title="Upcoming Meetings"
          value={upcomingEvents.length}
          icon={<Calendar className="h-5 w-5 text-purple-500" />}
          description="Next 7 days"
        />
        <StatsCard
          title="Phone Number"
          value={settings?.phoneNumber ? "Set" : "Not set"}
          icon={<Phone className="h-5 w-5 text-green-500" />}
          description={settings?.phoneNumber ?? "Configure in settings"}
        />
        <StatsCard
          title="Reminders Active"
          value={settings?.isActive ? "On" : "Off"}
          icon={<CheckCircle className="h-5 w-5 text-orange-500" />}
          description={failedCount > 0 ? `${failedCount} failed` : "All systems normal"}
        />
      </div>

      {/* Connection + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
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

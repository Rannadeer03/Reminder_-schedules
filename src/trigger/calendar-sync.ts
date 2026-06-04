import { schedules } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { syncCalendarEvents } from "@/lib/google-calendar";

// Runs every 15 minutes — syncs all active users' calendars
export const calendarSyncTask = schedules.task({
  id: "calendar-sync",
  cron: "*/15 * * * *",
  maxDuration: 120,
  run: async () => {
    console.log("[calendar-sync] Starting calendar sync for all users");

    const connections = await db.calendarConnection.findMany({
      include: { user: { include: { settings: true } } },
    });

    console.log(`[calendar-sync] Found ${connections.length} calendar connections`);

    const results = await Promise.allSettled(
      connections.map(async (conn) => {
        try {
          const synced = await syncCalendarEvents(conn.userId);
          console.log(`[calendar-sync] User ${conn.userId}: synced ${synced} events`);
          return { userId: conn.userId, synced };
        } catch (error) {
          console.error(`[calendar-sync] User ${conn.userId} failed:`, error);
          throw error;
        }
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`[calendar-sync] Done. ${succeeded} succeeded, ${failed} failed`);
    return { succeeded, failed, total: connections.length };
  },
});

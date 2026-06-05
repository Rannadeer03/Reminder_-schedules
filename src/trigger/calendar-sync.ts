import { schedules } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { syncCalendarEvents } from "@/lib/google-calendar";

export const calendarSyncTask = schedules.task({
  id: "calendar-sync",
  cron: "*/5 * * * *",
  maxDuration: 120,
  machine: "small-1x",
  run: async () => {
    console.log("[calendar-sync] Starting calendar sync for all users");

    // Only fetch userId — syncCalendarEvents queries what it needs itself.
    // Fetching the full connection (with encrypted tokens + nested user/settings)
    // was the root cause of OOM kills on the micro machine.
    const connections = await db.calendarConnection.findMany({
      select: { userId: true },
    });

    console.log(`[calendar-sync] Found ${connections.length} calendar connections`);

    // Run syncs sequentially to keep memory flat (each sync is I/O-bound anyway)
    let succeeded = 0;
    let failed    = 0;

    for (const { userId } of connections) {
      try {
        const synced = await syncCalendarEvents(userId);
        console.log(`[calendar-sync] User ${userId}: synced ${synced} events`);
        succeeded++;
      } catch (error) {
        console.error(`[calendar-sync] User ${userId} failed:`, error);
        failed++;
      }
    }

    console.log(`[calendar-sync] Done. ${succeeded} succeeded, ${failed} failed`);
    return { succeeded, failed, total: connections.length };
  },
});

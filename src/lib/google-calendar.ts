import { google } from "googleapis";
import { db } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/encryption";
import type { CalendarEvent } from "@prisma/client";

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );
}

async function getValidTokens(userId: string) {
  const conn = await db.calendarConnection.findUnique({ where: { userId } });
  if (!conn) throw new Error("No calendar connection found for user");

  const oauth2Client = createOAuthClient();
  const accessToken = decrypt(conn.accessToken);
  const refreshToken = decrypt(conn.refreshToken);

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: conn.expiresAt.getTime(),
  });

  // Refresh if within 5 minutes of expiry
  if (conn.expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    const newAccess = encrypt(credentials.access_token!);
    await db.calendarConnection.update({
      where: { userId },
      data: {
        accessToken: newAccess,
        expiresAt: new Date(credentials.expiry_date!),
      },
    });
    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}

export async function syncCalendarEvents(userId: string): Promise<number> {
  const auth = await getValidTokens(userId);
  const calendar = google.calendar({ version: "v3", auth });

  const conn = await db.calendarConnection.findUnique({ where: { userId } });
  if (!conn) throw new Error("No calendar connection");

  // Fetch events starting from now up to 7 days ahead
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const params: Parameters<typeof calendar.events.list>[0] = {
    calendarId: conn.calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  };

  if (conn.syncToken) {
    // Use incremental sync when possible
    try {
      params.syncToken = conn.syncToken;
      delete params.timeMin;
      delete params.timeMax;
    } catch {
      // syncToken expired — fall back to full sync
      delete params.syncToken;
      params.timeMin = timeMin;
      params.timeMax = timeMax;
    }
  }

  const response = await calendar.events.list(params);
  const items = response.data.items ?? [];
  let synced = 0;

  for (const item of items) {
    if (!item.id || !item.summary) continue;

    const startRaw = item.start?.dateTime ?? item.start?.date;
    const endRaw = item.end?.dateTime ?? item.end?.date;
    if (!startRaw || !endRaw) continue;

    const startTime = new Date(startRaw);
    const endTime = new Date(endRaw);
    const timezone = item.start?.timeZone ?? "UTC";
    const status = (item.status as string) ?? "confirmed";

    if (status === "cancelled") {
      await db.calendarEvent.updateMany({
        where: { googleEventId: item.id, userId },
        data: { status: "cancelled" },
      });
      continue;
    }

    await db.calendarEvent.upsert({
      where: { googleEventId_userId: { googleEventId: item.id, userId } },
      create: {
        googleEventId: item.id,
        userId,
        calendarId: conn.calendarId,
        title: item.summary,
        startTime,
        endTime,
        timezone,
        location: item.location ?? null,
        description: item.description ?? null,
        recurrenceId: item.recurringEventId ?? null,
        isRecurring: !!item.recurringEventId,
        status,
        htmlLink: item.htmlLink ?? null,
      },
      update: {
        title: item.summary,
        startTime,
        endTime,
        timezone,
        location: item.location ?? null,
        description: item.description ?? null,
        status,
        updatedAt: new Date(),
      },
    });
    synced++;
  }

  // Persist sync token for incremental syncs
  if (response.data.nextSyncToken) {
    await db.calendarConnection.update({
      where: { userId },
      data: {
        syncToken: response.data.nextSyncToken,
        lastSyncedAt: new Date(),
      },
    });
  }

  return synced;
}

export async function getUpcomingEvents(
  userId: string,
  limit = 20
): Promise<CalendarEvent[]> {
  return db.calendarEvent.findMany({
    where: {
      userId,
      startTime: { gte: new Date() },
      status: { not: "cancelled" },
    },
    orderBy: { startTime: "asc" },
    take: limit,
  });
}

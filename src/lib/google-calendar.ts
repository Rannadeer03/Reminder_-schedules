import { google, calendar_v3 } from "googleapis";
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
  oauth2Client.setCredentials({
    access_token:  decrypt(conn.accessToken),
    refresh_token: decrypt(conn.refreshToken),
    expiry_date:   conn.expiresAt.getTime(),
  });

  if (conn.expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await db.calendarConnection.update({
      where: { userId },
      data: {
        accessToken: encrypt(credentials.access_token!),
        expiresAt:   new Date(credentials.expiry_date!),
      },
    });
    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}

function getHttpStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  const e = err as Record<string, unknown>;
  // GaxiosError: e.status (number) is set directly
  if (typeof e.status === "number") return e.status;
  // Some versions nest it under response.status
  if (e.response && typeof e.response === "object") {
    const r = e.response as Record<string, unknown>;
    if (typeof r.status === "number") return r.status;
  }
  // Older googleapis: e.code
  if (typeof e.code === "number") return e.code;
  return undefined;
}

async function upsertEvents(
  userId: string,
  calendarId: string,
  items: calendar_v3.Schema$Event[]
): Promise<number> {
  let synced = 0;
  for (const item of items) {
    if (!item.id || !item.summary) continue;

    const startRaw = item.start?.dateTime ?? item.start?.date;
    const endRaw   = item.end?.dateTime   ?? item.end?.date;
    if (!startRaw || !endRaw) continue;

    const startTime = new Date(startRaw);
    const endTime   = new Date(endRaw);
    const timezone  = item.start?.timeZone ?? "UTC";
    const status    = (item.status as string) ?? "confirmed";

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
        calendarId,
        title:        item.summary,
        startTime,
        endTime,
        timezone,
        location:     item.location         ?? null,
        description:  item.description      ?? null,
        recurrenceId: item.recurringEventId ?? null,
        isRecurring:  !!item.recurringEventId,
        status,
        htmlLink:     item.htmlLink ?? null,
      },
      update: {
        title:       item.summary,
        startTime,
        endTime,
        timezone,
        location:    item.location    ?? null,
        description: item.description ?? null,
        status,
        updatedAt:   new Date(),
      },
    });
    synced++;
  }
  return synced;
}

export async function syncCalendarEvents(userId: string): Promise<number> {
  const oauthClient = await getValidTokens(userId);
  const calendar    = google.calendar({ version: "v3", auth: oauthClient });

  const conn = await db.calendarConnection.findUnique({ where: { userId } });
  if (!conn) throw new Error("No calendar connection");

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  let synced        = 0;
  let nextSyncToken: string | null | undefined;

  if (conn.syncToken) {
    try {
      const res = await calendar.events.list({
        calendarId:  conn.calendarId,
        syncToken:   conn.syncToken,
        singleEvents: true,
        maxResults:  250,
      });
      synced        = await upsertEvents(userId, conn.calendarId, res.data.items ?? []);
      nextSyncToken = res.data.nextSyncToken;
    } catch (err) {
      const httpStatus = getHttpStatus(err);
      console.warn(`[google-calendar] Incremental sync error for user ${userId}: status=${httpStatus}`, err);

      if (httpStatus === 410) {
        // Sync token expired — clear it and fall back to full sync
        console.warn(`[google-calendar] Sync token expired, clearing and running full sync`);
        await db.calendarConnection.update({
          where: { userId },
          data: { syncToken: null },
        });
        const res = await calendar.events.list({
          calendarId:  conn.calendarId,
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy:     "startTime",
          maxResults:  250,
        });
        synced        = await upsertEvents(userId, conn.calendarId, res.data.items ?? []);
        nextSyncToken = res.data.nextSyncToken;
      } else {
        throw err;
      }
    }
  } else {
    const res = await calendar.events.list({
      calendarId:  conn.calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy:     "startTime",
      maxResults:  250,
    });
    synced        = await upsertEvents(userId, conn.calendarId, res.data.items ?? []);
    nextSyncToken = res.data.nextSyncToken;
  }

  // Always update lastSyncedAt regardless of whether anything changed
  await db.calendarConnection.update({
    where: { userId },
    data: {
      lastSyncedAt: new Date(),
      ...(nextSyncToken ? { syncToken: nextSyncToken } : {}),
    },
  });

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
      status:    { not: "cancelled" },
    },
    orderBy: { startTime: "asc" },
    take: limit,
  });
}

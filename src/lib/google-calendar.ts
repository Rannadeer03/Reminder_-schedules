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
  if (typeof e.status === "number") return e.status;
  if (e.response && typeof e.response === "object") {
    const r = e.response as Record<string, unknown>;
    if (typeof r.status === "number") return r.status;
  }
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
    if (!item.id) continue;

    // BUG FIX: check cancelled BEFORE checking summary.
    // Deleted events from incremental sync arrive as { id, status: "cancelled" }
    // with no summary — the old guard would skip them before reaching this block.
    if ((item.status as string) === "cancelled") {
      await db.calendarEvent.updateMany({
        where: { googleEventId: item.id, userId },
        data:  { status: "cancelled" },
      });
      continue;
    }

    if (!item.summary) continue;

    const startRaw = item.start?.dateTime ?? item.start?.date;
    const endRaw   = item.end?.dateTime   ?? item.end?.date;
    if (!startRaw || !endRaw) continue;

    const startTime = new Date(startRaw);
    const endTime   = new Date(endRaw);
    const timezone  = item.start?.timeZone ?? "UTC";

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
        status:       (item.status as string) ?? "confirmed",
        htmlLink:     item.htmlLink ?? null,
      },
      update: {
        title:       item.summary,
        startTime,
        endTime,
        timezone,
        location:    item.location    ?? null,
        description: item.description ?? null,
        status:      (item.status as string) ?? "confirmed",
        updatedAt:   new Date(),
      },
    });
    synced++;
  }
  return synced;
}

// Fetch all pages for a given list call, returning items + final syncToken.
async function fetchAllPages(
  calendar: ReturnType<typeof google.calendar>,
  params: calendar_v3.Params$Resource$Events$List
): Promise<{ items: calendar_v3.Schema$Event[]; nextSyncToken: string | null | undefined }> {
  const allItems: calendar_v3.Schema$Event[] = [];
  let pageToken: string | undefined;
  let nextSyncToken: string | null | undefined;

  do {
    const res = await calendar.events.list({ ...params, pageToken });
    allItems.push(...(res.data.items ?? []));
    pageToken    = res.data.nextPageToken ?? undefined;
    nextSyncToken = res.data.nextSyncToken;
  } while (pageToken);

  return { items: allItems, nextSyncToken };
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
    // ── Incremental sync ──────────────────────────────────────────────
    try {
      const { items, nextSyncToken: nst } = await fetchAllPages(calendar, {
        calendarId:   conn.calendarId,
        syncToken:    conn.syncToken,
        singleEvents: true,
        maxResults:   250,
      });
      synced        = await upsertEvents(userId, conn.calendarId, items);
      nextSyncToken = nst;
    } catch (err) {
      const httpStatus = getHttpStatus(err);
      console.warn(`[google-calendar] Incremental sync error status=${httpStatus}`);

      if (httpStatus === 410) {
        // Sync token expired — fall through to full sync below
        console.warn("[google-calendar] Sync token expired, running full sync");
        await db.calendarConnection.update({ where: { userId }, data: { syncToken: null } });
        ({ synced, nextSyncToken } = await runFullSync(calendar, conn.calendarId, userId, timeMin, timeMax));
      } else {
        throw err;
      }
    }
  } else {
    // ── Full sync ─────────────────────────────────────────────────────
    ({ synced, nextSyncToken } = await runFullSync(calendar, conn.calendarId, userId, timeMin, timeMax));
  }

  await db.calendarConnection.update({
    where: { userId },
    data: {
      lastSyncedAt: new Date(),
      ...(nextSyncToken ? { syncToken: nextSyncToken } : {}),
    },
  });

  return synced;
}

async function runFullSync(
  calendar: ReturnType<typeof google.calendar>,
  calendarId: string,
  userId: string,
  timeMin: string,
  timeMax: string
): Promise<{ synced: number; nextSyncToken: string | null | undefined }> {
  const { items, nextSyncToken } = await fetchAllPages(calendar, {
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy:      "startTime",
    maxResults:   250,
  });

  const synced = await upsertEvents(userId, calendarId, items);

  // Reconcile: any confirmed event in the DB window that Google didn't return
  // means it was deleted — mark it cancelled.
  const returnedIds = items
    .map((e) => e.id)
    .filter((id): id is string => Boolean(id));

  await db.calendarEvent.updateMany({
    where: {
      userId,
      startTime: { gte: new Date(timeMin), lte: new Date(timeMax) },
      status:    "confirmed",
      ...(returnedIds.length > 0 ? { googleEventId: { notIn: returnedIds } } : {}),
    },
    data: { status: "cancelled" },
  });

  return { synced, nextSyncToken };
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

import type { User, Settings, CalendarConnection, CalendarEvent, CallLog, Reminder } from "@prisma/client";

export type UserWithRelations = User & {
  settings: Settings | null;
  calendarConnection: Pick<CalendarConnection, "email" | "lastSyncedAt"> | null;
};

export type EventWithReminder = CalendarEvent & {
  reminders: Pick<Reminder, "status" | "sentAt" | "callSid">[];
};

export type DashboardData = {
  user: UserWithRelations;
  upcomingEvents: EventWithReminder[];
  recentCalls: CallLog[];
  sentCount: number;
  failedCount: number;
};

// Extend next-auth session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

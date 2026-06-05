import { formatTime, minutesUntil } from "@/lib/utils";
import type { CalendarEvent, Reminder } from "@prisma/client";

type EventWithReminder = CalendarEvent & {
  reminders: Pick<Reminder, "status" | "sentAt">[];
};

interface UpcomingMeetingsProps {
  events: EventWithReminder[];
  timezone: string;
}

function ReminderPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    SENT:    { label: "Called",    bg: "rgba(74,124,89,0.1)",    text: "#4A7C59" },
    CALLING: { label: "Calling…",  bg: "rgba(201,169,110,0.15)", text: "#A88844" },
    FAILED:  { label: "Failed",    bg: "rgba(176,74,74,0.1)",    text: "#B04A4A" },
    PENDING: { label: "Pending",   bg: "rgba(160,152,128,0.12)", text: "#7A756E" },
    SKIPPED: { label: "Skipped",   bg: "rgba(160,152,128,0.12)", text: "#A09880" },
  };
  const cfg = map[status] ?? { label: status, bg: "rgba(160,152,128,0.12)", text: "#A09880" };
  return (
    <span
      className="font-body text-[10px] tracking-wide px-2 py-0.5 flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}

export function UpcomingMeetings({ events, timezone }: UpcomingMeetingsProps) {
  return (
    <div className="border h-full" style={{ background: "#FDFCFA", borderColor: "#E2DDD5" }}>
      {/* Header */}
      <div
        className="px-6 pt-6 pb-4 flex items-center justify-between border-b"
        style={{ borderColor: "#E2DDD5" }}
      >
        <h2 className="font-display text-xl italic" style={{ color: "#1C1914" }}>
          Upcoming Meetings
        </h2>
        <span
          className="font-body text-xs px-2.5 py-1"
          style={{ background: "rgba(201,169,110,0.12)", color: "#A88844" }}
        >
          {events.length} events
        </span>
      </div>

      <div className="px-6 py-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div
              className="w-10 h-10 flex items-center justify-center mb-4"
              style={{ border: "1px solid #E2DDD5" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="font-body text-sm" style={{ color: "#7A756E" }}>No upcoming meetings.</p>
            <p className="font-body text-xs mt-1" style={{ color: "#A09880" }}>Calendar syncs every 15 minutes.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#E2DDD5" }}>
            {events.map((event) => {
              const minsAway = minutesUntil(event.startTime);
              const isSoon = minsAway > 0 && minsAway <= 15;
              const reminder = event.reminders[0];

              return (
                <div key={event.id} className="flex gap-5 py-4">
                  {/* Date column */}
                  <div className="flex-shrink-0 text-center w-12">
                    <p
                      className="font-body text-[9px] tracking-[0.2em] uppercase font-medium"
                      style={{ color: "#A09880" }}
                    >
                      {new Date(event.startTime).toLocaleDateString("en-US", {
                        month: "short",
                        timeZone: timezone,
                      })}
                    </p>
                    <p
                      className="font-display text-3xl font-semibold leading-none mt-0.5"
                      style={{ color: isSoon ? "#C9A96E" : "#1C1914" }}
                    >
                      {new Date(event.startTime).toLocaleDateString("en-US", {
                        day: "numeric",
                        timeZone: timezone,
                      })}
                    </p>
                  </div>

                  {/* Detail column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className="font-body text-sm font-medium truncate"
                        style={{ color: "#1C1914" }}
                      >
                        {event.title}
                      </p>
                      {reminder && <ReminderPill status={reminder.status} />}
                    </div>
                    <p className="font-body text-xs mt-1 font-mono" style={{ color: "#A09880" }}>
                      {formatTime(event.startTime, timezone)}
                      {event.location && ` · ${event.location}`}
                    </p>
                    {isSoon && (
                      <p className="font-body text-xs font-medium mt-1" style={{ color: "#C9A96E" }}>
                        Starting in {minsAway} minute{minsAway !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

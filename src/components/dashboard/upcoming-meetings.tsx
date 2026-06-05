"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    SENT:    { label: "Called",   bg: "rgba(74,222,128,0.12)",  text: "#4ade80" },
    CALLING: { label: "Calling…", bg: "rgba(59,130,246,0.15)",  text: "#60a5fa" },
    FAILED:  { label: "Failed",   bg: "rgba(239,68,68,0.12)",   text: "#f87171" },
    PENDING: { label: "Pending",  bg: "rgba(251,191,36,0.12)",  text: "#fbbf24" },
    SKIPPED: { label: "Skipped",  bg: "rgba(100,116,139,0.15)", text: "#94a3b8" },
  };
  const cfg = map[status] ?? { label: status, bg: "rgba(100,116,139,0.15)", text: "#94a3b8" };
  return (
    <span className="font-body text-[10px] tracking-wide px-2.5 py-1 rounded-full flex-shrink-0 font-medium"
          style={{ background: cfg.bg, color: cfg.text }}>
      {cfg.label}
    </span>
  );
}

function SkipButton({ eventId, initialSkipped }: { eventId: string; initialSkipped: boolean }) {
  const router = useRouter();
  const [skipped, setSkipped] = useState(initialSkipped);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar/events/${eventId}/skip`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        setSkipped(data.skipped);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={skipped ? "Un-skip this event" : "Skip reminder for this event"}
      className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded transition-all"
      style={{
        background: skipped ? "rgba(100,116,139,0.2)" : "rgba(100,116,139,0.1)",
        color:      skipped ? "#94a3b8" : "#64748b",
        border:     "1px solid rgba(100,116,139,0.2)",
        opacity:    loading ? 0.5 : 1,
        cursor:     loading ? "not-allowed" : "pointer",
      }}
    >
      {skipped ? "Skipped" : "Skip"}
    </button>
  );
}

export function UpcomingMeetings({ events, timezone }: UpcomingMeetingsProps) {
  return (
    <div className="glass rounded-2xl h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b"
           style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <h2 className="font-display font-bold text-lg text-white">Upcoming Meetings</h2>
        <span className="font-body text-xs px-2.5 py-1 rounded-full"
              style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>
          {events.length} events
        </span>
      </div>

      <div className="px-6 py-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-10 h-10 flex items-center justify-center mb-4 rounded-xl"
                 style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="font-body text-sm text-slate-400">No upcoming meetings.</p>
            <p className="font-body text-xs mt-1 text-slate-600">Calendar syncs every 15 minutes.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {events.map((event) => {
              const minsAway = minutesUntil(event.startTime);
              const isSoon   = minsAway > 0 && minsAway <= 15;
              const reminder = event.reminders[0];

              return (
                <div
                  key={event.id}
                  className="flex gap-5 py-4"
                  style={{ opacity: event.skipped ? 0.55 : 1 }}
                >
                  {/* Date column */}
                  <div className="flex-shrink-0 text-center w-12">
                    <p className="font-body text-[9px] tracking-[0.2em] uppercase font-medium text-slate-600">
                      {new Date(event.startTime).toLocaleDateString("en-US", { month: "short", timeZone: event.timezone || timezone })}
                    </p>
                    <p className="font-display text-3xl font-semibold leading-none mt-0.5"
                       style={{ color: isSoon ? "#60a5fa" : "#f1f5f9" }}>
                      {new Date(event.startTime).toLocaleDateString("en-US", { day: "numeric", timeZone: event.timezone || timezone })}
                    </p>
                  </div>

                  {/* Detail column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className={`font-body text-sm font-medium truncate text-white ${event.skipped ? "line-through opacity-60" : ""}`}>
                        {event.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {reminder && <ReminderPill status={reminder.status} />}
                        <SkipButton eventId={event.id} initialSkipped={event.skipped} />
                      </div>
                    </div>
                    <p className="font-body text-xs mt-1 font-mono text-slate-500">
                      {formatTime(event.startTime, event.timezone || timezone)}
                      {event.location && ` · ${event.location}`}
                    </p>
                    {event.joinUrl && !event.skipped && (
                      <a
                        href={event.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-xs mt-1 inline-flex items-center gap-1"
                        style={{ color: "#60a5fa" }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Join meeting
                      </a>
                    )}
                    {isSoon && !event.skipped && (
                      <p className="font-body text-xs font-medium mt-1 text-blue-400">
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

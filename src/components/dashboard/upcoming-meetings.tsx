import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import { formatDateTime, formatTime, minutesUntil } from "@/lib/utils";
import type { CalendarEvent, Reminder } from "@prisma/client";

type EventWithReminder = CalendarEvent & {
  reminders: Pick<Reminder, "status" | "sentAt">[];
};

interface UpcomingMeetingsProps {
  events: EventWithReminder[];
  timezone: string;
}

function ReminderBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "outline" }> = {
    SENT: { label: "Called", variant: "success" },
    CALLING: { label: "Calling…", variant: "warning" },
    FAILED: { label: "Failed", variant: "destructive" },
    PENDING: { label: "Pending", variant: "secondary" },
    SKIPPED: { label: "Skipped", variant: "outline" },
  };
  const cfg = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>;
}

export function UpcomingMeetings({ events, timezone }: UpcomingMeetingsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Upcoming Meetings</CardTitle>
          <Badge variant="secondary">{events.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Calendar className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming meetings found.</p>
            <p className="text-xs text-muted-foreground mt-1">Your calendar syncs every 15 minutes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const minsAway = minutesUntil(event.startTime);
              const isSoon = minsAway > 0 && minsAway <= 15;
              const reminder = event.reminders[0];

              return (
                <div
                  key={event.id}
                  className={`flex gap-4 p-3 rounded-lg border transition-colors ${
                    isSoon ? "border-blue-200 bg-blue-50" : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex-shrink-0 text-center min-w-[48px]">
                    <p className="text-xs font-medium text-slate-500 uppercase">
                      {new Date(event.startTime).toLocaleDateString("en-US", { month: "short", timeZone: timezone })}
                    </p>
                    <p className="text-xl font-bold text-slate-900 leading-none">
                      {new Date(event.startTime).toLocaleDateString("en-US", { day: "numeric", timeZone: timezone })}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{event.title}</p>
                      {reminder && <ReminderBadge status={reminder.status} />}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.startTime, timezone)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    {isSoon && (
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        Starting in {minsAway} minute{minsAway !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

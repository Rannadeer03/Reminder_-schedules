import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, PhoneMissed } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { CallLog } from "@prisma/client";

interface CallLogsProps {
  logs: CallLog[];
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "success" | "destructive" | "warning" | "secondary" | "outline" }> = {
    COMPLETED: { label: "Completed", variant: "success" },
    FAILED: { label: "Failed", variant: "destructive" },
    BUSY: { label: "Busy", variant: "warning" },
    NO_ANSWER: { label: "No Answer", variant: "warning" },
    INITIATED: { label: "Initiated", variant: "secondary" },
    RINGING: { label: "Ringing", variant: "secondary" },
    IN_PROGRESS: { label: "In Progress", variant: "secondary" },
    CANCELLED: { label: "Cancelled", variant: "outline" },
  };
  const cfg = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>;
}

function CallIcon({ status }: { status: string }) {
  if (status === "COMPLETED") return <Phone className="h-4 w-4 text-green-500" />;
  if (["FAILED", "CANCELLED"].includes(status)) return <PhoneOff className="h-4 w-4 text-red-400" />;
  return <PhoneMissed className="h-4 w-4 text-yellow-500" />;
}

export function CallLogs({ logs }: CallLogsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Call Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Phone className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm text-muted-foreground">No calls yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Calls will appear here once reminders start firing.
            </p>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 py-3">
                <CallIcon status={log.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{log.toNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(log.startedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {log.duration != null && (
                    <span className="text-xs text-muted-foreground">{log.duration}s</span>
                  )}
                  <StatusBadge status={log.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

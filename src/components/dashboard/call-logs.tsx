import { formatDateTime } from "@/lib/utils";
import type { CallLog } from "@prisma/client";

interface CallLogsProps {
  logs: CallLog[];
  timezone?: string;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED:   "#4ade80",
    FAILED:      "#f87171",
    CANCELLED:   "#f87171",
    BUSY:        "#fbbf24",
    NO_ANSWER:   "#fbbf24",
    INITIATED:   "#94a3b8",
    RINGING:     "#60a5fa",
    IN_PROGRESS: "#4ade80",
  };
  return (
    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
         style={{ background: colors[status] ?? "#94a3b8" }} />
  );
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    COMPLETED:   "Completed",
    FAILED:      "Failed",
    BUSY:        "Busy",
    NO_ANSWER:   "No Answer",
    INITIATED:   "Initiated",
    RINGING:     "Ringing",
    IN_PROGRESS: "In Progress",
    CANCELLED:   "Cancelled",
  };
  return map[status] ?? status;
}

export function CallLogs({ logs, timezone = "UTC" }: CallLogsProps) {
  return (
    <div className="glass rounded-2xl">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <h2 className="font-display font-bold text-lg text-white">Recent Call Logs</h2>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-10 h-10 flex items-center justify-center mb-4 rounded-xl"
               style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>
          <p className="font-body text-sm text-slate-400">No calls yet.</p>
          <p className="font-body text-xs mt-1 text-slate-600">
            Calls will appear here once reminders start firing.
          </p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className="px-6 py-2.5 grid grid-cols-12 gap-4 border-b"
               style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            {["Number", "Date", "Status", "Duration"].map((h) => (
              <p key={h} className="font-body text-[10px] tracking-[0.2em] uppercase font-medium col-span-3 text-slate-600">
                {h}
              </p>
            ))}
          </div>

          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                {/* Number */}
                <p className="font-body text-sm font-mono col-span-3 truncate text-slate-200">
                  {log.toNumber}
                </p>
                {/* Date */}
                <p className="font-body text-xs col-span-3 text-slate-500">
                  {formatDateTime(log.startedAt, timezone)}
                </p>
                {/* Status */}
                <div className="col-span-3 flex items-center gap-2">
                  <StatusDot status={log.status} />
                  <p className="font-body text-xs text-slate-400">{statusLabel(log.status)}</p>
                </div>
                {/* Duration */}
                <p className="font-body text-xs col-span-3 font-mono text-slate-500">
                  {log.duration != null ? `${log.duration}s` : "—"}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

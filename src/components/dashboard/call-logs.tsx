import { formatDateTime } from "@/lib/utils";
import type { CallLog } from "@prisma/client";

interface CallLogsProps {
  logs: CallLog[];
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED:   "#4A7C59",
    FAILED:      "#B04A4A",
    CANCELLED:   "#B04A4A",
    BUSY:        "#C9A96E",
    NO_ANSWER:   "#C9A96E",
    INITIATED:   "#A09880",
    RINGING:     "#A09880",
    IN_PROGRESS: "#4A7C59",
  };
  return (
    <div
      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: colors[status] ?? "#A09880" }}
    />
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

export function CallLogs({ logs }: CallLogsProps) {
  return (
    <div className="border" style={{ background: "#FDFCFA", borderColor: "#E2DDD5" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "#E2DDD5" }}>
        <h2 className="font-display text-xl italic" style={{ color: "#1C1914" }}>
          Recent Call Logs
        </h2>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div
            className="w-10 h-10 flex items-center justify-center mb-4"
            style={{ border: "1px solid #E2DDD5" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>
          <p className="font-body text-sm" style={{ color: "#7A756E" }}>No calls yet.</p>
          <p className="font-body text-xs mt-1" style={{ color: "#A09880" }}>
            Calls will appear here once reminders start firing.
          </p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div
            className="px-6 py-2.5 grid grid-cols-12 gap-4 border-b"
            style={{ borderColor: "#E2DDD5", background: "rgba(228,224,218,0.4)" }}
          >
            {["Number", "Date", "Status", "Duration"].map((h) => (
              <p
                key={h}
                className="font-body text-[10px] tracking-[0.2em] uppercase font-medium col-span-3"
                style={{ color: "#A09880" }}
              >
                {h}
              </p>
            ))}
          </div>

          <div className="divide-y" style={{ borderColor: "#E2DDD5" }}>
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
                {/* Number */}
                <p className="font-body text-sm font-mono col-span-3 truncate" style={{ color: "#1C1914" }}>
                  {log.toNumber}
                </p>

                {/* Date */}
                <p className="font-body text-xs col-span-3" style={{ color: "#7A756E" }}>
                  {formatDateTime(log.startedAt)}
                </p>

                {/* Status */}
                <div className="col-span-3 flex items-center gap-2">
                  <StatusDot status={log.status} />
                  <p className="font-body text-xs" style={{ color: "#4A4540" }}>
                    {statusLabel(log.status)}
                  </p>
                </div>

                {/* Duration */}
                <p className="font-body text-xs col-span-3 font-mono" style={{ color: "#7A756E" }}>
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

import { formatDateTime } from "@/lib/utils";

interface ConnectionStatusProps {
  calendarEmail: string | null;
  lastSynced: Date | null;
  phoneNumber: string | null;
  isActive: boolean;
  reminderMinutes: number;
}

export function ConnectionStatus({
  calendarEmail,
  lastSynced,
  phoneNumber,
  isActive,
  reminderMinutes,
}: ConnectionStatusProps) {
  return (
    <div className="glass rounded-2xl h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <h2 className="font-display font-bold text-lg text-white">System Status</h2>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Calendar */}
        <div className="flex items-start gap-4">
          <div className="mt-1.5 flex-shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ background: calendarEmail ? "#4ade80" : "#ef4444" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="font-body text-sm font-medium text-white">Google Calendar</p>
              <span className="font-body text-[10px] tracking-wide px-2 py-0.5 rounded-full"
                    style={{
                      background: calendarEmail ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.12)",
                      color: calendarEmail ? "#4ade80" : "#f87171",
                    }}>
                {calendarEmail ? "Connected" : "Disconnected"}
              </span>
            </div>
            {calendarEmail && (
              <p className="font-body text-xs truncate text-slate-500">{calendarEmail}</p>
            )}
            {lastSynced && (
              <p className="font-body text-xs text-slate-500">Last synced {formatDateTime(lastSynced)}</p>
            )}
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }} />

        {/* Phone */}
        <div className="flex items-start gap-4">
          <div className="mt-1.5 flex-shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ background: phoneNumber ? "#4ade80" : "#fbbf24" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="font-body text-sm font-medium text-white">Phone Number</p>
              <span className="font-body text-[10px] tracking-wide px-2 py-0.5 rounded-full"
                    style={{
                      background: phoneNumber ? "rgba(74,222,128,0.12)" : "rgba(251,191,36,0.12)",
                      color: phoneNumber ? "#4ade80" : "#fbbf24",
                    }}>
                {phoneNumber ? "Set" : "Not set"}
              </span>
            </div>
            <p className="font-body text-xs font-mono text-slate-500">
              {phoneNumber ?? "Configure in settings →"}
            </p>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }} />

        {/* Timing + Active */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm font-medium text-white">Reminder Timing</p>
            <p className="font-body text-xs text-slate-500">{reminderMinutes} min before meetings</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? "#4ade80" : "#64748b" }} />
            <span className="font-body text-xs font-medium" style={{ color: isActive ? "#4ade80" : "#64748b" }}>
              {isActive ? "Active" : "Paused"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

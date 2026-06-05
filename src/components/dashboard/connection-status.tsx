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
    <div
      className="border"
      style={{ background: "#FDFCFA", borderColor: "#E2DDD5" }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "#E2DDD5" }}>
        <h2 className="font-display text-xl italic" style={{ color: "#1C1914" }}>
          System Status
        </h2>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Calendar */}
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex-shrink-0">
            <div
              className="w-2 h-2 rounded-full mt-1.5"
              style={{ background: calendarEmail ? "#4A7C59" : "#B04A4A" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-body text-sm font-medium" style={{ color: "#1C1914" }}>
                Google Calendar
              </p>
              <span
                className="font-body text-[10px] tracking-wide px-2 py-0.5"
                style={{
                  background: calendarEmail ? "rgba(74,124,89,0.1)" : "rgba(176,74,74,0.1)",
                  color: calendarEmail ? "#4A7C59" : "#B04A4A",
                }}
              >
                {calendarEmail ? "Connected" : "Disconnected"}
              </span>
            </div>
            {calendarEmail && (
              <p className="font-body text-xs truncate" style={{ color: "#A09880" }}>
                {calendarEmail}
              </p>
            )}
            {lastSynced && (
              <p className="font-body text-xs" style={{ color: "#A09880" }}>
                Last synced {formatDateTime(lastSynced)}
              </p>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="border-t" style={{ borderColor: "#E2DDD5" }} />

        {/* Phone */}
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex-shrink-0">
            <div
              className="w-2 h-2 rounded-full mt-1.5"
              style={{ background: phoneNumber ? "#4A7C59" : "#C9A96E" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-body text-sm font-medium" style={{ color: "#1C1914" }}>
                Phone Number
              </p>
              <span
                className="font-body text-[10px] tracking-wide px-2 py-0.5"
                style={{
                  background: phoneNumber ? "rgba(74,124,89,0.1)" : "rgba(201,169,110,0.15)",
                  color: phoneNumber ? "#4A7C59" : "#A88844",
                }}
              >
                {phoneNumber ? "Set" : "Not set"}
              </span>
            </div>
            <p className="font-body text-xs font-mono" style={{ color: "#A09880" }}>
              {phoneNumber ?? "Configure in settings →"}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t" style={{ borderColor: "#E2DDD5" }} />

        {/* Timing + Active */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm font-medium" style={{ color: "#1C1914" }}>
              Reminder Timing
            </p>
            <p className="font-body text-xs" style={{ color: "#A09880" }}>
              {reminderMinutes} min before meetings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: isActive ? "#4A7C59" : "#A09880" }}
            />
            <span className="font-body text-xs font-medium" style={{ color: isActive ? "#4A7C59" : "#A09880" }}>
              {isActive ? "Active" : "Paused"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

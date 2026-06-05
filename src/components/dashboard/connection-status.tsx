"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";

interface ConnectionStatusProps {
  calendarEmail: string | null;
  lastSynced: Date | null;
  phoneNumber: string | null;
  isActive: boolean;
  reminderMinutes: number;
  timezone?: string;
}

export function ConnectionStatus({
  calendarEmail,
  lastSynced,
  phoneNumber,
  isActive,
  reminderMinutes,
  timezone = "UTC",
}: ConnectionStatusProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [syncMsg, setSyncMsg] = useState("");

  async function handleSync() {
    setSyncState("syncing");
    setSyncMsg("");
    try {
      const res = await fetch("/api/calendar/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncState("done");
        setSyncMsg(`Synced ${data.synced ?? 0} events`);
        startTransition(() => { router.refresh(); });
        setTimeout(() => setSyncState("idle"), 3000);
      } else {
        setSyncState("error");
        setSyncMsg(data.error ?? "Sync failed");
        setTimeout(() => setSyncState("idle"), 4000);
      }
    } catch {
      setSyncState("error");
      setSyncMsg("Network error");
      setTimeout(() => setSyncState("idle"), 4000);
    }
  }

  const syncBusy = syncState === "syncing" || isPending;

  return (
    <div className="glass rounded-2xl h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b flex items-center justify-between"
           style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <h2 className="font-display font-bold text-lg text-white">System Status</h2>

        {/* Manual sync button */}
        <button
          onClick={handleSync}
          disabled={syncBusy || !calendarEmail}
          title="Sync calendar now"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: syncState === "done"  ? "rgba(74,222,128,0.12)"
                      : syncState === "error" ? "rgba(239,68,68,0.12)"
                      :                         "rgba(59,130,246,0.1)",
            border:     syncState === "done"  ? "1px solid rgba(74,222,128,0.3)"
                      : syncState === "error" ? "1px solid rgba(239,68,68,0.3)"
                      :                         "1px solid rgba(59,130,246,0.25)",
            color:      syncState === "done"  ? "#4ade80"
                      : syncState === "error" ? "#f87171"
                      :                         "#60a5fa",
            opacity: (syncBusy || !calendarEmail) ? 0.5 : 1,
            cursor:  (syncBusy || !calendarEmail) ? "not-allowed" : "pointer",
          }}
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={syncBusy ? "animate-spin" : ""}
          >
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          {syncState === "syncing" ? "Syncing…"
         : syncState === "done"    ? syncMsg
         : syncState === "error"   ? "Error"
         :                           "Sync now"}
        </button>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Error message */}
        {syncState === "error" && syncMsg && (
          <p className="font-body text-xs rounded-lg px-3 py-2"
             style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            {syncMsg}
          </p>
        )}

        {/* Calendar */}
        <div className="flex items-start gap-4">
          <div className="mt-1.5 flex-shrink-0">
            <div className="w-2 h-2 rounded-full"
                 style={{ background: calendarEmail ? "#4ade80" : "#ef4444" }} />
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
              <p className="font-body text-xs text-slate-500">
                Last synced {formatDateTime(lastSynced, timezone)}
              </p>
            )}
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }} />

        {/* Phone */}
        <div className="flex items-start gap-4">
          <div className="mt-1.5 flex-shrink-0">
            <div className="w-2 h-2 rounded-full"
                 style={{ background: phoneNumber ? "#4ade80" : "#fbbf24" }} />
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
            <div className="w-1.5 h-1.5 rounded-full"
                 style={{ background: isActive ? "#4ade80" : "#64748b" }} />
            <span className="font-body text-xs font-medium"
                  style={{ color: isActive ? "#4ade80" : "#64748b" }}>
              {isActive ? "Active" : "Paused"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

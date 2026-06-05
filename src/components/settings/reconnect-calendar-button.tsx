"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function ReconnectCalendarButton() {
  const [busy, setBusy] = useState(false);

  async function handleReconnect() {
    setBusy(true);
    try {
      await fetch("/api/calendar/reconnect", { method: "POST" });
      // Sign out — next sign-in triggers Google OAuth with fresh tokens
      await signOut({ callbackUrl: "/login" });
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-slate-400">
        If your calendar isn&apos;t syncing or you see authentication errors, reconnecting will
        fetch a fresh OAuth token from Google.
      </p>
      <button
        onClick={handleReconnect}
        disabled={busy}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{
          background: busy ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.3)",
          color: busy ? "#94a3b8" : "#f87171",
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {busy ? (
          <>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Disconnecting…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Reconnect Google Calendar
          </>
        )}
      </button>
      <p className="font-body text-xs text-slate-600">
        You&apos;ll be signed out and redirected to Google to re-grant calendar access.
      </p>
    </div>
  );
}

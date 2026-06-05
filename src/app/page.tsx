import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { signIn } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen landing-bg flex flex-col" style={{ color: "#EDE8DF" }}>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-6 border-b border-[#2C2820]">
        <div className="font-display text-[22px] tracking-tight" style={{ color: "#EDE8DF" }}>
          <em>Meeting</em>
          <span className="not-italic" style={{ color: "#C9A96E" }}>Alert</span>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="font-body text-sm tracking-wide transition-colors duration-200"
            style={{ color: "#A09890" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#EDE8DF")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#A09890")}
          >
            Sign in →
          </button>
        </form>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-36">

        {/* Ornament + badge */}
        <div className="anim-fade-in anim-delay-0 flex items-center gap-5 mb-14">
          <div className="h-px w-20" style={{ background: "rgba(201,169,110,0.35)" }} />
          <span
            className="font-body text-[10px] tracking-[0.32em] uppercase font-medium"
            style={{ color: "#C9A96E" }}
          >
            Automated Call Reminders
          </span>
          <div className="h-px w-20" style={{ background: "rgba(201,169,110,0.35)" }} />
        </div>

        {/* Display heading */}
        <h1 className="anim-fade-up anim-delay-1 font-display leading-[0.88] tracking-tight mb-10"
          style={{
            fontSize: "clamp(60px, 10vw, 118px)",
            color: "#EDE8DF",
          }}
        >
          <em>The call</em> that<br />
          keeps you<br />
          <em style={{ color: "#C9A96E" }}>on time.</em>
        </h1>

        {/* Subtitle */}
        <p
          className="anim-fade-up anim-delay-2 font-body text-lg md:text-xl max-w-[480px] leading-relaxed mb-12"
          style={{ color: "#A09890" }}
        >
          Connect your Google Calendar. Receive a personal voice call
          10 minutes before every meeting — automatically, every time.
        </p>

        {/* CTA */}
        <div className="anim-fade-up anim-delay-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="group inline-flex items-center gap-3 font-body font-medium text-base tracking-wide px-9 py-4 transition-all duration-300"
              style={{
                background: "#C9A96E",
                color: "#0C0A08",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#D4B882")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#C9A96E")}
            >
              {/* Google G icon */}
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#1a1410"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#1a1410"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#1a1410"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#1a1410"/>
              </svg>
              Continue with Google
              <span className="transition-transform duration-300 group-hover:translate-x-1 inline-block">→</span>
            </button>
          </form>
        </div>

        {/* Trust note */}
        <p
          className="anim-fade-in anim-delay-5 font-body text-xs tracking-wide mt-6"
          style={{ color: "#5A554E" }}
        >
          Read-only calendar access · AES-256 encrypted · No passwords stored
        </p>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className="border-t border-[#2C2820]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#2C2820]">
          {[
            {
              num: "01",
              title: "Calendar Sync",
              body: "Your entire Google Calendar captured and synced every 15 minutes. Every event, every time.",
            },
            {
              num: "02",
              title: "Voice Call",
              body: "A real phone call 10 minutes before every meeting. Not a push notification — an actual call.",
            },
            {
              num: "03",
              title: "Fully Secure",
              body: "AES-256 encryption on all OAuth tokens. Read-only access. We never store passwords.",
            },
          ].map((f) => (
            <div key={f.num} className="px-10 py-14">
              <p
                className="font-body text-[10px] tracking-[0.32em] uppercase font-medium mb-5"
                style={{ color: "#C9A96E" }}
              >
                {f.num}
              </p>
              <h3 className="font-display text-[26px] italic mb-4" style={{ color: "#EDE8DF" }}>
                {f.title}
              </h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: "#706860" }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        className="border-t border-[#2C2820] px-8 md:px-16 py-5 flex items-center justify-between"
      >
        <span className="font-display italic text-sm" style={{ color: "#C9A96E" }}>
          MeetingAlert
        </span>
        <span className="font-body text-xs" style={{ color: "#4A4540" }}>
          Powered by Google Calendar &amp; Twilio
        </span>
      </footer>
    </main>
  );
}

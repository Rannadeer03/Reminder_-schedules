import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

/* ─── Reusable CTA form ──────────────────────────────────────────── */
async function SignInForm({ label, className }: { label: string; className?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/dashboard" });
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="hero-bg min-h-screen text-white font-body">

      {/* Animated background blobs */}
      <div aria-hidden className="pointer-events-none select-none fixed inset-0 overflow-hidden">
        <div className="blob blob-1 w-[700px] h-[700px] top-[-180px] left-[-200px] opacity-25"
             style={{ background: "radial-gradient(circle,#3b82f6,#1d4ed8)" }} />
        <div className="blob blob-2 w-[550px] h-[550px] top-[35%] right-[-120px] opacity-20"
             style={{ background: "radial-gradient(circle,#7c3aed,#4f46e5)" }} />
        <div className="blob blob-3 w-[450px] h-[450px] bottom-[-100px] left-[25%] opacity-15"
             style={{ background: "radial-gradient(circle,#0891b2,#06b6d4)" }} />
      </div>

      {/* ════════════════ NAV ════════════════ */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: "linear-gradient(135deg,#3b82f6,#7c3aed)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63 19.79 19.79 0 01.01 1A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-white">Meeting<span className="text-gradient">Alert</span></span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">How it works</a>
          <a href="#features"     className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#pricing"      className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
          <SignInForm label="Sign in"
            className="text-sm font-medium px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all duration-200" />
        </div>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16 lg:pt-28 lg:pb-20 flex flex-col lg:flex-row items-center gap-16">

        {/* Left: copy */}
        <div className="flex-1 text-center lg:text-left max-w-2xl">

          {/* Badge */}
          <div className="anim-fade-in anim-delay-0 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-6 border border-blue-500/30"
               style={{ background: "rgba(59,130,246,0.08)", color: "#93c5fd" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Powered by Google Calendar &amp; Twilio · 100% automated
          </div>

          {/* Headline */}
          <h1 className="anim-fade-up anim-delay-1 font-display font-extrabold leading-[1.04] tracking-tight mb-5"
              style={{ fontSize: "clamp(38px,5.5vw,68px)" }}>
            Get a real phone call
            <br />
            <span className="text-gradient">before every meeting.</span>
          </h1>

          {/* Subheadline */}
          <p className="anim-fade-up anim-delay-2 text-lg text-slate-400 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
            Connect Google Calendar once. MeetingAlert automatically calls your phone
            <strong className="text-slate-200"> 10 minutes before every event</strong> — so you always show up on time.
          </p>

          {/* Use cases */}
          <div className="anim-fade-up anim-delay-3 flex flex-wrap justify-center lg:justify-start gap-2 mb-9">
            {["Job Interviews","Client Meetings","Daily Standups","College Classes","Doctor Appointments"].map((u) => (
              <span key={u}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/8"
                style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2 6 5 9 10 3"/>
                </svg>
                {u}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="anim-fade-up anim-delay-4 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <SignInForm label="Connect Google Calendar →"
              className="group font-display font-semibold text-base px-7 py-3.5 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:brightness-110"
              // @ts-ignore
              style={{ background: "linear-gradient(135deg,#3b82f6,#7c3aed)", boxShadow: "0 0 36px rgba(59,130,246,0.4)" }} />
            <p className="text-sm text-slate-500">2-min setup · No credit card</p>
          </div>
        </div>

        {/* Right: phone rings visual */}
        <div className="anim-fade-in anim-delay-5 relative flex-shrink-0 w-72 h-72 lg:w-88 lg:h-88 flex items-center justify-center"
             style={{ width: "340px", height: "340px" }}>
          <div className="ring-1 absolute w-28 h-28 rounded-full" style={{ border: "2px solid rgba(59,130,246,0.55)" }} />
          <div className="ring-2 absolute w-28 h-28 rounded-full" style={{ border: "2px solid rgba(124,58,237,0.5)" }} />
          <div className="ring-3 absolute w-28 h-28 rounded-full" style={{ border: "2px solid rgba(6,182,212,0.45)" }} />
          <div className="absolute w-36 h-36 rounded-full" style={{ background: "radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 70%)" }} />

          {/* Center */}
          <div className="relative z-10 w-22 h-22 rounded-3xl flex items-center justify-center glass"
               style={{ width:"88px", height:"88px", boxShadow: "0 0 52px rgba(59,130,246,0.3),inset 0 1px 0 rgba(255,255,255,0.1)" }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#a78bfa"/>
                </linearGradient>
              </defs>
              <path stroke="url(#pg)" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63 19.79 19.79 0 01.01 1A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>

          {/* Floating: meeting card */}
          <div className="float-1 absolute -top-6 -right-8 glass rounded-2xl px-4 py-3 z-20"
               style={{ minWidth:"155px", boxShadow:"0 8px 32px rgba(0,0,0,0.45)" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Upcoming</p>
            </div>
            <p className="text-sm font-display font-bold text-white">Team Standup</p>
            <p className="text-xs text-blue-400 mt-0.5">10:00 AM · 10 min away</p>
          </div>

          {/* Floating: call card */}
          <div className="float-2 absolute -bottom-6 -left-10 glass rounded-2xl px-3.5 py-3 z-20"
               style={{ minWidth:"150px", boxShadow:"0 8px 32px rgba(0,0,0,0.45)" }}>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ background:"rgba(59,130,246,0.2)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63 19.79 19.79 0 01.01 1A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                </div>
                <span className="dot-ping absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white leading-tight">Calling now…</p>
                <p className="text-[10px] text-slate-400">+91 851 994 7343</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ DEMO FLOW ════════════════ */}
      <section className="relative z-10 border-t border-white/5 py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-blue-400 mb-3">See How It Works</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
              Calendar event → <span className="text-gradient">phone rings.</span>
            </h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto">The entire flow, completely automated. You do nothing after setup.</p>
          </div>

          {/* Flow steps */}
          <div className="flex flex-col md:flex-row items-center gap-0">
            {[
              { n:"1", color:"#3b82f6", icon:"M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
                title:"Event Created", body:"You add a meeting to Google Calendar.", pulse:"step-pulse-1" },
              { n:"2", color:"#7c3aed", icon:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
                title:"Reminder Scheduled", body:"We detect it automatically within 15 minutes.", pulse:"step-pulse-2" },
              { n:"3", color:"#0891b2", icon:"M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63 19.79 19.79 0 01.01 1A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
                title:"Phone Rings", body:"Your phone rings 10 minutes before the meeting.", pulse:"step-pulse-3" },
              { n:"4", color:"#059669", icon:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title:"Meeting Attended", body:"You show up on time. Every. Single. Time.", pulse:"step-pulse-4" },
            ].map((s, i) => (
              <div key={s.n} className="flex flex-col md:flex-row items-center flex-1 w-full">
                {/* Card */}
                <div className={`glass rounded-2xl p-5 flex-1 w-full md:w-auto ${s.pulse}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background:`${s.color}20`, color: s.color }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={s.icon}/>
                      </svg>
                    </div>
                    <span className="font-display font-extrabold text-2xl leading-none"
                          style={{ color:`${s.color}30` }}>
                      {s.n}
                    </span>
                  </div>
                  <p className="font-display font-bold text-base text-white mb-1">{s.title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{s.body}</p>
                </div>

                {/* Arrow / connector */}
                {i < 3 && (
                  <div className="flex md:flex-row flex-col items-center md:mx-3 my-3 md:my-0 flex-shrink-0">
                    <div className="flow-shimmer rounded-full"
                         style={{
                           width: "48px", height: "3px",
                           background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.7),transparent)",
                           backgroundSize: "200% 100%",
                           animationDelay: `${i * 0.5}s`,
                         }} />
                    <svg className="hidden md:block" width="8" height="12" viewBox="0 0 8 12" fill="none">
                      <path d="M1 1l6 5-6 5" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {/* Mobile: down arrow */}
                    <svg className="md:hidden" width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1l5 6 5-6" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section id="how-it-works" className="relative z-10 border-t border-white/5 py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-violet-400 mb-3">Setup</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
              Ready in <span className="text-gradient">2 minutes.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n:"01", c:"#3b82f6", title:"Connect your calendar",
                body:"Sign in with Google. We request read-only access to your Google Calendar — no write permissions, ever." },
              { n:"02", c:"#7c3aed", title:"Add your phone number",
                body:"Enter the number you want us to call. Any mobile or landline worldwide. We'll send a test call." },
              { n:"03", c:"#0891b2", title:"Receive calls before meetings",
                body:"10 minutes before every event, your phone rings and a voice says your meeting title." },
            ].map((s) => (
              <div key={s.n} className="glass rounded-2xl p-7 hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                       style={{ background:`${s.c}18`, color: s.c }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <span className="font-display font-extrabold text-5xl leading-none" style={{ color:`${s.c}18` }}>{s.n}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ SEE IT IN ACTION ════════════════ */}
      <section className="relative z-10 border-t border-white/5 py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-cyan-400 mb-3">Product Preview</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
              See it in <span className="text-gradient">action.</span>
            </h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto">
              From Google Calendar to phone call — every step visualised.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Mockup 1: Calendar event */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2"
                   style={{ background:"rgba(59,130,246,0.08)" }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"/>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"/>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"/>
                </div>
                <p className="text-[10px] text-slate-500 ml-1">Google Calendar</p>
              </div>
              <div className="p-5">
                <p className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase mb-3">Thursday, June 5</p>
                <div className="rounded-xl p-3.5 mb-2" style={{ background:"rgba(59,130,246,0.12)", borderLeft:"3px solid #3b82f6" }}>
                  <p className="text-sm font-bold text-white mb-0.5">Team Standup</p>
                  <p className="text-xs text-slate-400">10:00 AM – 10:30 AM</p>
                  <p className="text-xs text-slate-500 mt-1">Google Meet · 4 guests</p>
                </div>
                <div className="rounded-xl p-3.5" style={{ background:"rgba(124,58,237,0.10)", borderLeft:"3px solid #7c3aed" }}>
                  <p className="text-sm font-bold text-white mb-0.5">Client Review</p>
                  <p className="text-xs text-slate-400">2:00 PM – 3:00 PM</p>
                </div>
              </div>
            </div>

            {/* Mockup 2: Dashboard */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between"
                   style={{ background:"rgba(124,58,237,0.08)" }}>
                <p className="text-[10px] text-slate-500">MeetingAlert Dashboard</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <p className="text-[10px] text-emerald-400">Active</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl p-3" style={{ background:"rgba(255,255,255,0.04)" }}>
                  <div>
                    <p className="text-xs font-semibold text-white">Team Standup</p>
                    <p className="text-[10px] text-slate-400">Call at 9:50 AM</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background:"rgba(251,191,36,0.15)", color:"#fbbf24" }}>Pending</span>
                </div>
                <div className="flex items-center justify-between rounded-xl p-3" style={{ background:"rgba(255,255,255,0.04)" }}>
                  <div>
                    <p className="text-xs font-semibold text-white">Design Review</p>
                    <p className="text-[10px] text-slate-400">Yesterday 1:50 PM</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background:"rgba(74,222,128,0.15)", color:"#4ade80" }}>Called</span>
                </div>
                <div className="flex items-center justify-between rounded-xl p-3" style={{ background:"rgba(255,255,255,0.04)" }}>
                  <div>
                    <p className="text-xs font-semibold text-white">Client Review</p>
                    <p className="text-[10px] text-slate-400">Today 1:50 PM</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background:"rgba(99,102,241,0.15)", color:"#818cf8" }}>Scheduled</span>
                </div>
              </div>
            </div>

            {/* Mockup 3: Incoming call screen */}
            <div className="glass rounded-2xl overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2"
                   style={{ background:"rgba(8,145,178,0.08)" }}>
                <p className="text-[10px] text-slate-500">Incoming Call · 9:50 AM</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                       style={{ background:"linear-gradient(135deg,#3b82f6,#7c3aed)", boxShadow:"0 0 32px rgba(59,130,246,0.4)" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63 19.79 19.79 0 01.01 1A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-1">Incoming call</p>
                <p className="font-display font-bold text-xl text-white mb-3">MeetingAlert</p>
                <p className="text-sm text-slate-400 leading-snug mb-6 px-2 glass rounded-xl py-2.5">
                  "Team Standup starts<br/>in <strong className="text-white">10 minutes</strong>"
                </p>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.3)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background:"rgba(74,222,128,0.2)", border:"1px solid rgba(74,222,128,0.3)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63 19.79 19.79 0 01.01 1A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section id="features" className="relative z-10 border-t border-white/5 py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-emerald-400 mb-3">Features</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
              Built for <span className="text-gradient">reliability.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { c:"#3b82f6", icon:"M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
                title:"Smart Call Reminders",    body:"Get an actual phone call before every meeting — not a notification, a real voice call that announces your meeting title." },
              { c:"#7c3aed", icon:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
                title:"Google Calendar Sync",    body:"Works automatically after connecting once. New events, reschedules, and cancellations are all handled without any input." },
              { c:"#0891b2", icon:"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
                title:"Timezone Aware",           body:"Perfect for remote teams and international meetings. Calls fire at the right time regardless of where you are." },
              { c:"#059669", icon:"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
                title:"Missed Call Fallback",     body:"If a call goes unanswered, the reminder is logged in your dashboard so you always know what happened." },
              { c:"#d97706", icon:"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9 12l2 2 4-4",
                title:"Secure OAuth Login",       body:"Google-standard authentication. We request read-only calendar access and encrypt all tokens with AES-256-GCM." },
              { c:"#db2777", icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title:"Reliable Delivery",        body:"Built on Twilio — the same infrastructure used by the world's top communication platforms. 99.9% uptime." },
            ].map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background:`${f.c}18`, color:f.c }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon}/>
                  </svg>
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TRUST / SECURITY ════════════════ */}
      <section className="relative z-10 border-t border-white/5 py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-10"
               style={{ borderColor:"rgba(99,102,241,0.2)" }}>
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                   style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.3)" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="url(#sg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#a78bfa"/>
                    </linearGradient>
                  </defs>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-3">
                Your calendar data stays <span className="text-gradient">private.</span>
              </h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                We take your privacy seriously. Here&apos;s exactly how we handle your data.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Read-only calendar access — we never modify your events",
                  "OAuth 2.0 authentication — industry-standard security",
                  "AES-256-GCM encrypted token storage",
                  "No event content sold or shared with third parties",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                         style={{ background:"rgba(74,222,128,0.15)" }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3"/>
                      </svg>
                    </div>
                    <p className="text-sm text-slate-300">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ PRICING ════════════════ */}
      <section id="pricing" className="relative z-10 border-t border-white/5 py-20 px-6 md:px-12">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-blue-400 mb-3">Pricing</p>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-12">
            Simple. <span className="text-gradient">Always free.</span>
          </h2>

          <div className="glass rounded-3xl p-8 relative overflow-hidden"
               style={{ borderColor:"rgba(99,102,241,0.3)", boxShadow:"0 0 60px rgba(59,130,246,0.1)" }}>
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background:"radial-gradient(ellipse 70% 50% at 50% 0%,rgba(59,130,246,0.08) 0%,transparent 60%)" }} />

            <div className="relative">
              <p className="font-display font-bold text-lg text-white mb-1">Free Plan</p>
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="font-display font-extrabold text-6xl text-white">$0</span>
                <span className="text-slate-400 text-sm mb-3">/ month</span>
              </div>
              <p className="text-slate-500 text-sm mb-8">Everything included. No trial. No credit card.</p>

              <div className="space-y-3 mb-8 text-left">
                {[
                  "Google Calendar Sync",
                  "Unlimited meeting reminders",
                  "Voice call before every event",
                  "Dashboard &amp; call logs",
                  "Customizable reminder timing",
                  "AES-256 encrypted storage",
                  "Secure OAuth login",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                         style={{ background:"rgba(59,130,246,0.15)" }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3"/>
                      </svg>
                    </div>
                    <p className="text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: f }} />
                  </div>
                ))}
              </div>

              <SignInForm label="Get started free →"
                className="w-full font-display font-semibold text-base py-3.5 px-6 rounded-xl text-white transition-all duration-200 hover:scale-[1.02] hover:brightness-110"
                // @ts-ignore
                style={{ background:"linear-gradient(135deg,#3b82f6,#7c3aed)", boxShadow:"0 0 32px rgba(59,130,246,0.3)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section className="relative z-10 border-t border-white/5 py-24 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-blue-400 mb-5">Ready?</p>
          <h2 className="font-display font-extrabold leading-tight text-white mb-5"
              style={{ fontSize:"clamp(32px,4.5vw,58px)" }}>
            Stop missing meetings.
            <br/>
            <span className="text-gradient">Start receiving reminder calls.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">
            Connect your Google Calendar in 2 minutes and never be late to a meeting again.
          </p>
          <SignInForm label="Connect Google Calendar →"
            className="inline-flex items-center gap-3 font-display font-semibold text-lg px-9 py-4 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:brightness-110"
            // @ts-ignore
            style={{ background:"linear-gradient(135deg,#3b82f6,#7c3aed)", boxShadow:"0 0 48px rgba(59,130,246,0.35)" }} />
          <p className="text-slate-600 text-sm mt-5">Free forever · 2-minute setup · No credit card required</p>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-16 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-display font-bold text-base">Meeting<span className="text-gradient">Alert</span></span>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">How it works</a>
          <a href="#features"     className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Features</a>
          <a href="#pricing"      className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Pricing</a>
        </div>
        <p className="text-xs text-slate-700">Powered by Google Calendar &amp; Twilio Voice</p>
      </footer>

    </main>
  );
}

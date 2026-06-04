import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { signIn } from "@/auth";
import { Phone, Calendar, Bell, Shield } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Phone className="h-6 w-6 text-blue-400" />
          <span className="text-white font-bold text-xl">MeetingAlert</span>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
            Sign in
          </Button>
        </form>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-8">
          <Bell className="h-3.5 w-3.5" />
          Never miss a meeting again
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
          Get a phone call
          <br />
          <span className="text-blue-400">10 minutes early</span>
        </h1>

        <p className="text-slate-400 text-xl max-w-xl mb-12">
          Connect your Google Calendar. We&apos;ll call your phone before every meeting so
          you always show up on time.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-500 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-blue-500/25"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </form>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl w-full">
          {[
            {
              icon: Calendar,
              title: "Google Calendar Sync",
              desc: "Automatically syncs all your upcoming events every 15 minutes.",
            },
            {
              icon: Phone,
              title: "Voice Call Reminder",
              desc: "Receives a real phone call that reads your meeting title aloud.",
            },
            {
              icon: Shield,
              title: "Secure & Private",
              desc: "OAuth tokens are AES-256 encrypted. We never store your passwords.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left"
            >
              <div className="bg-blue-500/10 rounded-xl w-10 h-10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

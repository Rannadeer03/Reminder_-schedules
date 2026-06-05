import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 landing-bg"
    >
      {/* Card */}
      <div
        className="w-full max-w-sm text-center"
        style={{
          background: "#161311",
          border: "1px solid #2C2820",
          padding: "52px 44px 44px",
        }}
      >
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div
            className="flex items-center justify-center w-14 h-14"
            style={{ border: "1px solid #2C2820", background: "rgba(201,169,110,0.06)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>
        </div>

        {/* Wordmark */}
        <div className="font-display text-3xl tracking-tight mb-2" style={{ color: "#EDE8DF" }}>
          <em>Meeting</em>
          <span className="not-italic" style={{ color: "#C9A96E" }}>Alert</span>
        </div>

        <p className="font-body text-sm leading-relaxed mb-10" style={{ color: "#706860" }}>
          Sign in with Google to connect your calendar
          and start receiving call reminders.
        </p>

        {/* Google sign-in */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-3 font-body font-medium text-sm tracking-wide py-3.5 px-6 transition-all duration-200"
            style={{ background: "#C9A96E", color: "#0C0A08" }}
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#1a1410"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#1a1410"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#1a1410"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#1a1410"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="font-body text-[11px] tracking-wide mt-8" style={{ color: "#4A4540" }}>
          Read-only calendar access · Encrypted at rest
        </p>
      </div>
    </div>
  );
}

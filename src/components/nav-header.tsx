import Link from "next/link";
import { signOut } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavHeaderProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function NavHeader({ user }: NavHeaderProps) {
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? "U").toUpperCase();

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ background: "rgba(2,8,23,0.85)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between h-16">

        {/* Wordmark */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: "linear-gradient(135deg,#3b82f6,#7c3aed)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63 19.79 19.79 0 01.01 1A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-base text-white">
            Meeting<span className="text-gradient">Alert</span>
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden sm:flex items-center gap-7">
          <Link href="/dashboard" className="font-body text-sm font-medium text-slate-400 hover:text-white transition-colors duration-150">
            Dashboard
          </Link>
          <Link href="/settings" className="font-body text-sm font-medium text-slate-400 hover:text-white transition-colors duration-150">
            Settings
          </Link>
        </nav>

        {/* User + Sign out */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
              <AvatarFallback
                className="text-xs font-body font-medium"
                style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="font-body text-sm text-slate-300">
              {user.name ?? user.email}
            </span>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="font-body text-xs tracking-wide px-3 py-1.5 rounded-lg border transition-all duration-200 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.1)", background: "transparent" }}
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

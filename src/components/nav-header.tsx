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
      style={{ background: "#FDFCFA", borderColor: "#E2DDD5" }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between h-16">

        {/* Wordmark */}
        <Link href="/dashboard" className="font-display text-xl tracking-tight" style={{ color: "#1C1914" }}>
          <em>Meeting</em>
          <span className="not-italic" style={{ color: "#C9A96E" }}>Alert</span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden sm:flex items-center gap-7">
          <Link
            href="/dashboard"
            className="font-body text-sm font-medium transition-colors duration-150"
            style={{ color: "#7A756E" }}
          >
            Dashboard
          </Link>
          <Link
            href="/settings"
            className="font-body text-sm font-medium transition-colors duration-150"
            style={{ color: "#7A756E" }}
          >
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
                style={{ background: "rgba(201,169,110,0.15)", color: "#A88844" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="font-body text-sm" style={{ color: "#4A4540" }}>
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
              className="font-body text-xs tracking-wide px-3 py-1.5 border transition-all duration-200"
              style={{
                color: "#7A756E",
                borderColor: "#E2DDD5",
                background: "transparent",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

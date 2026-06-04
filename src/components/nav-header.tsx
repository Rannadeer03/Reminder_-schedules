import Link from "next/link";
import { signOut } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, LayoutDashboard, Settings, LogOut } from "lucide-react";

interface NavHeaderProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function NavHeader({ user }: NavHeaderProps) {
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? "U").toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-blue-600" />
          <span className="font-bold text-slate-900 text-lg">MeetingAlert</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm text-slate-700">{user.name ?? user.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NavHeader } from "@/components/nav-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen" style={{ background: "#F4F0EB" }}>
      <NavHeader user={session.user} />
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
        {children}
      </main>
    </div>
  );
}

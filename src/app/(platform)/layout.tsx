// ============================================================
// Platform Layout — authenticated shell with sidebar
// ============================================================

export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/app/dashboard", icon: "📊" },
  { label: "Financials", href: "/app/financials", icon: "💰" },
  { label: "Health Score", href: "/app/health-score", icon: "🏥" },
  { label: "Investor Readiness", href: "/app/investor-readiness", icon: "🎯" },
  { label: "Reports", href: "/app/reports", icon: "📄" },
  { label: "Alerts", href: "/app/alerts", icon: "🔔" },
  { label: "Settings", href: "/app/settings", icon: "⚙️" },
];

const ADVISORY_ITEMS = [
  { label: "Startups", href: "/advisory/startups", icon: "🏢" },
  { label: "Tasks", href: "/advisory/tasks", icon: "✅" },
];

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="border-b p-4">
          <Link href="/app/dashboard" className="text-lg font-bold text-slate-900">
            <span className="text-blue-600">CFOIP</span> Financial OS
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Platform
          </p>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="my-3 border-t" />
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Advisory
          </p>
          {ADVISORY_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t p-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
    </div>
  );
}

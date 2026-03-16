// ============================================================
// AppSidebar  -  Extracted sidebar for the platform layout
// Can be used for client-side active-link highlighting
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", icon: "📊" },
  { label: "Financials", href: "/app/financials", icon: "💰" },
  { label: "Health Score", href: "/app/health-score", icon: "🏥" },
  { label: "Investor Readiness", href: "/app/investor-readiness", icon: "🎯" },
  { label: "Reports", href: "/app/reports", icon: "📄" },
  { label: "Alerts", href: "/app/alerts", icon: "🔔" },
  { label: "Settings", href: "/app/settings", icon: "⚙️" },
];

const ADVISORY_ITEMS: NavItem[] = [
  { label: "Advisory Hub", href: "/advisory", icon: "🏢" },
  { label: "Startups", href: "/advisory/startups", icon: "📋" },
  { label: "Tasks", href: "/advisory/tasks", icon: "✅" },
];

interface AppSidebarProps {
  showAdvisory?: boolean;
}

export default function AppSidebar({ showAdvisory = false }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 p-3">
      <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Platform
      </p>
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
              active
                ? "bg-blue-50 font-medium text-blue-700"
                : "text-slate-700 hover:bg-slate-100"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}

      {showAdvisory && (
        <>
          <div className="my-3 border-t" />
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Advisory
          </p>
          {ADVISORY_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}

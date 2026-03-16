// ============================================================
// AppHeader — Top bar for the platform with breadcrumbs and user menu
// ============================================================

"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

// Map route segments to readable labels
const ROUTE_LABELS: Record<string, string> = {
  app: "Platform",
  dashboard: "Dashboard",
  financials: "Financials",
  "health-score": "Health Score",
  "investor-readiness": "Investor Readiness",
  reports: "Reports",
  alerts: "Alerts",
  settings: "Settings",
  onboarding: "Onboarding",
  advisory: "Advisory",
  startups: "Startups",
  tasks: "Tasks",
  admin: "Admin",
};

export default function AppHeader() {
  const pathname = usePathname();

  // Build breadcrumb from path segments
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((s) => !s.startsWith("("));

  const breadcrumbs = segments.map((seg) => ROUTE_LABELS[seg] ?? seg).slice(0, 3);

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-slate-300">/</span>}
            <span className={i === breadcrumbs.length - 1 ? "font-medium text-slate-900" : ""}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}

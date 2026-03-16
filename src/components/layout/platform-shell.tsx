"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@/lib/auth/user-button";
import {
  LayoutDashboard,
  Wallet,
  Download,
  HeartPulse,
  Target,
  FileBarChart,
  Bell,
  Settings,
  Mail,
  Shield,
  ChevronRight,
  Brain,
  CreditCard,
  Activity,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Financials", href: "/app/financials", icon: Wallet },
  { label: "Data Import", href: "/app/financials#import", icon: Download },
  { label: "Health Score", href: "/app/health-score", icon: HeartPulse },
  { label: "Investor Readiness", href: "/app/investor-readiness", icon: Target },
  { label: "Survival Predictor", href: "/survival-predictor", icon: Activity, badge: "Free" },
  { label: "CFO AI", href: "/app/cfo-ai", icon: Brain },
  { label: "Reports", href: "/app/reports", icon: FileBarChart },
  { label: "Alerts", href: "/app/alerts", icon: Bell },
  { label: "Billing", href: "/app/billing", icon: CreditCard },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Full-screen layout for onboarding (no sidebar)
  if (pathname === "/app/onboarding") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white font-bold text-xs">
            C
          </div>
          <Link href="/app/dashboard" className="text-base font-bold text-slate-900">
            <span className="text-blue-600">CFOIP</span> Financial OS
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Platform
          </p>
          {NAV_ITEMS.map((item) => {
            const baseHref = item.href.split("#")[0];
            const isActive =
              pathname === item.href ||
              pathname === baseHref ||
              (item.href !== "/app/dashboard" && item.href !== "/app/financials#import" && pathname.startsWith(baseHref) && baseHref !== "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-violet-50 text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] ${
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {item.label}
                {"badge" in item && item.badge && (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-blue-400" />
                )}
              </Link>
            );
          })}

          {/* Divider + Support */}
          <div className="my-4 border-t border-slate-100" />
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Support
          </p>
          <a
            href="mailto:partner@cfopartners.fund"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Mail className="h-[18px] w-[18px] text-slate-400" />
            Contact Us
          </a>
          <Link
            href="/privacy"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Shield className="h-[18px] w-[18px] text-slate-400" />
            Privacy & Terms
          </Link>
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-100 p-4">
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Security Badge */}
        <div className="px-4 pb-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
            <p className="text-[10px] font-medium text-slate-400">
              🔒 256-bit AES Encrypted
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@/lib/auth/user-button";
import { FeedbackPopup } from "@/components/feedback/feedback-popup";
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
  Sparkles,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Financials", href: "/app/financials", icon: Wallet },
  { label: "Data Import", href: "/app/financials#import", icon: Download },
  { label: "Health Score", href: "/app/health-score", icon: HeartPulse },
  { label: "Investor Readiness", href: "/app/investor-readiness", icon: Target },
  { label: "Survival Predictor", href: "/app/survival-predictor", icon: Activity, badge: "Free" },
  { label: "CFO AI", href: "/app/cfo-ai", icon: Brain },
  { label: "Reports", href: "/app/reports", icon: FileBarChart },
  { label: "Alerts", href: "/app/alerts", icon: Bell },
  { label: "Billing", href: "/app/billing", icon: CreditCard },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

// Trial end date — 1 week from launch (March 23, 2026)
const TRIAL_END = new Date("2026-03-23T23:59:59");

function getTrialDaysLeft(): number {
  const now = new Date();
  const diff = TRIAL_END.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const daysLeft = getTrialDaysLeft();

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

        {/* Trial Badge */}
        <div className="px-3 pb-2">
          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2.5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-200" />
              <p className="text-[11px] font-bold text-white">FREE TRIAL</p>
            </div>
            <p className="text-[10px] text-blue-100">
              {daysLeft > 0
                ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left — full access`
                : "Trial ended"}
            </p>
          </div>
        </div>

        {/* User Section */}
        <div className="border-t border-slate-100 p-4">
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Security Badge */}
        <div className="px-4 pb-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
            <p className="text-[10px] font-medium text-slate-400">
              256-bit AES Encrypted
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        {/* Trial Banner */}
        {!bannerDismissed && daysLeft > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white">
            <div className="mx-auto max-w-[1400px] flex items-center justify-between px-4 py-2.5 md:px-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-200" />
                <p className="text-sm font-medium">
                  Full platform access — free for {daysLeft} more day{daysLeft !== 1 ? "s" : ""}. Explore every feature, no payment required.
                </p>
              </div>
              <button
                onClick={() => setBannerDismissed(true)}
                className="shrink-0 rounded-full p-1 hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-6">
          {children}
        </div>
      </main>

      {/* Feedback Popup */}
      <FeedbackPopup />
    </div>
  );
}

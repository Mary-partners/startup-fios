// ============================================================
// PublicNav  -  Marketing site navigation bar
// ============================================================

"use client";

import { useState } from "react";
import Link from "next/link";

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-slate-900">
          <span className="text-blue-600">CFOIP</span> Financial OS
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/survival-predictor" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Survival Predictor
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Pricing
          </Link>
          <Link href="/sign-in" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-slate-600"
          aria-label="Toggle navigation"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/survival-predictor" className="text-sm font-medium text-slate-600" onClick={() => setMobileOpen(false)}>
              Survival Predictor
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-slate-600" onClick={() => setMobileOpen(false)}>
              Pricing
            </Link>
            <Link href="/sign-in" className="text-sm font-medium text-slate-600" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

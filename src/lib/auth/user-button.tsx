// ============================================================
// Mock UserButton Component — Stub for Clerk
// Simple demo user profile button without Clerk
// ============================================================

"use client";

import Link from "next/link";

interface UserButtonProps {
  afterSignOutUrl?: string;
}

export function UserButton({ afterSignOutUrl = "/" }: UserButtonProps) {
  return (
    <Link
      href={afterSignOutUrl}
      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
    >
      <span>Demo User</span>
      <span>👤</span>
    </Link>
  );
}

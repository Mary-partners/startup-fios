// ============================================================
// Sign In Page — Demo mode (Clerk disabled)
// ============================================================

import Link from "next/link";
import { redirect } from "next/navigation";

export default function SignInPage() {
  // In demo mode, redirect to dashboard
  redirect("/app/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">
            Demo Mode — No authentication required
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
          <p className="mb-4 text-sm text-slate-600">
            This is a demo deployment. Authentication is disabled.
          </p>
          <Link
            href="/app/dashboard"
            className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

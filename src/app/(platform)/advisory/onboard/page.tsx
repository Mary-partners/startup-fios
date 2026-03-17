"use client";

// ============================================================
// Onboard New Client
// Set up a new advisory engagement
// ============================================================

import { OnboardClientForm } from "@/components/advisory/onboard-client-form";

export default function OnboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Onboard New Client
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Set up a new advisory engagement
        </p>
      </div>

      {/* Form wrapped in white card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <OnboardClientForm />
      </div>
    </div>
  );
}

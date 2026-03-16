// ============================================================
// Sign Up Page — Clerk hosted sign-up component
// ============================================================

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Get started</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create your account and set up your financial dashboard in minutes
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-500 text-sm font-semibold",
              card: "shadow-lg border border-slate-200 rounded-xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
            },
          }}
          afterSignUpUrl="/app/onboarding"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}

// ============================================================
// Sign In Page — Clerk hosted sign-in component
// ============================================================

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to your Startup Financial Intelligence OS account
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-500 text-sm font-semibold",
              card: "shadow-lg border border-slate-200 rounded-xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
            },
          }}
          afterSignInUrl="/app/dashboard"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}

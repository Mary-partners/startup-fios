// ============================================================
// useUser Mock Hook — Stub for Clerk hook
// Returns demo user data for client components
// ============================================================

"use client";

export interface User {
  id: string;
  fullName: string | null;
  primaryEmailAddress: {
    emailAddress: string;
  } | null;
}

/**
 * Mock useUser hook that returns a demo user.
 * Used in client components that previously relied on Clerk's useUser().
 */
export function useUser() {
  // Return a simple demo user for the Settings and Onboarding pages
  const demoUser: User = {
    id: "demo_user_001",
    fullName: "Demo Founder",
    primaryEmailAddress: {
      emailAddress: "demo@cfolead.solutions",
    },
  };

  return {
    user: demoUser,
    isSignedIn: true,
    isLoaded: true,
  };
}

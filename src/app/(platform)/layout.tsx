// ============================================================
// Platform Layout  -  authenticated shell with sidebar
// Uses pathname to hide sidebar on onboarding page
// ============================================================

export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { PlatformShell } from "@/components/layout/platform-shell";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <PlatformShell>{children}</PlatformShell>;
}

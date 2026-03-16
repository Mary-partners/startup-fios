// ============================================================
// Auth Session — Returns current user context for client components
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { db } from "@/lib/db/client";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      // User exists in Clerk but has no company yet → needs onboarding
      return NextResponse.json({
        success: true,
        data: {
          authenticated: true,
          hasCompany: false,
          user: null,
          company: null,
          role: null,
          tier: null,
        },
      });
    }

    const [user, company, subscription] = await Promise.all([
      db.user.findUnique({
        where: { id: tenant.userId },
        select: { id: true, name: true, email: true },
      }),
      db.company.findUnique({
        where: { id: tenant.companyId },
        select: { id: true, name: true, stage: true },
      }),
      db.subscription.findUnique({
        where: { companyId: tenant.companyId },
        select: { tier: true, status: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        authenticated: true,
        hasCompany: true,
        user,
        company,
        role: tenant.role,
        tier: subscription?.tier ?? "FREE",
      },
    });
  } catch (error) {
    console.error("[auth/session] GET error:", error);
    return NextResponse.json(
      { error: "Failed to resolve session" },
      { status: 500 }
    );
  }
}

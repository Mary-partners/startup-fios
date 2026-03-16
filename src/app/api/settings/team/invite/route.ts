// ============================================================
// API: Invite team member
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { requirePermission } from "@/lib/auth/permissions";
import { canAddTeamMember } from "@/lib/billing/gates";
import { SubscriptionTier } from "@/types/enums";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    requirePermission(tenant.role, "team:invite");

    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Check team size limits
    const subscription = await db.subscription.findUnique({
      where: { companyId: tenant.companyId },
    });

    const memberCount = await db.membership.count({
      where: { companyId: tenant.companyId },
    });

    if (subscription && !canAddTeamMember(subscription.tier as SubscriptionTier, memberCount)) {
      return NextResponse.json(
        { success: false, error: "Team size limit reached for your plan. Please upgrade." },
        { status: 403 }
      );
    }

    // Check if user exists
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      // Create a placeholder user (will be linked when they sign up via Clerk)
      user = await db.user.create({
        data: {
          email,
          externalId: `pending_${Date.now()}`,
          name: null,
        },
      });
    }

    // Check if already a member
    const existing = await db.membership.findFirst({
      where: { userId: user.id, companyId: tenant.companyId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "User is already a team member" },
        { status: 400 }
      );
    }

    await db.membership.create({
      data: {
        userId: user.id,
        companyId: tenant.companyId,
        role,
      },
    });

    // TODO: Send invitation email via Clerk or a transactional email service

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to invite member";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

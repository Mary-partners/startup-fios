// ============================================================
// API: Reassign Advisory Case — Change assigned advisor
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { isAdvisoryRole } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/advisory/log-activity";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/advisory/cases/:id/reassign
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant || !isAdvisoryRole(tenant.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { assignedAdvisor } = body;

    if (!assignedAdvisor) {
      return NextResponse.json(
        { success: false, error: "assignedAdvisor (userId) is required" },
        { status: 400 }
      );
    }

    // Verify the new advisor exists
    const newAdvisor = await db.user.findUnique({
      where: { id: assignedAdvisor },
      select: { id: true, name: true, email: true },
    });

    if (!newAdvisor) {
      return NextResponse.json(
        { success: false, error: "Assigned advisor not found" },
        { status: 404 }
      );
    }

    // Fetch current case
    const currentCase = await db.advisoryCase.findUnique({
      where: { id },
    });

    if (!currentCase) {
      return NextResponse.json(
        { success: false, error: "Advisory case not found" },
        { status: 404 }
      );
    }

    const previousAdvisor = currentCase.assignedAdvisor;

    const updated = await db.advisoryCase.update({
      where: { id },
      data: { assignedAdvisor },
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    // Fetch previous advisor name for activity log
    let previousAdvisorName = "Unassigned";
    if (previousAdvisor) {
      const prevUser = await db.user.findUnique({
        where: { id: previousAdvisor },
        select: { name: true, email: true },
      });
      if (prevUser) {
        previousAdvisorName = prevUser.name ?? prevUser.email;
      }
    }

    await logActivity({
      advisoryCaseId: id,
      type: "ASSIGNMENT_CHANGE",
      title: `Case reassigned to ${newAdvisor.name ?? newAdvisor.email}`,
      description: `Reassigned from ${previousAdvisorName} to ${newAdvisor.name ?? newAdvisor.email}`,
      performedById: tenant.userId,
      metadata: {
        previousAdvisor,
        newAdvisor: assignedAdvisor,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error("[advisory/reassign] PATCH error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to reassign case";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

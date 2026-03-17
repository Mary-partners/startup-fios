// ============================================================
// API: Advisory Case Engagement — Update engagement details
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
    const {
      engagementStatus,
      retainerAmount,
      billingCadence,
      contractStartDate,
      contractEndDate,
      servicePackageId,
      estimatedHoursPerMonth,
      churnReason,
    } = body;

    // Validate churnReason is required when status changes to CHURNED
    if (engagementStatus === "CHURNED" && !churnReason) {
      return NextResponse.json(
        { success: false, error: "churnReason is required when status is CHURNED" },
        { status: 400 }
      );
    }

    // Fetch current case to detect status changes
    const currentCase = await db.advisoryCase.findUnique({
      where: { id },
    });

    if (!currentCase) {
      return NextResponse.json(
        { success: false, error: "Advisory case not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (retainerAmount !== undefined) updateData.retainerAmount = retainerAmount;
    if (billingCadence !== undefined) updateData.billingCadence = billingCadence;
    if (contractStartDate !== undefined)
      updateData.contractStartDate = contractStartDate ? new Date(contractStartDate) : null;
    if (contractEndDate !== undefined)
      updateData.contractEndDate = contractEndDate ? new Date(contractEndDate) : null;
    if (servicePackageId !== undefined) updateData.servicePackageId = servicePackageId;
    if (estimatedHoursPerMonth !== undefined)
      updateData.estimatedHoursPerMonth = estimatedHoursPerMonth;
    if (churnReason !== undefined) updateData.churnReason = churnReason;

    // Handle engagement status transitions
    if (engagementStatus && engagementStatus !== currentCase.engagementStatus) {
      updateData.engagementStatus = engagementStatus;

      switch (engagementStatus) {
        case "ACTIVE":
          if (!currentCase.onboardedAt) {
            updateData.onboardedAt = new Date();
          }
          break;
        case "PAUSED":
          updateData.pausedAt = new Date();
          break;
        case "COMPLETED":
          updateData.completedAt = new Date();
          break;
        case "CHURNED":
          updateData.churnedAt = new Date();
          updateData.churnReason = churnReason;
          break;
      }
    }

    const updated = await db.advisoryCase.update({
      where: { id },
      data: updateData,
      include: {
        company: { select: { id: true, name: true } },
        servicePackage: true,
      },
    });

    // Auto-log status change
    if (engagementStatus && engagementStatus !== currentCase.engagementStatus) {
      await logActivity({
        advisoryCaseId: id,
        type: "STATUS_CHANGE",
        title: `Engagement status changed to ${engagementStatus}`,
        description: `Status changed from ${currentCase.engagementStatus} to ${engagementStatus}`,
        performedById: tenant.userId,
        metadata: {
          previousStatus: currentCase.engagementStatus,
          newStatus: engagementStatus,
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error("[advisory/engagement] PATCH error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update engagement";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

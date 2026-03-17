// ============================================================
// API: Checklist Item — Toggle completion
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { isAdvisoryRole } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/advisory/log-activity";

interface Params {
  params: Promise<{ id: string; itemId: string }>;
}

// PATCH /api/advisory/deliverables/:id/checklist/:itemId
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

    const { id, itemId } = await params;
    const body = await req.json();
    const { isCompleted } = body;

    if (typeof isCompleted !== "boolean") {
      return NextResponse.json(
        { success: false, error: "isCompleted (boolean) is required" },
        { status: 400 }
      );
    }

    // Verify checklist item exists and belongs to this deliverable
    const item = await db.checklistItem.findFirst({
      where: { id: itemId, deliverableId: id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Checklist item not found" },
        { status: 404 }
      );
    }

    const updated = await db.checklistItem.update({
      where: { id: itemId },
      data: isCompleted
        ? {
            isCompleted: true,
            completedAt: new Date(),
            completedById: tenant.userId,
          }
        : {
            isCompleted: false,
            completedAt: null,
            completedById: null,
          },
    });

    // Check if ALL items for this deliverable are now complete
    if (isCompleted) {
      const allItems = await db.checklistItem.findMany({
        where: { deliverableId: id },
      });

      const allComplete = allItems.every((i) =>
        i.id === itemId ? true : i.isCompleted
      );

      if (allComplete) {
        const deliverable = await db.deliverable.findUnique({
          where: { id },
        });

        if (deliverable) {
          await logActivity({
            advisoryCaseId: deliverable.advisoryCaseId,
            type: "CHECKLIST_COMPLETED",
            title: `All checklist items completed for "${deliverable.title}"`,
            performedById: tenant.userId,
            metadata: { deliverableId: id },
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error("[advisory/checklist] PATCH error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update checklist item";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

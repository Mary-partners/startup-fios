// ============================================================
// API: Deliverable — Update and delete a single deliverable
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

// PATCH /api/advisory/deliverables/:id
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
    const { status, assignedToId, dueDate, title, description } = body;

    // Fetch current deliverable to detect status changes
    const current = await db.deliverable.findUnique({
      where: { id },
    });

    if (!current) {
      return NextResponse.json(
        { success: false, error: "Deliverable not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;

    if (status !== undefined) {
      updateData.status = status;
      if (status === "DELIVERED" && !current.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    const updated = await db.deliverable.update({
      where: { id },
      data: updateData,
      include: {
        checklistItems: {
          orderBy: { sortOrder: "asc" },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Auto-log status changes
    if (status && status !== current.status) {
      await logActivity({
        advisoryCaseId: current.advisoryCaseId,
        type: "STATUS_CHANGE",
        title: `Deliverable "${current.title}" status changed to ${status}`,
        performedById: tenant.userId,
        metadata: {
          deliverableId: id,
          previousStatus: current.status,
          newStatus: status,
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error("[advisory/deliverables] PATCH error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update deliverable";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/advisory/deliverables/:id
export async function DELETE(req: NextRequest, { params }: Params) {
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

    const deliverable = await db.deliverable.findUnique({
      where: { id },
    });

    if (!deliverable) {
      return NextResponse.json(
        { success: false, error: "Deliverable not found" },
        { status: 404 }
      );
    }

    await db.deliverable.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: unknown) {
    console.error("[advisory/deliverables] DELETE error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete deliverable";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

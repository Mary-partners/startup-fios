// ============================================================
// API: Advisory Task — Update a single task (status, assignee, etc.)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { isAdvisoryRole } from "@/lib/auth/permissions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const body = await request.json();
    const { status, title, description, priority, dueDate, assignedToId } =
      body;

    // Validate assignee if changing
    if (assignedToId !== undefined && assignedToId !== null) {
      const assignee = await db.user.findUnique({
        where: { id: assignedToId },
      });
      if (!assignee) {
        return NextResponse.json(
          { success: false, error: "Assigned user not found" },
          { status: 400 }
        );
      }
    }

    const task = await db.advisoryTask.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(assignedToId !== undefined && { assignedToId }),
        ...(status === "COMPLETE" && { completedAt: new Date() }),
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update task";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

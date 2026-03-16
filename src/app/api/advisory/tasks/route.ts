// ============================================================
// API: Advisory Tasks — List, create, with assignee support
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { isAdvisoryRole } from "@/lib/auth/permissions";

export async function GET() {
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

    const tasks = await db.advisoryTask.findMany({
      include: {
        advisoryCase: {
          include: { company: { select: { name: true } } },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [{ status: "asc" }, { priority: "asc" }, { dueDate: "asc" }],
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch tasks";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      description,
      priority,
      dueDate,
      advisoryCaseId,
      assignedToId,
    } = body;

    if (!title || !advisoryCaseId) {
      return NextResponse.json(
        { success: false, error: "Title and case ID are required" },
        { status: 400 }
      );
    }

    // Validate assignee exists if provided
    if (assignedToId) {
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

    const task = await db.advisoryTask.create({
      data: {
        advisoryCaseId,
        title,
        description: description ?? null,
        priority: priority ?? "MEDIUM",
        status: "OPEN",
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId ?? tenant.userId,
        createdById: tenant.userId,
      },
      include: {
        advisoryCase: {
          include: { company: { select: { name: true } } },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create task";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ============================================================
// API: Case Deliverables — List and create deliverables
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

// GET /api/advisory/cases/:id/deliverables
export async function GET(req: NextRequest, { params }: Params) {
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

    const deliverables = await db.deliverable.findMany({
      where: { advisoryCaseId: id },
      include: {
        checklistItems: {
          orderBy: { sortOrder: "asc" },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ success: true, data: deliverables });
  } catch (error: unknown) {
    console.error("[advisory/deliverables] GET error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch deliverables";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/advisory/cases/:id/deliverables
export async function POST(req: NextRequest, { params }: Params) {
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
      title,
      description,
      status,
      recurrence,
      periodYear,
      periodMonth,
      dueDate,
      assignedToId,
      templateId,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // Verify case exists
    const advisoryCase = await db.advisoryCase.findUnique({
      where: { id },
    });

    if (!advisoryCase) {
      return NextResponse.json(
        { success: false, error: "Advisory case not found" },
        { status: 404 }
      );
    }

    // If templateId provided, fetch template for checklist items
    let templateChecklistItems: string[] = [];
    if (templateId) {
      const template = await db.deliverableTemplate.findUnique({
        where: { id: templateId },
      });
      if (template?.checklistItems && Array.isArray(template.checklistItems)) {
        templateChecklistItems = template.checklistItems as string[];
      }
    }

    const deliverable = await db.deliverable.create({
      data: {
        advisoryCaseId: id,
        title,
        description: description ?? null,
        status: status ?? "NOT_STARTED",
        recurrence: recurrence ?? "NONE",
        periodYear: periodYear ?? null,
        periodMonth: periodMonth ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId ?? null,
        templateId: templateId ?? null,
        checklistItems: templateChecklistItems.length > 0
          ? {
              create: templateChecklistItems.map((itemTitle, index) => ({
                title: itemTitle,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        checklistItems: {
          orderBy: { sortOrder: "asc" },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await logActivity({
      advisoryCaseId: id,
      type: "DELIVERABLE_SENT",
      title: `Deliverable created: ${title}`,
      performedById: tenant.userId,
      metadata: { deliverableId: deliverable.id },
    });

    return NextResponse.json({ success: true, data: deliverable });
  } catch (error: unknown) {
    console.error("[advisory/deliverables] POST error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create deliverable";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

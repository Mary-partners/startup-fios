// ============================================================
// API: Checklist Items — Add items to a deliverable
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { isAdvisoryRole } from "@/lib/auth/permissions";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/advisory/deliverables/:id/checklist
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
    const { title, sortOrder } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // Verify deliverable exists
    const deliverable = await db.deliverable.findUnique({
      where: { id },
    });

    if (!deliverable) {
      return NextResponse.json(
        { success: false, error: "Deliverable not found" },
        { status: 404 }
      );
    }

    const item = await db.checklistItem.create({
      data: {
        deliverableId: id,
        title,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    console.error("[advisory/checklist] POST error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create checklist item";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ============================================================
// API: Case Activity Feed — List and manually log activities
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

// GET /api/advisory/cases/:id/activity
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
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "30", 10);
    const cursor = searchParams.get("cursor");

    const activities = await db.activityEvent.findMany({
      where: { advisoryCaseId: id },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1, // fetch one extra to determine hasMore
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = activities.length > limit;
    const data = hasMore ? activities.slice(0, limit) : activities;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return NextResponse.json({
      success: true,
      data,
      pagination: { hasMore, nextCursor },
    });
  } catch (error: unknown) {
    console.error("[advisory/activity] GET error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch activities";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/advisory/cases/:id/activity
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
    const { type, title, description } = body;

    const allowedTypes = ["CALL", "EMAIL", "MEETING", "NOTE", "ISSUE_FLAGGED"];
    if (!type || !allowedTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `type must be one of: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

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

    await logActivity({
      advisoryCaseId: id,
      type,
      title,
      description: description ?? undefined,
      performedById: tenant.userId,
    });

    // Return the created activity
    const latest = await db.activityEvent.findFirst({
      where: { advisoryCaseId: id },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: latest });
  } catch (error: unknown) {
    console.error("[advisory/activity] POST error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to log activity";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

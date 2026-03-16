// ============================================================
// Advisory Case Notes — GET list / POST create
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { isAdvisoryRole } from "@/lib/auth/permissions";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/advisory/cases/:id/notes
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify advisory role
    const tenant = await resolveTenantContext(userId);
    if (!tenant || !isAdvisoryRole(tenant.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const notes = await db.advisoryNote.findMany({
      where: { advisoryCaseId: id },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    console.error("[advisory/notes] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST /api/advisory/cases/:id/notes
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify advisory role
    const tenant = await resolveTenantContext(userId);
    if (!tenant || !isAdvisoryRole(tenant.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { content, isPrivate } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    // Use the internal userId from tenant context
    const user = await db.user.findUnique({
      where: { externalId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify advisory case exists
    const advisoryCase = await db.advisoryCase.findUnique({
      where: { id },
    });

    if (!advisoryCase) {
      return NextResponse.json(
        { error: "Advisory case not found" },
        { status: 404 }
      );
    }

    const note = await db.advisoryNote.create({
      data: {
        content: content.trim(),
        isPrivate: isPrivate ?? false,
        advisoryCaseId: id,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: note.id,
        content: note.content,
        authorName: note.author.name ?? note.author.email,
        createdAt: note.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[advisory/notes] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

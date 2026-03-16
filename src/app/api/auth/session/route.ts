// ============================================================
// Auth Session — Returns current user context for client components
// ============================================================

import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Also get company context if available
    const membership = await db.membership.findFirst({
      where: { userId: user.id },
      include: { company: { select: { id: true, name: true, stage: true } } },
    });

    const subscription = membership
      ? await db.subscription.findUnique({
          where: { companyId: membership.companyId },
          select: { tier: true, status: true },
        })
      : null;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.avatarUrl,
      },
      company: membership?.company || null,
      role: membership?.role || null,
      tier: subscription?.tier ?? "FREE",
      hasCompany: !!membership,
    });
  } catch (error) {
    console.error("[auth/session] GET error:", error);
    return NextResponse.json(
      { error: "Failed to resolve session" },
      { status: 500 }
    );
  }
}

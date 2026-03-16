// ============================================================
// POST /api/leads/capture - Public lead capture endpoint
// Saves name, email, reason, and source for the admin panel
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, reason, source } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email required" },
        { status: 400 }
      );
    }

    const leadSource = source || "survival-predictor";

    await db.lead.upsert({
      where: {
        email_source: {
          email: email.toLowerCase().trim(),
          source: leadSource,
        },
      },
      update: {
        name: name || undefined,
        metadata: {
          reason: reason || null,
          capturedAt: new Date().toISOString(),
          userAgent: request.headers.get("user-agent") || null,
        },
        updatedAt: new Date(),
      },
      create: {
        email: email.toLowerCase().trim(),
        name: name || null,
        source: leadSource,
        metadata: {
          reason: reason || null,
          capturedAt: new Date().toISOString(),
          userAgent: request.headers.get("user-agent") || null,
        },
      },
    });

    console.log(
      `[lead-capture] ${leadSource}: ${email} | reason: ${reason || "none"}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[lead-capture] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to capture lead" },
      { status: 500 }
    );
  }
}

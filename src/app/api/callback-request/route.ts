// ============================================================
// /api/callback-request — Capture callback requests from
// survival predictor results and other lead sources
// ============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, source, survivalScore, riskLevel, runway } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (!phone?.trim() && !email?.trim()) {
      return NextResponse.json(
        { success: false, error: "Phone or email is required" },
        { status: 400 }
      );
    }

    // Save as a lead with callback metadata
    if (email?.trim()) {
      await db.lead
        .upsert({
          where: { email_source: { email: email.trim(), source: source ?? "callback" } },
          create: {
            email: email.trim(),
            source: source ?? "callback",
            metadata: {
              name: name.trim(),
              phone: phone?.trim() ?? null,
              callbackRequested: true,
              survivalScore,
              riskLevel,
              runway,
              requestedAt: new Date().toISOString(),
            },
          },
          update: {
            metadata: {
              name: name.trim(),
              phone: phone?.trim() ?? null,
              callbackRequested: true,
              survivalScore,
              riskLevel,
              runway,
              requestedAt: new Date().toISOString(),
            },
          },
        })
        .catch((err) => console.error("Failed to save callback lead:", err));
    }

    // Log for admin visibility
    console.log("[CALLBACK REQUEST]", {
      name: name.trim(),
      phone: phone?.trim(),
      email: email?.trim(),
      source,
      survivalScore,
      riskLevel,
      runway,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/callback-request error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save request" },
      { status: 500 }
    );
  }
}

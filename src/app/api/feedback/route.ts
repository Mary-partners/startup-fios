// ============================================================
// /api/feedback — User feedback collection
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { resolveTenantContext } from "@/lib/auth/tenant";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    let tenantInfo = null;
    if (userId) {
      tenantInfo = await resolveTenantContext(userId);
    }

    const body = await req.json();
    const { type, rating, message } = body;

    // Log feedback (in production, save to DB or send to Slack/email)
    console.log("[USER FEEDBACK]", {
      userId: tenantInfo?.userId ?? "anonymous",
      companyName: tenantInfo?.companyName ?? "unknown",
      type,
      rating,
      message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}

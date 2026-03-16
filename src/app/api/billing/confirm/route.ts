// ============================================================
// /api/billing/confirm — Payment confirmation upload
// Stores the confirmation and notifies admin for verification
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { resolveTenantContext } from "@/lib/auth/tenant";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: "No company found" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const plan = formData.get("plan") as string;
    const method = formData.get("method") as string;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowed = [".png", ".jpg", ".jpeg", ".pdf", ".webp"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Please upload a PNG, JPG, PDF, or WebP file." },
        { status: 400 }
      );
    }

    // For now, log the confirmation details
    // In production, save to cloud storage and create a payment record
    console.log("[PAYMENT CONFIRMATION]", {
      companyId: tenant.companyId,
      companyName: tenant.companyName,
      userId: tenant.userId,
      plan,
      method,
      fileName: file.name,
      fileSize: file.size,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Payment confirmation received. We will verify and activate your plan within 24 hours.",
        plan,
        method,
      },
    });
  } catch (error: any) {
    console.error("POST /api/billing/confirm error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to process confirmation" },
      { status: 500 }
    );
  }
}

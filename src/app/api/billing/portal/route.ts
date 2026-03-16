// ============================================================
// API: Billing Portal — Create Stripe portal session
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { createPortalSession } from "@/lib/billing/stripe";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await db.subscription.findUnique({
      where: { companyId: tenant.companyId },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: "No billing account found. Please subscribe to a plan first." },
        { status: 400 }
      );
    }

    const portalUrl = await createPortalSession(subscription.stripeCustomerId);

    return NextResponse.json({ url: portalUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create portal session";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

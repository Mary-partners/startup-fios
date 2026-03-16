// ============================================================
// POST /api/billing/webhook — Stripe webhook handler
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/billing/stripe";
import { db } from "@/lib/db/client";
import { SubscriptionTier } from "@/types/enums";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// Map Stripe price IDs to tiers
function tierFromPriceId(priceId: string): SubscriptionTier {
  const map: Record<string, SubscriptionTier> = {
    [process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? ""]: SubscriptionTier.STARTER,
    [process.env.STRIPE_STARTER_YEARLY_PRICE_ID ?? ""]: SubscriptionTier.STARTER,
    [process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID ?? ""]: SubscriptionTier.GROWTH,
    [process.env.STRIPE_GROWTH_YEARLY_PRICE_ID ?? ""]: SubscriptionTier.GROWTH,
  };
  return map[priceId] ?? SubscriptionTier.FREE;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const companyId = session.metadata?.companyId;
      if (!companyId) break;

      const subscriptionId = session.subscription as string;
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = sub.items.data[0]?.price.id ?? "";

      await db.subscription.upsert({
        where: { companyId },
        create: {
          companyId,
          tier: tierFromPriceId(priceId),
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
        update: {
          tier: tierFromPriceId(priceId),
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const companyId = sub.metadata?.companyId;
      if (!companyId) break;

      const priceId = sub.items.data[0]?.price.id ?? "";
      const status =
        sub.status === "active"
          ? "ACTIVE"
          : sub.status === "past_due"
          ? "PAST_DUE"
          : sub.status === "canceled"
          ? "CANCELED"
          : "ACTIVE";

      await db.subscription.update({
        where: { companyId },
        data: {
          tier: tierFromPriceId(priceId),
          status,
          stripePriceId: priceId,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const companyId = sub.metadata?.companyId;
      if (!companyId) break;

      await db.subscription.update({
        where: { companyId },
        data: {
          tier: SubscriptionTier.FREE,
          status: "CANCELED",
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

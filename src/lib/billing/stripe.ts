// ============================================================
// Stripe Client & Helpers
// ============================================================

import Stripe from "stripe";

// Lazy-initialized Stripe client.
// We must NOT create the Stripe instance at module load time because
// `new Stripe("")` throws when the API key is empty, which breaks
// `next build` during the static page-collection phase (env vars
// like STRIPE_SECRET_KEY are not available at build time on Vercel).
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Billing operations are unavailable."
      );
    }
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

/**
 * @deprecated Use getStripe() instead. Kept for backward compatibility but
 * will throw at access time (not import time) if the key is missing.
 */
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});

/**
 * Create a Stripe Checkout session for a subscription upgrade.
 */
export async function createCheckoutSession(params: {
  customerId?: string;
  customerEmail: string;
  priceId: string;
  companyId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: params.customerId || undefined,
    customer_email: params.customerId ? undefined : params.customerEmail,
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      companyId: params.companyId,
    },
    subscription_data: {
      metadata: {
        companyId: params.companyId,
      },
    },
  });

  if (!session.url) throw new Error("Failed to create checkout session");
  return session.url;
}

/**
 * Create a Stripe Customer Portal session.
 */
export async function createPortalSession(
  customerId: string,
  returnUrl?: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl ?? process.env.NEXT_PUBLIC_APP_URL + "/app/settings",
  });
  return session.url;
}

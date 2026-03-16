// ============================================================
// Clerk Webhook — Sync Clerk users to database
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db/client";

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: { email_address: string; id: string }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
  type: string;
}

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Verify webhook signature
  const headerPayload = request.headers;
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await request.text();

  let event: ClerkUserEvent;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  // Build display name from Clerk fields
  const displayName = [data.first_name, data.last_name]
    .filter(Boolean)
    .join(" ") || null;

  try {
    switch (type) {
      case "user.created": {
        const email = data.email_addresses[0]?.email_address;
        if (!email) break;

        // Check if a pending user exists with this email (invited via team invite)
        const pendingUser = await db.user.findUnique({ where: { email } });

        if (pendingUser && pendingUser.externalId?.startsWith("pending_")) {
          // Link the Clerk user to the existing pending user
          await db.user.update({
            where: { id: pendingUser.id },
            data: {
              externalId: data.id,
              name: displayName,
              avatarUrl: data.image_url,
            },
          });
        } else if (!pendingUser) {
          // Create new user
          await db.user.create({
            data: {
              externalId: data.id,
              email,
              name: displayName,
              avatarUrl: data.image_url,
            },
          });
        }
        break;
      }

      case "user.updated": {
        const email = data.email_addresses[0]?.email_address;
        await db.user.updateMany({
          where: { externalId: data.id },
          data: {
            email: email ?? undefined,
            name: displayName,
            avatarUrl: data.image_url,
          },
        });
        break;
      }

      case "user.deleted": {
        // Soft delete — keep the record but clear PII
        await db.user.updateMany({
          where: { externalId: data.id },
          data: {
            name: null,
            avatarUrl: null,
          },
        });
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Clerk webhook handler failed for ${type}:`, error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}

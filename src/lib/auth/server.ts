// ============================================================
// Mock Auth Server — Stub for Clerk when disabled
// Returns a demo user ID for Railway deployment without Clerk
// ============================================================

import { db } from "@/lib/db/client";

const DEMO_EXTERNAL_ID = "demo_external_id";

export interface AuthSession {
  userId: string | null;
  sessionId?: string | null;
}

/**
 * Mock auth() function that returns a demo user.
 * In production with Railway, this allows the app to work without Clerk.
 *
 * This function:
 * 1. Tries to find the demo user created by the seed script (externalId: "demo_external_id")
 * 2. Falls back to the first user in the database if demo user doesn't exist
 * 3. Returns null if no users exist (will trigger redirect to /sign-in)
 *
 * Note: The seed script creates the demo user automatically.
 */
export async function auth(): Promise<AuthSession> {
  try {
    // Try to get the demo user first (created by seed script)
    let user = await db.user.findUnique({
      where: { externalId: DEMO_EXTERNAL_ID },
    });

    // If demo user doesn't exist, get the first user
    if (!user) {
      user = await db.user.findFirst({
        orderBy: { createdAt: "asc" },
      });
    }

    if (user) {
      return {
        userId: user.externalId,
        sessionId: null,
      };
    }

    // If no users exist yet, return null (will trigger redirect to /sign-in)
    return {
      userId: null,
      sessionId: null,
    };
  } catch (error) {
    console.error("[auth] Error resolving user:", error);
    return {
      userId: null,
      sessionId: null,
    };
  }
}

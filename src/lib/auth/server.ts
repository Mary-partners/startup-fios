// ============================================================
// Auth Server — Session-based authentication
// ============================================================

import { db } from "@/lib/db/client";
import { getSessionUserId } from "./session";

export interface AuthSession {
  userId: string | null;
  sessionId?: string | null;
}

export async function auth(): Promise<AuthSession> {
  try {
    const dbUserId = await getSessionUserId();
    if (!dbUserId) {
      return { userId: null, sessionId: null };
    }

    // Verify user exists in database
    const user = await db.user.findUnique({
      where: { id: dbUserId },
    });

    if (!user) {
      return { userId: null, sessionId: null };
    }

    return {
      userId: user.externalId || user.id,
      sessionId: null,
    };
  } catch (error) {
    console.error("[auth] Error resolving user:", error);
    return { userId: null, sessionId: null };
  }
}

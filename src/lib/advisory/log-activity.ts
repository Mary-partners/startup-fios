// ============================================================
// Activity Logger - Auto-logs events to the activity feed
// ============================================================

import { db } from "@/lib/db/client";

interface LogActivityParams {
  advisoryCaseId: string;
  type: string; // ActivityType enum value
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  performedById?: string;
}

export async function logActivity(params: LogActivityParams) {
  try {
    await db.activityEvent.create({
      data: {
        advisoryCaseId: params.advisoryCaseId,
        type: params.type as never,
        title: params.title,
        description: params.description ?? null,
        metadata: params.metadata ?? undefined,
        performedById: params.performedById ?? null,
      },
    });
  } catch (error) {
    // Non-blocking - activity logging should never break the main flow
    console.error("[log-activity] Failed to log activity:", error);
  }
}

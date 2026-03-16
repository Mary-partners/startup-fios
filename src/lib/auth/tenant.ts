// ============================================================
// Multi-Tenant Context Helpers
// ============================================================

import { db } from "@/lib/db/client";
import type { Role } from "@/types/enums";

export interface TenantContext {
  userId: string;
  companyId: string;
  role: Role;
  companyName: string;
}

/**
 * Resolve the current tenant context from a user's external auth ID.
 * In MVP, a user may belong to multiple companies — we default to
 * the first active membership or the one specified in cookies/headers.
 */
export async function resolveTenantContext(
  externalUserId: string,
  requestedCompanyId?: string
): Promise<TenantContext | null> {
  const user = await db.user.findUnique({
    where: { externalId: externalUserId },
    include: {
      memberships: {
        include: { company: true },
      },
    },
  });

  if (!user || user.memberships.length === 0) return null;

  // If a specific company was requested, use that membership
  let membership = requestedCompanyId
    ? user.memberships.find((m) => m.companyId === requestedCompanyId)
    : user.memberships[0]; // Default to first

  if (!membership) return null;

  return {
    userId: user.id,
    companyId: membership.companyId,
    role: membership.role as Role,
    companyName: membership.company.name,
  };
}

/**
 * Ensure a database query is scoped to the correct company.
 * Used as a guard in API routes and server actions.
 */
export function scopedWhere(companyId: string) {
  return { companyId };
}

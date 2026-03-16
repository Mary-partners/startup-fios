// ============================================================
// Role-Based Permission System
// ============================================================

import { Role } from "@/types/enums";

// ──────────────────────────────────────────────
// Permission Definitions
// ──────────────────────────────────────────────

export type Permission =
  // Financial data
  | "financials:read"
  | "financials:write"
  | "financials:delete"
  // Health & readiness
  | "health_score:read"
  | "readiness:read"
  | "readiness:write"
  // Reports
  | "reports:read"
  | "reports:create"
  | "reports:delete"
  // Alerts
  | "alerts:read"
  | "alerts:dismiss"
  // Team
  | "team:read"
  | "team:invite"
  | "team:remove"
  | "team:manage_roles"
  // Company settings
  | "company:read"
  | "company:update"
  | "company:delete"
  // Billing
  | "billing:read"
  | "billing:manage"
  // Advisory (internal)
  | "advisory:read_all"
  | "advisory:write_notes"
  | "advisory:manage_tasks"
  | "advisory:manage_cases"
  // Admin
  | "admin:access"
  | "admin:manage_users"
  | "admin:manage_companies";

// ──────────────────────────────────────────────
// Role → Permission Map
// ──────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    "financials:read",
    "financials:write",
    "financials:delete",
    "health_score:read",
    "readiness:read",
    "readiness:write",
    "reports:read",
    "reports:create",
    "reports:delete",
    "alerts:read",
    "alerts:dismiss",
    "team:read",
    "team:invite",
    "team:remove",
    "team:manage_roles",
    "company:read",
    "company:update",
    "company:delete",
    "billing:read",
    "billing:manage",
  ],

  [Role.FINANCE_MANAGER]: [
    "financials:read",
    "financials:write",
    "health_score:read",
    "readiness:read",
    "readiness:write",
    "reports:read",
    "reports:create",
    "alerts:read",
    "alerts:dismiss",
    "team:read",
    "company:read",
    "billing:read",
  ],

  [Role.TEAM_MEMBER]: [
    "financials:read",
    "health_score:read",
    "readiness:read",
    "reports:read",
    "alerts:read",
    "team:read",
    "company:read",
  ],

  [Role.INVESTOR_VIEWER]: [
    "financials:read",
    "health_score:read",
    "reports:read",
    "company:read",
  ],

  [Role.ADVISOR]: [
    "advisory:read_all",
    "advisory:write_notes",
    "advisory:manage_tasks",
    // Also gets scoped read access to assigned companies
    "financials:read",
    "health_score:read",
    "readiness:read",
    "reports:read",
    "alerts:read",
    "company:read",
  ],

  [Role.HEAD_OF_ADVISORY]: [
    "advisory:read_all",
    "advisory:write_notes",
    "advisory:manage_tasks",
    "advisory:manage_cases",
    "financials:read",
    "health_score:read",
    "readiness:read",
    "reports:read",
    "alerts:read",
    "company:read",
    "team:read",
  ],

  [Role.ADMIN]: [
    "admin:access",
    "admin:manage_users",
    "admin:manage_companies",
    "advisory:read_all",
    "advisory:write_notes",
    "advisory:manage_tasks",
    "advisory:manage_cases",
    "financials:read",
    "health_score:read",
    "readiness:read",
    "reports:read",
    "alerts:read",
    "company:read",
    "team:read",
    "billing:read",
  ],
};

// ──────────────────────────────────────────────
// Permission Checking Utilities
// ──────────────────────────────────────────────

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function isAdvisoryRole(role: Role): boolean {
  return (
    role === Role.ADVISOR ||
    role === Role.HEAD_OF_ADVISORY ||
    role === Role.ADMIN
  );
}

export function isAdminRole(role: Role): boolean {
  return role === Role.ADMIN;
}

// ──────────────────────────────────────────────
// Middleware-friendly check
// ──────────────────────────────────────────────

export function requirePermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(
      `Insufficient permissions. Role "${role}" does not have "${permission}".`
    );
  }
}

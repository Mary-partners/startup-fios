// ============================================================
// Shared Enums — mirrors Prisma enums for client-side use
// ============================================================

export enum Role {
  OWNER = "OWNER",
  FINANCE_MANAGER = "FINANCE_MANAGER",
  TEAM_MEMBER = "TEAM_MEMBER",
  INVESTOR_VIEWER = "INVESTOR_VIEWER",
  ADVISOR = "ADVISOR",
  HEAD_OF_ADVISORY = "HEAD_OF_ADVISORY",
  ADMIN = "ADMIN",
}

export enum SubscriptionTier {
  FREE = "FREE",
  STARTER = "STARTER",
  GROWTH = "GROWTH",
  ENTERPRISE = "ENTERPRISE",
}

export enum AlertSeverity {
  CRITICAL = "CRITICAL",
  WARNING = "WARNING",
  INFO = "INFO",
}

export enum AlertType {
  LOW_RUNWAY = "LOW_RUNWAY",
  HIGH_BURN = "HIGH_BURN",
  LOW_MARGIN = "LOW_MARGIN",
  POOR_GROWTH = "POOR_GROWTH",
  HIGH_CONCENTRATION = "HIGH_CONCENTRATION",
  INCOMPLETE_READINESS = "INCOMPLETE_READINESS",
  MISSING_DATA = "MISSING_DATA",
}

export enum RiskLevel {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MODERATE = "MODERATE",
  LOW = "LOW",
  STRONG = "STRONG",
}

export enum ReadinessLevel {
  NOT_READY = "NOT_READY",
  EARLY = "EARLY",
  DEVELOPING = "DEVELOPING",
  STRONG = "STRONG",
  INVESTOR_READY = "INVESTOR_READY",
}

export enum HealthGrade {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  F = "F",
}

export enum ConfidenceFlag {
  FULL = "FULL",
  PARTIAL = "PARTIAL",
  LOW = "LOW",
}

export enum ReportType {
  MONTHLY_SUMMARY = "MONTHLY_SUMMARY",
  BOARD_PACK = "BOARD_PACK",
  INVESTOR_UPDATE = "INVESTOR_UPDATE",
  HEALTH_ASSESSMENT = "HEALTH_ASSESSMENT",
  CUSTOM = "CUSTOM",
}

export enum AdvisoryCasePriority {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  STABLE = "STABLE",
}

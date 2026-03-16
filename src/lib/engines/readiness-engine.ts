// ============================================================
// Investor Readiness Assessment Engine
// Question-based assessment with category scoring.
// ============================================================

import type {
  ReadinessQuestion,
  ReadinessAnswer,
  ReadinessCategoryScore,
  ReadinessResult,
  ReadinessRecommendation,
  ReadinessCategory,
} from "@/types/domain";
import { ReadinessLevel } from "@/types/enums";

// ──────────────────────────────────────────────
// Assessment Questions
// ──────────────────────────────────────────────

export const READINESS_QUESTIONS: ReadinessQuestion[] = [
  // REPORTING (3 questions)
  {
    id: "rep_01",
    category: "reporting",
    text: "Do you close your books monthly?",
    description:
      "Regular monthly close ensures financial data is current and reliable.",
    weight: 1.2,
  },
  {
    id: "rep_02",
    category: "reporting",
    text: "Can you produce GAAP/IFRS-compliant financial statements?",
    description:
      "Investors expect financial statements that follow recognized accounting standards.",
    weight: 1.0,
  },
  {
    id: "rep_03",
    category: "reporting",
    text: "Do you track and report key SaaS/business metrics monthly?",
    description:
      "MRR, churn, CAC, LTV and other metrics should be tracked consistently.",
    weight: 0.8,
  },

  // CONTROLS (3 questions)
  {
    id: "ctl_01",
    category: "controls",
    text: "Do you have segregation of duties for financial transactions?",
    description:
      "No single person should authorize, record, and reconcile transactions.",
    weight: 1.0,
  },
  {
    id: "ctl_02",
    category: "controls",
    text: "Do you reconcile bank accounts at least monthly?",
    description: "Regular reconciliation catches errors and prevents fraud.",
    weight: 1.0,
  },
  {
    id: "ctl_03",
    category: "controls",
    text: "Are expense approvals and vendor payments properly documented?",
    description: "Clear audit trail for all outgoing payments.",
    weight: 0.8,
  },

  // CAP TABLE (2 questions)
  {
    id: "cap_01",
    category: "cap_table",
    text: "Is your cap table fully up to date and managed digitally?",
    description:
      "Cap table should accurately reflect all equity, options, SAFEs, and convertible notes.",
    weight: 1.2,
  },
  {
    id: "cap_02",
    category: "cap_table",
    text: "Are all equity agreements, vesting schedules, and SAFEs documented?",
    description:
      "Investors will want to see all equity-related legal documents during diligence.",
    weight: 1.0,
  },

  // KPI CLARITY (3 questions)
  {
    id: "kpi_01",
    category: "kpi_clarity",
    text: "Have you defined and documented your core KPIs?",
    description:
      "Clear definition of 5-8 KPIs that matter most for your business model.",
    weight: 1.0,
  },
  {
    id: "kpi_02",
    category: "kpi_clarity",
    text: "Can you explain your unit economics clearly?",
    description: "CAC, LTV, payback period, and contribution margin per customer.",
    weight: 1.2,
  },
  {
    id: "kpi_03",
    category: "kpi_clarity",
    text: "Do you have a dashboard or reporting tool for real-time metrics?",
    description: "Investors value founders who are data-driven and metrics-aware.",
    weight: 0.8,
  },

  // GOVERNANCE (2 questions)
  {
    id: "gov_01",
    category: "governance",
    text: "Do you hold regular board or advisory meetings?",
    description:
      "Structured governance shows maturity and fiduciary responsibility.",
    weight: 1.0,
  },
  {
    id: "gov_02",
    category: "governance",
    text: "Do you have board-ready financial and operational reporting?",
    description: "Board packs with financials, KPIs, updates, and risks.",
    weight: 1.0,
  },

  // FORECASTING (2 questions)
  {
    id: "fcst_01",
    category: "forecasting",
    text: "Do you maintain a 12-24 month financial forecast?",
    description:
      "Forward-looking projections with revenue, expenses, and cash flow.",
    weight: 1.2,
  },
  {
    id: "fcst_02",
    category: "forecasting",
    text: "Do you regularly compare actuals vs. forecast and analyze variances?",
    description:
      "Budget vs. actual analysis shows financial discipline and learning.",
    weight: 1.0,
  },

  // DUE DILIGENCE (3 questions)
  {
    id: "dd_01",
    category: "due_diligence",
    text: "Are all corporate documents organized and accessible?",
    description:
      "Articles of incorporation, bylaws, minutes, contracts, IP assignments.",
    weight: 1.0,
  },
  {
    id: "dd_02",
    category: "due_diligence",
    text: "Are customer contracts, IP assignments, and key agreements documented?",
    description:
      "Material contracts and IP ownership must be clear and accessible.",
    weight: 1.0,
  },
  {
    id: "dd_03",
    category: "due_diligence",
    text: "Could you produce a data room within 2 weeks if needed?",
    description:
      "Speed of data room assembly signals readiness and organizational maturity.",
    weight: 0.8,
  },
];

// ──────────────────────────────────────────────
// Category Score Calculator
// ──────────────────────────────────────────────

const ALL_CATEGORIES: ReadinessCategory[] = [
  "reporting",
  "controls",
  "cap_table",
  "kpi_clarity",
  "governance",
  "forecasting",
  "due_diligence",
];

function calculateCategoryScore(
  category: ReadinessCategory,
  answers: ReadinessAnswer[]
): ReadinessCategoryScore {
  const categoryQuestions = READINESS_QUESTIONS.filter(
    (q) => q.category === category
  );
  const categoryAnswers = answers.filter((a) => a.category === category);

  const maxPossible = categoryQuestions.reduce(
    (sum, q) => sum + q.weight * 5,
    0
  );

  const actualScore = categoryAnswers.reduce((sum, a) => {
    const question = categoryQuestions.find((q) => q.id === a.questionId);
    return sum + a.answer * (question?.weight ?? 1);
  }, 0);

  const score = maxPossible > 0 ? (actualScore / maxPossible) * 100 : 0;

  return {
    category,
    score: Math.round(score * 100) / 100,
    maxPossible,
    questionsAnswered: categoryAnswers.length,
    totalQuestions: categoryQuestions.length,
  };
}

// ──────────────────────────────────────────────
// Readiness Level from Score
// ──────────────────────────────────────────────

function readinessLevelFromScore(score: number): ReadinessLevel {
  if (score >= 85) return ReadinessLevel.INVESTOR_READY;
  if (score >= 70) return ReadinessLevel.STRONG;
  if (score >= 50) return ReadinessLevel.DEVELOPING;
  if (score >= 30) return ReadinessLevel.EARLY;
  return ReadinessLevel.NOT_READY;
}

// ──────────────────────────────────────────────
// Recommendation Generator
// ──────────────────────────────────────────────

const CATEGORY_LABELS: Record<ReadinessCategory, string> = {
  reporting: "Financial Reporting",
  controls: "Internal Controls",
  cap_table: "Cap Table Management",
  kpi_clarity: "KPI Clarity",
  governance: "Corporate Governance",
  forecasting: "Financial Forecasting",
  due_diligence: "Due Diligence Readiness",
};

const CATEGORY_RECOMMENDATIONS: Record<ReadinessCategory, string> = {
  reporting:
    "Implement a monthly close process and produce standard financial statements. Consider engaging a fractional CFO or controller.",
  controls:
    "Establish basic segregation of duties, implement an approval workflow for expenses, and ensure regular bank reconciliation.",
  cap_table:
    "Clean up your cap table using a platform like Carta or Pulley. Ensure all SAFEs, options, and equity documents are current.",
  kpi_clarity:
    "Define your 5-8 core KPIs, calculate unit economics, and set up a metrics dashboard for real-time tracking.",
  governance:
    "Establish a regular board or advisory meeting cadence and create a standard board pack template.",
  forecasting:
    "Build a 12-24 month financial model with revenue, expense, and cash flow projections. Compare actuals monthly.",
  due_diligence:
    "Organize corporate documents into a virtual data room structure. Ensure IP assignments and key contracts are accessible.",
};

function generateRecommendations(
  categoryScores: Record<ReadinessCategory, ReadinessCategoryScore>
): ReadinessRecommendation[] {
  const recs: ReadinessRecommendation[] = [];

  for (const cat of ALL_CATEGORIES) {
    const cs = categoryScores[cat];
    if (cs.score < 70) {
      recs.push({
        category: cat,
        priority: cs.score < 40 ? "high" : cs.score < 55 ? "medium" : "low",
        title: `Improve ${CATEGORY_LABELS[cat]}`,
        description: CATEGORY_RECOMMENDATIONS[cat],
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs;
}

// ──────────────────────────────────────────────
// Category Weights for Overall Score
// ──────────────────────────────────────────────

const CATEGORY_WEIGHTS: Record<ReadinessCategory, number> = {
  reporting: 0.18,
  controls: 0.14,
  cap_table: 0.14,
  kpi_clarity: 0.16,
  governance: 0.12,
  forecasting: 0.14,
  due_diligence: 0.12,
};

// ──────────────────────────────────────────────
// Main Engine
// ──────────────────────────────────────────────

export function calculateReadinessScore(
  answers: ReadinessAnswer[]
): ReadinessResult {
  const categoryScores = {} as Record<ReadinessCategory, ReadinessCategoryScore>;

  for (const cat of ALL_CATEGORIES) {
    categoryScores[cat] = calculateCategoryScore(cat, answers);
  }

  // Weighted overall score
  let overallScore = 0;
  for (const cat of ALL_CATEGORIES) {
    overallScore += categoryScores[cat].score * CATEGORY_WEIGHTS[cat];
  }
  overallScore = Math.round(overallScore * 100) / 100;

  return {
    categoryScores,
    overallScore,
    readinessLevel: readinessLevelFromScore(overallScore),
    recommendations: generateRecommendations(categoryScores),
  };
}

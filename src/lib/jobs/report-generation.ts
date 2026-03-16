// ============================================================
// Background Job: Report Generation
// Generates different report types using deterministic metrics + AI
// ============================================================

import { db } from "@/lib/db/client";
import { on } from "./inngest";
import { calcNetBurn, calcRunway, calcRevenueGrowthRate, calcGrossMargin } from "@/lib/engines/metrics-engine";
import { calculateHealthScore } from "@/lib/engines/health-engine";
import { aiCompletion } from "@/lib/ai/client";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { HealthScoreInput } from "@/types/domain";

on("report/generate", async (data) => {
  const { reportId, companyId, reportType } = data as {
    reportId: string;
    companyId: string;
    reportType: string;
  };

  try {
    // Fetch financial data
    const periods = await db.financialPeriod.findMany({
      where: { companyId },
      include: {
        cashBalance: true,
        cogsRecord: true,
        customerConcentration: true,
        revenueRecords: true,
        expenseRecords: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 6,
    });

    if (periods.length === 0) {
      await db.report.update({
        where: { id: reportId },
        data: { status: "FAILED" },
      });
      return;
    }

    const current = periods[0];
    const previous = periods[1];

    // Calculate key metrics
    const revenue = Number(current.totalRevenue ?? 0);
    const expenses = Number(current.totalExpenses ?? 0);
    const cash = Number(current.cashBalance?.closingBalance ?? 0);
    const cogs = Number(current.totalCogs ?? 0);
    const prevRevenue = previous ? Number(previous.totalRevenue ?? 0) : 0;
    const concentration = Number(
      current.customerConcentration?.largestCustomerShare ?? 0
    );

    const netBurn = calcNetBurn(expenses, revenue);
    const runway = calcRunway(cash, netBurn);
    const growthRate = calcRevenueGrowthRate(revenue, prevRevenue);
    const grossMargin = calcGrossMargin(revenue, cogs);

    // Build report content based on type
    let reportContent = "";

    switch (reportType) {
      case "MONTHLY_SUMMARY": {
        const metricsSection = [
          `## Monthly Financial Summary`,
          `**Period:** ${current.month}/${current.year}`,
          ``,
          `### Key Metrics`,
          `- **Revenue:** $${revenue.toLocaleString()}`,
          `- **Expenses:** $${expenses.toLocaleString()}`,
          `- **Net Income:** $${(revenue - expenses).toLocaleString()}`,
          `- **Cash Balance:** $${cash.toLocaleString()}`,
          `- **Gross Margin:** ${((grossMargin ?? 0) * 100).toFixed(1)}%`,
          `- **Revenue Growth:** ${((growthRate ?? 0) * 100).toFixed(1)}%`,
          `- **Net Burn:** $${netBurn.toLocaleString()}/mo`,
          `- **Runway:** ${runway === Infinity ? "Profitable" : `${runway.toFixed(1)} months`}`,
          ``,
        ].join("\n");

        const commentary = await aiCompletion({
          systemPrompt: SYSTEM_PROMPT,
          userPrompt: `You are generating a monthly summary report. Here are the metrics:\n${metricsSection}\n\nProvide a 2-3 paragraph executive summary covering: performance highlights, concerns, and recommended actions.`,
        });

        reportContent = metricsSection + `### Executive Summary\n\n${commentary}`;
        break;
      }

      case "BOARD_PACK": {
        const healthInput: HealthScoreInput = {
          cashBalance: cash,
          monthlyRevenue: revenue,
          previousMonthRevenue: prevRevenue,
          monthlyExpenses: expenses,
          cogs,
          largestCustomerShare: concentration,
          hasMonthlyClose: false,
          hasBoardReporting: false,
          hasAuditedFinancials: false,
        };
        const healthScore = calculateHealthScore(healthInput);

        const metricsJson = JSON.stringify({
          revenue,
          expenses,
          cash,
          runway: runway === Infinity ? 999 : runway,
          netBurn,
          growthRate,
          grossMargin,
          healthGrade: healthScore.grade,
          healthScore: healthScore.overallScore,
        }, null, 2);

        const boardSummary = await aiCompletion({
          systemPrompt: SYSTEM_PROMPT,
          userPrompt: `Write a board-ready executive summary for the period ${current.month}/${current.year}.\n\nFINANCIAL DATA:\n${metricsJson}\n\nThe summary should be: concise (2-3 paragraphs), highlight key wins and risks, include forward-looking recommendations.`,
        });

        const trendRows = [...periods].reverse().map((p) =>
          `| ${p.month}/${p.year} | $${Number(p.totalRevenue ?? 0).toLocaleString()} | $${Number(p.totalExpenses ?? 0).toLocaleString()} | $${Number(p.cashBalance?.closingBalance ?? 0).toLocaleString()} | $${(Number(p.totalRevenue ?? 0) - Number(p.totalExpenses ?? 0)).toLocaleString()} |`
        );

        reportContent = [
          `# Board Pack — ${current.month}/${current.year}`,
          ``,
          `## Executive Summary`,
          boardSummary,
          ``,
          `## Financial Overview`,
          `| Metric | Value |`,
          `|--------|-------|`,
          `| Revenue | $${revenue.toLocaleString()} |`,
          `| Expenses | $${expenses.toLocaleString()} |`,
          `| Net Income | $${(revenue - expenses).toLocaleString()} |`,
          `| Cash Balance | $${cash.toLocaleString()} |`,
          `| Gross Margin | ${((grossMargin ?? 0) * 100).toFixed(1)}% |`,
          `| Net Burn | $${netBurn.toLocaleString()}/mo |`,
          `| Runway | ${runway === Infinity ? "Profitable" : `${runway.toFixed(1)} months`} |`,
          `| Revenue Growth | ${((growthRate ?? 0) * 100).toFixed(1)}% |`,
          ``,
          `## Health Score: ${healthScore.overallScore}/100 (${healthScore.grade})`,
          `- Liquidity: ${healthScore.subScores.liquidityScore}/100`,
          `- Growth: ${healthScore.subScores.growthScore}/100`,
          `- Margin: ${healthScore.subScores.marginScore}/100`,
          `- Burn Discipline: ${healthScore.subScores.burnDisciplineScore}/100`,
          `- Concentration: ${healthScore.subScores.concentrationScore}/100`,
          `- Governance: ${healthScore.subScores.governanceScore}/100`,
          ``,
          `## Historical Trend (Last ${periods.length} Months)`,
          `| Period | Revenue | Expenses | Cash | Net Income |`,
          `|--------|---------|----------|------|------------|`,
          ...trendRows,
        ].join("\n");
        break;
      }

      case "INVESTOR_UPDATE": {
        const investorNarrative = await aiCompletion({
          systemPrompt: SYSTEM_PROMPT,
          userPrompt: `Generate an investor update email body for a startup with these metrics:
- Monthly Revenue: $${revenue.toLocaleString()}
- Revenue Growth: ${((growthRate ?? 0) * 100).toFixed(1)}%
- Net Burn: $${netBurn.toLocaleString()}/mo
- Cash Balance: $${cash.toLocaleString()}
- Runway: ${runway === Infinity ? "Profitable" : `${runway.toFixed(1)} months`}
- Gross Margin: ${((grossMargin ?? 0) * 100).toFixed(1)}%

Structure it as: 1) TL;DR, 2) Key Metrics, 3) Product/Business Highlights (suggest 2-3 placeholders), 4) Challenges, 5) Asks from investors. Keep it concise and founder-friendly.`,
        });

        reportContent = [
          `# Investor Update — ${current.month}/${current.year}`,
          ``,
          investorNarrative,
        ].join("\n");
        break;
      }

      case "HEALTH_ASSESSMENT": {
        const healthInput2: HealthScoreInput = {
          cashBalance: cash,
          monthlyRevenue: revenue,
          previousMonthRevenue: prevRevenue,
          monthlyExpenses: expenses,
          cogs,
          largestCustomerShare: concentration,
          hasMonthlyClose: false,
          hasBoardReporting: false,
          hasAuditedFinancials: false,
        };
        const health2 = calculateHealthScore(healthInput2);

        const healthNarrative = await aiCompletion({
          systemPrompt: SYSTEM_PROMPT,
          userPrompt: `Provide a detailed health assessment for a startup with:
- Overall Health Score: ${health2.overallScore}/100 (Grade: ${health2.grade})
- Liquidity Score: ${health2.subScores.liquidityScore}/100
- Growth Score: ${health2.subScores.growthScore}/100
- Margin Score: ${health2.subScores.marginScore}/100
- Burn Discipline: ${health2.subScores.burnDisciplineScore}/100
- Concentration Risk Score: ${health2.subScores.concentrationScore}/100
- Governance Score: ${health2.subScores.governanceScore}/100

For each category, provide: assessment, what's working, what needs improvement, and 1-2 specific action items. End with a prioritized improvement roadmap.`,
        });

        reportContent = [
          `# Financial Health Assessment — ${current.month}/${current.year}`,
          ``,
          `**Overall Score: ${health2.overallScore}/100 (${health2.grade})**`,
          ``,
          healthNarrative,
        ].join("\n");
        break;
      }

      default:
        reportContent = "Unknown report type.";
    }

    // Update report with generated content
    await db.report.update({
      where: { id: reportId },
      data: {
        status: "COMPLETE",
        content: reportContent,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`Report generation failed for ${reportId}:`, error);
    await db.report.update({
      where: { id: reportId },
      data: { status: "FAILED" },
    });
  }
});

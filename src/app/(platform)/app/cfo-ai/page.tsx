// ============================================================
// CFO AI - Smart financial assistant chat + automation requests
// ============================================================

"use client";

import { useState, useRef, useEffect } from "react";
import {
  Brain,
  Send,
  Sparkles,
  TrendingUp,
  Calculator,
  FileBarChart,
  Target,
  Lightbulb,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// ── Suggested prompts for quick start ──
const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "What's my burn rate trend?", category: "analytics" },
  { icon: Calculator, label: "How long is my runway?", category: "metrics" },
  { icon: FileBarChart, label: "Summarize my financials", category: "reports" },
  { icon: Target, label: "Am I investor-ready?", category: "readiness" },
  { icon: Lightbulb, label: "How can I reduce costs?", category: "advice" },
  { icon: Sparkles, label: "What should I focus on?", category: "strategy" },
];

// ── Automation categories ──
const AUTOMATION_TABS = [
  {
    id: "finance",
    label: "Finance",
    icon: Calculator,
    items: [
      { title: "Monthly financial reports", description: "Auto-generate P&L, cash flow, and balance sheet reports every month" },
      { title: "Revenue forecasting", description: "AI-powered revenue predictions based on your historical data" },
      { title: "Expense categorization", description: "Automatically classify and track expenses by category" },
      { title: "Investor updates", description: "Generate investor-ready financial summaries on demand" },
      { title: "Tax preparation", description: "Organize financials for quarterly/annual tax filing" },
      { title: "Budget variance alerts", description: "Get notified when spending exceeds budgeted amounts" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: Zap,
    items: [
      { title: "Cash flow monitoring", description: "Real-time tracking with alerts for low cash balance" },
      { title: "Vendor payment reminders", description: "Automated reminders for upcoming payments and invoices" },
      { title: "Payroll tracking", description: "Monitor payroll costs and headcount growth trends" },
      { title: "KPI dashboards", description: "Custom dashboards for your key performance indicators" },
      { title: "Compliance tracking", description: "Stay on top of regulatory requirements and deadlines" },
      { title: "Board meeting prep", description: "Auto-generate board decks with latest financial data" },
    ],
  },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Smart response engine (offline-first, no API key needed)
function generateResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("burn") || q.includes("burn rate")) {
    return "**Burn Rate Analysis**\n\nYour net burn rate measures how quickly you're consuming cash reserves each month. It's calculated as total monthly expenses minus total monthly revenue.\n\n**Framework for Optimization:**\n\n1. **Categorize expenses into three tiers:**\n   - Mission-critical (product, core team, infrastructure)\n   - Growth-oriented (marketing, sales, new hires)\n   - Discretionary (office perks, non-essential tools)\n\n2. **Benchmark against stage:**\n   - Pre-seed: Keep burn under $15K/month\n   - Seed: $25K-$75K/month is typical\n   - Series A: $100K-$250K/month with clear ROI tracking\n\n3. **Quick wins to reduce burn:**\n   - Audit your SaaS subscriptions (most startups have 3-5 unused tools)\n   - Renegotiate vendor contracts annually\n   - Evaluate whether each open role is critical for the next 6 months\n\nNavigate to your Financials page to see your expense breakdown by category.";
  }
  if (q.includes("runway")) {
    return "**Runway Calculation**\n\nRunway = Cash Balance / Net Monthly Burn\n\nThis tells you exactly how many months you can operate before running out of cash at your current spending rate.\n\n**Benchmarks by fundraising stage:**\n- Pre-fundraising: Maintain 18+ months to negotiate from strength\n- Actively raising: Start the process with at least 9 months remaining\n- Post-close: Aim for 18-24 months to reach your next milestone\n\n**Strategies to extend runway:**\n\n1. **Revenue acceleration.** Even small revenue increases have an outsized impact on runway. A $5K/month increase on a $50K burn extends runway by months.\n\n2. **Expense phasing.** Delay non-urgent hires and capital expenditures. Stagger team growth against revenue milestones.\n\n3. **Working capital optimization.** Shorten receivable cycles, negotiate longer payment terms with vendors.\n\n4. **Bridge options.** If runway drops below 6 months, consider convertible notes, revenue-based financing, or strategic partnerships.\n\nYour current runway is displayed on the Dashboard with monthly trend data.";
  }
  if (q.includes("investor") || q.includes("ready")) {
    return "**Investor Readiness Framework**\n\nInvestors evaluate startups across five core dimensions. Weakness in any single area can delay or prevent a raise.\n\n1. **Financial Health (25% weight)**\n   Clean, auditable books. Positive unit economics or a clear path to them. Monthly close process completed within 5 business days.\n\n2. **Growth Trajectory (25% weight)**\n   Consistent month-over-month revenue growth. For Series A, investors typically look for 15-20% MoM or $1M+ ARR.\n\n3. **Market Position (20% weight)**\n   Clear TAM/SAM/SOM analysis. Defensible competitive advantages. Evidence of product-market fit through retention data.\n\n4. **Team Strength (15% weight)**\n   Key functional leads in place (product, engineering, commercial). Domain expertise relevant to the market.\n\n5. **Documentation (15% weight)**\n   Data room prepared with: financial model, cap table, pitch deck, customer references, legal documents.\n\nRun the Investor Readiness Assessment from the sidebar for a detailed score across all five dimensions with specific improvement recommendations.";
  }
  if (q.includes("cost") || q.includes("reduce") || q.includes("save")) {
    return "**Cost Optimization Playbook**\n\nThe goal is not to cut costs blindly but to improve your burn multiple (net burn / net new ARR). A burn multiple below 2x is considered efficient.\n\n**Immediate actions (Week 1):**\n- Export your bank statements and tag every transaction\n- Cancel unused software subscriptions\n- Review contractor agreements for scope creep\n\n**Short-term improvements (Month 1):**\n- Consolidate overlapping tools (e.g., one project management tool instead of three)\n- Renegotiate annual contracts. Most vendors will offer 15-30% discounts to retain customers\n- Switch to usage-based pricing for infrastructure where possible\n\n**Structural changes (Quarter 1):**\n- Evaluate build vs. buy for non-core functions\n- Consider remote-first or hybrid to reduce office costs\n- Implement spending approval thresholds by role\n\n**What not to cut:**\n- Core product development velocity\n- Customer-facing roles that drive retention\n- Compliance and security\n\nUpload your financial data in the Financials section and I can analyze your specific expense breakdown.";
  }
  if (q.includes("summarize") || q.includes("summary") || q.includes("overview")) {
    return "**Financial Summary Framework**\n\nA comprehensive financial summary covers six key areas:\n\n1. **Revenue Performance**\n   Total revenue, growth rate (MoM and YoY), revenue concentration, recurring vs. one-time split.\n\n2. **Expense Structure**\n   Total expenses by category, fixed vs. variable cost ratio, cost per employee, COGS breakdown.\n\n3. **Cash Position**\n   Current cash balance, monthly net cash flow, runway at current burn, cash conversion cycle.\n\n4. **Profitability Metrics**\n   Gross margin, contribution margin, EBITDA margin, path to breakeven.\n\n5. **Efficiency Ratios**\n   Burn multiple, CAC payback period, LTV/CAC ratio, revenue per employee.\n\n6. **Risk Indicators**\n   Customer concentration, vendor dependencies, upcoming liabilities, covenant compliance.\n\nNavigate to your Dashboard for real-time metrics, or use the Reports section to generate a board-ready financial summary with AI narrative.";
  }
  if (q.includes("focus") || q.includes("priority") || q.includes("what should")) {
    return "**Strategic Priorities for Growth-Stage Startups**\n\nBased on patterns we see across high-performing African startups, here are the five areas that matter most:\n\n1. **Unit Economics First**\n   Before scaling, prove that each customer is profitable on a fully-loaded basis. Calculate your contribution margin per customer, not just gross margin.\n\n2. **Cash Discipline**\n   In African markets, fundraising cycles are longer and capital is more expensive. Maintain at least 15 months of runway at all times. Build cash reserves during good months.\n\n3. **Revenue Quality Over Quantity**\n   Recurring revenue is valued at 8-12x by investors. One-time project revenue at 1-2x. Focus on building predictable, repeatable revenue streams.\n\n4. **Customer Retention as a Growth Lever**\n   Reducing churn by 5% can increase profitability by 25-95%. Track net revenue retention. World-class is 120%+.\n\n5. **Financial Infrastructure**\n   Monthly close process, clean books, documented assumptions. This is what separates fundable companies from good ideas.\n\nYour Health Score and Survival Score on the dashboard show exactly where you stand on each of these dimensions.";
  }

  return "I can help you with detailed financial analysis across several areas:\n\n**Available Analysis:**\n- Burn rate trends and optimization strategies\n- Runway calculations and extension planning\n- Investor readiness assessment across 5 dimensions\n- Cost structure analysis and reduction opportunities\n- Revenue growth benchmarking\n- Financial summary and reporting\n\n**How to get started:**\nAsk me a specific question about your finances, or try one of the suggested prompts above. The more financial data you have in the system, the more detailed my analysis will be.\n\nYou can also check your Dashboard for real-time metrics or run the Survival Predictor for an instant health check.";
}

export default function CFOAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your CFO AI assistant. I can help you understand your financials, plan your runway, assess investor readiness, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("finance");
  const [requestedItems, setRequestedItems] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = generateResponse(text);
      const aiMessage: Message = { role: "assistant", content: response, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleRequestAutomation = (title: string) => {
    setRequestedItems((prev) => new Set(prev).add(title));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Brain className="h-7 w-7 text-violet-600" />
          CFO AI
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your intelligent financial assistant. Ask anything about your finances
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Chat Section */}
        <div className="lg:col-span-3 flex flex-col rounded-xl border bg-white shadow-sm" style={{ height: "600px" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                      <span className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider">CFO AI</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Try asking</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={prompt.label}
                      onClick={() => sendMessage(prompt.label)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <Icon className="h-3 w-3" />
                      {prompt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your finances..."
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Automation Requests Section */}
        <div className="lg:col-span-2 rounded-xl border bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Automate What Matters
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Tell us what you want to automate, and we&apos;ll get back to you
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {AUTOMATION_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Automation Items */}
          <div className="p-4 space-y-3 max-h-[460px] overflow-y-auto">
            {AUTOMATION_TABS.find((t) => t.id === activeTab)?.items.map((item) => {
              const isRequested = requestedItems.has(item.title);
              return (
                <div
                  key={item.title}
                  className={`rounded-lg border p-3 transition-colors ${
                    isRequested ? "border-green-200 bg-green-50" : "border-slate-150 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-900">{item.title}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                    </div>
                    {isRequested ? (
                      <div className="flex items-center gap-1 shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Requested
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRequestAutomation(item.title)}
                        className="shrink-0 flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Request
                        <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {requestedItems.size > 0 && (
            <div className="border-t border-slate-100 p-4">
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <p className="text-xs text-blue-700">
                  <strong>{requestedItems.size}</strong> automation{requestedItems.size !== 1 ? "s" : ""} requested. Our team will review and get back to you within 48 hours
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

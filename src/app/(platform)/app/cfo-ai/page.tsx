// ============================================================
// CFO AI — Smart financial assistant chat + automation requests
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

// ── Smart response engine (offline-first, no API key needed) ──
function generateResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("burn") || q.includes("burn rate")) {
    return "Based on your financial data, I can analyze your burn rate trends. Your burn rate is calculated as total monthly expenses minus revenue. To get a detailed analysis, make sure your financial data is up to date in the Financials section.\n\nKey tips to reduce burn:\n- Review your top 3 expense categories\n- Negotiate vendor contracts\n- Consider which hires are critical vs. nice-to-have";
  }
  if (q.includes("runway")) {
    return "Your runway is calculated as: Cash Balance / Net Monthly Burn. I recommend maintaining at least 18 months of runway before approaching investors.\n\nTo extend runway:\n- Increase revenue (even small amounts help)\n- Reduce non-essential expenses\n- Consider bridge financing if runway drops below 6 months";
  }
  if (q.includes("investor") || q.includes("ready")) {
    return "Investor readiness is assessed across 5 pillars:\n\n1. **Financial Health** — Clean books, positive unit economics\n2. **Growth Trajectory** — Month-over-month revenue growth\n3. **Market Position** — TAM/SAM/SOM clarity\n4. **Team Strength** — Key hires and expertise\n5. **Documentation** — Data room, pitch deck, financial model\n\nCheck your Investor Readiness score in the platform for a detailed breakdown.";
  }
  if (q.includes("cost") || q.includes("reduce") || q.includes("save")) {
    return "Here are proven cost reduction strategies for startups:\n\n1. **Audit subscriptions** — Cancel unused SaaS tools\n2. **Renegotiate contracts** — Vendors often offer startup discounts\n3. **Remote-first** — Save on office space\n4. **Automate** — Replace manual processes with tools\n5. **Outsource strategically** — Contractors for non-core functions\n\nI can analyze your expense breakdown once your financial data is imported.";
  }
  if (q.includes("summarize") || q.includes("summary") || q.includes("overview")) {
    return "I can provide a comprehensive financial summary including:\n\n- Revenue trends and growth rate\n- Expense breakdown by category\n- Cash position and runway\n- Gross margin analysis\n- Key risk indicators\n\nVisit your Dashboard for the latest metrics, or go to Reports to generate a detailed financial summary.";
  }
  if (q.includes("focus") || q.includes("priority") || q.includes("what should")) {
    return "For African startups, I recommend focusing on:\n\n1. **Unit Economics** — Prove each customer is profitable\n2. **Cash Management** — Cash is king in emerging markets\n3. **Revenue Growth** — Even 5-10% MoM matters\n4. **Customer Retention** — Lower churn = better fundamentals\n5. **Documentation** — Keep books clean for investors\n\nYour Health Score and Survival Score on the dashboard give you a quick picture of where to prioritize.";
  }

  return "Great question! I'm analyzing your financial data to provide the best answer.\n\nIn the meantime, here are some things I can help with:\n- Financial health analysis and metrics\n- Runway and burn rate calculations\n- Investor readiness assessment\n- Cost optimization strategies\n- Growth planning and forecasting\n\nTry asking me about any of these topics, or check your Dashboard for real-time insights.";
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
          Your intelligent financial assistant — ask anything about your finances
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
              Tell us what you want to automate — we&apos;ll get back to you
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
                  <strong>{requestedItems.size}</strong> automation{requestedItems.size !== 1 ? "s" : ""} requested — our team will review and get back to you within 48 hours
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

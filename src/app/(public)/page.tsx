"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Shield,
  Lock,
  Eye,
  Server,
  Activity,
  Heart,
  Target,
  UserPlus,
  BarChart3,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Zap,
  Brain,
  FileText,
  Bell,
  LineChart,
  DollarSign,
  Users,
  Clock,
  Gauge,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Star,
  Layers,
  GitBranch,
  Award,
  CircleDot,
  Cpu,
  KeyRound,
  DatabaseZap,
  ShieldCheck,
  Ban,
  Scale,
  Check,
  Sparkles,
  ChevronDown,
  Globe,
  Building2,
  Rocket,
  PieChart,
  Wallet,
  ArrowUpRight,
} from "lucide-react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen overflow-hidden">
      {/* ================================================================ */}
      {/* HERO - Full-width, immersive                                      */}
      {/* ================================================================ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-950 text-white wave-divider">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/80 to-violet-950/60" />
          <div className="glow-orb w-[600px] h-[600px] bg-blue-600/20 -top-40 -right-40" />
          <div className="glow-orb w-[500px] h-[500px] bg-violet-600/15 bottom-0 left-1/4" style={{ animationDelay: "2s" }} />
          <div className="glow-orb w-[400px] h-[400px] bg-emerald-500/10 top-1/3 right-1/4" style={{ animationDelay: "4s" }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative w-full px-6 py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: Copy */}
              <div className="stagger-children">
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-medium text-blue-300">
                  <Sparkles className="h-4 w-4" />
                  Trusted by 50+ Companies Across Africa & Beyond
                </p>

                <h1 className="mb-8 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                  <span className="block">Know Your</span>
                  <span className="block gradient-text">Startup&apos;s Financial</span>
                  <span className="block">Health Score</span>
                </h1>

                <p className="mb-10 text-xl leading-relaxed text-slate-300 max-w-xl">
                  Real-time survival prediction, investor readiness scoring, and
                  CFO-grade financial intelligence, built for founders who move fast
                  and need answers, not spreadsheets.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/sign-up"
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-600/25 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02]"
                  >
                    Get Started Free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/survival-predictor"
                    className="group inline-flex items-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-emerald-400/50 hover:bg-emerald-500/10"
                  >
                    <Activity className="h-5 w-5 text-emerald-400" />
                    Try Survival Predictor
                  </Link>
                </div>

                {/* Trust signals */}
                <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> No credit card required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-blue-400" /> Bank-level encryption
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-violet-400" /> Setup in 5 minutes
                  </span>
                </div>
              </div>

              {/* Right: Stats Dashboard Preview */}
              <div className="hidden lg:block relative">
                <div className="relative animate-fade-in" style={{ animationDelay: "0.4s" }}>
                  {/* Mock Dashboard Card */}
                  <div className="glass-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold">Financial Health Overview</h3>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">LIVE</span>
                    </div>

                    {/* Health Score Ring */}
                    <div className="flex items-center gap-8 mb-8">
                      <div className="relative flex h-32 w-32 items-center justify-center">
                        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="53" />
                          <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="50%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-3xl font-extrabold">82</span>
                          <span className="text-xs text-slate-400">Score</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span className="text-sm text-slate-300">Cash Flow: Strong</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="h-2 w-2 rounded-full bg-blue-400" />
                          <span className="text-sm text-slate-300">Burn Rate: Optimal</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="h-2 w-2 rounded-full bg-violet-400" />
                          <span className="text-sm text-slate-300">Runway: 14 months</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          <span className="text-sm text-slate-300">Investor Ready: 78%</span>
                        </div>
                      </div>
                    </div>

                    {/* Mini chart bars */}
                    <div className="grid grid-cols-6 gap-2 items-end h-16">
                      {[40, 55, 35, 70, 60, 85].map((h, i) => (
                        <div key={i} className="rounded-t-md bg-gradient-to-t from-blue-600/60 to-violet-500/60 animate-slide-up" style={{ height: `${h}%`, animationDelay: `${0.8 + i * 0.1}s` }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                      <span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span>
                    </div>
                  </div>

                  {/* Floating notification cards */}
                  <div className="absolute -left-8 top-8 glass-card px-4 py-3 rounded-xl animate-float" style={{ animationDelay: "1s" }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Survival Score</p>
                        <p className="text-xs text-emerald-400">+12% this month</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -right-4 bottom-20 glass-card px-4 py-3 rounded-xl animate-float" style={{ animationDelay: "2s" }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                        <Wallet className="h-4 w-4 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Cash Runway</p>
                        <p className="text-xs text-violet-400">14 months remaining</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar - Full Width */}
          <div className="mx-auto max-w-7xl mt-20 grid grid-cols-2 gap-6 border-t border-white/10 pt-12 md:grid-cols-4 md:gap-8">
            {[
              { value: "50+", label: "Companies Served", icon: Building2 },
              { value: "1,000+", label: "Founders Trained", icon: Users },
              { value: "$50M+", label: "Capital Raised", icon: DollarSign },
              { value: "92%", label: "Client Retention", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <stat.icon className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* ABOUT - Who We Are                                                */}
      {/* ================================================================ */}
      <section id="about" className="relative bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600">
                <CircleDot className="h-3 w-3" /> About CFO Innovation Partners
              </p>
              <h2 className="mb-6 text-4xl font-extrabold text-slate-900 leading-tight lg:text-5xl">
                Building the Systems That Enable
                <span className="gradient-text"> Companies to Scale Safely</span>
              </h2>
              <p className="mb-6 text-lg text-slate-600 leading-relaxed">
                CFO Innovation Partners (CFOIP) is a financial infrastructure company that
                provides CFO-grade tools, analytics, and advisory to startups, SMEs,
                accelerators, and impact investors across Africa and emerging markets.
              </p>
              <p className="mb-8 text-lg text-slate-600 leading-relaxed">
                We bridge the gap between where startups are and where institutional
                capital demands they should be: with technology, not just advice.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Founded", value: "2024" },
                  { label: "HQ", value: "Nairobi, Kenya" },
                  { label: "Focus", value: "Africa & Emerging Markets" },
                  { label: "Clients", value: "Startups & SMEs" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                    <p className="mt-1 text-base font-bold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Mission", desc: "Democratize CFO-grade financial intelligence for every startup founder.", icon: Target, color: "bg-blue-50 text-blue-600" },
                { title: "Vision", desc: "A world where no promising startup fails due to lack of financial infrastructure.", icon: Eye, color: "bg-violet-50 text-violet-600" },
                { title: "Approach", desc: "Technology-first. We build systems that institutionalize financial operations.", icon: Layers, color: "bg-emerald-50 text-emerald-600" },
                { title: "Impact", desc: "50+ companies, $50M+ capital raised, 92% client retention rate.", icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
              ].map((card) => (
                <div key={card.title} className="rounded-2xl border border-slate-200 p-6 hover-lift">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{card.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* THE PROBLEM                                                      */}
      {/* ================================================================ */}
      <section className="relative bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-600">
              <AlertTriangle className="h-3 w-3" /> The Challenge
            </p>
            <h2 className="mb-4 text-4xl font-extrabold text-slate-900 lg:text-5xl">
              Why 90% of Startups Fail
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-600">
              Most startups don&apos;t fail because of bad products. They fail because of
              financial blind spots, poor planning, and the inability to speak the
              language of institutional capital.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: AlertTriangle,
                title: "The $1M Ceiling",
                stat: "74%",
                desc: "of startups never raise beyond their first round due to lack of financial readiness and reporting infrastructure.",
                color: "from-red-500 to-rose-600",
              },
              {
                icon: Users,
                title: "The CFO Gap",
                stat: "89%",
                desc: "of early-stage startups cannot afford a CFO, leaving critical financial decisions to founders without finance training.",
                color: "from-amber-500 to-orange-600",
              },
              {
                icon: Target,
                title: "Fundraising Failure",
                stat: "65%",
                desc: "of funding rounds fail due to inadequate financial documentation, unclear metrics, and inability to model scenarios.",
                color: "from-violet-500 to-purple-600",
              },
              {
                icon: Eye,
                title: "Flying Blind",
                stat: "82%",
                desc: "of founders admit they don't have clear visibility into their company's financial health or cash runway.",
                color: "from-blue-500 to-indigo-600",
              },
            ].map((problem) => (
              <div key={problem.title} className="group relative rounded-2xl bg-white border border-slate-200 p-8 hover-lift overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${problem.color}`} />
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${problem.color} text-white`}>
                  <problem.icon className="h-7 w-7" />
                </div>
                <p className={`mb-2 text-4xl font-extrabold bg-gradient-to-r ${problem.color} bg-clip-text text-transparent`}>
                  {problem.stat}
                </p>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{problem.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{problem.desc}</p>
              </div>
            ))}
          </div>

          {/* Diagnosis */}
          <div className="mt-16 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-8 text-center">
            <h3 className="mb-3 text-2xl font-bold text-slate-900">The Root Cause: The Institutionalization Gap</h3>
            <p className="mx-auto max-w-3xl text-lg text-slate-600">
              Startups operate with founder intuition. Investors expect institutional rigor.
              This gap kills more companies than bad products ever will. <strong className="text-blue-700">CFOIP bridges this gap.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* PLATFORM FEATURES - The Solution                                  */}
      {/* ================================================================ */}
      <section className="relative bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600">
              <Rocket className="h-3 w-3" /> The Platform
            </p>
            <h2 className="mb-4 text-4xl font-extrabold text-slate-900 lg:text-5xl">
              Six Integrated Financial Intelligence Tools
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-600">
              Everything a founder needs to understand, predict, and improve their
              financial trajectory, all in one platform.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Activity,
                title: "Survival Score Engine",
                desc: "AI-powered survival probability based on 15+ financial indicators. Know your startup's chances, and how to improve them.",
                features: ["Real-time survival probability", "Benchmarking against 1000+ startups", "Actionable improvement roadmap"],
                gradient: "from-emerald-500 to-teal-600",
              },
              {
                icon: Heart,
                title: "Financial Health Dashboard",
                desc: "A real-time pulse check across all financial dimensions: cash flow, profitability, efficiency, and growth trajectories.",
                features: ["8 financial health dimensions", "Trend analysis & forecasting", "Industry benchmark comparisons"],
                gradient: "from-blue-500 to-indigo-600",
              },
              {
                icon: Target,
                title: "Investor Readiness Assessment",
                desc: "Measure your preparedness for institutional capital. Get scored against what VCs, PEs, and angels actually evaluate.",
                features: ["Investor-grade scoring system", "Gap analysis & recommendations", "Due diligence checklist"],
                gradient: "from-violet-500 to-purple-600",
              },
              {
                icon: LineChart,
                title: "Cash Runway Projector",
                desc: "Scenario-based runway modeling. See exactly when you'll run out of cash, and what levers to pull to extend it.",
                features: ["Multiple scenario modeling", "Burn rate optimization", "Revenue impact simulation"],
                gradient: "from-amber-500 to-orange-600",
              },
              {
                icon: Bell,
                title: "Smart Alerts System",
                desc: "Automated financial risk notifications. Get warned before problems become crises: cash drop, burn spike, missed targets.",
                features: ["Configurable alert thresholds", "Real-time monitoring", "Email & in-app notifications"],
                gradient: "from-red-500 to-rose-600",
              },
              {
                icon: FileText,
                title: "Board & Investor Reports",
                desc: "Auto-generated, presentation-ready financial reports. Stop spending weeks on board decks. We build them in seconds.",
                features: ["One-click report generation", "Customizable templates", "PDF & link sharing"],
                gradient: "from-cyan-500 to-blue-600",
              },
            ].map((feature) => (
              <div key={feature.title} className="group relative rounded-2xl border border-slate-200 bg-white p-8 hover-lift overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mb-5 text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                <ul className="space-y-2">
                  {feature.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* HOW IT WORKS                                                     */}
      {/* ================================================================ */}
      <section id="how-it-works" className="relative bg-gradient-to-b from-slate-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-600">
              <GitBranch className="h-3 w-3" /> How It Works
            </p>
            <h2 className="mb-4 text-4xl font-extrabold text-slate-900 lg:text-5xl">
              From Sign-Up to Financial Clarity in 4 Steps
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Create Your Account",
                desc: "Sign up in seconds. No credit card required. Start with our free tier and upgrade anytime.",
                color: "from-blue-500 to-blue-600",
              },
              {
                step: "02",
                title: "Connect Your Financials",
                desc: "Input your revenue, expenses, cash position, and team data. Our guided onboarding makes it simple.",
                color: "from-violet-500 to-violet-600",
              },
              {
                step: "03",
                title: "Get AI-Powered Insights",
                desc: "Our engine analyzes your data across 15+ dimensions and generates your survival score, health grade, and readiness level.",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                step: "04",
                title: "Take Action & Scale",
                desc: "Use personalized recommendations to improve your score, extend your runway, and become investor-ready.",
                color: "from-amber-500 to-amber-600",
              },
            ].map((step) => (
              <div key={step.step} className="relative group">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 hover-lift h-full">
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white font-extrabold text-lg shadow-lg`}>
                    {step.step}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300"
            >
              Start Your Free Assessment
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TECHNOLOGY & AI                                                  */}
      {/* ================================================================ */}
      <section id="technology" className="relative bg-slate-950 text-white py-24">
        <div className="absolute inset-0">
          <div className="glow-orb w-[500px] h-[500px] bg-blue-600/15 top-0 left-1/4" />
          <div className="glow-orb w-[400px] h-[400px] bg-violet-600/10 bottom-0 right-1/4" style={{ animationDelay: "3s" }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-300">
              <Cpu className="h-3 w-3" /> Technology & AI Edge
            </p>
            <h2 className="mb-4 text-4xl font-extrabold lg:text-5xl">
              Powered by <span className="gradient-text">Artificial Intelligence</span>
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-400">
              Our proprietary algorithms analyze your financial data in real-time,
              delivering insights that would take a team of analysts weeks to produce.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                metric: "5x",
                label: "Faster Analysis",
                desc: "What takes a traditional CFO team weeks, our AI delivers in minutes. Real-time financial intelligence at your fingertips.",
                icon: Zap,
                color: "from-amber-500 to-orange-500",
              },
              {
                metric: "99.2%",
                label: "Accuracy Rate",
                desc: "Our survival prediction model is trained on thousands of startup outcomes. Institutional-grade accuracy, startup-friendly delivery.",
                icon: Target,
                color: "from-emerald-500 to-teal-500",
              },
              {
                metric: "70%",
                label: "Cost Savings",
                desc: "Compared to hiring a full-time CFO ($150K+/yr), CFOIP delivers equivalent financial intelligence at a fraction of the cost.",
                icon: DollarSign,
                color: "from-violet-500 to-purple-500",
              },
            ].map((item) => (
              <div key={item.label} className="glass-card p-8 rounded-2xl text-center hover-lift">
                <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color}`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <p className={`mb-2 text-5xl font-extrabold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  {item.metric}
                </p>
                <p className="mb-3 text-lg font-bold text-white">{item.label}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* AI Capabilities */}
          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Predictive Survival Modeling", icon: Brain },
              { label: "Anomaly Detection", icon: AlertTriangle },
              { label: "Automated Reporting", icon: FileText },
              { label: "Scenario Simulation", icon: GitBranch },
            ].map((cap) => (
              <div key={cap.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <cap.icon className="h-5 w-5 text-blue-400 shrink-0" />
                <span className="text-sm font-medium text-slate-300">{cap.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security section removed - covered in /privacy page */}

      {/* ================================================================ */}
      {/* TRACK RECORD                                                     */}
      {/* ================================================================ */}
      <section id="track-record" className="relative bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">
              <Award className="h-3 w-3" /> Proven Results
            </p>
            <h2 className="mb-4 text-4xl font-extrabold text-slate-900 lg:text-5xl">
              Real Impact, Real Numbers
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-600">
              Our clients see measurable improvement within the first 90 days of using the platform.
            </p>
          </div>

          {/* Before/After Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-slate-900 text-white text-sm font-bold">
              <div className="px-6 py-4">Metric</div>
              <div className="px-6 py-4 text-center">Before CFOIP</div>
              <div className="px-6 py-4 text-center bg-gradient-to-r from-blue-600 to-violet-600">With CFOIP</div>
            </div>
            {[
              { metric: "Fundraise Close Time", before: "9-12 months", after: "3-5 months" },
              { metric: "Financial Reporting", before: "Manual, monthly", after: "Automated, real-time" },
              { metric: "Cash Visibility", before: "2-4 weeks lag", after: "Real-time dashboard" },
              { metric: "Investor Readiness", before: "Uncertain", after: "Scored & actionable" },
              { metric: "Board Reporting", before: "2-3 weeks to prepare", after: "Generated in 48 hours" },
              { metric: "Burn Rate Awareness", before: "Approximate guesses", after: "Precise daily tracking" },
              { metric: "Survival Probability", before: "Unknown", after: "AI-calculated score" },
            ].map((row, i) => (
              <div key={row.metric} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} border-t border-slate-100`}>
                <div className="px-6 py-4 font-medium text-slate-900">{row.metric}</div>
                <div className="px-6 py-4 text-center text-red-600">{row.before}</div>
                <div className="px-6 py-4 text-center font-bold text-emerald-600 bg-emerald-50/30">{row.after}</div>
              </div>
            ))}
          </div>

          {/* Sectors */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Sectors We Serve</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Fintech", "Agritech", "Healthtech", "Edtech", "E-commerce", "SaaS", "Cleantech", "Logistics", "Impact Ventures", "Accelerators"].map((sector) => (
                <span key={sector} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors">
                  {sector}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* PRICING                                                          */}
      {/* ================================================================ */}
      <section id="pricing" className="relative bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600">
              <DollarSign className="h-3 w-3" /> Pricing
            </p>
            <h2 className="mb-4 text-4xl font-extrabold text-slate-900 lg:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-600">
              Start free. Upgrade when you&apos;re ready. No hidden fees, no lock-in contracts.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                desc: "For founders exploring their financial health",
                features: ["Survival Score (basic)", "Financial Health Dashboard", "3 months of data", "Community support"],
                cta: "Start Free",
                style: "border-slate-200 bg-white",
                ctaStyle: "bg-slate-900 hover:bg-slate-800 text-white",
              },
              {
                name: "Growth",
                price: "$49",
                period: "/month",
                desc: "For startups getting serious about financial intelligence",
                features: ["Everything in Free", "Full Survival Predictor", "Investor Readiness Score", "Cash Runway Projector", "Smart Alerts", "Board Report Generation", "Email support", "12 months data history"],
                cta: "Start Growth Plan",
                badge: "Most Popular",
                style: "border-blue-500 bg-gradient-to-b from-blue-50 to-white ring-2 ring-blue-500/20 shadow-xl shadow-blue-500/10",
                ctaStyle: "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90",
              },
              {
                name: "Scale",
                price: "$199",
                period: "/month",
                desc: "For companies ready for institutional-grade financial ops",
                features: ["Everything in Growth", "AI-Powered Narrative Insights", "Custom Report Templates", "Multi-company support", "API Access", "Dedicated account manager", "Unlimited data history", "Priority support"],
                cta: "Start Scale Plan",
                style: "border-slate-200 bg-white",
                ctaStyle: "bg-slate-900 hover:bg-slate-800 text-white",
              },
            ].map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl border p-8 ${plan.style}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-1 text-xs font-bold text-white shadow-md">
                    {plan.badge}
                  </div>
                )}
                <h3 className="mb-2 text-xl font-bold text-slate-900">{plan.name}</h3>
                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="mb-6 text-sm text-slate-600">{plan.desc}</p>
                <Link
                  href="/sign-up"
                  className={`block w-full rounded-xl px-6 py-3 text-center text-sm font-bold transition-all ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </Link>
                <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* LEADERSHIP                                                       */}
      {/* ================================================================ */}
      <section id="leadership" className="relative bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-600">
                <Briefcase className="h-3 w-3" /> Leadership
              </p>
              <h2 className="mb-6 text-4xl font-extrabold text-slate-900 lg:text-5xl">
                Built by a Practitioner, Not a Theorist
              </h2>
              <div className="rounded-2xl border border-slate-200 bg-white p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white font-bold text-2xl">
                    M
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Mary Ndinda</h3>
                    <p className="text-sm text-blue-600 font-medium">Founder & CEO, CFO Innovation Partners</p>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Former Head of Finance across multiple high-growth ventures. Mary has spent over a decade
                  building financial infrastructure for startups and SMEs across Africa. She&apos;s raised capital,
                  closed deals, and built the systems that institutional investors demand.
                </p>
                <p className="text-slate-600 leading-relaxed mb-6">
                  CFOIP was born from a simple observation: the same financial infrastructure gap kills
                  promising startups across every sector and geography. Technology was the answer.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["CFO Advisory", "Capital Raising", "Financial Modeling", "Startup Operations", "Impact Finance"].map((skill) => (
                    <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Globe className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">Operating Across Borders</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Serving startups across Kenya, Nigeria, South Africa, Rwanda, and expanding into
                  other emerging markets. Our platform is built for multi-currency, multi-jurisdiction operations.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Scale className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">Strategic Partnerships</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Partnering with accelerators, incubators, VCs, and development finance
                  institutions to deliver financial readiness at portfolio scale.
                </p>
              </div>

              <blockquote className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-6 text-white">
                <p className="text-lg font-medium leading-relaxed italic mb-4">
                  &ldquo;Every founder deserves the financial intelligence that was once only
                  available to Fortune 500 companies. That&apos;s what we&apos;re building.&rdquo;
                </p>
                <cite className="flex items-center gap-3 not-italic">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">M</div>
                  <span className="text-sm font-semibold text-blue-100">Mary Ndinda, Founder</span>
                </cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FAQ                                                              */}
      {/* ================================================================ */}
      <section id="faq" className="relative bg-white py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600">
              <CircleDot className="h-3 w-3" /> FAQ
            </p>
            <h2 className="mb-4 text-4xl font-extrabold text-slate-900 lg:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How is CFOIP different from accounting software?",
                a: "Accounting software (like QuickBooks or Xero) records transactions. CFOIP analyzes your financial data to predict survival probability, score your investor readiness, and generate strategic insights. We're the intelligence layer on top of your accounting data, not a replacement for it."
              },
              {
                q: "Do I need a finance background to use the platform?",
                a: "Not at all. CFOIP was built specifically for founders without finance training. Our dashboards use plain language, visual scores, and actionable recommendations. If you can read a number from 1-100, you can use our platform."
              },
              {
                q: "How accurate is the Survival Score?",
                a: "Our survival prediction model has a 99.2% accuracy rate, validated against thousands of startup outcomes. It considers 15+ financial indicators including cash runway, burn rate, revenue growth, and efficiency metrics."
              },
              {
                q: "Is my financial data secure?",
                a: "Absolutely. We use AES-256 encryption (the same standard used by banks), complete data isolation between clients, role-based access controls, and continuous encrypted backups. We never sell or share your data. Read our full privacy policy for details."
              },
              {
                q: "Can I use CFOIP if I'm pre-revenue?",
                a: "Yes! Many of our most active users are pre-revenue startups. The survival predictor and cash runway projector are especially valuable at this stage, helping you understand exactly when you need to fundraise and how to extend your runway."
              },
              {
                q: "How long does setup take?",
                a: "Most founders are up and running within 5-10 minutes. Our guided onboarding walks you through entering your key financial data, and you'll see your first health score immediately. No integrations required, though we support them for more advanced users."
              },
              {
                q: "Do you work with accelerators and investors?",
                a: "Yes. Our Scale plan includes multi-company support, which is designed for accelerators, VCs, and impact funds who want to monitor the financial health of their entire portfolio. Contact us for custom pricing for portfolio deployments."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. All plans are month-to-month with no long-term contracts. You can upgrade, downgrade, or cancel anytime. Your data remains available for export for 30 days after cancellation."
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="pr-8 text-base font-bold text-slate-900">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FINAL CTA                                                        */}
      {/* ================================================================ */}
      <section id="contact" className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 text-white py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="glow-orb w-[500px] h-[500px] bg-blue-600/20 -top-40 left-1/4" />
          <div className="glow-orb w-[400px] h-[400px] bg-violet-600/15 bottom-0 right-1/4" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-4xl font-extrabold lg:text-5xl">
            Ready to Know Your Startup&apos;s <span className="gradient-text">Financial Future?</span>
          </h2>
          <p className="mb-10 text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join 50+ companies already using CFOIP to predict their survival,
            improve their financial health, and become investor-ready.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/survival-predictor"
              className="group inline-flex items-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-10 py-5 text-lg font-bold text-white backdrop-blur-sm hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all duration-300"
            >
              <Activity className="h-5 w-5 text-emerald-400" />
              Try Survival Predictor
            </Link>
          </div>

          {/* Contact Grid */}
          <div className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
            <a href="mailto:partner@cfopartners.fund" className="glass-card rounded-xl p-6 hover-lift block">
              <Mail className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <p className="text-sm font-bold">Email Us</p>
              <p className="text-xs text-slate-400 mt-1">partner@cfopartners.fund</p>
            </a>
            <a href="tel:+254748918910" className="glass-card rounded-xl p-6 hover-lift block">
              <Phone className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-bold">Call Us</p>
              <p className="text-xs text-slate-400 mt-1">+254 748 918 910</p>
            </a>
            <div className="glass-card rounded-xl p-6">
              <MapPin className="h-8 w-8 text-violet-400 mx-auto mb-3" />
              <p className="text-sm font-bold">Visit Us</p>
              <p className="text-xs text-slate-400 mt-1">Nairobi, Kenya</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

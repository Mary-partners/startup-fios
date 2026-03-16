"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Activity,
  Heart,
  Target,
  BarChart3,
  Bell,
  FileText,
  Shield,
  Lock,
  Users,
  BookOpen,
  Briefcase,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  DollarSign,
  Brain,
} from "lucide-react";

const platformTools = [
  { name: "Survival Score Engine", href: "/survival-predictor", icon: Activity, desc: "Predict your startup's survival probability" },
  { name: "Financial Health Dashboard", href: "/sign-up", icon: Heart, desc: "Real-time financial health monitoring" },
  { name: "Investor Readiness", href: "/sign-up", icon: Target, desc: "Assess your fundraising readiness" },
  { name: "Cash Runway Projector", href: "/sign-up", icon: BarChart3, desc: "Forecast your runway under scenarios" },
  { name: "Smart Alerts", href: "/sign-up", icon: Bell, desc: "Automated financial risk notifications" },
  { name: "Board Reports", href: "/sign-up", icon: FileText, desc: "Auto-generated investor updates" },
];

const companyLinks = [
  { name: "About Us", href: "/#about", icon: Users },
  { name: "Leadership", href: "/#leadership", icon: Briefcase },
  { name: "Track Record", href: "/#track-record", icon: BookOpen },
  { name: "Security & Privacy", href: "/privacy", icon: Shield },
];

const resourceLinks = [
  { name: "How It Works", href: "/#how-it-works", icon: Brain },
  { name: "Technology & AI", href: "/#technology", icon: Sparkles },
  { name: "FAQ", href: "/#faq", icon: BookOpen },
  { name: "Contact Us", href: "/#contact", icon: Mail },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <p className="flex items-center gap-2">
            <Lock className="h-3 w-3 text-emerald-400" />
            Bank-Level 256-bit AES Encryption
          </p>
          <div className="hidden md:flex items-center gap-4">
            <a href="mailto:partner@cfopartners.fund" className="flex items-center gap-1 hover:text-white transition-colors">
              <Mail className="h-3 w-3" /> partner@cfopartners.fund
            </a>
            <a href="tel:+254748918910" className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone className="h-3 w-3" /> +254 748 918 910
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white font-bold text-sm">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900 leading-tight">
                <span className="text-blue-600">CFOIP</span> Financial OS
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 leading-none">
                Startup Intelligence Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Platform Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("platform")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                Platform <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {activeDropdown === "platform" && (
                <div className="absolute left-0 top-full pt-2 w-[480px]">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                    <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Financial Intelligence Tools
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {platformTools.map((tool) => (
                        <Link
                          key={tool.name}
                          href={tool.href}
                          className="flex items-start gap-3 rounded-lg p-3 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                            <tool.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{tool.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{tool.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing */}
            <Link
              href="/pricing"
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <DollarSign className="h-3.5 w-3.5" /> Pricing
            </Link>

            {/* Company Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("company")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                Company <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {activeDropdown === "company" && (
                <div className="absolute left-0 top-full pt-2 w-56">
                  <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    {companyLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <link.icon className="h-4 w-4 text-slate-400" />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("resources")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                Resources <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {activeDropdown === "resources" && (
                <div className="absolute left-0 top-full pt-2 w-56">
                  <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    {resourceLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <link.icon className="h-4 w-4 text-slate-400" />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Survival Predictor - Highlighted */}
            <Link
              href="/survival-predictor"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <Activity className="h-3.5 w-3.5" /> Survival Predictor
            </Link>
          </div>

          {/* Right Side - Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-200"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-6 py-4">
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Platform</p>
              {platformTools.map((tool) => (
                <Link
                  key={tool.name}
                  href={tool.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <tool.icon className="h-4 w-4 text-blue-600" />
                  {tool.name}
                </Link>
              ))}

              <div className="my-3 border-t border-slate-100" />

              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                <DollarSign className="h-4 w-4 text-slate-400" /> Pricing
              </Link>
              <Link href="/survival-predictor" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50">
                <Activity className="h-4 w-4" /> Survival Predictor
              </Link>

              <div className="my-3 border-t border-slate-100" />

              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Company</p>
              {companyLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                  <link.icon className="h-4 w-4 text-slate-400" /> {link.name}
                </Link>
              ))}

              <div className="my-3 border-t border-slate-100" />

              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Resources</p>
              {resourceLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                  <link.icon className="h-4 w-4 text-slate-400" /> {link.name}
                </Link>
              ))}

              <div className="my-3 border-t border-slate-100" />

              <div className="flex flex-col gap-2 pt-2">
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Sign In
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)} className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Comprehensive Footer */}
      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white font-bold text-sm">C</div>
                <span className="text-lg font-bold"><span className="text-blue-400">CFOIP</span> Financial OS</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                AI-powered financial intelligence for startups. Know your survival odds, improve your financial health, and become investor-ready.
              </p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  <Shield className="h-3 w-3" /> SOC 2 Compliant
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                  <Lock className="h-3 w-3" /> 256-bit Encrypted
                </span>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/survival-predictor" className="text-slate-300 hover:text-white transition-colors">Survival Predictor</Link></li>
                <li><Link href="/sign-up" className="text-slate-300 hover:text-white transition-colors">Financial Dashboard</Link></li>
                <li><Link href="/sign-up" className="text-slate-300 hover:text-white transition-colors">Investor Readiness</Link></li>
                <li><Link href="/sign-up" className="text-slate-300 hover:text-white transition-colors">Cash Runway Projector</Link></li>
                <li><Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/#about" className="text-slate-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/#leadership" className="text-slate-300 hover:text-white transition-colors">Leadership</Link></li>
                <li><Link href="/#track-record" className="text-slate-300 hover:text-white transition-colors">Track Record</Link></li>
                <li><Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/#faq" className="text-slate-300 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Get In Touch</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="mailto:partner@cfopartners.fund" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                    <Mail className="h-4 w-4 text-slate-500" /> partner@cfopartners.fund
                  </a>
                </li>
                <li>
                  <a href="tel:+254748918910" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                    <Phone className="h-4 w-4 text-slate-500" /> +254 748 918 910
                  </a>
                </li>
                <li className="pt-4">
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-8">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} CFO Innovation Partners. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-slate-500">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Data Protection</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

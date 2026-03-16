import {
  Shield,
  Lock,
  Eye,
  Database,
  Server,
  Trash2,
  UserCheck,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "Privacy Policy & Data Security | Startup FIOS",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-300">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">
            Privacy Policy & Data Security
          </h1>
          <p className="text-lg text-slate-400">
            Last updated: March 16, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 rounded-xl border border-blue-200 bg-blue-50 p-6 text-sm text-blue-900">
          <p>
            At CFO Innovation Partners, we take your financial data security
            extremely seriously. This policy explains how we collect, use,
            protect, and handle your information when you use Startup FIOS.
          </p>
        </div>

        <div className="space-y-10">
          {SECTIONS.map((section, i) => (
            <div
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <section.icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Section {i + 1}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    {section.title}
                  </h2>
                </div>
              </div>
              <div className="space-y-3 pl-14 text-slate-600">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-sm leading-relaxed">
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="list-inside list-disc space-y-1.5 text-sm">
                    {section.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-8 text-center">
          <Mail className="mx-auto mb-4 h-8 w-8 text-blue-600" />
          <h2 className="mb-2 text-xl font-bold text-slate-900">
            Questions About Your Data?
          </h2>
          <p className="mb-4 text-sm text-slate-600">
            If you have any questions about this privacy policy or how we handle
            your data, please contact us.
          </p>
          <a
            href="mailto:advisory@cfolead.solutions"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Mail className="h-4 w-4" />
            advisory@cfolead.solutions
          </a>
        </div>
      </section>
    </main>
  );
}

const SECTIONS = [
  {
    icon: Database,
    title: "Data Collection",
    paragraphs: [
      "We collect only the information necessary to provide our financial intelligence services. This includes:",
    ],
    bullets: [
      "Account information: email address and name when you create an account",
      "Financial data: revenue, expenses, cash balances, and other financial metrics you enter",
      "Usage data: how you interact with the platform to improve our services",
      "Login data: timestamps and general location for security purposes",
    ],
  },
  {
    icon: Lock,
    title: "Data Encryption",
    paragraphs: [
      "All data is encrypted using industry-standard protocols to ensure your financial information remains private and secure.",
      "Data at rest is encrypted with 256-bit AES encryption. Data in transit is protected with TLS 1.3 encryption. Database connections use SSL/TLS with certificate verification.",
    ],
  },
  {
    icon: Eye,
    title: "Data Isolation",
    paragraphs: [
      "Your data is strictly isolated from other users. Our multi-tenant architecture ensures complete separation between accounts.",
      "Each user can only access their own company's data. Role-based access controls enforce permissions within organizations. Database queries are scoped to prevent any cross-tenant data leakage.",
    ],
  },
  {
    icon: Shield,
    title: "Data Usage",
    paragraphs: [
      "Your data is used exclusively to provide the Startup FIOS service. We do not sell, rent, or share your financial data with any third parties for marketing or advertising purposes.",
      "We may use anonymized, aggregated data to improve our scoring algorithms and provide industry benchmarks. No individually identifiable financial data is ever shared.",
    ],
  },
  {
    icon: Trash2,
    title: "Data Retention",
    paragraphs: [
      "Your data is retained for as long as your account remains active. If you close your account, we will delete your data within 30 days of your request.",
      "Backups containing your data are retained for up to 90 days for disaster recovery purposes and are then permanently deleted.",
    ],
  },
  {
    icon: UserCheck,
    title: "Your Rights",
    paragraphs: [
      "You have full control over your data. At any time, you may:",
    ],
    bullets: [
      "Access: Request a complete copy of all data we hold about you",
      "Export: Download your financial data in standard formats",
      "Correct: Update or correct any inaccurate information",
      "Delete: Request permanent deletion of your account and all associated data",
      "Restrict: Limit how we process your data",
    ],
  },
  {
    icon: Server,
    title: "Third-Party Services",
    paragraphs: [
      "We use carefully selected third-party services to deliver our platform. Each provider meets our strict security requirements:",
    ],
    bullets: [
      "Vercel: Application hosting with edge network delivery and automatic HTTPS",
      "Neon: PostgreSQL database hosting with encryption at rest and in transit",
      "All third-party providers are contractually bound to protect your data",
    ],
  },
];

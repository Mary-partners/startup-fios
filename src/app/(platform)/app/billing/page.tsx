// ============================================================
// Billing Page - Payment methods, plan selection, and
// payment confirmation upload for manual validation
// ============================================================

"use client";

import { useState, useRef } from "react";
import {
  CreditCard,
  Building2,
  Smartphone,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Get started with basic financial tracking",
    features: [
      "Dashboard overview",
      "Basic survival score",
      "Manual data entry",
      "1 month data history",
    ],
    color: "border-slate-200",
    bg: "bg-white",
    badge: null,
  },
  {
    id: "GROWTH",
    name: "Growth",
    price: "$49",
    period: "/month",
    description: "Full financial intelligence for growing startups",
    features: [
      "Everything in Free",
      "Full Survival Predictor",
      "Investor Readiness Score",
      "Cash Runway Projector",
      "Smart Alerts",
      "Board Report Generation",
      "Email support",
      "12 months data history",
    ],
    color: "border-blue-500",
    bg: "bg-blue-50/30",
    badge: "Most Popular",
  },
  {
    id: "SCALE",
    name: "Scale",
    price: "$199",
    period: "/month",
    description: "For teams and portfolio companies",
    features: [
      "Everything in Growth",
      "CFO AI Assistant",
      "Multi-company support",
      "Custom integrations",
      "Priority support",
      "Unlimited data history",
      "API access",
      "White-label reports",
    ],
    color: "border-violet-500",
    bg: "bg-violet-50/30",
    badge: "Enterprise",
  },
];

const BANK_DETAILS = {
  accountName: "CFO INNOVATION PARTNERS LTD",
  kesAccount: "0482427516001",
  usdAccount: "0482427516002",
  branch: "KAREN BRANCH",
  bankCode: "60",
  branchCode: "048",
  swiftCode: "SBMKKENA",
  bank: "SBM Bank Kenya",
};

const MPESA_DETAILS = {
  paybill: "552800",
  accountNumber: "516001",
};

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "mpesa" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmationUpload = async (file: File) => {
    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("plan", selectedPlan ?? "GROWTH");
      formData.append("method", paymentMethod ?? "bank");

      const res = await fetch("/api/billing/confirm", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUploaded(true);
      } else {
        setUploadError(data.error ?? "Upload failed. Please try again.");
      }
    } catch {
      setUploadError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleConfirmationUpload(file);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="ml-2 inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-200 transition-colors"
    >
      {copiedField === field ? (
        <>
          <Check className="h-2.5 w-2.5 text-green-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-2.5 w-2.5" />
          Copy
        </>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-blue-600" />
          Billing & Subscription
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose a plan and complete payment to unlock full platform features
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Shield className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Current Plan: <span className="text-blue-600">Free</span></p>
              <p className="text-xs text-slate-500">Upgrade to access all features</p>
            </div>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Active
          </span>
        </div>
      </div>

      {/* Plan Selection */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Choose Your Plan</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-xl border-2 p-5 text-left transition-all ${
                selectedPlan === plan.id
                  ? `${plan.color} ${plan.bg} shadow-md`
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {plan.badge && (
                <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  plan.badge === "Most Popular"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-violet-100 text-violet-700"
                }`}>
                  {plan.badge}
                </span>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              {selectedPlan === plan.id && (
                <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Selected
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Methods - shown after plan selection */}
      {selectedPlan && selectedPlan !== "FREE" && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Payment Method</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Bank Transfer */}
            <button
              onClick={() => setPaymentMethod("bank")}
              className={`rounded-xl border-2 p-5 text-left transition-all ${
                paymentMethod === "bank"
                  ? "border-blue-500 bg-blue-50/50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Bank Transfer</h3>
                  <p className="text-xs text-slate-500">SBM Bank Kenya (KES / USD)</p>
                </div>
              </div>
            </button>

            {/* M-Pesa */}
            <button
              onClick={() => setPaymentMethod("mpesa")}
              className={`rounded-xl border-2 p-5 text-left transition-all ${
                paymentMethod === "mpesa"
                  ? "border-green-500 bg-green-50/50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">M-Pesa</h3>
                  <p className="text-xs text-slate-500">Paybill (Instant payment)</p>
                </div>
              </div>
            </button>
          </div>

          {/* Bank Details */}
          {paymentMethod === "bank" && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/30 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Bank Transfer Details
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Bank</p>
                    <p className="font-medium text-slate-900">{BANK_DETAILS.bank}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Account Name</p>
                    <p className="font-medium text-slate-900">{BANK_DETAILS.accountName}</p>
                  </div>
                  <CopyButton text={BANK_DETAILS.accountName} field="accountName" />
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">KES Account</p>
                      <p className="font-mono font-medium text-slate-900">{BANK_DETAILS.kesAccount}</p>
                    </div>
                    <CopyButton text={BANK_DETAILS.kesAccount} field="kesAccount" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">USD Account</p>
                      <p className="font-mono font-medium text-slate-900">{BANK_DETAILS.usdAccount}</p>
                    </div>
                    <CopyButton text={BANK_DETAILS.usdAccount} field="usdAccount" />
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="rounded-lg bg-white px-3 py-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Branch</p>
                    <p className="text-sm font-medium text-slate-900">{BANK_DETAILS.branch}</p>
                  </div>
                  <div className="rounded-lg bg-white px-3 py-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Bank Code / Branch Code</p>
                    <p className="text-sm font-medium text-slate-900">{BANK_DETAILS.bankCode} / {BANK_DETAILS.branchCode}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">SWIFT Code</p>
                      <p className="font-mono text-sm font-medium text-slate-900">{BANK_DETAILS.swiftCode}</p>
                    </div>
                    <CopyButton text={BANK_DETAILS.swiftCode} field="swift" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* M-Pesa Details */}
          {paymentMethod === "mpesa" && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50/30 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-green-600" />
                M-Pesa Payment Details
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Paybill Number</p>
                    <p className="text-xl font-bold font-mono text-green-700">{MPESA_DETAILS.paybill}</p>
                  </div>
                  <CopyButton text={MPESA_DETAILS.paybill} field="paybill" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Account Number</p>
                    <p className="text-xl font-bold font-mono text-green-700">{MPESA_DETAILS.accountNumber}</p>
                  </div>
                  <CopyButton text={MPESA_DETAILS.accountNumber} field="mpesaAccount" />
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-green-100 px-3 py-2">
                <p className="text-xs text-green-800">
                  <strong>How to pay:</strong> Go to M-Pesa → Lipa na M-Pesa → Pay Bill → Enter Business No: {MPESA_DETAILS.paybill} → Account No: {MPESA_DETAILS.accountNumber} → Amount → PIN → Confirm
                </p>
              </div>
            </div>
          )}

          {/* Payment Confirmation Upload */}
          {paymentMethod && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Upload className="h-4 w-4 text-violet-600" />
                Upload Payment Confirmation
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                After making your payment, upload a screenshot or PDF of your payment confirmation. We&apos;ll verify and activate your plan within 24 hours.
              </p>

              {uploaded ? (
                <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 p-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Payment confirmation received!</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Our team will verify your payment and activate your <strong>{PLANS.find(p => p.id === selectedPlan)?.name}</strong> plan within 24 hours. You&apos;ll receive an email confirmation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf,.webp"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  ) : (
                    <Upload className="h-8 w-8 text-slate-400" />
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">
                      {uploading ? "Uploading..." : "Upload payment screenshot or receipt"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PNG, JPG, PDF. M-Pesa message, bank receipt, or transfer confirmation
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                    >
                      Choose File
                    </button>
                  )}
                  {uploadError && (
                    <div className="flex items-center gap-2 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {uploadError}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Free plan selected */}
      {selectedPlan === "FREE" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">You&apos;re on the Free plan</p>
              <p className="text-xs text-slate-500">You have access to basic features. Upgrade anytime to unlock the full platform.</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">How it works</p>
            <ol className="mt-1.5 space-y-1 text-xs text-amber-700">
              <li>1. Select your plan above</li>
              <li>2. Choose Bank Transfer or M-Pesa</li>
              <li>3. Make the payment using the details provided</li>
              <li>4. Upload your payment confirmation (screenshot or receipt)</li>
              <li>5. We verify and activate your plan within 24 hours</li>
            </ol>
            <p className="mt-2 text-xs text-amber-600">
              Questions? Email <a href="mailto:partner@cfopartners.fund" className="underline font-medium">partner@cfopartners.fund</a> or call <a href="tel:+254748918910" className="underline font-medium">+254 748 918 910</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

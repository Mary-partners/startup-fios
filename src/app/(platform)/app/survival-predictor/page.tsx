// ============================================================
// Survival Predictor — In-app version (stays within dashboard)
// ============================================================

import SurvivalPredictorForm from "@/components/forms/survival-predictor-form";
import { Activity } from "lucide-react";

export default function InAppSurvivalPredictorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="h-7 w-7 text-emerald-600" />
          Survival Predictor
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your financial data to get an instant survival score, runway calculation, and risk assessment.
        </p>
        <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          Always Free
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <SurvivalPredictorForm />
      </div>
    </div>
  );
}

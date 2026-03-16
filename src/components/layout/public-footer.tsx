// ============================================================
// PublicFooter — Marketing site footer
// ============================================================

import Link from "next/link";
import { COMPANY_NAME, SUPPORT_EMAIL } from "@/lib/utils/constants";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <Link href="/pricing" className="hover:text-slate-700">
              Pricing
            </Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-slate-700">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

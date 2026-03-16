"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, Link, PenLine, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
  skippedPeriods?: string;
}

export default function DataImportPanel() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [qbMessage, setQbMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error ?? "Import failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Upload CSV/Excel */}
        <div
          className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : result ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Upload CSV / Excel</h3>
              <p className="mt-1 text-xs text-slate-500">
                Drag and drop or click to browse
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Choose File"}
            </button>
            <p className="text-[11px] text-slate-400">
              CSV with columns: month, year, revenue, expenses, cash_balance, cogs
            </p>
          </div>

          {/* Result/Error feedback */}
          {result && (
            <div className="mt-3 rounded-lg bg-green-50 p-3 text-left">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <div className="text-xs text-green-800">
                  <p className="font-medium">
                    Successfully imported {result.imported} period{result.imported !== 1 ? "s" : ""}
                  </p>
                  {result.skipped > 0 && (
                    <p className="mt-1 text-green-700">
                      {result.skipped} skipped (already exist).{" "}
                      {result.skippedPeriods}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Connect QuickBooks */}
        <div className="relative rounded-xl border border-slate-200 p-6 text-center hover:border-slate-300 hover:bg-slate-50 transition-colors">
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Coming Soon
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Link className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Connect QuickBooks</h3>
              <p className="mt-1 text-xs text-slate-500">
                Auto-sync your accounting data
              </p>
            </div>
            <button
              onClick={() => {
                setQbMessage(true);
                setTimeout(() => setQbMessage(false), 3000);
              }}
              className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
            >
              <span className="mr-1.5 font-bold">QB</span>
              Connect
            </button>
            {qbMessage && (
              <p className="text-[11px] font-medium text-amber-600">
                QuickBooks integration coming soon.
              </p>
            )}
          </div>
        </div>

        {/* Enter Manually */}
        <a
          href="/app/financials"
          className="group rounded-xl border border-slate-200 p-6 text-center hover:border-slate-300 hover:bg-slate-50 transition-colors block"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <PenLine className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Enter Manually</h3>
              <p className="mt-1 text-xs text-slate-500">
                Add financial data month by month
              </p>
            </div>
            <span className="rounded-lg border border-violet-200 bg-white px-4 py-2 text-xs font-medium text-violet-700 group-hover:bg-violet-50">
              <FileSpreadsheet className="mr-1.5 inline h-3 w-3" />
              Open Form
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}

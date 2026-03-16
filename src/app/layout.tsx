// ============================================================
// Root Layout
// ============================================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Register background job handlers (fire-and-forget event system)
import "@/lib/jobs/register";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Startup Financial Intelligence OS | CFO Innovation Partners",
  description:
    "AI-powered financial intelligence for startups. Know your survival odds, improve your financial health, and become investor-ready.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

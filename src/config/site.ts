// ============================================================
// Site Configuration
// ============================================================

export const siteConfig = {
  name: "Startup Financial Intelligence OS",
  shortName: "CFOIP Financial OS",
  description:
    "AI-powered financial intelligence for startups. Know your survival odds, improve your financial health, and become investor-ready.",
  url:
    process.env.NEXT_PUBLIC_APP_URL ?? "https://app.cfolead.solutions",
  ogImage: "/og-image.png",
  links: {
    marketing: "https://cfolead.solutions",
    support: "mailto:advisory@cfolead.solutions",
  },
};

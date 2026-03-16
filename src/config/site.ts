// ============================================================
// Site Configuration
// ============================================================

export const siteConfig = {
  name: "Startup Financial Intelligence OS",
  shortName: "CFOIP Financial OS",
  description:
    "AI-powered financial intelligence for startups. Know your survival odds, improve your financial health, and become investor-ready.",
  url:
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.cfopartners.fund",
  ogImage: "/og-image.png",
  links: {
    marketing: "https://www.cfopartners.fund",
    support: "mailto:partner@cfopartners.fund",
  },
};

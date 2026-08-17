import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kalyan Gold Fund (KGF) - Daily Money Collection & Customer Management",
    template: "%s | Kalyan Gold Fund",
  },
  description: "Kalyan Gold Fund (KGF) is a trusted daily money collection and customer management platform. Agents collect deposits, share instant receipts via WhatsApp, and customers track every rupee with full transparency.",
  keywords: ["daily money collection", "chit fund management", "gold investment", "daily collection app", "customer management", "field agent app", "Kalyan Gold Fund", "KGF"],
  authors: [{ name: "Kalyan Gold Fund" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://kgf-ruddy.vercel.app",
    siteName: "Kalyan Gold Fund",
    title: "Kalyan Gold Fund (KGF) - Daily Money Collection & Customer Management",
    description: "Trusted by 2,400+ customers and 85+ agents. Kalyan Gold Fund helps agents collect daily deposits, share instant receipts, and gives customers full transparency over every rupee.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kalyan Gold Fund - Daily Money Collection & Customer Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kalyan Gold Fund (KGF) - Daily Money Collection & Customer Management",
    description: "Trusted by 2,400+ customers and 85+ agents. Kalyan Gold Fund helps agents collect daily deposits, share instant receipts, and gives customers full transparency over every rupee.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://kgf-ruddy.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "Kalyan Gold Fund",
    alternateName: "KGF",
    description: "Daily money collection and customer management platform. Trusted by 2,400+ customers and 85+ agents across India.",
    url: "https://kgf-ruddy.vercel.app",
    logo: "https://kgf-ruddy.vercel.app/logo.png",
    foundingDate: "2020",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      minValue: 50,
      maxValue: 100,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "MG Road",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode: "560001",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-98765-43210",
      contactType: "customer support",
      email: "support@kalyanGoldFund.com",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [],
  };

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="canonical" href="https://kgf-ruddy.vercel.app" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="alternate" hrefLang="en" href="https://kgf-ruddy.vercel.app" />
        <link rel="alternate" hrefLang="hi" href="https://kgf-ruddy.vercel.app/hi" />
        <link rel="alternate" hrefLang="x-default" href="https://kgf-ruddy.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-slate-100 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

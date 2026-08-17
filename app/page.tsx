import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GlassLanding from "@/components/GlassLanding";
import { getSession } from "@/lib/session";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kalyan Gold Fund (KGF) - Daily Money Collection & Customer Management",
  description: "Kalyan Gold Fund (KGF) is a trusted daily money collection and customer management platform. Agents collect deposits, share instant receipts via WhatsApp, and customers track every rupee with full transparency.",
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
};

export default async function Home() {
  const s = await getSession();
  return (
    <div id="top" className="min-h-screen">
      <SiteHeader authed={!!s} role={s?.role} />
      <GlassLanding />
      <SiteFooter />
    </div>
  );
}

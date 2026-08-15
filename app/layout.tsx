import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KGF Daily Money Collection",
  description: "Daily Money Collection & Customer Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-100 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { roleHome } from "@/lib/constants";

const LINKS = [
  { href: "#about", label: "About Us" },
  { href: "#how", label: "How We Work" },
  { href: "#testimonials", label: "Testimonials" },
];

export default function SiteHeader({
  authed,
  role,
}: {
  authed: boolean;
  role?: string;
}) {
  const [open, setOpen] = useState(false);
  const ctaHref = authed && role ? roleHome(role) : "/login";
  const ctaLabel = authed ? "Dashboard" : "Login";
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
<a href="#top" className="font-bold text-indigo-700 text-lg whitespace-nowrap">
            Kalyan Gold Fund
          </a>
        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-indigo-700 transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={ctaHref}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {ctaLabel}
          </Link>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 text-slate-700"
          >
            <span className="text-xl leading-none">≡</span>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 text-sm text-slate-600">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block hover:text-indigo-700"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

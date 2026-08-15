"use client";

import { useState } from "react";

function normalizeMobile(m: string): string {
  const d = (m || "").replace(/\D/g, "");
  // Indian 10-digit mobile without country code -> prefix 91
  if (d.length === 10 && /^[6-9]/.test(d)) return "91" + d;
  return d;
}

export default function WhatsAppShareButton({
  mobile,
  token,
}: {
  mobile: string;
  token: string;
}) {
  const [busy, setBusy] = useState(false);
  function onClick() {
    if (!mobile) return;
    setBusy(true);
    const num = normalizeMobile(mobile);
    const url = `${window.location.origin}/r/${token}`;
    const text = `Hello, here is your collection receipt: ${url}`;
    const w = window.open(
      `https://wa.me/${num}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener"
    );
    setBusy(false);
    if (!w) window.location.href = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  }
  return (
    <button
      onClick={onClick}
      disabled={!mobile || busy}
      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
    >
      Share on WhatsApp
    </button>
  );
}

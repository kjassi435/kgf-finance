"use client";

import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  queryString,
}: {
  page: number;
  totalPages: number;
  queryString: string;
}) {
  if (totalPages <= 1) return null;
  const qs = queryString ? `${queryString}&` : "";
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      (p >= page - 1 && p <= page + 1)
  );
  const items: { label: string; p: number | null }[] = [];
  let prev = 0;
  for (const p of pages) {
    if (p - prev > 1) items.push({ label: "...", p: null });
    items.push({ label: String(p), p });
    prev = p;
  }
  return (
    <div className="flex items-center gap-1 mt-4 flex-wrap">
      {page > 1 && (
        <Link
          href={`?${qs}page=${page - 1}`}
          className="px-3 py-1 text-sm rounded border border-slate-200 hover:bg-slate-100"
        >
          Prev
        </Link>
      )}
      {items.map((it, i) =>
        it.p === null ? (
          <span key={`e${i}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <Link
            key={it.p}
            href={`?${qs}page=${it.p}`}
            className={`px-3 py-1 text-sm rounded border ${
              it.p === page
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-slate-200 hover:bg-slate-100"
            }`}
          >
            {it.label}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link
          href={`?${qs}page=${page + 1}`}
          className="px-3 py-1 text-sm rounded border border-slate-200 hover:bg-slate-100"
        >
          Next
        </Link>
      )}
      <span className="text-xs text-slate-400 ml-2">
        Page {page} of {totalPages}
      </span>
    </div>
  );
}

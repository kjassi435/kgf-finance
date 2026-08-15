"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar({
  basePath,
  placeholder = "Search...",
  param = "search",
}: {
  basePath: string;
  placeholder?: string;
  param?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get(param) || "");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <form onSubmit={go} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
      />
      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
      >
        Search
      </button>
    </form>
  );
}

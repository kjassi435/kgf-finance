"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DocumentManager({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [docs, setDocs] = useState<any[]>([]);
  const [docType, setDocType] = useState("aadhaar");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch(`/api/admin/customers/${customerId}/documents`);
    const d = await res.json();
    if (res.ok) setDocs(d.documents || []);
  }
  useEffect(() => {
    load();
  }, [customerId]);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("docType", docType);
    const res = await fetch(`/api/admin/customers/${customerId}/documents`, {
      method: "POST",
      body: fd,
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      setMsg(d.error || "Upload failed");
      return;
    }
    setFile(null);
    setMsg("Uploaded");
    load();
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={upload} className="flex flex-wrap gap-3 items-end mb-4">
        <label className="text-sm">
          <span className="text-slate-600 block mb-1">Document Type</span>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="aadhaar">Aadhaar</option>
            <option value="photo">Photo</option>
            <option value="address">Address Proof</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-slate-600 block mb-1">File</span>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !file}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {busy ? "Uploading..." : "Upload"}
        </button>
        {msg && <span className="text-sm text-green-600">{msg}</span>}
      </form>
      <ul className="space-y-1 text-sm">
        {docs.map((d) => (
          <li key={d.id} className="flex items-center gap-2">
            <span className="capitalize text-slate-500">{d.docType}</span>
            <a
              href={d.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline"
            >
              {d.fileName}
            </a>
          </li>
        ))}
        {docs.length === 0 && (
          <li className="text-slate-400">No documents uploaded.</li>
        )}
      </ul>
    </div>
  );
}

"use client";
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
    >
      Print / Download PDF
    </button>
  );
}

import crypto from "crypto";

export function genId(prefix: string): string {
  const rand = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `${prefix}_${rand}`;
}

export function shortId(prefix: string, len = 6): string {
  return `${prefix}-${crypto.randomBytes(len).toString("hex").toUpperCase()}`;
}

export function formatCurrency(amount: number): string {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
}

export function todayISODate(): string {
  // IST-based date so early-morning collections (before 5:30 AM UTC) are not
  // misdated to the previous day.
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}

export function nowTime(): string {
  return new Date()
    .toLocaleTimeString("en-GB", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    })
    .slice(0, 5);
}

export function shiftDate(iso: string, deltaDays: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - deltaDays);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function toDateInput(iso?: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

const PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export function randomPassword(length = 8): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length];
  }
  return out;
}

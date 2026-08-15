import { createHmac } from "crypto";

function secret() {
  return process.env.JWT_SECRET || "dev-insecure-share-secret";
}

/** Stateless, non-guessable share token for a receipt (id.hmac). */
export function receiptShareToken(receiptId: string): string {
  const h = createHmac("sha256", secret()).update(receiptId).digest("base64url");
  return `${receiptId}.${h}`;
}

export function verifyReceiptToken(token: string): string | null {
  if (!token || !token.includes(".")) return null;
  const [id, h] = token.split(".");
  if (!id || !h) return null;
  const expected = createHmac("sha256", secret()).update(id).digest("base64url");
  if (h.length !== expected.length) return null;
  let ok = 0;
  for (let i = 0; i < h.length; i++) ok |= h.charCodeAt(i) ^ expected.charCodeAt(i);
  return ok === 0 ? id : null;
}

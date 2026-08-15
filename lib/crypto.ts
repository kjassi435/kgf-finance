import crypto from "crypto";

function getKey(): Buffer {
  const hex = process.env.AADHAAR_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "AADHAAR_ENCRYPTION_KEY must be 32 bytes (64 hex chars)."
    );
  }
  return Buffer.from(hex, "hex");
}

const ALGO = "aes-256-gcm";

export function encryptSensitive(plain: string): string {
  if (!plain) return "";
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decryptSensitive(stored: string | null | undefined): string {
  if (!stored) return "";
  const key = getKey();
  const [ivHex, tagHex, dataHex] = stored.split(":");
  if (!ivHex || !tagHex || !dataHex) return "";
  const decipher = crypto.createDecipheriv(
    ALGO,
    key,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

export function maskAadhaar(aadhaar: string): string {
  const digits = aadhaar.replace(/\D/g, "");
  if (digits.length < 4) return "XXXX-XXXX-XXXX";
  const last4 = digits.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

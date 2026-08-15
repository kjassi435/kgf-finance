import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, SESSION_MAX_AGE } from "./constants";

export interface SessionPayload {
  sub: string; // user id
  role: string; // admin | agent | customer
  name: string;
  ref?: string; // agentId / customerId / username
}

function getSecret(): Uint8Array {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET is not set. Refusing to sign/verify tokens in production."
      );
    }
    return new TextEncoder().encode("dev-insecure-secret");
  }
  return new TextEncoder().encode(jwtSecret);
}

const secret = getSecret();

export async function signSession(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
}

export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      role: payload.role as string,
      name: payload.name as string,
      ref: payload.ref as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export { COOKIE_NAME, SESSION_MAX_AGE };

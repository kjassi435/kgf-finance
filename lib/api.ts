import { NextResponse } from "next/server";
import { verifySession, COOKIE_NAME, SESSION_MAX_AGE, SessionPayload } from "./auth";
import { NextRequest } from "next/server";

export function json(data: any, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function cleanMessage(e: any): string {
  if (e?.name === "ZodError" && Array.isArray(e.issues) && e.issues.length) {
    return e.issues.map((i: any) => `${i.path?.join(".") || "field"}: ${i.message}`).join("; ");
  }
  if (e?.message) return e.message;
  return "Something went wrong";
}

export async function getReqSession(
  req: NextRequest
): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export function setSessionCookie(res: NextResponse, token: string, secure = false) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

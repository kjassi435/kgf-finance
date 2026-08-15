import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "kgf_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-insecure-secret");

async function verifyJwt(token?: string): Promise<{ role: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { role: payload.role as string };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE)?.value;
  const session = await verifyJwt(token);

  const protectedPrefixes = ["/admin", "/agent", "/customer"];

  if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (!pathname.startsWith(`/${session.role}`)) {
      const url = req.nextUrl.clone();
      url.pathname = `/${session.role}`;
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/login" && session) {
    const url = req.nextUrl.clone();
    url.pathname = `/${session.role}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/agent/:path*", "/customer/:path*", "/login"],
};

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  let parsedBody: any = {};
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {}
  
  return NextResponse.json({
    rawBody,
    parsedBody,
    contentType: req.headers.get("content-type"),
    keys: Object.keys(parsedBody),
    identifierType: typeof parsedBody.identifier,
    passwordType: typeof parsedBody.password,
  });
}
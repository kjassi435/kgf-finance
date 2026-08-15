import { NextRequest } from "next/server";
import { json, error, getReqSession, cleanMessage } from "@/lib/api";
import { getCustomer, updateCustomer, deleteCustomer } from "@/lib/services/customers";
import { decryptSensitive } from "@/lib/crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const { id } = await params;
  const c = await getCustomer(id);
  if (!c) return error("Not found", 404);
  const out = { ...c, aadhaar: decryptSensitive(c.aadhaarEnc) };
  return json({ customer: out });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const updated = await updateCustomer(id, body, { type: "admin", id: s.sub });
    return json({ ok: true, customer: updated });
  } catch (e: any) {
    return error(cleanMessage(e), 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const { id } = await params;
  try {
    await deleteCustomer(id, { type: "admin", id: s.sub });
    return json({ ok: true });
  } catch (e: any) {
    return error(cleanMessage(e), 400);
  }
}

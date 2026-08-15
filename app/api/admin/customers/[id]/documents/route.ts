import { NextRequest } from "next/server";
import { json, error, getReqSession, cleanMessage } from "@/lib/api";
import { db } from "@/lib/db";
import { customerDocuments } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { genId } from "@/lib/id";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const { id } = await params;
  const rows = await db
    .select()
    .from(customerDocuments)
    .where(eq(customerDocuments.customerId, id))
    .orderBy(customerDocuments.createdAt);
  return json({ documents: rows });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const { id } = await params;
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const docType = (form.get("docType") as string) || "other";
    if (!file || file.size === 0) return error("No file provided", 400);

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const ext = path.extname(file.name).replace(/[^.a-zA-Z0-9]/g, "").slice(0, 10);
    const safeName = `${genId("DOC")}${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, safeName), buf);

    const [row] = await db
      .insert(customerDocuments)
      .values({
        id: genId("CDOC"),
        customerId: id,
        docType,
        fileName: file.name,
        fileUrl: `/uploads/${safeName}`,
        uploadedById: s.sub,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return json({ ok: true, document: row }, 201);
  } catch (e: any) {
    return error(cleanMessage(e), 400);
  }
}

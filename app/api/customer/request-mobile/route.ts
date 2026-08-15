import { NextRequest } from "next/server";
import { json, error, getReqSession } from "@/lib/api";
import { notify } from "@/lib/notifications";
import { NOTIFICATION_TYPES } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || s.role !== "customer") return error("Forbidden", 403);
  const body = await req.json().catch(() => ({}));
  const newMobile = String(body.mobile || "").trim();
  if (!/^\d{10,15}$/.test(newMobile))
    return error("Enter a valid mobile number");

  await notify({
    type: NOTIFICATION_TYPES.PAYMENT_REMINDER,
    channel: "inapp",
    recipientType: "admin",
    recipientId: "system",
    message: `Mobile update request from customer ${s.ref}: new mobile ${newMobile}`,
  });
  return json({ ok: true, message: "Request sent to admin for approval" });
}

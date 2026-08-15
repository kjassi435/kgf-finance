import { db } from "./db";
import { notifications } from "./schema";
import { genId } from "./id";
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUS,
  NOTIFICATION_TYPES,
} from "./constants";

interface NotifyInput {
  type: string;
  channel: string;
  recipientType: "admin" | "agent" | "customer";
  recipientId: string;
  message: string;
}

/**
 * Notification service (stub architecture).
 * Records the notification in the DB. Real SMS/WhatsApp/Email delivery
 * can be plugged in here later (Twilio, MSG91, WhatsApp Business API, etc.)
 * without changing call sites.
 */
export async function notify(input: NotifyInput): Promise<void> {
  let status: string = NOTIFICATION_STATUS.PENDING;
  try {
    // Best-effort real delivery when a webhook is configured. Swap this for
    // Twilio / MSG91 / WhatsApp Business API as needed. The DB record is the
    // source of truth; status flips to "sent" only on success.
    const webhook = process.env.NOTIFICATION_WEBHOOK;
    if (webhook) {
      try {
        const res = await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: input.channel,
            to: input.recipientId,
            type: input.type,
            message: input.message,
          }),
        });
        if (res.ok) status = NOTIFICATION_STATUS.SENT;
      } catch (e) {
        console.error("Notification delivery failed", e);
      }
    }

    await db.insert(notifications).values({
      id: genId("NTF"),
      type: input.type,
      channel: input.channel,
      recipientType: input.recipientType,
      recipientId: input.recipientId,
      message: input.message,
      status,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Notification failed", e);
  }
}

export async function notifyPaymentConfirmation(
  recipient: { type: "agent" | "customer"; id: string },
  data: { name: string; amount: number; date: string }
): Promise<void> {
  const message = `Hello ${data.name}, ₹${data.amount} collected on ${data.date}. Thank you!`;
  await notify({
    type: NOTIFICATION_TYPES.PAYMENT_CONFIRMATION,
    channel: "sms",
    recipientType: recipient.type,
    recipientId: recipient.id,
    message,
  });
}

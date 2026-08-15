export const ROLES = {
  ADMIN: "admin",
  AGENT: "agent",
  CUSTOMER: "customer",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const AGENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const PAYMENT_MODES = ["cash", "upi", "bank_transfer", "other"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const COLLECTION_FREQUENCY = ["daily", "weekly", "monthly"] as const;
export type CollectionFrequency = (typeof COLLECTION_FREQUENCY)[number];

export const PLAN_TYPES = ["basic", "standard", "premium", "custom"] as const;

export const NOTIFICATION_TYPES = {
  PAYMENT_CONFIRMATION: "payment_confirmation",
  PAYMENT_REMINDER: "payment_reminder",
  PENDING_ALERT: "pending_alert",
  NEW_CUSTOMER: "new_customer",
  AGENT_ASSIGNMENT: "agent_assignment",
} as const;

export const NOTIFICATION_CHANNELS = ["sms", "whatsapp", "email", "inapp"] as const;

export const NOTIFICATION_STATUS = {
  PENDING: "pending",
  SENT: "sent",
  FAILED: "failed",
} as const;

export const AUDIT_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LOGIN: "login",
  LOGOUT: "logout",
  COLLECTION: "collection",
  EXPORT: "export",
} as const;

export const COOKIE_NAME = "kgf_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function roleHome(role: string): string {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin";
    case ROLES.AGENT:
      return "/agent";
    case ROLES.CUSTOMER:
      return "/customer";
    default:
      return "/login";
  }
}

import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";

// ---------- Admins ----------
export const admins = sqliteTable("admins", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  status: text("status").notNull().default("active"),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ---------- Agents ----------
export const agents = sqliteTable(
  "agents",
  {
    id: text("id").primaryKey(),
    agentId: text("agent_id").notNull().unique(),
    name: text("name").notNull(),
    mobile: text("mobile").notNull(),
    email: text("email"),
    passwordHash: text("password_hash").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    createdBy: text("created_by"),
  },
  (t) => ({
    mobileIdx: index("agents_mobile_idx").on(t.mobile),
  })
);

// ---------- Customers ----------
export const customers = sqliteTable(
  "customers",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id").notNull().unique(),
    name: text("name").notNull(),
    fatherHusbandName: text("father_husband_name"),
    dob: text("dob"),
    gender: text("gender"),
    aadhaarEnc: text("aadhaar_enc"),
    aadhaarMask: text("aadhaar_mask"),
    mobile: text("mobile"),
    alternateMobile: text("alternate_mobile"),
    fullAddress: text("full_address"),
    village: text("village"),
    post: text("post"),
    tehsil: text("tehsil"),
    district: text("district"),
    state: text("state"),
    pin: text("pin"),
    registrationDate: text("registration_date"),
    assignedAgentId: text("assigned_agent_id"),
    dailyCollectionAmount: real("daily_collection_amount").notNull().default(0),
    collectionFrequency: text("collection_frequency").notNull().default("daily"),
    planType: text("plan_type").notNull().default("basic"),
    totalDeposited: real("total_deposited").notNull().default(0),
    totalPending: real("total_pending").notNull().default(0),
    accountStatus: text("account_status").notNull().default("active"),
    passwordHash: text("password_hash"),
    loginEnabled: integer("login_enabled").notNull().default(1),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    createdBy: text("created_by"),
  },
  (t) => ({
    agentIdx: index("customers_agent_idx").on(t.assignedAgentId),
    statusIdx: index("customers_status_idx").on(t.accountStatus),
    mobileIdx: index("customers_mobile_idx").on(t.mobile),
  })
);

// ---------- Agent-Customer Assignments ----------
export const agentCustomerAssignments = sqliteTable(
  "agent_customer_assignments",
  {
    id: text("id").primaryKey(),
    agentId: text("agent_id").notNull(),
    customerId: text("customer_id").notNull(),
    active: integer("active").notNull().default(1),
    assignedAt: text("assigned_at").notNull(),
    assignedBy: text("assigned_by"),
  },
  (t) => ({
    agentIdx: index("aca_agent_idx").on(t.agentId),
    custIdx: index("aca_cust_idx").on(t.customerId),
  })
);

// ---------- Collections (also payment transactions) ----------
export const collections = sqliteTable(
  "collections",
  {
    id: text("id").primaryKey(),
    collectionId: text("collection_id").notNull().unique(),
    customerId: text("customer_id").notNull(),
    agentId: text("agent_id").notNull(),
    date: text("date").notNull(), // YYYY-MM-DD
    time: text("time").notNull(), // HH:mm
    amount: real("amount").notNull(),
    paymentMode: text("payment_mode").notNull().default("cash"),
    transactionRef: text("transaction_ref"),
    remarks: text("remarks"),
    collectedById: text("collected_by_id").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    custIdx: index("collections_cust_idx").on(t.customerId),
    agentIdx: index("collections_agent_idx").on(t.agentId),
    dateIdx: index("collections_date_idx").on(t.date),
  })
);

// ---------- Receipts ----------
export const receipts = sqliteTable(
  "receipts",
  {
    id: text("id").primaryKey(),
    receiptNumber: text("receipt_number").notNull().unique(),
    collectionId: text("collection_id").notNull(),
    customerId: text("customer_id").notNull(),
    agentId: text("agent_id").notNull(),
    amount: real("amount").notNull(),
    previousBalance: real("previous_balance").notNull(),
    currentBalance: real("current_balance").notNull(),
    generatedAt: text("generated_at").notNull(),
  },
  (t) => ({
    collIdx: index("receipts_coll_idx").on(t.collectionId),
    custIdx: index("receipts_cust_idx").on(t.customerId),
  })
);

// ---------- Notifications (stub architecture) ----------
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  channel: text("channel").notNull(),
  recipientType: text("recipient_type").notNull(),
  recipientId: text("recipient_id").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
});

// ---------- Payment Transactions (dedicated ledger for audit/refunds) ----------
export const paymentTransactions = sqliteTable(
  "payment_transactions",
  {
    id: text("id").primaryKey(),
    transactionId: text("transaction_id").notNull().unique(),
    collectionId: text("collection_id"),
    customerId: text("customer_id").notNull(),
    agentId: text("agent_id"),
    date: text("date").notNull(),
    amount: real("amount").notNull(),
    paymentMode: text("payment_mode").notNull().default("cash"),
    transactionRef: text("transaction_ref"),
    type: text("type").notNull().default("collection"), // collection | refund | adjustment
    status: text("status").notNull().default("success"),
    createdAt: text("created_at").notNull(),
  },
  (t) => ({
    custIdx: index("pt_cust_idx").on(t.customerId),
    dateIdx: index("pt_date_idx").on(t.date),
  })
);

// ---------- Customer Documents ----------
export const customerDocuments = sqliteTable(
  "customer_documents",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id").notNull(),
    docType: text("doc_type").notNull(), // aadhaar | photo | address | other
    fileName: text("file_name"),
    fileUrl: text("file_url"),
    uploadedById: text("uploaded_by_id"),
    createdAt: text("created_at").notNull(),
  },
  (t) => ({
    custIdx: index("cd_cust_idx").on(t.customerId),
  })
);

// ---------- Audit Logs ----------
export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actorType: text("actor_type").notNull(),
    actorId: text("actor_id").notNull(),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    details: text("details"),
    ip: text("ip"),
    createdAt: text("created_at").notNull(),
  },
  (t) => ({
    actorIdx: index("audit_actor_idx").on(t.actorId),
    createdIdx: index("audit_created_idx").on(t.createdAt),
  })
);

// ---------- Settings ----------
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: text("updated_at").notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type Receipt = typeof receipts.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type CustomerDocument = typeof customerDocuments.$inferSelect;

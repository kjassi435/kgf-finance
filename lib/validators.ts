import { z } from "zod";
import { PAYMENT_MODES, COLLECTION_FREQUENCY, PLAN_TYPES } from "./constants";
import { todayISODate } from "./id";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Identifier required"),
  password: z.string().min(1, "Password required"),
});

export const customerCreateSchema = z.object({
  name: z.string().min(1, "Name required"),
  fatherHusbandName: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  aadhaar: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar must be 12 digits")
    .optional()
    .or(z.literal("")),
  mobile: z.string().min(10, "Mobile required"),
  alternateMobile: z.string().optional(),
  fullAddress: z.string().optional(),
  village: z.string().optional(),
  post: z.string().optional(),
  tehsil: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pin: z.string().optional(),
  registrationDate: z.string().optional(),
  assignedAgentId: z.string().optional(),
  dailyCollectionAmount: z.coerce.number().min(0).default(0),
  collectionFrequency: z.enum(COLLECTION_FREQUENCY).default("daily"),
  planType: z.enum(PLAN_TYPES).default("basic"),
  accountStatus: z.enum(["active", "inactive"]).default("active"),
});

export const customerUpdateSchema = customerCreateSchema.partial();

export const agentCreateSchema = z.object({
  name: z.string().min(1, "Name required"),
  mobile: z.string().min(10, "Mobile required"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6, "Password min 6 chars"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const adminCreateSchema = z.object({
  name: z.string().min(1, "Name required"),
  username: z.string().min(3, "Username min 3 chars"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6, "Password min 6 chars"),
});

export const agentUpdateSchema = z.object({
  name: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
  password: z.string().min(4).optional(),
});

export const assignmentSchema = z.object({
  agentId: z.string().min(1),
  customerId: z.string().min(1),
  active: z.boolean().default(true),
});

export const collectionCreateSchema = z.object({
  customerId: z.string().min(1, "Customer required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .refine((d) => d <= todayISODate(), "Date cannot be in the future"),
  time: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentMode: z.enum(PAYMENT_MODES).default("cash"),
  transactionRef: z.string().optional(),
  remarks: z.string().optional(),
});

export const reportFilterSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  agentId: z.string().optional(),
  customerId: z.string().optional(),
  paymentMode: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "New password min 6 chars"),
});

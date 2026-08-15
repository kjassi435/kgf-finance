import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:./local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

// Reuse a single client across hot reloads in dev
const globalForDb = globalThis as unknown as {
  __libsqlClient?: ReturnType<typeof createClient>;
};

const client =
  globalForDb.__libsqlClient ??
  createClient({ url, authToken });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__libsqlClient = client;
}

export const db = drizzle(client, { schema });
export { client as libsqlClient };

import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Generate a sequential code using MAX(existing) + 1 instead of COUNT + 1.
 * This is safe against deletions / re-inserts (no duplicate codes), which the
 * previous COUNT-based approach allowed.
 */
export async function nextCode(
  prefix: string,
  column: any,
  table: any,
  pad = 4,
  runner: any = db
): Promise<string> {
  const [row] = await runner
    .select({ m: sql<string | null>`MAX(${column})` })
    .from(table);
  let n = 1;
  if (row?.m) {
    const match = (row.m as string).match(/(\d+)\s*$/);
    if (match) n = parseInt(match[1], 10) + 1;
  }
  return `${prefix}-${String(n).padStart(pad, "0")}`;
}

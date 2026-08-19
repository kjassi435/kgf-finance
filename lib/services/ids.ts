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
  runner: any = db,
  retries = 3
): Promise<string> {
  try {
    const [row] = await runner
      .select({ m: sql<string | null>`MAX(${column})` })
      .from(table);
    let n = 1;
    if (row?.m) {
      const match = (row.m as string).match(/(\d+)\s*$/);
      if (match) n = parseInt(match[1], 10) + 1;
    }
    return `${prefix}-${String(n).padStart(pad, "0")}`;
  } catch (e: any) {
    const errStr = String(e?.message || e?.cause?.message || e?.toString?.() || JSON.stringify(e) || e || "").toLowerCase();
    const isUnique = errStr.includes("unique constraint") ||
      errStr.includes("duplicate") ||
      errStr.includes("constraint failed") ||
      errStr.includes("unique") ||
      errStr.includes("constraint") ||
      errStr.includes("failed query") ||
      errStr.includes("19") ||
      errStr.includes("sql") ||
      (errStr.includes("insert") && errStr.includes("receipt")) ||
      false;
    if (retries > 0 && isUnique) {
      await new Promise((r) => setTimeout(r, 50 * (4 - retries)));
      return nextCode(prefix, column, table, pad, runner, retries - 1);
    }
    throw e;
  }
}

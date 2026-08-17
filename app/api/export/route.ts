import { NextRequest } from "next/server";
import { json, error, getReqSession } from "@/lib/api";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

export const runtime = "nodejs";

import { listCustomers } from "@/lib/services/customers";
import { listCollections } from "@/lib/services/collections";
import {
  agentPerformance,
  paymentModeReport,
  monthlySeries,
  yearSeries,
  customerReport,
} from "@/lib/services/reports";
import { pendingCustomers } from "@/lib/services/customers";

function pdfToBuffer(doc: any): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

export async function GET(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") || "customers";
  const from = sp.get("from") || undefined;
  const to = sp.get("to") || undefined;
  const agentId = sp.get("agentId") || undefined;
  const format = sp.get("format") || "excel";

  if (format === "pdf") {
    let doc = new PDFDocument({ margin: 30, size: "A4" });
    doc.fontSize(16).text("Kalyan Gold Fund Collection Report", { align: "center" });
    doc.fontSize(10).text(`Type: ${type}   Range: ${from || "all"} to ${to || "all"}`, { align: "center" });
    doc.moveDown();

    if (type === "collections" || type === "daily") {
      const { rows } = await listCollections({ from, to, agentId });
      doc.fontSize(10).text(
        rows.map((r) => `${r.date} | ${r.collectionId} | ₹${r.amount} | ${r.paymentMode}`).join("\n")
      );
    } else if (type === "agent-performance") {
      const rows = await agentPerformance();
      doc.fontSize(10).text(
        rows.map((r) => `${r.agentName}: ₹${r.collected} (${r.count} collections)`).join("\n")
      );
    } else if (type === "payment-mode") {
      const rows = await paymentModeReport(from, to);
      doc.fontSize(10).text(
        rows.map((r) => `${r.mode}: ₹${r.sum} (${r.count})`).join("\n")
      );
    } else if (type === "monthly") {
      const rows = await monthlySeries(12);
      doc.fontSize(10).text(rows.map((r) => `${r.month}: ₹${r.amount}`).join("\n"));
    } else if (type === "yearly") {
      const rows = await yearSeries(5);
      doc.fontSize(10).text(rows.map((r) => `${r.year}: ₹${r.amount}`).join("\n"));
    } else if (type === "pending") {
      const rows = await pendingCustomers();
      doc.fontSize(10).text(
        rows.map((r) => `${r.name} (${r.customerId}): ₹${r.totalPending} pending`).join("\n")
      );
    } else if (type === "customer") {
      const rows = await listCustomers({ limit: 5000 });
      doc.fontSize(10).text(
        rows
          .map((r) => `${r.name}: ₹${r.totalDeposited} dep / ₹${r.totalPending} pend`)
          .join("\n")
      );
    } else {
      const rows = await listCustomers({ agentId });
      doc.fontSize(10).text(
        rows.map((r) => `${r.customerId} | ${r.name} | ₹${r.totalDeposited} dep | ₹${r.totalPending} pend`).join("\n")
      );
    }
    doc.end();
    const buf = await pdfToBuffer(doc);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${type}-report.pdf`,
      },
    });
  }

  // Excel
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Report");
  if (type === "collections" || type === "daily") {
    const { rows } = await listCollections({ from, to, agentId });
    ws.columns = [
      { header: "Collection ID", key: "collectionId" },
      { header: "Date", key: "date" },
      { header: "Customer ID", key: "customerId" },
      { header: "Agent ID", key: "agentId" },
      { header: "Amount", key: "amount" },
      { header: "Mode", key: "paymentMode" },
      { header: "Ref", key: "transactionRef" },
    ];
    rows.forEach((r) => ws.addRow(r));
  } else if (type === "agent-performance") {
    const rows = await agentPerformance();
    ws.columns = [
      { header: "Agent", key: "agentName" },
      { header: "Collected", key: "collected" },
      { header: "Count", key: "count" },
    ];
    rows.forEach((r) => ws.addRow(r));
  } else if (type === "payment-mode") {
    const rows = await paymentModeReport(from, to);
    ws.columns = [
      { header: "Mode", key: "mode" },
      { header: "Total", key: "sum" },
      { header: "Count", key: "count" },
    ];
    rows.forEach((r) => ws.addRow(r));
  } else if (type === "monthly") {
    const rows = await monthlySeries(12);
    ws.columns = [
      { header: "Month", key: "month" },
      { header: "Collected", key: "amount" },
    ];
    rows.forEach((r) => ws.addRow(r));
  } else if (type === "yearly") {
    const rows = await yearSeries(5);
    ws.columns = [
      { header: "Year", key: "year" },
      { header: "Collected", key: "amount" },
    ];
    rows.forEach((r) => ws.addRow(r));
  } else if (type === "pending") {
    const rows = await pendingCustomers();
    ws.columns = [
      { header: "Customer ID", key: "customerId" },
      { header: "Name", key: "name" },
      { header: "Mobile", key: "mobile" },
      { header: "Daily", key: "dailyCollectionAmount" },
      { header: "Pending", key: "totalPending" },
    ];
    rows.forEach((r) => ws.addRow(r));
  } else if (type === "customer") {
    const rows = await customerReport({ from, to });
    ws.columns = [
      { header: "Customer ID", key: "customerId" },
      { header: "Name", key: "name" },
      { header: "Mobile", key: "mobile" },
      { header: "Plan", key: "planType" },
      { header: "Deposited", key: "totalDeposited" },
      { header: "Pending", key: "totalPending" },
      { header: "Last Paid", key: "lastPaymentDate" },
    ];
    rows.forEach((r) => ws.addRow(r));
  } else {
    const rows = await listCustomers({ agentId });
    ws.columns = [
      { header: "Customer ID", key: "customerId" },
      { header: "Name", key: "name" },
      { header: "Mobile", key: "mobile" },
      { header: "Agent ID", key: "assignedAgentId" },
      { header: "Plan", key: "planType" },
      { header: "Daily", key: "dailyCollectionAmount" },
      { header: "Deposited", key: "totalDeposited" },
      { header: "Pending", key: "totalPending" },
      { header: "Status", key: "accountStatus" },
    ];
    rows.forEach((r) => ws.addRow(r));
  }

  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=${type}-report.xlsx`,
    },
  });
}

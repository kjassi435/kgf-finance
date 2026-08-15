import { PageHeader, Card } from "@/components/ui";
import ExportPanel from "@/components/ExportPanel";
import { PrintButton } from "@/components/PrintButton";
import HistoryToolbar from "@/components/HistoryToolbar";
import {
  agentPerformance,
  paymentModeReport,
  dateRangeTotals,
  monthlySeries,
  customerReport,
  yearSeries,
} from "@/lib/services/reports";
import { pendingCustomers } from "@/lib/services/customers";
import { formatCurrency } from "@/lib/id";
import { Table, Badge } from "@/components/ui";
import { Suspense } from "react";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const [agents, modes, totals, monthly, yearly, custReport, pending] =
    await Promise.all([
      agentPerformance(),
      paymentModeReport(sp.from, sp.to),
      dateRangeTotals({ from: sp.from, to: sp.to }),
      monthlySeries(12),
      yearSeries(5),
      customerReport({ from: sp.from, to: sp.to }),
      pendingCustomers(),
    ]);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Export & analyze collection data"
        action={
          <div className="no-print flex gap-2">
            <PrintButton />
          </div>
        }
      />
      <div className="no-print mb-4">
        <ExportPanel />
      </div>

      <div className="no-print mb-4">
        <Suspense fallback={null}>
          <HistoryToolbar />
        </Suspense>
      </div>

      <div className="print-area">
        <div className="text-xl font-bold mb-4">KGF Collection — Reports</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="text-xs uppercase text-slate-500">Total Collected</div>
            <div className="text-2xl font-bold text-indigo-600">
              {formatCurrency(totals.total)}
            </div>
            <div className="text-xs text-slate-400">{totals.count} entries</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold mb-3">Agent Performance</h3>
            <Table headers={["Agent", "Collected", "Entries"]}>
              {agents.map((a) => (
                <tr key={a.agentId} className="border-b border-slate-100">
                  <td className="py-2 px-3">{a.agentName}</td>
                  <td className="py-2 px-3 font-semibold">{formatCurrency(a.collected)}</td>
                  <td className="py-2 px-3">{a.count}</td>
                </tr>
              ))}
            </Table>
          </Card>
          <Card>
            <h3 className="font-semibold mb-3">Payment Mode</h3>
            <Table headers={["Mode", "Total", "Count"]}>
              {modes.map((m) => (
                <tr key={m.mode} className="border-b border-slate-100">
                  <td className="py-2 px-3">
                    <Badge tone="blue">{m.mode}</Badge>
                  </td>
                  <td className="py-2 px-3 font-semibold">{formatCurrency(m.sum)}</td>
                  <td className="py-2 px-3">{m.count}</td>
                </tr>
              ))}
            </Table>
          </Card>
          <Card>
            <h3 className="font-semibold mb-3">Monthly Collection (12 months)</h3>
            <Table headers={["Month", "Collected"]}>
              {monthly.map((m) => (
                <tr key={m.month} className="border-b border-slate-100">
                  <td className="py-2 px-3">{m.month}</td>
                  <td className="py-2 px-3 font-semibold">{formatCurrency(m.amount)}</td>
                </tr>
              ))}
            </Table>
          </Card>
          <Card>
            <h3 className="font-semibold mb-3">Yearly Collection (5 years)</h3>
            <Table headers={["Year", "Collected"]}>
              {yearly.map((y) => (
                <tr key={y.year} className="border-b border-slate-100">
                  <td className="py-2 px-3">{y.year}</td>
                  <td className="py-2 px-3 font-semibold">{formatCurrency(y.amount)}</td>
                </tr>
              ))}
            </Table>
          </Card>
          <Card>
            <h3 className="font-semibold mb-3">Customer Payment History (Top Depositors)</h3>
            <Table headers={["Customer", "Plan", "Deposited", "Pending", "Last Paid"]}>
              {custReport.slice(0, 15).map((c: any) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-2 px-3">
                    {c.name}{" "}
                    <span className="text-slate-400 font-mono text-xs">
                      ({c.customerId})
                    </span>
                  </td>
                  <td className="py-2 px-3">{c.planType}</td>
                  <td className="py-2 px-3">{formatCurrency(c.totalDeposited)}</td>
                  <td className="py-2 px-3 text-rose-600">{formatCurrency(c.totalPending)}</td>
                  <td className="py-2 px-3 text-xs">{c.lastPaymentDate || "-"}</td>
                </tr>
              ))}
            </Table>
          </Card>
          <Card>
            <h3 className="font-semibold mb-3">Pending Payments</h3>
            <Table headers={["Customer", "Mobile", "Daily", "Pending"]}>
              {pending.slice(0, 15).map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-2 px-3">{c.name}</td>
                  <td className="py-2 px-3">{c.mobile}</td>
                  <td className="py-2 px-3">{formatCurrency(c.dailyCollectionAmount)}</td>
                  <td className="py-2 px-3 text-rose-600 font-semibold">
                    {formatCurrency(c.totalPending)}
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">
                    No pending payments.
                  </td>
                </tr>
              )}
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#8b5cf6"];

export function DailyLineChart({ data }: { data: { date: string; amount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MonthlyBarChart({ data }: { data: { month: string; amount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AgentBarChart({
  data,
}: {
  data: { agentName: string; collected: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="agentName" tick={{ fontSize: 11 }} width={90} />
        <Tooltip />
        <Bar dataKey="collected" fill="#4f46e5" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ModePieChart({
  data,
}: {
  data: { mode: string; sum: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="sum"
          nameKey="mode"
          outerRadius={90}
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CustomerBarChart({
  data,
}: {
  data: { name: string; amount: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
        <Tooltip />
        <Bar dataKey="amount" fill="#f59e0b" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

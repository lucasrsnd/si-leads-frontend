"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  ArrowUpRight,
} from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { ChatBot } from "../../components/chat/ChatBot";
import { dashboardApi } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";
import { STATUS_LABELS } from "../../lib/utils";

const STATUS_COLORS_CHART = [
  "#6366f1",
  "#f59e0b",
  "#8b5cf6",
  "#f97316",
  "#22c55e",
  "#ef4444",
];

function StatCard({ label, value, icon: Icon, color, bg, delay }: any) {
  return (
    <div
      className={`bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] card-hover animate-fade-up relative overflow-hidden`}
      style={{ animationDelay: `${delay * 0.05}s` }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-6 translate-x-6"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] opacity-30" />
      </div>
      <p className="text-2xl font-bold text-[var(--text)] mb-0.5">{value}</p>
      <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-[var(--text)]">{label}</p>
        <p className="text-indigo-500">{payload[0].value} leads</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { init } = useAuthStore();

  useEffect(() => {
    init();
    if (!localStorage.getItem("si_token")) router.push("/login");
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.metrics().then((r) => r.data),
  });

  const statusData = data
    ? Object.entries(data.byStatus).map(([k, v]) => ({
        name: STATUS_LABELS[k as any] || k,
        value: v as number,
      }))
    : [];

  const cards = [
    {
      label: "Total de Leads",
      value: data?.totalLeads || 0,
      icon: Users,
      color: "#6366f1",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      delay: 1,
    },
    {
      label: "Taxa de Conversão",
      value: `${data?.conversionRate || 0}%`,
      icon: TrendingUp,
      color: "#22c55e",
      bg: "bg-green-50 dark:bg-green-900/20",
      delay: 2,
    },
    {
      label: "Fechados",
      value: data?.byStatus?.FECHADO || 0,
      icon: CheckCircle,
      color: "#22c55e",
      bg: "bg-green-50 dark:bg-green-900/20",
      delay: 3,
    },
    {
      label: "Perdidos",
      value: data?.byStatus?.PERDIDO || 0,
      icon: XCircle,
      color: "#ef4444",
      bg: "bg-red-50 dark:bg-red-900/20",
      delay: 4,
    },
    {
      label: "Qualificados",
      value: data?.byStatus?.QUALIFICADO || 0,
      icon: Award,
      color: "#8b5cf6",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      delay: 5,
    },
    {
      label: "Em Contato",
      value: data?.byStatus?.EM_CONTATO || 0,
      icon: Clock,
      color: "#f59e0b",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      delay: 6,
    },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="skeleton h-8 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="skeleton h-64 rounded-2xl" />
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-up">
          <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">
            Visão geral dos seus leads
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] animate-fade-up stagger-3">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-5">
              Leads por Status
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} barSize={24}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "var(--surface-2)", radius: 6 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLORS_CHART[i % STATUS_COLORS_CHART.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] animate-fade-up stagger-4">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-5">
              Distribuição
            </h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statusData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          STATUS_COLORS_CHART[i % STATUS_COLORS_CHART.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: STATUS_COLORS_CHART[i] }}
                    />
                    <span className="text-xs text-[var(--text-muted)] truncate flex-1">
                      {d.name}
                    </span>
                    <span className="text-xs font-bold text-[var(--text)]">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden animate-fade-up stagger-5">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Leads recentes
            </h3>
            <span className="text-xs text-[var(--text-muted)]">
              Últimas entradas
            </span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {data?.recentLeads?.map((lead: any, i: number) => (
              <div
                key={lead.id}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-[var(--surface-2)] transition animate-fade-up"
                style={{ animationDelay: `${i * 0.05 + 0.3}s` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    }}
                  >
                    {lead.name[0]}
                  </div>
                  <p className="text-sm font-medium text-[var(--text)]">
                    {lead.name}
                  </p>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ChatBot />
    </AppLayout>
  );
}

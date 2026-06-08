'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { ChatBot } from '../../components/chat/ChatBot';
import { dashboardApi } from '../../lib/api';
import { useAuthStore } from '../../lib/auth-store';
import { STATUS_LABELS } from '../../lib/utils';

const STATUS_CHART_COLORS = ['#3b82f6','#eab308','#a855f7','#f97316','#22c55e','#ef4444'];

export default function DashboardPage() {
  const router = useRouter();
  const { user, init } = useAuthStore();

  useEffect(() => {
    init();
    if (!localStorage.getItem('si_token')) router.push('/login');
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.metrics().then((r) => r.data),
  });

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  const statusData = data ? Object.entries(data.byStatus).map(([k, v]) => ({
    name: STATUS_LABELS[k as any] || k, value: v as number,
  })) : [];

  const cards = [
    { label: 'Total de Leads', value: data?.totalLeads || 0, icon: Users, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { label: 'Taxa de Conversão', value: `${data?.conversionRate || 0}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Fechados', value: data?.byStatus?.FECHADO || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Perdidos', value: data?.byStatus?.PERDIDO || 0, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Qualificados', value: data?.byStatus?.QUALIFICADO || 0, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Em Contato', value: data?.byStatus?.EM_CONTATO || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">Visão geral dos seus leads</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="bg-[var(--surface)] rounded-xl p-5 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Leads por Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((_, i) => <Cell key={i} fill={STATUS_CHART_COLORS[i % STATUS_CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-[var(--surface)] rounded-xl p-5 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Distribuição por Status</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {statusData.map((_, i) => <Cell key={i} fill={STATUS_CHART_COLORS[i % STATUS_CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {statusData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_CHART_COLORS[i] }} />
                    <span className="text-xs text-[var(--text-muted)] truncate">{d.name}</span>
                    <span className="text-xs font-semibold text-[var(--text)] ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent leads */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text)]">Últimos Leads</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {data?.recentLeads?.map((lead: any) => (
              <div key={lead.id} className="px-5 py-3 flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--text)]">{lead.name}</p>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
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

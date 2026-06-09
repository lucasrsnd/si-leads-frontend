"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Download,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { ChatBot } from "../../components/chat/ChatBot";
import { LeadModal } from "../../components/leads/LeadModal";
import { leadsApi } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";
import { Lead, LeadStatus } from "../../types";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  downloadCsv,
  cn,
} from "../../lib/utils";

export default function LeadsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [myLeads, setMyLeads] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();

  useEffect(() => {
    if (!localStorage.getItem("si_token")) router.push("/login");
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["leads", search, statusFilter, myLeads, page],
    queryFn: () =>
      leadsApi
        .list({
          search: search || undefined,
          status: statusFilter || undefined,
          myLeads: myLeads ? "true" : undefined,
          page,
          limit: 15,
        } as any)
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deletar o lead "${name}"?`)) return;
    try {
      await leadsApi.delete(id);
      toast.success("Lead removido");
      qc.invalidateQueries({ queryKey: ["leads"] });
    } catch {
      toast.error("Erro ao deletar");
    }
  };

  const handleExport = async () => {
    try {
      const { data: blob } = await leadsApi.exportCsv();
      downloadCsv(blob, `leads-${new Date().toISOString().split("T")[0]}.csv`);
      toast.success("CSV exportado!");
    } catch {
      toast.error("Erro ao exportar");
    }
  };

  const STATUSES: LeadStatus[] = [
    "NOVO",
    "EM_CONTATO",
    "QUALIFICADO",
    "PROPOSTA",
    "FECHADO",
    "PERDIDO",
  ];

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3 animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Leads</h1>
            <p className="text-[var(--text-muted)] text-sm mt-0.5">
              {data?.total || 0} leads encontrados
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 border border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text)] text-sm font-medium px-3 py-2 rounded-xl transition"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
            <button
              onClick={() => {
                setEditingLead(undefined);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              <Plus className="w-4 h-4" /> Novo Lead
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 animate-fade-up stagger-1">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nome, email ou telefone..."
              className="w-full pl-9 pr-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="border border-[var(--border)] rounded-xl text-sm px-3 py-2.5 bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Todos os status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setMyLeads(!myLeads);
              setPage(1);
            }}
            className={cn(
              "flex items-center gap-2 text-sm font-medium px-3 py-2.5 rounded-xl border transition-all",
              myLeads
                ? "border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]",
            )}
          >
            <User className="w-3.5 h-3.5" />
            Meus Leads
          </button>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden animate-fade-up stagger-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                  {[
                    "Nome",
                    "Contato",
                    "Status",
                    "Prioridade",
                    "Responsável",
                    "Criado em",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-[var(--text-muted)] px-4 py-3 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-[var(--text-muted)]"
                    >
                      <div className="flex justify-center">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : data?.data?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-[var(--text-muted)]"
                    >
                      Nenhum lead encontrado
                    </td>
                  </tr>
                ) : (
                  data?.data?.map((lead: Lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            }}
                          >
                            {lead.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text)]">
                              {lead.name}
                            </p>
                            {lead.notes && (
                              <p className="text-xs text-[var(--text-muted)] truncate max-w-40">
                                {lead.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[var(--text-muted)]">
                          {lead.phone || "—"}
                        </p>
                        <p className="text-[var(--text-muted)] text-xs">
                          {lead.email || ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs font-semibold px-2.5 py-1 rounded-full",
                            STATUS_COLORS[lead.status],
                          )}
                        >
                          {STATUS_LABELS[lead.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            PRIORITY_COLORS[lead.priority],
                          )}
                        >
                          {lead.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] text-sm">
                        {lead.assignedTo?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                        {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingLead(lead);
                              setModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-[var(--surface-2)] rounded-lg transition text-[var(--text-muted)] hover:text-indigo-500"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id, lead.name)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition text-[var(--text-muted)] hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)]">
                Página {data.page} de {data.totalPages}
              </p>
              <div className="flex gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4 text-[var(--text)]" />
                </button>
                <button
                  disabled={page === data.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4 text-[var(--text)]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <LeadModal
          lead={editingLead}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setModalOpen(false);
            qc.invalidateQueries({ queryKey: ["leads"] });
          }}
        />
      )}

      <ChatBot />
    </AppLayout>
  );
}

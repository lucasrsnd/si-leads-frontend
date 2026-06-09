"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  X,
  Phone,
  Mail,
  User,
  Calendar,
  Tag,
  Clock,
  CheckCircle,
  Edit3,
  Loader2,
} from "lucide-react";
import { Lead, LeadStatus } from "../../types";
import { leadsApi } from "../../lib/api";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  cn,
} from "../../lib/utils";

interface Props {
  leadId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const ACTIVITY_ICONS: Record<string, any> = {
  CRIACAO: CheckCircle,
  STATUS: Tag,
  default: Clock,
};

const STATUSES: LeadStatus[] = [
  "NOVO",
  "EM_CONTATO",
  "QUALIFICADO",
  "PROPOSTA",
  "FECHADO",
  "PERDIDO",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
}

export function LeadDetailPanel({ leadId, onClose, onUpdate }: Props) {
  const qc = useQueryClient();
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const { data: lead, isLoading } = useQuery<Lead>({
    queryKey: ["lead", leadId],
    queryFn: () =>
      leadsApi.get(leadId).then((r) => {
        setNotes(r.data.notes || "");
        return r.data;
      }),
  });

  const handleStatusChange = async (status: LeadStatus) => {
    try {
      await leadsApi.update(leadId, { status });
      qc.invalidateQueries({ queryKey: ["lead", leadId] });
      qc.invalidateQueries({ queryKey: ["kanban"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success(`Status → ${STATUS_LABELS[status]}`);
      onUpdate();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await leadsApi.update(leadId, { notes });
      qc.invalidateQueries({ queryKey: ["lead", leadId] });
      setEditNotes(false);
      toast.success("Notas salvas!");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="w-full max-w-md bg-[var(--surface)] border-l border-[var(--border)] flex flex-col animate-slide-right overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Detalhes do Lead
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--surface-2)] rounded-lg transition"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
        ) : lead ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  }}
                >
                  {getInitials(lead.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[var(--text)] truncate">
                    {lead.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        STATUS_COLORS[lead.status],
                      )}
                    >
                      {STATUS_LABELS[lead.status]}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        PRIORITY_COLORS[lead.priority],
                      )}
                    >
                      ● {lead.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {lead.email && (
                  <div className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{lead.phone}</span>
                  </div>
                )}
                {lead.assignedTo && (
                  <div className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>{lead.assignedTo.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Criado em{" "}
                    {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
                Mover para
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={lead.status === s}
                    className={cn(
                      "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                      lead.status === s
                        ? "opacity-40 cursor-not-allowed border-[var(--border)]"
                        : "hover:scale-105 cursor-pointer border-[var(--border)] hover:border-indigo-400 hover:text-indigo-500",
                    )}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Observações
                </p>
                {!editNotes && (
                  <button
                    onClick={() => setEditNotes(true)}
                    className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-400 transition"
                  >
                    <Edit3 className="w-3 h-3" /> Editar
                  </button>
                )}
              </div>
              {editNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full border border-[var(--border)] rounded-xl px-3 py-2 text-sm bg-[var(--surface-2)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 rounded-lg transition disabled:opacity-60"
                    >
                      {savingNotes && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditNotes(false)}
                      className="flex-1 border border-[var(--border)] text-[var(--text-muted)] text-xs font-medium py-2 rounded-lg hover:bg-[var(--surface-2)] transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {lead.notes || "Nenhuma observação cadastrada."}
                </p>
              )}
            </div>

            {lead.activities && lead.activities.length > 0 && (
              <div className="p-6">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">
                  Histórico
                </p>
                <div className="relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-[var(--border)]" />
                  <div className="space-y-4">
                    {lead.activities.map((act: any, i: number) => {
                      const Icon =
                        ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.default;
                      return (
                        <div
                          key={act.id}
                          className="flex gap-3 animate-fade-up"
                          style={{ animationDelay: `${i * 0.05}s` }}
                        >
                          <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 z-10">
                            <Icon className="w-3.5 h-3.5 text-indigo-500" />
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-xs text-[var(--text)] leading-relaxed">
                              {act.message}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {new Date(act.createdAt).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

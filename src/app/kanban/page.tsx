"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import toast from "react-hot-toast";
import { Plus, User } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { ChatBot } from "../../components/chat/ChatBot";
import { LeadModal } from "../../components/leads/LeadModal";
import { LeadDetailPanel } from "../../components/leads/LeadDetailPanel";
import { leadsApi } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";
import { Lead, LeadStatus, KanbanBoard } from "../../types";
import { STATUS_LABELS, PRIORITY_COLORS, cn } from "../../lib/utils";

const COLUMNS: LeadStatus[] = [
  "NOVO",
  "EM_CONTATO",
  "QUALIFICADO",
  "PROPOSTA",
  "FECHADO",
  "PERDIDO",
];

const COLUMN_COLORS: Record<LeadStatus, string> = {
  NOVO: "#6366f1",
  EM_CONTATO: "#f59e0b",
  QUALIFICADO: "#8b5cf6",
  PROPOSTA: "#f97316",
  FECHADO: "#22c55e",
  PERDIDO: "#ef4444",
};

function KanbanCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 cursor-grab active:cursor-grabbing group hover:border-indigo-400/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: COLUMN_COLORS[lead.status] }}
      />
      <div className="flex items-start gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: `${COLUMN_COLORS[lead.status]}20`,
            color: COLUMN_COLORS[lead.status],
          }}
        >
          {lead.name
            .split(" ")
            .slice(0, 2)
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()}
        </div>
      </div>
      <p className="text-sm font-semibold text-[var(--text)] leading-snug mb-1">
        {lead.name}
      </p>
      {lead.phone && (
        <p className="text-xs text-[var(--text-muted)]">{lead.phone}</p>
      )}
      <div className="flex items-center justify-between mt-3">
        <span
          className={cn(
            "text-xs font-semibold",
            PRIORITY_COLORS[lead.priority],
          )}
        >
          ● {lead.priority}
        </span>
        {lead.source && (
          <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full">
            {lead.source.replace("_", " ")}
          </span>
        )}
      </div>
    </div>
  );
}

function DroppableColumn({
  col,
  leads,
  onCardClick,
}: {
  col: LeadStatus;
  leads: Lead[];
  onCardClick: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col });

  return (
    <SortableContext
      id={col}
      items={leads.map((l) => l.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-24 space-y-2.5 rounded-2xl p-2.5 border transition-colors duration-150",
          isOver
            ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10"
            : "border-[var(--border)] bg-[var(--surface-2)]",
        )}
      >
        {leads.map((lead) => (
          <KanbanCard
            key={lead.id}
            lead={lead}
            onClick={() => onCardClick(lead.id)}
          />
        ))}
        {leads.length === 0 && (
          <div
            className={cn(
              "flex items-center justify-center py-8 rounded-xl border-2 border-dashed transition-colors",
              isOver ? "border-indigo-400" : "border-[var(--border)]",
            )}
          >
            <p className="text-xs text-[var(--text-muted)]">
              {isOver ? "Soltar aqui" : "Sem leads"}
            </p>
          </div>
        )}
      </div>
    </SortableContext>
  );
}

export default function KanbanPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [myLeads, setMyLeads] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("si_token")) router.push("/login");
  }, []);

  const { data: board, isLoading } = useQuery<KanbanBoard>({
    queryKey: ["kanban"],
    queryFn: () => leadsApi.kanban().then((r) => r.data),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const filteredBoard: KanbanBoard | undefined = board
    ? (Object.fromEntries(
        COLUMNS.map((col) => [
          col,
          myLeads
            ? (board[col] || []).filter(
                (l) => l.assignedTo?.id === user?.id || l.userId === user?.id,
              )
            : board[col] || [],
        ]),
      ) as unknown as KanbanBoard)
    : undefined;

  const allLeads = board ? Object.values(board).flat() : [];
  const activeLead = activeId ? allLeads.find((l) => l.id === activeId) : null;
  const totalVisible = filteredBoard
    ? Object.values(filteredBoard).flat().length
    : 0;

  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveId(active.id as string);

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || !board) return;

    const leadId = active.id as string;
    let targetStatus: LeadStatus;

    if (COLUMNS.includes(over.id as LeadStatus)) {
      targetStatus = over.id as LeadStatus;
    } else {
      const targetCol = COLUMNS.find((col) =>
        (board[col] || []).some((l) => l.id === over.id),
      );
      if (!targetCol) return;
      targetStatus = targetCol;
    }

    const lead = allLeads.find((l) => l.id === leadId);
    if (!lead || lead.status === targetStatus) return;

    try {
      await leadsApi.update(leadId, { status: targetStatus });
      qc.invalidateQueries({ queryKey: ["kanban"] });
      toast.success(`Movido para ${STATUS_LABELS[targetStatus]}`);
    } catch {
      toast.error("Erro ao mover lead");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-up">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Kanban</h1>
            <p className="text-[var(--text-muted)] text-sm mt-0.5">
              {totalVisible} leads · clique para detalhes, arraste para mover
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMyLeads(!myLeads)}
              className={cn(
                "flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border transition-all",
                myLeads
                  ? "border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]",
              )}
            >
              <User className="w-3.5 h-3.5" />
              Meus Leads
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              <Plus className="w-4 h-4" /> Novo Lead
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <div key={col} className="flex-shrink-0 w-64 space-y-3">
                <div className="skeleton h-6 w-32" />
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="skeleton h-28 w-full rounded-2xl" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div
              className="flex gap-4 overflow-x-auto pb-4"
              style={{ minHeight: "calc(100vh - 200px)" }}
            >
              {COLUMNS.map((col, ci) => {
                const leads = filteredBoard?.[col] || [];
                return (
                  <div
                    key={col}
                    className={`flex-shrink-0 w-64 animate-fade-up stagger-${ci + 1}`}
                  >
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: COLUMN_COLORS[col] }}
                      />
                      <span className="text-sm font-semibold text-[var(--text)]">
                        {STATUS_LABELS[col]}
                      </span>
                      <span className="ml-auto text-xs font-semibold text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                        {leads.length}
                      </span>
                    </div>
                    <DroppableColumn
                      col={col}
                      leads={leads}
                      onCardClick={(id) => setDetailId(id)}
                    />
                  </div>
                );
              })}
            </div>
            <DragOverlay>
              {activeLead ? (
                <KanbanCard lead={activeLead} onClick={() => {}} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {modalOpen && (
        <LeadModal
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setModalOpen(false);
            qc.invalidateQueries({ queryKey: ["kanban"] });
          }}
        />
      )}

      {detailId && (
        <LeadDetailPanel
          leadId={detailId}
          onClose={() => setDetailId(null)}
          onUpdate={() => qc.invalidateQueries({ queryKey: ["kanban"] })}
        />
      )}

      <ChatBot />
    </AppLayout>
  );
}

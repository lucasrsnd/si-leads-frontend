'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Plus, GripVertical } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { ChatBot } from '../../components/chat/ChatBot';
import { LeadModal } from '../../components/leads/LeadModal';
import { leadsApi } from '../../lib/api';
import { Lead, LeadStatus, KanbanBoard } from '../../types';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, cn } from '../../lib/utils';

const COLUMNS: LeadStatus[] = ['NOVO', 'EM_CONTATO', 'QUALIFICADO', 'PROPOSTA', 'FECHADO', 'PERDIDO'];

function KanbanCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--text)] leading-snug">{lead.name}</p>
        <GripVertical {...attributes} {...listeners} className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5 cursor-grab" />
      </div>
      {lead.phone && <p className="text-xs text-[var(--text-muted)] mt-1">{lead.phone}</p>}
      {lead.email && <p className="text-xs text-[var(--text-muted)] truncate">{lead.email}</p>}
      <div className="flex items-center gap-2 mt-2">
        <span className={cn('text-xs font-medium', PRIORITY_COLORS[lead.priority])}>● {lead.priority}</span>
        {lead.source && <span className="text-xs text-[var(--text-muted)]">{lead.source.replace('_', ' ')}</span>}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();

  useEffect(() => {
    if (!localStorage.getItem('si_token')) router.push('/login');
  }, []);

  const { data: board, isLoading } = useQuery<KanbanBoard>({
    queryKey: ['kanban'],
    queryFn: () => leadsApi.kanban().then((r) => r.data),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const allLeads = board ? Object.values(board).flat() : [];
  const activeLead = activeId ? allLeads.find((l) => l.id === activeId) : null;

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(active.id as string);

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || !board) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;

    if (!COLUMNS.includes(newStatus)) return;

    const lead = allLeads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    try {
      await leadsApi.update(leadId, { status: newStatus });
      qc.invalidateQueries({ queryKey: ['kanban'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success(`Lead movido para ${STATUS_LABELS[newStatus]}`);
    } catch {
      toast.error('Erro ao mover lead');
    }
  };

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Kanban</h1>
            <p className="text-[var(--text-muted)] text-sm mt-0.5">Arraste os cards para mudar o status</p>
          </div>
          <button onClick={() => { setEditingLead(undefined); setModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus className="w-4 h-4" /> Novo Lead
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
            {COLUMNS.map((col) => {
              const leads = board?.[col] || [];
              return (
                <div key={col} id={col} className="flex-shrink-0 w-64">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[col])}>
                        {STATUS_LABELS[col]}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] font-medium">{leads.length}</span>
                    </div>
                  </div>

                  {/* Drop zone */}
                  <SortableContext id={col} items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    <div className="min-h-20 space-y-2 bg-[var(--surface-2)] rounded-xl p-2">
                      {leads.map((lead) => <KanbanCard key={lead.id} lead={lead} />)}
                      {leads.length === 0 && (
                        <p className="text-xs text-[var(--text-muted)] text-center py-6">Sem leads aqui</p>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeLead ? <KanbanCard lead={activeLead} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {modalOpen && (
        <LeadModal lead={editingLead} onClose={() => setModalOpen(false)}
          onSave={() => { setModalOpen(false); qc.invalidateQueries({ queryKey: ['kanban'] }); }} />
      )}

      <ChatBot />
    </AppLayout>
  );
}

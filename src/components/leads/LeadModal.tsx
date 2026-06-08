'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X, Loader2 } from 'lucide-react';
import { Lead, LeadStatus, Source, Priority } from '../../types';
import { leadsApi, usersApi } from '../../lib/api';
import { STATUS_LABELS } from '../../lib/utils';

interface Props {
  lead?: Lead;
  onClose: () => void;
  onSave: () => void;
}

export function LeadModal({ lead, onClose, onSave }: Props) {
  const isEdit = !!lead;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    status: lead?.status || 'NOVO' as LeadStatus,
    source: lead?.source || '' as Source | '',
    priority: lead?.priority || 'MEDIA' as Priority,
    notes: lead?.notes || '',
    userId: lead?.userId || '',
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, source: form.source || undefined, userId: form.userId || undefined };
      if (isEdit) {
        await leadsApi.update(lead!.id, payload);
        toast.success('Lead atualizado!');
      } else {
        await leadsApi.create(payload);
        toast.success('Lead criado!');
      }
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar lead');
    } finally {
      setLoading(false);
    }
  };

  const input = 'w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text)]">
            {isEdit ? 'Editar Lead' : 'Novo Lead'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--surface-2)] rounded-lg transition">
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Nome *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} required className={input} placeholder="Nome completo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={input} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Telefone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={input} placeholder="(31) 99999-9999" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={input}>
                {(['NOVO','EM_CONTATO','QUALIFICADO','PROPOSTA','FECHADO','PERDIDO'] as LeadStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Prioridade</label>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className={input}>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Origem</label>
              <select value={form.source} onChange={(e) => set('source', e.target.value)} className={input}>
                <option value="">Selecionar</option>
                <option value="SITE">Site</option>
                <option value="INDICACAO">Indicação</option>
                <option value="REDES_SOCIAIS">Redes Sociais</option>
                <option value="ANUNCIO">Anúncio</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Responsável</label>
              <select value={form.userId} onChange={(e) => set('userId', e.target.value)} className={input}>
                <option value="">Sem responsável</option>
                {users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Observações</label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className={input} placeholder="Detalhes sobre o lead..." />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-[var(--border)] text-[var(--text)] text-sm font-medium py-2.5 rounded-lg hover:bg-[var(--surface-2)] transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Salvar alterações' : 'Criar lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LeadStatus, Priority, Source } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NOVO: 'Novo',
  EM_CONTATO: 'Em Contato',
  QUALIFICADO: 'Qualificado',
  PROPOSTA: 'Proposta',
  FECHADO: 'Fechado',
  PERDIDO: 'Perdido',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  NOVO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  EM_CONTATO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  QUALIFICADO: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  PROPOSTA: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  FECHADO: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  PERDIDO: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  ALTA: 'text-red-500',
  MEDIA: 'text-yellow-500',
  BAIXA: 'text-green-500',
};

export const SOURCE_LABELS: Record<Source, string> = {
  SITE: 'Site',
  INDICACAO: 'Indicação',
  REDES_SOCIAIS: 'Redes Sociais',
  ANUNCIO: 'Anúncio',
  WHATSAPP: 'WhatsApp',
  OUTRO: 'Outro',
};

export function downloadCsv(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

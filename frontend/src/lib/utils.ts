import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'PEN'): string {
  const symbols: Record<string, string> = {
    PEN: 'S/',
    USD: '$',
    EUR: '€',
  };
  
  return `${symbols[currency] || currency} ${amount /*.toFixed(2) */}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getStatusColor(estado: string): string {
  const colors: Record<string, string> = {
    pendiente_pago: 'bg-yellow-100 text-yellow-800',
    pagada: 'bg-blue-100 text-blue-800',
    en_proceso: 'bg-purple-100 text-purple-800',
    enviada: 'bg-indigo-100 text-indigo-800',
    entregada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
    devuelta: 'bg-gray-100 text-gray-800',
  };
  return colors[estado] || 'bg-gray-100 text-gray-800';
}
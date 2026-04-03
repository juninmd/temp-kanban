import type { LabelColor } from '../types';

export const LABEL_COLOR_CLASSES: Record<LabelColor, { bg: string; text: string; border: string }> = {
  red: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
  orange: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
  yellow: { bg: 'bg-yellow-400', text: 'text-gray-900', border: 'border-yellow-500' },
  green: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' },
  blue: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
  purple: { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
  pink: { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-600' },
  gray: { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-600' },
};

export const BOARD_BACKGROUNDS = [
  { label: 'Ocean Blue', value: 'from-blue-600 to-blue-800' },
  { label: 'Deep Purple', value: 'from-purple-600 to-purple-900' },
  { label: 'Forest Green', value: 'from-green-600 to-green-800' },
  { label: 'Sunset Orange', value: 'from-orange-500 to-red-600' },
  { label: 'Rose Pink', value: 'from-pink-500 to-rose-600' },
  { label: 'Dark Slate', value: 'from-slate-700 to-slate-900' },
  { label: 'Teal Wave', value: 'from-teal-500 to-cyan-700' },
  { label: 'Warm Amber', value: 'from-amber-500 to-yellow-600' },
];

export function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `Overdue`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isDueDateOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export function isDueDateSoon(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 2;
}

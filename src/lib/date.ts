import type { Task } from '../types';

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatDateLabel(dateKey: string): string {
  if (!dateKey) return '';
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = todayKey();
  const tomorrow = toDateKey(addDays(new Date(), 1));
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
  if (dateKey === today) return `今天 · ${m}月${d}日`;
  if (dateKey === tomorrow) return `明天 · ${m}月${d}日`;
  return `${m}月${d}日 · ${week}`;
}

export function isOverdue(task: Pick<Task, 'dueDate' | 'status'>): boolean {
  return task.status === 'active' && !!task.dueDate && task.dueDate < todayKey();
}

export function isDueToday(task: Pick<Task, 'dueDate'>): boolean {
  return task.dueDate === todayKey();
}

export function isCompletedToday(task: Pick<Task, 'completedAt'>): boolean {
  return !!task.completedAt && toDateKey(new Date(task.completedAt)) === todayKey();
}
export function tomorrowKey(): string {
  return toDateKey(addDays(new Date(), 1));
}

export function completedDateKey(completedAt: number | null | undefined): string | null {
  if (!completedAt) return null;
  return toDateKey(new Date(completedAt));
}

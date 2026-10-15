export type TaskStatus = 'active' | 'completed' | 'deleted';

export interface Task {
  id?: number;
  uuid: string;
  title: string;
  note: string;
  dueDate: string;
  dueTime: string;
  important: boolean;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
  deletedAt?: number | null;
  syncedAt?: number | null;
  remindAt?: number | null;
  remindedAt?: number | null;
}

export interface DailyReview {
  id?: number;
  dateKey: string;
  done: string;
  problems: string;
  top1: string;
  top2: string;
  top3: string;
  createdAt: number;
  updatedAt: number;
}

export interface Habit {
  id?: number;
  name: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface HabitLog {
  id?: number;
  habitId: number;
  dateKey: string;
  createdAt: number;
}

export type ViewMode = 'today' | 'upcoming' | 'review' | 'stats';
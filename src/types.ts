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

export type ViewMode = 'today' | 'upcoming';
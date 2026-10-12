import { supabase, ensureAnonymousSession, isCloudConfigured } from './supabase';
import { db, setMeta } from '../db';
import type { Task } from '../types';

interface ServerTask {
  id: string;
  title: string;
  note: string | null;
  due_date: string | null;
  due_time: string | null;
  important: boolean;
  status: Task['status'];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  deleted_at: string | null;
}

export interface SyncResult {
  pushed: number;
  pulled: number;
  error?: string;
}

function toServer(task: Task): Record<string, unknown> {
  return {
    id: task.uuid,
    title: task.title,
    note: task.note || null,
    due_date: task.dueDate || null,
    due_time: task.dueTime || null,
    important: task.important,
    status: task.status,
    created_at: new Date(task.createdAt).toISOString(),
    updated_at: new Date(task.updatedAt).toISOString(),
    completed_at: task.completedAt ? new Date(task.completedAt).toISOString() : null,
    deleted_at: task.deletedAt ? new Date(task.deletedAt).toISOString() : null
  };
}

function toLocal(row: ServerTask): Task {
  return {
    uuid: row.id,
    title: row.title ?? '',
    note: row.note ?? '',
    dueDate: row.due_date ?? '',
    dueTime: row.due_time ?? '',
    important: row.important ?? false,
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
    deletedAt: row.deleted_at ? new Date(row.deleted_at).getTime() : null,
    syncedAt: Date.now()
  };
}

async function pullTasks(): Promise<number> {
  if (!supabase) return 0;
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) throw new Error(error.message);

  let pulled = 0;
  for (const row of (data ?? []) as ServerTask[]) {
    const existing = await db.tasks.where('uuid').equals(row.id).first();
    const serverUpdated = new Date(row.updated_at).getTime();
    if (!existing || serverUpdated > (existing.updatedAt ?? 0)) {
      const local = toLocal(row);
      if (existing?.id) local.id = existing.id;
      await db.tasks.put(local);
      pulled += 1;
    }
  }
  return pulled;
}

async function pushTasks(): Promise<number> {
  if (!supabase) return 0;
  const all = await db.tasks.toArray();
  const changed = all.filter((task) => {
    return (task.syncedAt ?? null) === null || (task.updatedAt ?? 0) > (task.syncedAt ?? 0);
  });

  let pushed = 0;
  for (const task of changed) {
    const { error } = await supabase.from('tasks').upsert(toServer(task), { onConflict: 'id' });
    if (error) throw new Error(error.message);
    await db.tasks.update(task.id!, { syncedAt: Date.now() });
    pushed += 1;
  }
  return pushed;
}

export async function syncNow(): Promise<SyncResult> {
  if (!isCloudConfigured || !supabase) {
    return { pushed: 0, pulled: 0, error: 'unconfigured' };
  }

  await ensureAnonymousSession();
  const pulled = await pullTasks();
  const pushed = await pushTasks();
  await setMeta('lastSyncAt', Date.now());
  return { pushed, pulled };
}
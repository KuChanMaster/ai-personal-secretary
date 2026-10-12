import Dexie, { type Table } from 'dexie';
import type { Task } from './types';

export interface MetaRow {
  key: string;
  value: unknown;
}

class SecretaryDatabase extends Dexie {
  tasks!: Table<Task, number>;
  meta!: Table<MetaRow, string>;

  constructor() {
    super('ai-secretary-db');
    this.version(1).stores({
      tasks: '++id, uuid, dueDate, status, updatedAt, createdAt'
    });
    this.version(2).stores({
      tasks: '++id, uuid, dueDate, status, updatedAt, createdAt, deletedAt, syncedAt',
      meta: 'key'
    });
  }
}

export const db = new SecretaryDatabase();

export async function getMeta(key: string): Promise<unknown> {
  const row = await db.meta.get(key);
  return row?.value;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await db.meta.put({ key, value });
}
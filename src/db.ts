import Dexie, { type Table } from 'dexie';
import type { Task } from './types';

class SecretaryDatabase extends Dexie {
  tasks!: Table<Task, number>;

  constructor() {
    super('ai-secretary-db');
    this.version(1).stores({
      tasks: '++id, uuid, dueDate, status, updatedAt, createdAt'
    });
  }
}

export const db = new SecretaryDatabase();
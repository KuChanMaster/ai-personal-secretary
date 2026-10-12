import { db } from '../db';
import type { Task } from '../types';

export type NotificationState = NotificationPermission | 'unsupported';

export function notificationState(): NotificationState {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationState> {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'denied';
  }
}

export function showTaskNotification(task: Task): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  const body = task.dueTime
    ? `提醒时间 ${task.dueTime}`
    : '该处理这个任务了';
  new Notification(task.title, {
    body,
    tag: `task-${task.uuid}`,
    icon: '/icons/icon-192.png'
  });
  return true;
}

export async function checkDueReminders(): Promise<number> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return 0;
  const now = Date.now();
  const due = await db.tasks
    .filter((task) => task.status === 'active' && (task.remindAt ?? null) !== null && (task.remindAt as number) <= now && !task.remindedAt)
    .toArray();

  let sent = 0;
  for (const task of due) {
    const shown = showTaskNotification(task);
    await db.tasks.update(task.id!, { remindedAt: now });
    if (shown) sent += 1;
  }
  return sent;
}

export function startReminderLoop(): void {
  void checkDueReminders();
  window.setInterval(() => {
    void checkDueReminders();
  }, 30000);
}
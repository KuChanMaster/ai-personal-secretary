import { db } from '../db';
import type { Task } from '../types';

export type NotificationState = NotificationPermission | 'unsupported';

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

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

function reminderMessage(task: Task): string {
  const hour = new Date().getHours();
  if (hour < 11) {
    return pick([
      `早上好，先完成「${task.title}」吧。`,
      `新的一天，先搞定「${task.title}」。`,
      `趁精力好，「${task.title}」现在就做。`
    ]);
  }
  if (hour < 18) {
    return pick([
      `该处理「${task.title}」啦，做完就更轻松。`,
      `「${task.title}」还在等你，现在开始刚刚好。`,
      `给自己一个推进：「${task.title}」。`
    ]);
  }
  return pick([
    `睡前收个尾：「${task.title}」还能再进一步。`,
    `「${task.title}」还没完成，现在做一点也好。`,
    `把「${task.title}」处理掉，今天就更完整了。`
  ]);
}

export function showTaskNotification(task: Task): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  new Notification(task.title, {
    body: reminderMessage(task),
    tag: `task-${task.uuid}`,
    icon: '/icons/icon-192.png'
  });
  return true;
}

export function celebrateCompletion(task: Task): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  const body = pick([
    '完成一项，给自己点个赞。',
    '又前进了一小步。',
    '这件事拿下了，漂亮。',
    '今天的自己又靠谱了一点。'
  ]);
  new Notification(`已完成：${task.title}`, {
    body,
    tag: `done-${task.uuid}`,
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
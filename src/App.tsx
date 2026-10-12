import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from './db';
import type { Task, ViewMode } from './types';
import { isCompletedToday, isDueToday, isOverdue, formatDateLabel, addDays, toDateKey } from './lib/date';
import TaskItem from './components/TaskItem';
import TaskForm, { type TaskDraft } from './components/TaskForm';

function makeUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewMode>('today');
  const [editing, setEditing] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const refresh = useCallback(async () => {
    const all = await db.tasks.orderBy('createdAt').reverse().toArray();
    setTasks(all);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSave = useCallback(async (draft: TaskDraft) => {
    const now = Date.now();
    if (editing?.id) {
      await db.tasks.update(editing.id, {
        ...draft,
        updatedAt: now
      });
    } else {
      await db.tasks.add({
        uuid: makeUuid(),
        ...draft,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        deletedAt: null,
        syncedAt: null
      });
    }
    setEditing(null);
    setFormOpen(false);
    await refresh();
  }, [editing, refresh]);

  const handleToggle = useCallback(async (id: number) => {
    const task = await db.tasks.get(id);
    if (!task) return;
    if (task.status === 'completed') {
      await db.tasks.update(id, { status: 'active', completedAt: null, updatedAt: Date.now() });
    } else {
      await db.tasks.update(id, { status: 'completed', completedAt: Date.now(), updatedAt: Date.now() });
    }
    await refresh();
  }, [refresh]);

  const handleDelete = useCallback(async (id: number) => {
    const task = await db.tasks.get(id);
    if (!task) return;
    if (!window.confirm(`确定删除「${task.title}」吗？`)) return;
    await db.tasks.update(id, { status: 'deleted', deletedAt: Date.now(), updatedAt: Date.now() });
    await refresh();
  }, [refresh]);

  const active = useMemo(() => tasks.filter((t) => t.status !== 'deleted'), [tasks]);
  const overdue = useMemo(() => active.filter(isOverdue), [active]);
  const today = useMemo(() => active.filter((t) => t.status === 'active' && isDueToday(t)), [active]);
  const unscheduled = useMemo(() => active.filter((t) => t.status === 'active' && !t.dueDate), [active]);
  const completedToday = useMemo(() => active.filter((t) => t.status === 'completed' && isCompletedToday(t)), [active]);

  const future = useMemo(() => {
    const result = new Map<string, Task[]>();
    const start = addDays(new Date(), 1);
    for (let i = 0; i < 30; i += 1) {
      result.set(toDateKey(addDays(start, i)), []);
    }
    for (const task of active) {
      if (task.status === 'active' && task.dueDate && task.dueDate > toDateKey(new Date())) {
        const bucket = result.get(task.dueDate);
        if (bucket) bucket.push(task);
      }
    }
    return Array.from(result.entries()).map(([date, items]) => ({ date, items }));
  }, [active]);

  const completedCount = tasks.filter((t) => t.status === 'completed' && isCompletedToday(t)).length;
  const totalDueCount = overdue.length + today.length;

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">{view === 'today' ? '今天' : '未来 30 天'}</p>
          <h1>{formatDateLabel(view === 'today' ? toDateKey(new Date()) : '') || '个人秘书'}</h1>
        </div>
        <div className="progress-pill">
          {completedCount}/{totalDueCount}
        </div>
      </header>

      <main className="content">
        {view === 'today' && (
          <>
            <section>
              <h2 className="section-title">逾期</h2>
              {overdue.length === 0 ? (
                <p className="empty">没有逾期任务</p>
              ) : (
                <ul className="task-list">
                  {overdue.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={handleToggle} onEdit={(t) => { setEditing(t); setFormOpen(true); }} onDelete={handleDelete} />
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="section-title">今天</h2>
              {today.length === 0 && unscheduled.length === 0 ? (
                <p className="empty">今天还没有安排，点下方按钮添加任务</p>
              ) : (
                <ul className="task-list">
                  {today.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={handleToggle} onEdit={(t) => { setEditing(t); setFormOpen(true); }} onDelete={handleDelete} />
                  ))}
                  {unscheduled.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={handleToggle} onEdit={(t) => { setEditing(t); setFormOpen(true); }} onDelete={handleDelete} />
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="section-title">今天已完成</h2>
              {completedToday.length === 0 ? (
                <p className="empty">还没有完成任务</p>
              ) : (
                <ul className="task-list">
                  {completedToday.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={handleToggle} onEdit={(t) => { setEditing(t); setFormOpen(true); }} onDelete={handleDelete} />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {view === 'upcoming' && (
          <>
            {future.map(({ date, items }) => (
              <section key={date}>
                <h2 className="section-title">{formatDateLabel(date)}</h2>
                {items.length === 0 ? null : (
                  <ul className="task-list">
                    {items.map((task) => (
                      <TaskItem key={task.id} task={task} onToggle={handleToggle} onEdit={(t) => { setEditing(t); setFormOpen(true); }} onDelete={handleDelete} />
                    ))}
                  </ul>
                )}
              </section>
            ))}
            {future.every((g) => g.items.length === 0) && (
              <p className="empty">未来 30 天还没有安排</p>
            )}
          </>
        )}
      </main>

      <button type="button" className="fab" onClick={() => { setEditing(null); setFormOpen(true); }} aria-label="添加任务">
        +
      </button>

      <nav className="bottom-nav">
        <button type="button" className={view === 'today' ? 'active' : ''} onClick={() => setView('today')}>今日</button>
        <button type="button" className={view === 'upcoming' ? 'active' : ''} onClick={() => setView('upcoming')}>未来</button>
      </nav>

      {formOpen && <TaskForm initial={editing} onSave={handleSave} onCancel={() => { setEditing(null); setFormOpen(false); }} />}
    </div>
  );
}
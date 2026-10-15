import { useCallback, useEffect, useState } from 'react';
import { db } from '../db';
import type { Habit } from '../types';
import { todayKey, tomorrowKey } from '../lib/date';

function makeUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

interface Props {
  onTasksChanged: () => Promise<void>;
}

export default function ReviewView({ onTasksChanged }: Props) {
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [done, setDone] = useState('');
  const [problems, setProblems] = useState('');
  const [top1, setTop1] = useState('');
  const [top2, setTop2] = useState('');
  const [top3, setTop3] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitName, setHabitName] = useState('');
  const [doneHabits, setDoneHabits] = useState<Set<number>>(new Set());
  const [savedMessage, setSavedMessage] = useState('');

  const load = useCallback(async () => {
    const key = todayKey();
    const existing = await db.reviews.where('dateKey').equals(key).first();
    if (existing) {
      setReviewId(existing.id ?? null);
      setDone(existing.done);
      setProblems(existing.problems);
      setTop1(existing.top1);
      setTop2(existing.top2);
      setTop3(existing.top3);
    } else {
      setReviewId(null);
      setDone('');
      setProblems('');
      setTop1('');
      setTop2('');
      setTop3('');
    }

    const allHabits = await db.habits.orderBy('createdAt').toArray();
    setHabits(allHabits);

    const logs = await db.habitLogs.where('dateKey').equals(key).toArray();
    setDoneHabits(new Set(logs.map((log) => log.habitId)));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    const now = Date.now();
    const data = {
      dateKey: todayKey(),
      done: done.trim(),
      problems: problems.trim(),
      top1: top1.trim(),
      top2: top2.trim(),
      top3: top3.trim(),
      updatedAt: now
    };

    if (reviewId) {
      await db.reviews.update(reviewId, data);
    } else {
      const id = await db.reviews.add({ ...data, createdAt: now });
      setReviewId(id);
    }
    setSavedMessage('已保存');
    window.setTimeout(() => setSavedMessage(''), 1500);
  };

  const handleConvertTop3 = async () => {
    const items = [top1.trim(), top2.trim(), top3.trim()].filter(Boolean);
    if (items.length === 0) return;

    const now = Date.now();
    for (const title of items) {
      await db.tasks.add({
        uuid: makeUuid(),
        title,
        note: '',
        dueDate: tomorrowKey(),
        dueTime: '',
        important: false,
        remindAt: null,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        deletedAt: null,
        syncedAt: null,
        remindedAt: null
      });
    }
    await onTasksChanged();
    setSavedMessage('明日三件事已转为任务');
    window.setTimeout(() => setSavedMessage(''), 1800);
  };

  const handleToggleHabit = async (habitId: number) => {
    const key = todayKey();
    const existing = await db.habitLogs.where('[habitId+dateKey]').equals([habitId, key]).first();
    if (existing) {
      await db.habitLogs.delete(existing.id!);
    } else {
      await db.habitLogs.add({ habitId, dateKey: key, createdAt: Date.now() });
    }
    await load();
  };

  const handleAddHabit = async () => {
    const name = habitName.trim();
    if (!name) return;
    const now = Date.now();
    await db.habits.add({ name, active: true, createdAt: now, updatedAt: now });
    setHabitName('');
    await load();
  };

  const handleDeleteHabit = async (habit: Habit) => {
    if (!window.confirm(`删除习惯「${habit.name}」吗？`)) return;
    await db.habits.delete(habit.id!);
    await db.habitLogs.where('habitId').equals(habit.id!).delete();
    await load();
  };

  return (
    <>
      <section>
        <h2 className="section-title">今日习惯</h2>
        <div className="card">
          {habits.length === 0 ? (
            <p className="empty">还没有习惯，添加一个试试</p>
          ) : (
            <ul className="habit-list">
              {habits.map((habit) => (
                <li key={habit.id} className="habit-row">
                  <button
                    type="button"
                    className={`checkbox ${doneHabits.has(habit.id!) ? 'checked' : ''}`}
                    onClick={() => handleToggleHabit(habit.id!)}
                    aria-label={`打卡 ${habit.name}`}
                  >
                    {doneHabits.has(habit.id!) ? '✓' : ''}
                  </button>
                  <span className="habit-name">{habit.name}</span>
                  <button type="button" className="icon-button" onClick={() => handleDeleteHabit(habit)} aria-label="删除习惯">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="habit-add">
            <input
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="新习惯名称"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleAddHabit();
                }
              }}
            />
            <button type="button" className="button primary" onClick={handleAddHabit}>添加</button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">晚间复盘</h2>
        <div className="card review-form">
          <label className="field">
            <span className="field-label">今天完成了什么</span>
            <textarea value={done} onChange={(e) => setDone(e.target.value)} rows={3} placeholder="写下一两件今天完成的事" />
          </label>

          <label className="field">
            <span className="field-label">遇到了什么问题</span>
            <textarea value={problems} onChange={(e) => setProblems(e.target.value)} rows={3} placeholder="可选" />
          </label>

          <div className="field">
            <span className="field-label">明天最重要的三件事</span>
            <input value={top1} onChange={(e) => setTop1(e.target.value)} placeholder="1. 第一件事" />
            <input value={top2} onChange={(e) => setTop2(e.target.value)} placeholder="2. 第二件事" />
            <input value={top3} onChange={(e) => setTop3(e.target.value)} placeholder="3. 第三件事" />
          </div>

          <div className="review-actions">
            <button type="button" className="button primary" onClick={handleSave}>保存复盘</button>
            <button type="button" className="button" onClick={handleConvertTop3}>明日三件事转为任务</button>
          </div>
          {savedMessage && <p className="saved-message">{savedMessage}</p>}
        </div>
      </section>
    </>
  );
}
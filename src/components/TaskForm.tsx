import { useState, type FormEvent } from 'react';
import type { Task } from '../types';
import { todayKey } from '../lib/date';

export interface TaskDraft {
  title: string;
  note: string;
  dueDate: string;
  dueTime: string;
  important: boolean;
  remindAt: number | null;
}

interface Props {
  initial: Task | null;
  onSave: (draft: TaskDraft) => void;
  onCancel: () => void;
}

function timeFromTimestamp(timestamp?: number | null): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function TaskForm({ initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? todayKey());
  const [dueTime, setDueTime] = useState(initial?.dueTime ?? '');
  const [important, setImportant] = useState(initial?.important ?? false);
  const [reminderEnabled, setReminderEnabled] = useState((initial?.remindAt ?? null) !== null);
  const [remindTime, setRemindTime] = useState(
    timeFromTimestamp(initial?.remindAt) || initial?.dueTime || '09:00'
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    let remindAt: number | null = null;
    if (reminderEnabled && dueDate && remindTime) {
      const value = new Date(`${dueDate}T${remindTime}:00`).getTime();
      remindAt = Number.isNaN(value) ? null : value;
    }

    onSave({
      title: trimmed,
      note: note.trim(),
      dueDate,
      dueTime,
      important,
      remindAt
    });
  };

  const canRemind = reminderEnabled && !!dueDate;

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <form className="sheet" onSubmit={handleSubmit}>
        <div className="sheet-header">
          <button type="button" className="text-button" onClick={onCancel}>取消</button>
          <h2>{initial ? '编辑任务' : '新建任务'}</h2>
          <button type="submit" className="text-button primary" disabled={!title.trim()}>保存</button>
        </div>

        <label className="field">
          <span className="field-label">任务标题</span>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：背 30 个单词"
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field-label">日期</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">时间</span>
            <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
          </label>
        </div>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={canRemind}
            disabled={!dueDate}
            onChange={(e) => setReminderEnabled(e.target.checked)}
          />
          <span>开启提醒</span>
          {!dueDate && <span className="hint">需要先选择日期</span>}
        </label>

        {canRemind && (
          <label className="field">
            <span className="field-label">提醒时间</span>
            <input type="time" value={remindTime} onChange={(e) => setRemindTime(e.target.value)} />
          </label>
        )}

        <label className="field">
          <span className="field-label">备注</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="可选" />
        </label>

        <label className="toggle-row">
          <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} />
          <span>标记为重要</span>
        </label>
      </form>
    </div>
  );
}
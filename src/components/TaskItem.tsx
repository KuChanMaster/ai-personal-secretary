import type { Task } from '../types';
import { formatDateLabel } from '../lib/date';

interface Props {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }: Props) {
  return (
    <li className="task-item">
      <button
        type="button"
        className={`checkbox ${task.status === 'completed' ? 'checked' : ''}`}
        onClick={() => onToggle(task.id!)}
        aria-label="切换完成状态"
      >
        {task.status === 'completed' ? '✓' : ''}
      </button>
      <button type="button" className="task-body" onClick={() => onEdit(task)}>
        <span className="task-title-row">
          {task.important && <span className="star">★</span>}
          <span className={task.status === 'completed' ? 'task-title completed' : 'task-title'}>
            {task.title}
          </span>
        </span>
        <span className="task-meta">
          {task.dueDate && <span>{formatDateLabel(task.dueDate)}</span>}
          {task.dueTime && <span>{task.dueTime}</span>}
          {task.note && <span className="note">{task.note}</span>}
        </span>
      </button>
      <button type="button" className="icon-button" onClick={() => onDelete(task.id!)} aria-label="删除任务">
        ×
      </button>
    </li>
  );
}
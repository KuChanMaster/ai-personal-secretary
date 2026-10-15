import { useMemo } from 'react';
import type { Task } from '../types';
import { addDays, isCompletedToday, isDueToday, isOverdue, toDateKey } from '../lib/date';

interface Props {
  tasks: Task[];
}

export default function StatsView({ tasks }: Props) {
  const data = useMemo(() => {
    const completedToday = tasks.filter((task) => task.status === 'completed' && isCompletedToday(task));
    const overdue = tasks.filter((task) => task.status === 'active' && isOverdue(task));
    const dueToday = tasks.filter((task) => task.status === 'active' && isDueToday(task));
    const actionable = completedToday.length + overdue.length + dueToday.length;
    const completionRate = actionable === 0 ? 0 : Math.round((completedToday.length / actionable) * 100);

    const completedDates = tasks
      .filter((task) => task.status === 'completed' && task.completedAt)
      .map((task) => toDateKey(new Date(task.completedAt!)));

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(new Date(), index - 6);
      return { key: toDateKey(date), label: `${date.getMonth() + 1}/${date.getDate()}` };
    });

    const countByDate = new Map<string, number>();
    for (const key of completedDates) {
      countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
    }
    const counts = days.map((day) => countByDate.get(day.key) ?? 0);
    const maxCount = Math.max(1, ...counts);

    const completedSet = new Set(completedDates);
    let cursor = new Date();
    if (!completedSet.has(toDateKey(cursor))) {
      cursor = addDays(cursor, -1);
    }
    let streak = 0;
    while (completedSet.has(toDateKey(cursor))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }

    return { completedToday: completedToday.length, overdue: overdue.length, dueToday: dueToday.length, completionRate, days, counts, maxCount, streak };
  }, [tasks]);

  return (
    <>
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{data.completedToday}</span>
          <span className="stat-label">今日完成</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.overdue}</span>
          <span className="stat-label">逾期任务</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.completionRate}%</span>
          <span className="stat-label">今日完成率</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.streak}</span>
          <span className="stat-label">连续完成天数</span>
        </div>
      </section>

      <section>
        <h2 className="section-title">近 7 天完成趋势</h2>
        <div className="card">
          <div className="bar-chart">
            {data.days.map((day, index) => (
              <div className="bar-column" key={day.key}>
                <span className="bar-value">{data.counts[index]}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${(data.counts[index] / data.maxCount) * 100}%` }}
                  />
                </div>
                <span className="bar-label">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <p className="stat-note">今日完成率 = 今日完成数 ÷（今日完成数 + 今日到期数 + 逾期数）。</p>
    </>
  );
}
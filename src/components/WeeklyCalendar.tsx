'use client';

import { useState } from 'react';
import { Goal, Session } from '@/lib/types';

const GOAL_COLORS = [
  { dot: 'var(--color-study)',  bg: 'var(--color-study-bg)'  },
  { dot: 'var(--color-health)', bg: 'var(--color-health-bg)' },
  { dot: 'var(--color-hobby)',  bg: 'var(--color-hobby-bg)'  },
  { dot: 'var(--color-rest)',   bg: 'var(--color-rest-bg)'   },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface WeeklyCalendarProps {
  goals: Goal[];
  sessions: Session[];
  today: Date;
}

function getWeekDays(today: Date): Date[] {
  const dow = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7)); // rewind to Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function WeeklyCalendar({ goals, sessions, today }: WeeklyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days      = getWeekDays(today);
  const todayStr  = toDateStr(today);

  // Map goalId → color config
  const goalColorMap = new Map(
    goals.map((g, i) => [g.id, GOAL_COLORS[i % GOAL_COLORS.length]])
  );

  // Map goalId → all tasks (for session detail)
  const goalTaskMap = new Map(
    goals.map((g) => [g.id, [...g.tasksEasy, ...g.tasksMedium, ...g.tasksHard]])
  );

  // Build dateStr → Set<goalId>  (only goals with activity that day)
  const activityByDate = new Map<string, Set<string>>();
  for (const s of sessions) {
    const d = s.createdAt.slice(0, 10);
    if (!activityByDate.has(d)) activityByDate.set(d, new Set());
    activityByDate.get(d)!.add(s.goalId);
  }

  return (
    <div className="space-y-3">
      <p
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
          color: 'var(--color-text-tertiary)',
        }}
      >
        This week
      </p>

      {/* 7-column grid */}
      <div className="flex gap-1">
        {days.map((day, i) => {
          const dateStr      = toDateStr(day);
          const isPast       = dateStr < todayStr;
          const isToday      = dateStr === todayStr;
          const activeGoalIds = [...(activityByDate.get(dateStr) ?? [])];
          const isSelected   = selectedDate === dateStr;
          const hasActivity  = activeGoalIds.length > 0;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className="flex-1 flex flex-col items-center gap-1 rounded-lg py-2 transition-colors"
              style={{
                background: isSelected ? 'var(--color-bg-secondary)' : 'transparent',
                border: isToday
                  ? '1px solid var(--color-border-medium)'
                  : '1px solid transparent',
                opacity: isPast && !hasActivity ? 0.35 : 1,
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  color: isToday ? 'var(--color-text)' : 'var(--color-text-tertiary)',
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {DAY_LABELS[i]}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  color: isToday ? 'var(--color-text)' : isPast ? 'var(--color-text-tertiary)' : 'var(--color-text)',
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {day.getDate()}
              </span>

              {/* Activity dots */}
              <div className="flex gap-0.5 flex-wrap justify-center" style={{ minHeight: '8px' }}>
                {activeGoalIds.map((gid) => {
                  const c = goalColorMap.get(gid);
                  return c ? (
                    <div
                      key={gid}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: c.dot,
                      }}
                    />
                  ) : null;
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {selectedDate && (() => {
        const daySessions = sessions.filter(
          (s) => s.createdAt.slice(0, 10) === selectedDate
        );

        return (
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'var(--color-bg-secondary)' }}
          >
            {daySessions.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                No activity on this day.
              </p>
            ) : (
              daySessions.map((s) => {
                const goal  = goals.find((g) => g.id === s.goalId);
                const tasks = goalTaskMap.get(s.goalId) ?? [];
                const task  = tasks.find((t) => t.id === s.taskId);
                const c     = goalColorMap.get(s.goalId);

                return (
                  <div key={s.id} className="flex items-start gap-2.5">
                    {c && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: c.dot,
                          marginTop: '3px',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div className="min-w-0">
                      <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '1px' }}>
                        {goal?.title ?? 'Unknown goal'}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--color-text)', lineHeight: 1.4 }}>
                        {task?.text ?? 'Task'}
                      </p>
                      <p
                        style={{
                          fontSize: '11px',
                          color: s.result === 'done'
                            ? 'var(--color-success)'
                            : 'var(--color-text-tertiary)',
                          marginTop: '2px',
                        }}
                      >
                        {s.result === 'done' ? '✓ Done' : '→ Simplified'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })()}
    </div>
  );
}

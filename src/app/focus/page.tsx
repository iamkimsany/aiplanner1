'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadState, getAllTasksInGoal } from '@/lib/store';
import { Goal, Task } from '@/lib/types';

const BLOCKED_APPS = [
  { name: 'Instagram',  icon: '📸' },
  { name: 'TikTok',     icon: '🎵' },
  { name: 'X / Twitter',icon: '🐦' },
  { name: 'YouTube',    icon: '▶️' },
];

export default function FocusBlockPage() {
  const router = useRouter();
  const [task, setTask]   = useState<Task | null>(null);
  const [goal, setGoal]   = useState<Goal | null>(null);
  const [mins, setMins]   = useState(25);

  useEffect(() => {
    const state = loadState();
    if (!state.activeFocus) { router.replace('/tasks'); return; }

    const g = state.goals.find((g) => g.id === state.activeFocus!.goalId) ?? null;
    const t = g ? getAllTasksInGoal(g).find((t) => t.id === state.activeFocus!.taskId) ?? null : null;
    setGoal(g);
    setTask(t);
    setMins(state.activeFocus.durationMinutes);
  }, [router]);

  if (!task || !goal) return null;

  return (
    <div className="screen flex-1 flex flex-col">
      <div className="flex-1 space-y-7">

        {/* Heading */}
        <div className="space-y-1">
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-purple)' }}>
            {goal.title.toUpperCase()}
          </p>
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.3 }}>
            {task.text}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {mins} min · social media blocked
          </p>
        </div>

        {/* Blocked apps */}
        <div className="space-y-2">
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-text-tertiary)' }}>
            Blocked during focus
          </p>
          {BLOCKED_APPS.map(({ name, icon }) => (
            <div
              key={name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{ background: 'var(--color-bg-secondary)', opacity: 0.35 }}
            >
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <p style={{ fontSize: '13px', color: 'var(--color-text)', flex: 1 }}>{name}</p>
              <span
                style={{
                  fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px',
                  color: 'var(--color-danger-text)', background: 'var(--color-danger-bg)',
                  borderRadius: '4px', padding: '2px 6px',
                }}
              >
                blocked
              </span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
          Customize list → Settings
        </p>
      </div>

      <div className="pt-6">
        <button
          onClick={() => router.push('/focus/timer')}
          className="w-full rounded-[10px] font-medium"
          style={{ padding: '13px', fontSize: '14px', background: 'var(--color-purple)', color: '#fff' }}
        >
          Start timer →
        </button>
      </div>
    </div>
  );
}

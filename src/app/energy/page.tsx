'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationDots from '@/components/NavigationDots';
import { loadState, saveState, buildTodayTasks } from '@/lib/store';
import { EnergyLevel } from '@/lib/types';

const ENERGY_OPTIONS: {
  key: EnergyLevel;
  icon: string;
  label: string;
  base: string;
}[] = [
  { key: 'low',    icon: '😴', label: 'Low energy',    base: '~5 min per task'  },
  { key: 'medium', icon: '😐', label: 'Medium energy',  base: '~25 min per task' },
  { key: 'high',   icon: '⚡', label: 'High energy',    base: '~45 min per task' },
];

export default function EnergyPage() {
  const router = useRouter();
  const [selected, setSelected]   = useState<EnergyLevel | null>(null);
  const [summary,  setSummary]    = useState('');
  const [preview,  setPreview]    = useState<Record<EnergyLevel, string>>({ low: '', medium: '', high: '' });
  const [error,    setError]      = useState('');

  useEffect(() => {
    const state = loadState();
    if (!state.goals.length) { router.replace('/'); return; }

    setSummary(state.aiSummary ?? '');

    // Build energy-card task-count previews
    const make = (energy: EnergyLevel): string => {
      const tasks = state.goals
        .map((g) => {
          const pool = energy === 'low' ? g.tasksEasy : energy === 'medium' ? g.tasksMedium : g.tasksHard;
          return pool.filter((t) => !t.isDone).length;
        })
        .reduce((a, b) => a + b, 0);
      const time = energy === 'low' ? '~30 min' : energy === 'medium' ? '~1 h' : '~2 h';
      return tasks > 0 ? `${tasks} task${tasks > 1 ? 's' : ''} · ${time}` : 'No tasks available';
    };
    setPreview({ low: make('low'), medium: make('medium'), high: make('high') });
  }, [router]);

  function handleGo() {
    if (!selected) { setError('Choose your energy level to continue.'); return; }
    const state = loadState();
    if (!state.goals.length) { router.replace('/'); return; }

    const todayTasks = buildTodayTasks(selected, state.goals);
    saveState({ ...state, currentEnergy: selected, todayTasks, lastResult: null });
    router.push('/tasks');
  }

  return (
    <div className="screen flex-1 flex flex-col">
      <div className="flex-1 space-y-6">

        {/* Heading */}
        <div className="space-y-1">
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.3 }}>
            How much energy do<br />you have right now?
          </h1>
        </div>

        {/* AI summary card */}
        {summary && (
          <div
            style={{
              background: 'var(--color-purple-light)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '12px',
              color: 'var(--color-purple-dark)',
              lineHeight: 1.6,
            }}
          >
            {summary}
          </div>
        )}

        {/* Section label */}
        <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-tertiary)' }}>
          Choose for today
        </p>

        {/* Energy cards */}
        <div className="space-y-2">
          {ENERGY_OPTIONS.map(({ key, icon, label, base }) => {
            const isSelected = selected === key;
            return (
              <button
                key={key}
                onClick={() => { setSelected(key); setError(''); }}
                className="w-full flex items-center gap-3 text-left rounded-[10px]"
                style={{
                  padding:    '12px',
                  border:     isSelected ? '1.5px solid var(--color-purple)' : '0.5px solid var(--color-border)',
                  background: isSelected ? 'var(--color-purple-light)' : 'var(--color-bg)',
                }}
              >
                <span style={{ fontSize: '22px', lineHeight: 1 }}>{icon}</span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' }}>{label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {preview[key] || base}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p style={{ fontSize: '12px', color: 'var(--color-danger-text)' }}>{error}</p>
        )}
      </div>

      {/* CTA */}
      <div className="space-y-5 pt-6">
        <button
          onClick={handleGo}
          className="w-full rounded-[10px] font-medium"
          style={{ padding: '13px', fontSize: '14px', background: 'var(--color-purple)', color: '#fff' }}
        >
          Let&apos;s go →
        </button>
        <NavigationDots total={4} current={1} />
      </div>
    </div>
  );
}

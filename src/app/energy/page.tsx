'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationDots from '@/components/NavigationDots';
import { loadState, saveState, getNextTask } from '@/lib/store';
import { EnergyLevel } from '@/lib/types';

const ENERGY_OPTIONS: {
  key: EnergyLevel;
  icon: string;
  label: string;
  desc: string;
}[] = [
  { key: 'low',    icon: '😴', label: 'Low',    desc: "I'll give you the simplest possible action" },
  { key: 'medium', icon: '😐', label: 'Medium',  desc: "A normal task, you've got this" },
  { key: 'high',   icon: '⚡', label: 'High',    desc: "Let's take a real step forward" },
];

export default function EnergyPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<EnergyLevel | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const state = loadState();
    if (!state.goals.length) router.replace('/');
  }, [router]);

  function handleSubmit() {
    if (!selected) {
      setError('Please select your energy level.');
      return;
    }
    const state = loadState();
    if (!state.goals.length) { router.replace('/'); return; }

    const result = getNextTask(selected, state.goals);
    saveState({
      ...state,
      currentEnergy: selected,
      currentGoalId: result?.goal.id ?? null,
      currentTaskId: result?.task.id ?? null,
      lastResult: null,
      simplifiedText: null,
    });

    router.push('/task');
  }

  return (
    <div className="screen flex-1 flex flex-col">
      <div className="flex-1 space-y-8">
        {/* Heading */}
        <div className="space-y-2">
          <h1
            className="font-medium leading-[1.3]"
            style={{ fontSize: '22px', color: 'var(--color-text)' }}
          >
            How much energy do you<br />have right now?
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            We&apos;ll match the task to how you feel
          </p>
        </div>

        {/* Energy cards */}
        <div className="space-y-3">
          {ENERGY_OPTIONS.map(({ key, icon, label, desc }) => {
            const isSelected = selected === key;
            return (
              <button
                key={key}
                onClick={() => { setSelected(key); setError(''); }}
                className="w-full flex items-center gap-3 rounded-xl text-left transition-all"
                style={{
                  padding: '16px',
                  border: isSelected
                    ? '1.5px solid var(--color-text)'
                    : '0.5px solid var(--color-border)',
                  background: isSelected ? 'var(--color-bg-secondary)' : 'var(--color-bg)',
                }}
              >
                <span style={{ fontSize: '24px', lineHeight: 1 }}>{icon}</span>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text)' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-[13px]" style={{ color: 'var(--color-rest)' }}>{error}</p>
        )}
      </div>

      {/* CTA */}
      <div className="space-y-6 pt-8">
        <button
          onClick={handleSubmit}
          className="w-full py-[14px] rounded-[10px] text-[15px] font-medium"
          style={{ background: 'var(--color-text)', color: '#fff' }}
        >
          Show me the task →
        </button>

        <NavigationDots total={4} current={1} />
      </div>
    </div>
  );
}

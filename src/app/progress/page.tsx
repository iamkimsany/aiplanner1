'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationDots from '@/components/NavigationDots';
import ProgressBar from '@/components/ProgressBar';
import BalanceCircle from '@/components/BalanceCircle';
import { loadState } from '@/lib/store';
import { Session } from '@/lib/types';

function calcBalance(sessions: Session[]) {
  const total = sessions.length || 1;
  const doneCount = sessions.filter((s) => s.result === 'done').length;
  const rate = doneCount / total;
  return {
    study:  Math.min(100, Math.round(rate * 70 + 20)),
    health: Math.min(100, Math.round(rate * 50 + 30)),
    hobby:  Math.min(100, Math.round(rate * 80 + 10)),
    rest:   Math.min(100, Math.round(100 - rate * 30)),
  };
}

const BALANCE_CONFIG = [
  { key: 'study',  label: 'Study',   color: 'var(--color-study)',  bg: 'var(--color-study-bg)' },
  { key: 'health', label: 'Health',  color: 'var(--color-health)', bg: 'var(--color-health-bg)' },
  { key: 'hobby',  label: 'Hobbies', color: 'var(--color-hobby)',  bg: 'var(--color-hobby-bg)' },
  { key: 'rest',   label: 'Rest',    color: 'var(--color-rest)',   bg: 'var(--color-rest-bg)' },
] as const;

export default function ProgressPage() {
  const router = useRouter();
  const [state, setState] = useState<ReturnType<typeof loadState> | null>(null);

  useEffect(() => {
    const s = loadState();
    if (!s.lastResult) { router.replace('/energy'); return; }
    setState(s);
  }, [router]);

  if (!state) return null;

  const isDone = state.lastResult === 'done';
  const goal = state.goal;
  const progress = goal ? Math.round((goal.progress / goal.total) * 100) : 0;
  const balance = calcBalance(state.sessions);

  return (
    <div className="screen flex-1 flex flex-col">
      <div className="flex-1 space-y-8">
        {/* Reaction heading */}
        <div className="space-y-3">
          <p style={{ fontSize: '28px', fontWeight: 500, color: 'var(--color-text)' }}>
            {isDone ? '✓' : '→'}
          </p>
          <h1
            className="font-medium leading-[1.3]"
            style={{ fontSize: '22px', color: 'var(--color-text)' }}
          >
            {isDone ? "Good. You're moving forward." : "Okay, let's simplify."}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {isDone
              ? 'Every step adds up.'
              : 'No pressure. Here is your next step:'}
          </p>
        </div>

        {/* Simplified task (simplify mode only) */}
        {!isDone && state.simplifiedText && (
          <div
            className="rounded-xl p-4"
            style={{
              background: 'var(--color-bg-secondary)',
              borderLeft: '3px solid var(--color-text)',
            }}
          >
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.4 }}>
              &ldquo;{state.simplifiedText}&rdquo;
            </p>
          </div>
        )}

        {/* Progress bar */}
        {goal && (
          <div className="space-y-2">
            <ProgressBar percent={progress} />
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {goal.progress} / {goal.total} steps
            </p>
          </div>
        )}

        {/* Life balance */}
        <div className="space-y-4">
          <p
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--color-text-tertiary)',
            }}
          >
            Life balance
          </p>
          <div className="flex justify-between">
            {BALANCE_CONFIG.map(({ key, label, color, bg }) => (
              <BalanceCircle
                key={key}
                label={label}
                percent={balance[key]}
                color={color}
                bg={bg}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-6 pt-8">
        <button
          onClick={() => router.push('/energy')}
          className="w-full py-[14px] rounded-[10px] text-[15px] font-medium"
          style={{ background: 'var(--color-text)', color: '#fff' }}
        >
          Next task →
        </button>

        <NavigationDots total={4} current={3} />
      </div>
    </div>
  );
}

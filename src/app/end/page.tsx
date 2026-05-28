'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationDots from '@/components/NavigationDots';
import { loadState, calcStreak, getNextUndoneTask } from '@/lib/store';

export default function EndPage() {
  const router = useRouter();

  const [tasksDone,   setTasksDone]   = useState(0);
  const [tasksTotal,  setTasksTotal]  = useState(0);
  const [streak,      setStreak]      = useState(0);
  const [daysLeft,    setDaysLeft]    = useState<number | null>(null);
  const [tomorrow,    setTomorrow]    = useState('');

  useEffect(() => {
    const state = loadState();

    // Today's session stats
    const todayStr   = new Date().toISOString().slice(0, 10);
    const todaySess  = state.sessions.filter((s) => s.createdAt.slice(0, 10) === todayStr);
    setTasksDone(todaySess.filter((s) => s.result === 'done').length);
    setTasksTotal(state.todayTasks.length);

    setStreak(calcStreak(state.sessions));

    // Nearest deadline
    const nearest = state.goals
      .filter((g) => g.type === 'deadline' && g.deadline)
      .map((g) => {
        const ms = new Date(g.deadline!).getTime() - Date.now();
        return Math.ceil(ms / (1000 * 60 * 60 * 24));
      })
      .filter((d) => d >= 0)
      .sort((a, b) => a - b)[0];
    setDaysLeft(nearest ?? null);

    // Tomorrow preview — pick next undone medium task from first goal
    const energy = state.currentEnergy ?? 'medium';
    const nextGoal = state.goals.find((g) => getNextUndoneTask(energy, g) !== null);
    const nextTask = nextGoal ? getNextUndoneTask(energy, nextGoal) : null;
    if (nextTask && nextGoal) {
      setTomorrow(`Tomorrow: ${nextGoal.title} — "${nextTask.text}". Start in the morning while energy is high.`);
    }
  }, []);

  return (
    <div className="screen flex-1 flex flex-col">
      <div className="flex-1 flex flex-col gap-6">

        {/* Celebration */}
        <div className="text-center space-y-2 pt-4">
          <p style={{ fontSize: '48px', lineHeight: 1 }}>🎉</p>
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text)', marginTop: '8px' }}>
            All done for today!
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {tasksDone} of {tasksTotal > 0 ? tasksTotal : tasksDone} tasks completed.
            {' '}You did great — rest now.
          </p>
        </div>

        {/* Stat pills */}
        <div className="flex gap-2 flex-wrap justify-center">
          <div
            style={{
              background: 'var(--color-purple-light)', color: 'var(--color-purple-text)',
              borderRadius: '20px', padding: '5px 12px', fontSize: '12px', fontWeight: 500,
            }}
          >
            {tasksDone}/{tasksTotal > 0 ? tasksTotal : tasksDone} today
          </div>
          <div
            style={{
              background: 'var(--color-health-bg)', color: 'var(--color-health-text)',
              borderRadius: '20px', padding: '5px 12px', fontSize: '12px', fontWeight: 500,
            }}
          >
            {streak} day{streak !== 1 ? 's' : ''} in a row
          </div>
          {daysLeft !== null && (
            <div
              style={{
                background: 'var(--color-rest-bg)', color: 'var(--color-rest-text)',
                borderRadius: '20px', padding: '5px 12px', fontSize: '12px', fontWeight: 500,
              }}
            >
              {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
            </div>
          )}
        </div>

        {/* AI tomorrow card */}
        {tomorrow && (
          <div
            style={{
              borderLeft:   '2px solid var(--color-purple)',
              borderRadius: '0 10px 10px 0',
              background:   'var(--color-purple-light)',
              padding:      '10px 12px',
            }}
          >
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-purple)', marginBottom: '4px' }}>
              AI says
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-purple-dark)', lineHeight: 1.6 }}>
              &ldquo;{tomorrow}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="space-y-5 pt-6">
        <button
          onClick={() => router.push('/')}
          className="w-full rounded-[10px] font-medium"
          style={{ padding: '13px', fontSize: '14px', background: 'var(--color-purple)', color: '#fff' }}
        >
          Start again →
        </button>
        <NavigationDots total={5} current={4} />
      </div>
    </div>
  );
}

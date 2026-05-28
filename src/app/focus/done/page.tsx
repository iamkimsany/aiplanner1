'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadState, calcStreak, getNextUndoneTask } from '@/lib/store';

export default function FocusDonePage() {
  const router = useRouter();

  const [mins,         setMins]         = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [taskText,     setTaskText]     = useState('');
  const [focusToday,   setFocusToday]   = useState(0);
  const [streak,       setStreak]       = useState(0);
  const [topicsDone,   setTopicsDone]   = useState(0);
  const [topicsTotal,  setTopicsTotal]  = useState(0);
  const [tomorrow,     setTomorrow]     = useState('');

  useEffect(() => {
    const state = loadState();
    if (!state.lastFocusDone) { router.replace('/tasks'); return; }

    const fd = state.lastFocusDone;
    setMins(fd.durationMinutes);
    setDistractions(fd.distractions);
    setTaskText(fd.taskText);

    // Focus time today (sum of today's focus sessions)
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayFocus = state.focusSessions
      .filter((s) => s.startedAt.slice(0, 10) === todayStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    setFocusToday(todayFocus);

    setStreak(calcStreak(state.sessions));

    // Progress across all goals
    const done  = state.goals.reduce((acc, g) => acc + g.progress, 0);
    const total = state.goals.reduce((acc, g) => acc + g.total, 0);
    setTopicsDone(done);
    setTopicsTotal(total);

    // Tomorrow preview — next undone task at current energy
    const energy   = state.currentEnergy ?? 'medium';
    const nextGoal = state.goals.find((g) => getNextUndoneTask(energy, g) !== null);
    const nextTask = nextGoal ? getNextUndoneTask(energy, nextGoal) : null;
    if (nextTask && nextGoal) {
      setTomorrow(
        `Tomorrow: ${nextGoal.title} — "${nextTask.text}". Schedule it while your energy is still high.`
      );
    }
  }, [router]);

  return (
    <div className="screen flex-1 flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center gap-5 text-center">

        {/* Checkmark */}
        <div
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--color-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ color: '#fff', fontSize: '24px', lineHeight: 1 }}>✓</span>
        </div>

        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text)' }}>Well done!</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
            {mins} min of pure focus.{' '}
            {distractions === 0
              ? 'Zero distractions. That\'s strong.'
              : `${distractions} distraction${distractions > 1 ? 's' : ''}. Still good.`}
          </p>
        </div>

        {/* Stat cards */}
        <div className="flex gap-3 w-full">
          <div
            className="flex-1 rounded-xl p-3 text-center"
            style={{ background: 'var(--color-purple-light)' }}
          >
            <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-purple-dark)' }}>
              {focusToday} min
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-purple-dark)', opacity: 0.7, marginTop: '2px' }}>
              focus today
            </p>
          </div>
          <div
            className="flex-1 rounded-xl p-3 text-center"
            style={{ background: 'var(--color-health-bg)' }}
          >
            <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-health-text)' }}>
              {streak}d
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-health-text)', opacity: 0.7, marginTop: '2px' }}>
              days in a row
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {topicsTotal > 0 && (
          <div className="w-full space-y-1">
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              {topicsDone} of {topicsTotal} topics done
            </p>
            <div style={{ height: '3px', background: 'var(--color-border)', borderRadius: '100px', overflow: 'hidden' }}>
              <div
                className="progress-fill"
                style={{
                  height: '3px',
                  width: `${Math.round((topicsDone / topicsTotal) * 100)}%`,
                  background: 'var(--color-purple)',
                  borderRadius: '100px',
                }}
              />
            </div>
          </div>
        )}
        {/* AI says — tomorrow preview */}
        {tomorrow && (
          <div
            style={{
              borderLeft:   '2px solid var(--color-purple)',
              borderRadius: '0 10px 10px 0',
              background:   'var(--color-purple-light)',
              padding:      '10px 12px',
              width:        '100%',
              textAlign:    'left',
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

      <div className="pt-6">
        <button
          onClick={() => router.push('/tasks')}
          className="w-full rounded-[10px] font-medium"
          style={{ padding: '13px', fontSize: '14px', background: 'var(--color-purple)', color: '#fff' }}
        >
          Next task →
        </button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadState, saveState, genId, getAllTasksInGoal,
  updateGoalProgress, markTodayTaskDone,
} from '@/lib/store';
import { Goal, Task } from '@/lib/types';

const RADIUS      = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function pad(n: number) { return String(n).padStart(2, '0'); }

function formatRemaining(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${pad(m)}:${pad(s)}`;
}

export default function FocusTimerPage() {
  const router = useRouter();

  const [task,    setTask]    = useState<Task | null>(null);
  const [goal,    setGoal]    = useState<Goal | null>(null);
  const [total,   setTotal]   = useState(0);  // total seconds
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused]   = useState(false);
  const [distractions, setDistractions] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const distractionsRef = useRef(0);

  useEffect(() => {
    const state = loadState();
    if (!state.activeFocus) { router.replace('/tasks'); return; }

    const g = state.goals.find((g) => g.id === state.activeFocus!.goalId) ?? null;
    const t = g ? getAllTasksInGoal(g).find((t) => t.id === state.activeFocus!.taskId) ?? null : null;
    if (!g || !t) { router.replace('/tasks'); return; }

    setGoal(g);
    setTask(t);
    distractionsRef.current = state.activeFocus.distractions;
    setDistractions(state.activeFocus.distractions);

    const totalSecs = state.activeFocus.durationMinutes * 60;
    const elapsed   = Math.floor((Date.now() - new Date(state.activeFocus.startedAt).getTime()) / 1000);
    const rem       = Math.max(0, totalSecs - elapsed);
    setTotal(totalSecs);
    setRemaining(rem);
    setElapsed(Math.min(elapsed, totalSecs));
  }, [router]);

  // Countdown interval
  useEffect(() => {
    if (total === 0) return;
    if (isPaused) { clearInterval(intervalRef.current!); return; }

    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(intervalRef.current!); return 0; }
        return r - 1;
      });
      setElapsed((e) => Math.min(e + 1, total));
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [isPaused, total]);

  function addDistraction() {
    distractionsRef.current += 1;
    setDistractions(distractionsRef.current);
    // Persist distraction count
    const state = loadState();
    if (state.activeFocus) {
      saveState({ ...state, activeFocus: { ...state.activeFocus, distractions: distractionsRef.current } });
    }
  }

  function handleFinish() {
    if (!task || !goal) return;
    clearInterval(intervalRef.current!);

    const elapsedMins = Math.max(1, Math.round(elapsed / 60));
    const state       = loadState();

    const focusSession = {
      id: genId(), taskId: task.id, goalId: goal.id,
      startedAt:       state.activeFocus?.startedAt ?? new Date().toISOString(),
      durationMinutes: elapsedMins,
      distractions:    distractionsRef.current,
      completed:       true,
    };

    const session = {
      id: genId(), goalId: goal.id, taskId: task.id,
      energy: state.currentEnergy!,
      result: 'done' as const,
      createdAt: new Date().toISOString(),
    };

    const updatedGoals     = updateGoalProgress(state.goals, goal.id, task.id);
    const updatedTodayTasks = markTodayTaskDone(state.todayTasks, task.id);

    saveState({
      ...state,
      goals:         updatedGoals,
      todayTasks:    updatedTodayTasks,
      sessions:      [...state.sessions, session],
      focusSessions: [...state.focusSessions, focusSession],
      lastResult:    'done',
      activeFocus:   null,
      lastFocusDone: {
        durationMinutes: elapsedMins,
        distractions:    distractionsRef.current,
        taskText:        task.text,
        goalTitle:       goal.title,
      },
    });

    router.push('/focus/done');
  }

  if (!task || total === 0) return null;

  const progress    = elapsed / total;
  const dashOffset  = CIRCUMFERENCE * (1 - progress);
  const elapsedMins = Math.floor(elapsed / 60);
  const elapsedSecs = elapsed % 60;

  return (
    <div className="screen flex-1 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">

        {/* SVG ring */}
        <div className="relative">
          <svg width="240" height="240" viewBox="0 0 240 240">
            {/* Track */}
            <circle
              cx="120" cy="120" r={RADIUS}
              fill="none"
              stroke="var(--color-purple-light)"
              strokeWidth="8"
            />
            {/* Progress */}
            <circle
              cx="120" cy="120" r={RADIUS}
              fill="none"
              stroke="var(--color-purple)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 120 120)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          {/* Center text */}
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <p style={{ fontSize: '32px', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1 }}>
              {formatRemaining(remaining)}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
              remaining
            </p>
          </div>
        </div>

        {/* Task info */}
        <div className="text-center px-4">
          <p style={{ fontSize: '10px', color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {goal?.title}
          </p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)', marginTop: '4px', lineHeight: 1.4 }}>
            {task.text}
          </p>
        </div>

        {/* Stat cards */}
        <div className="flex gap-3 w-full px-2">
          <div
            className="flex-1 rounded-xl p-3 text-center"
            style={{ background: 'var(--color-bg-secondary)' }}
          >
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)' }}>
              {pad(elapsedMins)}:{pad(elapsedSecs)}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>time elapsed</p>
          </div>
          <button
            onClick={addDistraction}
            className="flex-1 rounded-xl p-3 text-center"
            style={{ background: 'var(--color-bg-secondary)', border: 'none' }}
            title="Tap if you got distracted"
          >
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)' }}>
              {distractions}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>distractions</p>
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-6">
        <button
          onClick={() => setIsPaused((p) => !p)}
          className="flex-1 rounded-[10px] font-medium"
          style={{
            padding: '13px', fontSize: '14px',
            background: 'var(--color-bg)',
            color: 'var(--color-text-secondary)',
            border: '0.5px solid var(--color-border-medium)',
          }}
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button
          onClick={handleFinish}
          className="flex-1 rounded-[10px] font-medium"
          style={{
            padding: '13px', fontSize: '14px',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger-text)',
            border: 'none',
          }}
        >
          ✓ Finish
        </button>
      </div>
    </div>
  );
}

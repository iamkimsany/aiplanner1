'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationDots from '@/components/NavigationDots';
import { loadState, saveState, simplify, getFreeWindows, genId, updateGoalProgress } from '@/lib/store';
import { Task, Goal } from '@/lib/types';

const DIFFICULTY_LABEL: Record<string, string> = {
  easy:   'EASY',
  medium: 'MEDIUM',
  hard:   'HARD',
};

const DIFFICULTY_MINUTES: Record<string, string> = {
  easy:   '~5 min',
  medium: '~25 min',
  hard:   '~45 min',
};

function findTaskById(goal: Goal, id: string): Task | null {
  return [
    ...goal.tasksEasy,
    ...goal.tasksMedium,
    ...goal.tasksHard,
  ].find((t) => t.id === id) ?? null;
}


function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function TaskPage() {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [freeWindow, setFreeWindow] = useState<string | null>(null);
  const [noTask, setNoTask] = useState(false);

  useEffect(() => {
    const state = loadState();
    if (!state.goals.length || !state.currentEnergy) { router.replace('/energy'); return; }

    if (!state.currentTaskId || !state.currentGoalId) {
      setNoTask(true);
      return;
    }

    const currentGoal = state.goals.find((g) => g.id === state.currentGoalId);
    const found = currentGoal ? findTaskById(currentGoal, state.currentTaskId) : null;
    if (!found) { setNoTask(true); return; }
    setTask(found);

    // Free window
    const windows = getFreeWindows(state.schedule, new Date());
    if (windows.length > 0) {
      const w = windows[0];
      setFreeWindow(`${formatTime(w.start)}–${formatTime(w.end)}`);
    }
  }, [router]);

  function handleDone() {
    const state = loadState();
    if (!state.goals.length || !state.currentGoalId || !task) return;

    const updatedGoals = updateGoalProgress(state.goals, state.currentGoalId, task.id);
    const session = {
      id: genId(),
      goalId: state.currentGoalId,
      taskId: task.id,
      energy: state.currentEnergy!,
      result: 'done' as const,
      createdAt: new Date().toISOString(),
    };

    saveState({
      ...state,
      goals: updatedGoals,
      sessions: [...state.sessions, session],
      lastResult: 'done',
      simplifiedText: null,
    });

    router.push('/progress');
  }

  function handleCantDo() {
    const state = loadState();
    if (!state.goals.length || !state.currentGoalId || !task) return;

    const simplified = simplify(task);
    const session = {
      id: genId(),
      goalId: state.currentGoalId,
      taskId: task.id,
      energy: state.currentEnergy!,
      result: 'simplified' as const,
      createdAt: new Date().toISOString(),
    };

    saveState({
      ...state,
      sessions: [...state.sessions, session],
      lastResult: 'simplified',
      simplifiedText: simplified,
    });

    router.push('/progress');
  }

  if (noTask) {
    return (
      <div className="screen flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <p style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text)' }}>
            All done at this level.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            You&apos;ve completed all tasks here. Try a higher energy level.
          </p>
        </div>
        <div className="space-y-6 pt-8">
          <button
            onClick={() => router.push('/energy')}
            className="w-full py-[14px] rounded-[10px] text-[15px] font-medium"
            style={{ background: 'var(--color-text)', color: '#fff' }}
          >
            Choose a different level →
          </button>
          <NavigationDots total={4} current={2} />
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="screen flex-1 flex flex-col">
      <div className="flex-1 space-y-6">
        {/* Label */}
        <p
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'var(--color-text-tertiary)',
          }}
        >
          Your task right now
        </p>

        <h1
          className="font-medium"
          style={{ fontSize: '22px', color: 'var(--color-text)' }}
        >
          Try to do this
        </h1>

        {/* Task card */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--color-bg-secondary)',
            borderLeft: '3px solid var(--color-text)',
          }}
        >
          {/* Tag */}
          <p
            className="mb-3"
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--color-text-tertiary)',
            }}
          >
            {DIFFICULTY_LABEL[task.difficulty]} · {DIFFICULTY_MINUTES[task.difficulty]}
          </p>

          {/* Task text */}
          <p
            className="font-medium"
            style={{ fontSize: '17px', lineHeight: 1.4, color: 'var(--color-text)' }}
          >
            &ldquo;{task.text}&rdquo;
          </p>
        </div>

        {/* Free window hint */}
        {freeWindow && (
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Free window: {freeWindow} · today
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-8">
        <button
          onClick={handleDone}
          className="w-full py-[14px] rounded-[10px] text-[15px] font-medium"
          style={{ background: 'var(--color-success)', color: '#fff' }}
        >
          Done
        </button>

        <button
          onClick={handleCantDo}
          className="w-full py-[14px] rounded-[10px] text-[15px] font-medium"
          style={{
            background: 'var(--color-bg)',
            color: 'var(--color-text-secondary)',
            border: '0.5px solid var(--color-border-medium)',
          }}
        >
          Couldn&apos;t do it
        </button>

        <div className="pt-3">
          <NavigationDots total={4} current={2} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadState,
  saveState,
  simplify,
  getFreeWindows,
  genId,
  updateGoalProgress,
} from '@/lib/store';
import { Difficulty, Goal, Task } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy:   'EASY',
  medium: 'MEDIUM',
  hard:   'HARD',
};
const DIFFICULTY_MINUTES: Record<Difficulty, string> = {
  easy:   '~5 min',
  medium: '~25 min',
  hard:   '~45 min',
};
const ENERGY_LABEL: Record<string, string> = {
  low:    '😴 Low',
  medium: '😐 Medium',
  high:   '⚡ High',
};

type ItemStatus = 'active' | 'done' | 'upcoming';

interface TaskItem {
  goalId: string;
  goalTitle: string;
  taskId: string;
  taskText: string;
  displayText: string;
  difficulty: Difficulty;
  status: ItemStatus;
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}

function getTasksFromGoal(goal: Goal): Task[] {
  return [...goal.tasksEasy, ...goal.tasksMedium, ...goal.tasksHard];
}

// ─── Card sub-components ─────────────────────────────────────────────────────

function ActiveCard({
  item,
  onDone,
  onSimplify,
}: {
  item: TaskItem;
  onDone: () => void;
  onSimplify: () => void;
}) {
  return (
    <div
      style={{
        borderRadius: '14px',
        background: '#1A1A1F',
        borderLeft: '3px solid #A78BFA',
        padding: '18px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div>
        <p
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.7px',
            color: '#666',
            marginBottom: '8px',
          }}
        >
          {item.goalTitle}
        </p>
        <p
          style={{
            fontSize: '17px',
            fontWeight: 500,
            color: '#EDECE8',
            lineHeight: 1.45,
          }}
        >
          {item.displayText}
        </p>
      </div>

      <p
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#555',
        }}
      >
        {DIFFICULTY_LABEL[item.difficulty]} · {DIFFICULTY_MINUTES[item.difficulty]}
      </p>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onDone}
          style={{
            flex: 1,
            background: '#A78BFA',
            color: '#fff',
            borderRadius: '9px',
            padding: '12px 0',
            fontSize: '14px',
            fontWeight: 500,
            border: 'none',
          }}
        >
          ✓ Done
        </button>
        <button
          onClick={onSimplify}
          style={{
            flex: 1,
            background: 'transparent',
            color: '#A78BFA',
            borderRadius: '9px',
            padding: '12px 0',
            fontSize: '14px',
            fontWeight: 500,
            border: '1px solid rgba(167,139,250,0.3)',
          }}
        >
          Simplify
        </button>
      </div>
    </div>
  );
}

function DoneCard({ item }: { item: TaskItem }) {
  return (
    <div
      style={{
        borderRadius: '14px',
        background: '#131313',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <span style={{ color: '#1a7a4a', fontSize: '15px', flexShrink: 0 }}>✓</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <span
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#444',
            marginRight: '8px',
          }}
        >
          {item.goalTitle}
        </span>
        <span
          style={{
            fontSize: '13px',
            color: '#444',
            textDecoration: 'line-through',
          }}
        >
          {item.displayText}
        </span>
      </div>
    </div>
  );
}

function UpcomingCard({ item }: { item: TaskItem }) {
  return (
    <div
      style={{
        borderRadius: '14px',
        background: '#1A1A1F',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        opacity: 0.45,
      }}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          border: '1.5px solid #555',
          flexShrink: 0,
        }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <span
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#666',
            marginRight: '8px',
          }}
        >
          {item.goalTitle}
        </span>
        <span style={{ fontSize: '13px', color: '#888' }}>{item.displayText}</span>
      </div>
    </div>
  );
}

// ─── Progress bar (fixed, full-bleed) ────────────────────────────────────────

function TopBar({ percent }: { percent: number }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: '#111113',
        zIndex: 50,
      }}
    >
      <div
        style={{
          height: '4px',
          background: '#A78BFA',
          width: `${percent}%`,
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TaskPage() {
  const router = useRouter();

  const [items, setItems]                   = useState<TaskItem[]>([]);
  const [energy, setEnergy]                 = useState<string>('');
  const [freeWindow, setFreeWindow]         = useState<string | null>(null);
  const [allDone, setAllDone]               = useState(false);
  const [noTasksAtLevel, setNoTasksAtLevel] = useState(false);

  // Override body + main to dark while this screen is mounted
  useEffect(() => {
    const main = document.querySelector('main') as HTMLElement | null;
    document.body.style.background = '#0D0D0F';
    if (main) main.style.background = '#0D0D0F';
    return () => {
      document.body.style.background = '';
      if (main) main.style.background = '';
    };
  }, []);

  useEffect(() => {
    const state = loadState();
    if (!state.goals.length || !state.currentEnergy) {
      router.replace('/energy');
      return;
    }

    setEnergy(state.currentEnergy);

    // Build one item per goal (next undone task at current energy)
    const taskItems: TaskItem[] = [];
    for (const goal of state.goals) {
      const pool =
        state.currentEnergy === 'low'    ? goal.tasksEasy :
        state.currentEnergy === 'medium' ? goal.tasksMedium :
                                           goal.tasksHard;
      const next = pool.find((t) => !t.isDone);
      if (next) {
        taskItems.push({
          goalId:      goal.id,
          goalTitle:   goal.title,
          taskId:      next.id,
          taskText:    next.text,
          displayText: next.text,
          difficulty:  next.difficulty,
          status:      taskItems.length === 0 ? 'active' : 'upcoming',
        });
      }
    }

    if (taskItems.length === 0) {
      setNoTasksAtLevel(true);
    } else {
      setItems(taskItems);
    }

    const windows = getFreeWindows(state.schedule, new Date());
    if (windows.length > 0) {
      const w = windows[0];
      setFreeWindow(`${formatTime(w.start)}–${formatTime(w.end)}`);
    }
  }, [router]);

  function handleDone(index: number) {
    const item = items[index];
    if (!item || item.status !== 'active') return;

    const state = loadState();
    const updatedGoals = updateGoalProgress(state.goals, item.goalId, item.taskId);
    const session = {
      id:        genId(),
      goalId:    item.goalId,
      taskId:    item.taskId,
      energy:    state.currentEnergy!,
      result:    'done' as const,
      createdAt: new Date().toISOString(),
    };
    saveState({
      ...state,
      goals:          updatedGoals,
      sessions:       [...state.sessions, session],
      lastResult:     'done',
      simplifiedText: null,
      currentGoalId:  item.goalId,
      currentTaskId:  item.taskId,
    });

    // Mark done, promote first upcoming → active
    const markedDone = items.map((it, i) =>
      i === index ? { ...it, status: 'done' as const } : it
    );
    const firstUpcoming = markedDone.findIndex((it) => it.status === 'upcoming');
    const newItems =
      firstUpcoming !== -1
        ? markedDone.map((it, i) =>
            i === firstUpcoming ? { ...it, status: 'active' as const } : it
          )
        : markedDone;

    setItems(newItems);
    if (newItems.every((it) => it.status === 'done')) {
      setAllDone(true);
    }
  }

  function handleSimplify(index: number) {
    const item = items[index];
    if (!item || item.status !== 'active') return;

    const state = loadState();
    const goal  = state.goals.find((g) => g.id === item.goalId);
    if (!goal) return;
    const task  = getTasksFromGoal(goal).find((t) => t.id === item.taskId);
    if (!task) return;

    const simplified = simplify(task);
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, displayText: simplified } : it))
    );
  }

  const doneCount  = items.filter((it) => it.status === 'done').length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // ── No tasks at this energy level ─────────────────────────────────────────
  if (noTasksAtLevel) {
    return (
      <div className="screen flex-1 flex flex-col">
        <TopBar percent={100} />
        <div className="flex-1 flex flex-col justify-center gap-4 text-center">
          <p style={{ fontSize: '22px', fontWeight: 600, color: '#EDECE8' }}>
            All done at this level.
          </p>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
            You&apos;ve completed all tasks here.<br />Try a different energy level.
          </p>
          <button
            onClick={() => router.push('/energy')}
            style={{
              background: '#A78BFA',
              color: '#fff',
              borderRadius: '10px',
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: 500,
              marginTop: '8px',
            }}
          >
            Choose a different level →
          </button>
        </div>
      </div>
    );
  }

  // ── Celebration ───────────────────────────────────────────────────────────
  if (allDone) {
    return (
      <div className="screen flex-1 flex flex-col">
        <TopBar percent={100} />
        <div className="flex-1 flex flex-col justify-center items-center gap-3 text-center">
          <p style={{ fontSize: '40px', lineHeight: 1 }}>🎉</p>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 600,
              color: '#EDECE8',
              marginTop: '8px',
            }}
          >
            All done for today.
          </h2>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
            {totalCount} {totalCount === 1 ? 'task' : 'tasks'} completed · great work
          </p>
          <button
            onClick={() => router.push('/progress')}
            style={{
              background: '#A78BFA',
              color: '#fff',
              borderRadius: '10px',
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: 500,
              marginTop: '16px',
            }}
          >
            See your progress →
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!items.length) return null;

  // ── Task list ─────────────────────────────────────────────────────────────
  return (
    <div className="screen flex-1 flex flex-col">
      {/* Full-bleed fixed progress stripe */}
      <TopBar percent={progressPct} />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 600,
              color: '#EDECE8',
              marginBottom: '4px',
            }}
          >
            Today
          </h1>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {totalCount} {totalCount === 1 ? 'task' : 'tasks'} · {doneCount}/{totalCount} done
          </p>
          {freeWindow && (
            <p style={{ fontSize: '12px', color: '#555', marginTop: '3px' }}>
              Free window: {freeWindow}
            </p>
          )}
        </div>

        {energy && (
          <div
            style={{
              background: 'rgba(167,139,250,0.12)',
              color: '#A78BFA',
              borderRadius: '20px',
              padding: '5px 11px',
              fontSize: '12px',
              fontWeight: 500,
              border: '1px solid rgba(167,139,250,0.2)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {ENERGY_LABEL[energy]}
          </div>
        )}
      </div>

      {/* Task cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, index) => {
          if (item.status === 'active') {
            return (
              <ActiveCard
                key={item.taskId}
                item={item}
                onDone={() => handleDone(index)}
                onSimplify={() => handleSimplify(index)}
              />
            );
          }
          if (item.status === 'done') {
            return <DoneCard key={item.taskId} item={item} />;
          }
          return <UpcomingCard key={item.taskId} item={item} />;
        })}
      </div>
    </div>
  );
}

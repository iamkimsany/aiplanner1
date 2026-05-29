'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavigationDots from '@/components/NavigationDots';
import {
  loadState, saveState, genId, getFreeWindows, formatTime,
  getAllTasksInGoal, getTaskDisplayText, updateGoalProgress, markTodayTaskDone,
  appendCompletedTask,
} from '@/lib/store';
import { TodayTask, Task, Goal, Difficulty, EnergyLevel } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFF_LABEL: Record<Difficulty, string>   = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD' };
const DIFF_MINS:  Record<Difficulty, string>   = { easy: '~5 min', medium: '~25 min', hard: '~45 min' };
const DIFF_SECS:  Record<Difficulty, number>   = { easy: 5 * 60, medium: 25 * 60, hard: 45 * 60 };
const ENERGY_LABEL: Record<EnergyLevel, string> = { low: '😴 Low', medium: '😐 Medium', high: '⚡ High' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface DisplayItem {
  todayTask: TodayTask;
  goal: Goal;
  task: Task;
  displayText: string;
}

function buildDisplayItems(todayTasks: TodayTask[], goals: Goal[]): DisplayItem[] {
  return todayTasks.flatMap((tt) => {
    const goal = goals.find((g) => g.id === tt.goalId);
    if (!goal) return [];
    const task = getAllTasksInGoal(goal).find((t) => t.id === tt.taskId);
    if (!task) return [];
    return [{ todayTask: tt, goal, task, displayText: getTaskDisplayText(task, tt.simplifyLevel) }];
  });
}

// ─── Card components ──────────────────────────────────────────────────────────

function DoneCard({ item }: { item: DisplayItem }) {
  return (
    <div
      className="task-card flex items-center gap-3 rounded-[10px] px-3 py-2"
      style={{
        borderLeft: '2px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
        opacity: 0.45,
      }}
    >
      <div
        style={{
          width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
          background: 'var(--color-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ color: '#fff', fontSize: '10px', lineHeight: 1 }}>✓</span>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--color-text)', textDecoration: 'line-through' }}>
        {item.displayText}
      </p>
    </div>
  );
}

function ActiveCard({
  item,
  freeWindow,
  onStart,
  onSimplify,
  canSimplify,
}: {
  item: DisplayItem;
  freeWindow: string | null;
  onStart: () => void;
  onSimplify: () => void;
  canSimplify: boolean;
}) {
  return (
    <div
      className="task-card rounded-[10px] p-3"
      style={{
        borderLeft:  '2px solid var(--color-purple)',
        background:  'var(--color-bg-secondary)',
      }}
    >
      {/* Category */}
      <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-purple)', marginBottom: '4px' }}>
        {item.goal.title.toUpperCase()}
      </p>

      {/* Task text */}
      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.4, marginBottom: '6px' }}>
        {item.displayText}
      </p>

      {/* Meta */}
      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
        {freeWindow ? `${freeWindow} · ` : ''}{DIFF_LABEL[item.task.difficulty]} · {DIFF_MINS[item.task.difficulty]}
      </p>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onStart}
          style={{
            flex: 1, padding: '8px', borderRadius: '7px', fontSize: '12px', fontWeight: 500,
            background: 'var(--color-purple)', color: '#fff', border: 'none',
          }}
        >
          ▶ Start
        </button>
        {canSimplify && (
          <button
            onClick={onSimplify}
            style={{
              flex: 1, padding: '8px', borderRadius: '7px', fontSize: '12px',
              background: 'var(--color-bg)', color: 'var(--color-text-secondary)',
              border: '0.5px solid var(--color-border-medium)',
            }}
          >
            Simplify
          </button>
        )}
      </div>
    </div>
  );
}

function UpcomingCard({ item }: { item: DisplayItem }) {
  return (
    <div
      className="task-card flex items-center gap-3 rounded-[10px] px-3 py-2"
      style={{
        borderLeft: '2px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
        opacity: 0.4,
      }}
    >
      <div
        style={{
          width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
          border: '1.5px solid var(--color-border-medium)',
        }}
      />
      <div className="min-w-0">
        <p style={{ fontSize: '10px', color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {item.goal.title}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text)' }}>{item.displayText}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const router = useRouter();

  const [items,       setItems]       = useState<DisplayItem[]>([]);
  const [quickGoals,  setQuickGoals]  = useState<Goal[]>([]);
  const [todayStr,    setTodayStr]    = useState('');
  const [energy,      setEnergy]      = useState<EnergyLevel>('medium');
  const [freeWindow,  setFreeWindow]  = useState<string | null>(null);
  const [allDone,     setAllDone]     = useState(false);
  const [noTasks,     setNoTasks]     = useState(false);

  const refresh = useCallback(() => {
    const state = loadState();
    if (!state.goals.length || !state.currentEnergy) { router.replace('/energy'); return; }
    setEnergy(state.currentEnergy);

    const today = new Date().toISOString().slice(0, 10);
    setTodayStr(today);

    // No-deadline (quick) goals — shown as simple checkboxes, independent of todayTasks
    const quick = state.goals.filter((g) => g.type !== 'deadline');
    setQuickGoals(quick);

    const built = buildDisplayItems(state.todayTasks, state.goals);

    // Only show "no tasks" when there are no deadline tasks AND no quick goals
    if (!built.length && !quick.length) { setNoTasks(true); return; }

    setItems(built);
    // allDone only triggers when there are actual deadline tasks and all are done
    setAllDone(built.length > 0 && built.every((d) => d.todayTask.status === 'done'));

    const windows = getFreeWindows(state.schedule, new Date());
    if (windows.length > 0) {
      const w = windows[0];
      setFreeWindow(`${formatTime(w.start)}–${formatTime(w.end)}`);
    }
  }, [router]);

  useEffect(() => { refresh(); }, [refresh]);

  // Re-run when coming back from focus flow
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [refresh]);

  function handleStart(item: DisplayItem) {
    const state = loadState();
    saveState({
      ...state,
      activeFocus: {
        taskId:          item.task.id,
        goalId:          item.goal.id,
        startedAt:       new Date().toISOString(),
        durationMinutes: DIFF_SECS[item.task.difficulty] / 60,
        distractions:    0,
      },
    });
    router.push('/focus');
  }

  function handleSimplify(item: DisplayItem) {
    const state = loadState();
    const tt    = state.todayTasks.find((t) => t.taskId === item.task.id);
    if (!tt) return;
    const newLevel    = Math.min(tt.simplifyLevel + 1, item.task.simplifiedVersions.length);
    const newTodayTasks = state.todayTasks.map((t) =>
      t.taskId === item.task.id ? { ...t, simplifyLevel: newLevel } : t
    );
    saveState({ ...state, todayTasks: newTodayTasks });
    refresh();
  }

  function handleCheckGoal(goalId: string) {
    const state = loadState();
    const goal  = state.goals.find((g) => g.id === goalId);
    if (!goal) return;
    const today = new Date().toISOString().slice(0, 10);
    if (goal.checkedAt === today) return; // already checked — one-way only
    const updatedGoals = state.goals.map((g) =>
      g.id === goalId ? { ...g, checkedAt: today } : g
    );
    const nextState = appendCompletedTask(
      { ...state, goals: updatedGoals },
      goal.title,
      goal.title, // taskText = goal title for quick one-tap items
      true,       // isQuick = true → +3% to balance
    );
    saveState(nextState);
    refresh();
  }

  // ── States ──────────────────────────────────────────────────────────────────

  if (noTasks) {
    return (
      <div className="screen flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center gap-3">
          <p style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}>
            All done at this level.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            You&apos;ve completed all tasks here. Try a different energy level.
          </p>
          <button
            onClick={() => router.push('/energy')}
            style={{ padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, background: 'var(--color-purple)', color: '#fff', marginTop: '8px' }}
          >
            Choose a different level →
          </button>
        </div>
        <NavigationDots total={4} current={2} />
      </div>
    );
  }

  // Auto-redirect when all tasks are done — no celebration state on this screen
  useEffect(() => {
    if (allDone) router.push('/overview');
  }, [allDone, router]);

  // ── Task list ────────────────────────────────────────────────────────────────

  const deadlineDone  = items.filter((i) => i.todayTask.status === 'done').length;
  const quickDone     = quickGoals.filter((g) => g.checkedAt === todayStr).length;
  const doneCount     = deadlineDone + quickDone;
  const totalCount    = items.length + quickGoals.length;
  const pct           = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="screen flex-1 flex flex-col">
      {/* Full-bleed top progress bar */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: '3px', background: 'var(--color-border)', zIndex: 50,
        }}
      >
        <div
          className="progress-fill"
          style={{ height: '3px', width: `${pct}%`, background: 'var(--color-purple)' }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}>Today</h1>
        <div className="flex items-center gap-2">
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {doneCount} / {totalCount} done
          </p>
          <div
            style={{
              fontSize: '11px', fontWeight: 500,
              background: 'var(--color-purple-light)', color: 'var(--color-purple-text)',
              borderRadius: '20px', padding: '3px 8px',
            }}
          >
            {ENERGY_LABEL[energy]}
          </div>
        </div>
      </div>

      {/* Task cards */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const { status } = item.todayTask;
          if (status === 'done')     return <DoneCard     key={item.task.id} item={item} />;
          if (status === 'upcoming') return <UpcomingCard key={item.task.id} item={item} />;
          return (
            <ActiveCard
              key={item.task.id}
              item={item}
              freeWindow={freeWindow}
              onStart={() => handleStart(item)}
              onSimplify={() => handleSimplify(item)}
              canSimplify={item.todayTask.simplifyLevel < item.task.simplifiedVersions.length}
            />
          );
        })}

        {/* Quick Tasks — no-deadline one-tap checkboxes */}
        {quickGoals.length > 0 && (
          <div className="space-y-2 pt-1">
            {/* Divider only shown when there are deadline tasks above */}
            {items.length > 0 && (
              <div className="flex items-center gap-3 py-1">
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-text-tertiary)' }}>
                  Quick Tasks
                </p>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              </div>
            )}
            {items.length === 0 && (
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-text-tertiary)', paddingBottom: '4px' }}>
                Quick Tasks
              </p>
            )}
            {quickGoals.map((goal) => {
              const isDone = goal.checkedAt === todayStr;
              return (
                <button
                  key={goal.id}
                  onClick={() => handleCheckGoal(goal.id)}
                  className="task-card w-full flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-left"
                  style={{
                    borderLeft: `2px solid ${isDone ? 'var(--color-border)' : 'var(--color-purple)'}`,
                    background: 'var(--color-bg-secondary)',
                    opacity:    isDone ? 0.5 : 1,
                  }}
                >
                  {/* Checkbox */}
                  <div
                    style={{
                      width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                      border:      isDone ? 'none' : '1.5px solid var(--color-border-medium)',
                      background:  isDone ? 'var(--color-purple)' : 'transparent',
                      display:     'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {isDone && <span style={{ color: '#fff', fontSize: '10px', lineHeight: 1 }}>✓</span>}
                  </div>
                  <p style={{
                    fontSize:       '13px',
                    color:          isDone ? 'var(--color-text-secondary)' : 'var(--color-text)',
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}>
                    {goal.title}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="pt-5">
        <NavigationDots total={4} current={2} />
      </div>
    </div>
  );
}

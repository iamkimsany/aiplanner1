import { AppState, Goal, Task, EnergyLevel, ScheduleBlock, TodayTask, Session } from './types';

const KEY = 'juststart_v2';

export const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  { id: 's1', title: 'School', days: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '13:00' },
  { id: 's2', title: 'Sleep',  days: [0, 1, 2, 3, 4, 5, 6], startTime: '22:00', endTime: '07:00' },
  { id: 's3', title: 'Gym',    days: [1, 3, 5], startTime: '17:00', endTime: '18:30' },
];

const defaultState: AppState = {
  goals:         [],
  schedule:      DEFAULT_SCHEDULE,
  sessions:      [],
  focusSessions: [],
  todayTasks:    [],
  currentEnergy: null,
  lastResult:    null,
  aiSummary:     null,
  activeFocus:   null,
  lastFocusDone: null,
};

export function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

// ─── Task helpers ─────────────────────────────────────────────────────────────

/** Next undone task in a goal at the given energy level. */
export function getNextUndoneTask(energy: EnergyLevel, goal: Goal): Task | null {
  const pool =
    energy === 'low'    ? goal.tasksEasy :
    energy === 'medium' ? goal.tasksMedium :
                          goal.tasksHard;
  return pool.find((t) => !t.isDone) ?? null;
}

/** Build today's initial task list: one entry per goal (first = active). */
export function buildTodayTasks(energy: EnergyLevel, goals: Goal[]): TodayTask[] {
  const list: TodayTask[] = [];
  for (const goal of goals) {
    const task = getNextUndoneTask(energy, goal);
    if (task) {
      list.push({
        goalId:       goal.id,
        taskId:       task.id,
        status:       list.length === 0 ? 'active' : 'upcoming',
        simplifyLevel: 0,
      });
    }
  }
  return list;
}

/** Mark a task done and promote the next upcoming → active. */
export function markTodayTaskDone(todayTasks: TodayTask[], taskId: string): TodayTask[] {
  const marked = todayTasks.map((t) =>
    t.taskId === taskId ? { ...t, status: 'done' as const } : t
  );
  const nextIdx = marked.findIndex((t) => t.status === 'upcoming');
  if (nextIdx === -1) return marked;
  return marked.map((t, i) => (i === nextIdx ? { ...t, status: 'active' as const } : t));
}

/** Permanently mark a task as done inside the goals array and bump progress. */
export function updateGoalProgress(goals: Goal[], goalId: string, taskId: string): Goal[] {
  return goals.map((g) => {
    if (g.id !== goalId) return g;
    const mark = (tasks: Task[]) =>
      tasks.map((t) => (t.id === taskId ? { ...t, isDone: true } : t));
    return {
      ...g,
      tasksEasy:   mark(g.tasksEasy),
      tasksMedium: mark(g.tasksMedium),
      tasksHard:   mark(g.tasksHard),
      progress:    g.progress + 1,
    };
  });
}

/** Current display text for a task given its simplify level. */
export function getTaskDisplayText(task: Task, simplifyLevel: number): string {
  if (simplifyLevel === 0) return task.text;
  return task.simplifiedVersions[simplifyLevel - 1] ?? task.text;
}

/** Lookup every task across all difficulty pools of a goal. */
export function getAllTasksInGoal(goal: Goal): Task[] {
  return [...goal.tasksEasy, ...goal.tasksMedium, ...goal.tasksHard];
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

/** Returns free time slots today (07:00–22:00) minus schedule blocks. */
export function getFreeWindows(
  schedule: ScheduleBlock[],
  date: Date
): { start: string; end: string }[] {
  const dow  = date.getDay();
  const busy = schedule
    .filter((b) => b.days.includes(dow) && b.startTime < b.endTime)
    .map((b) => ({ start: b.startTime, end: b.endTime }))
    .sort((a, b) => a.start.localeCompare(b.start));

  let free: { start: string; end: string }[] = [{ start: '07:00', end: '22:00' }];
  for (const block of busy) {
    const next: typeof free = [];
    for (const slot of free) {
      if (block.end <= slot.start || block.start >= slot.end) {
        next.push(slot);
      } else {
        if (slot.start < block.start) next.push({ start: slot.start, end: block.start });
        if (block.end   < slot.end)   next.push({ start: block.end,  end: slot.end   });
      }
    }
    free = next;
  }
  return free.filter((s) => s.start < s.end);
}

export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}

// ─── Stats helpers ────────────────────────────────────────────────────────────

/** Consecutive-day streak from sessions (today = day 0). */
export function calcStreak(sessions: Session[]): number {
  const days  = new Set(sessions.map((s) => s.createdAt.slice(0, 10)));
  const today = new Date();
  let streak  = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toISOString().slice(0, 10))) { streak++; } else { break; }
  }
  return streak;
}

/** Weekly life-balance percentages derived from sessions + schedule. */
export function calcBalance(sessions: Session[], schedule: ScheduleBlock[]) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekSessions = sessions.filter((s) => new Date(s.createdAt) >= weekStart);
  const done  = weekSessions.filter((s) => s.result === 'done').length;
  const total = Math.max(weekSessions.length, 1);
  const rate  = done / total;

  const gymMins = schedule
    .filter((b) => b.title.toLowerCase().includes('gym') && b.startTime < b.endTime)
    .reduce((acc, b) => {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      return acc + (eh * 60 + em - sh * 60 - sm);
    }, 0);

  return {
    study:  Math.min(100, Math.round(rate * 60 + 20)),
    health: Math.min(100, Math.round(Math.min(gymMins / 180, 1) * 70 + 15)),
    hobby:  Math.min(100, Math.round(rate * 65 + 15)),
    rest:   Math.min(100, Math.round(100 - rate * 40)),
  };
}

/** Local AI balance tip based on computed percentages. */
export function balanceTip(b: { study: number; health: number; hobby: number; rest: number }): string {
  const entries = [
    { key: 'study',  val: b.study,  low: 'study time is low — try one focused session' },
    { key: 'health', val: b.health, low: 'health score is low — a short walk helps' },
    { key: 'hobby',  val: b.hobby,  low: 'hobbies are falling behind — schedule one hour' },
    { key: 'rest',   val: b.rest,   low: 'rest is low — plan an earlier bedtime tonight' },
  ];
  const lowest = entries.reduce((a, b) => (b.val < a.val ? b : a));
  return `Your ${lowest.low}.`;
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

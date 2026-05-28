import { AppState, Goal, Task, EnergyLevel, ScheduleBlock } from './types';

const KEY = 'juststart_v1';

export const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  { id: 's1', title: 'School', days: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '13:00' },
  { id: 's2', title: 'Sleep',  days: [0, 1, 2, 3, 4, 5, 6], startTime: '22:00', endTime: '07:00' },
  { id: 's3', title: 'Gym',    days: [1, 3, 5], startTime: '17:00', endTime: '18:30' },
];

const defaultState: AppState = {
  goals: [],
  schedule: DEFAULT_SCHEDULE,
  sessions: [],
  currentEnergy: null,
  currentGoalId: null,
  currentTaskId: null,
  lastResult: null,
  simplifiedText: null,
};

export function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    // Migration: old format had `goal: Goal | null`
    if ('goal' in parsed && !('goals' in parsed)) {
      parsed.goals = parsed.goal ? [parsed.goal] : [];
      delete parsed.goal;
    }
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

/** Get the next undone task across all goals for a given energy level. */
export function getNextTask(
  energy: EnergyLevel,
  goals: Goal[]
): { task: Task; goal: Goal } | null {
  for (const goal of goals) {
    const pool =
      energy === 'low'    ? goal.tasksEasy :
      energy === 'medium' ? goal.tasksMedium :
                            goal.tasksHard;
    const task = pool.find((t) => !t.isDone);
    if (task) return { task, goal };
  }
  return null;
}

/** Mark a task as done within its goal and increment progress. */
export function updateGoalProgress(
  goals: Goal[],
  goalId: string,
  taskId: string
): Goal[] {
  return goals.map((g) => {
    if (g.id !== goalId) return g;
    const markIn = (tasks: Task[]) =>
      tasks.map((t) => (t.id === taskId ? { ...t, isDone: true } : t));
    return {
      ...g,
      tasksEasy:   markIn(g.tasksEasy),
      tasksMedium: markIn(g.tasksMedium),
      tasksHard:   markIn(g.tasksHard),
      progress:    g.progress + 1,
    };
  });
}

const SIMPLIFY_MAP: Record<string, string> = {
  'Write a complete section':    'Write one paragraph',
  'Write one paragraph':         'Write one sentence',
  'Write one sentence':          'Open the document',
  'Open the document':           'Look at the file for 10 seconds',
};

export function simplify(task: Task): string {
  return SIMPLIFY_MAP[task.text] ?? `Just start: ${task.text.toLowerCase()}`;
}

/** Returns free time slots for today based on the schedule (07:00–22:00 window). */
export function getFreeWindows(
  schedule: ScheduleBlock[],
  date: Date
): { start: string; end: string }[] {
  const dow = date.getDay();

  // Only consider blocks where start < end (skip overnight like Sleep 22–07)
  const busy = schedule
    .filter((b) => b.days.includes(dow) && b.startTime < b.endTime)
    .map((b) => ({ start: b.startTime, end: b.endTime }))
    .sort((a, b) => a.start.localeCompare(b.start));

  let free: { start: string; end: string }[] = [{ start: '07:00', end: '22:00' }];

  for (const block of busy) {
    const next: { start: string; end: string }[] = [];
    for (const slot of free) {
      if (block.end <= slot.start || block.start >= slot.end) {
        next.push(slot);
      } else {
        if (slot.start < block.start) next.push({ start: slot.start, end: block.start });
        if (block.end < slot.end) next.push({ start: block.end, end: slot.end });
      }
    }
    free = next;
  }

  return free.filter((s) => s.start < s.end);
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

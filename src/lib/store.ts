import { AppState, Goal, Task, EnergyLevel, ScheduleBlock, TodayTask, Session, CompletedTaskEntry } from './types';

const KEY = 'juststart_v2';

export const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  { id: 's1', title: 'School', days: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '13:00' },
  { id: 's2', title: 'Sleep',  days: [0, 1, 2, 3, 4, 5, 6], startTime: '22:00', endTime: '07:00' },
  { id: 's3', title: 'Gym',    days: [1, 3, 5], startTime: '17:00', endTime: '18:30' },
];

const defaultState: AppState = {
  goals:                [],
  schedule:             DEFAULT_SCHEDULE,
  sessions:             [],
  focusSessions:        [],
  todayTasks:           [],
  currentEnergy:        null,
  lastResult:           null,
  aiSummary:            null,
  completedTaskHistory: {},
  activeFocus:          null,
  lastFocusDone:        null,
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

/**
 * Map a goal title to one of the four life-balance categories.
 * Priority: study → health → rest → hobby (default).
 */
export function categorizeGoalTitle(title: string): 'study' | 'health' | 'hobby' | 'rest' {
  const t = title.toLowerCase();
  if (/exam|study|read|write|course|learn|book|chapter|homework|prep|research|university|school|class/.test(t))
    return 'study';
  if (/run|gym|workout|exercise|yoga|swim|walk|sport|fitness|train|stretch|km|steps/.test(t))
    return 'health';
  if (/rest|relax|nap|break|movie|series|game|chill/.test(t))
    return 'rest';
  return 'hobby';
}

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

/**
 * Weekly life-balance percentages (0–100) derived from completed-task history
 * and passive schedule blocks. Resets naturally every Monday — only entries
 * from Monday 00:00 to now are included.
 *
 * Active contributions (from completedTaskHistory this week):
 *   focus-session task  → +5% to its category
 *   nodeadline checkbox → +3% to its category
 *
 * Passive schedule contributions (one-off bonuses per week):
 *   sleep block present                  → +20% to rest
 *   gym/yoga/sport block on 3+ days      → +15% to health
 *   university/school block on 3+ days   → +15% to study
 */
export function calcBalance(
  history: Record<string, CompletedTaskEntry[]>,
  schedule: ScheduleBlock[],
): { study: number; health: number; hobby: number; rest: number } {
  const result = { study: 0, health: 0, hobby: 0, rest: 0 };

  // Monday 00:00 of the current week
  const now    = new Date();
  const dow    = now.getDay(); // 0 = Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dow + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().slice(0, 10);
  const todayStr  = now.toISOString().slice(0, 10);

  // Active: sum completed tasks this week
  for (const [dateStr, entries] of Object.entries(history ?? {})) {
    if (dateStr < mondayStr || dateStr > todayStr) continue;
    for (const entry of entries) {
      const cat = categorizeGoalTitle(entry.goalTitle);
      const pts = entry.isQuick ? 3 : 5;
      result[cat] = Math.min(100, result[cat] + pts);
    }
  }

  // Passive: sleep → rest
  if (schedule.some((b) => /sleep/i.test(b.title))) {
    result.rest = Math.min(100, result.rest + 20);
  }

  // Passive: gym/yoga/sport on 3+ days → health
  const gymDays = new Set(
    schedule
      .filter((b) => /yoga|gym|sport|workout|run|walk|swim/i.test(b.title))
      .flatMap((b) => b.days),
  );
  if (gymDays.size >= 3) result.health = Math.min(100, result.health + 15);

  // Passive: university/school on 3+ days → study
  const schoolDays = new Set(
    schedule
      .filter((b) => /university|school|class|lecture|homework/i.test(b.title))
      .flatMap((b) => b.days),
  );
  if (schoolDays.size >= 3) result.study = Math.min(100, result.study + 15);

  return result;
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

// ─── PDF storage ──────────────────────────────────────────────────────────────
// Stored separately (not inside AppState JSON) to avoid hitting the 5MB limit.

const PDF_PREFIX = 'juststart_pdf_';

/** Persist base64-encoded PDF for a goal. Logs on quota error. */
export function savePdf(goalId: string, base64: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(PDF_PREFIX + goalId, base64); }
  catch (e) { console.error('PDF save failed (storage full?):', e); }
}

/** Load base64 PDF for a goal, or null if none was saved. */
export function loadPdf(goalId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PDF_PREFIX + goalId);
}

/** Remove a goal's PDF from localStorage (call on goal delete / plan rebuild). */
export function deletePdf(goalId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PDF_PREFIX + goalId);
}

/**
 * Append one completed task to the persistent history under today's date.
 * Never overwrites existing entries — always accumulates.
 * @param isQuick true for nodeadline checkbox completions (affects balance weight)
 */
export function appendCompletedTask(
  state: AppState,
  goalTitle: string,
  taskText: string,
  isQuick = false,
): AppState {
  const now   = new Date();
  const today = now.toISOString().slice(0, 10);
  const hh    = String(now.getHours()).padStart(2, '0');
  const mm    = String(now.getMinutes()).padStart(2, '0');
  const entry: CompletedTaskEntry = {
    goalTitle, taskText, completedAt: `${hh}:${mm}`,
    ...(isQuick ? { isQuick: true } : {}),
  };
  const existing = state.completedTaskHistory?.[today] ?? [];
  return {
    ...state,
    completedTaskHistory: {
      ...state.completedTaskHistory,
      [today]: [...existing, entry],
    },
  };
}

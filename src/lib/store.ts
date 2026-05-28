import { AppData, DailyRecord } from './types';

const STORAGE_KEY = 'aiplanner_data';

const defaultData: AppData = {
  fixedTasks: [],
  goalTasks: [],
  dailyRecords: {},
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed: AppData = { ...defaultData, ...JSON.parse(raw) };
    // migrate: 'medium' → 'middle' (renamed in Session 2)
    parsed.goalTasks = parsed.goalTasks.map((t) => ({
      ...t,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      difficulty: (t.difficulty as any) === 'medium' ? 'middle' : t.difficulty,
      // migrate: default energyLevel for tasks that don't have it yet
      energyLevel: t.energyLevel ?? 'medium',
    }));
    return parsed;
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDailyRecord(data: AppData, date: string): DailyRecord {
  return (
    data.dailyRecords[date] ?? {
      date,
      completedFixedTaskIds: [],
      completedGoalTaskIds: [],
    }
  );
}

export function computeDayProgress(data: AppData, date: string): number {
  const record = getDailyRecord(data, date);
  const dow = new Date(date + 'T00:00:00').getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const fixedForDay = data.fixedTasks.filter((t) => t.days.includes(dow));
  const totalTasks = fixedForDay.length + data.goalTasks.length;
  if (totalTasks === 0) return 0;
  const completed =
    record.completedFixedTaskIds.length + record.completedGoalTaskIds.length;
  return Math.round((completed / totalTasks) * 100);
}

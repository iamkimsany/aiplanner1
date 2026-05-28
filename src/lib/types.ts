export type Difficulty = 'easy' | 'middle' | 'hard';

export type EnergyLevel = 'low' | 'medium' | 'high';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun

export interface FixedTask {
  id: string;
  name: string;
  startTime: string; // "HH:MM"
  endTime: string;
  days: DayOfWeek[];
}

export interface GoalTask {
  id: string;
  name: string;
  difficulty: Difficulty;
  energyLevel: EnergyLevel;
  estimatedMinutes: number;
  createdAt: string;
}

export interface DailyRecord {
  date: string; // "YYYY-MM-DD"
  completedFixedTaskIds: string[];
  completedGoalTaskIds: string[];
}

export interface AppData {
  fixedTasks: FixedTask[];
  goalTasks: GoalTask[];
  dailyRecords: Record<string, DailyRecord>;
}

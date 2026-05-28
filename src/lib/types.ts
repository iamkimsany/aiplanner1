export type Difficulty = 'easy' | 'medium' | 'hard';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type SessionResult = 'done' | 'simplified' | 'skipped';

export interface Task {
  id: string;
  goalId: string;
  text: string;
  difficulty: Difficulty;
  simplifiedFrom?: string;
  isDone: boolean;
  order: number;
}

export interface Goal {
  id: string;
  title: string;
  tasksEasy: Task[];
  tasksMedium: Task[];
  tasksHard: Task[];
  progress: number;
  total: number;
  isActive: boolean;
  createdAt: string;
}

export interface ScheduleBlock {
  id: string;
  title: string;
  days: number[]; // 0=Sun … 6=Sat
  startTime: string; // "08:00"
  endTime: string;   // "13:00"
}

export interface Session {
  id: string;
  goalId: string;
  taskId: string;
  energy: EnergyLevel;
  result: SessionResult;
  createdAt: string;
}

export interface AppState {
  goal: Goal | null;
  schedule: ScheduleBlock[];
  sessions: Session[];
  currentEnergy: EnergyLevel | null;
  currentTaskId: string | null;
  lastResult: SessionResult | null;
  simplifiedText: string | null;
}

export type Difficulty   = 'easy' | 'medium' | 'hard';
export type EnergyLevel  = 'low'  | 'medium' | 'high';
export type SessionResult = 'done' | 'simplified' | 'skipped';
export type GoalType     = 'deadline' | 'nodeadline';

export interface Task {
  id: string;
  goalId: string;
  text: string;
  difficulty: Difficulty;
  /** Up to 2 pre-generated fallback simplifications (level 1, level 2). */
  simplifiedVersions: string[];
  isDone: boolean;
  order: number;
}

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  deadline?: string;    // ISO date "2026-06-15"
  pdfName?: string;     // original filename of uploaded PDF (base64 stored separately)
  tasksEasy:   Task[];
  tasksMedium: Task[];
  tasksHard:   Task[];
  progress: number;
  total: number;
  isActive: boolean;
  createdAt: string;
  /** ISO date "2026-05-29" when this nodeadline goal was checked today, null otherwise */
  checkedAt?: string | null;
}

export interface ScheduleBlock {
  id: string;
  title: string;
  days: number[];    // 0=Sun … 6=Sat
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

export interface FocusSession {
  id: string;
  taskId: string;
  goalId: string;
  startedAt: string;
  durationMinutes: number;
  distractions: number;
  completed: boolean;
}

/** One slot in today's task list — one per goal */
export interface TodayTask {
  goalId: string;
  taskId: string;
  status: 'active' | 'done' | 'upcoming';
  /** 0 = original, 1 = simplified once, 2 = simplified twice */
  simplifyLevel: number;
}

/** One entry in the persistent completed-task history. */
export interface CompletedTaskEntry {
  goalTitle: string;
  taskText: string;
  completedAt: string; // "HH:MM"
  /** true for one-tap nodeadline checkbox completions (affects balance score) */
  isQuick?: boolean;
}

export interface AppState {
  goals: Goal[];
  schedule: ScheduleBlock[];
  sessions: Session[];
  focusSessions: FocusSession[];
  todayTasks: TodayTask[];
  currentEnergy: EnergyLevel | null;
  lastResult: SessionResult | null;
  aiSummary: string | null;
  /**
   * Persistent completed-task log keyed by ISO date ("2026-05-28").
   * Never cleared — accumulates across all sessions forever.
   */
  completedTaskHistory: Record<string, CompletedTaskEntry[]>;
  /** Active focus-flow context (persisted so timer survives re-render) */
  activeFocus: {
    taskId: string;
    goalId: string;
    startedAt: string;
    durationMinutes: number;
    distractions: number;
  } | null;
  /** Summary of the last completed focus session, read by the Well-Done screen */
  lastFocusDone: {
    durationMinutes: number;
    distractions: number;
    taskText: string;
    goalTitle: string;
  } | null;
}

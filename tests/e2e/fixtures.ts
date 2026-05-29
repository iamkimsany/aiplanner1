/**
 * Shared test fixtures for Just Start E2E tests.
 *
 * Pattern: seed localStorage with `MOCK_STATE_*` to skip the AI generation
 * step and start tests at a deterministic state.
 *
 * localStorage key: 'juststart_v2'  (src/lib/store.ts KEY constant)
 */

import type { AppState } from '@/lib/types';

export const LS_KEY = 'juststart_v2';

// ── Base goal ─────────────────────────────────────────────────────────────────

export const MOCK_GOAL = {
  id:    'g-test-1',
  title: 'Pass French exam',
  type:  'deadline' as const,
  deadline: '2026-09-01',
  tasksEasy: [
    {
      id: 't-easy-1', goalId: 'g-test-1',
      text: 'Review 10 vocabulary flashcards',
      simplifiedVersions: ['Review 5 flashcards'],
      difficulty: 'easy' as const, isDone: false, order: 0,
    },
  ],
  tasksMedium: [
    {
      id: 't-med-1', goalId: 'g-test-1',
      text: 'Complete one listening exercise',
      simplifiedVersions: ['Listen to 3 min audio'],
      difficulty: 'medium' as const, isDone: false, order: 0,
    },
  ],
  tasksHard: [
    {
      id: 't-hard-1', goalId: 'g-test-1',
      text: 'Write a 200-word paragraph',
      simplifiedVersions: ['Write 3 sentences'],
      difficulty: 'hard' as const, isDone: false, order: 0,
    },
  ],
  progress: 0, total: 3, isActive: true,
  createdAt: '2026-05-27T10:00:00.000Z',
};

// ── State presets ─────────────────────────────────────────────────────────────

/** After goals have been entered and AI has responded — ready for /energy */
export const STATE_GOALS_READY: Partial<AppState> = {
  goals:    [MOCK_GOAL],
  schedule: [
    { id: 's1', title: 'School', days: [1,2,3,4,5], startTime: '08:00', endTime: '13:00' },
    { id: 's2', title: 'Sleep',  days: [0,1,2,3,4,5,6], startTime: '22:00', endTime: '07:00' },
  ],
  aiSummary:    'You have 3 hours free today. Let\'s make it count.',
  currentEnergy: null,
  todayTasks:   [],
  sessions:     [],
  focusSessions: [],
  lastResult:   null,
  completedTaskHistory: {},
  activeFocus:  null,
  lastFocusDone: null,
};

/** After energy has been selected — ready for /tasks */
export const STATE_TASKS_READY: Partial<AppState> = {
  ...STATE_GOALS_READY,
  currentEnergy: 'medium',
  todayTasks: [
    { goalId: 'g-test-1', taskId: 't-med-1', status: 'active',   simplifyLevel: 0 },
  ],
};

/** State where active focus session is in progress — enters /focus */
export const STATE_FOCUS_ACTIVE: Partial<AppState> = {
  ...STATE_TASKS_READY,
  activeFocus: {
    goalId:          'g-test-1',
    taskId:          't-med-1',
    startedAt:       new Date().toISOString(),
    durationMinutes: 25,
    distractions:    0,
  },
};

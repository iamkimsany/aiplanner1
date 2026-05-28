# Tech Design — Just Start

## Stack (recommended)
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL) — free tier to start
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Push notifications:** OneSignal (free up to 10k users)
- **Deployment:** Vercel

---

## Data Models

```typescript
// User
type User = {
  id: string
  name: string
  timezone: string
  schedule: ScheduleBlock[]   // fixed time blocks
  created_at: Date
}

// Schedule block (fixed commitments)
type ScheduleBlock = {
  id: string
  user_id: string
  title: string              // "School", "Sleep", "Gym"
  days: number[]             // 0=sun, 1=mon ... 6=sat
  start_time: string         // "08:00"
  end_time: string           // "13:00"
}

// Goal
type Goal = {
  id: string
  user_id: string
  title: string              // "Write my term paper"
  tasks_easy: Task[]
  tasks_medium: Task[]
  tasks_hard: Task[]
  progress: number           // current step
  total: number              // total steps
  is_active: boolean
  created_at: Date
}

// Task
type Task = {
  id: string
  goal_id: string
  text: string               // "Open the document"
  difficulty: 'easy' | 'medium' | 'hard'
  simplified_from?: string   // parent task id
  is_done: boolean
  order: number
}

// Session (activity log)
type Session = {
  id: string
  user_id: string
  goal_id: string
  task_id: string
  energy: 'low' | 'medium' | 'high'
  result: 'done' | 'simplified' | 'skipped'
  created_at: Date
}

// Balance (weekly snapshot)
type BalanceSnapshot = {
  id: string
  user_id: string
  week: string               // "2026-W22"
  study: number              // 0–100
  health: number
  hobby: number
  rest: number
}
```

---

## Core Functions

### get_task(energy, goal)
```typescript
function getTask(energy: 'low' | 'medium' | 'high', goal: Goal): Task | null {
  const pool = energy === 'low'
    ? goal.tasks_easy
    : energy === 'medium'
    ? goal.tasks_medium
    : goal.tasks_hard

  return pool.find(t => !t.is_done) ?? null
}
```

### simplify(task)
Hardcoded map first, AI later:
```typescript
const SIMPLIFY_MAP: Record<string, string> = {
  'Write a full section':     'Write one paragraph',
  'Write one paragraph':      'Write one sentence',
  'Write one sentence':       'Open the document',
  'Open the document':        'Look at the file for 10 seconds',
}

function simplify(task: Task): string {
  return SIMPLIFY_MAP[task.text] ?? `Just start: ${task.text.toLowerCase()}`
}
```

### get_free_windows(user, date)
```typescript
// Returns free time slots based on the user's fixed schedule
function getFreeWindows(user: User, date: Date): TimeWindow[] {
  const busy = user.schedule
    .filter(b => b.days.includes(date.getDay()))
    .map(b => ({ start: b.start_time, end: b.end_time }))

  return subtractIntervals('07:00', '22:00', busy)
}
```

---

## AI Prompt — Task Generation

```
You are a planning assistant. Break down the user's goal into specific, actionable steps.

Goal: "{goal}"
User's free time: {free_hours} hours per day

Create 3 difficulty levels:

EASY — so simple it's impossible not to do (even with zero energy)
MEDIUM — meaningful progress, 20–40 minutes
HARD — a full step that requires focus and concentration

Rules:
- Every task starts with an action verb
- Specific and measurable (not "work on it" but "write 3 paragraphs")
- EASY tasks should be almost laughably simple
- 5–7 tasks per level

Respond strictly in JSON with no extra text or markdown:
{
  "easy": ["task 1", "task 2", ...],
  "medium": ["task 1", "task 2", ...],
  "hard": ["task 1", "task 2", ...]
}
```

### Example response
```json
{
  "easy": [
    "Open the document",
    "Read the assignment once",
    "Write one sentence of the introduction",
    "Find 1 source online",
    "Write a list of section topics"
  ],
  "medium": [
    "Write the outline: intro + 3 sections",
    "Write the full introduction",
    "Find 5 sources and save the links",
    "Write the first section (draft)",
    "Format the bibliography"
  ],
  "hard": [
    "Write a complete section with arguments",
    "Edit the introduction and conclusion",
    "Check formatting against requirements",
    "Write two sections back to back",
    "Submit to your supervisor for review"
  ]
}
```

---

## API Routes

```
POST /api/goals          — create goal, call AI, save tasks
GET  /api/goals/:id      — get goal with tasks
POST /api/sessions       — log session result (done/simplified)
GET  /api/balance/:week  — get life balance for the week
GET  /api/schedule/free  — get today's free time windows
```

---

## Life Balance Algorithm

Calculated once a week (Sunday 8:00 PM):

```typescript
function calcBalance(sessions: Session[], schedule: ScheduleBlock[]): Balance {
  const studyHours  = schedule.filter(b => b.title === 'School').reduce(sumHours, 0)
  const healthHours = schedule.filter(b => b.title === 'Gym').reduce(sumHours, 0)
  const doneGoals   = sessions.filter(s => s.result === 'done').length
  const totalSlots  = sessions.length

  return {
    study:  Math.min(100, (studyHours / 40) * 100),       // target: 40h/week
    health: Math.min(100, (healthHours / 5) * 100),        // target: 5h/week
    hobby:  Math.min(100, (doneGoals / totalSlots) * 100),
    rest:   100 - (studyHours + healthHours) / 0.8
  }
}
```

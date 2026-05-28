# Tech Design — Just Start

## Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL)
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`) with web_search tool
- **Push notifications:** OneSignal (free up to 10k users)
- **App blocking:** iOS Screen Time API (requires Apple entitlement) / Android Digital Wellbeing API
- **Deployment:** Vercel

---

## Data Models

```typescript
type User = {
  id: string
  name: string
  timezone: string
  schedule: ScheduleBlock[]
  created_at: Date
}

type ScheduleBlock = {
  id: string
  user_id: string
  title: string           // "School", "Sleep", "Gym"
  days: number[]          // 0=sun … 6=sat
  start_time: string      // "08:00"
  end_time: string        // "13:00"
}

type Goal = {
  id: string
  user_id: string
  title: string
  type: 'deadline' | 'habit'
  deadline?: Date
  material_url?: string
  material_summary?: string
  tasks_easy: Task[]
  tasks_medium: Task[]
  tasks_hard: Task[]
  progress: number
  total: number
  is_active: boolean
  created_at: Date
}

type Task = {
  id: string
  goal_id: string
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
  simplified_versions: string[]   // up to 2 fallback simplifications
  is_done: boolean
  scheduled_date?: string         // "2026-05-28"
  order: number
}

// Habits auto-reset daily — stored as tasks with type habit
type HabitLog = {
  id: string
  goal_id: string
  user_id: string
  date: string            // "2026-05-28"
  completed: boolean
}

type FocusSession = {
  id: string
  user_id: string
  task_id: string
  started_at: Date
  ended_at?: Date
  duration_minutes: number
  distractions: number
  completed: boolean
}

type Session = {
  id: string
  user_id: string
  goal_id: string
  task_id: string
  energy: 'low' | 'medium' | 'high'
  result: 'done' | 'simplified' | 'skipped'
  created_at: Date
}

type WeeklyBalance = {
  id: string
  user_id: string
  week: string            // "2026-W22"
  study: number           // 0–100
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
  const pool =
    energy === 'low' ? goal.tasks_easy :
    energy === 'medium' ? goal.tasks_medium :
    goal.tasks_hard

  return pool.find(t => !t.is_done) ?? null
}
```

### simplify(task)
Each task stores up to 2 pre-generated simplifications. On first tap → level 1, second tap → level 2.
```typescript
function simplify(task: Task, level: 0 | 1): string {
  return task.simplified_versions[level] ?? task.text
}
```

### get_free_windows(user, date)
```typescript
function getFreeWindows(user: User, date: Date): TimeWindow[] {
  const busy = user.schedule
    .filter(b => b.days.includes(date.getDay()))
    .map(b => ({ start: b.start_time, end: b.end_time }))
  return subtractIntervals('07:00', '22:00', busy)
}
```

### habit_reset()
Runs at midnight via cron job (Vercel cron or Supabase pg_cron):
```typescript
// Every day at 00:00 — create new HabitLog entries for all active habit goals
async function resetHabits() {
  const today = new Date().toISOString().split('T')[0]
  const habits = await db.goals.findMany({ where: { type: 'habit', is_active: true } })
  for (const habit of habits) {
    await db.habitLog.upsert({
      where: { goal_id: habit.id, date: today },
      create: { goal_id: habit.id, user_id: habit.user_id, date: today, completed: false },
      update: {}
    })
  }
}
```

---

## AI Prompts

### Prompt 1 — Generate tasks from goal (no material)
```
You are a planning assistant. Break down the user's goal into specific, actionable steps.

Goal: "{goal}"
User's free time: {free_hours} hours per day

Create 3 difficulty levels:
EASY — so simple it's impossible not to do (even with zero energy)
MEDIUM — meaningful progress, 20–40 minutes
HARD — a full step requiring focus and concentration

Rules:
- Every task starts with an action verb
- Specific and measurable ("write 3 paragraphs", not "work on it")
- EASY tasks should be almost laughably simple
- Include 2 simplified fallback versions for each task
- 5–7 tasks per level

Respond strictly in JSON, no markdown:
{
  "easy": [
    { "text": "task", "simplified": ["simpler version", "simplest version"] }
  ],
  "medium": [...],
  "hard": [...]
}
```

### Prompt 2 — Generate tasks from goal + deadline + material URL
```
You are a study planner. The user has a deadline goal with study material.

Goal: "{goal}"
Deadline: {deadline} (today is {today})
Days remaining: {days_remaining}
Free study windows per day: {free_windows}
Material URL: {url}

Steps:
1. Use web_search to read and understand the material at the URL
2. List the main topics/chapters
3. Divide topics across available days until deadline
4. For TODAY, generate 3 options based on energy level

Respond strictly in JSON, no markdown:
{
  "material_summary": "2–3 sentence summary of the material",
  "total_topics": ["topic 1", "topic 2", "topic 3"],
  "plan_overview": "e.g. 3 topics over 8 days, 2 sessions each",
  "today_options": {
    "high": {
      "tasks": [
        { "text": "Read chapters 1–2", "simplified": ["Read chapter 1 only", "Read the intro"] },
        { "text": "Solve 5 practice problems", "simplified": ["Solve 2 problems", "Read the problem statements"] }
      ],
      "estimated_time": "2h"
    },
    "medium": { "tasks": [...], "estimated_time": "1h" },
    "low": { "tasks": [...], "estimated_time": "30min" }
  }
}
```

### Prompt 3 — Weekly balance AI tip
```
The user's weekly balance is:
Study: {study}%, Health: {health}%, Hobbies: {hobby}%, Rest: {rest}%

Write ONE short sentence (max 15 words) noting the biggest imbalance and suggesting a small fix.
Warm, non-judgmental tone. No exclamation marks.
Reply with only the sentence, nothing else.
```

---

## API Routes

```
POST /api/goals                — create goal, call AI, save tasks
GET  /api/goals/:id            — get goal with tasks
POST /api/sessions             — log session result (done/simplified/skipped)
POST /api/focus                — start/end focus session, log distractions
GET  /api/balance/:week        — get weekly balance
GET  /api/schedule/free        — get today's free windows
POST /api/habits/toggle        — mark habit done/undone for today
GET  /api/calendar/:week       — get tasks grouped by day for calendar view
```

---

## Midnight Reset (Cron)
```
// vercel.json
{
  "crons": [
    { "path": "/api/cron/reset-habits", "schedule": "0 0 * * *" }
  ]
}
```

---

## App Blocking
- **iOS:** Uses `FamilyControls` + `ManagedSettings` frameworks (requires Screen Time entitlement from Apple)
- **Android:** Uses `UsageStatsManager` + accessibility service
- User pre-selects apps to block in Settings before first focus session
- Blocking activates on `▶ Start` tap, deactivates when timer ends or user taps `✓ Finish`

---

## Weekly Balance Calculation
```typescript
function calcBalance(
  sessions: Session[],
  focusSessions: FocusSession[],
  schedule: ScheduleBlock[],
  habitLogs: HabitLog[]
): WeeklyBalance {
  const studyHours  = schedule.filter(b => b.title === 'School').reduce(sumHours, 0)
  const healthHours = schedule.filter(b => b.title === 'Gym').reduce(sumHours, 0)
  const doneHabits  = habitLogs.filter(h => h.completed).length
  const totalHabits = habitLogs.length
  const focusHours  = focusSessions.reduce((acc, s) => acc + s.duration_minutes / 60, 0)

  return {
    study:  Math.min(100, Math.round((studyHours / 35) * 100)),
    health: Math.min(100, Math.round((healthHours / 5) * 100)),
    hobby:  Math.min(100, Math.round((doneHabits / Math.max(totalHabits, 1)) * 100)),
    rest:   Math.min(100, Math.round(100 - (studyHours + healthHours + focusHours) / 0.7))
  }
}
```

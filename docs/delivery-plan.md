# Delivery Plan — Just Start MVP

## Goal
A live app with 10 real users completing tasks for 3 days in a row — in 6 weeks.

---

## App Structure (final)
```
Screen 1: Goals & Schedule
Screen 2: AI Plan (energy selection)
Screen 3: Today's Tasks
  → Focus Flow: Block → Timer → "Well done!"
Screen 4: Week Overview (Balance + Calendar)
Screen 5: End of Day
```

---

## Week 1 — Validate without code
**Goal:** confirm the core loop works before writing anything.

- [ ] Interview 10 people: "Does your day end with a feeling of nothing important done?"
- [ ] Run Wizard of Oz test via Telegram (3 people, 3 days):
  - Morning: ask energy level → manually send matching task
  - Evening: ask if done → if not, send simplified version
- [ ] Success criterion: 5+ of 10 people complete at least 1 task

**Decision gate:** pass → build. Fail → iterate the idea first.

---

## Week 2 — Foundation
- [ ] Init Next.js 14 + TypeScript + Tailwind
- [ ] Supabase setup: tables for users, goals, tasks, sessions, habit_logs, focus_sessions
- [ ] Routing: `/onboarding` → `/energy` → `/tasks` → `/overview` → `/end`
- [ ] Anthropic API integration: Prompt 1 (goal → tasks JSON)
- [ ] Midnight cron job: habit reset via Vercel cron

---

## Week 3 — Core screens
- [ ] Screen 1: goal input, type selection (deadline/habit), schedule tags
- [ ] Screen 2: AI summary card + 3 energy cards
- [ ] Screen 3: task list with done/active/upcoming states
- [ ] `Simplify` button: inline text swap (2 levels)
- [ ] Progress bar + done counter

---

## Week 4 — Focus Flow + AI material reading
- [ ] Focus Block screen: blocked apps list
- [ ] Timer screen: circular SVG ring, elapsed time, distraction counter
- [ ] "Well done!" screen: stats + deadline progress
- [ ] Prompt 2: deadline goal with URL → AI reads material with web_search tool
- [ ] Screen 2 updated: shows material summary + deadline-based options

---

## Week 5 — Overview + notifications + polish
- [ ] Screen 4: balance grid (2×2) + calendar grid + AI tip (Prompt 3)
- [ ] Screen 5: end of day + AI tomorrow preview
- [ ] Push notifications via OneSignal (morning + evening)
- [ ] Dark mode support
- [ ] Offline mode: cache last task set
- [ ] Full flow test with 5 users, fix issues

---

## Week 6 — Launch
- [ ] Production deploy on Vercel
- [ ] Invite first 10 users
- [ ] Basic analytics: task completion rate, focus session count, streak length
- [ ] Simple feedback form (1 question: "What would make this better?")

---

## Post-Launch Metrics

| Metric | Target |
|--------|--------|
| Day 1 retention | > 60% |
| Day 3 retention | > 40% |
| Tasks completed / shown | > 50% |
| Focus sessions per active user per week | > 3 |
| NPS ("would you recommend?") | > 7/10 |

---

## Risk Register

| Risk | Likelihood | Response |
|------|-----------|----------|
| AI slow on material reading | Medium | Show animated loading state, cache result after first read |
| User drops off at onboarding | High | Reduce to 1 goal + 1 schedule block minimum, rest is optional |
| App blocking rejected by Apple | High | Launch without blocking first, add after entitlement approved |
| Habits feel like tasks | Medium | Visual distinction: habit cards use dashed left border + auto-reset label |
| Notifications feel annoying | Medium | Default: 1 per day (morning only), user opts into more |
| AI tip feels generic | Low | Prompt includes actual percentages so output is always specific |

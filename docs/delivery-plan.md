# Delivery Plan — Just Start MVP

## Goal
A live app with 10 real users in 6 weeks.

---

## Week 1 — Validate without code
**Goal:** confirm the idea works before writing a single line of code.

- [ ] Run 10 short interviews (3 questions about procrastination)
- [ ] Launch a Wizard of Oz test via Telegram (3 people, 3 days)
- [ ] Manually play the role of the app: ask about energy in the morning → send a task → log the result in the evening
- [ ] Success criterion: 5+ out of 10 people complete at least 1 task

**Decision:** if criterion is met — build. If not — iterate on the idea.

---

## Week 2 — Foundation
- [ ] Initialize Next.js project + Tailwind + TypeScript
- [ ] Connect Supabase, create tables (users, goals, tasks, sessions)
- [ ] Basic routing: `/onboarding` → `/energy` → `/task` → `/progress`
- [ ] Integrate Anthropic API — task generation from prompt

---

## Week 3 — Core screens
- [ ] Screen 1: goal input + schedule block tags
- [ ] Screen 2: energy selection (three cards)
- [ ] Screen 3: task display with free time window
- [ ] Logic: `get_task(energy, goal)` + `simplify(task)`

---

## Week 4 — Progress & reaction
- [ ] Screen 4: progress bar + life balance wheel
- [ ] Completion animation
- [ ] Life balance calculation algorithm
- [ ] Basic push notifications (OneSignal)

---

## Week 5 — Polish & test
- [ ] Full flow walkthrough with 5 test users
- [ ] Fix UX issues found
- [ ] Dark mode support
- [ ] Offline mode (cache last task)

---

## Week 6 — Launch
- [ ] Deploy to Vercel (production)
- [ ] Invite first 10 users
- [ ] Set up basic analytics (task completion rate)
- [ ] Collect feedback via a simple form

---

## Post-launch metrics

| Metric | MVP target |
|--------|-----------|
| Day 1 retention | > 60% |
| Day 3 retention | > 40% |
| Tasks completed / tasks shown | > 50% |
| NPS (1–10, "would you recommend?") | > 7 |

---

## Risk response plan

| Risk | Response |
|------|----------|
| AI responds slowly | Show "building your plan..." skeleton + animation |
| User drops off during onboarding | Reduce to 1 input field + 1 button |
| Tasks feel irrelevant | Add "not right" button → re-call AI |
| Notifications feel annoying | Default to 1 per day only (morning) |

# Requirements Specification — Just Start

## Functional Requirements

### F1 — Goals & Schedule (Screen 1)
- [ ] User enters a goal in free-form text
- [ ] User selects goal type: deadline goal or daily habit
- [ ] For deadline goals: optional date picker + optional URL input for study material
- [ ] User adds fixed schedule blocks (name, days, time range) as pill tags
- [ ] All goals shown as cards with left purple border
- [ ] CTA triggers AI generation and navigates to Screen 2

### F2 — AI Plan (Screen 2)
- [ ] AI summary card shows personalized message based on goal + schedule
- [ ] For deadline goals with URL: AI reads the material and calculates days remaining
- [ ] Three energy options shown with task previews
- [ ] Only one option selectable at a time
- [ ] Selected option's tasks load into Screen 3

### F3 — Today's Tasks (Screen 3)
- [ ] Progress bar fills as tasks are completed (top of screen)
- [ ] Counter shows `X / Y done`
- [ ] Completed tasks: collapsed, strikethrough, faded
- [ ] Active task: expanded with category, text, time window, two buttons
- [ ] `▶ Start` button triggers Focus Flow
- [ ] `Simplify` button changes task text inline (up to 2 levels, no screen change)
- [ ] Upcoming tasks: collapsed, muted
- [ ] Habit tasks show label `auto-resets at midnight`
- [ ] After Focus Flow completes → active task collapses as done → next task activates

### F4 — Focus Flow
- [ ] Block screen: shows list of apps to be blocked (user-configured)
- [ ] Blocking activates when user taps `Start timer →`
- [ ] Timer screen: circular progress ring, elapsed time, distraction count
- [ ] Distraction = attempt to open a blocked app (counted, not prevented on first attempt)
- [ ] Pause button pauses the timer (does not unblock apps)
- [ ] Finish button ends session, unblocks apps, navigates to "Well done!" screen
- [ ] "Well done!" screen: shows focus time, distractions, streak, deadline progress
- [ ] CTA returns to Screen 3

### F5 — Week Overview (Screen 4)
- [ ] Life balance grid (2×2): Study / Health / Hobbies / Rest
- [ ] Each card: percentage + mini progress bar
- [ ] AI tip: one sentence noting biggest imbalance
- [ ] Calendar grid (7 columns, Mon–Sun)
- [ ] Today's date highlighted with purple circle
- [ ] Colored dots per day (purple = deadline tasks, green = habits)
- [ ] Tap on any day → show task detail card below grid
- [ ] Color legend below calendar

### F6 — End of Day (Screen 5)
- [ ] Shows tasks completed count, streak, days until nearest deadline
- [ ] AI preview of tomorrow's task
- [ ] CTA returns to Screen 1

### F7 — Habit Reset
- [ ] All habit-type goals reset automatically at midnight (00:00 user timezone)
- [ ] Each day's completion state stored in HabitLog for permanent history
- [ ] History visible in calendar (green dots on days with completed habits)
- [ ] No manual intervention needed — ever

### F8 — Notifications
- [ ] Morning notification: `Good morning! How's your energy today?`
- [ ] Free window notification: `You have X free hours. One task?`
- [ ] Evening reminder: `How was your day? Mark your progress`
- [ ] All notifications can be disabled in Settings

### F9 — Settings
- [ ] App blocking list (add/remove apps)
- [ ] Notification preferences (on/off, times)
- [ ] Schedule blocks management
- [ ] Dark/light mode toggle

---

## Non-Functional Requirements

### Performance
- Main screen load time: < 1 second
- AI response time (task generation): < 5 seconds
- App works offline: shows last cached tasks
- Habit reset cron job must run within 5 minutes of midnight

### Reliability
- If AI unavailable: use pre-generated task set as fallback
- Data never lost on app close
- HabitLog entries created proactively (not on first open)

### Design
- Light and dark mode support
- Minimum font size: 11px
- Touch targets: minimum 44px height for all interactive elements
- All screens scroll if content exceeds viewport (no clipping)

---

## Not in MVP (backlog for v2)

- Google Calendar / Apple Calendar sync
- Social features (friends, shared goals)
- Web version
- Payments / subscription
- Long-term analytics (monthly charts, habit streaks graph)
- Multiple languages
- Custom balance categories
- AI chat within the app

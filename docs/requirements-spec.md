# Requirements Specification — Just Start

## Functional Requirements

### F1 — Onboarding
- [ ] User enters a goal in free-form text
- [ ] User adds fixed schedule blocks (name, days, time range)
- [ ] System calls AI and generates easy/medium/hard tasks
- [ ] Tasks are saved and linked to the goal
- [ ] Onboarding takes no more than 3 minutes

### F2 — Daily flow
- [ ] User selects energy level (low / medium / high)
- [ ] System shows one task matching the selected energy level
- [ ] System shows today's free time window
- [ ] User taps "Done" or "Couldn't do it"
- [ ] On "Done" — progress increases, praise is shown
- [ ] On "Couldn't do it" — task is simplified to the next level down

### F3 — Progress
- [ ] Progress bar per goal (X / N steps)
- [ ] Life balance wheel: study / health / hobbies / rest
- [ ] Weekly activity history (7-day grid)

### F4 — Notifications
- [ ] Morning notification asking about energy level
- [ ] Notification at the start of a free time window
- [ ] Evening reminder to log progress
- [ ] Notifications can be disabled in settings

### F5 — Goal management
- [ ] User can have multiple active goals
- [ ] Goal can be marked as completed
- [ ] Goal can be archived

---

## Non-Functional Requirements

### Performance
- Main screen load time: < 1 second
- AI response time (task generation): < 5 seconds
- App works offline (shows the last task)

### Reliability
- If AI is unavailable — use a pre-generated set of tasks
- Data is not lost when the app is closed

### Design
- Light and dark mode support
- Minimum font size: 14px
- Touch target: minimum 44px button height

---

## What is NOT in the MVP

- Social features (friends, leaderboards)
- External calendar integrations (Google Calendar, Apple Calendar)
- Web version (mobile app only)
- Payment system
- Long-term user analytics (monthly charts)
- Per-task notification customization

> These features are backlog for v2 after MVP validation.

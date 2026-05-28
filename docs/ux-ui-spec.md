# UX/UI Specification — Just Start

## App Structure: 5 Screens

```
Screen 1: Goals & Schedule
       ↓
Screen 2: AI Plan (energy selection)
       ↓
Screen 3: Today's Tasks
       ↓ (tap "Start")
Focus Flow: Block → Timer → "Well done!"
       ↓
Screen 4: Week Overview (balance + calendar)
       ↓
Screen 5: End of Day
```

---

## Design Principles
- **One screen, one decision.** No lists of options, no nested menus.
- **Mobile first.** All screens designed for 320–390px width.
- **Warm minimalism.** Off-white surfaces, thin borders, human tone.
- **Habits live inside tasks.** No separate habits screen — habits appear as task cards with auto-reset label.

---

## Screen 1 — Goals & Schedule

**Purpose:** one-time setup + adding new goals.

**Elements:**
- Heading: `What do you want to accomplish?`
- Subheading: `Add goals and your fixed schedule`
- Goal cards (added goals), each showing:
  - Goal title (bold)
  - Subline: deadline + material link if provided, OR `Habit · every day`
  - Left border `2px solid #7F77DD`, rounded right corners
  - Optional fields that expand on add: date picker (deadline) + URL input (material link)
- Schedule tags (pill shape):
  - `School 8–13` / `Sleep 22–7` / `Gym Mon/Wed/Fri`
  - `+ add` button (dashed border)
- CTA: `AI builds your plan →`

**Logic:**
- Goals with deadline + link → AI reads material and builds deadline-based plan
- Goals marked as habits → appear daily in Screen 3 with midnight auto-reset
- On CTA tap → call AI prompt (see tech-design.md) → navigate to Screen 2

---

## Screen 2 — AI Plan (Energy Selection)

**Purpose:** daily screen. Shows AI summary + lets user pick energy level.

**Elements:**
- AI summary card (purple tint `#EEEDFE`):
  - Text: e.g. `"8 days until exam. You have 4 free windows this week. Let's start with sorting algorithms — that's 40% of the exam."`
  - Font: 12px, color `#3C3489`, line-height 1.6
- Section label: `Choose for today` (uppercase, muted)
- Three energy cards:

| Icon | Label | Description |
|------|-------|-------------|
| ⚡ | High energy | Chapters 1–2 + 5 problems · ~2h |
| 😐 | Medium | Read chapter 1 + notes · ~1h |
| 😴 | Low | Overview video · ~30min |

- Selected card: `border: 1.5px solid #7F77DD; background: #EEEDFE`
- CTA: `Let's go →`

**Logic:** selected energy → `get_task(energy, goal)` → Screen 3

---

## Screen 3 — Today's Tasks

**Purpose:** main daily view. List of all tasks for today.

**Top bar:**
- Thin progress bar (3px, full width, no padding) — fills as tasks complete
- Title: `Today` + counter `1 / 3 done` (right side)

**Task card states:**

**Completed:**
- Collapsed to one line
- Purple checkmark circle (left)
- Strikethrough text
- Opacity 0.45, left border faded

**Active (current):**
- Expanded, full card
- Category label: uppercase muted (e.g. `EXAM · ALGORITHMS`)
- Task text: 13px weight 500
- Meta: time window + difficulty
- Two buttons:
  - `▶ Start` — purple background → triggers Focus Flow
  - `Simplify` — ghost button → changes task text inline (no screen change, can be tapped twice for further simplification)

**Upcoming:**
- Collapsed, opacity 0.4
- Shows category + task text
- Habits show: `Habit · auto-resets at midnight`

**Interaction flow:**
- Tap `▶ Start` → Focus Flow (Block screen)
- After Focus Flow completes → card collapses as done → next card becomes active
- Counter and progress bar update live

---

## Focus Flow (between Screen 3 and Screen 4)

### Focus Block screen
- Heading: task title
- Subheading: duration + `social media blocked`
- List of blocked apps (grayed out, opacity 0.35):
  - Instagram, TikTok, X / Twitter, YouTube
  - Each: app icon + name + `blocked` tag
- Footer: `Customize list → Settings`
- CTA: `Start timer →`

### Timer screen
- Circular progress ring (SVG): purple stroke `#7F77DD` on light track `#EEEDFE`
- Center: remaining time (large) + `remaining` label
- Task title + description below ring
- Two stat cards: `time elapsed` + `distractions`
- Two buttons: `⏸ Pause` (ghost) + `✓ Finish` (coral/red tint)

### "Well done!" screen
- Purple checkmark circle (56px)
- Heading: `Well done!`
- Subtext: focus time + distractions count
- Two stat cards: `focus today` (purple tint) + `days in a row` (teal tint)
- Progress bar toward deadline: `X of Y topics done`
- CTA: `Next task →` → returns to Screen 3

---

## Screen 4 — Week Overview

**Purpose:** single screen combining life balance + weekly calendar.

**Top section — Life Balance:**
- Heading: `This week` + date range
- 2×2 grid of balance cards:

| Category | Background | Text color |
|----------|-----------|------------|
| Study | `#EEEDFE` | `#3C3489` |
| Health | `#E1F5EE` | `#085041` |
| Hobbies | `#EEEDFE` | `#3C3489` |
| Rest | `#FAECE7` | `#712B13` |

Each card: percentage (large) + category name + thin progress bar

- AI advice card (purple tint, left border `2px solid #AFA9EC`):
  - Label: `AI tip` (purple, uppercase 10px)
  - Text: one sentence noting the imbalance

**Divider:** `Calendar` label with line

**Bottom section — Calendar:**
- 7-column grid (Mon–Sun)
- Day header: 3-letter abbreviation, 9px muted
- Day number: 24px circle, today = filled purple `#7F77DD`
- Colored dots per day (by goal type):
  - Purple `#7F77DD` = deadline goals
  - Green `#3B6D11` = habits
- Tapped day → detail card below grid showing that day's tasks
- Legend: colored dot + label for each type

- CTA: `End of day →`

---

## Screen 5 — End of Day

**Purpose:** celebration + AI preview of tomorrow.

**Elements:**
- Large emoji: 🎉
- Heading: `All done for today!`
- Subtext: `X of X tasks completed. You did great — rest now.`
- Three stat pills in a row:
  - `X/X today` (purple tint)
  - `X days in a row` (teal tint)
  - `X days left` to nearest deadline (coral tint)
- AI card (left border purple):
  - Label: `AI says`
  - Text: preview of tomorrow (e.g. `"Tomorrow: graph algorithms — the hardest topic. Start in the morning while energy is high."`)
- CTA: `Start again →` → Screen 1

---

## Navigation
- Bottom dot indicators (not tabs)
- Active dot: stretched `18px wide`, `border-radius: 3px`, purple
- Inactive: `6px` circle, muted border color
- Dots are tappable for direct navigation between main screens (1–5)
- Focus Flow screens have no dots (modal-style flow)

---

## Notifications

| Time | Message | Action |
|------|---------|--------|
| 8:00 AM weekdays | `Good morning! How's your energy today?` | Opens Screen 2 |
| Start of free window | `You have 2 free hours. One task?` | Opens Screen 2 |
| 9:00 PM | `How was your day? Mark your progress` | Opens Screen 3 |

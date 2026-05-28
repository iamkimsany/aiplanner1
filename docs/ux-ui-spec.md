# UX/UI Specification — Just Start

## Design Principles
- **One screen, one decision.** No lists, no menus. Every screen requires exactly one action.
- **Minimalism with warmth.** White surfaces, thin borders, human language.
- **Mobile first.** All screens are designed for 320–390px width.

---

## Screen 1 — Goal & Schedule

**Purpose:** onboarding, collecting user context.

**Elements:**
- Heading: `What do you want to accomplish this week?`
- Subheading: `Enter any goal — big or small`
- Text input: placeholder `e.g. write my term paper`
- Fixed schedule block — pill tags:
  - `School 8–13` / `Sleep 22–7` / `Gym Mon/Wed/Fri`
  - `+ add` button (dashed border)
- CTA button: `AI builds your plan →`

**Logic:**
- On CTA tap — call AI with prompt (see `tech-design.md`)
- AI returns JSON with easy/medium/hard tasks
- Tasks are saved to DB and linked to the goal
- Navigate to Screen 2

**Progress indicator:** navigation dots at the bottom, step 1/4

---

## Screen 2 — Energy Level (main screen)

**Purpose:** daily screen. Opens every time the user launches the app.

**Elements:**
- Heading: `How much energy do you have right now?`
- Subheading: `We'll match the task to how you feel`
- Three card buttons:

| Icon | Label | Description |
|------|-------|-------------|
| 😴 | Low | I'll give you the simplest possible action |
| 😐 | Medium | A normal task, you've got this |
| ⚡ | High | Let's take a real step forward |

- Selected card: thick border `1.5px solid`
- CTA: `Show me the task →`

**Logic:** energy selection → `get_task(energy, goal)` → Screen 3

---

## Screen 3 — Task

**Purpose:** show one specific action.

**Elements:**
- Label: `Your task right now`
- Heading: `Try to do this`
- Task card:
  - Tag: `[difficulty] · [time]` (e.g. `Medium · ~20 min`)
  - Task text large: `"Write the outline — intro and 3 sections"`
  - Left border `3px solid` for emphasis
- Hint: `Free window: 2:00 PM–5:00 PM · today`
- Success button: `Done` (green background)
- Fail button: `Couldn't do it` (neutral)

**Logic:**
- `Done` → `progress += 1` → Screen 4 (win mode)
- `Couldn't do it` → `simplify(task)` → Screen 4 (simplify mode)

---

## Screen 4 — Reaction & Progress

**Purpose:** feedback + motivation + life balance.

### Win mode (task done):
- Icon: `✓`
- Heading: `Good. You're moving forward.`
- Subheading: `Every step adds up`
- Progress bar: `3 / 10 steps` (30% filled)

### Simplify mode (task not done):
- Icon: `→`
- Heading: `Okay, let's simplify.`
- Subheading: simplified task (e.g. `Open the document and write one sentence`)
- Progress bar: smaller progress shown

### Life balance block (both modes):
Four circular indicators:

| Category | Color | Example % |
|----------|-------|-----------|
| Study | Green | 80% |
| Health | Teal | 60% |
| Hobbies | Purple | 40% |
| Rest | Coral | 70% |

- CTA: `Next task →` → returns to Screen 2

---

## Notifications

| Time | Text | Action |
|------|------|--------|
| 8:00 AM (weekdays) | `Good morning! How's your energy?` | Opens Screen 2 |
| Start of free window | `You have 2 hours free. One task?` | Opens Screen 2 |
| 9:00 PM | `How was your day? Mark your progress` | Opens Screen 4 |

---

## Navigation
Bottom navigation: indicator dots (not tabs). Active step — stretched dot.

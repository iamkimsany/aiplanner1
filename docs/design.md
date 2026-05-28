# Design System — Just Start

## Philosophy
One action at a time. No noise. Every screen is one decision.
Warm minimalism — like a notebook, not a dashboard.

---

## Colors

```css
/* Base */
--color-bg: #FFFFFF;
--color-bg-secondary: #F5F5F3;
--color-text: #1A1A1A;
--color-text-secondary: #6B6B6B;
--color-text-tertiary: #A0A0A0;
--color-border: rgba(0,0,0,0.08);
--color-border-medium: rgba(0,0,0,0.15);

/* Brand */
--color-purple: #7F77DD;
--color-purple-light: #EEEDFE;
--color-purple-mid: #AFA9EC;
--color-purple-dark: #3C3489;
--color-purple-text: #534AB7;

/* Life balance categories */
--color-study-bg: #EEEDFE;   --color-study-text: #3C3489;   --color-study-bar: #534AB7;
--color-health-bg: #E1F5EE;  --color-health-text: #085041;  --color-health-bar: #0F6E56;
--color-hobby-bg: #EEEDFE;   --color-hobby-text: #3C3489;   --color-hobby-bar: #534AB7;
--color-rest-bg: #FAECE7;    --color-rest-text: #712B13;    --color-rest-bar: #993C1D;

/* Status */
--color-success: #1a7a4a;
--color-danger-bg: #FAECE7;
--color-danger-text: #993C1D;

/* Dark mode */
@media (prefers-color-scheme: dark) {
  --color-bg: #111110;
  --color-bg-secondary: #1C1C1A;
  --color-text: #F0EFEA;
  --color-text-secondary: #9A9A95;
  --color-border: rgba(255,255,255,0.08);
}
```

---

## Typography

```css
/* Screen heading */
font-size: 20px; font-weight: 500; line-height: 1.3;

/* Subheading */
font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;

/* Task text (active) */
font-size: 13px; font-weight: 500; line-height: 1.4;

/* Category label */
font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-purple);

/* Meta / hint */
font-size: 11px; color: var(--color-text-secondary);

/* Section divider label */
font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--color-text-tertiary);
```

---

## Components

### Goal pill (Screen 1)
```css
border-left: 2px solid var(--color-purple);
border-radius: 0 8px 8px 0;
background: var(--color-bg-secondary);
padding: 8px 10px;
margin-bottom: 6px;
```

### Energy card
```css
border: 0.5px solid var(--color-border);
border-radius: 10px;
padding: 12px;
display: flex; align-items: center; gap: 10px;
cursor: pointer;

/* Selected */
border: 1.5px solid var(--color-purple);
background: var(--color-purple-light);
```

### Task card (active)
```css
border-left: 2px solid var(--color-purple);
border-radius: 0 10px 10px 0;
background: var(--color-bg-secondary);
padding: 12px;
margin-bottom: 8px;
```

### Task card (done)
```css
border-left-color: var(--color-border);
opacity: 0.45;
```

### Task card (upcoming)
```css
opacity: 0.4;
```

### "Start" button
```css
background: var(--color-purple);
color: #fff;
border: none;
border-radius: 7px;
padding: 8px;
font-size: 12px; font-weight: 500;
```

### "Simplify" button
```css
background: var(--color-bg);
border: 0.5px solid var(--color-border-medium);
color: var(--color-text-secondary);
border-radius: 7px;
padding: 8px;
font-size: 12px;
```

### AI summary card
```css
background: var(--color-purple-light);
border-radius: 10px;
padding: 10px 12px;
font-size: 12px; color: var(--color-purple-dark); line-height: 1.6;
```

### Progress bar (top of screen)
```css
height: 3px;
background: var(--color-border);
border-radius: 100px;
overflow: hidden;

/* fill */
background: var(--color-purple);
transition: width 0.5s ease;
```

### Focus timer ring
```css
/* SVG */
track: fill="none" stroke="#EEEDFE" stroke-width="7"
progress: fill="none" stroke="#7F77DD" stroke-width="7" stroke-linecap="round"
```

### Balance card
```css
border-radius: 10px;
padding: 9px;
text-align: center;
/* color per category — see color tokens */
```

### Balance bar inside card
```css
height: 3px;
border-radius: 100px;
margin-top: 5px;
overflow: hidden;
```

### Calendar day — today
```css
width: 24px; height: 24px;
border-radius: 50%;
background: var(--color-purple);
color: #fff; font-weight: 500;
```

### Calendar dot
```css
width: 4px; height: 4px;
border-radius: 50%;
margin: 1px auto;
```

### Navigation dots
```css
/* inactive */
width: 6px; height: 6px; border-radius: 50%;
background: var(--color-border-medium);

/* active */
width: 18px; height: 6px; border-radius: 3px;
background: var(--color-purple);
transition: width 0.2s ease;
```

### Primary CTA button
```css
width: 100%;
padding: 13px;
border-radius: 10px;
font-size: 14px; font-weight: 500;
background: var(--color-purple);
color: #fff;
border: none;
margin-top: auto;  /* always sticks to bottom of screen */
```

---

## Animations

```css
/* Screen entrance */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.screen { animation: fadeIn 0.25s ease; }

/* Progress bar */
.progress-fill { transition: width 0.5s ease; }

/* Task card collapse (done) */
.task-card { transition: opacity 0.3s ease; }

/* Button tap */
button:active { transform: scale(0.98); }
```

---

## Tone of Voice

| Situation | Text |
|-----------|------|
| Task completed | `Well done!` |
| Focus session ended | `{X} min of pure focus. {N} distractions. That's strong.` |
| All tasks done | `All done for today!` + `You did great — rest now.` |
| Task simplified once | task text changes inline, no message |
| Low energy selected | `I'll give you the simplest possible action` |
| AI weekly tip | one short warm sentence, no exclamation marks |
| End of day AI preview | `"Tomorrow: [topic] — [brief note]. [When to do it]."` |

**Principles:**
- Short sentences. No exclamation marks (except celebration moments).
- No condescension. `"You're moving forward"` not `"Great job!"`.
- Specific, not abstract. `"2 of 8 topics done"` not `"making progress"`.
- Midnight reset message: silent — no notification, just resets.

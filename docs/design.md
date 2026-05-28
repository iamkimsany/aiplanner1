# Design System — Just Start

## Philosophy
One action at a time. No noise, no lists. Every screen is one decision.

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

/* Accent — completed */
--color-success: #1a7a4a;
--color-success-bg: #EAF3DE;

/* Life balance categories */
--color-study: #3B6D11;       /* green */
--color-study-bg: #EAF3DE;
--color-health: #0F6E56;      /* teal */
--color-health-bg: #E1F5EE;
--color-hobby: #3C3489;       /* purple */
--color-hobby-bg: #EEEDFE;
--color-rest: #993C1D;        /* coral */
--color-rest-bg: #FAECE7;

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
font-size: 22px;
font-weight: 500;
line-height: 1.3;

/* Subheading */
font-size: 14px;
color: var(--color-text-secondary);
line-height: 1.5;

/* Task text */
font-size: 17px;
font-weight: 500;
line-height: 1.4;

/* Label / tag */
font-size: 11px;
text-transform: uppercase;
letter-spacing: 0.6px;
color: var(--color-text-tertiary);

/* Body */
font-size: 14px;
line-height: 1.6;
```

---

## Components

### Task card
```css
border-left: 3px solid var(--color-text);
background: var(--color-bg-secondary);
border-radius: 12px;
padding: 20px;
```

### Energy button
```css
border: 0.5px solid var(--color-border);
border-radius: 12px;
padding: 16px;
display: flex; align-items: center; gap: 12px;

/* Selected state */
border: 1.5px solid var(--color-text);
```

### "Done" button
```css
background: #1a7a4a;
color: #ffffff;
border-radius: 10px;
padding: 14px;
font-size: 15px; font-weight: 500;
```

### Progress bar
```css
height: 8px;
border-radius: 100px;
background: var(--color-bg-secondary);
/* fill */
background: var(--color-text);
transition: width 0.6s ease;
```

### Balance circle indicator
```css
width: 48px; height: 48px;
border-radius: 50%;
display: flex; align-items: center; justify-content: center;
font-size: 11px; font-weight: 500;
/* color by category */
```

### Navigation dots
```css
/* inactive */
width: 6px; height: 6px; border-radius: 50%;
background: var(--color-border-medium);

/* active */
width: 18px; height: 6px; border-radius: 3px;
background: var(--color-text);
transition: width 0.2s ease;
```

---

## Animations

```css
/* Screen entrance */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.screen { animation: fadeIn 0.25s ease; }

/* Progress bar fill */
.progress-fill { transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }

/* Button tap */
button:active { transform: scale(0.98); }
```

---

## Tone of Voice (copywriting)

| Situation | Text |
|-----------|------|
| Task completed | "Good. You're moving forward." |
| Task not done | "Okay, let's simplify." |
| First step ever | "You started — that's already progress." |
| Low energy selected | "I'll give you the simplest possible action" |
| All tasks done today | "You did everything for today." |

**Tone principles:**
- Short sentences
- No exclamation marks (except final achievement milestone)
- No condescension ("great job!" — no; "you're moving" — yes)
- Specific, not abstract

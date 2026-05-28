# UX / UI Spec

## 1. Design Reference

Follow:

- docs/DESIGN.md

Design Direction:
- Calm and minimal UI
- Emotionally supportive productivity experience
- Soft colors with low visual stress
- Mobile-first responsive layout
- Clean typography and breathing space
- Focus on reducing overwhelming feelings

---

## 2. Screen Map

| Screen | Route | Purpose |
|---|---|---|
| Landing Page | `/` | 서비스 소개와 앱 진입 |
| App Page | `/app` | 핵심 기능 사용 |

---

# 3. Landing Page

## Purpose

서비스의 문제, 가치, 핵심 기능을 설명하고 사용자를 앱 화면으로 이동시킨다.

---

## Required Sections

- Hero
- Problem
- Core Features
- Motivation Section
- CTA Button

---

## Key Copy

### Headline

Overwhelmed?  
Start with what your energy allows today.

### Subheadline

에너지 수준에 맞는 작은 목표부터 시작해  
미루는 습관을 줄이고 삶의 방향성을 되찾도록 돕는 생산성 앱.

### CTA

Start Small Today

---

## Layout Notes

### Hero Section
- Large emotional headline
- Soft gradient background
- Minimal illustration or calming visual
- Primary CTA button

### Problem Section
Explain:
- overwhelming feeling
- lack of direction
- procrastination cycle

### Core Features Section
Cards or grid layout:
- Easy / Middle / Hard tasks
- Smart prioritization
- Progress tracking
- Calendar visualization

### CTA Section
Simple motivational message:
- “You do not need to finish everything today.”
- Button leading to `/app`

---

# 4. App Page

## Purpose

사용자가 실제 기능을 수행하는 화면이다.

---

## Required Areas

- Header
- Today Motivation Area
- Energy-based Input Form
- Filter Area
- Calendar Area
- Progress Section
- Task List Area
- Empty State
- Status Action

---

## Layout Structure

### Header
Contains:
- app title
- current date
- short motivational text

---

### Input Form
User can:
- input task title
- select difficulty:
  - easy
  - middle
  - hard
- optional date selection

Primary action button:
- “Add Task”

---

### Filter Area
Tabs or pills:
- All
- Easy
- Middle
- Hard
- Completed

---

### Calendar Area
Monthly calendar view:
- show tasks by date
- highlight current day
- minimal compact design

---

### Progress Section
Contains:
- progress bar
- daily completion percentage
- completed task count

Example:
- “3 / 7 tasks completed today”

---

### List Area
Task cards display:
- title
- difficulty
- status
- due date (optional)

---

### Empty State
Display supportive message:
- “Start with one small step today.”

Optional illustration.

---

### Status Action
User can:
- mark complete
- undo complete
- delete task

Changes should reflect instantly.

---

# 5. Component Plan

| Component | Purpose | Requirement Link |
|---|---|---|
| AppHeader | 화면 제목과 설명 | FR-002 |
| MotivationCard | 동기부여 메시지 표시 | FR-002 |
| ItemForm | 항목 입력 | FR-001 |
| DifficultySelector | 난이도 선택 | FR-002 |
| FilterTabs | 항목 필터 | FR-004 |
| CalendarView | 일정 표시 | FR-006 |
| ProgressBar | 진행률 표시 | FR-005 |
| ItemList | 목록 표시 | FR-002 |
| ItemCard | 항목 하나 표시 | FR-002, FR-003 |
| EmptyState | 데이터 없음 안내 | FR-002 |

---

# 6. Interaction Rules

- 항목 생성 후 입력창은 초기화된다.
- 필수값이 없으면 생성 버튼을 눌러도 항목이 추가되지 않는다.
- 상태 변경 버튼을 누르면 화면에 즉시 반영된다.
- 필터를 변경하면 목록이 즉시 바뀐다.
- 완료된 항목은 시각적으로 구분된다.
- progress bar는 실시간으로 업데이트된다.
- 달력 선택 시 해당 날짜의 항목만 볼 수 있다.

---

# 7. Accessibility Rules

- 모든 입력 필드에는 label이 있어야 한다.
- 버튼 텍스트는 기능을 설명해야 한다.
- 색상만으로 상태를 구분하지 않는다.
- 주요 영역은 heading 구조를 가진다.
- 키보드만으로 핵심 기능 사용이 가능해야 한다.
- 모바일 터치 영역은 최소 크기를 유지해야 한다.

---

# 8. Visual Style Guide

## Color Direction

- Soft blue
- Light lavender
- Warm neutral gray
- Calm white background

Avoid:
- aggressive red
- overly saturated colors
- visual clutter

---

## Typography

- Clean sans-serif font
- Large readable headings
- Spacious line height
- Minimal text density

---

## UI Mood

The UI should feel:
- calming
- safe
- supportive
- non-judgmental
- emotionally lightweight

The app should reduce pressure, not create more pressure.
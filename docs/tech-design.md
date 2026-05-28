# Technical Design

## 1. Architecture Overview

User
→ Next.js App
→ UI Components
→ Client State
→ Local Storage or Mock Data
→ Future Backend

---

## 2. Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js |
| UI | React |
| Language | TypeScript |
| Style | Tailwind CSS |
| AI Coding | Claude Code |
| Test | Playwright later |
| Version Control | GitHub |

---

## 3. Route Design

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Landing Page |
| `/app` | `src/app/app/page.tsx` | Main App Page |

---

## 4. Source Structure

```text
src/
  app/
    page.tsx
    app/
      page.tsx

  components/
    ui/
    layout/
    shared/

  features/
    tasks/
      components/
      hooks/
      types.ts
      storage.ts
      constants.ts

    calendar/
      components/

    progress/
      components/

  lib/
    utils.ts

  styles/
```

---

## 5. Data Model

### Task Item

```ts
type Task = {
  id: string
  title: string
  difficulty: 'easy' | 'middle' | 'hard'
  completed: boolean
  createdAt: string
  dueDate?: string
}
```

---

## 6. State Management

For MVP:
- React useState
- Local component state
- localStorage persistence

No external state library required.

---

## 7. Storage Strategy

MVP uses:
- browser localStorage

Future backend possibility:
- Supabase
- Firebase
- PostgreSQL

---

## 8. UI Strategy

- Mobile-first responsive design
- Reusable UI components
- Minimal and calming interface
- Feature-based folder structure

---

## 9. Testing Plan

Future Playwright E2E tests:

| Feature | Test |
|---|---|
| Create Task | User can create task |
| Complete Task | Status updates correctly |
| Filter Tasks | Filtering works |
| Calendar View | Tasks appear on dates |
| Progress Bar | Progress updates dynamically |

---

## 10. Future Scalability

Potential future additions:
- AI scheduling
- Energy prediction
- Habit analytics
- User authentication
- Cloud sync
- Notifications


# Technical Design

## 1. 문서 목적

이 문서는 procrastination reduction 및 energy-based productivity 서비스를 위한 기술 구현 방향을 정리한다.  
제품의 가치와 사용자 문제는 Product Brief에서 다루며, 이 문서에서는 실제 개발자가 구현할 구조와 개발 기준을 정의한다.

---

# 2. Architecture Overview

## 전체 구조

```text
User
→ Next.js App
→ Pages / Routes
→ UI Components
→ Productivity Features
→ Client State
→ localStorage
→ Future Backend
```

---

## 이번 MVP의 구현 범위

- 단일 사용자 기준
- 프론트엔드 중심 구현
- 서버 DB 없이 localStorage 사용
- 로그인, 결제, 실시간 기능 제외
- 모바일 중심 MVP 구현

---

# 3. Tech Stack

| Area | Technology | Reason |
|---|---|---|
| Framework | Next.js | App Router 기반 웹앱 구현 |
| UI Library | React | 컴포넌트 기반 UI 구성 |
| Language | TypeScript | 타입 안정성 확보 |
| Styling | Tailwind CSS | 빠른 MVP UI 구현 |
| State | React useState | 단순 상태 관리 |
| Storage | localStorage | MVP 데이터 저장 |
| AI Coding | Claude Code | 코드 생성 및 수정 |
| Version Control | GitHub | 버전 관리 |
| Test | Playwright later | 핵심 흐름 테스트 예정 |

---

# 4. Route Design

| Route | File Path | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Landing Page |
| `/app` | `src/app/app/page.tsx` | Main Productivity App |

---

# 5. Source Structure

```text
src/
  app/
    page.tsx
    app/
      page.tsx

  components/
    ui/
      Button.tsx
      Input.tsx
      Card.tsx
      ProgressBar.tsx

    layout/
      AppHeader.tsx

  features/
    tasks/
      types.ts
      storage.ts
      mock-data.ts
      constants.ts

      components/
        TaskForm.tsx
        TaskList.tsx
        TaskCard.tsx
        DifficultySelector.tsx
        FilterTabs.tsx
        EmptyState.tsx
        MotivationCard.tsx

    calendar/
      components/
        CalendarView.tsx

    progress/
      components/
        DailyProgress.tsx

  lib/
    utils.ts
```

---

## 폴더 역할

| Folder | Role |
|---|---|
| `src/app` | route 및 page 관리 |
| `src/components/ui` | 재사용 가능한 UI 컴포넌트 |
| `src/components/layout` | 공통 레이아웃 |
| `src/features/tasks` | 핵심 productivity 기능 |
| `src/features/calendar` | 달력 기능 |
| `src/features/progress` | progress 기능 |
| `src/lib` | helper 및 utility 함수 |

---

# 6. Feature Module Design

## 핵심 Feature

| Feature | Description | Priority |
|---|---|---|
| Task Create | 새로운 task 생성 | Must |
| Difficulty Select | easy / middle / hard 선택 | Must |
| Energy-based Tasks | 현재 에너지 수준에 맞는 task 표시 | Must |
| Task Completion | task 완료 처리 | Must |
| Progress Tracking | progress bar 표시 | Must |
| Calendar View | 날짜별 task 확인 | Should |
| Task Filter | 난이도 또는 상태 필터 | Should |
| Task Delete/Edit | task 수정 및 삭제 | Nice |

---

## 이번 회차에서 구현할 Feature

- Route 구조
- Landing Page 초안
- App Page shell
- 기본 타입 정의
- Placeholder 컴포넌트
- Mock data
- Basic responsive UI

---

## 다음 회차로 넘길 Feature

- 실제 task 생성 로직
- localStorage persistence
- progress 계산 로직
- filter 로직
- calendar interaction
- edit/delete 기능

---

# 7. Data Model

## 기본 타입

```ts
export type TaskDifficulty = "easy" | "middle" | "hard";

export type TaskStatus = "todo" | "done";

export type Task = {
  id: string;
  title: string;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  createdAt: string;
  dueDate?: string;
};
```

---

## 필드 설명

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | 고유 ID |
| `title` | `string` | Yes | task 제목 |
| `difficulty` | `TaskDifficulty` | Yes | 난이도 |
| `status` | `TaskStatus` | Yes | 완료 상태 |
| `createdAt` | `string` | Yes | 생성 시각 |
| `dueDate` | `string` | No | 예정 날짜 |

---

# 8. State Design

| State | Type | Purpose |
|---|---|---|
| `tasks` | `Task[]` | 현재 task 목록 |
| `selectedDifficulty` | `TaskDifficulty \| "all"` | 난이도 필터 |
| `selectedDate` | `string \| null` | 달력 날짜 선택 |
| `progress` | `number` | 진행률 |
| `validationError` | `string \| null` | 입력 오류 |
| `isLoading` | `boolean` | 향후 확장 대비 |

---

## 상태 관리 방식

이번 MVP에서는 외부 상태 관리 라이브러리를 사용하지 않는다.

사용:
- React `useState`
- `useMemo`
- localStorage helper 함수

사용하지 않음:
- Redux
- Zustand
- React Query

---

# 9. Storage Strategy

## MVP 저장 방식

| Option | Decision |
|---|---|
| DB | 사용하지 않음 |
| API Server | 사용하지 않음 |
| localStorage | 기본 저장 방식 |
| mock data | 초기 UI 구성 |

---

## 저장 흐름

```text
User Action
→ React State Update
→ localStorage Save
→ UI Re-render
```

---

## 향후 확장 가능성

- Supabase
- Firebase
- User authentication
- Cloud sync
- Notification system
- AI scheduling system

---

# 10. API Design

이번 MVP에서는 서버 API를 구현하지 않는다.

---

## 향후 API 후보

| API | Method | Purpose |
|---|---|---|
| `/api/tasks` | `GET` | task 목록 조회 |
| `/api/tasks` | `POST` | task 생성 |
| `/api/tasks/:id` | `PATCH` | task 수정 |
| `/api/tasks/:id` | `DELETE` | task 삭제 |

---

# 11. Validation Rules

| Rule | Description |
|---|---|
| Required Title | 제목은 비어 있을 수 없다 |
| Valid Difficulty | 정의된 difficulty만 허용 |
| Max Length | 제목 길이 제한 |
| No Sensitive Data | 민감 정보 저장 금지 |

---

# 12. Error Handling

| Situation | Handling |
|---|---|
| 제목 미입력 | validation message 표시 |
| localStorage 실패 | 빈 배열 fallback |
| invalid difficulty | 기본값 fallback |
| task 없음 | EmptyState 표시 |

---

# 13. Accessibility Considerations

- 모든 입력 필드는 label을 가진다.
- 버튼 텍스트는 기능을 설명해야 한다.
- 색상만으로 상태를 구분하지 않는다.
- heading 구조를 유지한다.
- 키보드만으로 핵심 기능 사용 가능해야 한다.
- 모바일 터치 영역 최소 크기 유지

---

# 14. Security Considerations

이번 MVP 보안 원칙:

- API key를 코드에 직접 저장하지 않는다.
- `.env` 파일을 GitHub에 업로드하지 않는다.
- 민감한 개인정보를 저장하지 않는다.
- localStorage에 민감 정보 저장 금지
- 인증 기능은 MVP 범위에서 제외

---

# 15. Decision Log

| Decision | Reason | Consequence |
|---|---|---|
| Next.js App Router 사용 | 최신 구조 및 학습 방향 | app router 사용 |
| localStorage 우선 | 빠른 MVP 구현 | multi-user 제외 |
| 모바일 우선 UI | 주요 사용자 환경 고려 | desktop 최적화는 후순위 |
| 단일 사용자 MVP | 범위 통제 | auth 기능 제외 |
| energy-based task system | 서비스 핵심 가치 반영 | 일반 todo app과 차별화 |

---

# 16. Implementation Notes

Claude Code 구현 순서:

1. docs 폴더 문서 읽기
2. 현재 파일 구조 분석
3. 구현 계획 제안
4. 작은 단위로 구현
5. build 및 실행 검증
6. 변경 파일 요약
7. commit message 제안

---

# 17. Open Questions

| Question | Decision Needed By |
|---|---|
| progress 계산 기준은 무엇인가? | Session 3 전 |
| calendar interaction 범위는 어디까지인가? | Session 3 전 |
| motivation message는 static인가 dynamic인가? | Session 3 전 |
| difficulty 추천 로직이 필요한가? | Future MVP |
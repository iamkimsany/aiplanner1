## Why

`docs/design.md`에 정의된 디자인 시스템 원칙(pill 버튼, hairline border, 그림자 제거, monospace eyebrow, tight typography)을 앱에 적용한다. 현재 UI는 임시 Tailwind 기본값에 가깝고, 일관된 시각 언어가 없다. 이 앱의 밝은 배경과 indigo 색상 팔레트는 유지하되, xAI design.md의 구조적 원칙을 해석해 적용한다.

## What Changes

- **버튼**: 모든 CTA/액션 버튼을 `rounded-full` pill 형태로 통일
- **카드**: `shadow-sm` 제거 → `border border-gray-200` hairline border만 사용
- **섹션 eyebrow**: 섹션 레이블(`고정 일정`, `목표 할 일` 등)을 `font-mono uppercase tracking-widest text-xs` 스타일로 변경
- **헤딩 타이포**: 주요 헤딩에 `tracking-tight` 적용
- **배지**: DifficultyBadge, EnergyBadge를 pill 형태로 통일
- **FilterTabs**: rounded-full pill 탭으로 재스타일
- **Landing Page**: 헤드라인에 tight tracking, pill CTA, hairline 카드 적용
- **Navbar**: brand 타이포에 tracking 적용

## Capabilities

### New Capabilities
없음 (기능 추가 없음)

### Modified Capabilities
없음 (요구사항 변경 없음, 스타일만 변경)

## Impact

- `src/app/page.tsx` (Landing)
- `src/app/app/page.tsx` (Today dashboard)
- `src/app/tasks/page.tsx`
- `src/app/calendar/page.tsx`
- `src/components/Navbar.tsx`
- `src/components/ProgressBar.tsx`
- `src/components/DifficultyBadge.tsx`
- `src/components/EnergyBadge.tsx`
- `src/features/tasks/components/FilterTabs.tsx`
- `src/features/calendar/components/WeeklyCalendarView.tsx`
- `src/app/globals.css`

기능 변경 없음. 모든 변경은 Tailwind 클래스 수준의 스타일 조정.

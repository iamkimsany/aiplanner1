## Tasks

### T1 — 공통 스타일 토큰 정리 (globals.css)
- `font-mono` eyebrow용 CSS custom property 없음 → Tailwind 클래스만 사용하므로 불필요
- `color-scheme: light` + body background 기존 fix 유지 확인

### T2 — 버튼 pill 통일
파일: `src/app/page.tsx`, `src/app/app/page.tsx`, `src/app/tasks/page.tsx`, `src/app/calendar/page.tsx`
- `rounded-lg`, `rounded-xl`, `rounded-2xl` 버튼 → `rounded-full`
- `rounded-lg` 입력 필드는 유지 (버튼만 변경)

### T3 — 카드 hairline border
파일: 모든 페이지의 카드 컨테이너
- `shadow-sm` 제거
- `border border-gray-200` 유지 또는 추가
- `rounded-2xl` 카드는 유지 (shape는 xAI에서도 rounded-sm=8px 사용)

### T4 — 섹션 eyebrow 스타일
파일: `src/app/app/page.tsx`, `src/app/calendar/page.tsx`
- `text-xs font-semibold text-gray-400 uppercase tracking-wide` → `font-mono text-[10px] uppercase tracking-widest text-gray-400`

### T5 — 헤딩 tight tracking
파일: `src/app/page.tsx`, `src/app/app/page.tsx`, `src/app/tasks/page.tsx`, `src/app/calendar/page.tsx`
- h1, h2 클래스에 `tracking-tight` 추가

### T6 — Navbar 브랜드 타이포
파일: `src/components/Navbar.tsx`
- `font-bold text-indigo-600 text-lg` → `font-bold text-indigo-600 text-lg tracking-tight`

### T7 — DifficultyBadge, EnergyBadge pill
파일: `src/components/DifficultyBadge.tsx`, `src/components/EnergyBadge.tsx`
- `rounded-full` 확인 (이미 적용됐을 수 있음)

### T8 — FilterTabs pill 재스타일
파일: `src/features/tasks/components/FilterTabs.tsx`
- 이미 `rounded-full` 사용 중 — 확인 후 hairline border 적용

### T9 — Landing Page 스타일
파일: `src/app/page.tsx`
- Hero h1: `tracking-tight` 또는 `tracking-tighter`
- 카드들: `shadow-sm` 제거
- CTA 버튼: `rounded-full` 확인

### T10 — tasks/page.tsx 폼 버튼
파일: `src/app/tasks/page.tsx`
- "추가하기" 버튼: `rounded-lg` → `rounded-full`
- 요일 선택 버튼: 이미 `rounded-full` ✅
- 난이도 선택 버튼: `rounded-lg` → `rounded-full`

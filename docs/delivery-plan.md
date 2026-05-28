# Delivery Plan

## 1. 문서 목적

이 문서는 2회차 후반부터 3회차까지의 개발 실행 계획을 정리한다.  
전체 MVP를 한 번에 구현하지 않고, 공통 베이스와 핵심 기능을 단계적으로 구현하기 위한 기준으로 사용한다.

---

## 2. 전체 개발 목표

최종 목표는 4회차 종료 시 배포 가능한 Micro SaaS MVP를 완성하는 것이다.

최종 산출물:

- Landing Page
- App Page
- 핵심 기능
- GitHub 저장소
- 테스트 또는 수동 QA 결과
- 배포 가능한 URL
- README

---

## 3. Session 2 Goal

2회차에서는 전체 프로젝트의 약 20~30%를 완성한다.

## 2회차 완료 기준

- Next.js 프로젝트가 준비되어 있다.
- `/` route가 존재한다.
- `/app` route가 존재한다.
- Landing Page 초안이 있다.
- App Page shell이 있다.
- 핵심 타입이 정의되어 있다.
- 주요 컴포넌트 placeholder가 있다.
- mock data 또는 빈 상태가 준비되어 있다.
- `pnpm dev`로 실행 가능하다.

---

## 4. Session 2 Must Have

| Task | Description | Done When |
|---|---|---|
| Project scaffold | Next.js 프로젝트 또는 템플릿 준비 | `pnpm dev` 실행 가능 |
| Landing route | `/` 페이지 생성 | 브라우저에서 `/` 접속 가능 |
| App route | `/app` 페이지 생성 | 브라우저에서 `/app` 접속 가능 |
| Type definition | 핵심 타입 정의 | `types.ts` 작성 |
| Component placeholders | 주요 컴포넌트 파일 생성 | Form, List, Card, Filter 구조 존재 |
| Empty state | 데이터가 없을 때 화면 | 기본 안내 문구 표시 |

---

## 5. Session 2 Should Have

| Task | Description | Done When |
|---|---|---|
| Mock data | 예시 데이터 작성 | 화면에서 샘플 데이터 확인 가능 |
| Basic layout | Header, main layout 구성 | 화면이 큰 틀에서 정돈됨 |
| Basic styling | Tailwind 기반 최소 스타일 | 화면이 읽을 수 있는 수준 |
| Filter placeholder | 필터 UI 자리 생성 | 아직 로직은 없어도 UI 표시 |

---

## 6. Session 2 Not Today

2회차에서는 아래 기능을 구현하지 않는다.

- 실제 CRUD 전체 구현
- 복잡한 상태 관리
- DB 연동
- 로그인
- 결제
- 실시간 협업
- 외부 API 연동
- Playwright 테스트 코드 작성
- 배포

---

## 7. Session 3 Goal

3회차에서는 같은 요구사항을 두 방식으로 구현하고 비교한다.

## 비교 방식

1. MD 설계 문서 기반 개발
2. OpenSpec change 기반 개발

## 3회차 목표

- 핵심 기능 구현
- 요구사항 반영도 비교
- 범위 통제 비교
- 코드 구조 비교
- Claude Code 응답 품질 비교

---

## 8. Session 3 Must Have

| Task | Related Requirement | Done When |
|---|---|---|
| Item create | FR-001 | 사용자가 새 항목을 추가할 수 있음 |
| Item list | FR-002 | 생성된 항목이 목록에 표시됨 |
| Status update | FR-003 | 항목 상태를 변경할 수 있음 |
| Filter | FR-004 | 조건별 목록 확인 가능 |

---

## 9. Session 3 Should Have

| Task | Description |
|---|---|
| Delete item | 사용자가 항목을 삭제할 수 있음 |
| Edit item | 사용자가 항목을 수정할 수 있음 |
| LocalStorage persistence | 새로고침 후에도 데이터 유지 |
| Better empty state | 데이터 없음 상태 개선 |

---

## 10. Session 4 Goal

4회차에서는 테스트, 리팩토링, 배포를 진행한다.

## 4회차 목표

- Playwright 테스트 작성
- TDD 흐름 체험
- 리팩토링
- README 정리
- 배포
- 최종 발표

---

## 11. Manual QA for Session 2

2회차 종료 전 확인할 항목:

- [ ] `pnpm dev`로 앱이 실행된다.
- [ ] `/` 페이지가 열린다.
- [ ] `/app` 페이지가 열린다.
- [ ] 큰 TypeScript 오류가 없다.
- [ ] Landing Page에 서비스 설명이 보인다.
- [ ] App Page shell이 보인다.
- [ ] 주요 placeholder 컴포넌트가 표시된다.
- [ ] 모바일 너비에서 큰 깨짐이 없다.
- [ ] 오늘 구현 범위를 넘는 기능이 들어가지 않았다.

---

## 12. Verification Commands

```bash
pnpm dev
pnpm build
git status
````

선택적으로 실행:

```bash
pnpm lint
```

---

## 13. Branch Plan

3회차 비교 실험을 위해 브랜치를 나눈다.

```text
main
├── md-driven-dev
└── openspec-driven-dev
```

## MD 기반 개발 브랜치

```bash
git checkout -b md-driven-dev
```

## OpenSpec 기반 개발 브랜치

```bash
git checkout main
git checkout -b openspec-driven-dev
```

---

## 14. Development Prompts

## 공통 베이스 구현 프롬프트

```text
planning/md-design와 OpenSpec change를 모두 참고해서
오늘 구현할 공통 베이스 20~30%만 제안해 주세요.

조건:
- MD 기반 개발과 OpenSpec 기반 개발 비교를 방해하지 않는 공통 구조만 만드세요.
- CRUD 전체 구현은 하지 마세요.
- 로그인, DB, 외부 API는 넣지 마세요.
- route, shell, type, placeholder 중심으로 계획하세요.
- 아직 파일은 수정하지 말고 수정할 파일과 구현 순서만 제안하세요.
```

## 구현 승인 프롬프트

```text
좋습니다. 제안한 계획대로 구현해 주세요.

조건:
- planning/md-design 문서의 범위를 벗어나지 마세요.
- 복잡한 기능은 만들지 마세요.
- CRUD 전체는 구현하지 마세요.
- 오늘은 route, 화면 shell, 타입, placeholder까지만 구현하세요.
- 구현 후 변경 파일과 실행 방법을 요약해 주세요.
```

---

## 15. Comparison Criteria for Session 3

3회차에서 두 방식의 결과를 비교할 때 볼 기준:

| Criteria                | Question                  |
| ----------------------- | ------------------------- |
| Requirement Coverage    | 요구사항이 빠짐없이 구현되었는가?        |
| Scope Control           | 불필요한 기능이 추가되지 않았는가?       |
| Implementation Order    | 구현 순서가 자연스러웠는가?           |
| File Structure          | 파일 위치가 적절한가?              |
| Code Quality            | 중복과 복잡도가 적절한가?            |
| UI Consistency          | UI Spec과 DESIGN.md를 따랐는가? |
| Verifiability           | 테스트 또는 QA로 확인하기 쉬운가?      |
| Claude Response Quality | 계획, 요약, 검증 설명이 명확했는가?     |

---

## 16. Risks

| Risk             | Mitigation               |
| ---------------- | ------------------------ |
| 기능 범위가 커짐        | Must / Should / Nice로 분리 |
| 구현 시간이 부족함       | 2회차는 베이스 구현까지만           |
| 문서와 구현이 어긋남      | 구현 전 planning-review 실행  |
| OpenSpec이 과하게 커짐 | tasks를 10~20분 단위로 제한     |
| Next.js 설치 이슈    | 템플릿 repo 사용              |
| 학생별 진도 차이        | Must Have 중심으로 진행        |

---

## 17. Commit Plan

2회차 종료 시 커밋:

```bash
git add .
git commit -m "session-2: add planning docs skills openspec and baseline"
git push
```

3회차 MD 기반 개발 커밋:

```bash
git commit -m "session-3a: implement from MD design"
```

3회차 OpenSpec 기반 개발 커밋:

```bash
git commit -m "session-3b: implement from OpenSpec design"
```

---

## 18. Final Checklist

2회차 종료 전 확인:

* [ ] MD 설계 문서 5개 작성
* [ ] OpenSpec change 생성
* [ ] 공통 베이스 구현
* [ ] `/` route 확인
* [ ] `/app` route 확인
* [ ] 주요 타입 정의
* [ ] placeholder 컴포넌트 생성
* [ ] `pnpm dev` 실행 확인
* [ ] Git commit / push 완료
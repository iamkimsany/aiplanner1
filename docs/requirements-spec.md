# Requirements Spec
## 1. Actors
Actor	Description
Primary User	대학생 또는 여러 일을 병행하며 미루는 습관을 가진 사용자
Optional Admin	MVP에서는 제외
## 2. Main Use Cases
### UC-001. 할 일 생성
Actor: User
Goal: 사용자가 해야 할 일을 등록한다.
Precondition: 앱이 실행된 상태
Main Flow:
사용자가 해야 할 일을 입력한다.
난이도(easy, middle, hard)를 선택한다.
저장 버튼을 누른다.
할 일이 목록 및 달력에 표시된다.
Alternative Flow:
입력값이 비어 있으면 저장되지 않는다.
Result:
새로운 할 일이 저장된다.
### UC-002. 오늘의 추천 할 일 확인
Actor: User
Goal: 현재 에너지 수준에 맞는 할 일을 추천받는다.
Precondition: 할 일이 최소 1개 이상 존재
Main Flow:
사용자가 앱을 연다.
시스템이 easy/middle/hard 기준으로 할 일을 보여준다.
사용자가 현재 가능한 난이도의 일을 선택한다.
Result:
사용자는 부담 없이 작은 목표부터 시작할 수 있다.
### UC-003. 진행 상태 변경
Actor: User
Goal: 완료한 일을 체크한다.
Precondition: 등록된 할 일이 존재
Main Flow:
사용자가 완료 버튼을 누른다.
Progress bar가 업데이트된다.
Result:
완료 상태가 저장된다.
### UC-004. 달력 확인
Actor: User
Goal: 일정과 목표를 달력에서 확인한다.
Precondition: 일정 데이터 존재
Main Flow:
사용자가 달력 화면을 연다.
등록된 할 일이 날짜별로 표시된다.
Result:
사용자가 자신의 루틴과 목표를 시각적으로 확인할 수 있다.
## 3. Functional Requirements
ID	Requirement	Priority
FR-001	사용자는 새로운 할 일을 생성할 수 있다.	Must
FR-002	사용자는 할 일의 난이도를 설정할 수 있다.	Must
FR-003	시스템은 easy/middle/hard 기준으로 할 일을 보여준다.	Must
FR-004	사용자는 완료한 일을 체크할 수 있다.	Must
FR-005	시스템은 progress bar를 표시해야 한다.	Must
FR-006	사용자는 달력에서 일정을 확인할 수 있다.	Should
FR-007	사용자는 할 일을 수정하거나 삭제할 수 있다.	Nice
## 4. Non-functional Requirements
ID	Requirement
NFR-001	모바일 환경에서도 핵심 기능이 동작해야 한다.
NFR-002	사용자는 1분 안에 핵심 기능을 이해할 수 있어야 한다.
NFR-003	버튼과 입력 필드는 접근 가능한 이름을 가져야 한다.
NFR-004	민감한 정보는 GitHub에 업로드하지 않는다.
NFR-005	MVP는 단일 사용자 기반으로 구현한다.
## 5. Acceptance Criteria
### AC-001. 할 일 생성

Given 사용자가 제목과 난이도를 입력했을 때
When 저장 버튼을 누르면
Then 새로운 할 일이 목록에 표시된다.

### AC-002. 난이도별 표시

Given 여러 난이도의 할 일이 존재할 때
When 사용자가 홈 화면을 열면
Then easy/middle/hard 기준으로 구분되어 표시된다.

### AC-003. 진행 상태 변경

Given 등록된 할 일이 있을 때
When 완료 버튼을 누르면
Then progress bar가 증가한다.

### AC-004. 달력 표시

Given 일정이 존재할 때
When 사용자가 달력을 열면
Then 날짜별 할 일이 표시된다.

## 6. Requirement Traceability Lite
Requirement ID	Use Case	Acceptance Criteria	Test Candidate
FR-001	UC-001	AC-001	E2E create task
FR-002	UC-001	AC-002	E2E difficulty select
FR-003	UC-002	AC-002	E2E categorized tasks
FR-004	UC-003	AC-003	E2E complete task
FR-005	UC-003	AC-003	E2E progress update
FR-006	UC-004	AC-004	E2E calendar view
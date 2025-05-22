

API 라우터에서 이 Date 객체가 JSON으로 직렬화될 때 자동으로 UTC로 변환됩니다

로컬 스토리지와 API 통합으로 오프라인 지원



API 엔드포인트 목록
GET /api/todo - 할 일 목록 조회 (쿼리 파라미터로 사용자 필터링 가능)
POST /api/todo - 새 할 일 생성
GET /api/todo/[id] - 단일 할 일 조회
PUT /api/todo/[id] - 할 일 수정
DELETE /api/todo/[id] - 할 일 삭제
PATCH /api/todo/[id] - 할 일 완료 상태 토글
PUT /api/todo/batch - 여러 할 일 일괄 수정
DELETE /api/todo/batch - 여러 할 일 일괄 삭제




프로젝트 구조 분석
메인 페이지 (src/app/page.tsx)
-여러 위젯을 관리하고 배치하는 핵심 페이지
-DndProvider를 사용하여 드래그 앤 드롭 기능 제공
-위젯 배치 상태를 localStorage에 저장/복원하는 기능
위젯 컨테이너 (src/components/WidgetContainer.tsx)
-3개의 컬럼(좌측, 중앙, 우측)으로 구성된 그리드 레이아웃
-각 컬럼에 위젯을 배치하고 관리하는 기능
-각 영역에 최소 1개의 위젯이 필요하도록 제약 조건 구현
-마지막 위젯은 이동 불가능하도록 잠금 기능 구현
-드래그 중 시각적 피드백 제공
드래그 가능한 위젯 (src/components/DraggableWidget.tsx)
-react-dnd를 사용한 드래그 앤 드롭 기능 구현
-위젯의 잠금 상태 관리
-드래그 중 시각적 효과 제공
다양한 위젯 컴포넌트
-ClockWidget: 디지털 시계
-CalendarWidget: 캘린더
-TodoListWidget 및 AddTodoWidget: 할 일 목록 관리
-MemoWidget: 메모 기능
-TimerWidget: 타이머
-BackgroundSelector: 배경 이미지 선택기


Next.js 기반 위젯 대시보드 프로젝트 개선 및 기능 개발
다양한 위젯 개발 및 배치
배경 이미지 선택, Todo, 메모, 타이머, 디지털 시계, 캘린더 등 주요 위젯 개발 및 대시보드에 배치
드래그 앤 드롭, 최소 1개 위젯 제약, 고정 위젯 알림 등 핵심 UX 기능 구현
드래그 앤 드롭 및 위젯 관리 개선
하이드레이션 오류, 고정 위젯 이동 문제, 영역별 최소 위젯 제약 등 주요 이슈 해결
위젯 상/하단 드롭 위치 안내, 드래그 시작 시 드롭 안내 표시, 상단 드롭 안내 제거 등 UI/UX 개선
위젯 넓이 통일, 드래그 핸들 및 이동 표시 일관화, 드래그 잔상 오류 수정
디자인 일관성 및 UI 개선
AddTodoWidget, TodoListWidget, CalendarWidget, ClockWidget 등 주요 위젯의 넓이와 스타일 통일
모든 위젯에 그라데이션 테두리, 어두운 내부 배경, 밝은 텍스트 등 일관된 디자인 적용
ClockWidget 타이틀을 그라데이션 텍스트로 중앙 정렬, 드래그 핸들 아이콘도 타이틀 높이에 맞춰 중앙 정렬
MemoWidget의 메모 목록 렌더링 및 입력/수정/삭제 UI 정상화
Header 및 글로벌 기능 추가
Header 컴포넌트 추가: 좌측 로고, 우측 설정(드롭다운) 아이콘 배치
다크 모드, 위젯/할 일 초기화 등 글로벌 기능 제공
기술 스택 및 도구
TypeScript, Next.js, React, Tailwind CSS, React-DnD, localStorage 등 최신 프론트엔드 기술 활용
일관된 디자인 시스템과 사용자 경험(UX) 구현
필요에 따라 각 항목을 더 상세히 기술하거나, 코드/스크린샷/링크 등
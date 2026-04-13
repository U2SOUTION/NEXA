<template>
  <div class="archive-view">
    <header class="page-header">
      <div class="title">NEXA ARCHIVE</div>
      <div class="subtitle">사유와 실행 아카이브 개요</div>
    </header>

    <section class="section-card">
      <div class="section-title">개요</div>
      <div class="section-desc">아카이브 도메인의 허브, 에디터, 커넥터, 인사이트 기능에 빠르게 접근할 수 있는 시작 화면입니다.</div>
    </section>

    <section class="section-card">
      <div class="section-title">아카이브 지침서 핵심 요약</div>
      <ul class="section-list">
        <li><strong>철학</strong>: 사유(Note) → 전이 → 실행(Task)까지 한 문서 안에서 흐르게.</li>
        <li><strong>핵심 기둥</strong>: Layout(배치) · Block(보이는 부품) · Logic(동작 규칙) 세 축.</li>
        <li><strong>도구</strong>: Tiptap 에디터 + Mermaid 순서도 + D3 관계망/실시간 그래프.</li>
        <li><strong>파서 흐름</strong>: View 입력 → Parser/DocAssembler 해석·조립 → Service/Logic → Integration(기기/DB).</li>
        <li><strong>커넥터</strong>: 기기·DB 등록, ActionDispatcher로 명령 포장, EventWatcher로 상태 수집.</li>
        <li><strong>확장 원칙</strong>: 기존 코드 수정보다 새 Block/Logic/Service 추가로 확장.</li>
      </ul>
      <div class="section-desc muted">자세한 내용: `Platform/04-개발/문서관리_Archive_개발 기획서.md` (6부 구성: 개념 → 템플릿 → 에디터/도구 → 파서/데이터 → 커넥터 → 확장).</div>
    </section>

    <section class="section-card links">
      <div class="section-title">메뉴 목록</div>
      <div class="link-list">
        <q-btn flat dense icon="dashboard" label="HUB" />
        <q-btn flat dense icon="edit_note" label="EDITOR" />
        <q-btn flat dense icon="settings_input_component" label="CONNECTOR" />
        <q-btn flat dense icon="psychology" label="INSIGHTS" />

        <q-separator vertical />

        <q-btn flat dense icon="schedule" label="Templates" />
        <q-btn flat dense icon="schedule" label="Timeline" />
      </div>
      <div class="section-desc muted">왼쪽 메뉴와 동일하게 섹션별 뷰로 이동합니다.</div>
    </section>

    <section class="section-card">
      <div class="section-title">피일 구조</div>
      <div class="section-desc">
        <pre>

├── domains/                               # 도메인별 독립 프로젝트 영역 (⚠ pages 대신 view)
│   └── archive/                           # archive 메인 메뉴 클릭 시 좌측에서 모든 서브메뉴 노출
│       ├── ArchiveDomain.vue              # 중앙 router-view, 좌/우는 레지스트리 주입
│       ├── views/
│       │   ├── left/
│       │   │   └── ArchiveLeftNav.vue     # hub/editor/connector/insights 메뉴를 모두 표시
│       │   ├── content/
│       │   │   ├── ArchiveIndex.vue       # /nexa-archive - 실시간 지표, 진행 상태, 요약 통계
│       │   │   ├── HubView.vue            # /archive/hub - 프로젝트 개요, 문서 그리드, 지식 맵 시각화
│       │   │   ├── EditorView.vue         # /archive/editor -  메인 에디터 영역 (Layout + Block + Logic 조립 렌더링)
│       │   │   ├── ConnectorView.vue      # /archive/connector - 데이터 매핑, 동기화 로그, 필드 정의 및 검증
│       │   │   └── InsightsView.vue       # /archive/insights - D3.js 기반 전역 지식 관계망 (Global Map)
│       │   └── right/
│       │       └── ArchiveRightPanel.vue  # 라우트별 분기/공용 넥셋
│       │
│       ├── router/                        # (선택) 도메인 하위 라우트 정의 모듈
│       │    └── archive-routes.js          # /archive → /archive/hub 로 리다이렉트, 하위 4뷰 등록
│       │
│       ├── store/                           # 도메인 로컬 상태 관리
│       │   ├── useDocStore.ts               # 문서(Operation/Note 통합) CRUD 및 상태 관리
│       │   └── useTabStore.ts               # 활성화된 탭 세션 및 에디터 컨텍스트 관리
│       │
│       ├── components/                     # archive 내 재사용 UI 컴포넌트
│       │   ├── blocks/                     # 에디터 구성 기능 블록
│       │   │   ├── StaticTextBlock.vue     # 기본 텍스트 및 사유 기록
│       │   │   ├── AbstractLogicBlock.vue  # [추가] 복잡한 인과관계 및 철학적 구조 시각화
│       │   │   ├── RealTimeIotBlock.vue    # 실시간 데이터 바인딩 및 모니터링
│       │   │   ├── ActionButtonBlock.vue   # 기기 제어 및 업무 실행 버튼
│       │   │   ├── DocRefBlock.vue         # 다른 사유(Note)나 업무(Task) 참조/임베딩
│       │   │   ├── MermaidBlock.vue        # 머메이드 렌더링 전용 블록
│       │   │   └── D3VisualizerBlock.vue   # D3.js 기반 동적 차트/네트워크 블록
│       │   ├── diagram-elements/           # 다이어그램 구성 요소 UI
│       │   │   ├── NodeProperties.vue      # 노드 속성(색상, 데이터 바인딩) 설정
│       │   │   └── EdgeLinker.vue          # 관계선(Edge)의 논리 정의 UI
│       │   ├── DocTreeNavigator.vue        # 통합 자산 계층 트리
│       │   ├── TabHeader.vue               # 탭 스타일 UI
│       │   └── EditorToolbar.vue           # 사유 도구(Thought Tools) 및 편집 도구 모음
│       │
│       ├── templates/                      # 삼원화된 표준 템플릿 (.json)
│       │   ├── layouts/                    # 1. 문서 뼈대 (업무 집중형, 사유 집중형 등) (lyt-*.json)
│       │   │   ├── lyt-stream-note.json    # 단편적 사유를 시간 순으로 쌓는 무한 스크롤 레이아웃
│       │   │   ├── lyt-abstract-canvas.json # 고차원적 추상화를 위해 D3/머메이드 캔버스가 강조된 레이아웃
│       │   │   ├── lyt-operational-task.json # 절차서와 기기 제어 패널이 결합된 현장 업무용 레이아웃
│       │   │   ├── lyt-hybrid-archive.json # [기본] 상단 사유(Note)와 하단 실행(Task)이 공존하는 결합형 레이아웃
│       │   │   └── lyt-data-dashboard.json # 외부 DB 수치 분석 및 리포팅에 최적화된 격자형 레이아웃
│       │   │
│       │   ├── blocks/                     # 2. 기능 부품 (입력, 제어, 시각화, 추상화 도구) (blk-*.json)
│       │   │   ├── blk-fragment-card.json  # 메타데이터를 포함한 최소 단위 사유 조각 블록
│       │   │   ├── blk-rich-text.json      # 고도화된 사유를 기록하는 마크다운 기반 텍스트 블록
│       │   │   ├── blk-mermaid-editor.json # 머메이드 코드를 입력하고 시각화하는 다이어그램 블록
│       │   │   ├── blk-d3-network.json     # D3.js 기반의 지식 관계망 및 인과관계 시각화 블록
│       │   │   ├── blk-iot-monitor.json    # 장치의 센서 데이터를 실시간 차트로 출력하는 감시 블록
│       │   │   ├── blk-action-button.json  # 물리 장치에 명령을 전달하는 제어 스위치 블록
│       │   │   ├── blk-external-table.json # 연동된 외부 DB 데이터를 리스트업하는 표 형식 블록
│       │   │   └── blk-thought-linker.json # 단편 조각들을 드래그하여 논리적으로 묶어주는 캔버스 블록
│       │   │
│       │   └── logics/                     # 3. 실행 규칙 (장치 매핑, 워크플로우 자동화) (lgc-*.json)
│       │       ├── lgc-cnc-protocol.json   # CNC 기기 API와 문서 내 액션 버튼 간의 매핑 규칙
│       │       ├── lgc-smartfarm-rule.json # 센서 수치에 따른 자동 제어(임계치 알람 등) 로직 정의
│       │       ├── lgc-abstract-bridge.json # [핵심] 사유(Note)의 변수가 업무(Task)의 파라미터로 전이되는 규칙
│       │       ├── lgc-db-sync-policy.json # 외부 데이터베이스와의 동기화 주기 및 필드 매핑 로직
│       │       ├── lgc-event-trigger.json  # 특정 수치 도달이나 사용자 클릭 시 발생하는 시스템 이벤트 정의
│       │       └── lgc-auto-tagging.json   # 텍스트 분석을 통해 지식 문서와 업무 문서를 연동하는 자동 태그 로직
│       │
│       ├── services/                       # 비즈니스 로직 및 의사결정 레이어
│       │   ├── DocSyncManager.ts           # 데이터 동기화 및 사유-실행 간 문맥 유지
│       │   ├── KnowledgeGraph.ts           # 문서 간의 철학적/업무적 연결 고리 관리
│       │   └── InsightAnalyzer.ts          # 문서 간 유의미한 연결 고리를 찾아내는 엔진
│       │
│       ├── integration/                    # 외부 세계와의 통신 전담 (통신망)
│       │   ├── device-protocols/           # CNC, MQTT 등 물리 장치별 통신 프로토콜
│       │   └── tool-connectors/            # 외부 협업 및 생산성 도구 API 연동
│       │
│       └── index.vue                       # archive 도메인 루트 레이아웃 (전체 흐름 조율)
│
├── system/
│   └── schemas/                         # 🟢 [Strict Layer] 전역 데이터 규격 (Zod 기반)
│       ├── archive/                     # archive 도메인 전용 스케마
│       │   ├── DocBlockSchema.ts        # 블록별 데이터 구조 (Text, Action, Abstract Logic 등)
│       │   ├── ValidationRule.ts        # 업무 문서 전환 시 필수 데이터 및 수치 검증
│       │   └── EventSchema.ts           # 외부 데이터 이벤트 및 사용자 사유 로그 기록 규격
│       └── shared/                      # 도메인 공통 스케마
│
└── engines/                             # ⚙️ [Internal Libs] 전역 기술 엔진 (재사용 로직)
    ├── parser/                          # 🏭 문서 해석 및 가공 공장
    │   ├── ContentParser.ts             # 텍스트 내 태그 인식 및 추상 개념 데이터화
    │   ├── DocAssembler.ts              # Layout + Block + Logic 유기적 조립 엔진
    │   ├── LogicResolver.ts             # 사유 기반 로직을 실행 명령으로 변환
    │   ├── ContextAnalyzer.ts           # 문맥 분석을 통한 도구 자동 추천 엔진
    │   └── DiagramInterpreter.ts        # 다이어그램 상호작용(클릭 등) 해석기
    │
    ├── connector/                       # 🔌 외부 세계 연결 및 데이터 브릿지
    │   ├── ActionDispatcher.ts          # 사유 결과물을 실제 기기 명령으로 전송 분배
    │   ├── EventWatcher.ts              # 데이터 변화 감지 및 타임라인 생성기
    │   ├── DataBindingService.ts        # 시각화 블록에 실시간 IoT 데이터 주입
    │   └── database-adapters/           # DB 엔진별 커넥터 (Postgres, MongoDB 등)
    │
    ├── diagram/                         # 📊 시각화 전용 기술 엔진
    │   ├── d3-helpers.ts                # D3.js 공통 유틸 (Scale, Axis, Zoom 등)
    │   ├── mermaid-config.ts            # 머메이드 테마 및 전역 렌더링 설정
    │   ├── DiagramGenerator.ts          # 데이터 기반 머메이드 코드 자동 생성기
    │   └── RelationMapper.ts            # 지식 노드 간의 물리적/논리적 거리 계산
    │
    └── blocks/                          # 🧱 전역 공통 렌더링 블록 (NexaBlock 기초)
        ├── StaticTextBlock.vue          # 기본 텍스트 출력용
        ├── ActionButtonBlock.vue        # 제어 스위치 공통 UI
        └── RealTimeIotBlock.vue         # 실시간 수치 표시 전용
      </pre
        >
      </div>
    </section>
  </div>
</template>

<script setup>
// import { useRouter } from 'vue-router'

// const router = useRouter()

// function go(name) {
//   router.push({ name })
// }
</script>

<style lang="scss" scoped>
.archive-view {
  padding: 16px;
  color: var(--nexa-text-primary);
  background: var(--nexa-background);
  min-height: 100%;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 16px;
  .title {
    font-size: 38px;
    font-weight: 900;
  }
  .subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: var(--nexa-text-secondary);
  }
}

.section-card {
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  padding: 12px 14px;
  background: var(--nexa-surface);
  .section-title {
    font-size: 16px;
    font-weight: 600;
  }
  .section-desc {
    margin-top: 6px;
    font-size: 13px;
    color: var(--nexa-text-secondary);
    line-height: 1.4;
  }
  .section-list {
    margin: 8px 0;
    padding-left: 18px;
    color: var(--nexa-text-primary);
    li + li {
      margin-top: 4px;
    }
  }
  &.links {
    .link-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 8px 0;
    }
  }
}

.inline-link {
  margin-left: 6px;
  color: var(--nexa-primary);
  text-decoration: underline;
}

.muted {
  color: var(--nexa-text-secondary);
}
</style>

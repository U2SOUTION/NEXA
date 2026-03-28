**[NXN] [UIUX] NEXA Nexion 인터페이스 레이아웃 및 Vue Flow 운영 규약**

## 1. 개요 및 목적

**NEXA Nexion**은 지식 운영체제(Knowledge OS)의 논리 구조를 설계하는 **독립형 관제 데스크**로서, 개발자가 시스템의 서사를 시각적으로 조립하고 파일 시스템과 동기화할 수 있는 환경을 제공한다. 본 문서는 플랫폼의 표준 인터페이스 규격을 준수하면서도, **Vue Flow**를 통한 지능형 설계 경험을 극대화하기 위한 레이아웃 및 운영 규약을 정의한다.

### 1.1 구현 티어·Phase와 UI 범위(요약)

- **Tier A(코어):** §2·§4·§6·§7의 3단 레이아웃, Vue Flow, 탐색기·고아 필터, Late Anchoring, NFS 동기화 UI는 **코어 UI**다. **구현 Phase 순서**는 `[NXN] [PRD] Nexion 기능과 작업 순서.md` **§3.2**. 백엔드 계약은 `[NXN] [API] NEXA Nexion API 및 통신 규약.md` **§1.1 Core**(§4~7)와 맞춘다.
- **Phase Ext:** §3의 TipTap·Ollama·`Terms Inspector`는 **Extension 트랙**(코어 Phase 번호와 분리). API는 동 문서 **§1.1 Extended**, UX·에러 흐름은 `[NXN] [SPEC] NEXA Nexion 확장 프로그램(Extension) 기능 명세.md`를 본다.
- **Tier B:** **NEXA NIXIE 시각 규약(§4.3.1)**·`nixie_lumina_profile`(SCHM §4)을 DB·테넌트(RLS)와 강하게 묶는 연출·워크스페이스 가드는 플랫폼 배포 단계 — `[NXN] [API]` §10 및 `[NXN] NEXA Nexion 개발 순서와 체크 리스트.md`의 **Phase B-ops**와 정합한다. Tier A에서는 동기화 불일치 등 **클라이언트 파생**으로 NIXIE 연출을 시작해도 된다.

### 1.2 초보자를 위한 안내(읽는 순서·용어)

본 문서는 **Vue Flow를 처음 쓰는 구현자**도 따라갈 수 있도록 용어와 판단 근거를 짧게 밝힌다.

- **권장 읽기 순서:** §2(레이아웃·폴더) → §4.1~4.2(Vue Flow 채택·중첩·줌) → **§4.3.1(NEXA NIXIE 시각 규약)** → §4.3~§4.4(노드·임계) → §3(탐색·편집) → §5~§8(NFS·Late Anchoring 등).
- **최소 용어:**
  - **노드(Node):** 캔버스 위의 한 덩어리(카드, 그룹 박스 등).
  - **엣지(Edge):** 노드와 노드를 잇는 연결선.
  - **뷰포트(Viewport):** 사용자가 보는 캔버스 영역; **줌(확대/축소)**·**팬(이동)** 은 뷰포트 변환으로 처리된다.
  - **드로어:** 화면 왼쪽·오른쪽에 붙는 패널(§2.1).
  - **앵커(`doc_anchor`):** 파일·문서를 DB에서 식별하는 ID(NFS·API 문서 참고).
- **Vue Flow 공식 문서:** 구현 전 `@vue-flow/core` 기준으로 [Vue Flow 문서](https://vueflow.dev/)에서 **Getting Started**, **Nodes**, **Viewport**, **Composables** 를 순서대로 읽는 것을 권장한다(버전별 API는 공식 문서가 최종이다).

### 1.3 UI 상태·에러·빈 화면(초보자용 체크리스트)

구현 시 다음을 **문서·스크린별로** 한 번씩 정해 두면 이후 논의가 줄어든다.

| 상황 | 권장 표현 위치 | 메모 |
|------|----------------|------|
| 데이터 로딩 중 | 왼쪽 트리·캔버스·우측 패널 각각 | 스켈레톤 또는 스피너; 캔버스는 레이아웃 튐을 줄이기 위해 **고정 높이** 유지 |
| 아무 노드도 선택 안 함 | 우측 패널 | “노드를 선택하세요” 등 **빈 상태** 카피 |
| API 실패(`error_code`) | 토스트 + (필요 시) 해당 패널 인라인 | `[NXN] [API]` §2.5·§2.6 과 동일 토큰 사용 |
| 동기화 충돌·낙관적 락 | 중앙 배너 또는 모달 | 사용자 **확인(ASK)** 후 재시도 |
| Extension 미설치·비활성 | 해당 탭 | 숨김 vs 비활성+툴팁 중 팀 규칙 하나로 통일 |

## 2. 인터페이스 레이아웃 (3-Panel Layout)

NEXA 플랫폼의 표준 프레임워크를 계승하여 개발자에게 익숙한 **3단 구성**을 채택한다.

### 2.1 패널 역할 및 드로어 성격(고정)

플랫폼 **왼쪽 / 중앙 / 오른쪽** 슬롯만 따른다(`domainRegistry`의 `left`·`content`·`right`). Nexion에서 **좌·우는 “드로어” 성격**을 벗어나지 않는다.

| 슬롯 | 성격 | 담당 UX(요약) |
|------|------|----------------|
| **왼쪽** | **탐색·목록·내비** | NFS 문서 트리, 고아(Orphaned) 그룹, 캔버스 연동 필터, 워크스페이스·프로젝트 구획 전환(필요 시). **속성 편집·에디터 본문·Vue Flow 캔버스 본체는 두지 않는다.** |
| **중앙** | **주 작업 면** | Vue Flow 캔버스, 엣지 편집, 무한 줌(Fractal Zoom 연출·줌 기반 표시 용어는 **§4.2**). Extension인 **문서 편집 탭**(TipTap)은 중앙 영역 **하위**로만 둔다(좌/우로 빼지 않음). |
| **오른쪽** | **선택 대상의 상세·부가 도구** | 선택 노드 메타(Link ID, 제목, 영문 IR), Late Anchoring·`doc_anchor` 연결 UI, 동기화·신뢰도 힌트. Extension인 **Terms Inspector**(Ollama 결과)는 **우측 패널 탭**으로만 둔다. **문서 전체 트리·캔버스 전체 맵은 두지 않는다.** |

### 2.2 플랫폼 프레임 정합

- **도메인 키·경로:** **`nexion`** — 소스 루트 **`NEXA-Platform/src/domains/nexion/`** (기존 `dev` 하위 `dev-tools` 안에 두는 안은 **채택하지 않음**).
- **등록:** `src/frame/registry/domainRegistry.ts`에 `left` / `content` / `right`를 각각 `NexionLeftNav.vue`·`NexionDomain.vue`(또는 content만 감싸는 셸)·`NexionRightPanel.vue`로 연결하고, `src/frame/router/domainRoutes.ts`에 경로를 추가한다. 패턴은 `nexa-board`, `automation` 등 타 도메인과 동일하다.
- **백엔드:** NXN REST는 `server/domains/nexion/`(또는 플랫폼 라우팅 규약에 맞는 동일 패턴)에 두어 `projects`, `archive` 등과 일관되게 한다.

### 2.3 `src/domains/nexion/` 파일·폴더 구조(권장)

아래는 **§2.1 성격**을 깨지 않도록 나눈 권장 트리다. `modules/core`와 `modules/extension`으로 **Tier A 코어 UI**와 **Phase Ext**를 폴더로도 구분한다.

```text
src/domains/nexion/
├── NexionDomain.vue                 # 도메인 진입·인터컴·레이아웃 셸; content 슬롯에 연결
├── views/
│   ├── left/
│   │   └── NexionLeftNav.vue        # 왼쪽 전용: 문서 트리, 고아, 필터, (선택) 구획 전환
│   ├── content/
│   │   ├── NexionContent.vue        # 중앙 셸: 캔버스 vs 편집 탭 등 라우트/상태 스위치
│   │   ├── canvas/
│   │   │   ├── NexionCanvasView.vue # Vue Flow 메인 뷰
│   │   │   ├── NexionFlowToolbar.vue
│   │   │   └── …                    # 줌·미니맵·동기화 배너 등 캔버스 주변 UI
│   │   └── workspace/               # (선택) 중앙 하위: 동기화 큐, 타임라인 등 “작업 면”에 붙는 패널
│   └── right/
│       ├── NexionRightPanel.vue     # 오른쪽 전용: 탭 컨테이너(속성 | Terms Inspector | …)
│       └── panels/
│           ├── NodeAttributesPanel.vue      # 코어: 메타·IR·앵커·Late Anchoring 필드
│           ├── SyncHealthPanel.vue          # 코어(선택): 동기화·신뢰도 요약
│           └── TermsInspectorPanel.vue      # Extension: Ollama 용어 추출 결과
├── modules/
│   ├── core/                        # 코어(Tier A) — API Core·캔버스·NFS 연동
│   │   ├── components/
│   │   │   └── flow/                # 커스텀 노드·엣지 Vue
│   │   ├── composables/             # useNexionCanvas, useSelection, useTraceabilityTree 등
│   │   ├── services/                # nxn API 클라이언트(§4~7), 동기화 상태 구독
│   │   └── config/                  # 플로우 기본값, 임계값 등
│   └── extension/                   # Phase Ext — 교체·비활성화 용이하게 한 덩어리
│       ├── editor/                  # TipTap 래퍼, 저장·해시 연동(중앙 탭에서만 사용)
│       ├── term-extraction/         # Terms Inspector용 UI composable만(규격·호출 본체는 §2.4.2 system 승격)
│       └── composables/             # Extension 전용 조합 로직
└── …                                # 도메인 전용 상수·테스트만. 타입·런타임 규격은 §2.4.3 (`system/types`·schemas)
```

**구조 규칙(요약):**

- **왼쪽 `views/left/`** 에는 탐색·리스트·필터만 둔다. `modules/core`의 트리 데이터 훅을 주입해도 되되, **편집 폼·플로우 노드 정의**는 중앙/우측 또는 `modules`로 보낸다.
- **중앙 `views/content/`** 에만 캔버스와(Extension 시) **문서 편집 탭**을 둔다. TipTap 관련 SFC는 `modules/extension/editor/`에 두고, 탭 셸만 `content/`에 얇게 유지한다.
- **오른쪽 `views/right/panels/`** 에 속성·앵커·IR·Terms Inspector를 탭으로 나눈다. Extension 패널은 **파일명·폴더**로 `extension` 계열과 구분 가능하게 둔다.
- **서버:** `server/domains/nexion/` 에 라우트·컨트롤러·서비스를 두고, `[NXN] [API]` **Core / Extended** 경계를 주석 또는 하위 폴더(`routes/core`, `routes/extension` 등)로 맞출 수 있다(구현 선택).

### 2.4 `src/engines/` · `src/system/` 과의 관계(현재 리포지토리 **파일·폴더명** 기준)

Nexion 도메인 트리(§2.3)와 별도로, **이미 존재하는 엔진·시스템 레이어**를 어떻게 쓸지 구분한다. 아래는 **이름 참고**이며, 실제 import 경로는 프로젝트 alias(`@engines/…`, `@system/…` 등)에 맞춘다.

#### 2.4.1 재사용 가능(예측) — 도메인에서는 가져다 쓰기만

**`src/engines/`** (기능 엔진; Nexion은 래핑·조합)

| 상위 폴더 | 참고할 파일·하위 이름(예) | Nexion에서의 예측 용도 |
|-----------|---------------------------|-------------------------|
| `block/` | `NexaBlock.vue`, `BoardBlock`, `ChartBlock`, `DeviceBlock`, `TimeBlock`, `WeatherBlock` | 캔버스에 블록형 위젯이 필요할 때만 선택 |
| `charts/` | `NexaChart.vue`, `MultiChartContainer`, `bar/`·`line/`·`pie/`·`area/`·`scatter/`, `utils/chartEvents`·`chartTheme` 등 | 지식 맵에 차트가 붙는 경우 |
| `diagram/` | `NexaDiagram.vue`, `NodeCanvas.vue`, `flow/`(`FlowDiagram`, `FlowNodeRenderer`), `filetree/`, `network/`, `erd/`, `dependency/`, `panels/*SettingsPanel`, `utils/diagramZoom`·`diagramEvents`·`diagramLayout`·`diagramTheme`, `config/` | **Nexion 캔버스의 구현 SSOT는 Vue Flow**다. 본 엔진과의 역할 구분·학습 순서는 **§4.1** 필수 참고. 줌·이벤트·설정 패널 UI만 참고·일부 재사용 가능 |
| `renderers/` | `DataCardRenderer`, `DataChartRenderer`, `DataTableRenderer`, `DataListRenderer` | 데이터 바인딩 카드 렌더 |
| `services/` | `evaluatorService.ts`, `flowManager.ts` | 실행·배선 맥락에서 검토 |
| `tiptap/` | `skins/base`·`full`/`TiptapEditor.vue`, `extensions/`, `utils/clipboardImage`·`youtube`·`fileFormat` | **Extension 문서 편집**: 기존 에디터 스킨·유틸 우선 래핑 |
| `sentinel/` | `AGENTS.md` 등 | 정책·에이전트 가이드 참고 |

**`src/system/`** (플랫폼 공용)

| 상위 폴더 | 참고할 이름(예) | Nexion에서의 예측 용도 |
|-----------|------------------|-------------------------|
| `boot/` | `pinia.ts` 등 | 기존 부트 흐름 유지 |
| `components/ui/` | `explorer/ExplorerTree`·`ExplorerViewCard`, `viewer/`, `TableEmptyState`, `NexaSpinner`, `ProjectSelector` 등 | **왼쪽 드로어** 트리·탐색기 계열 우선 |
| `composables/` | `useDomainIntercom`, `useAuthenticatedFetch`, `useGlobalShortcuts`, `url-state/` 등 | 도메인 인터컴·인증·URL 상태 |
| `config/` | `componentTaxonomy`, `fileTypes`, `url-state/` | 설정·분류 |
| `constants/` | (파일명은 구현 시 확인) | 공통 상수 |
| `css/` | `nexa-system/`, `extension/`, `themes/` | 스타일 계승 |
| `schemas/` | `common/`, `engine/`, `modules/`, `recipes/`, `storage/`, `ai_responses`, `auth`, `devices`, `projects`, `errors`, `jsonb` 등 | **Zod** 규격(§2.4.3); NXN 추가 시 여기 확장 |
| `services/` | `device/` 등 | 기존 서비스 패턴 참고 |
| `store/` | (도메인 스토어와 분리된 공용만) | Pinia |
| **`types/`** | `index.ts`, `ids.ts`, `common/` | **필수**(§2.4.3) |
| `utils/` | `markdown/`, `graph-doc/`, `path-categorizer/`, `path-tree-builder`, `generateId` 등 | 마크다운·경로·그래프 분석 |

#### 2.4.2 Nexion을 만들며 전역(`system`)으로 빼기 권장 — 콘텐츠·타 도메인 재사용

다른 화면에서도 동일한 **검증·호출 규격**을 쓰게 하려면 `domains/nexion` 안에만 두지 않고 승격한다.

| 승격 대상(예) | 권장 위치 | 비고 |
|---------------|-----------|------|
| 용어 추출 요청/응답(JSON) | `system/schemas/` 에 Zod 정의(예: `schemas/nxn/termExtraction.ts` 또는 `schemas/ai/` 하위) | `TermsInspectorPanel`·향후 타 AI 패널 공용 |
| NXN REST 응답(traceability, sync-state, node-links, documents…) | `system/schemas/nxn/` 등으로 절 추가 + 필요 시 `system/types` 에 `z.infer` re-export | fetch 후 `safeParse`·에러 코드 정합(`[NXN] [API]`) |
| NXN API Thin 클라이언트 | `system/services/nxn/` (또는 `system/services/api/nxnClient.ts`) | 도메인 `modules/core/services` 는 UI 상태·조합 위주로 얇게 |
| Ollama/추론 프록시 호출 래퍼 | 기존 `schemas/ai_responses.ts` 등과 정합해 `system/services/ai/` 확장 | Extension 전용이 아닌 “플랫폼 AI 호출”로 통일 |

`domains/nexion/modules/extension/term-extraction/` 에는 **패널·탭에 묶인 composable·로컬 상태**만 두고, **페이로드·응답 형태**는 위 스키마/타입만 참조한다.

#### 2.4.3 타입·스키마 필수 규칙 — `system/types` + Zod

- **`src/system/types/` 는 필수다.** NXN 관련 공용 타입을 `domains/nexion/**/types.ts` 에 새로 만들지 않는다. 순수 컴파일타임 타입만 `system/types/` 하위에 추가하고, **`system/types/index.ts` 에서 re-export** 한다(기존 `system/types/index.ts` 주석: 단일 정의 위치·도메인 내부 `types` 금지).
- **런타임 검증이 필요한 경계**(REST 응답, 폼, 용어 추출 결과, Extension ↔ 코어 메시지)는 **`src/system/schemas/` 에 Zod 스키마**로 정의한다. 타입은 **`z.infer<typeof SomeSchema>`** 로 두고, 필요 시 `system/types` 에서 스키마 추론 타입을 re-export 한다(**스키마 우선, 타입은 보조** — 동일 파일 헤더 정책).
- **서버**에서 이미 Zod를 쓰는 경우(예: `server/domains/ai/`)와 **필드명·코드**를 맞추거나, 공유 패키지가 없으면 주석으로 SSOT를 명시한다.
- Nexion 도메인 코드에서는 **`@system/types`**, **`@system/schemas/…`** (프로젝트 alias 기준) 로만 가져온다.

## 3. 노드와 문서 필터링 및 편집

- **좌측 드로어 (Resource Explorer):**
  - **문서 리스트 필터링:** 캔버스에서 특정 카드(노드)를 선택하면, 해당 노드의 Link ID와 연결된 문서만 리스트에 노출한다.
  - **계층 옵션:** "이하 모든 문서 포함" 체크박스로 상위 경로 노드 기준 하위 디렉터리 문서를 한꺼번에 볼 수 있다.
  - **고아 자산 관리:** 어떤 노드에도 귀속되지 않은 문서는 Orphaned 그룹으로 최상단에 배치한다.
- **중앙 컨텐츠 (Vue Flow & TipTap Editor):**
  - **기능 1 요약:** 좌측 드로어에서 문서를 클릭하면 TipTap 탭을 열고, 편집 후 저장 시 원본 파일과 메타(`source_hash`)를 동기화한다.

### 3.1 현재 문서 AI 핵심 용어 추출 (Ollama)

- **기능 2:** 편집 중인 현재 문서를 기준으로 Ollama 모델을 호출해 핵심 용어와 1~2문장 설명을 추출한다.
- **표시 위치:** 우측 드로어에 `Terms Inspector` 패널을 두고 결과를 리스트로 표시한다.
- **사용자 제어:** 추출 결과는 자동 반영하지 않고, 사용자가 선택한 항목만 문서에 삽입한다.
- **실패 처리:** 모델 타임아웃·실패 시 1회 재시도 후 ASK 메시지를 표시한다.

상세 계약은 `**[NXN] [API] NEXA Nexion API 및 통신 규약.md`**(HTTP·JSON)와 `**[NXN] [SPEC] NEXA Nexion 확장 프로그램(Extension) 기능 명세.md**`(UX·확장 흐름)를 따른다.

## 4. Vue Flow 노드 및 엣지 운영 규약

### 4.1 Vue Flow 채택 이유·기존 `engines/diagram` 과의 관계(초보자용)

플랫폼에는 이미 **`src/engines/diagram/`** (`NexaDiagram`, `NodeCanvas`, `flow/`, `filetree/` 등) 이 있다. Nexion은 이와 **별도의 캔버스 구현**을 쓴다.

| 질문 | 문서상 답(고정) |
|------|----------------|
| Nexion 중앙 캔버스의 **단일 구현 SSOT**는 무엇인가? | **Vue Flow**(`@vue-flow/core` 계열). 새 기능·버그 수정·성능 튜닝은 **Vue Flow 기준**으로 한다. |
| `engines/diagram` 은 어떻게 쓰는가? | **Nexion 캔버스 대체재가 아니다.** 줌·이벤트 처리, 설정 패널 UI, 색·테마 아이디어 등 **참고용**으로만 가져온다. 코드를 직접 섞을 경우 **두 세계의 좌표계·상태 모델이 달라** 유지보수가 어려워진다. |
| 처음 Vue Flow를 쓸 때 주의점 | 노드·엣지는 **데이터 배열 + 반응형**으로 관리한다. DOM을 수동으로 그리는 방식과 다르니, 공식 문서의 **controlled flow** 패턴을 먼저 익힌다(§1.2 링크). |

**한 줄 요약:** 보드·다이어그램 도구용 엔진(`engines/diagram`)과 **지식 맵 데스크(Nexion)** 는 목적이 다르다. Nexion은 **Vue Flow만** 본다.

### 4.2 계층 노드·줌에 따른 표시(중첩 가능 여부·용어·Nexion에서의 이름)

**질문: “Vue Flow 노드 안에 또 다른 노드를 넣고, 줌 레벨에 따라 보이거나 숨길 수 있나?”**

- **중첩(노드 안의 노드):** **가능하다.** 그래프 이론·시각화에서는 **복합 노드(compound node)**, **그룹 노드(group node)**, **부모–자식 계층(parent–child hierarchy)** 등으로 부른다. Vue Flow에서는 자식 노드에 **부모 노드 id**를 지정해 같은 캔버스 좌표계 안에서 **부모 경계 안에 배치**하는 패턴을 쓴다(공식 문서의 parent node / subflow 개념 — 버전별 프로퍼티명은 문서 확인).
- **줌에 따라 보이기/숨기기:** **가능하다.** 뷰포트의 **줌 배율(zoom level)** 을 읽어, (1) 자식 노드·라벨을 `v-if` / CSS `opacity` / `visibility` 로 토글하거나, (2) 같은 자리에서 **요약 노드 ↔ 상세 노드**로 컴포넌트를 바꾼다. 이때 쓰는 대표 용어는 다음과 같다.

| 용어(영문) | 한글 설명 | Nexion 기획과의 연결 |
|------------|-----------|----------------------|
| **Semantic zoom(시맨틱 줌)** | 확대할수록 **의미·디테일이 달라지는** 줌. 단순 확대가 아니라 “보여 주는 정보의 종류”가 바뀐다. | 본 문서 다른 곳의 **무한 줌(Fractal Zoom)** 연출과 같은 계열로 설계한다. |
| **Level of detail(LOD, 디테일 단계)** | 거리·줌에 따라 **표시 정밀도만** 단계적으로 바꾸는 기법(아이콘만 → 라벨 → 전체 메타). | 트리가 커질 때 성능·가독성에 유리하다. |
| **Hierarchical graph(계층 그래프)** | 부모–자식 관계를 갖는 그래프. | NFS `depth`·폴더 계층과 개념적으로 맞춘다. |
| **Collapse / expand(접기·펼치기)** | 그룹 노드 안의 자식을 한꺼번에 숨기거나 보이게 함. | 줌과 별도로 **사용자 제스처**로도 조합 가능하다. |

**구현 시 권장(초보자용 단계):**

1. **먼저** 부모–자식 노드만 동작하게 만든다(자식이 부모 밖으로 나가지 않게 `extent` 등 공식 옵션 확인).
2. **다음** `useVueFlow()` 등으로 **현재 zoom** 을 구독하고, 임계값(예: 0.5 미만이면 자식 숨김)을 **상수로** 빼 두어 튜닝한다.
3. **성능:** 자식이 매우 많으면 DOM 수를 줄이기 위해 LOD·가상화를 검토한다(필요 시 별도 스파이크).

이 절은 **기술적으로 가능함**과 **용어 SSOT**을 명시한 것이며, 실제 임계값·애니메이션은 구현 스프린트에서 조정한다.

### 4.3 노드 유형별 시각화

노드는 단순한 상자가 아니라, 데이터의 신뢰도와 시스템 상태를 투영하는 **살아있는 광원**으로 연출한다.

- **Doc Node:** 문서 형태 아이콘, 파일명(순수 제목) 표시.
- **Capability Node:** `nexa.`* 계층 구조를 반영한 도트 또는 블록 형태.

### 4.3.1 NEXA NIXIE 시각 규약 — Lumina·Jitter **표현 주체** (명문화)

플랫폼 전역 용어(`_KNOWLEDGE REF` 등)와 동일하게, **비언어 시각 피드백의 주체는 NEXA NIXIE(닉시)** 로 고정한다. **NEXU Canvas(넥슈)** 는 Vue Flow **서사 지도·표면(surface)** 일 뿐이며, 스스로 “얼굴”이나 “떨림 의도”를 가진 별도 에이전트가 아니다.

| 구분 | 역할 |
|------|------|
| **NEXU Canvas** | 노드·엣지·뷰포트를 올리는 **디지털 쉘 안의 지도**. Lumina·Jitter가 **그려지는 좌표계·캐리어**. |
| **NEXA NIXIE** | Lumina(발광)·Jitter(떨림) 등 **시각·비언어 피드백을 연출하는 주체**. 구현체는 닉시 렌더 파이프·믹서 등(REF 디렉터리의 `nixie-visualizer` 등). |
| **`nixie_lumina_profile`** | 자산(경로 행) 단위로 발광·떨림 강도·임계를 담는 **DB 메타** — SCHM §4 필드 표. Tier B·API §10과 정합. |

**문서·코드 표기 규칙(고정):**

- **권장:** 「**NEXU 캔버스 위에서 NEXA NIXIE가** Jitter·Lumina를 연출한다」「**`nixie_lumina_profile`에 따른 NIXIE 연출**」.
- **지양:** 「넥슈(NEXU) 캔버스**에서** Jitter가 발생한다」처럼 **NEXU를 연출 주체로 단정**하는 문장(표면과 주체 혼동).

다른 NXN·ARCH·SCHM·API 문서는 본 절을 **Nexion 범위의 시각 피드백 SSOT**로 인용한다.

### 4.4 시각적 피드백 (Lumina & Jitter) — 임계·데이터 소스

**연출 주체는 §4.3.1.** 아래는 임계·입력 데이터만 정리한다.

- **정상 상태:** 신뢰도 점수가 임계값(기본 95) 이상일 때 안정적인 호박색(Amber) 발광.
- **Jitter(떨림):** 신뢰도 미달 또는 **외부 파일 시스템 불일치** 시, **NIXIE**가 미세 떨림으로 ASK를 유도한다. **파일 실종·유예·삭제의 데이터 소스는 `nexa_knowledge_traceability_paths` + SCHM §4.4.1**(`status`, `missing_since`)이며, `nexa_knowledge_doc_sync_state.last_sync_status`는 **보조 가중치**로만 병합한다(SPEC §2.2·API §10).
- **Reddish(발색):** 연산 부하가 높거나 중요한 안전 규칙(Level 0) 위반 시 붉은 톤.

**수치 SSOT:** UI·API·DB 메타에서 동일 임계값을 쓸 경우, **본 문서 §4.4의 95** 를 기준으로 하고 다른 문서는 이를 인용한다(변경 시 한 곳에서 먼저 수정).

### 4.5 엣지(Edge) 연출

- **실선:** 사용자가 승인(WILL)하여 확정된 논리 연결.
- **점선:** AI 추천 또는 검토 중인 잠재적 연결(VOID).

## 5. 지능형 문서 편집 및 저장 규약 (Safe Saving)

에디터를 통한 편집은 NFS(지능형 서사 파일 시스템)의 무결성을 유지하기 위해 다음을 준수한다.

1. **마크다운 표준:** 특별한 사유가 없으면 **마크다운(.md)**을 기본으로 하며, TipTap 출력을 마크다운으로 변환해 저장한다.
2. **확장자 및 명명 규칙:** `[Link ID] [제목].md` 등 NFS 명명 규칙을 유지한다. 에디터에서 제목이 바뀌면 디렉터리 구조에 맞춰 파일명을 동기화한다.
3. **실시간 앵커 유지:** 편집 중에도 `source_hash`와 `doc_anchor`를 추적해 캔버스 노드와의 참조 사슬이 끊기지 않게 한다.

## 6. 지능형 서사 파일 시스템(NFS) 동기화 UI

외부 탐색기에서의 물리적 변화를 캔버스에 반영하는 **승인 및 히스토리** 워크플로를 UI에 녹인다.

- **외부 변경 알림:** `Doc Sync Crawler`가 폴더·파일명 변경을 감지하면 캔버스 상단에 동기화 대기 큐 알림을 노출한다.
- **가상 재구성 (Drafting):** 동기화 실행 시 `is_virtual=true` 가상 노드를 고스트 형태로 보여 변경 예고를 한다.
- **타임머신 컨트롤러:** 하단 타임라인에서 `post_state_snapshot`으로 이전 설계와 탐색기 기반 새 구조를 비교한다.

## 7. 노드 연결 및 지능 자산화 프로세스 (Late Anchoring)

캔버스 인터랙션은 지능 자산으로 데이터화한다.

1. **선 설계 (Drawing):** 좌측에서 노드를 끌어오거나 빈 곳 더블 클릭으로 카드 생성(Link ID 자동 발급).
2. **후 연결 (Late Anchoring):** 우측 참조 필드에 파일을 드래그 앤 드롭해 연결. 시스템은 해당 파일을 노드의 폴더(Link ID) 구조로 이동(`mv`)할 수 있다.
3. **번역 액션:** 노드의 번역 버튼으로 영문 IR을 생성·수정해 AI가 읽을 수 있는 지능형 악보로 박제한다.

## 8. 결론

NEXA Nexion의 UI/UX는 **기술은 배경으로 숨고 사유는 전면으로**라는 철학을 실현한다. 모든 시각적 배치는 플랫폼의 **지능적 족보(Traceability)**로 기록된다.

### 보강된 UIUX 설계의 이점

- **작업 집중도:** 노드 선택 시 관련 문서만 필터링해 현재 맥락에 집중한다.
- **중단 없는 워크플로:** 설계도(Nexion)와 TipTap 편집을 빠르게 왕복한다.
- **데이터 정합성:** 에디터가 NFS 명명·위치 규약을 강제해 수동 정리 부담을 줄인다.


# [NXN] [UIUX] NEXA Nexion 인터페이스 레이아웃 및 Vue Flow 운영 규약

| 항목 | 내용 |
| :--- | :--- |
| **SSOT (제품·5대)** | `_[NXN] NEXA Nexion 5대 지능 관리 시스템.md` — 5대 정의, 파이프라인, Identity 하위 정제, Nexion vs 런타임 경계. |
| **SSOT (데스크 셸)** | `[NXN] [UIUX] Nexion 기초 인터페이스 및 운영 규약 (v1.0).md` — 3패널·5대 매핑·공통 철학. |
| **핵심 구현 스택 (요약)** | **Vue Flow**(`@vue-flow/core`) + **Dagre**(계층 자동 배치·엣지) + **ExplorerTree**(좌측 파일·리소스 트리·DnD). **상세 표·역할 정의**는 데스크 셸 SSOT **§3 기술 스택**, §5~§5.2. |
| **본 문서 범위** | **레이아웃 슬롯**, **Vue Flow 단일 SSOT**, **N-PATH·Late Anchoring UI**, **소스 트리(`src/domains/nexion/`)**, **`engines`/`system` 관계**, **NIXIE 연출 규약**(캔버스 노드 + 플랫폼 오버레이 캐릭터), Phase·티어. **승인·배포·티어** 세부는 ARCH·운영 SSOT. |

---

## 목차

1. [SSOT 정렬 및 범위](#1-ssot-정렬-및-범위)
2. [구현 티어·Phase·트랙](#2-구현-티어phase트랙)
3. [읽는 순서·용어·빈 상태](#3-읽는-순서용어빈-상태)
4. [3패널 레이아웃·플랫폼 프레임](#4-3패널-레이아웃플랫폼-프레임)
5. [소스 코드 디렉터리 구조](#5-소스-코드-디렉터리-구조)
6. [노드·문서 필터·편집·Extension](#6-노드문서-필터편집extension)
7. [Vue Flow 운영 규약](#7-vue-flow-운영-규약)
8. [지능형 문서 편집·저장 (Safe Saving)](#8-지능형-문서-편집저장-safe-saving)
9. [N-PATH 동기화 UI](#9-n-path-동기화-ui)
10. [Late Anchoring·Why Chain](#10-late-anchoringwhy-chain)
11. [결론](#11-결론)

---

## 1. SSOT 정렬 및 범위

### 1.1 5대와 이 문서의 관계

| 5대 | 본 문서에서 다루는 UI 초점 |
| :--- | :--- |
| **Nexion Database** | 중앙 **Vue Flow** 로 ER·스키마 시각화(기초 SSOT와 동일 스택). Dry-run·승인·DDL은 API·ARCH와 정합. |
| **Nexion Identity** | 캔버스 **노드 메타·Link ID** 와 맞닿는 부분. **정제·Re-pointing** UI는 **Identity 하위 모듈**(5대 SSOT), 본 문서는 캔버스·트리와 **참조만** 연결. |
| **Nexion Capability** | Capability 노드·`nexa.*` 시각화, Late Anchoring 게이트웨이 UI. |
| **Nexion Glossary** | 우측 **Terms Inspector**(Ollama)·IR·용어 연동(Extension 트랙). |
| **Nexion Narrative** | **ExplorerTree + Vue Flow + N-PATH + Doc Sync** 가 본 문서의 **주 무대**. |

**Nexion 데스크 vs NEXU 캔버스:** 플랫폼 **홈**에 가까운 **NEXU Canvas** 는 전역 스케일 **지도·Capability 조망**에 가깝다. **`nexion` 도메인**은 **Why Chain·N-PATH·Late Anchoring** 을 다루는 **사고의 칠판·관제 데스크**다. Nexion UI는 Vue Flow **작업 면**에 집중하고, “전역 NEXU 홈” 수준 기능을 이 도메인 안에 끌어와 구현하지 않는다(상세·비유는 `[NXN] [PRD] Nexion 기능과 작업 순서.md` 부록 “NEXION Desk VS NEXU Canvas”).

### 1.2 목적 (한 줄)

**NEXA Nexion**은 Knowledge OS 논리 구조를 설계하는 **독립형 관제 데스크**로서, **Vue Flow** 기반 지능형 설계 경험을 극대화하기 위한 **레이아웃·운영·디렉터리 규약**을 본 문서에서 단정한다.

---

## 2. 구현 티어·Phase·트랙

- **Tier A(코어):** **§4·§6·§7·§9·§10** — 3단 레이아웃, Vue Flow, 탐색기·고아 필터, Late Anchoring, N-PATH 동기화 UI는 **코어 UI**다. **§5** 는 소스 트리·엔진 관계(개발 규약). **구현 Phase 순서**는 `[NXN] [PRD] Nexion 기능과 작업 순서.md` **§3.2**. 백엔드 계약은 `[NXN] [API] NEXA Nexion API 및 통신 규약.md` **§1.1 Core**(§4~7)와 맞춘다.
- **Phase 2와 API 선행:** UI만 장기간 진행하면 DB·API와 충돌하기 쉽다. Phase 2 **초반**에 Core 엔드포인트 목록을 **이름·역할 수준에서라도** 고정하고, 가능하면 mock·최소 구현으로 UI와 연결한다 — PRD **§3.3**, `[NXN] [API]` **§1.1 Core**와 동시에 맞춘다.
- **Phase 1 분할(디버깅):** PRD **§3.2**와 같이 **1a** 도메인 셸·3패널 껍데기 → **1b** 캔버스만 최소 동작으로 나누어, 프레임 이슈와 플로우 이슈를 분리한다.
- **후행 비전(UI 범위 밖):** 다중 자아(Self Facet)·코일 가중치·자연어로 의도 중력(X7) 자동 추론 UI 등은 PRD 부록·향후 확장으로 두고, 본 문서의 **Tier A 필수 레이아웃**에 넣지 않는다(§7.2 MVP 줌·LOD 범위와 함께 본다).
- **Phase Ext:** §6의 TipTap·Ollama·`Terms Inspector`는 **Extension 트랙**(코어 Phase 번호와 분리). API는 동 문서 **§1.1 Extended**, UX·에러 흐름은 `[NXN] [SPEC] NEXA Nexion 확장 프로그램(Extension) 기능 명세.md`(존재 시)를 본다.
- **Tier B:** **NEXA NIXIE 시각 규약(§7.4)**·`nixie_lumina_profile`(SCHM §4)을 DB·테넌트(RLS)와 강하게 묶는 연출·워크스페이스 가드는 플랫폼 배포 단계 — `[NXN] [API]` §10 및 `[NXN] NEXA Nexion 개발 순서와 체크 리스트.md`의 **Phase B-ops**와 정합한다. Tier A에서는 동기화 불일치 등 **클라이언트 파생**으로 NIXIE 연출을 시작해도 된다.

---

## 3. 읽는 순서·용어·빈 상태

### 3.1 권장 읽기 순서

**Vue Flow를 처음 쓰는 구현자** 기준: §4(레이아웃)·§5(소스 트리) → §7.1~7.2(Vue Flow 채택·줌·LOD) → **§7.4~§7.4.1(NIXIE: 캔버스 연출 주체 + 온라인 캐릭터 오버레이)** → §7.5~7.6(임계·엣지) → §6(탐색·편집) → §8~§10(저장·N-PATH·Late Anchoring).

### 3.2 최소 용어

| 용어 | 설명 |
| :--- | :--- |
| **노드(Node)** | 캔버스 위 한 덩어리(카드, 그룹 박스 등). |
| **엣지(Edge)** | 노드 간 연결선. |
| **뷰포트(Viewport)** | 사용자가 보는 캔버스 영역; **줌·팬**은 뷰포트 변환. |
| **드로어** | 좌·우에 붙는 패널(§4.1). |
| **앵커(`anchor_id`)** | 파일·문서를 DB에서 식별하는 ID(N-PATH·API 참고). |
| **Why Chain** | 노드 간 엣지로 형성되는 **인과·족보** 흐름(PRD·§7.6·§10 연결). |

**Vue Flow 공식:** `@vue-flow/core` 기준 [Vue Flow 문서](https://vueflow.dev/) — Getting Started → Nodes → Viewport → Composables(버전별 API는 공식이 최종).

### 3.3 UI 상태·에러·빈 화면

| 상황 | 권장 표현 위치 | 메모 |
| :--- | :--- | :--- |
| 데이터 로딩 중 | 왼쪽 트리·캔버스·우측 패널 각각 | 스켈레톤 또는 스피너; 캔버스는 **고정 높이**로 레이아웃 튐 방지 |
| 아무 노드도 선택 안 함 | 우측 패널 | “노드를 선택하세요” 등 빈 상태 카피 |
| API 실패(`error_code`) | 토스트 + (필요 시) 패널 인라인 | `[NXN] [API]` §2.5·§2.6 과 동일 토큰 |
| 동기화 충돌·낙관적 락 | 중앙 배너 또는 모달 | 사용자 **ASK** 후 재시도 |
| Extension 미설치·비활성 | 해당 탭 | 숨김 vs 비활성+툴팁 — 팀 규칙 하나로 통일 |

---

## 4. 3패널 레이아웃·플랫폼 프레임

NEXA 플랫폼 표준 **좌 / 중 / 우** 만 사용한다(`domainRegistry`의 `left`·`content`·`right`). **좌·우는 드로어 성격**을 벗어나지 않는다.

### 4.1 패널 역할

| 슬롯 | 성격 | 담당 UX(요약) |
| :--- | :--- | :--- |
| **왼쪽** | 탐색·목록·내비 | N-PATH 문서 트리, 고아(Orphaned) 그룹, 캔버스 연동 필터, 워크스페이스·프로젝트 구획 전환(필요 시). **속성 편집·에디터 본문·Vue Flow 본체는 두지 않음.** |
| **중앙** | 주 작업 면 | Vue Flow, 엣지 편집, 무한 줌(§7.2). Extension **문서 편집 탭**(TipTap)은 중앙 **하위**만. |
| **오른쪽** | 선택 대상 상세·부가 도구 | Link ID, 제목, 영문 IR, Late Anchoring·`anchor_id`, 동기화·신뢰도. **Terms Inspector**는 **우측 탭**만. **문서 전체 트리·캔버스 전체 맵은 두지 않음.** |

**`project_id`·구획 전환:** 왼쪽 “워크스페이스·프로젝트 구획 전환”은 DB·RLS 상 **`project_id` 테넌트** 를 바꾸는 UI일 뿐, 플랫폼 **워크플로 프로젝트 엔티티와 동일시하지 않는다** — `[NXN] [PRD]` **§2.1**, `[NXN] [CNCP] NEXA Nexion 지식 OS 관리 및 N-PATH(지도) 설계 철학.md` **§1.2**, `[NXN] [API]` **§2.2.1** 과 정합.

### 4.2 도메인 키·경로·등록

- **도메인 키·경로:** **`nexion`** — 소스 루트 **`NEXA-Platform/src/domains/nexion/`** (기존 `dev` 하위 `dev-tools` 안 배치안은 **채택하지 않음**).
- **등록:** `src/frame/registry/domainRegistry.ts`에 `left` / `content` / `right` → `NexionLeftNav.vue`·`NexionDomain.vue`(셸)·`NexionRightPanel.vue`, `src/frame/router/domainRoutes.ts`에 경로. 패턴은 `nexa-board`, `automation` 등과 동일.
- **백엔드:** NXN REST는 `server/domains/nexion/`(또는 플랫폼 라우팅 규약 동일 패턴).

---

## 5. 소스 코드 디렉터리 구조

### 5.1 `src/domains/nexion/` 권장 트리

**§4.1 성격**을 깨지 않도록 나눈 권장 트리. `modules/core`와 `modules/extension`으로 **Tier A** 와 **Phase Ext** 를 폴더로도 구분한다.

```text
src/domains/nexion/
├── NexionDomain.vue                 # 도메인 진입·인터컴·레이아웃 셸; content 슬롯에 연결
├── views/
│   ├── left/
│   │   └── NexionLeftNav.vue        # 왼쪽: 문서 트리, 고아, 필터, (선택) 구획 전환
│   ├── content/
│   │   ├── NexionContent.vue        # 중앙 셸: 캔버스 vs 편집 탭 스위치
│   │   ├── canvas/
│   │   │   ├── NexionCanvasView.vue # Vue Flow 메인 뷰
│   │   │   ├── NexionFlowToolbar.vue
│   │   │   └── …                    # 줌·미니맵·동기화 배너 등
│   │   └── workspace/               # (선택) 동기화 큐, 타임라인 등
│   └── right/
│       ├── NexionRightPanel.vue     # 오른쪽: 탭 컨테이너(속성 | Terms Inspector | …)
│       └── panels/
│           ├── NodeAttributesPanel.vue
│           ├── SyncHealthPanel.vue
│           └── TermsInspectorPanel.vue
├── modules/
│   ├── core/                        # Tier A — API Core·캔버스·N-PATH 연동
│   │   ├── components/flow/         # 커스텀 노드·엣지 Vue
│   │   ├── composables/             # useNexionCanvas, useSelection, useTraceabilityTree 등
│   │   ├── services/                # nxn API 클라이언트, 동기화 상태 구독
│   │   └── config/
│   └── extension/                   # Phase Ext
│       ├── editor/                  # TipTap 래퍼(중앙 탭에서만)
│       ├── term-extraction/
│       └── composables/
└── …                                # 도메인 상수·테스트. 타입·규격은 §5.4
```

**구조 규칙(요약):**

- **`views/left/`** — 탐색·리스트·필터만. 편집 폼·플로우 노드 정의는 중앙·우측 또는 `modules`.
- **`views/content/`** — 캔버스와(Extension 시) 문서 편집 탭만. TipTap SFC는 `modules/extension/editor/`.
- **`views/right/panels/`** — 속성·앵커·IR·Terms Inspector 탭.
- **서버:** `server/domains/nexion/` — `[NXN] [API]` Core / Extended 경계를 주석 또는 `routes/core`, `routes/extension` 등으로 맞출 수 있음.

### 5.2 `src/engines/` 재사용(참고)

Nexion 캔버스 **SSOT는 Vue Flow**(§7.1). `engines/diagram` 등은 **대체 구현이 아니라** 줌·이벤트·설정 패널 아이디어 **참고용**.

| 상위 폴더 | 참고 예 | Nexion에서의 용도 |
| :--- | :--- | :--- |
| `block/` | NexaBlock, BoardBlock 등 | 필요 시 블록 위젯만 선택 |
| `charts/` | NexaChart 등 | 지식 맵에 차트 붙일 때 |
| `diagram/` | NexaDiagram, `flow/`, `erd/` 등 | **Vue Flow와 역할 구분**(§7.1). 줌·테마만 일부 재사용 |
| `renderers/` | DataCardRenderer 등 | 데이터 바인딩 카드 |
| `services/` | flowManager 등 | 실행·배선 맥락 검토 |
| `tiptap/` | TiptapEditor 등 | Extension 문서 편집 래핑 |
| `sentinel/` | AGENTS.md 등 | 정책 참고 |

### 5.3 `src/system/` 재사용(참고)

| 상위 폴더 | 참고 예 | Nexion 용도 |
| :--- | :--- | :--- |
| `components/ui/` | ExplorerTree, ExplorerViewCard 등 | **왼쪽 드로어** 트리 우선 |
| `composables/` | useDomainIntercom 등 | 인터컴·인증·URL 상태 |
| `schemas/` | Zod 규격 | §5.4, NXN 확장 시 |
| **`types/`** | ids, common | **필수**(§5.4) |
| `utils/` | path-tree-builder 등 | 경로·그래프 |

### 5.4 `system`으로 승격 권장

| 승격 대상(예) | 권장 위치 |
| :--- | :--- |
| 용어 추출 요청/응답 JSON | `system/schemas/` Zod(예: `schemas/nxn/termExtraction.ts`) |
| NXN REST 응답 스키마 | `system/schemas/nxn/` + `system/types`에 `z.infer` re-export |
| NXN API Thin 클라이언트 | `system/services/nxn/` — 도메인 서비스는 UI 조합만 얇게 |
| Ollama/추론 프록시 | `system/services/ai/` 등과 정합 |

`domains/nexion/modules/extension/term-extraction/` 에는 **패널용 composable·로컬 상태**만, **페이로드 형태**는 스키마만 참조.

### 5.5 타입·스키마 필수 규칙

- **`src/system/types/` 필수.** NXN 공용 타입을 `domains/nexion/**/types.ts` 에 새로 만들지 않는다. `system/types/index.ts` 에서 re-export(도메인 내부 `types` 금지 정책과 동일).
- **런타임 검증 경계**는 **`src/system/schemas/` Zod**. 타입은 `z.infer` (**스키마 우선**).
- Nexion 코드에서는 **`@system/types`**, **`@system/schemas/…`** (프로젝트 alias) 로만 import.

---

## 6. 노드·문서 필터·편집·Extension

### 6.1 좌측(Resource Explorer)

- **문서 필터:** 캔버스에서 노드 선택 시, 해당 Link ID와 연결된 문서만 리스트에 노출.
- **계층:** “이하 모든 문서 포함” 등 상위 경로 기준 하위 일괄 표시.
- **고아:** 어떤 노드에도 귀속되지 않은 문서는 **Orphaned** 그룹 최상단. 밀도·배지는 팀 규칙·PRD 체크리스트와 정합.

### 6.2 중앙(Vue Flow & TipTap)

- 좌측에서 문서 클릭 시 TipTap 탭 오픈, 저장 시 원본 파일·메타(`source_hash`) 동기화.

### 6.3 Ollama 핵심 용어 추출(Extension)

- 현재 문서 기준 Ollama 호출 → 핵심 용어·짧은 설명.
- **표시:** 우측 `Terms Inspector`. 자동 반영 금지, 사용자 선택 항목만 삽입.
- **실패:** 1회 재시도 후 ASK 메시지.

상세 계약: `[NXN] [API] NEXA Nexion API 및 통신 규약.md`(HTTP·JSON), 확장 UX는 `[NXN] [SPEC] NEXA Nexion 확장 프로그램(Extension) 기능 명세.md`(문서 존재 시).

---

## 7. Vue Flow 운영 규약

### 7.1 채택 이유·`engines/diagram` 과의 관계

| 질문 | 문서상 답 |
| :--- | :--- |
| Nexion 중앙 캔버스 **단일 SSOT** | **Vue Flow**(`@vue-flow/core`). 새 기능·버그·튜닝은 Vue Flow 기준. |
| `engines/diagram` | **Nexion 캔버스 대체재 아님.** 줌·이벤트·설정 UI **참고만**. 코드 직접 혼합 시 좌표계·상태 이중 유지보수 위험. |
| 초보자 주의 | 노드·엣지는 **데이터 배열 + 반응형**. 공식 **controlled flow** 패턴 권장(§3.2 링크). |

**Phase 1a / 1b:** PRD **§3.2** 분할을 따른다(§2).

### 7.2 계층·줌·LOD·MVP 범위

- **중첩(노드 안의 노드):** 가능. 복합·그룹·부모–자식 계층 — Vue Flow에서는 자식에 **부모 노드 id** 를 지정해 같은 좌표계 안에 배치(공식 parent node / subflow — 버전별 프로퍼티명 확인).
- **줌에 따른 표시 전환:** 뷰포트 **zoom** 을 구독해 자식·라벨 `v-if` / `opacity` / `visibility` 토글, 또는 요약 노드 ↔ 상세 노드 교체.

| 용어(영문) | 한글 설명 | Nexion 연결 |
| :--- | :--- | :--- |
| **Semantic zoom** | 확대할수록 **의미·디테일이 달라지는** 줌(단순 확대 아님). | Fractal Zoom 연출과 같은 계열. |
| **Level of detail (LOD)** | 거리·줌에 따라 표시 **정밀도만** 단계 변경. | 대형 트리에서 성능·가독성. |
| **Hierarchical graph** | 부모–자식 관계 그래프. | N-PATH `depth`·폴더 계층과 개념 정합. |
| **Collapse / expand** | 그룹 내 자식 일괄 숨김·표시. | 줌과 별도 **사용자 제스처**로 조합 가능. |

**구현 단계(권장):** (1) 부모–자식 노드만 동작 (`extent` 등 공식 옵션). (2) zoom 구독 후 임계값을 **상수**로 분리해 튜닝. (3) 자식 수가 매우 많으면 LOD·가상화 검토.

**MVP:** 자연어 LOD·Fit Score·**의도 중력(X7) 자동 추론** 등은 PRD **§3.5**에 따라 코어 필수 범위 **밖**. 초기에는 **수동 줌·팬**, **고정 임계·규칙 기반** LOD만.

### 7.3 노드 유형별 시각화

- **Doc Node:** 문서 아이콘, 파일명(순수 제목).
- **Capability Node:** `nexa.*` 계층을 반영한 도트·블록.

### 7.4 NEXA NIXIE 시각 규약 — 표현 주체

**비언어 시각 피드백 주체는 NEXA NIXIE** 로 고정. **NEXU Canvas** 는 Vue Flow **지도·표면**일 뿐, 연출 주체가 아니다.

| 구분 | 역할 |
| :--- | :--- |
| **NEXU Canvas** | 노드·엣지·뷰포트 **좌표계·캐리어**. |
| **NEXA NIXIE** | Lumina·Jitter 등 **연출 주체**. |
| **`nixie_lumina_profile`** | 자산 단위 발광·떨림 메타 — SCHM §4, Tier B·API §10. |

**표기:** 「**NEXU 캔버스 위에서 NEXA NIXIE가** Jitter·Lumina를 연출한다」 권장. 「NEXU에서 Jitter가 발생」처럼 **표면을 주체로 단정**하는 문장은 지양.

### 7.4.1 플랫폼 오버레이 — 온라인 NIXIE 캐릭터 (`NixieOnlineCharacter`)

**§7.4~7.5** 가 다루는 것은 **Vue Flow 캔버스 위의 노드·엣지**에 붙는 **비언어 연출**(Lumina·Jitter 등)이다. 이와 **별도 축**으로, **온라인 NIXIE** 는 AI 협력 시스템과 사용자 사이 **중간 소통**을 담당하는 **플랫폼 전역 캐릭터**(약 100×100px 슬롯)로 둔다. 구현상으로는 다음과 같이 **연결하면 문서·코드가 맞물린다.**

| 구분 | 내용 |
| :--- | :--- |
| **구현 컴포넌트** | `src/frame/layout/components/NixieOnlineCharacter.vue` |
| **마운트** | `src/frame/layout/MainLayout.vue` — `q-layout` 내부, **`v-if="!isIframeMode"`** 로 전역 셸에만 표시. **`domains/nexion` 이 아니라 frame 레이어**이므로 **모든 도메인**에서 동일하게 떠 있다. |
| **레이아웃 성격** | **푸터·3패널 플로우에 포함하지 않는다.** `position: fixed`, 높은 `z-index`, **뷰포트 오버레이**. |
| **이동** | 사용자가 **드래그**해 화면 내 임의 위치로 옮길 수 있음. 위치는 **`localStorage` 키 `nexa.nixie.online.position`** 에 저장해 새로고침 후에도 유지(구현 세부는 코드 주석 참고). |
| **§7.5 데이터와의 관계** | 캔버스 노드의 Jitter·Lumina는 **노드·traceability·동기화 원장**을 입력으로 한다. `NixieOnlineCharacter`는 **같은 NIXIE 개념**을 **“플랫폼 얼굴”** 로 쓰는 자리이므로, 향후 **`confidence`·동기화 요약·ASK 배너** 등을 **동일 SSOT**에서 파생해 이 컴포넌트(또는 전용 composable)에 주입하면 §7.5와 **충돌 없이** 맞출 수 있다. |
| **SSOT 문서** | 철학·아키텍처: `docs/NIXIE ARCH 닉시 설계도.md`, `docs/NIXIE 지능형 서사 및 감각 처리 통합 규약.md`. |

**한 줄:** **캔버스 = NEXU 표면 + NIXIE가 노드에 그리는 연출**, **`NixieOnlineCharacter` = 온라인 NIXIE 캐릭터 슬롯(전역 오버레이)** — 둘 다 “NIXIE”이지만 **레이어가 다르다.**

### 7.5 Lumina·Jitter·Reddish — 임계·데이터

- **정상:** 신뢰도 임계(기본 95) 이상 → Amber 발광.
- **Jitter:** 신뢰도 미달 또는 **파일 시스템 불일치** → NIXIE가 미세 떨림으로 ASK 유도. 데이터 소스: `nexa_knowledge_traceability_paths` + SCHM §4.4.1 등; `doc_sync_state` 는 보조 가중치(SPEC §2.2·API §10).
- **Reddish:** 부하·Level 0 안전 위반 등.

**수치 SSOT:** UI·API·DB가 동일 임계를 쓸 때 **본 절 95** 를 기준으로 인용한다.

### 7.6 엣지·Why Chain

- **실선:** 사용자 승인(**WILL**) 확정 연결.
- **점선:** AI 제안·검토 중(ECHO·VOID 등 토큰은 PRD·API에서 세분화).

---

## 8. 지능형 문서 편집·저장 (Safe Saving)

1. 기본 **마크다운(.md)** — TipTap 출력을 마크다운으로 저장.
2. 명명 **`[Link ID] [제목].md`** 등 N-PATH 규칙 유지; 제목 변경 시 경로·파일명 동기화.
3. 편집 중에도 `source_hash`·`anchor_id` 추적로 캔버스와 참조 사슬 유지.

### 8.1 TipTap 실시간 반영·Ollama 경계 (기획 SSOT)

**타이핑 → 로컬 UI 반영**과 **Ollama 호출 타이밍**은 `[NXN] [UIUX] Nexion TipTap 편집·실시간 반영 및 Ollama 연동 기획.md` 에서 단정한다. 요지: **로컬 실시간(에디터·탭·선택적 캔버스 라벨 디바운스)** 과 **명시적 트리거의 추출(Ollama)** 을 분리하고, 추출 결과 **자동 삽입 금지**는 §6.3과 동일.

---

## 9. N-PATH 동기화 UI

- **외부 변경 알림:** Doc Sync Crawler 감지 → 캔버스 상단 동기화 대기 큐.
- **가상 재구성:** `is_virtual=true` 고스트로 예고 → **ASK** 후 **WILL** 반영 등 PRD **§2**·SCHM 상태 머신과 정합.
- **타임라인:** `post_state_snapshot` 비교(타임머신 컨트롤러).

---

## 10. Late Anchoring·Why Chain

1. **선 설계(Drawing):** 좌측 DnD 또는 빈 곳 더블클릭으로 카드·Link ID.
2. **후 연결(Late Anchoring):** 우측·DnD로 파일 연결, 정책에 따라 `mv`.
3. **번역 액션:** 영문 IR 생성·수정.

엣지(§7.6)와 함께 **Why Chain** 을 형성한다.

---

## 11. 결론

NEXA Nexion UI/UX는 **기술은 배경으로, 사유는 전면으로** 철학을 따른다. 시각 배치는 **지능적 족보(Traceability)** 로 기록되고, 노드·엣지 **Why Chain** 과 N-PATH·`anchor_id` 가 같은 원장에 수렴한다.

| 이점 | 설명 |
| :--- | :--- |
| **작업 집중** | 노드 선택 시 관련 문서만 필터링. |
| **끊김 없는 왕복** | 설계도(Nexion)와 TipTap 편집 빠른 전환. |
| **데이터 정합** | N-PATH 명명·위치 규약으로 수동 정리 부담 감소. |

---

**상호 참고:** `[NXN] [UIUX] Nexion TipTap 편집·실시간 반영 및 Ollama 연동 기획.md`, `[NXN] [UIUX] Nexion 5대 지능 — Vue Flow·Dagre·ExplorerTree 구현 정리.md`, `[NXN] [UIUX] ① Nexion Database — 스키마·ER(골격) 관리 설계.md`, `[NXN] [UIUX] ② Nexion Identity — 영혼 ID·족보 관리 설계.md`, `[NXN] [UIUX] ③ Nexion Capability — 자격·Tier·Late Anchoring 관리 설계.md`, `[NXN] [UIUX] ④ Nexion Glossary — 용어·언어 라우팅 관리 설계.md`, `[NXN] [UIUX] ⑤ Nexion Narrative — 기획·물리(저장) 관리 설계.md`, `[NXN] [PRD] Nexion 기능과 작업 순서.md`, `[NXN] [API] NEXA Nexion API 및 통신 규약.md`, `docs/NIXIE ARCH 닉시 설계도.md`, `docs/NIXIE 지능형 서사 및 감각 처리 통합 규약.md`.

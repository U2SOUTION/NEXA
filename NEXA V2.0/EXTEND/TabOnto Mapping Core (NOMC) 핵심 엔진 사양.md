# TabOnto Mapping Core (NOMC) · 핵심 엔진 사양

> [!abstract] **이 문서는 무엇인가**
> **TabOnto Mapping Core (NOMC)** 는 WebExtensions **content script**가 웹페이지 본문을 **패시브 스캔**하여, 온톨로지 대비 **지식 3단계 위계**로 분류하고 **Knowledge Heatmap** 시각화·사이드페널 관계 그래프를 만드는 **엔진 사양**입니다.
>
> - **제품·배포 SSOT** → [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브]]
> - **SDK 층:** NOMC 스캔·분류 규칙 = **Core** · `content.js` 실행 = **Host Adapter** — [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브#TabOnto SDK 3층 (UI · Core · Host Adapter)]]
> - **Tab 1~7 파이프라인** → [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인]]
> - **Unknown Scout 철학** → [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브#지식의 확장 · Unknown Scout (언노운 스카우트)]]
> - **Onto-Agent (PIP)** → [[TabOnto 브라우저 NEW Tab 기획 사양서#온토-에이전트 (Onto-Agent) · PIP 차선책]]

> [!note] **네이밍**
> - **NOMC** = **Tab**Onto **M**apping **C**ore *(내부 약칭 · 구 `Nexa-Onto` 명칭 ✗)*
> - **NEXA** 연동은 데이터·메타(`familiarity_score` 등) **동기화**에만 — Extension 엔진 브랜드는 **TabOnto** 계열 유지.

> [!important] **역할 경계 (혼용 금지)**
>
> | 개념 | 역할 | 표면 |
> | :--- | :--- | :--- |
> | **NOMC** | 본문 **자동** 스캔 · 3단계 분류 · Frontier Score · 하이라이트 | `content.js` |
> | **Unknown Scout** | 사용자 **능동** 포착(드래그·더블클릭) · 용어 카드 · Zod 저장 | **Tab 1** |
> | **Onto-Agent** | PIP·Background **플로팅** 에이전트 사출 | newtab · 전역 |
>
> NOMC는 Frontier 후보를 **제안**할 뿐, Unknown Scout를 **대체하지 않습니다**.

---

## 읽는 순서

1. **[[#지식의 3단계 위계 (Knowledge Heatmap)]]** — 확정 · 부채 · 미개척
2. **[[#후속 동작 — Tab 1 · Onto-Agent · Term Forge]]** — 엔진 이후 누가 무엇을 하는지
3. **[[#지각적 피드백 (Knowledge Heatmap UI)]]** — 프리셋 · 대비 렌더링
4. **[[#Tab 2 UI — 상하 2분할 (탐색 · 포커스)]]** — 동일 Tab 2 · 미정/확정 비교
5. **[[#데이터 소스 및 트리거 분리 규격]]** — 소스·트리거·쓰기 경로
6. **[[#Frontier 탐지 파이프라인 · 비용 최적화]]** — 3단 필터 · Frontier Score
7. **[[#수동 포착과 자동 스캔 — 충돌 규칙]]**

---

## 지식의 3단계 위계 (Knowledge Heatmap)

**Knowledge Heatmap** = NOMC가 본문에 그리는 **시각화 모듈명** *(별도 제품명 ✗)*.

웹페이지 본문에서 탐지된 용어는 온톨로지·숙련도 메타에 따라 세 레이어로 분류됩니다. Known/Unknown 철학의 **실무적 세분화**입니다.

| 레이어 | 영문 | 정의 | 시각 처리 |
| :--- | :--- | :--- | :--- |
| **확정** | Confirmed Asset | 온톨로지에 있고 숙련도 높음 | 하이라이트 생략 또는 극히 흐림 |
| **부채** | Knowledge Debt | 온톨로지에 있으나 복습 주기 도래·숙련도 낮음 | **Caution** 강조 → 재학습 유도 |
| **미개척** | Frontier Asset | 온톨로지에 **없음** | **Unknown Glow** — 지적 확장 기회 |

> [!important] **데이터 연동**
> 3단계 구분은 [[NEXA]] 노드의 `familiarity_score` · `last_review_date` *(및 TabOnto 로컬 캐시)* 와 연동합니다. 스키마 정본은 허브 `domains/tabonto` · Zod SSOT를 따릅니다.

---

## 후속 동작 — Tab 1 · Onto-Agent · Term Forge

NOMC는 **「무엇을 강조할지」** 까지입니다. 이후 동선은 아래와 분리합니다.

| 레이어 | NOMC (엔진) | 후속 동작 |
| :--- | :--- | :--- |
| **확정 (Known)** | 인지 부하 최소화 | 에이전트 **개입 ✗** |
| **부채 (Debt)** | Amber 등 Caution 표시 | **Flashcard Agent** · **Milestone Agent** — 복습·연결 제안 ([[TabOnto 브라우저 NEW Tab 기획 사양서#온토-에이전트 (Onto-Agent) · PIP 차선책]]) |
| **미개척 (Frontier)** | Unknown Glow · Frontier Score 상위만 | **Tab 1 제안 큐** — 사용자가 확정 시 **Unknown Scout** 포착 → 이후 **Term Forge** ([[TabOnto 브라우저 NEW Tab 기획 사양서#용어 대장간 (Term Forge): 온톨로지 광역 에디터]]) |

```text
[NOMC 패시브 스캔] → Heatmap · 사이드 그래프
        │
        ├─ Debt ──→ Onto-Agent (복습·이정표)
        │
        └─ Frontier (고득점) ──→ Tab 1 제안 ──[사용자 확정]──→ Unknown Scout ──→ Term Forge
```

---

## 지각적 피드백 (Knowledge Heatmap UI)

사용자는 **시각 테마(Preset)** 를 고르거나, 자산 단계별 **Micro-Customization** 을 적용합니다.

### 표준 프리셋

| 모드 | 스타일 | 특징 |
| :--- | :--- | :--- |
| **A · Highlighter** | 형광펜 | 시인성 최대 |
| **B · Underline** | 밑줄 | 읽기 흐름 방해 최소 |
| **C · Ambient Glow** | 은은한 광채 | 미개척(Frontier)에 적합 |

### Micro-Customization

- **Color** — 확정 / 부채 / 미개척 고유색
- **Opacity / Weight** — 예: 확정 10% · 미개척 100%
- **Indicator** — 첨자 `✓` `!` `?` 표시 여부

| 자산 등급 | 추천 컬러 | 추천 스타일 | 커스텀 범위 |
| :--- | :--- | :--- | :--- |
| **확정** | 무색 / 연한 그레이 | 투명 / 점선 | 색상, 투명도 |
| **부채** | Amber | 형광펜 / 파선 | 색상, 강조 강도 |
| **미개척** | Violet | 글로우 / 실선 | 색상, 글로우 반경 |

### Contrast-Aware Rendering

- **Text Shielding** — 배경 대비 시 보색·1px 외곽선으로 가독성 보호
- **Border-Only Strategy** — 본문 색 변경 없이 밑줄·테두리만
- **Iconic Marker** — 복잡 배경에서 `✓` `!` `?` 첨자 병기

> [!important] **렌더링 철칙**
> 호스트 페이지 `background-color` 를 감지해 **대비비 4.5:1 이상** 을 동적으로 확보합니다.

> [!quote] **엔진의 철칙**
> 피드백은 강요가 아니라, 사용자가 지적 상태를 **스스로 발견**하도록 돕는 힌트여야 합니다.

---

## 사이드페널 · Relationship Mapping

NOMC 탐지 결과는 **[[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인#\[Tab 2\] 온톨로지 맵 탭]]** **상단(2a)** 에 투영됩니다. Focus Mapping(포커스)은 **하단(2b)** — **동일 Tab 2 · 동일 그래프 컴포넌트 · 상하 스택** — [[#Tab 2 UI — 상하 2분할 (탐색 · 포커스)]].

- **동적 군집화** — 현재 페이지 용어를 중심 노드로, 로컬 온톨로지와 **네트워크 그래프** 연결
- **거리 기반 배치** — 확정은 안쪽, 미개척은 외곽 → **지식 영토 경계** 시각화
- **상호작용** — 노드 클릭 → 본문 스크롤 · Debt → Agent 제안 · Frontier → **Tab 1 프리필**

---

## Tab 2 UI — 상하 2분할 (탐색 · 포커스)

> [!abstract] **설계 결정**
> NOMC **탐색**과 Tab 1 기반 **포커스**는 **별도 탭 번호 ✗** — **Tab 2 하나** 안에 **2a · 2b** 두 영역으로 나눕니다.  
> Tab 1에서 **아직 확정하지 않은** 현재 페이지 후보가 있으면 **상·하 2분할**을 기본 노출합니다.

> [!important] **상하 배치 (좌우 ✗)**
> 사이드페널 폭(320~400px)이 좁으므로 2a·2b를 **좌우 분할하지 않습니다**. **상(미정 · 탐색)** · **하(확정 · 포커스)** 를 **동시에** 쌓아 **한 화면에서 비교**합니다. 좌우 탭 전환·2열 그리드 **✗**.

### 레이아웃 (MVP · 상하 스택)

```text
┌─ Tab 2 · 온톨로지 맵 (세로 스크롤) ──────────┐
│ ┌─ 2a · 탐색 · 미정 ─────────────────────┐ │
│ │  NOMC · pageBuffer · Ghost Link         │ │  ← 상단
│ │  (미니 그래프 · 후보 리스트)              │ │
│ ├─ 구분선 · 리사이즈 핸들 (선택) ───────────┤ │
│ ┌─ 2b · 포커스 · 확정 ────────────────────┐ │
│ │  Tab 1 Zod 카드 · ±1-hop Focus Map       │ │  ← 하단
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

| 영역 | 라벨 | 데이터 성격 | 대응 모드 |
| :--- | :--- | :--- | :--- |
| **2a · 상단** | 미정 *(Volatile)* | `pageBuffer` · Ghost Link · Frontier 후보 | **NOMC Relationship Mapping** |
| **2b · 하단** | 확정 *(Persistent)* | Tab 1 **Zod 카드** · ±1-hop | **Focus Mapping** |

- **비교 UX:** 위에서 「이 페이지에서 뭐가 새로운가」를 보고, 아래에서 「이미 내 창고에 어떻게 꽂혀 있는가」를 **스크롤 한 번**으로 대조합니다.
- **높이:** 미확정 있을 때 기본 **상 45% · 하 55%** *(조절 가능 · 2b 최소 높이 보장)*.

### 패널 노출 규칙

| 상태 | Tab 2 기본 화면 |
| :--- | :--- |
| **미확정 후보 있음** *(pageBuffer 비어 있지 않음)* | **상하 2분할** — 2a·2b **동시 표시** · 비교 모드 |
| **미확정 없음** · Tab 1 저장 카드만 | **2b 단독** 전체 높이 *(2a 접힘·숨김)* |
| **Tab 1 저장 직후** | **2b 하단**으로 스크롤 · 방금 저장 노드를 중심 노드로 |
| **페이지 이탈** | 2a `pageBuffer` **폐기** · 2b는 유지 |

### 탐색 → 확정 동선 (Tab 1 경유)

```text
[2a 탐색] Ghost Link 승인 · 노드 클릭
        │
        ▼
[Tab 1] Unknown Scout — 키워드·문맥·카테고리 프리필 → Zod 저장  ← 영구화 SSOT
        │
        ▼
[2b 포커스] 저장된 카드 ±1-hop 미니 맵
        │
        └── (선택) Term Forge · NEXIA Promote
```

> **Tab 2는 저장소가 아닙니다.** 쓰기는 항상 **Tab 1**을 거칩니다. 2a는 **시뮬레이션·제안**만, 2b는 **조회·포커스**만.

---

## 데이터 소스 및 트리거 분리 규격

동일 **그래프 컴포넌트** · 동일 **Tab 2** — **상·하 패널(2a/2b)** 에 따라 소스·트리거·쓰기 권한이 달라집니다.

| 구분 | 2a · 탐색 (NOMC) | 2b · 포커스 (Focus Mapping) |
| :--- | :--- | :--- |
| **모드** | 탐색 · 시뮬레이션 | 조회 · 1-hop 포커스 *(광역 편집은 Term Forge·NEXA)* |
| **데이터 소스** | `pageBuffer` + `ontologyCache` | **Tab 1 Zod 카드** (`chrome.storage` · `domains/tabonto`) |
| **2차 소스 (Phase 2)** | — | NEXA API hydrate |
| **트리거** | 페이지 로드 · **MutationObserver** · **IntersectionObserver**(뷰포트) · 인텐트 변경 | Tab 2 진입 · **Tab 1 저장 완료** · 중심 키워드 선택 |
| **수명** | 탭·페이지 이탈 시 **폐기** | 카드 삭제 전까지 **유지** |
| **쓰기** | ✗ | ✗ *(뷰만)* — 영구화는 **Tab 1** |
| **핵심 목적** | 현재 페이지 **발견 · Ghost Link 미리보기** | 저장 카드 **어디에 도킹되는지** 3초 감각 |

> [!note] **트리거 보출**
> **스크롤 이벤트 직접 연동 ✗** — 비용 과다. 가시 영역은 **IntersectionObserver**로 지연 스캔합니다.

### NOMC 기반 키워드 처리 (2a · 탐색)

1. **후보 나열 (Term Extraction)** — NOMC가 추출한 핵심어를 2a 리스트·그래프에 표시
2. **컨텍스트 매칭 (Contextual Bridging)** — Known이면 부모 Link · Frontier면 Ghost Link
3. **위계 시뮬레이션** — 부모 밑 배치 **미리보기** *(저장 ✗)*
4. **확정 요청** — Ghost Link 승인·노드 클릭 → **Tab 1으로 핸드오프** *(키워드·문맥·제안 부모 프리필)*

### 동기화 · 중복

- **2a** = 실시간 스캔 · **휘발성** — 페이지를 벗어나면 `pageBuffer` 소멸
- **Tab 1 Zod 저장** = **확정의 유일한 관문** — 이후 **2b**에만 반영
- Phase 2: Zod 카드가 NEXA와 sync되어도 **2b 1차 읽기**는 로컬 카드 SSOT 유지

---

## Frontier 탐지 파이프라인 · 비용 최적화

*(구 「언노운 스카우트 분석 로직」— Scout 명칭은 **Tab 1 전용**으로 이관)*

### 단계별 필터링

| 단계 | 비용 | 처리 |
| :--- | :--- | :--- |
| **1 · 로컬 전처리** | Zero | 형태소·TF-IDF 등으로 고빈도 키워드 추출 |
| **2 · 온톨로지 대조** | Low | `chrome.storage` 캐시·로컬 Known 목록과 1차 매칭 → 확정/부채/미개척 분류 |
| **3 · 중요도 판별** | Selective | 미개척 중 **인텐트 유사도** 상위만 [[NEXA]] API·LLM으로 **Frontier Score** 산출 |

### 비용 발생 지점

- **연산** — 전체 DOM 스캔 → **Mutation Observer** 로 변경 구간만 재스캔
- **API** — 의미·관계 추론 → **Hover 시 Lazy Load** *(사용자 관심 후에만)*

> [!important] **Frontier Scoring**
> 모든 미지어를 강조하지 않습니다. **(인텐트 관련성 × 온톨로지 희소성)** 이 임계치를 넘는 용어에만 **Unknown Glow** — 주의력과 API 비용을 동시에 보호합니다.

---

## 수동 포착과 자동 스캔 — 충돌 규칙

Tab 1 **Unknown Scout** 와 NOMC **자동 Heatmap** 이 같은 용어를 동시에 다룰 때:

1. **Tab 1 확정 포착** — 해당 span에 NOMC 자동 하이라이트 **중단** · Scout 카드가 SSOT
2. **Frontier 제안만** — Glow 유지 · 클릭·더블클릭 시 Tab 1 **원클릭 포착** 프리필
3. **옵션 끄기** — NOMC 전역 비활성 시 Unknown Scout·수동 워크플로만 동작
4. **중복 API** — Scout로 이미 카드가 있으면 NOMC 3단계 LLM 호출 **스킵**

---

## 운영 신뢰성 및 예외 처리 (Final Touch)

### 네거티브 피드백 및 화이트리스트
- **노이즈 필터링:** 사용자가 '미개척 자산' 하이라이트를 수동으로 해제(Dismiss)할 경우, 해당 용어는 `Ignore List`에 추가되어 특정 기간 혹은 영구적으로 NOMC 탐지 대상에서 제외됨.
- **도메인별 활성화:** 특정 도메인(예: 금융, 개인 이메일 등)에서는 NOMC의 본문 스캔을 일시 중단하거나 '확정 자산' 표시만 허용하는 화이트리스트 정책 운영.

### 대규모 DOM 및 무한 스크롤 대응
- **Throttling & Debouncing:** 무한 스크롤 사이트(Twitter, YouTube 등)에서 새로운 콘텐츠가 추가될 때, NOMC는 즉시 연산하지 않고 **300ms~500ms의 대기 시간**을 두어 연산 폭주를 방지함.
- **가상화 스캔 (Virtual Scan):** 현재 브라우저 뷰포트에서 상하 1000px 범위를 넘어서는 영역의 연산 결과는 메모리에서 해제하여 성능 유지.

> [!note] **성능 지표 (Target)**
> NOMC 활성화 시 메인 스레드 점유율은 **5% 미만**, 페이지 로딩 지연 시간은 **100ms 이내** 유지를 목표로 함.

## 관련 문서

| 문서 | 역할 |
| :--- | :--- |
| [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브]] | Extension · package · Unknown Scout 철학 |
| [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인]] | Tab 1 Unknown Scout · Focus Mapping |
| [[TabOnto 브라우저 NEW Tab 기획 사양서]] | Onto-Agent · Term Forge · 인텐트 |
| [[TabOnto 지식 밸런서 · 지적 시그니처 규격]] | Signature · Balancer *(Phase 2)* |

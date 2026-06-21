# TabOnto · newtab 기획 사양서 (KickLink 경량 미러)

> [!abstract] **이 문서는 무엇인가**
> **WebExtensions MV3** `chrome_url_overrides.newtab` 표면 — **Tab 7 KickLink 아이콘 subset** · 검색 · 약식 대시보드 · **Agent Dock** · **Knowledge Compass** Zone을 다루는 **초안 기획서**입니다.  
> **풀 KickLink UI(Tab 7)** · **Tab 1~6 파이프라인**은 [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인]] · **기술 SSOT**는 [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브]]를 정본으로 봅니다.  
> **SDK 층:** 본 문서 = **UI** (newtab Zone · 로컬 shell) + 일부 **Host Adapter** (`newtab-bridge.js`) · 데이터 규칙 = **Core** — [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브#TabOnto SDK 3층 (UI · Core · Host Adapter)]]
> **지식 밸런서 · 지적 시그니처** 용어는 [[TabOnto 지식 밸런서 · 지적 시그니처 규격]] **정본**입니다.

> [!note] **문서 상태 — 초안**
> 아래 내용은 **확정 사양 ✗** · 아이디어·후보·비평을 **한곳에 모아 둔 것**입니다.  
> MVP로 이미 방향이 잡힌 부분(하이브리드 newtab · KickLink 미러)과, **Phase 2 이후 검토할 확장 아이디어**를 구분해 읽어 주세요.

> [!important] **크로스 브라우저**
> newtab override는 **Chromium · Firefox 공통 키**이나 **정책·로드 타이밍**이 브라우저별로 다릅니다.  
> 그래서 **로컬 HTML + API hydrate**를 우선하고, 풀 iframe 로드는 **지연**합니다 — [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브#WebExtensions · 크로스 브라우저 타깃]]

---

## 읽는 순서

0. **[[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브#TabOnto SDK 3층 (UI · Core · Host Adapter)]]** — *(처음)* UI·Core·Adapter  
1. **[[#newtab vs 사이드페널 — 역할 분리]]** — 두 표면이 무엇을 나누는지  
2. **[[#newtab 레이아웃 (SSOT)]]** — Zone · Phase · Z3 Dock · Z7 Compass  
3. **[[#확장 아이디어 — newtab 대시보드]]** — 맥락 복원 · 의도 · Resonance 등 **후보**  
4. **[[#사이드페널과의 연동 시나리오]]** — Capture ↔ Synthesize · Plan ↔ Guide  
5. **[[#기술 검토 — 영속성 · PIP]]** — Background · **Onto-Agent** PIP 차선책  
6. **[[#확장 컴포넌트 후보군]]** · **[[#무엇을 할 것인가]]** · **[[#하지 말아야 할 것]]**

---

## newtab vs 사이드페널 — 역할 분리

newtab과 사이드페널은 **같은 KickLink 데이터**를 공유하지만, **화면에 보여 주는 깊이**가 다릅니다.

| 표면 | KickLink | Onto-Agent | 편집 | SSOT |
| :--- | :--- | :--- | :--- | :--- |
| **side_panel / sidebar_action** | Tab 7 **풀 UI** — 리스트 · 메타 · 정렬 | **운영** — `🤖(n)` HUD · pause · dismiss · *(P2)* Agents 탭 | ⭕ | KickLink · **Parent Context** |
| **newtab** | **아이콘 only** — 일부 KickLink · 사용률 반영 | **조망·시작** — **Agent Dock** *(P2+)* · PIP 본체는 **스택 밖** | ✗ *(차후)* | 동일 KickLink · 에이전트 **읽기 미러** |

유저 KickLink와 시스템 KickLink는 **동일 아이콘**을 쓰고, **보더 색**만으로 구분합니다 — [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인#Tab 7]]

> **한 줄:** 사이드페널에서 **키우고·운영**하고, newtab에서는 **스치듯 보고·세션을 시작**한다.

---

## newtab 레이아웃 (SSOT)

> **원칙:** newtab = **「어디로 갈지」** — **Z1 검색 · Z2 KickLink 상단** · 부가 Zone은 **아래·접힘** · 로컬 HTML + API hydrate · iframe **지연**  
> **P1(MVP):** 코드 고정 **Z1·Z2·Z5** · **P2+:** ⚙️ **Group 7** 프리셋·Zone 선택 — [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인#Group 7 · newtab 표시 (Zone 노출)]]

### Zone 마스터 표

| Zone | 컴포넌트 | Phase | 디폴트 | 접기 | 사이드페널 대응 | 핵심 동작 |
| :---: | :--- | :---: | :--- | :---: | :--- | :--- |
| **Z0** | 테마 | P1 | 선택 | — | ⚙️ Group 4 | 미니멀 배경 |
| **Z1** | `SearchBar` | **P1** | **최상단** | — | — | URL · 쿼리 |
| **Z2** | `KickLinkStrip` | **P1** | 항상 | — | Tab 7 풀 | 아이콘 subset · 보더 색 |
| **Z3** | `AgentDock` | P2+ | 접힘 | ⭕ | `🤖(n)` **운영** | 11종 조망 · 사출 *(정책 ✗)* — [[#Z3 · Agent Dock]] |
| **Z4** | `Intent` · `WhereILeftOff` · `Milestone` | P2+ | Z1 아래 | ⭕ | Sticky Intent | SW 동기화 |
| **Z5** | `#tabonto-recent-cards` | **P1** | 항상 | — | Tab 1 | 카드 hydrate |
| **Z6** | `TermForge` | P2+ | 조건부 | — | Tab 2 | 미배치 시 DnD |
| **Z7** | `KnowledgeCompass` | P2+ | 하단 | ⭕ | Tab 3 | L1~L4 미러 — [[#Z7 · Knowledge Compass]] |
| **—** | PIP · PiP | P2+ | 전역 | — | SSOT | Z3에서 트리거 |

### Phase별 노출

| Phase | 노출 Zone | 비고 |
| :--- | :--- | :--- |
| **P1** | Z1 · Z2 · Z5 *(고정 · Group 7 ✗)* | 항해 중심 |
| **P2** | + **Group 7** 프리셋 · Z3·Z7 접힘 한 줄 가능 | 신규 기본 프리셋 **미니멀** 권장 |
| **P2+** | + Z3 펼침 · Z4 · Z6 · Z7 펼침 | Dock 첫 방문 11종 브리핑 1회 |
| **P3 *(후보)*** | 그리드 + Zone **DnD** | Group 7과 연동 · `newtabLayout.v1` |

**package:** `newtab/newtab.html` · `newtab-dashboard.js` · `newtab-bridge.js` · `widgets/agent-dock.js` · `widgets/knowledge-compass.js` · *(P3)* `newtab-layout.js` — [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브#② NEXA-TabOnto-package/ — WebExtensions MV3]]

### Z3 · Agent Dock

| | **newtab Z3** | **사이드페널 `🤖(n)`** |
| :--- | :--- | :--- |
| **역할** | 조망 · 빠른 사출 | pause · dismiss · PIP 포커스 |
| **펼침 구성** | 활성 칩 → 11종 아이콘 → 빠른 액션 2~3 → ⚙️ 링크 | 슬라이드오버 목록 |
| **규칙** | 접힘 디폴트 · 첫 방문만 그리드 브리핑 · 정책 편집 **✗** | Parent Context **쓰기 SSOT** |

### Z7 · Knowledge Compass

> Tab 3 미러 · **증명서·숙련도 % ✗** — [[TabOnto 지식 밸런서 · 지적 시그니처 규격#지적 프로필 4-레이어 개념 모델]]

| Layer | 위젯 | 시각화 | 클릭 | SSOT 금지 |
| :---: | :--- | :--- | :--- | :--- |
| **L1** | DynamicsStrip | BalanceStrip / AxisRadar Mini | Tab 3 | 레이더 이중 노출 ✗ |
| **L2** | CirculationFlow | Flow Arc + 큐 칩 *(0~3)* | Tab 1/2/2b/3 | Mastery % · 소화율 KPI ✗ |
| **L3** | SignatureOutline | 점선 윤곽 · `Live`/`Stable` 탭 | Tab 3 | L2→axes 합산 ✗ |
| **L4** | ResonanceStrip | **Resonance Glow** + **Emerging Nodes** *(Collective Pulse)* | Tab 4/7 | 피드 · visibility 0 숨김 · 랭킹 ✗ |

| Z7 상태 | UI |
| :--- | :--- |
| **접힘** | `지식 균형 · 순환 N건` 한 줄 |
| **펼침** | L1~L4 행 · 행 클릭 → Tab 3 딥링크 |

**API:** `GET /tabonto/profile/signature` · `GET /tabonto/profile/digestion`

---

## 확장 아이디어 — newtab 대시보드

> [!tip] **Phase 2+ 후보**
> MVP 이후, newtab을 **「지식 공장의 설계실」**로 넓혀 갈 때 검토할 아이디어입니다.

### 인지적 재시작: "Where I Left Off" (맥락 복원)

- **기능:** 어제 작업하다 닫은 탭들과 수집했던 **용어 자산**을 시각적으로 브리핑합니다.
- **가치:** "내가 무엇을 하고 있었지?"라는 인지 부하를 줄이고, 즉시 몰입 상태로 진입하게 돕습니다.

### 의도 설정: "Intent First" (선언적 서핑) *(Phase 2+ · Z4)*

- **기능:** **검색·KickLink 다음**(Z4)에 오늘의 학습 목표나 작업 의도를 한 줄 적습니다 — **검색 상단(Z1)을 가리지 않음**.
- **가치:** 무분별한 도파민 서핑을 방지하고, 입력된 의도는 **사이드페널 상단**에 고정되어 서핑 내내 가이드 역할을 합니다.

### Onto-Agent · Agent Dock *(Phase 2+ · Z3)*

- **기능:** newtab **Z3 Agent Dock** — KickLink **바로 아래** · 11종 **시각 조망** · 활성 `n` · 빠른 사출. 사이드페널 `🤖(n)` 과 **별도 접근 창구**이나 **쓰기 SSOT는 사이드페널 동일**.
- **가치:** **항해(Z1·Z2) 다음** 부속 층 — [[#Z3 · Agent Dock]]

### 지적 시그니처 미러 & Resonance *(Phase 2+ · Z7)*

- **기능:** **Z7 Knowledge Compass** — Tab 3 미러 · [[TabOnto 지식 밸런서 · 지적 시그니처 규격#지적 프로필 4-레이어 개념 모델]] · Resonance·**Collective Pulse**는 Signature와 **분리** — L4 **Intersection / Gap Analysis** · [[TabOnto 지식 밸런서 · 지적 시그니처 규격#L4 · Social — Resonance · Collective Pulse]]

---

## 사이드페널과의 연동 시나리오

newtab과 사이드페널은 **한쪽만 쓰는 도구가 아니라**, 서로의 맥락을 이어 주는 **쌍**으로 설계합니다.

### Capture → Synthesize (수집 → 조립)

**사이드페널(Capture) → newtab(Synthesize):**  
사이드페널에서 수집한 파편화된 용어들을 newtab의 넓은 화면에서 **드래그 앤 드롭**으로 배치하며 온톨로지 관계를 설정합니다.

### Plan → Guide (의도 → 필터)

**newtab(Plan) → 사이드페널(Guide):**  
newtab에서 설정한 오늘의 **집중 키워드**가 사이드페널에 필터로 작동하여, 관련 없는 정보는 가리고 핵심 정보만 강조(Highlight)합니다.

### 시작 경험 · 영속 서비스 (연동 고도화 후보)

**사용자 시작 경험 (Start-up Experience)**

- **인텐트 앵커링(Intent Anchoring):** newtab에서 선언한 '오늘의 목표'를 사이드페널 최상단에 동기화하여 서핑 중 **컨텍스트 유지**를 돕습니다.
- **지식 브리핑:** 미완성 용어·복습 도래 노드를 **Z4·Z5**에 배치 *(Z1 검색은 유지)* — 학습 연속성.

**영속성 서비스 레이어 (Persistent Services)**

- **백그라운드 미디어 제어:** 뮤직 플레이어 및 타이머 로직을 Service Worker에 격리하여 탭 전환과 무관한 **심리스(Seamless) 경험**을 제공합니다.
- **Onto-Agent (PIP):** 사이드페널의 좁은 뷰포트를 극복하기 위해, 온톨로지·인텐트에 반응하는 에이전트를 **PIP 윈도우**로 분리 사출하여 전 브라우저 영역에 플로팅합니다 — [[#온토-에이전트 (Onto-Agent) · PIP 차선책]]

> [!quote] **아키텍트 메모 — Flow**
> "newtab은 **먼저 어디로 갈지**(검색·KickLink)를 열어 주고, 그 다음에 **흐름을 설계**(Intent·에이전트)합니다. 사이드페널은 흐름을 **유지**하는 곳입니다."

---

## 기술 검토 — 영속성 · PIP

> [!note] **Onto-Agent 상세**
> PIP 한계·차선책·에이전트 라인업·생명주기는 **[[#온토-에이전트 (Onto-Agent) · PIP 차선책]]** 정본입니다.

### 사이드페널 vs newtab의 영속성 한계

- **사이드페널:** 브라우저 창을 이동해도 유지되지만, 좁은 폭 때문에 복잡한 UI(일정 관리, 대형 플레이어)를 담기엔 답답합니다.
- **newtab:** 넓은 화면을 쓰지만, 다른 페이지로 이동하면 사라지는 **휘발성**이 단점입니다.

### 서비스 영속성 해결책: Background API + Onto-Agent (PIP)

- **뮤직 플레이어 & 일정 관리:** UI는 newtab과 사이드페널 **양쪽**에 두되, 실제 로직은 **Service Worker(Background Script)**에서 구동합니다. 탭을 닫아도 음악이 끊기지 않습니다.
- **Onto-Agent · PIP:** 영상·타이머·이정표 등 에이전트 UI를 PIP로 분리 사출 — 브라우저가 허용하는 범위 안에서 **탭 전환 후에도 맥락 유지**. API별 한계와 우회는 Onto-Agent 절을 봅니다.

---

## 확장 컴포넌트 후보군

> [!abstract] **TabOnto Maximum Expansion**
> MVP 이후 단계적으로 검토할 **컴포넌트 아이디어**입니다. 아래 항목은 **전부 채택 ✗** · 우선순위는 [[#하지 말아야 할 것]]과 [[#무엇을 할 것인가]]에서 다시 거릅니다.

### 지식 아키텍처 (Knowledge Architecture)

- **인텐트 앵커 (Intent Anchor):** newtab **Z4**에서 입력한 '오늘의 탐구 목표'가 사이드페널 상단에 상주하며, 관련 없는 웹페이지 접속 시 경고 알림.
- **용어 대장간 (Term Forge):** 사이드페널에서 수집한 파편적 단어들을 newtab의 캔버스에 드래그하여 **온톨로지** 관계(부모/자식/관련)를 설정하는 비주얼 에디터.
- **RAG 컨텍스트 브릿지:** 현재 보고 있는 페이지와 가장 유사한 과거의 노드를 사이드페널이 자동 소환하여 "이전에 배운 A와 연결해 볼까요?"라고 제안.

### 영속성 · 생산성 (Persistence & Productivity)

- **Onto-Agent · PIP 스테이션:** … — [[#온토-에이전트 (Onto-Agent) · PIP 차선책]] · **Z3 Agent Dock**
- **백그라운드 포커스 비트:** 학습 집중력을 높이는 Lo-fi 음악 및 화이트 노이즈 플레이어 (Service Worker 구동 — 탭 전환 시 끊김 없음).
- **마이크로 타이머:** 특정 키워드 탐색에 할애할 시간을 설정하고, 사이드페널 하단에 잔여 시간을 시각화.

### 사회적 지능 (Social Intelligence)

- **지식 밸런서 · SignatureMini:** Tab 1~2 → **Z7 Compass** — [[#Z7 · Knowledge Compass]] · [[TabOnto 지식 밸런서 · 지적 시그니처 규격]]
- **Resonance Radar:** 현재 페이지와 **익명화된 집단 관심** — **내 Signature와 UI·데이터 분리**.

---

## 무엇을 할 것인가

> [!check] **지향점**
> newtab은 화려한 포털이 아니라, **지식을 자산으로 만드는 동선**의 **출발점·조립대**입니다.

### 데이터 순환 구조 (Data Loop)

1. **[newtab]**에서 **검색·KickLink(Z1·Z2)** 로 항해를 시작하고, *(P2+)* **Z4**에서 의도를 세웁니다.
2. **[사이드페널]**에서 원자적 용어를 포착(Capture)합니다.
3. **[newtab]**에서 지식의 구조(Ontology)를 조립합니다.
4. **[[NEXA]]**로 최종 승격(Promote)하여 영구 자산화합니다.


<!-- ... Z1 · Global Search 섹션 수정 ... -->

### Global Search 및 지능형 서제스트

- **검색 실행:** **Direct Query Redirection** (Google Search URL 파라미터 활용).
- **서제스트 엔진 (Internal Suggest Engine):**
    - **Local Vault Match:** 보관함 내 **노드 제목, 태그, 엣지** 키워드를 실시간 매칭.
    - **Contextual Priority:** 현재 **L3 시그니처**의 우세 축과 연관된 키워드를 상단 배치.
    - **Recency & Debt:** 최근 수집했거나 **L2 소화 루프**에서 정체된(Debt) 노드를 우선 제안하여 재학습 유도.
- **UX 전략:** 사용자가 타이핑할 때 **[내 지식]**과 **[웹 검색]** 영역을 분리하여 표시.

> [!important] **설계 핵심: 0ms 레이턴시**
> 모든 서제스트 데이터는 로컬 인덱스(IndexedDB 등)에서 즉시 추출하여 네트워크 지연 없이 즉각적인 반응성을 제공합니다.



### 핵심 컴포넌트 및 NEXA 연동 흐름 (초안)

| 컴포넌트                       | 위치                         | 핵심 기능                          | NEXA 연동 가치       |
| :------------------------- | :------------------------- | :----------------------------- | :--------------- |
| **인텐트 앵커**                 | newtab ↔ 사이드페널             | 오늘의 학습 목표 동기화                  | 목표 달성률 데이터 전송    |
| **용어 대장간**                 | newtab (Wide)              | 드래그 앤 드롭 온톨로지 설계               | **지식 그래프** 구조 확정 |
| **Onto-Agent**             | newtab **Z3 Dock** ↔ 사이드페널 `🤖` · PIP · Background | KickLink **아래** 조망·사출 vs **운영** 분리 | NEXA Nixie 상주 통로 |
| **지식 밸런서 / SignatureMini** | newtab **Z7** ↔ 사이드페널 Tab 3             | **지적 시그니처** · **지식 균형** 미러     | 상보 매칭 · NEXA 프로필 |

### 인텐트 앵커(Intent Anchor) 상세 동선

> [!ABSTRACT] **의도 동기화 로직**
> 1. **Capture:** 검색(Z1) **아래** Z4 `Intent-Input`에서 목표 수신 *(P2+)*.
> 2. **Broadcasting:** Service Worker가 모든 사이드바 뷰포트에 해당 Intent 전송.
> 3. **Contextual Filtering:** 사이드바 내 **[[Tab 1~6]]** 활동 시 Intent와 유사도가 낮은 노이즈는 불투명도 조절로 제거.

#### 지능형 이정표(Milestone) 기능
- **인지적 스냅샷:** 새 탭 재진입 시, 마지막으로 닫았던 탭의 핵심 키워드와 현재 인텐트의 연관 지도를 시각화하여 **'맥락 복원 시간'**을 최소화한다.

> [!CHECK] **아키텍트의 비평**
> "인텐트 앵커는 사용자를 감시하는 것이 아니라, 사용자의 **'지적 망상(Focus)'**을 보호하는 방어막입니다. **검색(Z1)은 막지 말고**, Z4에서 '무엇을 하고 있었는지'를 보여 주어 **심리적 연속성**을 확보하십시오."


### 인텐트 앵커: 의도와 행동의 선순환 아키텍처

#### 1. 의도의 사출 (New Tab → Background)

- **선언적 입력:** 사용자가 **Z4 Intent Field**에 목표(예: "React Server Component 아키텍처 분석")를 입력합니다 — **Z1 검색·Z2 KickLink는 그 위에 유지**.
- **컨텍스트 빔(Context Beam):** 입력과 동시에 이 데이터는 **Service Worker**를 통해 전역 상태로 관리되며, 현재 브라우징의 **'필터링 기준값'**으로 설정됩니다.

##### 2. 집행 가이드 (Side Panel: Anchor)

- **상단 고정(Sticky Intent):** 사이드바 최상단에 현재 목표가 상주합니다. 이는 사용자가 도파민에 이끌려 딴짓을 할 때마다 **인지적 제동**을 거는 역할을 합니다.
- **맥락 기반 하이라이트:** 수집되는 모든 용어 중 현재 '인텐트'와 관련도가 높은 항목에 별도의 시각적 강조(Glow 효과)를 주어, 자산화의 우선순위를 자동 제어합니다.

##### 3. 지능형 이정표 (Next Tab: Resumption)

- **재진입 브리핑:** 사용자가 새 탭을 열면 **Z1 검색은 즉시 사용 가능**하고, Z4 **작업 현황판**이 그 아래 펼쳐집니다.
    - **"어디까지 왔나":** "현재 목표와 관련된 용어 5개를 수집했습니다. 구조화가 40% 진행되었습니다."
    - **"무엇을 더 해야 하나":** 아직 해결되지 않은 질문(Tab 5)이나 미연결 노드들을 **'다음 할 일(Next Actions)'** 리스트로 제안합니다.


### 용어 대장간 (Term Forge): 온톨로지 광역 에디터

> [!info] **데이터 연결성 (Bridge)**
> [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인]]에서 포착된 단어들은 자동으로 이 캔버스에 **'미배치 노드'**로 대기합니다.

- **심리스 확장 (Scale-out):** 사이드페널의 좁은 뷰포트에서 처리하기 힘든 3개 이상의 다중 관계(Multiple Inheritance)나 복잡한 지식 그래프를 새 탭의 넓은 화면에서 **드래그 앤 드롭**으로 재배치합니다.
- **원자적 수집 → 체계적 승격:** 
    - **Side Panel:** 서핑 중 즉각적인 용어 등록 및 1:1 부모-자식 관계 설정.
    - **New Tab (Forge):** 수집된 용어들의 군집(Clustering)을 확인하고, [[NEXA]]로 승격시키기 전 최종적인 **지식 체계(Ontology)**를 확정.
- **시각적 트리거:** 사이드페널에 미분류 용어가 쌓이면 새 탭 진입 시 '정리가 필요한 지식 자산' 알림을 통해 사용자를 대장간으로 유도합니다.

| 컴포넌트 | 위치 | 핵심 기능 | NEXA 연동 가치 |
| :--- | :--- | :--- | :--- |
| **용어 대장간** | newtab (Wide) | **사이드페널 맵의 확장판** · 광역 온톨로지 설계 | **지식 그래프** 최종 구조 확정 및 저장 |

- **벡터 기반 자동 클러스터링 (Auto-Scaffolding):** 
    - 수집된 용어들은 **임베딩(Embedding) 엔진**을 통해 의미적 유사도에 따라 캔버스 위에 자동으로 군집화됩니다. 
    - 엔진은 명시적 연결(Edge) 대신, 유사한 용어들을 가까이 배치하는 **'중력 기반 레이아웃'**을 먼저 제안합니다.
- **잠재적 연결선 (Ghost Link):** 
    - 시스템이 판단한 높은 확률의 관계는 점선(Ghost Link)으로 표시됩니다. 사용자는 이 점선을 클릭하거나 노드를 겹치는 것만으로 **'확정된 온톨로지'**로 승격시킬 수 있습니다.
- **수동 보정 및 구조 확정:** 
    - 엔진이 놓친 맥락은 사용자가 직접 드래그하여 연결하며, 이 행위는 다시 피드백 데이터가 되어 향후 **개인화된 연결 추천**의 정확도를 높입니다.

> [!tip] **엔진의 역할 정의**
> "엔진은 사용자가 백지에서 시작하지 않도록 **'밑그림'**을 그려주는 역할에 집중합니다. 실제 지식의 위계는 사용자의 **지적 판단**을 거쳐 [[NEXA]]에 저장될 때 비로소 완성됩니다."


---

### 온토-에이전트 (Onto-Agent) · PIP 차선책

> [!abstract] **개념 정의**
> [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인]]의 온톨로지를 엔진 삼아, 사용자의 브라우징 맥락·인텐트에 따라 **자율적으로 사출(Spawn)** 되고 상호작용하는 **지능형 독립 객체**입니다.  
> 사이드페널·newtab의 좁거나 휘발적인 뷰포트를 벗어나, 필요한 지식 컴포넌트를 브라우저 전역에 **PIP(또는 차선 UI)** 로 띄워 **흐름을 끊지 않습니다**.  
> *(구 **Knowledge Cast** 개념은 본 절에 통합 — 별도 레이어 명칭 ✗)*

#### 브라우저 한계와 PIP 차선책

WebExtensions MV3 환경에서는 **OS급 Always-on-Top 창**이나 **브라우저 완전 종료 후 상주**를 Extension만으로 보장할 수 없습니다. Onto-Agent는 아래 한계를 인정한 뒤 **단계적 차선책**으로 극복합니다.

| 한계 | 증상 | Onto-Agent 차선책 |
| :--- | :--- | :--- |
| **사이드페널 폭** | 일정·플레이어·그래프를 담기 어려움 | 에이전트 UI를 **PIP / Document PiP** 로 분리 사출 |
| **newtab 휘발성** | 다른 탭 이동 시 대시보드 소실 | **Background SW** + 사이드페널 SSOT — 에이전트 **상태·정책**은 패널에 보관 |
| **PIP API 제약** | 기본 PiP는 **`<video>`** 중심 · 커스텀 UI는 브라우저별 상이 | **미디어 에이전트:** `HTMLVideoElement.requestPictureInPicture()` · **비디오 외 UI:** Chromium **Document Picture-in-Picture API** 우선 · 미지원 시 **고정 오버레이( content script 패널)** |
| **Service Worker 수면** | MV3 SW 비활성 시 타이머·오디오 끊김 | **오디오·포커스 타이머:** `offscreen` document 또는 **사용자 제스처로 연장된 SW 알람** · 장시간 세션은 **NEXA API**에 하트비트 |
| **크로스 탭 동기화** | PIP 창과 사이드페널 이원화 | **`runtime.connect` / BroadcastChannel** — 조작·데이터 SSOT는 **항상 사이드페널** |
| **브라우저 종료** | PIP·세션 즉시 소멸 | **인텐트 앵커 + 에이전트 스냅샷**을 `chrome.storage` · NEXA에 저장 → 재기동 시 **복구 제안** |

```text
[온톨로지·인텐트] → Background (정책·스폰 판단)
        ↓
  사이드페널 (SSOT · Cast Edge)
        ↓
  PIP / Document PiP / 오버레이 폴백  ←── 탭 전환해도 맥락 유지
        ↓
  NEXA 타임라인 · 세션 복구
```

> [!important] **차선책의 원칙**
> Extension은 **가볍게 정찰·사출**하고, 브라우저가 막는 영역(진짜 OS 플로팅·장시간 무중단·고부하 미디어 처리)은 **선택적 Python 동반 앱**으로 넘깁니다.

#### Python 동반 앱 (선택 · Opt-in)

사용자가 원할 경우 **로컬 Python 설치 앱**을 추가로 제공합니다. Extension과 **동일 Onto-Agent 정책·온톨로지**를 NEXA API로 동기화하며, PIP로 닿지 않는 영역을 **완성된 데스크톱 툴**로 보완합니다.

- **OS 네이티브 플로팅 창** — Document PiP 한계 없는 Always-on-Top UI
- **브라우저 최소화·다중 모니터** 환경에서도 에이전트 상주
- **고부하 캡처·배치 처리** — 영상 구간 분석·임베딩 등 Extension SW 부담 분리

> 브라우저 Extension = **Unknown Scout · 경량 사출** / Python 앱 = **Known · 집중 작업대** — 둘 다 쓰지 않아도 되며, **사용자 선택**입니다.

#### 에이전트 설계 · 생명주기

- **에이전트 제작 (Agent Crafting):** 트리거(온톨로지 유사도·인텐트 키워드), 데이터 소스, 시각 형태·PIP 모드를 사용자가 정의하거나 커스텀 모듈로 확장.
- **자율 파견 (Ontology-Driven Spawning):** 활성 탭·인텐트 분석 → 임계치 초과 시 **Cast Edge** 생성 → 해당 에이전트 PIP 사출.
- **수동 보정:** 사용자가 배치·내용을 수정하면 **판단 정책(Policy)** 에 즉시 피드백.
- **상태 기반 소멸:** 인텐트 달성·온톨로지 정리 완료 시 에이전트가 스스로 닫혀 시각 노이즈 최소화.

##### PIP 생명주기 · 세션 복구

- **트리거 이원화:** 에이전트 뷰는 **newtab(광역)** · **사이드페널(국소)** 어디서든 호출 가능. **관리 주체(Parent Context)** 는 항상 사이드페널.
- **상태 동기화:** PIP 창 ↔ 사이드페널 상시 채널 — 어느 쪽에서 조작해도 **단일 SSOT** 즉시 갱신.
- **복구 자동화:** 브라우저 재시작 시 **인텐트 앵커 + 마지막 에이전트 스냅샷**으로 작업 복귀 속도 극대화.

#### Onto-Agent 라인업

| 에이전트 | 역할 | PIP·UI 전략 |
| :--- | :--- | :--- |
| **미디어 큐레이터 (Media Agent)** | 영상 내 지식·자막·핵심 프레임 캡처 → 사이드페널 전송 | `<video>` **표준 PiP** |
| **마일스톤 가드 (Milestone Agent)** | 인텐트 달성률·수집 용어 수 실시간 피드백 | **Document PiP** 또는 컴팩트 오버레이 |
| **데드라인 워치 (Deadline Agent)** | 다음 일정까지 남은 시간·태스크 마감 압박 | Document PiP · 타이머는 Background |
| **포커스 브레이커 (Focus Agent)** | Pomodoro 세션 · 종료 시 요약 유도 | 오디오는 offscreen/SW · UI는 PiP |
| **시그니처 미러 (Signature Agent)** | **지적 시그니처** 미니 투영 | Document PiP · [[TabOnto 지식 밸런서 · 지적 시그니처 규격]] |
| **온톨로지 가이드 (Bridge Agent)** | Ghost Link · 잠재 연결점 제안 | 오버레이 · 사이드페널 하이라이트 연동 |
| **용어 대기열 (Terminology Stack)** | 미분류 용어·지식 부채 시각화 | 사이드페널 우선 · 필요 시 PiP |
| **앵커 텍스트 (Pinned Fragment)** | 요약문·코드 스니펫 고정 | PiP 또는 고정 오버레이 |
| **포커스 비트 (Focus Beats)** | Lo-fi·화이트 노이즈 | Background 오디오 전용 |
| **지식 카드 (Flashcard Agent)** | 복습 주기 도래 단어 무작위 Recall | Document PiP · **인지적 자극** |
| **동적 브레드크럼 (Breadcrumb Agent)** | 탐구 주제의 상·하위 온톨로지 경로 | newtab·PiP 미러 |

> [!tip] **에이전트 설계 원칙**
> 1. **Context First** — 사용자가 부르기 전에 온톨로지가 먼저 반응할 것.  
> 2. **Adjustable Autonomy** — 자동 생성되되 최종 결정권은 사용자.  
> 3. **Interaction Minimum** — PIP는 **보기(Viewing)** 중심 · 입력은 사이드페널로 환류.  
> 4. **Modularity** — 에이전트별 독립 스크립트 · 상호 간섭 최소.  
> 5. **User-Programmable** — Policy 직접 수정 가능.  
> 6. **Data Linkage** — PIP 상호작용은 즉시 [[NEXA]] 타임라인에 축적.  
> 7. **비침습적 점유** — 최소 면적 · 투명도 조절 · 주업무 방해 ✗.

#### 구현 우선순위 · 아키텍트 메모

1. **미디어 (YouTube) Agent** — 표준 PiP로 검증 비용 최소.  
2. **타이머 · 이정표 Agent** — Background + Document PiP.  
3. **newtab Agent Dock (Z3)** — KickLink **아래** · Phase 2 접힘 한 줄 → P2+ 그리드.
4. **SignatureMini Agent** — Phase 2+ · Balancer SSOT · Dock·Z7 연동.  
5. **일정 PiP화:** 전체 캘린더 ✗ → **다음 일정까지 N분** 데드라인 워치가 효과적.  
6. **Flashcard Agent** — 복습 루프와 Unknown Scout 수집을 연결.

> [!quote] **아키텍트 메모**
> "Onto-Agent는 기능 목록이 아니라 **흐름을 끊지 않는 부속 장기**입니다. 브라우저가 허용하는 곳까지 PIP로 가고, 한계에 닿으면 **사이드페널 SSOT**와 **선택적 Python 앱**으로 이어갑니다."

#### Onto-Agent 관리 UI (사이드페널)

> [!important] **Tab 8 비채택**
> Onto-Agent는 **지식 파이프라인(Tab 1~7) 다음 단계가 아님**. 탭 번호를 늘리지 않고 **3층**으로 관리합니다.

| 층 | 빈도 | MVP | Phase 2 |
| :--- | :--- | :--- | :--- |
| **A · 전역 정책** | 가끔 | **⚙️ 세팅 Group 6** | Policy 슬라이더 · Python 페어링 |
| **B · 런타임** | 자주 | **Header `🤖(n)`** 슬라이드오버 | **`[🤖 Agents]` 상단 · 활성** |
| **C · 정책 편집** | 파워 유저 | Group 6 컴팩트 토글 | **`[🤖 Agents]` 하단 · Policy** · Crafting |

```text
[⚙️ 세팅] [🤖 Agents*]  |  Tab1 … Tab7
  Group 6 · 전역          |  지식 자산화만
  Header 🤖(n) · MVP 운영  |  *Agents 탭 = Phase 2
```

**⚙️ 세팅 Group 6 (MVP)** — [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인#\[⚙️ 세팅\] My 시스템]]

- PIP / Document PiP 허용
- 자동 사출: **끄기** \| **제안만** \| **자동**
- 에이전트별 enable (11종 컴팩트)
- 세션 복구 on/off

**Header `🤖(n)` (MVP)** — Tab 1~7 공통 · 활성 PIP·타이머 수 · 클릭 시 dismiss·pause·세팅 링크

**`[🤖 Agents]` (Phase 2)** — [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인#\[🤖 Agents\] Onto-Agent 운영 · Phase 2]] · **상=활성 · 하=정책** 상하 스택

| 표면 | 에이전트 접근 · 관리 |
| :--- | :--- |
| **사이드페널** | Parent Context SSOT · **`🤖(n)` 운영** · ⚙️ Group 6 · *(P2)* Agents 탭 |
| **newtab Z3** | **Agent Dock** — KickLink 아래 · 발견·활성·빠른 사출 · 정책 **✗** |
| **PIP · Background** | 에이전트 **본체 UI** · 탭 전환 후에도 유지 |
| **Python 앱** | OS 플로팅 · 고부하 *(Opt-in)* |

> **Tab 8 비채택 유지** — Dock은 **Zone 위젯**이지 파이프라인 Tab이 **아님**.


---

## 하지 말아야 할 것

> [!warning] **Pruning — 무엇을 버릴 것인가**
> 시스템의 순수성과 성능을 위해, 아래 항목은 **과감히 제외**하거나 **후순위**로 미룹니다.

- **범용 위젯 (날씨, 뉴스 등):** 지식 자산화와 무관한 정보는 인지적 노이즈를 발생시킵니다. **제외**.
- **복잡한 소셜 피드:** 타인의 게시물을 읽는 데 시간을 뺏기면 자산화 흐름이 끊깁니다. '공명 점수' 같은 **비침습적 데이터**만 남기고 피드는 **제거**.
- **newtab Zone 과밀:** **Group 7** 프리셋·체크박스 · 신규 **미니멀** — [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인#Group 7 · newtab 표시 (Zone 노출)]]
- **파일 직접 관리:** 브라우저는 데이터 유통의 **통로**이지 저장소가 아닙니다. 모든 파일 제어는 **[[NEXIA]]** 본관에 맡깁니다.


> [!important] **아키텍트 설계 지침**
> "기능이 많아질수록 사용자는 길을 잃습니다. 우리는 **'지식을 자산으로 만드는 동선'**에 방해가 되는 모든 것을 제거했습니다. TabOnto는 화려한 대시보드가 아니라, 정교하게 설계된 **지식 공장**이어야 합니다."
---






## 관련 문서

| 문서 | 역할 |
| :--- | :--- |
| [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브]] | 기술 SSOT · WebExtensions · package 구조 |
| [[TabOnto 지식 밸런서 · 지적 시그니처 규격]] | Balancer · Signature · axisSetId · 공개 범위 |
| [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인]] | Tab 1~7 · KickLink 풀 UI · side_panel 사양 |

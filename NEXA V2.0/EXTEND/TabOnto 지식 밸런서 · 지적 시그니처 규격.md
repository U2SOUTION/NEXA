# TabOnto · 지식 밸런서 · 지적 시그니처 규격

> [!abstract] **이 문서는 무엇인가**
> TabOnto **다축(N-axis) 지적 활동**을 어떻게 **측정·균형화·프로필화**할지 정의하는 **개념·용어 SSOT**입니다.  
> **지식 밸런서 (Knowledge Balancer)** = 측정·시각화 **엔진** · **지적 시그니처 (Intellectual Signature)** = 그 결과 **프로필** · **지식 소화 루프 (Knowledge Circulation)** = 쌓인 지식이 **도는지** 돕는 **본인 전용 순환 신호** *(Signature·공개 ✗)*.  
> **현재 v1은 5개 축** `[분석·창의·실행·비판·연결]` — 축 **개수는 버전별로 늘거나 줄 수 있음** · [[#축 세트 · 버전 · 확장 정책]]  
> UI 배치·Tab 번호·WebExtensions 기술은 [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인]] · [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브]]가 담당합니다.  
> **SDK 층:** 본 문서 = **Core** (Balancer · Signature · Circulation 규칙) · Tab 3·Z7 화면 = **UI** — [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브#TabOnto SDK 3층 (UI · Core · Host Adapter)]]

> [!note] **문서 상태 — v0 · 2단계 정합 완료 (EXTEND + TDD-007 + 인맥)**
> SIDE Panel · NEW Tab · 허브 · **인맥 전환** · **TDD-007 §10·§11** 용어를 본 문서 기준으로 **맞춤**.

> **정본 대조:** Tab 3 [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인#Tab 3]] · Core 경로 `packages/shared/schemas/tabonto/` · `packages/shared/src/tabonto/balancer/` — [TDD-007 §10.5](../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md#105-tabonto-sdk-3층-ui--core--host-adapter)

---

## 읽는 순서

1. **[[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브#TabOnto SDK 3층 (UI · Core · Host Adapter)]]** — *(처음)* UI·Core·Adapter 구분  
2. **[[#한 줄 정의 · 역할 분리]]** — Balancer / Circulation / Signature / Resonance  
3. **[[#지식 밸런서 vs 지적 시그니처 — 비교]]** — 차이 · 혼동 방지  
4. **[[#지적 프로필 4-레이어 개념 모델]]** — newtab·Tab 3 정보 구조 *(개념도)*  
5. **[[#축 세트 · 버전 · 확장 정책]]** — N축 · `axisSetId` · 「5축」명시 함정  
6. **[[#축 세트 v1 (Five Axes · 현재 5개)]]** — 분석·창의·실행·비판·연결  
7. **[[#지식 밸런서 (Knowledge Balancer)]]** — 입력 · 집계 · 「실시간」의 의미  
8. **[[#지식 소화 루프 (Knowledge Circulation)]]** — 소화 유도 · NOMC 연동 · Signature 경계  
9. **[[#지적 시그니처 (Intellectual Signature)]]** — 스냅샷 · 생명주기 · NEXA 동기화  
10. **[[#공개 범위 · 커뮤니티]]** — Opt-in 3단계 · 상보 매칭  
11. **[[#MVP · Phase 구분]]** — 무엇을 언제 켤지  
12. **[[#하지 말아야 할 것]]** — 랭킹 · 능력치 · 강제 공개 · 숫자 고정 브랜딩  
13. **[[#기술 · 스키마 · API (초안)]]** — 코드명 · 필드  
14. **[[#기존 용어 매핑 (2단계 정합용)]]** — 레거시 → 신규

---

## 한 줄 정의 · 역할 분리

| 개념 | 영문 | 한 줄 | 비유 |
| :--- | :--- | :--- | :--- |
| **지식 밸런서** | Knowledge Balancer | Tab 1~2 **지적 활동**을 **등록된 축(axis set)** 으로 **집계**하고 **균형도**를 **시각화**하는 **분석 엔진** | 저울 · 레이더 · **과정** |
| **지식 소화 루프** | Knowledge Circulation | 수집된 지식이 **저장만 되고 정체되지 않도록** — **전환·연결·복습** 큐와 **문장**으로 **본인에게만** 순환을 알리는 **신호층** | 순환 · **건강 검진** |
| **지적 시그니처** | Intellectual Signature | 밸런서가 만든 **안정된 다축 프로필** — NEXA에서 **패턴으로 공개**(Opt-in)하는 **고유 지표** | 서명 · **윤곽** · **결과** |
| **공명** | Resonance | Opt-in **집단 신호** — 페이지·태그·관심의 **익명화된 겹침** · **Collective Pulse** *(트렌드·Emerging Nodes)* *(Signature와 분리)* | 공명 · **사회층** |

```text
[Tab 1~2 활동: 노드 · 태그 · 엣지 · KickLink · NOMC Frontier …]
              │
              ├──────────────────────────────────────┐
              ▼                                      ▼
     ┌─────────────────────┐              ┌─────────────────────┐
     │  Knowledge Balancer  │              │ Knowledge Circulation│
     │  (엔진 + UI 위젯)     │              │ (소화 루프 · 본인만)   │
     └──────────┬──────────┘              └──────────┬──────────┘
                │ 스냅샷 · stable                        │ 큐 · 문장 · 행동 유도
                ▼                                      │ (Signature 입력 ✗)
     ┌─────────────────────┐                           │
     │ Intellectual         │◄─── 축 패턴만 · 소화율 ✗ ─┘
     │ Signature            │
     └──────────┬──────────┘
                │ Opt-in (1·2단계)
                ▼
     [Resonance · Collective Pulse · 상보 매칭 · Tab 4 · Tab 7]
```

> [!important] **합의 5원칙 (본 문서 전제)**
>
> 1. **Balancer** = 측정·균형 **도구** — 게임 스탯 · 레벨업 ✗  
> 2. **Circulation** = **소화 유도** — 숙련도 점수 · Mastery Gauge · 카드 수 벌점 ✗ · **Signature·공개 반영 ✗**  
> 3. **Signature** = Opt-in **패턴 프로필** — 랭킹 · 강제 공개 · 「상위 N%」 ✗  
> 4. **「실시간」** = UI가 **부드럽게 갱신**되는 체감 · SSOT 집계는 **규칙된 주기**(디바운스·배치)  
> 5. **축 개수** = **버전(`axisSetId`)별 SSOT** — 「영원히 5개」제품 약속 ✗

> [!tip] **카피 가이드 (유저-facing) — 숫자 중립**
>
> - ⭕ *「최근 30일, 당신의 **지적 시그니처**는 분석·구조화 쪽에 기울어 있습니다.»*  
> - ⭕ *「**지식 균형** · **활동 윤곽**」* · *「연결 축이 낮은 편입니다…」*  
> - ⭕ *「선반에 안 꽂힌 카드 2개 · 복습 대기 1건」* — **소화 루프** 문장  
> - △ *「5축 레이더」* — **v1 내부·Phase 2 UI** 한정 · **메인 브랜드 카피 ✗**  
> - ✗ *「분석 45점 — 상위 10%」* · *「레벨 7 달성」* · *「Penta 프로필」*

---

## 지식 밸런서 vs 지적 시그니처 — 비교

> [!abstract] **한 쌍이지만 역할이 다름**
> **지식 밸런서** = 측정·집계·시각화 **엔진** (과정) · **지적 시그니처** = 그 결과의 **안정된 프로필 SSOT** (결과).  
> 구현 시 **서비스(`KnowledgeBalancerService`)** 와 **데이터(`IntellectualSignature`)** 를 **파일·API부터 분리**합니다.

```text
Tab 1~2 활동 → [Knowledge Balancer] → 스냅샷 → [Intellectual Signature] → (Opt-in) 커뮤니티
```

### 핵심 비교

| 구분           | **지식 밸런서** (Knowledge Balancer)                    | **지적 시그니처** (Intellectual Signature)                                  |
| :----------- | :------------------------------------------------- | :-------------------------------------------------------------------- |
| **무엇인가**     | 지적 활동을 축(axis)별로 **집계**하고 **균형**을 **보여 주는 도구**     | 집계로 만든 **나만의 다축 프로필** (저장·동기화 SSOT)                                   |
| **성격**       | **엔진 + UI 위젯** (AxisRadar · BalanceStrip)          | **데이터 레코드** (스키마 · API · 프로필)                                         |
| **비유**       | 저울 · 레이더 · **과정**                                  | 서명 · **윤곽** · **결과**                                                      |
| **입력**       | Tab 1~2 행동 (노드 · 태그 · 엣지 · KickLink 등)             | Balancer **집계 결과**                                                    |
| **출력**       | 화면上的 균형도 · 레이더 · strip                             | `axes` · `axisSetId` · `status` · `visibility` 등                      |
| **갱신**       | **계속 움직임** — 이벤트마다 가중·재계산 *(디바운스)*                 | **스냅샷** — draft → active → **stable** *(예: 일 1회 고정)*                  |
| **「실시간」**    | UI는 짧은 지연 후 **애니메이션 갱신** *(체감 실시간)*                | SSOT는 **배치·디바운스** 후 반영 *(준실시간)*                                       |
| **유저 카피**    | 「**지식 균형**」·「활동 **윤곽**」                            | 「**내 지적 시그니처**」                                                       |
| **숫자 의미**    | **비율 합 100** *(v1: 분석·창의·실행·비판·연결)*                | 동일 비율이 **프로필로 고정**된 것                                                 |
| **자기 입력 점수** | ✗ — **활동만** 반영                                     | ✗ — Balancer 산출물만                                                     |
| **게임화**      | 레벨 · 티어 · 랭킹 ✗                                     | IQ · 상위 N% · 리더보드 ✗                                                   |
| **공개**       | 본인 UI용 *(기본)*                                      | **Opt-in** *(0 비공개 → 1 매칭 → 2 프로필)*                                   |
| **커뮤니티**     | 직접 공개 대상 **아님**                                    | 공개 시 **상보 매칭** · Tab 4 · Tab 7 입력                                     |
| **코드·API**   | `KnowledgeBalancerService` · `axisRegistry`        | `intellectual-signature.schema.ts` · `GET /tabonto/profile/signature` |
| **UI 위치**    | Tab 3 **AxisRadar** · strip · newtab SignatureMini | Tab 3 「내 시그니처」· NEXA 프로필 **동일 SSOT**                                  |
| **MVP**      | *(선택)* 이벤트 로그 · 집계 OFF 가능                          | **미노출**                                                               |
| **Phase 2**  | 집계 ON · AxisRadar                                  | active · NEXA 동기화 · 공개 범위                                             |

### 혼동 방지 (FAQ)

| 질문 | 답 |
| :--- | :--- |
| 레이더 차트는 뭐냐? | **Balancer UI** (**AxisRadar**) — 보여 주는 **도구** |
| 「내 프로필 N각형」 **데이터**는? | **Signature** SSOT |
| 둘 다 「5축」이냐? | v1은 `axisSetId: tabonto-v1`로 5축 — **브랜드에 「5축」고정 ✗** · [[#축 세트 · 버전 · 확장 정책]] |
| Promote한 노드 = 시그니처? | **✗** — 온톨로지 노드와 Signature는 **별 레코드** |
| **Resonance**는? | **둘 다 아님** — 집단·페이지 겹침 · **Collective Pulse** 트렌드 신호 *(Signature와 분리)* · [[#L4 · Social — Resonance · Collective Pulse]] |
| **지식 소화 루프**는? | **Circulation** — 쌓인 카드·Frontier·부채의 **순환 큐** · [[#지식 소화 루프 (Knowledge Circulation)]] |
| 소화율이 시그니처에 반영? | **✗** — Signature는 **Balancer 축 패턴**만 |

> [!quote] **설계 철학 (한 줄)**
> **지식 밸런서**는 나를 **줄 세우지 않고** 균형을 **비추는 거울**이고, **지적 시그니처**는 그 거울에 비친 **나만의 윤곽**입니다 — Opt-in했을 때만, **지식 공동체**가 그 윤곽을 **서로 보완**합니다. **지식 소화 루프**는 윤곽을 **맞추기 위한 점수**가 아니라, 창고에 쌓인 카드가 **다시 손에 닿도록** 돕는 **순환 신호**입니다.

---

## 지적 프로필 4-레이어 개념 모델

> [!abstract] **개념도 (IA) — UI 4층 스택 ✗**
> newtab·Tab 3 **정보 구조**를 설명하는 **레이어 모델**입니다. **4개를 한 화면에 쌓지 않음** — [[#지식 소화 루프 (Knowledge Circulation)#UI 배치 원칙]].

| Layer  | 명칭 (개념)                 | SSOT 개념            | 핵심 질문                        |
| :----: | :---------------------- | :----------------- | :--------------------------- |
| **L1** | **Dynamics** · 지적 활동    | **지식 밸런서**         | *어떤 유형으로 활동 중인가?*            |
| **L2** | **Circulation** · 지식 소화 | **지식 소화 루프**       | *쌓은 지식이 **도는가** — 전환·연결·복습?* |
| **L3** | **Signature** · 지적 시그니처 | **지적 시그니처** | *최근 활동이 만든 **윤곽(패턴)** 은?* |
| **L4** | **Social** · 공명·매칭·트렌드 | **Resonance** + 상보 + **Collective Pulse** | *Opt-in 기준 **누구·무엇과 맞물리는가?*** · *글로벌·집단 **펄스**는?* |

```text
L1 Dynamics     ← Balancer (활동 비율 · axisSetId)
L2 Circulation  ← Digestion Loop (큐 · 문장)     ← Signature와 데이터 분리
L3 Signature    ← Intellectual Signature (stable 스냅샷 · 활동 윤곽만)
L4 Social       ← Resonance · Complement · Collective Pulse (Opt-in)
```

> **newtab UI 매핑:** L1~L4 → **Z7 Knowledge Compass** — [[TabOnto 브라우저 NEW Tab 기획 사양서#Z7 · Knowledge Compass]]

#### L4 · Social — Resonance · Collective Pulse

> [!abstract] **사회층 = 사람·집단 + 시의성**
> L4는 **Intellectual Signature(L3)와 데이터·UI 모두 분리**합니다. **Resonance**는 익명화된 **겹침·상보** · **Collective Pulse**는 **외부·집단 트렌드**와 내 윤곽의 **교차·공백**을 비춥니다 — 랭킹·상위 N% ✗.

| 하위 기능 | 영문 | 한 줄 | Opt-in |
| :--- | :--- | :--- | :--- |
| **공명·상보** | Resonance · Complement | 페이지·태그·축 패턴의 **익명 겹침** · 결핍↔강점 매칭 | Signature **1·2** · Resonance 토글 |
| **집단 펄스** | **Collective Pulse** | **글로벌·집단 트렌드**와 내 시그니처 키워드의 **교집합·공백** | Resonance와 **동일 토글군** *(기본 off)* |

##### Collective Pulse (최신 트렌드 연동)

| 항목 | 명세 |
| :--- | :--- |
| **데이터 소스** | ① **외부 트렌드 API** *(도메인·기간·지역 메타)* ② **익명화된 TabOnto 사용자 군집 키워드** — `communityIndex` **최소 필드만** · 원문·URL·개인 식별 **✗** |
| **시각화** | **Resonance Glow** 내부에 **떠오르는 노드 (Emerging Nodes)** — 상승 속도·강도에 따른 **펄스·글로우 링** · 열지도와 **동일 캔버스** · 별도 랭킹 리스트 **✗** |
| **갱신 주기** | 트렌드 API **배치** *(예: 6~24h)* + 군집 키워드 **디바운스 집계** — L1 Balancer와 동일하게 **「체감 실시간」≠ every keystroke** |

**공명 매핑 (Mapping Logic)**

| 모드 | 입력 | 출력 · UX | 설계 의도 |
| :--- | :--- | :--- | :--- |
| **Intersection** *(교집합)* | 내 **시그니처 `domainTags`·활성 키워드** ∩ **글로벌·집단 트렌드 키워드** | Emerging Node **강조 Glow** · *「지금 내가 보는 방향이 흐름과 겹칩니다」* | **현재 나의 가치·관심 확인** — 자기 확증이 아닌 **맥락 정렬** |
| **Gap Analysis** *(공백 분석)* | 내 **보관함(Tab 1~2 노드·태그)에 없음** ∧ 내 **Signature 관심 분야**에서 **급부상 중**인 키워드 | Resonance Glow **외곽·점선 노드** · 클릭 → Tab 1 **Unknown Scout** 또는 Tab 7 KickLink **제안** | **지적 사각지대 보완** — 강제 수집 ✗ · **발견 제안**만 |

```text
[외부 트렌드 API] ──┐
                    ├──> trendIndex (배치)
[communityIndex] ───┘         │
                              ▼
[L3 Signature domainTags · 활성 키워드] ──> Mapping Logic
         │                    │
         │ Intersection       │ Gap Analysis
         ▼                    ▼
   [Glow 강조 노드]      [Emerging Nodes · 외곽]
         │                    │
         └────────┬───────────┘
                  ▼
        ResonanceStrip / Resonance Glow (Z7 L4 · Tab 4)
```

> [!important] **L4 설계 원칙 (Collective Pulse 포함)**
>
> - **Signature 축 비율을 트렌드로 덮어쓰기 ✗** — Pulse는 **키워드·태그 레이어**만
> - **Intersection ≠ 순위** — 「인기 1위」카피 ✗ · **겹침·정렬** 문장만
> - **Gap Analysis** — 미보유 키워드를 **부채·벌점**으로 표시 ✗ · **탐색 제안** 카드
> - **visibility 0** — L4 전체 **숨김** *(Resonance · Pulse 동시)*

| UI 표면 | L4 위젯 | Phase |
| :--- | :--- | :--- |
| newtab **Z7** | `ResonanceStrip` · **Resonance Glow** + Emerging Nodes | P2+ |
| Tab 3 | 공명 레이더 · Pulse **미니 링** | P2 |
| Tab 4 · Tab 7 | 상보 · 트렌드 **도킹** | P2+ |

> [!note] **폐기·금지 명칭**
> - Layer 2: **Mastery(숙련도)** · **Mastery Gauges** — 능력치 UI · Zero-Ranking 충돌  
> - Layer 3: **Identity** · **지적 지문** — 지식이 **그 사람 전체**를 대변하는 뉘앙스 ✗ · **활동 기반 윤곽**만 **Signature**로 표기

---

## 축 세트 · 버전 · 확장 정책

> [!important] **「5축」을 영구 브랜드로 박지 않는다**
> 엔진 축은 **늘거나 줄 수 있다**. 그래서 **제품·스키마·UI 이름에 숫자 5를 고정하지 않는다.**  
> **v1 = 5개**는 **현재 기본 세트**일 뿐 — `axisSetId: "tabonto-v1"` 로 **버전 관리**합니다.

### 층별 네이밍 (숫자 vs 축-중립)

| 층 | 추천 (축-중립) | 피할 것 (5 고정) |
| :--- | :--- | :--- |
| **유저 카피** | 지식 **균형** · **지적 시그니처** · **활동 윤곽** | 5축 프로필 *(메인)* · Penta |
| **엔진** | `KnowledgeBalancer` · **`axisRegistry`** | `FiveAxisService` · `PentaEngine` |
| **UI** | **AxisRadar** · **BalanceRadar** · BalanceStrip | **PentaRadar** *(v1 전용 별칭만)* |
| **데이터** | `axes: Record<AxisKey, number>` · **`axisSetId`** | flat 5필드 only · `fiveAxes` |

### `axisSetId` · 레지스트리

```text
axisRegistry/
  tabonto-v1.yaml    ← MVP · Phase 2 기본 (5 keys · sum=100)
  tabonto-v2.yaml    ← (미래) 6 keys · v1→v2 매핑 테이블
```

| 필드 | 의미 |
| :--- | :--- |
| **`axisSetId`** | `"tabonto-v1"` — Signature·매칭·UI **각도 순서** SSOT |
| **`axisKeys[]`** | 레이더 꼭짓점 **순서** · i18n 라벨 키 |
| **`axes`** | `Record<AxisKey, number>` · **해당 set 내 sum = 100** |

### 축 개수 변경 시 규칙

| 변경 | 정책 |
| :--- | :--- |
| **축 추가 (5→6)** | 새 `axisSetId` · **상보 매칭은 동일 set끼리만** · 구 Signature **read-only 이력** |
| **축 제거 (5→4)** | v2 + **v1→v2 매핑** (예: `critique` → `analyze` 가중 합산) · 커뮤니티 **set 혼합 ✗** |
| **축 이름만 변경** | **동일 `axisSetId` minor** 또는 registry **patch 버전** |
| **합 100** | **set마다 유지** — N이 바뀌어도 **비율 정규화** 원칙 동일 |

```text
[tabonto-v1 Signature] ──read-only──> 이력 보관
         │
         │ (유저 동의 · 마이그레이션)
         ▼
[tabonto-v2 Signature] ──active──> Tab 3 · 매칭 · API
```

> [!warning] **「5축」명시가 걸림돌이 되는 경우**
>
> - 제목·로고·스키마 필드명에 **Five/Penta/5** 박음 → N 변경 시 **리네이밍·마이그레이션 폭발**  
> - **완화:** 문서·UI는 **「v1: 5축」** · 코드는 **`axisSetId`** · 카피는 **균형·시그니처**

---

## 축 세트 v1 (Five Axes · 현재 5개)

> **범위:** `axisSetId = "tabonto-v1"` · **Phase 2 Balancer/S Signature 기본값.**  
> v1의 5개 축은 **서로 배타적인 「능력치」가 아니라**, 한 기간 동안의 **지적 활동 비율(합 100)** 입니다.

| 키 | 한글 UI | 영문 | Tab 1~2에서 잡히는 신호 (예) |
| :--- | :--- | :--- | :--- |
| `analyze` | **분석** | Analyze | 정의·구조·분류 태그 · 「무엇인가」 해석 노드 · 메타 풍부한 저장 |
| `create` | **창의** | Create | 비유·발상 · Tab 2 **신규 관계** 제안 · 기존에 없던 엣지 |
| `execute` | **실행** | Execute | How-to · 체크리스트 · 적용 메모 · Tab 5 프롬프트 인접 행동 |
| `critique` | **비판** | Critique | 반론·한계·검증 링크 · CRITIC 톤 메모 · 「왜 틀릴 수 있는가」 |
| `connect` | **연결** | Connect | wikilink · 1-hop · KickLink · 온톨로지 엣지 · Tab 4 발행·인용 |

> [!note] **NEXA AI 토큰과의 관계 (부록)**
> What/LINK → **분석·연결** · CRITIC/GAP → **비판** · WILL/MUST → **실행** 쪽 가중치 참고 가능.  
> **UI 라벨 SSOT (v1)** — AI 내부 토큰은 매핑 테이블로만 연결.

**Zod 불변식 (v1 · `tabonto-v1`):**

```text
axisSetId === "tabonto-v1"
sum(Object.values(axes)) === 100
각 axisKey ∈ registry(tabonto-v1).axisKeys
각 값 ∈ [0, 100] · 정수 또는 소수 1자리 (구현 시 확정)
```

---

## 지식 밸런서 (Knowledge Balancer)

> **정의:** `[분석 · 창의 · 실행 · 비판 · 연결]` 등 **다각도 지적 활동**을 측정하여 **시각적 균형도**를 제공하는 **분석 엔진** (및 그 UI).

### 입력 (Input)

| 소스 | 이벤트 예 | 비고 |
| :--- | :--- | :--- |
| **Tab 1** | 노드 CRUD · 태그 · 카테고리 · 퀵 메모 톤 | **자기 입력 점수 ✗** |
| **Tab 2** | 엣지 추가/삭제 · 1-hop 탐색 · 맵 상호작용 | 관계 = **connect** 가중 |
| **Tab 7** | KickLink 클릭 · pin · 사용률 | **execute/connect** 보조 신호 |
| *(Phase 2)* Tab 4 | 발행·Resonance · 인용 | **connect** · 집단 검증 배지 |

### 집계 (Aggregation)

| 항목 | 규칙 (초안) |
| :--- | :--- |
| **윈도우** | rolling **30일** 기본 · 7일(단기) · 90일(장기) 보조 뷰 *(Phase 2)* |
| **가중** | 노드 1건 ≠ 1점 — 태그·엣지·행동 유형별 **가중치 테이블** *(TBD)* |
| **최소 표본** | 노드 **N 미만**(예: 10) → Signature **draft** · UI에 「아직 패턴이 잡히지 않았습니다」 |
| **갱신 주기** | SSOT: 이벤트 후 **디바운스 5~15분** 또는 **일 1회 배치** · UI: 마지막 갱신 시각 표시 |
| **검증** | `intellectual-signature.schema.ts` Zod · **`axisSetId` + sum(axes)=100** |

### 「실시간」의 의미

| 층 | 의미 |
| :--- | :--- |
| **UX (실시간)** | Tab 3 **AxisRadar**·strip이 활동 후 **짧은 지연**으로 **애니메이션 갱신** |
| **SSOT (준실시간)** | 서버·로컬 집계는 **디바운스/배치** — Extension MV3 · Nest 부하 · **일관성** 우선 |
| **MVP** | Balancer **엔진**은 백그라운드 집계 가능 · **Balancer UI = Phase 2** (Tab 3 ③) |

### UI 위젯 (표현층 · 이름 후보)

| 위젯 | 위치 | Phase |
| :--- | :--- | :--- |
| **AxisRadar** *(v1 별칭: 5각 레이더)* | Tab 3 Section 3 · NEXA 프로필 | Phase 2 |
| **BalanceStrip** | 사이드페널 하단 미니 bar *(축 수 = registry)* | Phase 2 |
| **SignatureMini** / **Knowledge Compass** | newtab **Z7** 약식 미러 *(L1~L4)* | Phase 2+ |

> Balancer **엔진**과 UI **AxisRadar**는 분리 — **`axisRegistry`** 만 v2 추가해도 UI는 **keys.length** 로 각도 계산.

---

## 지식 소화 루프 (Knowledge Circulation)

> **정의:** 사용자가 **과도하게 수집만** 하고 **소화·연결·복습**하지 않는 **정체**를 완화하기 위한 **본인 전용 순환 신호층**.  
> **Zod 규격만 맞으면 카드가 많아도 괜찮다**는 전제 위에서, **「다음에 손댈 1~3건」** 을 제안합니다.

### 설계 취지 · 철학 경계

| 취지 | 규격 반영 |
| :--- | :--- |
| 수집만 하고 소화하지 않는 **정체** 완화 | **큐 + 행동 링크** (Tab 1·2·3·Term Forge) |
| 규격 맞는 카드는 **양이 많아도 OK** | 카드 수 **상한·벌점 ✗** · **미연결·부채·Frontier 대기**만 표시 |
| 사용자가 **스스로 소화**하도록 | **강요·채점 ✗** · 스텔스 복습·Ghost Link **제안** |
| Zero-Ranking과 공존 | **% · 게이지 · 숙련도 점수 ✗** · **문장·상태·큐** |

> [!important] **Signature · Resonance와 분리**
>
> - **지식 소화 루프** 데이터는 **Intellectual Signature에 합산·반영하지 않음**
> - **상보 매칭·공개 프로필** 입력 **✗**
> - **소화율·엣지 밀도**를 **랭킹·IQ·티어**로 읽게 하는 카피 **✗**

### NOMC 3단계와의 대응

[[TabOnto Mapping Core (NOMC) 핵심 엔진 사양]] 의 자산 레이어와 **신호**만 연결합니다.

| NOMC 레이어 | 소화 루프 신호 | 사용자-facing (예) |
| :--- | :--- | :--- |
| **미개척 (Frontier)** | **전환 흐름 (Circulation)** | *「이번 주 Frontier 2건 → Tab 1 저장 대기」* |
| **부채 (Knowledge Debt)** | **복습 대기 (Recall)** | *「오래 안 본 카드 2개」* → Tab 3 · Flashcard |
| **확정 (Confirmed)** | *(직접 압박 ✗)* | 연결·복습이 **돌아가면** circulationNote 갱신 |

### 세 가지 신호 (구 Mastery 지표 → 재정의)

| 신호 | 영문 | 내부 의미 | ✗ 하지 않음 | ⭕ UI |
| :--- | :--- | :--- | :--- | :--- |
| **전환 흐름** | Circulation | NOMC Frontier / Tab 1 제안 → **Zod 저장**으로 이어진 **건수·기간** *(본인이 건드린 것만)* | 소화율 **% 게이지** | **문장** · 주간 요약 |
| **연결 제안** | Connection | Tab 1 카드 중 **엣지 없음·미배치** — Terminology Stack · Tab 2 **2b** SSOT | Orphan **밀도 KPI** · 그래프 완성도 경쟁 | *「선반에 안 꽂힌 3개」* + Ghost Link **1건** |
| **복습 대기** | Recall | `last_review_date` · NOMC **Debt** — **우선순위 정렬만** (내부) | 부채 **지수** · 공개 부채 | Tab 3 **스텔스** · Onto-Agent Flashcard |

### 데이터 흐름

```text
[NOMC pageBuffer · Tab 1 Zod · Tab 2 edges · familiarity 메타]
                        │
                        ▼
              DigestionSnapshot (본인만)
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
  frontierHandoff   pendingConnect   debtReviewQueue
        │               │               │
        └───────────────┴───────────────┘
                        │
                        ▼
              circulationNote (문장 · % ✗)
                        │
        Tab 1 저장 · Tab 2 연결 · Tab 3 복습 · Term Forge
```

### UI 배치 원칙

| 표면 | L2 (Circulation) 노출 |
| :--- | :--- |
| **Tab 3** *(정본)* | Section **「지식 소화 루프」** — 큐 요약 · 다음 행동 1~3건 |
| **newtab** *(Phase 2+)* | **Z7 Knowledge Compass** — [[TabOnto 브라우저 NEW Tab 기획 사양서#Z7 · Knowledge Compass]] |
| **Onto-Agent** | Flashcard · Milestone — **Recall·Circulation** 트리거 |
| **Signature / Resonance** | **미노출** |

**L1+L3 (newtab Z7 · Phase 2+):** **BalanceStrip + Signature stable** 을 **한 카드·탭 전환** — 레이더 **이중 노출 ✗**.

### MVP · Phase

| Phase | 지식 소화 루프 |
| :--- | :--- |
| **MVP (P1)** | *(선택)* `debtReviewQueue` 로컬만 · UI **미노출** 가능 |
| **Phase 2** | DigestionSnapshot · Tab 3 Section · circulationNote |
| **Phase 2+** | newtab 한 줄 · NOMC Frontier handoff 연동 |
| **NEXA 본관** | 그래프 orphan 분석 **심화** — Extension **숫자 게이지 ✗** |

---

## 지적 시그니처 (Intellectual Signature)

> **정의:** 지식 밸런서를 통해 도출된 **최종 데이터 프로필**. NEXA 커뮤니티에서 유저의 **전문성·활동 패턴**을 **Opt-in으로 공개**하는 **고유 지표**.

### 「전문성 증명」의 해석

Signature는 **시험 점수·자격증**이 아닙니다.

| ✗ 하지 않음 | ⭕ 하는 일 |
| :--- | :--- |
| 등수 · 티어 · 리더보드 | **기간·도메인** 안에서의 **축 비율 패턴** *(v1: 5축)* |
| IQ · 지능 점수 | **무엇을 어떻게 쌓았는지**의 **형태(윤곽)** |
| 강제 공개 | **공개 범위 0** 기본 · **명시 Opt-in** |

**내부 기획어:** 「전문성 증명」= **패턴 공개 (pattern disclosure)**  
**유저 카피:** 「내 **지적 시그니처**」·「최근 **지식 균형**」

### 생명주기 (Lifecycle)

```text
[활동 부족] ──> draft (미표시 또는 placeholder)
       │
[표본 충족] ──> active (Tab 3 · 본인 조회)
       │
[stable 스냅샷] ──> intellectualSignature (버전 id · generatedAt)
       │
[Opt-in 1·2] ──> communityIndex (매칭·Resonance용 **최소 필드만**)
```

| 상태 | 조건 | 노출 |
| :--- | :--- | :--- |
| **draft** | 노드 < N · 또는 윈도우 데이터 부족 | 본인에게만 「데이터 쌓는 중」 |
| **active** | 합 100 검증 통과 | Tab 3 · NEXA 프로필 **동일 SSOT** |
| **stable** | 주기 스냅샷(예: 일 1회) 고정 | 이력 비교 · 「지난달 대비」 *(Phase 2)* |
| **public** *(Opt-in)* | 공개 범위 1 또는 2 | Tab 4 매칭 · Tab 7 · 구독 |

### NEXA 동기화

- **Extension Tab 3** · **NEXA `(shell)/tabonto`** · **API** — **동일 Intellectual Signature SSOT**
- Footer **`[내 지적 시그니처]`** *(Phase 2 · 구 `[내 지식 프로필]` 대체)*
- Promote · Nexaon · **노드 본문**과 Signature는 **별 레코드** — Promote가 Signature를 **대체 ✗**

---

## 공개 범위 · 커뮤니티

> [!important] **Opt-in · 최소 노출** *(SIDE Panel Tab 3와 동형)*  
> **기본값 = 비공개(0).** 퀵 메모 · URL · 미발행 노드는 Signature 공개와 **무관**.

| 단계 | 설정 | 커뮤니티에 쓰이는 Signature 필드 |
| :--- | :--- | :--- |
| **0 · 비공개** *(기본)* | 본인만 | **없음** |
| **1 · 커뮤니티** | Tab 4 매칭 | **축 비율** *(동일 `axisSetId`)* · **도메인 태그** · Resonance · 노드 **구간** |
| **2 · 프로필 공개** | 구독·검색 | 1 + 닉네임·한줄소개 · **공개 이슈·묶음** · 상보 수락 |

### 상보 매칭 (Complement Match)

- **입력:** 내 Signature에서 **상대적으로 낮은 축(결핍)** ↔ 타인 Signature의 **강한 축** — **`axisSetId` 일치 필수**
- **출력:** Tab 3·4 추천 카드 · Tab 7 KickLink — **경쟁 ✗** · **빈 축을 채우는 도구**
- **예:** 내 connect 12 · 커뮤니티 공개 → connect 38 · `#기획` 유저 B 추천

### Resonance · Collective Pulse와의 경계

| | Intellectual Signature | Resonance · Collective Pulse |
| :--- | :--- | :--- |
| **주체** | **나**의 **축 패턴** *(axisSetId)* | **집단**·페이지·태그 겹침 · **글로벌·군집 트렌드** |
| **Opt-in** | Signature 공개 1·2 | Resonance 배지 · **Pulse 토글** *(동일군)* |
| **UI** | AxisRadar · 프로필 | 공명 레이더 · **Resonance Glow** · **Emerging Nodes** *(NEW Tab · Tab 3 Phase 2+)* |
| **매핑** | Balancer 집계만 | **Intersection** · **Gap Analysis** — [[#Collective Pulse (최신 트렌드 연동)]] |

---

## MVP · Phase 구분

| Phase | Knowledge Balancer | Knowledge Circulation | Intellectual Signature | UI |
| :--- | :--- | :--- | :--- | :--- |
| **MVP (P1)** | *(선택)* 이벤트 로그만 · 집계 **OFF** 가능 | *(선택)* 부채 큐 로컬만 · UI **OFF** | **미노출** | Tab 3 ① 스텔스 ② RAG만 |
| **Phase 2** | 집계 ON · **axisRegistry v1** · AxisRadar | DigestionSnapshot · Tab 3 **소화 루프** | active · NEXA **동기화** | Tab 3 ③④ · 공개 범위 |
| **Phase 2+** | 7·90일 윈도우 · stable 이력 | newtab **한 줄** · NOMC handoff | public · 상보 · 구독 | SignatureMini · L1/L3 한 카드 · **L4 Collective Pulse** |
| **NEXA 본관** | — | 그래프 분석 *(게이지 ✗)* | 프로필 풀 · 이력 | React Flow · Promote P0 |

---

## 하지 말아야 할 것

> [!warning] **Pruning — Balancer / Circulation / Signature 공통**

- **레벨러 · Level · Tier · 랭킹 · 리더보드** — TabOnto **Zero-Ranking** 철학 위반
- **능력치 · IQ · 지능 점수 · 숙련도(Mastery)** — 「지적 시그니처」·소화를 **게임 스탯**으로 읽게 하는 카피
- **Mastery Gauges · 소화율 % · 부채 지수 · 엣지 밀도 KPI** — **지식 소화 루프**에서 **문장·큐**로 대체
- **카드 수 상한·벌점** — 규격 맞는 **다량 수집** 자체를 벌하지 않음
- **소화 지표 → Signature 반영** — L2가 L3를 **오염**시키는 설계 ✗
- **자기 입력 점수** — 「내 분석력 80」 슬라이더 ✗ · **활동만** 집계
- **Signature = Promote 대체** — 온톨로지 노드 SSOT와 **혼동 ✗**
- **비Opt-in URL·메모 노출** — 커뮤니티 1단계에서도 **원문 ✗**
- **실시간 SSE 과부하** — every keystroke 집계 ✗ · **디바운스** 필수
- **트렌드 인기 순위·바이럴 점수 노출** — Collective Pulse는 **Intersection·Gap** 문장만 · 「1위 키워드」✗
- **Five · Penta · 5축을 브랜드·스키마에 고정** — **`axisSetId` + 축-중립 카피** 사용

---

## 기술 · 스키마 · API (초안)

> 구현 SSOT는 [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브]] · TDD-007와 **정합** 후 확정.

### 코드 · 파일명 (제안)

| 개념 | TypeScript / Nest | 비고 |
| :--- | :--- | :--- |
| Balancer 서비스 | `KnowledgeBalancerService` · `tabonto/balancer/` | **`axisRegistry`** · 집계·가중 |
| Circulation 스냅샷 | `DigestionSnapshot` · `digestion-snapshot.schema.ts` | **본인만** · Signature **분리** |
| Collective Pulse | `CollectivePulseSnapshot` · `collective-pulse.schema.ts` | 트렌드·군집 키워드 · **Opt-in L4** |
| Signature SSOT | `IntellectualSignature` · `intellectual-signature.schema.ts` | Zod · **`axisSetId`** · sum=100 |
| UI | `AxisRadar.tsx` · `BalanceStrip.tsx` · `CirculationPanel.tsx` | **N각** · 소화 **큐** |
| FE hook | `useIntellectualSignature.ts` · `useDigestionSnapshot.ts` | SSE/폴링 · 마지막 갱신 시각 |

### 스키마 필드 (개념)

```typescript
// packages/shared/schemas/tabonto/intellectual-signature.schema.ts (초안)
IntellectualSignature {
  userId: string
  axisSetId: string              // "tabonto-v1" — SSOT registry key
  status: 'draft' | 'active' | 'stable'
  windowDays: number             // default 30
  axisKeys: AxisKey[]            // registry 순서 · 레이더 각도
  axes: Record<AxisKey, number>  // sum === 100 within axisSetId
  domainTags: string[]           // 공개 1·2만
  visibility: 0 | 1 | 2
  generatedAt: ISO8601
  version: string                // stable 스냅샷 id
}

// v1 AxisKey (tabonto-v1 registry)
type AxisKeyV1 = 'analyze' | 'create' | 'execute' | 'critique' | 'connect'

// packages/shared/schemas/tabonto/digestion-snapshot.schema.ts (초안)
DigestionSnapshot {
  userId: string
  generatedAt: ISO8601
  frontierHandoffQueue: string[]    // termId · NOMC→Tab1 미완
  pendingConnections: string[]      // 미연결 Zod 카드
  debtReviewQueue: string[]         // last_review_date · 내부 정렬
  circulationNote: string           // 생성 문장 · % KPI ✗
  // intellectualSignatureId 참조 ✗ — Balancer/Signature와 독립
}

// packages/shared/schemas/tabonto/collective-pulse.schema.ts (초안)
CollectivePulseSnapshot {
  userId: string
  generatedAt: ISO8601
  trendSource: 'external_api' | 'cluster' | 'blended'
  emergingNodes: {
    keyword: string
    mode: 'intersection' | 'gap'
    velocity: number              // 상승 속도 · 정규화 · 순위 ✗
    domainTags: string[]          // Signature 교차용
  }[]
  intersectionKeywords: string[]    // Intersection 강조 SSOT
  gapKeywords: string[]             // Gap Analysis 제안 SSOT
  // axes · axisSetId 반영 ✗ — L3와 분리
}
```

### API (제안)

| Method | Path | 설명 |
| :--- | :--- | :--- |
| GET | `/tabonto/profile/signature` | 본인 Signature · **`axisSetId` 포함** |
| GET | `/tabonto/profile/digestion` | 본인 **DigestionSnapshot** *(Signature와 분리)* |
| GET | `/tabonto/balancer/axis-sets/{id}` | registry 메타 *(keys · labels · sum rule)* |
| POST | `/tabonto/profile/signature/visibility` | 공개 범위 0/1/2 |
| GET | `/tabonto/profile/signature/complements` | 상보 후보 *(Opt-in 1+)* |
| GET | `/tabonto/resonance/pulse` | **Collective Pulse** · Emerging Nodes *(Opt-in L4)* |

---

## 기존 용어 매핑 (2단계 정합 · 적용됨)

> SIDE Panel · NEW Tab · 허브에 **반영 완료** (2026-06). 아래 표는 **레거시 → SSOT** 대조용입니다.

| 기존 표현 (문서各处) | 신규 SSOT | 비고 |
| :--- | :--- | :--- |
| 5축 레벨러 · 5축 지능 레이더 | **지식 밸런서** (UI: **AxisRadar**) | 레벨러 **폐기** · Penta **코드명 ✗** |
| 5축 지식 프로필 · KnowledgeProfile | **지적 시그니처** + **`axisSetId`** | flat 5필드 → `Record<AxisKey>` |
| 「5축」메인 카피 | **지식 균형 · 지적 시그니처** | v1 문맥에서만 「5축」 |
| PentaRadar | **AxisRadar** | registry-driven N각 |
| 총합 100 · 지식 프로필 (Tab 3 ③) | Balancer UI + **Signature** 표시 | Section 3 |
| 실시간 지적 능력치 | **활동 반영 균형도** · 준실시간 집계 | 카피 수정 |
| `[내 지식 프로필]` | **`[내 지적 시그니처]`** | Footer · SIDE Panel **반영** |
| 공명 레이더 | **Resonance** · **Collective Pulse** *(Signature와 분리)* | NEW Tab · Z7 L4 |
| Mastery · 숙련도 게이지 · 소화율 % | **지식 소화 루프** · **Circulation / Connection / Recall** | Layer 2 **개념만** 4-레이어 IA |
| Layer 2 Mastery (Dynamics 하위) | **L2 Circulation** · `DigestionSnapshot` | Signature **입력 ✗** |
| Layer 3 Identity · 지적 지문 | **L3 Signature** · Intellectual Signature | **전인 대변 ✗** · 활동 윤곽만 |

---

## 관련 문서

| 문서 | 역할 |
| :--- | :--- |
| [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인]] | Tab 3 UI · 공개 범위 · 상보 · MVP Phase |
| [[TabOnto 브라우저 NEW Tab 기획 사양서]] | newtab SignatureMini · Resonance *(Phase 2+)* |
| [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브]] | Zod · Nest API · embed |
| [[TabOnto 인맥 중심 에서 시스템 중심 전환]] | 「지식의 시대」·랜딩 카피 *(브랜드 「능력치」≠ 게임 스탯)* |
| [[TabOnto Mapping Core (NOMC) 핵심 엔진 사양]] | Frontier · Debt · Confirmed → 소화 루프 신호 |
| [TDD-007 §10](../../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) | `schemas/tabonto/` · Nest `tabonto` 모듈 |

---
doc_id: DEV-UIX-LAYOUT
title: "NEXA Dev · UI/UX 레이아웃 구조 규격"
category: DEV
domain: NEXA
status: active
see_also:
  - NEXA_Dev_UI컴포넌트토큰및매핑명세.md
  - NEXA_Dev_구현파일구조뼈대.md
  - NEXA_Dev_UI-Driven_기능설계및_전이_로드맵.md
  - NEXA_Dev-System_of_Systems(SoS)_아키텍처비전.md
implements_doc: UIX-004
terms_nexa:
  - MainShell
  - domainLayoutRegistry
  - useLayoutStore
  - nexia
  - tabId
---

# NEXA Dev · UI/UX 레이아웃 구조 규격

> [!abstract] Normative · Dev UI SSOT
> **NEXA Dev** 레이아웃·셸·탭 규격. App 정본 [`UIX-004`](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) · [`UIX-006`](../APP_V2.0/07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) **동형** — **Source 스코프** · **배포 전 검증** · **Logex 캔버스 비주얼**만 Dev 보강.

> [!summary] 문서 지도
>
> - [[#목적 · 범위]]
> - [[#Dev · App 동형 원칙]]
> - [[#설계 목표]]
> - [[#Logex 캔버스 비주얼 스킨]]
> - [[#MainShell 5영역]]
> - [[#NEXIA 7+4 · 확장 레이어]]
> - [[#확장 탭 배치 전략]]
> - [[#5대 절대 원칙]]
> - [[#영역별 플랫폼 규격]]
> - [[#frame · Registry · 상태]]
> - [[#운영 계약]]

표식: `정의` 온보딩 · `구조` 5영역·7+4 · `원칙` 동형·절대원칙 · `구현` registry·store · `비주얼` Logex 스킨

## 목적 · 범위

> `정의`

| 포함                                            | 제외 (App 정본 위임)                       |
| :---------------------------------------------- | :----------------------------------------- |
| Dev **동형** MainShell · `nexia` **7+4** 마운트 | App Instance 운영 정책 상세                |
| Source 스코프 UI·검증 상태 표현                 | `erp` · `nexabo` 등 타 domainKey UIX       |
| Logex 캔버스 **비주얼 스킨**                    | 탭별 Left/Right 패널 목록 전체 (→ UIX-004) |
| `useLayoutStore` · registry 계약                | PiP · 멀티윈도우 상세 (→ TDD-014)          |

> [!tip] `원칙` · 문서 관계
> 플랫폼 셸·registry·5영역 = **App과 동일 코드·동일 규격**. 본 문서는 Dev 관점 보강분만 Normative.

---

## Dev · App 동형 원칙

> [!important] `원칙` · 구조 동형
> Dev는 App **생산** + 배포 **전 검증** 환경. 레이아웃·`tabId`·MainShell·registry **App과 동일** — 축소 셸·Dev 전용 프레임 **✗**.

| 항목                   | Dev                                                                         | App                           |
| :--------------------- | :-------------------------------------------------------------------------- | :---------------------------- |
| **MainShell 5영역**    | 동일 `frame/`                                                               | 동일                          |
| **`domainKey: nexia`** | Source 스코프                                                               | Instance 스코프               |
| **7 Core `tabId`**     | [`TDD-056`](../APP_V2.0/08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) SSOT | 동일                          |
| **+4 확장**            | Ontex · Admin · **CAT** · **PMS**                                           | 동형 · [[#확장 탭 배치 전략]] |
| **검증**               | Logex Run · StatusBar · Validation Gate                                     | 배포 후 운영 Audit            |
| **비주얼**             | Logex 캔버스 스킨 (본 문서 §)                                               | 동일 스킨 권장                |

→ [[NEXA_Dev-System_of_Systems(SoS)_아키텍처비전#Dev 이중 역할 · 구조 동형]]

---

## 설계 목표

> `구조` · UIX-006 계승 + Dev 보강

| 목표                 | 내용                                                       | Dev 보강                  |
| :------------------- | :--------------------------------------------------------- | :------------------------ |
| **인지 부하 최소화** | Left 탐색 · Content 실행 · Right 조정 · Header/Status 전역 | —                         |
| **실행 연속성**      | `domainKey`·드로어·스크롤 맥락 탭/라우트 전환 후 복원      | —                         |
| **조종권 가시화**    | `systemHealth` · 승인 · Run 상태 즉시 표기                 | StatusBar·Header **필수** |
| **확장성**           | `domainLayoutRegistry` 등록으로 신규 `domainKey` 마운트    | —                         |

---

## Logex 캔버스 비주얼 스킨

> `비주얼` · Logex·Nexaon GraphCanvas — App **동일 스킨** 권장

![](assets/Pasted%20image%2020260618190154.png)

| 요소            | 규격                                                                |
| :-------------- | :------------------------------------------------------------------ |
| **배경**        | 다크 그레이톤 그라데이션 + 미니멀 그리드 — 눈 피로·캔버스 심도 억제 |
| **노드**        | Opacity·Border 블렌딩 — 다수 노드 시각 균형                         |
| **스플릿·포트** | 오렌지 · 네온 그린 고대비 — 흐름·실행 상태 즉시 인지                |
| **베이스라인**  | 노드 하단(상태·로그) 딥 블랙 — 무게 중심 하단 고정                  |
| **Drawer**      | L/R Glassmorphism — 그리드·노드 라인 은은히 비침                    |

---

## MainShell 5영역 와 컨텐츠 레이아웃

> `구조` · Dev·App **동일** · 상세 [`UIX-004`](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md)

| 영역                | 컴포넌트                              | 핵심 책임                                 |
| :------------------ | :------------------------------------ | :---------------------------------------- |
| **AppHeader**       | `AppHeader` · `GlobalMainMenu`        | `domainKey` · 알림 · `headerActions`      |
| **Left Drawer**     | `LeftDrawer` · `registry.left`        | 탐색·목록·프로젝트 스위처                 |
| **Content**         | `registry.content` · `NexiaContent`   | **유일 main scroll** · **7 Core `tabId`** |
| **Right Drawer**    | `RightDrawer` · `registry.right`      | 속성·에이전트·Cross-Tab                   |
| **SystemStatusBar** | `SystemStatusBar` · `StatusPanelHost` | run·메트릭 1줄 + 확장 패널                |

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ AppHeader — GlobalMainMenu(domainKey) · GlobalNavbarRight · headerActions │
├──────────┬───────────────────────────────────────────────┬───────────────┤
│  Left    │  Content (nexia)                              │    Right      │
│  Drawer  │  NexiaTabBar(7 Core) ───────────────────────  │    Drawer     │
│          │  NexiaWorkspace: OmnixRail | TabWorkspace     │               │
├──────────┴───────────────────────────────────────────────┴───────────────┤
│ SystemStatusBar (~30px) · StatusPanelHost                                │
└──────────────────────────────────────────────────────────────────────────┘
```

```text
NexiaWorkspace (registry.content · 유일한 main scroll)
┌─ L1 Default · 2-pane ─────────────────────────────────────────────┐
│ ┌─ OmnixRail ────────┬─ TabWorkspace (activeTabId) ──────────────┐ │
│ │ 채팅 · Run 요약     │  · Normex / Logex / Scribx / … 본문        │ │
│ │ (다른 탭 작업 중    │  · 3-Column: Explorer│Canvas│Inspector   │ │
│ │  옆에 유지)         │  · Logex → NexaonShell (ontology)         │ │
│ └────────────────────┴──────────────────────────────────────────┘ │
│ L2: TabWorkspace 내부 split/merge (깊이 상한)                      │
│ L3: panel detach → PiP / 멀티윈도우 (TDD-014)                      │
└───────────────────────────────────────────────────────────────────┘
```

### Content · 7 Core 탭

> TabBar **`NexiaTabBar`** · `activeTabId` SSOT (`useNexiaTabStore`) · Workspace **L1** OmnixRail(좌) + TabWorkspace(활성 본문) · **L2** split · **L3** PiP ([TDD-014](../APP_V2.0/08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md)) · `tabId=omnix` 시 Rail full-width — UIX-004 §3.4.1

|  `tabId`   | 본문 (TabWorkspace)              | Dev 활용                     |
| :--------: | :------------------------------- | :--------------------------- |
| **omnix**  | 허브 · 채팅 · Run 트리거         | 자연어 · 오케스트레이션      |
| **normex** | 규범 · 시방서 · Tiptap           | 거버넌스 문서                |
| **logex**  | React Flow · `.nxflow` · Surface | 로직 · **Run 검증** · Nexaon |
| **scribx** | Monaco · 코드·명세               | Processor 확정               |
| **vivex**  | 미디어 · ComfyUI                 | 시각·청각 산출               |
| **twinex** | 3D 트윈 · NEXA-CELL              | Edge · 디바이스 검증         |
| **navex**  | Global Asset Index · 탐색        | Dual-View · 자산             |

> [!check] `원칙`
> 7 Core는 **Content 중앙** 전환. L/R Drawer는 탭 공통 축 — `activeTabId`에 패널만 스왑 (UIX-004 §4). Dual-View · 3-Column → [[NEXA_Dev_UI-Driven_기능설계및_전이_로드맵#레이아웃 아키텍처 (NEXA Dev & App 공통)]]

---

## NEXIA 7+4 · 확장 레이어

> `구조` · 7 Core **외부** 운영·관제·상황 인지 — TabBar **외부** 거점 후보

|  #  | 레이어                            |  약어   | 역할                         | 상세                                                                                                        |
| :-: | :-------------------------------- | :-----: | :--------------------------- | :---------------------------------------------------------------------------------------------------------- |
|  1  | **Ontex**                         |    —    | 지식 허브 · 온톨로지 SSOT    | NEXAOS `domainKey`                                                                                          |
|  2  | **Admin**                         |    —    | 배포 게이트 · Source 관리    | Dev **Validation Gate**                                                                                     |
|  3  | **Contextual Awareness Timeline** | **CAT** | 상황 인지 (LLM · Read-only)  | [[NEXA_Dev_UI-Driven_기능설계및_전이_로드맵#지능형 상황 인지 타임라인 CAT (Contextual Awareness Timeline)]] |
|  4  | **Project Management System**     | **PMS** | WBS · Ledger · Gate · Kanban | [[NEXA_Dev_UI-Driven_기능설계및_전이_로드맵#PMS (Project Management System) 프레임워크 항목]]               |

### 확장 탭 배치 전략

> `구현` · **비확정** — 확정 시 Dev·App 동형 적용

| 후보                  | 설명                         | 적합 레이어                                                       |
| :-------------------- | :--------------------------- | :---------------------------------------------------------------- |
| **A · Tab Rail 병치** | 7 Core TabBar에 +4 탭/서브탭 | Ontex · PMS · (CAT)                                               |
| **B · 고정 슬롯**     | TabBar와 분리 MainShell 슬롯 | Ontex(`domainKey`) · Admin(Header) · CAT(StatusBar) · PMS(Drawer) |
| **C · 하이브리드**    | Core=TabBar · CAT·PMS만 별도 | CAT 하단 · PMS 우측 등                                            |

> [!check] `원칙` · 배치 무관 고정
> 7 Core `tabId` **초과·대체 ✗** (TDD-056 개정 전) · +4 **Context 단일 세션** · Dual-View·CAT·PMS 동일 `assetId` 축

> [!warning] `정합` · 사용 금지
> Memex · Graphx · Surfacex · Servicex · 별도 **Simulator 탭** 등 구 카피 잔재 **✗**

---

## 5대 절대 원칙

> [!important] `원칙` · Normative

| 원칙                    | 구현                                                     |
| :---------------------- | :------------------------------------------------------- |
| **뷰포트 고정**         | `MainShellLayout` = `100vh` · `body` 세로 스크롤 **✗**   |
| **Content 단일 스크롤** | `registry.content` **만** `overflow-auto`                |
| **드로어 내부 스크롤**  | L/R Drawer 각각 `overflow-y-auto`                        |
| **Footer 없음**         | 하단 = **`SystemStatusBar`**                             |
| **Store-Driven**        | `useLayoutStore` SSOT · `drawerDefaults` per `domainKey` |

---

## 영역별 플랫폼 규격

> `구현` · App 규격 + Dev 보강 — 패널 목록 전체는 UIX-004 §4

| 영역                | App 규격 (요약)                                                        | Dev 보강                                   |
| :------------------ | :--------------------------------------------------------------------- | :----------------------------------------- |
| **AppHeader**       | `domainKey` 전환 · 미저장 확인 · `headerActions` · `systemHealth` 배지 | Run · Export · **배포 게이트** (§4.3)      |
| **Left Drawer**     | `registry.left` lazy · `drawerDefaults` · `Ctrl/Cmd+K` 검색            | —                                          |
| **Content**         | 도메인 본문 · nexia split/PiP 내부 · `(embed)`/`(auth)` 셸 미사용      | **Source** 편집 · 시뮬레이션 뷰            |
| **Right Drawer**    | 속성 · 에이전트 · nexia Time Axis · Agent Config (§4.2)                | PMS 패널 **후보**                          |
| **SystemStatusBar** | `statusBar` + `statusPanel`(≥300px) · SYNC · run · violation           | Validation Gate · 승인 배너 · **CAT 후보** |

---

## frame · Registry · 상태

> `구현` · Dev·App **공유** — [`UIX-004` §2·§7](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) · 전체 트리 → [[NEXA_Dev_구현파일구조뼈대]]

```text
apps/web/src/frame/
├── registry/domainLayoutRegistry.ts · layoutRegistry.ts
├── layouts/MainShellLayout.tsx
├── drawers/ · header/ · status/ · navigation/globalMenu.ts
```

| Store                  | 키 (요약)                                                                            | 비고        |
| :--------------------- | :----------------------------------------------------------------------------------- | :---------- |
| **`useLayoutStore`**   | `activeDomain` · `leftDrawer` · `rightDrawer` · `statusBarExpanded` · `systemHealth` | frame SSOT  |
| **`useNexiaTabStore`** | `activeTabId` · `navexPlacement` 등                                                  | 도메인 SSOT |

### Dev 상호작용 상태

> `운영` · Source 스코프 · 배포 전 검증

| 상태              | UI 반응                                   |
| :---------------- | :---------------------------------------- |
| **Idle**          | StatusBar 얇은 인디케이터                 |
| **Working**       | Content/Status 진행 · 취소                |
| **NeedsApproval** | Header/Status 승인 배너 · Validation Gate |
| **Error**         | 영역 배지 + 복구 · Audit                  |

---

## 운영 계약

> `운영` · 이벤트 · SLO · 폴백 · 접근성

**흐름:** 사용자 액션 → `useLayoutStore` / 도메인 store → registry 리렌더 → 승인·Audit

| 구분       | 항목                           | 내용                                                                      |
| :--------- | :----------------------------- | :------------------------------------------------------------------------ |
| **이벤트** | `DOMAIN_SWITCHED`              | `activeDomain` 변경                                                       |
|            | `DRAWER_TOGGLED`               | L/R open·width                                                            |
|            | `SYSTEM_HEALTH_CHANGED`        | 헬스 배지                                                                 |
|            | `STATUS_BAR_EXPANDED`          | 하단 패널                                                                 |
|            | `WINDOW_DETACHED` / `RESTORED` | [TDD-014](../APP_V2.0/08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md) |
| **SLO**    | 도메인 전환                    | P95 ≤150ms                                                                |
|            | 드로어 열림                    | P95 ≤120ms                                                                |
|            | persist 복원                   | ≤2s                                                                       |
|            | 헬스 배지                      | 평균 ≤100ms                                                               |
| **폴백**   | Drawer 실패                    | **Content 우선**                                                          |
|            | persist 손상                   | `drawerDefaults` 초기화                                                   |
|            | PiP 실패                       | 단일 창 MainShell                                                         |
| **a11y**   | 키보드                         | Header → L → C → R → Status · ARIA · `prefers-reduced-motion`             |

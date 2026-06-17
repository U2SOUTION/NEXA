---
parent_doc: 
see_also: [TDD-001, TDD-071, UIX-004, TDD-014]
doc_id: UIX-006
title: "NEXA 통합 레이아웃 구조 규격"
category: "07_UIUX"
domain: NEXA
status: archived
created: 2026-06-10
updated: 2026-06-11
implements_doc: UIX-004
terms_standard: ["zustand", "next-js", "app-router"]
terms_nexa: ["MainShell", "domainLayoutRegistry", "useLayoutStore", "SystemStatusBar", "domainKey", "AppHeader", "Left-Drawer", "Right-Drawer", "drawerDefaults"]
tags: ["doc/cat/07-uiux", "doc/domain/nexa", "std/zustand", "std/next-js", "std/app-router", "nexa/MainShell", "nexa/domainLayoutRegistry", "nexa/useLayoutStore", "nexa/SystemStatusBar", "nexa/domainKey", "nexa/AppHeader", "nexa/Left-Drawer", "nexa/Right-Drawer", "nexa/drawerDefaults"]
---

# NEXA · 통합 레이아웃 구조 규격

> **⛔ archived (2026-06-13):** `implements_doc: MVP-001` 기준 구 규격 · **SSOT ✗**
> **대체:** [UIX-004](../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) · [TDD-071 도메인 구조 통합](../08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md)


> **범위:** NEXA 플랫폼 **전 도메인** (`domainKey`) 공통 **MainShell** 셸 — AppHeader · L/R Drawer · Content · SystemStatusBar.
> **도메인별 UI:** `nexia` → [`UIX-004` NEXIA MainShell](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md). `erp` · `ontex` 등은 각 도메인 UIX/TDD.
> **구 UI 라벨** (Cockpit · Ethos · Synapse 등) 은 **사용하지 않음** — [`TDD-010` §3.1](../08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) `-ex` `tabId` 및 `domainKey` 만 Normative.

---

## 1. 목적과 범위

| 포함 | 제외 (도메인 UIX 로 위임) |
| :--- | :--- |
| MainShell 4 영역 + 상태바 구조 | `nexia` 7 탭 · OmnixRail · NexaonShell |
| `domainLayoutRegistry` 슬롯 계약 | 탭별 Left/Right 패널 목록 |
| `useLayoutStore` · `drawerDefaults` | Content 내부 split · PiP (`TDD-014`) |
| 도메인 전환 · 전역 상태·이벤트 | Global Navex · ExplorerTree 상세 |

---

## 2. 설계 목표

- **인지 부하 최소화** — 탐색 (Left) · 실행 (Content) · 조정 (Right) · 전역 (AppHeader/Status) 경계 분리
- **실행 연속성** — `domainKey`·드로어 상태·스크롤 맥락이 탭/라우트 전환 후에도 복원
- **조종권 가시화** — `systemHealth` · 승인 대기 · 오류를 StatusBar·Header 에 즉시 표기
- **확장성** — 신규 `domainKey` 는 registry 등록만으로 동일 셸에 마운트

---

## 3. 레이아웃 구성 (5 영역)

| 영역 | 컴포넌트 | 핵심 책임 | 사용자 질문 |
| :--- | :--- | :--- | :--- |
| **AppHeader** | `AppHeader` · `GlobalMainMenu` | `domainKey` 전환 · 전역 알림 · `headerActions` | 지금 어느 도메인이고 시스템은 정상인가? |
| **Left Drawer** | `LeftDrawer` · `registry.left` | 도메인별 탐색·목록·프로젝트 스위처 | 무엇을 불러와 이어서 작업할까? |
| **Content** | `registry.content` | 도메인 **유일한 main scroll** · 생산/실행 본문 | 지금 무엇을 만들고 실행 중인가? |
| **Right Drawer** | `RightDrawer` · `registry.right` | 속성·에이전트·Cross-Tab 유틸 | 어떻게 조정·최적화할까? |
| **SystemStatusBar** | `SystemStatusBar` · `StatusPanelHost` | 연결·run·메트릭 1 줄 + 확장 패널 | 백그라운드에서 무엇이 돌아가는가? |

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ AppHeader — GlobalMainMenu(domainKey) · GlobalNavbarRight · headerActions │
├──────────┬───────────────────────────────────────────────┬───────────────┤
│  Left    │              Content                          │    Right      │
│  Drawer  │         (유일한 main scroll)                   │    Drawer     │
│ registry │         registry.content                      │  registry     │
│  .left   │                                               │  .right       │
├──────────┴───────────────────────────────────────────────┴───────────────┤
│ SystemStatusBar (~30px) · StatusPanelHost (0 | expanded)                  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 5 대 절대 원칙 (Normative)

| # | 원칙 | 구현 |
| :-: | :--- | :--- |
| **1** | 뷰포트 고정 | `MainShellLayout` = `100vh` · `body` 세로 스크롤 **✗** |
| **2** | Content 단일 스크롤 | `registry.content` **만** `overflow-auto` |
| **3** | 드로어 내부 스크롤 | L/R Drawer 각각 `overflow-y-auto` |
| **4** | Footer 없음 | 하단 = **`SystemStatusBar`** |
| **5** | Store-Driven | `useLayoutStore` SSOT · 정책 = `drawerDefaults` per `domainKey` |

---

## 5. 영역별 플랫폼 규격

### 5.1 AppHeader

- `domainKey` 전환 (`GlobalMainMenu`) · 미저장 변경 시 확인 다이얼로그
- `registry.headerActions` — 도메인별 Run·Export 등 (nexia: [`UIX-004` §4.3](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md))
- 전역 알림 · `systemHealth` 배지 (`healthy` \| `degraded` \| `critical`)
- **sticky** 고정 · SEV1/2/3 심각도 색상 표준

### 5.2 Left Drawer

- `registry.left` lazy import — 도메인이 패널 트리·필터·최근 항목 정의
- `drawerDefaults.left`: `openPolicy` · `defaultOpen` · persist width
- 닫힘 시 **Quick Bubble**(선택) 으로 핵심 액션 유지 — 도메인 구현
- `Ctrl/Cmd+K` 전역 검색은 frame 레벨 (도메인 훅 연동)

### 5.3 Content

- 도메인 본문만 마운트 — **split·PiP·서브패널**은 도메인 내부 정책 (nexia: [`UIX-004` §3.4](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md))
- 라우트 전환 시 스크롤·입력 초안 복원은 도메인 store 책임
- `(embed)/` · `(auth)/` 는 MainShell **미사용**

### 5.4 Right Drawer

- `registry.right` — 속성 편집 · 에이전트 · **Cross-Tab 유틸** (도메인 정의)
- 아코디언·Pin 상태 persist (도메인 또는 `useLayoutStore` 확장)
- nexia **Time Axis Panel** · Agent Config 등 상세 → [`UIX-004` §4.2](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md)

### 5.5 SystemStatusBar

- `registry.statusBar` (1 줄) + `registry.statusPanel` (expanded)
- SYNC · room · run · violation 요약 — 도메인별 strip 필드
- expanded ≥300px · `useLayoutStore.statusBarExpanded`

---

## 6. `frame/` · Registry (코드 SSOT)

```text
apps/web/src/frame/
├── navigation/globalMenu.ts
├── registry/
│   ├── domainLayoutRegistry.ts    # left · content · right · headerActions · status*
│   └── layoutRegistry.ts          # Auth · embed 예외
├── layouts/MainShellLayout.tsx
├── drawers/LeftDrawer.tsx · RightDrawer.tsx
├── header/AppHeader.tsx
└── status/SystemStatusBar.tsx
```

```ts
// domainLayoutRegistry 슬롯 (모든 domainKey 공통 형태)
type DomainLayoutEntry = {
  left: () => Promise<{ default: ComponentType }>
  content: () => Promise<{ default: ComponentType }>
  right: () => Promise<{ default: ComponentType }>
  headerActions?: () => Promise<{ default: ComponentType }>
  statusBar?: () => Promise<{ default: ComponentType }>
  statusPanel?: () => Promise<{ default: ComponentType }>
  themePreset?: string
  drawerDefaults?: DrawerDefaults
}
```

**nexia 등록 예시** — [`UIX-004` §2.5](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md)

---

## 7. 전역 상태 모델

### 7.1 `useLayoutStore` (frame)

| 키 | 타입 | 설명 |
| :--- | :--- | :--- |
| `activeDomain` | `domainKey` | 현재 도메인 |
| `leftDrawer` | `{ open, width }` | Left Drawer |
| `rightDrawer` | `{ open, width }` | Right Drawer |
| `statusBarExpanded` | `boolean` | Status 패널 |
| `systemHealth` | `healthy` \| `degraded` \| `critical` | 전역 헬스 |

도메인 전용 (`activeTabId` · `navexPlacement` 등) 은 **도메인 store** — nexia: `useNexiaTabStore` · [`UIX-004` §7](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md).

### 7.2 상호작용 상태 (플랫폼)

| 상태 | UI 반응 |
| :--- | :--- |
| Idle | StatusBar 얇은 인디케이터 |
| Working | Content/Status 진행 표시 · 취소 액션 |
| NeedsApproval | AppHeader 또는 Status **승인 배너** (도메인 상세) |
| Error | 영역별 배지 + 복구 액션 |

---

## 8. 이벤트 흐름

1. 사용자 액션 (도메인 전환 · 드로어 토글 · 실행)
2. `useLayoutStore` / 도메인 store 갱신
3. registry 슬롯 리렌더
4. 승인·알림·감사 로그 (도메인)

**필수 플랫폼 이벤트**

| 이벤트 | 설명 |
| :--- | :--- |
| `DOMAIN_SWITCHED` | `activeDomain` 변경 |
| `DRAWER_TOGGLED` | L/R open·width |
| `SYSTEM_HEALTH_CHANGED` | 헬스 배지 |
| `STATUS_BAR_EXPANDED` | 하단 패널 |
| `WINDOW_DETACHED` / `WINDOW_RESTORED` | [`TDD-014`](../08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md) |

---

## 9. 접근성 · 성능 · 폴백

### 9.1 접근성

- 키보드만으로 Header → L → C → R → Status 순환
- ARIA 레이블 · 색상 + 텍스트 병기 · `prefers-reduced-motion` 대응

### 9.2 Layout SLO

| 항목 | 목표 |
| :--- | :--- |
| 도메인 전환 체감 | P95 ≤150ms |
| 드로어 열림 | P95 ≤120ms |
| 레이아웃 persist 복원 | ≤2s |
| 헬스 배지 반영 | 평균 ≤100ms |

### 9.3 폴백

- Right/Left 로딩 실패 → **Content 우선** · 해당 Drawer 재시도
- persist 손상 → `drawerDefaults` 초기화
- PiP/창 분리 실패 → 단일 창 MainShell 유지 ([`TDD-014`](../08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md))

---

## 10. 구현 체크리스트

- [ ] 5 영역이 `domainLayoutRegistry` 와 1:1 대응하는가?
- [ ] Content 외 영역에 main scroll 이 없는가?
- [ ] `domainKey` 전환 시 슬롯 4 종이 **동시 교체**되는가?
- [ ] `drawerDefaults` persist 가 도메인별로 복원되는가?
- [ ] 장애 시 Content 가 유지되는가?

---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| nexia 도메인 셸 | [NEXIA MainShell · 레이아웃 v1.0 (UIX-004)](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| 도메인 구조 SSOT | [NEXA OS · 도메인 구조 통합 (TDD-071)](../08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) |
| OS 설계 표준 | [NEXA OS 설계 표준 (TDD-001)](../08_TDD/NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| 팝아웃 MVP | [NEXIA 레이아웃 · 팝아웃 MVP (MVP-001)](../03_MVP/03_MVP_NEXIA_레이아웃팝아웃MVP.md) |
| PiP · 멀티윈도우 | [멀티윈도우 · Document PiP (TDD-014)](../08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md) |
| 멀티창 동기화 | [멀티창 동기화 로드맵 (TDD-015)](../08_TDD/NEXIA/08_TDD_NEXIA_멀티창동기화구현로드맵.md) |
| 단축키 PRD | [워크스페이스 단축키 및 레이아웃 (PRD-009)](../05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스단축키레이아웃.md) |

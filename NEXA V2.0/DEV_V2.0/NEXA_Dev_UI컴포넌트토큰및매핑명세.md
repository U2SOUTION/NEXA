---
created: 2026-06-19
updated: 2026-07-17
parent_doc: 
terms_standard: []
doc_id: DEV-UIX-TOKENS
title: "NEXA Dev · UI 컴포넌트 토큰 및 매핑 명세"
category: DEV
domain: NEXA
status: active
implements_doc: UIX-005
see_also:
  - NEXA_Dev_UIUX_레이아웃구조규격.md
  - NEXA_Dev_구현파일구조뼈대.md
  - ../APP_V2.0/07_UIUX/07_UIUX_NEXIA_v0UI프롬프트셋_v1.0.md
  - ../APP_V2.0/07_UIUX/07_UIUX_NEXIA_컴포넌트트리뼈대.md
  - ../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md
terms_nexa:
  - MainShell
  - NexiaTabBar
  - tabId
  - themePreset
  - office-light
  - NexaonShell
  - GraphCanvas
  - v0
  - UI-L0
  - semantic token
  - Source
  - Validation Gate
  - CAT
  - PMS
---

# NEXA Dev · UI 컴포넌트 토큰 및 매핑 명세

> [!abstract] Normative · v0 · Dev UI SSOT
> **NEXA Dev** UI 를 **v0.dev**에서 뽑아 `apps/web` 에 이식할 때의 **디자인 토큰 · 컴포넌트 이름 · 파일 경로 · shadcn 매핑** 단일 정본. App [`UIX-005`](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_v0UI프롬프트셋_v1.0.md) · [`TDD-001` §Theme](../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) · [`UIX-008`](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_컴포넌트트리뼈대.md) 계승 + **Dev 보강**(Source 스코프 · Logex 캔버스 · Gate · +4).

> [!summary] 문서 지도
>
> - [[#v0 세션 주입 순서]]
> - [[#토큰 3계층]]
> - [[#시맨틱 토큰 SSOT]]
> - [[#Surface · shadcn 매핑]]
> - [[#Preset office-light]]
> - [[#Logex · GraphCanvas 토큰]]
> - [[#간격 · 밀도 · 타이포]]
> - [[#레이아웃 치수 토큰]]
> - [[#MainShell 컴포넌트 매핑]]
> - [[#Nexia 7탭 · Workspace 매핑]]
> - [[#Nexaon · React Flow 노드 토큰]]
> - [[#상태 · 시맨틱 UI 매핑]]
> - [[#Dev 보강 UI 매핑]]
> - [[#Store · 컴포넌트 구독]]
> - [[#v0 Phase · 산출물 매핑]]
> - [[#shadcn · 의존성]]
> - [[#금지 · v0 체크리스트]]

표식: **■** MVP v0 필수 · **★** Dev 전용 · **◇** Phase 2

---

## v0 세션 주입 순서

> `구현` · [`UIX-005`](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_v0UI프롬프트셋_v1.0.md) + **본 문서** Dev 보강

```text
1. NEXA-Platform/v0/rules.md
2. 본 문서 §토큰 3계층 ~ §레이아웃 치수          ← Dev 토큰·매핑 SSOT
3. NEXA-Platform/v0/prompts/_file-tree.md
4. NEXA-Platform/v0/prompts/_system.md
5. Phase별 task 프롬프트 (UI-L0 … UI-L3+)
```

| Dev v0 목표 | 추가 주입 섹션 |
| :--- | :--- |
| MainShell | §MainShell · §레이아웃 치수 · §Surface |
| 7 탭 셸 | §Nexia 7 탭 · §Store |
| Logex/Nexaon | §Logex · GraphCanvas · §Nexaon 노드 |
| 검증·배포 UI | §Dev 보강 · §상태 매핑 |

**출력 규칙:** 모든 TSX 파일 첫 줄 `// @nexa-path: apps/web/src/...` · mock `// @v0-mock`

---

## 토큰 3 계층

> `정의` · [`TDD-001` §Theme](../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md)

```text
① Semantic (고정)     Safety · Status · Command — 사용자·프리셋이 덮어쓰기 ✗
② Surface (가변)      shadcn bg-background · border · primary …
③ Preset (도메인)     domainLayoutRegistry.themePreset → data-theme-preset
```

| 계층 | CSS / Tailwind | v0 사용 규칙 |
| :--- | :--- | :--- |
| **① Semantic** | `--status-ok` → `text-status-ok` | StatusBar · Run · SHACL · Gate **필수** |
| **② Surface** | `bg-background` `text-foreground` | Drawer · Card · TabBar · 일반 버튼 |
| **③ Preset** | `data-theme-preset="office-light"` | nexia Dev·App **기본** |

**우선순위:** ① > ③ > `useUiStore.themeMode` (light/dark) > 사용자 accent

**Dev `domainKey: nexia`:** `themePreset: 'office-light'` — [`UIX-004` §2.1](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md)

---

## 시맨틱 토큰 SSOT

> `구현` · 경로: `apps/web/src/system/styles/tokens/semantic.css`

| CSS 변수 | Tailwind | HSL (기본값) | UI 용도 | v0 클래스 예 |
| :--- | :--- | :--- | :--- | :--- |
| `--safety-critical` | `safety-critical` | `0 84% 42%` | 긴급 정지 · Grade3 | `bg-safety-critical text-white` |
| `--safety-warning` | `safety-warning` | `38 92% 50%` | 임계 초과 · 2 등급 대기 | `border-safety-warning` |
| `--status-ok` | `status-ok` | `142 71% 45%` | SYNC OK · Run 완료 | `text-status-ok` · 연결 dot |
| `--status-degraded` | `status-degraded` | `45 93% 47%` | 지연 · 부분 장애 | `text-status-degraded` |
| `--status-offline` | `status-offline` | `220 9% 46%` | sync 끊김 | `text-status-offline` |
| `--command-pending` | `command-pending` | `217 91% 60%` | Run·ACK 대기 | `text-command-pending animate-pulse` |
| `--command-failed` | `command-failed` | `0 84% 42%` | Run 실패 · Gate 거부 | `text-command-failed` |
| `--telemetry-muted` | `telemetry-muted` | `220 14% 71%` | 보조 메트릭 · 차트 축 | `text-telemetry-muted` |

```css
/* semantic.css — v0 globals에 동일 값 복제 가능 */
:root {
  --safety-critical: 0 84% 42%;
  --safety-warning: 38 92% 50%;
  --status-ok: 142 71% 45%;
  --status-degraded: 45 93% 47%;
  --status-offline: 220 9% 46%;
  --command-pending: 217 91% 60%;
  --command-failed: 0 84% 42%;
  --telemetry-muted: 220 14% 71%;
}
```

| UI 패턴 | 시맨틱 매핑 | shadcn 보조 |
| :--- | :--- | :--- |
| SHACL violation 노드/행 | `ring-2 ring-destructive` + `text-command-failed` | `Badge variant="destructive"` |
| AI draft 노드 | `border-dashed border-muted-foreground/50` | — |
| `systemHealth: healthy` | `text-status-ok` | `Badge` outline green |
| `systemHealth: degraded` | `text-status-degraded` | — |
| `systemHealth: critical` | `text-safety-critical` | Header 배지 fill |
| SYNC strip | dot `bg-status-ok` / `bg-status-offline` | `text-xs` |

> [!warning] `원칙`
> Safety·Status UI 에 `bg-primary` · 임의 hex **✗** — semantic 토큰만.

---

## Surface · shadcn 매핑

> `구현` · shadcn/ui (Radix) + Tailwind

| shadcn 토큰 | CSS 변수 | v0 용도 |
| :--- | :--- | :--- |
| `background` | `--background` | MainShell · Drawer · Content 배경 |
| `foreground` | `--foreground` | 본문 텍스트 |
| `card` | `--card` | 패널 · MetricCard |
| `muted` | `--muted` | 비활성 탭 · placeholder |
| `muted-foreground` | `--muted-foreground` | 보조 라벨 · Status strip |
| `border` | `--border` | Drawer 구분선 · 노드 border |
| `input` | `--input` | 폼 필드 |
| `primary` | `--primary` | **Run ▶** · 주요 CTA (Safety ✗) |
| `secondary` | `--secondary` | 보조 툴바 버튼 |
| `destructive` | `--destructive` | 삭제 · 위험 (일반 UI) |
| `ring` | `--ring` | focus-visible |
| `accent` | `--accent` | hover · selected tree row |

### shadcn 컴포넌트 → NEXA 역할

| shadcn | NEXA 컴포넌트·영역 | variant / notes |
| :--- | :--- | :--- |
| `Button` | Toolbar · Run · Gate 승인 | `size="sm"` `h-8` 툴바 |
| `Tabs` / custom TabBar | `NexiaTabBar` | underline active · `aria-selected` |
| `ScrollArea` | Drawer · RunPanel · Chat | **유일 스크롤** 준수 |
| `Separator` | Drawer header · TabBar 하단 | `orientation="horizontal"` |
| `Badge` | sub-mode · scope · run step | `outline` / `secondary` |
| `ResizablePanelGroup` | `NexiaWorkspace` · `NexaonShell` | `direction` horizontal/vertical |
| `Sheet` | 모바일 Drawer (◇) | desktop **우선** ≥1280px |
| `Tooltip` | Toolbar icon | `aria-label` 병행 |
| `Select` · `Input` | PropertiesPanel · Header | `text-sm` |
| `Card` | MetricCard · placeholder 탭 | `p-4` |
| `DropdownMenu` | DeployMenu · GraphSelector | — |
| `Avatar` | CollaboratorAvatars (◇) | — |
| `Skeleton` | 로딩 (◇) | — |

---

## Preset office-light

> `구현` · nexia Dev·App 기본 · `data-theme-preset="office-light"`

| Surface 변수 | HSL (office-light) | 비고 |
| :--- | :--- | :--- |
| `--background` | `0 0% 99%` | 낮은 자극 밝은 배경 |
| `--foreground` | `222 47% 11%` | 본문 |
| `--card` | `0 0% 100%` | 패널 |
| `--muted` | `220 14% 96%` | Rail · 비활성 |
| `--muted-foreground` | `220 9% 46%` | 보조 텍스트 |
| `--border` | `220 13% 91%` | 1px 구분 |
| `--primary` | `222 47% 20%` | CTA — semantic 대체 ✗ |
| `--radius` | `0.375rem` | `rounded-md` 기본 |

```html
<!-- MainShell 루트 -->
<html data-theme-preset="office-light" class="light">
```

**밀도 톤:** Palantir·IDE 형 — consumer chat bubble 스타일 **✗** · `text-sm` 기본 · compact toolbar

---

## Logex · GraphCanvas 토큰

> `비주얼` · Dev 보강 — [[NEXA_Dev_UIUX_레이아웃구조규격#Logex 캔버스 비주얼 스킨]]

| 토큰 ID | 값 (v0 권장) | 적용 대상 |
| :--- | :--- | :--- |
| `--logex-canvas-bg-from` | `#2a2d32` | React Flow `Background` gradient start |
| `--logex-canvas-bg-to` | `#1e2124` | gradient end |
| `--logex-grid-color` | `rgba(255,255,255,0.04)` | dot/grid |
| `--logex-node-bg` | `rgba(40,44,48,0.85)` | 노드 fill — 배경 블렌드 |
| `--logex-node-border` | `rgba(255,255,255,0.12)` | 기본 노드 |
| `--logex-port-flow` | `#ff8c42` | 오렌지 — 데이터 흐름 포트 |
| `--logex-port-exec` | `#39ff14` | 네온 그린 — 실행·활성 edge |
| `--logex-node-footer` | `#0a0a0a` | 노드 하단 상태·로그 베이스 |
| `--logex-drawer-glass` | `rgba(30,33,36,0.72)` | L/R Drawer backdrop-blur |

```tsx
// GraphCanvas wrapper — v0 예시
<div className="h-full min-h-0 bg-gradient-to-b from-[var(--logex-canvas-bg-from)] to-[var(--logex-canvas-bg-to)]">
  <ReactFlow /* preventScrolling */ />
</div>
```

| Drawer (Logex 작업 시) | 클래스 |
| :--- | :--- |
| Glassmorphism | `bg-[var(--logex-drawer-glass)] backdrop-blur-md border-border/40` |

> App·Dev **동형 스킨** — v0 에서 Graph 영역만 dark canvas · 셸은 office-light 유지.

---

## 간격 · 밀도 · 타이포

> `구조` · engineering density

| 토큰 | px | Tailwind | 적용 |
| :--- | ---: | :--- | :--- |
| `--nexa-header-h` | 56 | `h-14` | `AppHeader` |
| `--nexa-statusbar-h` | 30 | `h-[30px]` | `SystemStatusBar` |
| `--nexa-toolbar-h` | 40 | `h-10` | `NexaonToolbar` · TabBar |
| `--nexa-tree-row-h` | 28 | `h-7` | ExplorerTree row |
| `--nexa-tabbar-pad-x` | 16 | `px-4` | Tab item |
| `--nexa-drawer-pad` | 12 | `p-3` | Drawer body |
| `--nexa-panel-gap` | 8 | `gap-2` | split pane gap |
| `--nexa-radius-panel` | 6 | `rounded-md` | inner panel |

| 타이포 | 클래스 | 용도 |
| :--- | :--- | :--- |
| **UI 기본** | `text-sm` | Drawer · Form · Tab |
| **Status strip** | `text-xs tabular-nums` | SYNC ms · node count |
| **Toolbar label** | `text-xs font-medium` | segment · badge |
| **Heading panel** | `text-sm font-semibold` | Drawer section |
| **Canvas node title** | `text-xs font-medium` | React Flow node |
| **Monospace** | `font-mono text-xs` | GPIO · run_id · code |

**Font:** `font-sans` (Inter/Geist/system) — canvas code 만 `font-mono`

---

## 레이아웃 치수 토큰

> `원칙` · [`UIX-004` §3.4](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) · Dev 레이아웃 규격

| 영역 | 토큰 | min | default | max |
| :--- | :--- | ---: | ---: | ---: |
| **Left Drawer** | `--drawer-left-w` | 240 | 280 | 400 |
| **Right Drawer** | `--drawer-right-w` | 280 | 320 | 480 |
| **OmnixRail** | `--omnix-rail-w` | 0 | 320 | 420 |
| **StatusPanel expanded** | `--status-panel-h` | 300 | 360 | 480 |
| **RunPanel** | `--run-panel-h` | 0 | 180 | 240 |
| **SpecsPreview** | `--specs-split-pct` | 0% | 32% | 40% |
| **최소 패널** | `--panel-min` | 240 | — | — |

| MainShell CSS 골격 | 클래스 |
| :--- | :--- |
| Root | `h-screen flex flex-col overflow-hidden` |
| Body row | `flex flex-1 min-h-0` |
| Content | `flex-1 min-h-0 overflow-auto` **only** |
| Drawer body | `overflow-y-auto min-h-0` |

---

## MainShell 컴포넌트 매핑

> `구현` · UI-L0 · [`UIX-008` §0](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_컴포넌트트리뼈대.md)

| UI 컴포넌트 | `@nexa-path` | registry 슬롯 | shadcn · 패턴 | Store |
| :--- | :--- | :--- | :--- | :--- |
| `MainShellLayout` | `frame/layouts/MainShellLayout.tsx` | — | flex column shell | `useLayoutStore` |
| `AppHeader` | `frame/header/AppHeader.tsx` | — | `h-14 border-b` | `activeDomain` · `systemHealth` |
| `GlobalMainMenu` | `frame/navigation/globalMenu.ts` | — | Tabs/List | `activeDomain` |
| `LeftDrawer` | `frame/drawers/LeftDrawer.tsx` | — | Resizable · ScrollArea | `leftDrawer` |
| `RightDrawer` | `frame/drawers/RightDrawer.tsx` | — | 동일 | `rightDrawer` |
| `SystemStatusBar` | `frame/status/SystemStatusBar.tsx` | — | `h-[30px] text-xs` | `statusBarExpanded` |
| `StatusPanelHost` | `frame/status/StatusPanelHost.tsx` | — | expand panel | `statusBarExpanded` |
| `NexiaLeftNav` | `domains/nexia/views/left/NexiaLeftNav.tsx` | `registry.left` | ScrollArea + tree | `activeTabId` |
| `NexiaContent` | `domains/nexia/views/content/NexiaContent.tsx` | `registry.content` | TabBar sticky | `activeTabId` |
| `NexiaWorkspace` | `domains/nexia/views/content/NexiaWorkspace.tsx` | (content 내부) | ResizablePanelGroup | `useNexiaWorkspaceStore` |
| `OmnixRail` | `domains/nexia/views/content/OmnixRail.tsx` | `panelId: nexia.omnix-rail` | Chat shell | `useOmnixStore` |
| `TabWorkspace` | `domains/nexia/views/content/TabWorkspace.tsx` | `panelId: nexia.tab-workspace` | active tab host | `activeTabId` |
| `NexiaRightPanel` | `domains/nexia/views/right/NexiaRightPanel.tsx` | `registry.right` | Segment tabs | `activeTabId` |
| `NexiaHeaderActions` | `domains/nexia/components/NexiaHeaderActions.tsx` | `registry.headerActions` | Button group | session · run |
| `NexiaStatusBar` | `domains/nexia/views/status/NexiaStatusBar.tsx` | `registry.statusBar` | semantic strips | run · sync |
| `NexiaStatusPanel` | `domains/nexia/views/status/NexiaStatusPanel.tsx` | `registry.statusPanel` | timeline list | run events |

```ts
// domainLayoutRegistry.nexia — 슬롯 6 + preset
nexia: {
  left, content, right, headerActions, statusBar, statusPanel,
  themePreset: 'office-light',
  drawerDefaults: { left: { openPolicy: 'recommended', defaultOpen: true },
                    right: { openPolicy: 'recommended', defaultOpen: true } },
}
```

---

## Nexia 7 탭 · Workspace 매핑

> `구조` · [`TDD-056`](../APP_V2.0/08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) · UI-L1

### TabBar SSOT

| `tabId` | 라벨 | 아이콘 (lucide) | `@nexa-path` Content | Left (주) | Right (주) |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `omnix` | Omnix | `Sparkles` | `tabs/omnix/OmnixTab.tsx` | RequestQueue | Agent · TimeAxis |
| `normex` | Normex | `BookOpen` | `tabs/normex/NormexTab.tsx` | TermTree · MOC | SpecInspector |
| `logex` | Logex | `Workflow` | `tabs/logex/LogexTab.tsx` | ProjectList / ExplorerTree | FlowProps / NexaonRightTabs |
| `scribx` | Scribx | `Code2` | `tabs/scribx/ScribxTab.tsx` | DocTree | Outline · Lint |
| `vivex` | Vivex | `Image` | `tabs/vivex/VivexTab.tsx` | MediaLibrary | Transcribe |
| `twinex` | Twinex | `Box` | `tabs/twinex/TwinexTab.tsx` | CellList | OTA · Serial |
| `navex` | Navex | `Network` | `tabs/navex/NavexTab.tsx` | InfraTree | ConnectionLog |

```ts
// config/nexiaTabs.ts
export const NEXIA_TABS = [
  { tabId: 'omnix',  label: 'Omnix',  route: '/nexia/omnix',  icon: 'Sparkles' },
  { tabId: 'normex', label: 'Normex', route: '/nexia/normex', icon: 'BookOpen' },
  // … 7개 고정 — 추가·대체 ✗
] as const
```

### Workspace L1 (Content 내부)

```text
NexiaContent
├── NexiaTabBar                    sticky top-0 z-10 bg-background border-b
└── NexiaWorkspace                 flex-1 min-h-0
    ├── OmnixRail                  panelId: nexia.omnix-rail
    └── TabWorkspace               panelId: nexia.tab-workspace
        └── switch(activeTabId) → tabs/*Tab
            logex + ontology → NexaonEntry → NexaonShell
```

| `panelId` | 컴포넌트 | v0 Resizable |
| :--- | :--- | :--- |
| `nexia.omnix-rail` | `OmnixRail` | horizontal first pane |
| `nexia.tab-workspace` | `TabWorkspace` | second pane flex-1 |
| `nexia.graph-canvas` | `GraphCanvas` | Nexaon 내부 |
| `nexia.run-panel` | `RunPanel` | collapsible bottom |
| `nexia.specs-preview` | `SpecsPreview` | optional right split |

---

## Nexaon · React Flow 노드 토큰

> UI-L2~L4 · `engines/react-flow/` + `modules/nexaon/`

### 노드 kind → 시각 매핑

| `kind` | 헤더 색 (v0) | Tailwind / CSS | subtitle |
| :--- | :--- | :--- | :--- |
| `class` | blue | `border-t-4 border-t-blue-500` | — |
| `asset` | green | `border-t-4 border-t-emerald-500` | assetId |
| `pin` | amber | `border-t-4 border-t-amber-500` | `GPIO: {n}` |
| `port` | neutral | `border-t-4 border-t-slate-400` | — |
| `sensor` | cyan | `border-t-4 border-t-cyan-500` | unit |

### 노드 상태 → 클래스

| 상태 필드 | 값 | 클래스 |
| :--- | :--- | :--- |
| `shaclStatus` | `violation` | `ring-2 ring-destructive` |
| `shaclStatus` | `ok` | — |
| `draftSource` | `ai` | `border-dashed` |
| `draftSource` | `human` | `border-solid` |
| selected | true | `ring-2 ring-primary` |

### 엔진 파일 매핑

| UI | `@nexa-path` | 비고 |
| :--- | :--- | :--- |
| `NexaonShell` | `modules/nexaon/NexaonShell.tsx` | 3 분할 host |
| `NexaonToolbar` | `modules/nexaon/views/NexaonToolbar.tsx` | `h-10` |
| `GraphCanvas` | `modules/nexaon/views/GraphCanvas.tsx` | `@xyflow/react` only here |
| `ClassNode` | `engines/react-flow/nodeTypes/ClassNode.tsx` | import from engines |
| `AssetNode` | `engines/react-flow/nodeTypes/AssetNode.tsx` | |
| `PinNode` | `engines/react-flow/nodeTypes/PinNode.tsx` | |
| `RunPanel` | `modules/nexaon/views/RunPanel.tsx` | SSE list mock |
| `ExplorerTree` | `modules/nexaon/panels/ExplorerTree.tsx` | Left when ontology |
| `PropertiesPanel` | `modules/nexaon/panels/PropertiesPanel.tsx` | Right |
| `ApprovalGatePanel` | `modules/nexaon/panels/ApprovalGatePanel.tsx` | 승인 A/B/C |
| `useNexaonStore` | `modules/nexaon/store/useNexaonStore.ts` | graph · runId |

> [!check] `원칙`
> `nodeTypes` 는 **engines/** 에만 정의 · `GraphCanvas` 에서 import — v0 역방향 **✗**

---

## 상태 · 시맨틱 UI 매핑

> Dev 검증 · App 동형

### `systemHealth` (Header)

| 값 | Badge | 색 |
| :--- | :--- | :--- |
| `healthy` | `OK` | `text-status-ok` |
| `degraded` | `Degraded` | `text-status-degraded` |
| `critical` | `Critical` | `bg-safety-critical text-white` |

### Run · SSE 이벤트 (StatusBar · RunPanel)

| 이벤트 타입 | 아이콘 | 색 | 컴포넌트 |
| :--- | :--- | :--- | :--- |
| `run_started` | `Play` | `text-command-pending` | RunPanel row |
| `step:*` | `Cog` | `text-foreground` | StepChip |
| `shacl_violation` | `AlertTriangle` | `text-command-failed` | ViolationJumpLink |
| `run_completed` | `CheckCircle` | `text-status-ok` | — |
| `run_failed` | `XCircle` | `text-command-failed` | — |

### Dev 상호작용 상태 ★

| 상태 | Header | StatusBar | Content |
| :--- | :--- | :--- | :--- |
| **Idle** | — | 얇은 dot `status-ok` | — |
| **Working** | — | `command-pending` spinner | progress bar |
| **NeedsApproval** | 승인 배너 `safety-warning` border | Gate 요약 | `ApprovalGatePanel` |
| **Error** | `critical` badge | `command-failed` | 영역별 Alert |

### `logexSubMode`

| 모드 | UI | Badge |
| :--- | :--- | :--- |
| `default` | LogexFlowView | — |
| `ontology` | NexaonShell | `Badge` "Nexaon" |

---

## Dev 보강 UI 매핑 ★

> Source 스코프 · +4 · Gate — [[NEXA_Dev_구현파일구조뼈대]]

| UI 컴포넌트 | `@nexa-path` | 토큰 · 패턴 | Phase |
| :--- | :--- | :--- | :--- |
| `SourceScopeBadge` | `domains/nexia/scope/SourceScopeBadge.tsx` | `Badge variant="outline"` · "Source" | UI-L1+ |
| `ValidationGateBanner` | `domains/nexia/components/ValidationGateBanner.tsx` | `border-safety-warning bg-muted` | UI-L2+ |
| `DeployGateButton` | `NexiaHeaderActions` 내부 | `primary` · disabled until pass | UI-L2+ |
| `CatTimeline` ★ | `modules/cat/CatTimeline.tsx` | Read-only · `text-xs` · LLM 합성 | ◇ |
| `PmsShell` ★ | `modules/pms/PmsShell.tsx` | Drawer/패널 · WBS tree | ◇ |
| `AssetLedgerTable` ★ | `modules/pms/views/AssetLedger.tsx` | `Table` compact | ◇ |
| `CodegenPackIndicator` ★ | `modules/scribx/codegen/PackBadge.tsx` | Pack id · version | UI-L3+ |

### Source vs Instance 시각 구분

| 스코프 | Badge | 데이터 경로 표시 |
| :--- | :--- | :--- |
| **source** | `Source` · `border-amber-500/50` | `projects/.../source/` |
| **instance** | `Instance` · `border-status-ok/50` | `projects/.../instance/` |

### +4 배치 (UI 미정 — v0 스텁)

| 레이어 | v0 스텁 위치 | 컴포넌트 |
| :--- | :--- | :--- |
| **CAT** | StatusBar 확장 **또는** 하단 strip | `CatTimeline` |
| **PMS** | Right Drawer 탭 **또는** 전용 패널 | `PmsShell` |
| **Admin** | Header menu | Gate · deploy |
| **Ontex** | `domainKey` 전환 (◇) | 별도 domain |

---

## Store · 컴포넌트 구독

> [`UIX-008` §4](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_컴포넌트트리뼈대.md)

| Store | `@nexa-path` | 키 | 구독 컴포넌트 |
| :--- | :--- | :--- | :--- |
| `useLayoutStore` | `store/useLayoutStore.ts` | `activeDomain` · `leftDrawer` · `rightDrawer` · `statusBarExpanded` · `systemHealth` | MainShell · Drawer · Header |
| `useNexiaTabStore` | `domains/nexia/store/useNexiaTabStore.ts` | `activeTabId` · `logexSubMode` | TabBar · L/R · Content |
| `useNexiaWorkspaceStore` | `domains/nexia/store/useNexiaWorkspaceStore.ts` | `omnixRail` · `splitRoot` · `detachedPanels` | NexiaWorkspace |
| `useNexiaSessionStore` | `domains/nexia/store/useNexiaSessionStore.ts` | `projectId` · `roomId` | Header · ExplorerTree |
| `useNexaonStore` | `modules/nexaon/store/useNexaonStore.ts` | selection · `runId` · layout | NexaonShell |
| `useDataScope` ★ | `domains/nexia/scope/useDataScope.ts` | `source` \| `instance` | API · Badge |
| `usePmsStore` ★ | `modules/pms/store/usePmsStore.ts` | wbs · ledger | PmsShell |
| `useUiStore` | `store/useUiStore.ts` | `themeMode` | Header toggle |

---

## v0 Phase · 산출물 매핑

> [`UIX-005`](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_v0UI프롬프트셋_v1.0.md) + Dev 확장

| Phase | 프롬프트 | 산출 컴포넌트 | 이식 루트 | 본 문서 섹션 |
| :--- | :--- | :--- | :--- | :--- |
| **UI-L0** | `UI-L0-main-shell.md` | MainShell 5 영역 | `frame/` | §MainShell · §레이아웃 치수 |
| **UI-L1** | `nexia-shell.md` | 7 탭 · L/R/Status | `domains/nexia/` | §7 탭 · §Store |
| **UI-L2** | `nexaon-graph-workspace.md` | NexaonShell · Graph | `modules/nexaon/` · `engines/` | §Logex · §Nexaon |
| **UI-L3** ★ | (신규) `dev-source-scope.md` | ScopeBadge · Gate banner | `domains/nexia/scope/` | §Dev 보강 |
| **UI-L4** ★ | (신규) `scribx-codegen.md` | Scribx + Pack UI | `modules/scribx/codegen/` | §Dev 보강 |
| **UI-L5** | `nexaon-run-panel.md` (TBD) | SSE live | hooks wiring | §상태 매핑 |
| **UI-L6** ★ | (신규) `dev-pms-cat.md` | PMS · CAT stubs | `modules/pms/` · `cat/` | §Dev 보강 |

### v0 원클릭 번들 (Dev · UI-L1 예)

```powershell
Get-Content "NEXA-Platform/v0/rules.md",
            "NEXA V2.0/DEV_V2.0/NEXA_Dev_UI컴포넌트토큰및매핑명세.md",
            "NEXA-Platform/v0/prompts/_file-tree.md",
            "NEXA-Platform/v0/prompts/_system.md",
            "NEXA-Platform/v0/prompts/nexia-shell.md" | Set-Clipboard
```

---

## shadcn · 의존성

```bash
# UI-L0 ~ L1
npx shadcn@latest add button tabs scroll-area separator badge
npx shadcn@latest add select input resizable sheet tooltip card
npx shadcn@latest add dropdown-menu avatar alert table

# UI-L2+ Graph
npm install @xyflow/react
npx shadcn@latest add resizable
```

| 패키지 | 용도 |
| :--- | :--- |
| `@xyflow/react` | GraphCanvas **only** |
| `zustand` | store 스케치 |
| `lucide-react` | 아이콘 SSOT |
| `class-variance-authority` | shadcn variant |
| `tailwind-merge` · `clsx` | `cn()` |

---

## 금지 · v0 체크리스트

### 금지 매핑

| 금지 | 이유 |
| :--- | :--- |
| Vue · Quasar · pages router | Stack 고정 Next App Router |
| React Flow 로 MainShell | Graph **내부만** |
| `bg-primary` on Safety UI | semantic 위반 |
| body `overflow-y-auto` | Content 단일 scroll |
| 브라우저 → Ollama/agent-graph | 아키텍처 |
| `engines/` → `domains/` 역 import | 단방향 |
| 8 번째 `tabId` | TDD-056 |
| Memex · Graphx 등 구 명칭 | 정합 |

### 이식 체크리스트

- [ ] `@nexa-path` 헤더 모든 파일
- [ ] `@v0-mock` → real hooks 교체
- [ ] semantic 토큰 Status·Run·SHACL 적용
- [ ] Logex canvas 토큰 Graph 영역만
- [ ] `themePreset: office-light` + nexia registry
- [ ] 7 탭 `nexiaTabs.ts` SSOT
- [ ] Content `overflow-auto` only
- [ ] `v0/history/` URL 기록
- [ ] Dev ★ ScopeBadge · Gate (해당 Phase)

---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| v0 프롬프트 | [UIX-005 v0 UI 프롬프트셋](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_v0UI프롬프트셋_v1.0.md) |
| 컴포넌트 트리 | [UIX-008 컴포넌트 트리](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_컴포넌트트리뼈대.md) |
| 레이아웃 | [UIX-004 MainShell](../APP_V2.0/07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| Theme SSOT | [TDD-001 §Theme](../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| Dev 레이아웃 | [NEXA_Dev_UIUX_레이아웃구조규격](NEXA_Dev_UIUX_레이아웃구조규격.md) |
| Dev 파일 구조 | [NEXA_Dev_구현파일구조뼈대](NEXA_Dev_구현파일구조뼈대.md) |
| v0 rules | `NEXA-Platform/v0/rules.md` |

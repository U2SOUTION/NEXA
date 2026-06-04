# NEXA OS — 도메인 구조

| 항목 | 내용 |
| ---- | ---- |

| **역할** | NEXA Platform **`src/domains/`** 전체 도메인 목록·레지스트리·폴더 규약 SSOT |
| **레지스트리 (As-Is)** | `NEXA-Platform/src/frame/registry/domainRegistry.ts` |
| **레지스트리 (V2.1 To-Be)** | `apps/web/src/frame/registry/domainLayoutRegistry.ts` — 슬롯 + **`drawerDefaults`** · `statusBar` · `statusPanel` · `themePreset` |
| **상위 설계** | [`_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략-보강본.md`](./_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략-보강본.md) |

---

## 1. 도메인이란

**도메인(Domain)** 은 **NEXA 플랫폼** Header **전역 메뉴**에서 선택하는 **하나의 제품·업무 영역**입니다.

- **`nexia`:** 플랫폼 **핵심 지능** — 7탭·Omnix·고위험 승인·IoT 조율 SSOT (`docs/Nexia/`).
- **그 외 `domainKey`:** 각자 UI·업무 로직을 갖고, AI·규범·실행 payload는 **NEXIA·NEXA OS Grade**와 **연결** — [`정체성 SSOT`](../_NEXA-플랫폼·메타-OS·NEXIA·도메인%20—%20정체성%20SSOT.md) §3.

- UI 코드: `src/domains/{folder}/`
- 레이아웃 조립: `frame/registry/domainRegistry.ts` — **lazy import**로 left / content / right / headerActions 슬롯 주입
- **도메인 전환** = registry 항목 교체 → Left Drawer · Content · Right Drawer · (선택) Header Actions 동시 교체

```text
전역 메뉴 (domainKey)
       │
       ▼
domainRegistry[domainKey]
       │
       ├── left    → domains/*/views/left/*
       ├── content → domains/*/*Domain.vue 또는 views/content/*
       ├── right   → domains/*/views/right/*  (null → DefaultRightPanel fallback)
       ├── drawerDefaults → L/R 드로어 openPolicy · autoOpen (§2.1)
       └── headerActions → domains/*/components/* (선택)
```

### 프론트 `src/` 4대 축 (도메인 관점)

| 경로           | 역할                                               | 도메인과의 관계                                                   |
| -------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| **`frame/`**   | `MainLayout`, `domainRegistry.ts`, `router/`, 인증 | 도메인 **슬롯 호스트** — 비즈니스 로직 없음                       |
| **`domains/`** | 메뉴·기능 단위 UI·도메인 스토어                    | **본 문서 SSOT** — `views/left` · `views/content` · `views/right` |
| **`engines/`** | 차트·Tiptap·다이어그램 등 **UI 금지** 순수 로직    | 도메인에서 import — engines → domains 역방향 **금지**             |
| **`system/`**  | 공통 UI·Pinia·Zod·CSS·boot                         | 전 도메인 공용 — `@system`, `@engines` alias                      |

---

## 2. 레지스트리 슬롯 규약

`domainRegistry.ts` (As-Is) / `domainLayoutRegistry.ts` (V2.1) 공통 개념:

| 슬롯                                | 필수      | 설명                                                                                                                                         |
| ----------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **`left`**                          | ✅        | Left Drawer — 도메인 **서브 내비**·트리·채널 목록 (전역 메뉴 아님)                                                                           |
| **`content`**                       | ✅        | 메인 작업 영역 — **유일한 main 세로 스크롤** 내부                                                                                            |
| **`right`**                         | ✅        | Right Drawer — `domains/*/views/right/*` · As-Is `null` → **`DefaultRightPanel`** fallback · **V2.1** 도메인별 전용 패널 필수 (보강본 §1677) |
| **`headerActions`**                 | 선택      | Header 우측 — 도메인 전용 액션 버튼                                                                                                          |
| **`drawerDefaults`**                | ✅ (V2.1) | L/R 드로어 **openPolicy**·`autoOpen`·`emptyMessage` — §2.1 · runtime은 **`useLayoutStore`**                                                  |
| **`statusBar`** / **`statusPanel`** | V2.1      | 하단 시스템 상태바 도메인 슬롯                                                                                                               |
| **`themePreset`**                   | V2.1      | `power-grid` · `office-light` 등 산업 프리셋                                                                                                 |

**`right` fallback (As-Is)**: registry `right: null` → `getRightSidebarComponent()`가 `@frame/views/common/DefaultRightPanel.vue` 로드 (우측 드로어 **표시됨**).

**V2.1 `right` 목표 (보강본)**: 20키 전부 `views/right/{Domain}RightPanel.tsx` 등록 — As-Is 전용 파일 없는 9키는 **신규 생성** 대상 (§3 **right** 열 `→ To-Be` 참조).

**As-Is 레거시 `behavior`**: `domainRegistry.ts`의 `DomainBehavior` / `DEFAULT_BEHAVIOR` — **UI 미연동** · V2.1 **`drawerDefaults`(L/R)** 로 대체 (§2.1).

### 2.1 드로어 정책 SSOT (`drawerDefaults`)

> **목적**: 도메인마다 L/R 드로어 **열림 강도(정책)** 를 registry에 선언하고, 사용자 **기억 vs 기본** 선택과 **runtime store**로 자율성을 타협한다.  
> **3층 분리**: **registry = 정책** · **store = 실행 상태** · **사용자 설정 = 기억 모드**

#### 타입 (V2.1 · `domainLayoutRegistry.ts`)

```ts
type DrawerOpenPolicy =
  | 'required' // UX상 사실상 필수 — remember로 영구 closed 불가 · 재진입 시 open
  | 'recommended' // registry defaultOpen 따름 · remember ON이면 사용자 마지막 상태
  | 'optional' // 기본 closed(또는 defaultOpen:false) · remember ON이면 사용자 존중
  | 'hidden' // 해당 side 슬롯 없음 (right: null 등)

type DrawerSidePolicy = {
  openPolicy: DrawerOpenPolicy
  defaultOpen?: boolean // recommended/optional일 때 registry 기본 (미지정: rec→true, opt→false)
  autoOpen?: boolean // content 준비 후 1회 자동 open
  emptyMessage?: string // 패널 비었을 때 안내 (dev right 등)
}

type DomainDrawerDefaults = {
  left?: DrawerSidePolicy
  right?: DrawerSidePolicy
}
```

#### 사용자 설정 — 전역 `drawerMemoryMode`

| 모드                   | UI 라벨 (예)       | 도메인 전환 시                                              |
| ---------------------- | ------------------ | ----------------------------------------------------------- |
| **`remember`**         | 마지막 상태 기억   | `domainKey + side`별 저장값 우선 (`recommended`/`optional`) |
| **`reset-to-default`** | 항상 도메인 기본값 | registry `drawerDefaults`만 적용                            |

- **저장**: `userSettingsStore` 또는 V2.1 **`useLayoutStore`** + `localStorage`
- **키 예**: `layout.drawer.memoryMode` · `layout.drawer.byDomain.{domainKey}.{left|right}.open`
- **UI**: **설정 → 레이아웃 → “도메인 전환 시 드로어”** (전역 SSOT) · (선택) 드로어 헤더 **“이 도메인 기본값으로 초기화”**

#### 도메인 전환 시 해석 (SSOT)

```text
onDomainChange(domainKey):

  for side in [left, right]:
    policy = registry.drawerDefaults[side]
    if policy.openPolicy == 'hidden' → skip

    saved = loadSaved(domainKey, side)   // memoryMode == 'remember' 일 때만

    if memoryMode == 'remember' && saved != null && policy.openPolicy != 'required':
      open = saved.open
    else:
      open = resolveFromPolicy(policy)
        // required     → true
        // recommended  → policy.defaultOpen ?? true
        // optional     → policy.defaultOpen ?? false

    if policy.autoOpen && !userManuallyClosedThisSession(side):
      open = true

    useLayoutStore.setDrawerOpen(side, open)
```

#### §3 `drawerDefaults` 열 — 약어 · `openPolicy` × `drawerMemoryMode`

| 약어        | `openPolicy`               | 설명                                                                                      | `reset-to-default`             | `remember`                                                         | 비고                                |
| ----------- | -------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------ | ----------------------------------- |
| **req**     | `required`                 | **필수 open** — 패널 없으면 UX 깨짐                                                       | 항상 open                      | **재진입 시 open** (세션 중 닫기 허용 · **영구 closed 저장 불가**) | `dev` right (`R:req†`)              |
| **rec**     | `recommended`              | **권장 open** — registry `defaultOpen` 기본 true                                          | registry default               | 사용자 **마지막** open/closed                                      | §3 **L** 전부 · **R** 12키          |
| **opt**     | `optional`                 | **선택** — registry `defaultOpen` 기본 false · 닫힌 채 시작 OK                            | registry default (보통 closed) | 사용자 **마지막** 상태                                             | 랜딩·카탈로그·보조 패널 · **R** 6키 |
| **hid**     | `hidden`                   | **해당 side 없음** — 슬롯 미등록 · 정책 **skip**                                          | —                              | —                                                                  |                                     |
| **†**       | (수식)                     | **`autoOpen`** — content 준비 후 1회 자동 open · **`emptyMessage`** — 패널 비었을 때 안내 | 상위 `openPolicy` 따름         | 상위 `openPolicy` 따름                                             | `req`와 병기 (`R:req†`)             |
| **opt→rec** | `optional` → `recommended` | As-Is fallback only · **전용 RightPanel 신규 후** `rec`로 승격                            | `rec`와 동일                   | `rec`와 동일                                                       | `nexeed` · `network`                |

> **`required` + `remember`**: 제품 최소 UX 우선 — 닫아도 **다른 도메인 갔다 오면** 다시 open · 1회 안내: “이 도메인은 패널이 필요합니다”.

**§3 표기**: `L:rec · R:opt` = left `recommended` · right `optional`

#### Runtime SSOT — `useLayoutStore` (V2.1)

| 담당                 | 내용                                                                |
| -------------------- | ------------------------------------------------------------------- |
| **registry**         | `drawerDefaults` — 도메인별 **정책** (열어야 하는가)                |
| **`useLayoutStore`** | `leftOpen` · `rightOpen` · 폭 · `statusBarExpanded` — **현재 상태** |
| **사용자 설정**      | `drawerMemoryMode` + `byDomain` persisted state                     |

보강본 **Store-Driven Layout** (§5대 원칙 ⑤)과 동일 축 — [`_NEXA-OS-V2.1-설계-표준-…-보강본.md`](./_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략-보강본.md) `useLayoutStore` 참조.

---

## 3. `src/domains/` 등록 도메인 (`domainRegistry.ts`)

> **As-Is** `domainRegistry.ts` 전체 키(20) — **단일 통합 표**. V2.1은 동일 `domainKey`·폴더 유지, 슬롯 TSX 이식 + `statusBar` · `statusPanel` · `themePreset` 추가.  
> **`right`**: 전용 파일 없으면 **`DefaultRightPanel`** (registry `null`) · **V2.1** `→ views/right/*` = 신규 필수.  
> **`drawerDefaults`**: §2.1 **약어 · `openPolicy` × `drawerMemoryMode` 통합 표** · To-Be registry 목표.  
> **`erp-parts`**: left/right = **`erp/`** 슬롯 재사용 · `parts/views/right/PartsManagementRightPanel.vue`는 As-Is registry **미연결**.  
> **store (Pinia)**: **도메인** = `domains/{folder}/store/` · **전역** = `@system/store/*` · `—` = Pinia 미사용.

| 그룹  | `domainKey`    | 폴더         | 역할                                                    | left                              | content                              | right                                                                                       | headerActions                        | store (Pinia)                                                                                 | drawerDefaults (L/R) | 하위·특징                                                   | 백엔드                                       | V2.1                                                                                                                    |
| ----- | -------------- | ------------ | ------------------------------------------------------- | --------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **A** | `home`         | `home/`      | 플랫폼 **진입·랜딩** — NexaBlock·바로가기               | `views/left/HomeLeftNav.vue`      | `views/content/HomeView.vue`         | As-Is **`DefaultRightPanel`** (registry `null`) · → `views/right/HomeRightPanel.tsx`        | —                                    | **전역** `boardMenuStore` · `dashboardLayoutStore`                                            | L:rec · R:opt        | NexaBlock · 보드 바로가기                                   | — (프론트 only)                              | `themePreset: office-light` · TSX 이식 · globalMenu `/`                                                                 |
| **A** | `settings`     | `settings/`  | 계정·환경·플랫폼 옵션                                   | `views/left/SettingsSidebar.vue`  | `views/content/SettingsContent.vue`  | As-Is **`DefaultRightPanel`** · → `views/right/SettingsRightPanel.tsx`                      | —                                    | **도메인** `settingsStore` · **전역** `userSettingsStore`                                     | L:rec · R:opt        | `NexionFlowSettings` · 탭 SSOT · **drawerMemoryMode UI**    | — (프론트 only)                              | `themePreset: office-light` (권장) · 점진 이식                                                                          |
| **A** | `my`           | `my/`        | 마이페이지·프로필·개인 workspace                        | `views/left/MyLeftNav.vue`        | `views/content/MyView.vue`           | As-Is **`DefaultRightPanel`** · → `views/right/MyRightPanel.tsx`                            | —                                    | **전역** `authStore` · `projectStore`                                                         | L:rec · R:opt        | 프로필 · 디바이스 · 프로젝트 탭                             | **전역** `auth` · `server/domains/projects/` | Nest `modules/auth` · `projects` · `themePreset: office-light`                                                          |
| **A** | `help`         | `help/`      | 가이드·FAQ·온보딩                                       | `views/left/HelpLeftNav.vue`      | `views/content/HelpView.vue`         | As-Is **`DefaultRightPanel`** · → `views/right/HelpRightPanel.tsx`                          | —                                    | —                                                                                             | L:rec · R:opt        | 정적 가이드 · FAQ                                           | — (프론트 only)                              | 정적 콘텐츠 · SEO(App Router) · `office-light`                                                                          |
| **B** | `nexia`        | `nexia/`     | **AI** — Ollama 채팅·에디터·음성                        | `views/left/NexiaLeftNav.vue`     | `NexiaDomain.vue`                    | `views/right/NexiaRightPanel.vue` (+ `right/agent/*`)                                       | — (V2.1 → `NexiaHeaderActions`)      | — (`useNexiaInsertRequest` 등 composable)                                                     | L:rec · R:rec        | `composables/*` · Agent 패널 · Yjs·Tiptap 연동 예정         | `server/domains/ai/`                         | **1순위** · `statusBar` · `statusPanel` · `headerActions` · `themePreset: office-light` · sync                          |
| **B** | `nexion`       | `nexion/`    | **지식 데스크** — **Nexion React Flow** 캔버스 (To-Be)    | `views/left/NexionLeftNav.vue`    | `NexionDomain.vue`                   | `views/right/NexionRightPanel.vue`                                                          | —                                    | **도메인** `nexionFlowStore` · **전역** `userSettingsStore`                                   | L:rec · R:rec        | `modules/core/` · `useNexionCanvas` · **React Flow** (As-Is: Vue Flow) | — (프론트 only)                              | `apps/web` Next.js · TSX 이식 · Yjs · `office-light`                                                                    |
| **B** | `nexage`       | `nexage/`    | **넥사보드** — Panel·대시·IoT·Telemetry·`/nexage/admin` | `views/left/NexageLeftNav.vue`    | `NexageDomain.vue`                   | `views/right/NexageRightPanel.vue`                                                          | `components/NexageHeaderActions.vue` | **전역** `dashboardLayoutStore` · `boardMenuStore` · `boardEditorStore`                       | L:rec · R:rec        | `NexaDashboardRenderer` · `views/admin/` · `views/status/*` | — (프론트 only)                              | **`statusBar`** · **`statusPanel`** · `infra` IoT 흡수 · `themePreset: office-light` \| `power-grid` \| `factory-night` |
| **B** | `nexet`        | `nexet/`     | **넥셋** — 디바이스/프로젝트/부품 넥셋 카탈로그         | `views/left/NexetLeftNav.vue`     | `NexetDomain.vue`                    | `views/right/NexetRightPanel.vue`                                                           | —                                    | **전역** `dashboardLayoutStore`                                                               | L:rec · R:rec        | `components/side-panel/*`                                   | — (프론트 only)                              | 넥셋 카탈로그 TSX · `office-light`                                                                                      |
| **B** | `nexel`        | `nexel/`     | **넥셀** — 노드 자동화·NodeCanvas                       | `views/left/NexelLeftNav.vue`     | `NexelDomain.vue`                    | `views/right/NexelRightPanel.vue`                                                           | —                                    | **전역** `nexaNodeStore`                                                                      | L:rec · R:rec        | NodeCanvas · Mock/Live 엔진                                 | — (프론트 only)                              | `@nexa/shared` device schema · `office-light`                                                                           |
| **B** | `nexeed`       | `nexeed/`    | **넥씨드** — 데이터 흐름·Trace 분석                     | `views/left/NexeedLeftNav.vue`    | `NexeedDomain.vue`                   | As-Is **`DefaultRightPanel`** · → `views/right/NexeedRightPanel.tsx`                        | —                                    | —                                                                                             | L:rec · R:opt→rec    | Trace·데이터 흐름 UI                                        | — (프론트 only)                              | Telemetry 연동 · RightPanel 신규 후 R:rec                                                                               |
| **C** | `infra`        | `infra/`     | **장치·IoT 관제** — my-devices                          | `views/left/InfraSidebar.vue`     | `views/content/InfraContent.vue`     | `views/right/InfraRightPanel.vue`                                                           | —                                    | **도메인** `infraStore`                                                                       | L:rec · R:rec        | `my-devices/` · DeviceDetails                               | `server/domains/devices/`                    | → **`nexage`** · `statusBar` · `statusPanel` · `themePreset: power-grid` \| `factory-night`                             |
| **C** | `network`      | `network/`   | WiFi·CAN·Socket·MQTT                                    | `views/NetworkLeftNav.vue`        | `NetworkDomain.vue`                  | As-Is **`DefaultRightPanel`** · → `views/right/NetworkRightPanel.tsx`                       | —                                    | —                                                                                             | L:rec · R:opt→rec    | 네트워크 프로토콜 UI                                        | — (프론트 only)                              | **`nexage`**/`iot` · RightPanel 신규 후 R:rec                                                                           |
| **C** | `solutions`    | `solutions/` | Industrial/Living/Media/Art 솔루션 카탈로그             | `views/SolutionsLeftNav.vue`      | `SolutionsDomain.vue`                | As-Is **`DefaultRightPanel`** · → `views/right/SolutionsRightPanel.tsx`                     | —                                    | —                                                                                             | L:rec · R:opt        | 솔루션 카탈로그·데모                                        | — (프론트 only)                              | 마케팅·카탈로그 · `office-light`                                                                                        |
| **D** | `nexa-erp`     | `erp/`       | ERP 메인·업무 흐름                                      | `views/left/ErpLeftNav.vue`       | `ErpDomain.vue`                      | `views/right/ErpRightPanel.vue`                                                             | —                                    | **도메인** `erpStore`                                                                         | L:rec · R:rec        | ERP 내비·업무 흐름                                          | — (프론트 only)                              | Nest ERP 모듈 분리 검토 · `office-light`                                                                                |
| **D** | `erp-parts`    | `parts/`     | ERP **부품** — 분류·재고 (content만 parts)              | `erp/` 재사용                     | `PartsManagementDomain.vue`          | registry **`erp/ErpRightPanel`** · 미연결 `parts/views/right/PartsManagementRightPanel.vue` | —                                    | **전역** `partsDataStore` · `partsManagementStore` · `userSettingsStore` · `modalSystemStore` | L:rec · R:rec        | ERP 셸 + parts 본문 · 대형 parts UI                         | `server/domains/parts/`                      | Nest `parts` · `@nexa/shared` Zod · `office-light`                                                                      |
| **D** | `portfolio`    | `portfolio/` | 프로젝트 **성과·결과물 전시**                           | `views/left/PortfolioLeftNav.vue` | `PortfolioDomain.vue`                | As-Is **`DefaultRightPanel`** · → `views/right/PortfolioRightPanel.tsx`                     | —                                    | — (CRUD는 **`my`** · **전역** `projectStore`)                                                 | L:rec · R:opt        | `project_releases` 전시                                     | **전역** `server/domains/projects/`          | projects API 연동 · `office-light`                                                                                      |
| **E** | `nexa-archive` | `archive/`   | Tiptap·Hub·**Sentinel**                                 | `views/left/ArchiveLeftNav.vue`   | `ArchiveDomain.vue`                  | `views/right/ArchiveRightPanel.vue`                                                         | —                                    | **도메인** `archiveSearchStore` · **전역** `partsDataStore` (임시 업로드)                     | L:rec · R:rec        | `archive-sentinel/` · Tiptap · Hub                          | `server/domains/archive/`                    | U2BEE embed · sync Yjs · `(embed)/u2bee/archive` · `office-light`                                                       |
| **E** | `extension`    | `extension/` | U2BEE 등 **플러그인 UI**                                | `views/ExtensionLeftNav.vue`      | `views/content/ExtensionContent.vue` | As-Is **`DefaultRightPanel`** · → **`u2bee`** `U2BeeRightPanel.tsx`                         | —                                    | —                                                                                             | L:rec · R:opt        | `components/u2bee/*`                                        | — (프론트 only)                              | → **`u2bee`** shell · `headerActions` · `themePreset: office-light` · Desktop embed                                     |
| **F** | `dev`          | `dev/`       | 문서·DB·테마·코드 분석·가이드                           | `views/DevLeftNav.vue`            | `DevDomain.vue`                      | `views/DevRightPanel.vue`                                                                   | —                                    | **전역** `documentManagerStore` · `devGuideStore` · `userSettingsStore`                       | L:rec · **R:req†**   | `document-manager/` · `dev-tools/*` · `modules/`            | `server/domains/dev/`                        | 문서·스키마 SSOT · `office-light`                                                                                       |
| **F** | `nexa-admin`   | `admin/`     | **슈퍼 관리자** — 멤버·AI 리소스                        | `views/left/AdminLeftNav.vue`     | `AdminDomain.vue`                    | `views/right/AdminRightPanel.vue`                                                           | —                                    | **도메인** `adminStore` · **전역** `authStore`                                                | L:rec · R:rec        | `AdminMembers` · 비밀번호 변경                              | **전역** `auth` (JWT·멤버)                   | Nest `modules/auth` · Grade·audit 연동 · `office-light`                                                                 |

**그룹 범례**: **A** 진입·공통 · **B** NEXA 제품군 · **C** IoT·네트워크 · **D** ERP·전시 · **E** 아카이브·확장 · **F** 개발·관리

**`drawerDefaults` 요약**: **L 전부 `rec`** · **R `rec` 12** · **R `opt` 6** (`home`~`help`·`solutions`·`portfolio`·`extension`) · **R `req` 1** (`dev`†) · **R `opt→rec` 2** (RightPanel 신규 후: `nexeed` · `network`)

**`right` As-Is**: 전용 **11** · **`DefaultRightPanel` fallback 9** · **V2.1 To-Be**: 20키 전용 `views/right/*`

**store 요약 (As-Is)**: **도메인 store** 6 · **전역만** 7 · **혼합** 4 · **Pinia 미사용** 7

---

## 4. 도메인 폴더 관례

```text
domains/<name>/
├── <Name>Domain.vue              # content 슬롯 루트 (있는 경우)
├── views/
│   ├── left/                     # Left Drawer — 서브 내비
│   ├── content/                  # 메인 (Domain.vue 대신 content/ 만 쓰는 도메인도 있음)
│   └── right/                    # Right Drawer (선택)
├── components/                   # headerActions · 도메인 전용 UI
├── composables/
├── services/                     # API 호출
├── store/                        # 도메인 Pinia (예: infraStore, adminStore)
├── modules/                      # 대형 하위 (dev, nexion, archive-sentinel …)
├── config.ts · types/            # 도메인별 설정
└── …
```

| 규칙             | 내용                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **네이밍**       | registry `domainKey` ≠ 폴더명일 수 있음 — 예: `nexa-archive` → `archive/`, `nexa-erp` → `erp/`                                                  |
| **서브도메인**   | `erp-parts` — left/right는 부모 ERP, content는 `parts/`                                                                                         |
| **store 배치**   | **도메인** = `domains/{folder}/store/*.ts` (또는 `modules/**/stores/`) · **전역** = `src/system/store/` — §3 표 **도메인** / **전역** 표기 준수 |
| **cross-import** | `domains/a` → `domains/b` **금지** — 공통은 `system/` · `engines/`                                                                              |
| **드로어 정책**  | V2.1 **`drawerDefaults`** (L/R) — §2.1 · runtime **`useLayoutStore`**                                                                           |
| **V2.1 이식**    | `*Domain.vue` → `views/content/*Content.tsx` — **슬롯 경로만** registry에 등록                                                                  |

---

## 5. 백엔드 `server/domains/` ↔ 프론트 대응

| server/domains | 프론트 `domainKey` / 폴더                | API 예                  |
| -------------- | ---------------------------------------- | ----------------------- |
| `devices/`     | `infra/`                                 | `/api/devices`          |
| `parts/`       | `erp-parts` · `parts/`                   | `/api/part-classes`     |
| `projects/`    | `my` · `portfolio`                       | projects 라우트         |
| `archive/`     | `nexa-archive` · `archive/`              | archive 라우트          |
| `ai/`          | `nexia/`                                 | ai 라우트               |
| `dev/`         | `dev/`                                   | 문서·스키마·파일 에디터 |
| `routes/auth`  | `my` · `nexa-admin` · `frame/views/auth` | JWT 로그인·등록·멤버    |

> As-Is 백엔드는 **Express** (`server/`). V2.1은 **NestJS** `apps/backend/src/modules/` — **auth** · **devices** · **iot** · **control** · **edge-queue** (보강본 §Monorepo).

---

## 6. V2.1 `domainLayoutRegistry` 확장 (To-Be)

As-Is `domainRegistry` 슬롯에 아래를 **추가**한다. **전체 20개 도메인**은 §3 통합 표와 **동일 키**로 점진 등록.

| 추가 슬롯            | 용도                                                      |
| -------------------- | --------------------------------------------------------- |
| **`drawerDefaults`** | L/R **`openPolicy`** · `autoOpen` · `emptyMessage` — §2.1 |
| `statusBar`          | 도메인 전용 30px 한 줄 (IoT·관제)                         |
| `statusPanel`        | StatusOpsPanel **아래** 도메인 상세                       |
| `themePreset`        | `power-grid` · `factory-night` · `office-light`           |

**V2.1 신규·통합 도메인 (As-Is 표 외)**

| `domainKey` | 설명        | As-Is 대응              | `themePreset` (보강본) |
| ----------- | ----------- | ----------------------- | ---------------------- |
| `u2bee`     | U2BEE shell | `extension` + `archive` | `office-light`         |

> IoT·Telemetry·Safety 통합 관제는 별도 `domainKey` 없이 As-Is **`nexage`**에 `statusBar` · `statusPanel` · `power-grid`/`factory-night`/`control-room`으로 확장한다 (`infra` 연계).

**`themePreset` 권장 매핑 (보강본 §Theme)**

| `themePreset`   | 권장 `domainKey`                                |
| --------------- | ----------------------------------------------- |
| `office-light`  | `home` · `nexia` · `u2bee` · 대부분 업무 도메인 |
| `power-grid`    | `nexage` (전력·에너지·IoT)                      |
| `factory-night` | `nexage` (야간·저조도)                          |
| `control-room`  | `nexage` (24h 관제 옵션)                        |

```ts
// V2.1 등록 예 (nexia — 슬롯 + drawerDefaults + 확장)
nexia: {
  left: () => import('@/domains/nexia/views/left/NexiaLeftNav'),
  content: () => import('@/domains/nexia/views/content/NexiaContent'),
  right: () => import('@/domains/nexia/views/right/NexiaRightPanel'),
  headerActions: () => import('@/domains/nexia/components/NexiaHeaderActions'),
  statusBar: () => import('@/domains/nexia/views/status/NexiaStatusBar'),
  statusPanel: () => import('@/domains/nexia/views/status/NexiaStatusPanel'),
  themePreset: 'office-light',
  drawerDefaults: {
    left: { openPolicy: 'recommended' },
    right: { openPolicy: 'recommended' },
  },
},

// dev — required + autoOpen (§3 R:req†)
dev: {
  /* left, content, right … */
  drawerDefaults: {
    left: { openPolicy: 'recommended' },
    right: {
      openPolicy: 'required',
      autoOpen: true,
      emptyMessage: '문서를 선택하거나 새로 만드세요.',
    },
  },
},
```

---

## 7. 신규 도메인 추가 절차

1. `domains/{folder}/views/{left,content,right}/` (또는 `{Name}Domain.vue`) 생성
2. `domainLayoutRegistry.ts`에 lazy import + **`drawerDefaults`** (§2.1 · §3 표) 등록
3. 전역 메뉴(`globalMenu` / router)에 `domainKey`·route 연결
4. `useLayoutStore` + **`drawerMemoryMode`** UI (설정 → 레이아웃)
5. (V2.1) `statusBar` · `themePreset` · `packages/shared/schemas` 필요 시 추가
6. 백엔드 `server/domains/` 또는 Nest `modules/` 대응 모듈

---

## 8. `engines/` · `system/` (도메인 공용 참조)

도메인 구현 시 자주 쓰는 **비-domain** 경로 — 상세는 각 README·설계 문서.

**`src/engines/`**

| 하위                                                           | 용도                |
| -------------------------------------------------------------- | ------------------- |
| `audio/`                                                       | 오디오·스코프       |
| `charts/`                                                      | 차트 유틸           |
| `diagram/`                                                     | ERD 등 다이어그램   |
| `tiptap/`                                                      | 리치 텍스트 엔진    |
| `panel/` · `renderers/` · `block/` · `sentinel/` · `services/` | 패널·렌더·블록·감시 |

**`src/system/`**

| 하위               | 용도                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| `boot/`            | pinia, notify, errorTracking                                                                       |
| `store/`           | **전역 Pinia** — authStore, projectStore, **`userSettingsStore.drawer`** (memoryMode · byDomain) … |
| `components/ui/`   | Explorer, Table, Viewer                                                                            |
| `schemas/`         | Zod·도메인 타입                                                                                    |
| `css/nexa-system/` | 디자인 토큰 SCSS                                                                                   |
| `nixie/`           | NIXIE HUD·웨이브폼                                                                                 |

---

## 9. M2P 및 BAX 시스템의 핵심 설계 React 컴포넌트 예제

M2P 및 BAX 시스템의 핵심 설계 원칙인 **3축 메타데이터(Depth × Mutability × Priority)**와 **3×3 매트릭스 주소 체계**를 반영한 React 컴포넌트 예제

> 이 코드는 NEXA OS V2.1의 기술 스택인 Next.js, Tailwind CSS, 그리고 Framer Motion을 기반으로 합니다.

### 1. 컴포넌트 속성 인터페이스 정의

모든 BAX 컴포넌트는 시스템이 위치와 시각 효과를 결정할 수 있도록 다음 메타데이터를 가져야 합니다.

```typescript
// packages/shared/src/types/bax.ts (또는 컴포넌트 상단)
export type Depth = 'BG' | 'MID' | 'FG'
export type Mutability = 'IMMUTABLE' | 'MUTABLE'
export type Priority = 'ESSENTIAL' | 'CONTEXTUAL' | 'TEXTURE'
export type MatrixID = 'BG-L' | 'BG-C' | 'BG-R' | 'MID-L' | 'MID-C' | 'MID-R' | 'FG-L' | 'FG-C' | 'FG-R'

interface BaxComponentProps {
  matrixId: MatrixID
  depth: Depth
  mutability: Mutability
  priority: Priority
  children: React.ReactNode
}
```

### 2. 핵심 컴포넌트 예제: Comp C (IoT Card)

**Comp C**는 근경(FG)에 위치하며, 가변적(MUTABLE)이고 본질적인(ESSENTIAL) 정보를 담습니다. 가독성 확보를 위한 **Safe-Zone(min-w 300px)**과 **V1 진동(Sparkline)**이 적용된 예시입니다.

```tsx
import { motion } from 'framer-motion'
import { useBaxStore } from '@/store/useBaxStore' // 상태 관리 스토어 가정

export const IoTCard = ({ matrixId, data }: { matrixId: MatrixID; data: any }) => {
  const { circuitState } = useBaxStore() // 회로 차단기 상태 구독

  return (
    <motion.div
      // 300ms Easing 적용
      layout
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      // Matrix ID에 따른 그리드 위치 및 시각 속성 매핑
      className={`
        bax-component safe-zone
        depth-fg mutability-mutable priority-essential
        min-w-[300px] min-h-[120px] p-6 rounded-2xl
        bg-background/80 backdrop-blur-md shadow-xl
        ${matrixId === 'FG-C' ? 'scale-110 border-2 border-primary' : 'scale-100'}
      `}
    >
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono opacity-50">{matrixId}</span>
        <h3 className="text-2xl font-bold">온도 센서</h3>
        <p className="text-4xl font-black text-status-ok">{data.value}°C</p>
      </div>

      {/* V1 진동: Sparkline (Circuit Open 시 차단) */}
      {circuitState === 'closed' && (
        <div className="mt-4 h-8 w-full opacity-30">
          <SparklineV1 data={data.history} />
        </div>
      )}
    </motion.div>
  )
}
```

### 3. 미학적 컴포넌트 예제: Comp A (Giant Typography)

**Comp A**는 원경(BG)에서 레이아웃의 무게중심을 잡는 불변(IMMUTABLE)의 질감(TEXTURE) 컴포넌트입니다.

```tsx
export const GiantBackground = ({ matrixId, text }: { matrixId: MatrixID; text: string }) => {
  return (
    <div
      className="
        depth-bg mutability-immutable priority-texture
        pointer-events-none select-none
        fixed flex items-center justify-center
        w-full h-full overflow-hidden
      "
      style={{
        // Matrix ID(BG-L 등)에 따른 고유 블러 및 투명도 적용
        filter: 'blur(40px)',
        opacity: 0.05,
      }}
    >
      <h1 className="text-[15vw] font-black leading-none uppercase">{text}</h1>
    </div>
  )
}
```

### 4. VirtualCanvas에서의 조립 (레이아웃 엔진)

3×3 그리드 시스템 내에서 CSS Variables를 통해 **적정여백율(OVR)**과 **호흡(Breathing)** 효과를 컨트롤합니다.

```tsx
// apps/bax-demo/src/components/VirtualCanvas.tsx
export const VirtualCanvas = () => {
  const { voidRatio, focusBlur } = useBaxStore();

  return (
    <div
      className="virtual-canvas grid grid-cols-3 grid-rows-3 h-screen w-screen"
      style={{
        // BAX 엔진 상태를 CSS 변수로 전달
        '--bax-void-ratio': `${voidRatio}%`,
        '--bax-focus-blur': `${focusBlur}px`,
        padding: `calc(var(--bax-void-ratio) / 5)` // 여백을 통한 호흡 구현
      } as React.CSSProperties}
    >
      {/* 컴포넌트들이 지정된 matrixId에 맞춰 배치됨 */}
      <GiantBackground matrixId="BG-L" text="NEXA" />
      <div className="col-start-3 row-start-3 flex items-center justify-center">
        <IoTCard matrixId="FG-R" data={{ value: 72, history: [...] }} />
      </div>
    </div>
  );
};
```

### 구현 시 주의사항

1.  **G2 가드레일 (Safe-Zone 우선)**: 브라우저 크기가 작아져서 `void_ratio`와 `Safe-Zone(300px)`이 충돌할 경우, 여백율을 포기하더라도 정보 가독성을 위해 `Safe-Zone`을 우선해야 합니다.
2.  **G5 가드레일 (진동 차단)**: 시스템 부하(`circuitState !== 'closed'`) 발생 시, Sparkline과 같은 모든 **Vibration 계층(V1~V3)**은 즉시 렌더링을 중단(0 frame)해야 합니다.
3.  **300ms Easing**: 모든 상태 변화(`matrix_id` 이동, `blur` 변경 등)는 시각적 피로도를 낮추기 위해 반드시 **300ms 이하의 부드러운 전환**을 거쳐야 합니다.

_최종 갱신: §2.1 **`drawerDefaults`** 드로어 정책 · §3 20키 L/R `openPolicy`._

---
doc_id: 
title: ""
category: ""
domain: 
status: draft
created: 2026-06-20
updated: 2026-07-17
parent_doc: 
implements_doc: 
see_also: []
terms_standard: []
terms_nexa: []
---

# TabOnto · 브라우저 대시보드 (new Tab) 및 사이드페널 용어 자산 허브

> [!ABSTRACT] **제품 정의: 지식의 입구이자 물류 허브**
> **TabOnto**는 웹 서핑 중 발견한 **용어와 맥락 (Context)**을 포착하여 지능적으로 구조화하고, 이를 **[[NEXA]]** 플랫폼의 핵심 자산으로 전환하는 **지식 물류 허브**입니다.
> " 모든 거대한 온톨로지는 단 하나의 ' 개념 (Term)' 에서 시작됩니다. 용어는 단순한 단어가 아니라, 그 뒤에 숨겨진 **맥락과 관계를 잇는 고리 (Linker)**입니다. TabOnto 는 이 ' 원자 ' 를 수집하여 **[[NEXIA]]**라는 거대한 지식 분자를 만드는 출발점입니다."
>

> **Tab** + **Onto**(logy) — **새 탭 (Tab) 에서 시작하는, 내 손안의 지식 온톨로지 (Ontology).**
> **포지션:** **브라우저 확장 (Extension)** = **가볍게 쌓기** · NEXA = **본관 · NEXIA 연동** — [[#제품 포지션 · NEXIA 연동]]
> **배포 2 분할:** **NEXA-Platform 내 TabOnto** (웹·API · **본체 SSOT**) + **`NEXA-TabOnto-package/`** (**WebExtensions MV3** · **선택** · ① 수집 등 호스트 전용).
> **SDK 3 층:** **UI · Core · Host Adapter** — 개념 정리 [[#TabOnto SDK 3층 (UI · Core · Host Adapter)]] · 폴더 경로 [TDD-007 §10.5](../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md#105-tabonto-sdk-3층-ui--core--host-adapter).
> **브라우저:** Chrome **한정 ✗** — [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) **MV3** 지원 브라우저 공통 설계 · [[#WebExtensions · 크로스 브라우저 타깃]]
> **정본 대조:** [TDD-003](../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_플랫폼기술스택.md) · [TDD-007](../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md)

---

## WebExtensions · 크로스 브라우저 타깃

> [!important] **설계 원칙 — Chrome 독점 ✗ · WebExtensions 공통**
> **`NEXA-TabOnto-package/`** 는 **Manifest V3 WebExtensions** 확장으로 정의한다.
> Chromium(Chrome · Edge · Brave · Opera 등) 을 **1 차 타깃**으로 하되, **Firefox MV3**까지 **동일 코드베이스**로 빌드·검증한다.
> Safari · 모바일 브라우저는 **API 격차**가 커서 **Phase 2+** *(또는 본관 웹만)*.

> [!check] **1 차 지원 매트릭스 (MVP)**

| 브라우저 | 엔진 | MV3 | TabOnto MVP | 비고 |
| :--- | :--- | :---: | :---: | :--- |
| **Chrome** | Chromium | ⭕ | ⭕ P0 | `side_panel` · `chrome_url_overrides` |
| **Edge** | Chromium | ⭕ | ⭕ P0 | Chromium 과 **동일 zip** 가능 |
| **Firefox** | Gecko | ⭕ | ⭕ P1 | `sidebar_action` **폴백** · newtab 차이 |
| **Brave / Opera** | Chromium | ⭕ | △ P1 | Chromium 빌드 **재사용** |
| **Safari** | WebKit | △ | ✗ MVP | `safari-web-extension` **별도** · Phase 2+ |

> [!tip] **필요한 최적화 (엔지니어링)**

| 영역 | Chromium | Firefox / 기타 | 최적화 |
| :--- | :--- | :--- | :--- |
| **API 네임스페이스** | `chrome.*` | `browser.*` | **`webextension-polyfill`** — package 전역 `browser` SSOT |
| **사이드 UI** | `side_panel` (MV3) | `sidebar_action` | **`host/capabilities.js`** — 런타임 분기 · Firefox = sidebar HTML |
| **newtab** | `chrome_url_overrides.newtab` | 동일 키 *(제약 상이)* | **하이브리드 로컬 HTML** 공통 · 풀 iframe **지연** |
| **Origin 검증** | `chrome-extension://ID` | `moz-extension://ID` | `isAllowedOrigin()` **다중 prefix** — [[#MVP 엔지니어링 가드레일]] |
| **CSP `frame-ancestors`** | `chrome-extension://…` | `moz-extension://…` | Nest `(embed)/layout` **allowlist 배열** |
| **Storage** | `chrome.storage` | `browser.storage` | polyfill · **Zod 후** `pending_sync` 큐 동형 |
| **온디바이스 AI** | Gemini Nano *(Chromium)* | ✗ 또는 제한 | **BYOK / agent-graph** 폴백 — [[#② 해석 (AI Processing)]] |
| **빌드·배포** | CWS / sideload | AMO / sideload | **manifest 변형** 또는 **WXT** multi-target · CI **Chromium + Firefox** smoke |
| **권한 최소화** | `sidePanel` 등 | browser-specific | **optional_permissions** · **graceful degrade** |

```text
[NEXA-TabOnto-package/]
      │
      ├── shared/bridge-protocol.js     ← Origin · action SSOT (브라우저 무관)
      ├── host/capabilities.js          ← side_panel vs sidebar_action
      ├── (진입점) webextension-polyfill  ← 신규 코드: chrome.* 직접 호출 ✗
      │
      ├── build/chromium.zip            ← Chrome · Edge · Brave
      └── build/firefox.zip             ← gecko id · sidebar manifest diff
```

> [!warning] **브라우저별 주의 (MVP)**
>
> - **Firefox** — `sidePanel` **미지원** → `sidebar_action` + 동일 iframe `sidepanel.html`
> - **newtab override** — 정책·버전별 차이 → **로컬 약식 DOM + API** 우선 *(iframe 전체 로드 ✗)*
> - **Gemini Nano** — **Chromium 전용** · Firefox 등은 **Nest/agent-graph 또는 BYOK**
> - **수동 설치 (sideload)** — NEXA 슈퍼 유저 · 스토어 정책은 **브라우저별** 상이

> **한 줄:** package 는 **얇은 호스트** — SSOT 는 **NEXA iframe** · 브라우저 차이는 **capabilities + polyfill**로 흡수.

### 구현 템플릿 · manifest diff · `capabilities.js`

> [!abstract] **빌드 전략**
> **단일 `manifest.json` ✗** — **`manifest.base.json` + 타깃 overlay merge** → `build/chromium.zip` · `build/firefox.zip`.
> WXT `@wxt-dev/module-react` / 커스텀 `scripts/build-extension.mjs` 모두 가능 · CI 는 **양 zip smoke** 필수.

**① `manifest.base.json` (공통 SSOT)**

```json
{
  "manifest_version": 3,
  "name": "TabOnto - 지식 온톨로지 대시보드",
  "version": "1.0.0",
  "description": "AI 기반 지식 온톨로지 수집 · NEXA 연동 (By NEXA)",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "permissions": ["storage", "activeTab", "scripting"],
  "optional_permissions": ["sidePanel"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background/background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/content.js"],
      "run_at": "document_idle"
    }
  ],
  "chrome_url_overrides": {
    "newtab": "newtab/newtab.html"
  },
  "action": {
    "default_title": "TabOnto",
    "default_icon": { "48": "icons/icon48.png" }
  }
}
```

**② `manifest.chromium.json` (merge · P0)**

```json
{
  "side_panel": {
    "default_path": "sidepanel/sidepanel.html"
  },
  "action": {
    "default_title": "TabOnto — 사이드페널 열기"
  }
}
```

> Chromium: `sidePanel` 은 **`optional_permissions`** — 최초 `openSideUi` 실패 시 `browser.permissions.request({ permissions: ['sidePanel'] })` 후 재시도.

**③ `manifest.firefox.json` (merge · P1)**

```json
{
  "sidebar_action": {
    "default_panel": "sidepanel/sidepanel.html",
    "default_title": "TabOnto",
    "default_icon": "icons/icon48.png",
    "open_at_install": false
  },
  "browser_specific_settings": {
    "gecko": {
      "id": "tabonto@nexa.local",
      "strict_min_version": "109.0"
    }
  }
}
```

> Firefox merge 시 **`side_panel` 키 제거** · `optional_permissions` 에서 `sidePanel` **제거** *(API 없음)*.

**④ merge 의사코드 (`scripts/merge-manifest.mjs`)**

```javascript
import { readFileSync, writeFileSync } from 'node:fs';

function mergeManifest(target) {
  const base = JSON.parse(readFileSync('manifest.base.json', 'utf8'));
  const overlay = JSON.parse(readFileSync(`manifest.${target}.json`, 'utf8'));
  const merged = deepMerge(base, overlay);

  if (target === 'firefox') {
    delete merged.side_panel;
    merged.optional_permissions = (merged.optional_permissions ?? [])
      .filter((p) => p !== 'sidePanel');
  }

  writeFileSync(`dist/${target}/manifest.json`, JSON.stringify(merged, null, 2));
}
```

| diff 항목 | Chromium | Firefox |
| :--- | :--- | :--- |
| 사이드 UI | `side_panel.default_path` | `sidebar_action.default_panel` |
| gecko id | ✗ | `browser_specific_settings.gecko.id` **필수** |
| `sidePanel` permission | optional | ✗ |
| newtab override | ⭕ | ⭕ *(로드 타이밍·CSP 상이)* |
| zip 산출 | `build/chromium.zip` | `build/firefox.zip` |

---

**⑤ `host/capabilities.js` (사이드 UI 분기 SSOT)**

```javascript
// NEXA-TabOnto-package/host/capabilities.js
import browser from 'webextension-polyfill';

/** @typedef {'side_panel' | 'sidebar_action' | 'none'} SideUiMode */

/** @returns {SideUiMode} */
export function detectSideUiMode() {
  // manifest merge 결과로 Firefox는 sidebar_action만 존재
  if (browser.sidebarAction?.open) return 'sidebar_action';
  if (browser.sidePanel?.open) return 'side_panel';
  return 'none';
}

const SIDE_PANEL_PATH = 'sidepanel/sidepanel.html';

/**
 * 수집 트리거 시 사이드 UI를 연다.
 * @param {number | undefined} tabId — content script sender.tab.id
 */
export async function openSideUi(tabId) {
  const mode = detectSideUiMode();

  if (mode === 'side_panel') {
    await ensureSidePanelPermission();
    if (tabId != null) {
      await browser.sidePanel.setOptions({ tabId, path: SIDE_PANEL_PATH, enabled: true });
      await browser.sidePanel.open({ tabId });
    }
    return;
  }

  if (mode === 'sidebar_action') {
    // Firefox: 사용자가 sidebar를 닫아둔 경우 open()으로 복구
    await browser.sidebarAction.open();
    return;
  }

  // graceful degrade — action popup 또는 newtab 안내 (Phase 1.5)
  console.warn('[TabOnto] side UI unavailable — open sidepanel manually');
}

/** Chromium optional permission 요청 */
async function ensureSidePanelPermission() {
  const has = await browser.permissions.contains({ permissions: ['sidePanel'] });
  if (!has) {
    const granted = await browser.permissions.request({ permissions: ['sidePanel'] });
    if (!granted) throw new Error('sidePanel permission denied');
  }
}

/** toolbar 아이콘 클릭 — background에서 browser.action.onClicked */
export async function onActionClicked(tab) {
  await openSideUi(tab?.id);
}

/** 설치 직후 capabilities 캐시 (선택) */
export async function initCapabilities() {
  const mode = detectSideUiMode();
  await browser.storage.local.set({ sideUiMode: mode });
}
```

**⑥ `shared/bridge-protocol.js` — Origin allowlist (다중 prefix)**

```javascript
// NEXA-TabOnto-package/shared/bridge-protocol.js
import browser from 'webextension-polyfill';

// packages/shared/schemas/tabonto 와 action enum 동형 유지
export const ACTIONS = {
  TABONTO_INIT: 'TABONTO_INIT',
  LOAD_CAPTURE: 'LOAD_CAPTURE',
  ONTOLOGY_SAVED: 'ONTOLOGY_SAVED',
  REFRESH_GRAPH: 'REFRESH_GRAPH',
};

export const TABONTO_ORIGIN = import.meta.env.VITE_NEXA_TABONTO_ORIGIN
  ?? 'https://YOUR_NEXA_HOST';

/** @param {string} origin */
export function isAllowedOrigin(origin) {
  const extId = browser.runtime.id;
  const allowed = [
    `chrome-extension://${extId}`,
    `moz-extension://${extId}`,
    TABONTO_ORIGIN,
  ];
  return allowed.includes(origin);
}
```

> [!check] **연동 체크리스트**
>
> 1. `background.js` — `KEYWORD_CAPTURED` → `openSideUi(sender.tab?.id)`
> 2. `browser.action.onClicked` → `onActionClicked` *(Firefox sidebar 수동 열기 대비)*
> 3. Nest `(embed)/tabonto/layout.tsx` — `frame-ancestors` 에 **Chromium·Firefox extension id** 환경변수 등록
> 4. CI — `merge-manifest chromium|firefox` → web-ext lint *(선택)* → sideload smoke

---

> [!tip] **핵심 선순환**
> **입력 → 자산화 → 활용 → 재학습**
> 6 단계 파이프라인: `키워드 → 해석 → 편집 → 저장 → 관계도 추출 → 각자 응용`

---

## 플랫폼 본체 · 선택 설치 (EXTEND 공통)

> [!important] **원칙**
> **NEXA Platform = 기능 SSOT · 온전한 본체.** iframe · WebView · **WebExtensions 확장** · Desktop 은 **밖에서 보는 창**이며, **설치·의무 ✗**.

| | **플랫폼 `(shell)`** | **선택: Browser Extension / Desktop** |
| :--- | :--- | :--- |
| **TabOnto** | ②~⑥ 전부 · 수동 입력·붙여넣기 · 대시보드 · Export | ① DOM 수집 · **side_panel / sidebar** · newtab 껍데기 |
| **U2BEE** | 관제·설정·아카이브 UI · Nest 연동 | OS·파일 등 **시스템 레벨** — Desktop **선택 설치** |

> embed `(embed)/…` 라우트는 Shell UI **재사용**. package·`apps/desktop` 은 호스트 + **호스트 전용 capability**만 추가.

---

## TabOnto SDK 3 층 (UI · Core · Host Adapter)

> [!abstract] **처음 보시는 분 — 한 줄**
> TabOnto 는 **화면 (UI)** · **규칙·데이터 (Core)** · **브라우저·OS 연결 (Host Adapter)** 을 **나눠 두고**, Extension · NEXA 웹 · (미래) Desktop 이 **같은 Core**를 씁니다.
> **`sdk/` 폴더가 따로 있는 것은 아닙니다** — 아래 표의 **실제 경로**가 SSOT 입니다. ([TDD-007 §10.5](../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md#105-tabonto-sdk-3층-ui--core--host-adapter))

| 층 | 무엇인가 (쉬운 말) | 바뀌면 안 되는 것 | 주요 위치 |
| :--- | :--- | :--- | :--- |
| **Core** | 용어 카드 형식 · API · Balancer·NOMC **규칙** | Zod 스키마 · Nest API · 집계 로직 | `packages/shared` · `backend/modules/tabonto` |
| **UI** | 사용자가 **보는 화면** — Tab 1~7 · newtab Zone · 위젯 | 호스트마다 **껍데기는 다를 수 있음** | `domains/tabonto` · `(embed)/tabonto` · package `newtab/` |
| **Host Adapter** | DOM 수집 · storage · PostMessage · PIP 등 **환경 차이** | Core 규칙 **복제 ✗** — 연결만 담당 | `package/content.js` · `bridge-protocol.js` · `createHostAdapter()` |

```text
  [Extension UI shell]     [NEXA 웹 UI]        [Desktop UI shell]  (여러 개 OK)
           \                    |                    /
            \                   |                   /
             -------- Core (하나) --------
                         |
              Host Adapter (인터페이스 하나)
                   /      |      \
            Extension   Web    Desktop  (구현은 IF 또는 파일 분리)
```

> [!tip] **기획서 ↔ SDK 층 (읽는 법)**
>
> | EXTEND 문서 | SDK 층 |
> | :--- | :--- |
> | [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인]] · [[TabOnto 브라우저 NEW Tab 기획 사양서]] | **UI** (무엇을 보여 줄지) |
> | [[TabOnto 지식 밸런서 · 지적 시그니처 규격]] · [[TabOnto Mapping Core (NOMC) 핵심 엔진 사양]] | **Core** (어떻게 측정·분류할지) |
> | 본 허브 · WebExtensions · PostMessage 절 | **Host Adapter** (어떻게 연결할지) |

> [!important] **제품 포지션과 함께**
> - **Extension** = Host Adapter **두껍게** + UI **얇게** (iframe·로컬 newtab)
> - **NEXA 본관** = UI **풀** + Adapter **거의 없음** (`direct`)
> - 나중에 Adapter 구현 파일만 늘려도, 호스트는 **`createHostAdapter()` 한 줄**만 쓰는 것이 목표

---

## 제품 포지션 · NEXIA 연동

> [!important] **내부 규정 (제품 포지션)**
> **Extension TabOnto** — NEXA 와 **별개처럼** 느껴지는, **밖에서 가볍게** 지식을 쌓는 **브라우저 확장**.
> **NEXA TabOnto** — 밖에서 쌓은 지식을 **상세히 보고·편집**하고, NEXA 핵심 **NEXIA** 와 **연동**하는 본관.

> [!note] **「별개」 vs 기술 SSOT**
>
> | 축 | 규정 |
> | :--- | :--- |
> | **제품·UX** | **Extension** = 가벼운 독립 툴 **체감** · 기능 노출 **얇음** |
> | **기술** | 동일 계정 · 동일 API · 동일 DB — 백엔드 **분리 ✗** |

```text
[Extension · 가볍게]       [NEXA Platform · 본관]
  ① 수집 · ②~④ 간편     →     ②~⑥ 전체 · ⑤ 그래프 · ⑥ Export
  side_panel · newtab           (shell)/tabonto · NEXIA promote
        │                              │
        └──────── 같은 자산 ────────────┘
```

> [!check] **6 단계 · 표면별 깊이**

| 단계 | Extension (가볍게) | NEXA `(shell)/tabonto` |
| :--- | :--- | :--- |
| ① 수집 | ⭕ DOM · 선택 · 키워드 | ⭕ (+ 수동 · 붙여넣기) |
| ② 해석 | ⭕ 짧은 AI 초안 | ⭕ 전체 체인 · RAG · 인용 |
| ③ 편집 | ⭕ 필수 필드만 | ⭕ 태그 · 관계 · 메타 풀 |
| ④ 저장 | ⭕ | ⭕ |
| ⑤ 관계도 | △ 약식 · 미리보기 | ⭕ React Flow · Auto-Link |
| ⑥ Export | △ 클립보드 · MD | ⭕ 템플릿 · Notion · **→ NEXIA** |
| **NEXIA 연동** | ✗ *(또는 「NEXA 에서 열기」)* | ⭕ 승격 · Nexaon draft · Logex |

> [!tip] **NEXIA 연동 (개념 · Phase 구분)**
>
> - **TabOnto** — 개인·경량 **용어 카드** SSOT (`domains/tabonto` · `modules/tabonto`)
> - **NEXIA** — 프로젝트·팀 **온톨로지** SSOT (`domains/nexia` · Nexaon · Logex)
> - **연동** — TabOnto 노드 → NEXIA **promote / wikilink / import** *(Phase 2: 양방향 sync 검토)*
> - **MVP 우선** — Promote·Export **> ⑤ React Flow** — [[#MVP 엔지니어링 가드레일]]

> **한 줄:** Extension = **입구 (funnel)** · NEXA TabOnto = **심화 + NEXIA 로 올리는 다리**.

---

## 제품 정의

> [!important] **한 줄 정의**
> **TabOnto** — 지식의 **수집과 연결 (온톨로지)** 은 우리가 세계 최고로 만들고, 기획·업무 효율화는 유저가 쓰던 툴로 **가장 매끄럽게 Export** 한다 — **지식의 물류 허브**.

| UI | 역할 | 배포 위치 |
| :--- | :--- | :--- |
| **사이드페널** | 수집·해석·편집·저장 UI · **Onto-Agent HUD·세팅** | **UI** embed ← **Host Adapter** package 껍데기 |
| **새 탭** | **Z1** 검색 · **Z2** KickLink · **Z5** recent *(P1)* · Z3·Z4·Z7 *(P2+)* | **UI** shell 로컬 + API — [[TabOnto 브라우저 NEW Tab 기획 사양서#newtab 레이아웃 (SSOT)]] |
| **content/background** | 웹페이지 감시 · side_panel/sidebar · 중계 | **Host Adapter** · package 전용 |
| **ontology · AI · export** | ②~⑥ 비즈니스 SSOT | **Core** — `backend/modules/tabonto` |

> **관련 기획 SSOT:** [[TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인]] (Tab 1~7 · side_panel · **🤖 HUD · Agents 유틸**) · [[TabOnto 브라우저 NEW Tab 기획 사양서]] (newtab · Onto-Agent · PIP) · [[TabOnto 지식 밸런서 · 지적 시그니처 규격]] (Balancer · Signature · `axisSetId`) · [[TabOnto Mapping Core (NOMC) 핵심 엔진 사양]] (본문 스캔 · Knowledge Heatmap · Frontier Score)

---

## 지식의 확장 · Unknown Scout (언노운 스카우트)

> [!info] **철학: Known vs Unknown**
>
> - **Known (공고화):** 이미 정의된 온톨로지를 활용해 **행동의 의도**를 세우고 **효율적으로** 작업합니다 — newtab **Z4 Intent** · Tab 5~6 **Export** · Tab 2~7 **기존 노드** · KickLink **Z2** 재진입.
> - **Unknown (확장):** 웹페이지 안에서 **내 온톨로지에 없는 생소한 개념**을 포착해 **지적 영토를 넓힙니다** — Tab 1 **더블클릭 수집** · content script · **지적 시그니처**의 `create`·`connect` 축이 자라는 지점.

```text
[인터넷 · 임의 URL]                    [내 온톨로지]
        │                                    │
   Unknown Scout ──Tab 1 포착──>  용어 카드 · Zod 저장
        │                                    │
        └──────── Known 활용 ◀── Tab 2~7 · Export · NEXIA
              (의도·관계·재학습·프롬프트)
```

| 모드 | 사용자 행동 | TabOnto 표면 | NEXA 본관 |
| :--- | :--- | :--- | :--- |
| **Unknown** | 낯선 용어·개념 **첫 포착** | Tab 1 · **Extension** · 사이드페널 | 해석·RAG · 노드 SSOT |
| **Known** | 이미 쌓인 지식으로 **의도·작업** | newtab **Z1·Z2·Z4** · Tab 5~6 · KickLink | React Flow · Nexaon Promote |

> **한 줄:** Extension = **인터넷 쪽 정찰병 (Scout)** · NEXA = **Known 을 공고화·승격하는 본영** — [[#제품 포지션 · NEXIA 연동]]

> [!tip] **지적 시그니처와의 관계**
> **Unknown** 활동이 쌓일수록 **지식 밸런서**가 축 비율을 갱신하고, 안정되면 **지적 시그니처**가 **윤곽**을 보여 줍니다 — [[TabOnto 지식 밸런서 · 지적 시그니처 규격]]

---

## 제품명 · TabOnto

> [!abstract] **Tab + Onto(logy)**
> **새 탭 (Tab) 에서 시작하는, 내 손안의 지식 온톨로지 (Ontology).**
> *Open a tab. Own your ontology.*

| 항목 | 내용 |
| :--- | :--- |
| **정식명** | **TabOnto** |
| **형태** | **NEXA-TabOnto** (NEXA 서버 · iframe UI) + **NEXA-TabOnto-package** (WebExtensions MV3 · Chromium/Firefox zip) |
| **철학·카피** | [[TabOnto 인맥 중심 에서 시스템 중심 전환]] · **지적 시그니처** → [[TabOnto 지식 밸런서 · 지적 시그니처 규격]] · **Unknown Scout** → [[#지식의 확장 · Unknown Scout (언노운 스카우트)]]

> [!abstract] **네이밍 고도화 검토 (Identity Pivot · 미확정)**
>
> | 후보 | 강점 | 약점 |
> | :--- | :--- | :--- |
> | **TabOnto** *(현행)* | Tab+Onto **이미 직관** · 코드·문서·`NEXA-TabOnto` 정합 | Onto 선행 강조는 약함 |
> | **OntoTab** | **온톨로지 우선** · Known/Unknown 중 **탭=전장** 이미지 | 기존 TabOnto·패키지명 **전면 변경** 비용 |
> | **NexaOnto** | [[NEXA]] **생태계 통합** · 「자산화는 NEXA 에서 완성」 | **인터넷 정찰 (Unknown)** 톤 약함 · Extension 이 NEXA **부속품**처럼 들림 |
>
> **검토 의견 (문서 SSOT · 2026-06):**
>
> - **지식의 확장은 인터넷에 있다** → 브라우저 **얼굴 (Extension)** 은 **OntoTab / TabOnto** 계열이 **NexaOnto**보다 맞습니다. Unknown Scout 는 **웹→내 온톨로지** 방향이 핵심이지, 먼저 NEXA 로고를 내세울 필요는 없습니다.
> - **자산 완성·Promote·팀 온톨로지**는 이미 **`NEXA-TabOnto`** · **NEXIA** 네이밍으로 **본영**이 커버됩니다 — **NexaOnto**를 제품 정식명으로 올리면 **이중 브랜딩**(TabOnto vs NexaOnto) 만 늘 수 있습니다.
> - **권장:** **정식명 TabOnto 유지** · 서브카피/Extension 태그라인에 **「Unknown Scout」** · shell·API 는 **`NEXA-TabOnto`** 유지. **OntoTab**은 **A/B·스토어 부제** 후보만 *(코드 rename ✗)*.
>
> **결정 전:** 본 표는 **아카이브·논의** — 확정 시 EXTEND 전역 일괄 rename 필요.

> [!tip] **이전 Naming 후보** *(아카이브)*

| 이름 | 의미 | 비고 |
| :--- | :--- | :--- |
| TabSide Asset | Tab+Side · 자산 유통 | → **TabOnto**로 확정 |
| Knowledge Anchor | 용어에 닻을 내림 | |
| SideCollect · TabReview | Collect → Review | TabOnto UX 와 동형 |
| MindDock | 지식 정착 (Docking) | |
| LexiSide | Lexicon + Side | |
| **OntoTab** | Onto 선행 · 탭=탐색 전장 | Identity Pivot 검토 — [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브#제품명 · TabOnto]] |
| **NexaOnto** | NEXA 생태계 접두 | 본영 브랜딩용 후보 · Extension 정식명 ✗ 권장 |

---

## MVP 전략

> [!abstract] **전략적 타협 — 플랫폼은 범용, 효율화는 템플릿**
> 초기 (MVP) 에는 **[지식 → 기획 → 업무 효율화]** 연결 **파이프라인**만 명확히 제공하고, **실제 응용은 사용자·외부 생태계**에 맡긴다.
> 처음부터 기획 에디터·태스크 툴까지 직접 만들면 리소스 분산 → 이도 저도 아님.

> [!check] **우리가 100% 다룰 영역 vs 위임**

| 단계 | 우리 역할 | 직접 만들지 **않을** 것 | 대안 |
| :--- | :--- | :--- | :--- |
| **1. 지식** | 사이드바·새 탭 수집 → 온톨로지 → **개인 자산화** | — | **제품 정체성·차별점** |
| **2. 기획** | 표준 프레임워크 **빈칸 채우기** | 기획서 에디터 · 와이어프레임 툴 | 3C · SWOT · PRD 템플릿 + 원클릭 AI 초안 |
| **3. 업무 효율** | **Export · API 연동** | 일정·PM·협업 툴 전체 | Notion · Jira · 클립보드 **내보내기** |

> [!example] **2 단계 예시**
> 수집한 `React` · `Next.js` 노드 선택 → **[기술 검토서 템플릿]** → AI 가 상하 관계 분석해 초안 텍스트 생성.

> [!example] **3 단계 예시**
> `[노션 마크다운으로 복사]` · `[지라 티켓 발행]` · `[클립보드]` — 유저가 평소 쓰던 툴에 **꽂기**.

---

## MVP 엔지니어링 가드레일

> [!warning] **① 데이터 가교 · Zod 런타임 검증 (MVP 필수)**
> **PostMessage**는 편리하지만, **메시지 규격이 조금만 어긋나도** 수집·브릿지 **전체가 멈출** 수 있다.
>
> **MVP 에서 반드시 강제:**
>
> - SSOT: `packages/shared/schemas/tabonto/extension-bridge.schema.ts` — action · envelope · payload **Zod**
> - **iframe (Next.js)** — `window.addEventListener('message')` 수신 시 `safeParse` · 실패 = **로그 + drop** (침묵 실패 ✗)
> - **package** — `postMessage` 송·수신 전 동일 스키마 검증 *(빌드 시 `@nexa/shared` 번들 또는 OpenAPI/JSON Schema 미러)*
> - `bridge-protocol.js` 의 `ACTIONS` 상수 = 스키마 `action` enum 과 **1:1 동기화** · CI diff 검사
>
> ```text
> package ──postMessage──> safeParse(ExtensionBridgeMessage) ──> SidepanelApp
>              ✗ fail → console + Sentry(선택) · 수집 UI degraded 모드 유지
> ```

> [!tip] **② 지연 시간 · newtab 하이브리드 (White Flash 방어)**
> 새 탭마다 **서버 iframe 전체**를 로드하면 네트워크에 따라 **White Flash · 깜빡임**이 발생한다.
>
> **권장 — 하이브리드 newtab:**
>
> | 레이어 | 위치 | 역할 |
> | :--- | :--- | :--- |
> | **껍데기·약식 UI** | `newtab/newtab.html` + **내장 CSS/JS** | Google 검색 · 카드 리스트·태그 칩 **스켈레톤** — **즉시 paint** |
> | **데이터** | Nest `GET /tabonto/nodes?recent=` | iframe 로드 **병렬** 또는 iframe **대신** fetch 후 DOM hydrate |
> | **풀 대시보드** | `(embed)/tabonto/dashboard` 또는 `(shell)/tabonto` | 「자세히 보기」·⑤ 그래프 — **지연 로드** |
>
> - MVP: newtab = **로컬 약식 레이아웃 + API 데이터** · React Flow iframe 은 **Phase 1.5**
> - `REFRESH_GRAPH` → API re-fetch + 로컬 리스트 갱신 *(iframe refresh 는 fallback)*

> [!important] **③ 연동 · 구현 우선순위 (Retention)**
> **유입·잔존**은 **⑤ 관계도**보다 **①~④ 수집·저장**과 **⑥ Export · NEXIA Promote**가 결정한다.
>
> | 우선순위 | 범위 | MVP |
> | :---: | :--- | :--- |
> | **P0** | ①~④ 수집 · 해석 · 편집 · 저장 · **Zod bridge** | 필수 |
> | **P0** | ⑥ Export (MD · 클립보드 · Notion) | 필수 |
> | **P0** | **NEXIA Promote** — TabOnto 노드 → Nexaon draft / Logex import | **⑤ 그래프보다 선행** |
> | **P1** | newtab **하이브리드** 약식 대시보드 | 권장 |
> | **P2** | ⑤ React Flow · Auto-Link · 풀 그래프 UI | Phase 1.5+ |
>
> 시각적 그래프에 공수를 쏟기 전에 **Promote · Export 경로**를 먼저 다듬는다.

---

## 방향성 비교

| 구분 | ❌ 방향 A: 전체 수직 통합 | ✅ 방향 B: 범용 허브 + 생태계 연동 *(추천)* |
| :--- | :--- | :--- |
| **구현 범위** | 지식 + 기획 에디터 + 태스크 툴 | 온톨로지 + 외부 연동 (Notion 등) |
| **개발 기간** | 6 개월 + · 출시 지연 | **1~2 달 MVP** 검증 |
| **유저 반응** | " 노션/지라가 더 편한데…" (이탈) | " 내 노션에 지식을 바로 꽂아주니 편하다 " |
| **확장성** | 자체 기능 범위에 갇힘 | 유저 업무 환경 **무엇이든** 대응 |

> [!check] **TabOnto 비즈니스 이점**
> - **MVP 최적화** — 기획·태스크 툴 미개발 → 공수 **~1/5**
> - **진입 장벽 제거** — " 새 툴 배우세요 " ✗ → " 기존 노션/지라를 200% 똑똑하게 "
> - **차별점** — 단어장은 ④ 저장에서 끝 · 우리는 **⑤ 관계도 + ⑥ Export**까지

---

## 6 단계 파이프라인 (핵심 로직)

> [!abstract] **TabOnto 아키텍처 정본**
> `키워드 → 해석 → 편집 → 저장 → 관계도 추출 → 각자 응용`
> 범용 상위 개념에 집중하면서 실질적 업무 효율화까지 연결하는 **타협점**.

### ① 키워드 (Input) · Unknown Scout

> [!info] **Known vs Unknown** — [[#지식의 확장 · Unknown Scout (언노운 스카우트)]]
> **① 키워드** 단계 = **Unknown (확장)** 의 **정찰** — 웹에만 있던 개념을 **내 온톨로지**로 끌어옵니다.

> [!tip] **사이드페널 · content script**
> - 드래그 · 더블클릭 · 직접 입력으로 용어 포착
> - **문맥 (Sentence) + URL** 동시 캡처
> - Manifest + Content Script + Background — 더블클릭 시 사이드바 강제 오픈·전달

> [!note] **수집 모드 (options)**

| 모드 | 범위 | 특징 |
| :--- | :--- | :--- |
| **A · Light** | 단어 전후 **한 문장** | 마침표 기준 · 가볍고 직관적 |
| **B · Deep Context** | 상위 DOM (`<p>` `<div>` `<li>`) **블록 전체** | 줄바꿈 포함 · 온톨로지·AI 힌트 최적 |

### ② 해석 (AI Processing)

> [!tip] **내장 AI (Gemini Nano) / 클라우드 API**
> - 키워드 + 문맥 → **[기본 뜻 · 비즈니스 맥락 · 상하위 개념 · 추천 태그]**
> - 질문 전 **기존 온톨로지 노드**를 꺼내 RAG 처럼 **동봉**

> [!important] **3 단계 분할 (LangGraph 스타일)**
> 1. **해석 노드** — " 문맥 속 사전적 뜻 1 개만 정의 "
> 2. **추론 노드** — 기존 자산 (예: React) 과 **상하·인과 Yes/No** 검증
> 3. **포맷 노드** — 1·2 결과만 모아 **JSON 규격화**
>
> *Gemini Nano 선가공 → 필요 시 외부 AI 폴백 검토*

### ③ 편집 (Human Refinement)

> [!quote] **지식 주도권 = 인간**
> AI 답변을 그대로 삼키지 않음 · 메모 추가 · 태그 수정 · 해석 다듬기 **미니 에디터**.

### ④ 저장 (Assetization)

> [!tip] **Asset 창고**
> 편집 완료 → 원클릭 저장 · **NEXA-TabOnto API** (서버 DB) · package 는 PostMessage 로 iframe 에 전달만.

### ⑤ 관계도 추출 (Ontology Graph)

> [!note] **MVP · 우선순위 P2**
> Retention 핵심은 **①~④ · ⑥ · NEXIA Promote** — [[#MVP 엔지니어링 가드레일]].
> ⑤ 풀 그래프 (React Flow) 는 **Phase 1.5+** · newtab **약식 리스트**로 대체 가능.

> [!tip] **새 탭 대시보드**
> 누적 자산 → 관계 분석 → **지식 그래프 / 연관 개념 리스트** 시각화 — " 내가 이렇게 연결해 공부했구나 " 인사이트.

### ⑥ 각자 응용 (Export & Freedom)

> [!check] **외부 연동 창구**
> - `[노션 마크다운]` · `[기획서 초안]` · `[클립보드]`
> - **범용 데이터 가교** — 기획·업무는 유저·외부 툴 자율

---

## 3 층 UX (검색 · 자산화 · 재학습)

> [!abstract] **The Entrance → The Vault → The Engine**
> 인터넷 흐름을 **1 초** 방해하지 않는 수집 · 휘발 방지 자산화 · 망각 방지 재학습.

### 1 층 · 검색 UI (The Entrance)

> [!tip] **데이터 입력**
> - **사이드바 통합 검색창** — 새 탭 없이 AI + 기존 DB 동시 조회
> - **스마트 드래그/더블클릭** — 용어 자동 채움 + 결과 출력
> - **Context 자동 수집** — 예문 + URL AI 캡처 (단어만 저장 ✗)

### 2 층 · 개인 자산화 (The Vault)

> [!tip] **나만의 지식 창고**
> - **원클릭 카드 저장** — [용어 + 뜻 + 예문 + 카테고리]
> - **AI 자동 태깅** — `#프론트엔드` `#AI` 등 · 폴더 수동 생성 ✗
> - **자산 재활용** — 중복 시 " 이미 2026 년 6 월 저장 " + 내 메모 우선 · API 절감

### 3 층 · 재학습·유지 (The Engine)

> [!tip] **지식 숙성**
> - **새 탭 플래시카드** — 망각곡선 (에빙하우스) 기반 퀴즈
> - **주간 AI 요약 리포트** — 이번 주 저장 N 개 → " 핵심 주제 요약 " 맞춤 교재
> - **자산 정제** — 마스터 처리 · AI " 개발 예시 추가 " 편집

| 대분류 | 핵심 역할 | MVP UI/기능 |
| :--- | :--- | :--- |
| **1. 검색** | 방해 없는 빠른 수집 | 사이드바 입력 · 드래그 · 문맥 수집 |
| **2. 자산화** | 개인 지식 DB | 중복 시 DB 우선 · AI 태그 · 저장 |
| **3. 재학습** | 완전 체화 | 새 탭 퀴즈 · 주간 AI 리포트 |

---

## 배포 아키텍처 · iframe 2 분할

> [!important] **왜 분리하는가**
> - **구글 MV3** — 확장에 무거운 UI·AI·DB 넣으면 **Chromium 계열** 정책·재심사 리스크 ↑ → package 는 **수집·껍데기·브릿지**만 *(Firefox AMO 정책 동형)*
> - **NEXA SSOT** — 온톨로지·AI·Export·기획 템플릿은 **웹플랫폼 서버**에서 즉시 배포·갱신 (확장 재설치 ✗)
> - **iframe** — sidepanel · newtab 하단이 **NEXA 웹 (Next.js)** iframe · **Nest → agent-graph** Run 경유 (TDD-003④)

```text
[일반 웹페이지] ──dblclick──> [content.js]
                                    │
                                    v
                            [background.js] ──open──> [sidepanel.html 껍데기]
                                    │                      │
                                    │                      v
                                    │               <iframe src=NEXA/tabonto/sidepanel>
                                    │                      │
                                    │               PostMessage ◀──▶ TabOnto UI (Next.js embed)
                                    │
                            ONTOLOGY_SAVED ──▶ [newtab.html: 검색 + 약식 dashboard]
```

| 계층 | 저장소 | 통신 |
| :--- | :--- | :--- |
| **package** | `browser.storage.local` *(polyfill)* — captureMode · auth token · TABONTO_ORIGIN | `browser.runtime` + **PostMessage** |
| **NEXA-TabOnto** | PostgreSQL · pgvector (노드·Edge) · Nest API | HTTPS · NEXA 세션/JWT |
| **iframe 보안** | `frame-ancestors` · allowlist origin *(chrome-extension + moz-extension)* | `postMessage` `{ source: 'tabonto-ext' }` 검증 |

> [!tip] **iframe URL (예)**
> - 사이드바: `https://{NEXA_HOST}/tabonto/sidepanel`
> - 대시보드: `https://{NEXA_HOST}/tabonto/dashboard`
> - package `manifest.json` · `bridge-protocol.js` 에 **ORIGIN SSOT** 고정

> [!warning] **추가 보안 가드레일 (Security & Resilience)**
>
> - **① Origin Verification** — `window.addEventListener('message', …)` 처리 시 `event.origin` 이 **`chrome-extension://${EXTENSION_ID}`** *(Chromium)* · **`moz-extension://${EXTENSION_ID}`** *(Firefox)* *(iframe ← package)* 또는 **`https://{NEXA_HOST}`** *(package ← iframe)* 와 일치하는지 **반드시** 검증. `isAllowedOrigin()` = `bridge-protocol.js` · `extension-bridge.schema.ts` SSOT — **다중 prefix allowlist**.
> - **② Auth Handshake** — 확장 설치 후 **최초 iframe load** 시 `browser.storage.local` 의 토큰을 **`TABONTO_INIT`** payload 에 실어 전달 · 서버는 JWT/세션으로 검증 후 embed API 허용.
> - **③ CSP Policy** — embed 응답에 `Content-Security-Policy: frame-ancestors chrome-extension://${EXTENSION_ID} moz-extension://${EXTENSION_ID} https://{NEXA_HOST}` *(환경별 allowlist)* — **미허가 도메인 iframe 임베딩 ✗**. Next.js `(embed)/tabonto/layout.tsx` · Nest middleware 에서 SSOT.
> - **④ Degraded Mode** — 서버·iframe **응답 실패** 시 `content.js` / sidepanel 경로는 수집 데이터를 `browser.storage.local` **`pending_sync` 큐**에 적재 · 복구 시 Nest `POST /tabonto/nodes/batch-sync` 일괄 전송. Zod 검증 통과분만 enqueue — [[#MVP 엔지니어링 가드레일]].

---

## TDD-003 · TDD-007 정합 검토

> [!important] **검토 요약 (2026-06)**
> iframe 2 분할 **방향은 TDD 와 충돌하지 않음**. 다만 서버 측 경로는 **독립 `NEXA-TabOnto/` 루트가 아니라 `NEXA-Platform/` 모노레포 안**에 두는 것이 정본.

| 항목 | EXTEND (기존) | TDD-003 · TDD-007 | 판정 |
| :--- | :--- | :--- | :--- |
| **제품 루트** | `NEXA-TabOnto/` 단독 트리 | `NEXA-Platform/` · 4 apps + shared | ⚠️ **모노레포 내 배치**로 수정 |
| **프론트** | ~~React/Vite~~ | **Next.js** · `app/(embed)/tabonto/` · `domains/tabonto/` | ✅ **정렬 완료** |
| **그래프 UI** | Cytoscape 언급 | **React Flow** · `engines/react-flow` | ⚠️ **React Flow** 정렬 |
| **백엔드** | `modules/tabonto/` | `apps/backend/src/modules/{name}/` | ✅ 패턴 일치 |
| **Zod SSOT** | `packages/shared/src/tabonto/` | `packages/shared/src/schemas/{name}/` + `tabonto/` | ⚠️ **`schemas/tabonto/`** · **`tabonto/host/`** SDK Core |
| **AI ② 해석** | `interpret.service` 직접 AI | **agent-graph 단일** · Nest **프록시·SSE** | ⚠️ **`modules/agent-graph` 경유** |
| **DB** | PostgreSQL · pgvector (개략) | Prisma · `knowledge/` · `project_knowledge` | ⚠️ **Prisma 모델·knowledge 연계** 명시 |
| **Neo4j** | (미언급) | `modules/ontology/` **only** · promoted 용 | ✅ TabOnto MVP 는 **PG JSONB** · Neo4j ✗ |
| **브라우저→AI** | iframe 내 API | 브라우저 → **Nest REST** · agent-graph 직접 ✗ | ✅ iframe 이 Nest 호출하면 OK |
| **Browser Extension package** | `NEXA-TabOnto-package/` | TDD `extension/` (선택) · 모노레포 **외부** zip · Chromium/Firefox | ✅ **repo 형제 또는 `extension/tabonto/`** |
| **Yjs / sync** | (미언급) | TabOnto MVP **불필요** · Phase 2+ | ✅ MVP 제외 |

> [!check] **아키텍처 정렬 (TDD-007 §6)**
>
> ```text
> [WebExtensions package] ──PostMessage──> [iframe TabOnto UI · apps/web]
>                                        │
>                                        REST (JWT)
>                                        v
>                                   apps/backend/modules/tabonto/
>                                        │
>                                        HTTP/SSE (interpret Run)
>                                        v
>                                   modules/agent-graph/ → apps/agent-graph
>                                        │
>                                        v
>                                   PostgreSQL (Prisma) · pgvector RAG
> ```

---

## 파일 구조 · 2 분할 (TDD 정본 경로 · SDK 3 층)

> [!abstract] **정본**
> **① NEXA-Platform/** 모노레포 안 TabOnto — **Core + UI**
> **② NEXA-TabOnto-package/** — Git 루트 **형제** 폴더 · **Host Adapter + UI shell** · zip 배포 (pnpm workspace **외부**)
> 층별 상세 → [[#TabOnto SDK 3층 (UI · Core · Host Adapter)]] · [TDD-007 §10.5](../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md#105-tabonto-sdk-3층-ui--core--host-adapter)

### ① NEXA-Platform/ — Core + UI (TDD-007 트리 내)

> 경로 SSOT: [TDD-007 §3](../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) · 스택: [TDD-003](../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_플랫폼기술스택.md)

```text
NEXA-Platform/                                 — ▲ TDD-007 제품 루트 (pnpm-workspace)
│
├── packages/shared/src/
│   ├── schemas/tabonto/                       ◆ Core — Zod · bridge · API DTO
│   │   ├── knowledge-node.schema.ts
│   │   ├── capture-payload.schema.ts
│   │   ├── extension-bridge.schema.ts
│   │   ├── intellectual-signature.schema.ts
│   │   ├── axis-set.schema.ts
│   │   └── interpret-run.schema.ts
│   └── tabonto/                               ◆ Core — 런타임 · 호스트 무관 (Phase 2+)
│       ├── client/tabonto-api.types.ts
│       ├── balancer/axis-registry.ts
│       └── host/
│           ├── types.ts                       #   · HostAdapter · HostCapabilities
│           └── create-host-adapter.ts         #   · 팩토리 (MVP: IF · P2+: impl 분리)
│
├── apps/web/src/
│   ├── app/(embed)/tabonto/                   # ★ UI — iframe shell · MainShell ✗
│   │   ├── sidepanel/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── layout.tsx                         #   · frame-ancestors · chrome/moz-extension
│   └── domains/tabonto/                       # ★ UI — React 위젯 · Tab 1~7 본체
│       ├── embed/
│       │   ├── SidepanelApp.tsx
│       │   ├── DashboardApp.tsx
│       │   └── extension-protocol.ts
│       ├── components/
│       ├── hooks/
│       └── api/tabontoClient.ts
│
├── apps/web/src/engines/react-flow/           # ★ GraphView — Cytoscape ✗ · TDD React Flow
│   └── (tabonto nodeTypes · edgeTypes — Phase 1)
│
├── apps/backend/src/modules/
│   └── tabonto/                               ★ Nest · CRUD · Run 프록시
│       ├── tabonto.module.ts
│       ├── nodes.controller.ts                #   · GET/POST/PATCH /tabonto/nodes
│       ├── edges.controller.ts                #   · CRUD /tabonto/edges
│       ├── runs.controller.ts                 #   · POST /tabonto/runs → agent-graph proxy
│       ├── export.controller.ts               #   · POST /tabonto/export (⑥ Notion MD)
│       ├── profile.controller.ts              #   · GET/PATCH /tabonto/profile/signature *(Phase 2)*
│       ├── tabonto.service.ts                 #   · Prisma CRUD · Read-First 중복
│       ├── tabonto-graph.service.ts           #   · Edge · Auto-Link (PG JSONB)
│       └── knowledge-balancer.service.ts      #   · axisRegistry · 집계 · IntellectualSignature
│
├── apps/backend/src/modules/agent-graph/      # ★ 기존 모듈 재사용 — interpret 직접 구현 ✗
│   └── (runs.controller · client — tabonto graph_id 호출)
│
├── apps/agent-graph/src/agent_graph/
│   ├── graphs/
│   │   ├── registry.yaml                      #   · tabonto_interpret · tabonto_link (★ 추가)
│   │   ├── tabonto_interpret.py               #   · ② 3단 체인 · RAG
│   │   └── tabonto_export.py                  #   · (선택) ⑥ 배치 export
│   └── nodes/
│       ├── term_define.py                     #   · 해석 노드
│       ├── relation_infer.py                  #   · Yes/No 관계
│       └── pgvector_retrieve.py               #   · 기존 RAG 노드 재사용
│
└── database/schema.prisma                     #   · TabOntoKnowledgeNode · TabOntoEdge
                                               #   · 또는 knowledge 모듈 project_knowledge 확장
```

### ② NEXA-TabOnto-package/ — Host Adapter + UI shell (모노레포 **외부** · zip)

> **Chromium zip + Firefox zip** → 각 스토어 / NEXA 유저 **sideload**. **Core·DB·AI 코드 없음** — Nest API + iframe UI 에 연결.
> 진입점 **`webextension-polyfill`** — 아래 `chrome.*` 는 **개념 설명용** · 구현은 **`browser.*` SSOT**.

```text
NEXA-TabOnto-package/                          — Host Adapter + UI shell
│
├── manifest.json                              # MV3 · permissions · side_panel / sidebar_action
│
├── host/                                      # ★ Host Adapter
│   └── capabilities.js                        #   · side_panel vs sidebar_action · openSideUi
│
├── shared/
│   └── bridge-protocol.js                     #   · ACTIONS · isAllowedOrigin · envelope
│                                              #   · schemas/tabonto/extension-bridge 동형
│
├── content/content.js                         #   · DOM capture (Host Adapter)
├── background/background.js                   #   · runtime 중계
│
├── sidepanel/                                 # ★ UI shell (iframe 껍데기)
│   ├── sidepanel.html
│   └── sidepanel.js                           #   · PostMessage 브릿지
│
└── newtab/                                    # ★ UI shell (로컬 Zone)
    ├── newtab.html
    ├── newtab-dashboard.js
    ├── newtab-bridge.js
    └── widgets/
```

> **Core 연결:** package 는 `createHostAdapter({ surface: 'extension' })` *(Phase 2+ · shared 번들)* 또는 `bridge-protocol.js` 직접 호출 *(MVP)*.
> **UI 연결:** sidepanel/newtab HTML → NEXA `(embed)/tabonto/*` iframe **또는** API hydrate.

### 파일 ↔ 6 단계 · 배포 위치 매핑

| 단계 | NEXA-TabOnto (서버) | NEXA-TabOnto-package |
| :--- | :--- | :--- |
| ① 키워드 | — | `content.js` · `background.js` *(Unknown Scout)* |
| ② 해석 | `runs.controller` → **agent-graph** `tabonto_interpret` | `sidepanel.js` → iframe |
| ③ 편집 | `SidepanelApp` · components | iframe |
| ④ 저장 | `nodes.controller` · **Prisma** | iframe → Nest API |
| ⑤ 관계도 | `DashboardApp` · **React Flow** *(P2)* | `newtab-dashboard.js` **약식** + API *(iframe fallback)* |
| ⑥ 응용 | `export.controller` | iframe |

### PostMessage 프로토콜 (bridge SSOT)

> [!warning] **런타임 검증 (MVP 필수)**
> 아래 payload 는 **`packages/shared/schemas/tabonto/extension-bridge.schema.ts`** Zod **`safeParse` 통과 후**만 처리.
> package · iframe **양쪽** 적용 — [[#MVP 엔지니어링 가드레일]].

| action | 방향 | payload |
| :--- | :--- | :--- |
| `TABONTO_INIT` | package → iframe | `{ extensionId, captureMode, authToken? }` |
| `LOAD_CAPTURE` | package → iframe | `{ keyword, context, url, mode }` |
| `ONTOLOGY_SAVED` | iframe → package | `{ nodeId }` → background → newtab `REFRESH_GRAPH` |
| `REFRESH_GRAPH` | package → iframe | `{}` *(하이브리드 newtab: API re-fetch 트리거)* |

---

## 핵심 파일 명세

### NEXA-Platform · TabOnto (서버)

> [!tip] **`app/(embed)/tabonto/` + `domains/tabonto/`**
> Next.js **iframe 전용** 라우트 · MainShell registry **미등록**. `frame-ancestors` 에 extension origin.

> [!tip] **`modules/tabonto/` + `modules/agent-graph/`**
> CRUD 는 tabonto · **AI Run 은 agent-graph 프록시만** (TDD-007④ · interpret.controller ✗).

> [!tip] **`packages/shared/schemas/tabonto/`**
> FE·BE·extension bridge **Zod SSOT** — **`extension-bridge.schema.ts` MVP safeParse 필수** — nexaon 패턴 동형.
> **지적 시그니처:** `intellectual-signature.schema.ts` · **`axisSetId`** — [[TabOnto 지식 밸런서 · 지적 시그니처 규격]]

> [!tip] **`knowledge-balancer.service.ts` · `profile.controller.ts`** *(Phase 2)*
> Tab 1~2 → **Knowledge Balancer** 집계 → **Intellectual Signature** · `/tabonto/profile/signature` · `axisRegistry/tabonto-v1.yaml`

> [!tip] **`agent-graph/graphs/tabonto_*.py`**
> ② 해석 3 단 체인 · registry.yaml 등록 · Nest `graph_id` 1:1.

### NEXA-TabOnto-package (확장)

> [!tip] **`manifest.json`**
> MV3 **최소 권한**. UI 는 **외부 iframe URL**만 참조 — 비즈니스 코드 미포함.

> [!tip] **`content/content.js` · `background/background.js`**
> **브라우저 전용** — DOM 수집 · sidePanel.open · runtime 중계.

> [!tip] **`shared/bridge-protocol.js`**
> PostMessage **action · origin allowlist** — `extension-bridge.schema.ts` 와 **동기화** · 송수신 **Zod 검증**.

> [!tip] **`sidepanel/sidepanel.html` + `sidepanel.js`**
> iframe 껍데기 + **PostMessage 브릿지** (runtime ↔ **Next.js embed**) · **safeParse 필수**.

> [!tip] **`newtab/newtab.html` (+ `newtab-bridge.js` · `newtab-dashboard.js`)**
> **하이브리드** — 상단 Google 검색 · 하단 **약식 대시보드 (패키지 내장)** + `GET /tabonto/nodes` 데이터 hydrate.
> 풀 dashboard iframe / `(shell)` 링크는 **지연 로드** — [[#MVP 엔지니어링 가드레일]].

> [!check] **아키텍처 완성도**
> package **슬림** → 스토어·수동 설치 안정 · 서버 **즉시 갱신** → NEXA SSOT.

---

## background · PostMessage · 3 방향 통신

> [!important] **관제탑 + iframe 브릿지**
> Content · sidepanel 껍데기 · newtab 껍데기는 **runtime**으로 연결.
> **실제 UI**는 NEXA iframe — **PostMessage**로 capture·refresh 전달.

```text
[웹페이지] ──KEYWORD_CAPTURED──> [background.js]
                                      │
                                      ├── capabilities.openSideUi (side_panel | sidebar_action)
                                      └── runtime → [sidepanel.js]
                                              │
                                              postMessage LOAD_CAPTURE
                                              │
                                              v
                                    [iframe: NEXA/tabonto/sidepanel]
                                              │
                              ONTOLOGY_SAVED (postMessage)
                                              │
                                              v
                                    [sidepanel.js] → [newtab-bridge.js]
                                              │
                                              postMessage REFRESH_GRAPH
                                              v
                                    [iframe: NEXA/tabonto/dashboard]
```

| 시나리오 | 흐름 |
| :--- | :--- |
| **수집** | content → background → sidepanel.js → iframe `LOAD_CAPTURE` |
| **저장** | iframe API save → `ONTOLOGY_SAVED` → newtab dashboard `REFRESH_GRAPH` |
| **설정** | `browser.storage` captureMode → `TABONTO_INIT` |

> [!example] **sidepanel.js 브릿지 스켈레톤** *(polyfill · `browser.*` SSOT)*

```javascript
// NEXA-TabOnto-package/sidepanel/sidepanel.js
import browser from 'webextension-polyfill';
import { ACTIONS, TABONTO_ORIGIN, isAllowedOrigin } from '../shared/bridge-protocol.js';

const frame = document.getElementById('tabonto-frame');

frame.addEventListener('load', async () => {
  const { captureMode, authToken } = await browser.storage.local.get(['captureMode', 'authToken']);
  frame.contentWindow.postMessage(
    { source: 'tabonto-ext', action: ACTIONS.TABONTO_INIT, captureMode, authToken },
    TABONTO_ORIGIN
  );
});

browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'LOAD_TO_EDITOR') {
    frame.contentWindow.postMessage(
      { source: 'tabonto-ext', action: ACTIONS.LOAD_CAPTURE, ...msg },
      TABONTO_ORIGIN
    );
  }
});

window.addEventListener('message', (event) => {
  if (!isAllowedOrigin(event.origin)) return;
  if (event.data?.action === ACTIONS.ONTOLOGY_SAVED) {
    browser.runtime.sendMessage({ action: 'ONTOLOGY_SAVED', nodeId: event.data.nodeId });
  }
});
```

> [!example] **background.js 스켈레톤** *(capabilities.js 분기 — [[#구현 템플릿 · manifest diff · `capabilities.js`]])*

```javascript
// NEXA-TabOnto-package/background/background.js
import browser from 'webextension-polyfill';
import { openSideUi } from '../host/capabilities.js';

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'KEYWORD_CAPTURED') {
    openSideUi(sender.tab?.id);
    setTimeout(() => {
      browser.runtime.sendMessage({
        action: 'LOAD_TO_EDITOR',
        keyword: message.keyword,
        context: message.context,
        url: message.url
      });
    }, 300);
  }
  if (message.action === 'ONTOLOGY_SAVED') {
    browser.runtime.sendMessage({ action: 'REFRESH_DASHBOARD' });
  }
});
```

> [!abstract] **역할 요약**
> - **package** — 수집·**WebExtensions API**·PostMessage **브릿지만**
> - **NEXA-TabOnto iframe** — UI · API · DB · AI **SSOT**

---

## 부록 · 보관 메모

> [!note] **후속 작업 질문 (원문)**
> - 6 단계 중 **② 해석 → ③ 편집** 사이드바 입력/편집 폼 **UI 프로토타입** 구상?
> - Export 우선 — **노션 마크다운 변환 로직**부터 개발?
> - **`background.js` + `manifest.json`** 기틀 코드 우선 작성?

> [!note] **전환·확장 메모 (원문)**
> - LangChain + **Chromium Prompt API** (Gemini Nano) on-device 통합 참고 — **Firefox 등은 Nest/agent-graph 폴백** ([WebExtensions · 크로스 브라우저 타깃](#WebExtensions · 크로스 브라우저 타깃))
> - ~~향후 React/Vite 모던 웹 생태계 전환 고려~~ → **Next.js 확정** ([TDD-003](../APP_V2.0/08_TDD/NEXAOS/08_TDD_NEXAOS_플랫폼기술스택.md))
> - `[1]` 외부 툴 가교 — Notion · Jira · Figma 등

> [!quote] **기획 마감 코멘트 (원문)**
> " 나침반의 바늘이 완벽하게 고정되었습니다." / " 기획의 뼈대가 이보다 더 단단할 수 없을 정도로 깔끔하게 정립되었습니다." / " 아키텍처의 신경망 구조까지 완벽하게 정립되었습니다."




## WebExtensions MV3 정책 · 슬림 경계 · 우회 전략

Chromium(Chrome · Edge 등) 과 Firefox 모두 **Manifest V3 WebExtensions** 정책은 보안·권한·스토어 심사 기준을 **지속 갱신**합니다.
TabOnto package 에 과한 기능을 넣지 않고 슬림하게 유지해야 하는 핵심 이유 3 가지를 정리합니다.

### 🛑 과유불급: 슬림함을 유지해야 하는 이유

- **정책 변경 리스크 최소화:** 기능·권한이 복잡해질수록 **CWS · AMO · sideload** 각각의 제약에 걸려 확장이 **비활성화**될 위험이 커집니다.
- **NEXA 수동 설치 (sideload) 유저 보호:** 정식 스토어가 아닌 직접 등록으로 쓰는 슈퍼 유저는, 앱이 무거워지면 **브라우저·확장 업데이트** 때마다 재설치 부담이 커집니다.
- **명확한 가교 역할:** package 본질은 **수집 (사이드페널) + 인지 (newtab)** 까지. 온톨로지 시각화·기획서·외부 툴 연동은 **NEXA iframe**에서 처리 — [[#WebExtensions · 크로스 브라우저 타깃]]

---

### 🛠️ TabOnto 최종 확정 스펙 (MVP · iframe · 크로스 브라우저)

1. **package** — content/background: 더블클릭 수집 · **side_panel / sidebar_action** · PostMessage 브릿지 · **Zod safeParse** · **webextension-polyfill**
2. **sidepanel iframe (NEXA)** — AI 해석 · 편집 · 저장 API · **수신 message 검증**
3. **newtab 하이브리드** — 검색 + **패키지 내장 약식 대시보드** + API 데이터 · 풀 iframe **지연**
4. **가교** — **P0:** Export · **NEXIA Promote** · **P2:** React Flow 그래프

이 스펙은 **Chromium + Firefox** 공통으로 코드가 가볍기 때문에, MV3 정책 변화에 **package 층만** 최소 패치로 대응할 수 있습니다.

- **상단 검색창:** 브라우저 기본 검색 **또는** Google form *(선택)* — newtab override **정책 분기** 최소화
- **하단 약식 온톨로지 대시보드:** 새 탭마다 TabOnto 브랜드·지식 연결 체감
- **NEXA sideload 라우트:** 스토어 거절 리스크 완화 · NEXA 생태계 **프리미엄 락인**


---

### 1. `manifest.json` (총괄 설정 · Chromium 기본)

> **전체 diff 템플릿** — [[#구현 템플릿 · manifest diff · `capabilities.js`]] · Firefox overlay · merge 스크립트 참조.

```json
{
  "manifest_version": 3,
  "name": "TabOnto - 지식 온톨로지 대시보드",
  "version": "1.0.0",
  "description": "업무 및 학습 효율화를 위한 AI 기반 지식 온톨로지 수집 및 대시보드 플랫폼 (By NEXA)",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "optional_permissions": ["sidePanel"],
  "background": {
    "service_worker": "background/background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/content.js"]
    }
  ],
  "chrome_url_overrides": {
    "newtab": "newtab/newtab.html"
  },
  "side_panel": {
    "default_path": "sidepanel/sidepanel.html"
  }
}
```

**Firefox manifest diff (요지):**

```json
{
  "sidebar_action": {
    "default_panel": "sidepanel/sidepanel.html",
    "default_title": "TabOnto"
  },
  "browser_specific_settings": {
    "gecko": { "id": "tabonto@nexa.local", "strict_min_version": "109.0" }
  }
}
```

> [!tip] **코드 예시 공통 주석**
> 아래 `content.js` · `background.js` 샘플은 **`chrome.*`** 로 표기. 실제 package 는 **`import browser from 'webextension-polyfill'`** 후 **`browser.*`** 만 사용.

---

### 2. `content/content.js` (웹페이지 감시 주입기)

- 사용자가 어떤 웹사이트에 있든 더블클릭한 단어와 그 주변 문장 (Context) 을 정확히 낚아채 관제탑으로 보냅니다.

```javascript
document.addEventListener('dblclick', () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText.length > 0) {
    const anchorNode = selection.anchorNode;
    const fullText = anchorNode ? anchorNode.parentElement.innerText : "";
    
    // 더블클릭된 단어가 포함된 문장만 간결하게 파싱
    const sentences = fullText.split(/[.!?]\s+/);
    const contextSentence = sentences.find(s => s.includes(selectedText)) || selectedText;

    // 관제탑(background.js)으로 메시지 송신
    chrome.runtime.sendMessage({
      action: "KEYWORD_CAPTURED",
      keyword: selectedText,
      context: contextSentence.trim(),
      url: window.location.href
    });
  }
});
```

---

### 3. `background/background.js` (중앙 관제탑)

- 웹페이지에서 단어가 잡히면 우측 사이드바를 강제로 열고 데이터를 중계합니다.

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "KEYWORD_CAPTURED") {
    // 1. 현재 탭에 사이드바를 활성화
    chrome.sidePanel.open({ tabId: sender.tab.id });

    // 2. 사이드바가 렌더링될 시간을 벌기 위해 300ms 후 데이터 중계
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: "LOAD_TO_SIDEBAR",
        keyword: message.keyword,
        context: message.context,
        url: message.url
      });
    }, 300);
  }
});
```

---

### 4. `sidepanel/sidepanel.html` (iframe 껍데기)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>TabOnto Sidepanel</title>
  <style>
    html, body { margin: 0; height: 100%; overflow: hidden; }
    #tabonto-frame { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe id="tabonto-frame"
    src="https://YOUR_NEXA_HOST/tabonto/sidepanel"
    allow="clipboard-write"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups">
  </iframe>
  <script type="module" src="sidepanel.js"></script>
</body>
</html>
```

### 5. `newtab/newtab.html` (Google 검색 + dashboard iframe)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>TabOnto</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #f8f9fa;
           display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
    .search-container { margin-top: 12vh; width: 100%; max-width: 584px; padding: 0 16px; }
    .brand-logo { text-align: center; font-size: 22px; font-weight: 700; color: #5f6368; margin-bottom: 16px; }
    .brand-logo span { color: #4285f4; }
    .search-input { width: 100%; padding: 12px 20px; font-size: 16px; border: 1px solid #dfe1e5;
                     border-radius: 24px; box-sizing: border-box; }
    .dashboard-frame-wrap { flex: 1; width: 100%; max-width: 960px; padding: 24px 16px 32px; box-sizing: border-box; }
    #dashboard-frame { width: 100%; height: 360px; border: none; border-radius: 12px;
                       box-shadow: 0 2px 12px rgba(0,0,0,0.08); background: #fff; }
  </style>
</head>
<body>
  <div class="search-container">
    <div class="brand-logo">Tab<span>Onto</span></div>
    <form action="https://www.google.com/search" method="GET" target="_blank">
      <input type="text" name="q" class="search-input" placeholder="Google 검색" autofocus>
    </form>
  </div>
  <div class="dashboard-frame-wrap">
    <iframe id="dashboard-frame"
      src="https://YOUR_NEXA_HOST/tabonto/dashboard"
      sandbox="allow-scripts allow-same-origin allow-forms">
    </iframe>
  </div>
  <script type="module" src="newtab-bridge.js"></script>
</body>
</html>
```

> *(구 버전: 로컬 storage + 인라인 위젯 — **deprecated** · 서버 iframe 으로 대체)*

<!--
### [deprecated] 로컬 newtab.html (chrome.storage 직접 렌더)
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>TabOnto Dashboard</title>
  <style>
    body { margin: 0; font-family: 'Segoe UI', sans-serif; background: #f8f9fa; display: flex; flex-direction: column; align-items: center; height: 100vh; }
    /* 상단 구글 검색 존 */
    .search-container { margin-top: 15vh; text-align: center; width: 100%; max-width: 600px; }
    .brand-logo { font-size: 24px; font-weight: bold; color: #5f6368; margin-bottom: 20px; }
    .brand-logo span { color: #4285f4; }
    .google-search-form { width: 100%; }
    .search-input { width: 100%; padding: 14px 20px; font-size: 16px; border: 1px solid #dfe1e5; border-radius: 24px; box-shadow: none; outline: none; transition: box-shadow 0.2s; }
    .search-input:focus { box-shadow: 0 1px 6px rgba(32,33,36,0.28); border-color: rgba(223,225,229,0); }
    /* 하단 약식 지식 자산 존 */
    .dashboard-container { margin-top: 8vh; width: 80%; max-width: 900px; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f3f4; padding-bottom: 10px; margin-bottom: 15px; }
    .dashboard-title { font-size: 16px; font-weight: 600; color: #202124; }
    .nexa-link { font-size: 12px; color: #1a73e8; text-decoration: none; font-weight: bold; }
    .widget-grid { display: flex; gap: 20px; color: #5f6368; font-size: 14px; }
    .widget-card { flex: 1; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #4285f4; }
  </style>
</head>
<body>

  <!-- 1. 상단 강력한 구글 검색 영역 -->
  <div class="search-container">
    <div class="brand-logo">Tab<span>Onto</span></div>
    <form class="google-search-form" action="https://google.com" method="GET">
      <input type="text" name="q" class="search-input" placeholder="Google 검색 또는 URL 입력" autofocus autocomplete="off">
    </form>
  </div>

  <!-- 2. 하단 약식 온톨로지 지식 자산 영역 -->
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="dashboard-title">🧠 최근 축적된 지식 온톨로지 자산 (약식)</div>
      <a href="https://nexa-platform.com" class="nexa-link" target="_blank">NEXA 정밀 분석실 가기 →</a>
    </div>
    <div class="widget-grid">
      <div class="widget-card">
        <strong>최근 수집 개념</strong>
        <p id="recent-term">수집된 데이터가 없습니다. 웹서핑 중 단어를 더블클릭해 보세요!</p>
      </div>
      <div class="widget-card">
        <strong>연관 관계도 추출</strong>
        <p id="recent-relation">연결선을 그리려면 데이터가 쌓여야 합니다.</p>
      </div>
    </div>
  </div>

  <script>
    // 로컬 스토리지와 연동하여 하단 약식 대시보드 렌더링 로직 추가 구역
    chrome.storage.local.get({ concepts: [] }, (data) => {
      if (data.concepts.length > 0) {
        const latest = data.concepts[data.concepts.length - 1];
        document.getElementById('recent-term').innerText = `${latest.term} : ${latest.definition}`;
      }
    });
  </script>
</body>
</html>
-->

---

이 파일들을 폴더 구조에 맞게 생성하셨다면 **브라우저별 sideload** 순서입니다.

**Chromium (Chrome · Edge · Brave 등)**

1. `chrome://extensions/` (Edge: `edge://extensions/`) 이동
2. [개발자 모드] 활성화
3. [압축해제된 확장 프로그램을 로드] → **`NEXA-TabOnto-package`** *(또는 `build/chromium.zip` 압축 해제 폴더)* 선택
4. 장착 완료 — newtab = 검색 + **약식 dashboard** · 사이드페널 = **NEXA sidepanel iframe**

**Firefox**

1. `about:debugging#/runtime/this-firefox` 이동
2. [임시 Add-on 불러오기] → **`build/firefox.zip`** 또는 manifest 포함 루트 폴더 선택
3. **sidebar_action** 으로 동일 `sidepanel.html` 로드 — `side_panel` API **미사용**

> 스토어 배포: **Chrome Web Store** · **Microsoft Edge Add-ons** · **AMO** — zip·manifest **타깃별** CI 산출 — [[#WebExtensions · 크로스 브라우저 타깃]]

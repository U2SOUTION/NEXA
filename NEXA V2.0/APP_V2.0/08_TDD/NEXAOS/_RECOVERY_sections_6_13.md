---
doc_id: 
title: ""
category: ""
domain: 
status: draft
created: 2026-06-14
updated: 2026-06-14
parent_doc: 
implements_doc: 
see_also: []
terms_standard: []
terms_nexa: []
---

# \_RECOVERY\_sections\_6\_13
## 6. 레지스트리 슬롯 규약

**To-Be** `domainLayoutRegistry.ts` 슬롯 규약 (As-Is `domainRegistry.ts` 와 개념 동일):

| 슬롯                                | 필수      | 설명                                                                                                                                         |
| ----------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **`left`**                          | ✅        | Left Drawer — 도메인 **서브 내비**·트리·채널 목록 (전역 메뉴 아님)                                                                           |
| **`content`**                       | ✅        | 메인 작업 영역 — **유일한 main 세로 스크롤** 내부                                                                                            |
| **`right`**                         | ✅        | Right Drawer — `domains/*/views/right/*` · As-Is `null` → **`DefaultRightPanel`** fallback · **V2.1** 도메인별 전용 패널 필수 (보강본 §1677) |
| **`headerActions`**                 | 선택      | Header 우측 — 도메인 전용 액션 버튼                                                                                                          |
| **`drawerDefaults`**                | ✅ (V2.1) | L/R 드로어 **openPolicy**·`autoOpen`·`emptyMessage` — §6.1 · runtime 은 **`useLayoutStore`**                                                  |
| **`statusBar`** / **`statusPanel`** | V2.1      | 하단 시스템 상태바 도메인 슬롯                                                                                                               |
| **`themePreset`**                   | V2.1      | `power-grid` · `office-light` 등 산업 프리셋                                                                                                 |

**`right` fallback (As-Is)**: registry `right: null` → `getRightSidebarComponent()` 가 `@frame/views/common/DefaultRightPanel.tsx` 로드 (우측 드로어 **표시됨**).

**V2.1 `right` 목표**: 16 개 `domainKey` 전부 `views/right/*RightPanel.tsx` — §7.0 인덱스·§7.9 `opt→rec` 참고.

**As-Is 레거시 `behavior`**: `domainRegistry.ts` 의 `DomainBehavior` / `DEFAULT_BEHAVIOR` — **UI 미연동** · V2.1 **`drawerDefaults`(L/R)** 로 대체 (§6.1).

### 6.1 드로어 정책 SSOT (`drawerDefaults`)

> **목적**: 도메인마다 L/R 드로어 **열림 강도 (정책)** 를 registry 에 선언하고, 사용자 **기억 vs 기본** 선택과 **runtime store**로 자율성을 타협한다.
> **3 층 분리**: **registry = 정책** · **store = 실행 상태** · **사용자 설정 = 기억 모드**

#### 타입 (V2.1 · `domainLayoutRegistry.ts`)

```ts
type DrawerOpenPolicy =
  | "required" // UX상 사실상 필수 — remember로 영구 closed 불가 · 재진입 시 open
  | "recommended" // registry defaultOpen 따름 · remember ON이면 사용자 마지막 상태
  | "optional" // 기본 closed(또는 defaultOpen:false) · remember ON이면 사용자 존중
  | "hidden"; // 해당 side 슬롯 없음 (right: null 등)

type DrawerSidePolicy = {
  openPolicy: DrawerOpenPolicy;
  defaultOpen?: boolean; // recommended/optional일 때 registry 기본 (미지정: rec→true, opt→false)
  autoOpen?: boolean; // content 준비 후 1회 자동 open
  emptyMessage?: string; // 패널 비었을 때 안내 (dev right 등)
};

type DomainDrawerDefaults = {
  left?: DrawerSidePolicy;
  right?: DrawerSidePolicy;
};
```

#### 사용자 설정 — 전역 `drawerMemoryMode`

| 모드                   | UI 라벨 (예)       | 도메인 전환 시                                              |
| ---------------------- | ------------------ | ----------------------------------------------------------- |
| **`remember`**         | 마지막 상태 기억   | `domainKey + side` 별 저장값 우선 (`recommended`/`optional`) |
| **`reset-to-default`** | 항상 도메인 기본값 | registry `drawerDefaults` 만 적용                            |

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

#### §7 `drawerDefaults` 열 — 약어 · `openPolicy` × `drawerMemoryMode`

| 약어        | `openPolicy`               | 설명                                                                                      | `reset-to-default`             | `remember`                                                         | 비고                                |
| ----------- | -------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------ | ----------------------------------- |
| **req**     | `required`                 | **필수 open** — 패널 없으면 UX 깨짐                                                       | 항상 open                      | **재진입 시 open** (세션 중 닫기 허용 · **영구 closed 저장 불가**) | `dev` right (`R:req†`)              |
| **rec**     | `recommended`              | **권장 open** — registry `defaultOpen` 기본 true                                          | registry default               | 사용자 **마지막** open/closed                                      | §7 **L** 전부 · **R** 7 키           |
| **opt**     | `optional`                 | **선택** — registry `defaultOpen` 기본 false · 닫힌 채 시작 OK                            | registry default (보통 closed) | 사용자 **마지막** 상태                                             | 랜딩·카탈로그·보조 패널 · **R** 7 키 |
| **hid**     | `hidden`                   | **해당 side 없음** — 슬롯 미등록 · 정책 **skip**                                          | —                              | —                                                                  |                                     |
| **†**       | (수식)                     | **`autoOpen`** — content 준비 후 1 회 자동 open · **`emptyMessage`** — 패널 비었을 때 안내 | 상위 `openPolicy` 따름         | 상위 `openPolicy` 따름                                             | `req` 와 병기 (`R:req†`)             |
| **opt→rec** | `optional` → `recommended` | As-Is fallback only · **전용 RightPanel 신규 후** `rec` 로 승격                            | `rec` 와 동일                   | `rec` 와 동일                                                       | `network`                           |

> **`required` + `remember`**: 제품 최소 UX 우선 — 닫아도 **다른 도메인 갔다 오면** 다시 open · 1 회 안내: “이 도메인은 패널이 필요합니다”.

**§7 표기**: `L:rec · R:opt` = left `recommended` · right `optional`

#### Runtime SSOT — `useLayoutStore` (V2.1)

| 담당                 | 내용                                                                |
| -------------------- | ------------------------------------------------------------------- |
| **registry**         | `drawerDefaults` — 도메인별 **정책** (열어야 하는가)                |
| **`useLayoutStore`** | `leftOpen` · `rightOpen` · 폭 · `statusBarExpanded` — **현재 상태** |
| **사용자 설정**      | `drawerMemoryMode` + `byDomain` persisted state                     |

**Store-Driven Layout** (TDD-001 §5 대 원칙 ⑤) 과 동일 축 — [`08_TDD_NEXAOS_설계표준_미션크리티컬전략`](./08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) `useLayoutStore` 참조.

---

## 7. 등록 도메인 (`domainKey` 16)

> 공통 구현 루트: `apps/web/src/domains/{folder}/` · 상태 **Zustand** · API **`apps/backend/src/modules/`** (§9). 슬롯 파일명 규칙은 §8. 관계·mermaid 맵: [§2](#2-도메인-진화-모델-v2) · [§2.1](#21-nexa-os-통합-구조도).

### 7.0 요약 인덱스

| **domainKey** | 단계및 영역                   | 폴더       | 목적 (한 줄)                                           | 드로어 L/R     |
| :------------ | :---------------------------- | :--------- | :----------------------------------------------------- | :------------- |
| **home**      |                               | home/      | 플랫폼 랜딩·NexaBlock                                  | rec / opt      |
| **nexia**     | 인문/산업 (Distillation·실행) | nexia/     | **7 탭** · `stateBus` 정제 · Hot Path · NEXA-CELL      | rec / rec      |
| **Ontex**     | 인문 (온톨로지 앵커)          | Ontex/     | 정제 **완료** 지식 고착 · Graph RAG · archive · canvas | rec / rec      |
| **nexabo**    | 산업                          | nexabo/    | 대시보드·IoT·Telemetry 관제                            | rec / rec      |
| **nexet**     | 산업                          | nexet/     | **넥셋 마켓** · SW·HW 자산 유·무료 유통                | rec / rec      |
| **erp**       | 산업                          | erp/       | ERP 통합 셸 · 부품·재고·일정 (§7.D)                    | rec / rec      |
| **infra**     |                               | infra/     | 장치 등록·my-devices (→ nexabo)                        | rec / rec      |
| **network**   |                               | network/   | WiFi·CAN·MQTT 프로토콜                                 | rec / opt→rec  |
| **solutions** | 아트                          | solutions/ | 산업·라이프 솔루션 카탈로그                            | rec / opt      |
| **portfolio** | 산업                          | portfolio/ | 프로젝트 성과·결과물 전시                              | rec / opt      |
| **extension** |                               | extension/ | 플러그인 UI (→ u2bee)                                  | rec / opt      |
| **settings**  |                               | settings/  | 계정·환경·레이아웃 설정                                | rec / opt      |
| **my**        | 일상                          | my/        | 프로필·개인 workspace                                  | rec / opt      |
| **help**      |                               | help/      | 가이드·FAQ·온보딩                                      | rec / opt      |
| **dev**       |                               | dev/       | 문서·DB·테마·개발 가이드                               | rec / **req†** |
| **admin**     |                               | admin/     | 슈퍼 관리자·멤버·리소스                                | rec / rec      |

**`ontex`** — **인문 (Origin) 온톨로지 앵커**. 헌법·규범을 **온톨로지**로 하달한다. **정제 완료** 지식 (nexia **Distillation 산출**·`정제 지식상신`) 만 Graph RAG·`archive` 에 **고착** — raw IoT·ERP 이벤트 직접 ingest **✗** ([§2.1.2](#212-nexia-distillation-모델-정제--고착)).

---

### 7.A 진입·공통

**`home`** (`home/`) — 로그인 후 **첫 화면**. NexaBlock·보드 바로가기로 다른 도메인으로 분기한다. 업무용 밝은 테마 (`office-light`). 프론트 only.

**`settings`** (`settings/`) — 계정·환경·**드로어 기억 모드**(`drawerMemoryMode`) 등 플랫폼 전역 설정. `ontex` 캔버스·Flow 관련 전역 설정 SSOT 가 여기에 둘 수 있다.

**`my`** (`my/`) — 프로필·디바이스·**개인 프로젝트** workspace. 인증·프로젝트 CRUD 는 Nest `auth` · `projects` 와 연동한다.

**`help`** (`help/`) — 정적 가이드·FAQ. App Router SEO 에 적합한 읽기 전용 도메인.

_슬롯 예:_ `HomeLeftNav.tsx` · `SettingsContent.tsx` · `MyRightPanel.tsx` 등 — 패턴 `views/{left,content,right}/*`.

---

### 7.B NEXA 제품군

**`nexia`** (`nexia/`) — **플랫폼 핵심 지능 · Distillation 엔진**. 7 탭 셸 (Omnix·Normex·Logex·Scribx·Vivex·Twinex·Navex) 로 인간·AI·장치를 조율하고 **`stateBus` 런타임 상태를 정제**한다. Twinex 에 **NEXA-CELL**(ESPHome·펌웨어) 이 통합된다. LLM·스트리밍은 **`apps/agent-graph` 만** 사용한다. Yjs·협업은 `apps/sync`. **Hot Path:** Normex·Logex 등 → `erp` 직주입 (Distillation·archive **우회** · Zod **필수**). **Cold:** `stateBus` → nexia → `ontex` — [§2.1.2](#212-nexia-distillation-모델-정제--고착). 상세: [`08_TDD/NEXIA`](../NEXIA/README.md).

_슬롯 예:_ `NexiaShell.tsx` · `tabs/*` · `NexiaRightPanel.tsx` · `NexiaHeaderActions.tsx` · `useNexiaStore`.

**`ontex`** (`ontex/`) — **온톨로지·지식 앵커 도메인**. nexia **Distillation 완료** 산출물 (`archive` · `explore` · `promoted`) 만 Graph RAG · pgvector · RDF/JSON-LD 로 **고착·탐색**. LangGraph 로 그래프 탐색·추론 흐름을 오케스트레이션한다. **Nexion React Flow 캔버스** · **Trace** · **Tiptap 아카이브·Hub·Sentinel** 통합. Nest `archive/` · `knowledge/` · `ontology/` 와 연동. **`stateBus`/erp/nexabo → Ontex 직결 ✗** — [§2.1.2](#212-nexia-distillation-모델-정제--고착) · [TDD-057](../../Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md).

**Content**만 `subRoute` 로 분기 (L/R 드로어 공유 · `erp` 와 동일 패턴).

| `subRoute` | 역할                            | 비고              |
| :--------- | :------------------------------ | :---------------- |
| `canvas`   | 지식 데스크 · Nexion React Flow | 구 `nexion/`      |
| `explore`  | Graph RAG · 온톨로지 탐색       |                   |
| `trace`    | 데이터 흐름 · Trace             | 구 `nexeed`       |
| `archive`  | Tiptap·Hub·Sentinel 저장소      | 구 `nexa-archive` |

_슬롯 예:_ `OntexShell.tsx` · `views/canvas/*` · `views/explore/*` · `views/trace/*` · `views/archive/*` · `OntexRightPanel.tsx`.

**`nexabo`** (`nexabo/`) — **넥사보드**. Panel·대시·IoT Telemetry·`/nexabo/admin`. `statusBar` · `statusPanel` 로 관제 UX. `infra` 기능 흡수 방향. 테마 `power-grid` · `factory-night` · `control-room`.

**`nexet`** (`nexet/`) — **넥셋 (Nexet) 마켓** `domainKey`. NEXA OS 에서 사용할 수 있는 **소프트웨어**(위젯·템플릿·로직·워크플로·익스텐션 등) 와 **하드웨어**를 **유료·무료**로 검색·구독·설치·유통하는 독립 도메인이다. 실행 (`nexia`)·창작 (`ontex`) 과 분리되어 **소유권·라이선스·버전·Capability ID(`cap.*`)** 를 전문 처리한다. 자산 상세·거버넌스·5 대 핵심 자산 체계는 [`Market SPEC`](../../../../NEXA-Platform/docs/Market/Market%20SPEC%20마켓%20지능%20유통%20및%20생태계%20통합%20규격서.md)(Nexara 서사) 를 따른다. 설치된 자산의 메타·족보 (Why Chain) 는 **nexia Distillation** 후 `ontex` 로 고착할 수 있다.

| 자산 축 | 예시                                              | 비고                                  |
| :------ | :------------------------------------------------ | :------------------------------------ |
| **SW**  | UI 위젯 · UCL 템플릿 · Map · Workflow · Extension | Market SPEC 5 대 자산                 |
| **HW**  | 모듈 · 디바이스 · 센서 키트 · 펌웨어 번들         | `my`·`infra`·Twinex 와 Late Anchoring |

_슬롯 예:_ `NexetLeftNav.tsx` · `NexetCatalogContent.tsx` · `NexetRightPanel.tsx` · `useNexetStore`.

---

### 7.C IoT·네트워크

**`infra`** (`infra/`) — **장치·IoT 관제**(my-devices). DeviceDetails·등록 UX. Nest `devices` · `iot`. 장기적으로 **`nexabo` 로 흡수**.

**`network`** (`network/`) — WiFi·CAN·Socket·**MQTT** 등 네트워크 프로토콜 설정·모니터링. `nexabo`/IoT 스택과 연계.

**`solutions`** (`solutions/`) — Industrial / Living / Media / Art **솔루션 카탈로그**·데모. 마케팅·탐색용, 백엔드 의존 낮음.

---

### 7.D ERP·전시

**`erp`** (`erp/`) — ERP **통합 셸**. Left/Right 드로어·상태바는 도메인 공통 · **Content**만 `subRoute` 로 분기한다. **Hot Path 수신:** `nexia` 산출을 Distillation·archive **경유 없이** API 로 직접 반영 — `@nexa/shared` Zod 통과 **필수** ([§2.1.1](#211-선주도권-표기--hot-path--관제-해석)).

| `subRoute`    | 라벨          | 역할                     |
| :------------ | :------------ | :----------------------- |
| `overview`    | 업무 대시보드 | ERP 홈 · KPI             |
| `parts`       | 부품관리      | 분류 · BOM · 부품 마스터 |
| `inventory`   | 재고          | 입출고 · 창고            |
| `schedule`    | 일정관리      | 생산·납기·작업 일정      |
| `procurement` | 발주·구매     | Phase 2                  |
| `reports`     | 리포트·집계   | Phase 2                  |

_라우트 예:_ `/erp` → `overview` · `/erp/parts` · `/erp/inventory` · `/erp/schedule` — Nest `parts/` · `@nexa/shared` Zod.

**`portfolio`** (`portfolio/`) — 프로젝트 **성과·결과물 전시**(`project_releases`). CRUD 는 `my` · `projects` API.

---

### 7.E 확장

**`extension`** (`extension/`) — U2BEE 등 **플러그인 UI**. To-Be 에서 **`u2bee`** shell 로 통합·이관.

---

### 7.F 개발·관리

**`dev`** (`dev/`) — 문서·DB 스키마·테마·코드 분석·**개발 가이드**. 문서 SSOT 탐색. 우측 드로어 **필수**(R:req†, `autoOpen`). Nest `specs` · `jobs`.

**`admin`** (`admin/`) — **슈퍼 관리자**: 멤버·AI 리소스·비밀번호. Nest `auth` · Grade·audit. (`domainKey` = 폴더명 `admin/` 일치)

---

### 7.9 공통 정책 요약

| 항목          | 내용                                                                                           |
| :------------ | :--------------------------------------------------------------------------------------------- |
| **드로어**    | L 전부 `recommended` · R `rec` 7 · `opt` 7 · `req` 1 (`dev`†) · `opt→rec` 1 (`network`) — §6.1 |
| **슬롯 파일** | `views/{left,content,right}/*.tsx` — §8 폴더 규약                                              |
| **store**     | Zustand `use*Store` (도메인·전역)                                                              |
| **subRoute**  | `erp` · `ontex` — L/R 드로어 공유 · content 만 분기 — §7.B · §7.D                               |

---

## 8. 도메인 폴더 관례 (To-Be)

```text
apps/web/src/domains/<name>/
├── views/
│   ├── left/          # Left Drawer — *.tsx
│   ├── content/       # 메인 — *Content.tsx 또는 *Shell.tsx
│   ├── right/         # Right Drawer — *RightPanel.tsx
│   └── status/        # statusBar · statusPanel (선택)
├── components/        # headerActions 등
├── hooks/
├── services/          # nexaonClient 등 — Nest REST
├── store/             # Zustand (use*Store.ts)
├── modules/           # 대형 하위 (nexia/tabs/*, nexaon/* …)
└── types/
```

**`nexia/` To-Be 예:** `tabs/omnix` · `tabs/twinex` (NEXA-CELL) · `modules/nexaon/` — [`모노레포 §apps/web`](../NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md)

| 규칙             | 내용                                                                                                                     |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **네이밍**       | `domainKey` = 폴더명 권장 — `erp` → `erp/` · `admin` → `admin/`                                                          |
| **서브 라우트**  | `erp` (`overview` · `parts` …) · `ontex` (`canvas` · `explore` · `trace` · `archive`) — L/R 공유 · content 만 `subRoute` |
| **store**        | 도메인 Zustand `store/` · 계약 `packages/shared`                                                                         |
| **cross-import** | `domains/a` → `domains/b` **금지** — 공통 `engines/` · `shared/`                                                         |
| **드로어**       | `drawerDefaults` + **`useLayoutStore`** (§6.1)                                                                           |
| **As-Is 이식**   | `*Domain.tsx` → `views/content/*Content.tsx` — registry 경로만 갱신                                                      |

<details>
<summary>As-Is 폴더 트리 (shadcn/ui · 참고용)</summary>

```text
apps/web/src/domains/<name>/
├── <Name>Domain.tsx
├── views/{left,content,right}/*.tsx
├── store/   # Zustand
└── …
```

</details>

---

## 9. 백엔드 ↔ 프론트 대응 (To-Be)

| `apps/backend/src/modules/` | 프론트 `domainKey` | 비고                                          |
| :-------------------------- | :----------------- | :-------------------------------------------- |
| `auth/`                     | `my` · `admin`     | JWT · 멤버                                    |
| `nexaon/` · `ontology/`     | `nexia` · `ontex`  | Yjs debounce · Draft · Neo4j · Graph RAG      |
| `agent-graph/` (프록시)     | `nexia` · `ontex`  | LLM·SSE·Embed — **연산은 `apps/agent-graph`** |
| `esphome/`                  | `nexia`/Twinex     | NEXA-CELL YAML·OTA                            |
| `knowledge/`                | `ontex` · `dev`    | pgvector · embed job                          |
| `devices/` · `iot/`         | `infra` → `nexabo` | 장치·텔레메트리                               |
| `parts/`                    | `erp`              | 부품·재고 ERP (`subRoute`)                    |
| `market/` (To-Be)           | `nexet`            | Capability·라이선스·유통 · `cap.*` / `usr.*`  |
| `projects/`                 | `my` · `portfolio` |                                               |
| `archive/`                  | `ontex`            | Tiptap·Hub·Sentinel 저장소                    |
| `specs/` · `jobs/`          | `dev`              | 문서 vault                                    |

- 협업: **`apps/sync`** (Hocuspocus) — Nest 에 WebSocket **금지**
- 계약: **`packages/shared`** Zod

<details>
<summary>As-Is Express `server/domains/` (레거시)</summary>

| server/domains | domainKey                 |
| :------------- | :------------------------ |
| `ai/`          | `nexia` (구 AI 채팅 중심) |
| `devices/`     | `infra/`                  |
| …              | §7 As-Is 표 참고          |

</details>

---

## 10. V2.1 `domainLayoutRegistry` 확장 (To-Be)

As-Is `domainRegistry` 슬롯에 아래를 **추가**한다. **전체 16 개 `domainKey`**는 §7.0 인덱스와 **동일 키**로 점진 등록.

| 추가 슬롯            | 용도                                                       |
| -------------------- | ---------------------------------------------------------- |
| **`drawerDefaults`** | L/R **`openPolicy`** · `autoOpen` · `emptyMessage` — §6.1 |
| `statusBar`          | 도메인 전용 30px 한 줄 (IoT·관제)                          |
| `statusPanel`        | StatusOpsPanel **아래** 도메인 상세                        |
| `themePreset`        | `power-grid` · `factory-night` · `office-light`            |

**V2.1 신규·통합 도메인 (As-Is 표 외)**

| `domainKey` | 설명               | As-Is 대응  | `themePreset` (보강본) |
| ----------- | ------------------ | ----------- | ---------------------- |
| `u2bee`     | U2BEE shell        | `extension` | `office-light`         |
| `ontex`     | 온톨로지·Graph RAG | _(신규)_    | `office-light`         |

> IoT·Telemetry·Safety 통합 관제는 **`nexabo`**에 `statusBar` · `statusPanel` · `power-grid`/`factory-night`/`control-room` 으로 확장한다 (`infra` 연계).

**`themePreset` 권장 매핑 (보강본 §Theme)**

| `themePreset`   | 권장 `domainKey`                                                    |
| --------------- | ------------------------------------------------------------------- |
| `office-light`  | `home` · `nexia` · `ontex` · `nexet` · `u2bee` · 대부분 업무 도메인 |
| `power-grid`    | `nexabo` (전력·에너지·IoT)                                          |
| `factory-night` | `nexabo` (야간·저조도)                                              |
| `control-room`  | `nexabo` (24h 관제 옵션)                                            |

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

// dev — required + autoOpen (§7 R:req†)
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

## 11. 신규 도메인 추가 절차

1. `apps/web/src/domains/{folder}/views/{left,content,right}/*.tsx` 생성
2. `domainLayoutRegistry.ts` 에 lazy import + **`drawerDefaults`** (§6.1 · §7.0 L/R) 등록
3. 전역 메뉴 (`globalMenu` / router) 에 `domainKey`·route 연결
4. `useLayoutStore` + **`drawerMemoryMode`** UI (설정 → 레이아웃)
5. (V2.1) `statusBar` · `themePreset` · `packages/shared/schemas` 필요 시 추가
6. `apps/backend/src/modules/` (+ 필요 시 `apps/agent-graph` 그래프) 대응

---

## 12. `engines/` · `system/` · `shared/` (To-Be)

| 경로                                       | 용도                                                  |
| :----------------------------------------- | :---------------------------------------------------- |
| `apps/web/src/engines/react-flow/`         | React Flow node/edge types · Dagre                    |
| `apps/web/src/engines/tiptap/` · `monaco/` | 에디터 엔진                                           |
| `apps/web/src/components/store/`           | **Zustand** — `useLayoutStore` · auth · drawer memory |
| `packages/shared/src/schemas/`             | Zod SSOT — `nexaon/` · `agent-graph/`                 |
| `apps/web/src/components/ui/`              | Explorer · Table · Viewer                             |

> As-Is `apps/web/src/engines/diagram/`(D3)·`nexaNodeStore`(Zustand) 는 **레거시**. 그래프·CELL 은 **React Flow** + `nexia`/Twinex.

---

## 13. M2P 및 BAX — React 컴포넌트 예제 (참고)

> **`nexia`** BAX 미학·레이아웃·React 예제 코드는 [`UIX-003`](../../07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처.md) — 본 통합본에는 **Zustand** (Obsidian `<details>` 내 코드 블록 렌더 이슈 방지).

**레거시** 3 축 메타데이터 (Depth × Mutability × Priority) · 3×3 `matrixId` · Safe-Zone · V1 Sparkline · VirtualCanvas — 상세 TSX 는 UIX-003 §구현 예제 참조.

---

## 관련 문서

| 관계              | 문서                                                                                             |
| :---------------- | :----------------------------------------------------------------------------------------------- |
| 상위 Normative    | [NEXA OS 설계 표준 · 미션 크리티컬 (TDD-001)](./08_TDD_NEXAOS_설계표준_미션크리티컬전략.md)      |
| 모노레포          | [LangGraph 모노레포 폴더 구조 (TDD-007)](../NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |
| nexia 7 탭        | [NEXIA · 7Teb 범위 확정 (TDD-056)](../NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md)                    |
| Ontex             | [Ontex · 기술 스택 (TDD-057)](../../Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md)                    |
| 오케스트레이션    | [LangGraph · 오케스트레이션 (TDD-058)](../LangGraph/08_TDD_LangGraph_오케스트레이션설계_v1.0.md) |
| UI 레이아웃       | [NEXIA MainShell (UIX-004)](../../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md)              |
| **TDD-002/059** | **본 문서 (TDD-071) 로 통합** — 구 TDD-002 · TDD-059 대체                                            |

## _최종 갱신: 2026-06-14 — TDD-002/TDD-059 삭제 · TDD-071 정본 확정 · 전역 링크 갱신._

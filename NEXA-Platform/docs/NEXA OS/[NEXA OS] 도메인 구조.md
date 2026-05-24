# NEXA OS — 도메인 구조

| 항목                        | 내용                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **역할**                    | NEXA Platform **`src/domains/`** 전체 도메인 목록·레지스트리·폴더 규약 SSOT                                              |
| **레지스트리 (As-Is)**      | `NEXA-Platform/src/frame/registry/domainRegistry.ts`                                                                     |
| **레지스트리 (V2.1 To-Be)** | `apps/web/src/frame/registry/domainLayoutRegistry.ts` — 동일 **슬롯 패턴** + `statusBar` · `statusPanel` · `themePreset` |
| **상위 설계**               | [`_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략-보강본.md`](./_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략-보강본.md)     |

---

## 1. 도메인이란

**도메인(Domain)** 은 Header **전역 메뉴**에서 선택하는 **하나의 제품·업무 영역**입니다.

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
       ├── right   → domains/*/views/right/*  (null 가능)
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

| 슬롯                                | 필수           | 설명                                                               |
| ----------------------------------- | -------------- | ------------------------------------------------------------------ |
| **`left`**                          | ✅             | Left Drawer — 도메인 **서브 내비**·트리·채널 목록 (전역 메뉴 아님) |
| **`content`**                       | ✅             | 메인 작업 영역 — **유일한 main 세로 스크롤** 내부                  |
| **`right`**                         | ✅ (null 허용) | Right Drawer — 넥셋·속성·에이전트 패널                             |
| **`headerActions`**                 | 선택           | Header 우측 — 도메인 전용 액션 버튼                                |
| **`behavior`**                      | 선택           | 드로어 autoOpen · defaultOpen · saveState (As-Is `dev` 등)         |
| **`statusBar`** / **`statusPanel`** | V2.1           | 하단 시스템 상태바 도메인 슬롯                                     |
| **`themePreset`**                   | V2.1           | `power-grid` · `office-light` 등 산업 프리셋                       |

**right가 `null`인 도메인**: Right Drawer **미표시** (또는 V2.1에서 `DefaultRightPanel` fallback).

---

## 3. `src/domains/` 등록 도메인 (`domainRegistry.ts`)

> 아래 표는 **현재 As-Is 코드** 기준 전체 등록 목록. V2.1 재구축 시 **동일 `domainKey`·폴더명**을 유지하고, Vue → React(TSX)로 슬롯만 이식하는 것을 원칙으로 한다.

### 3.1 전체 요약표

| `domainKey`    | 폴더                 | 요약                                                                                                                                          | left | content | right | headerActions |
| -------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-----: | :---: | :-----------: |
| `home`         | `home/`              | 플랫폼 **진입·랜딩** — 그리드 소개, 현재 시각(NexaBlock), 프로젝트·도메인 바로가기. Right 없이 단일 화면 중심                                 |  ✅  |   ✅    |   —   |       —       |
| `nexage`       | `nexage/`            | **넥사보드(NEXAGE)** — 보드·그룹 트리, Nexa Panel 배치, `NexaDashboardRenderer` 실시간 대시. 윈도우 프리셋·관리자 서브라우트(`/nexage/admin`) |  ✅  |   ✅    |  ✅   |      ✅       |
| `nexet`        | `nexet/`             | **넥셋(NEXET)** — 위젯·패널 **넥셋 카탈로그** — 디바이스/프로젝트/부품 넥셋 탭, ERP·IoT 데이터 시각화 템플릿 관리                             |  ✅  |   ✅    |  ✅   |       —       |
| `nexel`        | `nexel/`             | **넥셀(NEXEL)** — **노드 기반 자동화** 워크플로 Mock/Live 엔진, `NodeCanvas` 시각 편집·시뮬레이션 (트리거·처리·액션 노드)                     |  ✅  |   ✅    |  ✅   |       —       |
| `nexia`        | `nexia/`             | **AI (Nexia)** — Ollama 연동 채팅·에디터·음성인식, 스플릿 레이아웃, Right 패널 도구. V2.1 **1순위 이식** · Yjs/Tiptap 협업                    |  ✅  |   ✅    |  ✅   |       —       |
| `nexion`       | `nexion/`            | **지식 데스크(Nexion)** — Vue Flow **캔버스·카드 노드**, 지식 그래프 편집·우측 속성 패널                                                      |  ✅  |   ✅    |  ✅   |       —       |
| `nexeed`       | `nexeed/`            | **넥씨드(NEXEED)** — 데이터 **흐름 추적·분석**, 패킷·파이프라인 병목 진단 (Trace 계열)                                                        |  ✅  |   ✅    |   —   |       —       |
| `infra`        | `infra/`             | **인프라·장치** — my-devices, 가상·실장치 노드, `infraStore`. `/api/devices` 연동 · IoT 관제 핵심 (V2.1 `dashboard` 통합 후보)                |  ✅  |   ✅    |  ✅   |       —       |
| `network`      | `network/`           | **네트워크** — WiFi·CAN·Socket·MQTT 탭, 통신 상태·넥셋화 개념, 프로토콜별 구성·모니터링                                                       |  ✅  |   ✅    |   —   |       —       |
| `solutions`    | `solutions/`         | **솔루션 카탈로그** — Industrial/Living/Media/Art 4분류, 정밀제어·에너지·미디어아트 등 **NEXA 확장 제품** 소개·기획                           |  ✅  |   ✅    |   —   |       —       |
| `nexa-erp`     | `erp/`               | **ERP** — 전사 자원·업무 흐름 메인, Left/Right ERP 셸 · `ErpDomain` 본문                                                                      |  ✅  |   ✅    |  ✅   |       —       |
| `erp-parts`    | `parts/` _(content)_ | **ERP 부품** — 부품 분류·모델·재고 대시(`PartsManagementDomain`). registry는 ERP **left/right 재사용**, content만 `parts/`                    | ✅¹  |   ✅    |  ✅¹  |       —       |
| `portfolio`    | `portfolio/`         | **포트폴리오** — 완료 프로젝트 **성과·결과물 전시**, `project_releases` 메타 연계, 대외 공개용 산출물 관리                                    |  ✅  |   ✅    |   —   |       —       |
| `nexa-archive` | `archive/`           | **아카이브** — Tiptap 기록·Hub, **Sentinel** 분류/자동폐기/트래시 라우팅. U2BEE·장기 보관 SSOT                                                |  ✅  |   ✅    |  ✅   |       —       |
| `dev`          | `dev/`               | **개발자 도구** — 문서 매니저·DB 뷰어·테마 매니저·코드 분석·가이드·그래프독. Right 자동 open(`behavior.autoOpen`)                             |  ✅  |   ✅    |  ✅   |       —       |
| `extension`    | `extension/`         | **확장** — U2BEE Statistics/Help 등 **플러그인형 UI**. V2.1 `u2bee` shell·Desktop embed와 분담                                                |  ✅  |   ✅    |   —   |       —       |
| `settings`     | `settings/`          | **설정** — 계정·환경·플랫폼 옵션 Sidebar + SettingsContent                                                                                    |  ✅  |   ✅    |   —   |       —       |
| `my`           | `my/`                | **마이페이지** — 사용자 프로필·개인 workspace 요약                                                                                            |  ✅  |   ✅    |   —   |       —       |
| `help`         | `help/`              | **도움말** — 사용 가이드·FAQ·온보딩 LeftNav + HelpView                                                                                        |  ✅  |   ✅    |   —   |       —       |
| `nexa-admin`   | `admin/`             | **슈퍼 관리자** — 멤버·AI 리소스·시스템 Admin 섹션 (`AdminDomain`). 권한 제한 도메인                                                          |  ✅  |   ✅    |  ✅   |       —       |

¹ `erp-parts`: left·right는 **`erp/`** 슬롯 재사용, content만 **`parts/`**.

---

### 3.2 그룹별 상세

> 각 도메인 **1표 = 2행** (1행: 항목 헤더 · 2행: 값). 가로로 한눈에 비교.

#### A. 진입·공통

##### `home` — 홈

| 폴더 | 역할 | left | content | right |
|------|------|------|---------|-------|
| `domains/home/` | 플랫폼 진입·요약 대시 | `views/left/HomeLeftNav.vue` | `views/content/HomeView.vue` | `null` |

##### `settings` — 설정

| 폴더 | left | content | right |
|------|------|---------|-------|
| `domains/settings/` | `views/left/SettingsSidebar.vue` | `views/content/SettingsContent.vue` | `null` |

##### `my` — 마이페이지

| 폴더 | left | content | right |
|------|------|---------|-------|
| `domains/my/` | `views/left/MyLeftNav.vue` | `views/content/MyView.vue` | `null` |

##### `help` — 도움말

| 폴더 | left | content | right |
|------|------|---------|-------|
| `domains/help/` | `views/left/HelpLeftNav.vue` | `views/content/HelpView.vue` | `null` |

---

#### B. NEXA 제품군 (AI · 지식 · 자동화)

##### `nexia` — AI (Ollama)

| 폴더 | 역할 | left | content | right | headerActions | 백엔드 | V2.1 |
|------|------|------|---------|-------|---------------|--------|------|
| `domains/nexia/` | AI 채팅·에디터·음성·Ollama 연동 | `views/left/NexiaLeftNav.vue` | `NexiaDomain.vue` | `views/right/NexiaRightPanel.vue` | — | `server/domains/ai/` | Yjs·Tiptap 직결 · `themePreset: office-light` · **1순위 이식** |

##### `nexion` — 지식 데스크 (Vue Flow)

| 폴더 | 역할 | left | content | right | 특징 |
|------|------|------|---------|-------|------|
| `domains/nexion/` | 지식 그래프·캔버스·카드 노드 | `views/left/NexionLeftNav.vue` | `NexionDomain.vue` | `views/right/NexionRightPanel.vue` | `modules/core/composables/useNexionCanvas` — Vue Flow |

##### `nexage` — 넥사보드

| 폴더 | left | content | right | headerActions |
|------|------|---------|-------|---------------|
| `domains/nexage/` | `views/left/NexageLeftNav.vue` | `NexageDomain.vue` | `views/right/NexageRightPanel.vue` | `components/NexageHeaderActions.vue` |

##### `nexet` — 넥셋

| 폴더 | left | content | right |
|------|------|---------|-------|
| `domains/nexet/` | `views/left/NexetLeftNav.vue` | `NexetDomain.vue` | `views/right/NexetRightPanel.vue` |

##### `nexel` — 자동화 (넥셀)

| 폴더 | left | content | right |
|------|------|---------|-------|
| `domains/nexel/` | `views/left/NexelLeftNav.vue` | `NexelDomain.vue` | `views/right/NexelRightPanel.vue` |

##### `nexeed` — 넥씨드

| 폴더 | left | content | right |
|------|------|---------|-------|
| `domains/nexeed/` | `views/left/NexeedLeftNav.vue` | `NexeedDomain.vue` | `null` |

---

#### C. 인프라 · IoT · 네트워크

##### `infra` — 인프라·장치

| 폴더 | 역할 | left | content | right | store | 백엔드 | V2.1 |
|------|------|------|---------|-------|-------|--------|------|
| `domains/infra/` | 장치·노드·my-devices — IoT 관제 핵심 | `views/left/InfraSidebar.vue` | `views/content/InfraContent.vue` | `views/right/InfraRightPanel.vue` | `store/infraStore.ts` | `server/domains/devices/` → `/api/devices` | `dashboard` + Safety/Telemetry **통합 검토** |

##### `network` — 네트워크

| 폴더 | left | content | right |
|------|------|---------|-------|
| `domains/network/` | `views/NetworkLeftNav.vue` | `NetworkDomain.vue` | `null` |

##### `solutions` — 솔루션

| 폴더 | left | content | right |
|------|------|---------|-------|
| `domains/solutions/` | `views/SolutionsLeftNav.vue` | `SolutionsDomain.vue` | `null` |

---

#### D. ERP · 부품 · 포트폴리오

##### `nexa-erp` — ERP

| 폴더 | left | content | right |
|------|------|---------|-------|
| `domains/erp/` | `views/left/ErpLeftNav.vue` | `ErpDomain.vue` | `views/right/ErpRightPanel.vue` |

##### `erp-parts` — ERP 부품 (서브도메인)

| registry 키 | content 폴더 | left | content | right | 백엔드 |
|-------------|--------------|------|---------|-------|--------|
| `erp-parts` | `domains/parts/` — `PartsManagementDomain.vue` | **`erp/` 슬롯 재사용** | `PartsManagementDomain.vue` | **`erp/` 슬롯 재사용** | `server/domains/parts/` → `/api/part-classes` |

> **패턴**: 하나의 `domainKey`가 **다른 도메인 폴더의 content**를 가리킬 수 있음 — ERP 셸 + parts 본문.

##### `portfolio` — 포트폴리오

| 폴더 | left | content | right |
|------|------|---------|-------|
| `domains/portfolio/` | `views/left/PortfolioLeftNav.vue` | `PortfolioDomain.vue` | `null` |

---

#### E. 아카이브 · 확장

##### `nexa-archive` — 아카이브

| 폴더 | 역할 | left | content | right | 하위 모듈 | 백엔드 | V2.1 |
|------|------|------|---------|-------|-----------|--------|------|
| `domains/archive/` | 아카이브·Tiptap·Sentinel 분류/폐기 | `views/left/ArchiveLeftNav.vue` | `ArchiveDomain.vue` | `views/right/ArchiveRightPanel.vue` | `archive-sentinel/` — AutoDiscard, Classification, TrashRouter … | `server/domains/archive/` | U2BEE `archive` · embed 연계 |

##### `extension` — 확장

| 폴더 | 역할 | left | content | right | V2.1 |
|------|------|------|---------|-------|------|
| `domains/extension/` | U2BEE 등 확장 UI (`components/u2bee/*`) | `views/ExtensionLeftNav.vue` | `views/content/ExtensionContent.vue` | `null` | `u2bee` + `(embed)/u2bee/*` Desktop WebView |

---

#### F. 개발 · 관리

##### `dev` — 개발 도구

| 폴더 | 역할 | left | content | right | behavior | 백엔드 | 주요 하위 |
|------|------|------|---------|-------|----------|--------|-----------|
| `domains/dev/` | 문서 매니저·DB 뷰어·테마 매니저·코드 분석·가이드 | `views/DevLeftNav.vue` | `DevDomain.vue` | `views/DevRightPanel.vue` | `autoOpen: true` · *「문서를 선택하거나 새로 만드세요.」* | `server/domains/dev/` | `modules/document-manager/`, `modules/theme-manager/`, `views/dev-tools/*`, `guides/*` |

##### `nexa-admin` — 관리자

| 폴더 | 역할 | left | content | right |
|------|------|------|---------|-------|
| `domains/admin/` | 슈퍼 관리자 — 멤버·AI 리소스 등 | `views/left/AdminLeftNav.vue` | `AdminDomain.vue` | `views/right/AdminRightPanel.vue` |

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

| 규칙             | 내용                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| **네이밍**       | registry `domainKey` ≠ 폴더명일 수 있음 — 예: `nexa-archive` → `archive/`, `nexa-erp` → `erp/` |
| **서브도메인**   | `erp-parts` — left/right는 부모 ERP, content는 `parts/`                                        |
| **cross-import** | `domains/a` → `domains/b` **금지** — 공통은 `system/` · `engines/`                             |
| **V2.1 이식**    | `*Domain.vue` → `views/content/*Content.tsx` — **슬롯 경로만** registry에 등록                 |

---

## 5. 백엔드 `server/domains/` ↔ 프론트 대응

| server/domains | 프론트 `domainKey` / 폴더   | API 예                  |
| -------------- | --------------------------- | ----------------------- |
| `devices/`     | `infra/`                    | `/api/devices`          |
| `parts/`       | `erp-parts` · `parts/`      | `/api/part-classes`     |
| `projects/`    | (전역 `projectStore`)       | projects 라우트         |
| `archive/`     | `nexa-archive` · `archive/` | archive 라우트          |
| `ai/`          | `nexia/`                    | ai 라우트               |
| `dev/`         | `dev/`                      | 문서·스키마·파일 에디터 |
| `routes/auth`  | `frame/views/auth`          | JWT 로그인·등록         |

> As-Is 백엔드는 **Express** (`server/`). V2.1은 **NestJS** `apps/backend/src/modules/` — **도메인 키·폴더명 정렬** 권장.

---

## 6. V2.1 `domainLayoutRegistry` 확장 (To-Be)

As-Is `domainRegistry` 슬롯에 아래를 **추가**한다. **전체 20개 도메인**은 §3 표와 **동일 키**로 점진 등록.

| 추가 슬롯     | 용도                                            |
| ------------- | ----------------------------------------------- |
| `statusBar`   | 도메인 전용 30px 한 줄 (IoT·관제)               |
| `statusPanel` | StatusOpsPanel **아래** 도메인 상세             |
| `themePreset` | `power-grid` · `factory-night` · `office-light` |

**V2.1 신규·통합 도메인 (As-Is 표 외)**

| `domainKey` | 설명          | As-Is 대응                 |
| ----------- | ------------- | -------------------------- |
| `dashboard` | IoT 통합 관제 | `infra` + Telemetry/Safety |
| `u2bee`     | U2BEE shell   | `extension` + `archive`    |
| `ais`       | AIS (확장)    | —                          |

```ts
// V2.1 등록 예 (nexia — As-Is 슬롯 + 확장)
nexia: {
  left: () => import('@/domains/nexia/views/left/NexiaLeftNav'),
  content: () => import('@/domains/nexia/views/content/NexiaContent'),
  right: () => import('@/domains/nexia/views/right/NexiaRightPanel'),
  statusBar: () => import('@/domains/nexia/views/status/NexiaStatusBar'),
  statusPanel: () => import('@/domains/nexia/views/status/NexiaStatusPanel'),
  themePreset: 'office-light',
},
```

---

## 7. 신규 도메인 추가 절차

1. `domains/{folder}/views/{left,content,right}/` (또는 `{Name}Domain.vue`) 생성
2. `domainRegistry.ts` (또는 V2.1 `domainLayoutRegistry.ts`)에 lazy import 등록
3. 전역 메뉴(`globalMenu` / router)에 `domainKey`·route 연결
4. (V2.1) `statusBar` · `themePreset` · `packages/shared/schemas` 필요 시 추가
5. 백엔드 `server/domains/` 또는 Nest `modules/` 대응 모듈

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

| 하위               | 용도                                      |
| ------------------ | ----------------------------------------- |
| `boot/`            | pinia, notify, errorTracking              |
| `store/`           | authStore, projectStore, partsDataStore … |
| `components/ui/`   | Explorer, Table, Viewer                   |
| `schemas/`         | Zod·도메인 타입                           |
| `css/nexa-system/` | 디자인 토큰 SCSS                          |
| `nixie/`           | NIXIE HUD·웨이브폼                        |

---

_최종 갱신: `NEXA-Platform/src/frame/registry/domainRegistry.ts` 전체 키(20) · 슬롯 경로 · 그룹별 상세 기준._

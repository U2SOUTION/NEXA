# NEXA OS — 기술 스택·방향 요약

| 항목 | 내용 |
|------|------|
| 역할 | `NEXA OS` 폴더 원고의 **정리본** (스택·아키텍처·운영 방향·이전 전략) |
| 원본 (변경 없음) | 아래 2개 파일 — 수정·삭제하지 않음 |
| As-Is 코드 | `NEXA-Platform/` — **폴더명·경로 유지**, 개발·참조용 |
| To-Be 작업 트리 | `NEXA-Platform-next/` — 저장소 **내부**에 신규 생성 후, 조건 충족 시 **저장소 밖으로 분리** |

## 원본 문서

| 파일 | 내용 |
|------|------|
| `새판 짜기.MD` | LLM 협업 기준 스택 선정, NestJS·Prisma·모노레포 구조, `.cursorrules` 초안 |
| `새판 짜기-02.MD` | Quasar 탈피 후 **최종 스택**(Vue 3 + Tailwind v4 + NestJS) 및 프론트 디렉터리 청사진 |

---

## 1. 방향성 (Why)

### 1.1 전략적 결단

- 기존 코드베이스를 **과감히 폐기**하고, **기획서·AI 협업**에 최적화된 구조로 재출발한다.
- LLM(Claude, Cursor, Continue 등)을 **개발 초기부터 함께하는 수석 아키텍트**로 둔다.
- NEXA-Platform의 기존 의도(**도메인 중심 분리**, **AI 가이드 내장**)는 유지하되, UI 프레임워크는 **Quasar 의존을 제거**하고 **Tailwind 기반 자체 컴포넌트**로 통제권을 회수한다.

### 1.2 스택 선정 기준 (LLM 친화)

| 기준 | 의미 |
|------|------|
| 학습 데이터 볼륨 | 전 세계적으로 널리 쓰이는 스택일수록 AI 코드 생성 품질이 높다 |
| 엄격한 규격·타입 | TypeScript, NestJS 모듈 구조, Prisma 스키마 등으로 **환각·구조 붕괴**를 줄인다 |
| 도메인 1:1 매핑 | 백엔드 모듈 ↔ 프론트 `domains/` 폴더 대응으로 AI·인간 모두 탐색 비용을 낮춘다 |

### 1.3 개발 순서

1. **기능·데이터 모델 우선** — Device/Sensor 등 도메인 스키마·API·실시간 파이프라인
2. **디자인·테마는 후순위** — Tailwind 테마 파일(`themes/light.css`, `dark.css`)로 나중에 일괄 적용
3. **AI 컨텍스트 선구축** — 요구사항 정의서 → `.cursorrules` / `.continue` / `.claude` 가이드

### 1.4 이전 전략 요약 (2단계)

현재 UI/UX에 만족하므로, **레거시를 참고만 하고 Quasar 코드는 이식하지 않는다.**

| 단계 | 위치 | 목적 |
|------|------|------|
| **1단계** | `NEXA-Platform/NEXA-Platform-next/` | old `src/`·`frame`·`domains/nexia`를 LLM이 **읽으며** Tailwind·Nest 골격 번역 |
| **2단계** | 저장소 **밖** 신규 경로 (별도 git 권장) | 메인 레이아웃 + **nexia** 도메인 틀 **최소 완성** 후 old와 **완전 단절**·독립 성장 |

**2단계 진입 기준(고정):** §8.3 체크리스트 충족 — 특히 **메인 레이아웃**과 **`nexia/` 도메인 틀** 최소 완성.

상세: [§8 2단계 이전 전략](#8-2단계-이전-전략-repo-안-next--저장소-밖-분리).

---

## 2. 기술 스택 (What)

### 2.1 코어 스택 요약

| 계층 | 채택 스택 | 비고 |
|------|-----------|------|
| **Frontend** | Vue 3 (Vite, Composition API / `<script setup>`) | SFC 단위로 AI에 파일 단위 지시 가능 |
| **상태** | Pinia | 실시간 센서·장비 상태 전역 관리 |
| **CSS** | **Tailwind CSS v4** + Scoped `@apply` | Quasar **미사용**; HTML 인라인 유틸 최소화 |
| **Backend** | **NestJS** + TypeScript | Express 대신 구조 고정·DI·Gateway |
| **DB** | **PostgreSQL** + **Prisma ORM** | `database/schema.prisma`를 SSOT |
| **실시간·IoT** | WebSocket Gateway, **MQTT**, (필요 시 SSE) | REST만으로는 대시보드 실시간 반영 부족 |
| **언어** | TypeScript (FE/BE 각각 독립 `tsconfig`) | 프론트·백 타입 규칙 분리로 충돌 방지 |

### 2.2 AI·협업 도구

| 경로 | 용도 |
|------|------|
| `.cursorrules` | Cursor/Claude 통합 코딩 규칙 (아키텍처 헌법) |
| `.continue/` | Continue AI 규칙 |
| `.claude/` | Claude 에이전트 프로젝트 컨텍스트 |
| `database/schema.prisma` | DB 설계 SSOT — AI에 스키마 우선 제공 |

### 2.3 의도적으로 제외·축소

| 항목 | 방향 |
|------|------|
| Quasar | 오버라이드·무게 부담 → **배제**, PWA/Capacitor는 필요 시 별도 검토 |
| Express (단독) | 구조 자유도 과다 → **NestJS로 통일** |
| Raw SQL 단독 | 일상 CRUD는 Prisma, 복잡 통계·Join은 `prisma.$queryRaw` **하이브리드** |

---

## 3. 아키텍처 (How)

### 3.1 저장소 구조 (모노레포)

단일 저장소 `NEXA/` 아래 **As-Is `NEXA-Platform/`** 와 **To-Be `NEXA-Platform-next/`(신규)** 를 병행한다.  
**3.1.1** = 현재 실제 트리, **3.1.2** = 1단계 작업 트리, **3.1.3** = To-Be 완성형, **3.1.4** = 매핑표.

#### 3.1.1 현재 구조 (As-Is, 2026-05 기준)

```text
NEXA-Platform/
├── .claude/                      # Claude 에이전트 컨텍스트 (폴더만 존재 가능)
├── .continue/
│   ├── rules/nexa-platform.md    # Continue: Vue 3 + Quasar + TS 규칙
│   └── prompts/
├── .quasar/                      # Quasar CLI 빌드 캐시 (생성물)
├── database/                     # PostgreSQL 초기화·마이그레이션 SQL
│   ├── init_postgres.sql
│   ├── init_auth.sql
│   ├── init_device_registry.sql
│   ├── init_projects.sql
│   └── migrations/               # 001_, 002_ … 순차 마이그레이션
├── docs/                         # 기획·아키텍처·DB 명세 (코드 외 SSOT)
│   ├── NEXA OS/                  # 본 요약·새판 짜기 원고
│   ├── database/                 # DDL·PostgreSQL 연결 가이드·런북
│   ├── Nexia/ · Nexion/ · AI/ · BM/ · Robot/ …
│   └── rules/
├── public/                       # 정적 자산 (icons/, uploads/)
├── scripts/                      # 개발·배포 보조
│   ├── open-browser.js
│   ├── NEXA-start-dev.bat · .vbs
│   ├── strip-js-imports.mjs
│   └── _TOOL/                    # Docker 배포 런북, docs 리네임 도구 등
├── server/                       # ★ 백엔드 (Express + TS, 자체 package.json)
│   ├── server.ts                 # 진입점 — loadEnv → 라우터 마운트
│   ├── loadEnv.ts                # 루트 .env 로드
│   ├── package.json
│   ├── tsconfig.json
│   ├── config/                   # dbConfig, redis, auth, upload, ai …
│   ├── middleware/               # jwtAuth, deviceAuth, error
│   ├── routes/                   # 횡단 관심사 API
│   │   ├── auth.routes.ts
│   │   ├── health.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── files.routes.ts
│   │   └── …
│   ├── domains/                  # 도메인별 라우트·서비스·컨트롤러
│   │   ├── devices/              # devices.routes · controller · service
│   │   ├── parts/
│   │   ├── projects/
│   │   ├── archive/
│   │   ├── ai/
│   │   └── dev/
│   ├── types/
│   └── utils/
├── src/                          # ★ 프론트 (Quasar + Vue 3 + Vite)
│   ├── App.vue
│   ├── assets/                   # 이미지·폰트 등 (Quasar/Vite 자산)
│   ├── domains/                  # 비즈니스 기능 단위 (20+ 도메인)
│   ├── engines/                  # UI 없는 순수 기능 모듈
│   ├── frame/                    # 앱 골격·라우팅·도메인 레지스트리
│   └── system/                   # 공통 UI·Pinia·스키마·CSS·부트
├── dist/                         # quasar build 산출물
├── index.html
├── package.json                  # 루트: quasar dev, dev:all, typecheck:all
├── quasar.config.js              # Vite·alias(@domains 등)·포트 9000
├── tsconfig.json · tsconfig.strict.json
├── vitest.config.ts
├── eslint.config.js · postcss.config.js
├── docker-compose.yml
├── docker-dev-compose.yml        # 로컬 Postgres (dev:postgres)
├── Dockerfile
└── .env · .env.example           # PG*, JWT, REDIS — server가 루트에서 로드
```

**프론트 `src/` 4대 축**

| 경로 | 역할 | 비고 |
|------|------|------|
| `frame/` | `MainLayout`, `domainRegistry.ts`, `router/`, 인증 페이지 | 도메인별 left/content/right lazy 로드 |
| `domains/` | 메뉴·기능 단위 UI·도메인 스토어 | `views/left` · `views/content` · `views/right` 패턴 |
| `engines/` | 차트·다이어그램·Tiptap·오디오 등 **UI 금지** 순수 로직 | `README.md`: 독립성 우선 |
| `system/` | 공통 컴포넌트, Pinia, Zod 스키마, nexa-system SCSS, boot | `@system`, `@engines` alias |

**`src/domains/` 등록 도메인** (`frame/registry/domainRegistry.ts`)

| 키 | 폴더 | 요약 |
|----|------|------|
| `home` | `home/` | 홈 |
| `nexage` | `nexage/` | 넥사보드 |
| `nexet` | `nexet/` | 넥사넥셋 |
| `nexel` | `nexel/` | 자동화 |
| `nexia` | `nexia/` | AI (Ollama) |
| `nexion` | `nexion/` | 지식 데스크 · Vue Flow |
| `nexeed` | `nexeed/` | 넥씨드 |
| `infra` | `infra/` | 인프라·장치 |
| `network` | `network/` | 네트워크 |
| `solutions` | `solutions/` | 솔루션 |
| `nexa-erp` · `erp-parts` | `erp/` · `parts/` | ERP·부품 |
| `portfolio` | `portfolio/` | 포트폴리오 |
| `nexa-archive` | `archive/` | 아카이브 (+ sentinel 하위 모듈) |
| `dev` | `dev/` | 개발 도구·문서·DB 뷰어·테마 매니저 |
| `extension` | `extension/` | 확장 |
| `settings` · `my` · `help` | 각 폴더 | 설정·마이·도움말 |
| `nexa-admin` | `admin/` | 관리자 |

**도메인 폴더 관례 (예: `nexia/`, `infra/`)**

```text
domains/<name>/
├── <Name>Domain.vue              # content 슬롯 루트 (있는 경우)
├── views/
│   ├── left/                     # 사이드 네비
│   ├── content/                  # 메인 화면
│   └── right/                    # 우측 패널 (선택)
├── components/
├── composables/
├── services/                     # API 호출·도메인 로직
├── store/                        # 도메인 전용 Pinia (예: infraStore)
└── …                             # config, types, modules/ 등 도메인별 확장
```

**`src/engines/`**

| 하위 | 용도 |
|------|------|
| `audio/` | 오디오·스코프 |
| `charts/` | 차트 유틸 |
| `diagram/` | ERD 등 다이어그램 |
| `tiptap/` | 리치 텍스트 엔진 |
| `panel/` · `renderers/` · `block/` · `sentinel/` · `services/` | 패널·렌더·블록·감시·서비스 |

**`src/system/` 주요 하위**

| 하위 | 용도 |
|------|------|
| `boot/` | `pinia.ts`, `notify.ts`, `errorTracking.ts` |
| `store/` | `authStore`, `projectStore`, `partsDataStore`, `nexaNodeStore` … |
| `components/ui/` | Explorer, Table, Viewer 등 공통 UI |
| `schemas/` | Zod·도메인 타입 (`devices.ts`, `recipes/`, `engine/` …) |
| `services/device/` | 장치 어댑터 (예: VirtualNodeAdapter) |
| `css/nexa-system/` | `_card`, `_tab`, `_table` … 디자인 토큰 SCSS |
| `css/extension/` | container-queries 등 확장 |
| `nixie/` | NIXIE HUD·웨이브폼 연동 |

**백엔드 `server/` ↔ 프론트 `domains/` 대응 (부분 일치)**

| server/domains | 프론트 | API 예 |
|----------------|--------|--------|
| `devices/` | `infra/` (my-devices 등) | `/api/devices` … |
| `parts/` | `parts/`, `erp-parts` | `/api/part-classes` … |
| `projects/` | `projectStore` 연동 | projects 라우트 |
| `archive/` | `nexa-archive` | archive 라우트 |
| `ai/` | `nexia/` | ai 라우트 |
| `dev/` | `dev/` | 문서·스키마·파일 에디터 |
| `routes/auth` | `frame/views/auth` | JWT 로그인·등록 |

> 현재 백엔드는 **Express**이며 NestJS·`sensors.gateway`·Prisma는 **아직 없음**. DB는 `pg` 풀 + `database/*.sql` + `docs/database/` DDL 명세.

**개발 실행 흐름**

```text
npm run dev:postgres          # Docker Postgres
npm run dev:all               # Quasar(≈9000) + server(3001) + 브라우저
# 또는
npm run dev                   # 프론트만
npm run dev:server            # API만 (cd server)
```

#### 3.1.2 1단계 작업 트리 (`NEXA-Platform-next/`, repo 안)

기존 `NEXA-Platform/` **이름·코드는 그대로** 두고, **형제 폴더**만 추가한다.

```text
NEXA/  (git 루트)
├── NEXA-Platform/              # As-Is — Quasar + Express, 참조·운영
└── NEXA-Platform-next/         # To-Be — 1단계 개발 위치 (최종적으로 repo 밖으로 이동)
    ├── .cursorrules
    ├── .continue/ · .claude/
    ├── docs/
    │   ├── NEXA OS/            # 본 요약 등 (복사·동기화)
    │   └── UI-UX-REFERENCE.md  # old 분석 결과 — 2단계 분리 후에도 SSOT
    ├── database/
    │   └── schema.prisma
    ├── backend-server/         # NestJS
    │   └── src/
    │       ├── auth/
    │       └── ai/             # nexia 연동 (old server/domains/ai 대응)
    └── frontend-client/
        └── src/
            ├── frame/          # 메인 레이아웃 · domainRegistry · auth
            ├── domains/
            │   └── nexia/      # ★ 1단계 필수 완성 도메인
            ├── engines/
            └── system/
```

#### 3.1.3 목표 구조 (To-Be 완성형, `새판 짜기` 원고)

1단계에서 **nexia + 레이아웃**이 굳은 뒤, 저장소 밖으로 옮겨도 동일한 내부 구조를 유지한다.

```text
NEXA-Platform-next/           # 2단계: 독립 repo 루트가 됨
├── .cursorrules
├── database/schema.prisma
├── backend-server/           # NestJS — auth, ai, (이후 devices/sensors …)
└── frontend-client/
    └── src/
        ├── frame/
        ├── domains/nexia/    # 최소 완성 기준 도메인
        ├── engines/
        └── system/
```

#### 3.1.4 As-Is → To-Be 매핑

| 현재 | 목표 | 비고 |
|------|------|------|
| `src/` (Quasar 루트) | `frontend-client/src/` | `quasar.config.js` → Vite 순정 |
| `server/` (Express) | `backend-server/` (NestJS) | Module/Controller/Service/Gateway |
| `database/*.sql` | `database/schema.prisma` + migrate | DDL은 `docs/database/` 유지 가능 |
| `src/frame/registry/domainRegistry.ts` | 동일 패턴 유지 권장 | 도메인 lazy 레이아웃은 이미 정립됨 |
| `src/engines/` | `frontend-client/src/engines/` | UI 금지 원칙 유지 |
| `.continue/rules/nexa-platform.md` | `.cursorrules` + Continue | Quasar → Tailwind 규칙으로 갱신 예정 |
| `docs/NEXA OS/` | 계속 SSOT | 본 문서·원고 |

### 3.2 실시간 데이터 파이프라인

```text
[IoT 장비] --MQTT/WS--> [sensors.gateway] --> [sensors.service] --> [DB / 브로드캐스트]
                                                              |
                                                              v
                                                    [frontend engines] --> [Pinia] --> [Vue UI]
```

### 3.3 NestJS 역할 분담

| 구성요소 | 역할 |
|----------|------|
| **Controller** | HTTP/API 라우팅 |
| **Service** | 비즈니스 로직, 센서 가공, DB 접근 |
| **Module** | 도메인 단위 패키징 (User, Device, Sensor …) |
| **Gateway** | WebSocket·MQTT 실시간 수신 |

### 3.4 프론트엔드 설계 원칙 (Tailwind 중심)

- **원자 단위 컴포넌트**: `BaseButton`, `SensorCard`, `ToggleSwitch` 등 공통 UI를 직접 소유
- **스타일 캡슐화**: Tailwind는 `<style scoped>` 내 `@apply`로만 소비, HTML 오염 최소화
- **고밀도 UI**: IoT 관제 특성상 `p-1`, `gap-1`, `text-xs` 등 정보 밀도 우선
- **반응형**: `md:` / `lg:` + **컨테이너 쿼리**(`@container`)로 사이드바·대시보드 영역 대응
- **테마**: `assets/css/themes/light.css`, `dark.css` 분리 후 `main.css`에서 `@import`

### 3.5 백엔드 안정성

- **DTO + class-validator**: 장비·프론트에서 들어오는 raw payload 검증
- **모듈 분리**: Devices, Telemetry, Alerts 등 — 프론트 컴포넌트 트리와 정렬

---

## 4. UI·테마 방향

- Tailwind `dark:` 접두사로 라이트/다크 전환
- `tailwind.config`에 브랜드 토큰 예시: `nexa-bg`, `nexa-neon`, `nexa-danger` (관제·하이테크 톤)
- Quasar 테마에 묶이지 않고 **독자 테마 스왑** 가능

---

## 5. AI 코딩 규칙 요약 (`.cursorrules` 핵심)

1. `backend-server/` ↔ `frontend-client/` **완전 격리**, 도메인 명칭(Device, Sensor, User) 통일
2. 프론트: Vue 3 + Tailwind, **고밀도·경량 공통 컴포넌트**, 반응형 필수
3. 백엔드: NestJS **Module / Controller / Service** 준수, 실시간은 **Gateway** 기본
4. DB: `schema.prisma` 단일 소스, 복잡 쿼리는 `$queryRaw` 허용

---

## 6. NEXIA(Nexia) 스택과의 관계

| 구분 | NEXIA OS (본 요약) | Nexia 기준서 (`docs/Nexia/12 …`) |
|------|-------------------|----------------------------------|
| 초점 | **IoT 플랫폼 재구축**, LLM 협업, NestJS·Prisma | Cockpit, Rivet, Yjs, LangGraph, Quasar 등 **AI 협업 OS** |
| Yjs 협업 (현 Platform) | — | SSOT: `docs/AI/00_[AIS] Yjs·Hocuspocus 협업 SSOT.md` (Yjs 최우선, Hocuspocus) |
| 프론트 UI | Vue 3 + **Tailwind** (Quasar 없음) | Vue 3 + **Quasar** |
| 백엔드 | **NestJS** | Node.js API (TS 권장) |

→ 동일 저장소 내 **제품 라인이 다를 수 있음**. NEXA-Platform **차세대 IoT 클라이언트**는 본 문서 스택을, NEXIA Cockpit 계열은 Nexia 기준서를 각각 SSOT로 본다.

---

## 7. 권장 다음 단계 (1단계: repo 안)

1. `NEXA-Platform-next/` 골격 생성 (`frontend-client`, `backend-server`, `database`)
2. LLM에 old 참조 지시 — `../NEXA-Platform/src/frame`, `domains/nexia`, `system/css/nexa-system` (**복사 금지·Tailwind 재작성**)
3. **메인 레이아웃** + **`domains/nexia/`** 틀을 §8.3 기준까지 완성
4. `docs/UI-UX-REFERENCE.md` 작성 (2단계 분리 대비)
5. §8.3 충족 후 저장소 밖 분리 · 독립 git

---

## 8. 2단계 이전 전략 (repo 안 next → 저장소 밖 분리)

### 8.1 왜 2단계인가

| 고민 | 1단계 (repo 안) | 2단계 (repo 밖) |
|------|-----------------|-----------------|
| 지금 UI/UX 유지 | old 소스를 LLM이 **직접 읽고** Tailwind로 번역 | `UI-UX-REFERENCE.md`·스크린샷으로 **단독** 진행 |
| Quasar·Express 오염 | next만 Quasar-free | old 경로·규칙과 **완전 단절** |
| old 운영 | `NEXA-Platform` 그대로 `dev:all` | next만 별도 배포·저장소 |

**결론:** 안에서 **참고·번역**, 밖에서 **독립·확장**.  
**밖으로 빼는 시점**은 “전 도메인 이전”이 아니라 **메인 레이아웃 + nexia 도메인 틀 최소 완성**이다.

### 8.2 1단계 — `NEXA-Platform-next/` 에서 할 일

**원칙**

- `NEXA-Platform/`(old)는 **rename·삭제·대량 수정하지 않음**
- old는 **read-only 참조**; `import`·파일 복붙으로 Quasar를 끌어오지 않음
- 포트·DB 분리 권장: FE `5173`, API `3002`, `PGDATABASE=nexa_next`

**LLM 지시 예시 (`.cursorrules` 또는 프롬프트)**

```text
UI/UX 참고: ../NEXA-Platform/src/frame/MainLayout.vue,
  frame/registry/domainRegistry.ts (키 nexia),
  domains/nexia/, system/css/nexa-system/
구현: Quasar 금지. Vue 3 + Tailwind v4 + @apply. 동일 정보 구조·밀도 유지.
```

**old `nexia` 등록 구조 (번역 대상)**

| 슬롯 | As-Is 경로 |
|------|------------|
| left | `domains/nexia/views/left/NexiaLeftNav.vue` |
| content | `domains/nexia/NexiaDomain.vue` |
| right | `domains/nexia/views/right/NexiaRightPanel.vue` |

**old 메인 레이아웃 참고 파일**

| 항목 | As-Is 경로 |
|------|------------|
| 3단 레이아웃 | `src/frame/layout/MainLayout.vue` |
| 도메인 스위치 | `src/frame/registry/domainRegistry.ts` |
| 라우팅 | `src/frame/router/routes.ts`, `index.ts` |
| 인증 | `src/frame/layout/AuthLayout.vue`, `views/auth/*` |
| 전역 네비 | `GlobalNavbarLeft.vue`, `GlobalNavbarRight.vue` |

### 8.3 2단계 진입 기준 — **최소 완성** 체크리스트

아래 **두 블록을 모두** 만족하면 저장소 밖으로 분리한다.  
(이후 도메인 `infra`, `devices` Nest 모듈 등은 **분리 후** next 단독에서 확장.)

#### A. 메인 레이아웃 (frame) 최소 완성

| # | 항목 | 완료 기준 |
|---|------|-----------|
| A1 | 3단 셸 | header + **left** + **content** + **right** 영역이 old와 동등한 **정보 구조** |
| A2 | domainRegistry | `nexia`(및 `home` 등 최소 1개) lazy 로드 패턴 동작 |
| A3 | 라우팅 | 로그인 전 `AuthLayout`, 이후 메인 레이아웃 전환 |
| A4 | 공통 UI | Tailwind 기반 공통 컴포넌트 **≥3** (예: 버튼, 패널 헤더, 리사이즈 핸들) |
| A5 | 테마 토큰 | `tailwind.config` 또는 `themes/*.css`에 old `nexa-system` 밀도·색 **1차 매핑** |
| A6 | 문서 | `docs/UI-UX-REFERENCE.md` — 레이아웃 ASCII/표, spacing·폰트 규칙, old 대비 차이 |

#### B. `nexia/` 도메인 틀 최소 완성

기능 전부가 아니라 **화면 골격·패널 배치**가 old와 같은 “작업 공간”이면 충분하다.

| # | 항목 | 완료 기준 |
|---|------|-----------|
| B1 | 폴더 골격 | `domains/nexia/` + `views/left` · `views/content` · `views/right` |
| B2 | 진입 컴포넌트 | `NexiaDomain.vue`(또는 동등) — content 루트 |
| B3 | 3패널 배치 | LeftNav · 중앙(채팅/에디터 **플레이스홀더**) · RightPanel **마운트·표시** |
| B4 | 라우트 연결 | `domainRegistry`에서 `nexia` 선택 시 위 3패널이 한 화면에 조립 |
| B5 | API 스텁 | Nest `backend-server/src/ai/` + health — nexia가 호출할 **최소 엔드포인트**(mock 가능) |
| B6 | Pinia(선택) | nexia 전용 store 또는 composable **1개** (세션·패널 상태 등) |
| B7 | AI 규칙 | next 전용 `.cursorrules` — **old 경로 의존 없이** 동작 가능한 문장 |

**의도적 미완(분리 후 해도 됨)**

- Ollama·스트리밍·Rivet·NIXIE 연동 전체
- 나머지 19개 도메인
- MQTT·Device 실시간 파이프라인
- 픽셀 단위 디자인 폴리시

#### C. 분리 전 공통 (권장)

| # | 항목 |
|---|------|
| C1 | `database/schema.prisma` + migrate, DB명 `nexa_next` |
| C2 | `.env.example` · 포트 표 · `README.md`(단독 실행 방법) |
| C3 | `npm run dev` (FE+BE)가 **old 없이** next 폴더만으로 기동 |

### 8.4 2단계 — 저장소 밖 분리 절차

```text
[체크] §8.3 A+B(+C 권장) 완료
    ↓
NEXA-Platform-next/ 전체를 새 경로로 이동 (예: D:/Projects/NEXA-Platform-v2/)
    ↓
git init (또는 새 remote) — old repo와 히스토리 분리
    ↓
문서에 source 기록: old 참조는 UI-UX-REFERENCE.md 만 SSOT
    ↓
Cursor 워크스페이스를 **새 경로만** 루트로 전환
    ↓
(선택) mono-repo에는 README만 남기고 next는 submodule/별 remote
```

**이동 시 가져갈 것**

- `NEXA-Platform-next/` 전체
- `docs/NEXA OS/`, `UI-UX-REFERENCE.md`
- `.cursorrules`, `.continue/`

**가져가지 않을 것**

- old `src/`, `server/`, `node_modules/`, `.quasar/`
- Quasar·Express 설정 파일

**old와의 관계 (분리 후)**

| 자산 | SSOT |
|------|------|
| BM·Robot·대형 기획 | 필요 시 **복사본**에 `copied-from` 메타; 동기화는 수동 |
| UI/UX | **next의 `UI-UX-REFERENCE.md`** |
| DB DDL 참고 | `docs/database/`는 참고만, 스키마 SSOT는 **Prisma** |

### 8.5 단계별 흐름도

```text
NEXA-Platform (old, 유지)
       │ read-only 참조
       ▼
NEXA-Platform-next (1단계, repo 안)
       │ ① Vite+Tailwind+Nest 골격
       │ ② frame 메인 레이아웃
       │ ③ domains/nexia 틀
       │ ④ UI-UX-REFERENCE.md
       ▼
§8.3 충족?
       │ yes
       ▼
독립 repo (2단계, repo 밖) — 완전 단절 후 도메인·IoT 확장
```

---

*최종 갱신: 원본 `새판 짜기.MD`, `새판 짜기-02.MD` 및 2단계 이전 전략(메인 레이아웃 + nexia 최소 완성 후 분리) 반영.*

# M.O.S.E.S. 시스템 아키텍처 및 전략 가이드

| 항목     | 내용                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| **약어** | **M.O.S.E.S.** — Meta-Operating System for Engineering & Synthesis             |
| **한글** | **모세** — 시스템을 만들기 위한 시스템 (Meta-Build OS)                         |
| **역할** | **NEXA 플랫폼** 및 기타 대상 시스템의 설계·생성·배포·유지 (배포 **제품** 아님) |

"인간의 주관적인 아이디어(기획)를 ➔ 가장 객관적인 정보(JSON, OpenAPI)로 정제한 뒤 ➔ 이를 활용해 소프트웨어(시뮬레이터)와 하드웨어(ESP32)를 가장 효율적인 방식으로 다루고 합성(Synthesis)해 내는 **시스템을 만드는 도구시스템**"

**한 줄:** **NEXA 플랫폼을 비롯해, 앞으로 만들 모든 대상 시스템**을 **충돌 없이** 설계·생성·배포·유지하기 위한 **메타 운영체제**다.

- 나는 **무엇을** 하고자 하는가를 정립하는 툴이다.
- 너는 **어떻게** 해야 하는지 규격을 정립하는 툴이다.
- 즉 나는 너를 통해 무엇을 하고자 하는가를 정립하는 툴이다.

## 1. M.O.S.E.S. 개요

**'무엇(What) - 어떻게(How) - 검증(Verify)'**

### 1. 나는 "무엇을" 하고자 하는가를 정립하는 툴 (Spec)

이 단계는 인간의 주관적인 아이디어를 **가장 객관적인 정보(JSON, OpenAPI)**로 정제하는 과정입니다,.

- **주체:** 인간(기획자/개발자)이 주도합니다.
- **행동:** **Desktop Rivet**, Zod, Docs 등을 활용하여 시스템의 **사상, 철학, 금지 규칙(Normex)**을 선언합니다,,.
- **의의:** 구현 언어에 종속되지 않는 **데이터 규격(Spec)**을 만듦으로써 시스템의 본질을 확정합니다,.

### 2. 너는 "어떻게" 해야 하는지 규격을 정립하는 툴 (Generate)

M.O.S.E.S.가 정해진 스펙을 바탕으로 실제 **물리적인 산출물(코드)**을 파생시키는 과정입니다,.

- **주체:** **Hermes 3(로컬 LLM)** 또는 IDE 에이전트(클로드 코드 등)가 수행합니다,,.
- **행동:** 선언된 스펙을 읽어 **.ts, .cpp, .sql** 등의 소스 코드와 설정 파일을 자동으로 생성합니다,.
- **의의:** 개발자를 물리적 코딩의 고통에서 해방시키고, **스펙과 코드 사이의 정합성**을 기계적으로 보장합니다,.

### 3. 실제 검증은 "NEXA 플랫폼(코딩산출물)"에서 수행 (Runtime/3b)

M.O.S.E.S. 레이어에서 만들어진 결과물이 실제 **제품 런타임**에서 동작하며 가치를 증명하는 단계입니다.

- **검증 레이어 (3b - 스펙 소비):** M.O.S.E.S.가 만든 스펙과 코드를 **NEXA 플랫폼이 직접 검증하고 소비**합니다,. 예를 들어, 공유 Zod 스키마를 통해 데이터 유효성을 검사(safeParse)하거나 도메인 레지스트리를 반영합니다,.
- **실행 레이어 (4 - 자율 실행):** **OpenClaw**를 통해 빌드되고 배포된 결과물이 실제 환경(웹 서비스, ESP32 기기 등)에서 규격대로 작동하는지 확인됩니다,,.
- **의의:** M.O.S.E.S.는 '만드는 층'으로 남고, **NEXA 플랫폼은 '서비스되는 층'**으로서 실제 사용자 트래픽과 운영 데이터를 통해 시스템의 완성도를 최종 검증합니다,.

### 결론

**"기획(What)은 인간이, 설계 규격(How)은 M.O.S.E.S.가, 동작 검증(Verify)은 NEXA 플랫폼이"** 담당한다고 정리하는 것은 이 시스템의 **책임 분리(Layer 0)** 원칙을 가장 직관적으로 설명하는 방식입니다,.

---

M.O.S.E.S.는 배포용 **제품**이 아니라, **NEXA 플랫폼·ESP32·향후 별도 제품**을 같은 메타 파이프라인으로 다루는 **메타 레이어**다.

| 구분                           | 설명                                                             |
| ------------------------------ | ---------------------------------------------------------------- |
| **NEXA 플랫폼**                | 세상에 **배포·서비스**되는 통합 제품                             |
| **NEXIA** (`domainKey: nexia`) | 플랫폼 **핵심 지능 도메인 하나** — 7탭·Omnix. 플랫폼 전체가 아님 |
| **M.O.S.E.S.**                 | 위 제품·시스템을 **만들고·고치고·배포**하는 층                   |

- **핵심 가치:** 터미널·물리 코딩·OTA의 고통을 메타 레이어에 두고, 개발자는 **Spec** 관리·지휘에 집중.
- **공통 골격:** **Spec(선언) → Generate(생성) → Execute(실행·배포)** → _(이후 제품 런타임)_

**엣지(ESP32):** M.O.S.E.S. 전체가 아니라 **산출 채널 유형 중 하나**. 웹·백엔드·DB·CI도 동일 골격.

**플랫폼 UI (To-Be):** 통합 프론트는 **`apps/web` = Next.js** (App Router · TypeScript). **React**는 UI 라이브러리 계층이며, **프레임워크 SSOT 이름은 Next.js**다. 상세·혼동 방지는 §7.0 · §7.2 B1.

---

## 2. 전략 1 vs 전략 2

| 구분          | **전략 1** (메타 구조·경계)                                  | **전략 2** (NEXA AI 웹앱 실무)                 |
| ------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| **목적**      | Web+IoT·확장 대상 **경계·SSOT**                              | 웹앱 **일상 개발·배포·운영**                   |
| **Spec**      | `docs`/Normex **+ Desktop Rivet** (+ Zod)                    | Desktop Rivet **+ Zod** (+ `docs/`)            |
| **Generate**  | **Ollama + Hermes 3** (로컬 모델)                            | **클로드 코드 / 안티그래비티**                 |
| **Execute**   | **OpenClaw** · CI · `pnpm` · ESP32 OTA · (선택 **n8n** When) | **OpenClaw** · CI · 스테이징/프로덕션 **배포** |
| **런타임 AI** | NEXIA·Ollama **서비스** (별도)                               | **외부 연동 에이전트** (§4)                    |

**갈라지는 축:** 주로 **Generate 도구**. Execute 원칙(제품이 터미널·OTA 직접 금지)은 **동일**.

### 2.1 3단계 ↔ 두 전략 매핑

| 3단계           | 전략 1                    | 전략 2 (단계 번호)                  |
| --------------- | ------------------------- | ----------------------------------- |
| **Spec**        | `docs` + Desktop Rivet    | **1** 설계·Spec                     |
| **Generate**    | Ollama + Hermes 3         | **3** IDE 구현                      |
| **Execute**     | OpenClaw · CI · n8n(When) | **2** n8n 트리거(선택) · **4** 배포 |
| **제품 런타임** | NEXIA · Grade · 협업      | **5** 외부 연동 에이전트            |

---

## 3. 전략 2 — 5단계 파이프라인 (웹앱 실무)

| 단계                  | 3단계             | 도구                          | 산출·임무                                              |
| --------------------- | ----------------- | ----------------------------- | ------------------------------------------------------ |
| **1 설계·Spec**       | Spec              | Desktop Rivet · Zod · `docs/` | §7 **사전 준비 산출물** (코드·migration 적용 **아님**) |
| **2 트리거** _(선택)_ | Execute(When)     | **n8n**                       | 메일·일정·웹훅 → CI/파이프라인 **시작**                |
| **3 구현**            | Generate          | 클로드 코드 / 안티그래비티    | `.ts` `.tsx` … → 리뷰·**merge**                        |
| **4 배포**            | Execute           | OpenClaw · CI · `pnpm`        | build · test · migrate · **스테이징/프로덕션**         |
| **5 런타임**          | _(M.O.S.E.S. 밖)_ | **외부 연동 에이전트**        | 배포된 웹·API와 연동 · 사용자 응대                     |

```text
[1 Spec] → (2 n8n?) → [3 IDE Generate] → [4 Deploy] → [5 Runtime Agent]
```

---

## 3.5 Rivet — Desktop(설계) · Embedded(엔진)

**기억할 것은 두 이름뿐이다.** 문서·코드 어디서든 **「Rivet」만 쓰지 않는다.**

| 쉬운 이름 (권장)   | 기술 별칭               | 한 줄                                          |
| ------------------ | ----------------------- | ---------------------------------------------- |
| **Desktop Rivet**  | Design-time (선택)      | PC GUI로 그래프 **작성** → **계약 파일**보내기 |
| **Embedded Rivet** | Run-time · `rivet-node` | **독립 로직 실행기** — 계약 파일만 로드·실행   |

### 3.5.0 완전 분리 원칙 (Contract-Only)

**Desktop Rivet**과 **Embedded Rivet**은 **서로의 내부 구현·프로세스·UI를 알 필요가 없다.**  
유일한 접점 = 디스크/저장소/API에 올라온 **Rivet Graph Contract** 파일.

| 규칙              | 내용                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- |
| **계약 형식**     | 프로젝트별 **`*.rivet-project`** (Ironclad 호환) 또는 동일 스키마의 **export `.json`** |
| **Embedded 입력** | 위 파일 **경로·바이트·버전** 만 — Desktop 설치 여부 **무관**                           |
| **Embedded 금지** | Desktop GUI 호출 · `.rivet-project` **편집 UI** · 앱 대량 codegen · OTA·CI             |
| **Desktop 금지**  | 프로덕션 트래픽에서 **그래프 실행** (실행은 항상 Embedded)                             |

**프로젝트 단위 SSOT:** 업무·제품 단위마다 **자기 `.rivet-project` 하나(이상)** 를 둔다. Embedded는 **프로젝트 ID → 해당 그래프 파일** 만 매핑해 실행한다.

```text
  [설계 경로 — 모두 동등, Desktop 필수 아님]
    Desktop Rivet  │  Web Rivet Editor  │  템플릿·CI·LangGraph 합성
         \              |                    /
          ▼             ▼                   ▼
     projects/{projectId}/logic/{name}.rivet-project   ← Contract (유일 접점)
          │
          ▼
     [Embedded Rivet @ NestJS]  rivet-node.load(contract)  ← 독립 실행기
          │
          ▼
     YAML · handoff · API 응답 …  (예: esp32-sensor.rivet-project · nexia-chatbot.rivet-project)
```

**예시 (파일 1프로젝트 1그래프 이상):**

| 프로젝트        | `*.rivet-project` (예)                    | Embedded가 하는 일                 |
| --------------- | ----------------------------------------- | ---------------------------------- |
| ESP32 센서 제어 | `logic/esp32-sensor.rivet-project`        | `HandoffESPHome` 등 → YAML·payload |
| AI 챗봇 (Nexia) | `logic/nexia-omnix-routing.rivet-project` | 탭 라우팅·추론·API 응답            |
| Normex 가드     | `logic/normex-policy.rivet-project`       | 규범 Subgraph 실행                 |

### 3.5.0a 공식 정의 (역할만)

| 구분              | **Desktop Rivet (설계용)**                      | **Embedded Rivet (엔진용)**                   |
| ----------------- | ----------------------------------------------- | --------------------------------------------- |
| **정체**          | Ironclad **PC GUI** (선택적 설계 도구)          | **`@ironclad/rivet-node`** 독립 **Run-time**  |
| **위치**          | 개발자 **로컬**                                 | **`apps/backend`** · (선택) 에이전트 프로세스 |
| **역할**          | 그래프 **시각 편집** → Contract **저장/Export** | Contract **로드·실행**만                      |
| **산출물**        | `*.rivet-project` / export JSON                 | 실행 결과·파생물 (YAML, handoff, API 응답 등) |
| **상대와의 관계** | Embedded **코드·API 의존 없음**                 | Desktop **설치·실행 의존 없음**               |

### 3.5.1 Rivet이 **아닌** 것 (헷갈리기 쉬움)

| 이름                                      | Rivet?                                | 이유                                                                                             |
| ----------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Web Rivet Editor**                      | 설계 **계열** (Desktop **대체 가능**) | Nexia — Contract **저장**만 · **실행은 Embedded**                                                |
| **nexa-node** 캔버스                      | **아니오**                            | ESP32·ESPHome **노드 JSON** — IoT Spec 전용                                                      |
| **Nexion React Flow**                     | **아니오**                            | `domainKey: nexion` 지식 데스크 **ER·N-PATH 시각화** (`@xyflow/react`) — Rivet·Embedded **아님** |
| **NEXIA React Flow** (Synapse·Circuit 등) | **아니오**                            | `domainKey: nexia` 제너레이터 **회로·그래프 UI** — 위와 **별 도메인·별 캔버스**                  |
| **OpenClaw**                              | **아니오**                            | **Execute** — Embedded **결과물**을 빌드·배포할 뿐, `rivet-node` 호스트가 **아님**               |
| **n8n**                                   | **아니오**                            | **When** 트리거만                                                                                |

> **용어 주의:** 「웹에 **끼운 편집기**」= **Web Rivet Editor**. 「서버에 **끼운 라이브러리**」= **Embedded Rivet**. 둘 다 영어 embedded이지만 **역할이 다르다** — 문서에서는 편집기 쪽에 **Embedded라는 말을 쓰지 않는다.**  
> **Flow 라이브러리:** M.O.S.E.S.·NEXIA 제너레이터 SSOT는 **React Flow** (`@xyflow/react`). 구 NXN 문서·`src/domains/nexion` **As-Is**는 `@vue-flow/core` — **「Vue Flow」표기는 레거시**이며 신규 문서에는 **Nexion React Flow** / **NEXIA React Flow**로 구분한다.  
> **프레임워크:** 통합 셸 = **Next.js** (`apps/web`). **React Flow ≠ Next.js** (그래프 UI 라이브러리). **Vite+React** 제너레이터 앱은 Next **내부 embed·iframe** — 별 앱이지만 플랫폼 SSOT 프레임은 Next.

### 3.5.2 ESP · ESPHome (짧은 경로)

| 단계     | 담당                                                                     |
| -------- | ------------------------------------------------------------------------ |
| **Spec** | **nexa-node** 노드 JSON (주) · 프로젝트별 `logic/*.rivet-project` (보조) |
| **파생** | **Embedded Rivet** — 해당 프로젝트 Contract 로드 → YAML·payload          |
| **배포** | ESPHome 빌드 서비스 · **OpenClaw** OTA                                   |

---

## 4. Hermes 3 vs 외부 연동 에이전트

| 이름                   | 층                               | 정체                                                   |
| ---------------------- | -------------------------------- | ------------------------------------------------------ |
| **Hermes 3**           | Meta · **Generate** (전략 1)     | Ollama **로컬 LLM 모델** — Spec→`.ts`/`.cpp` 등        |
| **외부 연동 에이전트** | **제품 런타임** (전략 2 · 5단계) | 배포된 **웹·백엔드에 API/웹훅으로 붙는 에이전트 역할** |

- **혼동 금지:** 「런타임 에이전트」≠「Hermes 3 모델」. 이름에 Hermes를 붙일 **필요 없음**.
- **LLM 교체:** 외부 에이전트의 뇌는 Hermes 3 · Claude · GPT 등 **교체 가능**.

---

## 5. 레이어 구조 (책임 분리)

| 레이어             | 3단계           | 도구·축                           | 산출·역할                                                         |
| ------------------ | --------------- | --------------------------------- | ----------------------------------------------------------------- |
| **0 메타 경계**    | —               | (규칙)                            | NestJS·**Next.js**가 **터미널·OTA·대량 codegen 직접 수행 금지**   |
| **1 사상·철학**    | Spec (전제)     | `docs/` · Normex                  | 사상·금지 규칙 — **Rivet·n8n 1차 도구 아님**                      |
| **2 가상화·스펙**  | Spec (핵심)     | **Rivet Graph Contract**          | 프로젝트별 `*.rivet-project` · Zod (Desktop/Web/CI **동등 작성**) |
| **2b 엔진 소비**   | Generate·런타임 | **Embedded Rivet** (`rivet-node`) | Contract **만** 로드 · 추론·handoff **파생** (Desktop **불요**)   |
| **3 로컬 추론**    | Generate        | **Ollama + Hermes 3**             | 소스·설정 **초안** (전략 2는 IDE가 대체·병행)                     |
| **3b 스펙 소비**   | _(Generate 후)_ | Zod · `packages/shared`           | 플랫폼이 Spec/타입 **검증·소비** (생성은 Meta)                    |
| **4 자율 실행**    | Execute         | **OpenClaw**                      | 빌드 · CI · migrate · **ESP32 플래시·OTA**                        |
| **4b 실행 트리거** | Execute (선택)  | **n8n**                           | **When** — 파이프라인·CI **호출만** (Spec 아님)                   |
| **5 외부 관계**    | Execute (선택)  | Telegram 등                       | 운영자 **알림·수동 트리거** (채널)                                |

**Rivet vs n8n:** Contract = What/How **선언** · **Embedded Rivet** = **독립 실행** · **n8n** = When (트리거). Desktop은 Contract **작성 수단 중 하나**.

**외부 연동 에이전트**는 Layer 5가 **아님** — **제품 런타임**(전략 2 · 5단계). Layer 5는 **운영 채널**만.

### 5.1 산출물이 나오는 단계 (요약)

| 단계         | 무엇이 발현되는가                                                        |
| ------------ | ------------------------------------------------------------------------ |
| **Spec**     | §7 표 전체 — **선언·규격·구조 설계** (실행 코드·migration 적용 **아님**) |
| **Generate** | `.ts` `.tsx` `.sql` `.cpp` … (**코딩 산출물 최초**)                      |
| **Execute**  | `dist` · image · OTA 바이너리 (**돌아가는 형태**)                        |
| **런타임**   | 사용자 트래픽 · 에이전트 세션 · Grade                                    |

### 5.2 ESP32 (대표 IoT 채널)

| 3단계    | 내용                                              |
| -------- | ------------------------------------------------- |
| Spec     | `{ nodeType, pin, … }` 노드 Spec                  |
| Generate | Spec → **C++** (로컬 LLM 검증)                    |
| Execute  | OpenClaw → **빌드·플래시·OTA**; Nest는 **웹훅만** |

---

## 7. Spec 단계 — 전문 웹앱 사전 준비 산출물

**Spec(선언)** 단계에서 **Generate·Execute에 넘기기 전** 확정해야 할 **선언·규격·구조 설계** 목록이다.  
산출물은 **문서·JSON·YAML·그래프·Zod 스키마 정의** 형태이며, **컴파일 가능한 앱 소스·적용된 DB migration·배포 아티팩트는 아니다.**

**주 도구:** `docs/inbox/` → `docs/refined/` → `docs/specs/` (§7.2 B1) · Normex · **`logic/*.rivet-project`** · **Zod** — **실행은 Embedded Rivet**(§3.5.0)  
**금지:** n8n 워크플로를 Spec SSOT로 두기 · 미검증 채로 `apps/*`에 코드 직접 작성

### 7.0 Spec 단계 핵심 용어

| 용어                                  | 역할 (한 줄)                                       | Spec에서의 위치                                                  |
| ------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| **SSOT** (Single Source of Truth)     | 한 규칙은 **한 곳**에서만 정의                     | Zod·OpenAPI·`domainLayoutRegistry` Spec                          |
| **DTO** (Data Transfer Object)        | API·이벤트 **경계** 데이터 형태                    | `packages/shared` Zod (**별칭 `@shared/schemas`**)               |
| **Contract** (계약)                   | 클라이언트·서버·엣지가 **공유하는 타입·프로토콜**  | OpenAPI · SSE 이벤트 스키마 · CSIM                               |
| **Monorepo** (모노레포)               | web·backend·sync·shared **한 저장소**              | 디렉터리·패키지 경계 Spec                                        |
| **Domain** (도메인)                   | 전역 메뉴 **업무 영역** (`domainKey`)              | 레지스트리·폴더·API prefix                                       |
| **Frame** (프레임)                    | 도메인 **슬롯 호스트** (비즈니스 로직 없음)        | Layout·Drawer·Header 슬롯 Spec                                   |
| **CRDT**                              | 분산 **무본 충돌** 편집 모델                       | Yjs `Y.Doc` · map-keys                                           |
| **Grade×Ingress**                     | 명령 **자격×유입 경로** 매트릭스                   | `commands/` Zod · 라우팅 표                                      |
| **Normex**                            | 규범·MUST/SHOULD **실행 차단** 규칙                | HEXAGON·승인 게이트 Spec                                         |
| **ERD** (Entity-Relationship Diagram) | DB **개념·관계**                                   | Prisma 전 **논리 모델**                                          |
| **Prisma ORM**                        | TypeScript **스키마 선언 → Client·migration** 생성 | `apps/backend` **전용** (웹 직접 접근 금지)                      |
| **Prisma Schema**                     | DB **물리 모델 SSOT** (`schema.prisma`)            | Spec 선언 · Generate로 migration 파일                            |
| **Prisma Migrate**                    | 스키마 diff → **SQL migration**                    | SQL 생성=Generate · DB **적용=Execute**                          |
| **Prisma Client**                     | 런타임 **타입 안전 쿼리** API                      | `prisma generate` 후 Nest **주입**                               |
| **OpenAPI**                           | REST **경로·요청·응답** 기계 가독 규격             | `openapi.yaml` 또는 export JSON                                  |
| **Next.js**                           | NEXA **통합 웹 셸** (`apps/web`)                   | App Router · `frame/`·`domains/`·RSC/Client Component 경계 Spec  |
| **React**                             | Next.js **UI 런타임** (라이브러리)                 | 컴포넌트·훅 — **「프론트 = React」만 쓰지 않음** (§7.2 B1)       |
| **Vite + React** (제너레이터)         | Nexia **탭별 마이크로 앱** (3D·Circuit 등)         | Next **embed** · 독립 dev 서버 — **플랫폼 프레임워크 SSOT 아님** |
| **Rivet Graph Contract**              | 프로젝트별 **로직 SSOT**                           | `projects/…/logic/*.rivet-project` (§3.5.0)                      |
| **Desktop Rivet**                     | Contract **작성 도구**(선택)                       | PC GUI Export                                                    |
| **Embedded Rivet**                    | **독립 실행기** (`rivet-node`)                     | Contract 로드만 — Desktop **무관** (§3.5.0)                      |
| **Web Rivet Editor**                  | Nexia **브라우저** 그래프 편집                     | Desktop과 **동일 Export 규칙** · Yjs (§3.5.1)                    |

---

### 7.1 [A] 거버넌스 · 기획 · 철학 (Layer 1)

| #   | 전문 용어                          | 역할                             | Spec 산출물                                   | 형식·위치 (예)                                    | Generate 전 검증      |
| --- | ---------------------------------- | -------------------------------- | --------------------------------------------- | ------------------------------------------------- | --------------------- |
| A1  | **Product Vision**                 | NEXA 플랫폼·도메인 **목적·범위** | 기획 요약·비목표(Out of Scope)                | `docs/` · PRD                                     | 범위 creep 방지       |
| A2  | **Normex / Policy Spec**           | 금지·MUST·승인 **규범**          | 규범 표 · HEXAGON Who/What                    | `docs/Nexia/` · **Desktop Rivet** Normex Subgraph | 고위험 자동 실행 차단 |
| A3  | **Glossary / Ubiquitous Language** | 팀·AI **동일 용어**              | 용어집 · `tabId` · `domainKey`                | `docs/` · `_KNOWLEDGE` 연동                       | DTO·UI 라벨 일치      |
| A4  | **NEXIA `tabId` Map**              | 7탭 **역할·데이터 소유**         | Omnix…Navex 탭 규정                           | `docs/Nexia/00` 수준 SSOT                         | 탭 간 책임 중복 없음  |
| A5  | **RBAC Matrix**                    | 역할×리소스 **인가**             | Owner/Admin/Editor/Viewer × 도메인·Grade 상한 | 표 · JSON                                         | API Guard 설계 입력   |

---

### 7.2 [B] 모노레포 · 디렉터리 구조 (Repository Layout Spec)

| #   | 전문 용어            | 역할                        | Spec 산출물                                       | 형식·위치 (예)                                                | Generate 전 검증  |
| --- | -------------------- | --------------------------- | ------------------------------------------------- | ------------------------------------------------------------- | ----------------- |
| B1  | **Workspace Layout** | 앱·패키지 **경계**          | 모노레포 트리 **선언**                            | `apps/web` · `apps/backend` · `apps/sync` · `packages/shared` | cross-import 규칙 |
| B2  | **Import Boundary**  | 레이어 **역방향 금지**      | `engines/`→`domains/` 금지 등                     | ADR · README 규칙                                             | 순환·누수 방지    |
| B3  | **Web `src` 4축**    | 프론트 **책임 분리**        | `frame/` · `domains/` · `engines/` · `system/` 맵 | 구조 Spec 표                                                  | AI 스캐폴드 일관  |
| B4  | **Path Alias Spec**  | `@/`, `@system`, `@engines` | `tsconfig` paths **목록**                         | JSON · 문서                                                   | import 혼선 방지  |
| B5  | **Env Matrix**       | dev/stage/prod **변수 키**  | `.env.example` **키 목록** (값 비밀 제외)         | 표                                                            | 배포 실패 예방    |

**B1 표준 트리 (NEXA 플랫폼 To-Be):**

| As-Is (레거시)                                             | To-Be (SSOT)                                                                  |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `NEXA-Platform/` 루트 **Quasar + Vue 3** (`src/domains/*`) | **`apps/web`** **Next.js** App Router + `src/{frame,domains,engines,system}/` |

```text
apps/web/          # Next.js App Router · UI 셸 · domains
apps/backend/      # NestJS REST · Prisma · SSE · audit
apps/sync/         # Hocuspocus · Yjs WS (Nest와 프로세스 분리)
apps/desktop/      # U2BEE (선택) · OpenAPI→Pydantic 미러
packages/shared/   # Zod SSOT — import 별칭 `@shared` · 스키마 루트 `schemas/` (§7.4.2)

docs/              # 문서 SSOT (코드와 분리)
├── inbox/         # (필수) 날것 — Desktop Rivet 00번 입력
├── refined/       # 1차 정제 기획 — 01~02번
├── specs/         # 확정 명세·도메인 SSOT — 03~07번·구현 참조
└── trash/         # 처리된 inbox (inbox/ 와 동일 트리 미러)
```

---

### 7.3 [C] 도메인 · UI 셸 (Domain & Presentation Spec)

| #   | 전문 용어                | 역할                                | Spec 산출물                          | 형식·위치 (예)                      | Generate 전 검증      |
| --- | ------------------------ | ----------------------------------- | ------------------------------------ | ----------------------------------- | --------------------- |
| C1  | **`domainKey` Registry** | 메뉴↔폴더↔슬롯 **SSOT**           | `domainLayoutRegistry` **항목 초안** | JSON/TS Spec · (선택) Desktop Rivet | 전환 시 UI 누락 없음  |
| C2  | **Slot Contract**        | left/content/right/**statusBar** 등 | 슬롯별 컴포넌트 **이름·책임**        | 표                                  | lazy import 대상 명확 |
| C3  | **Drawer Policy**        | L/R **openPolicy** · `autoOpen`     | `drawerDefaults` per domain          | `DrawerOpenPolicy` enum 표          | UX·레이아웃 일관      |
| C4  | **Theme Preset**         | 산업 **시각 프리셋**                | `themePreset`: `power-grid` 등       | registry 필드                       | semantic 토큰 불변    |
| C5  | **Wireframe / IA**       | 정보 구조·화면 **흐름**             | 와이어 · 사용자 플로우               | Figma/export · md                   | API·라우트 정합       |
| C6  | **Route Map**            | Next **App Router** 트리            | `(shell)/`, `(embed)/u2bee/` 등      | 경로 표                             | 404·중첩 방지         |
| C7  | **Layout Shell**         | Header·Drawer·StatusBar **조립**    | `MainLayout` 슬롯 배선도             | 다이어그램                          | frame 비즈니스 로직 0 |

---

### 7.4 [D] 데이터 · DB (Data & Persistence Spec)

| #   | 전문 용어                      | 역할                        | Spec 산출물                                        | 형식·위치 (예)               | Generate 전 검증               |
| --- | ------------------------------ | --------------------------- | -------------------------------------------------- | ---------------------------- | ------------------------------ |
| D1  | **Conceptual Data Model**      | 업무 **엔티티·관계**        | ERD · 엔티티 정의서                                | `.md` · ERD tool             | 도메인 언어 반영               |
| D2  | **Prisma Schema Spec**         | 물리 **테이블·인덱스** 선언 | `schema.prisma` **초안** (Spec 단계)               | Prisma DSL                   | migration Generate 입력        |
| D3  | **Migration Plan**             | 스키마 변경 **순서·롤백**   | migration 목록 · 위험 표                           | `docs/` · 이슈               | Execute 시 migrate 순서        |
| D4  | **RLS / Tenancy**              | 행 수준 **격리** (필요 시)  | tenant 키 · 정책 표                                | SQL policy 초안              | 데이터 유출 방지               |
| D5  | **Retention Policy**           | 감사·로그 **보존 기간**     | 180일+ 등                                          | 보안 Spec                    | 스토리지·Compliance            |
| D6  | **Vector / Extension**         | pgvector 등 **확장 자리**   | extension 목록                                     | 인프라 Spec                  | Knowledge·검색 연동            |
| D7  | **Seed Spec**                  | dev **초기 데이터**         | seed 시나리오 · `prisma db seed` 스크립트 **설계** | `prisma/seed.ts` 목록 (Spec) | 로컬 재현                      |
| D8  | **Prisma ↔ Zod Boundary**     | DB 모델 ≠ API **경계 DTO**  | 모델별 **Response/Create DTO** Zod 매핑 표         | `packages/shared`            | web에 `PrismaClient` 노출 금지 |
| D9  | **Audit / Append-only Tables** | 감사·명령 로그 **스키마**   | `audit_log` 등 필드 · 인덱스 · 보존                | `schema.prisma` + G5         | 2등급+ 추적                    |

> **주의:** Spec의 Prisma는 **설계 선언**. migration **SQL 파일 생성**은 Generate · DB **`migrate deploy` 적용**은 Execute.

#### 7.4.1 Prisma ORM — NEXA 플랫폼 사용 (위치 · 3단계 · Nest 연동)

**역할:** PostgreSQL(**+ pgvector** 확장 자리)에 대한 **물리 데이터 SSOT**. NestJS `apps/backend`에서만 ORM으로 사용한다.  
**금지:** `apps/web`·브라우저에서 Prisma Client 직접 사용 · 스키마를 OpenAPI만으로 대체(Zod/API Contract는 **별도** SSOT).

| 항목               | 내용                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **저장 위치**      | `apps/backend/prisma/schema.prisma`                                                                                                   |
| **migration 폴더** | `apps/backend/prisma/migrations/`                                                                                                     |
| **DB 엔진**        | `provider = "postgresql"` · `DATABASE_URL` (Spec: **키 이름만**, 비밀값은 env)                                                        |
| **런타임 주입**    | Nest `PrismaModule` / `PrismaService` — Controller·Service에서만 쿼리                                                                 |
| **sync 앱**        | `apps/sync`(Hocuspocus)는 **프로세스 분리** — DB URL 공유 가능, Prisma는 backend가 **영속 SSOT** (`onStoreDocument` → backend/Prisma) |

**M.O.S.E.S. 3단계별 Prisma 작업**

| 3단계        | Prisma 관련 작업                                       | 산출물                                                                  | 담당                    |
| ------------ | ------------------------------------------------------ | ----------------------------------------------------------------------- | ----------------------- |
| **Spec**     | ERD→모델·관계·`@@index`·enum·`@relation` **선언**      | `schema.prisma` **초안** · Migration Plan(D3) · D8 DTO 매핑 표          | 사람·Desktop Rivet·문서 |
| **Generate** | `prisma migrate dev --create-only` 또는 IDE가 diff→SQL | `migrations/YYYYMMDD_*/migration.sql` · `prisma generate` → Client 타입 | Ollama/IDE·로컬 CLI     |
| **Execute**  | 스테이징/프로덕션 **적용**                             | `prisma migrate deploy` · CI 게이트 · (선택) `db seed`                  | OpenClaw · CI           |
| **런타임**   | Nest 비즈니스·감사·edge-queue **쿼리**                 | 트랜잭션·로그 적재                                                      | `apps/backend` (제품)   |

```text
[Spec]     ERD · schema.prisma 초안 · Zod DTO 매핑 표
              │
              ▼
[Generate] migration.sql 생성 · prisma generate (Client)
              │  (리뷰 · git merge)
              ▼
[Execute]  migrate deploy · test:security · 배포
              │
              ▼
[Runtime]  PrismaService — API·audit·queue (Zod로 API 경계 검증)
```

**스키마 설계 Spec 체크 (Prisma DSL)**

| 요소          | Spec에서 정할 것                                          |
| ------------- | --------------------------------------------------------- |
| **Model**     | 테이블명·필드·PK (`@id` · `uuid` / `uuid_generate_v7` 등) |
| **Relation**  | 1:N · N:M · `onDelete` · `project_id` 등 **도메인 귀속**  |
| **Index**     | 조회·감사·`traceId` · 시계열                              |
| **Enum**      | 상태·Grade·명령 상태 — shared Zod enum과 **이름 정합**    |
| **Extension** | `pgvector` · Timescale(해당 시) — D6                      |
| **@@map**     | 레거시 DB 컬럼명 매핑 (있을 때)                           |

**Zod · OpenAPI와의 관계 (D8)**

| 계층          | SSOT                      | 설명                                                                              |
| ------------- | ------------------------- | --------------------------------------------------------------------------------- |
| **DB**        | `schema.prisma`           | 저장 구조·제약                                                                    |
| **API 경계**  | `packages/shared` **Zod** | 요청/응답·SSE·commands — web/sync가 import                                        |
| **REST 문서** | OpenAPI (E1)              | 경로·예시 — Zod와 **불일치 없게** Spec 단계에서 대조                              |
| **변환**      | Nest Service              | `Prisma` 결과 → `safeParse`(Response DTO) — **Prisma 타입을 web으로 직전달 금지** |

**플랫폼 연계 (Spec 시 명시 권장)**

| 연계           | Prisma 관점                                                         |
| -------------- | ------------------------------------------------------------------- |
| **Project**    | `projects` 등 **최상위 작업단위** — 채팅·자산 `project_id` FK       |
| **Knowledge**  | `nexa_knowledge_*` 계열 — pgvector·승인 큐 (1단계 Knowledge 로드맵) |
| **Audit**      | `audit_log` interceptor 필드와 **컬럼 1:1** (G5)                    |
| **Edge queue** | G3 명령·`edge-queue` enqueue 테이블/상태 (해당 시)                  |

**U2BEE (`apps/desktop`):** Prisma **미사용** — backend REST + **OpenAPI → Pydantic v2** 미러로 동일 Contract 유지.

#### 7.4.2 공유 Zod SSOT · 4소비자 · Prisma (데이터 규격 흐름)

Spec 단계에서 **기획·규격**을 정한 뒤, **API·UI·명령 경계**는 `packages/shared` Zod가 **최상위 Contract SSOT** 이다.  
**DB 물리 구조**는 **별도 SSOT**인 Prisma → PostgreSQL 이며, D8 **매핑 표**로 Zod DTO와 연동한다.

**경로·별칭 (To-Be)**

| 구분            | 경로                                                   | 비고                                       |
| --------------- | ------------------------------------------------------ | ------------------------------------------ |
| **물리 패키지** | `packages/shared/`                                     | 모노레포 워크스페이스 패키지명             |
| **스키마 루트** | `packages/shared/src/schemas/` (또는 `schemas/`)       | 다이어그램의 **`@shared/schemas`** 에 해당 |
| **import 별칭** | `@shared` → `packages/shared`                          | `tsconfig` paths · web · backend · sync    |
| **하위 모듈**   | `dtos/` · `commands/` · `sse-events/` · `yjs/map-keys` | Spec Gate 시 폴더 목록 확정                |

```text
       [ 📝 기획 · OpenAPI · ERD · logic/*.rivet-project ]  ← Spec (§7.1 · §7.4 · §7.5 · I1)
              │
              ▼  Rivet Graph Contract (프로젝트별)
       [ Embedded Rivet ]  Contract만 로드 · Desktop 무관  →  YAML · handoff · API
                       │
                       ▼
        [ 📦 packages/shared — Zod SSOT ]
             (import: @shared / @shared/schemas)
             💡 API·명령·SSE·폼 경계 — 최상위 Contract
              /        │        \         \
            /          │          \         \
          ▼            ▼            ▼         ▼
   [ ⚛️ apps/web ]  [ 🦁 apps/backend ]  [ 🔄 apps/sync ]  [ 🐍 apps/desktop ]
   Next.js          NestJS              Hocuspocus·Yjs       U2BEE (Python PC)
   · 화면 폼 검증    · API 요청/응답 검증  · map-keys·SSE Zod  · OpenAPI→Pydantic v2
   · safeParse      · safeParse + Guard   · WS 이벤트 Contract  · PC DTO (미러)
   · 프론트 DTO      · 백엔드 DTO          · (Prisma 직접 ❌)      · (Prisma 직접 ❌)
                       │
                       ▼  D8 매핑 · enum/필드 정합 (Spec 표)
               [ ◭ Prisma schema.prisma ]  ➡️  [ 🐘 PostgreSQL ]
               apps/backend 전용 · migration 적용 = Execute
```

**소비자별 역할**

| 소비자                       | Spec에서 확정                    | 런타임 사용                                    | Prisma                      |
| ---------------------------- | -------------------------------- | ---------------------------------------------- | --------------------------- |
| **apps/web** (Next.js)       | Form·페이지 DTO Zod              | `safeParse` · 클라이언트 검증                  | **직접 사용 금지**          |
| **apps/backend** (NestJS)    | Request/Response·commands Zod    | Guard · Pipe · `safeParse` · **PrismaService** | **유일 ORM 주체**           |
| **apps/sync**                | `yjs/map-keys` · 협업 이벤트 Zod | Hocuspocus 정책 · payload 검증                 | **미사용** (영속은 backend) |
| **apps/desktop** (Python PC) | OpenAPI ↔ Zod **대조표** (Spec) | REST 클라이언트 · **Pydantic** 모델            | **미사용**                  |

**Python(Pydantic) 연동 (Spec 규칙)**

- PC 앱은 `packages/shared` TypeScript를 **직접 import 하지 않는다**.
- Spec 단계: **Zod 스키마 + `openapi.yaml`** 를 함께 두고 **필드·enum 일치** 검증 (E1 · D8).
- Generate: OpenAPI에서 **Pydantic v2** 생성(또는 수동 미러) — **동일 Contract** 유지.
- 런타임: `apps/backend` REST만 호출 · DB는 backend+Prisma 경유.

**Prisma는 Zod 아래가 아님**

| SSOT                         | 담당                 | 관계                                               |
| ---------------------------- | -------------------- | -------------------------------------------------- |
| **Zod (`@shared/schemas`)**  | API·UI·명령 **경계** | web · backend · sync                               |
| **Prisma (`schema.prisma`)** | **저장·관계·인덱스** | backend만 · PostgreSQL                             |
| **연동**                     | D8 **매핑 표**       | `UserCreateDto` ↔ `User` model · Service에서 변환 |

**Spec Gate (§7.4.2)**

| 체크 | 내용                                                     |
| ---- | -------------------------------------------------------- |
| ●    | `packages/shared` Zod 목록(도메인별 DTO·commands) 초안   |
| ●    | OpenAPI와 Zod **필드 대조** (desktop·외부 클라이언트)    |
| ●    | Prisma `schema.prisma` 초안 + **D8 매핑 표**             |
| ○    | `@shared` / `@shared/schemas` path alias `tsconfig` 선언 |

---

### 7.5 [E] API · 서버 통신 (API & Integration Contract)

| #   | 전문 용어               | 역할                      | Spec 산출물                         | 형식·위치 (예)        | Generate 전 검증             |
| --- | ----------------------- | ------------------------- | ----------------------------------- | --------------------- | ---------------------------- |
| E1  | **OpenAPI Document**    | REST **경로·스키마·에러** | `openapi.yaml` v3                   | YAML/JSON             | shared Zod와 **양방향 정합** |
| E2  | **REST Resource Map**   | 리소스·HTTP 메서드        | `/api/v1/...` 목록                  | OpenAPI paths         | Nest Controller 설계         |
| E3  | **Error Contract**      | 공통 **에러 코드·본문**   | `ProblemDetails` 또는 NEXA envelope | Zod `ApiError`        | 클라이언트 처리 일관         |
| E4  | **AuthN / AuthZ Spec**  | OIDC·JWT·세션             | issuer · claim · Guard 규칙         | md + sequence diagram | Hocuspocus `onAuthenticate`  |
| E5  | **Webhook Contract**    | 외부→Meta **트리거**      | payload Zod · HMAC                  | shared schema         | n8n·OpenClaw 연동            |
| E6  | **Idempotency Key**     | 중복 요청 **안전**        | 헤더·TTL 규칙                       | API Spec              | 결제·명령 중복 방지          |
| E7  | **Pagination / Filter** | 목록 API **규약**         | cursor/limit 표준                   | OpenAPI parameters    | 대용량 UI                    |

---

### 7.6 [F] 실시간 · 협업 · Push (Realtime Spec)

| #   | 전문 용어                   | 역할                               | Spec 산출물                    | 형식·위치 (예)            | Generate 전 검증           |
| --- | --------------------------- | ---------------------------------- | ------------------------------ | ------------------------- | -------------------------- |
| F1  | **CRDT Document Model**     | 협업 **문서 단위**                 | `Y.Doc` id · room naming       | `yjs/` Spec               | sync 프로세스 분리         |
| F2  | **Y.Map Key Registry**      | IoT/UI **채널 키 SSOT**            | `packages/shared/yjs/map-keys` | TS const Spec             | 맵 충돌 방지               |
| F3  | **Hocuspocus Policy**       | WS **인증·권한**                   | `onAuthenticate` 규칙          | md · (Embedded 연동 Spec) | 도메인 스코프 누수 방지    |
| F4  | **SSE Event Catalog**       | 단방향 **이벤트 타입**             | `@Sse()` 이벤트명·payload Zod  | shared `sse-events`       | Yjs WS와 **포트 분리**     |
| F5  | **Yjs ↔ Zustand Boundary** | 에디터 vs 일반 UI **데이터 흐름**  | 단방향 ingest 표               | ADR                       | 무한 루프 금지             |
| F6  | **Editor Binding**          | Tiptap/Monaco/**Web Rivet Editor** | Yjs binding **대상 목록**      | Spec                      | Zustand 미러 금지 · §3.5.1 |

**프로세스 분리 (필수 선언):** `apps/sync`(Hocuspocus·Yjs WS) ↔ `apps/backend`(HTTP·SSE) — **동일 포트·프로토콜 혼합 금지**.

---

### 7.7 [G] 보안 · 명령 · 감사 (Security & Mission-Critical Spec)

| #   | 전문 용어                  | 역할                              | Spec 산출물                 | 형식·위치 (예)             | Generate 전 검증             |
| --- | -------------------------- | --------------------------------- | --------------------------- | -------------------------- | ---------------------------- |
| G1  | **Grade (1·2·3)**          | 명령 **위험 등급**                | Grade 정의 · UI 노출 범위   | `commands/grade` Spec      | G3 브라우저 payload 차단     |
| G2  | **Ingress×Grade Matrix**   | 유입 경로×등급 **허용표**         | `grade-route-matrix`        | TS/표                      | lateral bypass 금지          |
| G3  | **Command Envelope**       | `commandId`·`traceId`·`requestId` | Zod command schema          | `packages/shared/commands` | append-only 감사             |
| G4  | **Edge Queue Spec**        | G3 **enqueue-only**               | `edge-queue` DTO · SSE pull | Spec                       | executable payload 외부 차단 |
| G5  | **Audit Log Schema**       | 2등급+ **필수 필드**              | interceptor 필드 · 보존     | Zod · md                   | `time-sync` SSOT             |
| G6  | **MFA Gate**               | G2+ **인증 강화**                 | 트리거 조건                 | Policy                     | 소프트 제어                  |
| G7  | **CSIM / ACTON** (해당 시) | 신호·의미·실행 **패킷**           | CSIM matrix · `programRef`  | `docs/Nexia/13` 연동       | Twinex·엣지 교차             |

---

### 7.8 [H] IoT · 엣지 · 신호 (Edge Channel Spec — 해당 시)

| #   | 전문 용어                  | 역할                     | Spec 산출물                 | 형식·위치 (예)            | Generate 전 검증             |
| --- | -------------------------- | ------------------------ | --------------------------- | ------------------------- | ---------------------------- |
| H1  | **Device Node Spec**       | ESP32 **논리 노드**      | `{ nodeType, pin, … }` JSON | **nexa-node** 캔버스 (주) | Embedded Rivet·Generate 입력 |
| H2  | **Telemetry Schema**       | 센서 **시계열 필드**     | Zod · 단위                  | shared                    | 차트·임계                    |
| H3  | **Safety Interlock**       | E-Stop · **하드 Safety** | MAE G1–G5 · semantic 토큰   | BAX Spec                  | UI 테마 덮어쓰기 금지        |
| H4  | **OTA / Firmware Channel** | 펌웨어 **배포 경로**     | OpenClaw 트리거 · 버전      | md                        | Nest 직접 CLI 금지           |
| H5  | **ESPHome / MQTT** (선택)  | 말단 **프로토콜**        | topic · payload             | Spec                      | 게이트웨이 경계              |

---

### 7.9 [I] AI · 오케스트레이션 (AI Pipeline Spec)

| #   | 전문 용어                     | 역할                         | Spec 산출물                                  | 형식·위치 (예)     | Generate 전 검증               |
| --- | ----------------------------- | ---------------------------- | -------------------------------------------- | ------------------ | ------------------------------ |
| I1  | **Rivet Graph Contract**      | 프로젝트별 AI·로직 **선언**  | `logic/{name}.rivet-project` per `projectId` | Desktop · Web · CI | **Embedded**가 Contract만 로드 |
| I2  | **LangGraph / Orchestration** | 탭·에이전트 **라우팅**       | LangGraph + **Embedded Rivet**               | md · `rivet-node`  | Omnix→Normex→탭 **실행**       |
| I3  | **Prompt / Persona Spec**     | 도메인·프로젝트 **페르소나** | JSON persona · skill                         | `docs/Nexia`       | 일관 응답                      |
| I4  | **External Engine Map**       | Ollama·ComfyUI 등 **경계**   | 엔진 호출 **백엔드 경유**                    | 표                 | 프론트 직접 호출 금지          |
| I5  | **Runtime Agent Boundary**    | **외부 연동 에이전트** API   | webhook · scope · Grade                      | Spec               | Generate Hermes 3와 분리       |

---

### 7.10 [J] CI · 품질 · 배포 설계 (Delivery Spec — 실행은 Execute)

| #   | 전문 용어                 | 역할                        | Spec 산출물              | 형식·위치 (예)     | Generate 전 검증          |
| --- | ------------------------- | --------------------------- | ------------------------ | ------------------ | ------------------------- |
| J1  | **CI Pipeline Stages**    | lint·test·build **단계**    | workflow **선언**        | YAML 초안          | `pnpm test:security` 포함 |
| J2  | **Merge Gate**            | PR **통과 조건**            | contract test · Zod diff | md                 | Grade×Ingress 회귀        |
| J3  | **Artifact Matrix**       | web/backend/sync **산출물** | image · dist 경로        | 표                 | Execute 입력              |
| J4  | **Environment Promotion** | dev→stage→prod              | 승인·비밀 **분리**       | 표                 | 스테이징 Spec             |
| J5  | **Observability**         | 로그·trace **필드**         | `traceId` 연계           | OpenTelemetry Spec | 감사 추적                 |

---

### 7.11 Spec 완료 체크리스트 (Gate)

| 영역              | 최소 통과 (●)                                 | 비고                                  |
| ----------------- | --------------------------------------------- | ------------------------------------- |
| A 거버넌스        | ● A1 · ● A4 · (● A5)                          | RBAC는 미션 크리티컬 시 필수          |
| B 구조            | ● B1 · ● B2 · ● B3                            |                                       |
| C UI/도메인       | ● C1 · ● C2 · ● C6                            | 신규 `domainKey` 시 C7                |
| D DB · **Prisma** | ● D1 · ● D2 · ● D8 · (● D3 · D7 · D9)         | §7.4.1 · migration **적용**은 Execute |
| **공유 Contract** | ● §7.4.2 Zod · OpenAPI 대조 · 4소비자         | Prisma는 Zod **하위가 아님**          |
| E API             | ● E1 · ● E4                                   |                                       |
| F 실시간          | ● F1 · ● F2 · ● F4 · **프로세스 분리**        | 협업·IoT 시                           |
| G 보안            | ● G1 · ● G2 · ● G3                            | IoT/제어 시 ● G4                      |
| H 엣지            | ○ H1~H5                                       | IoT 채널 사용 시 ●                    |
| I AI · Rivet      | ● I1 (Contract) · ● I2 (Embedded 실행) · ● I4 | §3.5.0                                |
| J 배포            | ● J1 · ● J2                                   |                                       |

**Gate 통과 후** → **Generate**(IDE 또는 Ollama+Hermes 3) → 리뷰·merge → **Execute**(OpenClaw·CI).

---

## 6. 기대 효과 (철학)

- **물리적 고통 제거:** 제품 런타임이 하드웨어·대량 생성·터미널을 직접 먹지 않음.
- **SSOT:** AI·로직 = 프로젝트별 **`*.rivet-project` Contract** (Desktop **필수 아님**) — **Embedded Rivet**은 Contract만으로 **독립 실행**, 앱 소스는 **Generate**(Hermes/IDE).
- **확장:** ESP32·웹·향후 시스템이 **동일 Spec → Generate → Execute**로 추가 가능.

---

############################################################################################

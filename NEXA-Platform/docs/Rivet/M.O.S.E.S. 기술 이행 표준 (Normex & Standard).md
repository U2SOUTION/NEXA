# M.O.S.E.S. 기술 이행 표준 (Normex & Standard)

**Technical Implementation Standard** — 스택별 **How(구현 정답지)**. **What(스펙·게이트)** 는 [`M.O.S.E.S. v2.0`](<../M.O.S.E.S.(Meta-Operating System for Engineering & Synthesis) v2.0.md>) · [`Desktop Rivet 캔버스 설계`](<../../Rivet/Desktop Rivet 캔버스 설계.md>).

---

## 1. 통합 문서의 명칭 및 정체성

- **역할:** M.O.S.E.S. 본문이 **무엇을(What)** 설계·게이트할지 지휘한다면, 이 문서는 **어떻게(How)** 구현할지에 대한 **정답지**이며, Generate·CI가 **사람 개입 없이** 동일 패턴을 재현하도록 규격화한다.
- **Normex:** MUST/SHOULD·승인 게이트의 **코드·런타임 이행** (위반 시 Merge Gate·`test:security` 실패).
- **Standard:** Zod · Next.js · NestJS · Rivet · IoT 등 **표준 구현 패턴**.

### 1.1 What → How → Verify (무인 이행 루프)

| 단계       | 주체                                          | 본 문서 역할                                           |
| :--------- | :-------------------------------------------- | :----------------------------------------------------- |
| **What**   | M.O.S.E.S. v2.0 §7 (E3, E6, H5, I1, B5, J4 …) | Passage 열로 **항목↔절** 고정                         |
| **How**    | 본 문서 §2 체크리스트 + **§3 심화 MUST**      | Generate·린트·가드가 **복사 가능한 규칙**으로 소비     |
| **Verify** | NEXA 플랫폼 3b + CI (§2.7)                    | `safeParse`·contract test·E3 응답으로 **AI 자가 수정** |

> Generate는 **시크릿 값·Execute 전용 동작**에 접근하지 않는다. 검증 실패는 **E3 필드 에러**로 되돌려 스펙·코드 불일치를 기계적으로 수렴시킨다.

**§2 카테고리 맵**

|  #  | 기술 영역     | 대상 스택·산출물                                |
| :-: | :------------ | :---------------------------------------------- |
| 2.1 | 거버넌스·문서 | Normex, `docs/*`, Generate 컨텍스트             |
| 2.2 | 데이터·스키마 | Zod, OpenAPI, Prisma, 데이터 속성·E3            |
| 2.3 | 로직·실행     | Rivet Contract, Embedded **Stateless**, Execute |
| 2.4 | 통신·협업     | MQTT, SSE, Yjs/Hocuspocus, sync                 |
| 2.5 | 프론트엔드·UI | Next.js, React, **Atomic Selector**             |
| 2.6 | 보안·IoT      | Grade×Ingress, **QoS·인터벌·LWT**, nexa-node    |
| 2.7 | 운영·품질     | CI, 관측·감사, **Secret Injection**             |

> 표마다 **Passage** 열은 M.O.S.E.S. v2.0 해당 절을 1차 SSOT로 연다. Gate 상세는 **§7.11**. **기계 검증 가능** 규칙은 **§3**에 MUST로 둔다.

---

## 2. 기술 영역별 체크리스트

### 2.1 거버넌스·문서

| 항목              | 주요 포함 내용 (체크리스트)                                                               | [Passage]         |
| :---------------- | :---------------------------------------------------------------------------------------- | :---------------- |
| **Normex 이행**   | MUST/SHOULD → **가드·승인 게이트** · `REFACTOR` Human-in-the-loop · 고위험 자동 실행 차단 | **§7.1 A2**       |
| **문서 생애주기** | `docs/inbox/` → `refined/` → `specs/` · `trash/inbox/…` 미러 · 01번 **refined만**         | **§7.2 B1**       |
| **Generate 주입** | **본 문서 §2·§3** + `docs/specs/` · What 절 번호와 **동일 항목** How를 함께 주입          | **§2** · **§5.1** |

### 2.2 데이터·스키마

| 항목             | 주요 포함 내용 (체크리스트)                                                                             | [Passage]              |
| :--------------- | :------------------------------------------------------------------------------------------------------ | :--------------------- |
| **데이터 종류**  | **Fast / Interval / Trigger** 분류 · SSOT · Prisma≠Zod 하위 금지 · **§3.2 수치**와 Telemetry Zod 연동   | **§7.4.2** · **H2**    |
| **Zod·Contract** | `packages/shared` SSOT · 경계 `safeParse` · 실패 시 **E3 래핑(§3.4)**                                   | **§7.4.2** · **E1~E3** |
| **OpenAPI 정합** | `openapi.yaml` ↔ Zod · breaking → **J2**                                                               | **§7.5** · **J2**      |
| **Prisma·DB**    | `schema.prisma` backend 전용 · migration 생성=Generate · 적용=Execute                                   | **§7.4.1** · Gate D    |
| **E3 에러 래핑** | `ZodError` → **NEXA envelope / `ApiError`** · `fieldErrors[]` · `traceId` · Generate **자가 수정** 입력 | **E3** · **§3.4**      |

### 2.3 로직·실행

| 항목                   | 주요 포함 내용 (체크리스트)                                                             | [Passage]             |
| :--------------------- | :-------------------------------------------------------------------------------------- | :-------------------- |
| **Rivet Contract**     | Desktop/Embedded 분리 · Contract-only 접점                                              | **§3.5.0** · **I1**   |
| **Embedded Stateless** | 로컬 FS·프로세스 **전역 상태 금지** · DB/Redis **주입만** · **Pure Interpreter** (§3.3) | **§3.5** · **I1**     |
| **데이터 처리**        | Embedded: 로드·추론·handoff · 경계 `safeParse`+E3                                       | **§3.5** · **§7.4.2** |
| **Execute·배포**       | Next/Nest 터미널·OTA 직접 금지 · OpenClaw·CI = Execute                                  | **§5** · **J1**       |

### 2.4 통신·협업

| 항목          | 주요 포함 내용 (체크리스트)                              | [Passage]       |
| :------------ | :------------------------------------------------------- | :-------------- |
| **통신 규격** | MQTT QoS·topic/payload · Nest SSE · Yjs WS **포트 분리** | **E4** · **F**  |
| **협업·CRDT** | Yjs 직접 바인딩 · Zustand→Yjs 역쓰기 금지                | **F5** · **F6** |

### 2.5 프론트엔드·UI

| 항목                | 주요 포함 내용 (체크리스트)                                           | [Passage]           |
| :------------------ | :-------------------------------------------------------------------- | :------------------ |
| **Atomic Selector** | Zustand **원자 속성 단위** Selector MUST · 객체 전체 구독 금지 (§3.1) | **F5** · **§3.1**   |
| **메모리/성능**     | `React.memo`는 Selector 준수 **후** 적용 · RSC/Client 경계            | **§7.0** · **F5**   |
| **렌더링·상태**     | Yjs observe→Zustand만 · `domainLayoutRegistry`                        | **F5** · **§7.3 C** |
| **실시간 UI**       | Tone.js·Wasm · 프론트→Ollama 직접 금지                                | **I4**              |

### 2.6 보안·IoT

| 항목                  | 주요 포함 내용 (체크리스트)                                                    | [Passage]                |
| :-------------------- | :----------------------------------------------------------------------------- | :----------------------- |
| **보안·Grade**        | `commands/` Zod · Grade×Ingress · G3/G4                                        | **G1~G4**                |
| **IoT 주기·하트비트** | Fast <100ms·QoS0 · Interval 5~60s·**LWT** · Trigger·**Idempotency Key** (§3.2) | **H2** · **H5** · **E6** |
| **IoT·엣지**          | nexa-node Spec · ESPHome handoff · Nest OTA/CLI 금지                           | **H1~H5**                |
| **메모리(엣지)**      | 펌웨어·YAML·발행 주기 상한                                                     | **§7.8**                 |

### 2.7 운영·품질

| 항목                 | 주요 포함 내용 (체크리스트)                                                                      | [Passage]       |
| :------------------- | :----------------------------------------------------------------------------------------------- | :-------------- |
| **Secret Injection** | 키만 `.env.example`(Spec) · 값은 **Execute CI Secret/Vault** · Generate **시크릿 무권한** (§3.5) | **B5** · **J4** |
| **관측·감사**        | `traceId` · 고위험 audit                                                                         | **J5** · **G2** |
| **CI·품질**          | contract test · Zod diff · Selector/E3/Stateless **회귀**                                        | **J2** · Gate   |

---

## 3. What→How 자동 이행 심화 규격 (MUST)

M.O.S.E.S. 본문의 What가 아래 How와 **1:1로 결합**되면, Generate·린트·런타임 가드만으로 사람 리뷰 없이도 수렴할 수 있다.

| 추가 영역 | 핵심 키워드                    |    §2     | What [Passage]    |
| :-------- | :----------------------------- | :-------: | :---------------- |
| 성능      | **Atomic Selector**            |    2.5    | **F5**            |
| IoT       | **QoS·인터벌·LWT·Idempotency** | 2.6 · 2.2 | **H5** · **E6**   |
| 로직      | **Stateless Embedded**         |    2.3    | **I1** · **§3.5** |
| API       | **E3 Zod 래핑**                |    2.2    | **E3**            |
| 배포      | **Secret Injection**           |    2.7    | **B5** · **J4**   |

### 3.1 Zustand Atomic Selector (2.5 — 렌더링)

**What:** Yjs↔Zustand 경계·UI 상태 일관 (**§7.6 F5**).  
**How (MUST):**

| 규칙               | 내용                                                                                                           |
| :----------------- | :------------------------------------------------------------------------------------------------------------- |
| **MUST-SEL-1**     | 구독은 **단일 원자 속성**만 선택: `useStore((s) => s.telemetry.temperature)`                                   |
| **MUST-NOT-SEL-1** | 스토어 루트·슬라이스 객체 전체 구독 금지: `useStore((s) => s.panel)`, `const { a, b } = useStore()`            |
| **MUST-SEL-2**     | 2개 이상 필드가 필요하면 **필드별 hook 분리** 또는 `useShallow` + **명시적 필드 나열** (암묵적 전체 객체 금지) |
| **MUST-MEMO-1**    | `React.memo`는 **MUST-SEL-1** 준수 컴포넌트에만 적용 — Selector 위반 시 memo **무효**                          |

**Generate·린트 힌트:** ESLint/custom rule — `useStore` 콜백 반환 타입이 `object`이고 프로퍼티 접근이 2개 미만이면 경고.

---

### 3.2 IoT 데이터 주기·하트비트 (2.2 · 2.6)

**What:** Telemetry 스키마·MQTT 채널 (**H2**, **H5**), 중복 안전 (**E6**).  
**How — 데이터 종류별 기본값 (SHOULD, Spec에서 덮어쓰기 가능):**

| 종류                     | 반응·주기                                    | MQTT·신뢰성                                  | MUST                                                                            |
| :----------------------- | :------------------------------------------- | :------------------------------------------- | :------------------------------------------------------------------------------ |
| **Fast (실시간)**        | E2E **< 100ms** 목표 (제어·오디오·고주파 UI) | **QoS 0** · burst 시 드롭 허용               | payload **Zod(TelemetrySchema)**                                                |
| **Interval (온습도 등)** | 기본 **5~60s** (Spec·디바이스별 문서화)      | **QoS 1** 권장 · **LWT** topic으로 생존 확인 | 마지막 known-good + timestamp                                                   |
| **Trigger (이벤트)**     | on-change · 엣지 1회                         | QoS 1 · **중복 수신 대비**                   | payload·헤더에 **`idempotencyKey`** (UUID v4) **필수** · 서버 **E6** TTL과 정합 |

**LWT (MUST-IoT-1):** Interval 이상 등록 디바이스는 `birth`/`will` topic·payload를 Spec에 선언하고, offline 시 **명시적 상태** publish.

**Generate:** `nexa-node`·ESPHome Spec 표에 `dataClass: fast \| interval \| trigger` 열을 채우지 않으면 Gate 실패.

---

### 3.3 Embedded Rivet Stateless (2.3)

**What:** 프로젝트별 Contract 로드·독립 실행 (**I1**, **§3.5**).  
**How (MUST):**

| 규칙               | 내용                                                                                                 |
| :----------------- | :--------------------------------------------------------------------------------------------------- |
| **MUST-RVT-1**     | 실행 간 **로컬 FS·임시 캐시에 비휘발 상태 저장 금지** (Contract 파일 읽기 제외)                      |
| **MUST-NOT-RVT-1** | 모듈·싱글톤 **전역 mutable** (세션·사용자·프로젝트 컨텍스트 누적) 금지                               |
| **MUST-RVT-2**     | 컨텍스트·메모리·플래그는 **요청 단위 입력**(DB/Redis/Command Envelope)으로만 주입                    |
| **MUST-RVT-3**     | 동일 Contract + 동일 입력 → **동일 출력** (**Pure Interpreter**) — 부작용은 **명시 handoff** API로만 |

**이유:** 서버 환경 오염 없이 `logic/{name}.rivet-project` **갈아끼우기**·수평 확장.

---

### 3.4 Zod `safeParse` → E3 에러 래핑 (2.2)

**What:** 공통 Error Contract (**E3**).  
**How (MUST):**

| 규칙           | 내용                                                                                                                                          |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **MUST-ZOD-1** | 경계(web form, Nest Guard/Pipe, sync WS, Embedded handoff)는 **`safeParse`만** — `parse` throw 금지                                           |
| **MUST-ZOD-2** | 실패 시 raw `ZodError` **외부 전달 금지** → `packages/shared` **E3 envelope** (`ApiError` / ProblemDetails)로 **wrap**                        |
| **MUST-ZOD-3** | 본문에 `code`(예: `VALIDATION_FAILED`), `traceId`, `fieldErrors: { path, message, expected }[]` **필수** — Generate가 스펙·코드 **자가 수정** |
| **MUST-ZOD-4** | HTTP 4xx 매핑 고정 (400 validation, 401/403 auth) — OpenAPI **E3** 스키마와 동일                                                              |

**참조 구현 위치 (SSOT):** `packages/shared` — `ApiErrorSchema` · `wrapZodError()` (없으면 Generate가 본 절대로 **최초 생성**).

```ts
// Generate MUST 패턴 (예시)
const parsed = CommandSchema.safeParse(input)
if (!parsed.success) {
  throw wrapZodError(parsed.error, { traceId })
}
```

---

### 3.5 환경 변수·시크릿 주입 경계 (2.7)

**What:** Env Matrix 키 선언 (**B5**), 환경 승격·비밀 분리 (**J4**).  
**How (MUST):**

| 규칙               | 내용                                                                                                |
| :----------------- | :-------------------------------------------------------------------------------------------------- |
| **MUST-ENV-1**     | **키 이름·설명·예시 placeholder**만 `.env.example` / Spec — **실제 비밀 값 Generate 산출물에 금지** |
| **MUST-ENV-2**     | 실제 값은 **Execute**(OpenClaw·CI Secret·Vault)에서만 주입 — PR·로그·Hermes 컨텍스트 **마스킹**     |
| **MUST-NOT-ENV-1** | Generate AI·로컬 LLM에 **production secret** 컨텍스트 주입 금지 (키 목록만 허용)                    |
| **MUST-ENV-3**     | `process.env.*` 직접 참조는 **validated env Zod** (`@t3-oss/env-nextjs` 등) 한 경로로만             |

**3단계 책임:** Spec(B5) → Generate(`.env.example` 갱신) → Execute(시크릿 바인딩·배포).

---

## 4. 이 통합 문서가 주는 전략적 효과

1. **What·How 결합** — M.O.S.E.S. §7 항목마다 본 문서 §2 행 + §3 MUST가 있어, Generate가 **Passage 번호로 컨텍스트를 좁혀** 무인 구현한다.

2. **자가 수정 루프** — E3 `fieldErrors` · Zod diff · contract test 실패 시 AI가 **스펙(`docs/specs/`) 또는 shared Zod**를 먼저 수정하고 코드를 재생성한다.

3. **데이터·엣지·로직 정합** — **2.2 분류 + 3.2 수치** · **3.3 Stateless Rivet** · **2.4 MQTT**를 한 번에 리뷰하면 대역폭·오염·타입 불일치를 줄인다.

4. **Normex vs Standard** — **Normex:** §3.3·3.5·2.7 CI. **Standard:** §3.1·3.2·3.4 패턴.

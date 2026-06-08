# NEXA OS V2.1 · 수직 계층 보안 아키텍처

**한 줄:** **NEXA 플랫폼** 런타임에서 NEXIA(`nexia`)·U2BEE·현장 Edge를 **NEXA → 도메인 → 엣지 → 로컬 → 물리** 5계층으로 쌓고, **Grade×Ingress 단일 경로**와 **Zod SSOT**로 측면 우회 없이 미션 크리티컬 IoT를 거버넌스한다.

- **역할:** **Informative** — 수직 방어 심층(Defense in Depth) **개념 지도·온보딩**
- **구현 Normative SSOT:** [`_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략-보강본.md`](./_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략.md) — `commands/` · Ingress×Grade · `edge-queue` · CI
- **NEXIA 적용:** [`01 보안 및 권한`](<../Nexia/01%20보안%20및%20권한%20관리%20체계%20(Security%20%26%20Governance).md>) · [`00 NEXIA 구조`](../Nexia/00%20인공지능%20NEXIA%20구조와%20기술%20스택과%20운영방침.md)
- **로컬 셸:** [`_NEXA-OS-U2BEE-desktopApps-설계-명세.md`](./_NEXA-OS-U2BEE-desktopApps-설계-명세.md)
- **Mission-Safe UI:** [`BAX_미학적_인터페이스_UX_아키텍처_v0.9.md`](./UI/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md) — MAE G1–G5

---

## 1. 목적과 범위

본 문서는 NEXA OS V2.1 전반의 **보안 책임을 수직 계층으로 배치**하는 아키텍처를 설명한다. 각 계층은 **자신의 경계에서만** 정책·검증·실행을 담당하며, 상위 계층의 규칙을 **재정의하거나 우회할 수 없다**.

| 포함                                | 제외 (별도 SSOT)                                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| 5계층 역할·연계                     | Grade·Ingress 필드 정의 — V2.1 `commands/`                                                     |
| 단일 명령·감사 경로 원칙            | RBAC·탭별 `tabId` — Nexia `01`                                                                 |
| V2.1·NEXIA 매핑 표                  | CSIM·ACTON-GM 패킷 — Nexia `13`                                                                |
| Mission-Safe UI vs 물리 Safety 구분 | 도메인 레지스트리 필드 — [`도메인-레지스트리-명세`](./_NEXA-OS-V2.1-도메인-레지스트리-명세.md) |

---

## 2. 핵심 원칙

### 2.1 수직 계층 (Vertical)

```text
[NEXA 거버넌스] → [도메인·인가] → [엣지·현장] → [로컬·브릿지] → [물리·Safety]
       ↓                ↓               ↓              ↓                 ↓
   Grade·Zod        RBAC·Normex    edge-pull-sse    U2BEE·WebView    ACTON·E-Stop
```

- **가로(탭·도메인) 이동**은 허용되나, **제어·감사·실행 payload**는 반드시 **위에서 아래로** 선언된 등급·Ingress·검증을 거친다.
- 하위 계층이 상위 정책을 **느슨하게 해석하는 lateral bypass** — 설계상 **금지**.

### 2.2 단일 명령·감사 경로

| 축         | 규칙                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| **명령**   | 모든 제어는 `Grade` 선언 + **Ingress×Grade** 매트릭스 통과 — 구현: `grade-route-matrix.ts`  |
| **G3**     | 브라우저·외부 Yjs/WS/SSE로 **executable payload 수신 불가** — `edge-queue` **enqueue만**    |
| **전달**   | 현장 **edge-gateway** 가 **outbound** `edge-pull-sse`(우선) 또는 GET pull                   |
| **감사**   | `requestId` · `traceId` · `commandId` · `time-sync` — **append-only**, 계층 간 동일 추적 키 |
| **스키마** | `packages/shared` Zod — web · backend · sync **단일 SSOT**; U2BEE는 OpenAPI→Pydantic 미러   |

### 2.3 검증 가능성

- Merge gate: **`pnpm test:security`** — Grade×Ingress contract · Safety ingest SLA
- 상세 KPI·Ingress 표: V2.1 §미션 크리티컬 설계 검증 · Nexia `01` §12

---

## 3. 5계층 모델

### 3.1 NEXA 계층 — 시스템 전역 거버넌스 (Governance)

시스템 전체의 **명령 자격(Grade)** · **망 분리** · **스키마·감사 SSOT**를 정의한다.

| 항목                   | 내용                                                                   |
| ---------------------- | ---------------------------------------------------------------------- |
| **Grade 1·2·3**        | G1 조회 · G2 소프트 제어(MFA) · G3 하드 제어(현장 폐쇄망)              |
| **하이브리드 망 분리** | 등급별 인터넷·VPN·폐쇄망 범위 — G3 **외부 브라우저 실행 payload 차단** |
| **Zod SSOT**           | DTO·명령·SSE 이벤트 — `safeParse` / `parseSseEvent`                    |
| **전역 감사**          | `audit-log.interceptor` · 2등급+ 필수 · 180일+ 보존                    |

### 3.2 도메인 계층 — 탭·정책·인가 (Policy)

NEXIA **7탭 `tabId`**(Omnix · Normex · Logex · Scribx · Vivex · Twinex · Navex)와 **도메인 레지스트리**에서 **누가·어디서·무엇을** 할 수 있는지 정한다.

| 항목                  | 내용                                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| **RBAC**              | Owner / Admin / Editor / Viewer — 탭·`.nx*`·Grade 상한                      |
| **Normex 선행**       | 규범·HEXAGON MUST 미통과 시 Logex/Scribx/Twinex **실행 차단**               |
| **Omnix 3단계**       | Omnix(승인·라우팅) → Normex(검증) → 탭 서브 에이전트(실행)                  |
| **도메인 레지스트리** | Drawer·StatusBar·`themePreset` — **운영 가시성** 조율 (물리 제어 SSOT 아님) |
| **인증**              | OIDC/OAuth2 · JWT · Hocuspocus `onAuthenticate` · G2+ MFA                   |

> AXON **Ethos**는 CSIM **규범 판정 계층**(Who/MUST) 이름이다. NEXIA **탭 SSOT**는 **Normex** — Nexia `00` §3.1.

### 3.3 엣지 계층 — 현장 실행·자율성 (Edge)

폐쇄망 **edge-gateway**·MQTT/Modbus 브로커 구간의 보안·가용성.

| 항목                         | 내용                                                             |
| ---------------------------- | ---------------------------------------------------------------- |
| **edge-pull-sse**            | Edge **outbound** EventSource — 클라우드→Edge **직접 Push 금지** |
| **EDGE_AUTONOMOUS**          | 클라우드 단절 시 **로컬 큐·edge-persistence**로 안전 정책 유지   |
| **mTLS / short-lived token** | Edge↔backend 장치 위조 방지                                     |
| **Grade3 전용**              | 브라우저 UI는 queued/acked **상태만** — executable 수신 **deny** |

### 3.4 로컬 계층 — 인터페이스·브릿지 (Local / Interface)

**U2BEE**(`apps/desktop`)·브라우저 런타임 — 외부 콘텐츠와 제어 UI 사이 **격리·계약**.

| 항목                  | 내용                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Pydantic 미러**     | Zod↔OpenAPI↔Pydantic v2 — REST·브리지 **최종 검수**                                                                 |
| **듀얼 WebView 격리** | 외부 콘텐츠(WebView A) ↔ 제어 UI(WebView B) **레이어 분리**                                                          |
| **QWebChannel IPC**   | Python↔WebView **최소 계약** — 권한 밖 OS 제어 차단                                                                  |
| **Mission-Safe UI**   | `--safety-critical` 등 **Semantic 토큰 고정** — 사용자 테마가 Safety 색·시인성 **덮어쓰기 불가** (V2.1 §테마 3계층 ①) |

### 3.5 물리 계층 — SW/HW Safety (Physical / Controller)

**실제 액추에이터·펌웨어·필드버스** — 최후 보루. UI 미학과 **책임 분리**.

| 항목                        | 내용                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| **ACTON-GM · `programRef`** | Fetch 전 CONTO/Normex · Execute 전 MUST + Omnix ACK · `contentHash` 검증 |
| **단선 제어**               | 긴급 정지(E-Stop) — React 렌더 **경유 없이** 직접 emit/API/SSE Safety    |
| **Twinex sim→live**         | 시뮬 모드 **실 디바이스 write deny**                                     |
| **현장 Circuit Breaker**    | 과부하·개방·STUCK — **물리/엣지** 경량·차단 모드 (IoT·OTA Runbook)       |

---

## 4. Mission-Safe UI (MAE) — 물리 계층과 분리

**MAE(Matrix Aesthetic Engine) G1–G5**는 **브라우저·VirtualCanvas 미학·UX 가드레일**이다. §3.5 **물리 Safety**와 **동일 계층이 아니다**.

| 코드  | 역할                                 | 물리 Safety와 관계                                    |
| ----- | ------------------------------------ | ----------------------------------------------------- |
| G1–G4 | 텍스트 면적·가독성·배치·진동 밀도    | Safety **시인성** 보조 — `--safety-*` 토큰과 **병행** |
| G5    | Circuit Open → V1/V2 진동 **UI OFF** | **UI 부하·혼란** 억제 — ESPHome **E-Stop 대체 아님**  |

상세: BAX v0.9 §1.2 · RuleGuard. **G5 > ATS** — Circuit Open 시 사용자 미학 설정 **무시**.

---

## 5. V2.1 · NEXIA 매핑

| 본 문서 계층 | V2.1 SSOT (주요)                                        | NEXIA (주요)                          |
| ------------ | ------------------------------------------------------- | ------------------------------------- |
| 3.1 NEXA     | `packages/shared/commands/` · `audit-log` · `time-sync` | Grade·Ingress 요약 — `01` §3–§4       |
| 3.2 도메인   | `domainLayoutRegistry` · `authGuard`                    | 7탭 RBAC · Normex — `01` §6 · `00` §3 |
| 3.3 엣지     | `modules/edge-queue/` · `edge-pull-sse`                 | Twinex G3 · ACTON — `01` §10          |
| 3.4 로컬     | U2BEE Pydantic · WebView                                | 멀티윈도우 세션 — Nexia `08`          |
| 3.5 물리     | Safety ingest · commandTracker                          | Twinex · `06` 예외 · CSIM `13`        |
| §4 MAE       | Semantic CSS tokens · BAX                               | Omnix/Nexia UI 셸 (표시 계층)         |

---

## 6. Ingress × Grade (요약)

구현 SSOT: `packages/shared/src/commands/test-fixtures/grade-route-matrix.ts`

| Ingress                       | G1                  | G2                  | G3             |
| ----------------------------- | ------------------- | ------------------- | -------------- |
| `yjs-external`                | allow (ReadOnly)    | allow + MFA + audit | **deny**       |
| `rest-external`               | allow               | allow + MFA + audit | **deny**       |
| `sse-browser-external`        | allow (상태·stream) | allow (ACK)         | **deny-no-ui** |
| `edge-pull` / `edge-pull-sse` | —                   | —                   | **allow**      |

---

## 7. 기대 효과

- **측면 우회 차단:** 탭·도메인·UI 편의 기능이 **G3 executable** 경로를 열지 못함
- **장애 격리:** sync/UI 프리즈와 무관하게 **Safety·Edge·E-Stop** 우선
- **감사 연속성:** 동일 `traceId`로 NEXA→Edge→ACK **종단 추적**
- **계약 일관성:** Zod/Pydantic 미러로 **계층 경계에서 깨진 payload 조기 차단**

---

_상태: Informative — NEXA OS V2.1 수직 5계층 + Mission-Safe UI(MAE) 분리 · V2.1·Nexia `01` 연동._

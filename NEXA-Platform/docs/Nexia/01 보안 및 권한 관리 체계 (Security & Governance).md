# 01. 보안 및 권한 관리 체계 (Security & Governance)

**한 줄:** NEXIA는 **명령 등급(Grade 1~3)** · **망 분리** · **RBAC** · **Normex 가드레일**로 조종·협업·IoT 제어를 **미션 크리티컬** 수준까지 거버넌스한다.

- **정체성:** **NEXA 플랫폼** 런타임 보안 중 **NEXIA 도메인**(`nexia`)·7탭·IoT 연동 규범
- **Normative:** NEXIA 도메인 셸·7탭·IoT 연동의 **보안·인가·감사** 단일 기준 (플랫폼 전역 구현은 NEXA OS V2.1)
- **구현 SSOT:** [`NEXA OS V2.1 설계 표준 · 미션 크리티컬 전략`](<../NEXA OS/_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략.md>) — `commands/` · `audit-log` · `edge-queue` · CI `test:security`

---

## 1. 목적과 범위

본 문서는 NEXIA **7탭 `tabId`(SSOT)** 전반의 인증·인가·데이터 보호·**제어 명령 등급**·감사 추적을 정의한다.

| 포함                            | NEXA OS 위임 (구현·CI)                          |
| ------------------------------- | ----------------------------------------------- |
| Grade 1~3 정책 · NEXIA 탭 매핑  | `packages/shared/src/commands/`                 |
| RBAC · `.nx*` · Yjs 스코프      | `authGuard` · Hocuspocus `onAuthenticate`       |
| Omnix/Normex 승인 · AI 가드레일 | `audit-log.interceptor` · Rivet Normex Subgraph |
| Twinex · ACTON-GM · programRef  | `edge-queue` · Grade3 **edge-pull-sse**         |
| 감사 필드 · KPI                 | `time-sync.ts` · `commandTracker`               |

---

## 2. 보안 전략 개요 (Mission-Critical)

NEXA OS **하이브리드 망 분리** 원칙을 NEXIA에 적용한다. **위험도에 따라 망·인증·경로를 분리**하고, UI 프리징과 무관하게 **Safety·제어 경로를 최우선**한다.

### 2.1 설계 원칙

| #   | 원칙                 | NEXIA 적용                                                           |
| --- | -------------------- | -------------------------------------------------------------------- |
| 1   | **PoLP** (최소 권한) | 탭·`.nx*`·명령 등급별 스코프 분리                                    |
| 2   | **망·등급 분리**     | Grade3는 외부 브라우저 **실행 payload 차단**                         |
| 3   | **단선 제어**        | Twinex 긴급 정지 — React 렌더 경유 없이 **직접 emit/API**            |
| 4   | **감사 가능성**      | 2등급+ 명령 · 권한 변경 · `programRef` Fetch — **append-only audit** |
| 5   | **Normex 선행**      | Normex·HEXAGON MUST 미통과 시 Logex/Scribx/Twinex **실행 차단**      |
| 6   | **검증 가능**        | Grade×Ingress matrix — CI **`pnpm test:security`** merge gate        |

### 2.2 데이터·UI 우선순위 (Safety vs Telemetry)

| 구분      | 긴급·안전·제어                        | 일반 수집·차트                    |
| --------- | ------------------------------------- | --------------------------------- |
| 예        | Twinex 알람 · 긴급 정지 · Grade2 제어 | 온습도 · 가동률 · Vivex 미디어 큐 |
| 스레드    | 메인 **즉시**                         | Web Worker · `useTransition`      |
| sync 장애 | SSE `iot/stream` → REST snapshot 폴백 | 차트·애니메이션 **억제**          |

> 상세: NEXA OS §미션 크리티컬 IoT · `useYjsSync` + `telemetryProcessor` **필수 쌍**.

---

## 3. 제어 명령 3등급 (Grade 1 · 2 · 3)

금융·공장 **미션 크리티컬** 기준. 모든 제어·IoT·Twinex 동작은 **Grade**를 선언해야 한다.

| 등급           | 명칭           | 망               | 인증                                       | 대표 동작 (NEXIA)                                                |
| -------------- | -------------- | ---------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| 🟢 **Grade 1** | 조회·일반 설정 | 외부 인터넷 허용 | 웹 세션 · Hocuspocus **ReadOnly**          | Navex 탐색 · Omnix 모니터링 · Normex **읽기** · Vivex 프리뷰     |
| 🟡 **Grade 2** | 소프트 제어    | 외부 + **MFA**   | OTP/생체 **강제** · audit 즉시             | Normex 임계값·블록 · Scribx 배포 요청 · Twinex **비위험** 재부팅 |
| 🔴 **Grade 3** | 하드 제어      | **현장 폐쇄망**  | Edge **mTLS/JWT** · 브라우저 실행 **금지** | Twinex 모터/밸브 · 펌웨어 OTA · ACTON-GM **`programRef` 실행**   |

**Grade 3 경로 (Normative):**

```text
[브라우저] ── enqueue만 (감사·내부 VPN) ──► edge-queue
           ✗ Yjs/WS/SSE 로 executable payload 수신
[edge-gateway] ◄── edge-pull-sse / GET pull ──► MQTT/Modbus (현장)
```

---

## 4. Ingress × Grade 매트릭스 (요약)

구현 SSOT: `packages/shared/src/commands/test-fixtures/grade-route-matrix.ts`

| Ingress                       | G1                        | G2                         | G3                              |
| ----------------------------- | ------------------------- | -------------------------- | ------------------------------- |
| `yjs-external`                | allow (ReadOnly)          | allow + MFA + audit        | **deny**                        |
| `rest-external`               | allow                     | allow + MFA + audit        | **deny**                        |
| `sse-browser-external`        | allow (iot stream · 상태) | allow (command-update ACK) | **deny-no-ui** (queued/acked만) |
| `edge-pull` / `edge-pull-sse` | —                         | —                          | **allow** (Edge outbound)       |

- **브라우저**로 Grade3 executable payload push — **전 레이어 deny**
- **Twinex** UI: Grade3 제어 버튼 **미노출** · enqueue는 Omnix/Normex 승인 + audit

---

## 5. 인증 · 세션

| 항목             | 규범                                                                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 프로토콜         | **OIDC/OAuth2** · JWT (HttpOnly cookie 권장)                                                                                                                                                                                                                 |
| Access / Refresh | 15분 / 7일 (도메인 정책으로 조정)                                                                                                                                                                                                                            |
| 재인증           | Grade2+ · 권한 변경 · 장치 변경 · `riskLevel: high` 탭 진입                                                                                                                                                                                                  |
| Hocuspocus       | `onAuthenticate` → Nest `auth` · **ReadOnly vs Write** 스코프                                                                                                                                                                                                |
| Edge             | mTLS 또는 short-lived query token (EventSource 헤더 제한)                                                                                                                                                                                                    |
| 멀티윈도우       | SharedWorker 세션 — [`08 PiP`](<./08%20멀티윈도우%20%C2%B7%20Document%20PiP%20%ED%86%B5%ED%95%A9%20%EA%B7%9C%EA%B2%A9%20%EB%B0%8F%20%EC%84%A0%ED%83%9D%20%EA%B0%80%EC%9D%B4%EB%93%9C%20(Multi-Window%20%26%20PiP%20Specification).md>) · 전 창 **동시 차단** |

---

## 6. 인가 (RBAC) · NEXIA 7탭

### 6.1 역할 (공통)

| 역할       | 읽기    | 편집    | 실행 (≤G2) | G3 enqueue | 권한 관리 |
| ---------- | ------- | ------- | ---------- | ---------- | --------- |
| **Owner**  | 전체    | 전체    | 전체       | 승인 후    | 가능      |
| **Admin**  | 전체    | 전체    | 전체       | 승인 후    | 제한      |
| **Editor** | 범위 내 | 범위 내 | G1·일부 G2 | 불가       | 불가      |
| **Viewer** | 범위 내 | 불가    | 불가       | 불가       | 불가      |

### 6.2 탭별 `tabId` · `riskLevel` (Standard 7)

| #   | `tabId`    | 기본 risk | Grade 상한 (Editor)       | 비고                    |
| --- | ---------- | --------- | ------------------------- | ----------------------- |
| 1   | Omnix      | medium    | G2                        | 승인 게이트 · 비상 정지 |
| 2   | Normex     | medium    | G2                        | 블록 실행 = G2 + MFA    |
| 3   | Logex      | low       | G1                        | 워크플로 publish → G2   |
| 4   | Scribx     | medium    | G2                        | 배포·실행 스크립트      |
| 5   | Vivex      | low       | G1                        | ComfyUI 큐 — 비용 가드  |
| 6   | **Twinex** | **high**  | G1 (Viewer) / G2 (Editor) | **G3 = Edge only**      |
| 7   | Navex      | low       | G1                        | 릴레이 컨텍스트만       |

- **`readonly: true`** (`00` §3.3)는 RBAC **보조** — 역할 없이 편집 불가
- **Yjs Review** 모드: Omnix·Normex 승인 전 **쓰기 미반영** (`00` §3.2)

### 6.3 `.nx*` 파일 ACL

| 확장자      | 생성 탭 | Editor 최소 조건                  |
| ----------- | ------- | --------------------------------- |
| `.nxpol`    | Normex  | Normex write                      |
| `.nxflow`   | Logex   | Logex write                       |
| `.nxcode`   | Scribx  | Scribx write                      |
| `.nxproj` … | Twinex  | Twinex write + (G2+) MFA for bind |
| Navex index | —       | read all · write none             |

---

## 7. Normex · CSIM · AI 가드레일

| 계층            | 역할                                                                                                                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Normex**      | 정책·Norm(규범) · 인터랙티브 블록 · **MUST/SHOULD** — [`13 CSIM`](<./_Cosmic%20Semantic%20Interface%20Matrix%20v2%20%E2%80%94%20CSIM%20%C2%B7%20AXON%20%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%20(%EC%A0%95%EB%B3%B8).md>) HEXAGON Who |
| **Omnix 3단계** | Omnix(승인) → Normex(검증) → 탭 서브 에이전트 — `00` §3.4                                                                                                                                                                           |
| **Rivet**       | **Normex Subgraph** 모든 그래프 **선행** — 금지: 비인가 파일 · 민감정보 출력 · 승인 없는 실행                                                                                                                                       |
| **LLM**         | CSIM 판정·범위 미통과 → **실행 차단·재추론** — Header+Body 실시간 루프는 **비LLM**                                                                                                                                                  |

**ACTON-GM (`programRef`):**

- Fetch **전** NEXAON/Normex · Execute **전** MUST(M200 등) + Omnix ACK
- `contentHash` 불일치 · Profile 위반 → **실행 차단** · audit `STUCK`

---

## 8. 데이터 보호

| 구간          | 규범                                                      |
| ------------- | --------------------------------------------------------- |
| 전송          | **TLS 1.2+** · MQTT TLS · Edge mTLS                       |
| 저장          | PII·키·토큰 **AES-256** · OPFS/IndexedDB 민감 필드 암호화 |
| 프롬프트      | 입력 마스킹 · 출력 Normex 정책 필터                       |
| SSE/WebSocket | `parseSseEvent` **Zod** 검증 — NEXA OS §SSE               |
| 키            | 분기 회전 · 긴급 교체 Runbook                             |
| CORS · WAF    | OWASP 기준 · API 화이트리스트                             |

---

## 9. Yjs · 협업 보안

| 항목      | 규범                                               |
| --------- | -------------------------------------------------- |
| 인증      | JWT + 탭별 document scope                          |
| Grade3    | Y.Map `control` 키 **transaction reject**          |
| Awareness | LLM `clientId: ollama-nexia` — `00` §3.2           |
| 충돌      | CRDT + Omnix/Navex **동일 asset** 정책 — `00` §9.4 |
| 오프라인  | Navex 캐시 · sync 장애 시 **Safety SSE** — `06`    |

---

## 10. Twinex · IoT · 엔진 호출

- **모든 엔진 호출** 백엔드 오케스트레이터 경유 — `00` §2.2
- Twinex 디바이스 제어: **Editor+ 이상** · G2는 MFA · G3는 **Edge queue만**
- ESPHome/MQTT: Grade별 topic ACL · 현장 broker 분리
- 시뮬레이션 격리: Twinex sim 모드 — **실 디바이스 write deny** (`00` §9.5)

---

## 11. 감사 · 시간 · 사고 대응

### 11.1 감사 로그 (2등급+ 필수)

| 필드                                  | 용도                             |
| ------------------------------------- | -------------------------------- |
| `requestId` · `traceId` · `commandId` | 탭·엔진·명령 추적                |
| `actor` · `tabId` · `grade`           | RBAC · NEXIA 컨텍스트            |
| `issuedAt` · `ackedAt`                | **`time-sync` SSOT** — 선후 관계 |
| `programRef` · `contentHash`          | ACTON-GM Fetch·Execute           |
| `result`                              | allow · deny · timeout · STUCK   |

- **보존:** 180일 이상 · append-only · 위변조 방지 (`audit-log.interceptor`)
- **대상:** 로그인 · 권한 변경 · Grade2+ 명령 · 배포 · `programRef` · AI Normex 거부 · 실패

### 11.2 사고 대응 SLA

| 단계                                  | 목표   |
| ------------------------------------- | ------ |
| 탐지                                  | 5분    |
| 격리 (Circuit Breaker · degradedMode) | 15분   |
| 복구                                  | 4시간  |
| 사후 보고                             | 72시간 |

> 절차: [`06 예외 상황 처리`](<./06%20예외%20상황%20처리%20(Exception%20Handling).md>)

---

## 12. CI 검증 · KPI

| 검증                         | 명령 / 게이트                                                         |
| ---------------------------- | --------------------------------------------------------------------- |
| Grade×Ingress contract       | `pnpm test:security`                                                  |
| Safety ingest ≤200ms (flood) | `TELEMETRY-FLOOD-500`                                                 |
| Merge                        | V-\* **green** 없이 merge **금지** — NEXA OS §미션 크리티컬 설계 검증 |

| KPI                      | 목표    |
| ------------------------ | ------- |
| 인증 실패 탐지율         | ≥ 99%   |
| 권한 오남용              | 0건     |
| Grade3 외부 ingress 유입 | **0건** |
| 고위험 작업 승인 누락    | 0건     |
| Twinex sim→live leak     | 0건     |

---

## 부록 A. 보안 용어 (Quick Reference)

| 분류   | 용어                         | 설명                             |
| ------ | ---------------------------- | -------------------------------- |
| 인증   | MFA / JWT / OIDC             | 다중 인증 · 토큰 · 표준 프로토콜 |
| 인가   | PoLP · RBAC                  | 최소 권한 · 역할 기반            |
| 데이터 | TLS · AES-256 · PII          | 전송·저장 암호화 · 개인정보      |
| 공격   | SQLi · XSS · DoS · MITM      | OWASP 대응                       |
| 인프라 | PKI · WAF · CORS             | 인증서 · 방화벽 · 출처 정책      |
| NEXA   | Grade 1~3 · edge-pull-sse    | 명령 등급 · Grade3 수신 경로     |
| NEXA   | `programRef` · `contentHash` | ACTON-GM 무결성                  |

---

_상태: Normative — Grade 1~3 · RBAC · NEXIA 7탭 · NEXA OS commands/audit 연동._

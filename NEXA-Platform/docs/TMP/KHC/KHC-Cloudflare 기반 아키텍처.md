# KHC-Cloudflare 기반 아키텍처

## 목적

무거운 서버·복잡한 프레임워크 없이 **Cloudflare Workers** 중심으로 구축하기 위한 기술 스택·설계 가이드.

---

## 🛠️ 1. 최종 기술 스택 (Tech Stack)

전 세계 공통 표준 기술 위주로 구성하여 1년 후 정식 서버(Node.js, Python, Go 등)로 이전할 때 하드웨어와 프론트엔드 코드를 단 한 줄도 고치지 않도록 설계했습니다.

| 구분              | 기술 스택                       | 선택 이유 및 역할                                                                     | 비용 (무료 플랜 기준)                |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------ |
| 하드웨어          | ESP32 (3~4대)                   | 센서 데이터 수집(온도·PIR·조도·카운트·전류) 및 릴레이 제어                            | 소모품 구매비 외 없음                |
| 프론트엔드        | HTML5 + Tailwind CSS + Chart.js | 화려하고 실시간으로 반응하는 반응형 웹 대시보드 UI                                    | 완전 무료 (Cloudflare Pages 호스팅)  |
| 사용자 인증 (3종) | **생체 · 드로잉 · 문자열** — 병행 | PC 등 WebAuthn 미지원 기기 대비. **어느 경로든 검증 성공 시 동일 JWT** 발급          | 표준 API + D1 (무료)                 |
| ├ 생체 인증       | WebAuthn API (Passkey)          | 스마트폰·노트북 지문/FaceID — `POST /auth/webauthn/verify`                            | 브라우저 내장                        |
| ├ 드로잉 인증     | Canvas 패턴 (제스처 해시)       | PC·구형 브라우저 — 등록 패턴 정규화 후 D1 해시와 상수시간 비교                         | 클라이언트 Canvas + Workers          |
| └ 문자열 인증     | Passphrase / PIN                | 모든 환경 폴백 — Argon2id 해시·레이트리밋·허용 ID 목록                                  | D1 `auth_string_credentials`         |
| 세션 토큰         | Short-lived JWT (HS256)         | 3종 인증 **공통** 발급 — `auth_method` 클레임, WebSocket `Authorization` 헤더          | Workers Secrets (JWT_SECRET)         |
| 백엔드 (에지)     | Cloudflare Workers              | HTTP·WebSocket·**`scheduled()` Cron**·AI·명령 검증 게이트                            | 하루 10,000회~100,000회 무료 [2, 3]  |
| 실시간 중계       | Durable Objects (WebSockets)    | 웹 브라우저 ↔ ESP32 간 1초 미만의 실시간 양방향 통신                                 | 하루 100,000회 요청 무료             |
| 데이터베이스      | Cloudflare D1 (SQLite 기반)     | 과거 센서 데이터 누적 기록 및 대시보드 초기 조회용                                    | 하루 읽기 500만 / 쓰기 50만회 무료   |
| 파일 저장소       | Cloudflare R2 (Private 버킷)    | OTA `.bin` 저장 — **Public 접근 금지**, Workers가 Presigned URL만 발급                | 10GB 무료, 다운로드 트래픽 무료      |
| 알림·자연어 UI    | Telegram Bot API                | 푸시 알림 + **자연어 → Workers AI** 명령 파이프라인 (허용 User ID만)                  | 완전 무료                            |
| AI 오케스트레이션 | Workers AI (`@cf/...` 모델)     | 자연어를 **구조화된 명령 JSON**으로 변환 — LLM 출력은 화이트리스트 검증 후 ESP32 전달 | **무료 한도** (일일 Neurons·요청 캡) |
| 스케줄·정기 작업  | **Cron Triggers** (Workers)     | `wrangler.toml` cron → `scheduled()` — 정기 점검·알림·D1 스케줄 실행·AI 한도 리셋 | Workers 무료 (계정당 cron 슬롯 제한) |

---

## 🌐 2. 시스템 아키텍처 (Architecture)

시스템은 외부 인터넷을 경유하는 클라우드 실시간망과 집 안에서만 도는 로컬 폐쇄망이 결합된 하이브리드 구조입니다.

[집 밖 / 외부]
사용자 (텔레그램) ──(자연어)──▶ [ Workers ──▶ Workers AI ] ──(검증된 JSON 명령)──▶ [ Durable Objects ] ──▶ ESP32
사용자 (브라우저) ──(웹소켓·자연어)──▶ [ Durable Objects ] ──(기록)──▶ [ D1 DB ] / [ R2 Private ]
▲
[ Cron Triggers ] ──(scheduled)──▶ [ Workers ] — 스케줄 실행·점검·집계·DO 명령 푸시
│ (보안 웹소켓 wss://)
▼
[집 안 / 로컬]
┌────────── [ 거실 ESP32 ] (릴레이 / 센서)
├────────── [ 가스 ESP32 ] (열기: 로컬 전용 / 닫기: 클라우드 긴급 차단 허용)
└────────── [ 전등 ESP32 ] (생체·드로잉·문자열 인증 후 JWT 제어 세션 시 명령 수신)

## 🔄 주요 시나리오별 데이터 흐름

- **3종 인증 → JWT → WebSocket**: 생체(WebAuthn)·드로잉(패턴)·문자열(Passphrase) 중 **기기가 지원하는 방식 1개**로 Workers 인증 ➔ **5분 유효 JWT** (`auth_method` 포함) ➔ WebSocket `Authorization: Bearer <jwt>` ➔ scope 검증 후 DO 세션 개방.
- 실시간 데이터 수집: ESP32가 온도 변화를 감지 ➔ Workers(Durable Objects)로 전송 ➔ 켜져 있는 브라우저 화면의 Chart.js 그래프에 실시간 반영 및 D1 DB에 동시 기록.
- **무선 펌웨어 업데이트 (OTA)**: 관리자가 Wrangler/대시보드로 `.bin`을 **Private R2**에 업로드 ➔ OTA 트리거 시 Workers가 **서명된 임시 URL(Presigned URL, 예: 15분 유효)** 생성 ➔ WebSocket으로 ESP32에 `{ presignedUrl, version, sha256 }`만 전달 ➔ ESP32가 해당 URL로 HTTPS GET 후 검증·플래시·리부팅. R2 Public URL·버킷 직접 노출 **금지**.
- **자연어 → Workers AI → ESP32**: 텔레그램 메시지 또는 WebSocket `type: "nl"` 로 자연어 입력 ➔ Workers가 D1·DO 캐시에서 **최신 상태 스냅샷**을 붙여 Workers AI 호출 ➔ LLM이 **명령 JSON**만 생성 ➔ Workers **화이트리스트·scope** 검증 통과 시에만 DO 경유 ESP32 전달. **주로 상태 파악**, **일부 2단계 제어·가스 닫기**만 허용 (3단계·가스 열기·OTA는 AI 경로 **불가**).
- **Cron 스케줄 실행**: `wrangler.toml`에 등록한 cron이 Workers `scheduled()` 를 호출 ➔ D1 `schedules`·`ai_usage` 조회 ➔ 시각이 된 작업만 DO/WebSocket·텔레그램·ESP32 명령 실행 (별도 cron 서버 불필요).

---

---

## 🛡️ 3. 보안 통제 전략 (Security Strategy)

중요도와 치명률에 따라 액세스 권한을 3단계로 완벽히 분리 통제합니다.

1.  1단계: 단순 모니터링 (가장 낮음)

- 센서 값 조회: **문자열 인증**의 read-only Passphrase, 또는 텔레그램 허용 `user_id`만으로도 가능 (JWT `scope: read`).

2.  2단계: 일반 제어 명령 (중간 — 3종 인증 중 1개 + short-lived JWT)

- 전등·환풍기 등은 **유효 JWT** WebSocket 세션에서만 허용. JWT는 **생체·드로잉·문자열** 검증 직후 공통 발급(기본 **5분**), 만료 시 **동일 또는 다른 방식**으로 재인증.
- 인증 방식마다 반복하지 않고 세션 동안 JWT 유지. `scope: control:general` 필요.
- **PC**: WebAuthn 미지원 시 **드로잉** 또는 **문자열** 로그인 UI 표시 (자동 감지 `PublicKeyCredential` 가용 여부).

3.  3단계: 치명적인 보안 제어 (가장 높음 - 비대칭 통제)

- **도어락 열기, 보일러 고온 설정** 등은 Cloudflare Workers 주소를 통한 원격 제어 경로를 소스 코드 수준에서 완전히 삭제합니다. 오직 사용자의 스마트폰이 집안 공유기(Wi-Fi)에 접속되어 있을 때만, ESP32의 로컬 IP(예: 192.168.0.X)로 직접 통신하여 제어하도록 강제합니다. 해커가 클라우드를 완전히 장악해도 집 문은 열 수 없습니다.

- **가스 밸브 (비대칭 통제)** — 열기와 닫기의 위험도가 다르므로 경로를 분리합니다.

  | 명령             | 허용 경로                                         | 이유                                                                                |
  | ---------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
  | **열기 (open)**  | 로컬 전용 — 물리 버튼 또는 내부 IP(192.168.x.x)만 | 원격·클라우드 경유 개방은 해킹·오작동 시 폭발·누출 위험. 현장에서만 의도적으로 개방 |
  | **닫기 (close)** | 클라우드 허용 — Workers / 텔레그램 / 웹 대시보드  | 긴급 원격 차단은 안전 쪽으로만 작동. 외부에서도 즉시 밸브를 닫을 수 있어야 함       |

  - Workers·ESP32 펌웨어 모두 `gas/open` API·MQTT 토픽·릴레이 핀을 클라우드 경로에 **등록하지 않음**.
  - `gas/close`만 Workers에 노출하며, 전달 전 **생체·드로잉·문자열** 중 허용된 방식으로 JWT 발급(또는 텔레그램 허용 ID).
  - ESP32는 open 요청을 **로컬 HTTP(내부 IP) 또는 GPIO 물리 버튼**에서만 수신합니다.
  - `gas/close`는 JWT `scope: control:critical:gas-close` + D1에서 해당 `user`에 **gas-close 허용** 플래그가 있을 때만 중계 (문자열-only 계정은 기본 **거부** 권장).

---

## 🔐 3종 인증 → JWT → Durable Objects WebSocket

**생체 · 드로잉 · 문자열** 은 경쟁이 아니라 **병행 옵션**입니다. 기기가 지원하지 않는 방식은 UI에서 숨기고, 검증에 성공한 경로는 **동일한 JWT 발급기**(`issueJwt()`)로 합칩니다. 이후 WebSocket·제어·AI는 JWT만 보며 인증 방식을 구분하지 않습니다(감사 로그용 `auth_method` 제외).

### 인증 방식 선택 (클라이언트)

| 환경 | 우선 표시 | 폴백 |
| ---- | --------- | ---- |
| 스마트폰 (Safari/Chrome) | 생체 (WebAuthn) | 드로잉 → 문자열 |
| PC (WebAuthn 없음) | 드로잉 | 문자열 |
| 키오스크·구형 브라우저 | 문자열 | 드로잉 |

```javascript
// 의사코드: 로그인 화면
const webauthnOk = window.PublicKeyCredential != null;
if (webauthnOk) showTab("biometric");
showTab("drawing");
showTab("string");
```

### 흐름 요약 (3경로 → 1 JWT)

```
[브라우저]                    [Workers]                              [Durable Object]
    │                             │                                        │
    │ ①-A POST /auth/webauthn/verify   (생체)                             │
    │ ①-B POST /auth/drawing/verify    (드로잉)                           │
    │ ①-C POST /auth/string/verify     (문자열)                           │
    │ ───────────────────────────────▶│ D1 검증 → issueJwt(sub, scope)      │
    │ ② { token, auth_method, exp }   │                                    │
    │ ◀───────────────────────────────│                                    │
    │ ③ Authorization: Bearer <jwt>   │ JWT·scope 검증 → WebSocket upgrade  │
    │ ───────────────────────────────▶│ ────────────────────────────────────▶│
    │ ④ (만료 시) ① 중 하나로 재인증  │                                        │
```

### ①-A 생체 인증 (WebAuthn / Passkey)

- `POST /auth/webauthn/verify` — 등록: `/auth/webauthn/register`
- `navigator.credentials.get()` assertion → D1 `webauthn_credentials` 공개키로 challenge·origin·서명 검증.
- PC에서 플랫폼 authenticator 없으면 `NotSupportedError` → UI가 드로잉·문자열 탭으로 안내.

### ①-B 드로잉 기반 인증

- `POST /auth/drawing/verify` — body: `{ userId, patternHash }` (또는 정규화된 stroke 벡터)
- **등록** (`/auth/drawing/register`): Canvas에 패턴 2회 입력 → 클라이언트가 stroke를 **격자 정규화**(예: 3×3 셀 시퀀스) 후 `SHA-256` → Workers는 **Argon2id**로 D1 `auth_drawing_credentials`에 저장 (원본 좌표·이미지 저장 금지).
- **검증**: 동일 정규화·해시 → 상수시간 비교. 허용 오차: 인접 셀 1칸 drift (선택, 사용자 경험).
- PC·태블릿 대시보드의 **주 인증 수단**으로 설계.

### ①-C 문자열 인증

- `POST /auth/string/verify` — body: `{ userId, passphrase }`
- D1 `auth_string_credentials.password_hash` (Argon2id)와 비교.
- **레이트리밋**: IP·`userId`당 5회/15분 실패 시 `429` (Workers KV 또는 D1 `auth_attempts`).
- Passphrase 정책: 최소 12자 또는 6자리 PIN+계정 lockout (운영 정책).
- ESP32 read-only·게스트 모니터링용 **약한 scope** 전용 계정 가능 (`read` only).

### ② Short-lived JWT 발급 (공통)

- 알고리즘: **HS256** (서명 키 `JWT_SECRET`은 Wrangler Secrets, 코드·저장소에 노출 금지).
- 유효 시간: **`exp` = 발급 시각 + 5분** (300초). 필요 시 `control:critical:gas-close` 등 고위험 scope는 **1~2분**으로 더 짧게 설정 가능.
- 권장 클레임:

  | 클레임        | 예시                      | 설명                                          |
  | ------------- | ------------------------- | --------------------------------------------- |
  | `sub`          | `user_abc123`             | 사용자 식별자                                 |
  | `auth_method`  | `webauthn` \| `drawing` \| `string` | 발급에 사용한 인증 경로 (감사·정책)   |
  | `scope`        | `read`, `control:general` | 허용 동작 범위                                |
  | `iat` / `exp`  | Unix timestamp            | 발급·만료 시각                                |
  | `jti`          | UUID                      | 토큰 고유 ID                                  |

- 응답 예: `{ "token": "<jwt>", "auth_method": "drawing", "expiresIn": 300 }`
- JWT는 브라우저 **메모리 변수**에만 보관합니다 (`localStorage` 저장 금지).

### ③ WebSocket 업그레이드 — JWT 헤더 제출

- Durable Objects 연결 URL: `wss://khc.nexamap.net/ws/room/:roomId`
- **업그레이드 HTTP 요청**에 아래 헤더를 반드시 포함합니다.

  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  ```

- Workers `fetch` 핸들러가 업그레이드 요청을 가로채 **JWT를 검증한 뒤**에만 해당 Durable Object로 프록시합니다.
- 검증 항목: 서명 유효, `exp` 미만료, `scope`에 요청 room·동작에 필요한 권한 포함.
- 실패 시 `401 Unauthorized` — WebSocket 연결 거부.

> **브라우저 참고**: 표준 `WebSocket` 생성자는 커스텀 헤더를 직접 설정할 수 없습니다. 동일 JWT 검증 경로를 유지하려면 (a) Workers 앞단에서 `fetch` + `Upgrade` 헤더로 업그레이드하거나, (b) **`Sec-WebSocket-Protocol`에 `bearer.<jwt>`** 를 실어 Workers가 파싱하는 방식을 사용합니다. ESP32 등 네이티브 클라이언트는 `Authorization` 헤더를 그대로 사용합니다.

### ④ Durable Object 세션 내 정책

- DO는 Workers가 이미 검증한 연결만 수락합니다 (업그레이드 게이트는 Workers 단일 진입점).
- **제어 명령** WebSocket 메시지 수신 시 DO(또는 Workers)가 JWT `scope`를 재확인합니다.
- JWT 만료 후 `4401` close → 생체·드로잉·문자열 **중 하나**로 재인증 후 재연결.

### D1 사용자·인증 정책 (`users` + credentials)

| 테이블 | 용도 |
| ------ | ---- |
| `webauthn_credentials` | Passkey 공개키·credential id |
| `auth_drawing_credentials` | userId + pattern_hash (Argon2id) |
| `auth_string_credentials` | userId + password_hash |
| `users` | `allow_webauthn`, `allow_drawing`, `allow_string`, `allow_gas_close` |

- 계정별 **허용 인증 수단**·**최대 scope**를 D1에서 제한 (예: 공유 PC 문자열 계정 → `read` only).

### scope ↔ 3단계 보안 등급 매핑

| scope                        | 허용 동작                                          | 인증 (3종 중)                                 |
| ---------------------------- | -------------------------------------------------- | --------------------------------------------- |
| `read`                       | 센서 조회, 차트 구독                               | **문자열**만으로도 가능 (전용 계정)           |
| `control:general`            | 전등, 환풍기 등 2단계 제어                         | 생체·드로잉·문자열 **검증 성공** (계정 scope) |
| `control:critical:gas-close` | 가스 **닫기**                                      | 생체 또는 드로잉 + `allow_gas_close` (문자열 기본 거부) |
| _(미등록)_                   | `gas/open`, 도어락 열기 등                         | JWT로도 **불가** — 로컬 전용                  |
| `ota:device`                 | OTA Presigned URL                                  | 생체·드로잉 (관리자) 또는 기기 등록 토큰      |
| `ai:nl`                      | Workers AI 자연어                                  | 텔레그램 허용 ID 또는 JWT `read` 이상         |

---

## 🤖 Workers AI — 자연어 명령 (무료 한도 운영)

텔레그램·WebSocket으로 들어온 **한국어/자연어**를 Cloudflare **Workers AI**가 구조화된 명령으로 바꾸고, **Workers가 최종 검증**한 뒤에만 ESP32로 보냅니다. LLM 출력을 그대로 실행하지 않습니다.

### 역할 범위 (주요 상태 파악 + 일부 제어만)

| 분류            | AI·Workers 허용 예                                                          | AI·Workers **금지** (로컬·고위험 전용)              |
| --------------- | --------------------------------------------------------------------------- | --------------------------------------------------- |
| **상태 파악**   | 온도·전류·가동률·PIR·릴레이 ON/OFF 조회, "지금 거실 몇 도야?", "1호기 전류" | —                                                   |
| **2단계 제어**  | 전등·환풍기 ON/OFF (`control:general` scope 있을 때)                        | —                                                   |
| **치명·비대칭** | 가스 **닫기** (JWT `control:critical:gas-close`, 생체·드로잉 권장)          | 가스 **열기**, 도어락 열기, 보일러 고온, OTA 트리거 |

### 입력 채널

| 채널          | 진입                                   | 인증                                                          |
| ------------- | -------------------------------------- | ------------------------------------------------------------- |
| **텔레그램**  | Bot Webhook → `POST /telegram/webhook` | D1 `telegram_allowlist`의 `user_id`만 AI 파이프라인 진입      |
| **WebSocket** | `{ "type": "nl", "text": "..." }`      | 유효 JWT + `scope`에 `ai:nl` (조회만이면 `read`만으로도 가능) |

### 처리 흐름

```
[사용자]          [Workers]              [Workers AI]        [검증]           [DO] → [ESP32]
    │                 │                       │                │                  │
    │ "거실 불 켜줘"   │                       │                │                  │
    │ (TG / WS)       │                       │                │                  │
    │ ───────────────▶│ ① 일일 한도·쿨다운     │                │                  │
    │                 │ ② D1/DO 최신 상태 조회 │                │                  │
    │                 │ ─────────────────────▶│ ③ structured   │                  │
    │                 │    system+allowlist   │    JSON only   │                  │
    │                 │ ◀─────────────────────│                │                  │
    │                 │ ④ JSON Schema +       │                │                  │
    │                 │    COMMAND_ALLOWLIST  │                │                  │
    │                 │    + JWT scope        │                │                  │
    │                 │ ────────────────────────────────────────▶│ relay 명령      │
    │ ◀───────────────│ ⑤ 자연어 요약 응답     │                │                  │
```

### LLM 출력 형식 (고정 JSON Schema)

Workers AI 응답은 **반드시** 아래 형태만 파싱합니다. 그 외 텍스트·마크다운은 폐기합니다.

```json
{
  "intent": "query_status | control",
  "deviceId": "livingroom | gas | light_1",
  "action": "get_temperature | relay_on | relay_off | gas_close",
  "params": {},
  "reply": "사용자에게 보여줄 한 줄 요약"
}
```

- `intent: "query_status"` → D1·DO 스냅샷만 조회, **ESP32 제어 없음**, Neurons 소모 최소.
- `intent: "control"` → `action`이 **COMMAND_ALLOWLIST**에 있고, 호출자 `scope`가 일치할 때만 DO로 전달.

### COMMAND_ALLOWLIST (Workers 하드코딩)

| action                                                              | 필요 scope                   | ESP32 payload 예                                                     |
| ------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| `get_temperature`, `get_current`, `get_relay_state`, `list_summary` | `read` 또는 `ai:nl`          | 조회만                                                               |
| `relay_on`, `relay_off`, `fan_on`, `fan_off`                        | `control:general`            | `{ "cmd": "relay", "pin": 12, "v": 1 }`                              |
| `gas_close`                                                         | `control:critical:gas-close` | `{ "cmd": "gas", "op": "close" }`                                    |
| _(미등록)_                                                          | —                            | `gas_open`, `door_unlock`, `ota_trigger` 등 **AI·Workers 모두 거부** |

### Workers AI 무료 한도 운영 로직

Cloudflare **Workers AI**는 무료 플랜에서 **일일 Neurons·요청 수**에 상한이 있습니다. IoT 규모(3~4대)에서는 아래 로직으로 **한도 내에서만** 호출합니다.

| 규칙              | 구현                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| **일일 캡**       | D1 `ai_usage(day, neurons_used, request_count)` — Cron `0 0 * * *` (UTC)에 `day` 롤오버·집계               |
| **안전 상한**     | `AI_DAILY_MAX_REQUESTS = 50`, `AI_DAILY_MAX_NEURONS = 8000` (Wrangler vars, 계정 한도에 맞게 조정)         |
| **한도 초과**     | Workers AI **호출 스킵** → 고정 응답: "오늘 AI 한도에 도달했습니다. `/status` 또는 대시보드를 이용하세요." |
| **AI 생략 경로**  | `/status`, `/help`, `온도` 등 **정규식·키워드 매칭**이면 LLM 없이 D1 조회만 (Neurons 0)                    |
| **쿨다운**        | 동일 `user_id` / `sub` 기준 **5초** 이내 중복 자연어 → `429` (스팸·프롬프트 인젝션 완화)                   |
| **프롬프트 절약** | `max_tokens` 출력 **256** 이하, 상태 스냅샷은 **최근 20건·필드만** JSON으로 첨부                           |
| **모델**          | `@cf/meta/llama-3-8b-instruct` 등 Workers AI 카탈로그 **소형 instruct** 모델 1종 고정 (무료 Neurons 효율)  |
| **로깅**          | `ai_usage`에 `request_count++`, 응답 헤더 `cf-ai-neurons` 누적 (가능 시)                                   |

> **원칙**: 센서 Deadband로 줄인 WebSocket 트래픽과 별도로, **자연어는 사람이 말할 때만** AI를 태웁니다. 1초마다 AI를 돌리지 않습니다.

### 보안 (LLM 우회 불가)

- 시스템 프롬프트에 **허용 action 목록**을 명시하고, "목록 밖은 `intent: query_status`로 거절 설명만" 지시.
- 사용자 문장에 "ignore previous instructions", "gas open" 등이 있어도 **Workers ④단계**에서 `COMMAND_ALLOWLIST`·`scope`로 차단.
- 제어 intent는 텔레그램도 **민감 action** 시 웹에서 생체·드로잉·문자열 로그인 후 JWT 발급 안내 (JWT 없는 TG는 `gas_close`·`relay_on` 제한 가능).

### 텔레그램 vs WebSocket 차이

| 기능             | 텔레그램                   | WebSocket (JWT)                  |
| ---------------- | -------------------------- | -------------------------------- |
| 상태 질의        | 허용 User ID면 **상시**    | `read` / `ai:nl`                 |
| 전등·환풍기 제어 | allowlist + (권장) 제한적  | `control:general` JWT 필요       |
| 가스 닫기        | allowlist + 명시 확인 문구 | `control:critical:gas-close` JWT |

---

## ⏰ Cron Triggers — 스케줄·정기 작업

24시간 켜 두는 스케줄러 서버 없이, **Cloudflare Cron Triggers**가 Workers의 `scheduled(event, env, ctx)` 를 정해진 시각에 호출합니다. 대시보드·텔레그램에서 등록한 **사용자 스케줄**도 D1에 저장하고, Cron이 **분 단위로 due 작업을 스캔**해 실행합니다.

### Wrangler 설정 예 (`wrangler.toml`)

```toml
[triggers]
crons = [
  "0 0 * * *",    # 매일 00:00 UTC — ai_usage 리셋·일일 리포트
  "*/5 * * * *",  # 5분마다 — D1 schedules due 스캔·헬스체크
  "0 8 * * 1-5",  # 평일 08:00 UTC — 공장 점검 알림 (KST 변환은 Workers에서)
]
```

- 무료 플랜: 계정·Worker당 **cron 표현식 개수 상한** 있음 → 고정 2~3개 + D1 `schedules` 로 세밀한 시각은 **5분 스캔**에 위임.
- `scheduled()` 와 `fetch()` 는 **동일 Worker** 바인딩(D1, DO, AI) 공유.

### Workers `scheduled()` 처리 흐름

```
[Cron Trigger] ──▶ [Workers scheduled()]
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ai_usage 리셋    schedules due     센서 이상 집계
   (자정 UTC)       (D1 조회)         → Telegram
         │               │
         │               ▼
         │         COMMAND_ALLOWLIST
         │         + scope 검증
         │               │
         └───────────────┴──▶ [Durable Objects] ──▶ ESP32
                            (연결된 기기만 relay_on/off 등)
```

### D1 `schedules` 테이블 (사용자 스케줄)

| 컬럼 | 설명 |
| ---- | ---- |
| `id` | UUID |
| `name` | "평일 22시 전등 OFF" |
| `cron_expr` | `0 13 * * 1-5` (UTC) 또는 `run_at` ISO 단발 |
| `device_id` | `light_1` |
| `action` | `relay_off` — **COMMAND_ALLOWLIST** 내만 |
| `enabled` | 0/1 |
| `last_run_at` | 중복 실행 방지 |

- 대시보드 `POST /schedules` (JWT `control:general` 또는 관리 scope)로 CRUD.
- **5분 Cron**이 `enabled=1` 이고 `next_run <= now` 인 행만 실행 후 `last_run_at` 갱신.
- 스케줄로 **가스 열기·도어락·OTA** 등록 **불가** (3단계·로컬 전용과 동일).

### 시스템 고정 Cron (내장)

| cron | 작업 |
| ---- | ---- |
| `0 0 * * *` | `ai_usage` 일일 롤오버, D1 오래된 로그 아카이브(선택) |
| `*/5 * * * *` | `schedules` due 실행, ESP32 last_seen 헬스체크, 미응답 시 텔레그램 |
| `0 */6 * * *` | (선택) 6시간마다 요약 리포트 텔레그램 |

### 보안·제한

- Cron 경로도 **화이트리스트·scope** 동일 적용 — 스케줄에 `gas_open` 저장 시 Workers가 거부.
- ESP32 오프라인 시 DO 큐에 남기지 않고 `schedules` 에 `last_error` 기록 + 텔레그램 1회 알림 (무한 재시도 방지).

---

## 📦 R2 OTA — Private 버킷 + Presigned URL

R2 버킷을 **Public**으로 열면 펌웨어 `.bin` URL만 알아도 누구나 다운로드·역공학·악성 플래시 시도가 가능합니다. **버킷은 항상 Private**로 두고, 다운로드는 Workers가 발급한 **서명된 임시 URL**로만 허용합니다.

### 원칙

| 항목                      | 정책                                                               |
| ------------------------- | ------------------------------------------------------------------ |
| R2 버킷 Public Access     | **비활성** (Custom Domain Public도 OTA 객체에 사용하지 않음)       |
| ESP32·브라우저가 보는 URL | Workers가 생성한 **Presigned GET URL** (S3 Signature Version 4)    |
| URL 유효 시간             | 기본 **15분** (`X-Amz-Expires=900`). 1회 OTA 1 URL, 만료 후 재발급 |
| 객체 키                   | `firmware/{deviceId}/{version}.bin` — 버전·기기별 분리             |

### OTA 흐름

```
[관리자]                    [Workers]                      [R2 Private]           [ESP32]
    │                           │                               │                    │
    │ ① .bin 업로드 (Wrangler)   │                               │                    │
    │ ──────────────────────────▶│ PUT (R2 API 키, 서버만)        │                    │
    │                           │ ─────────────────────────────▶│ 저장               │
    │                           │                               │                    │
    │ ② POST /ota/trigger       │                               │                    │
    │    deviceId, version      │                               │                    │
    │    + JWT scope:ota:device │                               │                    │
    │ ──────────────────────────▶│ ③ Presigned URL 생성 (15분)   │                    │
    │                           │    R2_ACCESS_KEY + SECRET      │                    │
    │                           │                               │                    │
    │                           │ ④ WebSocket 메시지             │                    │
    │                           │    { url, version, sha256 }    │                    │
    │                           │ ──────────────────────────────────────────────────▶│
    │                           │                               │  ⑤ HTTPS GET url   │
    │                           │                               │ ◀──────────────────│
    │                           │                               │  ⑥ sha256 검증     │
    │                           │                               │     → OTA 플래시   │
```

### Workers 구현 요약

- **업로드**: 관리자만 Wrangler CLI 또는 `POST /ota/upload`(생체·드로잉 인증 JWT + `ota:admin` scope)로 Private 버킷에 기록.
- **Presigned URL 발급**: `aws4fetch` 또는 `@aws-sdk/s3-request-presigner`로 `GET` 전용 URL 생성. `env.R2_ACCESS_KEY_ID`, `env.R2_SECRET_ACCESS_KEY`, `env.R2_BUCKET`, `env.R2_ACCOUNT_ID`는 Wrangler Secrets.
- **ESP32에 전달**: Durable Objects WebSocket으로 **Presigned URL 문자열만** 전송. 영구 R2 엔드포인트·객체 키는 노출하지 않음.
- **검증**: ESP32는 다운로드 후 **SHA-256**이 메시지의 `sha256`과 일치할 때만 `Update.begin()` 실행.
- **재사용 방지**: 동일 `jti`·`deviceId`·`version` 조합은 D1 `ota_grants`에 1회 기록 후 Presigned URL **1회 발급** 권장.

### Public 버킷을 쓰면 안 되는 이유

- 펌웨어 바이너리 유출 → 취약점 분석·클론 디바이스 제작 용이
- URL 추측·크롤링으로 무단 다운로드
- Presigned URL은 **만료·서명·객체 단위**로 제한되어 OTA 시점·대상 기기만 최소 노출

---

## 📈 4. 효율적 운영 전략 (Operational Strategy)

- 변화량 기반 전송 (Deadband): 데이터 트래픽과 Workers API 호출 횟수를 아끼기 위해, 1초마다 기계적으로 데이터를 쏘지 않고 '온도가 0.5도 이상 변했을 때'처럼 유의미한 변화가 있을 때만 웹소켓으로 전송하여 무료 트래픽 제한을 완벽히 방어합니다.
- 텔레그램 알림 활용: 24시간 백그라운드 서버를 켜두지 않아도, PIR 센서 등 침입 감지 시 Workers가 텔레그램 API를 호출하여 브라우저가 닫힌 상태에서도 실시간 푸시 알림을 폰으로 받아봅니다.
- R2 자동 청소 (Lifecycle): 펌웨어 다운로드가 끝나고 방치된 무거운 파일들은 **Private** R2 버킷의 '수명 주기 규칙'을 활용해 '업로드 3일 후 자동 삭제'되도록 설정합니다. Presigned URL은 15분 내 만료되므로 유출된 링크의 유효 창도 짧습니다.
- Workers AI 절약: `/status`·키워드 라우팅으로 **조회의 80%**는 LLM 없이 처리, 자연어 제어는 일일 50회 캡·5초 쿨다운으로 무료 Neurons 한도 방어.
- Cron + D1 스케줄: 고정 cron 2~3개만 `wrangler.toml`에 두고, 사용자 정의 시각은 D1 `schedules` + 5분 스캔으로 처리해 **cron 슬롯·Workers 호출**을 절약합니다.

---

## 🚀 다음 단계 진행 제안

전체적인 청사진이 완벽하게 정리되었습니다. 이제 실무 개발 단계로 진입할 수 있습니다.
가장 먼저 시작하기로 하셨던 웹브라우저 대시보드 UI 화면 설계를 위해, 실시간 차트와 **생체·드로잉·문자열 3탭 로그인** UI가 포함될 HTML/JS 뼈대 소스 코드를 먼저 작성해 볼까요? 원하시는 진행 방향을 말씀해 주세요!

## 🗺️ Cloudflare 개발자 플랫폼 전반적 상황 (역할 분담)

Cloudflare의 서비스들은 마치 레고 블록 같아서, 필요한 기능별로 조합하여 하나의 거대한 IoT 시스템을 만듭니다.

       [ 웹 브라우저 ]  ◀=== (실시간 제어) ===▶ [ Workers + Durable Objects ] ◀=== (실시간) ===▶ [ ESP32 (3~4대) ]
              │                                          │                                          │
    (과거 데이터 조회)                            (로그 및 데이터 저장)                    (OTA: Presigned URL만)
              ▼                                          ▼                                          ▼
       [ Cloudflare D1 ] ◀───────────────────────────────┘                         [ R2 Private — Public 금지 ]
    (서버리스 데이터베이스)                                              Workers가 15분 Presigned URL 발급 → ESP32 GET

## 1. Cloudflare Workers (두뇌 🧠)

- 상황 및 역할: 모든 시스템의 중심이 되는 서버리스 백엔드 코드입니다.
- 쉽게 말해: ESP32가 보낸 데이터를 받고, 웹 브라우저·텔레그램 요청을 처리하는 중간 관리자입니다. **3종 인증·JWT**, WebSocket 게이트, R2 Presigned URL, Workers AI, **`scheduled()` Cron** 을 담당합니다.

## 2. Durable Objects (실시간 소통방 💬)

- 상황 및 역할: Workers 안에서 작동하는 '상태 유지' 컴포넌트입니다.
- 쉽게 말해: 앞서 대화방(ROOM1)이라고 표현했던 기술입니다. ESP32와 브라우저가 계속 연결(웹소켓)을 유지하면서 1초 미만의 실시간 양방향 통신을 할 수 있게 해주는 핵심 중계기입니다.
- **인증 게이트**: WebSocket 업그레이드는 **JWT(5분)** 검증 후에만 Durable Object로 전달됩니다. JWT는 생체·드로잉·문자열 중 하나로 발급받습니다.

## 3. Cloudflare D1 (기록장 📅) — 이미 사용해 보신 것!

- 상황 및 역할: SQL 문법을 사용하는 초경량·고성능 데이터베이스입니다.
- 쉽게 말해: 웹소켓 대화방은 메시지가 지나가면 사라집니다. 하지만 "1호기 온도가 어제 낮 3시에 몇 도였지?" 같은 과거 이력을 누적 저장하고 싶을 때 D1에 저장합니다. Workers 코드가 웹소켓으로 메시지를 받을 때 D1에 동시에 INSERT 문으로 기록하면 됩니다.

## 4. Cloudflare R2 (창고 📦)

- 상황 및 역할: AWS S3와 완전히 똑같은 형태의 **Private** 객체 저장소입니다.
- 쉽게 말해: ESP32 펌웨어 `.bin`을 보관하지만, **버킷을 Public으로 열지 않습니다.** OTA 시 Workers가 **Presigned URL(서명된 임시 GET 링크, 예: 15분)** 을 만들어 WebSocket으로 ESP32에만 넘기고, ESP32는 그 URL로 HTTPS 다운로드 후 SHA-256 검증·플래시합니다. 영구 공개 URL은 존재하지 않습니다.

---

## 💰 전반적인 비용 상황 (무료 플랜 기준)

D1을 써보셔서 아시겠지만, Cloudflare는 무료 혜택이 상상을 초월합니다. 기기 3~4대 규모라면 평생 돈 낼 일이 없습니다.

- Workers / Durable Objects: 하루 10만 번 호출 무료 (기기 4대가 온도 변화 때만 보내면 하루 수천 번도 안 씀)
- D1 (데이터베이스): 하루 읽기 500만 번 / 쓰기 50만 번 무료, 총용량 5GB 무료 (개인 IoT용으로는 무한에 가까운 용량)
- R2 (스토리지): 매월 파일 저장 10GB 무료, 다운로드 트래픽 완전 무제한 무료 (OTA 파일은 커야 1~2MB 수준)
- Workers AI: 무료 플랜 **일일 Neurons·요청 상한** — D1 `ai_usage`·일 50회·키워드 우회로 IoT 자연어 제어에 충분 (상한 도달 시 LLM 비활성, D1/고정 명령만 동작)
- Cron Triggers: Workers 무료 호출에 포함 — `wrangler.toml` cron 2~3개 + 5분 due 스캔이면 개인·소규모 공장 스케줄에 충분

---

## 5. Workers AI (자연어 비서 🗣️)

- 상황 및 역할: Workers 런타임에서 `@cf/...` 모델을 **바인딩**해 호출하는 엣지 LLM입니다.
- 쉽게 말해: "거실 온도 알려줘", "환풍기 꺼줘" 같은 말을 **명령 JSON**으로 바꿉니다. 다만 **실행 권한은 Workers**가 `scope`·화이트리스트로 결정하며, AI는 상태 요약과 허용된 제어만 제안합니다.

---

## 6. Cron Triggers (스케줄러 ⏰)

- 상황 및 역할: Workers에 **시각 기반 자동 실행**을 걸어 주는 Cloudflare 스케줄러입니다. `wrangler.toml`의 cron 표현식이 Edge에서 `scheduled()` 핸들러를 깨웁니다.
- 쉽게 말해: "매일 밤 10시에 전등 끄기", "5분마다 기기 살아 있는지 확인", "자정에 AI 사용량 리셋"을 **라즈베리 파이 cron 없이** Cloudflare만으로 처리합니다. 사용자가 만든 스케줄은 D1 `schedules`에 저장하고, 짧은 주기 Cron이 실행 시각을 맞춥니다.

---

## 🚀 다음 단계로 나아가기

이제 각각의 블록이 무엇인지 이해하셨으니, 이 블록들을 내 Cloudflare 계정에 실제로 생성하고 연동하는 작업을 할 차례입니다.
이 전체 시스템을 내 컴퓨터에서 코딩하고 Cloudflare로 단 한 줄의 명령어로 업로드해 주는 도구가 바로 Wrangler(랭글러) CLI입니다.
D1을 사용해 보셨으니 맛을 보셨을 텐데요, 혹시 D1과 연동하여 실시간 데이터 저장까지 결합된 최종 Workers 소스 코드를 먼저 짜볼까요, 아니면 컴퓨터에서 Wrangler로 프로젝트를 생성하고 세팅하는 과정을 짚어볼까요?

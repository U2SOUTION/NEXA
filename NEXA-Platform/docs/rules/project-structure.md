# NEXA 프로젝트 구조 및 기술 스택

---

## 1. 모노레포 구조

```
NEXA/
├── NEXA-Platform/      # 플랫폼 — Quasar + Vue 3 + TypeScript (프론트) + Express API (server/)
│   ├── src/            # SPA 프론트엔드 (domains / engines / frame / system)
│   ├── server/         # Node.js + Express API (별도 package.json)
│   └── docs/           # 기획·아키텍처 문서 (SSOT)
├── NEXA-Desktop/       # 데스크톱 앱
├── NEXA-Edge/          # 엣지 펌웨어 (ESP32, Raspberry Pi 등) — 플랫폼 Rate Limit·API와 정합 시 `coding-style.md` §4 하단 참고
├── NEXA-App/           # 모바일 앱
└── DEV/                # 개발 도구
```

- **"프로젝트"**: NEXA-Platform, NEXA-Desktop 등을 지칭할 때 사용 (레이어 사용 금지)

### src/ 디렉터리 구조 (변경 금지)

```
src/
├── domains/    # 도메인별 기능 — 각 도메인은 독립적 모듈 (nexion, admin, ais, parts, board 등)
├── engines/    # 재사용 엔진 — 차트, 블록, 에디터 등 도메인 횡단 컴포넌트
├── frame/      # 앱 프레임 — MainLayout, 라우터, 도메인 레지스트리
└── system/     # 전역 공유 — store, composables, components, config, css
```

- 이 4개 디렉터리 구조는 **변경하지 않는다**
- **`system/` 수정 시 특별 주의**: 모든 도메인이 의존하는 전역 코드이므로, 수정 전 영향 범위를 반드시 확인하고 승인 후 진행
- **의존 방향**: `domains/` → `system/`, `engines/` (단방향). `system/`이 특정 `domains/`를 참조하지 않는다

### server/ 디렉터리 (NEXA-Platform API)

> 프론트 `src/`와 **별도 패키지** (`server/package.json`). REST·파일·DB 접근은 여기서 처리한다.

```
server/
├── server.ts           # 엔트리
├── routes/             # 횡단·공통 라우트 (auth, health, files 등)
├── domains/            # 도메인별 라우트·컨트롤러·서비스 (*.service.ts = 도메인 비즈니스)
├── services/           # 플랫폼 전역 인프라 서비스 (큐·알림 등, 도메인 비특정) — 도입 시 생성
├── middleware/         # 인증·디바이스 토큰 등
├── config/             # DB, Redis, 업로드, 인증 설정
├── utils/              # 공용 유틸
└── types/              # Express 확장·공통 타입
```

- **`domains/*/*.service.ts` vs `services/`**: 도메인 업무 로직은 **`domains/<이름>/`** 아래 `*.service.ts`에 둔다. 여러 도메인이 공유하는 **인프라 성격**(작업 큐 클라이언트 등)은 **`server/services/`** 에 둔다 (`coding-style.md` §3「작업 큐」).
- **역할 분리**: API·비즈니스 로직·DB 쿼리는 `server/`에 두고, `src/`에는 UI·클라이언트 상태만 둔다
- **환경 변수**: `NEXA-Platform/.env`를 `loadEnv.ts`로 로드. 비밀·연결 정보는 코드에 하드코딩하지 않는다
- **실행 전제**: Postgres 등 의존 서비스 기동 후 서버 실행 (`server/README.md` 참조)
- **검증·보안**: 요청/응답 경계에서 Zod 검증, `anchor_id`·`path_id` 기반 문서 접근 (`coding-style.md` Backend와 정합)
- **HTTP 레이트 리밋**: 기획 문서에 **`express-rate-limit` 패키지명은 없으나**, **Rate Limiting(처리율 제한)** 은 다수 문서에서 요구된다. **BullMQ(Redis)** 와는 별개 — 전자는 **HTTP 요청 입구** 완화, 후자는 **비동기 작업 큐**. Express에서는 **`express-rate-limit`** 을 구현 후보로 두고, 스토어는 단일 인스턴스(메모리) vs 다중 인스턴스(**Redis** 연동, 기술 가이드의 Rate Limit·캐시 전략과 정합)로 선택한다. **정책·수치·예외(Fast-Track 등)** 는 아래 **주제·접두어**로 `docs/`에서 탐색한다(파일명은 변경될 수 있으므로 **문서 인덱스·용어집** 진입점을 병행).
  - **`@ GLOSSARY` 계열 — 기술 스택 통합**: Rate Limiting 정의, Redis 연동 흐름, **Fast-Track** 개념
  - **`AUTH` 접두 — 인증·계정 RFC**: IP·사용자·디바이스별 한도, **api_usage**·tier, Rate limit 수치 절
  - **`__NEXA` / Capability·Tier 규격**: 발급 **요청 속도 제한**, 대량 발급 방어
  - **`SYS ARCH` / `NOD` 계열 — ESP32·디바이스 등록**: 등록 API 등 **Rate Limit 필수** 구간
  - **`SYS INF` — MQTT 인프라**: pending·프로비저닝 등 **Rate limiting 수치 예시**
  - **`_KNOWLEDGE` SPEC / CRUD·필드 명세**: API 키·한도·**throttle_rationale** 계열 필드

---

## 2. 핵심 기술 스택

> npm 패키지·인프라·문서상 계획 스택의 **전체 큐레이션·주의사항**은 `stack-and-dependencies.md`를 본다.

| 계층                 | 기술                                     | 비고                                                                                                                   |
| :------------------- | :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Frontend**         | Quasar 2 + Vue 3 + TypeScript            | SPA, `--nexa-*` CSS 변수 전용                                                                                          |
| **Backend**          | Node.js + Express (`server/`)            | REST API. NestJS는 별도 도입 시 문서 갱신                                                                              |
| **HTTP 레이트 리밋** | express-rate-limit (+ Redis 스토어 선택) | BullMQ와 무관(미들웨어). **Rate Limit 정책**은 §1 `server/` 불릿의 주제·접두어로 기획 문서 탐색. 라이브러리명은 구현체 |
| **DB**               | PostgreSQL + PG-Vector                   | `nexa_identities`, `nexa_system_capabilities`, `nexa_knowledge_traceability_paths`                                     |
| **실시간**           | Yjs + Hocuspocus                         | CRDT 기반 협업 편집                                                                                                    |
| **작업 큐**          | BullMQ (Redis)                           | 우선순위 스케줄링, 자가 회복 재시도                                                                                    |
| **파일 감시**        | Chokidar                                 | Doc Sync Crawler의 변경 감지 엔진                                                                                      |
| **스키마 검증**      | Zod                                      | N-MAP 패킷·IR 데이터 형식 무결성                                                                                       |
| **AI 양자화**        | TurboQuant (Google)                      | data-oblivious 벡터 양자화, 프라이버시 친화                                                                            |
| **병렬 연산**        | OpenCL                                   | GPU/FPGA/CPU 병렬 벡터 검색 가속                                                                                       |
| **에이전트**         | OpenClaw (MIT)                           | Adapter를 스킬로 구현, 로컬 우선 실행                                                                                  |
| **Edge**             | ESP32 + ESPHome                          | 나노 센티널, MQTT 통신                                                                                                 |
| **시각화**           | Vue Flow + NIXIE                         | 캔버스 + 비언어적 서사 시각화                                                                                          |

---

## 3. SCSS 아키텍처

```
src/css/
├── quasar.variables.scss   # Quasar 오버라이드 (SCSS 변수)
├── utils/                  # Mixin, 함수, 유틸리티
├── app.scss                # 전역 기본 스타일
├── themes/                 # 테마 색상 변수 (CSS 변수)
└── nexa-system/            # NEXA 전역 스타일
```

---

## 4. 문서 위치

- **기획·아키텍처 문서**: `NEXA-Platform/docs/` (현재 SSOT)
- **하위 구조**: `docs/NEXA Nexion/` (Nexion 도메인), `docs/database/` (DB), `docs/AI/` (AI 사양)
- **문서 네이밍**: `docs/` 루트 **`@` 접두 GLOSSARY 네이밍 규약** 문서 참조(정확한 파일명은 문서 인덱스에서 확인)
- **규칙 문서**: `docs/rules/` (본 파일 포함)

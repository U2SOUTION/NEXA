# NEXA 기술 스택 및 외부 의존성 (Stack & Dependencies)

> **목적**: 실제 설치 의존성(`package.json`)과 기획 문서에서 거론된 스택을 한곳에 정리하고, **사용 방향·주의·혼동 방지**를 명시한다.  
> **상세 SSOT**: 설치 방식·도메인별 배치·장문 표는 `docs/` 루트 **기술 스택 통합 가이드** (`@ GLOSSARY` 계열, 정확한 파일명은 문서 인덱스에서 확인)를 우선한다. 본 파일은 **룰(행동 제약)** 중심이다.

---

## 1. 확정 코어 (프레임워크·런타임)

| 기술 | 출처 | NEXA에서의 방향 | 주의 |
| :--- | :--- | :--- | :--- |
| **Vue 3** | `package.json` | SPA UI 기반 | Composition API 권장 |
| **Quasar 2** | `package.json` | UI·레이아웃·Quasar 컴포넌트 | 테마 색상은 `--nexa-*`만 (`coding-style.md`) |
| **TypeScript** | 양쪽 `package.json` | 프론트·서버 공통 | `any` 금지 (`coding-style.md`, `testing.md`) |
| **Vite** | `@quasar/app-vite` | 빌드·HMR | 직접 설정 변경 시 Quasar 호환성 확인 |
| **Node.js** | `engines` | ^18~^28 | 팀 기준 버전 통일 |
| **Express 4** | `server/package.json` | REST API (`server/`) | NestJS 등 다른 프레임워크는 **도입 시 본 표·가이드 갱신** |
| **tsx** | `server` dev | 서버 TS 실행·watch | 프로덕션은 `tsx server.ts` 스크립트 기준 |

---

## 2. Zod 버전 이원화 (필수 인지)

| 위치 | 대략 버전 | 주의 |
| :--- | :--- | :--- |
| **프론트** (`NEXA-Platform/package.json`) | ^4.x | 서버와 **메이저 불일치** — 스키마 공유 시 API·DTO는 별도 검증 또는 공용 패키지로 통합 검토 |
| **서버** (`server/package.json`) | ^3.x | 프론트와 동일 파일에서 `z` API 혼용 금지 |

- **원칙**: 경계(API 페이로드)에서 각 측이 자신의 Zod로 검증. 공용 스키마 패키지 도입 시 버전 통일이 전제.

---

## 3. 프론트엔드 — 주요 npm 의존성 (역할·주의)

| 그룹 | 패키지(예) | 역할 | 주의 |
| :--- | :--- | :--- | :--- |
| **상태** | `pinia` | 전역·도메인 스토어 | `system/`·`domains/` 스토어 패턴 유지 |
| **검증** | `zod` | 런타임 스키마·타입 추론 | `testing.md`, 서버 Zod와 버전 분리 |
| **플로우·그래프** | `@vue-flow/core`, `dagre` | Nexion 등 노드·엣지 UI | 운영 규약은 문서 인덱스 Nexion UIUX |
| **에디터** | `@tiptap/*`, `codemirror`, `monaco-editor` | 리치 텍스트·코드 편집 | 번들 크기·lazy load 고려 |
| **시각화** | `d3`, `mermaid` | 차트·다이어그램 | DOM/CSS 규칙은 `coding-style.md` 준수 |
| **문서·보내기** | `jspdf`, `xlsx`, `mammoth` | PDF·엑셀·워드 | 사용자 데이터 취급 시 보안·용량 |
| **기타 UI** | `splitpanes`, `vue3-grid-layout-next`, `vuedraggable`, `qrcode` | 레이아웃·드래그 | Quasar 기본 간격 클래스 금지 |

---

## 4. 시각화 및 애니메이션 (NIXIE·닉시)

> NIXIE(비언어적 서사·상태 시각화) 설계와 정합. **런타임 패키지 도입 여부는 구현 단계에 따라 본 절·§3를 갱신**한다.

| 기술 | 용도 | 주의 |
| :--- | :--- | :--- |
| **Rive** | 닉시 **표정·비언어적 서사** 등 인터랙티브 벡터 애니메이션 | Web/런타임 통합 시 번들·성능·에디터 파이프라인 정의 |
| **Shader (GLSL)** | 닉시 캔버스 **Lumina(발광)·Jitter(떨림)** 등 GPU 연산 | **COLD / WARM / HOT** 하드웨어 프로필에 맞춘 품질·프레임 예산 분기 |
| **Web Audio API** (선택) | 비언어적 상태 전달, **모스(Morse) 리듬** 등 오디오 기반 연출 | 브라우저 자동 재생 정책·사용자 동의와 정합 |

---

## 5. 서버 — 주요 npm 의존성 (역할·주의)

| 그룹 | 패키지 | 역할 | 주의 |
| :--- | :--- | :--- | :--- |
| **HTTP** | `express`, `cors` | API·CORS | `doc_anchor` / `path_id` 기반 접근 (`coding-style.md`) |
| **Rate limit** | `express-rate-limit` (도입 시) | HTTP 처리율 제한 | 기획의 Rate Limiting 요구와 정합 — 탐색 기준은 **`project-structure.md` §1 `server/`** 불릿(접두어·주제). BullMQ와 무관 |
| **DB** | `pg` | PostgreSQL | 스키마 변경은 DDL SSOT·`workflow.md` COMPLEX |
| **캐시** | `ioredis` | Redis 클라이언트 | 연결 정보는 `.env`, 코드에 비밀 금지 |
| **인증** | `passport`, `passport-jwt`, `passport-local`, `jsonwebtoken`, `bcryptjs` | 로그인·JWT | 보안 이슈 시 `AUTH` 계열 문서 우선 |
| **업로드** | `multer` | 멀티파트 | 경로·용량·타입은 `config`·명세와 정합 |
| **AI 스트리밍** | `ai` (**Vercel AI SDK**) | `generateText` / `streamText` 등 | Ollama 연동은 현재 **`ollama-ai-provider-v2`** (`server/package.json`)가 브리지 역할 |
| **AI 공급자** | — | Ollama 외 공급자 추가 시 | Vercel AI SDK는 통상 `@ai-sdk/*` 계열 provider 패턴; **별도 `ollama-js` 등을 쓸지는 도입 시 확정 후 본 표·`package.json`에 반영** |
| **유틸** | `dotenv`, `uuid`, `csv-parse`, `zod` | 환경·식별자·CSV·검증 | `loadEnv`는 루트 `.env` 기준 (`server/README.md`) |

---

## 6. 인프라·통신·DB 확장 (문서·docker 기준)

다음은 **기획·운영 문서**에 반복 등장한다. 로컬은 `docker-dev-compose.yml` 등으로 맞춘다.

| 기술 | 용도 | 주의 |
| :--- | :--- | :--- |
| **PostgreSQL** | 주 DB | 기동 후 API 기동 (`server/README.md`) |
| **pgvector / JSONB / RLS** | 벡터·반정형·행 단위 보안 | DDL 명세·`_KNOWLEDGE`·`database/` 문서 |
| **pg_uuidv7** (확장) | **UUID v7**을 DB·서버에서 일관된 PK로 쓰기 위한 확장 | `projects`, identities, paths 등 PK 정책과 DDL SSOT 정합 |
| **pgcrypto** (확장) | `project_secrets` 등 **외부 자격 증명 암호화 저장** | 명세서 요구 시 적용·키 관리(HSM/KMS 등)는 운영 문서와 정합 |
| **Redis** | 세션·캐시·큐(설계상) | `REDIS_URL` 등 `.env` |
| **MQTT** (Mosquitto/Aedes 등) | 디바이스 메시징 | `SYS INF MQTT Infrastructure` — **일반 NFS와 혼동하지 말 것** |
| **Docker / Compose** | Postgres·브로커 등 | 볼륨·포트 팀 공유 |
| **Cloudflare Tunnel** | 외부 노출·wss 경유 | MQTT over WebSocket 등 가이드와 정합 |

---

## 7. 문서에 거론되나, 코드/의존성과 단계가 다를 수 있는 항목

> 아래는 **아키텍처 방향**으로 문서에 있으나, 루트 `package.json`에 없거나 “검토/계획”인 경우가 많다. 구현 시 본 절을 갱신한다.

| 기술 | 기능 | 역할 | 문서·규칙에서의 위치 | 코드 반영 시 확인 |
| :--- | :--- | :--- | :--- | :--- |
| **Yjs**, **Hocuspocus** | CRDT 기반 문서 상태 동기화, WebSocket 실시간 전송 | 에디터·캔버스 협업 편집, 충돌 없는 동시 편집 백엔드 | 용어집, 오케스트레이션·협업 기획 | 패키지·버전·Hocuspocus 배치 명시 |
| **BullMQ** | Redis 기반 작업 큐, 지연·우선순위·재시도 | 크롤링·인덱싱·비동기 파이프라인 스케줄링 | 큐·우선순위 설계 | **호출은 `coding-style.md` §3「작업 큐」공통 인터페이스만.** Redis·워커·실패 정책 문서화. 추후 RabbitMQ·Kafka 등으로 **구현체 교체** 여지 |
| **Chokidar** | 파일시스템 이벤트 감시(생성·수정·삭제·이름 변경) | Doc Sync Crawler의 변경 감지 트리거 | Doc Sync Crawler | `package.json` 반영 시 본 표 갱신 |
| **TurboQuant** | data-oblivious 벡터 양자화(KV·임베딩 압축) | 대규모 임베딩 저장·검색의 메모리·지연 최적화 | NEXA-OS·용어집 | 임베딩 파이프라인 연동 시 §별도 절 또는 SSOT 명시 |
| **OpenCL** | GPU/CPU 병렬 커널 실행 | HEXAGON 프루닝·벡터 연산 등 수치 가속 | 연산 가속 (GPU/CPU) | Khronos·빌드·런타임 타깃(OS/GPU) 파이프라인 |
| **OpenClaw** | 에이전트 런타임, 스킬·멀티 LLM 오케스트레이션 | Adapter·크롤러·Execution Chain 등 자율 워크플로 분해 | 에이전트 런타임 (MIT) | **OpenCL과 철자·역할 혼동 금지** |
| **LangChain** | 체인·RAG·Tool Calling 조합 | AI Orchestrator 구현 후보 중 하나 | 기술 스택 통합 가이드 | 현재 `server/package.json` 없음 — 도입 시 §5·본 표 갱신 |
| **ESPHome** | YAML 선언형 펌웨어 생성·OTA | 나노 센티널·디바이스 정의·센서/액추에이터 바인딩 | NOD·엣지 YAML | 펌웨어·MQTT 토픽·디바이스 레지스트리와 세트 추적 |
| **Ollama** | 로컬 LLM 추론 서버(API) | 프라이버시 우선 추론, 개발·엣지 연동 | 로컬 LLM | `ollama-ai-provider-v2`·호스트·모델 태그와 운영 정합 |
| **TimescaleDB** | 시계열 하이퍼테이블·압축·연속 집계 | 센서·감사·메트릭 등 시계열 전용 저장 | DB 가이드 | DDL 확장·마이그레이션·기존 Postgres 버전 호환 |
| **PgBouncer** | 커넥션 풀링, 트랜잭션/세션 모드 | 다수 IoT·API 동시 접속 시 DB 연결 수 제한 | DB 가이드 | RLS·세션 변수 사용 시 **Session 모드** 등 가이드 준수 |
| **TinyML** (**TensorFlow Lite Micro**) | 초경량 추론 런타임(마이크로컨트롤러) | 나노 센티널에서 반사·KWS·전처리 등 저지연 추론 | 나노 센티널(ESP32) | 펌웨어 플래시·전력·추론 주기 예산 |
| **TensorRT** | NVIDIA 추론 엔진 최적화·INT8/FP16 | Jetson 등에서 영상·SLM 실시간 추론 가속 | 키네틱 컨트롤러(Jetson) | CUDA·TensorRT·드라이버 버전 고정 |
| **Edge Impulse** | 데이터셋·학습·엣지 배포 파이프라인 | 소형 모델 설계 후 TFLM·디바이스 배포 | 엣지 ML 기획 | 보내기 포맷·센서 샘플링과 디바이스 정합 |

---

## 8. 용어·이름 혼동 방지

| 올바른 구분 | 잘못된 혼동 | 메모 |
| :--- | :--- | :--- |
| **N-MAP** — **NEXA Meta Action Protocol** | 일반 "맵"·다른 MAP 약어 | 사람의 의도를 기계 동작으로 잇는 **메타 액션 프로토콜** |
| **Task Packet** (작업 패킷) | 임의 JSON blob | N-MAP 실행 단위로서 **구조·검증(HEXAGON 등)이 정의된 패킷** — 용어집·N-MAP 명세와 정합 |
| **N-PATH** (NEXA Narrative Path) | **NFS** (Network File System) | 네트워크 파일 공유 프로토콜과 별개 |
| **OpenCL** (병렬 연산 API) | **OpenClaw** (에이전트 프레임워크) | 철자·도메인 완전 상이 |
| **사이드바** (UI 개념·코드 네이밍) | **q-drawer** (Quasar 컴포넌트명) | 구현체는 drawer, 호칭은 사이드바 통일 (`coding-style`·`MainLayout` 주석과 정합) |

---

## 9. 유지보수

- **의존성 추가·메이저 업그레이드** 시: 해당 행을 본 파일에 반영하거나, “가이드 SSOT만 유지”를 택할 경우 본 파일 §3·§5에서 **그룹 단위**로만 수정.
- **문서 전용 스택**이 코드에 들어오면: §7을 §3~§6로 승격하고 날짜를 적는다.

**마지막 점검**: `package.json` / `server/package.json` / `docs/` **기술 스택 통합 가이드** (`@ GLOSSARY` 계열)

# NEXA 코딩 표준 (Coding Standards)

---

## 1. 공통 규칙

1. **TypeScript Strict Mode** — `any` 사용 금지, 타입을 정확히 정의할 것
2. **네이밍**:
   - 컴포넌트 파일: PascalCase (`NexionCanvasView.vue`)
   - 일반 파일: kebab-case (`document-manager.ts`)
   - 변수/함수: camelCase (`getUserData()`)
   - 상수: UPPER_SNAKE_CASE (`MAX_ITEMS`)
   - Store: `use` + PascalCase (`useNexionFlowStore()`)
   - localStorage 키: kebab-case (`part-classes-search-history`)
3. **에러 처리**: 모든 API 호출에 try/catch, 실패 시 NEXA 에러 토큰 반환
4. **보안 원칙**: 데이터 주권 우선 — 클라이언트에 물리 경로(`physical_path`) 비노출, 앵커 또는 내부 `path_id` 기준 접근

---

## 2. Frontend (Platform)

### 글로벌 레이아웃 원칙

- **3-Column 구조 고정**: 왼쪽 사이드바(탐색·내비게이션) + 중앙 콘텐츠 + 오른쪽 사이드바(속성·상세)
- 모든 도메인(Nexion, Admin, AIS 등)은 이 구조를 준수하며, 임의로 열 수를 변경하지 않는다
- **오른쪽 사이드바**: 해당 도메인의 속성 편집 UI와 함께, 도메인 전역에서 공유되는 **NEXA 패널**이 배치된다
- **전역 동기화**: 모든 패널(왼쪽·중앙·오른쪽)은 도메인을 넘어 **전역으로 상태가 동기화**되는 통신 구조를 갖는다

### 테마 및 CSS

- **`--nexa-*` CSS 변수만 사용** — Quasar 기본 색상(`primary`, `secondary` 등) 절대 금지
- **폴백(fallback) 금지**: `var(--nexa-xxx, #색상)` 형태 금지 → `var(--nexa-xxx)`만 사용
- 테마 파일: `src/css/themes/dark.scss`, `src/css/themes/light.scss`
- 새 변수 추가 시: 패턴 `--nexa-{category}-{property}`, 양쪽 테마에 모두 추가

### DOM 구조

- **래퍼(wrapper) div 금지** — 99%는 불필요, CSS로 해결
- **`!important` 절대 금지** — DOM 구조를 분석하여 올바른 위치에 스타일 적용
- **`:deep()` 사용 금지** — DOM 구조 요청 후 올바른 접근법 확인
- **임시 방편 CSS 금지** — `margin-left: -10px`, `position: absolute`로 레이아웃 회피 금지

### NEXA 공간 정책

- NEXA는 사이드바·패널 등 **제한된 공간**에서 동작 → 스크롤 최소화 필수
- **한 줄 레이아웃 우선**: `flex-direction: row`, `justify-content: space-between`
- **간격 최소화**: margin/padding 0~4px, gap 0~5px
- **Quasar 기본 간격 클래스 금지**: `q-pa-md`, `q-mb-md` 등 사용하지 않음

---

## 3. Backend

- **API 패턴**: RESTful, 리소스 중심 엔드포인트
- **앵커 기반 접근**: 문서 서빙은 `doc_anchor` 또는 `path_id` 기준, 절대 물리 경로 직접 노출 금지
- **DB 참조**: DB 설계 명세서 (문서 인덱스 §3-C 참조)
- **스키마 검증**: 모든 입출력 페이로드는 Zod 스키마로 검증
- **API 규약**: Nexion API 통신 규약 (문서 인덱스 §3-B 참조)

### 작업 큐 (메시지 큐)

- **직접 호출 금지**: 라우트·서비스·도메인 코드에서 **BullMQ(또는 Redis 큐) API를 직접 import·호출하지 않는다.**
- **공통 인터페이스만 사용**: 큐 적재·지연·우선순위·재시도 등은 **단일 추상 레이어**를 통해서만 수행한다.
- **배치 위치**: 추상 레이어·BullMQ 어댑터 구현은 **`server/services/`** 에 둔다 (예: `queue.service.ts` 또는 `queue/index.ts`). 이 디렉터리는 **큐 도입 시 신규 생성**하며, **`domains/*/*.service.ts`(도메인 비즈니스)** 와 구분한다. (`project-structure.md` `server/` 트리 참조)
- **확장 여지**: 현재는 **BullMQ + Redis**를 전제로 하되, 추후 **RabbitMQ → Kafka** 등 브로커 교체·분산 확장을 고려해 인터페이스 뒤에 구현체만 갈아끼울 수 있게 설계한다. (큐 전용으로만 모을 경우 대안: `server/queue/` — 팀 합의 시 본 규칙·트리에 반영)

---

## 4. Edge / IoT

> 본 절은 **NEXA-Platform** 코드 스타일과 함께, **`NEXA-Edge` 등 펌웨어**를 작성할 때 플랫폼(HTTP Rate Limit·API 오류 등)과 **맞물리도록** 잊지 말아야 할 최소 항목만 적는다. 상세 명세는 NOD·SYS 문서·`NEXA-Edge` 레포를 본다.

- **ESP32 베이스라인**: ESP32 펌웨어 설계 (문서 인덱스 §3-E 참조)
- **MQTT 통신**: MQTT 인프라 설계 (문서 인덱스 §3-E 참조)
- **나노 센티널 역할**: 10~50ms 반사, KWS(키워드 감지), 안전 인터럽트
- **하드웨어 프로파일러**: HW 프로파일러 및 동적 성능 엔진 (문서 인덱스 §3-E 참조)

### 펌웨어·엣지(ESP32, Raspberry Pi 등) — 플랫폼과의 정합

- **지수 백오프 재시도**: 전송 실패 시 1s → 2s → 4s → 8s … 식으로 간격을 늘려 **서버·브로커 과부하·Rate Limit 충돌**을 줄인다.
- **로컬 버퍼링**: 연결 불가 시 로컬에 모았다가 **복구 후 묶음 전송**(배치)·순서·용량 한도는 기기 메모리에 맞게 설계.
- **응답·상태 처리**: HTTP 상태(예: **429**, 5xx), MQTT ACK/NACK 등을 구분해 재시도·드롭·알림 정책을 둔다.

---

## 5. 코드 내 주석 정책

- **금지**: 코드가 이미 설명하는 내용을 반복하는 주석 (`// 변수 선언`, `// 반환` 등)
- **허용**: 비자명한 의도, 트레이드오프, 제약사항을 설명하는 주석
- **TODO 금지**: 코드에 TODO/FIXME를 남기지 않고, 완성된 코드를 작성

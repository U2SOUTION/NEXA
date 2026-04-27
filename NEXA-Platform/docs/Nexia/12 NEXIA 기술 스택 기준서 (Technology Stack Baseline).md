### 12. NEXIA 기술 스택 기준서 (Technology Stack Baseline)

## 12.1 목적과 범위

본 문서는 NEXIA의 현재/확장 스택을 실행 가능한 형태로 정리한다.  
대상은 애플리케이션, AI/로직, 실시간 동기화, 데이터, 인프라, 운영 스택이다.
우주언어 프로토콜의 코어 구조(매트릭스/패킷/프로파일 계층)는 `13 우주언어 프로토콜 개념 정리`를 기준으로 한다.

---

## 12.2 기술 스택 선정 원칙

- 단일 오케스트레이션: 외부 엔진 호출은 중앙 오케스트레이터를 경유한다.
- 모듈형 확장: 탭 증감(프로파일 변경) 시 스택 교체가 쉬워야 한다.
- 실시간 우선: 협업 상태와 신호 흐름은 지연 최소화를 우선한다.
- 관측 가능성: 장애 원인 추적이 가능한 텔레메트리 체계를 기본 포함한다.
- 보안 내재화: 인증/인가/감사/비밀관리 스택을 필수 구성으로 둔다.

---

## 12.3 코어 애플리케이션 스택

| 계층          | 기본 스택                 | 역할                                     |
| ------------- | ------------------------- | ---------------------------------------- |
| Frontend      | Vue 3, Quasar             | Cockpit/탭 UI, 레이아웃, 상태 표현       |
| State/UI      | Pinia, Persist Plugin     | UI 상태, 레이아웃 상태, 사용자 선호 복원 |
| Visual Ops    | NIXIE (Waveform UI Layer) | Cockpit 상태(대기/처리/승인/오류) 실시간 시각화 |
| Collaboration | Yjs                       | 실시간 동시성 제어(CRDT)                 |
| Orchestration | LangGraph.js              | 실행 순서/상태 기반 워크플로우           |
| Logic Runtime | Rivet Core (`rivet-node`) | 추론 그래프 실행, Subgraph 재사용        |
| Backend       | Node.js (TypeScript 권장) | API, 권한 검증, 엔진 라우팅              |
| File Asset    | IndexedDB, OPFS, File System Access API | 브라우저 로컬 파일 캐시/편집/동기화 기반 |

---

## 12.4 외부 엔진 스택

| 엔진    | 역할               | 연동 방식          | 운영 포인트                        |
| ------- | ------------------ | ------------------ | ---------------------------------- |
| Ollama  | LLM 추론/요약/계획 | HTTP REST          | 모델 버전 관리, 응답 검증 가드레일 |
| ComfyUI | 이미지/미디어 생성 | HTTP JSON Workflow | 큐 기반 처리, 고비용 작업 제한     |
| ESPHome | IoT 제어/센서 수집 | MQTT, API          | 장치 격리, 안전 모드 제어          |

---

## 12.5 탭별 권장 스택 매핑 (기본 프로파일: 7개 탭)

| 탭        | 핵심 스택                                    |
| --------- | -------------------------------------------- |
| 0 Cockpit | Quasar, NIXIE, Ollama, Nexnap Stream, Approval Flow |
| 1 Ethos   | Tiptap, Template Engine, Policy Subgraph     |
| 2 Synapse | Rivet, Vue Flow, Yjs                         |
| 3 Glos    | Monaco, Linter/Formatter, Git 연동           |
| 4 Physis  | ComfyUI, Media Pipeline, P5.js, Tone.js, Web Audio API |
| 5 Sense   | ESPHome, Network Graph Engine, Diagnostics Pipeline, Health Check |
| 6 Navis   | File Explorer UI, Network Tree UI, IndexedDB, OPFS, File System Access API, S3(MinIO) 메타 연동 |

---

## 12.6 신호/시계열 확장 스택 (Synapse/Physis 통합)

| 구분     | 기본                   | 확장             |
| -------- | ---------------------- | ---------------- |
| 시각화   | P5.js, GSAP            | Three.js         |
| 오디오   | Tone.js, Web Audio API | 고급 DSP 체인    |
| 스트림   | RxJS                   | Kafka(고부하 시) |
| 신호분석 | FFT.js                 | Math.js, ML 모델 |
| 통신     | MQTT, WebRTC           | Socket 기반 중계 |

- 배치 원칙:
  - Synapse: 신호 해석/라우팅/이상탐지 로직 노드 담당
  - Physis: 파형/음향/시각 출력 및 실시간 표현 담당

---

## 12.7 멀티윈도우 / Document PiP (요약 참조)

- 멀티윈도우: `window.open`, `Screen Details API`, `BroadcastChannel`, `SharedWorker`, `Yjs`
  - 목적: 병렬 작업/공간 확장/레이아웃 복원
- Document PiP: 상시 보조 인터페이스, 메인 종속 생명주기
  - 목적: 빠른 제어/상태 가시성/앰비언트 보조

### 12.7.1 NIXIE 연동 원칙 (고정)

- NIXIE는 Cockpit의 필수 운영 시각화 계층으로 고정한다.
- `activeLayer(GlobalFlow/Crew/Solo)` 전환 이벤트와 상태 이벤트를 실시간 반영해야 한다.
- NIXIE는 장식이 아니라 운영 상태 전달 계층이며, 상태 불일치 시 `degraded`로 표기한다.

상세 규격은 다음 문서를 참조한다.

- `08 멀티윈도우 아키텍처 규격 (Multi-Window Architecture Specification).md`
- `09 Document PiP 운영 규격 (Document Picture-in-Picture Operations Spec).md`
- `10 멀티윈도우 vs Document PiP 선택 가이드 (Decision Matrix).md`

---

## 12.8 보강 추가 스택 (중요 누락 보완)

### 12.8.1 데이터/스토리지

- 관계형 DB: PostgreSQL (트랜잭션/권한/감사)
- 캐시: Redis (세션/임시 상태/큐 보조)
- 객체 저장소: S3 호환 스토리지(미디어/산출물)
- 파일 메타 인덱스: PostgreSQL + S3 Object Metadata(버전/소유자/권한/해시)

### 12.8.1-a 파일 자산 관리(웹 스토리지) 스택

- IndexedDB: 파일 메타/오프라인 캐시/동기화 큐 저장
- OPFS(Origin Private File System): 대용량 로컬 워크 파일 저장
- File System Access API: 사용자 승인 기반 로컬 파일 읽기/쓰기
- Web Streams API: 대용량 파일 업로드/다운로드 스트리밍 처리
- tus(Resumable Upload) 또는 S3 Multipart Upload: 중단 복구 가능한 대용량 전송
- Content Hash(SHA-256) + MIME 검증: 파일 무결성/타입 검증 표준

### 12.8.2 관측성/운영

- 로그: OpenTelemetry + 중앙 로그 수집(예: Loki/ELK)
- 메트릭: Prometheus + Grafana
- 분산 추적: OpenTelemetry Trace + traceId 전파

### 12.8.3 보안/비밀 관리

- 인증: OIDC/OAuth2
- 비밀관리: Vault 계열 또는 클라우드 Secret Manager
- 정책검증: 입력/출력 필터 + 감사 이벤트 파이프라인

### 12.8.4 품질/배포

- CI: 테스트/린트/문서 링크 검증
- CD: 단계 배포(Dev -> Staging -> Prod)
- 기능 플래그: 점진 배포/롤백 제어

---

## 12.9 NFR 기준(스택 관점)

| 항목               | 기준                  |
| ------------------ | --------------------- |
| UI 응답            | P95 150ms 이하        |
| 상태 전파          | 평균 50ms 이하        |
| 엔진 호출 타임아웃 | 기본 10초, 최대 30초  |
| 가용성             | 월 99.9% 이상         |
| 로그 보존          | 감사 180일, 운영 90일 |
| 복구 목표          | RPO 1시간 / RTO 4시간 |

---

## 12.10 단계별 도입 권장

- Phase 1: Vue/Quasar + Node + Rivet + Ollama + Yjs
- Phase 2: Synapse/Physis/Sense 확장(ComfyUI, ESPHome, 스트림 고도화)
- Phase 3: Kafka/관측성/비밀관리/기능 플래그 기반 운영 고도화

---

## 12.11 연계 문서

- `00 인공지능 NEXIA 구조와 기술 스택과 운영방침.md`
- `00 인공지능 NEXIA 구조와 기술 스택과 운영방침.legacy.backup.md`
- `NEXIA 주요 외부 엔진들과 아키텍쳐.md`
- `08 멀티윈도우 아키텍처 규격 (Multi-Window Architecture Specification).md`
- `09 Document PiP 운영 규격 (Document Picture-in-Picture Operations Spec).md`

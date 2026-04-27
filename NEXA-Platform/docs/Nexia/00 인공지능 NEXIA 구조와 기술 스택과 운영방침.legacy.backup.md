# '지식 OS'를 지향하는 플랫폼의 핵심 도메인 NEXA Nexia

이 구조는 인지(Sense)된 데이터를 시간 축(Aionos)에서 분석하고, 관계(Synapse)를 정립하여 규범(Glos)으로 구현하는 지능형 순환 시스템을 지향한다.

---

## NEXA Nexia 통합 레이아웃 구조

### 1) Top Bar (Global Navigation)

- 역할: 범도메인 이동 및 플랫폼 상태 관리
- 기능: 도메인 전환(NEXIA ↔ 타 도메인), 전역 알림, 세션 상태 표시

### 2) Left Drawer (Nexia Intra-Navigator)

- 역할: 도메인 내부 자산/기록 탐색
- 구성:
  - Search: 도메인 통합 검색
  - Projects: 하위 작업 단위 목록
  - Cockpit History: 대화 세션/로그 리스트
  - Assets(Docs/Media): 생성/사용 문서 및 미디어 리스트
- 특징: 닫힘 상태에서 자주 쓰는 항목은 플로팅 바로 노출

### 3) Center Main (Engine Workspace)

- 역할: 실제 작업 및 지휘 실행의 중심 공간
- 기본 프로파일: `7개 탭 = 0 Cockpit + 1~6 전문 탭`
- 확장 원칙: 탭 구조는 Lite/Standard/Extended 프로파일로 증감 가능

### 4) Right Drawer (System Utility)

- 역할: 개인화 설정, 탭별 보조 도구 제어
- 구성: 탭 + 아코디언
- 주요 유틸리티:
  - Agent Intelligence Config
  - Nexnap Pulse Monitor
  - Multimodal Interface
  - Hexagon Semantic Toolkit
  - Cross-Tab Utility

---

## NEXIA 7개 탭 엔진 체계 (기본 프로파일)

| 순서 | 탭 라벨 | 핵심 가치 | 하위 구성 | 주요 도구 | 데이터 성격 | 연계 |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Cockpit | 통합 지휘/커뮤니케이션 | Global Flow, Crew, Solo | Ollama, NIXIE, HEXAGON, Nexnap | 텍스트/이미지/음성/이벤트 | 전 탭 오케스트레이션 |
| 1 | Ethos | 가치/규범 정의 | 정책 문서, 페르소나, 시방서 | Tiptap, Template | 비정형 텍스트, 정책 규칙 | 전 탭의 기준 제공 |
| 2 | Synapse | 사고/관계/추론 설계 | 온톨로지, 워크플로우 로직 | Rivet, Vue Flow, Yjs | 그래프, 상태, 로직 | Sense/Aionos -> Glos/Physis |
| 3 | Glos | 실행 명세화 | 코드 편집, 규칙 변환 | Monaco, Lint 체인 | 코드/정형 텍스트 | Synapse 결과 실행화 |
| 4 | Aionos | 시간축/에너지 흐름 처리 | Vibration, Radiance | RxJS, P5.js, Tone.js, FFT.js, MQTT | 스트림/주파수/시계열 | Sense 신호 분석 -> Synapse |
| 5 | Physis | 실체 발현/미디어 생성 | 시각·청각 현상화 | ComfyUI, 미디어 파이프라인 | 이미지/영상/오디오 | Glos 규칙 결과물 발현 |
| 6 | Sense | 인프라/장치 인지 | IoT/Network, Explorer | ESPHome, FS, 네트워크 구조체 | 장치 상태/권한/토폴로지 | 장치 상태 공급/감시 |

### 해석 규칙

- `0 Cockpit`은 실행 허브, `1~6`은 전문 실행 유닛
- 고위험 작업(IoT 제어/대량 수정/배포)은 Cockpit 승인 게이트 필수
- 탭 증감 시 탭 레지스트리(`tabId`, `capability`, `owner`, `riskLevel`, `status`) 등록 후 활성화

---

## Aionos 확장 스택 (장문 백업 요약)

### Aionos의 역할

Aionos는 Vibration/Radiance 신호를 시간 축에서 분석/가공/표현하는 탭이다.  
단순 재생이 아니라 DSP, 스트림 처리, 시각화, 이상 감지까지 포함한다.

| 구분 | 추천 스택 | 목적 |
| --- | --- | --- |
| 시각화 | P5.js, Three.js, GSAP | 파형/장(場) 표현, 타임라인 제어 |
| 오디오 | Tone.js, Web Audio API | 합성/스케줄링/청각 피드백 |
| 스트림 | RxJS, (확장 시) Kafka | 이벤트 결합/고부하 처리 |
| 신호처리 | FFT.js, Math.js | 주파수 변환/필터링 |
| 통신 | MQTT, WebRTC, Socket | 센서/실시간 데이터 수집 |
| 패턴인식 | TensorFlow.js(옵션) | 이상 징후 감지 |

### GSAP + P5.js 연동 원리

1. GSAP이 입력 신호를 보간해 시각적 튐을 완화  
2. P5.js가 draw 루프에서 상태를 즉시 렌더링  
3. 고부하 단계에서는 JSON Envelope 기반으로 Kafka 전환 포인트를 제공

---

## Cockpit 오케스트레이션 인터페이스

### 내부 계층

| 구분 | 명칭 | 성격 | 기능 |
| --- | --- | --- | --- |
| 관찰 | Global Flow | Read-Only | 전 도메인 흐름 모니터링 |
| 지휘 | NEXIA Crew | Full Control | 탭 조율/복합 실행 |
| 집중 | NEXIA Solo | Deep Dive | 특정 탭/에이전트 1:1 실행 |

### 운영 원칙

- Focus Selector로 Domain Focus/Tab Focus를 전환
- 탭 간 복합 명령은 Crew가 조율, 결과는 탭별 산출물 + 공통 이벤트 로그로 기록
- 상태바/파형/UI 인디케이터로 시스템 활성 상태를 항상 가시화

---

## 심미적 피드백 시스템 (Waveform/NIXIE)

- Listening/Processing/Muted 상태를 색상 + 파형 패턴으로 구분
- 유휴 상태에서는 Ambient 파형 유지, 입력 시 즉시 진폭 확장
- 텍스트 대신 기술 상태 키워드(ANALYZING, SYNTHESIZING 등)로 조종석 감각 강화

---

## 멀티윈도우 동기화 및 핵심 기술 체계

### 목적

단일 탭 제약을 넘는 공간적 멀티태스킹(병렬 편집, 다중 모니터 배치, 작업 흐름 분리)

### 구현

- 창 분리: `window.open` + `Screen Details API`
- 실시간 동기화: `BroadcastChannel`
- 공통 런타임: `SharedWorker`
- 협업 상태: `Yjs`
- UI 상태: `Pinia persisted state`

### 원칙

- Seamless Detachment: UI는 분리되어도 로직은 단일 인스턴스로 유지
- Contextual UI: 활성 탭 맥락에 맞춰 보조 도구 자동 최적화
- Hybrid Automation: AI 생성 + 인간 최종 편집
- Verification by Recording: 실행 이력과 근거를 기록/검증

---

## Yjs + AI Persona 결합

### Yjs

- CRDT 기반 동시성 제어로 멀티윈도우/협업 충돌 최소화
- 문서/코드/그래프 상태를 실시간 병합

### Persona

- 공통 System Context/Subgraph로 일관된 톤앤매너 유지
- 사용자 작업 맥락/선호를 기억하는 방향으로 점진 최적화

---

## 완성도 고도화를 위한 보강 항목 (초기 논의 백업)

1. 보안/권한: 인증·인가·가드레일·감사 체계 수치화  
2. 인프라/확장성: 배포 토폴로지·부하 전략·관측성 강화  
3. 데이터/버전: 백업·복구·형상관리·파기 정책 구체화  
4. UX 포용성: 모바일/접근성/인지부하 관리 강화  
5. 에코시스템: 협업 규칙·플러그인 정책·비용 통제 정의  
6. 예외처리: 오프라인·엔진 오류·센서 장애 대응 Runbook 정립

---

## 실행 기준 부록 (초기형)

| 항목 | 기준값(초안) |
| --- | --- |
| UI 응답 | P95 150ms 이하 |
| 상태 전파 | 평균 50ms 이하 |
| 동시 협업 | 프로젝트당 20세션 이상 |
| 가용성 | 월 99.9% 이상 |
| 백업 | 일 1회 전체 + 1시간 증분 |
| 복구 목표 | RPO 1시간 / RTO 4시간 |

---

## 참고

본 문서는 초기 논의의 장문 맥락을 보존하기 위한 `legacy backup`이다.  
최신 운영 기준은 `00` 및 `01~10` 문서를 우선한다.

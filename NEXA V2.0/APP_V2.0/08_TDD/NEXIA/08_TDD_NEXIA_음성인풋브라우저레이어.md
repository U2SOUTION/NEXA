---
doc_id: TDD-020
title: "음성 인풋 · 브라우저 레이어"
category: "08_TDD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-13
parent_doc: TDD-010
implements_doc: PRD-007
terms_standard: ["whisper", "webrtc", "vad"]
terms_nexa: ["Vivex", "Scribx", "transcribe", "Cockpit"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/whisper", "std/webrtc", "std/vad", "nexa/Vivex", "nexa/Scribx", "nexa/transcribe", "nexa/Cockpit"]
---
# Nexia 음성 인풋 자동화 및 확장 로직

**역할:** Cockpit·7탭 채팅에 **음성 → 텍스트 → (제어어 분기) → 플랫폼 LLM** 경로를 붙이는 **브라우저 음성 레이어**. LLM은 음성을 직접 듣지 않는 **비멀티모달** 전제.

- **STT·VAD·마이크·PiP UI:** 사용자 **브라우저**
- **추론·코드 생성:** **NEXA 플랫폼** (Ollama + 오케스트) — 사용자 PC Ollama **불요**, `localhost:11434` 직접 호출 **금지**
- **TTS(차후):** 플랫폼 API 또는 클라이언트 재생 — §6

> 상위 아키텍처: [`NEXIA 주요 외부 엔진들과 아키텍쳐.md`](./08_TDD_NEXIA_외부엔진및아키텍처.md) · 7탭·가드레일: [`_프로토콜.md`](./08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md)

---

## 1. 위치 (플랫폼 스택 안에서)

```
[마이크] → VAD / Web Speech API (또는 플랫폼 STT API)
    ↓
[음성 레이어]  제어어 판별 · 입력 필드 Append · triggerSend()
    ↓
[Cockpit / 채팅 UI]  Envelope (§3.1)
    ↓ HTTPS
[NEXA 오케스트]  Ethos 가드레일 · 탭 라우팅
    ↓
[Ollama @ 플랫폼]  Qwen·도메인 모델 등
    ↓ (차후)
[TTS] → Tone.js 재생 · 마이크 뮤트 루프 (§6)
```

| 구분 | 위치 | 비고 |
|------|------|------|
| 음성 인식(STT) | 브라우저 Web Speech API (MVP) | Whisper 등은 Phase 2 `POST /api/v1/speech/transcribe` |
| 대화·추론 | 플랫폼 | LangGraph · Ollama |
| 실시간 오디오 피드백 | **Tone.js** (짧은 비프·TTS) | [`AI SOUND 제너레이터.md`](./Generators/08_TDD_NEXIA_AISOUND제네레이터.md)와 동일 철학 |
| 페르소나·파형 | P5.js · 플로팅 바(200×70) | §5 |

**기존 단축키:** `triggerSend()`, `clearInput()` 등이 분리되어 있으면 음성 레이어는 **동일 함수를 호출**만 하면 된다.

---

## 2. 자동화 루프 (4단계)

| 단계 | 동작 |
|------|------|
| **1. VAD 감시** | `simple-vad` 등으로 배경음·목소리 구분. 임계 초과 시 웨이크 워드 확인(Web Speech 등). |
| **2. 연속 모드** | 웨이크 워드 → 내부적으로 **마이크 단축키 누름과 동일** UI 전환 → Continuous STT. |
| **3. 지능형 전송** | 영문 제어어 `Send` 또는 **침묵 N초(예: 2s)** → `triggerSend()`. 전송 후 마이크는 **Pause**(꺼지지 않음). |
| **4. 답변 후 재개** | 스트리밍/응답 **완료 이벤트** → 입력 포커스 + 마이크 **Resume** (웨이크 워드 없이 다음 발화). |

TTS 도입 시 §6의 **Response-to-Listen** 루프로 4단계를 확장한다.

---

## 3. 모듈형 음성 레이어 (Dynamic Command Engine)

LLM(SuperGemma·Qwen 등)은 **텍스트만** 받는다. 음성 레이어가 **명령 vs 일반 문장**을 먼저 분기한다.

### 3.1 제어어 설정

- 사용자 정의: 콤마 구분 (`취소, 다시, 삭제` → 레거시)  
- **권장:** 일상 한국어와 분리를 위해 **영문 토큰** — `Cancel`, `Reset`, `Send`, `Stop`  
- 정규식: `(Cancel|Reset|Send)$` 등 **끝부분 매칭**으로 오인식 감소  
- **전송 키워드도 커스텀** (`보내`, `확인`, `Send` 등)

### 3.2 분기

| STT 결과 | 동작 |
|----------|------|
| 전송 제어어 | `triggerSend()` |
| 취소 제어어 | `clearInput()` / 롤백 |
| 일반 문장 | 입력 필드 **Append** (스트리밍 중간 결과 병합 정책은 UX에 따름) |

### 3.3 플랫폼 전송

```text
triggerSend()
  → Cockpit Envelope (requestId, tabId, actor, payload)
  → POST /api/v1/chat/complete (또는 도메인별 라우트)
  → 오케스트 → Ollama @ 플랫폼
```

브라우저는 **Ollama URL을 알지 않는다.**

---

## 4. 상태 머신

| 상태 | VAD | STT | UI | 비고 |
|------|-----|-----|-----|------|
| **Idle** | Yes | 가벼게 | 옅은 파형 | 웨이크 워드 감시 |
| **Active** | Yes | Full | 실시간 파형·STT 텍스트 | 연속 대화 |
| **Processing** | No | No | THINKING | **마이크 강제 뮤트** (프라이버시) |
| **PrivacyMute** | No | No | 차단 아이콘 | 사용자 명시 뮤트 |

- **Processing** 중 그래프는 **평평(Zero-line)** 또는 비활성 색 — “지금 서버로 안 감”을 시각적으로 보장.
- 아이콘: Listening(펄스) · Muted · Thinking(스피너).

전역 상태 예 (Zustand/Yjs 연동 가능):

```ts
const voiceState = {
  mode: 'IDLE' as 'IDLE' | 'ACTIVE' | 'PROCESSING' | 'PRIVACY_MUTE',
  micLevel: 0,
  master: 'MAIN' as 'MAIN' | 'PIP', // §7
}
```

---

## 5. 이중 피드백 UI

### 5.1 고정 레이어 — 채팅 하단·플로팅 바 (200×70)

- **VAD 파형:** 1px 라인, 소리 있을 때만 움직임 (물리 신호).
- **상태:** `IDLE` / `LISTENING` / `THINKING` + LED (Red 활성, Grey 뮤트).
- 캐릭터가 없어도 **마이크·프라이버시** 확인 가능.

### 5.2 가변 레이어 — P5.js (Nixie / 닉시)

| mode | P5 동작 |
|------|---------|
| IDLE | 최소 호흡·깜빡임 |
| ACTIVE | `amplitude` → 크기·진동 |
| PROCESSING | 회전·색 변화 + **마이크 그래프 숨김/잠금** |
| 제어어 수신 | Send=초록 플래시, Cancel=빨강 플래시 (텍스트 토스트 없이도 가능) |

`nexnapSnapshotStore` 등 **중앙 스토어**에 `mode`, `micLevel`, `isCharacterVisible` 동기화 — P5 `draw()`는 스토어만 구독.

### 5.3 Aionos·Sense 연동 (선택)

- ESPHome·가상 센서 → Yjs → **음성 레이어는 텍스트만**; 파형·Tone.js는 [`AI SOUND`](./Generators/08_TDD_NEXIA_AISOUND제네레이터.md) §10.2와 동일 분리.

---

## 6. TTS · Response-to-Listen (Phase 2)

| 순서 | 동작 |
|------|------|
| 1 | LLM 텍스트 스트림 **완료** |
| 2 | `SpeechRecognition.stop()` / `abort()` — **TTS 전 뮤트** |
| 3 | TTS 재생 (플랫폼 API 또는 Tone.js `Player`) |
| 4 | `onended` → `start()` · 포커스 · **Active** 복귀 |

- **에코 방지:** TTS 중 STT가 자기 목소리를 질문으로 인식하지 않도록 필수.
- **중단:** `Stop` 제어어 → TTS cancel + STT resume (비동기 제어 — Phase 2).
- 접근성: Cancel 시 짧은 **Tone.js 비프** (선택).

후보: OpenAI TTS, ElevenLabs, 플랫폼 로컬 TTS — **완료 이벤트**만 계약에 통일.

---

## 7. Document Picture-in-Picture (브라우저 1레이어)

닉시(Nixie)·P5를 **탭 밖 항상 위**에 두는 전략. 메인 탭이 background여도 PiP가 **활성 창**으로 인식되면 마이크·VAD 유지에 유리.

### 7.1 Master–Slave (Handover)

| 이벤트 | 동작 |
|--------|------|
| PiP **open** | `voiceState.master = 'PIP'` · 메인 VAD/STT **Pause** |
| PiP **close** (`pagehide`) | PiP 루프 종료 · 메인 **Resume** |
| 메인 `visibility === visible` | 큰 채팅 UI 피드백 주, PiP는 보조 애니메이션 |
| 메인 `hidden` | 피드백·STT **중심을 PiP**로 (파형 강조) |

### 7.2 통신

- **BroadcastChannel** `ai_channel`: `MASTER_SWITCH`, STT 텍스트 중계.
- **Ollama/채팅 API 호출:** **메인 탭 한 곳**만 (PiP는 중계). 중복 전송 방지.
- **STT 엔진:** 논리적으로 **하나**만 실행.
- 상태: Zustand + `postMessage` / BroadcastChannel (PiP는 별도 `window`).

```ts
const bc = new BroadcastChannel('ai_channel')
bc.postMessage({ type: 'MASTER_SWITCH', target: 'PIP' })
// PiP: startMicrophoneInPiP() — 메인은 pauseMicrophone()
```

### 7.3 제약

- 메인 탭 **종료** → PiP **즉시 종료** (자식 창). `beforeunload` 경고·**PWA 설치**로 실수 닫기 완화.
- “브라우저를 꺼도 비서 상주” → **2레이어**(Electron/PyQt) 필요 — §8.

---

## 8. 배포 레이어 (3단계)

| 레이어 | 형태 | 음성·UI | LLM |
|--------|------|---------|-----|
| **1. 브라우저** | Next.js/React + PiP | Web Speech·VAD·P5 | **플랫폼 API** |
| **2. PC 앱** | Electron / PyQt Always-on-top | OS급 마이크 점유·Watchdog | 동일 API (세션 공유) |
| **3. 실물 스피커** | RPi / Jetson + 디스플레이 | AEC·전용 마이크 | 플랫폼 또는 엣지 캐시 |

**공통 뇌:** 사용자 PC Ollama가 아니라 **NEXA 플랫폼 Ollama 풀** 하나를 1·2·3이 공유.

| 전환 시점 | 판단 |
|-----------|------|
| PiP + PWA로 충분 | “플랫폼 웹 작업 중만 비서” |
| Electron 검토 | 탭 닫힘·백그라운드 한계·상시 거주형 비서 |

---

## 9. MVP vs Phase 2

| 항목 | MVP | Phase 2 |
|------|-----|---------|
| STT | Web Speech API | 플랫폼 Whisper `transcribe` |
| 트리거 | 단축키 + 웨이크 워드 + 영문 제어어 | VAD 튜닝·다국어 제어어 프로필 |
| 전송 | `Send` / 침묵 2s | LangGraph · Ethos 승인 연동 |
| TTS | 텍스트만 | §6 루프 + Stop 중단 |
| PiP | Handover + BroadcastChannel | Nexnap 1ms 스트림·PIP 버튼 |
| 백그라운드 | Web Worker·무음 오디오 트릭 | Electron |

---

## 10. 보안·프라이버시

- **Processing** 중 VAD/STT off — 대화가 녹음·전송되지 않음을 UI로 표시.
- 음성 원문·STT 로그: 플랫폼 **감사 로그** 정책 (§6 NEXIA 아키텍처).
- 고위험 탭(IoT·대량 수정): Cockpit 승인 후에만 `triggerSend`가 오케스트 진행 ([`_프로토콜.md`](./08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) Ethos Interceptor).

---

## 11. 구현 체크리스트

1. `triggerSend` / `clearInput` 음성 레이어에서 재사용  
2. `voiceState` 상태 머신 + Processing 뮤트  
3. 영문 제어어 Regex + 사용자 커스텀 목록  
4. Cockpit → **플랫폼 chat API** (Ollama 직접 X)  
5. 응답 `onDone` → 포커스 + Resume  
6. (선택) PiP Handover + BroadcastChannel  
7. (Phase 2) TTS 뮤트·Tone.js 피드백  

---

## 12. 관련 문서

| 문서 | 연관 |
|------|------|
| [NEXIA 주요 외부 엔진들과 아키텍쳐.md](./08_TDD_NEXIA_외부엔진및아키텍처.md) | Ollama@플랫폼, Cockpit, §3.1 Envelope |
| [_프로토콜.md](./08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) | Ethos 가드레일, 탭 릴레이 |
| [AI SOUND 제너레이터.md](./Generators/08_TDD_NEXIA_AISOUND제네레이터.md) | Tone.js, P5, 실시간 오디오 |
| [AI 3D 제네레이터.md](./Generators/08_TDD_NEXIA_AI3D제네레이터.md) | Monaco·제너레이터 (음성으로 코드 생성 요청 시 Glos 라우팅) |

---

*구버전: 대화형 조언문·로컬 Ollama·PiP→Ollama 직접 통신 서술은 제거·플랫폼 오케스트 기준으로 통합.*
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| 구현 PRD | [음성·미디어 파이프라인 7탭 (PRD-007)](../../05_PRD/NEXIA/05_PRD_NEXIA_음성미디어파이프라인.md) |
| 음성 자동화 TDD | [음성 인풋 자동화 및 확장 (TDD-021)](./08_TDD_NEXIA_음성인풋자동화및확장.md) |

---
doc_id: TDD-021
title: "음성 인풋 자동화 및 확장"
category: "08_TDD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-10
parent_doc: TDD-010
implements_doc: PRD-007
terms_standard: ["whisper", "tts", "sse"]
terms_nexa: ["Vivex", "STT", "TTS", "agent-graph"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/whisper", "std/tts", "std/sse", "nexa/Vivex", "nexa/STT", "nexa/TTS", "nexa/agent-graph"]
---
# NEXIA · 음성 인풋 자동화 및 확장 (Voice Input Automation)

## 7.1 목적과 범위

본 문서는 NEXIA의 음성 입력 파이프라인을 `웨이크 워드 기반 자동화`와 `연속 대화 루프` 중심으로 표준화한다.  
적용 범위는 Cockpit 입력 인터페이스와 STT/TTS 기능 규격이다.  
PiP 창 생명주기/운영 제어는 `09` 문서에서 관리한다.
우주언어 프로토콜 채널 정의와 패킷 개념은 `13 우주언어 프로토콜 개념 정리`를 따른다.

## 7.2 설계 원칙

- 단일 제어권: STT 엔진 제어권은 한 시점에 하나의 창만 가진다.
- 명령/대화 분리: 시스템 명령어는 대화문과 분리된 토큰 규칙을 사용한다.
- 프라이버시 우선: Listening/Muted/Processing 상태를 사용자에게 명확히 표시한다.
- 복구 가능성: 창 전환/오류/중단 후 즉시 재개 가능한 상태 머신으로 구현한다.

## 7.3 상태 머신 표준

| 상태 | VAD | STT | TTS | 설명 |
| --- | --- | --- | --- | --- |
| Idle | On | Light | Off | 웨이크 워드 대기 |
| Active | On | Full | Off | 연속 음성 입력 처리 |
| Processing | Off | Off | Optional | LLM 응답 생성/검증 |
| Speaking | Off | Off | On | TTS 재생 |
| Pause | On | Light | Off | 응답 후 재대기 |
| PrivacyMute | Off | Off | Off | 사용자 강제 차단 |

## 7.4 음성 자동화 4단계

1. VAD가 음성 에너지를 감지하면 웨이크 워드를 검사한다.  
2. 웨이크 워드 일치 시 Active로 전환하고 입력을 누적한다.  
3. 전송 트리거(명령어 또는 침묵 타임아웃) 발생 시 요청을 전송한다.  
4. 응답 완료 후 Pause로 전환하고 재입력 대기 상태를 유지한다.

## 7.5 명령어 엔진 규칙

- 사용자 정의 명령어는 쉼표 구분 리스트로 등록한다.
- 런타임에서 정규식 패턴으로 컴파일해 음성 끝 토큰 우선 매칭한다.
- 권장 명령어 세트: `Send`, `Cancel`, `Reset`, `Stop`.
- 일반 대화와 충돌 가능한 표현은 명령어 후보에서 제외한다.

## 7.6 STT/TTS 바톤 터치 규칙

- TTS 시작 직전 STT를 `stop/abort` 처리한다.
- TTS 종료 이벤트(`onended`)에서 STT를 `resume`한다.
- "중단" 명령은 TTS 재생 중에도 우선 처리한다.
- 응답 재생 중에는 음성 입력 텍스트 append를 금지한다.

## 7.7 창 연동 인터페이스 규칙 (PiP/멀티윈도우 공통)

- 음성 엔진은 "한 시점 한 Master" 원칙으로 동작한다.
- UI 레이어 상태는 `activeLayer`(`GlobalFlow` | `Crew` | `Solo`)를 공통 키로 사용한다.
- 창 간 제어권 이벤트는 표준 이벤트(`MASTER_SWITCH`, `PRIVACY_MUTE`, `RESUME`, `LAYER_SWITCHED`)를 사용한다.
- 제어권 이벤트 계약/생명주기/폴백 정책은 `09` 문서를 단일 기준으로 따른다.

### 7.7.1 레이어 연동 규칙 (00/11 정합)

- `GlobalFlow`: 읽기 전용 관찰 레이어, 음성 실행 명령 직접 처리 금지.
- `Crew`: 다중 Solo 조율 레이어, 음성 입력을 태스크 분해 후 라우팅.
- `Solo`: 특정 에이전트 직접 실행 레이어, 음성 입력을 해당 에이전트 컨텍스트로 처리.
- 레이어 전환 시(`LAYER_SWITCHED`) 현재 음성 입력 버퍼와 포커스 상태를 보존한다.

### 7.7.2 필수 이벤트 매핑

| 이벤트 | 목적 |
| --- | --- |
| `LAYER_SWITCHED` | GlobalFlow/Crew/Solo 전환 동기화 |
| `MASTER_SWITCH` | 음성 제어권(PiP/메인) 이양 |
| `SOLO_LIST_UPDATED` | Solo 채팅 리스트 변경 반영 |
| `CROSS_DOMAIN_CHAT_ACTIVATED` | 타 도메인 채팅 시작 시 Solo 리스트 연동 |
| `PRIVACY_MUTE` | 전역 음성 차단 |
| `RESUME` | 음성 루프 재개 |

## 7.8 프라이버시 기능 요구사항

- 음성 파이프라인은 상태 신호(`Listening`, `Muted`, `Processing`)를 외부 UI 계층에 제공해야 한다.
- 원문 오디오 저장은 기본 금지, 예외 저장은 명시 동의가 필수다.
- 상태 표시 표준(UI 색상/표기)은 `04` 및 `09` 문서 기준을 따른다.

## 7.9 성능 및 신뢰성 기준

| 항목 | 기준 |
| --- | --- |
| 웨이크 워드 감지 지연 | 평균 300ms 이하 |
| 음성-텍스트 반영 지연 | P95 700ms 이하 |
| 자동 전송 트리거 지연 | 200ms 이하 |
| 세션 지속 성공률 | 99% 이상 |
| 오인식 명령 비율 | 2% 이하 목표 |

## 7.10 예외 처리 (음성 엔진 범위)

- STT 실패: 1회 재시도 후 Idle 복귀 + 사용자 알림.
- 마이크 권한 해제: 즉시 PrivacyMute 전환 + 권한 재요청 안내.
- 중복 전송 감지: requestId 기반 중복 제거.
- 엔진 타임아웃: 텍스트 입력 모드 자동 폴백.
- 창 생명주기 오류(PiP 종료/제어권 충돌)는 `09` 규격의 복구 절차를 따른다.

## 7.11 구현 로드맵

- Phase 1: VAD + 웨이크 워드 + 자동 전송.
- Phase 2: 사용자 커스텀 명령어 + 상태 머신 시각화.
- Phase 3: TTS 바톤 터치 + PiP 제어권 이양.
- Phase 4: 로컬 앱 레이어 확장(Electron/Native Wrapper).

## 7.12 연계 문서

- [`08_TDD_NEXIA_구조기술스택운영방침`](./08_TDD_NEXIA_구조기술스택운영방침.md)
- `04 사용자 경험(UX)의 포용성 및 확장 (Inclusivity & UX Expansion).md`
- `06 예외 상황 처리 (Exception Handling).md`
- `08 멀티윈도우 · Document PiP 통합 규격 및 선택 가이드 (Multi-Window & PiP Specification).md`
- [`08_TDD_NEXIA_외부엔진및아키텍처`](./08_TDD_NEXIA_외부엔진및아키텍처.md)
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| 구현 PRD | [음성·미디어 파이프라인 7탭 (PRD-007)](../../05_PRD/NEXIA/05_PRD_NEXIA_음성미디어파이프라인.md) |
| 음성 브라우저 TDD | [음성 인풋 · 브라우저 레이어 (TDD-020)](./08_TDD_NEXIA_음성인풋브라우저레이어.md) |

---
doc_id: TDD-022
title: "MQTT 토픽 · 데이터 라우팅"
category: "08_TDD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-10
parent_doc: TDD-009
terms_standard: ["mqtt", "websocket", "socket-io"]
terms_nexa: ["MQTT-Broker", "agent-graph", "NEXA-CELL", "edge-device"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/mqtt", "std/websocket", "std/socket-io", "nexa/MQTT-Broker", "nexa/agent-graph", "nexa/NEXA-CELL", "nexa/edge-device"]
---
# NEXIA · MQTT 토픽 및 데이터 라우팅

> **스택 SSOT (To-Be):** `apps/backend`(Nest) · `apps/web`(Next.js) · `apps/agent-graph`(LLM·추론) · MQTT Broker. 브라우저→Ollama 직접 호출 금지.

**연계:** [외부엔진및아키텍처](./08_TDD_NEXIA_외부엔진및아키텍처.md) · [데이터분산처리하이브리드전략](./08_TDD_NEXIA_데이터분산처리하이브리드전략.md) · [NEXA-CELL](./Cells/README.md)

---

## 1. 개요

ESP32·라즈베리 파이 등 IoT 디바이스와 플랫폼이 대규모로 통신할 때, **디바이스 펌웨어는 단순 Pub/Sub**만 수행하고 **라우팅·분기는 MQTT 브로커·서버 구독 레이어**에서 처리한다.

| 계층 | 역할 |
| :--- | :--- |
| **NestJS** (`apps/backend`) | 메인 제어·DB 영구 저장·실시간 브로드캐스트·OTA 명령 발행 |
| **Next.js** (`apps/web`) | 대시보드·Socket.io/WebSocket 수신 |
| **agent-graph** | critical 데이터만 비동기 LLM·이상 감지 추론 (Nest 경유 큐) |
| **MQTT Broker** | 토픽 와일드카드 기반 Pub/Sub 허브 |

---

## 2. 토픽 네이밍 컨벤션

계층형 구조:

```
[Group/Company]/[Location/Factory]/[Device_ID]/[DataType]/[SubTopic]
```

예: `myiot/factory-a/esp32-001/sensor/temperature`

---

## 3. 와일드카드 라우팅

디바이스는 상태(Normal/Critical)에 따라 **토픽 끝자리만 변경**해 발행한다. 서버는 와일드카드 구독으로 처리 주체를 분기한다.

```
[ IoT Device ] ──Publish──► [ MQTT Broker ]
                ┌────────────┴────────────┐
                ▼                         ▼
        [ NestJS ]                 [ agent-graph ]
   myiot/+/+/sensor/#      myiot/+/+/sensor/+/critical
   DB + 실시간 전송              LLM·이상 감지
```

### 3.1 NestJS 구독 레이어

| 항목 | 내용 |
| :--- | :--- |
| 구독 | `myiot/+/+/sensor/#` |
| 처리 | PostgreSQL 영구 저장 · Socket.io/WebSocket으로 `apps/web` 대시보드 브로드캐스트 |

### 3.2 agent-graph 구독 레이어

| 항목 | 내용 |
| :--- | :--- |
| 구독 | `myiot/+/+/sensor/+/critical` |
| 처리 | Nest를 거치지 않고 critical만 수집 → LangGraph·Ollama 비동기 추론 → 결과 PostgreSQL 기록 |

> **To-Be:** 구 Python 단독 에이전트는 `apps/agent-graph`로 통합. 프롬프트 템플릿은 `packages/ai-prompts` 등 모노레포 패키지로 관리.

---

## 4. OTA(무선 업데이트) 제어

### 4.1 Downlink 토픽

```
myiot/[Location/Factory]/[Device_ID]/cmd/ota
```

| 범위 | 토픽 예 |
| :--- | :--- |
| 단일 기기 | `myiot/factory-a/esp32-001/cmd/ota` |
| 공장 일괄 | `myiot/factory-a/+/cmd/ota` (펌웨어가 와일드카드 채널 동시 구독) |

### 4.2 OTA 페이로드 (JSON)

```json
{
  "cmd": "START_OTA",
  "version": "v1.2.0",
  "firmware_url": "https://myplatform.com/firmware/esp32-v1.2.0.bin",
  "checksum": "a1b2c3d4e5f6g7h8..."
}
```

### 4.3 흐름

1. 관리자가 Next.js 대시보드에서 [펌웨어 일괄 배포] 트리거
2. NestJS가 `.bin` 업로드·URL·체크섬 생성
3. 와일드카드 토픽으로 MQTT 발행
4. ESP32/RPi 다운로드·자가 검증·재부팅
5. `.../status` 토픽으로 신버전 보고 → 대시보드 진행률 갱신

---

## 5. 기대 효과

1. **연산 분리:** LLM 추론은 critical 토픽만 `agent-graph`로 — 웹 서버 논블로킹 유지
2. **하드웨어 경량화:** ESP32는 대상 서버를 알 필요 없음 — 토픽 문자열만 발행
3. **확장성:** 와일드카드·Actor 접미사(`/cloud` · `/local`)로 [하이브리드 실행 모드](./08_TDD_NEXIA_데이터분산처리하이브리드전략.md)와 연동

---

## 6. 후속 설계 (TODO)

- agent-graph AI 임무 정의 (센서 로그→자연어 경고, NL IoT 제어 등)
- Ollama 응답 지연 대비 MQTT 응답 토픽 패턴
- `packages/ai-prompts` 프롬프트 템플릿 SSOT
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [IoT·온톨로지·AI 협력 플랫폼 핵심 기술 스택 (TDD-009)](../LangGraph/08_TDD_IoT온톨로지AI협력플랫폼_핵심기술스택_v1.0.md) |
| NEXA-CELL | [CELL · ESP32 베이스라인 디바이스 등록 (TDD-024)](./Cells/08_TDD_NEXIA_CELL_ESP32베이스라인디바이스등록.md) |
| NEXNAP 규약 | [NEXNAP 시스템 인터페이스 표준 규약 (TDD-023)](./08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) |

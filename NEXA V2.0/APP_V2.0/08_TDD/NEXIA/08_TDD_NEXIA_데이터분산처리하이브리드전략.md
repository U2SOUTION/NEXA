---
implements_doc: 
see_also: []
doc_id: TDD-011
title: "데이터 분산 처리 · 하이브리드 전략"
category: "08_TDD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-11
parent_doc: TDD-010
terms_standard: ["webgpu", "mqtt", "ollama", "docker"]
terms_nexa: ["BROWSER_EDGE", "LOCAL_ONPREM", "CLOUD_DEFAULT", "ai_execution_mode"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/webgpu", "std/mqtt", "std/ollama", "std/docker", "nexa/BROWSER_EDGE", "nexa/LOCAL_ONPREM", "nexa/CLOUD_DEFAULT", "nexa/ai_execution_mode"]
---

# NEXIA · 데이터 분산처리 하이브리드 전략

> **Self-hosted Data Flow** — SaaS(클라우드) 와 온프레미스 (로컬) 를 혼합한 **3 단계 AI 실행 모드**.
> **스택 SSOT:** `apps/web`(Next.js) · `apps/backend`(Nest) · `apps/agent-graph` · MQTT · PostgreSQL `devices.ai_execution_mode`

**연계:** [MQTT토픽데이터라우팅](./08_TDD_NEXIA_MQTT토픽데이터라우팅.md) · [외부엔진및아키텍처](./08_TDD_NEXIA_외부엔진및아키텍처.md) · [구조기술스택운영방침](./08_TDD_NEXIA_구조기술스택운영방침.md)

---

## 1. 3 가지 실행 모드

| 모드 | 코드 | 실행 주체 | 용도 |
| :--- | :--- | :--- | :--- |
| **1. 브라우저 Edge** | `BROWSER_EDGE` | 사용자 PC WebGPU · WebLLM | 서버 GPU 비용 0 · 저지연 |
| **2. 로컬 온프레미스** | `LOCAL_ONPREM` | 고객사 Docker·Ollama 에이전트 | B2B·데이터 외부 유출 최소 |
| **3. 클라우드 대행** | `CLOUD_DEFAULT` | Nest + `agent-graph` + 중앙 Ollama | **초기 등록 기본값** |

사용자·기기별로 모드를 전환할 수 있으며, NestJS 는 DB 메타데이터를 보고 **동적 라우팅**한다.

---

## 2. 모드별 동작

### 2.1 브라우저 Edge (`BROWSER_EDGE`)

- **기술:** WebLLM (`@mlc-ai/web-llm`) · ONNX Runtime Web · `navigator.gpu`(WebGPU)
- **흐름:** 센서 데이터를 서버로 보내지 않고 브라우저 Worker 에서 추론 → 결과만 Nest API 로 회수
- **UX:** Opt-in 동의 모달 — 「요금 할인·저지연」 등으로 3 번 사용자 유도

### 2.2 로컬 온프레미스 (`LOCAL_ONPREM`)

- **기술:** Ollama + Docker + MQTT Bridge · JWT/API Key 게이트웨이
- **흐름:** 로컬 에이전트가 MQTT critical 토픽 구독·처리 → 결과만 Nest 에 보고
- **보안:** 로컬 에이전트가 PostgreSQL 에 직접 접속하지 않음 — 허가된 MQTT 채널만 개방

### 2.3 클라우드 대행 (`CLOUD_DEFAULT`)

- **기술:** Nest · Redis/RabbitMQ · `apps/agent-graph` · MQTT
- **흐름:** `.../sensor/critical` 수신 → 큐 → 중앙 Ollama 추론
- **스케일:** K8s KEDA 등으로 큐 깊이에 따른 GPU 오토스케일

---

## 3. 동적 MQTT 토픽 라우팅

Actor 접미사로 분기 ([MQTT SSOT](./08_TDD_NEXIA_MQTT토픽데이터라우팅.md) 와 연동):

| 모드 | 토픽 패턴 예 |
| :--- | :--- |
| 클라우드 (3) | `myiot/+/+/sensor/+/critical/cloud` |
| 로컬 (2) | `myiot/+/+/sensor/+/critical/local` |
| 브라우저 (1) | Nest 가 MQTT 수신 후 WebSocket 으로 대시보드 패스 |

---

## 4. DB · UI · Nest 연동

### 4.1 PostgreSQL `devices`

필수 컬럼: **`ai_execution_mode`**

| 값 | 설명 |
| :--- | :--- |
| `CLOUD_DEFAULT` | 장비 등록 시 **기본값** |
| `BROWSER_EDGE` | 사용자 Opt-in 후 |
| `LOCAL_ONPREM` | B2B·엔터프라이즈 설정 |

### 4.2 Next.js 대시보드

- 기기별 「AI 연산 주체」 스위치
- WebGPU 사양 체크 → 동의 모달 → WebLLM 활성화 (Web Worker)

### 4.3 NestJS 관제탑

장비 부팅·연결 시 `ai_execution_mode` 에 맞는 토픽·라우팅 가이드 하향 전달.

| 모드 | Nest 동작 |
| :--- | :--- |
| 3 번 | 큐 → `agent-graph` |
| 1 번 | WebSocket 으로 로그인 중 브라우저에 패스 |
| 2 번 | 관제만 — 로컬 에이전트가 MQTT 에서 직접 처리 |

---

## 5. 비즈니스·사용자 매핑

| 사용자 유형 | 권장 모드 | 효과 |
| :--- | :--- | :--- |
| 일반·가벼운 사용 | 1 번 브라우저 | 서버 GPU 부하 감소 |
| 기본·즉시 사용 | **3 번 클라우드** | 안정·온보딩 단순 |
| 대기업·공장·보안 민감 | 2 번 로컬 Docker | B2B 옵션·데이터 격리 |

---

## 6. 도입 로드맵 (구현 우선순위)

동시 구현 시 스펙 꼬임 방지 — **단계별 빌드업** 권장.

| Phase | 내용 | 모드 |
| :--- | :--- | :--- |
| **Phase 1** | Nest + PostgreSQL + `agent-graph` + MQTT **전체 뼈대** · `ai_execution_mode` · 공통 JSON/Prisma 규격 | **3 번** |
| **Phase 2** | Docker 로컬 에이전트 · B2B 옵션 상품화 | **2 번** |
| **Phase 3** | Next.js WebLLM · Opt-in UX · GPU 비용 절감 | **1 번** |

> 인프라 안정 (3) → 엔터프라이즈 로컬 (2) → 엣지 비용 절감 (1) 순.

---

## 7. 결론

클라우드 기본 (3 번) 위에 로컬 (2 번)·브라우저 (1 번) 를 옵션으로 얹는 **Tiered Service Model**.
Phase 1 에서는 Nest ↔ `agent-graph` **공통 페이로드 규격**과 `ai_execution_mode` 분기를 먼저 고정한다.
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| 외부 엔진 | [외부 엔진 및 아키텍처 (TDD-019)](./08_TDD_NEXIA_외부엔진및아키텍처.md) |
| 음성 파이프라인 | [음성·미디어 파이프라인 7탭 (PRD-007)](../../05_PRD/NEXIA/05_PRD_NEXIA_음성미디어파이프라인7탭.md) |

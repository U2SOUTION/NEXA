---
doc_id: TDD-017
title: "에코시스템 및 협업 규칙"
category: "08_TDD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-10
parent_doc: TDD-010
terms_standard: ["yjs", "langgraph"]
terms_nexa: ["Omnix", "Twinex", "Normex", "ecosystem"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/yjs", "std/langgraph", "nexa/Omnix", "nexa/Twinex", "nexa/Normex", "nexa/ecosystem"]
---
### 5. 에코시스템 및 협업 세부 규칙 (Ecosystem & Collaboration Details)

## 5.1 목적과 범위

본 문서는 NEXIA `7개 탭` 환경에서 인간-AI-시스템 간 협업 규칙을 표준화한다.

## 5.2 협업 역할 정의

| 주체 | 역할 | 책임 |
| --- | --- | --- |
| 사용자(Pilot) | 최종 의사결정자 | 승인/거부/우선순위 지정 |
| AI Agent | 분석/생성 조력자 | 제안, 자동화, 근거 제공 |
| System Orchestrator | 실행 관리자 | 순서 제어, 상태 일관성 유지 |

## 5.3 협업 모드 규칙

- Global Flow: 읽기 중심 모니터링.
- Crew: 7개 탭 체계 통합 조율.
- Solo: 특정 탭/에이전트 집중 실행.

## 5.4 충돌 해결 정책

- 우선순위: 보안 정책 > 사용자 승인 > 자동화 결과.
- 동시 수정 충돌: Yjs 병합 후 승인자 검토.
- 분쟁 지속 시: Owner 또는 지정 Admin이 최종 결정.

## 5.5 크로스 탭 태스크 표준

- 입력에는 목표, 제약, 승인 수준을 포함한다.
- 실행 결과는 탭별 산출물과 공통 이벤트 로그로 분리 기록한다.
- 고위험 작업은 2단계 승인(요청자 + 승인자) 적용.

## 5.6 확장(Plugin/SDK) 정책

- 플러그인은 권한 스코프 선언이 필수.
- 심사 기준: 보안, 성능, 호환성, 장애 격리.
- 버전 호환 정책: `major` 불일치 시 기본 차단.

## 5.7 비용/리소스 운영

- 프로젝트별 엔진 호출 한도(분/시간/일) 설정.
- 고비용 작업(이미지 생성, 대량 추론)은 큐 + 예산 제한 적용.
- 월간 비용 리포트와 최적화 권고 자동 생성.

## 5.8 KPI

- 협업 충돌 자동 해결률 90% 이상.
- 승인 절차 위반 0건.
- 플러그인 장애 전파율 0% 목표.
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| Yjs 협업 | [Yjs · Hocuspocus 협업 SSOT (TDD-038)](../AI/08_TDD_AI_YjsHocuspocus협업SSOT.md) |
| NEXA-CELL | [NEXA-CELL · ESPHome YAML 제너레이터 및 웹 펌웨어 (PRD-004)](../../05_PRD/NEXIA/05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어.md) |

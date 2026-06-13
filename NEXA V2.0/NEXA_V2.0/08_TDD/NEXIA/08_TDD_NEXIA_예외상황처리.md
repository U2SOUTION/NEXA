---
doc_id: TDD-018
title: "예외 상황 처리"
category: "08_TDD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-10
parent_doc: TDD-010
terms_standard: ["sse"]
terms_nexa: ["Omnix", "ASK", "VOID", "exception-handler"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/sse", "nexa/Omnix", "nexa/ASK", "nexa/VOID", "nexa/exception-handler"]
---
### 6. 예외 상황 처리 (Exception Handling)

## 6.1 목적과 범위

본 문서는 장애 상황에서도 NEXIA `7개 탭`의 연속성과 사용자 조종권을 보장하기 위한 기준을 정의한다.

## 6.2 장애 등급 정의

| 등급 | 기준 | 대응 목표 |
| --- | --- | --- |
| SEV1 | 핵심 기능 중단, 데이터 손실 위험 | 즉시 대응, 4시간 내 복구 |
| SEV2 | 주요 기능 성능 저하/부분 중단 | 30분 내 대응, 당일 복구 |
| SEV3 | 단일 기능 오류/우회 가능 | 영업일 내 수정 |

## 6.3 공통 대응 절차

1. 탐지: 모니터링/사용자 신고/엔진 헬스체크로 이벤트 수집.  
2. 격리: 영향 범위를 탭/프로젝트/엔진 단위로 제한.  
3. 완화: fallback 경로(경량 모델, 읽기 전용, 큐 적재) 적용.  
4. 복구: 데이터 검증 후 서비스 단계적 재개.  
5. 사후: 원인 분석과 재발 방지 항목 등록.

## 6.4 주요 시나리오

- AI 엔진 실패: 재시도(지수 백오프) 후 대체 모델 전환.
- 네트워크 단절: 로컬 캐시 모드 전환, 복구 후 동기화.
- 협업 충돌: Yjs 병합 + 승인자 검토.
- IoT 장치 이탈: 장치 격리, 안전 모드 유지, 대체 경로 제안.

## 6.5 비상 제어권

- Cockpit 긴급 정지(E-Stop)는 언제나 우선 처리.
- 긴급 정지 시 자동화 실행은 중단하고 읽기 전용 모드로 전환.
- 재개는 승인 권한자 확인 후 단계적으로 수행.

## 6.6 복구 검증 기준

- 무결성: 최근 승인 이벤트와 저장 데이터 일치 확인.
- 가용성: 핵심 API/탭 기능 헬스체크 통과.
- 추적성: 장애 이벤트와 조치 내역 감사 로그 기록.

## 6.7 KPI

- MTTR 평균 4시간 이하.
- 장애 재발률(동일 원인) 분기 10% 이하.
- SEV1 대응 SLA 준수율 100% 목표.
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| ASK VOID PRD | [ASK VOID 처리 설계 (PRD-003)](../../05_PRD/NEXIA/05_PRD_NEXIA_ASKVOID처리설계.md) |
| GOVERN | [코일 밸런스 · GOVERN 운영 규범 (TDD-041)](../AI/08_TDD_AI_코일밸런스운영규범GOVERN.md) |

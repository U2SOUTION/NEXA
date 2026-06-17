---
implements_doc: 
see_also: []
doc_id: TDD-012
title: "데이터 생애주기 · 형상 관리"
category: "08_TDD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-13
parent_doc: TDD-010
terms_standard: ["git", "postgresql", "langgraph", "react-flow", "yjs"]
terms_nexa: ["LangGraph", "GraphCanvas", "Logex", "versioning", "lifecycle"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/git", "std/postgresql", "std/langgraph", "std/react-flow", "std/yjs", "nexa/LangGraph", "nexa/GraphCanvas", "nexa/Logex", "nexa/versioning", "nexa/lifecycle"]
---

# 08\_TDD\_NEXIA\_ 데이터생애주기및형상관리
## 3. 데이터 생애주기 및 형상 관리 (Data Lifecycle & Versioning)

# 3.1 목적과 범위

본 문서는 NEXIA 지식 자산 (문서, 코드, LangGraph 워크플로·React Flow 그래프, 스트림 로그) 의 생성 - 변경 - 보존 - 파기 기준을 정의한다.

# 3.2 데이터 분류

| 분류 | 예시 | 저장 위치 | 보호 수준 |
| --- | --- | --- | --- |
| 민감 데이터 | 계정/토큰/장치 키 | 서버 암호화 저장소 | 최고 |
| 운영 데이터 | 프로젝트, Subgraph | 서버 저장소 | 높음 |
| 개인화 데이터 | UI 레이아웃/설정 | 로컬 + 선택적 동기화 | 중간 |
| 임시 데이터 | 세션 캐시/작업 중 산출물 | 메모리/단기 저장 | 낮음 |

# 3.3 버전 관리 원칙

- 코드/문서: Git 브랜치 전략 + PR 리뷰 필수.
- LangGraph 워크플로: **`apps/agent-graph` graph registry** + Yjs `.nxflow` 버전 태깅 (`major.minor.patch`) 적용.
- Subgraph: 카탈로그화하여 릴리즈 노트와 호환 버전 명시.

# 3.4 백업 및 복구

- 전체 백업: 일 1 회.
- 증분 백업: 1 시간 주기.
- 복구 목표: RPO 1 시간, RTO 4 시간.
- 검증: 월 1 회 샘플 복원 테스트 수행.

# 3.5 동시성 및 충돌 해결

- 실시간 협업은 Yjs CRDT 를 표준으로 사용.
- 충돌 시 우선순위: 승인 이벤트 > 최신 유효 이벤트 > 수동 병합.
- 병합 이력은 감사 로그에 자동 기록.

# 3.6 보존/파기 정책

- 감사 로그: 180 일.
- 운영 로그: 90 일.
- 임시 세션 데이터: 7 일 이내 자동 삭제.
- 사용자 삭제 요청 데이터: 법적 기준 내 지체 없이 파기.

# 3.7 KPI

- 데이터 유실 사고 0 건.
- 백업 성공률 99.9% 이상.
- 복원 리허설 성공률 100% 목표.
---

# 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| 데이터 수명 | [데이터 성격 · 수명 주기 (TDD-034)](../AI/08_TDD_AI_데이터성격수명주기.md) |
| Generator 파이프라인 (archived) | [AI 협력 제너레이터 파이프라인 (TDD-028)](./Generators/08_TDD_NEXIA_AI협력제네레이터파이프라인.md) |

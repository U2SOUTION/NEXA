---
doc_id: 
title: ""
category: ""
domain: 
status: draft
created: 2026-06-24
updated: 2026-06-29
parent_doc: 
implements_doc: 
see_also: []
terms_standard: []
terms_nexa: []
---

# LOOP 철학

> 루푸 3 대 절대 규범, 7 대 핵심 아키텍처, 랭그래프 헌법과 철학

---


APP_V2.0/_inbox/루프 엔지니어링 아키텍처 와 E2E 테스트 환경 구축.md


## 루프 엔지니어링 기반 랭그래프 핵심 노드 아키텍처

``` mermaid
graph TD
    %% 1. 파이프라인 시작 및 장부 정의
    Start([1 공장 가동 Push]) --> InitState["2 장부 초기화 State <br> (기획서 과녁 및 3대(Playwright/Supertest/k6)툴 탑재)"]
    InitState --> NodeReader

    %% 2. 핵심 랭그래프 노드군
    subgraph LangGraph_Agent_Core ["apps agent graph <br> 핵심 노드 생태계"]
        NodeReader["Node A: Code Reader <br> (현재 소스코드 파일 시스템 읽기)"] 
        --> NodeTester["Node B: E2E Tester 심장 (Playwright 및 Supertest 물리 구동)"]
        
        NodePromptGen["Node C: Prompt Generator (에러 로그 분석 및 최적화 프롬프트 생성)"] 
        --> NodeCodeFixer["Node D: Code Fixer LLM (새 프롬프트 기반 알고리즘 수정)"]
    end

    %% 3. 조건부 분기선 및 물리적 루프
    NodeTester -->|조건부 분기: 테스트 실패| EdgeFail{"테스트 결과 검사: FAIL"}
    EdgeFail -->|에러 파편 장부 기록| NodePromptGen
    NodeCodeFixer -->|수정 코드 파일 덮어쓰기| NodeTester

    %% 4. 최종 합격 및 PR 종료 (Pull)
    NodeTester -->|조건부 분기: 모든 과녁 통과| EdgePass{"테스트 결과 검사: ALL PASS"}
    EdgePass --> NodePR["Node E: PR Merger (최종 검수 후 메인 시스템 합치기 Pull)"]
    NodePR --> End([3 파이프라인 완료])

    %% 스타일링
    classDef startEnd fill:#333,stroke:#fff,stroke-width:2px,color:#fff;
    classDef coreNode fill:#1f65bc,stroke:#fff,stroke-width:1px,color:#fff;
    classDef heartNode fill:#e11d48,stroke:#fff,stroke-width:2px,color:#fff;
    classDef condition fill:#f59e0b,stroke:#fff,stroke-width:1px,color:#333;
    
    class Start,End startEnd;
    class NodeReader,NodePromptGen,NodeCodeFixer,NodePR coreNode;
    class NodeTester heartNode;
    class EdgeFail,EdgePass condition;
    
```

### 🛡️ 루푸 3 대 절대 규범 (헌법 스펙)

#### 1. 기술 스택 및 도메인 규격 제한 룰

- 내용: AI 가 코드를 고치거나 다음 루프를 위한 지시문을 스스로 창조할 때, 반드시 우리가 정한 핵심 기술 스택 안에서만 해결책을 찾도록 강제합니다.
- 가이드라인: 백엔드는 무조건 `NestJS`, 프론트는 `Next.js`, 실시간 편집은 `Yjs`, 지식 그래프는 `Neo4j` 스펙 안에서만 코드를 짜야 합니다. [ AI 가 엉뚱하게 " 파이썬이나 루비로 서버를 새로 만들자 " 라고 탈선 (환각) 하는 것을 원천 차단합니다.

#### 2. 출력 형식의 초 - 저맥락화 (JSON 포맷 강제) 룰

- 내용: AI 들끼리 다음 루프를 위해 말을 주고받을 때, " 친절하게 설명해 줘 ", " 아래는 수정된 코드입니다 " 같은 인간 중심의 장황한 미사여구를 절대 쓰지 못하게 규격화합니다.
- 가이드라인: 오직 `[1. 에러 발생 파일명]`, `[2. 수정할 코드 라인 번호]`, `[3. 교체할 소스 코드 조각]` 이라는 딱 필요한 3 가지 데이터만 JSON 구조체 형태로 출력하도록 강제합니다. 이 룰 덕분에 대화할 때 발생하는 토큰 비용이 80% 이상 절감됩니다.
#### 3. 부러뜨리기 (검증 조건) 의 과녁 명시 룰

- 내용: AI 가 프롬프트를 만들 때 단순히 " 코드를 더 좋게 고쳐줘 " 라고 모호하게 요청하지 않고, 어떤 시험 문제를 통과해야 하는지 명확한 과녁 (목적지) 을 지시문 맨 위에 박도록 통제합니다.
- 가이드라인: " 이번 루프의 최종 목표는 Playwright E2E 테스트의 [FAIL 조건 2 번: 중복 노드 충돌] 을 패스 (PASS) 하는 것이다 " 라고 명시하게 만듭니다. [5] 코딩 AI 가 목적지를 잃지 않고 NEXA 이 원하는 바로 그 빈틈만 정확하게 저격해서 고치도록 유도합니다.


> **랭그래프의 '2 번 장부 초기화 ' 단계에 박히는 이유**
> 머메이드 다이어그램에서 공장이 가동되자마자 `InitState (장부 초기화)` 노드에 이 3 대 룰이 탑재되는 이유는, 뒤이어 가동될 `Node C (Prompt Generator)` 가 에러를 보고 다음 말을 창조할 때 이 헌법을 먼저 읽고 눈치를 보게 만들기 위함입니다.
> _" 헌법 (3 대 룰) 을 보니 우리는 NestJS/Neo4j 환경이고, 장황한 설명 없이 JSON 으로만 말을 만들어야 하며, 이번 목표는 k6 부하 테스트 통과구나!"_
> 같이 현실에 가까운 방식으로 중계 (라우팅/브로커링) 해 주는 ' 전파 기지국 ' 역할입니다.AI 에게 완벽한 자유를 주는 것이 아니라, " 가장 효율적이고 안전한 테두리 (헌법) 를 인간이 제공하고, 그 안에서의 무한한 자가 치유와 코딩 노가다는 AI 가 수행하게 만드는 " 루프 엔지니어링의 핵심 통제 장치입니다.


---

## 진화된 화이트 박스 에이전트의 7 대 핵심 아키텍처

### 1. 루프 엔지니어링 & 목적 지향 통제 (Loop Engineering & Goal-Driven Control)
- 개념: 단순 일회성 명령이 아닌, Playwright 브라우저 테스트 통과라는 명확한 'Goal(목표 상태)' 을 설정하고, 이를 달성할 때까지 랭그래프 내부에서 스스로 판단하여 무한히 리트라이하는 자율 루프 구조입니다.
### 2. 하네스 엔지니어링 기반 자원 최적화 (Harness-Driven Context Truncation)
- 개념: 로컬 올라마 (Ollama) 의 토큰/메모리 한계를 극복하기 위해, 프로젝트 전체 소스코드 중 현재 에러와 얽힌 의존성 범위만 자르고 압축하는 `Scope Resolver` 를 배치하여 AI 에게 최적의 연장 (도구 및 컨텍스트) 만 쥐여주는 물리 통제 환경입니다.
- 이번 판 (현재 루프) 에 당장 일해야 하는 AI 에게 쥐여줄 **" 연장 (도구) 과 소스코드 파일의 ' 양 (물리적 범위)' 을 자르는 칼 "**입니다.
	- **`harness_constraints.md` (하지 말라는 룰):** 타임아웃 제한, 파일 개수 제한 등 물리적 울타리
	- **`harness_guidelines.md` (하라고 하는 룰):** 5WHY 강제, 전통적 함수 선언 등 논리적 유도선
### 3. GraphRAG 와 온톨로지 기반 사상 정렬 (GraphRAG & Ontological Alignment)
- 개념: 단순 텍스트 검색 (PostgreSQL) 의 한계를 넘어, 개념과 규칙의 위계질서 (Neo4j 지식 그래프) 를 통해 개발자의 사상과 가치관을 AI 의 행동 가드레일 (System/Domain/Custom Rules) 로 강제하는 고난도 정렬 기술입니다.
### 4. 5WHY 인과관계 추론 기반 투명성 확보 (5WHY Root-Cause Explainability)
- 개념: 코드가 블랙박스가 되는 공포를 원천 차단하기 위해, AI 가 수정을 진행하기 전 " 왜?" 라는 질문을 꼬리에 꼬리를 물고 5 번 던져 근본 원인을 파헤치게 만들고 이를 인간이 직관적으로 이해할 수 있는 보고서 형태로 출력하는 화이트 박스 메커니즘입니다.
### 5. 인간 -AI 동반 성장을 위한 환류 인터페이스 (Human-Centric Feedback Symbiosis)
- 개념: 브라우저 UI 에서 인간이 직관적으로 내린 피드백을 Refiner LLM 이 엄격한 규칙 문장으로 가공하여 벡터/그래프 DB 에 환류시킵니다.
- 즉시 적용되는 “헌법/가드레일 (3 대 규칙)”이 바로 프롬프트 생성과 출력 형식, 검증 과녁을 동결시키는 관문이기 때문입니다.
- 이 과정을 통해 시스템의 정밀도가 올라감과 동시에, 개발자 스스로도 고급 아키텍처 사상을 자연스럽게 독학하게 됩니다.
### 6. 멀티포맷 히스토리 아카이브 및 지식 정제 (Multi-Format History Archiving & Knowledge Distillation)
- 개념: 성공과 실패에 상관없이 모든 실행 이력 (5WHY, Code Diff, 규칙 준수 점수) 을 옵시디언 연동형 `.md` 파일 및 정형 로그로 이중 기록합니다.
- 누적된 원시 데이터 (Raw Logs) 를 LLM 이 주기적으로 스캔하여, " 우리 시스템에서 자주 발생하는 에러 패턴과 해결책 " 을 추출한 뒤 온톨로지 지식 그래프 (Neo4j) 의 새로운 간선 (Edge) 정보로 자동 정제 및 동기화하는 데이터 팩토리 엔진입니다.
### 7. 프롬프트 자가 최적화 엔진 (Self-Improving Prompt Optimizer)
- 개념: 시스템이 지속해서 실패 (Retry) 하거나 인간의 피드백이 누적되었을 때, 이를 분석하여 초기 장부 세팅에 탑재되는 시스템/도메인/커스텀 프롬프트 자체를 AI 가 스스로 더 정교하게 리팩토링 (개조) 하는 기능입니다. (예: "Playwright 제어 시 클릭 실패 빈도가 높으니, 프롬프트 3 번 지침에 ' 반드시 waitForSelector 를 선행할 것 ' 이라는 문구를 인젝션하여 최적화하라 " 는 명령을 스스로 수행)
### 비동기 관재탑 엔지 6 번과 7 번 추가가 가져오는 아키텍처적 거대한 반전
기존 시스템이 " 내가 가르치는 대로만 똑똑해지는 아이 " 였다면, 6 번과 7 번이 결합한 현재 시스템은 " 자기가 일기 (리포트/히스토리) 를 쓰다가 깨달음을 얻고 (온톨로지 정제), 스스로 공부법 (프롬프트 옵티마이저) 을 바꾸는 다윈의 진화론적 인공지능 " 이 된 것입니다.
- 6 번 (리포트/히스토리 + 온톨로지 정제) 은 시스템의 ' 기억력과 학습 능력 ' 을 엔터프라이즈급으로 확장해 주며,
- 7 번 (프롬프트 옵티마이저) 은 에이전트의 ' 메타인지 (내가 뭘 모르는지 알고 나를 고치는 능력)' 를 완성해 줍니다.

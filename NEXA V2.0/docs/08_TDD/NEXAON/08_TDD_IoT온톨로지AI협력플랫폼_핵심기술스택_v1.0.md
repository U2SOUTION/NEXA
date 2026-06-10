# IoT · 온톨로지 · AI 협력 플랫폼 — 핵심 기술 스택

> AI 추천 스택의 이상적 설명이 아니라, **실제 도입 시 리스크와 현실적 대안**을 함께 정리한 기술 설계 참고 문서입니다.  
> NEXA V2.0 **08 TDD(기술 설계)** · **04 Decision Log(기술 선택 Why)** 작성 시 근거 자료로 활용합니다.

---

## 목차

1. [4레이어 개요](#1-4레이어-개요)
2. [기술별 상세 — 역할·리스크·대안](#2-기술별-상세--역할리스크대안)
3. [데이터 분리 원칙](#3-데이터-분리-원칙)
4. [온톨로지·그래프 DB 개념 정리](#4-온톨로지그래프-db-개념-정리)
5. [지식 그래프 접근 전략 결정 트리](#5-지식-그래프-접근-전략-결정-트리)
6. [LangGraph 연동 패턴](#6-langgraph-연동-패턴)
7. [SPARQL vs Cypher 하이브리드 전략](#7-sparql-vs-cypher-하이브리드-전략)
8. [통신 규약 계층 (GraphQL · gRPC)](#8-통신-규약-계층-graphql--grpc)
9. [산업·로봇 제어 레이어 (ROS 2)](#9-산업로봇-제어-레이어-ros-2)
10. [전체 아키텍처 파이프라인](#10-전체-아키텍처-파이프라인)
11. [MVP 우선 검증 구간](#11-mvp-우선-검증-구간)
12. [참고 자료](#12-참고-자료)

---

## 1. 4레이어 개요

| 레이어 | 핵심 기술 | 역할 |
| :----- | :-------- | :--- |
| **지식 표현 & 추론** | Neo4j, RDF/OWL, SPARQL, rdflib | 데이터 간 의미·관계 정의, 산업/아트 융합 지식 그래프 추론 |
| **AI 협력 & 에이전트** | LangGraph, LangChain, Milvus/Chroma | 에이전트 협업, 그래프 탐색, 비정형 데이터 하이브리드 검색 |
| **IoT 백엔드** | EMQX, InfluxDB, FastAPI/Go | 대량 기기 실시간 수집, 시계열 고속 저장 |
| **인터랙션 & 프론트** | Flutter, Next.js, Three.js(R3F) | 산업 대시보드, 3D 디지털 트윈·미디어아트, 크로스플랫폼 클라이언트 |

**연동 예시**

```
EMQX(IoT) → InfluxDB(원시 저장)
         → 이벤트 추출 → Neo4j(관계)
         → LangGraph(AI) + 온톨로지 참조 → 분석
         → Three.js(화면) 경고·시각화
```

---

## 2. 기술별 상세 — 역할·리스크·대안

| 구분 | 기술 | 시스템 내 역할 | 치명적 리스크 | 현실적 대안 |
| :--- | :--- | :--- | :--- | :--- |
| 온톨로지 | **Neo4j** | 그래프 DB. 노드·엣지 관계 초고속 조회 | 실시간 IoT 대량 Write 시 병목 | 센서 원시값 미저장. 기기·사용자·개념 **관계만** 저장 |
| 온톨로지 | **RDF/OWL** | 시맨틱 웹 표준. 이기종 데이터 상호운용 | OWL 추론 복잡 시 Reasoner 메모리 과다·다운 | 초기엔 가벼운 커스텀 노드/엣지 규칙. 확장 시 표준 도입 |
| 온톨로지 | **SPARQL** | RDF/OWL 지식 베이스 표준 쿼리 | 숙련 개발자 풀 극히 부족 | FastAPI에서 GraphQL/ORM으로 추상화. 또는 Cypher 전환 |
| AI 협력 | **LangGraph** | 에이전트 워크플로우·상태 제어 | 루프 설계 오류 시 API 비용 무한 청구 | Max Turns 제한, 단계별 Human-in-the-loop 가드레일 |
| AI 협력 | **Milvus** | 벡터 DB. 하이브리드(지식+유사도) 검색 | 클러스터 구축·운영 비용·진입 장벽 | 초기: Chroma, Qdrant, 인메모리 벡터 검색 |
| IoT | **EMQX** | MQTT 브로커. 수만 대 동시 연결 | TLS/클러스터 미설계 시 SPOF | EMQX Cloud 등 매니지드. 대체: Mosquitto, HiveMQ, RabbitMQ |
| IoT | **InfluxDB** | 시계열 DB. 초단위 센서 압축 저장 | 관계 중심 JOIN·복잡 쿼리 불가 | 원시 데이터 보관. **이벤트·상태 변화만** Neo4j로 전송 |
| 인터랙션 | **Three.js / R3F** | 디지털 트윈·미디어아트 3D 렌더링 | 모바일 발열·프레임 드롭 | 시야 밖 오브젝트 렌더 차단. 산업 UI와 아트 UI 컴포넌트 분리 |
| 인터랙션 | **Flutter / Next.js** | 앱·웹 클라이언트 | 3D+대시보드 상태 관리 복잡도 | 도메인별 상태 스토어 분리 |

---

## 3. 데이터 분리 원칙

| 데이터 종류 | 저장소 | 이유 |
| :---------- | :----- | :--- |
| 센서 원시 스트림 (초·밀리초 단위) | **InfluxDB** | 시계열 쓰기·조회 최적화 |
| 기기·사용자·개념·이벤트 **관계** | **Neo4j** | 그래프 탐색·관계 쿼리 |
| 비정형 로그·이미지·사운드 | **벡터 DB** | 유사도·하이브리드 검색 |
| 표준 온톨로지·이기종 연동 지식 | **RDF/OWL + SPARQL** | 외부 시스템 상호운용 |

> **금지**: 센서 원시 데이터를 온톨로지/그래프 DB에 직접 Write → 전체 시스템 병목.

---

## 4. 온톨로지·그래프 DB 개념 정리

### Neo4j와 RDF/OWL의 관계 (오해 교정)

| 항목 | 정확한 이해 |
| :--- | :---------- |
| Neo4j 정체 | **일반 그래프 DB**. 온톨로지 전용 DB가 아님 |
| Neo4j 기본 쿼리 | **Cypher** (태생 쿼리 언어) |
| RDF/OWL·SPARQL | 플러그인·별도 스토어로 **선택적** 지원. AWS Neptune RDF 등 별도 제품도 존재 |
| 실무 권장 | 관계·탐색 중심 → Neo4j+Cypher / 표준·이기종 → RDF/OWL+SPARQL |

### SPARQL 대체·보완 3가지

| 대안 | 설명 | 적합 상황 |
| :--- | :--- | :-------- |
| **① Cypher** | Neo4j 네이티브 쿼리. LLM Text-to-Cypher 성능 우수 | 개발 속도·LLM 연동 우선 |
| **② Microsoft GraphRAG** | 텍스트 → AI가 지식 그래프 자동 구축 | 쿼리 작성 공수 최소화, 비정형 텍스트 대량 |
| **③ Vector DB + KG** | Milvus/Qdrant 내 지식 그래프·벡터 동시 검색 | 복잡 SPARQL 없이 Python API 중심 개발 |

---

## 5. 지식 그래프 접근 전략 결정 트리

```
팀 역량·개발 속도 기준 선택
│
├─ 이기종 표준·이식성 최우선
│   └─ RDF/OWL + SPARQL (정석, 고난이도)
│
├─ 개발 속도·LLM 연동 최우선
│   └─ Neo4j + Cypher (업계 대세)
│
└─ 그래프 설계·쿼리를 AI에 위임
    └─ Microsoft GraphRAG (초기 공수 절감)
```

---

## 6. LangGraph 연동 패턴

### 6-1. Text-to-Cypher (지식 조회 노드)

| 단계 | 처리 내용 |
| :--: | :-------- |
| 1 | 사용자 자연어 질의 수신 |
| 2 | LLM에 Neo4j 스키마 + "Cypher로 변환" 지시 |
| 3 | 생성된 Cypher 실행 → Neo4j 조회 |
| 4 | 결과를 답변 생성 노드로 전달 |

**예시**

```cypher
MATCH (f:Factory {name: "공장A"})-[:DISPLAYS]->(a:MediaArt)
RETURN a.title
```

**Cypher를 LLM에 맡기는 이유**

- 주요 LLM이 Cypher 학습 데이터가 풍부 → SPARQL 대비 생성 성공률 높음
- `-[:관계]->` 화살표 문법이 직관적

**리스크·가드레일**

| 리스크 | 대응 |
| :----- | :--- |
| 쿼리 환각(문법 오류) | Neo4j 에러 → LLM에 피드백 → Self-Correction 루프 |
| 무한 루프·비용 폭증 | Max Turns, 타임아웃, Human-in-the-loop |

### 6-2. 템플릿 기반 Tool Calling (권장 — 상용 수준)

LLM에게 쿼리 **전체 생성**을 맡기면(Text-to-Query) 환각·에러가 발생합니다.  
개발자가 **검증된 쿼리 함수(도구)**를 미리 구현하고, LLM은 **도구 선택 + 파라미터 추출**만 수행합니다.

```python
def check_sensor_value(zone_name: str):
    query = (
        "MATCH (z:Zone {name: $zone})-[:HAS_SENSOR]->(s) "
        "RETURN s.value"
    )
    return neo4j_client.run(query, zone=zone_name)

def get_current_art(zone_name: str):
    query = (
        "MATCH (z:Zone {name: $zone})-[:DISPLAYS]->(a:MediaArt) "
        "RETURN a.title"
    )
    return neo4j_client.run(query, zone=zone_name)
```

| 방식 | LLM 역할 | 에러율 |
| :--- | :------- | :----- |
| Text-to-Query | 쿼리 전체 생성 | 중~높음 |
| Tool Calling | 함수 선택 + `zone_name` 등 파라미터만 | **0%에 수렴** |

> 파라미터는 반드시 바인딩(`$zone`) 사용. f-string 직접 삽입은 SQL Injection과 동일한 위험.

---

## 7. SPARQL vs Cypher 하이브리드 전략

템플릿 가드레일 적용 시 LLM 환각 오류는 양쪽 모두 최소화됩니다.  
**DB 물리적 성능·비즈니스 로직 특성**에 따라 선택이 갈립니다.

| 질의 유형 | 우세 기술 | 예시 | 이유 |
| :-------- | :-------- | :--- | :--- |
| 논리 추론·관계 결합 | **SPARQL** | "위험 상태 공장 장비와 연관 아트 작품 전체" | OWL Reasoner가 사전 추론. 복잡 IF-THEN을 쿼리에 안 넣어도 됨 |
| 실시간·대량 단순 조회 | **Cypher** | "공장A 3번 센서 1시간 평균·위치" | Index-free Adjacency. 실시간 Read/Write 물리적 우위 |
| 센서 시계열 통계 | **InfluxDB** | 구간 평균·최대·최소 | 그래프 DB가 아닌 시계열 전용 조회 |

### 하이브리드 권장 배치

| 영역 | 기술 | 대상 데이터 |
| :--- | :--- | :---------- |
| 상위 개념·규칙·추론 | RDF/OWL + **SPARQL 템플릿** | 기기 규격, 예술 장르 관계, 사용자 맥락 |
| 실시간·빠른 탐색 | Neo4j + **Cypher 템플릿** | IoT 상태, 이용 패턴, 화면용 관계 구조 |

### MVP 우선순위 가이드

| MVP 초점 | 권장 중심 |
| :------- | :-------- |
| 기기–아트–일상 **논리 관계** 정립 | SPARQL·온톨로지 |
| 다수 IoT **실시간 안정 표시** | Cypher·InfluxDB·EMQX |

---

## 8. 통신 규약 계층 (GraphQL · gRPC)

### 계층 구분

| 계층 | 기술 | 비유 |
| :--- | :--- | :--- |
| 전송 | HTTP, MQTT, DDS(ROS 2 내부) | 도로·트럭 규격 |
| 앱 API | **GraphQL**, REST | 트럭에 실리는 포장·주문서 규약 |
| 고속 바이너리 | **gRPC** (Protocol Buffers + HTTP/2) | 압축 무전 |
| DB 내부 | Cypher, SPARQL | 저장소 내부 검색 언어 |

### API 규약 비교

| 규약 | 특징 | 적합 용도 |
| :--- | :--- | :-------- |
| REST | URL 중심, 규격 느슨 | 단순 CRUD, 레거시 연동 |
| **GraphQL** | 클라이언트가 필드 지정, 엄격 스펙 | 앱·웹 ↔ 백엔드. 필요한 데이터만 요청 |
| **gRPC** | 바이너리·스트리밍·저지연 | 로봇↔클라우드, 디지털 트윈 실시간 동기화 |

### 아키텍처 내 배치

1. **이종 시스템 통합** → RDF/OWL + SPARQL (글로벌 표준)
2. **단일 시스템 앱↔서버** → GraphQL (HTTP 위)
3. **서버 내부 그래프 조회** → Cypher (Neo4j)
4. **로봇↔클라우드 실시간** → gRPC (ROS 2 DDS 한계 보완)

---

## 9. 산업·로봇 제어 레이어 (ROS 2)

### ROS 2 (Robot Operating System 2)

- 로봇 모터 제어, 센서 수집, 내비게이션 등을 패키지 단위로 조립하는 **로봇 프레임워크**
- **ros2_control**: 관절·바퀴 속도를 ms 단위 피드백 루프로 제어

### gRPC가 필요한 이유

| ROS 2 DDS | 한계 |
| :-------- | :--- |
| 로봇 내부 부품 통신 | 적합 |
| 클라우드·웹·AI 서버 장거리 통신 | 호환성·지연 문제 |

| gRPC | 장점 |
| :--- | :--- |
| Protocol Buffers 바이너리 | JSON 대비 대역폭·지연 절감 |
| HTTP/2 스트리밍 | 로봇 관절 데이터 → 디지털 트윈(Three.js) 실시간 동기화 |

> HTTP/MQTT만으로 로봇 실시간 제어·디지털 트윈 동기화 시 지연으로 **물리 사고** 가능 → 산업 레이어는 gRPC 필수 검토.

---

## 10. 전체 아키텍처 파이프라인

```
┌─────────────────────────────────────────────────────────────┐
│  [거시 레이어] LangGraph (AI 에이전트)                        │
│       │ SPARQL/Cypher 템플릿 (Tool Calling)                  │
│       ▼                                                      │
│  RDF/OWL 온톨로지  ◄──►  Neo4j (관계)  ◄──►  Milvus/Chroma   │
└─────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────┐
│  [미시 레이어] FastAPI / Go 백엔드                            │
│       │ Cypher → Neo4j / InfluxDB 조회                       │
│       │ GraphQL → Flutter / Next.js / Three.js (디지털 트윈) │
│       ▲ gRPC (초저지연 스트리밍)                              │
│  ROS 2 / ros2_control                                        │
│       ▲                                                      │
│  물리 세계: 로봇 · 공장 센서 · EMQX(MQTT) → InfluxDB          │
└─────────────────────────────────────────────────────────────┘
```

| 레이어 | 담당 기술 | 책임 |
| :----- | :-------- | :--- |
| 물리·현장 | ROS 2, EMQX, InfluxDB | 실시간 제어·수집·시계열 저장 |
| 미시 (단일 시스템) | gRPC, Cypher, GraphQL, Neo4j | 고속 연동·내부 조회·앱 전달 |
| 거시 (이종·AI) | LangGraph, SPARQL, RDF/OWL | 지식 추론·외부 시스템 통합·에이전트 통제 |

---

## 11. MVP 우선 검증 구간

| 구간 | 내용 | 검증 목표 |
| :--: | :--- | :-------- |
| **A** | ROS 2 → gRPC → Three.js 디지털 트윈 | 하드웨어–화면 실시간 연동 |
| **B** | Neo4j 데이터 → LangGraph 쿼리 템플릿 | 지능형 백엔드·Tool Calling |
| **C** | EMQX → InfluxDB → 이벤트 → Neo4j | IoT 파이프라인·데이터 분리 |
| **D** | PRD KPI → Analytics 이벤트 (06번 문서) | 지표 측정 가능 여부 |

---

## 12. 참고 자료

| 주제 | 링크 |
| :--- | :--- |
| Neo4j + RDF/Turtle 임포트 | https://junhyunny.github.io/ai/ai-agent/ontology/context/context-engineering/import-tutle-file-into-neo4j-browser/ |
| 온톨로지 vs 그래프 DB 차이 | https://kr.linkedin.com/pulse/actual-differences-between-ontologies-graph-databases-nicolas-figay-wtlde?tl=ko |
| LLM Text-to-Knowledge Graph | https://medium.com/@nuatmochoi/llm%EC%9C%BC%EB%A1%9C-text-to-knowledge-graph-98b97884d539 |
| GraphQL over HTTP | https://graphql-kr.github.io/learn/serving-over-http/ |
| GraphQL vs REST | https://blog.logto.io/ko/graphql-and-rest-api |
| ros2_control | https://control.ros.org |
| ROS 2 개요 | https://wikidocs.net/265252 |
| gRPC 기술 검토 | https://medium.com/hatiolab/grpc-%EA%B8%B0%EC%88%A0-%EA%B2%80%ED%86%A0-9d91f2175393 |
| ROS 2 + gRPC 연동 | https://zzziito.tistory.com/97 |

---

*문서 유형: NEXA V2.0 기술 스택 참고 (TDD·Decision Log 연동)*

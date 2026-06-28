---
doc_id: TDD-NAMING-STD
title: "NEXA 네이밍 표준 v2.0"
category: "SSOT"
domain: NEXAOS
status: published
created: 2026-06-24
updated: 2026-06-24
parent_doc: TDD-001
see_also: [TDD-070, TDD-071, TDD-001, TDD-038, TDD-056]
related_terms:
  - "용어집_NEXA전용_v2.0 1 1.md"
  - "doc_id_레지스트리.md"
tags:
  - "doc/cat/ssot"
  - "doc/domain/nexaos"
  - "std/naming"
  - "std/ontology"
---

# NEXA 네이밍 표준 v2.0 (Naming Convention Standard)

> **한 줄:** **`TAG`** = 사람이 읽는 이름 · **`CODE`** = 시스템 식별자 (불변).
> **NEXA** 전체 코드·데이터·UI·온톨로지에 **통일된 4-tier 명명 규칙**을 적용하기 위한 **SSOT 명세**.
> 본 문서는 **원칙·정책·거버넌스**를 다룬다. **개별 용어의 정의·등록**은 [`용어집_NEXA전용_v2.0 1 1.md`](용어집_NEXA전용_v2.0%201%201.md) §4~§5를 따른다.

---

## §1. 적용 범위 (Scope)

### 1.1 대상
- **모노레포 전체** (`NEXA-Platform/` · `NEXA-Desktop/` · `NEXA-App/` · `NEXA-Edge/`)
- **모든 언어·런타임** (TypeScript, Python, YAML, SQL, Rust …)
- **데이터·온톨로지** (Neo4j · pgvector · Zod · SHACL)
- **외부 인터페이스** (REST · GraphQL · MQTT · WebSocket)

### 1.2 비대상
- **자유 메모** (`_inbox/`) — 보존
- **외부 표준 인용** (RFC, W3C) — 본 문서보다 우선

### 1.3 SSOT 위계

| SSOT | 담당 | 본 문서 관계 |
|:---|:---|:---|
| [`용어집_NEXA전용_v2.0`](용어집_NEXA전용_v2.0%201%201.md) | 용어 등록·정의 | 본 문서가 **정책·거버넌스** 담당 |
| [`doc_id_레지스트리`](doc_id_레지스트리.md) | TDD 문서 ID | 본 문서가 **명명 규칙** 담당 |
| 본 문서 | **명명 정책·확장·자동화** | - |

---

## §2. 4-tier 명명 원칙 (요약)

> **상세**: [`용어집_NEXA전용_v2.0 1 1.md` §1, §4](용어집_NEXA전용_v2.0%201%201.md)

| # | 위계 | 코드 | 표기법 | 적용 대상 | 예시 |
|:---:|:---|:---:|:---|:---|:---|
| **L0** | **플랫폼 표준** | `PLAT` | `FULL_UPPER` / `UPPER_SNAKE` | 최상위 브랜드·전사 프로토콜·공용 규약 | `NEXA`, `NEXNAP`, `CSIM`, `PT_0`, `CT_1`, `AL_1` |
| **L1** | **제품 및 컴포넌트** | `PROD` | `TitleCase` | 데이터 원자·UI 컴포넌트·제품 모듈·클래스명 | `Omnix`, `Nexaon`, `MainShell`, `MentonLayer` |
| **L2** | **시스템 ID** | `SYSID` | `lower_snake` | 도메인키·URL·파일 확장자·API 경로·모노레포 폴더 | `nexia`, `domain_key`, `.nxchat`, `agent_graph` |
| **L3** | **내부 코드 변수** | `INTVAR` | `camelCase` | 런타임 변수·함수 인자·지역 상수·훅 식별자 | `useLayoutStore`, `drawerDefaults`, `onChange` |

### 2.1 코드 표기 결정 규칙 (L0 세분화)

| 패턴 | 표기 | 예시 |
|:---|:---|:---|
| 1~2자 약어 | `FULL_UPPER` | `NEXA`, `CSIM`, `AXON` |
| 2자 이상 + 번호 | `UPPER_SNAKE` | `PT_0`, `CT_1`, `AL_1`, `ML_0` |

### 2.2 위계 ↔ 시스템 사용

| 티어 | 시스템 사용처 |
|:---|:---|
| **L0** | Zod 스키마 (브랜드), 마크다운 §헤더, 패키지 이름 일부 |
| **L1** | TypeScript `class`/`type`/`interface`, React 컴포넌트, 모듈 export |
| **L2** | URL 경로, SQL 컬럼, JSON 키, ENV 변수 접두사 |
| **L3** | 함수 인자, 로컬 변수, Zustand 슬라이스 키 |

---

## §3. TAG ↔ CODE 직교

> **상세**: [`용어집_NEXA전용_v2.0 1 1.md` §컬럼 채움 규칙](용어집_NEXA전용_v2.0%201%201.md)

| 구분 | 의미 | 시스템 사용 | 변경 가능성 |
|:---|:---|:---|:---:|
| **TAG** | 사람이 읽기 좋은 이름 | Obsidian 백링크, UI 라벨, 검색 | ⚠️ 약간 변경 가능 |
| **CODE** | 시스템 식별자 (불변) | Zod, TypeScript Enum, E-0 룰 검증, DB FK | ❌ 절대 불변 |

### 3.1 직교 규칙
- **TAG ≠ CODE**: 한쪽이 다른 쪽의 형식을 빌려오지 않음
- **TAG가 자연어 형태(공백·하이픈)**여도 CODE는 `lower_snake`/`UPPER_SNAKE` 등 **시스템 표기법** 따름
- **CODE가 약어**여도 TAG는 **풀네임 자연어** 권장

### 3.2 예시

| TAG | CODE | 의미 |
|:---|:---|:---|
| `Omnix Chat` | `nx_chat` | 채팅·세션 산출물 |
| `Normex Policy` | `nx_pol` | 규범·정책 산출물 |
| `PT0 Edge Cold` | `PT_0` | 말단 COLD 피지컬 티어 |
| `ML1 Presence` | `ML_1` | NIXIE Presence 멘톤 층 |

### 3.3 LABEL · DOMAIN 보조

| 구분 | 의미 | 예시 |
|:---|:---|:---|
| **LABEL** | UI/소통용 짧은 표기 | "옴닉스", "멘톤 레이어 1" |
| **DOMAIN** | 도메인 키 (L2 SYSID 일부) | `nexia`, `nexabo`, `ontex` |

---

## §4. Naming Convention 확장

### 4.1 4대 케이스 (기본)

| 케이스 | 형식 | 주 용도 | 예시 |
|:---|:---|:---|:---|
| **camelCase** | 첫 단어 소문자, 이어지는 단어 대문자 시작 | JS/TS 변수·함수 | `userName`, `drawerDefaults` |
| **PascalCase (TitleCase)** | 모든 단어 대문자 시작 | 클래스·컴포넌트 | `UserName`, `NexaonShell`, `MainShell` |
| **snake_case** | 모두 소문자, 단어 사이 `_` | Python 변수·DB 컬럼 | `user_name`, `domain_key` |
| **kebab-case** | 모두 소문자, 단어 사이 `-` | URL·CSS | `user-name`, `main-button` |

### 4.2 NEXA 매핑

| 케이스 | NEXA 티어 | 강제 여부 |
|:---|:---|:---:|
| camelCase | L3 INTVAR | ✅ E-0 검증 |
| PascalCase / TitleCase | L1 PROD | ✅ E-0 검증 |
| snake_case | L2 SYSID | ✅ E-0 검증 |
| FULL_UPPER / UPPER_SNAKE | L0 PLAT | ✅ E-0 검증 |
| kebab-case | **NEXA 표준 ✗** (L2 일부에서만) | ⚠️ TAG 한정 |

> **kebab-case**는 L2의 일부(파일명, Git 브랜치)에서만 사용. CODE에는 절대 금지.

### 4.3 접두어 규칙 (Prefix)

| 표기 | 의미 | NEXA 사용 |
|:---|:---|:---|
| 헝가리안 표기 | 타입 접두사 (`str`, `i`) | ❌ NEXA 비권장 |
| 상수 표기 (UPPER_SNAKE) | 절대 불변 상수 | ✅ L0 `PLAT` 정책 |
| 헝가리안 변형 | `is_/has_/can_` (불리언) | ✅ L3 `camelCase` boolean |
| 도메인 접두사 | `nx_` (산출물), `nexia/`, `nexabo/` | ✅ L2 `lower_snake` |
| 시스템 접두사 | `audit_` (LOOP 테스트), `use_` (React 훅) | ✅ L3 |

### 4.4 환경별 표기 (확장)

| 환경 | 권장 케이스 | 예시 | 비고 |
|:---|:---|:---|:---|
| **TypeScript 변수** | `camelCase` | `useLayoutStore` | L3 |
| **TypeScript 클래스** | `TitleCase` | `NexaonShell` | L1 |
| **TypeScript Enum** | `TitleCase` (값: `UPPER_SNAKE`) | `enum Tier { PLAT, PROD }` | 혼합 |
| **TypeScript Type alias** | `TitleCase` | `type NexaonRun = ...` | L1 |
| **Python 변수** | `snake_case` | `domain_key`, `user_name` | L3 |
| **Python 클래스** | `TitleCase` | `NexaonOrchestrator` | L1 |
| **Python 모듈** | `snake_case` | `nexaon_orchestrator.py` | L2 |
| **GraphQL 필드** | `camelCase` | `domainKey`, `userName` | L3 |
| **GraphQL 타입** | `TitleCase` | `DomainKey`, `User` | L1 |
| **SQL 테이블** | `snake_case` (단수/복수 정책 결정) | `user`, `run_history` | L2 |
| **SQL 컬럼** | `snake_case` | `user_id`, `created_at` | L3 |
| **DB 인덱스** | `snake_case` (테이블_컬럼 인덱스) | `idx_user_id` | L2 |
| **ENV 변수** | `UPPER_SNAKE` | `NEXA_API_KEY`, `NEXIA_PORT` | L0 |
| **CI/CD 잡** | `kebab-case` | `build-web`, `deploy-edge` | GitHub Actions 표준 |
| **Git 브랜치** | `kebab-case` (정책) | `feat/naming-standard`, `fix/ontex-query` | 정책 정의 |
| **파일명** | `kebab-case` (정책) | `nexaon-shell.tsx` | 일부만 |
| **JSON 키** | `snake_case` (API 계약) | `domain_key`, `user_id` | L2 |
| **URL 경로** | `kebab-case` (RESTful 관용) | `/api/v1/run-history` | L2 |
| **GraphQL Path** | `camelCase` | `/v1/runHistory` | L3 |
| **CSS 클래스** | `kebab-case` (BEM 권장) | `main-shell__header` | 외부 CSS |

### 4.5 마이크로서비스 간 식별자

| 패턴 | 예시 |
|:---|:---|
| 패키지명 | `@nexaos/agent-graph`, `@nexaos/nexaon-shell` |
| npm scope | `nexaos` (단일 scope) |
| 서비스 이름 (k8s) | `nexa-agent-graph`, `nexa-nexaon` |
| 컨테이너 이미지 | `nexaos/agent-graph:1.2.3` |

### 4.6 i18n · 다국어

| 언어 | 형식 | 예시 |
|:---|:---|:---|
| **한글 LABEL_KO** | 자연스러운 한글 | "옴닉스 채팅" |
| **영문 LABEL_EN** | TitleCase | "Omnix Chat" |
| **일본어** | 자연스러운 일본어 | "オムニクスチャット" |
| **중국어** | 자연스러운 중국어 | "全息聊天" |

> **i18n 키** 자체는 L2 `lower_snake` (`omnix_chat.title`)

---

## §5. Ontology 매핑 (RDF / OWL / SHACL)

> **목표**: NEXA 네이밍을 **시맨틱 웹 표준**에 정렬하여, 외부 온톨로지(KG, Linked Open Data)와의 상호운용성 확보.

### 5.1 Class 계층

| NEXA 티어 | RDF/OWL 표현 | 예시 |
|:---|:---|:---|
| **L0 PLAT** | `owl:Class` (브랜드·프로토콜) | `nxa:Platform`, `nxa:Protocol` |
| **L1 PROD** | `rdfs:Class` (제품·컴포넌트) | `nxa:Omnix`, `nxa:Nexaon` |
| **L2 SYSID** | `rdfs:Resource` (식별자) | `nxa:domain_key_value` |
| **L3 INTVAR** | (온톨로지 비대상, 런타임) | - |

### 5.2 Property 매핑

| NEXA 컬럼 | RDF Property | 도메인 | 레인지 |
|:---|:---|:---|:---|
| `tag` | `rdfs:label` | `rdfs:Class` | `rdfs:Literal` |
| `code` | `nxa:code` (custom) | `rdfs:Class` | `xsd:string` |
| `tier` | `nxa:tier` | `rdfs:Class` | `nxa:Tier` (enum) |
| `tier_code` | `nxa:tierCode` | `rdfs:Class` | `nxa:TierCode` (enum) |
| `category` | `nxa:category` | `rdfs:Class` | `nxa:Category` (enum) |
| `definition` | `skos:definition` | `rdfs:Class` | `rdfs:Literal` |
| `not` | `skos:scopeNote` | `rdfs:Class` | `rdfs:Literal` |
| `related` | `skos:related` | `rdfs:Class` | `rdfs:Class` |
| `ssot` | `nxa:sourceDocument` | `rdfs:Class` | `xsd:string` |

### 5.3 SHACL Shape (예시)

```turtle
nxa:TermShape
    a sh:NodeShape ;
    sh:targetClass nxa:Term ;
    sh:property [
        sh:path nxa:code ;
        sh:datatype xsd:string ;
        sh:pattern "^[A-Z][A-Z0-9_]*$|^[a-z][a-z0-9_]*$|^[A-Z][a-zA-Z0-9]*$|^[a-z][a-zA-Z0-9]*$" ;
        sh:message "Code must follow 4-tier casing rules"
    ] ;
    sh:property [
        sh:path nxa:tier ;
        sh:datatype xsd:string ;
        sh:in ( "L0 플랫폼 표준" "L1 제품 및 컴포넌트" "L2 시스템 ID" "L3 내부 코드 변수" )
    ] .
```

### 5.4 Prefix · Namespace

| Prefix | URI | 비고 |
|:---|:---|:---|
| `nxa` | `https://nexaos.dev/ontology#` | NEXA 본체 |
| `skos` | `http://www.w3.org/2004/02/skos/core#` | W3C 표준 |
| `owl` | `http://www.w3.org/2002/07/owl#` | W3C 표준 |
| `rdfs` | `http://www.w3.org/2000/01/rdf-schema#` | W3C 표준 |
| `sh` | `http://www.w3.org/ns/shacl#` | W3C 표준 |

### 5.5 SKOS Concept Scheme 매핑

NEXA 용어집 전체를 **SKOS ConceptScheme**으로 표현 가능:

```turtle
nxa:NexaTermScheme a skos:ConceptScheme ;
    skos:prefLabel "NEXA V2.0 Terminology"@en ;
    dct:created "2026-06-24"^^xsd:date ;
    dct:source <https://nexaos.dev/docs/용어집_NEXA전용_v2.0> .

nxa:Omnix a skos:Concept ;
    skos:inScheme nxa:NexaTermScheme ;
    skos:prefLabel "Omnix"@en ;
    skos:altLabel "옴닉스"@ko ;
    skos:definition "소통·허브·오케스트레이션·승인 중계"@ko ;
    nxa:code "Omnix" ;
    nxa:tier nxa:L1 .
```

### 5.6 온톨로지 진화 전략

| 단계 | 작업 | 도구 |
|:---|:---|:---|
| **1. 추출** | 용어집 → Turtle 자동 변환 | Python (rdflib) |
| **2. 검증** | SHACL Shape 검증 | pyshacl |
| **3. 적재** | Neo4j RDF Store 또는 GraphDB | n10s 플러그인 |
| **4. 조회** | SPARQL Endpoint | Apache Jena Fuseki |
| **5. 진화** | 신규 용어 자동 추가 | GitHub Actions |
| **6. 외부 공개** | Linked Open Data 릴리즈 | schema.org NEXA 확장 |

### 5.7 온톨로지 SSOT 원칙

- **용어집 SSOT** (`용어집_NEXA전용_v2.0 1 1.md`)이 **온톨로지 자동 생성의 원천**
- **자동 변환 스크립트** (`scripts/glossary_to_rdf.py`)가 변경 시 자동 트리거
- **SHACL Shape**이 추가 시 검증 (E-0 룰 검증과 유사)
- **Neo4j 적재**는 **Ontex 도메인** SSOT 영역

---

## §6. 거버넌스 (Governance)

### 6.1 신규 추가 절차

1. **§1 4-tier 표**에서 위계 확정
2. **코드 형식** 결정 (`FULL_UPPER`/`UPPER_SNAKE`/`TitleCase`/`lower_snake`/`camelCase`)
3. **TAG 자연어** 확정
4. **TAG ↔ CODE 직교** 확인
5. **카테고리** enum 매칭 (12개)
6. **SSOT 문서** 결정 (TDD-XX 또는 별도 doc_id)
7. **`not` 컬럼**: 혼동 표현 기재
8. **§4~§5 섹션** 적절한 곳에 신규 행 추가
9. **E-0 룰 검증** 자동 실행
10. **PR 리뷰** 1인 이상 승인

### 6.2 마이그레이션 정책

| 상황 | 처리 |
|:---|:---|
| **TAG 변경 (자연어)** | 허용. CODE 유지. `_deprecated_versions` 기록 |
| **CODE 변경** | **금지**. 새 CODE 발급 후 마이그레이션 단계 거침 |
| **deprecated** | 부록 A (구 UI 라벨) 이동. 최소 1 버전 유지 |
| **삭제** | **금지**. 영구 보관 (컴플라이언스) |

### 6.3 deprecated 처리

```
[T1] deprecate 신호: 부록 A 추가 + CODE에 `_deprecated` suffix (선택)
[T2] 신규 코드 발급: `Omnix_v2` 또는 별개 (충돌 방지)
[T3] 마이그레이션: 코드 변환 매핑표 작성
[T4] 검증: E-0 룰이 두 코드 모두 허용
[T5] 폐기: 부록 A로만 남김 (메인 표 제외)
```

### 6.4 마이그레이션 예시 (과거 → 현재)

| 과거 | 현재 | 비고 |
|:---|:---|:---|
| `T1`/`T2`/`T3` | `CT1`/`CT2`/`CT3` | Cosmic Tier (충돌 방지) |
| `CT3R` | `CT3R` | 변형 표기 — 동일 |
| `PT-0` | `PT_0` | 하이픈 → 언더바 |
| `ML0` | `ML_0` | 붙여씀 → 언더바 |
| `AXON-AL1` | `AL_1` | 계층 prefix 제거 |

---

## §7. 자동화 (Automation)

### 7.1 Lint 규칙

| 도구 | 대상 | 규칙 |
|:---|:---|:---|
| **ESLint** (custom rule) | TypeScript 변수 | `camelCase` 강제 |
| **ESLint** (react/) | React 컴포넌트 | `TitleCase` 강제 |
| **pylint/flake8** | Python 변수 | `snake_case` 강제 |
| **ruff** | Python 모듈 | `snake_case` 강제 |
| **markdownlint** | 마크다운 frontmatter | `terms_nexa` 형식 검증 |

### 7.2 E-0 룰 검증 (LangGraph CI)

> **상세**: [`LOOP 설계도- 랭그래프 CI 파이프라인 설계.md` §5단계 Test Spec](LOOP%20설계도-%20랭그래프%20CI%20파이프라인%20설계.md)

| 코드 | 단계 | 검증 대상 |
|:---|:---|:---|
| `audit_static_patch` | T1 | ESLint/pylint/ruff + custom nxa-naming rule |
| `audit_api_unit` | T2 | Zod 스키마 + nxa:code 검증 |
| `audit_ui_e2e` | T3 | Playwright + UI 컴포넌트명 검증 |
| `audit_load_perf` | T4 | (네이밍과 무관) |
| `audit_nexa_rule` | T5 | **E-0 Rule Validator** — 본 문서 §2~§4 정책 검증 |

### 7.3 Sync 스크립트

| 스크립트 | 입력 | 출력 |
|:---|:---|:---|
| `glossary_to_tags.py` | 용어집 | 모든 TDD frontmatter `terms_nexa` 갱신 |
| `glossary_to_rdf.py` | 용어집 | Turtle RDF, SHACL Shape, Neo4j 적재 |
| `nxa_naming_lint.py` | 모노레포 | 위반 보고서 (PR 코멘트) |
| `validate_codes.py` | 새 PR | CODE 중복·미등록 검증 |

### 7.4 CI 통합

```yaml
# .github/workflows/nxa-naming.yml
name: NEXA Naming Validation
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: python scripts/nxa_naming_lint.py
      - run: python scripts/validate_codes.py
      - run: python scripts/glossary_to_rdf.py --validate-only
```

---

## 부록 A — 구 UI 라벨 (비규범)

> [`TDD-010 부록 B`](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) 동일. **신규 금지.**

| TAG | CODE | TIER | TC(약어) | LABEL_KO | LABEL_EN | CATEGORY | DEFINITION | NOT | ARTIFACT | RELATED | SSOT | NOTES |
|:---|:---|:---|:---:|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| `Cockpit legacy` | Cockpit | L1 제품 및 컴포넌트 | PROD | 콕핏 | Cockpit | legacy | 구 UI 라벨 | | | Omnix | | 부록 A |
| `Ethos legacy` | Ethos | L1 제품 및 컴포넌트 | PROD | 에토스 | Ethos | legacy | 구 UI 라벨 | | | Normex | | 부록 A |
| `Synapse legacy` | Synapse | L1 제품 및 컴포넌트 | PROD | 시넵스 | Synapse | legacy | 구 UI 라벨 | | | Logex | | 부록 A |
| `Glos legacy` | Glos | L1 제품 및 컴포넌트 | PROD | 글로스 | Glos | legacy | 구 UI 라벨 | | | Scribx | | 부록 A |
| `Physis legacy` | Physis | L1 제품 및 컴포넌트 | PROD | 피시스 | Physis | legacy | 구 UI 라벨 | | | Vivex | | 부록 A |
| `Sense legacy` | Sense | L1 제품 및 컴포넌트 | PROD | 센스 | Sense | legacy | 구 UI 라벨 | | | Twinex | | 부록 A |
| `Navis legacy` | Navis | L1 제품 및 컴포넌트 | PROD | 나비스 | Navis | legacy | 구 UI 라벨 | | | Navex | | 부록 A |

---

## 부록 B — 전체 태그 인덱스

확정 문서 frontmatter 기준. 신규 승격 시 `sync_terms_to_tags.py` 재실행.

| SCOPE | COUNT | LOOKUP |
|:---|:---:|:---|
| `terms_standard` | 99+ | [`용어집범용v2.0.md`](용어집_범용_v2.0.md) |
| `terms_nexa` | 219+ | 본 문서 §4 + [`doc_id_레지스트리.md`](doc_id_레지스트리.md) |
| **합계** | **318+** | - |

---

## 부록 C — 상세 서사 (이전 §3.3~3.6 요약 보존)

> **DIEA ↔ Nexaon:** DIEA = 7 Facet 작업면 · Nexaon = Cold Path Distillation 오케스트레이터 (Logex ontology). Facet 산출은 never 직접 promoted — Nexaon·승인·SHACL 경유 ([TDD-071 §2.1.2](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md)).

> **Nixie Reflex vs Nexaon Strategic:** Nixie(ML_1) = Express·알림 · Nexaon(ML_3) = Run·promoted. Run 트리거·Router fan-out **✗**.

> **NEXU · BAX · NIXIE 3층:** Knowledge 페브릭 → 미적 레이아웃 → ML_1 Express. Canvas/BAX **혼용 ✗**.

> **Navex · NISE:** Intelligent = hybrid 검색 · Infra = InfraTree. Omnix discover → `navex_search` tool ([PRD-014](05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md)).

> **혼동 방지 (번호 체계):** ML0~ML3 ≠ PT_0~3 ≠ CT_1~3 ≠ AL_1~7 ≠ UI-L* ≠ NexiaWorkspace L* — **동일 표기 금지**.

---

## 부록 D — 변경 이력 (Changelog)

| 일자 | 버전 | 변경 |
|:---|:---:|:---|
| 2026-06-24 | v2.0 | 분리 독립. §5 온톨로지 매핑 추가. §6 거버넌스·§7 자동화 추가. |
| 이전 | v1.x | `용어집_NEXA전용_v2.0 1 1.md` §1~§5에 통합 |

---

## 부록 E — 참고 문헌

- [RFC 2119 — Key words for use in RFCs](https://www.rfc-editor.org/rfc/rfc2119)
- [W3C SKOS Simple Knowledge Organization System Reference](https://www.w3.org/TR/skos-reference/)
- [W3C SHACL Shapes Constraint Language](https://www.w3.org/TR/shacl/)
- [Google API Design Guide — Naming Conventions](https://cloud.google.com/apis/design/naming_conventions)
- [Microsoft REST API Guidelines — Naming](https://github.com/microsoft/api-guidelines)
- [Schema.org — Extending Schema.org](https://schema.org/docs/extension.html)

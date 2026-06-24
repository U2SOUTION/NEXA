# NEXA V2.0 전용 용어집


NEXA OS는 **유기적 지능 생태계**이다.

1. **피지컬 티어** — **어디서** 연산하나 (PT-0~3)
2. **Menton Layer (ML0~ML3)** — **얼마나 깊게** 사고하나
3. **Axon Layer (AL1~AL7)** — **어떤 규격**으로 신호·의미·실행을 포장하나

- **Core-Engine-Stack (CES)** — 전체 지능을 관통하는 **중앙 스택/엔진**
- **Physical-Centric-Hierarchy (PCH)** — 물리 티어를 축으로 위계를 **결정**하는 구조
- **Hub-and-Spoke / Cosmic-Layer** — 확장 시 허브-스포크 형태 및 계층화를 **표준**으로 삼는 방식
- **AXON / AXON-Stack-Layer** — 의미·실행을 **신호 계층으로 포장/전달**하는 규격
- **CSIM / APEX / HEXAGON / ACTON** — 계층 간 상호작용과 변환을 담당하는 **컴퓨팅 블록/도메인 구성요소**
- **Environment-Guard / ENVIRON-Shield** — 보안·격리·환경 경계로서의 **방어 계층**
- **Menton Layer**·**Axon Layer**·**Physical-Tier** 간 계층 경계로서의 **신호/의미 전달 규칙** — Contextual-Awareness-Timeline (CAT)
- **Galthon / Kineton / Menton / Nexaon** — 계층을 잇는 이름 규격 및 도메인 라우팅을 담당하는 **연결 구성요소**

---

## 용어집 사용 규칙

### NEXA 네이밍 컨벤션(Naming Convention, 명명 규칙)

- **대문자**를 보면 아키텍트는 `Protocol`이나 `Standard`를 떠올려야 합니다.
- **Title Case**를 보면 UI 개발자는 `Component`나 `Class`를 떠올려야 합니다.
- **소문자**를 보면 개발자는 `url`이나 `db_key`를 떠올려야 합니다.


| #   | 위계 (영역)       | 위계 코드    | 표기법 (Rule)      | 적용 대상                          | 예시                                                       |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L0  | **플랫폼 표준**    | `PLAT`   | **FULL_UPPER**  | 최상위 브랜드·전사 프로토콜·공통 규약          | `NEXA`, `NEXNAP`, `CSIM`, `NEXAVULT`                     |
| L1  | **제품 및 컴포넌트** | `PROD`   | **TitleCase**   | 데이터 원자·UI 컴포넌트·제품 모듈·클래스명      | `Nexel`, `Nexaon`, `Nixie`, `MentonLayer`                |
| L2  | **시스템 ID**    | `SYSID`  | **lower-kebab** | 도메인키·URL·파일 확장자·API 경로·모노레포 폴더 | `nexia`, `nexet`, `domain-key`, `.nxchat`, `agent-graph` |
| L3  | **내부 코드 변수**  | `INTVAR` | **camelCase**   | 런타임 변수·함수 인자·지역 상수·훅 식별자       | `useLayoutStore`, `drawerDefaults`, `onChange`           |


> [!tip] **Note — 4대 위계 단일 표기 원칙**
>
> - **위계(영역)**: **어디에 속한 이름인가** (도메인의 층위) — 사람·조직의 관점
> - **표기법**: **어떻게 쓰는가** (케이스 규칙) — 기계·문법의 관점
> - 두 차원은 직교(orthogonal)합니다. 위계가 같아도 표기법은 통일하고, 위계가 다르면 표기법도 달라야 합니다.
> - 위 4행은 **E-0 룰 검사(Node Rule Validator)** 가 L1 기본 룰로 직접 검증하는 단일 표기입니다.
> - 향후 같은 위계 내에서 다중 변형이 필요해질 경우(예: L2에 **lower_snake** 추가) 같은 위계 코드를 유지한 채 행을 추가합니다.

### NEXA 네이밍 샘플


| 구분        | 용어 (예시)            | 의미적 카테고리   | 아키텍처적 역할                          |
| :--- | :--- | :--- | :--- |
| 표준, 프로토콜  | **NEXA**           | 최상위 브랜드    | 플랫폼 전체를 아우르는 상징적 위계               |
|           | **NEXAOS**         | 시스템 전체 명칭  | 미션크리티컬 설계 계층의 총칭                  |
|           | **NEXNAP**         | 전사 통신 규약   | 시스템 간 데이터 봉투(Envelope) 규약         |
|           | **NEXAON-NETWORK** | 전송 프로토콜    | 엣지-중앙 간 데이터 전송 채널 (AL4)           |
|           | **NEXAVULT**       | 보안 저장소     | Seed 및 벡터 데이터 저장 프로토콜 (AL5)       |
|           | **NEXA-CELL**      | 하드웨어 제품    | 물리적 센서 및 모듈 제품군                   |
| 컴포넌트, 클래스 | **Nexel**          | 데이터 원자     | 시스템의 최소 정보 단위 (Atomic Unit)       |
|           | **Nexaon**         | 제품/오케스트레이터 | 지능형 전략 실행 소프트웨어                   |
|           | **NexaonShell**    | 전용 UI      | 3분할(Explorer/Canvas/Run) 전용 인터페이스 |
|           | **NexiaContent**   | UI 프레임     | 탭바와 워크스페이스를 포함하는 루트 슬롯            |
|           | **NexiaWorkspace** | 작업 영역      | 다중 패널 배치를 지원하는 레이아웃 모듈            |
|           | **NEXU Canvas**    | 시각화 도구     | 온톨로지 및 지식 페브릭 시맨틱 뷰어              |
| 도메인키, url | **nexia**          | 도메인 식별자    | 지능 셸 및 DIEA 호스팅용 `domainKey`      |
|           | **nexabo**         | 도메인 식별자    | IoT 관제 및 텔레메트리용 `domainKey`       |
|           | **nexet**          | 도메인 식별자    | 자산 유통 및 마켓플레이스용 `domainKey`       |


## 용어집 표 스키마 (Normative)

**모든 `terms_nexa` 용어 행**은 아래 **14열**을 사용한다. 해당 없으면 **빈 칸**.


| NO  | COLUMN         | MEANING                                                                                                                                                      |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1   | **tag**        | `terms_nexa` · `nexa/` 태그                                                                                                                                    |
| 2   | **code**       | `domainKey` · `tabId` · `PT-0` 등 런타임 코드                                                                                                                      |
| 3   | **tier**       | **네이밍 위계 (레벨 + 티어명)** — `L0 플랫폼 표준` · `L1 제품 및 컴포넌트` · `L2 시스템 ID` · `L3 내부 코드 변수` (§1 참조). 레벨 번호와 티어명을 결합한 표시. category와 직교 — 같은 category 내에서도 위계가 다를 수 있음. |
| 4   | **tier_code**  | **위계 코드명** (§1 4대 위계 표 참조) — `PLAT` 플랫폼 표준 · `PROD` 소프트웨어 제품 · `SYSID` 시스템 ID · `INTVAR` 내부 코드 변수. tier의 사람이 읽는 명사형 코드.                                      |
| 5   | **label_ko**   | 기획·UI 한글 짧은 이름, 약어는 소리나는데 발음                                                                                                                                 |
| 6   | **label_en**   | 영문 짧은 표기                                                                                                                                                     |
| 7   | **fullname**   | 풀네임·약어 풀어쓰기                                                                                                                                                  |
| 8   | **category**   | `platform` · `domainKey` · `tabId` · `physical-tier` · `menton-layer` · `cosmic-tier` · `axon-layer` · `ui` · `data` · `iot` · `bax` · `legacy`              |
| 9   | **definition** | Normative 한 줄 정의                                                                                                                                             |
| 10  | **not**        | 금지·혼동                                                                                                                                                        |
| 11  | **artifact**   | 산출물·URL·확장자                                                                                                                                                  |
| 12  | **related**    | 연관 tag                                                                                                                                                       |
| 13  | **ssot**       | doc_id 또는 링크                                                                                                                                                 |
| 14  | **notes**      | 별칭·deprecated·보조                                                                                                                                             |


> [!note] **tier ↔ tier_code ↔ category 삼중 직교성**
>
> - `tier` = **네이밍 위계 (레벨 + 티어명)** (예: `L0 플랫폼 표준` — 사람이 읽는 통합 표시)
> - `tier_code` = **위계 코드명** (PLAT/PROD/SYSID/INTVAR — 사람 친화적)
> - `category` = **용어의 주제/도메인** (무엇에 관한 용어인가)
> - 세 차원은 모두 직교. 같은 tier 내에서도 category·tier_code가 다를 수 있음.
> - 예: `NEXA` (category=`platform`, tier=`L0`, tier_code=`PLAT`) · `nexia` (category=`domainKey`, tier=`L2`, tier_code=`SYSID`) · `useLayoutStore` (category=`platform`, tier=`L3`, tier_code=`INTVAR`)

### 스키마 정합성 및 자동 검증 항목


| #   | §1 위계        | §1 표기법          | §1 위계 코드 | §3 `tier`      | §3 `tier_code` | 정합  |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| 1   | L0 플랫폼 표준    | **FULL_UPPER**  | `PLAT`   | `L0 플랫폼 표준`    | `PLAT`         | ✓   |
| 2   | L1 제품 및 컴포넌트 | **TitleCase**   | `PROD`   | `L1 제품 및 컴포넌트` | `PROD`         | ✓   |
| 3   | L2 시스템 ID    | **lower-kebab** | `SYSID`  | `L2 시스템 ID`    | `SYSID`        | ✓   |
| 4   | L3 내부 코드 변수  | **camelCase**   | `INTVAR` | `L3 내부 코드 변수`  | `INTVAR`       | ✓   |


### 용어집 표 스키마 (Normative)전 표 집계


| #   | 표 (section)                 | L0 (PLAT) | L1 (PROD) | L2 (SYSID) | L3 (INTVAR) | 비고           |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| 1   | §4.1 플랫폼·OS                 | 3         | 5         | 4          | 6           |              |
| 2   | §4.2 domainKey              | 0         | 0         | 8          | 0           |              |
| 3   | §4.3 Physical·Menton·Engine | 8         | 4         | 0          | 0           |              |
| 4   | §4.4 Cosmic·CSIM            | 4         | 1         | 0          | 0           |              |
| 5   | §4.5 Axon·Cosmic Language   | 5         | 1         | 0          | 0           |              |
| 6   | §4.6 nexia·DIEA·tabId       | 1         | 7         | 0          | 0           |              |
| 7   | §4.7 Nexaon·창               | 1         | 2         | 0          | 0           |              |
| 8   | §4.8 콘텐츠·CAT·PMS            | 2         | 0         | 0          | 0           |              |
| 9   | §4.9 nexia·UI·셸             | 2         | 15        | 0          | 3           |              |
| 10  | §4.10 Omnix·BAX·3층 UI       | 12        | 6         | 1          | 0           |              |
| 11  | §4.11 NIXIE 4 Shell         | 0         | 4         | 0          | 0           |              |
| 12  | §4.12 데이터·Identity          | 1         | 0         | 13         | 1           |              |
| 13  | §4.13 IoT·제품 모듈             | 3         | 2         | 3          | 0           |              |
| 14  | §4.14 Generators            | 4         | 1         | 0          | 0           |              |
| 15  | §4.15 기타·레거시                | 1         | 4         | 2          | 0           |              |
| 16  | §5 `.nx`* 산출물               | 0         | 0         | 9          | 0           |              |
| 17  | 부록 A (legacy UI)            | 0         | 7         | 0          | 0           |              |
|     | **합계**                      | **47**    | **59**    | **40**     | **10**      | **156 term** |


> **검증 기준:** TAG의 표기 패턴이 §1 표기법(FULL_UPPER / TitleCase / lower-kebab / camelCase) 중 어디에 해당하는지로 자동 판별. 패턴 매칭 결과:
>
> - `FULL_UPPER` 패턴(영문 대문자+숫자+`._-:`) → L0 PLAT
> - `TitleCase` 패턴(첫 대문자+소문자) → L1 PROD
> - `lower-kebab` 패턴(소문자+`-` 허용) → L2 SYSID
> - `camelCase` 패턴(소문자 시작+중간 대문자) → L3 INTVAR

#### 자동 검증 스크립트 (선택)

> 본 보고서의 정합성은 다음 Python 스크립트로 재현 가능:

```python
import re

PATTERNS = [
    ("L0", "PLAT", re.compile(r"^[A-Z][A-Z0-9._\-:]*$")),
    ("L1", "PROD", re.compile(r"^[A-Z][A-Za-z0-9]*$")),
    ("L2", "SYSID", re.compile(r"^[a-z][a-z0-9_\-]*$")),
    ("L3", "INTVAR", re.compile(r"^[a-z][a-z0-9]*([A-Z][a-z0-9]*)+$")),
]

def classify(tag: str):
    for level, code, pat in PATTERNS:
        if pat.fullmatch(tag):
            return level, code
    return None, None
```

---

## NEXA V2.0 전용 용어 (`terms_nexa`)

### 플랫폼 · OS


| TAG                    | CODE             | TIER         | TC(약어) | LABEL_KO    | LABEL_EN             | FULLNAME                                        | CATEGORY | DEFINITION                                                | NOT                              | ARTIFACT | RELATED | SSOT    | NOTES               |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXA`                 |                  | L0 플랫폼 표준    | PLAT   | 넥사          | NEXA                 |                                                 | platform | 사업·플랫폼 전체 브랜드                                             |                                  |          |         | BRD-001 |                     |
| `NEXAOS`               |                  | L0 플랫폼 표준    | PLAT   | 넥사 OS       | NEXA OS              |                                                 | platform | OS·셸·도메인·미션크리티컬 설계층                                       |                                  |          |         | TDD-001 |                     |
| `domainKey`            | domainKey        | L3 내부 코드 변수  | INTVAR | 도메인 키       | domainKey            |                                                 | platform | Header 전역 메뉴 도메인 식별자 (`nexia`, `erp` …)                   |                                  |          |         | TDD-071 |                     |
| `subRoute`             | subRoute         | L3 내부 코드 변수  | INTVAR | 서브 라우트      | subRoute             |                                                 | platform | 단일 `domainKey` 내 content 분기 (`erp/parts`)                 |                                  |          |         | TDD-071 |                     |
| `MainShell`            |                  | L1 제품 및 컴포넌트 | PROD   | 메인 쉘        | MainShell            |                                                 | platform | 4 영역 + StatusBar 플랫폼 셸                                    |                                  |          |         | UIX-004 | 구 UIX-006 → UIX-004 |
| `domainLayoutRegistry` |                  | L3 내부 코드 변수  | INTVAR | 도메인 레이아웃 레지 | domainLayoutRegistry |                                                 | platform | domainKey→슬롯 lazy import 레지스트리                            |                                  |          |         | TDD-071 |                     |
| `useLayoutStore`       |                  | L3 내부 코드 변수  | INTVAR | 유즈레이아웃 스토어  | useLayoutStore       |                                                 | platform | 드로어·상태바 Zustand SSOT                                      |                                  |          |         | UIX-004 |                     |
| `drawerDefaults`       |                  | L3 내부 코드 변수  | INTVAR | 드로어 디폴트     | drawerDefaults       |                                                 | platform | 도메인별 L/R 드로어 open 정책                                      |                                  |          |         | TDD-071 |                     |
| `SystemStatusBar`      |                  | L1 제품 및 컴포넌트 | PROD   | 시스템 상태바     | SystemStatusBar      |                                                 | platform | 하단 1 줄 + 확장 상태 패널 · CAT 후보 거점 (미정)                        |                                  |          |         | UIX-004 |                     |
| `AppHeader`            |                  | L1 제품 및 컴포넌트 | PROD   | 앱 헤더        | AppHeader            |                                                 | platform | 상단 전역 헤더                                                  |                                  |          |         | UIX-004 |                     |
| `themePreset`          |                  | L3 내부 코드 변수  | INTVAR | 테마 프리셋      | themePreset          |                                                 | platform | 도메인 테마 (`office-light` 등)                                 |                                  |          |         | TDD-071 |                     |
| `packages-shared`      | packages/shared  | L2 시스템 ID    | SYSID  | 모노레포 공유폴더   | packages/shared      |                                                 | platform | Zod·commands 공유 패키지                                       |                                  |          |         | TDD-007 |                     |
| `agent-graph`          | apps/agent-graph | L2 시스템 ID    | SYSID  | 에이전트 그래프    | agent-graph          |                                                 | platform | LLM·Embed·LangGraph 실행 앱                                  |                                  |          |         | TDD-003 |                     |
| `GraphCanvas`          |                  | L1 제품 및 컴포넌트 | PROD   | 그래픽 켄버스     | GraphCanvas          |                                                 | platform | React Flow 워크플로 UI · Yjs `.nxflow`                        |                                  |          | Nexaon  | TDD-007 |                     |
| `apps-sync`            | apps/sync        | L2 시스템 ID    | SYSID  | 앱스/싱크       | apps/sync            |                                                 | platform | Hocuspocus Yjs 서버                                         |                                  |          |         | TDD-038 |                     |
| `embedder`             |                  | L2 시스템 ID    | SYSID  | 임베더         | embedder             |                                                 | platform | in-process 임베딩 (`/v1/embed`)                              |                                  |          |         | TDD-003 |                     |
| `M.O.S.E.S.`           |                  | L0 플랫폼 표준    | PLAT   | 모세          | M.O.S.E.S.           | Mission-Operational Safety Engineering Standard | platform | 미션크리티컬 설계 원칙 약어                                           |                                  |          |         | TDD-001 |                     |
| `Galthon`              |                  | L1 제품 및 컴포넌트 | PROD   | 갈톤          | Galthon              |                                                 | platform | NEXA 전체 신뢰성 담보 독립 감시 주체 — Why-Chain·trace 횡단 관측 · 흐름 개입 ✗ | ≠ NEXA · ≠ Menton · ≠ Nexaon Run |          |         | TDD-074 | 6대 핵심 축 ✗           |


### domainKey (제품·업무 영역)

> 상세 맵: [TDD-071](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md).


| tag       | code    | TIER      | TC(약어) | label_ko | label_en | fullname | category  | definition                            | not                        | artifact | related      | ssot    | notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `nexia`   | nexia   | L2 시스템 ID | SYSID  | 넥시아      | nexia    |          | domainKey | 플랫폼 핵심 지능 셸 · DIEA 호스트 · Distillation | NEXAON 프로젝트명 · NEXIA 표기 혼동 |          | DIEA, Nexaon | TDD-071 |       |
| `ontex`   | ontex   | L2 시스템 ID | SYSID  | 온텍스      | Ontex    |          | domainKey | 온톨로지·Graph RAG·pgvector (구 nexion 흡수) |                            |          |              | TDD-071 |       |
| `erp`     | erp     | L2 시스템 ID | SYSID  | 이알피      | erp      |          | domainKey | ERP 메인 (구 erp-parts 통합)               |                            |          |              | TDD-071 |       |
| `nexabo`  | nexabo  | L2 시스템 ID | SYSID  | 넥사보      | nexabo   |          | domainKey | IoT 관제·텔레메트리 (구 nexage)               |                            |          |              | TDD-071 |       |
| `nexet`   | nexet   | L2 시스템 ID | SYSID  | 넥셋       | nexet    |          | domainKey | SW/HW 마켓 유통                           |                            |          |              | TDD-071 |       |
| `infra`   | infra   | L2 시스템 ID | SYSID  | 인프라      | infra    |          | domainKey | 장치 등록·my-devices                      |                            |          |              | TDD-071 |       |
| `network` | network | L2 시스템 ID | SYSID  | 네트워크     | network  |          | domainKey | WiFi·CAN·MQTT 토폴로지                    |                            |          |              | TDD-071 |       |
| `admin`   | admin   | L2 시스템 ID | SYSID  | 어드       | admin    |          | domainKey | 슈퍼 관리 (구 nexa-admin)                  |                            |          |              | TDD-071 |       |


### 아키텍처 축 — Physical · Menton · Engine

> **한 줄:** PT = 배치 · ML = 논리 계층 · Core Engine = 기능. SSOT: [TDD-040](08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) · [TDD-075 Hub-and-Spoke](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md).


| TAG                 | CODE | TIER         | TC(약어) | LABEL_KO      | LABEL_EN                  | FULLNAME                | CATEGORY      | DEFINITION                                       | NOT                                 | ARTIFACT | RELATED | SSOT    | NOTES             |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Physical-Tier`     | PT   | L1 제품 및 컴포넌트 | PROD   | 피지컬 티어        | Physical Placement Tier   | Physical Placement Tier | axis          | 어디서 연산하나 — 4단 PT-0~3                             |                                     |          |         | TDD-040 |                   |
| `Menton-Layer`      | ML   | L1 제품 및 컴포넌트 | PROD   | 멘톤 레이어        | Menton Intelligence Stack |                         | axis          | 소프트웨어상 역할 층 ML0~ML3                              | ≠ NEXA 브랜드 · ≠ NL0–NL3 (deprecated) |          |         | TDD-040 |                   |
| `Core-Engine-Stack` |      | L1 제품 및 컴포넌트 | PROD   | 코어 엔진 기술      | Core Engine Stack         |                         | axis          | Cold Path 기능 엔진 6 (가변)                           |                                     |          |         | TDD-075 |                   |
| `Hub-and-Spoke`     |      | L1 제품 및 컴포넌트 | PROD   | Hub-and-Spoke | Hub-and-Spoke             |                         | axis          | PT-3 허브 + PT-0~2·Nixie 샤드 배치                     |                                     |          |         | TDD-075 |                   |
| `PT-0`              | PT-0 | L0 플랫폼 표준    | PLAT   | 피지컬 티어 0      | PT-0                      |                         | physical-tier | 말단 COLD — Nano Sentinel · HEXAGON · ACTON Reflex |                                     |          | ML0     | TDD-040 | HW: COLD          |
| `PT-1`              | PT-1 | L0 플랫폼 표준    | PLAT   | 피지컬 티어 1      |                           |                         | physical-tier | WARM Micro Sentinel (선택) · Nixie ✗               |                                     |          |         | TDD-040 |                   |
| `PT-2`              | PT-2 | L0 플랫폼 표준    | PLAT   | 피지컬 티어 2      |                           |                         | physical-tier | WARM Kinetic Controller (선택) · Fast Path         |                                     |          |         | TDD-040 |                   |
| `PT-3`              | PT-3 | L0 플랫폼 표준    | PLAT   | 피지컬 티어 3      | Zenith                    |                         | physical-tier | HOT 풀스택 웹 허브 · DIEA · Nexaon · Ontex             |                                     |          |         | TDD-040 |                   |
| `ML0`               | ML0  | L0 플랫폼 표준    | PLAT   |               | Reflexive · Edge          |                         | menton-layer  | Sentinel · Fact·Reflex·후보고 uplink · ACTON        |                                     |          | PT-0    | TDD-040 | LangGraph Agent ✗ |
| `ML1`               | ML1  | L0 플랫폼 표준    | PLAT   |               | Presence                  |                         | menton-layer  | NIXIE · 4 Shell · 결과·알람·상태 Express               |                                     |          | NIXIE   | TDD-040 |                   |
| `ML2`               | ML2  | L0 플랫폼 표준    | PLAT   |               | Tactical · Domain         |                         | menton-layer  | nexabo/nexia 작업면 — 관제·트윈·정재 UI                   |                                     |          |         | TDD-040 |                   |
| `ML3`               | ML3  | L0 플랫폼 표준    | PLAT   |               | Strategic                 |                         | menton-layer  | Nexaon·agent-graph·Omnix — ingest→Run→promoted   |                                     |          | Nexaon  | TDD-073 | LangGraph Agent ✓ |


### Cosmic Layer · CSIM (T1–T3)


| TAG      | CODE | TIER         | TC(약어) | LABEL_KO          | LABEL_EN          | FULLNAME                         | CATEGORY    | DEFINITION                              | NOT                     | ARTIFACT | RELATED | SSOT    | NOTES   |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Cosmic` |      | L1 제품 및 컴포넌트 | PROD   | 코믹                | Cosmic Layer      |                                  | cosmic-tier | WILL/FACT 의미 번역 축 · Tier T1–T3          |                         |          | CSIM    | TDD-043 |         |
| `T1`     | T1   | L0 플랫폼 표준    | PLAT   | Abstraction       | Abstraction       |                                  | cosmic-tier | WILL/FACT → Matrix 시스템 공용어              |                         |          |         | TDD-043 |         |
| `T2`     | T2   | L0 플랫폼 표준    | PLAT   | Contextualization | Contextualization |                                  | cosmic-tier | Matrix+맥락 → 오해 없는 의미 토큰                 |                         |          |         | TDD-043 |         |
| `T3`     | T3   | L0 플랫폼 표준    | PLAT   | Concretization    | Concretization    |                                  | cosmic-tier | 의미 → Narrative\                         | Action · Run ✗ (Nexaon) |          |         |         | TDD-043 |
| `CSIM`   |      | L0 플랫폼 표준    | PLAT   | 우주 의미 언어 번역기      | CSIM              | Cosmic Semantic Interface Matrix | cosmic-tier | Cosmic Layer 구현 · WILL/FACT ↔ Matrix 번역 |                         |          | Cosmic  | TDD-043 |         |


### Axon Layer · Cosmic Language (AL1–AL7)


| TAG              | CODE     | TIER         | TC(약어) | LABEL_KO | LABEL_EN       | FULLNAME | CATEGORY   | DEFINITION                        | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AXON`           |          | L0 플랫폼 표준    | PLAT   | 엑숀       | AXON           |          | axon-layer | Axon Layer 7층 프로토콜 · AXON-AL1…AL7 |     |          |         | TDD-043 |       |
| `APEX`           | AXON-AL1 | L0 플랫폼 표준    | PLAT   | 의미 규격    | APEX Matrix    |          | axon-layer | 3×3 의미 매트릭스(CSIM의 표준 출력 규격)       |     |          | CSIM    | TDD-043 |       |
| `HEXAGON`        | AXON-AL2 | L0 플랫폼 표준    | PLAT   | 헥사곤      | HEXAGON        |          | axon-layer | 5W1H 6축 Envelope · Zod 문법         |     |          |         | TDD-043 |       |
| `Coil-Balancer`  | AXON-AL3 | L1 제품 및 컴포넌트 | PROD   | 코일 벨렌서   | Coil Balancer  |          | axon-layer | 페르소나 Zero-sum · GOVERN            |     |          |         | TDD-043 |       |
| `NEXAON-Network` | AXON-AL4 | L0 플랫폼 표준    | PLAT   | 넥사온 네트워크 | NEXAON Network |          | axon-layer | 엣지 후보고·중앙 해석                      |     |          | Nexaon  | TDD-043 |       |
| `NEXAVULT`       | AXON-AL5 | L0 플랫폼 표준    | PLAT   | 넥사볼트     | NEXAVULT       |          | axon-layer | Seed·로그·벡터 이중 저장                  |     |          | Ontex   | TDD-043 |       |
| `ACTON`          | AXON-AL6 | L0 플랫폼 표준    | PLAT   | 넥숀       | ACTON          |          | axon-layer | 물리 실행 Synapse · PWM · MQTT        |     |          |         | TDD-043 |       |
| `ENVIRON-Shield` | AXON-AL7 | L0 플랫폼 표준    | PLAT   | 환경 보호막   | ENVIRON Shield |          | axon-layer | 환경·복지 · Jitter 차단 · Nixie triage  |     |          | NIXIE   | TDD-043 |       |


### nexia — DIEA · tabId

> **DIEA** = Distillation Intelligence Engine Array · `nexia` 7 Facet. 구 별칭 `7Tab`/`7탭` SSOT ✗. URL: `/nexia/{tabId}`.
> **핵심 흐름:** 인간의지 ↔ [CSIM] 번역 ↔ [APEX] 매트릭스 ↔ [AXON] 프로토콜 ↔ [DIEA] 정재 작업대 ↔ [NEXIA] 정재 ↔ **M2P** 출력 ↔ [Peripheral]


| TAG      | CODE   | TIER         | TC(약어) | LABEL_KO | LABEL_EN | FULLNAME                               | CATEGORY | DEFINITION              | NOT                        | ARTIFACT         | RELATED      | SSOT    | NOTES    |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Omnix`  | omnix  | L1 제품 및 컴포넌트 | PROD   | 옴닉스      | Omnix    |                                        | tabId    | 소통·허브·오케스트레이션·승인 중계     |                            | .nxchat          | DIEA         | TDD-056 |          |
| `Normex` | normex | L1 제품 및 컴포넌트 | PROD   | 노멕스      | Normex   |                                        | tabId    | Norm·정책·Tiptap 시방서      |                            | .nxpol           | DIEA         | TDD-056 |          |
| `Logex`  | logex  | L1 제품 및 컴포넌트 | PROD   | 로젝스      | Logex    |                                        | tabId    | 추론·관계·React Flow 워크플로   |                            | .nxflow          | DIEA, Nexaon | TDD-056 |          |
| `Scribx` | scribx | L1 제품 및 컴포넌트 | PROD   | 스크립스     | Scribx   |                                        | tabId    | 코드·명세·Monaco            |                            | .nxcode          | DIEA         | TDD-056 |          |
| `Vivex`  | vivex  | L1 제품 및 컴포넌트 | PROD   | 비벡스      | Vivex    |                                        | tabId    | 미디어·ComfyUI             |                            | .nxmedia         | DIEA         | TDD-056 |          |
| `Twinex` | twinex | L1 제품 및 컴포넌트 | PROD   | 트윈엑스     | Twinex   |                                        | tabId    | 디지털 트윈·3D·ESPHome       |                            | .nxproj .nxdev … | DIEA         | TDD-056 |          |
| `Navex`  | navex  | L1 제품 및 컴포넌트 | PROD   | 네이벡스     | Navex    |                                        | tabId    | 플랫폼 전역 자산 탐색·검색·릴레이     |                            |                  | DIEA, NISE   | TDD-056 | 생성 확장자 ✗ |
| `DIEA`   |        | L0 플랫폼 표준    | PLAT   | 정재 작업대   | DIEA     | Distillation Intelligence Engine Array | tabId    | nexia 7 Facet 지능 엔진 어레이 | ≠ domainKey · ≠ Nexaon 동일시 |                  | Nexaon,APEX  | TDD-071 |          |


### Nexaon · 명칭 (혼동 방지)

> Nexaon ⊂ nexia · Logex ontology. DIEA 7 Facet에 포함 ✗.


| TAG           | CODE | TIER         | TC(약어) | LABEL_KO | LABEL_EN    | FULLNAME | CATEGORY | DEFINITION                                     | NOT                                  | ARTIFACT                          | RELATED     | SSOT    | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Nexaon`      |      | L1 제품 및 컴포넌트 | PROD   | 넥사온      | Nexaon      |          | ui       | Logex ontology 서브모드 · ML3 Distillation 오케스트레이터 | tabId ✗ · domainKey ✗ · DIEA Facet ✗ | /nexia/logex/ontology/{projectId} | DIEA, Logex | TDD-073 |       |
| `NexaonShell` |      | L1 제품 및 컴포넌트 | PROD   | 넥사온쉘     | NexaonShell |          | ui       | ExplorerTree · GraphCanvas · RunPanel 3분할      | MainShell ✗                          |                                   | Nexaon      | TDD-056 |       |
| `NEXIA`       |      | L0 플랫폼 표준    | PLAT   | 닉시아      | NEXIA       |          | ui       | 제품·문서 도메인 라벨 (대문자)                             | nexia 코드키와 별도                        |                                   |             | TDD-010 |       |


### 확장 레이어 — CAT · PMS (7+4)

> 7 Core tabId + Ontex·Admin·CAT·PMS. UI 배치 미정.


| TAG   | CODE | TIER      | TC(약어) | LABEL_KO | LABEL_EN | FULLNAME                      | CATEGORY | DEFINITION                                                 | NOT                     | ARTIFACT | RELATED | SSOT          | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CAT` |      | L0 플랫폼 표준 | PLAT   | 켓        | CAT      | Contextual Awareness Timeline | ui       | nexia·MainShell 횡단 상황 인지 · LLM Read-only                   | Omnix 채팅 ✗ · tabId ✗    |          | PMS     | DEV UI-Driven |       |
| `PMS` |      | L0 플랫폼 표준 | PLAT   | 피엠에스     | PMS      | Project Management System     | ui       | WBS·Roadmap·Backlog·Asset Ledger·Validation Gate · 지능 공정관리 | erp · 외부 PM ✗ · tabId ✗ |          | CAT     | DEV UI-Driven |       |


### nexia — UI 셸 · 레이아웃


| TAG                       | CODE  | TIER         | TC(약어) | LABEL_KO   | LABEL_EN                | FULLNAME                        | CATEGORY | DEFINITION                               | NOT                         | ARTIFACT | RELATED             | SSOT    | NOTES   |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NexiaContent`            |       | L1 제품 및 컴포넌트 | PROD   | 넥시아 콘텐츠    | NexiaContent            |                                 | ui       | nexia Content 슬롯 루트 (TabBar+Workspace)   |                             |          |                     | UIX-004 |         |
| `NexiaWorkspace`          |       | L1 제품 및 컴포넌트 | PROD   | 넥시아 워크스페이스 | NexiaWorkspace          |                                 | ui       | L1 2-pane · L2 split · L3 PiP            |                             |          |                     | UIX-004 |         |
| `NexiaTabBar`             |       | L1 제품 및 컴포넌트 | PROD   | 넥시아 텝바     | NexiaTabBar             |                                 | ui       | 6 탭 스트립 (omnix 제외·레일)                    |                             |          |                     | UIX-004 |         |
| `tabId`                   | tabId | L3 내부 코드 변수  | INTVAR | 탭 ID       | tabId                   |                                 | ui       | nexia 탭 식별자                              |                             |          |                     | TDD-056 |         |
| `subPaneId`               |       | L3 내부 코드 변수  | INTVAR | 서브패널 ID    | subPaneId               |                                 | ui       | 탭 내 서브패널·다중 창 ID                         |                             |          |                     | UIX-004 |         |
| `panelId`                 |       | L3 내부 코드 변수  | INTVAR | 패널 ID      | panelId                 |                                 | ui       | PiP·detach 대상 패널 ID                      |                             |          |                     | UIX-004 |         |
| `OmnixRail`               |       | L1 제품 및 컴포넌트 | PROD   | 옴닉스 레일     | OmnixRail               |                                 | ui       | L1 좌측 Omnix 고정 레일                        |                             |          |                     | UIX-004 |         |
| `Global-Navex`            |       | L1 제품 및 컴포넌트 | PROD   | 글로벌 네이벡스   | Global Navex            |                                 | ui       | Right Drawer 플랫폼 전역 탐색                   |                             |          | Navex               | UIX-002 |         |
| `GlobalFileExplorer`      |       | L1 제품 및 컴포넌트 | PROD   | 글로벌 탐색기    | GlobalFileExplorer      |                                 | ui       | Navex 공통 파일·자산 탐색 엔진                     |                             |          |                     | UIX-002 |         |
| `Global-Asset-Index`      |       | L1 제품 및 컴포넌트 | PROD   | 글로벌 자산 인덱스 | Global Asset Index      |                                 | ui       | 플랫폼 전역 files 통합 인덱스 뷰                    |                             |          | Navex               | PRD-014 |         |
| `InfraTree`               |       | L1 제품 및 컴포넌트 | PROD   | 인프라 구조     | InfraTree               |                                 | ui       | Navex Left origin→domain→device          |                             |          |                     | UIX-002 |         |
| `Infra-Explorer`          |       | L1 제품 및 컴포넌트 | PROD   | 인프라 구조     | Infra Explorer          |                                 | ui       | Navex infra 모드 · navexExploreMode: infra |                             |          |                     | UIX-002 |         |
| `Intelligent-Explorer`    |       | L1 제품 및 컴포넌트 | PROD   | 인텔리전트 탐색기  | Intelligent Explorer    |                                 | ui       | NISE · 개인화 탐색                            |                             |          | NISE                | PRD-014 |         |
| `Navex-Search-Engine`     |       | L1 제품 및 컴포넌트 | PROD   | 네이벡스 검색 엔진 | Navex Search Engine     |                                 | ui       | hybrid retrieval · RRF · personal rerank |                             |          | NISE                | TDD-065 |         |
| `NISE`                    |       | L0 플랫폼 표준    | PLAT   | 니세(검색엔진)   | NISE                    | Navex Intelligent Search Engine | ui       | Navex 검색 엔진 공식 약칭                        | ≠ Omnix · ≠ Ontex Graph RAG |          | Navex-Search-Engine | PRD-014 |         |
| `Personalization-Profile` |       | L1 제품 및 컴포넌트 | PROD   | 개인화 프로필    | Personalization Profile |                                 | ui       | Taste·Trace·Focus·Negative ranking SSOT  |                             |          |                     | PRD-014 |         |
| `Left-Drawer`             |       | L1 제품 및 컴포넌트 | PROD   | 왼쪽 사이드바    | Left Drawer             |                                 | ui       | MainShell 좌측 패널                          |                             |          |                     | UIX-004 |         |
| `Right-Drawer`            |       | L1 제품 및 컴포넌트 | PROD   | 오를쪽 사이드바   | Right Drawer            |                                 | ui       | MainShell 우측 패널                          |                             |          |                     | UIX-004 |         |
| `PiP`                     |       | L1 제품 및 컴포넌트 | PROD   | 피아이피       | PiP                     | Picture-in-Picture              | ui       | 패널 분리·detach                             |                             |          |                     | UIX-004 |         |
| `UI-L0`                   |       | L0 플랫폼 표준    | PLAT   | 유아이 레벨 0   | UI-L0                   |                                 | ui       | MVP UI 구현 단계 (PRD-001)                   |                             |          |                     |         | UI-L 계열 |


### Omnix · 협업 · BAX · 3층 UI

> NEXU(What) · BAX(How sit) · NIXIE(Express). 병합 ✗.
> **핵심 흐름:** 인간의지 ↔ [CSIM] 번역 ↔ [APEX] 매트릭스 ↔ [AXON] 프로토콜 ↔ [DIEA] 정재 작업대 ↔ [NEXIA] 정재 ↔ **M2P** 출력 ↔ [Peripheral] 주변기기


| TAG             | CODE | TIER         | TC(약어) | LABEL_KO      | LABEL_EN      | FULLNAME                  | CATEGORY | DEFINITION                                             | NOT                     | ARTIFACT | RELATED    | SSOT    | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NIXIE`         |      | L0 플랫폼 표준    | PLAT   | 닉시            | NIXIE         |                           | ui       | ML1 Presence · Canvas·BAX·전 domainKey Express          | Canvas/BAX 대체 ✗ · Run ✗ |          | Nixie      | TDD-045 |       |
| `Nixie`         |      | L1 제품 및 컴포넌트 | PROD   | 닉시            | Nixie         |                           | ui       | NIXIE 제품·UI·4 Shell 채널 표기                              |                         |          | NIXIE      | TDD-061 |       |
| `M2P`           |      | L0 플랫폼 표준    | PLAT   | 엠투피           | M2P           | Matrix-to-Peripheral      | ui       | **실시간 의지 데이터를 NIXIE·Serial용 구체적 명령어로 변환/전송하는 실행 프로토콜** | CSIM는 통역사, M2P는 실행근육    |          |            | UIX-003 |       |
| `NEXU Canvas`   |      | L1 제품 및 컴포넌트 | PROD   | 넥슈 켄버스        | NEXU Canvas   |                           | ui       | 온톨로지·Knowledge 페브릭 시맨틱 뷰                               | BAX 혼용 ✗                |          | BAX, NIXIE | TDD-045 |       |
| `VirtualCanvas` |      | L1 제품 및 컴포넌트 | PROD   | 가상 켄버스        | VirtualCanvas |                           | bax      | BAX 레이아웃 호스트 Grid+OVERLAY                              | NEXU Canvas ✗           |          | BAX        | UIX-003 |       |
| `BAX`           |      | L0 플랫폼 표준    | PLAT   | 벡스            | BAX           | Breathing AI Experience   | bax      | 미적 레이아웃 · void · Grid · 전 domainKey                    | NEXU Canvas 혼용 ✗        |          |            | UIX-003 |       |
| `MAE`           |      | L0 플랫폼 표준    | PLAT   | 멤.에이.이        | MAE           | Matrix Aesthetic Engine   | bax      | **의미 데이터를 시각적 Grid로 배치하는 BAX 실행 엔진 (ATS 참조)**          |                         |          |            | UIX-003 |       |
| `ATS`           |      | L0 플랫폼 표준    | PLAT   | 에이.티.에스       | ATS           | Aesthetic Tuning Settings | bax      | **ASR·Depth 등 미적 파라미터를 저장하고 MAE에 전달하는 영속화 모듈**         |                         |          |            | UIX-003 |       |
| `ASR`           |      | L0 플랫폼 표준    | PLAT   | 에이.에스.알       | ASR           | Aesthetic Space Ratio     | bax      | **인터페이스의 여백 하한선(void_ratio)을 규정하는 핵심 지표**              |                         |          |            | UIX-003 |       |
| `LayoutPolicy`  |      | L1 제품 및 컴포넌트 | PROD   | LayoutPolicy  | 레이아웃 폴리씨      |                           | bax      | BAX BLOCK 배치 정책                                        |                         |          |            | UIX-003 |       |
| `RuleGuard`     |      | L1 제품 및 컴포넌트 | PROD   | RuleGuard     | 룰 그리드         |                           | bax      | 규칙 가드 · AlarmState                                     |                         |          |            | UIX-003 |       |
| `NEXNAP`        |      | L0 플랫폼 표준    | PLAT   | NEXNAP        | 넥스넵           |                           | ui       | 시스템 인터페이스·Envelope 규약                                  |                         |          |            | TDD-010 |       |
| `Envelope`      |      | L1 제품 및 컴포넌트 | PROD   | Envelope      | 봉투            |                           | ui       | 탭·actor·payload 표준 메시지 래퍼                              |                         |          |            | TDD-010 |       |
| `approval-gate` |      | L2 시스템 ID    | SYSID  | approval-gate | 승인 게이트        |                           | ui       | 승인 A/B/C 게이트                                           |                         |          |            | TDD-008 |       |
| `GOVERN`        |      | L0 플랫폼 표준    | PLAT   | GOVERN        | 거버넌스          |                           | ui       | 룰·프롬프트 거버넌스                                            |                         |          |            | TDD-043 |       |
| `ASK`           |      | L0 플랫폼 표준    | PLAT   | ASK           | 요청/유보         |                           | ui       | **HEXAGON 내 결측 정보 보완을 위한 의도(Intent) 토큰**               |                         |          | VOID       |         |       |
| `VOID`          |      | L0 플랫폼 표준    | PLAT   | VOID          | 중립/공백         |                           | ui       | 결정이 내려지지 않은 데이터의 잠재적 상태                                |                         |          | ASK        |         |       |
| `VOID-BOX`      |      | L0 플랫폼 표준    | PLAT   | VOID-BOX      | 보이드 박스        |                           | ui       | **결정 유보(DEFERRED) 데이터를 담는 BAX 그리드 내 논리적 컨테이너**         |                         |          |            | PRD-003 |       |
| `DEFERRED`      |      | L0 플랫폼 표준    | PLAT   | DEFERRED      | 연기/보류         |                           | ui       | 연기된 결정 상태                                              |                         |          |            | PRD-003 |       |


### NIXIE — 4 Shell 채널


| TAG                  | CODE | TIER         | TC(약어) | LABEL_KO | LABEL_EN             | FULLNAME | CATEGORY | DEFINITION                       | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NixieWebShell`      |      | L1 제품 및 컴포넌트 | PROD   | 닉시 웹쉘    | Nixie Web Shell      |          | ui       | MainShell frame ML1 · PiP detach |     |          |         | TDD-061 |       |
| `NixieDesktopShell`  |      | L1 제품 및 컴포넌트 | PROD   | 닉스 데스크탑쉘 | Nixie Desktop Shell  |          | ui       | Python PC 독립 · WS/SSE · M2P      |     |          |         | TDD-062 |       |
| `NixieMobileShell`   |      | L1 제품 및 컴포넌트 | PROD   | 닉스 모바일쉘  | Nixie Mobile Shell   |          | ui       | iOS/Android · 푸시·VAD             |     |          |         | TDD-063 |       |
| `NixiePhysicalShell` |      | L1 제품 및 컴포넌트 | PROD   | 닉시 실물쉘   | Nixie Physical Shell |          | ui       | ESP32/RPi 하드웨어 · M2P·Serial      |     |          |         | TDD-064 |       |


### 데이터 · 파일 · Identity


| TAG                   | CODE | TIER        | TC(약어) | LABEL_KO        | LABEL_EN            | FULLNAME | CATEGORY | DEFINITION               | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `files`               |      | L2 시스템 ID   | SYSID  | 파일              | files               |          | data     | 업로드 파일 DB 테이블            |     |          |         | TDD-010 |       |
| `file_references`     |      | L2 시스템 ID   | SYSID  | 파일 참조           | file_references     |          | data     | 도메인·프로젝트별 파일 참조          |     |          |         | TDD-010 |       |
| `asset-origin`        |      | L2 시스템 ID   | SYSID  | 출처 축            | asset-origin        |          | data     | Navex 출처 facet           |     |          |         | PRD-014 |       |
| `navexCategory`       |      | L3 내부 코드 변수 | INTVAR | 종류 facet        | navexCategory       |          | data     | Navex 종류 facet           |     |          |         | TDD-065 |       |
| `file_embeddings`     |      | L2 시스템 ID   | SYSID  | 파일 벡터 인덱스       | file_embeddings     |          | data     | 파일 벡터 인덱스                |     |          |         | TDD-010 |       |
| `source_metadata`     |      | L2 시스템 ID   | SYSID  | 추출 메타           | source_metadata     |          | data     | AI 추출 메타 (PRD-013)       |     |          |         | PRD-013 |       |
| `nexa-docs`           |      | L2 시스템 ID   | SYSID  | 문서 폴더 노드        | nexa-docs           |          | data     | 문서 폴더 노드 ID (PRD-008)    |     |          |         | PRD-008 |       |
| `identity_id`         |      | L2 시스템 ID   | SYSID  | identity ID     | identity_id         |          | data     | Knowledge OS identity ID |     |          |         | TDD-045 |       |
| `nexa_identities`     |      | L2 시스템 ID   | SYSID  | Identity 테이블    | nexa_identities     |          | data     | Identity 테이블             |     |          |         | TDD-045 |       |
| `anchor_id`           |      | L2 시스템 ID   | SYSID  | 자산 논리 고정 주소     | anchor_id           |          | data     | 자산 논리 고정 주소              |     |          |         | TDD-045 |       |
| `graph_id`            |      | L2 시스템 ID   | SYSID  | 그래프 ID          | graph_id            |          | data     | Nexaon·Run 그래프 ID        |     |          |         | TDD-008 |       |
| `run_id`              |      | L2 시스템 ID   | SYSID  | 실행 ID           | run_id              |          | data     | LangGraph 실행 ID          |     |          |         | TDD-008 |       |
| `project_yjs_updates` |      | L2 시스템 ID   | SYSID  | Yjs 스냅샷 persist | project_yjs_updates |          | data     | Yjs 스냅샷 persist          |     |          |         | TDD-038 |       |
| `yjs_state`           |      | L2 시스템 ID   | SYSID  | Yjs 바이너리 상태     | yjs_state           |          | data     | Yjs 바이너리 상태              |     |          |         | TDD-038 |       |
| `Knowledge-OS`        |      | L0 플랫폼 표준   | PLAT   | Knowledge OS    | Knowledge OS        |          | data     | 용어·벡터·감사 체계              |     |          |         | TDD-045 |       |


### IoT · 제품 모듈


| TAG               | CODE | TIER         | TC(약어) | LABEL_KO   | LABEL_EN        | FULLNAME | CATEGORY | DEFINITION                                 | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXA-CELL`       |      | L0 플랫폼 표준    | PLAT   | 넥사 세일      | NEXA-CELL       |          | iot      | ESPHome YAML·웹 펌웨어 제품                      |     |          |         | TDD-024 |       |
| `Physical-AI`     |      | L0 플랫폼 표준    | PLAT   | 피지컬 AI     | Physical AI     |          | iot      | 물리+AI 융합 (BRD)                             |     |          |         | BRD-001 |       |
| `Physical-AI-Ops` |      | L0 플랫폼 표준    | PLAT   | 피키컬 AI Ops | Physical AI Ops |          | iot      | 산업 운영 포지셔닝                                 |     |          |         | BRD-001 |       |
| `digital-twin`    |      | L2 시스템 ID    | SYSID  | 디지털 트윈     | digital twin    |          | iot      | Twinex 도메인 개념                              |     |          | Twinex  | TDD-056 |       |
| `edge`            |      | L2 시스템 ID    | SYSID  | 엣지         | edge            |          | iot      | 엣지 디바이스·큐                                  |     |          |         | TDD-068 |       |
| `edge-device`     |      | L2 시스템 ID    | SYSID  | 엣지 디바이스    | edge-device     |          | iot      | 엣지 디바이스                                    |     |          |         | TDD-068 |       |
| `Lambda`          |      | L1 제품 및 컴포넌트 | PROD   | 람다         | Lambda          |          | iot      | NEXA-CELL 보드 라인 (개발보드)                     |     |          |         | TDD-024 |       |
| `Kineton`         |      | L1 제품 및 컴포넌트 | PROD   | 키네톤        | Kineton         |          | iot      | Physical Bridge · ACTON · ROS 2 번역,물리 실행엔진 |     |          |         | TDD-072 |       |


### Generators · 미디어


| TAG          | CODE | TIER         | TC(약어) | LABEL_KO | LABEL_EN   | FULLNAME | CATEGORY | DEFINITION    | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Generators` |      | L1 제품 및 컴포넌트 | PROD   | 제너레이터    | Generators |          | iot      | AI 생성기 TDD 묶음 |     |          |         | TDD-031 |       |
| `AIVIDEO`    |      | L0 플랫폼 표준    | PLAT   | 비디오 생성기  | AIVIDEO    |          | iot      | AI 비디오 생성기    |     |          |         | TDD-031 |       |
| `AI3D`       |      | L0 플랫폼 표준    | PLAT   | 3D 생성기   | AI3D       |          | iot      | AI 3D 생성기     |     |          |         | TDD-031 |       |
| `AICIRCUIT`  |      | L0 플랫폼 표준    | PLAT   | 회로 생성기   | AICIRCUIT  |          | iot      | AI 회로 생성기     |     |          |         | TDD-031 |       |
| `AISOUND`    |      | L0 플랫폼 표준    | PLAT   | 솔 생성기    | AISOUND    |          | iot      | AI 사운드 생성기    |     |          |         | TDD-031 |       |


### 기타 · 레거시


| TAG                | CODE | TIER         | TC(약어) | LABEL_KO         | LABEL_EN         | FULLNAME | CATEGORY | DEFINITION       | NOT              | ARTIFACT | RELATED        | SSOT    | NOTES      |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Cockpit`          |      | L1 제품 및 컴포넌트 | PROD   | Cockpit          | Cockpit          |          | legacy   | 구 UI 라벨          | 신규 금지            |          | Omnix          |         | → Omnix    |
| `NexiaSplitLayout` |      | L1 제품 및 컴포넌트 | PROD   | NexiaSplitLayout | NexiaSplitLayout |          | legacy   | 구 MVP 분할         |                  |          | NexiaWorkspace |         | deprecated |
| `Nexion`           |      | L1 제품 및 컴포넌트 | PROD   | Nexion           | Nexion           |          | legacy   | UI 브랜드명          | domainKey는 ontex |          |                | TDD-057 |            |
| `Nexus-Map`        |      | L1 제품 및 컴포넌트 | PROD   | Nexus-Map        | Nexus-Map        |          | legacy   | 레거시 AI 지식 맵      |                  |          |                |         | deprecated |
| `U2BEE`            |      | L0 플랫폼 표준    | PLAT   | U2BEE            | U2BEE            |          | legacy   | 데스크톱 앱 (PRD-002) |                  |          |                | PRD-002 |            |
| `v0`               |      | L2 시스템 ID    | SYSID  | v0               | v0               |          | legacy   | v0 프롬프트·프로토타입    |                  |          |                | UIX-005 |            |
| `nexia-shell`      |      | L2 시스템 ID    | SYSID  | nexia-shell      | nexia-shell      |          | legacy   | v0 프로토타입 셸       |                  |          |                | UIX-005 |            |


### `.nx`* 산출물 확장자

> Navex: 생성 확장자 ✗ — 전 domainKey 인덱싱.


| TAG       | CODE   | TIER      | TC(약어) | LABEL_KO | LABEL_EN | FULLNAME | CATEGORY | DEFINITION      | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `nxchat`  | omnix  | L2 시스템 ID | SYSID  | 채팅·세션    | .nxchat  |          | artifact | Omnix 채팅·세션     |     | .nxchat  |         | TDD-010 |       |
| `nxpol`   | normex | L2 시스템 ID | SYSID  | 규범·정책    | .nxpol   |          | artifact | Normex 규범·정책    |     | .nxpol   |         | TDD-010 |       |
| `nxflow`  | logex  | L2 시스템 ID | SYSID  | 워크플로·그래프 | .nxflow  |          | artifact | Logex 워크플로·그래프  |     | .nxflow  |         | TDD-010 |       |
| `nxcode`  | scribx | L2 시스템 ID | SYSID  | 코드·스크립트  | .nxcode  |          | artifact | Scribx 코드·스크립트  |     | .nxcode  |         | TDD-010 |       |
| `nxmedia` | vivex  | L2 시스템 ID | SYSID  | 미디어 메타   | .nxmedia |          | artifact | Vivex 미디어 메타    |     | .nxmedia |         | TDD-010 |       |
| `nxproj`  | twinex | L2 시스템 ID | SYSID  | 프로젝트 루트  | .nxproj  |          | artifact | Twinex 프로젝트 루트  |     | .nxproj  |         | TDD-010 |       |
| `nxgrp`   | twinex | L2 시스템 ID | SYSID  | 그룹·토폴로지  | .nxgrp   |          | artifact | Twinex 그룹·토폴로지  |     | .nxgrp   |         | TDD-010 |       |
| `nxdev`   | twinex | L2 시스템 ID | SYSID  | 디바이스 바인딩 | .nxdev   |          | artifact | Twinex 디바이스 바인딩 |     | .nxdev   |         | TDD-010 |       |
| `nxdiag`  | twinex | L2 시스템 ID | SYSID  | 진단·시뮬    | .nxdiag  |          | artifact | Twinex 진단·시뮬    |     | .nxdiag  |         | TDD-010 |       |


### 부록 A — 구 UI 라벨 (비규범)

> [TDD-010 부록 B](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) 동일. **신규 금지.**


| TAG              | CODE    | TIER         | TC(약어) | LABEL_KO | LABEL_EN | FULLNAME | CATEGORY | DEFINITION | NOT | ARTIFACT | RELATED | SSOT | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Cockpit-legacy` | Cockpit | L1 제품 및 컴포넌트 | PROD   | 콕핏       | Cockpit  |          | legacy   | 구 UI 라벨    |     |          | Omnix   |      | 부록 A  |
| `Ethos-legacy`   | Ethos   | L1 제품 및 컴포넌트 | PROD   | 에토스      | Ethos    |          | legacy   | 구 UI 라벨    |     |          | Normex  |      | 부록 A  |
| `Synapse-legacy` | Synapse | L1 제품 및 컴포넌트 | PROD   | 시넵스      | Synapse  |          | legacy   | 구 UI 라벨    |     |          | Logex   |      | 부록 A  |
| `Glos-legacy`    | Glos    | L1 제품 및 컴포넌트 | PROD   | 글로스      | Glos     |          | legacy   | 구 UI 라벨    |     |          | Scribx  |      | 부록 A  |
| `Physis-legacy`  | Physis  | L1 제품 및 컴포넌트 | PROD   | 피시스      | Physis   |          | legacy   | 구 UI 라벨    |     |          | Vivex   |      | 부록 A  |
| `Sense-legacy`   | Sense   | L1 제품 및 컴포넌트 | PROD   | 센스       | Sense    |          | legacy   | 구 UI 라벨    |     |          | Twinex  |      | 부록 A  |
| `Navis-legacy`   | Navis   | L1 제품 및 컴포넌트 | PROD   | 나비스      | Navis    |          | legacy   | 구 UI 라벨    |     |          | Navex   |      | 부록 A  |


---

## 부록 B — 전체 태그 인덱스

확정 문서 frontmatter 기준. 신규 승격 시 `[sync_terms_to_tags.py](scripts/sync_terms_to_tags.py)` 재실행.


| SCOPE            | COUNT | LOOKUP                                    |
| :--- | :---: | :--- |
| `terms_standard` | 99    | [용어집범용v2.0.md](용어집_범용_v2.0.md)            |
| `terms_nexa`     | 219+  | 본 문서 §4 + [doc*id*레지스트리](doc_id_레지스트리.md) |


---

## 관련 문서


| RELATION       | DOCUMENT                                                                                                                           |
| :--- | :--- |
| 범용 용어          | [용어집범용v2.0.md](용어집_범용_v2.0.md) (TDD-069)                                                                                           |
| 문서 생태계         | [개발문서 생태계와 관리 체계](개발문서 생태계와 관리 체계.md)                                                                                              |
| doc_id         | [doc*id*레지스트리](doc_id_레지스트리.md)                                                                                                    |
| 도메인            | [TDD-071](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md)                                                                             |
| Physical · Hub | [TDD-040](08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) · [TDD-075](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md) |
| Cosmic · Axon  | [TDD-043](08_TDD/Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) · [TDD-044](08_TDD/Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md)                  |
| nexia 스택       | [TDD-010](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md)                                                                                 |
| nexia UI       | [UIX-004](07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md)                                                                            |
| BAX            | [UIX-003](07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처_v1.0.md)                                                                              |
| Nixie          | [TDD-061~064](08_TDD/NEXIA/Nixie/)                                                                                                 |


---

## 부록 C — 상세 서사 (이전 §3.3~3.6 요약 보존)

> **DIEA ↔ Nexaon:** DIEA = 7 Facet 작업면 · Nexaon = Cold Path Distillation 오케스트레이터 (Logex ontology). Facet 산출은 never 직접 promoted — Nexaon·승인·SHACL 경유 ([TDD-071 §2.1.2](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md)).

> **Nixie Reflex vs Nexaon Strategic:** Nixie(ML1) = Express·알림 · Nexaon(ML3) = Run·promoted. Run 트리거·Router fan-out **✗**.

> **NEXU · BAX · NIXIE 3층:** Knowledge 페브릭 → 미적 레이아웃 → ML1 Express. Canvas/BAX **혼용 ✗**.

> **Navex · NISE:** Intelligent = hybrid 검색 · Infra = InfraTree. Omnix discover → `navex_search` tool ([PRD-014](05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md)).

> **혼동 방지 (번호 체계):** ML0–ML3 ≠ PT-0–3 ≠ T1–T3 ≠ AXON-AL1–7 ≠ UI-L* ≠ NexiaWorkspace L* — **동일 표기 금지**.

## 네이밍 컨벤션(Naming Convention, 명명 규칙)

#### 1. 단어 조합에 따른 4대 표기법

##### ① 카멜 케이스 (Camel Case / 소문자 시작, 중간 대문자)

첫 단어는 소문자로 시작하고, 그다음 이어지는 단어의 첫 글자만 대문자로 표기합니다. 낙타(Camel)의 등 모양을 닮았다고 해서 붙여진 이름입니다. [2, 3, 4]

- 예시: `userName`, `boardList`, `calculateTotalPrice`
- 주로 쓰는 곳: 자바스크립트, 자바 등의 변수명, 함수명 [5]

##### ② 파스칼 케이스 (Pascal Case / 접두어 대문자 / 대문자 시작) [6, 7]

질문하신 '접두어 대문자(모든 단어의 첫 글자를 대문자)'로 쓰는 규칙입니다. [8]

- 예시: `UserName`, `BoardList`, `CreateOrder`
- 주로 쓰는 곳: 대부분의 프로그래밍 언어에서 클래스(Class)명, 컴포넌트명 [9]

##### ③ 스네이크 케이스 (Snake Case / 모두 소문자 + 언더바)

단어와 단어 사이를 밑줄(`_`)로 연결합니다. 뱀(Snake)처럼 기어가는 모양에서 유래했습니다. [10, 11]

- 예시: `user_name`, `board_list`
- 주로 쓰는 곳: 파이썬 변수/함수명, 데이터베이스(DB) 필드명 [12]

##### ④ 케밥 케이스 (Kebab Case / 모두 소문자 + 대시) [13]

단어와 단어 사이를 대시(`-`)로 연결합니다. 꼬치구이(Kebab) 모양에서 유래했습니다. [14, 15, 16]

- 예시: `user-name`, `main-button`
- 주로 쓰는 곳: 웹사이트 주소(URL), CSS 클래스명

#### 2. 특정 의미를 담는 접두어 규칙 (Prefix)

질문하신 내용 중 특정 목적을 위해 앞에 대문자나 소문자를 붙이는 규칙은 다음과 같은 전문 용어로 부릅니다.

- 헝가리안 표기법 (Hungarian Notation): 변수명 앞에 데이터의 종류(타입)를 나타내는 접두어를 붙이는 규칙입니다. (예: 정수형 변수 앞에 `i`를 붙여 `iAge`, 문자열 앞에 `str`을 붙여 `strName`)
- 상수 표기법 (Constant Notation): 절대 변하지 않는 상수를 표현할 때 '모두 대문자'로 쓰고 단어를 언더바로 연결합니다. (예: `MAX_WIDTH`, `API_KEY`) [17, 18]

#### Rule Validator 노드와의 연관성

앞서 배운 랭그래프의 Rule Validator(규정 심사관) 노드에 "우리 프로젝트는 변수명에 파스칼 케이스만 허용한다"라는 네이밍 컨벤션 장부를 등록해 두면, LLM이 `user_name`이라고 스네이크 케이스로 코드를 짰을 때 입구 컷(분기)을 시키고 다시 짜오게 만들 수 있습니다.
혹시 지금 개발 중이신 파이프라인에서 특정 언어(예: 파이썬 또는 자바스크립트)의 표준 네이밍 컨벤션 검사기를 Rule Validator 노드에 자동으로 연동하고 싶으신가요? 방법이 필요하시면 알려주세요!
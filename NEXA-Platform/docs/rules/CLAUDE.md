# NEXA 핵심 규칙 (Core Rules)

> AI가 코드를 생성하기 전 반드시 인지해야 하는 NEXA 고유 정체성과 도메인 지식.

---

## 1. 역할 정의

너는 **NEXA 지능형 운영체제(NEXA-OS)** 아키텍처를 이해하는 **시니어 풀스택 시스템 엔지니어**다.

- 유지보수가 쉽고 성능 최적화된 코드를 지향한다.
- 답변은 **간결하게 한글**로 하되, 기술 용어는 원문을 유지한다.
- NEXA의 핵심 원칙: **"기술은 배경으로 숨고, 사용자의 사유가 전면으로 부상한다."**
- 코드 생성 시 반드시 `NEXA-Platform/docs/` 아래 기획 문서를 최우선으로 참조한다.

---

## 2. 핵심 아키텍처 용어

> 상세 정의는 용어집(`docs/Nexnap 00 NEXA-OS GLOSSARY 용어집 .md`) 참조.

| 용어           | 의미                                                                                                |
| :------------- | :-------------------------------------------------------------------------------------------------- |
| **NEXA-OS**    | 지식을 연산하여 실행을 도출하는 지능형 운영체제                                                     |
| **Nexnap**     | NEXA Meta Action Protocol — 사람의 의도를 기계 동작으로 연결하는 표준 설계도                        |
| **HEXAGON**    | 모든 데이터 패킷의 6축(5W1H) 정수 토큰 골격                                                         |
| **COILS**      | AI 판단의 주관적 가치 가중치 밸런서 (Safety, Stability, Compliance, Efficiency, Autonomy, Creative) |
| **N-PATH**     | NEXA Narrative Path — 지식의 추적 가능한 경로 체계 (DB: `nexa_knowledge_traceability_paths`)        |
| **N-BASE**     | NEXA Basic Asset & Standard Environment                                                             |
| **N-CORE**     | NEXA Central Operating Resource Entity                                                              |
| **Identity**   | 객체의 불변 정체성 (DB: `nexa_identities`) — 변경 불가 원칙                                         |
| **Capability** | Identity가 행사하는 권능·수단 (DB: `nexa_system_capabilities`)                                      |

---

## 3. 오케스트레이션 흐름

```
사용자 WILL → Sentinel 감지(TICK) → HEXAGON 정규화
→ Indicator 판단(ECHO) → 확신 부족 시 ASK
→ 사용자 승인(WILL) → GOVERN 승격 → ERA 박제
```

- **STUCK**: 저확신·충돌 상태 → Jitter 연출 → ASK 발생
- **Why Chain**: `[사실(SNT) → 판단(IND) → 실행(EFF)]` 인과 사슬
- **Late Anchoring**: 개념 노드에 실제 파일·자산을 사후 연결

---

## 4. 4단계 지능 위계

| 레벨          | 명칭              | 역할                             | HW 프로필 |
| :------------ | :---------------- | :------------------------------- | :-------- |
| 1             | 제니스 인디케이터 | 전략적 뇌 (Nexnap Composer)      | HOT       |
| 2 (생략 가능) | 키네틱 컨트롤러   | 현장 지휘관 (Nexnap Interpreter) | WARM      |
| 3 (생략 가능) | 마이크로 센티널   | 인식 지능 (Nexnap Awareness)     | WARM      |
| 4             | 나노 센티널       | 반사 신경 (Nexnap Reflex)        | COLD      |

---

## 5. Nexion 도메인

- **Nexion**: 개발자의 "사고의 칠판" — Why Chain·N-PATH·Late Anchoring을 관리하는 관제 데스크
- **3패널 레이아웃**: 왼쪽(탐색·목록) + 중앙(Vue Flow 캔버스) + 오른쪽(속성 편집)
- **Store**: `src/domains/nexion/modules/core/stores/nexionFlowStore.ts`

---

## 6. 문서 참조 (Document Discovery)

> `.cursorrules`와 규칙 파일에 개별 문서 경로를 하드코딩하지 않는다.

| 진입점          | 역할              | 경로                                    |
| :-------------- | :---------------- | :-------------------------------------- |
| **용어집**      | 개념 정의 (What)  | `docs/@ GLOSSARY NEXA-OS 용어집  .md`   |
| **문서 인덱스** | 문서 탐색 (Where) | `docs/@ INDEX NEXA 문서 탐색 가이드.md` |

- 문서를 찾아야 할 때: **문서 인덱스**의 폴더 구조·접두어 규칙을 따라 탐색
- 용어·개념을 확인해야 할 때: **용어집** 참조

# 상세 아이디어

사용자님께서 제안하신 **NEXA Nexion(넥시온)**의 탭 기반 인터페이스와 AI 협력 툴 중심의 구성은 "생각을 잃어버리지 않게 만드는 독립형 관제 데스크"라는 본연의 정체성을 강화하는 매우 효율적인 구조입니다.

제공된 소스 문헌과 논의된 기술 스택(Vue Flow, TipTap, Ollama 등)을 바탕으로, 제안하신 아이디어를 구체화하여 **Nexion UI/UX 상세 설계 확장안**을 정리해 드립니다.

### 1. 왼쪽 패널: 리소스 탐색기 (ExplorerTree - Tabbed)

물리적 파일 구조와 논리적 프로젝트 자산을 분리하여 '선 설계 후 연결'의 편의성을 극대화합니다.

- **Tab 1. 프로젝트 (Blackboard Items):**
  - **역할:** 저장된 칠판(캔버스) 레이아웃 및 프로젝트 단위의 오케스트라 템플릿 목록을 관리합니다.
  - **기능:** `project_orchestra` 및 `canvas-layout` 데이터를 호출하여 사용자가 이전에 작업하던 사유의 맥락을 즉시 복원합니다.
- **Tab 2. 파일 (Physical NFS Tree):**
  - **역할:** `NEXA-Documentation/` 루트 하위의 실제 물리 디렉터리 구조를 투영합니다.
  - **기능:**
    - **DnD 이동:** 폴더/파일 드래그 시 시스템 내부적으로 `mv` 명령과 동기화되어 실제 경로가 변경됩니다.
    - **Inode 기반 이름 변경:** 더블클릭으로 파일명을 변경해도 `anchor_id`는 유지되어 캔버스 노드와의 연결이 끊기지 않습니다.
    - **멀티 셀렉터:** 여러 파일을 한꺼번에 선택하여 특정 노드(Link ID)로 일괄 귀속시키는 기능을 지원합니다.
- **Tab 3. 고아 파일 (Orphaned Assets):**
  - **역할:** 물리적으로는 존재하지만 캔버스 노드와 연결(`doc_node_links`)되지 않은 신규/누락 파일들을 따로 모아 보여줍니다.
  - **기능:** 이 탭의 파일을 캔버스로 DnD 하면 즉시 'Late Anchoring'이 발생하며 기능 자격(Capability ID)이 부여됩니다.

### 2. 중앙 컨텐츠: 주 작업 영역 (Workspace - Tabbed)

사유의 시각화(Canvas)와 기록의 정교화(Editor)를 탭으로 분리하여 작업 몰입도를 높입니다.

- **Tab 1. 노드 캔버스 (Vue Flow):**
  - **역할:** 논리 뼈대를 설계하고 지능적 족보(Why Chain)를 그리는 공간입니다.
  - **기능:**
    - **다양한 라인 옵션:** 물리적 연결(NFS), 논리적 의존성(Link), 인과 사슬(Why Chain) 등 선의 성격에 따라 실선/점선/색상을 다르게 표현합니다.
    - **시맨틱 줌(Fractal Zoom):** 줌 레벨에 따라 노드 내부의 5W1H 상세 정보가 폭발(Explosion)하거나 함몰(Implosion)되는 LOD 연출을 적용합니다.
- **Tab 2. 문서 에디터 (TipTap):**
  - **역할:** 파일 아이템의 편집 버튼 클릭 시 열리며, 실제 마크다운 본문을 수정하는 공간입니다.
  - **기능:**
    - **MD 파서 (Enc/Dec):** 사용자가 작성한 텍스트를 시스템 표준인 '영문 IR'과 'HEXAGON 토큰'으로 인코딩하여 저장하고, 다시 한국어 요약으로 디코딩하여 보여줍니다.
    - **실시간 해시 갱신:** 저장 시 `source_hash`를 즉시 갱신하여 크롤러와의 정합성을 유지합니다.

### 3. 오른쪽 패널: 상세 제어 및 AI 협력 (Attribute & AI Tools)

선택한 객체에 '판단의 무게'를 부여하고 AI의 도움을 받는 전용 패널들입니다.

- **용어 추출기 (Terms Inspector):** Ollama 전역 엔진을 호출하여 현재 문서에서 핵심 용어와 Capability 후보를 추출하고 `fit_score`를 제안합니다.
- **의도 중력 설정 (Intent Gravity):** 사용자의 관심도에 따라 노드의 발광(Lumina) 강도와 떨림(Jitter) 임계값을 수동/자동으로 조절합니다.
- **상주 정책 관리 (Residency Control):** 해당 지식 자산을 L1(캐시)에 상주 시킬지 L3(아카이브)로 보낼지 결정하는 VOID 스왑 정책을 설정합니다.

### 4. 구현 전략 및 로드맵 반영 (Phase 1 ~ 2)

이 아이디어들은 **Phase 1(UI 프로토타이핑)**에서 시각적 경험을 먼저 확정하고, **Phase 2(DB 뼈대)**에서 `nexa_knowledge_*` 테이블들과 API로 연동되는 흐름으로 진행됩니다.

특히 **왼쪽 트리의 탭 분리**는 고아 자산을 식별하고 'Late Anchoring' 워크플로우를 완성하는 데 핵심적인 역할을 하게 될 것입니다.

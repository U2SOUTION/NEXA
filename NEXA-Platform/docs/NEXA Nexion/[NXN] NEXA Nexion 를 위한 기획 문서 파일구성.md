**NEXA Nexion**을 위한 기획 문서 파일명 구성은 NEXA 플랫폼의 표준 네이밍 규칙인 **`[Context] [DocType] [제목].md`** 형식을 적용한다.

이 규칙은 AI(제니스 인디케이터)가 파일명만으로도 **1ms 내에 문서의 성격과 위치를 90% 이상 판별**할 수 있게 하며, 지능적 족보(Traceability)를 완성하는 기초다.

**네이밍 취지:** 시스템 내부에서 흔히 쓰이는 일반어 `Composer` 대신, 제품 고유 코드 **`NXN`(Nexion)**을 컨텍스트로 써서 다른 모듈·타 제품과 충돌하지 않게 한다.

**_KNOWLEDGE와의 관계:** 지식·문서 DB·운영 규약의 **기획 기준은 `docs/_KNOWLEDGE*.md`**(특히 DDL SSOT·SPEC)이다. Nexion은 그 구현을 준비하던 과정에서 **모든 문서를 한 그림으로 다루는 편집·추적 데스크**로 범위가 넓어졌고, **구현은 Nexion을 먼저** 가져갈 수 있으나, 공유 테이블(`nexa_knowledge_*` 등)의 **스키마 진실은 _KNOWLEDGE에 수렴**시킨다.

**Nexion ≠ 플랫폼 `project`:** `project_id`·`project_members`는 통합 DB·RLS의 **테넌트 구획**이지 Nexion 제품 정의의 중심이 아니다. 확장(Extension) 등은 **별도 프로그램**이다. 상세는 `[NXN] [CNCP] NEXA Nexion 지식 OS 관리 및 악보 설계 철학.md` **§1.1**.

**진행·요구사항 SSOT:** `[NXN] [PRD] Nexion 기능과 작업 순서.md` — 기능 범위, **Phase 1~4·Ext 순서**, DoD, `_KNOWLEDGE` 필드 정합 이슈(체크리스트). **실행용 `[ ]` 항목**은 `[NXN] NEXA Nexion 개발 순서와 체크 리스트.md`(Phase 번호는 PRD와 동일).

**문서 읽기 계층(비중):**

| 계층 | 문서(예시) | 용도 |
|------|------------|------|
| **본문(핵심)** | `[NXN] [PRD]`, `[NXN] [CNCP]`, `[NXN] [UIUX]`, `[NXN] [ARCH] NFS ...`, `[NXN] [SCHM]`, `[NXN] [DDL]`, `[NXN] [API]` | PRD는 **진행·Phase SSOT**; 나머지는 제품 정의·스키마·API·NFS **직접 근거**. |
| **부록·참고** | `NEXA 부록-협업 스택·큐·오케스트레이션 흐름·머메이드.md`, 플랫폼 `__NEXA 오케스트레이션 스키마 DDL v5` 등 | 오케스트레이션·협업 스택 **맥락**; Nexion 코어 구현 순서의 **선행 조건로 두지 않음**(Tier B·배포 시 맞춤). |

구현 티어(Tier A/B)·**코어 Phase 순서**는 `[NXN] [PRD] Nexion 기능과 작업 순서.md` **§3.2**를 SSOT로 하고, 티어 표·체크박스는 `[NXN] NEXA Nexion 개발 순서와 체크 리스트.md` 서두, API 분리는 `[NXN] [API] ...` **§1.1**을 본다.

---

### 1. 컨텍스트 코드(Context) 정의

- **`NXN` (Nexion):** 본 제품(지식 맵·Vue Flow·NFS 연동 데스크) 기획 문서의 기본 코드.
- **`KOS` (Knowledge OS):** 지식 운영체제 관리 기능을 강조할 때 사용.
- **`UCL` (Unified Composition Language):** 악보 설계 및 파싱 로직 중심의 문서에 사용.

### 2. 문서 유형(DocType) 코드

- **`CNCP` (Concept):** 철학, 전략, 서사적 배경 설계.
- **`ARCH` (Architecture):** 시스템 구조, 노드 연결 및 위상 연산 로직.
- **`SPEC` (Specification):** 기능 제원, API 계약, 5W1H 매핑 규격.
- **`UIUX` (Interface):** Vue Flow 노드 연출, **§4.3.1 NEXA NIXIE 시각 규약**, Lumina·Jitter·`nixie_lumina_profile` 정합.
- **`SCHM` (Schema):** 지식 베이스 및 Capability ID 연동 DDL(명세).
- **`DDL` (DDL):** 실행 가능한 CREATE/INDEX/TRIGGER/RLS 등 쿼리 모음(명세와 분리).
- **`PRD` (Product Requirements):** 요구사항, 구현 순서·전략, DoD, Phase 번호 SSOT(§3.2).

---

### 3. NEXA Nexion 기획 문서 파일명(현재 폴더 기준)

#### **[Phase 0] 요구사항·진행 그림 (SSOT)**

- `[NXN] [PRD] Nexion 기능과 작업 순서.md`

#### **[Phase 1] 개념 및 철학 (Core Philosophy)**

- `[NXN] [CNCP] NEXA Nexion 지식 OS 관리 및 악보 설계 철학.md`
- `[NXN] [CNCP] 개발자 중심의 지능 자산화 및 Expert 모드 운영 전략.md`

#### **[Phase 2] 시스템 설계 및 아키텍처 (Architecture)**

- `[NXN] [UIUX] NEXA Nexion 인터페이스 레이아웃 및 Vue Flow 운영 규약.md`
- `[NXN] [SPEC] NEXA Nexion 확장 프로그램(Extension) 기능 명세.md`

#### **[Phase 3] 데이터 및 인터페이스 규격 (Spec & Schema)**

- `[NXN] [SCHM] NEXA Nexion 독립형 인덱스 및 자산 관리 스키마.md` (필드·상태·규칙 명세)
- `[NXN] [DDL] NEXA Nexion 독립형 인덱스 및 자산 관리 DDL.md` (CREATE·인덱스·RLS·트리거·예시 쿼리)
- `[NXN] [API] NEXA Nexion API 및 통신 규약.md` — REST v1, NFS·동기화·링크·본문·캔버스·용어 추출

**스키마와 직결되는 데이터 축:**

- **지능형 서사 파일 시스템(NFS) 인덱스:** 물리 폴더 구조와 논리 카드 계층을 연결하는 `nexa_knowledge_traceability_paths` 테이블이 핵심이다. **Inode** 역할로 탐색기에서의 위치 변경을 앵커 ID로 추적한다.
- **문서 동기화 및 해시 관리:** 외부 탐색기 변화의 **상태 머신(유예·삭제)** 은 `nexa_knowledge_traceability_paths` + SCHM **§4.4.1**; `nexa_knowledge_doc_sync_state`는 해시·잡·다도메인 **보조 헬스**(SPEC §2.2·SCHM §6).
- **Link ID 및 접두어 매핑:** 카드별 Link ID(접두어)와 실제 파일명을 양방향으로 동기화하기 위한 참조 무결성 제약이 필요하다.
- **고아 자산(Orphaned) 관리:** 노드와 연결되지 않은 문서를 식별하기 위한 `status` 및 Nexion 전용 연결 테이블 `nexa_knowledge_nexion_doc_node_links`가 정의된다.

### 4. DDL 이후에 필요한 보완 문서

- **`[NXN] [API] NEXA Nexion API 및 통신 규약`:** Vue Flow와 백엔드, Ollama 전역 엔진 사이의 **REST v1·JSON** 계약(초안 반영, OpenAPI화 권장).
- **`[NXN] [ARCH] NFS 보안 및 외부 자산 연동 설계서` §3:** Doc Sync Crawler·배치 잡 관련 **구현 체크리스트**(경로·동기화 무결성·거버넌스·UX). 스캔 주기·해시·Soft 처리 방향은 여기서 아키텍처 범위로 정리하고, 세부 계약은 API·오케스트레이션 SSOT와 맞춘다.
- **`[NXN] [GUIDE] 개발자용 Nexion 활용 가이드`:** 백지에서 뼈대를 그리고 Late Anchoring을 수행하는 워크플로우.

### 5. 최종 단계: 오케스트레이션 엔진과의 결합

NEXA Nexion에서 정리된 설계·악보는 **오케스트레이션 DB**의 `execution_chains` 및 `project_knowledge`로 흡수될 수 있다. DDL 작성 시 Nexion의 독립 결과물이 전체 **지능적 족보(Traceability)**로 어떻게 매핑되는지 로직을 확정하는 것이 중요하다.

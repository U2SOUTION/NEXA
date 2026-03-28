## 구현 티어(Tier A / Tier B)

철학·부담 분리는 `[NXN] [CNCP] NEXA Nexion 지식 OS 관리 및 악보 설계 철학.md` **§1·§1.1**과 정합한다. 스키마·API·Phase는 아래 **두 티어**로 고정한다. 상세 매핑은 `[NXN] [SCHM] NEXA Nexion 독립형 인덱스 및 자산 관리 스키마.md` **§2.2**, API는 `[NXN] [API] NEXA Nexion API 및 통신 규약.md` **§1.1**을 본다.

### Tier A — Nexion 코어(독립형 관제 데스크 최소 기능)

| 항목 | 내용 |
|------|------|
| **목표** | 문서·지식 범위의 **관계·족보·외부 자산 참조**만 확보. 플랫폼 전 스택·오케스트레이션 전제 없음. |
| **필수 테이블** | `nexa_knowledge_traceability_paths`, `nexa_knowledge_nexion_doc_node_links`, `nexa_knowledge_doc_sync_state`(크롤러·저장 경합에 필요한 **최소 컬럼** 위주로 시작 가능). |
| **초기 제외(후행)** | `nexa_knowledge_residency`(VOID·스왑 원장) — **Tier B**. |
| **traceability 사용 범위** | 초기에는 **`anchor_domain` = `knowledge`** 중심 행만 채워도 됨. `orchestration`·`device` 등 광의 도메인·NIXIE DB 연동은 **Tier B**. |
| **선택 컬럼** | `nixie_lumina_profile` 등은 **NULL 허용** 전제 — Tier A에서 UI 로컬 파생으로 시작 가능. |
| **API** | **REST v1 Core**(§1.1 목록)만 Phase 1 계약으로 고정. |
| **RLS·`project_members`** | 단일 사용자·로컬 PoC에서는 비활성 또는 단일 구획; **전면 적용은 Tier B**. |

### Tier B — 플랫폼 공유·운영 완성도

| 항목 | 내용 |
|------|------|
| **목표** | 통합 DB·테넌시·다도메인 동기화·감사와 정합. |
| **추가·전개** | `nexa_knowledge_residency`, `doc_sync_state` **전 필드·`lock_metadata`·책임 도메인**, traceability **전 `anchor_*`·NIXIE 프로파일 DB 반영**, 스왑·동기화 **정책 시드·FK 원장**. |
| **보안 배포** | RLS 전면, `project_members`·`nxn_user_project_ids()` 등 플랫폼 표준. |
| **API** | **Extended**(캔버스 레이아웃, 용어 추출 엔진, 내부 크롤 리포트 등 §1.1). |

### Phase ↔ 티어 매핑(요약)

- **Phase 1:** **1-A(필수)** = Tier A 테이블·제약·Core API 전제. **1-B(선택)** = Tier B 테이블 + 정책 시드·RLS 전제.
- **Phase 2~4:** Tier A 중심(크롤러, Vue Flow, Late Anchoring).
- **Phase Ext:** TipTap·Ollama 등 — **Extension 별도 트랙**. `[NXN] [SPEC] NEXA Nexion 확장 프로그램(Extension) 기능 명세.md` 참고. **코어 Phase 번호와 혼동하지 않는다.**
- **Phase B-ops(구 Phase 6에 해당):** Tier B — NIXIE·RLS·감사·residency 연동.

---

### Phase 1-A: 지식 운영체제(Knowledge OS) 기반 DB — **Tier A**

가장 먼저 수행할 작업은 시스템의 뼈대를 만드는 것이다. Nexion은 독립형 데스크이지만, 데이터는 플랫폼 전체의 진실원(SSOT)인 `nexa_knowledge_*` 계층과 정합되어야 한다.

- **[ ] Tier A 핵심 테이블 생성:** `nexa_knowledge_traceability_paths`, `nexa_knowledge_nexion_doc_node_links`, `nexa_knowledge_doc_sync_state`를 DDL·SCHM에 따라 생성한다. **`residency`는 이 단계에서 생략 가능**(Tier B).
- **[ ] Inode 식별자 확정:** 파일 위치가 바뀌어도 추적 가능한 `doc_anchor`(UUID) 유니크 제약과 `path_id` PK 체계를 확인한다.
- **[ ] Tier A 정책 최소화:** Tier A만 배포할 때는 스왑·동기화 **원장 FK·시드**를 강제하지 않아도 된다(컬럼·FK는 SCHM·DDL의 **선택 배포** 절을 따름). Tier B로 갈 때 시드·FK를 맞춘다.

### Phase 1-B: 플랫폼 공유 스키마 — **Tier B(선택)**

- **[ ] `nexa_knowledge_residency` 및 연관 원장:** VOID·스왑 상주 원장과 SCHM §5 정합.
- **[ ] 정책 데이터 시드:** 시스템 기본 스왑·동기화 정책 시드 주입으로 FK 참조 오류를 방지한다.
- **[ ] RLS·멤버십(선택):** 공유 배포 시 `project_members` 정렬 DDL·RLS 활성화를 계획한다.

### Phase 2: 백엔드 핵심 — Doc Sync Crawler 구현

Nexion의 핵심은 물리적 폴더 구조를 지능적 서사(NFS)로 변환하는 것이다. 백그라운드에서 파일 시스템을 감시하는 크롤러를 먼저 구축한다.

- **[ ] 파일 시스템 스캔 로직:** `DOCS_PATH`가 가리키는 **`NEXA-Documentation/`** 트리를 스캔하여 폴더명(Link ID)과 파일명(순수 제목)을 추출하는 기능을 구현한다(`[NXN] [ARCH] NFS ...` §1.1).
- **[ ] 해시(Hash) 기반 변경 감지:** 파일 내용의 `source_hash`를 비교하여 `doc_sync_state`를 `changed` 또는 `ok`로 갱신하는 로직을 작성한다.
- **[ ] 상태 전이 관리:** `nexa_knowledge_traceability_paths`의 `missing_since`·`status`는 **`[NXN] [SCHM] ...` §4.4.1 표(크롤러 상태 머신)** 를 그대로 구현한다. 유예 중에는 `active`+`missing_since`, 확정 시에만 `deleted` 등.

### Phase 3: 프론트엔드 기초 — 3단 레이아웃 및 Vue Flow

사용자가 체감하는 사고의 칠판을 구성한다. 표준 3단 패널 레이아웃을 채택하여 작업 효율을 높인다.

- **[ ] 3-Panel 레이아웃 구성:** 좌측(탐색기), 중앙(Vue Flow 캔버스), 우측(속성 편집기) 구조를 잡는다.
- **[ ] Vue Flow 연동:** 노드를 드래그 앤 드롭으로 배치하고 `node_id`를 생성하는 기초 기능을 구현한다.
- **[ ] 무한 줌(Fractal Zoom) 기초:** 마침표(.) 계층 구조에 따라 노드가 폭발/함몰될 수 있도록 `depth` 필드와 연동한 필터링 로직을 준비한다.

### Phase 4: 지능 자산 연결 — Late Anchoring 로직

설계도(노드)와 실제 자산(파일)을 연결하는 Nexion만의 핵심 워크플로우를 구현한다.

- **[ ] 노드-앵커 매핑:** `nexa_knowledge_nexion_doc_node_links` 테이블을 통해 Vue Flow 노드와 `doc_anchor`를 연결한다.
- **[ ] 고아 자산(Orphaned) 식별:** 어떤 노드에도 연결되지 않은 파일을 탐색기 상단에 별도로 표시하는 필터를 구현한다.
- **[ ] 물리적 이동(mv) 자동화:** 노드 위치 변경 시 실제 디스크의 폴더 구조를 변경하거나 제안하는 동기화 승인(ASK) 팝업을 연동한다.

### Phase Ext: 편집 및 지능 확장 — TipTap 및 Ollama(**Extension 트랙**)

문서 편집·용어 추출은 **Nexion 코어와 분리된 확장**이다. 일정·버전은 코어 Phase와 독립한다.

- **[ ] TipTap 에디터 통합:** 좌측 드로어에서 파일 클릭 시 중앙 탭에 에디터를 열고, 저장 시 `source_hash`를 갱신하도록 구현한다.
- **[ ] Ollama 용어 추출 엔진:** 편집 중인 문서에서 핵심 용어를 추출하여 우측 Terms Inspector에 보여주는 전역 엔진 호출 로직을 붙인다(API **Extended**).
- **[ ] 영문 IR(중간 표현) 박제:** 노드 속성창에서 번역 액션을 통해 AI가 이해할 수 있는 영문 메타데이터를 저장하는 기능을 추가한다.

### Phase B-ops: 거버넌스 및 시각적 피드백(NIXIE) — **Tier B**

시스템 신뢰도 시각화·보안 정책은 **플랫폼 배포 단계**에 맞춘다.

- **[ ] Lumina & Jitter 연출:** `confidence_score`가 임계값(95) 미만일 때 노드가 미세하게 떨리는(Jitter) 시각 효과를 Vue Flow에 적용한다. Tier A에서는 클라이언트 파생만으로도 시작 가능(`[NXN] [API]` §10).
- **[ ] RLS(행 수준 보안) 활성화:** 사용자의 소속 프로젝트(`project_id`)에 따라 데이터 접근을 격리하는 DB 정책을 활성화한다(Tier B).
- **[ ] 감사 로그(Audit Log) 연동:** 상태 변경(`active` → `moved` 등) 시 `related_audit_id`를 남겨 지능적 족보(Traceability)를 완성한다.

---

**개발 시작 전 최종 체크리스트:**

- [ ] **PostgreSQL 확장 확인:** `vector`, `timescaledb`, `pg_uuidv7` 설치 완료 여부.
- [ ] **UUID v7 함수:** 시간순 정렬을 위한 `uuid_generate_v7()` 함수 등록 여부.
- [ ] **디렉터리 권한:** 백엔드 크롤러가 **`DOCS_PATH`(`NEXA-Documentation/` 등)** 를 읽고 쓸 수 있는 권한 확보 여부.
- [ ] **개발 전략:** 복잡한 오케스트레이션 로직 이전에 **NFS 인덱싱 정합성**을 최우선으로 확보할 것.
- [ ] **티어 선택:** PoC는 **Tier A + Core API**만으로도 충분한지, **Tier B** 일정을 별도로 잡았는지 명시한다.

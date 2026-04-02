## 구현 티어(Tier A / Tier B)

**Phase 번호 SSOT:** 코어 **Phase 1~4·Phase Ext** 순서는 `[NXN] [PRD] Nexion 기능과 작업 순서.md` **§3.2·§3.4** 와 **동일**해야 한다. 본 문서는 티어 정의와 **실행 체크박스**를 담는다.

철학·부담 분리는 `[NXN] [CNCP] NEXA Nexion 지식 OS 관리 및 N-PATH(지도) 설계 철학.md` **§1·§1.1**과 정합한다. **`project_id` 필수(DDL·API) = 테넌트 격리; Nexion ≠ 워크플로 프로젝트 도구** — 구현 시 **CNCP §1.2**, **API §2.2.1**, **SCHM §2.1**을 먼저 읽는다. 스키마·API·Phase는 아래 **두 티어**로 고정한다. 상세 매핑은 `[NXN] [SCHM] NEXA Nexion 독립형 인덱스 및 자산 관리 스키마.md` **§2.2**, API는 `[NXN] [API] NEXA Nexion API 및 통신 규약.md` **§1.1**을 본다.

### Tier A — Nexion 코어(독립형 관제 데스크 최소 기능)

| 항목                       | 내용                                                                                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **목표**                   | 문서·지식 범위의 **관계·족보·외부 자산 참조**만 확보. 플랫폼 전 스택·오케스트레이션 전제 없음.                                                                          |
| **필수 테이블**            | `nexa_knowledge_traceability_paths`, `nexa_knowledge_nexion_doc_node_links`, `nexa_knowledge_doc_sync_state`(크롤러·저장 경합에 필요한 **최소 컬럼** 위주로 시작 가능). |
| **초기 제외(후행)**        | `nexa_knowledge_residency`(VOID·스왑 원장) — **Tier B**.                                                                                                                |
| **traceability 사용 범위** | 초기에는 **`anchor_domain` = `knowledge`** 중심 행만 채워도 됨. `orchestration`·`device` 등 광의 도메인·NIXIE DB 연동은 **Tier B**.                                     |
| **선택 컬럼**              | `nixie_lumina_profile` 등은 **NULL 허용** 전제 — Tier A에서 UI 로컬 파생으로 시작 가능.                                                                                 |
| **API**                    | **REST v1 Core**(§1.1 목록)는 **Phase 2 초반**에 계약 고정·mock/최소 연결(PRD §3.3). Phase 1만 장기간 단독 진행은 지양.                                                 |
| **RLS·`project_members`**  | 단일 사용자·로컬 PoC에서는 비활성 또는 단일 구획; **전면 적용은 Tier B**.                                                                                               |

### Tier B — 플랫폼 공유·운영 완성도

| 항목          | 내용                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **목표**      | 통합 DB·테넌시·다도메인 동기화·감사와 정합.                                                                                                                                     |
| **추가·전개** | `nexa_knowledge_residency`, `doc_sync_state` **전 필드·`lock_metadata`·책임 도메인**, traceability **전 `anchor_*`·NIXIE 프로파일 DB 반영**, 스왑·동기화 **정책 시드·FK 원장**. |
| **보안 배포** | RLS 전면, `project_members`·`nxn_user_project_ids()` 등 플랫폼 표준.                                                                                                            |
| **API**       | **Extended**(캔버스 레이아웃, 용어 추출 엔진, 내부 크롤 리포트 등 §1.1).                                                                                                        |

### Phase ↔ 티어 매핑(요약, PRD §3.2 정합)

- **Phase 1:** UI·Vue Flow·3패널(`nexion` 도메인). DB 없이도 프로토타입 가능하나, **PRD 권장 순서는 시각 경험 선행**.
- **Phase 2:** Tier A 테이블·제약 + Core API 고정(§3.3). **Phase 2-B(선택)** = 아래 Tier B 선행 블록(정책 시드·`residency` 등).
- **Phase 3:** Doc Sync Crawler — N-PATH 인덱스·`doc_sync_state` 정합.
- **Phase 4:** Late Anchoring·고아·mv — `nexion_doc_node_links` 중심.
- **Phase Ext:** TipTap·Ollama 등 — **Extension 별도 트랙**. `[NXN] [SPEC] NEXA Nexion 확장 프로그램(Extension) 기능 명세.md` 참고.
- **Phase B-ops:** Tier B 운영 완성 — NIXIE·RLS·감사·`residency` 연동.

---

### Phase 1: UI 프로토타이핑 — Vue Flow·3패널 (**PRD §3.2-1**)

**사고의 칠판** 정체성을 위해 시각·인터랙션을 먼저 확정한다. Nexion은 독립형 데스크이나, 데이터는 이후 `nexa_knowledge_*` 와 맞춘다.

- **[ ] `nexion` 도메인 셸:** `src/domains/nexion/`, `domainRegistry` 3슬롯(UIUX §2.2).
- **[ ] 3-Panel 레이아웃:** 좌(탐색·트리 자리), 중(Vue Flow), 우(속성 자리)(UIUX §2.1).
- **[ ] Vue Flow 연동:** 노드 DnD, 엣지, `node_id` 생성 기초.
- **[ ] (선택) Phase 1a → 1b 분할:** 1a 껍데기만 → 1b 캔버스 최소(PRD §3.2 주석).
- **[ ] 무한 줌(Fractal Zoom) 기초:** `depth`·줌 연동·시맨틱 줌 개념(UIUX §4.2).

### Phase 2: DB 뼈대 — Tier A (**PRD §3.2-2**)

- **[ ] Tier A 핵심 테이블 생성:** `nexa_knowledge_traceability_paths`, `nexa_knowledge_nexion_doc_node_links`, `nexa_knowledge_doc_sync_state`를 DDL·SCHM에 따라 생성한다. **`residency`는 생략 가능**(Tier B).
- **[ ] Inode 식별자 확정:** `doc_anchor`(UUID) 유니크·`path_id` PK 체계 확인.
- **[ ] Tier A 정책 최소화:** 스왑·동기화 원장 FK·시드는 SCHM·DDL **선택 배포**; Tier B에서 보강.
- **[ ] Core API 선행 고정:** `[NXN] [API]` Core 목록·mock 또는 최소 구현으로 UI와 연결(PRD §3.3).

### Phase 2-B(선택): 플랫폼 공유 스키마 — **Tier B 조기**

- **[ ] `nexa_knowledge_residency` 및 연관 원장:** SCHM §5 정합.
- **[ ] 정책 데이터 시드:** 스왑·동기화 시드.
- **[ ] RLS·멤버십(선택):** `project_members`·RLS 계획.

### Phase 3: 백엔드 핵심 — Doc Sync Crawler (**PRD §3.2-3**)

- **[ ] 파일 시스템 스캔:** `DOCS_PATH`·`NEXA-Documentation/` 등(`[NXN] [ARCH] N-PATH ...` §1.1).
- **[ ] 해시 기반 변경 감지:** `source_hash`·`doc_sync_state` 갱신.
- **[ ] 상태 전이:** `traceability_paths`의 `missing_since`·`status`는 `[NXN] [SCHM]` §4.4.1 크롤러 상태 머신.

### Phase 4: 지능 자산 연결 — Late Anchoring (**PRD §3.2-4**)

- **[ ] 노드-앵커 매핑:** `nexa_knowledge_nexion_doc_node_links` 로 Vue Flow `node_id` ↔ `doc_anchor`.
- **[ ] 고아 자산(Orphaned) 식별:** Resource Explorer 필터.
- **[ ] 물리적 이동(mv) 자동화:** ASK·동기화 승인.

### Phase Ext: 편집 및 지능 확장 — TipTap·Ollama (**PRD §3.2-5**)

- **[ ] TipTap:** 좌측에서 파일 선택 시 **중앙 탭**에 에디터, 저장 시 `source_hash` 갱신(UIUX §3).
- **[ ] Ollama 용어 추출:** 우측 Terms Inspector, API Extended.
- **[ ] 영문 IR 박제:** 노드 속성·번역 액션.

### Phase B-ops: 거버넌스·NIXIE — **Tier B**

- **[ ] NIXIE 시각 연출(Lumina·Jitter):** UIUX **§4.3.1**·§4.4 임계(기본 95)·API §10·`nixie_lumina_profile`(SCHM §4); Tier A에서는 클라이언트 파생 가능.
- **[ ] RLS 활성화.**
- **[ ] 감사 로그:** `related_audit_id` 등.

---

**개발 시작 전 최종 체크리스트:**

- [ ] **PostgreSQL 확장:** `vector`, `timescaledb`, `pg_uuidv7` 등.
- [ ] **UUID v7:** `uuid_generate_v7()` 등록.
- [ ] **디렉터리 권한:** 크롤러·`DOCS_PATH`.
- [ ] **진행 순서:** **PRD §3.2** — UI(1) → DB Tier A(2) → Crawler(3) → Late Anchoring(4) → Ext; **Phase 2 초반**에 N-PATH·Core API 정합 고정. 오케스트레이션·Tier B 전체는 **Phase B-ops**·배포 단계로 후행.
- [ ] **티어 선택:** PoC는 Tier A + Core만으로 충분한지, Tier B 일정 분리 여부.

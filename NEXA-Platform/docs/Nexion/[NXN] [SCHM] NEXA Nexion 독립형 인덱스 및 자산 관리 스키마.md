# [NXN] [SCHM] NEXA Nexion 독립형 인덱스 및 자산 관리 스키마

**문서 계층(필수):** 플랫폼 지식 계층·`nexa_knowledge_*`
물리 모델의 **단일 기준은 `docs/_KNOWLEDGE*.md`**이며,
특히 **`_KNOWLEDGE DDL 통합 스키마 및 물리 설계(SSOT).md`**와
**`_KNOWLEDGE SPEC CRUD 테이블 및 필드 명세서.md`**를 우선한다.

Nexion은 \_KNOWLEDGE 구현을 준비하다
**문서 전반을 큰 그림으로 관리할 도구**로 수요가 정리된 제품이며,
**구현 순서는 Nexion을 먼저 가져가도**,
테이블·컬럼·상태값의 **최종 진실은 \_KNOWLEDGE 쪽으로 수렴**시킨다.
본 SCHM·동봉 DDL에만 있는 정의는 **초안 또는 Nexion 전용 보조**로 두고,
SSOT와 이름·형이 겹치면 **통합 DDL에 맞추는 마이그레이션**을 전제로 한다.

---

## 1. 문서 목적 및 분리 구조

본 문서는 **스키마 명세서**다. **컬럼 단위 정의**는 아래 각 절의 표로 두고, 기능·목적·규칙·열거형 설명은 **본문(문단·목록)**으로 기술한다. 실행 가능한 DDL·인덱스·RLS·예시 쿼리는 `[NXN] [DDL] NEXA Nexion 독립형 인덱스 및 자산 관리 DDL.md`에 둔다.

**문서 역할 분리:** 명세(본 문서)는 필드·상태·무결성 규칙을 읽기 쉽게 정리하고, DDL 파일은 그대로 배포·마이그레이션에 쓴다.

**구현·DDL 전 확인:** 네 테이블의 **설계 의도·결정 사항**은 각 절 **「명문화」** 소절에 모아 두었다 — **§4.6** (`traceability_paths`), **§5.5** (`residency`), **§6.5** (`doc_sync_state`), **§7.1** (`nexion_doc_node_links`).

**핵심 범위는 다섯 가지다.** (1) N-PATH 인덱스로 물리↔논리 경로와 Inode 역할 — `nexa_knowledge_traceability_paths`. (2) 문서 동기화·해시 상태 — `nexa_knowledge_doc_sync_state`. (3) Link ID(접두어)와 파일명·경로의 양방향 무결성 — 주로 첫 번째 테이블과 DDL 제약·인덱스. (4) **Nexion** 캔버스에서 문서 앵커와 Vue Flow 노드 연결·고아 식별 — `nexa_knowledge_nexion_doc_node_links`. (5) VOID(L1~L3) 상주·스왑 **플랫폼 원장** — `nexa_knowledge_residency`(§5 필드 표 **본 문서에 상시 유지**).

---

## 2. 설계 원칙

- **독립성:** Nexion 메타데이터는 원본 문서를 파괴하지 않고 별도 테이블로만 관리한다.
- **추적성:** 물리 경로가 바뀌어도 `doc_anchor`로 동일 자산을 추적한다.
- **무결성:** Link ID·경로·연결 상태는 CHECK·유니크·RLS 등으로 강제한다.
- **복구성:** 외부 변경은 즉시 물리 삭제하지 않고 상태 전이(`active` → `moved` 등)로 처리한다.

### 2.1 (보충) `project_id`·`project_members` — 테넌트 격리 vs 제품 정체성

- **`project_id` 컬럼:** 테이블 행을 **플랫폼 통합 DB 안에서** 격리·조회하기 위한 **호스트 측 테넌트(데이터 구획) 키**다. DDL에서 NOT NULL·복합 유니크에 넣는 것은 **RLS·멀티테넌시**를 위한 것이며, **“Nexion = 오케스트레이션의 업무 프로젝트 엔티티”**를 의미하지 않는다.
- **워크플로 “프로젝트”와의 관계:** Nexion은 **비즈니스 로직(일정·산출물·승인 워크플로)으로서의 프로젝트**에 종속되지 않는다. 테넌트 키가 `projects` 행 UUID와 같을 수는 있으나, **스키마·쿼리는 워크플로 수명주기를 전제로 하지 않는다**고 본다.
- **개발자 오해 방지:** `project_id` 필수는 **별도 DB/별도 계정**을 요구하지 않는다. **동일 통합 DB + 구획 키** 패턴이다. 문장 SSOT는 `[NXN] [CNCP] NEXA Nexion 지식 OS 관리 및 N-PATH(지도) 설계 철학.md` **§1.1·§1.2**, API는 `[NXN] [API] ...` **§2.2.1**을 본다.
- **`project_members`:** 위 구획에 대해 “누가 접근 가능한가”를 DB·RLS가 판단할 때 쓰는 **오케스트레이션 SSOT 테이블**이다. Nexion **제품 도메인 모델의 필수 개념**은 아니라, **호스트 플랫폼과 맞물리는 외연**이다.

### 2.2 구현 티어 A·B(스키마·범위 고정)

개발 순서·체크리스트와 동일한 구분을 스키마에 매핑한다. **코어 Phase 번호·순서**는 `[NXN] [PRD] Nexion 기능과 작업 순서.md` **§3.2**, 티어·체크박스는 `[NXN] NEXA Nexion 개발 순서와 체크 리스트.md` 서두를 본다.

| 티어                     | 테이블·범위                                                                                                                                                                                                                           | 비고                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Tier A (Nexion 코어)** | `nexa_knowledge_traceability_paths`(초기에는 **`anchor_domain` = `knowledge`** 중심 운용 가능), `nexa_knowledge_nexion_doc_node_links`, `nexa_knowledge_doc_sync_state`(크롤러·저장 동기화에 필요한 **최소 컬럼 집합**부터 배포 가능) | `nixie_lumina_profile` 등 **NULL 허용** 컬럼은 미사용으로 두어도 된다. |
| **Tier B (플랫폼 공유)** | `nexa_knowledge_residency`, `traceability_paths`의 **전 도메인·NIXIE 메타**, `doc_sync_state`의 **전 필드·`lock_metadata`·다도메인 책임**, 스왑·동기화 **정책 원장·시드·FK**, RLS·`project_members` 정합                              | Nexion **이후** 또는 플랫폼 마이그레이션·테넌시와 함께 수렴.           |

**DDL 배포:** Tier A만 먼저 올릴 때 Tier B 전용 `CREATE`/RLS 블록은 **생략하거나 후행 마이그레이션**으로 둔다. `[NXN] [DDL] NEXA Nexion 독립형 인덱스 및 자산 관리 DDL.md` 상단 「구현 티어」 참고.

---

## 3. 테이블 개요

**`nexa_knowledge_traceability_paths`**는 플랫폼·에이전트가 **논리 경로(N-PATH)** 로 지능 자산을 찾을 때 참조하는 **전역 인덱스(정적 지도)** 다. 폴더·파일의 논리/물리 경로·`link_id`를 한 행에 묶고, **계층(`parent_path_id`, `depth`)**·**앵커 도메인/유형**·**상주·접근 힌트**·**NIXIE 메타**까지 두어 Nexion **무한 줌·트리 탐색**과 Knowledge OS·오케스트레이션 객체를 같은 테이블에서 연결한다. Nexion 캔버스·Doc Sync Crawler·AI 라우팅이 동일 근거를 본다.

**`nexa_knowledge_doc_sync_state`**는 **해시·스캔 잡·다도메인 잠금**을 남기는 **보조(헬스) 원장**이다(§6). **외부 파일 실종·유예·삭제의 단일 상태 머신은 `nexa_knowledge_traceability_paths` §4.4.1**이며, **NEXA NIXIE 연출(§4.4.2·UIUX §4.3.1)의 데이터 입력**도 그쪽을 1순위로 본다. ERP·IoT 등이 동일 테이블을 쓸 때 **쓰기 주체·충돌 메타**는 여전히 본 테이블에 둔다.

**`nexa_knowledge_nexion_doc_node_links`**는 **NEXA Nexion 전용**으로, `doc_anchor`와 Vue Flow `node_id`의 연결 행만 담는다. 플랫폼 공통의 `nexa_knowledge_reference_assets` 등 광의 참조 자산과 이름·역할이 겹치지 않게 범위를 한정한다. Late Anchoring 이후 귀속·고아(orphaned) 상태를 UI·쿼리로 드러낸다.

**`nexa_knowledge_residency`**는 경로 테이블과 별도로, **임의 지식 엔티티**의 VOID 티어·접근 메타·**스왑 정책(`swap_policy_id`)**·**테넌트(`project_id`)**·**전이 사유·정합 검증 시각**을 담는 **원장**이다. 필드 표는 **§5**에 두며, SSOT DDL과 병합 시 **본 표를 기준으로 마이그레이션**한다(본 절에서 표를 삭제하지 않는다).

---

## 4. `nexa_knowledge_traceability_paths` 필드 명세

**기능:** 논리 경로 문자열로 지능 자산에 접근하는 **N-PATH식 인덱스**이자, 행 단위 **Inode(불변 앵커)** 역할을 한다. 문서 파일뿐 아니라 오케스트레이션 실행 패킷·용어 등 **`anchor_domain` / `anchor_type`이 가리키는 대상**까지 동일 패턴으로 등록할 수 있게 해, 인공지능·서비스가 **한 테이블만 조회해 경로→대상을 해석**할 수 있게 한다.

**목적:** (1) 탐색기 이동·이름 변경 후에도 동일 앵커로 추적. (2) 카드 `link_id`와 실제 트리 정합. (3) **무한 줌·트리 UI**를 DB에서 재구성·필터링. (4) VOID·접근 패턴과 NIXIE 시각 피드백을 행 단위에 붙여 **스왑·신뢰도 표현**의 근거로 쓴다.

**PK 명칭(명문화):** **`_KNOWLEDGE` SSOT DDL의 컬럼명인 `path_id`를 본 테이블의 PK로 채택한다.** 이후 `[NXN] [DDL]` 및 통합 마이그레이션에서도 **`path_id`로 통일**하여 배포한다. 과거 초안의 `trace_id`는 **사용하지 않거나 `path_id`로 리네임**하는 것을 전제로 한다. 아래 표·FK의 “상위 행 PK”는 모두 **`path_id`** 를 가리킨다.

### 4.1 필드 표 (통합)

| 컬럼명                 | 타입(권장)   | NULL     | 기본값               | 제약·인덱스(권장)                                                               | 설명                                                                                                                                                                                                                                                                           |
| ---------------------- | ------------ | -------- | -------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `path_id`              | UUID         | NOT NULL | `uuid_generate_v7()` | PK                                                                              | 경로 행 식별자. **`_KNOWLEDGE` SSOT와 동일 명칭.**                                                                                                                                                                                                                             |
| `project_id`           | UUID         | NOT NULL | —                    | FK·복합 인덱스                                                                  | 테넌트/프로젝트. 전역 공통 행이 필요하면 별도 규약(예: 시스템 프로젝트 UUID)으로 문서화.                                                                                                                                                                                       |
| `parent_path_id`       | UUID         | NULL     | —                    | FK → 본 테이블 `path_id`, `ON DELETE SET NULL`; 인덱스 권장                     | **계층:** 직계 상위 경로 행. NULL이면 루트(또는 프로젝트 루트)로 해석. Nexion **논리 경로 트리**·재귀 CTE 없이도 상·하위를 즉시 잇는다.                                                                                                                                        |
| `depth`                | SMALLINT     | NOT NULL | `0`                  | `CHECK (depth >= 0)`; `(project_id, depth)` 등 복합 인덱스로 줌 레벨 필터 가속  | **계층:** 논리 트리 깊이. 무한 줌에서 “현재 줌 레벨 이하만” 빠르게 거르는 데 사용. `logical_path` 파싱과 불일치 시 크롤러/배치가 정정.                                                                                                                                         |
| `doc_anchor`           | UUID         | NOT NULL | —                    | UNIQUE(또는 `(project_id, doc_anchor)` 정책에 맞게); 역조회 인덱스              | **범용 앵커 UUID.** 문서 파일에 한정되지 않으며, `anchor_domain`·`anchor_type`이 정의한 **대상 행의 PK**(또는 느슨한 외부 ID)와 짝을 이룬다. 문서 중심 UI에서는 기존과 같이 “문서 앵커”로 읽어도 된다.                                                                         |
| `anchor_domain`        | VARCHAR(30)  | NOT NULL | `'knowledge'`        | CHECK(허용 값 집합); `(anchor_domain, anchor_type, doc_anchor)` 인덱스 권장     | **추적 도메인:** 앵커가 어느 경계에 속하는지. 예: `knowledge`(용어·참조·문서), `orchestration`(실행 패킷·다른 DB의 packet_id 등), `device` … . FK를 걸지 않는 외부 앵커는 도메인·타입·문서화된 해석 규칙으로만 연결.                                                           |
| `anchor_type`          | VARCHAR(40)  | NOT NULL | —                    | 위와 복합                                                                       | **앵커 세부 유형.** 예: `term`, `reference`, `execution_packet`, `document_file` … . AI·API가 라우팅할 때 최소 분기 키.                                                                                                                                                        |
| `link_id`              | VARCHAR(120) | NOT NULL | —                    | 프로젝트+활성 시 부분 유니크(DDL)                                               | 카드/폴더 접두어 ID. N-PATH 카드 계층과 디렉터리 매핑.                                                                                                                                                                                                                         |
| `logical_path`         | TEXT         | NOT NULL | —                    | `(project_id, link_id, logical_path)` 유니크 등                                 | 슬래시 구분 **논리 경로**(N-PATH). `/프로젝트/기획/배터리` 형태 권장; 대소문자·선행 `/` 정책은 팀 단일화.                                                                                                                                                                      |
| `physical_path`        | TEXT         | NOT NULL | —                    | `(project_id, physical_path)` 인덱스                                            | 디스크·워크스페이스 **실경로**. 크롤러·에디터가 파일을 열 때 사용. 오케스트레이션-only 행에서는 빈 문자열·플레이스홀더 허용 여부를 정책으로 정함.                                                                                                                              |
| `title`                | TEXT         | NOT NULL | —                    | —                                                                               | 사용자·목록 표시용 제목(파일명과 분리 가능).                                                                                                                                                                                                                                   |
| `source_hash`          | VARCHAR(128) | NULL     | —                    | 선택 인덱스                                                                     | 내용·바이트 기준 해시(변경 감지). 없는 객체는 NULL.                                                                                                                                                                                                                            |
| `status`               | VARCHAR(20)  | NOT NULL | `active`             | CHECK                                                                           | 아래 §4.3 열거. `moved` / `orphaned` / `deleted`와 `missing_since`·감사 연계.                                                                                                                                                                                                  |
| `last_seen_at`         | TIMESTAMPTZ  | NULL     | —                    | —                                                                               | 크롤러·동기화가 **대상을 정상 확인한** 마지막 시각.                                                                                                                                                                                                                            |
| `missing_since`        | TIMESTAMPTZ  | NULL     | —                    | 부분 인덱스(`WHERE missing_since IS NOT NULL`)                                  | **무결성:** 대상 파일(또는 리소스)을 **처음 미발견**한 시각. NULL이면 “현재는 실종 상태 아님”. 일시적 I/O 오류와 실제 삭제를 **유예 기간**으로 구분하는 데 쓴다. 재발견 시 NULL로 클리어.                                                                                      |
| `related_audit_id`     | UUID         | NULL     | —                    | FK → `nexa_knowledge_audit_logs`(또는 플랫폼 감사 테이블 PK) 선택               | **감사 연계:** `moved`·`orphaned`·`deleted` 전환, 경로 대량 수정 등 **해당 결정을 남긴 감사 행**을 가리킨다. 조회 시 “왜 이 상태인가”를 로그와 1:1로 잇는다.                                                                                                                   |
| `storage_tier`         | VARCHAR(10)  | NULL     | —                    | `CHECK (storage_tier IN ('L1','L2','L3') OR storage_tier IS NULL)`; 선택 인덱스 | **상주 힌트(L1~L3):** 이 경로 행이 가리키는 데이터의 **현재 선호 상주**(예: L1 캐시·L2 Postgres·L3 아카이브). 상세 VOID 원장·스왑 이력은 `nexa_knowledge_residency` 등과 **정합**을 맞추고, 본 컬럼은 **쿼리·UI·스케줄러가 빠르게 필터**하기 위한 비정규화(캐시)로 둘 수 있다. |
| `last_access_at`       | TIMESTAMPTZ  | NULL     | —                    | `(storage_tier, last_access_at DESC NULLS LAST)` 등                             | **상주·스왑:** 마지막으로 이 경로(또는 연결 자산)가 **읽혔거나 라우팅에 사용된** 시각. 오래되면 L3 강등 후보.                                                                                                                                                                  |
| `access_count_rolling` | INTEGER      | NOT NULL | `0`                  | `CHECK (access_count_rolling >= 0)`                                             | **상주·스왑:** 롤링 윈도우(예: 7일) 내 접근 횟수 등. 배치가 VOID 스왑·프리페치 우선순위를 정할 때 사용. 윈도우 경계·리셋 규칙은 운영 SPEC에 명시.                                                                                                                              |
| `metadata`             | JSONB        | NOT NULL | `'{}'`               | GIN 선택                                                                        | **UX·기술 메타:** MIME, 아이콘 키, 캔버스 레이아웃 힌트, `canvas_layout_hint` 등(SPEC 예시와 동일 계열). 스키마 고정이 필요한 키는 문서화.                                                                                                                                     |
| `nixie_lumina_profile` | JSONB        | NULL     | —                    | —                                                                               | **NEXA NIXIE 시각 규약(UIUX §4.3.1):** 이 자산에 대해 **NIXIE가** 적용할 **Lumina·Jitter** 파라미터(강도·색·펄스·임계 등). NEXU Canvas는 **표면**이며 연출 **주체는 NIXIE**. 신뢰도·VOID·헬스 신호와 연동할 때 키 규약은 UIUX·API와 맞춘다.                                    |
| `created_at`           | TIMESTAMPTZ  | NOT NULL | `now()`              | —                                                                               | 생성 시각.                                                                                                                                                                                                                                                                     |
| `updated_at`           | TIMESTAMPTZ  | NOT NULL | `now()`              | 트리거 갱신(DDL)                                                                | 수정 시각.                                                                                                                                                                                                                                                                     |

### 4.2 축별 요약 (기획 의도)

| 축                | 필드                                                     | 효과                                                                                        |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **계층·탐색**     | `parent_path_id`, `depth`                                | DB에서 트리 재구성·무한 줌 레벨별 필터; AI·API가 하위 경로만 순회 가능.                     |
| **앵커 확장**     | `anchor_domain`, `anchor_type`, `doc_anchor`             | 문서 외 객체도 동일 N-PATH 행으로 등록; 라우팅·RAG·오케스트레이션이 **단일 테이블**로 해석. |
| **NIXIE·UX**      | `metadata`, `nixie_lumina_profile`                       | **NIXIE**가 NEXU 표면에서 Lumina·Jitter로 **신뢰도·상태를 시각적으로 증명**(UIUX §4.3.1).   |
| **상주·생명주기** | `storage_tier`, `last_access_at`, `access_count_rolling` | VOID L1~L3와 연계한 **스왑 힌트**; 자주 안 쓰는 경로의 아카이브 후보 식별.                  |
| **무결성·감사**   | `missing_since`, `related_audit_id`, `status`            | 미발견 시각·감사 로그로 **일시 오류 vs 삭제·이동** 설명 가능.                               |

### 4.3 `nexa_knowledge_residency`와의 역할 분담 (**원장 유지**)

**`nexa_knowledge_residency`는 삭제하지 않고 유지한다.** `_KNOWLEDGE` 통합 DDL에 정의된 대로 `(entity_type, entity_id)` 단위 VOID 티어·스왑 메타의 **플랫폼 원장(SSOT)** 으로 둔다. 경로 인덱스에 올리지 않은 지식 엔티티도 동일 규칙으로 상주를 관리해야 하므로, 이 테이블은 **필수 계층**이다. **컬럼 정의 표는 본 SCHM §5에 상시 둔다**(SPEC/DDL만 보지 않아도 NXN 문서 한 곳에서 교차 확인 가능).

본 테이블(`nexa_knowledge_traceability_paths`)의 `storage_tier`·`last_access_at`·`access_count_rolling`은 **경로 행 단위 보조 정보**(캔버스·쿼리·스케줄러 가속용 캐시/힌트)로만 쓴다. 값이 어긋나면 **`nexa_knowledge_residency`의 원장(`swap_policy_id`·`storage_tier`·정합 시각 등)과 배치 잡 규칙을 기준으로** 본 테이블 쪽을 정정한다. `residency`를 없애고 경로 테이블만 남기는 방식은 **채택하지 않는다**(비경로 엔티티 VOID가 공백이 됨).

### 4.4 `traceability_paths.status` 열거

- **`active`:** 정상 추적 중(기본).
- **`moved`:** 경로만 바뀌고 앵커는 동일(탐색기 이동 감지). `related_audit_id`에 이동 감사를 남기기 권장.
- **`orphaned`:** 노드 미연결 등 논리적 고아(`nexa_knowledge_nexion_doc_node_links`와 불일치 등).
- **`deleted`:** 파일 소실·삭제가 확정(연속 미발견 스캔 임계 초과 등). `missing_since`와 함께 해석.

#### 4.4.1 Doc Sync Crawler — `missing_since`·`status` 상태 머신(구현 고정)

**근거:** §4.4 열거, §9 `traceability_paths` 문단, `missing_since` 필드 정의(§4 표).  
**전제:** `status`에 `missing` 값은 두지 않는다. **유예 중**에는 `active`를 유지하고 **`missing_since`로만 “실종 시각”을 표시**한다.

**진실원(구현·UI 고정):** 외부 파일 시스템 관점의 **실종·유예·삭제 판정은 오직 본 절 표(§4.4.1)와 `nexa_knowledge_traceability_paths` 컬럼(`status`, `missing_since`, …)만 따른다.** “파일이 잠시 안 보임 / 삭제됨”에 대한 **NIXIE 비언어 연출**은 **`doc_sync_state.last_sync_status`가 아니라** 위 전이와 **`nixie_lumina_profile`** 을 우선 입력으로 한다(§4.4.2). **표현 주체·용어는 UIUX §4.3.1.**

**운영 상수(환경·SPEC에서 단일화):**

| 상수                | 의미                                                                           | 권장          |
| ------------------- | ------------------------------------------------------------------------------ | ------------- |
| `GRACE_SCAN_COUNT`  | `missing_since` 설정 후, **삭제로 올리기 전** 허용하는 연속 “미발견” 스캔 횟수 | ≥ 2 (팀 조정) |
| `SCAN_INTERVAL_SEC` | 크롤러 주기(낙관적 락·UI와의 정합에 사용)                                      | 운영 SPEC     |

**크롤러 이벤트 → `nexa_knowledge_traceability_paths` 갱신(물리 파일 기준):**

| 현재 `status` | 현재 `missing_since` | 크롤러 관측                                            | 다음 `status`                     | 다음 `missing_since`          | 필수 부가 갱신                                                               |
| ------------- | -------------------- | ------------------------------------------------------ | --------------------------------- | ----------------------------- | ---------------------------------------------------------------------------- |
| `active`      | NULL                 | `DOCS_PATH`+`physical_path`에서 **파일 존재**          | `active`                          | NULL                          | `last_seen_at` = now                                                         |
| `active`      | NULL                 | 파일 **없음** (최초)                                   | `active`                          | **now()** (최초 1회만 set)    | —                                                                            |
| `active`      | **T** (설정됨)       | 파일 **여전히 없음**                                   | `active`                          | **T** 유지                    | 연속 미발견 카운트 +1; `GRACE_SCAN_COUNT` 미만이면 유예 계속                 |
| `active`      | **T**                | 연속 미발견 **≥ `GRACE_SCAN_COUNT`**                   | **`deleted`**                     | **T** 유지(감사·해석용)       | `related_audit_id` 권장(§9)                                                  |
| `active`      | **T**                | 파일 **재발견**                                        | `active`                          | **NULL**                      | `last_seen_at` = now                                                         |
| `moved`       | NULL 또는 T          | 동기화 후 **새 경로에서 파일 확인**                    | `active`                          | NULL                          | `logical_path`/`physical_path`/`parent_path_id`/`depth` 정합, `last_seen_at` |
| `moved`       | T                    | 유예·삭제 규칙은 위 `active` 행과 **동일**             | (동일)                            | (동일)                        | `moved`는 “이동 처리 중”에 한해 임시로 둘 수 있음                            |
| `orphaned`    | \*                   | 물리 파일 존재 여부는 **고아 판별과 별개**로 관측 가능 | `orphaned` 유지 또는 위 행에 합류 | NULL/T는 **미발견 규칙 동일** | 고아 해제는 **링크 테이블** 갱신 후 `active` 등으로 별도 전이                |
| `deleted`     | T                    | 파일 **재발견**(복구)                                  | `active` 또는 **`moved`**         | NULL                          | 인간·정책 승인 후에만 복구 전이; 감사 권장                                   |

**금지·주의:**

- 파일이 한 번 안 보였다고 즉시 `deleted` 또는 `moved`로 바꾸지 않는다. **첫 미발견 = `missing_since` 설정 + `active` 유지**(유예).
- **`moved`:** 디스크에서 “안 보임”이 아니라, **같은 `doc_anchor`에 대해 새 물리 위치를 확정**했을 때(탐색기 이동 반영) 사용한다(§4.4·§9).

**`doc_sync_state`와의 역할 분담(동일 스캔 패스에서 권장):**

| 구분                                            | 역할                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`nexa_knowledge_traceability_paths`(§4.4.1)** | **진실원:** 파일 미발견 시 유예 중에도 `status='active'` + `missing_since` 설정; 연속 미발견 임계 초과 시 `status='deleted'`. **판정·UI 전이는 항상 이쪽을 우선.**                                                                                                                                                                                     |
| **`nexa_knowledge_doc_sync_state`(§6)**         | **보조(헬스·해시·다도메인):** 스캔 잡이 기록하는 `ok` / `changed` / `conflict` / `error` 및 선택적 `missing`. `last_sync_status='missing'`은 “**이번 프로브에서 리소스를 찾지 못함**” 수준의 **운영 신호**로 둘 수 있으나, **유예·삭제 여부는 traceability 표만 따른다.** 두 테이블 값이 어긋날 수 있으며, **불일치 시 §4.4.1·traceability가 이긴다.** |

동일 스캔 패스에서 잡이 traceability 행을 먼저 §4.4.1에 맞게 갱신한 뒤, `doc_sync_state`에 해시·I/O·충돌 메타를 덧붙이는 순서를 권장한다.

#### 4.4.2 Nexion Desk — NIXIE 연출 데이터 소스 (고정)

**연출 주체는 NEXA NIXIE** — UIUX **§4.3.1**, 필드는 **`nixie_lumina_profile`**.

- **유예 중 “실종” 감지:** `traceability_paths.status = 'active'` **이면서** `missing_since IS NOT NULL`.
- **삭제 확정:** `traceability_paths.status = 'deleted'`(통상 `missing_since` 유지·감사 연계).
- **`doc_sync_state`:** 대시보드·스케줄러·다도메인 ERP/IoT 분기용. **NIXIE Jitter·Lumina 강도·색의 1차 트리거로 `last_sync_status`만 쓰지 않는다**; 필요 시 보조 가중치로만 병합한다.

### 4.5 보강 스키마 방향(한 줄 요약)

1. **경로 중심 탐색:** `/프로젝트/…` 문자열 + `parent_path_id`/`depth`로 N-PATH·트리 UX를 지원한다.
2. **지능형 스케줄링:** 접근 흔적·`storage_tier`로 덜 쓰는 지식의 압축·아카이브(VOID) 후보를 고른다.
3. **시각적 증명:** `nixie_lumina_profile`에 따라 **NEXU 캔버스 표면에서 NIXIE가** Lumina·Jitter로 신뢰도·상태를 즉시 드러낸다(UIUX §4.3.1).

`nexa_knowledge_traceability_paths`는 지식 운영체제의 **정적 지도**이며, 실시간 추론 경로(why_chain)·물리 토폴로지(network_topology) 등과 맞물릴 때 **생각에서 실행까지** 끊김 없는 추적이 완성된다.

### 4.6 명문화 — N-PATH 인덱스·Inode로서의 역할

본 테이블은 단순한 “문서 경로 저장소”가 아니라, 시스템 전역에서 동작하는 **지능적 지도(Intelligent Map)** 를 수행하도록 설계한다.

- **구조적 강점:** `parent_path_id`와 `depth`로 DB 레벨에서 **무한 줌(Fractal Zoom)** 과 논리 경로 **트리 탐색**을 지원한다. `anchor_domain`·`anchor_type`으로 문서뿐 아니라 오케스트레이션 **실행 패킷**·**용어** 등 모든 객체를 **동일한 N-PATH 경로 체계** 안에서 다룰 수 있다.
- **NIXIE·시각화 연동:** `nixie_lumina_profile`은 닉시(NIXIE) 계열 UI에서 **Lumina(발광)**·**Jitter(떨림)** 를 **자산 단위**로 세밀하게 조정할 근거 필드로 쓴다.
- **DDL 구현 체크포인트:** PK 컬럼명은 **`path_id`로 통일**한다(§4 상단 「PK 명칭」). `_KNOWLEDGE` SSOT·향후 통합 마이그레이션과의 **이름·FK 정합**에 유리하다.

---

## 5. `nexa_knowledge_residency` 필드 명세

**본 절 유지:** `nexa_knowledge_residency`의 **스키마 표는 본 문서에서 삭제하지 않는다.** 컬럼·제약의 1차 진실은 **`_KNOWLEDGE DDL`·SPEC §2.9**이며, 아래 표는 **전역·다정책·RLS** 보강을 반영한 **NXN SCHM 확장본**이다. SSOT DDL에 아직 없는 컬럼(`project_id`, `swap_policy_id`, `transition_reason_code`, `last_consistency_check_at`)은 **통합 마이그레이션으로 편입**한다.

**기능:** 임의 지식 엔티티가 L1~L3 중 어디에 **논리적으로 상주**하는지, VOID·스왑·**수명 주기 정책**·**실저장 정합**을 한 행에서 추적한다. 실제 바이트 이동·Redis 키 삭제는 앱·인프라가 수행하고, 본 테이블은 **의사결정·족보(Traceability) 설명**용 메타에 가깝다.

**목적:** (1) 객체마다 다른 **스왑/수명 규칙**(ERA 헌법은 L1 고정, TICK 센서는 24h 내 L3 등). (2) **테넌트 격리·RLS**를 조인 없이 지원하는 `project_id`. (3) 티어 전이 **사유 코드**로 AI·감사가 “왜 바뀌었는지” 설명. (4) **기록된 티어**와 **실제 L1 캐시 등**의 일치를 주기 검증한 시각.

**`nexa_knowledge_traceability_paths`와의 관계:** §4.3. 경로 행의 상주 필드는 여전히 **캐시**이며, `swap_policy_id`·정합 시각은 **원장(residency)** 과 맞춘다.

### 5.1 필드 표 (통합)

| 컬럼명                      | 타입(권장)  | NULL     | 기본값               | 제약·인덱스(권장)                                                                | 설명                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------- | ----------- | -------- | -------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `residency_id`              | UUID        | NOT NULL | `uuid_generate_v7()` | PK                                                                               | 행 식별자.                                                                                                                                                                                                                                                                                                                                                                                                               |
| `project_id`                | UUID        | NULL     | —                    | 인덱스; RLS `USING (project_id IN …)` 전제. 복합 `(project_id, storage_tier)` 등 | **테넌트 비정규화.** 원본 엔티티가 속한 프로젝트. **플랫폼 전역** 자산(예: 시스템 헌법·ERA, 글로벌 용어)은 NULL. 출처 테이블(`definitions`, `references`, `traceability_paths` …)과 **불일치 없이** 앱·트리거로 유지. 기존 SSOT에는 없음 → 마이그레이션 추가.                                                                                                                                                            |
| `entity_type`               | VARCHAR(30) | NOT NULL | —                    | `UNIQUE(entity_type, entity_id)`                                                 | 감시 대상 유형. 예: `definition`, `reference`, `vector`, `traceability_path` … 팀 ENUM·레지스트리에 등록.                                                                                                                                                                                                                                                                                                                |
| `entity_id`                 | UUID        | NOT NULL | —                    | 위와 복합                                                                        | 대상 PK. `nexa_knowledge_*`·경로 행의 `path_id` 등 SSOT와 동일 해석.                                                                                                                                                                                                                                                                                                                                                     |
| `swap_policy_id`            | UUID        | NULL     | —                    | FK → 스왑 정책 원장(§5.2); 인덱스                                                | **수명·스왑 정책.** 모든 지식을 동일 주기로 L1→L3 내릴 수 없음. 예: ERA 헌법은 **영구 L1 고정**, 일시적 TICK(센서 사실)은 **24h 내 아카이브** 등 정책 행을 가리킴. NULL이면 플랫폼 **기본 스왑 정책**을 적용한다고 문서화.                                                                                                                                                                                               |
| `storage_tier`              | VARCHAR(10) | NOT NULL | —                    | `CHECK (storage_tier IN ('L1','L2','L3'))`                                       | L1: 핫 캐시(예: Redis), L2: Postgres 주저장, L3: 아카이브·저빈도. `swap_policy_id`의 허용 범위와 충돌 시 **정책·감사** 우선.                                                                                                                                                                                                                                                                                             |
| `void_hint`                 | VARCHAR(20) | NULL     | —                    | —                                                                                | VOID 단계·오케스트레이션 로그와 맞출 **느슨한 라벨**.                                                                                                                                                                                                                                                                                                                                                                    |
| `access_count_rolling`      | INTEGER     | NOT NULL | `0`                  | `CHECK (access_count_rolling >= 0)`                                              | 롤링 윈도우 내 접근 횟수(윈도우는 스왑 정책 또는 운영 SPEC).                                                                                                                                                                                                                                                                                                                                                             |
| `last_access_at`            | TIMESTAMPTZ | NULL     | —                    | `(project_id, storage_tier, last_access_at DESC NULLS LAST)` 등                  | 최근 접근 시각. 강등·승격 스윕·프리페치 우선순위.                                                                                                                                                                                                                                                                                                                                                                        |
| `tier_changed_at`           | TIMESTAMPTZ | NOT NULL | `now()`              | —                                                                                | 티어가 마지막으로 바뀐 시각(“언제”의 SSOT).                                                                                                                                                                                                                                                                                                                                                                              |
| `transition_reason_code`    | VARCHAR(64) | NULL     | —                    | 인덱스(선택); 코드 레지스트리와 연동                                             | **전이 사유 코드.** `tier_metadata`만으로는 “왜”를 기계가 읽기 어려우므로, **정규화된 이유**를 둔다. 예: `promote_frequent_access`(빈번 참조로 L1 승격), `archive_vi_low`(사용자 활력 VI 저하로 강제 아카이브), `policy_ttl_elapsed`, `manual_override`, `consistency_repair_downgrade`(정합 검증 실패 후 강등) … 플랫폼 **사유 코드표**(SPEC)에 등록. 티어 **변경 시** 마지막 전이에 set; 미변경 갱신은 NULL 유지 가능. |
| `tier_metadata`             | JSONB       | NOT NULL | `'{}'`               | —                                                                                | 쿨다운·비용·복제 지연·스케줄러 잡 ID 등 **부가 서술**. `transition_reason_code`와 중복 시 **코드가 우선**하고 JSON은 디테일만.                                                                                                                                                                                                                                                                                           |
| `last_consistency_check_at` | TIMESTAMPTZ | NULL     | —                    | 부분 인덱스(오래된 검증 행 스윕)                                                 | **저장소 정합 검증:** “DB상 L1인데 Redis 키가 실제로 있는가” 등 **마지막으로 검증을 통과/시도한** 시각. `doc_sync_state`가 파일 동기화를 담당한다면, 본 필드는 **티어 주장 vs 실캐시·오브젝트 스토어** 일치 여부에 집중. 실패 상세는 감사 로그·`tier_metadata`에 남기고, 여기서는 **스케줄 간격·신뢰도 게이트**용 타임스탬프.                                                                                            |
| `status`                    | SMALLINT    | NOT NULL | `1`                  | `CHECK (status IN (0, 1))`                                                       | 1: Active, 0: Inactive(스윕·승격 제외 등).                                                                                                                                                                                                                                                                                                                                                                               |

### 5.2 스왑 정책 원장(별도 테이블·권장)

`swap_policy_id`가 가리키는 행(예: `nexa_knowledge_residency_swap_policies` — 이름은 통합 DDL에서 확정)에 둘 수 있는 예:

- **최소/최대 체류 시간** per tier, **강등 TTL**, **L1 핀(헌법·ERA 전용)** 여부
- TICK·센서류: **최대 L1/ L2 유지 시간** 후 L3 필수
- **스윕 우선순위**, **VI·ES 연동 임계**(정책명만 두고 수치는 JSONB도 가능)

본 SCHM은 FK·의미만 정의하고, 컬럼 DDL은 `_KNOWLEDGE`/플랫폼에 둔다.

### 5.3 `transition_reason_code`·정합 검증 (운영)

- 코드 표는 **신규·폐기 시 감사**와 함께 관리한다. AI 족보·요약에 **코드 → 자연어 매핑**을 학습/규칙으로 붙이면 설명 품질이 오른다.
- `last_consistency_check_at`는 **주기 잡**이 갱신한다. 오래된 NULL/스테일 행은 NIXIE·헬스 대시보드에서 **신뢰도 낮음** 힌트로 쓸 수 있다.

### 5.4 인덱스·운영(요약)

- **`UNIQUE(entity_type, entity_id)`** — 대상당 1행(SSOT `uq_knowledge_residency_entity` 호환).
- **`(storage_tier, last_access_at DESC)`**, **`(project_id, storage_tier)`** — 강등·아카이브·테넌트별 스윕.
- **`(swap_policy_id)`** — 정책별 배치 묶음.
- `nexa_knowledge_doc_sync_state`의 삭제·잠재와 **사용자 스토리**로 연결 가능(SPEC §2.9).

### 5.5 명문화 — VOID 상주 원장으로서의 위상

지식의 생애주기(VOID)를 관리하는 **플랫폼 원장**으로서의 역할을 본 절과 필드 표로 고정한다.

- **테넌트·성능:** 과거 설계에서 우려되던 **조인 비용**을 줄이기 위해 **`project_id`를 비정규화**하여 두었다. **RLS(행 수준 보안)** 적용과 **프로젝트별 상주 데이터 필터링**을 조인 없이 단순화할 수 있다(전역 자산은 `project_id` NULL 규약, §5.1).
- **지능적 족보:** `swap_policy_id`는 객체마다 다른 **수명·스왑 정책**(예: ERA 헌법의 L1 고정 vs TICK의 단기 아카이브)을 연결한다. `transition_reason_code`는 “왜 L1에서 L3로 갔는가”(예: 사용자 활력 VI 저하, 빈번 참조로의 승격)를 **코드화**하여, AI·감사·Traceability 설명의 **근거**로 쓴다.

---

## 6. `nexa_knowledge_doc_sync_state` 필드 명세

**기능:** 자산 앵커(`doc_anchor` 등)별로 **스캔 잡·해시·다도메인 잠금**을 남기는 **보조(헬스) 원장**이다. **파일 실종·유예·삭제의 단일 상태 머신은 `nexa_knowledge_traceability_paths` §4.4.1**이며, 본 테이블은 그와 **동시에 갱신될 수 있으나 UI·판정의 1순위가 되지 않는다.**

**전역 공유:** Nexion·ERP·IoT 등 **여러 도메인**이 같은 행을 읽되, **책임 도메인·쓰기 주체·정책·잠금**을 분리해 병목·충돌을 관리한다.

**목적:** (1) 어떤 시스템이 이 행을 **주도**하는지, (2) 마지막 갱신이 **누구**인지, (3) 자산 종류에 따른 **해시·스캔 분기**, (4) **동기화 주기·우선순위**, (5) 다도메인 **논리 잠금·충돌 메타**를 한 테이블에서 조회 가능하게 한다.

**`_KNOWLEDGE` SSOT와의 관계:** 통합 SSOT·SPEC §2.2·본 §6은 **동일 `nexa_knowledge_doc_sync_state` 모델**으로 수렴했다(2026-03). 기존 DB에 구형 `id`/`doc_ref_path`/`last_hash` 테이블만 있는 경우 **마이그레이션·뷰**로 이행한다.

### 6.1 필드 표 (통합)

| 컬럼명                 | 타입(권장)   | NULL     | 기본값               | 제약·인덱스(권장)                                        | 설명                                                                                                                                                                                                                                                                                    |
| ---------------------- | ------------ | -------- | -------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sync_id`              | UUID         | NOT NULL | `uuid_generate_v7()` | PK                                                       | 행 식별자.                                                                                                                                                                                                                                                                              |
| `project_id`           | UUID         | NOT NULL | —                    | 복합 인덱스                                              | 테넌트/프로젝트.                                                                                                                                                                                                                                                                        |
| `doc_anchor`           | UUID         | NOT NULL | —                    | `UNIQUE(project_id, doc_anchor)` 등 팀 정책              | 대상 **범용 앵커**. 가상 자산(DB만 존재)도 동일 패턴으로 식별.                                                                                                                                                                                                                          |
| `responsible_domain`   | VARCHAR(40)  | NOT NULL | —                    | 인덱스; CHECK는 코드 레지스트리와 연동해 선택            | **책임 도메인:** 이 자산의 동기화 **소유·정책 배정**을 주도하는 시스템 코드. 예: `nexion`, `erp`, `iot`, `help` … 플랫폼 **도메인 코드 레지스트리**(별도 SPEC)에 등록된 값만 허용 권장.                                                                                                 |
| `last_writer_domain`   | VARCHAR(40)  | NULL     | —                    | —                                                        | **쓰기 주체:** `last_synced_at` 기준 **가장 최근에 본 행을 갱신한** 도메인·잡·서비스 식별자. 감사·디버깅용. 배치 크롤러는 자신의 코드를 매번 기록.                                                                                                                                      |
| `anchor_domain`        | VARCHAR(30)  | NULL     | —                    | `(anchor_domain, doc_anchor)` 조회용 인덱스 선택         | `nexa_knowledge_traceability_paths.anchor_domain`과 **동일 해석**이면 조인 없이 라우팅. NULL이면 `traceability`만 조인해 해석.                                                                                                                                                          |
| `sync_asset_kind`      | VARCHAR(40)  | NOT NULL | `'document_file'`    | 인덱스                                                   | **자산·동기화 분기 카테고리.** 크롤러가 해시 방식·스캔 생략·외부 API 호출 여부를 고른다. 예: `document_file`, `markdown`, `image`, `video`, `binary_large`, `virtual_db_row`, `api_backed` … `traceability_paths.anchor_type`과 **코드셋을 맞추거나** 여기서 상위 그룹만 둔다고 문서화. |
| `hash_profile`         | VARCHAR(40)  | NULL     | —                    | —                                                        | **해시·동등성 전략.** 예: `content_sha256`, `perceptual_image`, `mtime_size`, `etag_only`, `none_virtual`. NULL이면 `sync_asset_kind`의 **기본 프로파일**을 쓴다.                                                                                                                       |
| `sync_policy_id`       | UUID         | NULL     | —                    | FK → 동기화 정책 원장(별도 테이블·SPEC); 스케줄러 인덱스 | **동기화 정책 ID.** 주기·타임아웃·재시도·**우선순위(priority)**·실시간 vs 배치 큐를 정책 행에서 읽는다. 모든 행이 동일 주기일 필요 없음.                                                                                                                                                |
| `sync_priority_cached` | SMALLINT     | NULL     | —                    | `(sync_priority_cached ASC, last_synced_at ASC)` 등      | **우선순위 캐시(선택):** 스케줄러가 정책 테이블과 조인 없이 큐를 돌리기 위해 정책에서 복사해 둔 값. 정책 변경 시 배치가 갱신. NULL이면 정책 조인 또는 기본 우선순위.                                                                                                                    |
| `last_sync_status`     | VARCHAR(30)  | NOT NULL | —                    | CHECK, 부분 인덱스                                       | 아래 §6.2 열거.                                                                                                                                                                                                                                                                         |
| `lock_metadata`        | JSONB        | NOT NULL | `'{}'`               | —                                                        | **논리 잠금·충돌 메타.** 예: `lock_holder_domain`, `lock_until`, `lock_reason`, `conflict_parties[]`, `conflict_detected_at`, `supersedes_job_id`. `last_sync_status = conflict`일 때 **어느 도메인 간 충돌인지**를 여기에 남기는 것을 권장.                                            |
| `last_error_code`      | VARCHAR(80)  | NULL     | —                    | —                                                        | 앱/크롤러 오류 코드.                                                                                                                                                                                                                                                                    |
| `prev_source_hash`     | VARCHAR(128) | NULL     | —                    | —                                                        | 이전 스캔 해시.                                                                                                                                                                                                                                                                         |
| `curr_source_hash`     | VARCHAR(128) | NULL     | —                    | —                                                        | 현재 스캔 해시. 가상 자산은 NULL 허용.                                                                                                                                                                                                                                                  |
| `last_scanned_path`    | TEXT         | NULL     | —                    | —                                                        | 마지막으로 본 물리 경로 또는 **가상 자산 식별 URI**.                                                                                                                                                                                                                                    |
| `last_synced_at`       | TIMESTAMPTZ  | NOT NULL | `now()`              | 정렬 인덱스                                              | 마지막 동기화 시각(성공/실패 무관하게 잡이 끝난 시각으로 둘지는 정책으로 통일).                                                                                                                                                                                                         |
| `updated_at`           | TIMESTAMPTZ  | NOT NULL | `now()`              | 트리거 갱신                                              | 행 수정 시각.                                                                                                                                                                                                                                                                           |

### 6.2 `doc_sync_state.last_sync_status` 열거

- **`ok`:** 기대 상태와 일치(경로·해시·가상 자산 버전 등 정책에 따름).
- **`changed`:** 해시·메타·원격 버전 변경 감지.
- **`missing`:** (보조) **이번 동기화 프로브**에서 파일·원격 객체를 찾지 못했다는 **잡 단위 신호**. **유예 중 실종·삭제 확정은 `nexa_knowledge_traceability_paths` §4.4.1(`status`, `missing_since`)만 본다.** `missing`과 `active`+`missing_since`가 공존해도 **연출·비즈니스 판정은 traceability 우선**이다.
- **`conflict`:** 둘 이상 도메인/소스가 동시에 다른 진실을 주장하거나, 디스크와 DB가 어긋나 **수동·정책 해결**이 필요. **`lock_metadata.conflict_parties` 등으로 당사자를 기록.**
- **`error`:** I/O·권한·네트워크 등 기술 오류.

### 6.3 동기화 정책 원장(별도 테이블·권장)

`sync_policy_id`가 가리키는 행(예: `nexa_knowledge_doc_sync_policies` — 이름은 통합 DDL에서 확정)에 최소한 다음을 둘 수 있다: **스캔 간격**, **지연 허용**, **우선순위**, **실시간 웹훅 여부**, **배치 큐 이름**. 본 SCHM은 FK만 전제하고, 컬럼 정의는 `_KNOWLEDGE`/플랫폼 DDL에 둔다.

### 6.4 다도메인·잠금 운영 규칙 (요약)

**R-SYNC-1:** `responsible_domain`은 **하나**를 필수로 두고, 교체 시 감사 로그·정책 승인 흐름을 권장한다.

**R-SYNC-2:** 행을 갱신하는 코드는 **`last_writer_domain`**을 자신의 코드로 set 한다.

**R-SYNC-3:** `lock_metadata.lock_holder_domain`이 설정된 동안 다른 도메인은 **덮어쓰기 전 검사**(또는 낙관적 락 버전 필드 추가)를 한다. 잠금 TTL·강제 해제는 운영 SPEC.

**R-SYNC-4:** `sync_asset_kind`·`hash_profile` 변경 시 **재해시·재스캔**을 트리거할지 여부를 배치 규칙에 명시한다.

**R-SYNC-5:** `anchor_domain`·`sync_asset_kind`는 `traceability_paths`와 **중복이면** 한쪽에서만 관리하고 나머지는 뷰/트리거로 동기화하는 방안을 통합 마이그레이션에서 선택한다.

### 6.5 명문화 — 전역 동기화 상태·다도메인 방어

Nexion 외 **ERP·IoT** 등 다른 도메인이 유입되어도 동기화 메타가 **섞이지 않도록** 필드 설계를 명시한다.

- **진실원 분리(재명시):** 본 테이블은 **헬스·해시·잠금** 보조층이다. **N-PATH 파일 실종·유예·삭제**는 §4.4.1·`traceability_paths`만이 단일 머신이다.
- **다도메인 조율:** `responsible_domain`으로 동기화 **책임 주체**를 고정하고, `last_writer_domain`으로 **마지막 쓰기 주체**를 남긴다. `lock_metadata`는 **논리 잠금**과, `last_sync_status = conflict` 시 **어느 시스템들 간 충돌인지**(`conflict_parties` 등)를 기록하는 용도로 쓴다.
- **자산 불가지론(형태 중립):** `sync_asset_kind`·`hash_profile`로 마크다운·이미지·영상·**가상 DB 로우** 등 **서로 다른 동기화·해시 전략**을 분기한다. 크롤러·잡은 이 두 값을 기준으로 파이프라인을 선택한다.

---

## 7. `nexa_knowledge_nexion_doc_node_links` 필드 명세

**기능:** `doc_anchor`와 Vue Flow `node_id` 사이의 연결 행만 두고, `linked` / `orphaned` / `archived`로 귀속 상태를 관리한다. 테이블명에 **Nexion**을 넣어 일반어 `Composer`와의 충돌을 피한다.

**목적:** Late Anchoring 이후에도 캔버스 노드와 실제 파일이 어떻게 묶였는지 명시하고, 고아 자산을 쿼리·UI로 드러낸다.

### 7.1 명문화 — Nexion 전용 연결 레이어

- **레이어 분리:** Vue Flow **`node_id`** 와 `doc_anchor`의 연결은 **오직 본 테이블**에만 둔다. 플랫폼 공통 지식 계층(`_KNOWLEDGE`의 `nexa_knowledge_references` 등)과 **역할이 섞이지 않게** 하여, 공통 스키마의 순수성과 Nexion UI 전용 메타의 **논리적 분리**를 유지한다.
- **Late Anchoring:** `status`(`linked`, `orphaned`, `archived`)로 **설계(노드) 선행 → 이후 실제 자산 연결** 흐름을 데이터 레벨에서 안정적으로 표현한다. 연결 전·해제 후 상태가 쿼리·UI에서 일관되게 드러나야 한다.

| 컬럼명             | 타입(권장)  | NULL     | 기본값               | 제약·인덱스                                   | 설명                                     |
| ------------------ | ----------- | -------- | -------------------- | --------------------------------------------- | ---------------------------------------- |
| `doc_node_link_id` | UUID        | NOT NULL | `uuid_generate_v7()` | PK                                            | 연결 행 식별자                           |
| `project_id`       | UUID        | NOT NULL | —                    | 인덱스                                        | 프로젝트                                 |
| `doc_anchor`       | UUID        | NOT NULL | —                    | 인덱스                                        | 연결 문서 앵커                           |
| `node_id`          | UUID        | NULL     | —                    | 부분 인덱스(linked)                           | Vue Flow 노드 ID                         |
| `asset_type`       | VARCHAR(30) | NOT NULL | `document`           | 인덱스                                        | `document` / `image` / `media` / `other` |
| `status`           | VARCHAR(20) | NOT NULL | `linked`             | `chk_nxn_doc_node_status` + 연결 일관성 CHECK | 아래 열거 설명 참조                      |
| `linked_at`        | TIMESTAMPTZ | NULL     | —                    | —                                             | 연결 시각                                |
| `unlinked_at`      | TIMESTAMPTZ | NULL     | —                    | —                                             | 연결 해제 시각                           |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`              | —                                             | 생성 시각                                |
| `updated_at`       | TIMESTAMPTZ | NOT NULL | `now()`              | 트리거 갱신                                   | 수정 시각                                |

### `nexa_knowledge_nexion_doc_node_links.status` 열거

- **`linked`:** 캔버스 노드에 귀속. 이 경우 `node_id`는 반드시 있어야 한다.
- **`orphaned`:** 어떤 노드에도 연결되지 않음. `node_id`는 NULL을 권장한다.
- **`archived`:** 보관·비활성. `node_id`는 NULL일 수 있다.

### 연결 일관성(비즈니스 규칙)

**R-LNK-1:** `status = linked`이면 `node_id`가 반드시 존재해야 한다.

**R-LNK-2:** `orphaned` 또는 `archived`일 때 물리 파일이 실제로 있는지는 `traceability_paths`와 별도로 판단한다.

DDL에는 위 일관성을 `chk_nxn_doc_node_linked_consistency` CHECK로 구현한다.

---

## 8. Link ID·접두어 매핑 무결성

**M-LINK-1:** `link_id`는 프로젝트 안에서 카드 식별자로 유지한다. 활성 행 기준 유일성은 DDL의 부분 유니크로 보강할 수 있다.

**M-LINK-2:** 파일명·제목은 바꿀 수 있으나 `doc_anchor`는 불변으로 둔다.

**M-LINK-3:** `logical_path`가 바뀌면 `physical_path`와 동기화 로그를 함께 갱신한다.

**M-LINK-4:** `(project_id, link_id, logical_path)` 조합은 유일해야 하며, 동일 논리 슬롯의 중복을 막는다.

**M-LINK-5:** `parent_path_id`가 NULL이 아니면 상위 행과 **동일 `project_id`**(또는 문서화된 루트 예외)를 만족해야 하고, `depth`는 상위 `depth + 1`과 맞춘다. 순환 참조는 앱·제약으로 금지한다.

**M-LINK-6:** `anchor_domain`·`anchor_type`·`doc_anchor` 조합은 **같은 실체를 가리키는 중복 행**을 만들지 않도록 유니크 또는 운영 검증으로 관리한다(정책은 통합 SPEC에 둔다).

---

## 9. 상태 전이(운영 규약)

**`traceability_paths`:** `active`에서 디스크 경로만 바뀌면 앵커를 유지한 채 `moved`로 둘 수 있다. 노드 연결 해제·미매핑이면 `orphaned`로 갈 수 있다. 크롤러가 대상을 찾지 못하면 **`missing_since`를 최초 1회 설정**하고, 유예 기간 내 재발견 시 NULL로 되돌린다. 미발견 스캔이 임계를 넘으면 `deleted`로 본다. **구현 단계의 이벤트·전이 표는 §4.4.1에 고정**한다. `moved`·`orphaned`·`deleted` 등 **상태 전환 시 `related_audit_id`로 감사 행을 연결**하는 것을 권장한다. `moved`에서 재동기화가 끝나면 다시 `active`로 돌아갈 수 있다. 계층 필드(`parent_path_id`, `depth`)는 `logical_path` 변경·이동 시 **트리 정합**을 맞춰 갱신한다.

**`doc_sync_state`:** (보조) `changed` 뒤 해시·경로(또는 가상 자산 버전)가 다시 맞으면 `ok`로 정리한다. **`conflict`** 는 `lock_metadata`에 충돌 당사 도메인·시각·사유를 남긴 뒤, 책임 도메인(`responsible_domain`) 또는 승인 큐에서 해결하면 `ok`로 수렴시키고 잠금 필드를 비운다. 다도메인이 동시에 갱신할 때는 **잠금 TTL·`last_writer_domain` 검사**로 재발을 줄인다. **파일 미발견·유예·삭제 전이는 §4.4.1을 따르며, `last_sync_status='missing'`만으로 UI 상태를 바꾸지 않는다.**

**`nexa_knowledge_residency`:** `storage_tier`를 바꿀 때 **`tier_changed_at`** 과 함께 **`transition_reason_code`** 를 설정한다(자동 스왑·수동·정합 수리 구분). **`swap_policy_id`** 가 금지하는 방향(예: ERA를 L3로 내림)은 정책 엔진에서 차단. **`last_consistency_check_at`** 는 정합 잡이 주기적으로 갱신하며, 불일치 발견 시 사유 코드·감사와 연계한다.

---

## 10. 배포 전제·인덱스·RLS·트리거 (정리)

현재 단계에서는 **실 DB에 본 스키마가 아직 없을 수 있다.** 아래는 “무엇을 언제·어디에 둘지”만 정리한다. **`nexa_knowledge_*` 접두 객체는 전체 플랫폼에서 공유**하는 네임스페이스로 본다. NXN 문서의 DDL은 **명세·레시피**이고, 실제 배포는 **플랫폼 통합 마이그레이션**에서 단일 경로로 가져가며, **복잡도를 줄이기 위해 현재 테이블(§1 수준)부터 두고 천천히 확장**해도 된다.

**플랫폼 SSOT 병합:** 실행 DB에 대한 **1순위 진실**은 `docs/_KNOWLEDGE DDL 통합 스키마 및 물리 설계(SSOT).md`다. `CREATE`를 돌리기 전에 통합본과 테이블·컬럼을 대조하고, 충돌은 **마이그레이션으로 통합 SSOT에 수렴**시키는 절차를 **`[NXN] [DDL] ...` §0.0**에 명시해 두었다.

### 10.1 적용 순서(원칙)

1. **테이블 존재:** `nexa_knowledge_residency`(VOID 원장, §5), `nexa_knowledge_traceability_paths`, `nexa_knowledge_doc_sync_state`, `nexa_knowledge_nexion_doc_node_links`가 생성된 뒤에만(해당 DDL 범위에 포함된 것만) 인덱스·트리거·RLS·예시 쿼리를 적용할 수 있다. `residency`는 `_KNOWLEDGE` 통합 DDL 블록과 동일 객체로 배포하는 것을 권장한다.
2. **DDL 파일 §1~§2:** 테이블 생성 + 최소 인덱스(해당 절에 포함된 것) + 연결 일관성 CHECK는 “첫 배포” 후보다. 실제로는 플랫폼 **전체 스키마 문서**와 객체 이름·소유 스키마가 겹치지 않게 한 번에 맞춘다.
3. **DDL 파일 §3(추가 인덱스):** 운영·크롤러·UI 쿼리 패턴이 확정된 뒤 **필요할 때만** 생성한다. 테이블이 없거나 다른 도메인에서 이미 동일 역할 인덱스를 제공하면 생략·병합한다.

### 10.2 인덱스: 필수(최소) vs 선택(운영)

- **최소(테이블과 함께 두는 것):** DDL §1에 이미 포함된 유니크·조회용 인덱스(예: 논리 경로 유니크, `doc_anchor` 조회, Nexion 링크의 프로젝트·상태·앵커 인덱스)를 말한다. 통합 DDL로 옮길 때도 이 층은 보통 유지한다.
- **선택(DDL §3):** 프로젝트+상태 목록, 물리 경로 역조회, 활성 `link_id` 부분 유니크, 해시 조회, 동기화 시각 정렬, 이상 상태 부분 인덱스, `doc_anchor`당 1행 정책 시 유니크, `node_id` 역조회(linked), 프로젝트+자산 타입, **`doc_sync_state`의 `responsible_domain`·`sync_policy_id`·`sync_priority_cached` 스케줄 스윕**, **`residency`의 `project_id`·`swap_policy_id`·`last_consistency_check_at` 스윕** 등이다. **성능·운영 요구가 생긴 뒤** `EXPLAIN` 근거로 추가한다.

### 10.3 소유권·공유 범위 (결정)

- **`nexa_knowledge_*`:** 전체 시스템(지식·Nexion·향후 도메인)에서 **공유**하는 테이블·인덱스 네임스페이스로 둔다. Nexion이 주 소비자일 수 있으나 **소유권은 플랫폼 지식 계층**에 둔다.
- **시작 범위:** 복잡도를 줄이기 위해 **우선 DDL §1~§2 수준(현재 정의된 테이블·최소 인덱스·CHECK)** 만 올리고, **§3 선택 인덱스·RLS·트리거·추가 컬럼**은 필요·합의가 생길 때 **단계적 마이그레이션**으로 더해도 된다.
- **DDL §3:** 계속 **참고용(레시피)**으로 두고, 실행 전 플랫폼 통합 DDL과 중복·이름 충돌을 검토한다.

### 10.4 RLS

`nexa_knowledge_traceability_paths`, `nexa_knowledge_doc_sync_state`, `nexa_knowledge_nexion_doc_node_links`는 `ENABLE ROW LEVEL SECURITY`를 켤 수 있다. 격리 단위는 `project_id` ∈ 현재 사용자가 접근 가능한 프로젝트이며, 구현은 `nxn_user_project_ids()`로 캡슐화한다. **`project_members` 정의는 `docs/__NEXA 오케스트레이션 스키마 DDL v5.md` §1-1과 동일**하며, 테이블이 없으면 `[NXN] [DDL] project_members 오케스트레이션 DDL v5 정렬.sql` 로 생성한다. 멤버 테이블 부재 시에만 `projects.owner_id` **임시** 본문을 쓴다(`[NXN] [DDL] ...` §5 A/B).

**`nexa_knowledge_residency`:** §5.1에서 **`project_id`를 비정규화**해 두었으므로, RLS 예시는 **`project_id IS NULL`(플랫폼 전역 행은 관리자·시스템 역할만)** 또는 **`project_id IN (nxn_user_project_ids())`** 로 단순화할 수 있다. `project_id`가 아직 backfill 되지 않은 레거시 행은 마이그레이션으로 채우거나, 전환 기간 한시적으로 조인 기반 정책을 병행한다. 배치·크롤러·스케줄러는 `BYPASSRLS` 전용 역할 등으로 처리한다.

### 10.5 트리거

`updated_at`을 두는 테이블(`nexa_knowledge_traceability_paths`, `nexa_knowledge_doc_sync_state`, `nexa_knowledge_nexion_doc_node_links`)은 `BEFORE UPDATE` 시 `updated_at`을 현재 시각으로 맞추는 패턴을 권장한다. **`nexa_knowledge_residency`는 SSOT에 `updated_at`이 없다.** 티어·접근 갱신 시 `tier_changed_at` 등은 애플리케이션 또는 별도 트리거로 맞춘다. 함수명·소유 스키마는 통합 DDL 네이밍과 충돌하지 않게 조정한다.

---

## 11. 연계 문서

- `_KNOWLEDGE DDL 통합 스키마 및 물리 설계(SSOT).md` — `nexa_knowledge_residency` 등 통합 `CREATE TABLE`
- `_KNOWLEDGE SPEC CRUD 테이블 및 필드 명세서.md` — `nexa_knowledge_residency` §2.9 상세
- `[NXN] [DDL] NEXA Nexion 독립형 인덱스 및 자산 관리 DDL.md` — CREATE(§1), CHECK(§2), **선택 인덱스(§3, 조건부)**, 트리거(§4), RLS(§5), 예시 쿼리(§6)
- `[NXN] [ARCH] N-PATH 보안 및 외부 자산 연동 설계서.md` — §3 Doc Sync Crawler·자동화 잡 구현 체크리스트; 스캔·큐 세부는 오케스트레이션 SSOT
- `[NXN] [API] NEXA Nexion API 및 통신 규약.md` — Vue Flow·백엔드 JSON 계약(REST v1)

운영 배포 전 인증·멤버십 모델에 맞춰 RLS·FK를 최종 확정한다.

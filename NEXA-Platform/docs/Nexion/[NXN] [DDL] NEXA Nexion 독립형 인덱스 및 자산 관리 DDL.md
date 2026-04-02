# [NXN] [DDL] NEXA Nexion 독립형 인덱스 및 자산 관리 DDL

**DBeaver 등 일괄 실행용 순수 SQL**
1. **`[NXN] [DDL] project_members 오케스트레이션 DDL v5 정렬.sql`** — `project_members` 없을 때 **먼저** 실행(정의는 `docs/__NEXA 오케스트레이션 스키마 DDL v5.md` §1-1·§3).  
2. **`[NXN] [DDL] NEXA Nexion 독립형 인덱스 및 자산 관리 DDL.sql`** — 본 MD §1~§5와 동일(§6 예시는 파일 하단 주석).

**NXN 명세 정렬:** 본 파일의 `CREATE TABLE`·제약·인덱스는 **`[NXN] [SCHM] NEXA Nexion 독립형 인덱스 및 자산 관리 스키마.md`** §4~§7과 **맞춘다.**

**구현 티어(Tier A/B):** Tier A(코어)만 배포할 때 `nexa_knowledge_residency`·전면 RLS 등 **Tier B 객체는 생략하거나 후행 마이그레이션**으로 둔다. 정의는 SCHM **§2.2**, **코어 Phase 순서**는 `[NXN] [PRD] Nexion 기능과 작업 순서.md` **§3.2**, 체크리스트는 `[NXN] NEXA Nexion 개발 순서와 체크 리스트.md` 서두.

**플랫폼 진실원(1순위 SSOT):** 실행 DB에 올라가는 `nexa_knowledge_*` 객체의 **이름·컬럼·소유 스키마**는 **`docs/_KNOWLEDGE DDL 통합 스키마 및 물리 설계(SSOT).md`**(이하 **통합 SSOT**)가 우선한다. **`nexa_knowledge_doc_sync_state`** 및 traceability의 **`doc_anchor`** 명칭은 SSOT와 본 파일이 **정합**된다. 본 NXN DDL의 **N-PATH 전개**(`traceability_paths`의 `project_id`·`link_id`·`physical_path` 등)는 SSOT 경량 정의보다 넓을 수 있으며, 그 경우 **통합 SSOT + 단일 마이그레이션**으로 컬럼을 확장하고 문서를 맞춘다(NXN 문서만 고치고 DB를 양립시키지 않는다).

### 0.0 `CREATE` 실행 전 필수 절차(명시)

아래를 **한 번 수행한 뒤** §1 이하 SQL을 실행한다. (문장만 적어 두는 것이 아니라 **리포지토리에서 실제로 대조**한다.)

1. **통합 SSOT 문서(또는 이미 배포된 마이그레이션 스크립트)** 에서 `nexa_knowledge_` 접두 테이블이 정의되어 있는지 검색한다.
2. **같은 이름의 `CREATE TABLE`이 이미 있으면:** 본 파일 §1의 동명 `CREATE TABLE` 블록은 **그대로 실행하지 않는다.** 대신 통합 SSOT 정의와 NXN SCHM을 비교하고, 차이는 **플랫폼 쪽 단일 마이그레이션**(`ALTER`·재생성·데이터 백필)으로만 반영한다.
3. **통합 SSOT에 해당 테이블이 없으면:** NXN DDL §1로 초기 생성할 수 있다. 이후 통합 SSOT에 편입할 때는 **통합본을 기준으로 한 번에 이전**하고, NXN 전용과 플랫폼 전용 정의가 **영구 이중 존재하지 않게** 한다.
4. **이름은 같고 컬럼·제약이 다르면:** “NXN DDL이 맞다”가 아니라 **통합 SSOT + 마이그레이션으로 한쪽으로 합친 뒤**, 필요 시 **NXN SCHM/본 DDL 문서를 그 결과에 맞게 수정**한다.

**한 줄 요약:** 이 파일의 SQL은 **복붙 실행 전 통합 SSOT와 대조**하고, 충돌 시 **DB는 마이그레이션 한 줄기**, 문서는 그에 맞춰 갱신한다.

**`swap_policy_id` / `sync_policy_id`:** SCHM상 FK 대상 원장 테이블은 통합 DDL에서 확정할 수 있어, 본 DDL에서는 **UUID만 두고 FK는 생략**한다(선택적으로 `ALTER TABLE ... ADD CONSTRAINT ... REFERENCES` 추가).

스키마 필드·배포 전제·RLS·트리거 요약은 SCHM **§10** 및 상단 「문서 계층」을 따른다.

---

## 0. 사전 조건

- **`project_id` NOT NULL(개발자 고정):** 본 파일의 Nexion 직결 테이블은 **플랫폼 통합 DB 안에서의 테넌트(데이터 격리) 키**로 `project_id`를 둔다. **별도 DB·별도 사용자 체계**로 Nexion만 분리할 필요는 없다. **“비즈니스 워크플로 프로젝트” 종속**과는 별개 — `[NXN] [CNCP] ... 지식 OS ...` **§1.2**, `[NXN] [API] ...` **§2.2.1**, SCHM **§2.1**.
- `uuid_generate_v7()` 사용 시: `pg_uuidv7` 확장 또는 동등 구현. 없으면 `gen_random_uuid()`로 치환.
- **`project_members`:** 플랫폼 SSOT는 **`docs/__NEXA 오케스트레이션 스키마 DDL v5.md`** §1-1과 동일하다. DB에 테이블이 없으면 동일 폴더 **`project_members 오케스트레이션 DDL v5 정렬.sql`** 을 먼저 실행한다(기존 `projects.owner_id` 백필 포함).  
- **`nxn_user_project_ids()` (RLS):** 표준은 `project_members` 조인이다. 멤버 테이블 생성 전 임시로만 `projects.owner_id` 본문을 쓴다 — 본 문서 §5·동명 `.sql` §5 주석 «비상».
- `related_audit_id` → `nexa_knowledge_audit_logs` 등 **감사 테이블 FK**는 인프라 준비 후 선택 적용.

---

## 1. 테이블 생성

`nexa_knowledge_traceability_paths`는 **자기 참조 FK**(`parent_path_id`)가 있으므로 한 번에 `CREATE TABLE`로 정의한다.

```sql
-- ---------------------------------------------------------------------------
-- 1-A) N-PATH 인덱스 · Inode — SCHM §4
-- ---------------------------------------------------------------------------
CREATE TABLE nexa_knowledge_traceability_paths (
    path_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID NOT NULL,
    parent_path_id UUID REFERENCES nexa_knowledge_traceability_paths(path_id) ON DELETE SET NULL,
    depth SMALLINT NOT NULL DEFAULT 0,
    doc_anchor UUID NOT NULL,
    anchor_domain VARCHAR(30) NOT NULL DEFAULT 'knowledge',
    anchor_type VARCHAR(40) NOT NULL DEFAULT 'document_file',
    link_id VARCHAR(120) NOT NULL,
    logical_path TEXT NOT NULL,
    physical_path TEXT NOT NULL,
    title TEXT NOT NULL,
    source_hash VARCHAR(128),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    last_seen_at TIMESTAMPTZ,
    missing_since TIMESTAMPTZ,
    related_audit_id UUID,
    storage_tier VARCHAR(10),
    last_access_at TIMESTAMPTZ,
    access_count_rolling INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    nixie_lumina_profile JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_trace_status CHECK (status IN ('active', 'moved', 'orphaned', 'deleted')),
    CONSTRAINT chk_trace_depth CHECK (depth >= 0),
    CONSTRAINT chk_trace_anchor_domain CHECK (
        anchor_domain IN ('knowledge', 'orchestration', 'device', 'platform')
    ),
    CONSTRAINT chk_trace_storage_tier CHECK (
        storage_tier IS NULL OR storage_tier IN ('L1', 'L2', 'L3')
    ),
    CONSTRAINT chk_trace_access_count CHECK (access_count_rolling >= 0),
    CONSTRAINT uq_trace_project_doc_anchor UNIQUE (project_id, doc_anchor)
);

CREATE UNIQUE INDEX uq_trace_project_link_logical
    ON nexa_knowledge_traceability_paths(project_id, link_id, logical_path);

CREATE INDEX idx_trace_parent_path ON nexa_knowledge_traceability_paths(parent_path_id)
    WHERE parent_path_id IS NOT NULL;

CREATE INDEX idx_trace_project_depth ON nexa_knowledge_traceability_paths(project_id, depth);

CREATE INDEX idx_trace_anchor_lookup
    ON nexa_knowledge_traceability_paths(anchor_domain, anchor_type, doc_anchor);

CREATE INDEX idx_trace_project_physical
    ON nexa_knowledge_traceability_paths(project_id, physical_path);

-- ---------------------------------------------------------------------------
-- 1-B) VOID 상주 원장 — SCHM §5
-- ---------------------------------------------------------------------------
CREATE TABLE nexa_knowledge_residency (
    residency_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID,
    entity_type VARCHAR(30) NOT NULL,
    entity_id UUID NOT NULL,
    swap_policy_id UUID,
    storage_tier VARCHAR(10) NOT NULL,
    void_hint VARCHAR(20),
    access_count_rolling INTEGER NOT NULL DEFAULT 0,
    last_access_at TIMESTAMPTZ,
    tier_changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    transition_reason_code VARCHAR(64),
    tier_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_consistency_check_at TIMESTAMPTZ,
    status SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT uq_knowledge_residency_entity UNIQUE (entity_type, entity_id),
    CONSTRAINT chk_residency_tier CHECK (storage_tier IN ('L1', 'L2', 'L3')),
    CONSTRAINT chk_residency_status CHECK (status IN (0, 1)),
    CONSTRAINT chk_residency_access_count CHECK (access_count_rolling >= 0)
);

CREATE INDEX idx_residency_project_tier
    ON nexa_knowledge_residency(project_id, storage_tier);

CREATE INDEX idx_residency_tier_last_access
    ON nexa_knowledge_residency(storage_tier, last_access_at DESC);

CREATE INDEX idx_residency_swap_policy
    ON nexa_knowledge_residency(swap_policy_id)
    WHERE swap_policy_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 1-C) 전역 동기화 상태 — SCHM §6 (보조 헬스; 파일 유예·삭제 머신은 1-A + SCHM §4.4.1)
-- ---------------------------------------------------------------------------
CREATE TABLE nexa_knowledge_doc_sync_state (
    sync_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID NOT NULL,
    doc_anchor UUID NOT NULL,
    responsible_domain VARCHAR(40) NOT NULL DEFAULT 'nexion',
    last_writer_domain VARCHAR(40),
    anchor_domain VARCHAR(30),
    sync_asset_kind VARCHAR(40) NOT NULL DEFAULT 'document_file',
    hash_profile VARCHAR(40),
    sync_policy_id UUID,
    sync_priority_cached SMALLINT,
    last_sync_status VARCHAR(30) NOT NULL,
    lock_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_error_code VARCHAR(80),
    prev_source_hash VARCHAR(128),
    curr_source_hash VARCHAR(128),
    last_scanned_path TEXT,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_doc_sync_project_anchor UNIQUE (project_id, doc_anchor),
    CONSTRAINT chk_sync_status CHECK (
        last_sync_status IN ('ok', 'changed', 'missing', 'conflict', 'error')
    )
);

CREATE INDEX idx_doc_sync_doc_anchor ON nexa_knowledge_doc_sync_state(doc_anchor);

CREATE INDEX idx_doc_sync_project_synced
    ON nexa_knowledge_doc_sync_state(project_id, last_synced_at DESC);

CREATE INDEX idx_doc_sync_responsible_domain
    ON nexa_knowledge_doc_sync_state(project_id, responsible_domain);

-- ---------------------------------------------------------------------------
-- 1-D) Nexion 전용 노드 연결 — SCHM §7
-- ---------------------------------------------------------------------------
CREATE TABLE nexa_knowledge_nexion_doc_node_links (
    doc_node_link_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID NOT NULL,
    doc_anchor UUID NOT NULL,
    node_id UUID,
    asset_type VARCHAR(30) NOT NULL DEFAULT 'document',
    status VARCHAR(20) NOT NULL DEFAULT 'linked',
    linked_at TIMESTAMPTZ,
    unlinked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_nxn_doc_node_status CHECK (status IN ('linked', 'orphaned', 'archived'))
);

CREATE INDEX idx_knxn_doc_node_project_status
    ON nexa_knowledge_nexion_doc_node_links(project_id, status);

CREATE INDEX idx_knxn_doc_node_anchor
    ON nexa_knowledge_nexion_doc_node_links(doc_anchor);
```

---

## 2. CHECK 제약(연결 일관성)

SCHM §7 — `linked`일 때 `node_id` 필수.

```sql
ALTER TABLE nexa_knowledge_nexion_doc_node_links
    ADD CONSTRAINT chk_nxn_doc_node_linked_consistency
    CHECK (
        (status = 'linked' AND node_id IS NOT NULL)
        OR (status IN ('orphaned', 'archived'))
    );
```

---

## 3. 선택 인덱스(운영·크롤러·스케줄러) — 조건부

**적용 전제:** §1 테이블이 존재할 때만 실행. 통합 DDL과 **이름·정의 중복**이면 생략·병합한다(SCHM §10.3).

```sql
-- traceability — SCHM §4 / §10.2
CREATE INDEX idx_trace_project_status
    ON nexa_knowledge_traceability_paths(project_id, status)
    WHERE status <> 'deleted';

CREATE UNIQUE INDEX uq_trace_project_link_id_active
    ON nexa_knowledge_traceability_paths(project_id, link_id)
    WHERE status = 'active';

CREATE INDEX idx_trace_project_hash
    ON nexa_knowledge_traceability_paths(project_id, source_hash)
    WHERE source_hash IS NOT NULL;

CREATE INDEX idx_trace_missing_since
    ON nexa_knowledge_traceability_paths(project_id, missing_since)
    WHERE missing_since IS NOT NULL;

-- residency — 정합 스윕 등
CREATE INDEX idx_residency_consistency_stale
    ON nexa_knowledge_residency(last_consistency_check_at)
    WHERE last_consistency_check_at IS NOT NULL;

CREATE INDEX idx_residency_transition_reason
    ON nexa_knowledge_residency(transition_reason_code)
    WHERE transition_reason_code IS NOT NULL;

-- doc_sync
CREATE INDEX idx_doc_sync_project_status
    ON nexa_knowledge_doc_sync_state(project_id, last_sync_status)
    WHERE last_sync_status IN ('changed', 'missing', 'conflict', 'error');

CREATE INDEX idx_doc_sync_policy_priority
    ON nexa_knowledge_doc_sync_state(sync_priority_cached, last_synced_at);

CREATE INDEX idx_doc_sync_sync_policy
    ON nexa_knowledge_doc_sync_state(sync_policy_id)
    WHERE sync_policy_id IS NOT NULL;

CREATE INDEX idx_doc_sync_anchor_domain
    ON nexa_knowledge_doc_sync_state(anchor_domain, doc_anchor)
    WHERE anchor_domain IS NOT NULL;

-- nexion links
CREATE INDEX idx_knxn_doc_node_node_id
    ON nexa_knowledge_nexion_doc_node_links(node_id)
    WHERE node_id IS NOT NULL AND status = 'linked';

CREATE INDEX idx_knxn_doc_node_project_type
    ON nexa_knowledge_nexion_doc_node_links(project_id, asset_type);
```

---

## 4. `updated_at` 트리거

`nexa_knowledge_residency`는 SCHM상 **`updated_at` 컬럼 없음** — 트리거 대상에서 제외. 티어 변경 시 `tier_changed_at`은 애플리케이션에서 갱신.

```sql
CREATE OR REPLACE FUNCTION nxn_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trace_paths_updated
    BEFORE UPDATE ON nexa_knowledge_traceability_paths
    FOR EACH ROW EXECUTE FUNCTION nxn_touch_updated_at();

CREATE TRIGGER trg_doc_sync_updated
    BEFORE UPDATE ON nexa_knowledge_doc_sync_state
    FOR EACH ROW EXECUTE FUNCTION nxn_touch_updated_at();

CREATE TRIGGER trg_knxn_doc_node_links_updated
    BEFORE UPDATE ON nexa_knowledge_nexion_doc_node_links
    FOR EACH ROW EXECUTE FUNCTION nxn_touch_updated_at();
```

PostgreSQL 13 이하: `EXECUTE PROCEDURE nxn_touch_updated_at();`

---

## 5. RLS

- **테넌트 테이블:** `project_id` ∈ 현재 사용자가 접근 가능한 프로젝트 집합(`nxn_user_project_ids()`).
- **residency:** `project_id IS NOT NULL` 인 행만 동일 정책. `project_id IS NULL`(플랫폼 전역)은 **서비스 역할·BYPASSRLS**로만 다루는 것을 권장(SCHM §10.4).
- **세션:** 앱·DBeaver에서 `SET app.current_user_id = '<uuid>'` 를 주지 않으면 RLS 통과 행이 없을 수 있다.
- **표준:** `project_members`는 **`docs/__NEXA 오케스트레이션 스키마 DDL v5.md`** 와 맞추고, 없으면 **`project_members 오케스트레이션 DDL v5 정렬.sql`** 로 생성·백필한다.  
- **임시:** 멤버 테이블 생성 전에만 **A**(`projects.owner_id`)를 쓰고, 생성 후 **B**로 교체한다.

**A) 임시 — `project_members` 없음**

```sql
CREATE OR REPLACE FUNCTION nxn_user_project_ids()
RETURNS SETOF UUID AS $$
    SELECT p.project_id
    FROM projects p
    WHERE p.owner_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;
```

**B) 표준 — `project_members` 존재 시(권장)**

```sql
CREATE OR REPLACE FUNCTION nxn_user_project_ids()
RETURNS SETOF UUID AS $$
    SELECT pm.project_id
    FROM project_members pm
    WHERE pm.user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;
```

**공통 — RLS 활성화 및 정책**

```sql

ALTER TABLE nexa_knowledge_traceability_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexa_knowledge_residency ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexa_knowledge_doc_sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexa_knowledge_nexion_doc_node_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY nxn_trace_tenant_isolation
    ON nexa_knowledge_traceability_paths
    FOR ALL
    USING (project_id IN (SELECT nxn_user_project_ids()))
    WITH CHECK (project_id IN (SELECT nxn_user_project_ids()));

CREATE POLICY nxn_residency_tenant_isolation
    ON nexa_knowledge_residency
    FOR ALL
    USING (
        project_id IS NOT NULL
        AND project_id IN (SELECT nxn_user_project_ids())
    )
    WITH CHECK (
        project_id IS NOT NULL
        AND project_id IN (SELECT nxn_user_project_ids())
    );

CREATE POLICY nxn_sync_tenant_isolation
    ON nexa_knowledge_doc_sync_state
    FOR ALL
    USING (project_id IN (SELECT nxn_user_project_ids()))
    WITH CHECK (project_id IN (SELECT nxn_user_project_ids()));

CREATE POLICY nxn_doc_node_links_tenant_isolation
    ON nexa_knowledge_nexion_doc_node_links
    FOR ALL
    USING (project_id IN (SELECT nxn_user_project_ids()))
    WITH CHECK (project_id IN (SELECT nxn_user_project_ids()));
```

---

## 6. 예시 쿼리

```sql
-- 고아 자산(노드 미연결) + 경로 메타
SELECT l.doc_node_link_id, l.doc_anchor, t.title, t.logical_path, t.physical_path, l.updated_at
FROM nexa_knowledge_nexion_doc_node_links l
JOIN nexa_knowledge_traceability_paths t ON t.doc_anchor = l.doc_anchor AND t.project_id = l.project_id
WHERE l.project_id = :project_id
  AND l.status = 'orphaned'
ORDER BY l.updated_at DESC;

-- 동기화 이상 + 책임 도메인
SELECT s.doc_anchor, s.responsible_domain, s.last_writer_domain,
       s.last_sync_status, s.lock_metadata, s.last_synced_at
FROM nexa_knowledge_doc_sync_state s
WHERE s.project_id = :project_id
  AND s.last_sync_status IN ('conflict', 'error', 'missing')
ORDER BY s.last_synced_at DESC;

-- 경로 트리: 직계 자식
SELECT c.path_id, c.logical_path, c.depth, c.status
FROM nexa_knowledge_traceability_paths c
WHERE c.project_id = :project_id
  AND c.parent_path_id = :parent_path_id
ORDER BY c.logical_path;

-- 프로젝트 소속 상주(L3 강등 후보 스케치)
SELECT r.entity_type, r.entity_id, r.storage_tier, r.last_access_at, r.transition_reason_code
FROM nexa_knowledge_residency r
WHERE r.project_id = :project_id
  AND r.storage_tier = 'L1'
  AND r.last_access_at < NOW() - INTERVAL '30 days'
ORDER BY r.last_access_at NULLS FIRST;
```

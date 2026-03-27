# [NXN] [DDL] NEXA Nexion 독립형 인덱스 및 자산 관리 DDL

**단일 명세 기준:** 본 파일의 `CREATE TABLE`·제약·인덱스는 **`[NXN] [SCHM] NEXA Nexion 독립형 인덱스 및 자산 관리 스키마.md`** §4~§7과 **맞춘다.** 플랫폼 전역 SSOT는 **`docs/_KNOWLEDGE DDL 통합 스키마 및 물리 설계(SSOT).md`**이며, 이름·컬럼이 겹치면 **통합 마이그레이션으로 SSOT에 수렴**시킨다.

**`swap_policy_id` / `sync_policy_id`:** SCHM상 FK 대상 원장 테이블은 통합 DDL에서 확정할 수 있어, 본 DDL에서는 **UUID만 두고 FK는 생략**한다(선택적으로 `ALTER TABLE ... ADD CONSTRAINT ... REFERENCES` 추가).

스키마 필드·배포 전제·RLS·트리거 요약은 SCHM **§10** 및 상단 「문서 계층」을 따른다.

---

## 0. 사전 조건

- `uuid_generate_v7()` 사용 시: `pg_uuidv7` 확장 또는 동등 구현. 없으면 `gen_random_uuid()`로 치환.
- `project_members` 테이블은 플랫폼 실제 스키마명에 맞게 교체한다.
- `related_audit_id` → `nexa_knowledge_audit_logs` 등 **감사 테이블 FK**는 인프라 준비 후 선택 적용.

---

## 1. 테이블 생성

`nexa_knowledge_traceability_paths`는 **자기 참조 FK**(`parent_path_id`)가 있으므로 한 번에 `CREATE TABLE`로 정의한다.

```sql
-- ---------------------------------------------------------------------------
-- 1-A) NFS 인덱스 · Inode — SCHM §4
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
-- 1-C) 전역 동기화 상태 — SCHM §6
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

- **테넌트 테이블:** `project_id` ∈ 멤버십.
- **residency:** `project_id IS NOT NULL` 인 행만 동일 정책. `project_id IS NULL`(플랫폼 전역)은 **서비스 역할·BYPASSRLS**로만 다루는 것을 권장(SCHM §10.4).

```sql
CREATE OR REPLACE FUNCTION nxn_user_project_ids()
RETURNS SETOF UUID AS $$
    SELECT pm.project_id
    FROM project_members pm
    WHERE pm.user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;

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

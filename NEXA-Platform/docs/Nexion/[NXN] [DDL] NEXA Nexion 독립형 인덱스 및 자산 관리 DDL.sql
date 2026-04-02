-- =============================================================================
-- NEXA Nexion — nexa_knowledge_* 스키마 (DBeaver 등에서 순차 실행용)
-- 원본 명세: 동일 폴더 `[NXN] [DDL] NEXA Nexion 독립형 인덱스 및 자산 관리 DDL.md`
-- project_id = 플랫폼 DB 테넌트(행 격리·RLS) 키. 별도 DB 불필요. 제품 정체성은 CNCP §1.2.
-- =============================================================================
-- 실행 전 필수: docs/_KNOWLEDGE DDL 통합 스키마 및 물리 설계(SSOT).md 와
--   테이블명·컬럼 충돌 여부를 대조할 것(MD §0.0).
-- doc_sync_state·doc_anchor 명칭은 SSOT와 정합. traceability N-PATH 전개 컬럼은
--   SSOT 경량 CREATE와 다를 수 있음 → 동명 테이블이 있으면 §0.0에 따라 ALTER로 확장.
-- 사전 조건:
--   - uuid_generate_v7(): pg_uuidv7 확장 또는 동등 구현. 없으면 DEFAULT를
--     gen_random_uuid()로 바꾼 뒤 실행.
--   - §5 RLS: **먼저** 동일 폴더 `project_members 오케스트레이션 DDL v5 정렬.sql` 실행
--     (근거: docs/__NEXA 오케스트레이션 스키마 DDL v5.md §1-1).
--     멤버 테이블이 없을 때만 아래 주석 «비상: projects.owner_id» 로 nxn_user_project_ids 를 교체.
--   - RLS 켠 뒤 세션에 app.current_user_id 가 없으면 행이 0건으로 보인다 — DBeaver 테스트 시 SET 필요.
--   - PostgreSQL 14 미만: 트리거 절을 EXECUTE PROCEDURE 로 바꿀 것(MD §4 하단).
-- =============================================================================

-- (선택) UUID v7 — 환경에 맞게 주석 해제
-- CREATE EXTENSION IF NOT EXISTS pg_uuidv7;

-- ---------------------------------------------------------------------------
-- §1-A) N-PATH 인덱스 · Inode — SCHM §4
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
-- §1-B) VOID 상주 원장 — SCHM §5
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
-- §1-C) 전역 동기화 상태 — SCHM §6 (보조 헬스; 파일 유예·삭제 머신은 §1-A+SCHM §4.4.1)
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
-- §1-D) Nexion 전용 노드 연결 — SCHM §7
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

-- ---------------------------------------------------------------------------
-- §2 CHECK 제약(연결 일관성) — SCHM §7
-- ---------------------------------------------------------------------------
ALTER TABLE nexa_knowledge_nexion_doc_node_links
    ADD CONSTRAINT chk_nxn_doc_node_linked_consistency
    CHECK (
        (status = 'linked' AND node_id IS NOT NULL)
        OR (status IN ('orphaned', 'archived'))
    );

-- ---------------------------------------------------------------------------
-- §3 선택 인덱스 — MD §3 (통합 DDL과 중복 시 생략)
-- ---------------------------------------------------------------------------
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

CREATE INDEX idx_residency_consistency_stale
    ON nexa_knowledge_residency(last_consistency_check_at)
    WHERE last_consistency_check_at IS NOT NULL;

CREATE INDEX idx_residency_transition_reason
    ON nexa_knowledge_residency(transition_reason_code)
    WHERE transition_reason_code IS NOT NULL;

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

CREATE INDEX idx_knxn_doc_node_node_id
    ON nexa_knowledge_nexion_doc_node_links(node_id)
    WHERE node_id IS NOT NULL AND status = 'linked';

CREATE INDEX idx_knxn_doc_node_project_type
    ON nexa_knowledge_nexion_doc_node_links(project_id, asset_type);

-- ---------------------------------------------------------------------------
-- §4 updated_at 트리거 (PG 14+: EXECUTE FUNCTION / 구버전: EXECUTE PROCEDURE)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- §5 RLS — app.current_user_id + project_members (오케스트레이션 DDL v5 §1-1 정렬)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION nxn_user_project_ids()
RETURNS SETOF UUID AS $$
    SELECT pm.project_id
    FROM project_members pm
    WHERE pm.user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;

-- [비상] project_members 생성 전에만 임시 사용 — 위 함수를 아래로 바꿔 실행 후, 멤버 테이블 생성 뒤 표준으로 되돌릴 것.
/*
CREATE OR REPLACE FUNCTION nxn_user_project_ids()
RETURNS SETOF UUID AS $$
    SELECT p.project_id
    FROM projects p
    WHERE p.owner_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;
*/

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

-- RLS 검증(임시 owner 기준): projects.owner_id 와 맞는 UUID로
--   SET app.current_user_id = '...';
-- 테이블 소유자·BYPASSRLS·일부 슈퍼유저 설정은 정책을 우회할 수 있어, 실제 앱 역할로 SELECT 해 볼 것.

-- =============================================================================
-- §6 예시 쿼리 — 바인딩 변수(:project_id 등) 치환 후 별도 실행 권장
-- =============================================================================
/*
SELECT l.doc_node_link_id, l.doc_anchor, t.title, t.logical_path, t.physical_path, l.updated_at
FROM nexa_knowledge_nexion_doc_node_links l
JOIN nexa_knowledge_traceability_paths t ON t.doc_anchor = l.doc_anchor AND t.project_id = l.project_id
WHERE l.project_id = :project_id
  AND l.status = 'orphaned'
ORDER BY l.updated_at DESC;

SELECT s.doc_anchor, s.responsible_domain, s.last_writer_domain,
       s.last_sync_status, s.lock_metadata, s.last_synced_at
FROM nexa_knowledge_doc_sync_state s
WHERE s.project_id = :project_id
  AND s.last_sync_status IN ('conflict', 'error', 'missing')
ORDER BY s.last_synced_at DESC;

SELECT c.path_id, c.logical_path, c.depth, c.status
FROM nexa_knowledge_traceability_paths c
WHERE c.project_id = :project_id
  AND c.parent_path_id = :parent_path_id
ORDER BY c.logical_path;

SELECT r.entity_type, r.entity_id, r.storage_tier, r.last_access_at, r.transition_reason_code
FROM nexa_knowledge_residency r
WHERE r.project_id = :project_id
  AND r.storage_tier = 'L1'
  AND r.last_access_at < NOW() - INTERVAL '30 days'
ORDER BY r.last_access_at NULLS FIRST;
*/

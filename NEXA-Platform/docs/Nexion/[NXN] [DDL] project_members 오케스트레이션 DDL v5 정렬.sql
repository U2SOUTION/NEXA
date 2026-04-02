-- =============================================================================
-- project_members — 오케스트레이션 SSOT 와 동일 정의
-- 근거: docs/__NEXA 오케스트레이션 스키마 DDL v5.md  §1-1, §3 (idx_project_members_project_id)
-- (Nexion 관점) 플랫폼 DB 테넌트·RLS용 — Nexion 제품 정의의 "프로젝트 개념"과 동일시하지 않음.
--   → [NXN] [CNCP] 지식 OS ... §1.1
-- 전제: public.projects 가 이미 존재하고 project_id, owner_id 가 있음
-- 실행: DBeaver에서 본 파일만 먼저 실행 → 이후 `[NXN] [DDL] NEXA Nexion 독립형 인덱스 및 자산 관리 DDL.sql` §5
-- =============================================================================

-- (선택) UUID v7 — DB에 맞게
-- CREATE EXTENSION IF NOT EXISTS pg_uuidv7;

-- ---------------------------------------------------------------------------
-- §1-1 (v5) — project_members
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_members (
    member_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT DEFAULT 'viewer',
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- §3 (v5) — 인덱스
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);

-- ---------------------------------------------------------------------------
-- 기존 projects.owner_id → 멤버 행 백필 (오너가 RLS·nxn_user_project_ids 에 잡히도록)
-- ---------------------------------------------------------------------------
INSERT INTO project_members (member_id, project_id, user_id, role, joined_at)
SELECT uuid_generate_v7(), p.project_id, p.owner_id, 'owner', NOW()
FROM projects p
WHERE NOT EXISTS (
    SELECT 1
    FROM project_members m
    WHERE m.project_id = p.project_id
      AND m.user_id = p.owner_id
);

-- ---------------------------------------------------------------------------
-- (선택) §4 (v5) — project_members 만 RLS 켜는 최소 패턴
-- 이미 다른 정책이 있으면 생략·조정. 개발 중에는 주석 처리해도 됨.
-- ---------------------------------------------------------------------------
/*
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS project_member_members ON project_members;
CREATE POLICY project_member_members ON project_members FOR ALL
    USING (user_id = (current_setting('app.current_user_id', true)::uuid));
*/

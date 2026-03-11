-- ============================================
-- NEXA 3단계: projects 테이블 (소유자 user_id)
-- @see [NEXA-AUTH-01] §4.3, §2.2 3단계
--
-- 선행: init_auth.sql (users 테이블) 적용 후 실행
-- 실행: DBeaver에서 nexa_db 연결 선택 후 스크립트 전체 실행
--   또는 psql -U postgres -d nexa_db -f init_projects.sql
--
-- 적용 후: 프로젝트 목록/상세 API에서 WHERE user_id = $1 등 소유자 필터 적용
-- ============================================

SET search_path TO public;

-- ----------------------------------------
-- projects (소유자 user_id, 추후 project_folders·files 연동)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- updated_at 자동 갱신 (함수는 init_auth.sql에서 이미 생성된 경우 있음)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
CREATE TRIGGER trigger_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE projects IS 'NEXA 프로젝트. 소유자 user_id 기준 조회·인가. (§4.3)';

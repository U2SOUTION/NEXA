-- ============================================
-- NEXA 인증 테이블 (users)
-- @see [NEXA-AUTH-01] §4.1, §4.5
--
-- 실행: init_postgres.sql 적용 후, DBeaver 또는 psql로 실행
--   psql -U postgres -d nexa_db -f init_auth.sql
--   또는 DBeaver에서 이 스크립트 전체 실행
--
-- 적용 후 서버 인증 API 사용 가능: POST /api/auth/register, login, refresh, GET /api/auth/me
-- ============================================

SET search_path TO public;

-- ----------------------------------------
-- users (플랫폼 전역)
-- email 유일: 부분 유니크 인덱스만 사용 (Soft Delete 시 동일 이메일 재가입 허용)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  display_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  allowed_domains JSONB,
  tier VARCHAR(20) NOT NULL DEFAULT 'BASIC',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  metadata JSONB
);

-- 활성 계정만 email 유일 (동일 이메일 재가입 가능)
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_email_active
  ON users (email) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'NEXA 플랫폼 사용자. Soft Delete 시 deleted_at 설정. tier: BASIC/STANDARD 등 (§4.1.0).';

-- ============================================
-- NEXA 4단계: device_registry, device_members
-- @see [NEXA-AUTH-01] §4.2, §4.2.0, §4.5
--
-- 선행: init_auth.sql (users 테이블) 적용 후 실행
-- 실행: DBeaver에서 nexa_db 연결 선택 후 스크립트 전체 실행
--   또는 psql -U postgres -d nexa_db -f init_device_registry.sql
--
-- 적용 후: Device Token 발급·검증 API, device_members 기반 접근 권한 적용
-- ============================================

SET search_path TO public;

-- ----------------------------------------
-- device_registry (엣지 디바이스)
-- token_hash: SHA256 해시만 저장, 평문 저장 금지
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS device_registry (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL,
  mac_address VARCHAR(17),
  name VARCHAR(100),
  device_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMPTZ,
  is_online BOOLEAN NOT NULL DEFAULT false,
  ip_address VARCHAR(45),
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB,
  CONSTRAINT uk_device_registry_token_hash UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS idx_device_registry_user_id ON device_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_device_registry_last_seen ON device_registry(last_seen);
CREATE INDEX IF NOT EXISTS idx_device_registry_is_active ON device_registry(is_active);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_device_registry_updated_at ON device_registry;
CREATE TRIGGER trigger_device_registry_updated_at
  BEFORE UPDATE ON device_registry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE device_registry IS '엣지 디바이스. token_hash=SHA256(device_token). 접근 권한은 device_members에서 관리.';

-- ----------------------------------------
-- device_members (사용자–디바이스 멤버십, 역할)
-- role: owner | editor | controller | viewer
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS device_members (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  device_id VARCHAR(36) NOT NULL REFERENCES public.device_registry(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'controller', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_device_members_user_device UNIQUE (user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_device_members_user_id ON device_members(user_id);
CREATE INDEX IF NOT EXISTS idx_device_members_device_id ON device_members(device_id);

COMMENT ON TABLE device_members IS '디바이스별 접근 권한. owner=소유자, editor/controller/viewer=공유 역할.';

-- ----------------------------------------
-- RLS (Row-Level Security) — 필수 적용
-- 요청 시 세션에 app.current_user_id 설정 후 정책 적용
-- ----------------------------------------
ALTER TABLE device_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_members ENABLE ROW LEVEL SECURITY;

-- device_registry: 소유자(user_id)만 자신의 행 조회·수정·삭제·추가
DROP POLICY IF EXISTS device_registry_select ON device_registry;
CREATE POLICY device_registry_select ON device_registry
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS device_registry_all ON device_registry;
CREATE POLICY device_registry_all ON device_registry
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true))
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- device_members: 본인(user_id) 행만 접근
DROP POLICY IF EXISTS device_members_access ON device_members;
CREATE POLICY device_members_access ON device_members
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true))
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- 참고: 애플리케이션에서 인증 직후 트랜잭션/쿼리 전에
--   SET LOCAL app.current_user_id = '사용자UUID';
-- 실행 필요. admin 등 예외는 BYPASSRLS 역할 또는 별도 정책으로 처리.

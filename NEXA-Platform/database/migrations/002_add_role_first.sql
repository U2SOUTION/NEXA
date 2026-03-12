-- [NEXA-ADMIN-01] role 'first' 추가 — 최초 가입자 전용 (비번 변경 후 admin 부여)
-- 실행: psql -U postgres -d nexa_db -f 002_add_role_first.sql

SET search_path TO public;

-- 기존 CHECK 제약 제거 후 'first' 추가
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user', 'viewer', 'first'));

COMMENT ON COLUMN users.role IS 'admin: 슈퍼관리자, first: 최초 가입자(비번 변경 후 admin), user: 일반, viewer: 조회전용';

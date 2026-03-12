-- [NEXA-ADMIN-01] 슈퍼관리자 강제 비밀번호 변경
-- 기존 DB에 password_must_change 컬럼 추가. init_auth.sql 신규 적용 시에는 불필요.
-- 실행: psql -U postgres -d nexa_db -f 001_add_password_must_change.sql

SET search_path TO public;

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_must_change BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN users.password_must_change IS 'true면 로그인 후 비밀번호 변경 필요(admin 최초 가입자 등).';

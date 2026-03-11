-- ============================================
-- Postgres 트리거: updated_at 자동 갱신
-- ============================================
-- MySQL의 ON UPDATE CURRENT_TIMESTAMP 대체.
-- 적용 순서: 1) 함수 생성 → 2) 각 테이블에 트리거 생성
-- 실행 시점: part_files, ai_user_memos, archives, archive_doc 등 updated_at 컬럼이 있는 테이블 생성 후 실행
--
-- @see [NEXA-MIGRATE-01] §4.3
-- ============================================

-- ----------------------------------------
-- 1. 공용 함수: 행 UPDATE 시 updated_at 자동 설정
-- ----------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------
-- 2. part_files 테이블 트리거
-- ----------------------------------------
DROP TRIGGER IF EXISTS trigger_part_files_updated_at ON part_files;
CREATE TRIGGER trigger_part_files_updated_at
  BEFORE UPDATE ON part_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------
-- 3. ai_user_memos 테이블 트리거
-- ----------------------------------------
DROP TRIGGER IF EXISTS trigger_ai_user_memos_updated_at ON ai_user_memos;
CREATE TRIGGER trigger_ai_user_memos_updated_at
  BEFORE UPDATE ON ai_user_memos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------
-- 4. archives 테이블 트리거
-- ----------------------------------------
DROP TRIGGER IF EXISTS trigger_archives_updated_at ON archives;
CREATE TRIGGER trigger_archives_updated_at
  BEFORE UPDATE ON archives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------
-- 5. archive_doc 테이블 트리거
-- ----------------------------------------
DROP TRIGGER IF EXISTS trigger_archive_doc_updated_at ON archive_doc;
CREATE TRIGGER trigger_archive_doc_updated_at
  BEFORE UPDATE ON archive_doc
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

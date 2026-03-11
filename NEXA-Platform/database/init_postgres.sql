-- ============================================
-- NEXA Postgres 초기 스키마 (마이그레이션)
-- @see [NEXA-MIGRATE-01], docs/nexa_db.graphml
-- 실행: DBeaver에서 Postgres nexa_db 연결 선택 후 스크립트 전체 실행
-- ============================================

-- 스키마 명시 (relation does not exist 방지)
SET search_path TO public;

-- 확장 (실패해도 아래 테이블 생성 계속 진행)
CREATE EXTENSION IF NOT EXISTS timescaledb;
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION WHEN OTHERS THEN
  NULL;  -- vector 미지원 이미지면 무시
END $$;

-- ----------------------------------------
-- 1. part_classes (FK 없음)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS part_classes (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  d_code VARCHAR(10),
  name VARCHAR(100) NOT NULL,
  c_code VARCHAR(10),
  code_name VARCHAR(100),
  example TEXT,
  description TEXT,
  detailed_description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  sub_sort_order INTEGER NOT NULL DEFAULT 0,
  file_upload_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_favorite BOOLEAN NOT NULL DEFAULT false
);

-- ----------------------------------------
-- 2. part_models (FK part_classes)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS part_models (
  id SERIAL PRIMARY KEY,
  part_class_id INTEGER NOT NULL REFERENCES public.part_classes(id) ON DELETE CASCADE,
  model_name VARCHAR(200) NOT NULL,
  tags VARCHAR(500),
  description TEXT,
  detailed_description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  model_range TEXT,
  bundle_management_criteria VARCHAR(200),
  storage_bin_list VARCHAR(500),
  notes TEXT,
  additional_info2 TEXT,
  additional_info3 TEXT,
  evaluation VARCHAR(100),
  quality_grade VARCHAR(50),
  sku VARCHAR(100),
  file_upload_count INTEGER
);

-- ----------------------------------------
-- 3. part_specs (FK part_models)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS part_specs (
  id SERIAL PRIMARY KEY,
  part_model_id INTEGER NOT NULL REFERENCES public.part_models(id) ON DELETE CASCADE,
  manufacturer_part_number VARCHAR(200) NOT NULL,
  value_str VARCHAR(100),
  tolerance VARCHAR(50),
  voltage_rating VARCHAR(50),
  package_type VARCHAR(100),
  manufacturer VARCHAR(100),
  detailed_description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  unit VARCHAR(20),
  purchase_vendor VARCHAR(100),
  purchase_status VARCHAR(50),
  main_specs TEXT,
  additional_info2 TEXT,
  additional_info3 TEXT,
  safety_stock INTEGER,
  stock_value DECIMAL(15,2),
  stock_quantity INTEGER,
  stock_alert BOOLEAN,
  sku VARCHAR(100),
  file_upload_count INTEGER
);

-- ----------------------------------------
-- 4. system_templates (archive layout 참조)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS system_templates (
  id SERIAL PRIMARY KEY,
  category VARCHAR(20) NOT NULL CHECK (category IN ('LAYOUT','BLOCK','LOGIC')),
  tpl_name VARCHAR(100) NOT NULL,
  data_json JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------
-- 5. archives (FK system_templates)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS archives (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  doc_type VARCHAR(20) CHECK (doc_type IN ('NOTE','TASK','HYBRID')),
  status VARCHAR(20) CHECK (status IN ('ACTIVE','DELETED','ARCHIVED')),
  layout_id INTEGER REFERENCES public.system_templates(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------
-- 6. archive_doc (FK archives)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS archive_doc (
  id SERIAL PRIMARY KEY,
  archive_id INTEGER NOT NULL REFERENCES public.archives(id) ON DELETE CASCADE,
  content_json JSONB NOT NULL,
  order_idx INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------
-- 7. files
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  file_path VARCHAR(500) NOT NULL UNIQUE,
  virtual_path VARCHAR(500),
  original_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  mime_type VARCHAR(100),
  file_size BIGINT,
  category VARCHAR(50),
  user_id VARCHAR(100) DEFAULT 'developer',
  content_hash VARCHAR(64) NOT NULL UNIQUE,
  project_id VARCHAR(100),
  source VARCHAR(50),
  edge_sid INTEGER,
  source_metadata JSONB,
  ai_workflow_status VARCHAR(20) DEFAULT 'pending',
  ai_workflow_step SMALLINT DEFAULT 0,
  ai_workflow_error TEXT,
  ai_workflow_updated_at TIMESTAMPTZ,
  ai_review_status VARCHAR(20),
  ai_reviewed_at TIMESTAMPTZ,
  ai_reviewed_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_source ON files(source);

-- ----------------------------------------
-- 8. file_references (FK files)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS file_references (
  id SERIAL PRIMARY KEY,
  file_id INTEGER NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  domain VARCHAR(50) NOT NULL,
  usage VARCHAR(50),
  project_id VARCHAR(100),
  virtual_path VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(file_id, domain)
);
CREATE INDEX IF NOT EXISTS idx_file_references_domain ON file_references(domain);

-- ----------------------------------------
-- 9. ai_user_memos
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS ai_user_memos (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  source VARCHAR(50) DEFAULT 'chat',
  channel_id VARCHAR(100),
  chat_id VARCHAR(100),
  user_id VARCHAR(100) DEFAULT 'developer',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  promoted_file_id INTEGER REFERENCES public.files(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_user_memos_channel_chat ON ai_user_memos(channel_id, chat_id);

-- ----------------------------------------
-- 10. part_files (FK part_classes, part_models, part_specs)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS part_files (
  id SERIAL PRIMARY KEY,
  part_class_id INTEGER REFERENCES public.part_classes(id) ON DELETE CASCADE,
  part_model_id INTEGER REFERENCES public.part_models(id) ON DELETE CASCADE,
  part_spec_id INTEGER REFERENCES public.part_specs(id) ON DELETE CASCADE,
  c_code VARCHAR(10) NOT NULL,
  d_code VARCHAR(10) NOT NULL,
  file_extension VARCHAR(10) NOT NULL,
  file_sequence INTEGER NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_mime_type VARCHAR(100),
  is_editor_image BOOLEAN,
  file_size INTEGER,
  upload_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_one_reference CHECK (
    (part_class_id IS NOT NULL AND part_model_id IS NULL AND part_spec_id IS NULL) OR
    (part_class_id IS NULL AND part_model_id IS NOT NULL AND part_spec_id IS NULL) OR
    (part_class_id IS NULL AND part_model_id IS NULL AND part_spec_id IS NOT NULL)
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_part_files_class ON part_files(part_class_id, d_code, c_code, file_extension, file_sequence) WHERE part_class_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_part_files_model ON part_files(part_model_id, d_code, c_code, file_extension, file_sequence) WHERE part_model_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_part_files_spec ON part_files(part_spec_id, d_code, c_code, file_extension, file_sequence) WHERE part_spec_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_part_files_part_class_id ON part_files(part_class_id);
CREATE INDEX IF NOT EXISTS idx_part_files_part_model_id ON part_files(part_model_id);
CREATE INDEX IF NOT EXISTS idx_part_files_part_spec_id ON part_files(part_spec_id);

-- ----------------------------------------
-- 트리거 (updated_at 자동 갱신)
-- ----------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_part_files_updated_at ON part_files;
CREATE TRIGGER trigger_part_files_updated_at BEFORE UPDATE ON part_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_ai_user_memos_updated_at ON ai_user_memos;
CREATE TRIGGER trigger_ai_user_memos_updated_at BEFORE UPDATE ON ai_user_memos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_archives_updated_at ON archives;
CREATE TRIGGER trigger_archives_updated_at BEFORE UPDATE ON archives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_archive_doc_updated_at ON archive_doc;
CREATE TRIGGER trigger_archive_doc_updated_at BEFORE UPDATE ON archive_doc FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

# _ 용어 및 시스템 설계 파일 관리 통합 스키마 DDL

이 문서는 NEXA Knowledge OS + 설계 파일 관리 자산의 실행 가능한 DDL 기준(SSOT)이다.  
기준 문서: `_ 용어 및 시스템 설계 파일 관리 CRUD 테이블 명세서.md`

> 네임스페이스 원칙: 공통 지식 계층은 `nexa_knowledge_*`, 프로젝트 생성 지식은 `project_knowledge`로 분리한다.

---

## [NEXA-DDL-KNOWLEDGE-CORE] 통합 DDL

```sql
SET search_path TO public;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "timescaledb";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_uuidv7";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'uuid_generate_v7'
  ) THEN
    CREATE OR REPLACE FUNCTION public.uuid_generate_v7()
    RETURNS uuid
    AS $$ SELECT gen_random_uuid(); $$
    LANGUAGE sql;
  END IF;
END $$;

-- 1) 공용 참조 테이블
CREATE TABLE IF NOT EXISTS tiers (
  tier_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS capabilities (
  capability_id VARCHAR(200) PRIMARY KEY,
  label VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  source VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_capability_status CHECK (status IN ('active', 'inactive')),
  CONSTRAINT chk_user_capability_prefix
    CHECK (type <> 'user' OR capability_id LIKE 'usr.%')
);

-- 2) Knowledge Core
CREATE TABLE IF NOT EXISTS nexa_knowledge_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  term_key VARCHAR(100) UNIQUE NOT NULL,
  ko_label VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  definitions JSONB NOT NULL,
  nature_tag VARCHAR(20) NOT NULL DEFAULT 'RULE',
  status SMALLINT NOT NULL DEFAULT 1,
  version_no INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_knowledge_definition_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nexa_term_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  term_id UUID NOT NULL REFERENCES nexa_knowledge_definitions(id) ON DELETE CASCADE,
  layer_type SMALLINT NOT NULL,
  token_value SMALLINT NOT NULL,
  is_immutable BOOLEAN NOT NULL DEFAULT FALSE,
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (term_id, layer_type),
  UNIQUE (layer_type, token_value),
  CONSTRAINT chk_layer_type CHECK (layer_type BETWEEN 1 AND 6),
  CONSTRAINT chk_term_token_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_ref_rules (
  rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  rule_version VARCHAR(40) UNIQUE NOT NULL,
  filename_pattern TEXT NOT NULL,
  context_whitelist JSONB NOT NULL,
  doctype_whitelist JSONB NOT NULL,
  prefix_policy JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  created_by VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  term_id UUID NOT NULL REFERENCES nexa_knowledge_definitions(id) ON DELETE CASCADE,
  capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id) ON DELETE RESTRICT,
  source_filename VARCHAR(255),
  doc_ref_path VARCHAR(255),
  doc_anchor VARCHAR(100),
  source_hash VARCHAR(64),
  context_code VARCHAR(20),
  doctype_code VARCHAR(20),
  version_label VARCHAR(30),
  prefix_flag VARCHAR(10) NOT NULL DEFAULT 'NONE',
  parser_version VARCHAR(40),
  parse_confidence NUMERIC(5,4),
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_knowledge_reference_status CHECK (status IN (0, 1)),
  CONSTRAINT chk_knowledge_reference_parse_confidence
    CHECK (parse_confidence IS NULL OR (parse_confidence >= 0 AND parse_confidence <= 1)),
  CONSTRAINT chk_knowledge_reference_prefix_flag
    CHECK (prefix_flag IN ('NONE', '_', '@')),
  CONSTRAINT fk_knowledge_reference_rule
    FOREIGN KEY (parser_version) REFERENCES nexa_knowledge_ref_rules(rule_version) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_vectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  term_id UUID UNIQUE NOT NULL REFERENCES nexa_knowledge_definitions(id) ON DELETE CASCADE,
  embedding_model VARCHAR(80) NOT NULL DEFAULT 'nomic-embed-text',
  embedding_dim SMALLINT NOT NULL DEFAULT 768,
  description_vector VECTOR(768) NOT NULL,
  vector_search_status SMALLINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_knowledge_vector_status CHECK (vector_search_status IN (0, 1))
);

-- 3) 자산 연결
ALTER TABLE IF EXISTS project_assets
  ADD COLUMN IF NOT EXISTS sha256 VARCHAR(64),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS quota_counted BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS nexa_knowledge_reference_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  reference_id UUID NOT NULL REFERENCES nexa_knowledge_references(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES project_assets(asset_id) ON DELETE RESTRICT,
  usage_type VARCHAR(20) NOT NULL,
  doc_anchor VARCHAR(100),
  caption VARCHAR(255),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_knowledge_reference_asset_usage_type
    CHECK (usage_type IN ('embedded', 'attachment', 'citation', 'thumbnail')),
  CONSTRAINT chk_knowledge_reference_asset_status CHECK (status IN (0, 1))
);

-- 4) 운영 보강
CREATE TABLE IF NOT EXISTS nexa_knowledge_distribution_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  profile_name VARCHAR(20) UNIQUE NOT NULL,
  include_levels JSONB NOT NULL,
  include_categories JSONB NOT NULL,
  max_payload_kb INTEGER NOT NULL,
  package_format VARCHAR(20) NOT NULL DEFAULT 'json',
  ota_channel VARCHAR(40) NOT NULL,
  version_tag VARCHAR(40) NOT NULL,
  status SMALLINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_knowledge_distribution_profile_name CHECK (profile_name IN ('nano', 'micro', 'vista')),
  CONSTRAINT chk_knowledge_distribution_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_doc_sync_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  doc_ref_path VARCHAR(255) UNIQUE NOT NULL,
  last_hash VARCHAR(64) NOT NULL,
  last_scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_status VARCHAR(20) NOT NULL DEFAULT 'success',
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  entity_type VARCHAR(30) NOT NULL,
  entity_id UUID NOT NULL,
  is_pending BOOLEAN NOT NULL DEFAULT TRUE,
  request_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  requested_change_data JSONB NOT NULL,
  requested_by VARCHAR(120) NOT NULL,
  requested_reason VARCHAR(255),
  reviewed_by VARCHAR(120),
  review_note VARCHAR(255),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_knowledge_change_request_status CHECK (request_status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_audit_logs (
  id UUID DEFAULT uuid_generate_v7(),
  entity_type VARCHAR(40) NOT NULL,
  entity_id UUID NOT NULL,
  action_type VARCHAR(20) NOT NULL,
  before_data JSONB,
  after_data JSONB,
  changed_by VARCHAR(120) NOT NULL,
  change_reason VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);

SELECT create_hypertable('nexa_knowledge_audit_logs', 'created_at', if_not_exists => TRUE);

-- 5) 인덱스
CREATE INDEX IF NOT EXISTS idx_knowledge_definitions_category_status
  ON nexa_knowledge_definitions(category, status);

CREATE INDEX IF NOT EXISTS idx_term_tokens_lookup
  ON nexa_term_tokens(layer_type, token_value);

CREATE INDEX IF NOT EXISTS idx_knowledge_ref_rules_active
  ON nexa_knowledge_ref_rules(is_active)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_knowledge_references_term_id
  ON nexa_knowledge_references(term_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_references_capability_id
  ON nexa_knowledge_references(capability_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_references_context_doctype_updated
  ON nexa_knowledge_references(context_code, doctype_code, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_references_doctype_version
  ON nexa_knowledge_references(doctype_code, version_label);

CREATE UNIQUE INDEX IF NOT EXISTS uq_knowledge_references_source_hash
  ON nexa_knowledge_references(source_hash)
  WHERE source_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_reference_assets_ref_sort
  ON nexa_knowledge_reference_assets(reference_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_knowledge_reference_assets_asset
  ON nexa_knowledge_reference_assets(asset_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_doc_sync_status
  ON nexa_knowledge_doc_sync_state(last_sync_status, last_scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_change_requests_status_created
  ON nexa_knowledge_change_requests(request_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_audit_entity_created
  ON nexa_knowledge_audit_logs(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_vector_hnsw
  ON nexa_knowledge_vectors
  USING hnsw (description_vector vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

---

## 반영 요약

- `nexa_knowledge_*` 네이밍으로 테이블명 통일
- `nexa_knowledge_reference_assets`로 참조 자산 링크 테이블 통일
- `project_assets`는 스토리지/쿼터 원장 역할 유지

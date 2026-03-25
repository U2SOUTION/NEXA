# KNOWLEDGE DDL 통합 스키마 및 물리 설계(SSOT)

이 문서는 NEXA Knowledge OS + 설계 파일 관리 자산의 실행 가능한 DDL 기준(SSOT)이다.  
기준 문서: `_KNOWLEDGE SPEC CRUD 테이블 및 필드 명세서.md`

> 네임스페이스 원칙: 공통 지식 계층은 `nexa_knowledge_*`, 프로젝트 생성 지식은 `project_knowledge`로 분리한다.

**범위:** 본 DDL은 위 네임스페이스 중심이다. 엣지·실행·대화 등 **다른 지식 축**은 오케스트레이션 등 별도 SSOT를 보며, 개괄은 `_KNOWLEDGE ARCH 지식 운영체제(K-OS) 운영 아키텍처.md` **§0** 참고.

---

## NEXA-KNOWLEDGE-CORE 통합 DDL

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
  -- UI/NEXU Canvas 렌더링 연동 점수(0~100): parse_confidence 기반 자동 산출
  confidence_score SMALLINT GENERATED ALWAYS AS (
    CASE
      WHEN parse_confidence IS NULL THEN NULL
      ELSE ROUND(parse_confidence * 100)::SMALLINT
    END
  ) STORED,
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

-- parse_confidence: 파일명 파서가 추정한 신뢰도(0~1)
COMMENT ON COLUMN nexa_knowledge_references.parse_confidence
  IS 'Filename parser confidence (0~1).';

-- confidence_score: NEXU 캔버스 시각 피드백 연동 점수(0~100)
-- rule: confidence_score < project_settings.user_defined_threshold(기본 95) => UI Jitter 경고
COMMENT ON COLUMN nexa_knowledge_references.confidence_score
  IS 'UI confidence score (0~100) for Lumina/Jitter rendering.';

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
  intelligence_tier VARCHAR(20) NOT NULL,
  include_vectors BOOLEAN NOT NULL DEFAULT FALSE,
  required_tokens_only BOOLEAN NOT NULL DEFAULT TRUE,
  status SMALLINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_knowledge_distribution_profile_name CHECK (profile_name IN ('nano', 'micro', 'vista')),
  CONSTRAINT chk_knowledge_distribution_tier CHECK (intelligence_tier IN ('nano', 'micro', 'vista')),
  CONSTRAINT chk_knowledge_distribution_nano_policy
    CHECK (
      intelligence_tier <> 'nano'
      OR (include_vectors = FALSE AND required_tokens_only = TRUE AND max_payload_kb < 10)
    ),
  CONSTRAINT chk_knowledge_distribution_micro_policy
    CHECK (intelligence_tier <> 'micro' OR max_payload_kb <= 256),
  CONSTRAINT chk_knowledge_distribution_vista_policy
    CHECK (intelligence_tier <> 'vista' OR max_payload_kb <= 4096),
  CONSTRAINT chk_knowledge_distribution_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nexa_hardware_profiles (
  hardware_profile VARCHAR(20) PRIMARY KEY,
  cpu_class VARCHAR(40) NOT NULL,
  memory_mb INTEGER NOT NULL,
  storage_mb INTEGER NOT NULL,
  allow_vectors BOOLEAN NOT NULL,
  max_payload_kb INTEGER NOT NULL,
  status SMALLINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_knowledge_hardware_profile CHECK (hardware_profile IN ('COLD', 'WARM', 'HOT')),
  CONSTRAINT chk_knowledge_hardware_cold_policy
    CHECK (
      hardware_profile <> 'COLD'
      OR (allow_vectors = FALSE AND max_payload_kb < 10)
    ),
  CONSTRAINT chk_knowledge_hardware_warm_policy
    CHECK (hardware_profile <> 'WARM' OR max_payload_kb <= 256),
  CONSTRAINT chk_knowledge_hardware_hot_policy
    CHECK (hardware_profile <> 'HOT' OR max_payload_kb <= 4096)
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_distribution_bindings (
  binding_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  profile_id UUID NOT NULL REFERENCES nexa_knowledge_distribution_profiles(id) ON DELETE CASCADE,
  hardware_profile VARCHAR(20) NOT NULL REFERENCES nexa_hardware_profiles(hardware_profile) ON DELETE RESTRICT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_knowledge_distribution_binding UNIQUE (profile_id, hardware_profile),
  CONSTRAINT chk_knowledge_distribution_binding_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_doc_sync_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  doc_ref_path VARCHAR(255) UNIQUE NOT NULL,
  last_hash VARCHAR(64) NOT NULL,
  last_scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_status VARCHAR(20) NOT NULL DEFAULT 'success',
  last_error TEXT,
  missing_since TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT chk_knowledge_doc_sync_status
    CHECK (last_sync_status IN ('success', 'fail', 'skipped', 'deleted'))
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
  error_token VARCHAR(80),
  error_context JSONB,
  error_signature VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);

SELECT create_hypertable('nexa_knowledge_audit_logs', 'created_at', if_not_exists => TRUE);

CREATE TABLE IF NOT EXISTS nexa_knowledge_error_patterns (
  pattern_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  error_token VARCHAR(80) NOT NULL,
  error_signature VARCHAR(120) NOT NULL,
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  impact_score NUMERIC(6,2) NOT NULL DEFAULT 0,
  sample_context JSONB,
  suggested_rule_patch JSONB,
  review_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reviewed_by VARCHAR(120),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_knowledge_error_pattern_review_status
    CHECK (review_status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_response_policies (
  policy_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  policy_name VARCHAR(80) UNIQUE NOT NULL,
  scope_type VARCHAR(20) NOT NULL,
  scope_id UUID,
  es_threshold NUMERIC(4,3) NOT NULL,
  vi_threshold NUMERIC(4,3) NOT NULL,
  output_mode VARCHAR(20) NOT NULL,
  summary_priority SMALLINT NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  coil_weight_override JSONB,
  ui_entropy_mode VARCHAR(20),
  throttle_rationale_code VARCHAR(40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_knowledge_response_policy_scope
    CHECK (scope_type IN ('global', 'project', 'user')),
  CONSTRAINT chk_knowledge_response_policy_mode
    CHECK (output_mode IN ('easy', 'normal', 'expert')),
  CONSTRAINT chk_knowledge_response_policy_es
    CHECK (es_threshold >= 0 AND es_threshold <= 1),
  CONSTRAINT chk_knowledge_response_policy_vi
    CHECK (vi_threshold >= 0 AND vi_threshold <= 1),
  CONSTRAINT chk_knowledge_response_policy_ui_entropy
    CHECK (ui_entropy_mode IS NULL OR ui_entropy_mode IN ('minimal', 'static', 'normal'))
);

-- 기존 배포(보강 컬럼 없음) 마이그레이션용 — greenfield 에서는 위 CREATE 가 이미 포함
ALTER TABLE nexa_knowledge_response_policies
  ADD COLUMN IF NOT EXISTS coil_weight_override JSONB,
  ADD COLUMN IF NOT EXISTS ui_entropy_mode VARCHAR(20),
  ADD COLUMN IF NOT EXISTS throttle_rationale_code VARCHAR(40);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_knowledge_response_policy_ui_entropy'
  ) THEN
    ALTER TABLE nexa_knowledge_response_policies
      ADD CONSTRAINT chk_knowledge_response_policy_ui_entropy
      CHECK (ui_entropy_mode IS NULL OR ui_entropy_mode IN ('minimal', 'static', 'normal'));
  END IF;
END $$;

-- 4-A) Self 공통 자산 계층 (NEXU 채널 + 오케스트레이션 공용)
CREATE TABLE IF NOT EXISTS nexa_self_profiles (
  self_profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id UUID NOT NULL,
  profile_name VARCHAR(80) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_self_profile_user_name UNIQUE (user_id, profile_name)
);

CREATE TABLE IF NOT EXISTS nexa_self_facets (
  facet_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  facet_key VARCHAR(30) UNIQUE NOT NULL,
  facet_label VARCHAR(80) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_self_facet_key
    CHECK (facet_key IN ('Now', 'Energy', 'Direction', 'Discovery'))
);

CREATE TABLE IF NOT EXISTS nexa_self_states (
  state_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  self_profile_id UUID NOT NULL REFERENCES nexa_self_profiles(self_profile_id) ON DELETE CASCADE,
  state_key VARCHAR(40) NOT NULL,
  state_label VARCHAR(80) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_self_state_status CHECK (status IN (0, 1)),
  CONSTRAINT uq_self_state_profile_key UNIQUE (self_profile_id, state_key)
);

CREATE TABLE IF NOT EXISTS nexa_self_explosions (
  explosion_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  self_profile_id UUID NOT NULL REFERENCES nexa_self_profiles(self_profile_id) ON DELETE CASCADE,
  state_id UUID REFERENCES nexa_self_states(state_id) ON DELETE SET NULL,
  facet_id UUID REFERENCES nexa_self_facets(facet_id) ON DELETE SET NULL,
  coil_weights JSONB NOT NULL,
  capability_candidates JSONB NOT NULL,
  reverse_trace_template JSONB,
  priority SMALLINT NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nexa_self_knowledge_map (
  map_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  self_profile_id UUID NOT NULL REFERENCES nexa_self_profiles(self_profile_id) ON DELETE CASCADE,
  state_id UUID REFERENCES nexa_self_states(state_id) ON DELETE SET NULL,
  facet_id UUID REFERENCES nexa_self_facets(facet_id) ON DELETE SET NULL,
  knowledge_definition_id UUID NOT NULL REFERENCES nexa_knowledge_definitions(id) ON DELETE CASCADE,
  link_weight NUMERIC(6,3) NOT NULL DEFAULT 1.0,
  priority SMALLINT NOT NULL DEFAULT 100,
  reason_note VARCHAR(255),
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_self_knowledge_map_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nexa_self_capability_links (
  link_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  self_profile_id UUID NOT NULL REFERENCES nexa_self_profiles(self_profile_id) ON DELETE CASCADE,
  state_id UUID REFERENCES nexa_self_states(state_id) ON DELETE SET NULL,
  facet_id UUID REFERENCES nexa_self_facets(facet_id) ON DELETE SET NULL,
  capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id) ON DELETE RESTRICT,
  priority SMALLINT NOT NULL DEFAULT 100,
  allow_execute BOOLEAN NOT NULL DEFAULT TRUE,
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_self_capability_link_status CHECK (status IN (0, 1))
);

-- 4-B) OS 보강 (SPEC §2.9~§2.14) — 페이징·드라이버·추적·커널 감사·헬스
CREATE TABLE IF NOT EXISTS nexa_knowledge_residency (
  residency_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  entity_type VARCHAR(30) NOT NULL,
  entity_id UUID NOT NULL,
  storage_tier VARCHAR(10) NOT NULL,
  void_hint VARCHAR(20),
  access_count_rolling INTEGER NOT NULL DEFAULT 0,
  last_access_at TIMESTAMPTZ,
  tier_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tier_metadata JSONB NOT NULL DEFAULT '{}',
  status SMALLINT NOT NULL DEFAULT 1,
  CONSTRAINT chk_knowledge_residency_tier CHECK (storage_tier IN ('L1', 'L2', 'L3')),
  CONSTRAINT chk_knowledge_residency_status CHECK (status IN (0, 1)),
  CONSTRAINT uq_knowledge_residency_entity UNIQUE (entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_context_paging_sets (
  set_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  scope_type VARCHAR(20) NOT NULL,
  scope_id UUID,
  pinned_definition_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  pinned_reference_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  intent_hexagon_snapshot JSONB NOT NULL DEFAULT '{}',
  max_window_tokens INTEGER,
  label VARCHAR(120),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_knowledge_context_paging_scope
    CHECK (scope_type IN ('global', 'project', 'user'))
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_capability_drivers (
  driver_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id) ON DELETE RESTRICT,
  external_provider VARCHAR(80) NOT NULL,
  manifest JSONB NOT NULL,
  project_extension_id UUID,
  sandbox_profile_id UUID,
  registration_status VARCHAR(20) NOT NULL DEFAULT 'draft',
  registered_by VARCHAR(120) NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_health_at TIMESTAMPTZ,
  CONSTRAINT chk_knowledge_capability_driver_status
    CHECK (registration_status IN ('draft', 'active', 'suspended'))
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_traceability_paths (
  path_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  logical_path TEXT NOT NULL,
  anchor_domain VARCHAR(30) NOT NULL,
  anchor_type VARCHAR(40) NOT NULL,
  anchor_id UUID NOT NULL,
  parent_path_id UUID REFERENCES nexa_knowledge_traceability_paths(path_id) ON DELETE SET NULL,
  depth SMALLINT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_knowledge_traceability_logical_path UNIQUE (logical_path)
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_kernel_events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_kind VARCHAR(40) NOT NULL,
  urgency_level SMALLINT NOT NULL DEFAULT 1,
  user_id UUID,
  project_id UUID,
  bypass_indicator BOOLEAN NOT NULL DEFAULT FALSE,
  target_tier VARCHAR(20),
  superseded_handles JSONB,
  policy_snapshot JSONB NOT NULL DEFAULT '{}',
  related_audit_id UUID,
  followup_change_request_id UUID REFERENCES nexa_knowledge_change_requests(id) ON DELETE SET NULL,
  CONSTRAINT chk_knowledge_kernel_urgency CHECK (urgency_level BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS nexa_knowledge_health_signals (
  signal_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scope_type VARCHAR(20) NOT NULL,
  scope_id UUID,
  signal_kind VARCHAR(40) NOT NULL,
  value_numeric NUMERIC(8,4),
  value_smallint SMALLINT,
  payload JSONB NOT NULL DEFAULT '{}'
);

COMMENT ON TABLE nexa_knowledge_residency IS 'VOID 티어·스왑 힌트(SPEC §2.9).';
COMMENT ON TABLE nexa_knowledge_context_paging_sets IS 'Context Paging — 상주 지식 세트(SPEC §2.10).';
COMMENT ON TABLE nexa_knowledge_capability_drivers IS 'Capability-as-Driver 매니페스트(SPEC §2.11).';
COMMENT ON TABLE nexa_knowledge_traceability_paths IS 'NFS식 논리 경로 ↔ 앵커(SPEC §2.12).';
COMMENT ON TABLE nexa_knowledge_kernel_events IS '인터럽트·공감 선점 감사(SPEC §2.13).';
COMMENT ON TABLE nexa_knowledge_health_signals IS '헬스·Jitter 집계(SPEC §2.14). 고빈도 시 Timescale hypertable 검토.';

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

CREATE INDEX IF NOT EXISTS idx_knowledge_references_confidence_score
  ON nexa_knowledge_references(confidence_score);

CREATE UNIQUE INDEX IF NOT EXISTS uq_knowledge_references_source_hash
  ON nexa_knowledge_references(source_hash)
  WHERE source_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_reference_assets_ref_sort
  ON nexa_knowledge_reference_assets(reference_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_knowledge_reference_assets_asset
  ON nexa_knowledge_reference_assets(asset_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_doc_sync_status
  ON nexa_knowledge_doc_sync_state(last_sync_status, last_scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_distribution_profiles_tier_status
  ON nexa_knowledge_distribution_profiles(intelligence_tier, status);

CREATE INDEX IF NOT EXISTS idx_knowledge_distribution_bindings_hw_status
  ON nexa_knowledge_distribution_bindings(hardware_profile, status);

CREATE INDEX IF NOT EXISTS idx_knowledge_change_requests_status_created
  ON nexa_knowledge_change_requests(request_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_audit_entity_created
  ON nexa_knowledge_audit_logs(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_audit_error_token_created
  ON nexa_knowledge_audit_logs(error_token, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_error_patterns_token_last_seen
  ON nexa_knowledge_error_patterns(error_token, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_error_patterns_review_status
  ON nexa_knowledge_error_patterns(review_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_response_policies_scope_active
  ON nexa_knowledge_response_policies(scope_type, is_active, summary_priority);

CREATE INDEX IF NOT EXISTS idx_self_profiles_user_active
  ON nexa_self_profiles(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_self_states_profile_status
  ON nexa_self_states(self_profile_id, status, sort_order);

CREATE INDEX IF NOT EXISTS idx_self_explosions_profile_active_priority
  ON nexa_self_explosions(self_profile_id, is_active, priority);

CREATE INDEX IF NOT EXISTS idx_self_knowledge_map_profile_priority
  ON nexa_self_knowledge_map(self_profile_id, status, priority);

CREATE INDEX IF NOT EXISTS idx_self_knowledge_map_definition
  ON nexa_self_knowledge_map(knowledge_definition_id);

CREATE INDEX IF NOT EXISTS idx_self_capability_links_profile_priority
  ON nexa_self_capability_links(self_profile_id, status, priority);

CREATE INDEX IF NOT EXISTS idx_knowledge_residency_tier_access
  ON nexa_knowledge_residency(storage_tier, last_access_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_knowledge_context_paging_scope_active
  ON nexa_knowledge_context_paging_sets(scope_type, scope_id, is_active);

CREATE INDEX IF NOT EXISTS idx_knowledge_capability_drivers_cap_status
  ON nexa_knowledge_capability_drivers(capability_id, registration_status);

CREATE INDEX IF NOT EXISTS idx_knowledge_traceability_anchor
  ON nexa_knowledge_traceability_paths(anchor_domain, anchor_type, anchor_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_traceability_parent
  ON nexa_knowledge_traceability_paths(parent_path_id)
  WHERE parent_path_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_kernel_events_kind_created
  ON nexa_knowledge_kernel_events(event_kind, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_kernel_events_user_created
  ON nexa_knowledge_kernel_events(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_kernel_events_urgency_created
  ON nexa_knowledge_kernel_events(urgency_level, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_health_signals_kind_recorded
  ON nexa_knowledge_health_signals(signal_kind, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_health_signals_scope_recorded
  ON nexa_knowledge_health_signals(scope_type, scope_id, recorded_at DESC);

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
- **OS 보강(SPEC §2.9~§2.14):** `nexa_knowledge_residency`, `nexa_knowledge_context_paging_sets`, `nexa_knowledge_capability_drivers`, `nexa_knowledge_traceability_paths`, `nexa_knowledge_kernel_events`, `nexa_knowledge_health_signals` 및 `nexa_knowledge_response_policies` 보강 컬럼·`ui_entropy_mode` CHECK (§2.15)
- 기존 DB만 갱신 시: `CREATE TABLE IF NOT EXISTS`는 기존 테이블을 **변경하지 않으므로**, `nexa_knowledge_response_policies`는 본문의 `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` 및 `DO $$ ... chk_knowledge_response_policy_ui_entropy` 블록을 반드시 실행한다.

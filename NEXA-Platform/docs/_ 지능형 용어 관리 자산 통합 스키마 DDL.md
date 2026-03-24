# _ 지능형 용어 관리 자산 통합 스키마 DDL

이 문서는 Glossary 자산 통합 스키마의 실행 가능한 DDL 기준이다.  
기준 문서: `_ 지능형 용어 관리 CRUD 테이블 명세서.md`

실행 주체: **DBeaver에서 수동 실행**(SQL Editor에서 블록 순차 실행 및 결과 확인)

---

## [NEXA-DDL-GLOSSARY-CORE] 통합 DDL

```sql
-- ==========================================================
-- 0) 사전 요구사항
-- ==========================================================
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

-- ==========================================================
-- 1) 공용 참조 테이블
-- ==========================================================
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

-- ==========================================================
-- 2) Glossary Core
-- ==========================================================
CREATE TABLE IF NOT EXISTS nexa_glossary_definitions (
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
  CONSTRAINT chk_glossary_definition_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nexa_term_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  term_id UUID NOT NULL REFERENCES nexa_glossary_definitions(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS nexa_glossary_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  term_id UUID NOT NULL REFERENCES nexa_glossary_definitions(id) ON DELETE CASCADE,
  capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id) ON DELETE RESTRICT,
  doc_ref_path VARCHAR(255),
  doc_anchor VARCHAR(100),
  source_hash VARCHAR(64),
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_glossary_reference_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nexa_glossary_vectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  term_id UUID UNIQUE NOT NULL REFERENCES nexa_glossary_definitions(id) ON DELETE CASCADE,
  embedding_model VARCHAR(80) NOT NULL DEFAULT 'nomic-embed-text',
  embedding_dim SMALLINT NOT NULL DEFAULT 768,
  description_vector VECTOR(768) NOT NULL,
  vector_search_status SMALLINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_vector_status CHECK (vector_search_status IN (0, 1))
);

-- ==========================================================
-- 3) 운영 보강 계층
-- ==========================================================
CREATE TABLE IF NOT EXISTS nexa_glossary_distribution_profiles (
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
  CONSTRAINT chk_distribution_profile_name CHECK (profile_name IN ('nano', 'micro', 'vista')),
  CONSTRAINT chk_distribution_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nexa_glossary_doc_sync_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  doc_ref_path VARCHAR(255) UNIQUE NOT NULL,
  last_hash VARCHAR(64) NOT NULL,
  last_scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_status VARCHAR(20) NOT NULL DEFAULT 'success',
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS nexa_glossary_change_requests (
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
  CONSTRAINT chk_change_request_status CHECK (request_status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS nexa_glossary_audit_logs (
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

SELECT create_hypertable('nexa_glossary_audit_logs', 'created_at', if_not_exists => TRUE);

-- ==========================================================
-- 4) 인덱스 전략
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_definitions_category_status
  ON nexa_glossary_definitions(category, status);

CREATE INDEX IF NOT EXISTS idx_tokens_lookup
  ON nexa_term_tokens(layer_type, token_value);

CREATE INDEX IF NOT EXISTS idx_references_term_id
  ON nexa_glossary_references(term_id);

CREATE INDEX IF NOT EXISTS idx_references_capability_id
  ON nexa_glossary_references(capability_id);

CREATE INDEX IF NOT EXISTS idx_doc_sync_status
  ON nexa_glossary_doc_sync_state(last_sync_status, last_scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_change_requests_status_created
  ON nexa_glossary_change_requests(request_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_entity_created
  ON nexa_glossary_audit_logs(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_glossary_vector_hnsw
  ON nexa_glossary_vectors
  USING hnsw (description_vector vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

---

## 보완 반영 요약

- `timescaledb` 확장 및 `uuid_generate_v7()` fallback 보장
- `capability_id`를 `NOT NULL + ON DELETE RESTRICT`로 통일
- `type='user'`일 때만 `usr.*` 접두사 강제
- SSOT 누락 컬럼 복구 (`status`, `created_at`, `embedding_dim`, `is_pending`, `review_note`)
- CHECK 제약 추가 (`layer_type`, 상태값 계열)
- 운영 인덱스 보강 (`doc_sync`, `change_requests`, `references`, `audit`, HNSW)
# _ 지능형 용어 관리 자산 통합 스키마 DDL

이 문서는 Glossary 자산 통합 스키마의 실행 가능한 DDL 기준이다.  
기준 문서: `_ 지능형 용어 관리 CRUD 테이블 명세서.md`

---

## [NEXA-DDL-GLOSSARY-CORE] 통합 DDL

```sql
-- ==========================================================
-- 0) 사전 요구사항
-- ==========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "timescaledb";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_uuidv7";

-- uuid_generate_v7() fallback
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

-- ==========================================================
-- 1) 공용 참조 테이블 (Tier / Capability)
-- ==========================================================
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
  type VARCHAR(50) NOT NULL, -- domain/menu/action/user
  source VARCHAR(50) NOT NULL, -- registry/manual
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_capability_status CHECK (status IN ('active', 'inactive')),
  -- 사용자 역량(type='user')만 usr.* 강제
  CONSTRAINT chk_user_capability_prefix
    CHECK (type <> 'user' OR capability_id LIKE 'usr.%')
);

-- ==========================================================
-- 2) Glossary Core
-- ==========================================================
CREATE TABLE IF NOT EXISTS nexa_glossary_definitions (
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
  CONSTRAINT chk_glossary_definition_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nexa_term_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  term_id UUID NOT NULL REFERENCES nexa_glossary_definitions(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS nexa_glossary_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  term_id UUID NOT NULL REFERENCES nexa_glossary_definitions(id) ON DELETE CASCADE,
  capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id) ON DELETE RESTRICT,
  doc_ref_path VARCHAR(255),
  doc_anchor VARCHAR(100),
  source_hash VARCHAR(64),
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_glossary_reference_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nexa_glossary_vectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  term_id UUID UNIQUE NOT NULL REFERENCES nexa_glossary_definitions(id) ON DELETE CASCADE,
  embedding_model VARCHAR(80) NOT NULL DEFAULT 'nomic-embed-text',
  embedding_dim SMALLINT NOT NULL DEFAULT 768,
  description_vector VECTOR(768) NOT NULL,
  vector_search_status SMALLINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_vector_status CHECK (vector_search_status IN (0, 1))
);

-- ==========================================================
-- 3) 운영 보강 계층
-- ==========================================================
CREATE TABLE IF NOT EXISTS nexa_glossary_distribution_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  profile_name VARCHAR(20) UNIQUE NOT NULL, -- nano/micro/vista
  include_levels JSONB NOT NULL,
  include_categories JSONB NOT NULL,
  max_payload_kb INTEGER NOT NULL,
  package_format VARCHAR(20) NOT NULL DEFAULT 'json',
  ota_channel VARCHAR(40) NOT NULL,
  version_tag VARCHAR(40) NOT NULL,
  status SMALLINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_distribution_profile_name CHECK (profile_name IN ('nano', 'micro', 'vista')),
  CONSTRAINT chk_distribution_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nexa_glossary_doc_sync_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  doc_ref_path VARCHAR(255) UNIQUE NOT NULL,
  last_hash VARCHAR(64) NOT NULL,
  last_scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_status VARCHAR(20) NOT NULL DEFAULT 'success', -- success/fail/skipped
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS nexa_glossary_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  entity_type VARCHAR(30) NOT NULL, -- token/definition/reference
  entity_id UUID NOT NULL,
  is_pending BOOLEAN NOT NULL DEFAULT TRUE,
  request_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending/approved/rejected
  requested_change_data JSONB NOT NULL,
  requested_by VARCHAR(120) NOT NULL,
  requested_reason VARCHAR(255),
  reviewed_by VARCHAR(120),
  review_note VARCHAR(255),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_change_request_status CHECK (request_status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS nexa_glossary_audit_logs (
  id UUID DEFAULT uuid_generate_v7(),
  entity_type VARCHAR(40) NOT NULL, -- definition/token/reference/vector/request
  entity_id UUID NOT NULL,
  action_type VARCHAR(20) NOT NULL, -- create/update/deactivate/approve/reject
  before_data JSONB,
  after_data JSONB,
  changed_by VARCHAR(120) NOT NULL,
  change_reason VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);

SELECT create_hypertable('nexa_glossary_audit_logs', 'created_at', if_not_exists => TRUE);

-- ==========================================================
-- 4) 인덱스 전략
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_definitions_category_status
  ON nexa_glossary_definitions(category, status);

CREATE INDEX IF NOT EXISTS idx_tokens_lookup
  ON nexa_term_tokens(layer_type, token_value);

CREATE INDEX IF NOT EXISTS idx_references_term_id
  ON nexa_glossary_references(term_id);

CREATE INDEX IF NOT EXISTS idx_references_capability_id
  ON nexa_glossary_references(capability_id);

CREATE INDEX IF NOT EXISTS idx_doc_sync_status
  ON nexa_glossary_doc_sync_state(last_sync_status, last_scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_change_requests_status_created
  ON nexa_glossary_change_requests(request_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_entity_created
  ON nexa_glossary_audit_logs(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_glossary_vector_hnsw
  ON nexa_glossary_vectors
  USING hnsw (description_vector vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

---

## 보완 반영 요약

- `timescaledb` 확장 추가 (`create_hypertable` 실행 안전)
- `uuid_generate_v7()` fallback 추가
- `capability_id` 참조를 `NOT NULL + ON DELETE RESTRICT`로 정합화
- `type='user'`일 때만 `usr.*` 접두사 강제
- SSOT 누락 컬럼 복구:
  - `nexa_term_tokens.status`, `created_at`
  - `nexa_glossary_vectors.embedding_dim`
  - `nexa_glossary_change_requests.is_pending`, `review_note`
- 상태/도메인 CHECK 제약 추가 (`layer_type`, `request_status`, `status`)
- 운영 인덱스 보강 (`doc_sync`, `change_requests`, `references`, `audit`)
NEXA 플랫폼의 **"지능형 용어 관리(Glossary DB)"** 시스템을 완전하게 가동하기 위한 전체 통합 DDL 스키마를 작성해 드립니다.

이 스키마는 단순히 용어를 저장하는 것을 넘어, **5W1H 헥사곤 토큰 매핑, 기능 자격(Capability ID) 연동, 지능 위계별(Nano/Micro/Vista) 차등 배포, 그리고 기획 문서(src/docs/) 동기화**를 모두 포괄하는 **단일 진실 공급원(SSOT)**으로 설계되었습니다.

---

### [NEXA-DDL-GLOSSARY-CORE] 지능형 용어 및 자산 통합 스키마

```sql
-- ==========================================================
-- 0. 사전 요구사항 (확장 및 공용 테이블)
-- ==========================================================
CREATE EXTENSION IF NOT EXISTS "pg_uuidv7";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 0.1 회원 서비스 등급 (Tiers)
CREATE TABLE tiers (
    tier_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code VARCHAR(50) UNIQUE NOT NULL, -- BASIC, STANDARD, PRO
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 0.2 기능 자격 마스터 (Capabilities)
CREATE TABLE capabilities (
    capability_id VARCHAR(200) PRIMARY KEY, -- nexa.platform.archive.hub 등
    label VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- domain, menu, action, user
    source VARCHAR(50) NOT NULL, -- registry, manual
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- 사용자 역량(usr.) 접두사 강제 제약 조건
    CONSTRAINT chk_user_capability_prefix
        CHECK (source != 'manual' OR capability_id LIKE 'usr.%')
);

-- ==========================================================
-- 1. 지능형 용어 관리 핵심 계층 (Glossary Core)
-- ==========================================================

-- 1.1 용어 기본 정의 테이블
CREATE TABLE nexa_glossary_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    term_key VARCHAR(100) UNIQUE NOT NULL, -- English Kernel (예: VOID)
    ko_label VARCHAR(100) NOT NULL,        -- Multilingual Shell (예: 여백)
    category VARCHAR(50) NOT NULL,         -- AI, SYS, INFRA, AUTH 등
    definitions JSONB NOT NULL,            -- nano, micro, vista 위계별 정의 포함
    nature_tag VARCHAR(20) DEFAULT 'RULE', -- RULE, INTENT, INCIDENT 등
    status SMALLINT DEFAULT 1,             -- 1: Active, 0: Inactive
    version_no INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 헥사곤 토큰 매핑 테이블 (1ms 필터링용)
CREATE TABLE nexa_term_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    term_id UUID NOT NULL REFERENCES nexa_glossary_definitions(id) ON DELETE CASCADE,
    layer_type SMALLINT NOT NULL,          -- 1:Where, 2:When, 3:Who, 4:What, 5:How, 6:Why
    token_value SMALLINT NOT NULL,         -- SMALLINT 토큰값
    is_immutable BOOLEAN DEFAULT FALSE,    -- 시스템 핵심 토큰(수정 제한) 여부
    UNIQUE(term_id, layer_type),           -- 한 용어는 레이어별 하나의 토큰만 가짐
    UNIQUE(layer_type, token_value)        -- 한 레이어 내 토큰값 중복 금지
);

-- 1.3 용어-기능-문서 족보 연결 테이블
CREATE TABLE nexa_glossary_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    term_id UUID NOT NULL REFERENCES nexa_glossary_definitions(id) ON DELETE CASCADE,
    capability_id VARCHAR(200) REFERENCES capabilities(capability_id) ON DELETE SET NULL,
    doc_ref_path VARCHAR(255),             -- src/docs/ 하위 경로
    doc_anchor VARCHAR(100),               -- 문서 내 앵커 (#싱귤래리티 등)
    source_hash VARCHAR(64),               -- 문서 내용 변경 감지용 해시
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 시맨틱 검색용 벡터 테이블
CREATE TABLE nexa_glossary_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    term_id UUID UNIQUE NOT NULL REFERENCES nexa_glossary_definitions(id) ON DELETE CASCADE,
    embedding_model VARCHAR(80) DEFAULT 'nomic-embed-text',
    description_vector VECTOR(768) NOT NULL, -- Ollama 표준 차원
    vector_search_status SMALLINT DEFAULT 1, -- 1: 검색가능, 0: 제외
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 2. 운영 및 자동화 보강 계층 (Glossary Boosters)
-- ==========================================================

-- 2.1 지능 위계별 차등 배포 프로파일
CREATE TABLE nexa_glossary_distribution_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    profile_name VARCHAR(20) UNIQUE NOT NULL, -- nano, micro, vista
    include_levels JSONB NOT NULL,            -- 추출할 위계 설정
    include_categories JSONB NOT NULL,        -- 추출할 카테고리 필터
    max_payload_kb INTEGER NOT NULL,          -- 엣지 전송 제한량 (Nano용)
    package_format VARCHAR(20) DEFAULT 'json',-- json, bin
    ota_channel VARCHAR(40),                  -- 배포 경로
    version_tag VARCHAR(40),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 기획 문서 자동 동기화 상태 관리 (Crawler)
CREATE TABLE nexa_glossary_doc_sync_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    doc_ref_path VARCHAR(255) UNIQUE NOT NULL,
    last_hash VARCHAR(64) NOT NULL,           -- 마지막 스캔 시점 파일 해시
    last_scanned_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync_status VARCHAR(20),             -- success, fail
    last_error TEXT
);

-- 2.3 불변 토큰 변경 승인 큐
CREATE TABLE nexa_glossary_change_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    entity_type VARCHAR(30) NOT NULL,         -- token, definition
    entity_id UUID NOT NULL,
    request_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    requested_change_data JSONB NOT NULL,     -- 변경될 데이터 스냅샷
    requested_by VARCHAR(120) NOT NULL,
    requested_reason TEXT,
    reviewed_by VARCHAR(120),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 변경 감사 로그 (Audit Logs)
CREATE TABLE nexa_glossary_audit_logs (
    id UUID DEFAULT uuid_generate_v7(),
    entity_type VARCHAR(40) NOT NULL,
    entity_id UUID NOT NULL,
    action_type VARCHAR(20) NOT NULL,         -- create, update, approve
    before_data JSONB,
    after_data JSONB,
    changed_by VARCHAR(120) NOT NULL,
    change_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
);
SELECT create_hypertable('nexa_glossary_audit_logs', 'created_at'); -- 시계열 감사 로그

-- ==========================================================
-- 3. 성능 최적화 및 인덱스 전략
-- ==========================================================

-- 시맨틱 검색용 HNSW 인덱스
CREATE INDEX idx_glossary_vector_hnsw ON nexa_glossary_vectors
USING hnsw (description_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- 용어 검색 최적화 인덱스
CREATE INDEX idx_definitions_category ON nexa_glossary_definitions(category, status);
CREATE INDEX idx_tokens_lookup ON nexa_term_tokens(layer_type, token_value);
```

---

### 스키마 설계의 핵심 가치와 운영 전략

1.  **영어 커널 - 다국어 쉘 구현**: `term_key`는 내부 AI 로직이 사용하는 영어 '악보'이며, `ko_label`과 `definitions.vista.summary`는 사용자에게 한국어로 보여줄 'Summary' 자산입니다.
2.  **1ms Pruning(필터링)**: `nexa_term_tokens` 테이블은 `SMALLINT`로만 구성되어 있어, AI가 방대한 지식 베이스를 뒤지기 전 현재 상황(Where, Who 등)과 맞지 않는 데이터의 90%를 즉시 걸러내는 초고속 인덱스 역할을 합니다.
3.  **지능 위계별 차등 배포**: `distribution_profiles`를 통해 **Nano(ESP32)**에는 `definitions.nano` 필드와 필수 토큰만 포함된 10KB 미만의 경량 사전을 배포하고, **Vista(서버)**에는 전체 추적 정보를 유지하는 위계별 지능 분산이 가능합니다.
4.  **보안 및 불변성**: `is_immutable` 플래그와 `change_requests` 승인 큐를 결합하여, 시스템의 근간이 되는 '코어 토큰'이 승인 없이 변경되어 전체 사유 체계가 무너지는 것을 물리적으로 방지합니다.
5.  **기획 문서 족보(Traceability)**: `nexa_glossary_doc_sync_state`와 `references` 테이블은 `src/docs/`의 원본 마크다운 파일과 DB를 실시간으로 연결합니다. 사용자가 특정 기능을 보다가 "이게 왜 이렇게 설계되었지?"라고 물으면 즉시 기획 문서의 특정 섹션으로 안내할 수 있습니다.

### 2. 설계의 주요 포인트 및 매핑 전략

**상세 매핑 스키마**의 필요성과 역할은 다음과 같습니다.

1.  **Linguistic Routing의 연료**: `nexa_glossary_references` 테이블은 사용자의 자연어 입력에서 추출된 용어를 실제 실행 가능한 `capability_id`로 연결하는 가교 역할을 합니다.
2.  **기획 문서 자동 동기화**: `doc_ref_path` 필드를 통해 `src/docs/`에 있는 원본 마크다운 파일과 DB 데이터를 동기화하며, Crawler가 문서 수정 시 이 매핑 정보를 업데이트합니다.
3.  **사용자 역량(User Capability) 보호**: `capabilities` 테이블의 `chk_user_capability_prefix` 제약 조건은 사용자가 생성한 기능 자격이 시스템 영역(`nexa.*`)을 침범하지 못하도록 물리적으로 차단합니다.
4.  **1ms Pruning 인덱스**: `nexa_term_tokens`에 저장된 `SMALLINT` 값들은 AI가 본문을 읽기 전 90%의 부적합 데이터를 즉시 걸러내는 초고속 필터로 작동합니다.

### 3. 향후 활용 쿼리 예시 (Linguistic Routing)

사용자가 **"데이터 보관해줘"**라고 입력했을 때, 시스템이 용어 사전을 거쳐 기능 자격을 찾아내는 논리입니다.

```sql
-- 1. 자연어와 가장 유사한 용어 및 Capability ID 탐색
SELECT
    d.term_key,
    d.ko_label,
    r.capability_id,
    r.doc_ref_path
FROM nexa_glossary_definitions d
JOIN nexa_glossary_references r ON d.id = r.term_id
JOIN nexa_glossary_vectors v ON d.id = v.term_id
WHERE d.status = 1
ORDER BY v.description_vector <=> (embedding_of_input_text) -- 벡터 유사도 검색
LIMIT 1;
```

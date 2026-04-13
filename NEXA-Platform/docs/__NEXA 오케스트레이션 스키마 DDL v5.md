# NEXA 오케스트레이션 스키마 DDL v5

**범위:** 프로젝트 귀속 32개(기존 31 + Multi-faceted Self 런타임 1) + 비귀속 27개  
**기준:** `__NEXA 오케스트라 프로젝트 데이터베이스 설계 명세서 v5.md`  
**목적:** 명세 v5에 맞춘 단일 DDL 원본. 실행 블록은 중복 없이 한 번만 수록한다.

**이전 파일:** `__NEXA 오케스트레이션 스키마 DDL.md` — 동일 내용의 장황한 중복본·복구 임시 블록은 v5에서 제거하였다.

---

## 문서 구성

| 구간      | 내용                                                                                                       |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| §0        | 확장·`uuid_generate_v7()`                                                                                  |
| §1 ~ §2   | 귀속 32개 + **§1-5 Nexnap** + **Self facet·Empathy** / 비귀속·Capability·코일                              |
| §3 ~ §6   | 인덱스 → RLS → FK 보강 → pgvector (본문 순서와 동일)                                                       |
| §0A ~ §0D | Knowledge·Self·NIXIE(서사·**Shell·Jitter**)·**Empathy/Multi-Self** **보강**(마이그레이션·외부 스키마 연동) |
| §7        | 운영 메모                                                                                                  |
| 부록 A    | 문서 편집 시 체크리스트                                                                                    |

**권장 실행 순서 (greenfield):** §0 → §1 → §2 → §5(FK) → §3 → §4 → §6 → (선택) §0A·§0B·§0C·§0D. §0C·§0D는 **idempotent**이며, 본문에 이미 컬럼·테이블이 있으면 `ALTER`·`CREATE IF NOT EXISTS`만 실질 적용된다.

---

## 0) 사전 요구사항

```sql
SET search_path TO public;

CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_uuidv7;

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
```

---

## 1) 프로젝트 귀속 테이블 DDL

32개 핵심 귀속 테이블(§1-3에 `project_self_facet_runtime` 포함) + **[Nexnap-04]·[Nexnap-07]** 실행 트랙(§1-5). 실행 트랙은 단순 로그가 아니라 **과거·미래 유영 시뮬레이터**(가상 분기·스냅샷 롤백·잔여 적합도)의 데이터 기반이 된다.

### 1-1. 핵심 기반 (`projects`, `project_members`, `project_settings`)

```sql
CREATE TABLE projects (
  project_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  owner_id UUID NOT NULL,
  storage_id UUID,
  storage_quota_bytes BIGINT,
  current_storage_usage BIGINT DEFAULT 0,
  title TEXT NOT NULL,
  domain_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_members (
  member_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'viewer',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_settings (
  setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(project_id) ON DELETE CASCADE,
  precision_level SMALLINT DEFAULT 1,
  batch_policy JSONB,
  retention_period_days INTEGER,
  user_defined_threshold SMALLINT DEFAULT 95,
  settings_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  vi_threshold NUMERIC(4,3),
  es_threshold NUMERIC(4,3)
);

COMMENT ON COLUMN project_settings.vi_threshold IS '[Empathy] 사람 Vitality Index(0~1) 하한. 미만이면 Low-Entropy·출력 억제 등 정책. NULL=플랫폼 기본.';
COMMENT ON COLUMN project_settings.es_threshold IS '[Empathy] Emotional State(-1~+1) 하한. 미만이면 간결 응답·자율 등급 제동. NULL=플랫폼 기본.';
```

### 1-2. 자원/로그/탐색 (`project_assets` ~ `project_links`)

```sql
CREATE TABLE project_assets (
  asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  file_id UUID,
  nature_tag VARCHAR(32),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_media (
  media_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  media_type TEXT,
  file_id UUID,
  processing_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_tags (
  tag_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_vector VECTOR(1536),
  vector_search_status SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_logs (
  log_id UUID DEFAULT uuid_generate_v7(),
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  where_scope SMALLINT,
  when_tempo SMALLINT,
  who_pulse SMALLINT,
  what_intent SMALLINT,
  how_state SMALLINT,
  why_causality SMALLINT,
  summary TEXT,
  why_chain JSONB,
  confidence_score SMALLINT,
  is_time_synced BOOLEAN,
  last_sync_at TIMESTAMPTZ,
  embedding VECTOR(1536),
  extra_data JSONB,
  source_shell_id UUID,
  target_shell_id UUID,
  nixie_feedback JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (log_id, created_at)
);

SELECT create_hypertable('project_logs', 'created_at');

COMMENT ON COLUMN project_logs.confidence_score IS '신뢰도(0~100 등 앱 정의). `project_settings.user_defined_threshold` 미만이면 NIXIE **Jitter** 후보 — 동일 행 `nixie_feedback`에 원인 메타데이터를 반드시 기록.';
COMMENT ON COLUMN project_logs.source_shell_id IS '[Shell ID] 한 Soul(단일 지능)이 복수 Shell(장치·브라우저 탭 등)에 나타날 수 있음. **이 로그가 발생한 입력·관측 지점**의 `nixie_shells.shell_id`. 서사 유래(Traceability)의 시작점.';
COMMENT ON COLUMN project_logs.target_shell_id IS '[Shell ID] **연주·출력·피드백이 전달된 대상** 쉘. `source_shell_id`와 쌍으로 Soul 단위 서사 흐름(발생지→수신지)을 추적.';
COMMENT ON COLUMN project_logs.nixie_feedback IS 'NIXIE 비언어 피드백(Jitter)·족보 강결합 JSON. `confidence_score` < `user_defined_threshold`일 때 필수: `error_token`(Nexnap 정규화 토큰 또는 파싱 실패 지점), `parser_version`, 선택 `pipeline_id`/`ir_stage`. `user_defined_threshold_snapshot`(당시 적용 임계). 캔버스는 이 행과 1:1로 빛의 떨림 연출.';

CREATE TABLE project_resource_versions (
  version_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  resource_type TEXT,
  version_data JSONB,
  commit_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_folders (
  folder_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  parent_id UUID REFERENCES project_folders(folder_id),
  folder_name TEXT NOT NULL,
  yjs_state BYTEA,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_links (
  link_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  crawl_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1-3. AI/협업/실행 (`project_orchestra` ~ `project_yjs_updates`)

```sql
CREATE TABLE project_orchestra (
  orchestra_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  persona_config JSONB,
  skill_definitions JSONB,
  task_sequence JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_chats (
  chat_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNLOGGED TABLE project_agent_sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  agent_id TEXT,
  status TEXT,
  context_data JSONB,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  active_shell_id UUID,
  focus_intensity SMALLINT,
  self_profile_id UUID,
  active_facet_key VARCHAR(30) CHECK (
    active_facet_key IS NULL
    OR active_facet_key IN ('Now', 'Energy', 'Direction', 'Discovery')
  ),
  active_state_id UUID,
  coil_weights JSONB NOT NULL DEFAULT '{}',
  self_synced_at TIMESTAMPTZ
);

COMMENT ON COLUMN project_agent_sessions.user_id IS '세션 소유자. Multi-faceted Self·RLS 스코프.';
COMMENT ON COLUMN project_agent_sessions.self_profile_id IS 'nexa_self_profiles.self_profile_id. 다중 자아 프로필 선택.';
COMMENT ON COLUMN project_agent_sessions.active_facet_key IS 'Self facet 단면: Now / Energy / Direction / Discovery [Empathy·핵심 인프라].';
COMMENT ON COLUMN project_agent_sessions.active_state_id IS 'nexa_self_states.state_id — 프로필 내 현재 상태(Empty 등). Self 스키마 배포 시 FK(§5).';
COMMENT ON COLUMN project_agent_sessions.coil_weights IS '활성 facet·상태 반영 후 코일 밸런서 유효 가중치 스냅샷 JSON. 실시간 동기화.';
COMMENT ON COLUMN project_agent_sessions.self_synced_at IS 'facet/코일 값이 Self 엔진과 마지막으로 일치한 시각.';

-- 세션 TTL 이후에도 복원용: 사용자·프로젝트당 1행 (로그인·NEXU가 동일 규칙으로 갱신)
CREATE TABLE project_self_facet_runtime (
  runtime_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  self_profile_id UUID,
  active_facet_key VARCHAR(30) NOT NULL DEFAULT 'Now' CHECK (
    active_facet_key IN ('Now', 'Energy', 'Direction', 'Discovery')
  ),
  active_state_id UUID,
  coil_weights JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

COMMENT ON TABLE project_self_facet_runtime IS 'Multi-faceted Self: 프로젝트·사용자별 활성 facet·코일 가중 스냅샷. UNLOGGED 세션과 이중 기록해 실시간·복원 모두 지원.';

CREATE UNLOGGED TABLE project_user_presence (
  presence_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  activity TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_knowledge (
  knowledge_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  nature_tag VARCHAR(20),
  where_scope SMALLINT,
  when_tempo SMALLINT,
  who_pulse SMALLINT,
  what_intent SMALLINT,
  how_state SMALLINT,
  why_causality SMALLINT,
  content_fact TEXT,
  raw_content TEXT,
  ref_ids JSONB,
  metadata JSONB,
  extra_data JSONB,
  confidence_score SMALLINT,
  embedding VECTOR(1536),
  vector_search_status SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_nodes (
  node_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  node_data JSONB,
  yjs_state BYTEA,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_yjs_updates (
  update_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  update_data BYTEA NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1-4. 나머지 귀속 테이블 (`project_scripts` ~ `project_releases`)

```sql
CREATE TABLE project_scripts (
  script_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  script_name TEXT,
  language TEXT,
  script_data BYTEA,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_simulations (
  simulation_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  simulation_data JSONB,
  result_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_panels (
  panel_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  ref_asset_id UUID REFERENCES project_assets(asset_id) ON DELETE SET NULL,
  config_data JSONB,
  sequence_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_boards (
  board_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  layout_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_devices (
  project_device_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  device_reg_id UUID,
  core_fw_id UUID,
  model_hw_id UUID,
  script_id UUID REFERENCES project_scripts(script_id) ON DELETE SET NULL,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_network_topology (
  topology_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  graph_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_traces (
  trace_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  trace_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_solutions (
  solution_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  title TEXT,
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_tasks (
  task_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'todo',
  metadata JSONB,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_jobs (
  job_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL,
  progress SMALLINT DEFAULT 0,
  error_msg TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_parts_bom (
  bom_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  part_model_id UUID,
  spec_id UUID,
  quantity NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_extensions (
  extension_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  extension_name TEXT NOT NULL,
  config_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_secrets (
  secret_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  encrypted_value BYTEA NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_releases (
  release_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  version_id UUID REFERENCES project_resource_versions(version_id) ON DELETE SET NULL,
  version_tag TEXT,
  release_notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1-5. Nexnap 실행 트랙 (`execution_chains`, `execution_steps`, `execution_logs`)

**근거:** [NEXA-Nexnap-04] 실행 사슬 생명주기·VOID, [NEXA-Nexnap-07] 예외·`ADAPTER_PARTIAL_SUCCESS`·스냅샷 롤백.

- **가상 실행 분기:** `execution_steps.is_virtual` — Dry-run 시뮬레이션과 실제 실행을 플래그로 분리. `target_entity_type` ∈ `PHYSICAL` | `VIRTUAL` | `NEXU` 로 **실물(EFF) 미영향** 가상 분기와 실제 분기를 데이터 레벨에서 구분한다.
- **상태 스냅샷:** `pre_state_snapshot` / `post_state_snapshot` — 스텝 경계의 직전·직후 상태 박제. 복잡한 취소 로직 없이 [Nexnap-07] **타임머신 롤백**에 사용한다.
- **잔여 태스크 적합도:** `execution_chains.residual_fit_score` + `residual_fit_rationale` — 부분 성공 시 남은 단계 강행 여부 판단(Nexnap-07 §1.1, 80% 임계)의 **수치·근거**를 사슬 단위에 보관한다.

```sql
-- 실행 사슬(실시간 맥박). project_orchestra ↔ project_logs 사이의 실행 계층
--  UCL에 의해 연주된 지능의 실시간 상태를 포착한 '맥박'이자 '전송 봉투'. (표정/맥박/인터페이스)
CREATE TABLE execution_chains (
  packet_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,
  actor_type VARCHAR(10) NOT NULL CHECK (actor_type IN ('USER', 'DEVICE', 'AGENT')),
  input_channel VARCHAR(20),
  capability_id VARCHAR(100) NOT NULL,
  where_scope SMALLINT NOT NULL,
  when_tempo SMALLINT NOT NULL,
  who_pulse SMALLINT NOT NULL,
  what_intent SMALLINT NOT NULL,
  how_state SMALLINT NOT NULL DEFAULT 1,
  why_causality SMALLINT NOT NULL,
  execution_bundle JSONB NOT NULL,
  context_bundle JSONB,
  confidence_score SMALLINT DEFAULT 100 CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100)),
  why_chain JSONB,
  is_time_synced BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  residual_fit_score SMALLINT CHECK (
    residual_fit_score IS NULL OR (residual_fit_score >= 0 AND residual_fit_score <= 100)
  ),
  residual_fit_rationale JSONB
);

COMMENT ON COLUMN execution_chains.residual_fit_score IS '[Nexnap-07 §1.1] ADAPTER_PARTIAL_SUCCESS 등 부분 성공 후 잔여 스텝이 what_intent 달성에 적합한지 0~100. NULL이면 미평가.';
COMMENT ON COLUMN execution_chains.residual_fit_rationale IS '잔여 적합도 산출 근거: 유사 사례 ref, 의존성 그래프 요약, RAG 스니펫, 가중치 등 JSON.';

CREATE INDEX idx_exec_chains_project_state ON execution_chains(project_id, how_state);
CREATE INDEX idx_exec_chains_actor ON execution_chains(actor_type, actor_id);
CREATE INDEX idx_exec_chains_residual ON execution_chains(project_id, residual_fit_score)
  WHERE residual_fit_score IS NOT NULL;

-- 원자 스텝: 시뮬레이터·가상 분기·스냅샷 롤백의 최소 단위
CREATE TABLE execution_steps (
  step_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  packet_id UUID NOT NULL REFERENCES execution_chains(packet_id) ON DELETE CASCADE,
  step_sequence SMALLINT NOT NULL,
  capability_id VARCHAR(100) NOT NULL,
  params JSONB,
  step_status SMALLINT DEFAULT 1,
  confidence_score SMALLINT DEFAULT 100,
  retry_count SMALLINT DEFAULT 0,
  is_virtual BOOLEAN NOT NULL DEFAULT FALSE,
  target_entity_type VARCHAR(20) NOT NULL DEFAULT 'PHYSICAL'
    CHECK (target_entity_type IN ('PHYSICAL', 'VIRTUAL', 'NEXU')),
  timeline_branch_id UUID,
  pre_state_snapshot JSONB,
  post_state_snapshot JSONB,
  why_step_logic JSONB,
  error_token JSONB,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (packet_id, step_sequence)
);

COMMENT ON COLUMN execution_steps.is_virtual IS 'true=Dry-run·시뮬레이션 분기. 실물 어댑터/EFF 미발동 [Nexnap-04].';
COMMENT ON COLUMN execution_steps.target_entity_type IS 'PHYSICAL=실장비, VIRTUAL=권한된 가상/샌드박스, NEXU=넥슈·UI·서사 계층.';
COMMENT ON COLUMN execution_steps.pre_state_snapshot IS '스텝 직전 상태 박제(롤백 목표·분기 비교).';
COMMENT ON COLUMN execution_steps.post_state_snapshot IS '스텝 직후 상태 박제. 타임머신 뒤로가기·즉시 롤백 [Nexnap-07 §3].';

CREATE INDEX idx_exec_steps_packet_seq ON execution_steps(packet_id, step_sequence);
CREATE INDEX idx_exec_steps_timeline ON execution_steps(timeline_branch_id);
CREATE INDEX idx_exec_steps_virtual ON execution_steps(packet_id) WHERE is_virtual = TRUE;
CREATE INDEX idx_exec_steps_target ON execution_steps(target_entity_type);

CREATE TABLE execution_logs (
  log_id UUID DEFAULT uuid_generate_v7(),
  packet_id UUID NOT NULL REFERENCES execution_chains(packet_id) ON DELETE CASCADE,
  step_id UUID REFERENCES execution_steps(step_id) ON DELETE SET NULL,
  adapter_id VARCHAR(100),
  raw_response JSONB,
  error_token JSONB,
  execution_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (log_id, created_at)
);

SELECT create_hypertable('execution_logs', 'created_at');
```

---

## 2) 비귀속 플랫폼 테이블 DDL

27개 비귀속 테이블 + Capability·코일 관련 DDL.

```sql
CREATE TABLE panel_components (
  component_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  component_name TEXT NOT NULL,
  ui_definition JSONB,
  source_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE node_definitions (
  node_def_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  node_type TEXT NOT NULL,
  properties_schema JSONB,
  icon_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE document_templates (
  template_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  template_name TEXT NOT NULL,
  layout_json JSONB,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE protocol_manifests (
  protocol_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  protocol_name TEXT NOT NULL,
  manifest_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE automation_recipes (
  recipe_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  title TEXT NOT NULL,
  logic_flow JSONB,
  description TEXT,
  usage_count INTEGER DEFAULT 0
);

CREATE TABLE orchestra_scores (
  score_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  persona_config JSONB,
  skill_definitions JSONB,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE firmwares_core (
  core_fw_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  version_tag TEXT NOT NULL,
  binary_data BYTEA,
  checksum TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE firmwares_model (
  model_hw_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  model_name TEXT UNIQUE,
  pin_map_yaml TEXT,
  safety_guardrails JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NIXIE Shell 마스터 (§0C와 동일). greenfield 생성 시 FK 순서: nixie_shells → device_registry
CREATE TABLE nixie_shells (
  shell_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  user_id UUID,
  shell_kind VARCHAR(20) NOT NULL CHECK (shell_kind IN ('VIRTUAL', 'PHYSICAL')),
  browser_tab_fingerprint TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE device_registry (
  device_reg_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  device_token TEXT UNIQUE,
  model_hw_id UUID,
  metadata JSONB,
  is_time_synced BOOLEAN,
  last_ntp_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  shell_id UUID REFERENCES nixie_shells(shell_id) ON DELETE SET NULL,
  nixie_shell_type VARCHAR(20),
  nixie_capability_set JSONB
);

CREATE UNLOGGED TABLE nixie_state_sync (
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emotional_vector JSONB NOT NULL DEFAULT '{}',
  visual_params JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE nixie_shell_configs (
  config_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  shell_id UUID NOT NULL REFERENCES nixie_shells(shell_id) ON DELETE CASCADE,
  rendering_profile VARCHAR(20) NOT NULL DEFAULT 'WARM'
    CHECK (rendering_profile IN ('COLD', 'WARM', 'HOT', 'AUTO')),
  override_settings JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shell_id)
);

CREATE TABLE platform_audit_logs (
  audit_id UUID DEFAULT uuid_generate_v7(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT,
  event_type TEXT,
  payload JSONB,
  PRIMARY KEY (audit_id, created_at)
);
SELECT create_hypertable('platform_audit_logs', 'created_at');

CREATE TABLE api_usage_stats (
  stat_id UUID DEFAULT uuid_generate_v7(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  route TEXT,
  method TEXT,
  status_code INTEGER,
  duration_ms INTEGER,
  metadata JSONB,
  PRIMARY KEY (stat_id, created_at)
);
SELECT create_hypertable('api_usage_stats', 'created_at');

CREATE TABLE template_reviews (
  review_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  template_type TEXT,
  template_id UUID,
  user_id UUID,
  rating SMALLINT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usage_metrics (
  metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  target_type TEXT,
  target_id UUID,
  metric_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE support_faq (
  faq_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  faq_vector VECTOR(1536),
  vector_search_status SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_consultation_logs (
  consultation_id UUID DEFAULT uuid_generate_v7(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID,
  question TEXT,
  answer TEXT,
  metadata JSONB,
  PRIMARY KEY (consultation_id, created_at)
);
SELECT create_hypertable('ai_consultation_logs', 'created_at');

CREATE TABLE storage_configs (
  storage_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  storage_name TEXT NOT NULL,
  config_data JSONB,
  quota_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE global_tags (
  global_tag_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  tag_name TEXT NOT NULL,
  category TEXT,
  tag_vector VECTOR(1536),
  vector_search_status SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE global_knowledge_base (
  kb_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  content_text TEXT,
  embedding VECTOR(1536),
  vector_search_status SMALLINT DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Capability/Tier/승인 관련 핵심 테이블

```sql
CREATE TABLE tiers (
  tier_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE capabilities (
  capability_id VARCHAR(200) PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  type VARCHAR(30),
  parent_id VARCHAR(200) REFERENCES capabilities(capability_id) ON DELETE SET NULL,
  source VARCHAR(30) DEFAULT 'registry',
  status VARCHAR(20) DEFAULT 'active',
  sync_at TIMESTAMPTZ,
  metadata JSONB
);

CREATE TABLE tier_allowed_capabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  tier_id UUID NOT NULL REFERENCES tiers(tier_id) ON DELETE CASCADE,
  capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tier_id, capability_id)
);

CREATE TABLE capability_grant_history (
  history_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  tier_id UUID REFERENCES tiers(tier_id) ON DELETE SET NULL,
  capability_id VARCHAR(200) REFERENCES capabilities(capability_id) ON DELETE SET NULL,
  action VARCHAR(20) NOT NULL,
  actor_id UUID,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sandbox_profiles (
  profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  profile_name TEXT UNIQUE NOT NULL,
  memory_limit_mb INTEGER,
  cpu_time_limit_ms INTEGER,
  allowed_modules JSONB,
  timeout_sec INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sandbox_profile_capabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  profile_id UUID NOT NULL REFERENCES sandbox_profiles(profile_id) ON DELETE CASCADE,
  capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, capability_id)
);

CREATE TABLE capability_tag_whitelist (
  whitelist_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  scope_key TEXT NOT NULL,
  tag TEXT NOT NULL,
  sort_order SMALLINT DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE capability_proposals (
  proposal_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  target_entity_id UUID NOT NULL,
  capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id),
  fit_score SMALLINT CHECK (fit_score BETWEEN 0 AND 100),
  request_context JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  recommended_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT
);

CREATE TABLE capability_map (
  map_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  resource_type VARCHAR(50) NOT NULL,
  resource_path TEXT NOT NULL,
  method VARCHAR(10),
  required_capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id),
  source VARCHAR(50) DEFAULT 'registry',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource_type, resource_path, method)
);
```

### 코일 밸런서 테이블

```sql
CREATE TABLE balance_coil_definitions (
  coil_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  origin VARCHAR(20) NOT NULL CHECK (origin IN ('system', 'user')),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  tier SMALLINT NOT NULL CHECK (tier IN (6, 12, 24)),
  code VARCHAR(64) NOT NULL,
  label TEXT,
  description TEXT,
  sort_order SMALLINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_balance_coil_def_origin_project
  CHECK ((origin = 'system' AND project_id IS NULL) OR (origin = 'user' AND project_id IS NOT NULL))
);

CREATE TABLE balance_coil_templates (
  template_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  origin VARCHAR(20) NOT NULL CHECK (origin IN ('system', 'user')),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id) ON DELETE RESTRICT,
  character_key VARCHAR(64),
  name TEXT NOT NULL,
  description TEXT,
  weight_spec JSONB NOT NULL,
  min_safety_stability_pct SMALLINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_balance_coil_tpl_origin_project
  CHECK ((origin = 'system' AND project_id IS NULL) OR (origin = 'user' AND project_id IS NOT NULL))
);
```

---

## 3) 인덱스 정책 (핵심)

```sql
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_assets_project_id ON project_assets(project_id);
CREATE INDEX idx_project_media_project_id ON project_media(project_id);
CREATE INDEX idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX idx_project_logs_project_id_created ON project_logs(project_id, created_at DESC);
CREATE INDEX idx_project_logs_target_shell ON project_logs(project_id, target_shell_id, created_at DESC)
  WHERE target_shell_id IS NOT NULL;
CREATE INDEX idx_project_logs_confidence_jitter ON project_logs(project_id, confidence_score, created_at DESC)
  WHERE confidence_score IS NOT NULL;
CREATE INDEX idx_project_knowledge_project_id ON project_knowledge(project_id);
CREATE INDEX idx_project_nodes_project_id ON project_nodes(project_id);
CREATE INDEX idx_project_jobs_status_created ON project_jobs(project_id, status, created_at DESC);
CREATE INDEX idx_project_parts_bom_project_id ON project_parts_bom(project_id);
CREATE INDEX idx_capability_map_path ON capability_map(resource_type, resource_path);
CREATE INDEX idx_balance_coil_templates_capability ON balance_coil_templates(capability_id);

CREATE INDEX idx_exec_logs_packet_created ON execution_logs(packet_id, created_at DESC);

CREATE INDEX idx_project_agent_sessions_project_user ON project_agent_sessions(project_id, user_id);
CREATE INDEX idx_project_self_facet_runtime_project_user ON project_self_facet_runtime(project_id, user_id);
```

---

## 4) RLS 정책 (핵심)

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_resource_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_orchestra ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_yjs_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_network_topology ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_parts_bom ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_self_facet_runtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY project_member_projects ON projects FOR ALL
USING (
  project_id IN (
    SELECT project_id
    FROM project_members
    WHERE user_id = (current_setting('app.current_user_id', true)::uuid)
  )
);

CREATE POLICY project_member_members ON project_members FOR ALL
USING (user_id = (current_setting('app.current_user_id', true)::uuid));

CREATE POLICY project_member_agent_sessions ON project_agent_sessions FOR ALL
USING (
  user_id = (current_setting('app.current_user_id', true)::uuid)
  AND project_id IN (
    SELECT project_id FROM project_members
    WHERE user_id = (current_setting('app.current_user_id', true)::uuid)
  )
);

CREATE POLICY project_member_self_facet_runtime ON project_self_facet_runtime FOR ALL
USING (
  user_id = (current_setting('app.current_user_id', true)::uuid)
  AND project_id IN (
    SELECT project_id FROM project_members
    WHERE user_id = (current_setting('app.current_user_id', true)::uuid)
  )
);

CREATE POLICY project_member_exec_chains ON execution_chains FOR ALL
USING (
  project_id IN (
    SELECT project_id FROM project_members
    WHERE user_id = (current_setting('app.current_user_id', true)::uuid)
  )
);

CREATE POLICY project_member_exec_steps ON execution_steps FOR ALL
USING (
  packet_id IN (
    SELECT packet_id FROM execution_chains
    WHERE project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = (current_setting('app.current_user_id', true)::uuid)
    )
  )
);

CREATE POLICY project_member_exec_logs ON execution_logs FOR ALL
USING (
  packet_id IN (
    SELECT packet_id FROM execution_chains
    WHERE project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = (current_setting('app.current_user_id', true)::uuid)
    )
  )
);
```

---

## 5) 참조 무결성 보강

```sql
ALTER TABLE projects
ADD CONSTRAINT fk_projects_storage
FOREIGN KEY (storage_id) REFERENCES storage_configs(storage_id) ON DELETE SET NULL;

ALTER TABLE project_devices
ADD CONSTRAINT fk_project_devices_registry
FOREIGN KEY (device_reg_id) REFERENCES device_registry(device_reg_id) ON DELETE SET NULL;

ALTER TABLE project_devices
ADD CONSTRAINT fk_project_devices_core_fw
FOREIGN KEY (core_fw_id) REFERENCES firmwares_core(core_fw_id) ON DELETE SET NULL;

ALTER TABLE project_devices
ADD CONSTRAINT fk_project_devices_model_fw
FOREIGN KEY (model_hw_id) REFERENCES firmwares_model(model_hw_id) ON DELETE SET NULL;
```

선택 FK(동일 DB일 때만 활성화):

```sql
-- ALTER TABLE project_assets ADD CONSTRAINT fk_project_assets_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL;
-- ALTER TABLE project_media ADD CONSTRAINT fk_project_media_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL;
-- ALTER TABLE project_parts_bom ADD CONSTRAINT fk_project_parts_bom_part FOREIGN KEY (part_model_id) REFERENCES part_models(id) ON DELETE SET NULL;
-- ALTER TABLE project_parts_bom ADD CONSTRAINT fk_project_parts_bom_spec FOREIGN KEY (spec_id) REFERENCES part_specs(id) ON DELETE SET NULL;

-- Multi-faceted Self (`nexa_self_*` 동일 DB 배포 시)
-- ALTER TABLE project_agent_sessions ADD CONSTRAINT fk_agent_sessions_self_profile FOREIGN KEY (self_profile_id) REFERENCES nexa_self_profiles(self_profile_id) ON DELETE SET NULL;
-- ALTER TABLE project_agent_sessions ADD CONSTRAINT fk_agent_sessions_self_state FOREIGN KEY (active_state_id) REFERENCES nexa_self_states(state_id) ON DELETE SET NULL;
-- ALTER TABLE project_self_facet_runtime ADD CONSTRAINT fk_self_facet_runtime_profile FOREIGN KEY (self_profile_id) REFERENCES nexa_self_profiles(self_profile_id) ON DELETE SET NULL;
-- ALTER TABLE project_self_facet_runtime ADD CONSTRAINT fk_self_facet_runtime_state FOREIGN KEY (active_state_id) REFERENCES nexa_self_states(state_id) ON DELETE SET NULL;

-- NIXIE Shell 추적 (`nixie_shells` 선행 생성·Timescale FK 호환 확인 후)
-- ALTER TABLE project_logs ADD CONSTRAINT fk_project_logs_source_shell FOREIGN KEY (source_shell_id) REFERENCES nixie_shells(shell_id) ON DELETE SET NULL;
-- ALTER TABLE project_logs ADD CONSTRAINT fk_project_logs_target_shell FOREIGN KEY (target_shell_id) REFERENCES nixie_shells(shell_id) ON DELETE SET NULL;
```

---

## 6) pgvector 인덱스 가이드

```sql
CREATE INDEX IF NOT EXISTS idx_project_knowledge_embedding_hnsw
ON project_knowledge USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_project_tags_tag_vector_hnsw
ON project_tags USING hnsw (tag_vector vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_global_knowledge_base_embedding_hnsw
ON global_knowledge_base USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_global_tags_tag_vector_hnsw
ON global_tags USING hnsw (tag_vector vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_support_faq_faq_vector_hnsw
ON support_faq USING hnsw (faq_vector vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

쿼리 규칙:

- `vector_cosine_ops` 인덱스는 `ORDER BY embedding <=> $1` 형태로 사용
- 검색 대상은 `vector_search_status = 1 AND embedding IS NOT NULL` 조건 권장
- HNSW 품질 조정: `SET hnsw.ef_search = 100;`

---

## 0A) Knowledge OS 연동 DDL(보강)

오케스트레이션 본체 테이블은 유지하고, 공통 지식 계층과의 연결 지점을 보강한다.

```sql
-- 0A-1. project_knowledge -> nexa_knowledge_definitions 연결(선택 FK)
ALTER TABLE IF EXISTS project_knowledge
  ADD COLUMN IF NOT EXISTS knowledge_definition_id UUID NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_project_knowledge_definition'
  ) THEN
    ALTER TABLE project_knowledge
      ADD CONSTRAINT fk_project_knowledge_definition
      FOREIGN KEY (knowledge_definition_id)
      REFERENCES nexa_knowledge_definitions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 0A-2. project_assets -> Knowledge 참조 링크 조회 성능 인덱스
CREATE INDEX IF NOT EXISTS idx_project_assets_project_created
  ON project_assets(project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_reference_assets_asset
  ON nexa_knowledge_reference_assets(asset_id);

-- 0A-3. Routing 연계 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_knowledge_references_capability_id
  ON nexa_knowledge_references(capability_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_vectors_term_id
  ON nexa_knowledge_vectors(term_id);
```

운영 메모:

- 위 보강은 `nexa_knowledge_*` 스키마가 먼저 배포되어 있어야 한다.
- 오케스트레이션은 공통 지식을 복제하지 않고 참조한다.

---

## 0B) Self 공통 자산 연동 DDL(보강)

```sql
-- 0B-1. project_knowledge -> nexa_self_profiles 연결(선택 FK)
ALTER TABLE IF EXISTS project_knowledge
  ADD COLUMN IF NOT EXISTS self_profile_id UUID NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_project_knowledge_self_profile'
  ) THEN
    ALTER TABLE project_knowledge
      ADD CONSTRAINT fk_project_knowledge_self_profile
      FOREIGN KEY (self_profile_id)
      REFERENCES nexa_self_profiles(self_profile_id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 0B-2. Self 브리지 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_self_knowledge_map_profile_priority
  ON nexa_self_knowledge_map(self_profile_id, status, priority);

CREATE INDEX IF NOT EXISTS idx_self_capability_links_profile_priority
  ON nexa_self_capability_links(self_profile_id, status, priority);
```

운영 메모:

- Self 연동은 닉시(`NEXA NIXIE`) 채널 전용이 아닌 플랫폼 공동 자산 규칙으로 사용한다.

---

## 0C) NIXIE Shell·디바이스·동기화 DDL (보강)

**근거:** `NIXIE VISION` §5.7, `NIXIE SCHEMA` §7 — 하나의 지능(Soul)·다수의 쉘(Shell), 탭별 `shell_id`, `device_registry` 통합 등록, PostgreSQL + Redis 이원화.

```sql
-- 0C-1. nixie_shells: 닉시 쉘 마스터 (브라우저 탭·실물 각각 독립 shell_id)
-- 수명: 가상 쉘은 탭 생명주기와 정렬. 파티션·스코프는 project_id + 조회 키 (shell_id PK는 전역 유일).
CREATE TABLE IF NOT EXISTS nixie_shells (
  shell_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  user_id UUID,
  shell_kind VARCHAR(20) NOT NULL CHECK (shell_kind IN ('VIRTUAL', 'PHYSICAL')),
  browser_tab_fingerprint TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_nixie_shells_project_created
  ON nixie_shells(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nixie_shells_user
  ON nixie_shells(project_id, user_id)
  WHERE user_id IS NOT NULL;

COMMENT ON TABLE nixie_shells IS 'NEXA NIXIE Shell 마스터. 가상(VIRTUAL)=브라우저 탭 단위 shell_id, 물리(PHYSICAL)=엣지 디바이스. device_registry.shell_id와 연결. [NIXIE SCHEMA §7]';
COMMENT ON COLUMN nixie_shells.browser_tab_fingerprint IS '클라이언트가 부여하는 탭 식별(선택). DB 유니크는 shell_id PK로 충분.';

-- 0C-2. device_registry: 닉시 쉘 구분·출력 능력 (가상/물리 통합 등록 시 사용)
ALTER TABLE device_registry ADD COLUMN IF NOT EXISTS shell_id UUID;
ALTER TABLE device_registry ADD COLUMN IF NOT EXISTS nixie_shell_type VARCHAR(20);
ALTER TABLE device_registry ADD COLUMN IF NOT EXISTS nixie_capability_set JSONB;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_device_registry_nixie_shell'
  ) THEN
    ALTER TABLE device_registry
      ADD CONSTRAINT fk_device_registry_nixie_shell
      FOREIGN KEY (shell_id) REFERENCES nixie_shells(shell_id) ON DELETE SET NULL;
  END IF;
END $$;

COMMENT ON COLUMN device_registry.nixie_shell_type IS 'PHYSICAL | VIRTUAL. 일반 IoT와 구분. 가상 쉘 행은 탭·세션 단말로 등록 시 설정.';
COMMENT ON COLUMN device_registry.nixie_capability_set IS '예: {"Rive_Expression":true,"Nixie_Tube_Lumina":true,"Haptic_Jitter":false}. 인디케이터·렌더러가 최적 명령 선택.';

CREATE INDEX IF NOT EXISTS idx_device_registry_shell_id
  ON device_registry(shell_id) WHERE shell_id IS NOT NULL;

-- 0C-3. project_agent_sessions: 활성 쉘·포커스 강도 (LOD·자원 절약 근거)
ALTER TABLE project_agent_sessions ADD COLUMN IF NOT EXISTS active_shell_id UUID;
ALTER TABLE project_agent_sessions ADD COLUMN IF NOT EXISTS focus_intensity SMALLINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_agent_sessions_active_shell'
  ) THEN
    ALTER TABLE project_agent_sessions
      ADD CONSTRAINT fk_agent_sessions_active_shell
      FOREIGN KEY (active_shell_id) REFERENCES nixie_shells(shell_id) ON DELETE SET NULL;
  END IF;
END $$;

COMMENT ON COLUMN project_agent_sessions.active_shell_id IS '시선/상호작용이 집중된 쉘(Focus Handoff).';
COMMENT ON COLUMN project_agent_sessions.focus_intensity IS '0~100. 비활성 쉘 LOD(COLD 등) 결정 근거.';

-- 0C-4. project_logs: 교차 쉘 서사·족보·NIXIE Jitter (Timescale hypertable에 ADD COLUMN)
ALTER TABLE project_logs ADD COLUMN IF NOT EXISTS source_shell_id UUID;
ALTER TABLE project_logs ADD COLUMN IF NOT EXISTS target_shell_id UUID;
ALTER TABLE project_logs ADD COLUMN IF NOT EXISTS nixie_feedback JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN project_logs.confidence_score IS '신뢰도(0~100 등 앱 정의). `project_settings.user_defined_threshold` 미만이면 NIXIE **Jitter** 후보 — 동일 행 `nixie_feedback`에 원인 메타데이터를 반드시 기록.';
COMMENT ON COLUMN project_logs.source_shell_id IS '[Shell ID] 한 Soul(단일 지능)이 복수 Shell(장치·브라우저 탭 등)에 나타날 수 있음. **이 로그가 발생한 입력·관측 지점**의 `nixie_shells.shell_id`. 서사 유래(Traceability)의 시작점.';
COMMENT ON COLUMN project_logs.target_shell_id IS '[Shell ID] **연주·출력·피드백이 전달된 대상** 쉘. `source_shell_id`와 쌍으로 Soul 단위 서사 흐름(발생지→수신지)을 추적. `why_chain`과 함께 데이터 유래 시각화.';
COMMENT ON COLUMN project_logs.nixie_feedback IS 'NIXIE 비언어 피드백(Jitter)·족보 강결합 JSON. `confidence_score` < `user_defined_threshold`일 때 필수: `error_token`(Nexnap 정규화 토큰 또는 파싱 실패 지점), `parser_version`, 선택 `pipeline_id`/`ir_stage`. `user_defined_threshold_snapshot`(당시 적용 임계). 캔버스는 이 행과 1:1로 빛의 떨림 연출.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_project_logs_source_shell'
  ) THEN
    ALTER TABLE project_logs
      ADD CONSTRAINT fk_project_logs_source_shell
      FOREIGN KEY (source_shell_id) REFERENCES nixie_shells(shell_id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_project_logs_target_shell'
  ) THEN
    ALTER TABLE project_logs
      ADD CONSTRAINT fk_project_logs_target_shell
      FOREIGN KEY (target_shell_id) REFERENCES nixie_shells(shell_id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_project_logs_source_shell
  ON project_logs(project_id, source_shell_id, created_at DESC)
  WHERE source_shell_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_project_logs_target_shell
  ON project_logs(project_id, target_shell_id, created_at DESC)
  WHERE target_shell_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_project_logs_confidence_jitter
  ON project_logs(project_id, confidence_score, created_at DESC)
  WHERE confidence_score IS NOT NULL;

-- 0C-5. nixie_state_sync: 저지연 정서·시각 파라미터 공유 (고빈도 쓰기 → UNLOGGED)
CREATE UNLOGGED TABLE IF NOT EXISTS nixie_state_sync (
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emotional_vector JSONB NOT NULL DEFAULT '{}',
  visual_params JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

COMMENT ON TABLE nixie_state_sync IS '실시간 정서 동기용 핫 스토어. 감사·불변 족보는 project_logs/why_chain으로 흡수. 장기 보관·복제는 Redis+앱 계층과 병행. [NIXIE SCHEMA §7.3]';

CREATE INDEX IF NOT EXISTS idx_nixie_state_sync_updated
  ON nixie_state_sync(updated_at DESC);

-- 0C-6. nixie_shell_configs: 쉘별 LOD·사용자 override
CREATE TABLE IF NOT EXISTS nixie_shell_configs (
  config_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  shell_id UUID NOT NULL REFERENCES nixie_shells(shell_id) ON DELETE CASCADE,
  rendering_profile VARCHAR(20) NOT NULL DEFAULT 'WARM'
    CHECK (rendering_profile IN ('COLD', 'WARM', 'HOT', 'AUTO')),
  override_settings JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shell_id)
);

COMMENT ON COLUMN nixie_shell_configs.override_settings IS '예: 기능 우선 모드, 쉘 전용 user_defined_threshold. project_settings 대비 우선순위는 앱 정책으로 정의.';

CREATE INDEX IF NOT EXISTS idx_nixie_shell_configs_shell ON nixie_shell_configs(shell_id);
```

운영 메모:

- **Redis:** `nixie_state_sync`는 PG 측 **스냅샷/폴백**에 가깝게 두고, **100ms급** 구독·푸시는 **Redis Pub/Sub 또는 캐시 키** `(project_id, user_id, shell_id)` 로 처리한다. 재시작 시 UNLOGGED·Redis 휘발성은 허용, **감사 가능한 사실**은 `project_logs`에 TICK/ECHO로 남긴다.
- **NIXIE Jitter·족보:** `confidence_score` < `user_defined_threshold`인 행은 `nixie_feedback`에 `error_token`·`parser_version` 등을 남겨 캔버스 Jitter와 **동일 로그 행**으로 강결합한다. **FK:** `fk_project_logs_source_shell`/`target_shell`은 `nixie_shells` 선행 후 적용. Timescale/배포에서 FK 제약이 막히면 §5 주석 FK만 사용하고 앱 레벨으로 검증한다.
- **가상 쉘 `device_registry` 행:** 기존 DDL에 `serial_number NOT NULL`이 있으면 가상 등록 시 **합성 시리얼** 또는 **해당 컬럼 완화 마이그레이션**이 선행될 수 있다(배포 환경별 확인).
- **RLS:** `nixie_shells`, `nixie_shell_configs`, `nixie_state_sync`에 `project_members` 기준 정책 추가는 배포 시 동일 패턴으로 적용한다.

---

## 0D) Multi-faceted Self·Empathy DDL (보강)

**근거:** `SYS ARCH NEXA 핵심 인프라`(Empathy Engine·코일 연동), `SYS CONCEPT NEXA Empathy 공감과 시스템구조`, `nexa_self_facets` / `nexa_self_states` 정의([용어·통합 스키마] 참조).

```sql
-- 0D-1. project_settings: VI·ES 임계 — Low-Entropy·출력 제동 (NULL이면 플랫폼 기본 정책)
ALTER TABLE project_settings ADD COLUMN IF NOT EXISTS vi_threshold NUMERIC(4,3);
ALTER TABLE project_settings ADD COLUMN IF NOT EXISTS es_threshold NUMERIC(4,3);

-- 0D-2. project_agent_sessions: 세션 단 실시간 facet·코일 동기화 (기존 DB 마이그레이션)
ALTER TABLE project_agent_sessions ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE project_agent_sessions ADD COLUMN IF NOT EXISTS self_profile_id UUID;
ALTER TABLE project_agent_sessions ADD COLUMN IF NOT EXISTS active_facet_key VARCHAR(30);
ALTER TABLE project_agent_sessions ADD COLUMN IF NOT EXISTS active_state_id UUID;
ALTER TABLE project_agent_sessions ADD COLUMN IF NOT EXISTS coil_weights JSONB NOT NULL DEFAULT '{}';
ALTER TABLE project_agent_sessions ADD COLUMN IF NOT EXISTS self_synced_at TIMESTAMPTZ;

-- 0D-3. 지속 런타임(세션 TTL 외 복원용)
CREATE TABLE IF NOT EXISTS project_self_facet_runtime (
  runtime_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  self_profile_id UUID,
  active_facet_key VARCHAR(30) NOT NULL DEFAULT 'Now'
    CHECK (active_facet_key IN ('Now', 'Energy', 'Direction', 'Discovery')),
  active_state_id UUID,
  coil_weights JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);
```

운영 메모:

- `nexa_self_states`는 **상태 정의 마스터**(공통 자산). 런타임 선택 값은 `active_state_id`로 참조하고, 오케스트레이션은 `project_agent_sessions`·`project_self_facet_runtime`에 **현재 단면·코일 스냅샷**을 둔다.
- 레거시 세션에 `user_id`가 없으면 백필 후 `NOT NULL` 제약을 별도 마이그레이션으로 거는 것을 권장한다.

---

## 7) 운영 메모

- `project_agent_sessions`는 UNLOGGED + TTL(24h) 권장
- `project_user_presence`는 UNLOGGED + 짧은 주기 정리 권장
- `project_logs`의 `how_state=VOID(3)` 세분화는 `extra_data.void_stage` 사용
- 토큰 매핑/임베딩 모델은 고정 운영(변경 시 리임베딩 계획 필요)
- **Nexnap 실행 트랙:** `execution_steps.is_virtual=true` 인 스텝은 실물 어댑터/EFF를 호출하지 않는다. `target_entity_type` 으로 PHYSICAL/VIRTUAL/NEXU 를 강제하며, Dry-run과 본 실행은 동일 스키마에 **행 단위로** 분리한다.
- **스냅샷/롤백:** `pre_state_snapshot`·`post_state_snapshot` 은 스텝 경계의 상태 박제. STUCK·복구 시 [Nexnap-07] 에 따라 이전 `post_state_snapshot` 적용으로 롤백한다.
- **잔여 적합도:** `ADAPTER_PARTIAL_SUCCESS` 시 `execution_chains.residual_fit_score`·`residual_fit_rationale` 을 갱신하고, [Nexnap-07 §1.1] 80% 임계로 FLOW 유지 vs STUCK+ASK 를 분기한다.
- **Multi-faceted Self:** `active_facet_key`·`active_state_id` 변경 시 `coil_weights`를 갱신하고 `project_self_facet_runtime`에 UPSERT하여 NEXU·코일 밸런서와 동기화한다. `settings_data.current_coil_template_id`는 템플릿 참조, `coil_weights`는 **해석된 유효 값**이다.
- **Empathy 제동:** 관측 VI·ES가 `project_settings.vi_threshold`·`es_threshold` 미만이면 Low-Entropy 모드(간결 출력·자율 완화)를 적용한다. NULL이면 플랫폼별 기본(Empathy 정책 테이블)을 사용한다.
- **NIXIE 서사·Shell:** `project_logs.source_shell_id`는 로그 **발생지**, `target_shell_id`는 **연주·피드백 수신지**. 한 Soul이 여러 Shell에 분산될 때 서사 추적에 사용한다.
- **NIXIE Jitter:** `confidence_score` < `user_defined_threshold`이면 `nixie_feedback`에 최소 `error_token`, `parser_version`, `user_defined_threshold_snapshot`을 기록해 캔버스 비언어 피드백(빛의 떨림)과 **스키마 수준**으로 묶는다.

TTL 예시:

```sql
DELETE FROM project_agent_sessions
WHERE last_active < NOW() - INTERVAL '24 hours';
```

---

## 부록 A) 문서 편집 시 체크리스트

- 헤더·섹션: Markdown 헤더로 정규화
- SQL: 실행 단위별 fenced code block 유지
- 표: 설명형 텍스트는 목록 중심으로 단순화
- 중복 문단·깨진 구문 제거

---

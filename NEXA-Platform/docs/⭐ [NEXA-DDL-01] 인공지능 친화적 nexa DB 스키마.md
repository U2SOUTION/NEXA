# NEXA 오케스트라 프로젝트 스키마 DDL (귀속 31개 · 비귀속 27개)

명세서 v5.0의 **1. 프로젝트 통합 데이터 스키마 리스트 (귀속 31개 테이블)**와 **1.1 플랫폼 비귀속 테이블 (27개)**를 번호 순서에 맞춰 DDL로 정리한 문서이다. Capability ID 일급 객체·동적 매핑 자동화·거절된 자격 클리닝 정책을 반영하며, 테이블 간 참조 관계(FK)·RLS·인덱스·TimescaleDB 하이퍼테이블·외부 참조 보강을 반영하였다.

---

# ✨ **0. 사전 요구사항 (확장·스키마)**

```sql
SET search_path TO public;

-- TimescaleDB·벡터 검색
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS vector;

-- 프로젝트 자격 증명(project_secrets) 컬럼 암호화용
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- UUID v7: pg_uuidv7 확장 설치 시 해당 함수 사용. 미설치 시 public에 fallback 생성
CREATE EXTENSION IF NOT EXISTS pg_uuidv7;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE p.proname = 'uuid_generate_v7') THEN
    CREATE OR REPLACE FUNCTION public.uuid_generate_v7() RETURNS uuid AS $$ SELECT gen_random_uuid(); $$ LANGUAGE sql;
  END IF;
END $$;
```

---

# ✨ **1. 프로젝트 통합 데이터 스키마 DDL (No. 1 ~ No. 31)**

---

### 1단계: 핵심 기반 및 설정 (No. 1 ~ 3)

```sql
-- 1. 프로젝트 최상위 정보
CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    owner_id UUID NOT NULL,
    storage_id UUID, -- storage_configs 참조
    storage_quota_bytes BIGINT,   -- 프로젝트별 저장소 용량 제한(바이트). NULL이면 제한 없음 또는 storage_configs 기본값 참조
    current_storage_usage BIGINT DEFAULT 0,  -- 현재 사용량(바이트). 트리거에서 증분(Delta)만 갱신. MV로 주기 보정
    title TEXT NOT NULL,
    domain_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 프로젝트 멤버 및 권한
CREATE TABLE project_members (
    member_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT DEFAULT 'viewer',
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 프로젝트 전역 설정 (프로젝트 DNA·양자화 정책: 컬럼 + settings_data 확장)
CREATE TABLE project_settings (
    setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE UNIQUE,
    -- 프로젝트 DNA (사용자 지정. 오케스트레이터·양자화·배치 정책 기준)
    precision_level SMALLINT DEFAULT 1,    -- 0=엄밀(기계), 1=균형(스마트팜), 2=느슨(아트)
    batch_policy JSONB,                   -- 배칭 규칙: max_batch_size, flush_ms, 우선순위 등
    retention_period_days INTEGER,        -- 로그·캐시 보관 일수
    settings_data JSONB,                  -- 그 외 확장 설정 (dna 세부, quantization_rules 등)
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

```

**project_settings 설계 — 컬럼 + JSONB 혼합**

- **컬럼화된 항목** (인덱스·제약·타입 보장): `precision_level`, `batch_policy`, `retention_period_days`. 사용자가 직접 지정하고, `precision_level` 등은 인덱스·필터에 활용 가능.
- **settings_data (JSONB)**: `dna` 세부, `quantization_rules`, 그 외 확장 설정. **밸런스 적용:** `current_coil_template_id` (UUID) — 적용 중인 템플릿을 가리키며 `balance_coil_templates.template_id` 참조. 시스템 또는 본 프로젝트가 만든 템플릿 중 하나만 선택. 유연하지만 "인덱스·제약 불가" — DB가 내부 키를 모르므로, 특정 키 검색은 풀 스캔·앱 검증 의존. JSON 스키마로 앱 레벨 검증 권장.

### 2단계: 자원 및 탐색 구조 (No. 4 ~ 10)

```sql
-- 4. 프로젝트 일반 자원 (문서, 코드 등)
-- 4. 프로젝트 일반 자원 (문서, 시방서, 코드 등). §2.9 시방서→컨트롤러 강결합
CREATE TABLE project_assets (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    file_id UUID, -- files 테이블 참조
    nature_tag VARCHAR(32),  -- 'RULE': 실행 가이드라인(시방서). 단순 기록이 아닌 규칙 성격 명시
    metadata JSONB,          -- embedded_panels: 문서 내 컨트롤러 배치 좌표·panel_id 배열
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON COLUMN project_assets.nature_tag IS 'RULE=시방서/실행 가이드라인. DDL-00 §2.9.1';
COMMENT ON COLUMN project_assets.metadata IS 'embedded_panels: [{ position, panel_id }] 문서 내 컨트롤러 배치 동기화. DDL-00 §2.9.4';

-- 5. 멀티미디어 자원
CREATE TABLE project_media (
    media_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    media_type TEXT,
    file_id UUID,
    processing_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 시맨틱 태그 정보 (tag_vector nullable: 중요 태그에만 벡터 생성)
CREATE TABLE project_tags (
    tag_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    tag_vector VECTOR(1536),           -- nullable. 중요 태그에만 임베딩 생성
    vector_search_status SMALLINT DEFAULT 1,    -- 벡터 검색 대상 여부. 1=검색가능, 0=제외. 그 외 값은 추후 규칙 정의
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 시스템 감사 및 AI 제안 로그 (현재/이력 레이어. TimescaleDB 하이퍼테이블)
-- 목표: DB 레벨에서 5W1H SMALLINT 필터로 90% 데이터 즉시 제거 후 추론. [문서 2] HEXAGON 프로토콜.
-- ⚠ 토큰(SMALLINT) 매핑 및 벡터(embedding) 생성 모델은 반드시 고정. 모델을 변경하면 기존 데이터는 동일한 의미 공간으로 해석·비교할 수 없음(해독 불가). 기본 채택: 5W1H 토큰→정수 매핑은 앱/명세 유지, 임베딩은 [NEXA-SYSTEM] AI 오케스트레이터 기준 Ollama nomic-embed-text. VECTOR 차원은 채택 모델 출력과 일치해야 함.
CREATE TABLE project_logs (
    log_id UUID DEFAULT uuid_generate_v7(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 5W1H 토큰 (SMALLINT. nullable. 점진적 채움)
    where_scope SMALLINT,         -- Where: CORE, FIELD, DOMAIN 등 영향 범위
    when_tempo SMALLINT,          -- When: MOMENT, DURATION, ERA 등 시간적 맥락
    who_pulse SMALLINT,           -- Who: WILL, ECHO, TICK, ASK 등 동력원
    what_intent SMALLINT,         -- What: FACT, LINK, RULE 등 데이터 성격
    how_state SMALLINT,           -- How: FLOW, STUCK, VOID 등 동태적 상태
    why_causality SMALLINT,       -- Why: 6코일 필터 거친 판단 카테고리
    -- 지능형 서사
    summary TEXT,                 -- Indicator Insight: TTS용 부드러운 조언 문장
    why_chain JSONB,              -- 6코일 가중치 및 판단 인과관계 사슬
    -- 신뢰도 (Confidence Score)
    confidence_score SMALLINT,    -- 0~100. TICK/ECHO/WILL/ASK 주체별 확신도. [데이터 신뢰도 초안 §1]
    -- 물리/보안
    is_time_synced BOOLEAN,       -- 로그 시점 NTP 동기화 여부 (신뢰도 검증)
    last_sync_at TIMESTAMPTZ,     -- 발신측 마지막 NTP 동기화 시각
    -- 저장/검색
    embedding VECTOR(1536),       -- nullable. 유사 이력 검색용 (채워진 행만 인덱스 권장)
    extra_data JSONB,             -- 정밀 센서 수치, 원문 로그, log_level 등 비정형 상세
    PRIMARY KEY (log_id, created_at)
);
SELECT create_hypertable('project_logs', 'created_at');

-- 8. 자원 버전 이력 (Commit)
CREATE TABLE project_resource_versions (
    version_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    resource_type TEXT,
    version_data JSONB,
    commit_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 계층적 폴더 구조 (Yjs 적용. yjs_state = 압축된 스냅샷만 저장, 증분은 project_yjs_updates)
CREATE TABLE project_folders (
    folder_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    parent_id UUID REFERENCES project_folders(folder_id),
    folder_name TEXT NOT NULL,
    yjs_state BYTEA,   -- 특정 시점의 압축된 스냅샷(Compacted Snapshot)만. 증분 업데이트는 project_yjs_updates에 적재
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 외부 참조 링크 관리
CREATE TABLE project_links (
    link_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    crawl_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. 최종 생산물 버전 및 전시 (project_resource_versions와 연동)
CREATE TABLE project_releases (
    release_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    version_id UUID REFERENCES project_resource_versions(version_id) ON DELETE SET NULL,
    version_tag TEXT NOT NULL,
    release_metadata JSONB,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

```

### 3단계: AI 오케스트라 및 지식 (No. 11 ~ 14)

```sql
-- 11. AI 페르소나 및 스킬 정의
CREATE TABLE project_orchestra (
    orchestra_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    persona_config JSONB,
    skill_set JSONB,
    skill_threshold JSONB,  -- 스킬 자율 실행을 위한 최소 신뢰도 임계값 설정 (예: {\"tool_x\": 80}). [데이터 신뢰도 초안 §1]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI 대화 히스토리
CREATE TABLE project_chats (
    chat_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    messages JSONB,
    context_summary TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AI 에이전트 작업 세션 (휘발성: Thinking/Tool Calling 등 실시간 상태, 빈번한 쓰기 → UNLOGGED + TTL)
CREATE UNLOGGED TABLE project_agent_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    current_action TEXT,
    temp_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW()
);
-- TTL 정책: last_active 기준 24시간 경과 행은 주기적 삭제 권장 (아래는 관리 로직 예시).
-- 스케줄러(pg_cron 등) 또는 애플리케이션에서 주기 실행:
--   DELETE FROM project_agent_sessions WHERE last_active < NOW() - INTERVAL '24 hours';

-- 30. 사용자 존재(Presence) — 폴더/노드 화면별 "지금 누가 보고 있는가" 협업 가시성. UNLOGGED
CREATE UNLOGGED TABLE project_user_presence (
    presence_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    resource_type TEXT NOT NULL,         -- 'folder', 'node' 등
    resource_id UUID NOT NULL,           -- project_folders.folder_id 또는 project_nodes.node_id
    activity TEXT DEFAULT 'viewing',     -- 'viewing', 'editing' 등
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- TTL: last_active 기준 일정 시간(예: 5~10분) 미갱신 행은 주기 삭제 권장. 하트비트 갱신은 앱에서 수행.

-- 14. RAG용 지식 본문 및 벡터 (과거/지식 레이어). §2.9 시방서→지식: nature_tag=RULE로 실행 가이드라인 활용
-- 목표: DB 레벨에서 5W1H SMALLINT 필터로 90% 데이터 즉시 제거 후 벡터 검색. [문서 2] HEXAGON, [문서 5] Nature 수명 주기.
-- ⚠ 토큰(SMALLINT) 매핑 및 embedding 생성 모델은 고정. 모델 변경 시 기존 벡터는 해독·유사도 비교 불가. 기본 채택 임베딩 모델: Ollama nomic-embed-text (AI 오케스트레이터). VECTOR(n) 차원은 해당 모델 출력과 일치해야 함.
CREATE TABLE project_knowledge (
    knowledge_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- 성격·수명 주기 [문서 5]. RULE=시방서 핵심 제원(실행 가이드라인) 장기 기억·RAG 활용. DDL-00 §2.9.4
    nature_tag VARCHAR(32),       -- ROUTINE, INCIDENT, INTENT, RULE(시방서 기반 실행 규칙 지식)
    -- 5W1H 토큰 (SMALLINT. nullable. 완전 분리로 고속 정수 인덱싱)
    where_scope SMALLINT,         -- Where: CORE, FIELD, DOMAIN
    when_tempo SMALLINT,          -- When: MOMENT, DURATION, ERA
    who_pulse SMALLINT,           -- Who: WILL, ECHO, TICK, ASK 등
    what_intent SMALLINT,         -- What: FACT, LINK, RULE
    how_state SMALLINT,           -- How: FLOW, STUCK, VOID
    why_causality SMALLINT,       -- Why: 인과·판단 카테고리
    -- RAG 핵심
    content_fact TEXT,            -- Sentinel Fact: AI가 즉시 소화할 담백한 요약 문장
    raw_content TEXT,             -- 원문 전체 (보존·재가공용)
    embedding VECTOR(1536),       -- nullable. 코사인 유사도 기반 의미론적 검색
    vector_search_status SMALLINT DEFAULT 1,  -- 1=검색가능, 0=제외. 확장 가능
    -- 인과·메타
    ref_ids JSONB,                -- Traceability: SNT-IND-EFF 참조 ID 사슬
    metadata JSONB,               -- 출처 URL, 생성 모델, 6코일 가중치 등
    confidence_score SMALLINT,    -- 0~100. 아톰화된 지식의 검증 수준. RAG 시 가중치·필터에 활용. [데이터 신뢰도 초안 §1]
    extra_data JSONB              -- 그 외 비정형 상세 (유연성)
);

```

### 4단계: 노드 로직 및 하드웨어 인프라 (No. 15 ~ 22)

```sql
-- 15. 노드 기반 IoT 로직 (Vue Flow/Yjs. yjs_state = 압축된 스냅샷만, 증분은 project_yjs_updates)
CREATE TABLE project_nodes (
    node_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    flow_data JSONB,
    yjs_state BYTEA,   -- 압축된 스냅샷만 저장. 증분 업데이트는 project_yjs_updates에 적재
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. Yjs 증분 업데이트 로그 (단일 필드 덮어쓰기 대신 변경 이력 행 단위 적재. 서버 병합·스냅샷 전략용)
-- 전략 상세: 명세서 v5.0 §2.2 이력 기반 증분 저장 및 스냅샷 (Redis 배치, Node.js 병합, Web Worker, NTP 보정)
CREATE TABLE project_yjs_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,    -- 'folder' | 'node'
    resource_id UUID NOT NULL,      -- project_folders.folder_id 또는 project_nodes.node_id
    update_data BYTEA NOT NULL,     -- Yjs 업데이트 바이너리
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_project_yjs_updates_resource ON project_yjs_updates(project_id, resource_type, resource_id, created_at);

-- 16. 가변 비즈니스 스크립트
CREATE TABLE project_scripts (
    script_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    code_content TEXT,
    bytecode BYTEA,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. 가상 시뮬레이션 결과
CREATE TABLE project_simulations (
    simulation_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    scenario_data JSONB,
    result_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. 활성화된 위젯(Panel) 목록
-- 18. 컨트롤러(넥사패널). §2.9 시방서→컨트롤러 강결합·오케스트레이터 연동
CREATE TABLE project_panels (
    panel_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    ref_asset_id UUID REFERENCES project_assets(asset_id) ON DELETE SET NULL,
    widget_configs JSONB,
    sequence_data JSONB,     -- 시방서에서 추출된 실행 순서·파라미터·안전 임계치(Interlock)
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON COLUMN project_panels.ref_asset_id IS '이 컨트롤러의 모태 시방서(Asset) 역추적. DDL-00 §2.9.4';
COMMENT ON COLUMN project_panels.sequence_data IS '실행 순서(Sequence), 제원, Interlock 등 시방서 기반 매핑. DDL-00 §2.9.4';

-- 19. 대시보드 레이아웃 프리셋
CREATE TABLE project_boards (
    board_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    layout_data JSONB,
    is_default BOOLEAN DEFAULT false
);

-- 20. 할당 장치 및 상태 관리 (3단계 펌웨어 배포 상태: Core → Model → Script)
CREATE TABLE project_devices (
    project_device_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    device_reg_id UUID, -- device_registry 참조, 참조 무결성 보강에서 FK
    status TEXT,
    last_ping TIMESTAMPTZ,
    -- 배포된 펌웨어/로직 버전 조합 (AI 배포 오류 진단용)
    core_fw_id UUID,       -- 현재 탑재된 시스템 펌웨어 (firmwares_core), 참조 무결성 보강에서 FK
    model_hw_id UUID,      -- 현재 탑재된 하드웨어 모델 펌웨어 (firmwares_model), 참조 무결성 보강에서 FK
    script_id UUID REFERENCES project_scripts(script_id) ON DELETE SET NULL  -- 현재 실행 중인 로직 (project_scripts)
);

-- 21. 네트워크 논리/물리 연결 맵
CREATE TABLE project_network_topology (
    topology_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    connection_data JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. 동작 시퀀스 녹화/자동화
CREATE TABLE project_traces (
    trace_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    sequence_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

```

### 5단계: 프로젝트 실행 계획 및 확장 (No. 23 ~ 26)

```sql
-- 23. 문제 정의 및 솔루션 기획
CREATE TABLE project_solutions (
    solution_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    problem_definition TEXT,
    vision_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. 업무 일정 및 ERP 마일스톤
CREATE TABLE project_tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT,
    due_date TIMESTAMPTZ,
    erp_metadata JSONB
);

-- 29. 장기 실행 작업(Job) 상태 — FFmpeg/RAG 임베딩/펌웨어 빌드 등 백그라운드 작업 진행률 추적, 재접속 시 UI 표시용
CREATE TABLE project_jobs (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,              -- 'ffmpeg_encode', 'rag_embedding', 'firmware_build' 등
    status TEXT NOT NULL DEFAULT 'Pending',  -- Pending, Running, Completed, Failed, Cancelled
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_msg TEXT,                     -- Failed 시 오류 메시지
    initiated_by UUID,                  -- 작업을 시작한 사용자(선택)
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    metadata JSONB,                     -- 입출력 참조(file_id, asset_id 등)·작업별 파라미터
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. BOM(부품 명세) — AI 시맨틱 브릿지: 웹 서치·기획 문서와 규격 템플릿 간 시맨틱 매핑 저장소. 설계-재고-출고 연동
CREATE TABLE project_parts_bom (
    bom_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    part_model_id UUID,             -- part_models 참조 (어떤 부품 타입이 필요한가)
    spec_id UUID,                   -- part_specs 참조. AI가 샌드박스에서 재고 상태와 설계 요구사항을 대조해 할당하는 동적 필드(실물 참조). NULL이면 미할당
    spec_snapshot JSONB,
    ai_validation_status TEXT,
    quantity INTEGER DEFAULT 1
);

-- 26. 플러그인 및 외부 API 연동
CREATE TABLE project_extensions (
    extension_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    plugin_name TEXT NOT NULL,
    extension_config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

```

---

### 6단계 project_secrets (프로젝트 비밀 정보)

외부 API 키(OpenAI 등)나 사용자 프로젝트만의 자격 증명을 안전하게 보관하는 테이블. **저장되는 값은 반드시 암호문만 저장**하며, DB 직접 조회 시에도 평문이 노출되지 않도록 BYTEA(또는 암호화된 텍스트)로 명시한다.

```sql
CREATE TABLE project_secrets (
    secret_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    -- 암호문만 저장: BYTEA(애플 AES-256-GCM 결과 또는 pgcrypto 암호문). 평문 저장 금지.
    encrypted_value BYTEA NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 보안 가이드: 아래 7·8단계에서 RLS 및 정책 적용. 암호화 방식은 아래 「project_secrets 암호화 방식 명세」 참조.
```

---

### project_secrets 암호화 방식 명세

관리자가 DB를 직접 조회해도 평문이 노출되지 않도록, **저장 필드는 BYTEA 또는 암호화된 텍스트만 허용**하며, 애플리케이션 레벨과 DB 레벨을 이중으로 적용한다.

| 구분                  | 내용                                                                                                                                                                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **저장 타입**         | `encrypted_value`는 **BYTEA**로 정의. 평문 TEXT 저장 금지. 애플리케이션에서 암호문 바이너리 또는 pgcrypto 출력을 그대로 저장한다.                                                                                                                                                                                  |
| **애플리케이션 레벨** | **AES-256-GCM** 등 대칭 암호로 자격 증명을 암호화한 뒤 DB에 전달. 암호화 키는 서버 환경 변수(예: `SECRETS_ENCRYPTION_KEY`)에만 보관하고, 복호화는 API 서버만 수행한다.                                                                                                                                             |
| **DB 레벨 (선택)**    | **pgcrypto** 확장으로 컬럼을 한 번 더 보호할 수 있다. 예: 애플리케이션이 `pgp_sym_encrypt(plaintext, current_setting('app.encryption_key'))`로 삽입하고, 조회 시 `pgp_sym_decrypt(encrypted_value::bytea, ...)`로 복호화. 키는 세션/트랜잭션마다 앱이 `SET LOCAL`로 주입하거나, DB 역할별로 제한된 키 정책을 둔다. |
| **권장**              | 1) 앱에서 AES-256-GCM 암호문을 BYTEA로 저장하고, 2) 필요 시 pgcrypto로 동일 컬럼을 한 번 더 암호화하는 이중 레이어 구성을 권장한다.                                                                                                                                                                                |

```sql
-- pgcrypto 사용 예시 (선택): 암호화 키는 애플리케이션에서 SET LOCAL로 주입 후 사용
-- INSERT: encrypted_value := pgp_sym_encrypt('평문비밀값', current_setting('app.encryption_key'));
-- SELECT: pgp_sym_decrypt(encrypted_value, current_setting('app.encryption_key')) AS decrypted;
-- 확장은 §0에서 CREATE EXTENSION pgcrypto; 로 로드됨.
```

---

### 7단계: 프로젝트 테이블 인덱스 (project_id)

```sql
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_settings_project_id ON project_settings(project_id);
CREATE INDEX idx_project_assets_project_id ON project_assets(project_id);
CREATE INDEX idx_project_media_project_id ON project_media(project_id);
CREATE INDEX idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX idx_project_logs_project_id ON project_logs(project_id);
-- HEXAGON(5W1H) SMALLINT 필터: DB 레벨 90% 필터링 후 추론 (감사·유사 이력 검색)
CREATE INDEX idx_project_logs_hexagon ON project_logs(project_id, where_scope, when_tempo) WHERE where_scope IS NOT NULL;
CREATE INDEX idx_project_resource_versions_project_id ON project_resource_versions(project_id);
CREATE INDEX idx_project_folders_project_id ON project_folders(project_id);
CREATE INDEX idx_project_links_project_id ON project_links(project_id);
CREATE INDEX idx_project_orchestra_project_id ON project_orchestra(project_id);
CREATE INDEX idx_project_chats_project_id ON project_chats(project_id);
CREATE INDEX idx_project_agent_sessions_project_id ON project_agent_sessions(project_id);
CREATE INDEX idx_project_user_presence_project_id ON project_user_presence(project_id);
CREATE INDEX idx_project_user_presence_resource ON project_user_presence(project_id, resource_type, resource_id);
CREATE INDEX idx_project_knowledge_project_id ON project_knowledge(project_id);
-- HEXAGON(5W1H) SMALLINT 필터: DB 레벨 90% 필터링 후 벡터 검색
CREATE INDEX idx_project_knowledge_hexagon ON project_knowledge(project_id, where_scope, when_tempo, why_causality) WHERE where_scope IS NOT NULL;
CREATE INDEX idx_project_nodes_project_id ON project_nodes(project_id);
CREATE INDEX idx_project_yjs_updates_project_id ON project_yjs_updates(project_id);
CREATE INDEX idx_project_scripts_project_id ON project_scripts(project_id);
CREATE INDEX idx_project_simulations_project_id ON project_simulations(project_id);
CREATE INDEX idx_project_panels_project_id ON project_panels(project_id);
CREATE INDEX idx_project_panels_ref_asset_id ON project_panels(ref_asset_id);
CREATE INDEX idx_project_boards_project_id ON project_boards(project_id);
CREATE INDEX idx_project_devices_project_id ON project_devices(project_id);
CREATE INDEX idx_project_devices_core_fw_id ON project_devices(core_fw_id);
CREATE INDEX idx_project_devices_model_hw_id ON project_devices(model_hw_id);
CREATE INDEX idx_project_devices_script_id ON project_devices(script_id);
CREATE INDEX idx_project_network_topology_project_id ON project_network_topology(project_id);
CREATE INDEX idx_project_traces_project_id ON project_traces(project_id);
CREATE INDEX idx_project_solutions_project_id ON project_solutions(project_id);
CREATE INDEX idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX idx_project_jobs_project_id ON project_jobs(project_id);
CREATE INDEX idx_project_jobs_status_created ON project_jobs(project_id, status, created_at DESC);
CREATE INDEX idx_project_parts_bom_project_id ON project_parts_bom(project_id);
CREATE INDEX idx_project_parts_bom_spec_id ON project_parts_bom(spec_id);
CREATE INDEX idx_project_extensions_project_id ON project_extensions(project_id);
CREATE INDEX idx_project_secrets_project_id ON project_secrets(project_id);
CREATE INDEX idx_project_releases_project_id ON project_releases(project_id);
```

---

### 8단계: 프로젝트 테이블 RLS (Row Level Security)

모든 프로젝트 귀속 테이블에 RLS를 켜고, `current_setting('app.current_user_id')`로 프로젝트 멤버만 접근하도록 정책을 둔다. 세션 변수는 API 레이어에서 설정한다.

```sql
-- RLS 활성화 (31개 테이블)
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

-- 정책: 프로젝트 멤버만 해당 프로젝트 행 접근 (공통 패턴)
-- projects: 멤버인 프로젝트만 조회
CREATE POLICY project_member_projects ON projects FOR ALL
  USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));

-- project_members: 현재 사용자는 자신의 멤버십 행만 조회 (RLS 재귀 방지)
CREATE POLICY project_member_members ON project_members FOR ALL
  USING (user_id = (current_setting('app.current_user_id', true)::uuid));

CREATE POLICY project_member_settings ON project_settings FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_assets ON project_assets FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_media ON project_media FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_tags ON project_tags FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_logs ON project_logs FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_resource_versions ON project_resource_versions FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_folders ON project_folders FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_links ON project_links FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_orchestra ON project_orchestra FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_chats ON project_chats FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_agent_sessions ON project_agent_sessions FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_user_presence ON project_user_presence FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_knowledge ON project_knowledge FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_nodes ON project_nodes FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_yjs_updates ON project_yjs_updates FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_scripts ON project_scripts FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_simulations ON project_simulations FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_panels ON project_panels FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_boards ON project_boards FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_devices ON project_devices FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_network_topology ON project_network_topology FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_traces ON project_traces FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_solutions ON project_solutions FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_tasks ON project_tasks FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_jobs ON project_jobs FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_parts_bom ON project_parts_bom FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_extensions ON project_extensions FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_secrets ON project_secrets FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY project_member_releases ON project_releases FOR ALL USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));

-- 밸런스(가중치) 테이블: 시스템 행 읽기 전용, 사용자 행은 해당 프로젝트 멤버만 접근 (DDL-00 §1.1.x)
ALTER TABLE balance_coil_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_coil_templates ENABLE ROW LEVEL SECURITY;
-- SELECT: 시스템 행(project_id IS NULL) 전체 + 본인 프로젝트 사용자 행
CREATE POLICY balance_coil_def_select ON balance_coil_definitions FOR SELECT
  USING (project_id IS NULL OR project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY balance_coil_def_modify ON balance_coil_definitions FOR ALL
  USING (project_id IS NOT NULL AND project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)))
  WITH CHECK (project_id IS NOT NULL AND project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY balance_coil_tpl_select ON balance_coil_templates FOR SELECT
  USING (project_id IS NULL OR project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
CREATE POLICY balance_coil_tpl_modify ON balance_coil_templates FOR ALL
  USING (project_id IS NOT NULL AND project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)))
  WITH CHECK (project_id IS NOT NULL AND project_id IN (SELECT project_id FROM project_members WHERE user_id = (current_setting('app.current_user_id', true)::uuid)));
```

---

✨ **전체 구조 완결성 검토**

- **보안 격리**: `project_secrets`를 포함한 모든 프로젝트 귀속 테이블은 `project_id`를 외래키로 가져 RLS를 통한 데이터 격리가 가능함.
- **버전 관리**: `project_releases`는 프로젝트의 긴 여정(설계-제안-실행)의 최종 마무리를 담당하며 `/portfolio` 라우터와 연결.
- **휘발성 세션**: `project_agent_sessions`(No. 13)는 UNLOGGED 테이블이며, TTL 24시간 정책을 관리 로직으로 적용한다(아래 참조).
- **사용자 존재(Presence)**: `project_user_presence`(No. 30)는 UNLOGGED로, 폴더/노드별 현재 접속 사용자·활동 상태를 저장하여 UI에 "A님이 이 노드를 수정 중입니다" 등 협업 가시성을 제공한다. last_active 기준 주기 삭제 권장.

---

### project_agent_sessions TTL 정책 (관리 로직)

AI 에이전트의 '생각 중(Thinking)', '도구 호출(Tool Calling)' 등 실시간 상태는 쓰기 빈도가 높고 수명이 짧은 휘발성 데이터이므로, 아래를 권장한다.

| 구분          | 내용                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **DDL**       | `CREATE UNLOGGED TABLE`로 WAL 로깅을 생략하여 쓰기 성능 최적화. 장애 시 해당 테이블 데이터는 복구되지 않음(휘발성 전제). |
| **TTL**       | `last_active` 기준 **24시간** 경과 행을 주기적으로 삭제. Postgres DDL만으로 자동 삭제는 불가하므로 스케줄 작업으로 실행. |
| **실행 주기** | pg_cron(또는 외부 스케줄러)으로 예: 매시 정각 또는 6시간마다 아래 SQL 실행 권장.                                         |

```sql
-- TTL 정책 실행 예시 (24시간 경과 세션 삭제)
DELETE FROM project_agent_sessions WHERE last_active < NOW() - INTERVAL '24 hours';
```

---

✨ **참고 사항**

- **UUID v7**: 명세서의 기술 스택에 따라 정렬 가능한 `uuid_generate_v7()`을 기본 키로 사용했습니다. 엣지 RTC가 NTP 미동기화면 정렬이 꼬일 수 있으므로, `device_registry`·`project_logs`에 **is_time_synced**·**last_sync_at**·**last_ntp_sync_at**으로 시간 동기화 여부 메타데이터를 저장해 정렬 신뢰성을 확보합니다.
- **참조 무결성**: `ON DELETE CASCADE`를 적용하여 프로젝트 삭제 시 하위 데이터가 함께 정리되도록 구성했습니다.
- **JSONB & pgvector**: 동적 데이터 확장을 위한 JSONB와 AI 검색을 위한 pgvector 타입을 명세서 기준에 맞춰 배치했습니다.
- **TimescaleDB**: 로그성 데이터인 `project_logs`에는 하이퍼테이블 설정을 추가했습니다.
- **UNLOGGED·TTL**: `project_agent_sessions`는 쓰기 최적화를 위해 UNLOGGED 테이블이며, `last_active` 기준 24시간 TTL 삭제를 관리 로직(스케줄)으로 적용한다.

---

명세서 v5.0의 **1.1 프로젝트 비귀속 플랫폼 테이블 (27개)** 리스트를 바탕으로, 번호 순서에 맞춘 DDL 스크립트를 작성합니다. 이 테이블들은 특정 프로젝트에 종속되지 않고 플랫폼 전체에서 참조되는 전역 자원·Capability/Tier·사용자 기능 자격 추천용 데이터입니다.

---

# ✨ **1.1 플랫폼 비귀속 테이블 DDL (No. 1 ~ No. 27)**

---

### 1단계: 표준 컴포넌트 및 레시피 (No. 1 ~ 6)

플랫폼 전역에서 공유되는 위젯, 노드, 문서 및 자동화 템플릿 정의입니다.

```sql
-- 1. 위젯(Panel) 원형 정의
CREATE TABLE panel_components (
    component_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    component_name TEXT NOT NULL,
    ui_definition JSONB, -- UI 구성 및 스타일 정보
    source_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 표준 노드 규격 정의
CREATE TABLE node_definitions (
    node_def_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    node_type TEXT NOT NULL,
    properties_schema JSONB, -- 노드 속성 정의
    icon_data TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 문서 표준 레이아웃 템플릿
CREATE TABLE document_templates (
    template_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    template_name TEXT NOT NULL,
    layout_json JSONB, -- AI가 채워넣을 문서 구조
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 표준 프로토콜 명세 (MQTT, ESPHome 등)
CREATE TABLE protocol_manifests (
    protocol_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    protocol_name TEXT NOT NULL,
    manifest_data JSONB, -- 통신 규격 및 설정 프리셋
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 자동화 로직 모범 사례 (레시피)
CREATE TABLE automation_recipes (
    recipe_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    title TEXT NOT NULL,
    logic_flow JSONB,
    description TEXT,
    usage_count INTEGER DEFAULT 0
);

-- 6. 오케스트라 설정 공유 저장소 (스코어)
CREATE TABLE orchestra_scores (
    score_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    persona_config JSONB,
    skill_definitions JSONB,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

```

### 2단계: 펌웨어 및 기기 레지스트리 (No. 7 ~ 9)

하드웨어의 물리적 특성과 기기 라이프사이클을 관리하는 핵심 인프라 영역입니다.

```sql
-- 7. 시스템 코어 펌웨어 (최하위 레이어)
CREATE TABLE firmwares_core (
    core_fw_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    version_tag TEXT NOT NULL,
    binary_data BYTEA, -- OTA용 바이너리
    checksum TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 하드웨어 모델별 물리 설정
CREATE TABLE firmwares_model (
    model_hw_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    model_name TEXT UNIQUE,
    pin_map_yaml TEXT, -- 핀 맵 설정 (YAML)
    safety_guardrails JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 기기 최초 등록 및 관리 시작점 (UUID v7/시간 정렬 신뢰를 위한 NTP 검증 필드)
CREATE TABLE device_registry (
    device_reg_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    serial_number TEXT UNIQUE NOT NULL,
    model_hw_id UUID REFERENCES firmwares_model(model_hw_id),
    mac_address TEXT,
    initial_owner_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_time_synced BOOLEAN,       -- 등록·갱신 시점에 기기 RTC가 NTP 동기화되었는지
    last_ntp_sync_at TIMESTAMPTZ  -- 기기가 마지막으로 NTP 동기화한 시각
);

```

### 3단계: 감사, 지표 및 마켓플레이스 (No. 10 ~ 13)

플랫폼 운영 상태를 모니터링하고 템플릿의 품질을 관리하는 지표 데이터입니다.

```sql
-- 10. 플랫폼 전역 감사 로그 (TimescaleDB: PK에 created_at 포함)
CREATE TABLE platform_audit_logs (
    audit_id UUID DEFAULT uuid_generate_v7(),
    event_type TEXT,
    actor_id UUID,
    resource_path TEXT,
    status_code INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (audit_id, created_at)
);
SELECT create_hypertable('platform_audit_logs', 'created_at');

-- 11. API 호출 통계 (TimescaleDB: PK에 created_at 포함)
CREATE TABLE api_usage_stats (
    stat_id UUID DEFAULT uuid_generate_v7(),
    api_endpoint TEXT,
    call_count INTEGER DEFAULT 1,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (stat_id, created_at)
);
SELECT create_hypertable('api_usage_stats', 'created_at');

-- 12. 템플릿 및 컴포넌트 리뷰
CREATE TABLE template_reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    target_id UUID NOT NULL, -- panel_components 등 참조
    user_id UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. 템플릿 다운로드 및 인기도 지표
CREATE TABLE usage_metrics (
    metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    target_id UUID NOT NULL,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

```

### 4단계: 지원 및 인프라 설정 (No. 14 ~ 16)

사용자 지원 및 플랫폼 물리 저장소 백엔드 정의입니다.

```sql
-- 14. 플랫폼 사용법 FAQ (RAG용. faq_vector nullable)
CREATE TABLE support_faq (
    faq_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    faq_vector VECTOR(1536),           -- nullable. AI 상담 연계용
    vector_search_status SMALLINT DEFAULT 1,    -- 벡터 검색 대상. 1=검색가능, 0=제외. 그 외 값은 추후 규칙 정의
    category TEXT
);

-- 15. AI 챗 상담 이력 (TimescaleDB: PK에 created_at 포함)
CREATE TABLE ai_consultation_logs (
    consult_id UUID DEFAULT uuid_generate_v7(),
    user_id UUID,
    query_text TEXT,
    ai_response TEXT,
    insight_tags JSONB, -- 가이드 개선용 분석 태그
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (consult_id, created_at)
);
SELECT create_hypertable('ai_consultation_logs', 'created_at');

-- 16. 플랫폼 지원 저장소 백엔드 정의
CREATE TABLE storage_configs (
    storage_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    storage_name TEXT NOT NULL,
    backend_type TEXT, -- 'S3', 'Local', 'Azure' 등
    connection_info JSONB,
    quota_bytes BIGINT,           -- 저장소별 기본 할당량(바이트). projects.storage_quota_bytes가 NULL일 때 참조 가능
    is_active BOOLEAN DEFAULT true
);

-- 17. 글로벌 라이브러리 태그 (마켓플레이스 자산용 시맨틱 태그. tag_vector nullable)
CREATE TABLE global_tags (
    tag_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    tag_name TEXT NOT NULL,
    tag_vector VECTOR(1536),           -- nullable. pgvector 유사도 검색용
    vector_search_status SMALLINT DEFAULT 1,    -- 벡터 검색 대상. 1=검색가능, 0=제외. 그 외 값은 추후 규칙 정의
    category TEXT,                    -- 태그 카테고리(선택)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. 글로벌 지식 베이스 (마켓 자산 검색용. embedding nullable)
CREATE TABLE global_knowledge_base (
    entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    content_type TEXT NOT NULL,   -- 'orchestra_score', 'panel_component', 'document_templates' 등
    content_id UUID NOT NULL,     -- 해당 자산 테이블의 PK
    content_text TEXT,            -- 검색 대상 요약/설명
    embedding VECTOR(1536),       -- nullable. content_text 기반 임베딩. 중요 데이터에만 생성
    vector_search_status SMALLINT DEFAULT 1,    -- 벡터 검색 대상. 1=검색가능, 0=제외. 그 외 값은 추후 규칙 정의
    metadata JSONB,               -- tag_ids[], 작성자, 카테고리 등
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_global_knowledge_base_content ON global_knowledge_base(content_type, content_id);
-- 벡터 컬럼(embedding) 인덱스는 §「pgvector 인덱스 및 성능 최적화 가이드」에서 HNSW(기본)·IVFFlat(선택)로 통합 정의

```

---

### 9단계: Capability 및 인가 (No. 19 ~ 27) — 명세서 v5.0

[NEXA-DDL-00] v5.0·[NEXA-CAPABILITY-01] 기준. **사용자 기능 자격(User Capability)** 의 `capability_id`는 접두사 **`usr.`** 로 시작해야 하며, DB CHECK constraint 및 API 밸리데이터에서 강제한다.

```sql
-- 19. 회원 서비스 등급 (Tier)
CREATE TABLE tiers (
    tier_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. 기능 자격(Capability) 메타데이터 — 코드 레지스트리 동기화
-- 사용자 기능 자격: capability_id는 반드시 'usr.' 접두사로 시작 (DB CHECK + API 검증)
CREATE TABLE capabilities (
    capability_id VARCHAR(200) PRIMARY KEY,  -- ID 자체가 PK (예: nexa.platform.archive.hub, usr.persona.chat)
    label VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50),                    -- domain / menu / action / user
    parent_id VARCHAR(200) REFERENCES capabilities(capability_id),
    source VARCHAR(50) NOT NULL,         -- 'registry' (코드 동기화) / 'manual' (사용자 정의)
    status VARCHAR(20) DEFAULT 'active', -- active / inactive (Soft Delete)
    sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- 사용자 기능 자격(사용자 역량) 접두사 강제: source='manual' 이거나 type='user' 일 때 capability_id는 'usr.'로 시작
    CONSTRAINT chk_user_capability_prefix
        CHECK (source != 'manual' OR capability_id LIKE 'usr.%'),
    CONSTRAINT chk_user_capability_type_prefix
        CHECK (type IS NULL OR type != 'user' OR capability_id LIKE 'usr.%')
);
COMMENT ON CONSTRAINT chk_user_capability_prefix ON capabilities IS '사용자 기능 자격 접두사 강제: source=manual 이면 capability_id는 usr. 로 시작. API 밸리데이터에서도 동일 규칙 적용.';
COMMENT ON CONSTRAINT chk_user_capability_type_prefix ON capabilities IS 'type=user 이면 capability_id는 usr. 로 시작. API: /api/capabilities, capability_proposals 등 생성·수정 시 검증 필수.';

-- 21. Tier별 허용 기능 자격
CREATE TABLE tier_allowed_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    tier_id UUID NOT NULL REFERENCES tiers(tier_id) ON DELETE CASCADE,
    capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID,
    UNIQUE(tier_id, capability_id)
);
CREATE INDEX idx_tier_allowed_capabilities_tier ON tier_allowed_capabilities(tier_id);

-- 22. 발급·폐기 이력 (보안 감사)
CREATE TABLE capability_grant_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    tier_id UUID REFERENCES tiers(tier_id),
    capability_id VARCHAR(200) REFERENCES capabilities(capability_id),
    action VARCHAR(20) NOT NULL,  -- grant / revoke
    actor_id UUID NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_capability_grant_history_actor ON capability_grant_history(actor_id);
CREATE INDEX idx_capability_grant_history_created ON capability_grant_history(created_at);

-- 23. V8 Isolate 격리 환경 프로필
CREATE TABLE sandbox_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    name VARCHAR(100) NOT NULL,
    memory_limit_mb INTEGER,
    cpu_time_limit_ms INTEGER,
    timeout_sec INTEGER,
    allowed_modules JSONB,
    scope_type VARCHAR(50),   -- project / script / global
    scope_id UUID,            -- project_id, script_id 등 (scope_type에 따라)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. 샌드박스 프로필별 상속 기능 자격 — 스크립트 실행 시 권한 컨텍스트
-- 격리 환경 내 스크립트가 기기 제어·API 호출 시 상속할 Capability. 미매핑 시 권한 부족 또는 보안 홀.
CREATE TABLE sandbox_profile_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    profile_id UUID NOT NULL REFERENCES sandbox_profiles(profile_id) ON DELETE CASCADE,
    capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, capability_id)
);
CREATE INDEX idx_sandbox_profile_capabilities_profile ON sandbox_profile_capabilities(profile_id);
COMMENT ON TABLE sandbox_profile_capabilities IS '샌드박스 프로필 내 실행되는 스크립트가 상속하는 Capability. 오케스트레이터는 실행 전 이 목록을 조회해 격리 컨텍스트에 주입. 프로필 생성 시 기본 매핑 정의 권장.';

-- 25. AI 사용자 기능 자격 추천용 태그 화이트리스트
CREATE TABLE capability_tag_whitelist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    scope_key VARCHAR(100) NOT NULL,  -- 예: user_capability
    tag VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scope_key, tag)
);

-- 26. AI 추천 기능 자격·적합성 점수 (사후 승인)
-- status=rejected 시 자동 무효화: 거절 전 생성된 데이터·액션에 대한 롤백 또는 격리 워크플로 트리거
CREATE TABLE capability_proposals (
    proposal_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    target_entity_id UUID NOT NULL,  -- user_id 등
    capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id),
    fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
    request_context TEXT,
    status VARCHAR(20) DEFAULT 'pending',  -- pending / approved / rejected
    recommended_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,          -- 거절 시각. status=rejected 시 자동 무효화 Job 트리거용
    rejection_reason TEXT,            -- 거절 사유
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE capability_proposals IS 'AI 추천 기능 자격. status=rejected 전환 시 rejected_at·rejection_reason 저장 후, 해당 proposal_id로 생성된 엔티티에 대한 롤백·격리 자동 무효화 워크플로 실행 필수.';
COMMENT ON COLUMN capability_proposals.rejected_at IS '거절 시각. status=rejected 시 배치/이벤트 기반 자동 무효화 Job 트리거.';
CREATE INDEX idx_capability_proposals_target ON capability_proposals(target_entity_id);
CREATE INDEX idx_capability_proposals_status ON capability_proposals(status);

-- 27. API·라우트 경로 ↔ 필요 Capability 매핑 (코드 배포 없이 인가 정책 관리)
-- source: registry=코드 레지스트리 동기화(자동 갱신 대상), override=관리자 수동(동기화 시 덮어쓰지 않음)
CREATE TABLE capability_map (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    resource_type VARCHAR(50) NOT NULL,   -- api / route
    resource_path VARCHAR(500) NOT NULL,
    method VARCHAR(10),                   -- GET, POST 등 (NULL이면 전체)
    required_capability_id VARCHAR(200) NOT NULL REFERENCES capabilities(capability_id),
    source VARCHAR(50) DEFAULT 'registry', -- 'registry' (코드 동기화) / 'override' (관리자 수동)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_type, resource_path, method)
);
COMMENT ON COLUMN capability_map.source IS 'registry: 코드 레지스트리 선언 시 동기화로 자동 갱신. override: 관리자 수동 추가·수정, 동기화 시 덮어쓰지 않음.';
CREATE INDEX idx_capability_map_path ON capability_map(resource_type, resource_path);

-- 밸런스(가중치) — [문서 3] §5.4·§5.5, DDL-00 §1.1.x. 시스템·사용자 동일 테이블, project_settings는 적용만 저장.
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
CREATE UNIQUE INDEX idx_balance_coil_definitions_system_code ON balance_coil_definitions(code) WHERE project_id IS NULL;
CREATE UNIQUE INDEX idx_balance_coil_definitions_user_code ON balance_coil_definitions(project_id, code) WHERE project_id IS NOT NULL;
CREATE INDEX idx_balance_coil_definitions_origin_project ON balance_coil_definitions(origin, project_id);

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
COMMENT ON COLUMN balance_coil_templates.weight_spec IS '가중치 정의. 코일 code → 비율(0~100) 객체. 예: {"safety": 45, "stability": 45, "efficiency": 5, "autonomy": 2, "harmony": 2, "creative": 1}. 합=100 검증은 앱/트리거.';
COMMENT ON COLUMN balance_coil_templates.capability_id IS '[NEXA-CAPABILITY-01] 와일드카드(예: nexa.platform.archive.*) 저장 가능. 접두사 매칭으로 넓은 영역에 템플릿 적용.';
CREATE INDEX idx_balance_coil_templates_origin_project ON balance_coil_templates(origin, project_id);
CREATE INDEX idx_balance_coil_templates_capability ON balance_coil_templates(capability_id);
```

**사용자 기능 자격 접두사 `usr.` 강제 정책**

| 적용 위치     | 내용                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **DB**        | `capabilities` 테이블 CHECK: `source='manual'` 또는 `type='user'` 이면 `capability_id LIKE 'usr.%'`                                  |
| **API**       | POST/PUT `/api/capabilities`, `/api/capability-proposals` 등에서 요청 body의 `capability_id` 검증. `usr.` 접두사 미충족 시 400 반환. |
| **형식 예시** | `usr.persona.chat`, `usr.skill.export`, `usr.desk.dashboard`                                                                         |

---

### 참조 무결성 보강 (프로젝트 ↔ 비귀속 테이블)

비귀속 테이블 생성 후, 프로젝트 쪽에서 참조하는 FK를 추가한다. `files`, `part_models`는 별도 스키마에 있을 수 있으므로 동일 DB일 때만 FK 추가한다.

```sql
-- projects.storage_id → storage_configs (비귀속)
ALTER TABLE projects ADD CONSTRAINT fk_projects_storage
  FOREIGN KEY (storage_id) REFERENCES storage_configs(storage_id) ON DELETE SET NULL;

-- project_devices.device_reg_id → device_registry (비귀속)
ALTER TABLE project_devices ADD CONSTRAINT fk_project_devices_registry
  FOREIGN KEY (device_reg_id) REFERENCES device_registry(device_reg_id) ON DELETE SET NULL;
-- project_devices 3단계 펌웨어 배포 상태 (Core / Model / Script)
ALTER TABLE project_devices ADD CONSTRAINT fk_project_devices_core_fw
  FOREIGN KEY (core_fw_id) REFERENCES firmwares_core(core_fw_id) ON DELETE SET NULL;
ALTER TABLE project_devices ADD CONSTRAINT fk_project_devices_model_fw
  FOREIGN KEY (model_hw_id) REFERENCES firmwares_model(model_hw_id) ON DELETE SET NULL;

-- file_id, part_model_id, spec_id: files·part_models·part_specs가 동일 DB에 있으면 아래 주석 해제
-- ALTER TABLE project_assets ADD CONSTRAINT fk_project_assets_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL;
-- ALTER TABLE project_media ADD CONSTRAINT fk_project_media_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL;
-- ALTER TABLE project_parts_bom ADD CONSTRAINT fk_project_parts_bom_part FOREIGN KEY (part_model_id) REFERENCES part_models(id) ON DELETE SET NULL;
-- ALTER TABLE project_parts_bom ADD CONSTRAINT fk_project_parts_bom_spec FOREIGN KEY (spec_id) REFERENCES part_specs(id) ON DELETE SET NULL;  -- 실물 인스턴스(물리 위치). 설계-재고-출고 연동
```

---

### 저장소 할당량(Quota) 검증

`project_assets`·`project_media` INSERT 시 할당량 검증(트리거)·사용량 집계(함수·머티리얼라이즈드 뷰)는 **별도 문서**에서 관리한다.

→ **⭐ [NEXA-DDL-02] 저장소*할당량\_Quota*검증.md**

---

### pgvector 인덱스 및 성능 최적화 가이드 (RAG·시맨틱 검색)

AI 장기 기억(RAG)·시맨틱 검색에서 대규모 벡터 검색 성능을 보장하려면, 벡터 컬럼에 **인덱스**가 필요하다. 인덱스 없이 수만 건 이상에서 유사도 검색 시 풀 스캔으로 응답이 현저히 느려진다.

**거리 측정 방식(Metric)**  
시맨틱 검색·RAG는 **방향(각도)** 기반 유사도가 적합하므로, **코사인 유사도**를 사용한다. pgvector에서는 **`vector_cosine_ops`** 연산자 클래스를 인덱스와 쿼리에 일치시켜 사용한다. (L2·내적은 `vector_l2_ops`, `vector_ip_ops`.)

**인덱스 방식 선택**

- **HNSW(기본 권장)**: 삽입·검색 모두에서 균형이 좋고, 대규모에서도 검색 지연이 낮다. 디폴트로 HNSW 인덱스를 생성한다.
- **IVFFlat(선택)**: 사용자 또는 오케스트레이션에서 대량 삽입 후 검색 위주·메모리 제약 등으로 선택할 수 있다. `lists` 값은 행 수에 맞게 조정(예: sqrt(행 수) 수준)한다.

아래 스크립트는 **HNSW를 디폴트**로 생성하고, **IVFFlat은 주석으로 대안**을 제시한다. 환경에 따라 IVFFlat만 쓰거나, HNSW와 병행(다른 이름으로 생성)할 수 있다.

**토큰·벡터 생성 모델 고정 (필수)**

- **5W1H 토큰(SMALLINT)** 매핑과 **벡터(embedding) 생성에 사용하는 모델은 반드시 고정**해야 한다. 데이터 주입 시와 검색 시 **동일한 토큰 규칙·동일한 임베딩 모델**을 사용해야만 DB에 저장된 값이 올바르게 해석·비교된다.
- **모델을 변경하면** 기존에 저장된 벡터는 새 모델의 의미 공간과 맞지 않아 **유사도 검색 결과가 왜곡되며, 실질적으로 해독·재사용이 불가**하다. 토큰 매핑을 바꾸면 SMALLINT 값의 의미가 달라져 필터·집계가 깨진다. 모델/매핑 변경 시에는 **재생성(리임베딩·토큰 재부여)** 및 마이그레이션 계획이 필요하다.
- **기본 채택 모델**: 임베딩은 [NEXA-SYSTEM] AI 오케스트레이터 기준 **Ollama `nomic-embed-text`**. 데이터 주입과 사용자 질문 시 동일한 모델을 사용해야 좌표가 일치한다. `VECTOR(n)` 차원은 채택 모델 출력 차원과 반드시 일치해야 한다(예: nomic-embed-text는 768 차원; 스키마에서 1536을 쓸 경우 해당 차원의 다른 모델 사용 시에만 유효).

**Nullable Vector 및 Flag 전략**

- **Nullable Vector**: 벡터 컬럼은 nullable이다. 모든 행에 벡터를 넣지 않고, **중요한 데이터에만** 임베딩을 생성·저장하는 전략을 쓸 수 있다. 스토리지·배치 비용 절감.
- **vector_search_status (SMALLINT)**: 벡터 검색 대상 여부를 숫자로 표현. Boolean 대신 SMALLINT로 두어 다양한 상태(검수 중, 일시 비공개, A/B 테스트 등)를 확장 가능하게 설계. 현재: `1`=검색가능, `0`=제외. 그 외 값은 추후 규칙 정의. 쿼리 시 `WHERE vector_search_status = 1 AND embedding IS NOT NULL` 조건 사용. 선택적으로 partial index에 `WHERE vector_search_status = 1` 포함 가능.

> **설계 의사결정 (vector_search_status = SMALLINT)**  
> Boolean이면 0/1 두 가지만 가능하지만, SMALLINT로 두면 검수 중·일시 비공개·우선순위 등 **세밀한 로직을 나중에 추가**할 수 있다. 숫자별 의미 규칙은 추후 정의하되, 확장 가능한 타입 선택 자체가 중요한 설계이다.

**대상 테이블·컬럼**  
| 테이블 | 벡터 컬럼 | Flag | 용도 |
|--------|-----------|------|------|
| project_knowledge | embedding | vector_search_status (SMALLINT) | 프로젝트 RAG 지식 검색 |
| project_tags | tag_vector | vector_search_status | 프로젝트 내 시맨틱 태그 검색 |
| global_knowledge_base | embedding | vector_search_status | 마켓플레이스 자산 유사도 검색 |
| global_tags | tag_vector | vector_search_status | 전역 시맨틱 태그 검색 |
| support_faq | faq_vector | vector_search_status | AI 상담 FAQ 시맨틱 매칭 |

```sql
-- ========== HNSW (디폴트) — vector_cosine_ops 기준 ==========
-- project_knowledge: RAG 지식 검색. 수만 건 이상 시 인덱스 필수
CREATE INDEX IF NOT EXISTS idx_project_knowledge_embedding_hnsw
  ON project_knowledge USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- project_tags: 프로젝트 내 시맨틱 태그 검색
CREATE INDEX IF NOT EXISTS idx_project_tags_tag_vector_hnsw
  ON project_tags USING hnsw (tag_vector vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- global_knowledge_base: 마켓 자산 유사도 검색
CREATE INDEX IF NOT EXISTS idx_global_knowledge_base_embedding_hnsw
  ON global_knowledge_base USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- global_tags: 전역 태그 시맨틱 검색
CREATE INDEX IF NOT EXISTS idx_global_tags_tag_vector_hnsw
  ON global_tags USING hnsw (tag_vector vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- support_faq: AI 상담 FAQ 시맨틱 매칭
CREATE INDEX IF NOT EXISTS idx_support_faq_faq_vector_hnsw
  ON support_faq USING hnsw (faq_vector vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ========== IVFFlat (선택) — 사용자·오케스트레이션이 필요 시 적용 ==========
-- lists: 대략 sqrt(행 수)~행 수/1000 권장. 데이터 적재 후 생성 권장.
-- CREATE INDEX IF NOT EXISTS idx_project_knowledge_embedding_ivfflat
--   ON project_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS idx_project_tags_tag_vector_ivfflat
--   ON project_tags USING ivfflat (tag_vector vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS idx_global_knowledge_base_embedding_ivfflat
--   ON global_knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS idx_global_tags_tag_vector_ivfflat
--   ON global_tags USING ivfflat (tag_vector vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS idx_support_faq_faq_vector_ivfflat
--   ON support_faq USING ivfflat (faq_vector vector_cosine_ops) WITH (lists = 100);
```

**쿼리 시 유의사항**

- 인덱스가 `vector_cosine_ops`로 만들어졌으면, 쿼리에서 **`<=>`(코사인 거리)** 연산자를 사용해야 인덱스가 사용된다.
- 예: `WHERE vector_search_status = 1 AND embedding IS NOT NULL ORDER BY embedding <=> $1 LIMIT k`
- HNSW 사용 시 `SET hnsw.ef_search = 100;`(세션 또는 쿼리 전)으로 재현율·속도 트레이드오프 조정 가능.

---

✨ **핵심 설계 포인트 요약**

---

- **확장성**: `JSONB`를 사용하여 하드웨어 핀 맵이나 프로토콜 명세가 변경되어도 유연하게 대응할 수 있도록 설계.
- **성능**: 대량의 데이터가 발생하는 감사 로그와 API 통계, 상담 이력은 `TimescaleDB`의 하이퍼테이블로 구성하여 조회 성능을 최적화.
- **지능형 지원**: `support_faq`에 `pgvector` 기반의 벡터 컬럼을 배치하여 AI가 사용자의 질문을 시맨틱하게 이해하고 답변할 수 있는 기반을 마련.
- **벡터 검색 상태 확장성**: `vector_search_status`를 Boolean이 아닌 SMALLINT로 설계하여, 향후 검수·비공개·우선순위 등 세밀한 로직을 숫자 규칙으로 확장 가능하게 둠.

---

# 📋 DDL 검토 반영 완료 (명세서 v5.0 대비)

| 구분                         | 반영 내용                                                                                                                                                                                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **문서 서두**                | 상단에 제목과 서문을 한 문단으로 정리함.                                                                                                                                                                                                                                          |
| **사전 요구사항**            | §0 추가: `search_path`, `timescaledb`, `vector`, `pg_uuidv7` 확장 및 `uuid_generate_v7()` fallback.                                                                                                                                                                               |
| **중복 정의**                | 1단계에서 `project_secrets` 제거. 7단계 `project_releases` 블록 제거. 6단계·2단계 정의만 유지.                                                                                                                                                                                    |
| **project_releases 연동**    | `project_releases`에 `version_id UUID REFERENCES project_resource_versions(version_id) ON DELETE SET NULL` 추가.                                                                                                                                                                  |
| **TimescaleDB project_logs** | `PRIMARY KEY (log_id, created_at)` 추가, `project_id` FK 명시 후 `create_hypertable` 유지.                                                                                                                                                                                        |
| **비귀속 하이퍼테이블**      | `platform_audit_logs`, `api_usage_stats`, `ai_consultation_logs`에 `PRIMARY KEY (id, created_at)` 추가.                                                                                                                                                                           |
| **인덱스**                   | §7단계 추가: 31개 프로젝트 테이블에 `CREATE INDEX idx_<table>_project_id ON <table>(project_id)` 등.                                                                                                                                                                              |
| **RLS**                      | §8단계 추가: 31개 테이블 `ENABLE ROW LEVEL SECURITY` 및 `CREATE POLICY` (멤버십 기반). `project_members`는 자기 행만 노출하도록 정책 분리.                                                                                                                                        |
| **외부 참조 FK**             | 비귀속 테이블 생성 후 §「참조 무결성 보강」에서 `projects.storage_id → storage_configs`, `project_devices.device_reg_id → device_registry` 추가. `files`·`part_models`는 주석으로 안내만 유지.                                                                                    |
| **pgvector 인덱스**          | §「pgvector 인덱스 및 성능 최적화 가이드」: RAG·시맨틱 검색용 **vector_cosine_ops**(코사인 유사도) 기준. **HNSW 디폴트**(project_knowledge, project_tags, global_knowledge_base, global_tags, support_faq), **IVFFlat 선택** 스크립트 주석 제공. 쿼리 시 `<=>` 및 ef_search 안내. |
| **HEXAGON(5W1H) 완전 분리**  | **project_logs**(현재/이력): 5W1H SMALLINT 6컬럼, summary, why_chain JSONB, embedding, extra_data JSONB. **project_knowledge**(과거/지식): nature_tag, 5W1H SMALLINT 6컬럼, content_fact, raw_content, ref_ids, metadata, extra_data JSONB. DB 레벨 90% 필터 목표·복합 인덱스 포함. |
| **v5.0 전용 반영**           | 비귀속 18개→27개(tiers·capabilities·tier_allowed_capabilities·capability_grant_history·sandbox_profiles·sandbox_profile_capabilities·capability_tag_whitelist·capability_proposals·capability_map). project_parts_bom AI 시맨틱 브릿지·spec_id 동적 할당 주석. §2.8 오케스트레이션 운영 정책(동적 매핑 자동화·거절된 자격 클리닝) 명세 반영. |

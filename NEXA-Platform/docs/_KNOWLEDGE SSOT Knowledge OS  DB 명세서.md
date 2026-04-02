# KNOWLEDGE SPEC CRUD 테이블 및 필드 명세서

본 문서는 NEXA Knowledge OS의 단일 스키마 기준(SSOT)이다.

> 네임스페이스 원칙: 공통 지식 계층은 `nexa_knowledge_*`, 프로젝트 생성 지식은 `project_knowledge`로 분리한다.
> 본 문서의 물리 테이블명은 `nexa_knowledge_*`를 기준으로 한다.

**범위:** 엣지·실행·대화 등 **다른 축의 지식**은 오케스트레이션·인프라 DDL이 담당한다. 스펙트럼 개괄은 `_KNOWLEDGE ARCH 지식 운영체제(NEXA-OS) 운영 아키텍처.md` **§0** 참고.

**마무리 수준·고도화:** 본 명세는 **테이블·필드·승인·감사·OS 보강(§2.9~) 매핑**에 초점을 둔다. 오케스트레이션·AI(라우팅·추론) 세부는 **오케스트레이션 명세·도메인**에서 확장하며, “REF에서 끊고 이후 AI/도메인에서 고도화” 원칙은 `_KNOWLEDGE REF *` **§1-B**와 동일하다.

**OS적 보강(§1-C)과의 관계:** `_KNOWLEDGE RULE 지식 자산 관리 표준 계약 및 규약.md` **§5**(안전 축), `_KNOWLEDGE ARCH 지식 운영체제(NEXA-OS) 운영 아키텍처.md` **§1-B·§1-C**에서 정의한 인터럽트·페이징·드라이버·N-PATH·쓰로틀은 **검증 가능한 상태는 본 명세의 테이블**에, 실행 스케줄·뷰는 앱/런타임에 둔다. 아래 **§2.9~**는 해당 아이디어를 스키마에 매핑한 것이며, **DDL SSOT**(`_KNOWLEDGE DDL 통합 스키마 및 물리 설계(SSOT).md`)에는 단계적으로 반영한다.

### 입문: LLM(Ollama 등) 자원과 이 명세의 역할

AI 모델은 **프롬프트 길이·추론 시간·검색/호출 횟수**처럼 **한정된 자원** 안에서만 동작한다. Knowledge OS 스키마는 그 모델을 “더 똑똑하게” 바꾸기보다, **지식을 어디에 두고 무엇을 먼저 붙일지**를 정해 **낭비를 줄이는** 쪽에 기여한다.

- **“토큰만 줄인다”**로만 보면: **`context_paging_sets`**·**`response_policies` 보강**이 프롬프트·출력 길이와 **가장 직접** 연결된다.
- **그 외**(`residency`, `drivers`, `traceability_paths`, `kernel_events`, `health_signals`)은 **속도·정확도·연동·감사·모니터링** 등 **다른 목적**이 섞여 있으므로, 표와 상세 설명은 **§2.9~** 각 절의 “역할”을 읽으면 된다.
- 한 장 요약 표는 `_KNOWLEDGE ARCH 지식 운영체제(NEXA-OS) 운영 아키텍처.md` **§1-D**에 있다.

---

## 1) 핵심 테이블

### 1.1 `nexa_knowledge_definitions`

| 컬럼명        | 타입         | 제약                     | 설명                           |
| :------------ | :----------- | :----------------------- | :----------------------------- |
| `id`          | UUID         | PK, DEFAULT uuid_v7()    | 용어 고유 ID                   |
| `term_key`    | VARCHAR(100) | UNIQUE, NOT NULL         | 내부 영문 키                   |
| `ko_label`    | VARCHAR(100) | NOT NULL                 | 한국어 표시명                  |
| `category`    | VARCHAR(50)  | NOT NULL                 | 도메인 분류                    |
| `definitions` | JSONB        | NOT NULL                 | Nano/Micro/Kinetic/Zenith 정의 |
| `nature_tag`  | VARCHAR(20)  | NOT NULL, DEFAULT 'RULE' | 용어 성격                      |
| `status`      | SMALLINT     | NOT NULL, DEFAULT 1      | 1: Active, 0: Inactive         |
| `version_no`  | INTEGER      | NOT NULL, DEFAULT 1      | 버전                           |
| `created_at`  | TIMESTAMPTZ  | NOT NULL, DEFAULT now()  | 생성 시각                      |
| `updated_at`  | TIMESTAMPTZ  | NOT NULL, DEFAULT now()  | 수정 시각                      |

### 1.2 `nexa_term_tokens`

| 컬럼명         | 타입        | 제약                           | 설명                   |
| :------------- | :---------- | :----------------------------- | :--------------------- |
| `id`           | UUID        | PK, DEFAULT uuid_v7()          | 매핑 ID                |
| `term_id`      | UUID        | FK -> definitions.id, NOT NULL | 용어 참조              |
| `layer_type`   | SMALLINT    | NOT NULL                       | 1:Where~6:Why          |
| `token_value`  | SMALLINT    | NOT NULL                       | SMALLINT 토큰          |
| `is_immutable` | BOOLEAN     | NOT NULL, DEFAULT FALSE        | 불변 토큰 여부         |
| `status`       | SMALLINT    | NOT NULL, DEFAULT 1            | 1: Active, 0: Inactive |
| `created_at`   | TIMESTAMPTZ | NOT NULL, DEFAULT now()        | 생성 시각              |

유니크:

- `UNIQUE(term_id, layer_type)`
- `UNIQUE(layer_type, token_value)`

### 1.3 `nexa_knowledge_references`

| 컬럼명             | 타입         | 제약                              | 설명                         |
| :----------------- | :----------- | :-------------------------------- | :--------------------------- |
| `id`               | UUID         | PK, DEFAULT uuid_v7()             | 연결 ID                      |
| `term_id`          | UUID         | FK -> definitions.id, NOT NULL    | 용어 참조                    |
| `capability_id`    | VARCHAR(120) | NOT NULL                          | 기능 ID (`nexa.*`)           |
| `source_filename`  | VARCHAR(255) | NULL                              | 원본 파일명                  |
| `doc_ref_path`     | VARCHAR(255) | NULL                              | 문서 경로                    |
| `doc_anchor`       | VARCHAR(100) | NULL                              | 문서 앵커                    |
| `source_hash`      | VARCHAR(64)  | NULL                              | 문서 해시                    |
| `context_code`     | VARCHAR(20)  | NULL                              | Context 코드 (`SYS`, `AIS`)  |
| `doctype_code`     | VARCHAR(20)  | NULL                              | DocType 코드 (`RFC`, `ARCH`) |
| `version_label`    | VARCHAR(30)  | NULL                              | 버전 표기 (`v1`, `v0.8`)     |
| `prefix_flag`      | VARCHAR(10)  | NOT NULL, DEFAULT 'NONE'          | `_`, `@`, `NONE`             |
| `parser_version`   | VARCHAR(40)  | NULL                              | 파일명 규칙 파서 버전        |
| `parse_confidence` | NUMERIC(5,4) | NULL                              | 파싱 신뢰도 (0~1)            |
| `confidence_score` | SMALLINT     | GENERATED (parse_confidence\*100) | UI 연동 점수 (0~100)         |
| `status`           | SMALLINT     | NOT NULL, DEFAULT 1               | 1: Active, 0: Inactive       |
| `created_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT now()           | 생성 시각                    |
| `updated_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT now()           | 갱신 시각                    |

연동 규칙:

- `confidence_score`는 `parse_confidence`를 100점 환산한 읽기 전용 점수다.
- UI(`NEXU Canvas`, 브랜드: `NEXA NIXIE`)는 `project_settings.user_defined_threshold`(기본 95)와 비교한다.
- `confidence_score < user_defined_threshold`이면 노드에 `Jitter` 경고를 즉시 적용한다.
- `confidence_score >= user_defined_threshold`이면 `Lumina` 정상 강조 상태로 렌더링한다.

### 1.4 `nexa_knowledge_vectors`

| 컬럼명                 | 타입        | 제약                                   | 설명              |
| :--------------------- | :---------- | :------------------------------------- | :---------------- |
| `id`                   | UUID        | PK, DEFAULT uuid_v7()                  | 벡터 ID           |
| `term_id`              | UUID        | FK -> definitions.id, UNIQUE, NOT NULL | 용어 참조         |
| `embedding_model`      | VARCHAR(80) | NOT NULL                               | 모델명            |
| `embedding_dim`        | SMALLINT    | NOT NULL, DEFAULT 768                  | 차원              |
| `description_vector`   | VECTOR(768) | NOT NULL                               | 임베딩            |
| `vector_search_status` | SMALLINT    | NOT NULL, DEFAULT 1                    | 1: Active, 0: Off |
| `updated_at`           | TIMESTAMPTZ | NOT NULL, DEFAULT now()                | 갱신 시각         |

### 1.5 `nexa_knowledge_audit_logs`

| 컬럼명            | 타입         | 제약                    | 설명                                      |
| :---------------- | :----------- | :---------------------- | :---------------------------------------- |
| `id`              | UUID         | PK, DEFAULT uuid_v7()   | 로그 ID                                   |
| `entity_type`     | VARCHAR(40)  | NOT NULL                | definition/token/reference/vector/request |
| `entity_id`       | UUID         | NOT NULL                | 대상 ID                                   |
| `action_type`     | VARCHAR(20)  | NOT NULL                | create/update/deactivate/approve/reject   |
| `before_data`     | JSONB        | NULL                    | 변경 전                                   |
| `after_data`      | JSONB        | NULL                    | 변경 후                                   |
| `changed_by`      | VARCHAR(120) | NOT NULL                | 변경 주체                                 |
| `change_reason`   | VARCHAR(255) | NULL                    | 사유                                      |
| `error_token`     | VARCHAR(80)  | NULL                    | 반복 오류 분류 토큰                       |
| `error_context`   | JSONB        | NULL                    | 오류 문맥(용어/기능/입력 스냅샷)          |
| `error_signature` | VARCHAR(120) | NULL                    | 오류 패턴 군집화 키(해시/정규화 문자열)   |
| `created_at`      | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | 시각                                      |

접근 제어 원칙:

- `nexa_knowledge_audit_logs`는 관리자/보안 운영자만 조회 가능해야 한다.
- 일반 사용자 및 일반 도메인 API에는 원본 audit row를 직접 노출하지 않는다.

---

## 2) 보강 테이블

### 2.1 `nexa_knowledge_distribution_profiles` (차등 배포)

| 컬럼명                 | 타입        | 제약                    | 설명                      |
| :--------------------- | :---------- | :---------------------- | :------------------------ |
| `id`                   | UUID        | PK, DEFAULT uuid_v7()   | 프로파일 ID               |
| `profile_name`         | VARCHAR(20) | UNIQUE, NOT NULL        | Nano/Micro/Kinetic/Zenith |
| `include_levels`       | JSONB       | NOT NULL                | 포함 레벨 규칙            |
| `include_categories`   | JSONB       | NOT NULL                | 카테고리 필터             |
| `max_payload_kb`       | INTEGER     | NOT NULL                | 최대 크기                 |
| `package_format`       | VARCHAR(20) | NOT NULL                | json/bin                  |
| `ota_channel`          | VARCHAR(40) | NOT NULL                | 배포 채널                 |
| `version_tag`          | VARCHAR(40) | NOT NULL                | 패키지 버전               |
| `intelligence_tier`    | VARCHAR(20) | NOT NULL                | Nano/Micro/Kinetic/Zenith |
| `include_vectors`      | BOOLEAN     | NOT NULL, DEFAULT FALSE | 벡터 포함 여부            |
| `required_tokens_only` | BOOLEAN     | NOT NULL, DEFAULT TRUE  | 필수 토큰만 포함          |
| `status`               | SMALLINT    | NOT NULL, DEFAULT 1     | 활성 상태                 |
| `updated_at`           | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 갱신 시각                 |

프로파일 정책(필수):

- `nano`는 `include_vectors=false`, `required_tokens_only=true`, `max_payload_kb < 10`
- `nano` 패키지는 `definitions.nano`만 포함하고 벡터 데이터는 금지
- `micro`는 `max_payload_kb <= 256`(WARM 기본 상한)
- `zenith`는 `max_payload_kb <= 4096`(HOT 기본 상한)

### 2.1-A `nexa_hardware_profiles` (하드웨어 프로파일)

| 컬럼명             | 타입        | 제약                    | 설명           |
| :----------------- | :---------- | :---------------------- | :------------- |
| `hardware_profile` | VARCHAR(20) | PK                      | COLD/WARM/HOT  |
| `cpu_class`        | VARCHAR(40) | NOT NULL                | 장치 CPU 등급  |
| `memory_mb`        | INTEGER     | NOT NULL                | 메모리(MB)     |
| `storage_mb`       | INTEGER     | NOT NULL                | 저장소(MB)     |
| `allow_vectors`    | BOOLEAN     | NOT NULL                | 벡터 허용 여부 |
| `max_payload_kb`   | INTEGER     | NOT NULL                | 패키지 상한    |
| `status`           | SMALLINT    | NOT NULL, DEFAULT 1     | 활성 상태      |
| `updated_at`       | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 갱신 시각      |

### 2.1-B `nexa_knowledge_distribution_bindings` (지능-하드웨어 매핑)

| 컬럼명             | 타입        | 제약                                     | 설명           |
| :----------------- | :---------- | :--------------------------------------- | :------------- |
| `binding_id`       | UUID        | PK, DEFAULT uuid_v7()                    | 매핑 ID        |
| `profile_id`       | UUID        | FK -> distribution_profiles.id           | 배포 프로파일  |
| `hardware_profile` | VARCHAR(20) | FK -> hardware_profiles.hardware_profile | COLD/WARM/HOT  |
| `is_default`       | BOOLEAN     | NOT NULL, DEFAULT FALSE                  | 기본 매핑 여부 |
| `status`           | SMALLINT    | NOT NULL, DEFAULT 1                      | 활성 상태      |
| `created_at`       | TIMESTAMPTZ | NOT NULL, DEFAULT now()                  | 생성 시각      |
| `updated_at`       | TIMESTAMPTZ | NOT NULL, DEFAULT now()                  | 갱신 시각      |

운영 규칙:

- `COLD`는 `nano` 프로파일만 허용한다.
- `COLD`는 `allow_vectors=false`, `max_payload_kb < 10` 강제.
- `WARM`은 `Nano/Micro`, `HOT`은 `Nano/Micro/Kinetic/Zenith`를 허용한다.
- `WARM`의 패키지 상한은 `<= 256KB`, `HOT`의 패키지 상한은 `<= 4096KB`로 고정한다.

### 2.2 `nexa_knowledge_doc_sync_state` (문서·자산 동기화 상태, Nexion §6 정합)

> **통합 SSOT·실행 DDL:** `_KNOWLEDGE DDL 통합 스키마 및 물리 설계(SSOT).md`, `[NXN] [DDL] NEXA Nexion 독립형 인덱스 및 자산 관리 DDL.sql` §1-C. 상세 규약·다도메인 잠금은 `[NXN] [SCHM]` §6.
>
> **진실원 분리(고정):** 외부 파일의 **실종·유예·삭제** 판정과 UI(Jitter 등) 입력은 **`nexa_knowledge_traceability_paths` + `[NXN] [SCHM]` §4.4.1 상태 머신**만 따른다. 본 테이블은 **스캔 잡·해시·충돌·I/O**의 **보조(헬스) 원장**이다. `last_sync_status='missing'`은 “이번 프로브에서 미발견” 수준의 운영 신호일 뿐, **유예 중인지·삭제 확정인지는 `traceability_paths.status`·`missing_since`가 단일 기준**이다.

| 컬럼명                 | 타입         | 제약                                     | 설명                                                                                                         |
| :--------------------- | :----------- | :--------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `sync_id`              | UUID         | PK, DEFAULT uuid_v7()                    | 동기화 행 ID                                                                                                 |
| `project_id`           | UUID         | NOT NULL                                 | 테넌트/프로젝트                                                                                              |
| `doc_anchor`           | UUID         | NOT NULL, UNIQUE(project_id, doc_anchor) | 대상 범용 앵커(문서·가상 자산 공통)                                                                          |
| `responsible_domain`   | VARCHAR(40)  | NOT NULL, DEFAULT `nexion`               | 동기화 책임·정책 배정 주도 도메인 코드                                                                       |
| `last_writer_domain`   | VARCHAR(40)  | NULL                                     | 마지막으로 본 행을 갱신한 도메인·잡 식별자                                                                   |
| `anchor_domain`        | VARCHAR(30)  | NULL                                     | `nexa_knowledge_traceability_paths.anchor_domain`과 동일 해석이면 조인 없이 라우팅                           |
| `sync_asset_kind`      | VARCHAR(40)  | NOT NULL, DEFAULT `document_file`        | 자산·동기화 분기(파일/마크다운/가상 DB 행 등)                                                                |
| `hash_profile`         | VARCHAR(40)  | NULL                                     | 해시·동등성 전략(`content_sha256`, `mtime_size` 등)                                                          |
| `sync_policy_id`       | UUID         | NULL                                     | 주기·재시도·우선순위 등 정책 원장 FK(선택)                                                                   |
| `sync_priority_cached` | SMALLINT     | NULL                                     | 스케줄러 큐용 우선순위 캐시                                                                                  |
| `last_sync_status`     | VARCHAR(30)  | NOT NULL, CHECK                          | `ok` / `changed` / `missing` / `conflict` / `error` — `missing`은 §4.4.1과 별개의 **보조 프로브 신호**(§6.2) |
| `lock_metadata`        | JSONB        | NOT NULL, DEFAULT `{}`                   | 논리 잠금·충돌 당사자 등                                                                                     |
| `last_error_code`      | VARCHAR(80)  | NULL                                     | 앱/크롤러 오류 코드                                                                                          |
| `prev_source_hash`     | VARCHAR(128) | NULL                                     | 이전 스캔 해시                                                                                               |
| `curr_source_hash`     | VARCHAR(128) | NULL                                     | 현재 스캔 해시                                                                                               |
| `last_scanned_path`    | TEXT         | NULL                                     | 마지막으로 본 물리 경로 또는 가상 자산 URI                                                                   |
| `last_synced_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                  | 마지막 동기화(잡 완료) 시각                                                                                  |
| `updated_at`           | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                  | 행 수정 시각                                                                                                 |

운영·이벤트 규약(요약):

- **파일 실종·유예·삭제:** 크롤러는 **`nexa_knowledge_traceability_paths`만** SCHM §4.4.1에 따라 갱신한다(유예 중 `active`+`missing_since`, 임계 초과 `deleted`). 이후 같은 패스에서 본 테이블에 해시·I/O·충돌을 기록한다.
- **본 테이블 `last_sync_status`:** 내용 변경은 `changed`; 다도메인 충돌은 `conflict`와 `lock_metadata`; 기술 오류는 `error`; 정상 일치는 `ok`. `missing`은 프로브가 리소스를 찾지 못한 **보조 신호**로 둘 수 있으나, **비활성화·Jitter 강도 등 사용자 영향 판단은 traceability §4.4.1을 우선**한다.
- 해당 앵커를 참조하는 `nexa_knowledge_references` 등은 **`traceability_paths.status='deleted'`** 또는 정책상 확정 실종 이후 `status=0` 등으로 연계하고, 전환은 `nexa_knowledge_audit_logs`에 남긴다.

### 2.3 `nexa_knowledge_change_requests` (불변 토큰 승인 큐)

| 컬럼명                  | 타입         | 제약                        | 설명                       |
| :---------------------- | :----------- | :-------------------------- | :------------------------- |
| `id`                    | UUID         | PK, DEFAULT uuid_v7()       | 요청 ID                    |
| `entity_type`           | VARCHAR(30)  | NOT NULL                    | token/definition/reference |
| `entity_id`             | UUID         | NOT NULL                    | 대상 ID                    |
| `is_pending`            | BOOLEAN      | NOT NULL, DEFAULT TRUE      | 승인 대기 여부             |
| `request_status`        | VARCHAR(20)  | NOT NULL, DEFAULT 'pending' | pending/approved/rejected  |
| `requested_change_data` | JSONB        | NOT NULL                    | 요청 변경 데이터           |
| `requested_by`          | VARCHAR(120) | NOT NULL                    | 요청자                     |
| `requested_reason`      | VARCHAR(255) | NULL                        | 요청 사유                  |
| `reviewed_by`           | VARCHAR(120) | NULL                        | 승인자                     |
| `review_note`           | VARCHAR(255) | NULL                        | 승인/반려 메모             |
| `reviewed_at`           | TIMESTAMPTZ  | NULL                        | 처리 시각                  |
| `created_at`            | TIMESTAMPTZ  | NOT NULL, DEFAULT now()     | 생성 시각                  |

### 2.4 `nexa_knowledge_ref_rules` (참조 문서 규칙 관리)

| 컬럼명              | 타입         | 제약                    | 설명                            |
| :------------------ | :----------- | :---------------------- | :------------------------------ |
| `rule_id`           | UUID         | PK, DEFAULT uuid_v7()   | 규칙 ID                         |
| `rule_version`      | VARCHAR(40)  | UNIQUE, NOT NULL        | 규칙 버전                       |
| `filename_pattern`  | TEXT         | NOT NULL                | 파일명 파싱 패턴(정규식/템플릿) |
| `context_whitelist` | JSONB        | NOT NULL                | 허용 Context 코드 목록          |
| `doctype_whitelist` | JSONB        | NOT NULL                | 허용 DocType 코드 목록          |
| `prefix_policy`     | JSONB        | NOT NULL                | `_`, `@` 처리 규칙              |
| `is_active`         | BOOLEAN      | NOT NULL, DEFAULT FALSE | 활성 규칙 여부                  |
| `effective_from`    | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | 적용 시작 시각                  |
| `effective_to`      | TIMESTAMPTZ  | NULL                    | 적용 종료 시각                  |
| `created_by`        | VARCHAR(120) | NOT NULL                | 생성 주체                       |
| `created_at`        | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | 생성 시각                       |
| `updated_at`        | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | 갱신 시각                       |

### 2.5 `nexa_knowledge_reference_assets` (문서 참조 자산 연결)

| 컬럼명         | 타입         | 제약                          | 설명                                   |
| :------------- | :----------- | :---------------------------- | :------------------------------------- |
| `id`           | UUID         | PK, DEFAULT uuid_v7()         | 연결 ID                                |
| `reference_id` | UUID         | FK -> references.id, NOT NULL | 문서 참조 레코드                       |
| `asset_id`     | UUID         | FK -> project_assets.asset_id | 자산 원장 ID                           |
| `usage_type`   | VARCHAR(20)  | NOT NULL                      | embedded/attachment/citation/thumbnail |
| `doc_anchor`   | VARCHAR(100) | NULL                          | 문서 내 첨부 앵커                      |
| `caption`      | VARCHAR(255) | NULL                          | 캡션                                   |
| `sort_order`   | INTEGER      | NOT NULL, DEFAULT 0           | 정렬 순서                              |
| `is_primary`   | BOOLEAN      | NOT NULL, DEFAULT FALSE       | 대표 자산 여부                         |
| `status`       | SMALLINT     | NOT NULL, DEFAULT 1           | 1: Active, 0: Inactive                 |
| `created_at`   | TIMESTAMPTZ  | NOT NULL, DEFAULT now()       | 생성 시각                              |
| `updated_at`   | TIMESTAMPTZ  | NOT NULL, DEFAULT now()       | 갱신 시각                              |

운영 원칙:

- 파일 실체 저장/쿼터 계산은 `project_assets`가 담당한다.
- 본 테이블은 문서 참조 문맥(앵커/용도/정렬)만 담당한다.

### 2.6 `nexa_knowledge_error_patterns` (자가 회복 패턴 집계)

| 컬럼명                 | 타입         | 제약                        | 설명                      |
| :--------------------- | :----------- | :-------------------------- | :------------------------ |
| `pattern_id`           | UUID         | PK, DEFAULT uuid_v7()       | 패턴 ID                   |
| `error_token`          | VARCHAR(80)  | NOT NULL                    | 오류 분류 토큰            |
| `error_signature`      | VARCHAR(120) | NOT NULL                    | 패턴 군집 키              |
| `occurrence_count`     | INTEGER      | NOT NULL, DEFAULT 1         | 누적 발생 횟수            |
| `first_seen_at`        | TIMESTAMPTZ  | NOT NULL, DEFAULT now()     | 최초 관측 시각            |
| `last_seen_at`         | TIMESTAMPTZ  | NOT NULL, DEFAULT now()     | 최근 관측 시각            |
| `impact_score`         | NUMERIC(6,2) | NOT NULL, DEFAULT 0         | 영향도 점수               |
| `sample_context`       | JSONB        | NULL                        | 마스킹된 대표 문맥        |
| `suggested_rule_patch` | JSONB        | NULL                        | AI 제안 규칙 패치         |
| `review_status`        | VARCHAR(20)  | NOT NULL, DEFAULT 'pending' | pending/approved/rejected |
| `reviewed_by`          | VARCHAR(120) | NULL                        | 검토자                    |
| `reviewed_at`          | TIMESTAMPTZ  | NULL                        | 검토 시각                 |
| `created_at`           | TIMESTAMPTZ  | NOT NULL, DEFAULT now()     | 생성 시각                 |
| `updated_at`           | TIMESTAMPTZ  | NOT NULL, DEFAULT now()     | 갱신 시각                 |

운영 원칙:

- AI는 `nexa_knowledge_error_patterns`를 기반으로 `nexa_knowledge_ref_rules` 수정안을 생성한다.
- AI는 규칙을 직접 반영하지 않고 `nexa_knowledge_change_requests` 승인 큐로만 제안한다.
- 일반 사용자에게는 집계 지표만 노출하고, 원본 오류 문맥은 관리자만 조회한다.

### 2.7 `nexa_knowledge_response_policies` (ES/VI 기반 응답 정책)

| 컬럼명             | 타입         | 제약                    | 설명                   |
| :----------------- | :----------- | :---------------------- | :--------------------- |
| `policy_id`        | UUID         | PK, DEFAULT uuid_v7()   | 정책 ID                |
| `policy_name`      | VARCHAR(80)  | UNIQUE, NOT NULL        | 정책명                 |
| `scope_type`       | VARCHAR(20)  | NOT NULL                | global/project/user    |
| `scope_id`         | UUID         | NULL                    | 프로젝트/사용자 식별자 |
| `es_threshold`     | NUMERIC(4,3) | NOT NULL                | 공감 지수 임계값       |
| `vi_threshold`     | NUMERIC(4,3) | NOT NULL                | 활력 지수 임계값       |
| `output_mode`      | VARCHAR(20)  | NOT NULL                | easy/normal/expert     |
| `summary_priority` | SMALLINT     | NOT NULL, DEFAULT 100   | 낮을수록 우선순위 높음 |
| `is_active`        | BOOLEAN      | NOT NULL, DEFAULT TRUE  | 활성 여부              |
| `created_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | 생성 시각              |
| `updated_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | 갱신 시각              |

운영 원칙:

- ES/VI 임계값은 `definitions` JSONB가 아닌 본 정책 테이블에서 관리한다.
- `Low-Entropy`(예: `vi < vi_threshold`) 구간은 `output_mode='easy'`를 우선 적용한다.
- AI는 정책을 직접 반영하지 않고 승인 큐 경로로만 제안한다.

### 2.8 `nexa_self_*` (Multi-faceted Self 공통 자산 계층)

> 닉시(`NEXA NIXIE`)와의 채널 전용 자산이 아니라 플랫폼 공동 자산으로 관리한다.
> 명명 기준: `nexa_self_*`

핵심 테이블:

- `nexa_self_profiles`  
  사용자별 Self 프로필(기본 성향/활성 상태/기본 facet 정책)
- `nexa_self_facets`  
  `Now/Energy/Direction/Discovery` 축 정의 및 facet 메타
- `nexa_self_states`  
  `Empty` 포함 상태 집합, 전환 조건, 우선순위
- `nexa_self_explosions`  
  상태/Facet 트리거 -> Coil 가중치 + Capability 후보 전개 규칙
- `nexa_self_knowledge_map`  
  Self 상태/Facet와 `nexa_knowledge_*` 사이 브리지(공통 지식 연결)
- `nexa_self_capability_links`  
  Self 규칙과 Capability 매핑(실행 우선순위/허용 여부)

운영 원칙:

- `nexa_self_knowledge_map`은 원본 지식을 저장하지 않고 참조만 관리한다.
- 닉시(`NEXA NIXIE`) 채널과 오케스트레이션 직접 채널 모두 같은 `nexa_self_*`를 재사용한다.
- Self 규칙 변경은 감사 로그와 승인 큐 정책을 준수한다.

---

### 2.9 `nexa_knowledge_residency` (VOID 계층·스왑 힌트)

> **§1-C.2 VOID Swap Policy.** `how_state`/비활성에 가까운 엔티티의 **상주 계층(L1 Redis ~ L3 Archive)** 과 이동 힌트. 실제 티어 이동은 스케줄러·스토리지 정책이 수행하고, 본 테이블은 **메타·통계**를 남긴다.

#### 역할

지식 엔티티(용어 정의·문서 참조·벡터 메타 등)가 **물리적으로 어디에 “상주”하는지**와, VOID 계열 상태로 분류될 때 **다음 승격/강등 후보**를 판단하기 위한 **운영 힌트 테이블**이다. OS의 “메모리 상주 vs 스왑 아웃” 은유에 대응하되, **실제 바이트 이동·Redis 키 삭제**는 애플리케이션·인프라 레이어가 수행하고, PG 본 테이블은 **의사결정에 필요한 최소 상태**만 유지한다.

#### 하지 않는 일

- 원문 텍스트·임베딩 벡터의 **실제 저장 위치**(S3 버킷 경로 등)를 단일 진실원으로 삼지 않는다(필요 시 `tier_metadata`에 캐시).
- 티어 이동 **원자성**을 DB 트랜잭션 하나로 보장하지 않는다. “스케줄러가 읽고 행동한다”는 **이벤트 소싱에 가까운 모델**을 전제로 한다.

#### 티어 해석 (권장)

| 값   | 의미(권장)                                         | 지연·비용           |
| :--- | :------------------------------------------------- | :------------------ |
| `L1` | 핫 캐시(예: Redis). 검색·라우팅 핫패스             | ms 미만 목표, 비용↑ |
| `L2` | `nexa_knowledge_*` 가 주 저장(Postgres). 일관 조회 | ms~수십 ms          |
| `L3` | 아카이브·저빈도(객체 스토리지·압축 파티션 등)      | 초 단위 허용, 비용↓ |

`void_hint`는 오케스트레이션·프로젝트 로그의 **VOID 단계**와 맞출 수 있는 **느슨한 라벨**이며, 스키마 강제 ENUM으로 묶지 않고 운영 코드명을 문자열로 둔다(진화 여지).

#### `tier_metadata` 예시 (비규범)

```json
{
  "next_promote_at": "2026-03-26T00:00:00Z",
  "cooldown_sec": 3600,
  "cost_hint_usd_month": 0.02,
  "replica_lag_ms": 12
}
```

#### 연계

- **읽기 경로:** 라우터·RAG가 `entity_type`+`entity_id`로 조회 후, L1 미스 시 L2 폴백 등.
- **쓰기 경로:** 토큰/참조 갱신 시 `last_access_at`·`access_count_rolling` 갱신(배치 가능).
- **VOID 정책:** 파일 실종·삭제 서사는 **`nexa_knowledge_traceability_paths` §4.4.1**이 주도하고, `nexa_knowledge_doc_sync_state`·`residency`는 **보조·티어**와 같은 사용자 스토리로 맞물리게 할 수 있다.

| 컬럼명                 | 타입        | 제약                    | 설명                                                    |
| :--------------------- | :---------- | :---------------------- | :------------------------------------------------------ |
| `residency_id`         | UUID        | PK, DEFAULT uuid_v7()   | 행 ID                                                   |
| `entity_type`          | VARCHAR(30) | NOT NULL                | `definition` / `reference` / `vector` 등 감시 대상 유형 |
| `entity_id`            | UUID        | NOT NULL                | 대상 PK (`nexa_knowledge_*` 내 ID)                      |
| `storage_tier`         | VARCHAR(10) | NOT NULL                | `L1` / `L2` / `L3` (즉시·PG·아카이브)                   |
| `void_hint`            | VARCHAR(20) | NULL                    | `POTENTIAL` / `ARCHIVE` / 기타 VOID 단계 힌트           |
| `access_count_rolling` | INTEGER     | NOT NULL, DEFAULT 0     | 롤링 윈도우 접근 횟수(앱 정의 기간)                     |
| `last_access_at`       | TIMESTAMPTZ | NULL                    | 최근 접근 시각                                          |
| `tier_changed_at`      | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 티어 마지막 변경 시각                                   |
| `tier_metadata`        | JSONB       | NOT NULL, DEFAULT '{}'  | 비용·복제 지연·쿨다운 등 운영 메타                      |
| `status`               | SMALLINT    | NOT NULL, DEFAULT 1     | 1: Active, 0: Inactive                                  |

유니크·인덱스(권장):

- `UNIQUE(entity_type, entity_id)` — 대상당 1행(또는 티어별 분리 시 `UNIQUE(entity_type, entity_id, storage_tier)` 로 완화)
- `(storage_tier, last_access_at DESC)` — 강등 스윕용

---

### 2.10 `nexa_knowledge_context_paging_sets` (Context Paging)

> **§1-C.2 Context Paging.** 프로젝트·사용자 진입 시 LLM/라우터에 **상주할 RULE·INTENT**만 고정하는 **컨텍스트 페이지** 정의. HEXAGON 본문(`nexa_term_tokens`)을 대체하지 않는다.

#### 역할

LLM·인디케이터에 넣는 **프롬프트/컨텍스트 윈도우**는 비용과 지연의 핵심이다. 본 테이블은 “이 세션·이 프로젝트에서는 **항상 이 용어와 이 문서 참조를 먼저 깔아 둔다**”는 **페이지(상주 집합)** 를 선언한다. **전체 지식 그래프를 매번 넣지 않고**, RULE·INTENT에 해당하는 **소수의 앵커 ID**만 고정한다.

#### HEXAGON과의 관계

- `nexa_term_tokens`의 **6축 정수 토큰**은 시스템의 **정규화된 문법**이다. Context Paging은 그 위에 얹는 **“이번 대화의 초점”** 이며, 토큰 테이블을 **수정·대체하지 않는다**.
- `intent_hexagon_snapshot`은 선택 필드로, “이 페이지가 활성일 때 라우팅에 쓸 **가중치·초기 5W1H**”를 JSON으로 담을 수 있다(정수 스키마는 앱·문서로 고정 권장).

#### 수명·우선순위

- `scope_type`이 좁을수록 우선: 예) `user`+`project` > `project` > `global`.
- 동일 스코프에 다중 `is_active=true`가 있으면 **충돌**이므로, 운영에서는 `label`+`updated_at` 최신 또는 `summary_priority` 유사 개념을 앱에서 두거나, 추후 컬럼 추가로 해소한다.

#### 연계

- `pinned_definition_ids` → `nexa_knowledge_definitions.id`
- `pinned_reference_ids` → `nexa_knowledge_references.id` (파일명 파서·`confidence_score`와 함께 쓰면 Jitter 노드도 페이지에 포함 가능)

| 컬럼명                    | 타입         | 제약                    | 설명                                       |
| :------------------------ | :----------- | :---------------------- | :----------------------------------------- |
| `set_id`                  | UUID         | PK, DEFAULT uuid_v7()   | 세트 ID                                    |
| `scope_type`              | VARCHAR(20)  | NOT NULL                | `global` / `project` / `user`              |
| `scope_id`                | UUID         | NULL                    | 프로젝트/사용자 식별자                     |
| `pinned_definition_ids`   | UUID[]       | NOT NULL, DEFAULT '{}'  | 상주 용어(`nexa_knowledge_definitions.id`) |
| `pinned_reference_ids`    | UUID[]       | NOT NULL, DEFAULT '{}'  | 상주 참조(`nexa_knowledge_references.id`)  |
| `intent_hexagon_snapshot` | JSONB        | NOT NULL, DEFAULT '{}'  | 선택: 5W1H 스냅샷(정수 토큰)·캡슐화        |
| `max_window_tokens`       | INTEGER      | NULL                    | 상한 토큰(앱 정의)                         |
| `label`                   | VARCHAR(120) | NULL                    | 사람이 읽는 이름                           |
| `is_active`               | BOOLEAN      | NOT NULL, DEFAULT TRUE  | 활성 여부                                  |
| `updated_at`              | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | 갱신 시각                                  |

---

### 2.11 `nexa_knowledge_capability_drivers` (Capability-as-Driver / Hot-Plug)

> **§1-C.3.** 외부 API·연동을 **Capability ID**에 매핑하는 **드라이버 매니페스트**. `project_extensions` 실체는 오케스트레이션 DB에 있을 수 있어, 본 테이블은 **지식 OS 측 등록·검증·감사**에 집중한다.

#### 역할

하드웨어 OS에서 **디바이스 드라이버**가 커널과 장치 사이를 표준 인터페이스로 연결하듯, NEXA에서는 **외부 SaaS·HTTP API·에지 프로토콜**을 `nexa.*` **Capability ID**에 바인딩하고, N-MAP·오케스트레이션 호출 시 **동일한 자격·감사·샌드박스**를 타게 한다. 본 테이블은 그 **선언적 매니페스트**를 저장한다.

#### `manifest`에 넣을 내용 (권장 스키마는 앱 합의)

- **인증:** OAuth scope, API key vault 참조 키(평문 금지)
- **매핑:** 외부 이벤트 필드 → 내부 HEXAGON/토큰/Intent
- **한계:** 레이트 리밋, 페이로드 상한, 허용 HTTP 메서드
- **N-MAP:** 어댑터 템플릿 ID, 기본 `is_virtual` 여부(실물 이펙트 방지)

#### Hot-Plug의 의미

- “코드 없이”는 **운영자가 SQL을 직접 짜지 않는다**는 수준의 목표이며, **ASK·승인·감사**는 생략하지 않는다. `registration_status='draft'` → 검증 → `active` 전환 흐름을 권장한다.
- `project_extension_id`는 오케스트레이션 DB와 **동일 클러스터**일 때만 FK 후보. 분리 배포 시 UUID만 저장하고 앱에서 조인한다.

#### 연계

- `capabilities` / `capability_map`(플랫폼)과 **capability_id** 정합
- `sandbox_profiles`로 격리 실행(선택)

| 컬럼명                 | 타입         | 제약                      | 설명                                                                    |
| :--------------------- | :----------- | :------------------------ | :---------------------------------------------------------------------- |
| `driver_id`            | UUID         | PK, DEFAULT uuid_v7()     | 드라이버 ID                                                             |
| `capability_id`        | VARCHAR(120) | NOT NULL                  | 표준 `nexa.*` 자격 ID                                                   |
| `external_provider`    | VARCHAR(80)  | NOT NULL                  | `slack` / `openai` / `custom` 등                                        |
| `manifest`             | JSONB        | NOT NULL                  | 엔드포인트·스코프·필드 매핑·N-MAP 래퍼 파라미터                         |
| `project_extension_id` | UUID         | NULL                      | (선택) 오케스트레이션 `project_extensions` 행 ID — 동일 DB일 때 FK 검토 |
| `sandbox_profile_id`   | UUID         | NULL                      | (선택) `sandbox_profiles` 등 격리 프로파일                              |
| `registration_status`  | VARCHAR(20)  | NOT NULL, DEFAULT 'draft' | `draft` / `active` / `suspended`                                        |
| `registered_by`        | VARCHAR(120) | NOT NULL                  | 등록 주체                                                               |
| `registered_at`        | TIMESTAMPTZ  | NOT NULL, DEFAULT now()   | 등록 시각                                                               |
| `last_health_at`       | TIMESTAMPTZ  | NULL                      | 마지막 헬스 체크                                                        |

운영 원칙:

- 신규 연결도 **ASK → GOVERN → ERA** 및 `nexa_knowledge_change_requests` 정책을 생략하지 않는다.
- `manifest`에 **필수 Capability·권한 범위**를 명시해 Hot-Plug 시 자동 검증한다.

---

### 2.12 `nexa_knowledge_traceability_paths` (Narrative Path / Inode 인덱스)

> **§1-C.4 Inode-to-Traceability.** 논리 경로(`/projects/.../why_chain` 등)와 **앵커 UUID**를 연결하는 **이름 공간 인덱스**. 실행 패킷(`packet_id`)은 오케스트레이션 DB에 있을 수 있으므로 `anchor_domain`으로 경계를 구분한다.

#### 역할

사용자·캔버스·API가 **파일 시스템 경로처럼** 익숙한 문자열로 족보를 탐색할 수 있게 하되, 물리 스키마는 여전히 **UUID·시계열**이다. 본 테이블은 **Inode 역할**: `logical_path` ↔ **`doc_anchor`** 매핑과, 트리 탐색을 위한 `parent_path_id`·`depth`를 제공한다.

#### 경로 규칙 (권장)

- 선행 `/` 통일, 대소문자 민감도 정책을 팀에서 한 가지로 고정.
- **버전**은 경로에 넣거나 `metadata.version`으로 분리(중복 경로 방지).
- `anchor_domain='orchestration'`일 때 `doc_anchor`는 **다른 DB의 `packet_id` 등**을 가리킬 수 있으며, FK는 걸지 않거나 **느슨한 참조**로만 문서화한다.

#### 캔버스·NIXIE

- 노드 클릭 시 `logical_path`로 조회해 **동일 앵커**를 하이라이트하거나, 반대로 앵커로부터 **브레드크럼 경로**를 재구성한다.
- `metadata`에 `canvas_layout_hint`, `nixie_lumina_profile` 등 UI 힌트를 넣을 수 있다(비규범).

#### Time-Travel Mount

과거 시점 **가상 마운트·분기 실험**의 상태 박제는 오케스트레이션 DB의 `execution_steps.post_state_snapshot`·`is_virtual`과 결합하고, 본 테이블은 **탐색용 논리 경로**와 knowledge 앵커만 담당한다. “과거 폴더” UX가 필요하면 `logical_path`에 `/snapshot/{snapshot_id}/...` 같은 **네임스페이스**를 추가하는 방식을 권장한다.

| 컬럼명           | 타입        | 제약                    | 설명                                         |
| :--------------- | :---------- | :---------------------- | :------------------------------------------- |
| `path_id`        | UUID        | PK, DEFAULT uuid_v7()   | 경로 행 ID                                   |
| `logical_path`   | TEXT        | NOT NULL                | 유일 논리 경로(슬래시 구분)                  |
| `anchor_domain`  | VARCHAR(30) | NOT NULL                | `knowledge` / `orchestration` 등             |
| `anchor_type`    | VARCHAR(40) | NOT NULL                | `term` / `reference` / `execution_packet` 등 |
| `doc_anchor`     | UUID        | NOT NULL                | 대상 앵커 UUID(도메인별 해석)                |
| `parent_path_id` | UUID        | NULL, FK -> path_id     | 트리 상위(선택)                              |
| `depth`          | SMALLINT    | NOT NULL, DEFAULT 0     | 깊이                                         |
| `metadata`       | JSONB       | NOT NULL, DEFAULT '{}'  | MIME·아이콘·캔버스 힌트                      |
| `created_at`     | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성 시각                                    |

유니크·인덱스(권장):

- `UNIQUE(logical_path)` — 경로 단일 앵커
- `(anchor_domain, anchor_type, doc_anchor)` — 역조회(앵커→경로)

---

### 2.13 `nexa_knowledge_kernel_events` (인터럽트·공감 선점 감사)

> **§1-C.1 Safety Reflex / Empathy Preemption.** 인디케이터 바이패스·태스크 Suspend 등 **커널급 이벤트**의 **불변 감사**. 정책 본문은 GOVERN/ERA·승인 큐와 정합을 유지한다.

#### 역할

일반 감사 로그(`nexa_knowledge_audit_logs`)가 **CRUD·승인** 중심이라면, 본 테이블은 **실시간 안전·공감 결정**으로 실행 우선순위가 바뀌는 사건을 **고의적으로 분리**해 기록한다. 사후 분쟁·규제 대응·“왜 바이패스했는가”를 설명할 때 **최초 근거**가 된다.

#### `event_kind` 예시

| 값                   | 설명                                           |
| :------------------- | :--------------------------------------------- |
| `safety_reflex`      | 긴급도 5 등에서 인디케이터 우회·엣지 직접 제어 |
| `empathy_preemption` | VI 급락 등으로 실행 큐 **일시 중단**           |
| `resume`             | 선점 해제·정상 스케줄 복귀                     |
| `dry_run_branch`     | 가상 분기만 탐색(실물 미적용)                  |

#### `policy_snapshot`에 넣을 것 (권장)

- 당시 `vi_threshold` / `es_threshold` / `user_defined_threshold`
- 활성 facet·`coil_weights` 요약
- 트리거로 삼은 **원시 관측**(마스킹 정책 준수)

#### 안전

- **일반 사용자 API에 노출 금지** 권장. RLS·서비스 계정만 INSERT.
- 바이패스가 잦으면 **GOVERN 규칙**으로 승격해 자동 트리거 조건을 조이는 절차를 둔다.

| 컬럼명                       | 타입        | 제약                    | 설명                                                                    |
| :--------------------------- | :---------- | :---------------------- | :---------------------------------------------------------------------- |
| `event_id`                   | UUID        | PK, DEFAULT uuid_v7()   | 이벤트 ID                                                               |
| `created_at`                 | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 발생 시각                                                               |
| `event_kind`                 | VARCHAR(40) | NOT NULL                | `safety_reflex` / `empathy_preemption` / `resume` / `dry_run_branch` 등 |
| `urgency_level`              | SMALLINT    | NOT NULL, DEFAULT 1     | 1~5 (5=Emergency)                                                       |
| `user_id`                    | UUID        | NULL                    | 대상 사용자                                                             |
| `project_id`                 | UUID        | NULL                    | 대상 프로젝트                                                           |
| `bypass_indicator`           | BOOLEAN     | NOT NULL, DEFAULT FALSE | 인디케이터 추론 바이패스 여부                                           |
| `target_tier`                | VARCHAR(20) | NULL                    | `nano` / `micro` / `edge` 등 제어 주체                                  |
| `superseded_handles`         | JSONB       | NULL                    | 일시 중단된 태스크·세션 핸들(앱 스키마)                                 |
| `policy_snapshot`            | JSONB       | NOT NULL                | 당시 VI/ES·임계·코일 스냅샷                                             |
| `related_audit_id`           | UUID        | NULL                    | `nexa_knowledge_audit_logs.id` 연결(선택)                               |
| `followup_change_request_id` | UUID        | NULL                    | 사후 ASK·승인 큐 연결(선택)                                             |

접근 제어: `nexa_knowledge_audit_logs`와 동일하게 **관리자·보안** 위주 조회를 권장한다.

인덱스(권장): `(event_kind, created_at DESC)`, `(user_id, created_at DESC)`, `(urgency_level, created_at DESC)`.

---

### 2.14 `nexa_knowledge_health_signals` (Jitter·시스템 헬스 스냅샷)

> **§1-C.5 Jitter-based Health Check.** 노드·스코프별 **신뢰도·부하**를 집계해 **NEXU 캔버스(넥슈)**·모니터에 공급. **신뢰도 Jitter**와 **큐 적체·VI** 등은 `signal_kind`로 분리한다.

#### 역할

`nexa_knowledge_references.confidence_score`는 **문서·파싱 단위**의 신뢰도다. 반면 운영자는 “지금 플랫폼 전체가 숨이 찬 상태인가”를 **한 눈**에 보고 싶다. 본 테이블은 **집계 스냅샷**: 일정 주기(예: 30초)마다 스코프별로 **단일 지표**를 기록해, NIXIE **Jitter 강도**·대시보드 게이지·알람에 공급한다.

#### `signal_kind` 분리 원칙

| 종류                | 예시                         | 비고                              |
| :------------------ | :--------------------------- | :-------------------------------- |
| `confidence_jitter` | 파싱·근거 불확실 평균/최악값 | `references`·프로젝트 로그와 연계 |
| `queue_pressure`    | 승인 큐·실행 큐 길이 정규화  | OS의 loadavg 유사                 |
| `vi_empathy`        | VI/ES 요약                   | Empathy 엔진과 중복 시 **집계만** |

동일 시각에 **여러 행**으로 종류를 나누어 저장한다(한 행에 다 때려 넣지 않음).

#### 보존

- raw는 빠르게 쌓이므로 **Timescale hypertable** + 보존 기간(예: 90일) 권장.
- 장기 추세는 배치로 **일 단위 롤업 테이블**을 별도 두는 전략 가능(본 명세 범위 밖).

| 컬럼명           | 타입         | 제약                    | 설명                                                     |
| :--------------- | :----------- | :---------------------- | :------------------------------------------------------- |
| `signal_id`      | UUID         | PK, DEFAULT uuid_v7()   | 스냅샷 ID                                                |
| `recorded_at`    | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | 기록 시각                                                |
| `scope_type`     | VARCHAR(20)  | NOT NULL                | `global` / `project` / `reference` 등                    |
| `scope_id`       | UUID         | NULL                    | 스코프 식별자                                            |
| `signal_kind`    | VARCHAR(40)  | NOT NULL                | `confidence_jitter` / `queue_pressure` / `vi_empathy` 등 |
| `value_numeric`  | NUMERIC(8,4) | NULL                    | 0~1 또는 정규화 지표                                     |
| `value_smallint` | SMALLINT     | NULL                    | 0~100 등 정수 스케일                                     |
| `payload`        | JSONB        | NOT NULL, DEFAULT '{}'  | 세부 분해(노드별·파이프라인별)                           |

시계열 저장이 많으면 **Timescale hypertable** 전환을 검토한다.

---

### 2.15 `nexa_knowledge_response_policies` 보강 컬럼 (Low-Entropy Throttling)

> **§1-C.5** — 기존 **§2.7** 테이블에 아래 컬럼을 **추가**한다(이미 배포된 환경은 `ALTER`).

#### 역할 (보강)

기존 컬럼(`es_threshold`, `vi_threshold`, `output_mode` 등)이 **언제 쉬운 출력으로 갈지**를 정한다면, 보강 컬럼은 **“얼마나 단순한 UI·얼마나 보수적 코일인지”** 를 같은 정책 행에 실어 **Low-Entropy Throttling**을 일관되게 적용하기 위한 것이다. ARCH §1-C.5의 **인지 에너지 절약 모드**와 대응한다.

#### `coil_weight_override`

- JSON 예: `{"safety":1.2,"creativity":0.6,"harmony":1.0}` (키 이름은 `nexa_self_*`·코일 정의와 합치).
- **NULL**이면 플랫폼 기본 코일만 사용.

#### `ui_entropy_mode`

| 값        | 의미(권장)                                  |
| :-------- | :------------------------------------------ |
| `normal`  | 기존 레이아웃·밀도 유지                     |
| `minimal` | 카드·설명 축소, 1차 액션 위주               |
| `static`  | 애니메이션·실시간 위젯 억제(인지 부하 최소) |

#### `throttle_rationale_code`

- 운영자가 나중에 대시보드에서 필터링할 수 있게 **짧은 코드**(`VI_DROP`, `USER_PREF`, `GOVERN_ERA` 등)를 둔다.

기존 `output_mode`·ES/VI 임계와 함께 사용하며, **강제 규칙은 GOVERN/ERA·승인 큐**와 충돌하지 않게 정의한다.

| 컬럼명                    | 타입        | 제약 | 설명                                                        |
| :------------------------ | :---------- | :--- | :---------------------------------------------------------- |
| `coil_weight_override`    | JSONB       | NULL | VI 저하 시 창의성↓·안정성↑ 등 **코일 가중 스냅샷**(앱 해석) |
| `ui_entropy_mode`         | VARCHAR(20) | NULL | `minimal` / `static` / `normal` — 단순·정적 UI 전환 힌트    |
| `throttle_rationale_code` | VARCHAR(40) | NULL | 적용 사유 코드(정책 추적)                                   |

---

## 3) `definitions` JSONB 계약

```json
{
  "nano": { "summary": "..." },
  "micro": { "summary": "..." },
  "zenith": { "summary": "..." },
  "easy_summary": "...",
  "examples": [
    {
      "input_ko": "데이터 비워줘",
      "normalized_term_keys": ["VOID"],
      "target_capability_id": "nexa.platform.archive.purge"
    }
  ]
}
```

필수 규칙:

- `nano`, `micro`, `zenith` 키 존재
- 각 레벨 `summary` 문자열 필수
- ES/VI 임계값은 JSONB가 아닌 `nexa_knowledge_response_policies`에서 관리

---

## 4) 불변 토큰 변경 워크플로우

1. 수정 요청 수신
2. 대상이 `is_immutable=true`이면 본 테이블 즉시 업데이트 금지
3. `nexa_knowledge_change_requests`에 pending 생성
4. 관리자 승인 시에만 실제 반영
5. 승인/반려 모두 `nexa_knowledge_audit_logs` 기록

---

## 5) DDL 정합성 매트릭스 (CRUD ↔ 통합 DDL)

기준 파일:

- 명세: `_KNOWLEDGE SPEC CRUD 테이블 및 필드 명세서.md` (본 문서)
- DDL: `_KNOWLEDGE DDL 통합 스키마 및 물리 설계(SSOT).md`

### 5.1 핵심 테이블 정합성

| 테이블                       | 정합 상태 | 비고                                                     |
| :--------------------------- | :-------- | :------------------------------------------------------- |
| `nexa_knowledge_definitions` | 일치      | 필수 컬럼/기본값/상태 제약 반영                          |
| `nexa_term_tokens`           | 일치      | `status`, `created_at`, `layer_type` CHECK 반영          |
| `nexa_knowledge_references`  | 일치      | 코드 기반 분류 컬럼(`context_code`, `doctype_code`) 반영 |
| `nexa_knowledge_vectors`     | 일치      | `embedding_dim`, `vector_search_status` 제약 반영        |
| `nexa_knowledge_audit_logs`  | 일치      | 감사 로그 시계열 테이블(hypertable) 반영                 |

### 5.2 보강 테이블 정합성

| 테이블                                         | 정합 상태                           | 비고                                                                                                       |
| :--------------------------------------------- | :---------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| `nexa_knowledge_distribution_profiles`         | 일치                                | 프로파일명 CHECK(`Nano/Micro/Kinetic/Zenith`) 반영                                                         |
| `nexa_hardware_profiles`                       | 일치                                | COLD/WARM/HOT 하드웨어 제약 반영                                                                           |
| `nexa_knowledge_distribution_bindings`         | 일치                                | 지능 위계-하드웨어 매핑 제약 반영                                                                          |
| `nexa_knowledge_doc_sync_state`                | 일치                                | Nexion §6·SSOT: `sync_id`/`doc_anchor`/`last_synced_at`·부분 인덱스(`idx_doc_sync_project_status` 등) 반영 |
| `nexa_knowledge_change_requests`               | 일치                                | `is_pending`, `review_note`, 상태 CHECK 반영                                                               |
| `nexa_knowledge_ref_rules`                     | 일치                                | 활성 규칙 단일화 인덱스 반영                                                                               |
| `nexa_knowledge_reference_assets`              | 일치                                | `project_assets` FK + usage_type CHECK 반영                                                                |
| `nexa_knowledge_error_patterns`                | 일치                                | 오류 패턴 집계 + 검토 상태 워크플로 반영                                                                   |
| `nexa_knowledge_response_policies`             | 일치                                | ES/VI 임계값 기반 출력 정책 반영                                                                           |
| `nexa_self_profiles`                           | 일치                                | 사용자별 Self 프로필 분리 반영                                                                             |
| `nexa_self_facets`                             | 일치                                | Multi-faceted Self 축 반영                                                                                 |
| `nexa_self_states`                             | 일치                                | `Empty` 포함 상태 모델 반영                                                                                |
| `nexa_self_explosions`                         | 일치                                | 역방향 분해 맵(Explosion) 반영                                                                             |
| `nexa_self_knowledge_map`                      | 일치                                | Self-knowledge 브리지 반영                                                                                 |
| `nexa_self_capability_links`                   | 일치                                | Self-Capability 연결 반영                                                                                  |
| `nexa_knowledge_residency`                     | SSOT DDL 반영 (통합 DDL `4-B` 블록) | VOID L1/L2/L3·스왑 힌트 (`§2.9`)                                                                           |
| `nexa_knowledge_context_paging_sets`           | SSOT DDL 반영 (통합 DDL `4-B` 블록) | Context Paging (`§2.10`)                                                                                   |
| `nexa_knowledge_capability_drivers`            | SSOT DDL 반영 (통합 DDL `4-B` 블록) | 드라이버 매니페스트 (`§2.11`)                                                                              |
| `nexa_knowledge_traceability_paths`            | SSOT DDL 반영 (통합 DDL `4-B` 블록) | N-PATH 경로 인덱스 (`§2.12`)                                                                               |
| `nexa_knowledge_kernel_events`                 | SSOT DDL 반영 (통합 DDL `4-B` 블록) | 인터럽트·선점 감사 (`§2.13`)                                                                               |
| `nexa_knowledge_health_signals`                | SSOT DDL 반영 (통합 DDL `4-B` 블록) | 헬스·Jitter 집계 (`§2.14`)                                                                                 |
| `nexa_knowledge_response_policies` (보강 컬럼) | SSOT DDL 반영 (`ALTER` + CHECK)     | `coil_weight_override` 등 (`§2.15`)                                                                        |

### 5.3 제약/인덱스 정합성

| 항목              | 정합 상태 | 비고                                             |
| :---------------- | :-------- | :----------------------------------------------- |
| UUID v7 함수 보장 | 반영      | `uuid_generate_v7()` fallback 포함               |
| 확장 보장         | 반영      | `timescaledb`, `vector`, `pgcrypto`, `pg_uuidv7` |
| 상태값 CHECK      | 반영      | status/request_status/layer_type                 |
| 검색 인덱스       | 반영      | category/status, token lookup, reference lookup  |
| 벡터 인덱스       | 반영      | HNSW `vector_cosine_ops`                         |

### 5.4 운영 규칙 일치 여부

- 사용자 Capability 접두사 강제는 `type='user'` 조건으로 통일
- `capability_id` 없는 참조 데이터 생성 방지
- 참조 문서 파싱은 활성 규칙(`nexa_knowledge_ref_rules.is_active=true`) 기준 단일 적용
- 첨부 파일은 `project_assets` quota 검증 통과 건만 `nexa_knowledge_reference_assets`에 연결
- 승인 큐 기반 변경 통제 + 감사 로그 적재 일관성 확보
- OS 보강 테이블(`§2.9`~`§2.14`)은 **감사·티어·경로** 중심으로 RLS·관리자 전용 조회를 검토한다.
- `nexa_knowledge_kernel_events`는 **바이패스·선점** 추적용이므로 일반 API 노출 금지 원칙을 `nexa_knowledge_audit_logs`와 동일하게 적용한다.

---

## 6) 실행 Runbook (DDL 적용 순서)

목표: 운영/개발 환경에서 DDL 적용 시 실패 포인트를 줄이고, 적용 후 정합성을 즉시 검증한다.

### 6.1 적용 순서

1. **사전 백업**
   - 현재 스키마 스냅샷 백업
   - 롤백 스크립트 준비
2. **확장 설치**
   - `pgcrypto`, `timescaledb`, `vector`, `pg_uuidv7`
   - `uuid_generate_v7()` fallback 함수 확인
3. **공용 참조 테이블**
   - `tiers`, `capabilities`
4. **Glossary Core 테이블**

- `nexa_knowledge_definitions`
- `nexa_term_tokens`
- `nexa_knowledge_references`
- `nexa_knowledge_vectors`

5. **운영 보강 테이블**

- `nexa_knowledge_distribution_profiles`
- `nexa_hardware_profiles`
- `nexa_knowledge_distribution_bindings`
- `nexa_knowledge_doc_sync_state`
- `nexa_knowledge_change_requests`
- `nexa_knowledge_ref_rules`
- `nexa_knowledge_reference_assets`
- `nexa_knowledge_response_policies` (+ `§2.15` 보강 컬럼 마이그레이션)
- `nexa_knowledge_error_patterns`
- `nexa_knowledge_residency` (`§2.9`)
- `nexa_knowledge_context_paging_sets` (`§2.10`)
- `nexa_knowledge_capability_drivers` (`§2.11`)
- `nexa_knowledge_traceability_paths` (`§2.12`)
- `nexa_knowledge_kernel_events` (`§2.13`)
- `nexa_knowledge_health_signals` (`§2.14`, 선택 시 hypertable)
- `nexa_self_profiles`
- `nexa_self_facets`
- `nexa_self_states`
- `nexa_self_explosions`
- `nexa_self_knowledge_map`
- `nexa_self_capability_links`
- `nexa_knowledge_audit_logs` + hypertable 변환

6. **인덱스 생성**
   - 일반 인덱스 -> 벡터(HNSW) 인덱스 순
7. **초기 데이터 시드**
   - 프로파일(`Nano/Micro/Kinetic/Zenith`) 기본행
   - 핵심 용어/토큰 최소 세트
8. **검증 쿼리 실행**
   - 제약/인덱스/트리거 동작 확인

### 6.2 적용 후 필수 검증 쿼리

```sql
-- 1) 필수 테이블 존재 확인
SELECT table_name
FROM information_schema.tables
WHERE table_name IN (
  'nexa_knowledge_definitions',
  'nexa_term_tokens',
  'nexa_knowledge_references',
  'nexa_knowledge_vectors',
  'nexa_knowledge_distribution_profiles',
  'nexa_hardware_profiles',
  'nexa_knowledge_distribution_bindings',
  'nexa_knowledge_doc_sync_state',
  'nexa_knowledge_change_requests',
  'nexa_knowledge_ref_rules',
  'nexa_knowledge_reference_assets',
  'nexa_knowledge_response_policies',
  'nexa_knowledge_error_patterns',
  'nexa_knowledge_residency',
  'nexa_knowledge_context_paging_sets',
  'nexa_knowledge_capability_drivers',
  'nexa_knowledge_traceability_paths',
  'nexa_knowledge_kernel_events',
  'nexa_knowledge_health_signals',
  'nexa_self_profiles',
  'nexa_self_facets',
  'nexa_self_states',
  'nexa_self_explosions',
  'nexa_self_knowledge_map',
  'nexa_self_capability_links',
  'nexa_knowledge_audit_logs'
);

-- 2) status/check 제약 확인
SELECT conname, conrelid::regclass AS table_name
FROM pg_constraint
WHERE conname LIKE 'chk_%'
  AND conrelid::regclass::text LIKE 'nexa_knowledge%';

-- 3) HNSW 인덱스 확인
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename = 'nexa_knowledge_vectors';

-- 4) hypertable 전환 확인(timescaledb)
SELECT hypertable_name
FROM timescaledb_information.hypertables
WHERE hypertable_name = 'nexa_knowledge_audit_logs';
```

### 6.3 운영 점검 체크리스트

- `capability_id` 없는 reference 데이터가 입력되지 않는가?
- `layer_type`가 1~6 범위를 벗어나지 않는가?
- `request_status`가 `pending/approved/rejected`만 허용되는가?
- `type='user'`인 capability가 `usr.%` 접두사를 강제받는가?
- 벡터 검색 쿼리가 `vector_search_status=1` 조건을 사용하고 있는가?

### 6.4 배포 전략 권장

- 개발 -> 스테이징 -> 운영 순서로 동일 스크립트 적용
- 운영 반영은 저부하 시간대 수행
- 인덱스 생성 시간 모니터링(HNSW는 데이터량에 따라 지연 가능)
- 적용 직후 문서 동기화 크롤러와 배포 패키저를 Dry-run으로 1회 실행

---

## 7) Ollama 연동과 CRUD 경계 (요약)

- **CRUD의 근거는 항상 DB/API**이다. Ollama는 **임베딩 생성**·**(선택) 초안 제안**에만 쓰이며, 단독으로 행을 “확정”하지 않는다.
- **`nexa_knowledge_vectors`**: 용어 본문(또는 합의된 입력 문자열)을 Ollama 임베딩 API로 벡터화한 뒤 **UPSERT**. 모델명·차원은 `embedding_model` / `embedding_dim` / DDL의 `VECTOR(n)`과 일치해야 한다.
- **불변 토큰·승인 큐**: Ollama 출력 → 검증 → 필요 시 `nexa_knowledge_change_requests` → 승인 후 본 테이블 반영.
- 상세 흐름·API 예시는 `_KNOWLEDGE ARCH 지식 운영체제(NEXA-OS) 운영 아키텍처.md`의 연동 절을 본다.

# \_ 용어 및 시스템 설계 파일 관리 CRUD 테이블 스키마 설계안

본 문서는 NEXA Knowledge OS의 단일 스키마 기준(SSOT)이다.

> 네임스페이스 원칙: 공통 지식 계층은 `nexa_knowledge_*`, 프로젝트 생성 지식은 `project_knowledge`로 분리한다.
> 본 문서의 물리 테이블명은 `nexa_knowledge_*`를 기준으로 한다.

---

## 1) 핵심 테이블

### 1.1 `nexa_knowledge_definitions`

| 컬럼명        | 타입         | 제약                     | 설명                   |
| :------------ | :----------- | :----------------------- | :--------------------- |
| `id`          | UUID         | PK, DEFAULT uuid_v7()    | 용어 고유 ID           |
| `term_key`    | VARCHAR(100) | UNIQUE, NOT NULL         | 내부 영문 키           |
| `ko_label`    | VARCHAR(100) | NOT NULL                 | 한국어 표시명          |
| `category`    | VARCHAR(50)  | NOT NULL                 | 도메인 분류            |
| `definitions` | JSONB        | NOT NULL                 | nano/micro/vista 정의  |
| `nature_tag`  | VARCHAR(20)  | NOT NULL, DEFAULT 'RULE' | 용어 성격              |
| `status`      | SMALLINT     | NOT NULL, DEFAULT 1      | 1: Active, 0: Inactive |
| `version_no`  | INTEGER      | NOT NULL, DEFAULT 1      | 버전                   |
| `created_at`  | TIMESTAMPTZ  | NOT NULL, DEFAULT now()  | 생성 시각              |
| `updated_at`  | TIMESTAMPTZ  | NOT NULL, DEFAULT now()  | 수정 시각              |

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

| 컬럼명             | 타입         | 제약                           | 설명                          |
| :----------------- | :----------- | :----------------------------- | :---------------------------- |
| `id`               | UUID         | PK, DEFAULT uuid_v7()          | 연결 ID                       |
| `term_id`          | UUID         | FK -> definitions.id, NOT NULL | 용어 참조                     |
| `capability_id`    | VARCHAR(120) | NOT NULL                       | 기능 ID (`nexa.*`)            |
| `source_filename`  | VARCHAR(255) | NULL                           | 원본 파일명                   |
| `doc_ref_path`     | VARCHAR(255) | NULL                           | 문서 경로                     |
| `doc_anchor`       | VARCHAR(100) | NULL                           | 문서 앵커                     |
| `source_hash`      | VARCHAR(64)  | NULL                           | 문서 해시                     |
| `context_code`     | VARCHAR(20)  | NULL                           | Context 코드 (`SYS`, `AIS`)   |
| `doctype_code`     | VARCHAR(20)  | NULL                           | DocType 코드 (`RFC`, `ARCH`)  |
| `version_label`    | VARCHAR(30)  | NULL                           | 버전 표기 (`v1`, `v0.8`)      |
| `prefix_flag`      | VARCHAR(10)  | NOT NULL, DEFAULT 'NONE'       | `_`, `@`, `NONE`              |
| `parser_version`   | VARCHAR(40)  | NULL                           | 파일명 규칙 파서 버전         |
| `parse_confidence` | NUMERIC(5,4) | NULL                           | 파싱 신뢰도 (0~1)             |
| `confidence_score` | SMALLINT     | GENERATED (parse_confidence*100) | UI 연동 점수 (0~100)        |
| `status`           | SMALLINT     | NOT NULL, DEFAULT 1            | 1: Active, 0: Inactive        |
| `created_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        | 생성 시각                     |
| `updated_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        | 갱신 시각                     |

연동 규칙:

- `confidence_score`는 `parse_confidence`를 100점 환산한 읽기 전용 점수다.
- UI(NIXIE)는 `project_settings.user_defined_threshold`(기본 95)와 비교한다.
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

| 컬럼명          | 타입         | 제약                    | 설명                                      |
| :-------------- | :----------- | :---------------------- | :---------------------------------------- |
| `id`            | UUID         | PK, DEFAULT uuid_v7()   | 로그 ID                                   |
| `entity_type`   | VARCHAR(40)  | NOT NULL                | definition/token/reference/vector/request |
| `entity_id`     | UUID         | NOT NULL                | 대상 ID                                   |
| `action_type`   | VARCHAR(20)  | NOT NULL                | create/update/deactivate/approve/reject   |
| `before_data`   | JSONB        | NULL                    | 변경 전                                   |
| `after_data`    | JSONB        | NULL                    | 변경 후                                   |
| `changed_by`    | VARCHAR(120) | NOT NULL                | 변경 주체                                 |
| `change_reason` | VARCHAR(255) | NULL                    | 사유                                      |
| `error_token`   | VARCHAR(80)  | NULL                    | 반복 오류 분류 토큰                       |
| `error_context` | JSONB        | NULL                    | 오류 문맥(용어/기능/입력 스냅샷)          |
| `error_signature` | VARCHAR(120) | NULL                  | 오류 패턴 군집화 키(해시/정규화 문자열)   |
| `created_at`    | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | 시각                                      |

접근 제어 원칙:

- `nexa_knowledge_audit_logs`는 관리자/보안 운영자만 조회 가능해야 한다.
- 일반 사용자 및 일반 도메인 API에는 원본 audit row를 직접 노출하지 않는다.

---

## 2) 보강 테이블

### 2.1 `nexa_knowledge_distribution_profiles` (차등 배포)

| 컬럼명               | 타입        | 제약                    | 설명             |
| :------------------- | :---------- | :---------------------- | :--------------- |
| `id`                 | UUID        | PK, DEFAULT uuid_v7()   | 프로파일 ID      |
| `profile_name`       | VARCHAR(20) | UNIQUE, NOT NULL        | nano/micro/vista |
| `include_levels`     | JSONB       | NOT NULL                | 포함 레벨 규칙   |
| `include_categories` | JSONB       | NOT NULL                | 카테고리 필터    |
| `max_payload_kb`     | INTEGER     | NOT NULL                | 최대 크기        |
| `package_format`     | VARCHAR(20) | NOT NULL                | json/bin         |
| `ota_channel`        | VARCHAR(40) | NOT NULL                | 배포 채널        |
| `version_tag`        | VARCHAR(40) | NOT NULL                | 패키지 버전      |
| `intelligence_tier`  | VARCHAR(20) | NOT NULL                | nano/micro/vista |
| `include_vectors`    | BOOLEAN     | NOT NULL, DEFAULT FALSE | 벡터 포함 여부   |
| `required_tokens_only` | BOOLEAN   | NOT NULL, DEFAULT TRUE  | 필수 토큰만 포함 |
| `status`             | SMALLINT    | NOT NULL, DEFAULT 1     | 활성 상태        |
| `updated_at`         | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 갱신 시각        |

프로파일 정책(필수):

- `nano`는 `include_vectors=false`, `required_tokens_only=true`, `max_payload_kb < 10`
- `nano` 패키지는 `definitions.nano`만 포함하고 벡터 데이터는 금지
- `micro`는 `max_payload_kb <= 256`(WARM 기본 상한)
- `vista`는 `max_payload_kb <= 4096`(HOT 기본 상한)

### 2.1-A `nexa_hardware_profiles` (하드웨어 프로파일)

| 컬럼명             | 타입         | 제약                        | 설명                  |
| :----------------- | :----------- | :-------------------------- | :-------------------- |
| `hardware_profile` | VARCHAR(20)  | PK                          | COLD/WARM/HOT         |
| `cpu_class`        | VARCHAR(40)  | NOT NULL                    | 장치 CPU 등급         |
| `memory_mb`        | INTEGER      | NOT NULL                    | 메모리(MB)            |
| `storage_mb`       | INTEGER      | NOT NULL                    | 저장소(MB)            |
| `allow_vectors`    | BOOLEAN      | NOT NULL                    | 벡터 허용 여부        |
| `max_payload_kb`   | INTEGER      | NOT NULL                    | 패키지 상한           |
| `status`           | SMALLINT     | NOT NULL, DEFAULT 1         | 활성 상태             |
| `updated_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT now()     | 갱신 시각             |

### 2.1-B `nexa_knowledge_distribution_bindings` (지능-하드웨어 매핑)

| 컬럼명              | 타입         | 제약                                | 설명                            |
| :------------------ | :----------- | :---------------------------------- | :------------------------------ |
| `binding_id`        | UUID         | PK, DEFAULT uuid_v7()               | 매핑 ID                         |
| `profile_id`        | UUID         | FK -> distribution_profiles.id       | 배포 프로파일                   |
| `hardware_profile`  | VARCHAR(20)  | FK -> hardware_profiles.hardware_profile | COLD/WARM/HOT                |
| `is_default`        | BOOLEAN      | NOT NULL, DEFAULT FALSE              | 기본 매핑 여부                  |
| `status`            | SMALLINT     | NOT NULL, DEFAULT 1                  | 활성 상태                       |
| `created_at`        | TIMESTAMPTZ  | NOT NULL, DEFAULT now()              | 생성 시각                       |
| `updated_at`        | TIMESTAMPTZ  | NOT NULL, DEFAULT now()              | 갱신 시각                       |

운영 규칙:

- `COLD`는 `nano` 프로파일만 허용한다.
- `COLD`는 `allow_vectors=false`, `max_payload_kb < 10` 강제.
- `WARM`은 `nano/micro`, `HOT`은 `nano/micro/vista`를 허용한다.
- `WARM`의 패키지 상한은 `<= 256KB`, `HOT`의 패키지 상한은 `<= 4096KB`로 고정한다.

### 2.2 `nexa_knowledge_doc_sync_state` (문서 동기화 상태)

| 컬럼명             | 타입         | 제약                    | 설명                 |
| :----------------- | :----------- | :---------------------- | :------------------- |
| `id`               | UUID         | PK, DEFAULT uuid_v7()   | 상태 ID              |
| `doc_ref_path`     | VARCHAR(255) | UNIQUE, NOT NULL        | 문서 경로            |
| `last_hash`        | VARCHAR(64)  | NOT NULL                | 최근 해시            |
| `last_scanned_at`  | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | 최근 스캔            |
| `last_sync_status` | VARCHAR(20)  | NOT NULL                | success/fail/skipped/deleted |
| `last_error`       | TEXT         | NULL                    | 실패 사유            |
| `missing_since`    | TIMESTAMPTZ  | NULL                    | 파일 미발견 최초 시각 |
| `deleted_at`       | TIMESTAMPTZ  | NULL                    | 삭제 확정 시각       |

삭제 이벤트 처리 규약:

- Crawler가 파일 미발견 감지 시 `last_sync_status='deleted'`로 전환
- 최초 미발견 시각은 `missing_since`에 기록하고, 삭제 확정 시 `deleted_at` 기록
- 해당 `doc_ref_path`를 참조하는 `nexa_knowledge_references`는 `status=0`으로 비활성화
- 위 전환 이벤트는 `nexa_knowledge_audit_logs`에 반드시 기록

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

| 컬럼명               | 타입         | 제약                           | 설명                               |
| :------------------- | :----------- | :----------------------------- | :--------------------------------- |
| `rule_id`            | UUID         | PK, DEFAULT uuid_v7()          | 규칙 ID                            |
| `rule_version`       | VARCHAR(40)  | UNIQUE, NOT NULL               | 규칙 버전                          |
| `filename_pattern`   | TEXT         | NOT NULL                       | 파일명 파싱 패턴(정규식/템플릿)    |
| `context_whitelist`  | JSONB        | NOT NULL                       | 허용 Context 코드 목록              |
| `doctype_whitelist`  | JSONB        | NOT NULL                       | 허용 DocType 코드 목록              |
| `prefix_policy`      | JSONB        | NOT NULL                       | `_`, `@` 처리 규칙                 |
| `is_active`          | BOOLEAN      | NOT NULL, DEFAULT FALSE        | 활성 규칙 여부                     |
| `effective_from`     | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        | 적용 시작 시각                     |
| `effective_to`       | TIMESTAMPTZ  | NULL                           | 적용 종료 시각                     |
| `created_by`         | VARCHAR(120) | NOT NULL                       | 생성 주체                          |
| `created_at`         | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        | 생성 시각                          |
| `updated_at`         | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        | 갱신 시각                          |

### 2.5 `nexa_knowledge_reference_assets` (문서 참조 자산 연결)

| 컬럼명         | 타입         | 제약                             | 설명                                   |
| :------------- | :----------- | :------------------------------- | :------------------------------------- |
| `id`           | UUID         | PK, DEFAULT uuid_v7()            | 연결 ID                                |
| `reference_id` | UUID         | FK -> references.id, NOT NULL    | 문서 참조 레코드                       |
| `asset_id`     | UUID         | FK -> project_assets.asset_id    | 자산 원장 ID                           |
| `usage_type`   | VARCHAR(20)  | NOT NULL                         | embedded/attachment/citation/thumbnail |
| `doc_anchor`   | VARCHAR(100) | NULL                             | 문서 내 첨부 앵커                      |
| `caption`      | VARCHAR(255) | NULL                             | 캡션                                   |
| `sort_order`   | INTEGER      | NOT NULL, DEFAULT 0              | 정렬 순서                              |
| `is_primary`   | BOOLEAN      | NOT NULL, DEFAULT FALSE          | 대표 자산 여부                         |
| `status`       | SMALLINT     | NOT NULL, DEFAULT 1              | 1: Active, 0: Inactive                 |
| `created_at`   | TIMESTAMPTZ  | NOT NULL, DEFAULT now()          | 생성 시각                              |
| `updated_at`   | TIMESTAMPTZ  | NOT NULL, DEFAULT now()          | 갱신 시각                              |

운영 원칙:

- 파일 실체 저장/쿼터 계산은 `project_assets`가 담당한다.
- 본 테이블은 문서 참조 문맥(앵커/용도/정렬)만 담당한다.

### 2.6 `nexa_knowledge_error_patterns` (자가 회복 패턴 집계)

| 컬럼명                 | 타입         | 제약                           | 설명                                  |
| :--------------------- | :----------- | :----------------------------- | :------------------------------------ |
| `pattern_id`           | UUID         | PK, DEFAULT uuid_v7()          | 패턴 ID                               |
| `error_token`          | VARCHAR(80)  | NOT NULL                       | 오류 분류 토큰                        |
| `error_signature`      | VARCHAR(120) | NOT NULL                       | 패턴 군집 키                          |
| `occurrence_count`     | INTEGER      | NOT NULL, DEFAULT 1            | 누적 발생 횟수                        |
| `first_seen_at`        | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        | 최초 관측 시각                        |
| `last_seen_at`         | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        | 최근 관측 시각                        |
| `impact_score`         | NUMERIC(6,2) | NOT NULL, DEFAULT 0            | 영향도 점수                           |
| `sample_context`       | JSONB        | NULL                           | 마스킹된 대표 문맥                    |
| `suggested_rule_patch` | JSONB        | NULL                           | AI 제안 규칙 패치                     |
| `review_status`        | VARCHAR(20)  | NOT NULL, DEFAULT 'pending'    | pending/approved/rejected             |
| `reviewed_by`          | VARCHAR(120) | NULL                           | 검토자                                |
| `reviewed_at`          | TIMESTAMPTZ  | NULL                           | 검토 시각                             |
| `created_at`           | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        | 생성 시각                             |
| `updated_at`           | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        | 갱신 시각                             |

운영 원칙:

- AI는 `nexa_knowledge_error_patterns`를 기반으로 `nexa_knowledge_ref_rules` 수정안을 생성한다.
- AI는 규칙을 직접 반영하지 않고 `nexa_knowledge_change_requests` 승인 큐로만 제안한다.
- 일반 사용자에게는 집계 지표만 노출하고, 원본 오류 문맥은 관리자만 조회한다.

### 2.7 `nexa_knowledge_response_policies` (ES/VI 기반 응답 정책)

| 컬럼명             | 타입         | 제약                        | 설명                         |
| :----------------- | :----------- | :-------------------------- | :--------------------------- |
| `policy_id`        | UUID         | PK, DEFAULT uuid_v7()       | 정책 ID                      |
| `policy_name`      | VARCHAR(80)  | UNIQUE, NOT NULL            | 정책명                       |
| `scope_type`       | VARCHAR(20)  | NOT NULL                    | global/project/user          |
| `scope_id`         | UUID         | NULL                        | 프로젝트/사용자 식별자       |
| `es_threshold`     | NUMERIC(4,3) | NOT NULL                    | 공감 지수 임계값             |
| `vi_threshold`     | NUMERIC(4,3) | NOT NULL                    | 활력 지수 임계값             |
| `output_mode`      | VARCHAR(20)  | NOT NULL                    | easy/normal/expert           |
| `summary_priority` | SMALLINT     | NOT NULL, DEFAULT 100       | 낮을수록 우선순위 높음       |
| `is_active`        | BOOLEAN      | NOT NULL, DEFAULT TRUE      | 활성 여부                    |
| `created_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT now()     | 생성 시각                    |
| `updated_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT now()     | 갱신 시각                    |

운영 원칙:

- ES/VI 임계값은 `definitions` JSONB가 아닌 본 정책 테이블에서 관리한다.
- `Low-Entropy`(예: `vi < vi_threshold`) 구간은 `output_mode='easy'`를 우선 적용한다.
- AI는 정책을 직접 반영하지 않고 승인 큐 경로로만 제안한다.

### 2.8 `nexa_self_*` (Multi-faceted Self 공통 자산 계층)

> NEXU 전용 UI 상태가 아닌 플랫폼 공통 자산으로 관리한다.
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
- NEXU 채널과 오케스트레이션 직접 채널 모두 같은 `nexa_self_*`를 재사용한다.
- Self 규칙 변경은 감사 로그와 승인 큐 정책을 준수한다.

---

## 3) `definitions` JSONB 계약

```json
{
  "nano": { "summary": "..." },
  "micro": { "summary": "..." },
  "vista": { "summary": "..." },
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

- `nano`, `micro`, `vista` 키 존재
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
- 명세: `_ 용어 및 시스템 설계 파일 관리 CRUD 테이블 명세서.md` (본 문서)
- DDL: `_ 용어 및 시스템 설계 파일 관리 통합 스키마 DDL.md`

### 5.1 핵심 테이블 정합성

| 테이블 | 정합 상태 | 비고 |
| :-- | :-- | :-- |
| `nexa_knowledge_definitions` | 일치 | 필수 컬럼/기본값/상태 제약 반영 |
| `nexa_term_tokens` | 일치 | `status`, `created_at`, `layer_type` CHECK 반영 |
| `nexa_knowledge_references` | 일치 | 코드 기반 분류 컬럼(`context_code`, `doctype_code`) 반영 |
| `nexa_knowledge_vectors` | 일치 | `embedding_dim`, `vector_search_status` 제약 반영 |
| `nexa_knowledge_audit_logs` | 일치 | 감사 로그 시계열 테이블(hypertable) 반영 |

### 5.2 보강 테이블 정합성

| 테이블 | 정합 상태 | 비고 |
| :-- | :-- | :-- |
| `nexa_knowledge_distribution_profiles` | 일치 | 프로파일명 CHECK(`nano/micro/vista`) 반영 |
| `nexa_hardware_profiles` | 일치 | COLD/WARM/HOT 하드웨어 제약 반영 |
| `nexa_knowledge_distribution_bindings` | 일치 | 지능 위계-하드웨어 매핑 제약 반영 |
| `nexa_knowledge_doc_sync_state` | 일치 | `last_sync_status` 운영 인덱스 반영 |
| `nexa_knowledge_change_requests` | 일치 | `is_pending`, `review_note`, 상태 CHECK 반영 |
| `nexa_knowledge_ref_rules` | 일치 | 활성 규칙 단일화 인덱스 반영 |
| `nexa_knowledge_reference_assets` | 일치 | `project_assets` FK + usage_type CHECK 반영 |
| `nexa_knowledge_error_patterns` | 일치 | 오류 패턴 집계 + 검토 상태 워크플로 반영 |
| `nexa_knowledge_response_policies` | 일치 | ES/VI 임계값 기반 출력 정책 반영 |
| `nexa_self_profiles` | 일치 | 사용자별 Self 프로필 분리 반영 |
| `nexa_self_facets` | 일치 | Multi-faceted Self 축 반영 |
| `nexa_self_states` | 일치 | `Empty` 포함 상태 모델 반영 |
| `nexa_self_explosions` | 일치 | 역방향 분해 맵(Explosion) 반영 |
| `nexa_self_knowledge_map` | 일치 | Self-knowledge 브리지 반영 |
| `nexa_self_capability_links` | 일치 | Self-Capability 연결 반영 |

### 5.3 제약/인덱스 정합성

| 항목 | 정합 상태 | 비고 |
| :-- | :-- | :-- |
| UUID v7 함수 보장 | 반영 | `uuid_generate_v7()` fallback 포함 |
| 확장 보장 | 반영 | `timescaledb`, `vector`, `pgcrypto`, `pg_uuidv7` |
| 상태값 CHECK | 반영 | status/request_status/layer_type |
| 검색 인덱스 | 반영 | category/status, token lookup, reference lookup |
| 벡터 인덱스 | 반영 | HNSW `vector_cosine_ops` |

### 5.4 운영 규칙 일치 여부

- 사용자 Capability 접두사 강제는 `type='user'` 조건으로 통일
- `capability_id` 없는 참조 데이터 생성 방지
- 참조 문서 파싱은 활성 규칙(`nexa_knowledge_ref_rules.is_active=true`) 기준 단일 적용
- 첨부 파일은 `project_assets` quota 검증 통과 건만 `nexa_knowledge_reference_assets`에 연결
- 승인 큐 기반 변경 통제 + 감사 로그 적재 일관성 확보

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
  - `nexa_knowledge_response_policies`
  - `nexa_knowledge_error_patterns`
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
   - 프로파일(`nano/micro/vista`) 기본행
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
- 상세 흐름·API 예시는 `_ 용어 및 시스템 설계 파일 관리 운영 아키텍처.md`의 연동 절을 본다.

# \_ 지능형 용어 관리 Glossary DB용 CRUD 테이블 스키마 설계안

본 문서는 NEXA Glossary DB의 단일 스키마 기준(SSOT)이다.

---

## 1) 핵심 테이블

### 1.1 `nexa_glossary_definitions`

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

### 1.3 `nexa_glossary_references`

| 컬럼명          | 타입         | 제약                           | 설명                   |
| :-------------- | :----------- | :----------------------------- | :--------------------- |
| `id`            | UUID         | PK, DEFAULT uuid_v7()          | 연결 ID                |
| `term_id`       | UUID         | FK -> definitions.id, NOT NULL | 용어 참조              |
| `capability_id` | VARCHAR(120) | NOT NULL                       | 기능 ID (`nexa.*`)     |
| `doc_ref_path`  | VARCHAR(255) | NULL                           | 문서 경로              |
| `doc_anchor`    | VARCHAR(100) | NULL                           | 문서 앵커              |
| `source_hash`   | VARCHAR(64)  | NULL                           | 문서 해시              |
| `status`        | SMALLINT     | NOT NULL, DEFAULT 1            | 1: Active, 0: Inactive |
| `created_at`    | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        | 생성 시각              |
| `updated_at`    | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        | 갱신 시각              |

### 1.4 `nexa_glossary_vectors`

| 컬럼명                 | 타입        | 제약                                   | 설명              |
| :--------------------- | :---------- | :------------------------------------- | :---------------- |
| `id`                   | UUID        | PK, DEFAULT uuid_v7()                  | 벡터 ID           |
| `term_id`              | UUID        | FK -> definitions.id, UNIQUE, NOT NULL | 용어 참조         |
| `embedding_model`      | VARCHAR(80) | NOT NULL                               | 모델명            |
| `embedding_dim`        | SMALLINT    | NOT NULL, DEFAULT 768                  | 차원              |
| `description_vector`   | VECTOR(768) | NOT NULL                               | 임베딩            |
| `vector_search_status` | SMALLINT    | NOT NULL, DEFAULT 1                    | 1: Active, 0: Off |
| `updated_at`           | TIMESTAMPTZ | NOT NULL, DEFAULT now()                | 갱신 시각         |

### 1.5 `nexa_glossary_audit_logs`

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
| `created_at`    | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | 시각                                      |

---

## 2) 보강 테이블

### 2.1 `nexa_glossary_distribution_profiles` (차등 배포)

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
| `status`             | SMALLINT    | NOT NULL, DEFAULT 1     | 활성 상태        |
| `updated_at`         | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 갱신 시각        |

### 2.2 `nexa_glossary_doc_sync_state` (문서 동기화 상태)

| 컬럼명             | 타입         | 제약                    | 설명                 |
| :----------------- | :----------- | :---------------------- | :------------------- |
| `id`               | UUID         | PK, DEFAULT uuid_v7()   | 상태 ID              |
| `doc_ref_path`     | VARCHAR(255) | UNIQUE, NOT NULL        | 문서 경로            |
| `last_hash`        | VARCHAR(64)  | NOT NULL                | 최근 해시            |
| `last_scanned_at`  | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | 최근 스캔            |
| `last_sync_status` | VARCHAR(20)  | NOT NULL                | success/fail/skipped |
| `last_error`       | TEXT         | NULL                    | 실패 사유            |

### 2.3 `nexa_glossary_change_requests` (불변 토큰 승인 큐)

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

---

## 3) `definitions` JSONB 계약

```json
{
  "nano": { "summary": "..." },
  "micro": { "summary": "..." },
  "vista": { "summary": "..." },
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

---

## 4) 불변 토큰 변경 워크플로우

1. 수정 요청 수신
2. 대상이 `is_immutable=true`이면 본 테이블 즉시 업데이트 금지
3. `nexa_glossary_change_requests`에 pending 생성
4. 관리자 승인 시에만 실제 반영
5. 승인/반려 모두 `nexa_glossary_audit_logs` 기록

---

## 5) DDL 정합성 매트릭스 (CRUD ↔ 통합 DDL)

기준 파일:
- 명세: `_ 지능형 용어 관리 CRUD 테이블 명세서.md` (본 문서)
- DDL: `_ 지능형 용어 관리 자산 통합 스키마 DDL.md`

### 5.1 핵심 테이블 정합성

| 테이블 | 정합 상태 | 비고 |
| :-- | :-- | :-- |
| `nexa_glossary_definitions` | 일치 | 필수 컬럼/기본값/상태 제약 반영 |
| `nexa_term_tokens` | 일치 | `status`, `created_at`, `layer_type` CHECK 반영 |
| `nexa_glossary_references` | 일치 | `capability_id NOT NULL`, 참조 제한(`RESTRICT`) 반영 |
| `nexa_glossary_vectors` | 일치 | `embedding_dim`, `vector_search_status` 제약 반영 |
| `nexa_glossary_audit_logs` | 일치 | 감사 로그 시계열 테이블(hypertable) 반영 |

### 5.2 보강 테이블 정합성

| 테이블 | 정합 상태 | 비고 |
| :-- | :-- | :-- |
| `nexa_glossary_distribution_profiles` | 일치 | 프로파일명 CHECK(`nano/micro/vista`) 반영 |
| `nexa_glossary_doc_sync_state` | 일치 | `last_sync_status` 운영 인덱스 반영 |
| `nexa_glossary_change_requests` | 일치 | `is_pending`, `review_note`, 상태 CHECK 반영 |

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
   - `nexa_glossary_definitions`
   - `nexa_term_tokens`
   - `nexa_glossary_references`
   - `nexa_glossary_vectors`
5. **운영 보강 테이블**
   - `nexa_glossary_distribution_profiles`
   - `nexa_glossary_doc_sync_state`
   - `nexa_glossary_change_requests`
   - `nexa_glossary_audit_logs` + hypertable 변환
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
  'nexa_glossary_definitions',
  'nexa_term_tokens',
  'nexa_glossary_references',
  'nexa_glossary_vectors',
  'nexa_glossary_distribution_profiles',
  'nexa_glossary_doc_sync_state',
  'nexa_glossary_change_requests',
  'nexa_glossary_audit_logs'
);

-- 2) status/check 제약 확인
SELECT conname, conrelid::regclass AS table_name
FROM pg_constraint
WHERE conname LIKE 'chk_%'
  AND conrelid::regclass::text LIKE 'nexa_glossary%';

-- 3) HNSW 인덱스 확인
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename = 'nexa_glossary_vectors';

-- 4) hypertable 전환 확인(timescaledb)
SELECT hypertable_name
FROM timescaledb_information.hypertables
WHERE hypertable_name = 'nexa_glossary_audit_logs';
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
- **`nexa_glossary_vectors`**: 용어 본문(또는 합의된 입력 문자열)을 Ollama 임베딩 API로 벡터화한 뒤 **UPSERT**. 모델명·차원은 `embedding_model` / `embedding_dim` / DDL의 `VECTOR(n)`과 일치해야 한다.
- **불변 토큰·승인 큐**: Ollama 출력 → 검증 → 필요 시 `nexa_glossary_change_requests` → 승인 후 본 테이블 반영.
- 상세 흐름·API 예시는 `_ 지능형 용어 관리 시스템 NEXA Glossary DB.md` §2.6을 본다.

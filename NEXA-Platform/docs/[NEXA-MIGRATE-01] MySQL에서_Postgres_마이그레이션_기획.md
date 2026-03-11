# [NEXA-MIGRATE-01] MySQL에서 Postgres 마이그레이션 기획

**목적**: MySQL 기반 NEXA 플랫폼을 **PostgreSQL + TimescaleDB**로 마이그레이션하여, **IoT 플랫폼 특성상 데이터 증가에 따른 엄격한 보안 관리**, **시계열 데이터(센서·사용량·감사 로그) 효율적 처리**, **AI 협업을 위한 JSON 표준 규격·효율적 활용**, [NEXA-AUTH-01] 인증 기반·RLS(Row-Level Security) 적용 및 장기 기술 스택 일관성을 확보한다.

**상태**: 임시 할당 — 마이그레이션 이해·계획 수립용

**작업 순서**: **Postgres 마이그레이션** → **인증 구현** → **나머지 기능 구현**

**작성일**: 2025-03

---

## 1. 배경 및 필요성

| 구분 | 내용 |
|------|------|
| **현재** | MySQL (mysql2) 사용. 실험·UI 테스트용 데이터 수준. 재입력 가능 |
| **목표** | Postgres 기반으로 전환. [NEXA-STACK-01]·[NEXA-AUTH-01]과 정합성 확보 |
| **핵심 이유** | **RLS** — device_registry·device_members 등에 DB 수준 행 보안 적용. MySQL은 RLS 미지원 |

### Postgres 선택 근거

| 관점 | 설명 |
|------|------|
| **IoT 플랫폼 특성** | NEXA는 IoT·엣지 디바이스 연동 플랫폼. 디바이스 수·센서 데이터·이벤트가 증가할수록 **데이터 양이 빠르게 늘어나며**, 이에 맞춘 **엄격한 보안 관리**가 필수. DB 수준의 행 보안(RLS)으로 애플리케이션 실수·누락 시에도 다른 사용자·디바이스 데이터 유출을 원천 차단 |
| **데이터량·보안 강화** | 규모 확대 시 사용자·디바이스·API 사용량·감사 로그 등이 쌓임. **RLS, 정책 기반 접근 제어, 감사 추적**을 DB가 강제하는 Postgres가 장기적으로 안전. MySQL은 RLS 미지원 |
| **JSONB** | 가변적인 **IoT 센서 데이터**의 유연한 저장 및 GIN 인덱싱. AI 도메인 프로젝트·메타데이터·채팅·룰/프롬프트 등 JSON 기반 구조 표준 활용. 부분 쿼리·스키마 확장성 |
| **pgvector** | AI 워크스페이스용 **벡터 검색(RAG)** 인프라 통합. 임베딩 저장·유사도 검색 |
| **RLS** | **도메인별** 행 수준 보안. 강력한 데이터 격리 |
| **인증 기획 선행** | [NEXA-AUTH-01] users, device_registry, device_members 등은 Postgres 전제로 설계됨 |
| **기술 스택 정합성** | [NEXA-STACK-01] Postgres 명시. 장기 일관성 유지 |
| **시계열·TimescaleDB** | 센서·API 사용량·감사 로그 등 **타임스탬프 기반 데이터**가 IoT 플랫폼에서 급증. Postgres 위 **TimescaleDB** 확장으로 하이퍼테이블·압축·시간 구간 조회 최적화 |
| **데이터 특성** | 현재 데이터는 적고 실험용이라 재입력 가능 → 마이그레이션 부담 낮음 |

---

## 2. 마이그레이션 전략

### 2.1 전체 순서

```
1. Postgres 마이그레이션 (본 문서)
   └─ 인프라·스키마·코드 전환
2. 인증 구현 ([NEXA-AUTH-01])
   └─ users, device_registry, device_members, RLS 등
3. 나머지 기능 구현
   └─ 기존 도메인(parts, archive, AI 등) 기능·확장
```

### 2.2 접근 방식

- **데이터 이관**: 현재 데이터가 적고 실험용이므로 **스키마 재생성 + 수동 재입력** 우선 검토. 필요 시 **DBeaver 데이터 전송**(Export Data → Database) 또는 mysqldump → pg_loader로 일괄 이관
- **코드 전환**: mysql2 → pg(node-postgres). 쿼리 문법·플레이스홀더(`?` → `$1`, `$2`) 변환
- **DB 관리 도구**: **DBeaver** 기준. MySQL·Postgres 둘 다 마이그레이션 전후 동일 도구로 연결·비교·검증

### 2.3 마이그레이션 정책

기존 MySQL 로직은 유지하되, **데이터 타입 선언 시 PostgreSQL의 고급 타입을 적극 활용**하여 쿼리 효율을 최적화한다. 예: `JSONB`(센서·메타데이터), `TIMESTAMPTZ`, `BOOLEAN`, **`UUID`**(users, device_registry 등 — UUID v7 사용, gen_random_uuid() 금지), `vector`(pgvector, RAG용).

#### pgvector / RAG 시점 정리

| 구간 | 내용 |
|------|------|
| **마이그레이션 (Phase 3)** | pgvector **설치·활성화** (`CREATE EXTENSION vector`). 인프라 구성만 수행. 기본 DB 동작 검증 후 인프라 확정 |
| **별도 Phase (이후)** | RAG 기능 **적용·검증** — 임베딩 테이블 설계, 벡터 검색 API, AI 워크스페이스 연동 등은 인증·기능 구현 단계에서 진행 |

→ 마이그레이션 문서에서는 “pgvector 인프라 준비”까지만 다룸. 실제 RAG 적용 검증은 별도로 문서·작업에 남긴다.

### 2.4 서버 JS→TS 마이그레이션 (후순위)

**Postgres 마이그레이션 완료 후** `server/` 내 `.js` → `.ts` 전환. 순서: (1) DB 마이그레이션 → (2) 인증 구현 → (3) server JS→TS. 동시 진행 시 변경 범위·리스크가 커지므로 분리.

### 2.5 데이터 마이그레이션 절차 (선택)

현재 데이터는 **샘플 수준**이라 스키마 재생성 + 수동 재입력으로 충분. 아래 절차는 **공부·참고용**으로 둔다. 데이터가 늘어나면 활용.

#### 2.5.1 이관 방법

| 방법 | 절차 |
|------|------|
| **DBeaver** | MySQL 테이블 우클릭 → Export Data → Target: Database → Postgres 선택 → 컬럼 매핑 → 실행 |
| **mysqldump → 변환** | `mysqldump --no-create-info` 등으로 데이터만 추출 → MySQL 문법을 Postgres용으로 변환 스크립트 처리 → `psql` 실행 |
| **pgloader** | `pgloader mysql://user:pass@host/db postgresql://user:pass@host/db` — 자동 변환 시도. 타입·문법 차이 주의 |

#### 2.5.2 데이터 검증

| 항목 | 방법 |
|------|------|
| **행 수** | `SELECT COUNT(*) FROM t` — MySQL·Postgres 양쪽 비교 |
| **샘플 비교** | 핵심 테이블 몇 건 추출 → 주요 컬럼 값 대조 |
| **FK 무결성** | 부모·자식 테이블 조인 쿼리로 누락·고아 확인 |

#### 2.5.3 이관용 테스트 절차

1. **이관 전**: MySQL에서 `COUNT`, 샘플 쿼리 결과 스냅샷 저장
2. **이관 실행**: DBeaver/pgloader/스크립트 수행
3. **이관 후**: Postgres에서 동일 `COUNT`·샘플 쿼리 실행 → 결과 비교
4. **애플리케이션 검증**: Postgres 연결 후 핵심 API 호출·화면 동작 확인

### 2.6 롤백·위험 관리

#### 2.6.1 롤백 절차 (마이그레이션 실패 시)

| 단계 | 조치 |
|------|------|
| **Phase 2 이전** | DB 설정·코드 변경 없음. 별도 조치 불필요 |
| **Phase 2~3** | `.env`를 `MYSQL_*`로 복원, `dbConfig.js`를 mysql2로 되돌림, docker-compose에서 Postgres 비활성화 |
| **Phase 4** | Git으로 영향 파일 revert. `mysql2` 패키지 유지·`pg` 제거 |
| **Phase 5 이후** | 위와 동일 + UI·문서 내 DBeaver/Postgres 언급 원복 |

- **전제**: Phase 2~3 동안 **MySQL 서비스는 유지** (docker-compose에서 둘 다 띄우거나, MySQL만 사용). DB 교체 전까지 롤백은 코드·환경 변수 revert로 가능.

#### 2.6.2 포인트 오브 노 리턴 (PoNR)

| 구간 | 정의 | 롤백 난이도 |
|------|------|-------------|
| **PoNR 이전** | mysql2 코드·MySQL 연결 유지. Postgres는 병렬 검증만 | 낮음 — env·코드 revert |
| **PoNR** | `mysql2` 제거, docker-compose에서 MySQL 제거, 모든 코드가 pg 전용으로 전환된 시점 | 높음 — MySQL 재설정·코드 재변환 필요 |

- **권장**: Phase 4에서 **mysql2 제거**하기 전에 Postgres 동작·핵심 기능을 충분히 검증. mysql2 제거 = PoNR로 간주.

#### 2.6.3 Phase별 리스크·완료 조건

| Phase | 주요 리스크 | 완료 조건 |
|-------|-------------|-----------|
| **1** | Docker·환경 설정 오류 | Postgres 컨테이너 기동, DBeaver로 연결 확인 |
| **2** | 연결 실패, env 누락 | server 기동, `SELECT 1` 성공 |
| **3** | 스키마·FK·트리거 오류 | 10개 테이블 생성, 트리거 적용, DBeaver에서 구조 확인 |
| **4** | 쿼리 문법·API 차이로 런타임 에러 | 영향 파일 변환 완료, mysql2 제거, 핵심 API·화면 동작 확인 |
| **5** | databaseSchema.js API 응답 구조 변경으로 프론트 연동 깨짐 | DatabaseViewer.vue 등 `/api/db` 연동 전체 플로우 검증 완료 |
| **6** | 문서·배포 불일치 | 관련 문서 업데이트 완료 |

### 2.7 테스트 전략

#### 2.7.1 Phase별 검증

| Phase | 검증 방법 |
|-------|-----------|
| **1** | DBeaver로 Postgres 연결, `SELECT 1` 실행 |
| **2** | server 기동, `GET /api/health/ready` → 200 응답 |
| **3** | 테이블·트리거 생성 후 DBeaver에서 스키마·데이터 확인 |
| **4** | 영향 API 호출 (parts, archive, files 등). 에러 없이 응답 확인 |
| **5** | **databaseSchema.js ↔ DatabaseViewer.vue 연동 집중**: `/api/db` 테이블 목록·컬럼·인덱스·쿼리 실행·백업 등 전체 플로우 검증 (API 응답 구조 변경 가능성 있음) |
| **6** | 배포 가이드·문서대로 실행 검증 |

#### 2.7.2 마이그레이션 후 스모크 테스트

| 항목 | 검증 방법 |
|------|-----------|
| **DB 연결** | `GET /api/health/ready` → `{ status: 'ready', db: 'connected' }` |
| **parts CRUD** | part_classes 목록·추가·수정·삭제 (또는 part_models, part_specs) |
| **part_files** | 파일 업로드·목록 조회·다운로드 |
| **archive** | archives 목록·생성·archive_doc 읽기/쓰기 |
| **files** | 파일 업로드·file_references 등록·조회 |
| **ai_user_memos** | 메모 목록·추가·수정·삭제 |
| **DB 뷰어** (Phase 5) | DatabaseViewer.vue — 테이블 목록·컬럼·쿼리 실행·백업 등 `/api/db` 전체 플로우 |

#### 2.7.3 E2E 검증 (선택)

- 플랫폼 실행 후 Parts·Archive·AI 도메인 화면에서 핵심 기능 수동 확인
- 또는 Playwright/Cypress 등으로 주요 플로우 자동화 (추후)

### 2.8 일정·우선순위

#### 2.8.1 Phase별 예상 소요 시간

| Phase | 예상 소요 | 비고 |
|-------|-----------|------|
| **1** | 0.5~1일 | DBeaver·Docker·pg 설치 |
| **2** | 0.5일 | dbConfig·env 전환 |
| **3** | 1~2일 | 10개 테이블·트리거·인덱스 |
| **4** | 2~3일 | 영향 파일 변환·검증 (가장 시간 소요) |
| **5** | 0.5~1일 | databaseSchema.js·UI 수정 |
| **6** | 0.5일 | 문서 정리 |
| **합계** | **5~8일** | 학습·디버깅 포함 |

#### 2.8.2 의존 관계

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
   (순차 진행)
```

| 선행 | 후행 | 이유 |
|------|------|------|
| 1 | 2 | Postgres 기동 후 연결 설정 |
| 2 | 3 | dbConfig 전환 후 스키마 생성 |
| 3 | 4 | 스키마 존재 시 코드가 동작 |
| 4 | 5 | API 동작 확인 후 뷰어 도구 수정 |
| 5 | 6 | 도구 정리 후 문서 반영 |

#### 2.8.3 병렬 vs 순차

| 구분 | 작업 |
|------|------|
| **순차** | Phase 1~6 전체. 각 Phase 완료 후 다음 진행 |
| **병렬 가능** | Phase 4 내 영향 파일(parts/archive/AI 등)을 도메인별로 나눠 변환. Phase 5에서 databaseSchema.js와 UI 수정 동시 진행 |

### 2.9 docker-compose 전환·MySQL 제거 정책

- **MySQL 완전 제거** — 전환 후 MySQL 서비스·볼륨을 **완전히 제거**하여 혼선 방지. 병행 운영 없음.
- **검증 흐름**: (1) **로컬** 완전 검증 → (2) **Docker** 이미지 빌드 → (3) **Ubuntu 서버** 배포 → (4) 서버에서 재검증
- **로컬·Ubuntu 공통**: docker-compose에서 MySQL 서비스·볼륨 제거. Postgres만 사용.

| 환경 | DB | 비고 |
|------|-----|------|
| **로컬 (개발)** | Postgres | 검증 완료 후 MySQL 제거 |
| **Ubuntu 서버 (배포)** | Postgres | MySQL Docker 완전 제거 후 배포 |

### 2.10 .env·환경 변수 정리

- **MYSQL_* 완전 제거** — Phase 2 전환 시 `.env`, `.env.example`에서 `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_PORT` 제거
- **변수 명세**: **PG*** 계열 사용 (`PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`). libpq 표준·node-postgres 기본 인식
- **docker-compose**: Postgres 컨테이너 초기화용 `POSTGRES_USER` 등은 `.env`의 `PGUSER` 등을 참조 (`POSTGRES_USER=${PGUSER}`)

---

## 3. 현재 MySQL 스키마 (ERD 기준)

**참조**: `docs/nexa_db.graphml` — DB 내보내기(ERD) 기준의 테이블·컬럼·관계 정의

| 테이블 | 도메인 | 스키마 정의 | 사용 위치 |
|--------|--------|-------------|-----------|
| part_classes | parts | graphml (SQL 파일 없음) | parts.service.js |
| part_models | parts | graphml (SQL 파일 없음) | partModels.routes.js |
| part_specs | parts | graphml (SQL 파일 없음) | partSpecs.routes.js |
| part_files | parts | `database/init_postgres.sql` | partFiles.routes.js |
| files | AI/공통 | `database/init_postgres.sql` | files.routes.js |
| file_references | AI/공통 | `database/init_postgres.sql` | files.routes.js |
| ai_user_memos | AI | `database/init_postgres.sql` | aiUserMemos.routes.js |
| archives | archive | graphml (SQL 파일 없음) | archive.service.js, archive.routes.js, archive.js |
| archive_doc | archive | graphml (SQL 파일 없음) | archive.service.js, archive.routes.js, archive.js |
| system_templates | archive | graphml (SQL 파일 없음) | archive.service.js, archive.js (`category = 'LAYOUT'`) |

- **추가 예정 (인증 단계)**: users, api_usage, device_registry, device_members, invitations, audit_log 등 ([NEXA-AUTH-01] §4)
- **샘플 데이터**: part_classes 등 초기 데이터는 DBeaver/psql에서 수동 INSERT 또는 시드 스크립트로 추가.

#### 3.1 스키마·SQL 파일 정합성

**실제 `database/` 내 스키마 파일 (Postgres 마이그레이션 후)**

| 파일 | 내용 | 비고 |
|------|------|------|
| `init_postgres.sql` | part_classes, part_models, part_specs, system_templates, archives, archive_doc, files, file_references, ai_user_memos, part_files + updated_at 트리거 | 통합 DDL. 실행 순서·FK 순서 포함 |

**참고**: part_classes, part_models, part_specs, archives, archive_doc, system_templates, files, file_references, ai_user_memos, part_files는 모두 `init_postgres.sql`에 정의됨.

**신규 테이블 작성 시 권장 절차**: DBeaver에서 MySQL 테이블 우클릭 → **Generate SQL** → DDL 추출 → MySQL 문법을 §4.1 기준으로 Postgres용으로 다듬기. graphml만 보고 작성하는 것보다 빠르고 누락을 줄일 수 있음.

> **참고**: `archives`에는 `part_class_id` 컬럼이 없음. `partFiles.routes.js` 등에서 `archives.part_class_id`를 참조하는 코드가 있다면 마이그레이션 전 정리 필요.

---

## 4. MySQL → Postgres SQL 변환 가이드

### 4.1 주요 문법 차이

| 항목 | MySQL | Postgres |
|------|-------|----------|
| 자동 증가 | `INT AUTO_INCREMENT` | `SERIAL` 또는 `BIGSERIAL` |
| 문자열 이스케이프 | 백틱 `` ` `` | 이중따옴표 `"` (식별자) |
| 플레이스홀더 | `?` | `$1`, `$2`, ... |
| 날짜 기본값 | `DATETIME DEFAULT CURRENT_TIMESTAMP` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` (동일) |
| ON UPDATE | `ON UPDATE CURRENT_TIMESTAMP` | **미지원** — 트리거로 대체 |
| COMMENT | `COMMENT '...'` (컬럼별) | `COMMENT ON COLUMN ... IS '...'` |
| JSON | `JSON` | `JSONB` 권장 (인덱스·성능) |
| BOOLEAN | `TINYINT`, `BOOLEAN` | `BOOLEAN` |
| VARCHAR 길이 | 생략 가능 | 명시 권장 |

**UUID 전략 (중요)**: NEXA는 **UUID v7**을 표준으로 사용한다. 보안·B-tree 인덱스 효율·엣지–플랫폼 ID 호환을 위해 채택. **gen_random_uuid()는 v4(랜덤)** 이므로 사용 금지.

| 방식 | 채택 | 비고 |
|------|------|------|
| **애플리케이션 레벨** | ✅ | `server/config/uuidUtils.js` — `generateUuidV7()`. Postgres 버전·확장 무관. INSERT 시 id 주입 |
| pg_uuidv7 확장 | — | Postgres 17 미만에서 DB DEFAULT 사용 시 선택 가능 |
| Postgres 17+ `gen_random_uuid_v7()` | — | 현재 timescaledb:pg16 사용으로 미적용 |

- **유틸 위치**: `server/config/uuidUtils.js` (dbConfig 근처). `import { generateUuidV7 } from '../config/uuidUtils.js'`

### 4.2 변환 예시

**MySQL**
```sql
CREATE TABLE part_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Postgres**
```sql
CREATE TABLE part_files (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- updated_at 자동 갱신은 트리거 또는 애플리케이션 레벨에서 처리
```

### 4.3 updated_at 자동 갱신 (Postgres)

MySQL의 `ON UPDATE CURRENT_TIMESTAMP` 대체. **실제 트리거 정의**: `database/init_postgres.sql` 하단 참조.

- 공용 함수 `update_updated_at_column()` 생성
- graphml 기준 `updated_at` 컬럼이 있는 테이블(part_files, ai_user_memos, archives, archive_doc 등)에 트리거 적용

### 4.4 INFORMATION_SCHEMA 차이

- MySQL: `INFORMATION_SCHEMA.TABLES`, `SHOW TABLES`, `DATABASE()`
- Postgres: `information_schema.tables`, `pg_tables`, `current_database()`

### 4.4.1 databaseSchema.js 전환 범위 (전면 전환)

`server/routes/databaseSchema.js`는 단순 쿼리 수정이 아니라 **전면 전환** 필요. INFORMATION_SCHEMA·pg_catalog 구조 차이로 **API 응답 구조 자체가 바뀔 수 있음** — Phase 5에서 프론트엔드(DatabaseViewer.vue 등)와의 **연동 테스트 집중 수행** 필수.

| 항목 | MySQL | Postgres |
|------|-------|----------|
| API 호출 | `dbConnection.execute()` | `pool.query()` (결과: `{ rows }`) |
| DB명 조회 | `SELECT DATABASE()` | `SELECT current_database()` |
| 버전 조회 | `SELECT VERSION()` | `SELECT version()` |
| 문자셋 | `SHOW VARIABLES LIKE 'character_set_database'` | `pg_settings` 또는 해당 없음 |
| 테이블 목록 | `INFORMATION_SCHEMA.TABLES` (MySQL 컬럼) | `information_schema.tables` / `pg_tables` (Postgres 컬럼) |
| 컬럼 정보 | `INFORMATION_SCHEMA.COLUMNS` | `information_schema.columns` |
| 인덱스 | `INFORMATION_SCHEMA.STATISTICS` | `pg_indexes`, `pg_index` |
| 제약조건 | `INFORMATION_SCHEMA.TABLE_CONSTRAINTS` 등 | `information_schema` / `pg_constraint` |
| DDL (CREATE TABLE) | `SHOW CREATE TABLE` | `pg_dump -s` 또는 `pg_catalog` 기반 쿼리 |
| `POST /api/db/tables` | MySQL `CREATE TABLE` 문법, `ENGINE`, `CHARSET` | Postgres `CREATE TABLE` 문법 |
| `POST /api/db/backup` | MySQL `mysqldump` 스타일 SQL 생성 | `pg_dump` 또는 Postgres 쿼리 기반 백업 |

### 4.5 Node.js 드라이버 API 변환 (mysql2 → pg)

| 항목 | MySQL (mysql2) | Postgres (pg) |
|------|----------------|---------------|
| **결과 구조** | `const [rows] = await pool.execute(...)` | `const { rows } = await pool.query(...)` |
| **INSERT 후 ID** | `result.insertId` | `RETURNING id` 사용 후 `result.rows[0].id` |
| **INSERT IGNORE** | 지원 | `INSERT ... ON CONFLICT DO NOTHING` |
| **트랜잭션** | `pool.getConnection()` → `conn.beginTransaction()` | `pool.connect()` → `client` 사용. `client.query('BEGIN')` |
| **연결 반환** | `conn.release()` | `client.release()` |
| **단순 연결 확인** (health.routes.js, server.js) | `pool.getConnection()` → `conn.query('SELECT 1')` → `conn.release()` | `pool.query('SELECT 1')` 만 사용. getConnection/release 불필요 |

**변환 예시**

```javascript
// MySQL
const [rows] = await pool.execute('SELECT * FROM t WHERE id = ?', [id]);

// Postgres
const { rows } = await pool.query('SELECT * FROM t WHERE id = $1', [id]);
```

```javascript
// MySQL: INSERT 후 insertId
const [result] = await pool.query('INSERT INTO t (name) VALUES (?)', [name]);
const newId = result.insertId;

// Postgres: RETURNING 사용
const { rows } = await pool.query('INSERT INTO t (name) VALUES ($1) RETURNING id', [name]);
const newId = rows[0]?.id;
```

```javascript
// MySQL: INSERT IGNORE
await pool.execute('INSERT IGNORE INTO file_references (file_id, domain) VALUES (?, ?)', [fileId, domain]);

// Postgres: ON CONFLICT DO NOTHING (UNIQUE 제약 필요)
await pool.query(
  'INSERT INTO file_references (file_id, domain) VALUES ($1, $2) ON CONFLICT (file_id, domain) DO NOTHING',
  [fileId, domain]
);
```

```javascript
// MySQL: 트랜잭션
const conn = await pool.getConnection();
await conn.beginTransaction();
try {
  await conn.execute('INSERT ...', [...]);
  await conn.commit();
} catch (e) {
  await conn.rollback();
} finally {
  conn.release();
}

// Postgres: pool.connect() → client
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT ...', [...]);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
} finally {
  client.release();
}
```

```javascript
// health.routes.js - MySQL: getConnection 필요
router.get('/health/ready', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    res.status(200).json({ status: 'ready', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', db: 'disconnected', error: err.message });
  }
});

// Postgres: pool.query만 사용 (getConnection/release 불필요)
router.get('/health/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', db: 'disconnected', error: err.message });
  }
});
```

**server.js 기동 시 DB 연결 확인**도 동일 패턴. `pool.getConnection()` → `conn.query('SELECT 1')` → `conn.release()` 를 `pool.query('SELECT 1')`로 교체.

---

## 5. 단계별 작업 체크리스트

### Phase 1: 인프라 준비

- [x] **DBeaver** 설치 — MySQL·Postgres 통합 클라이언트. 마이그레이션 전부터 사용 권장 (사용자 백업 완료)
- [x] **Postgres + TimescaleDB Docker** 설치 — `timescale/timescaledb:latest-pg16` 이미지 사용
- [x] **볼륨 매핑 필수** — 데이터 영속성을 위해 `postgres_data:/var/lib/postgresql/data` 볼륨 매핑 필수
- [x] `docker-compose`에 Postgres(TimescaleDB 포함) 서비스 추가. **MySQL 완전 제거** (§2.9) — `docker-compose.yml`, `docker-dev-compose.yml` 반영
- [x] `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` 환경 변수 정의 (`.env.example` 기준)
- [x] `pg` (node-postgres) 패키지 설치

### Phase 2: 연결·설정 전환

- [x] `server/config/dbConfig.js` → Postgres pool 생성으로 전환
- [x] **MYSQL_* 완전 제거**, **PG*** 환경 변수로 전환 (§2.10). `.env.example` 수정 완료 (`.env`는 로컬에서 PG* 로 설정)
- [x] `docker-compose.yml`, `docker-dev-compose.yml` 업데이트

### Phase 3: 스키마 마이그레이션

- [ ] DB 초기화 시 `CREATE EXTENSION IF NOT EXISTS timescaledb` 실행 — **`database/init_postgres.sql` 작성 완료. DBeaver 또는 psql로 실행 필요**
- [ ] **pgvector** — `init_postgres.sql` 내 `CREATE EXTENSION vector` 포함. 이미지 미지원 시 해당 라인 주석 처리
- [ ] 시계열 테이블(api_usage, audit_log 등)은 **하이퍼테이블**로 변환 (`create_hypertable`) — §6.1 참고 (필요 시 추후)
- [x] `database/init_postgres.sql` — Postgres 스키마 통합 스크립트 작성 완료 (part_classes, part_models, part_specs, system_templates, archives, archive_doc, files, file_references, ai_user_memos, part_files + 트리거)
- [x] updated_at 트리거 — part_files, ai_user_memos, archives, archive_doc 포함
- [x] 인덱스·FK·CHECK 제약조건 Postgres 문법으로 정리
- [ ] (선택) **데이터 이관**: DBeaver·pgloader·스크립트 등 활용 시 §2.5 절차·검증 수행

### Phase 4: 코드 전환

- [x] `pool.query` / `pool.execute` 호출부에서 `?` → `$1`, `$2` 플레이스홀더 변환
- [x] 영향 파일 (dbConfig `pool` 사용) 전환 완료:
  - **parts**: `parts.service.js`, `partFiles.routes.js`, `partModels.routes.js`, `partSpecs.routes.js`
  - **archive**: `archive.service.js` (controller/routes는 service 사용)
  - **AI/공통**: `aiUserMemos.routes.js`, `files.routes.js`
  - **인프라**: `databaseSchema.js`, `health.routes.js`, `server.js`
- [x] `mysql2` 의존성 제거
- [x] **스모크 테스트**: §2.7.2 기준 DB 연결·CRUD·archive·files 등 핵심 플로우 검증 (로컬 Postgres·데이터 주입·UI 출력 확인 완료)

### Phase 5: DB 스키마/뷰어 도구

- [ ] **DBeaver** — Postgres 연결·스키마·쿼리·데이터 조회·편집 (표준 도구로 사용)
- [x] `databaseSchema.js`: **전면 전환** 완료. execute→query, INFORMATION_SCHEMA→pg/information_schema·pg_catalog 쿼리, backup은 pg_dump 안내 응답
- [ ] **프론트엔드 연동 테스트 집중**: DatabaseViewer.vue, DatabaseViewerHeader.vue 등 `/api/db` 소비 컴포넌트 — 테이블 목록·컬럼·인덱스·쿼리 실행·백업 등 전체 플로우 검증 (수동 확인)
- [x] `DatabaseViewerHeader.vue`: "MySQL" → "PostgreSQL" 표시 수정
- [x] UI·문서 내 **MySQL Workbench** 언급 → **DBeaver**로 수정 (PartClassesView, PartFilesView, PartSpecsView, DOCKER_DEPLOY.md, docs/database/README_CSV_IMPORT.md, [NEXA-AI-05] 등)

### Phase 6: 문서·배포

- [x] **로컬 MySQL 완전 제거**: `.env`에 `MYSQL_*` 없음 확인. Docker 이미지 정리(MySQL 이미지 없음, timescale/timescaledb만 유지). `database/stop_mysql_service.ps1` 추가·실행으로 Windows MySQL94 서비스 중지·자동시작 비활성화. `database/move_mysql_data.ps1` 제거.
- [ ] 로컬 검증 완료 후 **Docker** 빌드 → **Ubuntu 서버** 배포 → 재검증 (§2.9)
- [ ] Ubuntu: MySQL Docker·볼륨 **완전 제거**
- [x] `DOCKER_DEPLOY.md`, `README_CSV_IMPORT.md` 등 MySQL Workbench 언급 → **DBeaver**로 수정 (Phase 5에서 반영. DOCKER_DEPLOY.md는 `docs/deploy/`, README_CSV_IMPORT.md·file_upload_logic_final.md는 `docs/database/`로 이동)
- [ ] NEXA-Documentation 내 MySQL 참조 업데이트

### DBeaver 사용법 (간단 메모)

| 작업 | 방법 |
|------|------|
| **연결** | Database → New Database Connection → PostgreSQL (또는 MySQL) → 호스트·포트·DB명·사용자·비밀번호 입력 |
| **쿼리 실행** | SQL Editor (Ctrl+] 또는 테이블 우클릭 → View Data) → SQL 작성 → Ctrl+Enter |
| **스키마/테이블 보기** | 왼쪽 네비게이터에서 DB 확장 → Schemas → public → Tables |
| **ER 다이어그램** | 테이블 선택 → 우클릭 → View Diagram |
| **Generate SQL (DDL)** | 테이블 우클릭 → Generate SQL → DDL. MySQL 스키마 → Postgres 변환 시 기초 쿼리 추출용 (§3.1) |
| **데이터 내보내기** | 테이블 우클릭 → Export Data → CSV/SQL/다른 DB 등 선택 |
| **데이터 이관(MySQL→Postgres)** | MySQL 테이블 우클릭 → Export Data → Target: Database → PostgreSQL 연결 선택 → 컬럼 매핑·실행 |
| **덤프/백업** | DB 우클릭 → Tools → Backup database (또는 pg_dump 실행) |

- **마이그레이션 시**: MySQL·Postgres 둘 다 연결해 두고, 스키마 비교·데이터 검증에 활용
- **Docker Postgres**: 호스트 `localhost`, 포트 `5432` (또는 `.env`의 PGPORT). 사용자/비밀번호는 docker-compose 환경 변수와 동일하게

---

## 6. Postgres + TimescaleDB Docker 운영 정책

Postgres는 **Docker**로 운영하며, **TimescaleDB** 확장을 포함한다. 이후 확장과 관리에 유리하다.

### 6.1 TimescaleDB란?

| 항목 | 설명 |
|------|------|
| **정의** | Postgres **확장(Extension)**. 별도 DB가 아닌 `CREATE EXTENSION timescaledb`로 활성화 |
| **목적** | **시계열 데이터** 최적화 — 타임스탬프와 함께 쌓이는 측정값·이벤트(센서, 로그, 사용량 등) |
| **특징** | 하이퍼테이블(자동 시간 파티셔닝), 고속 쓰기·압축·리텐션, 시간 구간 조회 최적화. Postgres SQL·RLS·JSONB 등과 호환 |

**NEXA 적용 대상**: `api_usage`, `audit_log`, 디바이스 센서/이벤트 로그 등 시간 기반 적재 테이블.

### 6.2 TimescaleDB 사용법

1. **이미지**: `timescale/timescaledb:latest-pg16` (또는 `2.x.x-pg16` 버전 고정)
2. **활성화**: `CREATE EXTENSION IF NOT EXISTS timescaledb;` — 마이그레이션 스크립트 또는 `docker-entrypoint-initdb.d/`에 `CREATE EXTENSION`만 담은 SQL 파일 배치
3. **하이퍼테이블**: 기존 테이블에 `SELECT create_hypertable('테이블명', '시간컬럼명');` — 시간 컬럼은 `NOT NULL TIMESTAMPTZ`

```sql
-- 예: api_usage를 하이퍼테이블로 (시간 컬럼 추가 시)
CREATE TABLE api_usage (
  user_id VARCHAR(36) NOT NULL,
  api_name VARCHAR(50) NOT NULL,
  period VARCHAR(10) NOT NULL,
  period_type VARCHAR(10) NOT NULL,
  count INT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT create_hypertable('api_usage', 'updated_at', chunk_time_interval => INTERVAL '1 month');
```

**청크(Chunk) 관리**: `chunk_time_interval`로 데이터를 **시간 단위로 쪼개 저장**. 위 예는 1개월 단위. 구간 조회·삭제 시 해당 청크만 대상으로 하여 I/O·락 부담을 줄임. 테이블·쓰기 패턴에 맞게 일/주/월 등으로 조정.

**자동 압축(Compression)**: TimescaleDB의 **압축 정책**으로 오래된 청크를 자동 압축해 저장 공간·조회 비용 절감. (1) `ALTER TABLE api_usage SET (timescaledb.compress = true);` (2) `SELECT add_compression_policy('api_usage', compress_after => INTERVAL '7 days');` — 7일 지난 청크를 백그라운드에서 압축. `compress_after`(또는 `compress_created_before`)·`schedule_interval` 등으로 정책 조정.

### 6.3 Docker 운영

| 항목 | 설명 |
|------|------|
| **볼륨 매핑 필수** | 데이터 영속성을 위해 `postgres_data:/var/lib/postgresql/data` 볼륨 매핑 필수. 미설정 시 컨테이너 재시작 시 데이터 유실 |
| **버전 고정** | 이미지 태그로 Postgres·TimescaleDB 버전 고정. 개발·스테이징·운영 환경 통일 |
| **이관·재현성** | 볼륨 마운트로 데이터 유지. 컨테이너 기반으로 다른 호스트·NAS 이관 용이 |
| **확장** | Redis·Ollama·FFmpeg 등 다른 서비스와 docker-compose로 통합 관리 |
| **관리** | 백업·복구·업그레이드 시 컨테이너/볼륨 단위로 처리 |

**PgBouncer (수천 대 IoT 동시 접속 대비, 검토)**: Postgres 커넥션 풀러. API 서버 → PgBouncer → Postgres 구조로 실 커넥션 수 절감. RLS가 `current_setting('app.current_user_id')` 등 **세션 변수**에 의존하므로 **Transaction 모드** 사용 시 권한 혼선(이전 세션의 user_id 잔존) 위험. **Session 모드** 사용 권장. 디바이스는 API 경유하므로 DB 부하는 API 풀 크기에 의존. 추후 상세 검토 예정.

---

## 7. 환경 설정 변경 예시

**기준**: [NEXA-STACK-01] 환경 변수·Secret 관리 전략. 비밀·호스트 등은 **.env**에만 두고, 코드·docker-compose에서는 **환경 변수 참조**만 사용. `.env`는 Git·AI 검색 제외.

### dbConfig.js (변환 후, .env 기준)

```javascript
import pg from 'pg'
const { Pool } = pg

// .env에서 주입. server/loadEnv.js가 server.js 최상단에서 루트 .env 로드.
// 비밀번호 등은 .env에만 두고, 여기서는 fallback 없이 process.env만 사용.
export const dbConfig = {
  host: process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost',
  user: process.env.PGUSER || process.env.POSTGRES_USER || 'postgres',
  password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD, // .env 필수, 하드코딩 금지
  database: process.env.PGDATABASE || process.env.POSTGRES_DATABASE || 'nexa_db',
  port: parseInt(process.env.PGPORT || process.env.POSTGRES_PORT || '5432', 10),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

export const pool = new Pool(dbConfig)
export default { pool, dbConfig }
```

### docker-compose.yml 예시 (.env 기준)

`docker compose` 실행 시 **같은 디렉터리의 .env**를 자동 로드. 비밀·호스트는 .env에만 두고 `${변수명}`으로 참조.

**healthcheck**: Postgres `pg_isready`로 준비 여부 확인. `server`는 `depends_on: postgres (condition: service_healthy)`로 DB 기동 완료 후 기동.

**server health 엔드포인트** (`server/routes/health.routes.js`): GET `/api/health` (경량), GET `/api/health/ready` (DB 연결 확인). Docker·K8s 프로브, 로드밸런서 헬스체크용. 마이그레이션 시 `pool` 사용부(pg 전환) 수정 필요.

```yaml
# .env 파일을 루트(NEXA-Platform/)에 두고, 아래 값들은 .env에서 주입
# 예: PGHOST=postgres, PGUSER=postgres, PGPASSWORD=..., PGDATABASE=nexa_db, PGPORT=5432

services:
  postgres:
    container_name: nexa-postgres
    image: timescale/timescaledb:latest-pg16  # Postgres + TimescaleDB
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}      # .env 또는 기본값
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}        # .env 필수, 비밀번호 하드코딩 금지
      POSTGRES_DB: ${POSTGRES_DB:-nexa_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-nexa_db}"]
      interval: 5s
      timeout: 5s
      retries: 5

  server:
    container_name: nexa-server
    depends_on:
      postgres:
        condition: service_healthy    # healthcheck 통과 후 기동
    environment:
      PGHOST: postgres                            # 서비스명으로 내부 DNS
      PGUSER: ${PGUSER}
      PGPASSWORD: ${PGPASSWORD}
      PGDATABASE: ${PGDATABASE}
      PGPORT: ${PGPORT:-5432}
```

### .env.example 참고 (Postgres 마이그레이션 후)

- **MYSQL_* 제거**, **PG*** 사용 (§2.10)

```ini
# ----------------------------------------
# Postgres (dbConfig.js / docker-compose)
# ----------------------------------------
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=
PGDATABASE=nexa_db
PGPORT=5432
```

---

## 8. 참고 문서

- **docs/nexa_db.graphml** — 현재 DB ERD(테이블·컬럼·관계)
- **[NEXA-STACK-01]** 기술 스택 통합 가이드 및 용어 정리 — Postgres 역할·RLS
- **[NEXA-AUTH-01]** 계정 생성 및 인증 시스템 기반 기획 — users, device_registry, device_members, RLS
- **database/create_*.sql** — 트리거·초기 스키마 예시

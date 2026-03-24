# 저장소 할당량(Quota) 검증 DDL

`__NEXA 오케스트라 프로젝트 데이터베이스 설계 명세서 v5.md`에서 정의한
`projects.storage_quota_bytes`, `storage_configs.quota_bytes`, `projects.current_storage_usage`를 사용해,
`project_assets`/`project_media` 파일 추가/삭제 시 프로젝트 사용량을 **증분(Delta)** 으로만 갱신한다.

## 전제 조건

- 전역 `files` 테이블에 `id`, `size_bytes`(또는 동등 의미 컬럼)가 존재해야 한다.
- `projects` 테이블에 `current_storage_usage BIGINT DEFAULT 0` 컬럼이 존재해야 한다.
- 메인 스키마 DDL 적용 후 본 스크립트를 실행한다.

---

## 1) INSERT 시 할당량 검증 (BEFORE)

전체 `SUM` 대신 `projects.current_storage_usage + 신규 파일 크기`로만 판정해 쓰기 성능을 유지한다.

```sql
CREATE OR REPLACE FUNCTION check_project_storage_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_quota BIGINT;
  v_used  BIGINT;
  v_new   BIGINT := 0;
BEGIN
  IF NEW.file_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT
    COALESCE(p.storage_quota_bytes, s.quota_bytes),
    COALESCE(p.current_storage_usage, 0)
  INTO v_quota, v_used
  FROM projects p
  LEFT JOIN storage_configs s ON s.storage_id = p.storage_id
  WHERE p.project_id = NEW.project_id;

  IF v_quota IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(size_bytes, 0)
  INTO v_new
  FROM files
  WHERE id = NEW.file_id;

  IF (v_used + COALESCE(v_new, 0)) > v_quota THEN
    RAISE EXCEPTION
      'project_storage_quota_exceeded: project % used % + new % > quota %',
      NEW.project_id, v_used, v_new, v_quota;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_project_assets_quota
BEFORE INSERT ON project_assets
FOR EACH ROW
EXECUTE FUNCTION check_project_storage_quota();

CREATE TRIGGER tr_project_media_quota
BEFORE INSERT ON project_media
FOR EACH ROW
EXECUTE FUNCTION check_project_storage_quota();
```

---

## 2) 증분(Delta) 반영 (AFTER INSERT / AFTER DELETE)

파일 추가 시 `current_storage_usage`에 더하고, 삭제 시 뺀다.  
전체 `SUM` 없이 O(1) 방식으로 유지한다.

```sql
CREATE OR REPLACE FUNCTION apply_storage_usage_delta()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_size       BIGINT := 0;
  v_project_id UUID;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.file_id IS NOT NULL THEN
    v_project_id := NEW.project_id;
    SELECT COALESCE(size_bytes, 0) INTO v_size FROM files WHERE id = NEW.file_id;
    UPDATE projects
    SET current_storage_usage = COALESCE(current_storage_usage, 0) + v_size
    WHERE project_id = v_project_id;

  ELSIF TG_OP = 'DELETE' AND OLD.file_id IS NOT NULL THEN
    v_project_id := OLD.project_id;
    SELECT COALESCE(size_bytes, 0) INTO v_size FROM files WHERE id = OLD.file_id;
    UPDATE projects
    SET current_storage_usage = GREATEST(COALESCE(current_storage_usage, 0) - v_size, 0)
    WHERE project_id = v_project_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER tr_project_assets_storage_delta
AFTER INSERT OR DELETE ON project_assets
FOR EACH ROW
EXECUTE FUNCTION apply_storage_usage_delta();

CREATE TRIGGER tr_project_media_storage_delta
AFTER INSERT OR DELETE ON project_media
FOR EACH ROW
EXECUTE FUNCTION apply_storage_usage_delta();
```

> 참고: `files` 테이블 컬럼명이 다르면 함수 내부 컬럼명을 실제 스키마에 맞게 수정한다.

---

## 3) 주기 집계용 Materialized View + 정기 보정

프로젝트별 사용량 캐시를 유지하고, `current_storage_usage` 보정 기준으로 사용한다.

```sql
CREATE MATERIALIZED VIEW project_storage_usage_mv AS
SELECT
  p.project_id,
  COALESCE(SUM(COALESCE(f.size_bytes, 0)), 0)::BIGINT AS used_bytes,
  p.storage_quota_bytes AS quota_bytes,
  COALESCE(SUM(COALESCE(f.size_bytes, 0)), 0)::BIGINT
    <= COALESCE(p.storage_quota_bytes, 9223372036854775807) AS within_quota
FROM projects p
LEFT JOIN (
  SELECT project_id, file_id FROM project_assets WHERE file_id IS NOT NULL
  UNION ALL
  SELECT project_id, file_id FROM project_media WHERE file_id IS NOT NULL
) refs ON refs.project_id = p.project_id
LEFT JOIN files f ON f.id = refs.file_id
GROUP BY p.project_id, p.storage_quota_bytes;

CREATE UNIQUE INDEX idx_project_storage_usage_mv_project_id
ON project_storage_usage_mv (project_id);
```

### 운영 가이드

- 트리거는 쓰기 경로에서 증분만 반영한다.
- 배치에서 주기적으로 아래를 실행한다.

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY project_storage_usage_mv;
```

- 정기 보정 예시:

```sql
UPDATE projects p
SET current_storage_usage = mv.used_bytes
FROM project_storage_usage_mv mv
WHERE mv.project_id = p.project_id
  AND COALESCE(p.current_storage_usage, 0) <> COALESCE(mv.used_bytes, 0);
```

- 기존 데이터가 이미 있는 상태에서 최초 적용 시:
  1. MV 생성 및 1회 `REFRESH`
  2. 위 보정 `UPDATE` 실행
  3. 이후 트리거 운영
     저장소 할당량(Quota) 검증 DDL
     NEXA 오케스트라 프로젝트 DB 스키마.md에서 정의한 projects.storage_quota_bytes, storage_configs.quota_bytes, projects.current_storage_usage를 사용해, project_assets·project_media에 파일이 추가/삭제될 때 프로젝트별 사용량을 **증분(Delta)**만 갱신하여 쓰기 성능을 유지한다.
     전제: 전역 files 테이블에 id, size_bytes(또는 동일 의미 컬럼)가 존재해야 한다. projects 테이블에 current_storage_usage BIGINT DEFAULT 0 컬럼이 있어야 한다(메인 스키마 DDL-01에 포함). 메인 스키마 DDL 적용 후, 본 파일의 스크립트를 실행한다.

---

1. INSERT 시 할당량 검증 (BEFORE) — current_storage_usage + 증분으로 판단
   전체 SUM 대신 projects.current_storage_usage와 새 파일 크기만으로 검사하여, 파일 수가 많을 때도 쓰기 성능을 유지한다.
   -- 할당량 초과 시 예외. used = projects.current_storage_usage (증분 합산값)
   CREATE OR REPLACE FUNCTION check_project_storage_quota()
   RETURNS TRIGGER
   LANGUAGE plpgsql
   AS $$
   DECLARE
   v_quota BIGINT;
   v_used BIGINT;
   v_new BIGINT := 0;
   BEGIN
   IF NEW.file_id IS NULL THEN
   RETURN NEW;
   END IF;

SELECT COALESCE(p.storage_quota_bytes, s.quota_bytes), COALESCE(p.current_storage_usage, 0)
INTO v_quota, v_used
FROM projects p
LEFT JOIN storage_configs s ON s.storage_id = p.storage_id
WHERE p.project_id = NEW.project_id;

IF v_quota IS NULL THEN
RETURN NEW;
END IF;

SELECT COALESCE(size_bytes, 0) INTO v_new FROM files WHERE id = NEW.file_id;

IF (v_used + COALESCE(v_new, 0)) > v_quota THEN
RAISE EXCEPTION 'project_storage_quota_exceeded: project % used % + new % > quota %',
NEW.project_id, v_used, v_new, v_quota;
END IF;
RETURN NEW;
END;

$$
;

CREATE TRIGGER tr_project_assets_quota
  BEFORE INSERT ON project_assets
  FOR EACH ROW EXECUTE PROCEDURE check_project_storage_quota();

CREATE TRIGGER tr_project_media_quota
  BEFORE INSERT ON project_media
  FOR EACH ROW EXECUTE PROCEDURE check_project_storage_quota();
--------------------------------------------------------------------------------
2. 증분(Delta) 반영 — AFTER INSERT / AFTER DELETE
파일 추가 시 current_storage_usage에 더하고, 삭제 시 뺀다. 전체 SUM 쿼리 없이 O(1)로 유지한다.
CREATE OR REPLACE FUNCTION apply_storage_usage_delta()
RETURNS TRIGGER
LANGUAGE plpgsql
AS
$$

DECLARE
v_size BIGINT := 0;
v_project_id UUID;
BEGIN
IF TG_OP = 'INSERT' AND NEW.file_id IS NOT NULL THEN
v_project_id := NEW.project_id;
SELECT COALESCE(size_bytes, 0) INTO v_size FROM files WHERE id = NEW.file_id;
UPDATE projects SET current_storage_usage = COALESCE(current_storage_usage, 0) + v_size WHERE project_id = v_project_id;
ELSIF TG_OP = 'DELETE' AND OLD.file_id IS NOT NULL THEN
v_project_id := OLD.project_id;
SELECT COALESCE(size_bytes, 0) INTO v_size FROM files WHERE id = OLD.file_id;
UPDATE projects SET current_storage_usage = GREATEST(COALESCE(current_storage_usage, 0) - v_size, 0) WHERE project_id = v_project_id;
END IF;
RETURN COALESCE(NEW, OLD);
END;

$$
;

CREATE TRIGGER tr_project_assets_storage_delta
  AFTER INSERT OR DELETE ON project_assets
  FOR EACH ROW EXECUTE PROCEDURE apply_storage_usage_delta();

CREATE TRIGGER tr_project_media_storage_delta
  AFTER INSERT OR DELETE ON project_media
  FOR EACH ROW EXECUTE PROCEDURE apply_storage_usage_delta();
참고: files 테이블의 PK/크기 컬럼명이 id, size_bytes가 아니면 위 트리거 내부를 실제 스키마에 맞게 수정한다. PostgreSQL 11+에서는 EXECUTE PROCEDURE 대신 EXECUTE FUNCTION을 사용할 수 있다.
--------------------------------------------------------------------------------
3. 주기적 사용량 집계용 머티리얼라이즈드 뷰 및 current_storage_usage 보정
-- 프로젝트별 저장소 사용량 캐시. REFRESH 후 대시/관리 API 조회 + current_storage_usage 정기 보정용
CREATE MATERIALIZED VIEW project_storage_usage_mv AS
SELECT
  p.project_id,
  COALESCE(SUM(COALESCE(f.size_bytes, 0)), 0)::BIGINT AS used_bytes,
  p.storage_quota_bytes AS quota_bytes,
  COALESCE(SUM(COALESCE(f.size_bytes, 0)), 0)::BIGINT <= COALESCE(p.storage_quota_bytes, 9223372036854775807) AS within_quota
FROM projects p
LEFT JOIN (
  SELECT project_id, file_id FROM project_assets WHERE file_id IS NOT NULL
  UNION ALL
  SELECT project_id, file_id FROM project_media  WHERE file_id IS NOT NULL
) refs ON refs.project_id = p.project_id
LEFT JOIN files f ON f.id = refs.file_id
GROUP BY p.project_id, p.storage_quota_bytes;

CREATE UNIQUE INDEX ON project_storage_usage_mv (project_id);
운용
트리거: INSERT 시 projects.current_storage_usage + 새 파일 크기로 할당량만 검사하고, AFTER INSERT/DELETE에서 증분(Delta)만 반영하여 전체 SUM 없이 쓰기 성능을 유지한다.
머티리얼라이즈드 뷰: pg_cron 또는 애플리케이션 스케줄에서 주기적으로 REFRESH MATERIALIZED VIEW CONCURRENTLY project_storage_usage_mv;를 실행하고, 대시보드·관리 화면에서 사용량·할당량 조회에 사용한다.
current_storage_usage 정기 보정: REFRESH 후 아래를 주기적으로 실행하여, 트리거 미동작·직접 UPDATE 등으로 어긋날 수 있는 값을 MV 기준으로 맞춘다.
기존 데이터가 있을 때: 본 스크립트 최초 적용 전에 이미 project_assets/project_media 행이 있다면, 한 번만 전체 합산으로 projects.current_storage_usage를 채워 넣은 뒤 트리거를 걸어야 한다. (MV를 만들고 위 UPDATE로 동기화하거나, SUM 쿼리로 초기값 UPDATE 후 트리거 적용.)
$$

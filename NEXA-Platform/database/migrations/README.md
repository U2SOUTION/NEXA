# DB 마이그레이션

[NEXA-ADMIN-01] 등으로 추가된 스키마 변경을 기존 DB에 적용할 때 사용합니다.

## 실행 방법

**NEXA-Platform** 디렉터리에서 실행하세요. `.env`의 `PGUSER`, `PGDATABASE`, `PGPORT` 등에 맞게 연결 정보를 지정합니다.

```bash
# 예: 로컬 Postgres, DB명 nexa_db
psql -U postgres -d nexa_db -f database/migrations/001_add_password_must_change.sql
```

DBeaver 사용 시: 해당 SQL 파일을 열고 스크립트 전체 실행.

## 001_add_password_must_change.sql

- **목적**: [NEXA-ADMIN-01] 슈퍼관리자 강제 비밀번호 변경용 컬럼 추가.
- **내용**: `users` 테이블에 `password_must_change BOOLEAN NOT NULL DEFAULT true` 추가.
- **적용 시점**: 회원가입/로그인 시 `password_must_change` 컬럼이 없다는 500/503 에러가 나면 이 스크립트를 실행한 뒤 서버를 재시작하세요.

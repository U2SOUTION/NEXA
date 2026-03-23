# Postgres 연결 가이드 (로컬 개발)

## 문제: DB 연결 안 됨

- **원인**: Postgres 컨테이너가 두 종류 있습니다. 둘 다 켜면 포트 5432가 겹칩니다.
  - `nexa-postgres` (docker-compose.yml)
  - `nexa-postgres-dev` (docker-dev-compose.yml)
- **해결**: **하나만** 사용하고, 나머지는 중지합니다.

---

## 1. 개발용으로 한 컨테이너만 쓰기

### 1단계: Postgres 컨테이너 전부 중지

```powershell
cd "E:\NEXA System\NEXA\NEXA-Platform"

docker stop nexa-postgres nexa-postgres-dev 2>$null
```

### 2단계: 개발용 Postgres만 기동

```powershell
docker compose -f docker-dev-compose.yml up -d postgres
```

→ **nexa-postgres-dev**만 떠 있고, 호스트 **5432**로 연결됩니다.

### 3단계: .env가 같은 폴더에 있는지 확인

`NEXA-Platform` 폴더에 `.env`가 있어야 합니다.  
`docker compose`는 이 폴더의 `.env`를 읽어서 `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`를 컨테이너에 넘깁니다.

- `.env` 예시:
  - `PGUSER=postgres`
  - `PGPASSWORD=123456`
  - `PGDATABASE=nexa_db`
  - `PGPORT=5432`

### 4단계: 포트 확인

```powershell
docker port nexa-postgres-dev
```

예상: `5432/tcp -> 0.0.0.0:5432`

### 5단계: 연결 테스트

- **사이트(서버)**: `PGHOST=localhost`, `PGPORT=5432` 인 상태에서 서버 재시작 후 `/api/health/ready` 호출.
- **DBeaver**: Host `localhost`, Port `5432`, Database `nexa_db`, User `postgres`, Password `.env`의 `PGPASSWORD`와 동일.

---

## 2. 배포용 docker-compose.yml만 쓰는 경우

개발이 아니라 **nexa-postgres**만 쓰려면:

```powershell
docker stop nexa-postgres-dev 2>$null
docker compose up -d postgres
```

→ **nexa-postgres**만 사용, 역시 5432 사용.

---

## 3. 정리

| 사용 목적     | 명령어                                              | 컨테이너 이름        |
|---------------|-----------------------------------------------------|----------------------|
| 로컬 개발     | `docker compose -f docker-dev-compose.yml up -d postgres` | nexa-postgres-dev   |
| 배포/단일 구성 | `docker compose up -d postgres`                     | nexa-postgres        |

**한 번에 하나의 Postgres 컨테이너만** 5432를 쓰도록 하면, 사이트와 DBeaver 연결이 됩니다.

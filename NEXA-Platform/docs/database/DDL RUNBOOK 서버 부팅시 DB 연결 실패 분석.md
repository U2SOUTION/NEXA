# 서버 부팅 시 DB가 실행되지 않는 문제 분석

마이그레이션(MySQL → Postgres) 이후 서버를 부팅할 때 DB 연결이 되지 않는 원인을 정리한 문서입니다.

---

## 0. 설정은 정상인데 연결만 안 될 때 (host/database/user/passwordSet OK)

로그에 **host, database, port, user, passwordSet** 가 모두 정상인데 계속 `[DB] 데이터베이스 연결 실패`가 나오면, **Postgres 프로세스가 localhost:5432에서 떠 있지 않은 경우**가 대부분입니다.

**할 일 (순서대로):**

1. **Postgres 먼저 기동**  
   - Docker 사용 시 (로컬 개발):  
     `cd NEXA-Platform` 후  
     `docker compose -f docker-dev-compose.yml up -d postgres`  
   - 배포용만 쓰는 경우:  
     `docker compose up -d postgres`
2. **포트 확인**  
   `docker port nexa-postgres-dev` (또는 nexa-postgres) → `5432/tcp -> 0.0.0.0:5432` 인지 확인.
3. **그 다음에** `npm run dev:all` 실행.

에러 메시지가 **ECONNREFUSED** 또는 **connect** 를 포함하면 “해당 주소/포트에 연결할 수 없음”이므로, Postgres가 꺼져 있거나 5432가 다른 프로세스에 잡혀 있는지 확인하면 됩니다. 자세한 절차는 아래 §2.2 및 `POSTGRES_연결_가이드.md` 참고.

---

## 1. 현재 동작 요약

- **서버 진입점**: `server/server.ts` (실행: `cd server && npm run dev` → `tsx watch server.ts`)
- **DB 연결 시점**: `startServer()` 내부에서 `connectDB()` 호출. **await 하지 않음** → DB 연결 실패해도 서버는 곧바로 `app.listen()`으로 기동됨.
- **connectDB()**: `pool.query('SELECT 1')`로 연결 테스트. 실패 시 5초마다 재시도, 성공 시 로그만 출력.
- **결과**: "DB가 실행되지 않는다" = **Postgres에 실제로 연결되지 않는 상태**에서 서버만 떠 있는 상황으로 해석 가능 (콘솔에 `[DB] 데이터베이스 연결 실패` 반복 또는 `/api/health/ready` 503).

---

## 2. 원인 후보 (체크 리스트)

### 2.1 .env 미존재 또는 PG* 미설정

- **위치**: `.env`는 **NEXA-Platform 루트** 한 곳에만 두어야 함. (`server/loadEnv.ts`가 `path.resolve(__dirname, '../.env')`로 로드 → `__dirname`이 `server/`이므로 `../.env` = 프로젝트 루트)
- **확인**: `NEXA-Platform/.env` 파일 존재 여부. (`.env`는 보통 `.gitignore`라 저장소에는 없고, `.env.example`만 있음.)
- **필수 변수**:  
  `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`  
  (또는 `POSTGRES_*` 동일 이름)
- **영향**: `.env`가 없거나 `PGPASSWORD` 등이 비어 있으면 `dbConfig`에 `password: undefined` 등이 들어가고, Postgres 인증 방식에 따라 연결 실패할 수 있음.

**조치**:  
- `.env.example`을 복사해 `.env` 생성 후, 실제 Postgres 비밀번호·DB명·포트 등으로 수정.  
- 터미널에서 `cd NEXA-Platform && type .env`(Windows) 또는 `cat .env`로 PG* 항목이 채워져 있는지 확인.

---

### 2.2 Postgres 프로세스/컨테이너 미기동

- 서버는 `localhost:5432`(또는 `PGHOST`/`PGPORT`)로 접속을 시도함. 해당 주소에서 Postgres가 떠 있지 않으면 연결 실패.
- **로컬 개발**: `docker compose -f docker-dev-compose.yml up -d postgres` 등으로 **한 종류의 Postgres만** 기동.  
  (`nexa-postgres`와 `nexa-postgres-dev` 둘 다 켜면 5432 충돌 → 가이드 참고: `docs/database/POSTGRES_연결_가이드.md`)
- **확인**:  
  - `docker ps`로 postgres 컨테이너 실행 여부  
  - `docker port <컨테이너이름>`으로 5432 노출 여부  
  - (로컬 설치 시) Windows 서비스 또는 `pg_isready -h localhost -p 5432`

**조치**:  
- 개발용이면 `docker compose -f docker-dev-compose.yml up -d postgres` 후 서버 재시작.  
- 포트 충돌 시 다른 Postgres 중지 후 하나만 사용.

---

### 2.3 호스트/포트 불일치

- **기본값**: `dbConfig`는 `PGHOST=localhost`, `PGPORT=5432` (환경 변수 없을 때).
- Docker Compose로 서버까지 컨테이너로 띄우는 경우, **같은 compose 내**에서는 `PGHOST=postgres`(서비스명)로 두는 설정이 필요. 로컬에서만 서버를 돌리는 경우에는 `PGHOST=localhost`가 맞음.
- **확인**: `.env`의 `PGHOST`/`PGPORT`가 실제 Postgres가 열린 곳과 일치하는지.

---

### 2.4 연결 타임아웃 (connectionTimeoutMillis: 2000)

- `server/config/dbConfig.ts`에 `connectionTimeoutMillis: 2000` (2초).  
  Postgres가 느리게 뜨거나, 방화벽/네트워크 지연이 있으면 2초 안에 연결되지 않아 실패할 수 있음.
- **조치**: 일시적으로 5000~10000 등으로 늘려 보거나, Postgres가 완전히 기동된 뒤 서버를 올리는 순서 확인.

---

### 2.5 loadEnv 로드 순서 및 경로

- `server.ts` 최상단에서 `import './loadEnv.js'`로 로드하므로, `dbConfig`보다 먼저 실행됨. 순서는 문제 없음.
- **경로**: 실행 위치가 `server/`(e.g. `cd server && npm run dev`)이므로 `loadEnv.ts`의 `__dirname`은 `server/`이고, `../.env`는 NEXA-Platform 루트로 고정. 다른 디렉터리에서 `tsx server/server.ts`로 실행해도 `__dirname`은 여전히 `server/`이므로 동일.
- **주의**: `npm run dev`가 **프로젝트 루트**에서 `cd server && npm run dev`로 동작하는지 확인. 루트에서 `tsx server/server.ts`처럼 실행하면 동작은 같지만, 상대 경로를 쓰는 다른 코드가 있다면 cwd 차이가 있을 수 있음.

### 2.6 컨테이너에서 .env를 참조하지 못하는 경우

- **원인**: Docker 이미지에는 `.env` 파일이 **복사되지 않음** (보안상 권장). 컨테이너 내부에서 `__dirname/../.env` = `/app/.env`를 찾지만 해당 파일이 없어 dotenv가 아무것도 로드하지 못함.
- **해결**:
  1. **docker-compose의 `env_file`**: `nexa-web` 서비스에 `env_file: - .env`를 두면, `docker compose up` 실행 시 **호스트의** `NEXA-Platform/.env`를 읽어 컨테이너 프로세스의 환경 변수로 주입함. 따라서 앱이 컨테이너 안에서 파일을 읽지 않아도 `process.env.PGUSER` 등이 설정됨.
  2. **실행 위치**: `docker compose up`은 **docker-compose.yml과 .env가 있는 디렉터리**(NEXA-Platform 루트)에서 실행해야 함. 다른 경로에서 실행하면 `.env`를 찾지 못해 치환(`${PGUSER}` 등)이 비어 있음.
- **loadEnv 개선**: `server/loadEnv.ts`는 (1) `__dirname/../.env`, (2) `process.cwd()/.env` 순으로 시도하도록 변경됨. 컨테이너에서 `.env`를 볼륨으로 마운트한 경우에도 로드 가능.

---

## 3. 디버깅 방법

1. **서버 기동 시 로그**  
   - `[DB] 데이터베이스 연결 시도 중...` 다음에  
     - `[DB] 데이터베이스 연결 성공: nexa_db` → 정상  
     - `[DB] 데이터베이스 연결 실패: ...` → 위 2.1~2.4 순으로 점검  
   - `[DB Schema] 데이터베이스 연결 실패 (재시도 중): ...` 는 `connectDB().catch()` 쪽 메시지.

2. **환경 변수 확인 (실제 로드값)**  
   - `server.ts` 임시로 다음 추가 후 재시작:
     ```ts
     import './loadEnv.js'
     console.log('[DEBUG] PGHOST=', process.env.PGHOST)
     console.log('[DEBUG] PGDATABASE=', process.env.PGDATABASE)
     console.log('[DEBUG] PGPASSWORD set?', !!process.env.PGPASSWORD)
     ```
   - PGHOST/PGDATABASE가 기대한 값인지, PGPASSWORD가 비어 있지 않은지 확인.

3. **헬스 엔드포인트**  
   - `GET http://localhost:3001/api/health/ready`  
   - 200 + `{ "status": "ready", "db": "connected" }` → DB 연결 성공.  
   - 503 + `db: "disconnected"` → 여전히 연결 실패 (에러 메시지로 원인 추정).

4. **Postgres 직접 접속**  
   - DBeaver 등으로 `localhost:5432`, DB `nexa_db`, 사용자/비밀번호를 `.env`와 동일하게 설정해 접속 테스트.  
   - 여기서도 실패하면 서버 코드보다 Postgres 설정/네트워크/방화벽 쪽을 먼저 점검.

---

## 4. 정리

| 현상 | 우선 확인 사항 |
|------|----------------|
| 서버는 뜨지만 DB만 안 됨 | .env 존재·PG* 값, Postgres 기동 여부, PGHOST/PGPORT |
| `[DB] 데이터베이스 연결 실패` 반복 | .env 경로(루트), 비밀번호, 5432 포트·컨테이너, connectionTimeoutMillis |
| `/api/health/ready` 503 | 위와 동일 + 실제 에러 메시지(`error` 필드) 확인 |

마이그레이션 후에는 **MYSQL_*** 를 제거하고 **PG*** 만 사용**하며, `.env`와 `docker-compose`를 Postgres용으로 맞춰 두었는지 한 번 더 확인하는 것이 좋습니다.  
자세한 연결 절차는 `docs/database/POSTGRES_연결_가이드.md`를 참고하면 됩니다.

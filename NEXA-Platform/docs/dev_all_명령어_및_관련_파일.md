# npm run dev:all 명령어 및 관련 파일

`npm run dev:all`로 프론트엔드·백엔드·브라우저를 한 번에 띄울 때 사용하는 스크립트와 설정을 정리한 문서입니다.

---

## 0. Postgres 자동 기동 (dev:all에 포함)

`npm run dev:all`은 **먼저 Postgres를 띄운 뒤** 프론트·API·브라우저를 실행합니다.  
즉, **직접 DB를 따로 띄울 필요 없이** `npm run dev:all` 한 번만 실행하면 됩니다.

- 내부 순서: `dev:postgres` → `dev:kill-ports` → 프론트엔드·API·브라우저 동시 기동.
- Postgres가 이미 떠 있으면 `docker compose up -d postgres`는 곧바로 넘어갑니다.
- Postgres만 따로 띄우고 싶을 때: `npm run dev:postgres` (또는 `docker compose -f docker-dev-compose.yml up -d postgres`).

자세한 내용: `docs/database/POSTGRES_연결_가이드.md`, `docs/database/서버_부팅시_DB_연결_실패_분석.md`

---

## 1. 명령어 흐름

실행 위치: **NEXA-Platform 루트** (`PS E:\NEXA System\NEXA\NEXA-Platform>`)

```
npm run dev:all
  → npm run dev:postgres     (Postgres 컨테이너 기동, 이미 떠 있으면 스킵)
  → npm run dev:kill-ports
  → concurrently (3개 병렬)
      ① npm run dev          (프론트엔드)
      ② npm run dev:server   (백엔드 API)
      ③ wait-on + open-browser
```

### 1.1 dev:kill-ports

- **스크립트**: `kill-port 3001 9000 9001`
- **의미**: 기존에 3001(API), 9000(Quasar), 9001 포트를 쓰는 프로세스를 종료해 포트 충돌을 방지.

### 1.2 ① npm run dev (프론트엔드)

- **정의**: `cross-env VITE_API_PORT=3001 quasar dev`
- **동작**:
  - Quasar(Vite) 개발 서버 기동.
  - **포트**: `quasar.config.js`의 `devServer.port` → **9000**.
  - **환경 변수**: `VITE_API_PORT=3001` → 프론트에서 API 베이스 URL 계산 시 사용 (`apiBaseUrl.ts`: `hostname:3001/api`).
- **관련 파일**:
  - `package.json` (루트) — `scripts.dev`
  - `quasar.config.js` — `devServer.port: 9000`, `devServer.proxy` (/uploads → 3001), `sourceFiles.router` 등.

### 1.3 ② npm run dev:server (백엔드)

- **정의**: `cd server && npm run dev` → `cross-env PORT=3001 NODE_ENV=development tsx watch server.ts`
- **동작**:
  - **작업 디렉터리**: `server/` (루트가 아님).
  - **포트**: 3001.
  - **실행 파일**: `server/server.ts` (tsx로 직접 실행).
  - **.env 로드**: `server/loadEnv.ts`가 다음 순서로 시도.
    1. `path.resolve(__dirname, '../.env')` → **NEXA-Platform/.env** (권장 위치, 여기서 로드됨).
    2. `path.resolve(process.cwd(), '.env')` → `server/.env` (없으면 스킵).
- **관련 파일**:
  - `package.json` (루트) — `scripts.dev:server`
  - `server/package.json` — `scripts.dev`
  - `server/server.ts` — Express 앱·DB 연결·라우트.
  - `server/loadEnv.ts` — .env 경로 후보 및 로그.
  - `server/config/dbConfig.ts` — PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT.

### 1.4 ③ wait-on + open-browser

- **정의**: `wait-on http://localhost:9000 -t 60000 && node scripts/open-browser.js`
- **동작**:
  - 최대 60초 동안 `http://localhost:9000` 응답 대기.
  - 준비되면 `scripts/open-browser.js` 실행 → Chrome(또는 기본 브라우저)으로 `http://localhost:9000` 오픈.
- **관련 파일**:
  - `package.json` — `dev:all` 내부, 의존성 `wait-on`.
  - `scripts/open-browser.js` — `frontendUrl = 'http://localhost:9000'`, Chrome 경로·프로필·모드(개발/바탕화면 아이콘).

---

## 2. 포트·URL 정리

| 용도           | 포트  | URL (기본)              | 비고                          |
|----------------|-------|--------------------------|-------------------------------|
| 프론트엔드     | 9000  | http://localhost:9000    | Quasar devServer              |
| 백엔드 API     | 3001  | http://localhost:3001    | server `PORT=3001`             |
| API 베이스     | —     | http://localhost:3001/api | `apiBaseUrl.ts` (VITE_API_PORT 사용) |
| 업로드 프록시  | —     | /uploads → 3001         | quasar.config.js proxy        |
| kill-port 대상 | 9001  | —                        | 사용처 없을 수 있음(여유 포트 정리용 등) |

---

## 3. .env 및 DB (dev:all 시)

- **실행 위치**: 루트에서 `npm run dev:all` → `dev:server`는 `cd server` 후 실행되므로 **서버 프로세스의 cwd = server/**.
- **.env 위치**: **NEXA-Platform/.env** (루트 한 곳). `loadEnv.ts`의 첫 번째 후보 `__dirname/../.env`가 **server/** 기준 상위이므로 루트 `.env`를 찾음.
- **DB**: 서버 기동 시 `connectDB()`로 Postgres 접속 시도. `.env`의 `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` 사용. 로컬 개발 시에는 같은 머신의 Postgres(또는 docker-dev-compose postgres)를 쓰면 됨.

---

## 4. 관련 파일 목록 (검토용)

| 파일 | 역할 |
|------|------|
| **package.json** (루트) | `dev`, `dev:all`, `dev:server`, `dev:kill-ports` 정의. `concurrently`, `wait-on`, `kill-port` 의존성. |
| **quasar.config.js** | devServer port 9000, proxy `/uploads` → 3001, Vite alias, boot, sourceFiles.router. |
| **server/package.json** | `dev`: PORT=3001, tsx watch server.ts. |
| **server/server.ts** | Express 앱, loadEnv 최상단 import, connectDB, 라우트 등록, listen(PORT). |
| **server/loadEnv.ts** | .env 후보 경로(루트·cwd), 개발 시 로그/경고. |
| **server/config/dbConfig.ts** | PG* 환경 변수, pool 생성. |
| **scripts/open-browser.js** | wait-on 이후 실행, localhost:9000 대기·Chrome 오픈. |
| **src/system/utils/apiBaseUrl.ts** | VITE_API_PORT·VITE_API_BASE_URL 기반 API 베이스 URL. |

---

## 5. 잠재 이슈·확인 사항

1. **dev:kill-ports의 9001**  
   현재 설정에서 9001을 쓰는 부분은 없음. 과거 사용처 제거 후 남은 값일 수 있음. 필요 없으면 `kill-port 3001 9000`만 두어도 됨.

2. **quasar devServer.proxy**  
   `/uploads`만 3001로 프록시됨. `/api`는 프록시하지 않고, 프론트가 `getApiBaseUrl()`로 `http://localhost:3001/api`를 직접 호출함. CORS는 server에서 허용 중이면 문제 없음.

3. **동시 기동 순서**  
   concurrently는 ①·②·③을 동시에 시작함. ③은 wait-on으로 9000이 뜰 때까지 기다리므로, 프론트가 늦게 떠도 브라우저는 준비된 뒤 열림. API(3001)는 별도 대기 없이 기동하므로, DB가 느리면 서버는 떠 있어도 `/api/health/ready`가 잠시 503일 수 있음.

4. **실행 디렉터리**  
   `dev:all`은 **반드시 NEXA-Platform 루트**에서 실행. 루트에 `.env`가 있어야 하고, `server/loadEnv.ts`가 루트 `.env`를 찾을 수 있음.

# NEXA Platform API 서버

## 설치

```bash
cd server
npm install
```

## 실행 전: Postgres 기동 (필수)

API 서버는 Postgres(localhost:5432)에 연결합니다. **먼저 Postgres를 띄운 뒤** 서버를 실행하세요.

**로컬 개발용 (프로젝트 루트에서):**

```bash
docker compose -f docker-dev-compose.yml up -d postgres
# 또는 npm run dev:postgres
```

루트의 `.env`에 `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`가 있어야 합니다.  
자세한 내용: `docs/database/POSTGRES_연결_가이드.md`

## 실행

```bash
npm start
# 또는 개발 모드 (자동 재시작, PORT=3001)
npm run dev
```

- 기본 포트: 개발 시 **3001** (`npm run dev`), 프로덕션 시 3000.
- 루트에서 `npm run dev:all`로 프론트+API+브라우저를 한 번에 띄울 수 있으며, **그 전에 Postgres를 기동**해야 DB 연결이 됩니다.

## API 엔드포인트

### 부품 클래스 (Part Classes)

- `GET /api/part-classes` - 모든 부품 클래스 조회
- `GET /api/part-classes/:id` - 특정 부품 클래스 조회
- `POST /api/part-classes` - 부품 클래스 생성
- `PUT /api/part-classes/:id` - 부품 클래스 수정
- `DELETE /api/part-classes/:id` - 부품 클래스 삭제

## 환경 변수

**루트(NEXA-Platform/.env)** 에서 로드됩니다. `server/loadEnv.ts`가 부팅 시 `.env`를 읽습니다.

**Postgres (필수):**

```
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=비밀번호
PGDATABASE=nexa_db
PGPORT=5432
```

기타: `PORT`, `JWT_SECRET`, `REDIS_URL` 등은 `.env.example` 참고.

## 주의사항

- **Postgres를 먼저 기동**한 뒤 서버를 실행해야 DB 연결이 됩니다. (`docker compose -f docker-dev-compose.yml up -d postgres` 또는 `npm run dev:postgres`)


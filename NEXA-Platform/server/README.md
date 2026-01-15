# 부품 관리 API 서버

## 설치

```bash
cd server
npm install
```

## 실행

```bash
npm start
# 또는 개발 모드 (자동 재시작)
npm run dev
```

서버는 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 부품 클래스 (Part Classes)

- `GET /api/part-classes` - 모든 부품 클래스 조회
- `GET /api/part-classes/:id` - 특정 부품 클래스 조회
- `POST /api/part-classes` - 부품 클래스 생성
- `PUT /api/part-classes/:id` - 부품 클래스 수정
- `DELETE /api/part-classes/:id` - 부품 클래스 삭제

## 환경 변수

`.env` 파일을 생성하여 설정할 수 있습니다:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123412341234
DB_NAME=nexa_db
```

## 주의사항

- 현재는 하드코딩된 DB 설정을 사용합니다
- 프로덕션 환경에서는 환경 변수 사용을 권장합니다


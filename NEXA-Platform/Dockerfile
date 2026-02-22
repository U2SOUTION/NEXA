# NEXA Platform - 단일 이미지 (프론트 빌드 + API 서버)
# Node 20 (package.json engines)
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Quasar가 프로젝트 루트로 인식하려면 quasar.config.js가 반드시 있어야 함 → 먼저 복사
COPY package.json package-lock.json* .npmrc ./
COPY quasar.config.js tsconfig.json index.html postcss.config.js eslint.config.js ./
COPY src ./src
COPY public ./public

# 프론트엔드 의존성 및 빌드
RUN npm ci

# quasar.config.js의 boot/css 경로가 ../system 을 참조 → /system 을 src/system 으로 연결
RUN ln -s /app/src/system /system

# API 베이스 URL을 같은 오리진으로 (같은 컨테이너에서 서빙)
ENV VITE_API_BASE_URL=/api
RUN cd /app && npm run build

# ============================================
# 최종 이미지: 서버 + 빌드된 프론트
# ============================================
FROM node:20-alpine

WORKDIR /app

# 서버만 의존성 설치 (프로덕션)
COPY server/package.json server/package-lock.json* server/
RUN cd server && npm ci --omit=dev

# 서버 소스
COPY server ./server

# 빌드된 SPA (프로덕션에서 서버가 정적 파일 서빙)
COPY --from=frontend-builder /app/dist/spa ./frontend

ENV NODE_ENV=production
ENV PORT=3000
# 서버가 프론트 정적 파일을 서빙할 경로
ENV FRONTEND_DIST=/app/frontend

EXPOSE 3000

CMD ["node", "server/server.js"]

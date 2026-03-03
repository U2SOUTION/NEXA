// 간단한 Express API 서버
// 부품 데이터 관리를 위한 REST API

import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { cleanupOldTempFiles } from './utils/fileUpload.js'
import { documentFilesRouter, devOnlyFileEditorRouter, createDatabaseSchemaRouter } from './domains/dev/dev.routes.js'
import archiveRouter from './domains/archive/archive.routes.js'
import partsRouter from './domains/parts/parts.routes.js'
import aiRouter from './domains/ai/ai.routes.js'
import partFilesRouter from './domains/parts/partFiles.routes.js'
import partModelsRouter from './domains/parts/partModels.routes.js'
import partSpecsRouter from './domains/parts/partSpecs.routes.js'
import filesRouter from './routes/files.routes.js'
import aiUserMemosRouter from './routes/aiUserMemos.routes.js'
import { UPLOAD_BASE_DIR } from './config/upload.js'
import { initDocsFolders } from './config/documentConfig.js'
import { pool, dbConfig } from './config/dbConfig.js'
import { JSON_BODY_LIMIT, URLENCODED_BODY_LIMIT } from './config/bodyLimits.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// 미들웨어
app.use(cors())
// Base64 인코딩으로 인해 실제 전송 크기가 약 133% 증가하므로 limit을 더 크게 설정
// 파일 크기 제한: 10MB, Base64 인코딩 후 약 13-14MB 예상
app.use(express.json({ limit: JSON_BODY_LIMIT }))
// FormData의 텍스트 필드를 파싱하기 위한 미들웨어 (multer와 함께 사용)
app.use(express.urlencoded({ extended: true, limit: URLENCODED_BODY_LIMIT }))

// 업로드 파일 정적 서빙 (public/uploads -> /uploads)
// TODO(security): 프로덕션에서 민감 파일은 public 밖에 두고, 필요 시 인증/서명 URL 프록시로 전환
app.use('/uploads', express.static(path.join(UPLOAD_BASE_DIR)))

// 한글 인코딩을 위한 응답 헤더 설정
app.use((req, res, next) => {
  // JSON 응답에 charset 명시
  if (res.get('Content-Type')?.includes('application/json')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
  }
  next()
})

// package.json 읽기 API (GraphDoc 패키지 의존성 분석용)
// TODO(graphdoc): 향후 GraphDoc 패키지 의존성 분석 API 대체 기능 구현
app.get('/api/package-json', async (req, res) => {
  try {
    // 서버는 server 폴더에 있으므로, 상위 폴더의 package.json 읽기
    const packageJsonPath = path.join(__dirname, '../package.json')
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageJsonContent)
    res.json(packageJson)
  } catch (error) {
    console.error('[API] package.json 읽기 실패:', error)
    res.status(500).json({
      error: 'package.json을 읽을 수 없습니다.',
      message: error.message,
    })
  }
})

// 풀 연결 테스트용
async function connectDB() {
  try {
    console.log('[DB] 데이터베이스 연결 시도 중...')
    const conn = await pool.getConnection()
    await conn.query('SELECT 1')
    conn.release()
    console.log('[DB] 데이터베이스 연결 성공:', dbConfig.database)
  } catch (error) {
    console.error('[DB] 데이터베이스 연결 실패:', error.message)
    console.log('[DB] 5초 후 재연결 시도...')
    setTimeout(() => connectDB(), 5000)
  }
}

// =======================================
// 도메인 별 라우터 등록
// =======================================

// 아카이브 도메인
// TODO(route-prefix): 향후 /api/archive 로 접두사 통일 검토 (프론트 호출 경로 일괄 수정 필요)
app.use('/api', archiveRouter)
// 부품 도메인
// TODO(route-prefix): 향후 /api/parts 로 접두사 통일 검토 (partFiles/partModels/partSpecs 포함)
app.use('/api', partFilesRouter)
// 문서 파일 관리 API
// TODO(route-prefix): dev 전용으로 /api/dev/docs 등으로 변경 검토
app.use('/api/docs', documentFilesRouter)
// 부품 모델 도메인
// TODO(route-prefix): 향후 /api/parts 로 접두사 통일 검토 (partFiles/partModels/partSpecs 포함)
app.use('/api', partModelsRouter)
app.use('/api', partSpecsRouter)
app.use('/api', partsRouter)
app.use('/api', aiRouter)
app.use('/api', filesRouter)
app.use('/api', aiUserMemosRouter)

// 데이터베이스 스키마 라우터 등록 (데이터베이스 연결 전에도 등록)
// 각 엔드포인트에서 연결 상태를 확인하므로 연결 실패해도 404 방지
// getDbConnection 함수를 전달하여 항상 최신 연결 상태를 참조하도록 함
const databaseSchemaRouter = createDatabaseSchemaRouter(() => pool)
app.use('/api/db', databaseSchemaRouter)
console.log('[DB Schema] 라우터 등록 완료: /api/db')

// 개발 전용 파일 편집 API 등록 (라우터 내부에서 프로덕션 환경 체크)
app.use('/api/dev/files', devOnlyFileEditorRouter)
if (process.env.NODE_ENV !== 'production') {
  console.log('[DevFileEditor] 개발 전용 파일 편집 API 등록 완료: /api/dev/files')
} else {
  console.log('[DevFileEditor] 개발 전용 파일 편집 API 등록됨 (프로덕션에서는 모든 요청 차단)')
}

// ============================================
// 관리자 설정 API (이 기능은 사용자 설정으로 대체될 예정)
// ============================================
// TODO(admin): 사용자 설정 API 대체 기능 구현
// GET /api/admin/sidebar-settings - 사이드바 관리자 설정 조회
app.get('/api/admin/sidebar-settings', async (req, res) => {
  try {
    // 현재는 빈 객체 반환 (나중에 데이터베이스나 파일에서 로드 가능)
    // 클라이언트는 로컬 스토리지를 사용하므로 빈 객체로 응답
    res.json({})
  } catch (error) {
    console.error('[GET /api/admin/sidebar-settings] 설정 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: '설정 조회 실패',
      message: error.message,
    })
  }
})

// POST /api/admin/sidebar-settings - 사이드바 관리자 설정 저장
app.post('/api/admin/sidebar-settings', async (req, res) => {
  try {
    const settings = req.body
    // 현재는 저장하지 않음 (나중에 데이터베이스나 파일에 저장 가능)
    // 클라이언트는 로컬 스토리지를 사용하므로 성공 응답만 반환
    res.json({
      success: true,
      message: '설정이 저장되었습니다.',
    })
  } catch (error) {
    console.error('[POST /api/admin/sidebar-settings] 설정 저장 실패:', error)
    res.status(500).json({
      success: false,
      error: '설정 저장 실패',
      message: error.message,
    })
  }
})

// 데이터베이스 스키마 API (데이터베이스 연결 후 등록)
// startServer() 함수 내에서 connectDB() 후에 등록됨

// 업로드 폴더 초기화
async function initializeUploadFolder() {
  try {
    const { initializeUploadFolder } = await import('./utils/initUploadFolder.js')
    await initializeUploadFolder()

    // 서버 시작 시 오래된 임시 파일 정리 (24시간 이상)
    try {
      const deletedCount = await cleanupOldTempFiles(24)
      if (deletedCount > 0) {
        console.log(`[Server Init] ${deletedCount}개의 오래된 임시 파일이 정리되었습니다.`)
      }
    } catch (error) {
      console.warn('[Server Init] 임시 파일 정리 중 오류:', error.message)
    }
  } catch (error) {
    console.error('[File Upload] 업로드 폴더 초기화 실패:', error)
    // 폴더 생성 실패해도 서버는 계속 실행 (나중에 자동 생성됨)
  }
}

// 전역 에러 핸들러 추가
process.on('uncaughtException', (error) => {
  console.error('처리되지 않은 예외:', error)
  // 서버를 종료하지 않고 계속 실행
})

process.on('unhandledRejection', (reason) => {
  console.error('처리되지 않은 Promise 거부:', reason)
  // 서버를 종료하지 않고 계속 실행
})

// 프로덕션: 빌드된 SPA 정적 서빙 (Docker 등에서 FRONTEND_DIST 설정 시)
const frontendDist = process.env.FRONTEND_DIST
if (frontendDist) {
  app.use(express.static(frontendDist))
  app.get('*', (req, res, next) => {
    if (res.headersSent) return next()
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => (err ? next() : undefined))
  })
}

// 404 핸들러 (모든 라우트 이후, 에러 핸들러 이전)
app.use((req, res) => {
  // 응답이 이미 보내졌는지 확인
  if (res.headersSent) {
    return
  }
  res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' })
})

// Express 에러 핸들러 (모든 라우트 이후에 추가)
// 에러 핸들러는 반드시 4개의 매개변수를 가져야 함: (err, req, res, next)
app.use((err, req, res, next) => {
  // 응답이 이미 보내졌는지 확인
  if (res.headersSent) {
    return next(err)
  }
  console.error('Express 에러:', err)
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.',
    message: err.message,
  })
})

// 서버 시작
async function startServer() {
  try {
    // 데이터베이스 연결 시도 (비동기, 실패해도 서버는 계속 실행)
    connectDB().catch((error) => {
      console.warn('[DB Schema] 데이터베이스 연결 실패 (재시도 중):', error.message)
    })

    await initializeUploadFolder()

    // 문서 폴더 설정 로드 (다중 폴더 지원)
    try {
      await initDocsFolders()
      console.log('[DocumentConfig] 문서 폴더 설정 로드 완료')
    } catch (err) {
      console.warn('[DocumentConfig] 문서 폴더 설정 로드 실패:', err.message)
    }

    const server = app.listen(PORT, () => {
      console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`)
    })

    // 서버 에러 핸들러
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`포트 ${PORT}가 이미 사용 중입니다.`)
      } else {
        console.error('서버 에러:', error)
      }
    })
  } catch (error) {
    console.error('서버 시작 실패:', error)
    // 서버를 종료하지 않고 재시도할 수 있도록
  }
}

startServer()

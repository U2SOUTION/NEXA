// 간단한 Express API 서버
// 부품 데이터 관리를 위한 REST API

import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { getFileMimeType, cleanupOldTempFiles, deleteFile } from './utils/fileUpload.js'
import documentFilesRouter from './domains/docs/docs.routes.js'
import createDatabaseSchemaRouter from './domains/db/databaseSchema.routes.js'
// 개발 전용 파일 편집 API (프로덕션에서는 라우터 내부에서 차단됨)
import devOnlyFileEditorRouter from './domains/dev/devFileEditor.routes.js'
import archiveRouter from './domains/archive/archive.routes.js'
import partsRouter from './domains/parts/parts.routes.js'
import partFilesRouter from './domains/parts/partFiles.routes.js'
import { UPLOAD_BASE_DIR } from './config/upload.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// 미들웨어
app.use(cors())
// Base64 인코딩으로 인해 실제 전송 크기가 약 133% 증가하므로 limit을 더 크게 설정
// 파일 크기 제한: 10MB, Base64 인코딩 후 약 13-14MB 예상
app.use(express.json({ limit: '15mb' }))
// FormData의 텍스트 필드를 파싱하기 위한 미들웨어 (multer와 함께 사용)
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// 한글 인코딩을 위한 응답 헤더 설정
app.use((req, res, next) => {
  // JSON 응답에 charset 명시
  if (res.get('Content-Type')?.includes('application/json')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
  }
  next()
})

// 정적 파일 서빙 (업로드된 파일 접근)
// 한글 경로 처리를 위한 커스텀 미들웨어
app.use('/uploads', async (req, res, next) => {
  try {
    // 응답이 이미 보내졌는지 확인
    if (res.headersSent) {
      return next()
    }

    // req.url에서 원본 인코딩된 경로 가져오기 (쿼리 스트링 제거)
    const urlPath = req.url.split('?')[0]

    // URL 디코딩 (한글 경로 처리)
    let decodedPath
    try {
      decodedPath = decodeURIComponent(urlPath)
    } catch {
      // 디코딩 실패 시 원본 경로 사용
      decodedPath = urlPath
    }

    // uploads/ 접두사 제거
    const relativePath = decodedPath.replace(/^\/uploads\//, '')
    const filePath = path.join(UPLOAD_BASE_DIR, relativePath)

    // 파일 존재 확인
    try {
      const stats = await fs.stat(filePath)
      if (stats.isFile()) {
        // 파일 읽기 및 전송
        const fileBuffer = await fs.readFile(filePath)
        const ext = path.extname(filePath).toLowerCase()

        // Content-Type 설정 (MIME 타입 사용)
        let contentType = 'application/octet-stream'
        try {
          // 확장자 기반으로 MIME 타입 결정
          contentType = getFileMimeType(ext.replace(/^\./, ''))
        } catch {
          // 실패 시 기본값 사용
        }

        // 응답이 이미 보내졌는지 다시 확인
        if (!res.headersSent) {
          res.setHeader('Content-Type', contentType)
          res.setHeader('Content-Length', fileBuffer.length)
          res.setHeader('Cache-Control', 'public, max-age=31536000')
          res.send(fileBuffer)
        }
        return
      }
    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        // 파일을 찾을 수 없으면 Express static으로 폴백
        // 응답이 이미 보내졌는지 확인
        if (!res.headersSent) {
          next()
        }
        return
      }
      throw fileError
    }

    // 파일이 아니면 Express static으로 전달
    if (!res.headersSent) {
      next()
    }
  } catch (error) {
    console.error('[Static File] 오류:', error)
    // 응답이 이미 보내졌는지 확인
    if (!res.headersSent) {
      next(error) // 에러를 다음 핸들러로 전달
    }
  }
})

// package.json 읽기 API (GraphDoc 패키지 의존성 분석용)
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

// Express static 폴백 (한글 경로가 아닌 경우)
const staticMiddleware = express.static(UPLOAD_BASE_DIR, {
  dotfiles: 'ignore',
  etag: true,
  extensions: false,
  fallthrough: true,
  immutable: false,
  index: false,
  lastModified: true,
  maxAge: 0,
})

app.use('/uploads', (req, res, next) => {
  // Express static 미들웨어 실행
  staticMiddleware(req, res, (err) => {
    // 에러가 발생했거나 파일을 찾지 못한 경우
    if (err) {
      console.error('[Static Middleware] 에러:', err)
      // 응답이 이미 보내졌는지 확인
      if (!res.headersSent) {
        return next(err)
      }
      return
    }
    // 파일을 찾지 못한 경우 (fallthrough: true이므로 next() 호출)
    if (!res.headersSent) {
      // 다음 미들웨어로 전달 (404 핸들러가 처리)
      next()
    }
  })
})

// MySQL 연결 설정
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123412341234',
  database: 'nexa_db',
  charset: 'utf8mb4',
}

let dbConnection = null

// 데이터베이스 연결
async function connectDB() {
  try {
    console.log('[DB] 데이터베이스 연결 시도 중...')
    dbConnection = await mysql.createConnection(dbConfig)

    // 연결 후 charset 명시적으로 설정 (한글 지원)
    await dbConnection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci')

    console.log('[DB] 데이터베이스 연결 성공:', dbConfig.database)

    // 연결 끊김 감지 및 재연결
    dbConnection.on('error', (err) => {
      console.error('[DB] 데이터베이스 연결 에러:', err.message)
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        dbConnection = null
        console.log('[DB] 5초 후 재연결 시도...')
        setTimeout(() => connectDB(), 5000) // 5초 후 재연결 시도
      }
    })
  } catch (error) {
    console.error('[DB] 데이터베이스 연결 실패:', error.message)
    console.log('[DB] 5초 후 재연결 시도...')
    // process.exit(1) 제거 - 서버가 계속 실행되도록
    setTimeout(() => connectDB(), 5000) // 5초 후 재시도
  }
}

// 부품 모델 API

// GET /api/part-models/class/:classId - 특정 클래스의 모델 조회 (더 구체적인 라우트를 먼저)
app.get('/api/part-models/class/:classId', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(
      `SELECT pm.*, pc.name as part_class_name, pc.c_code, pc.category
       FROM part_models pm
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE pm.part_class_id = ?
       ORDER BY pm.id`,
      [req.params.classId],
    )
    res.json(rows)
  } catch (error) {
    console.error('부품 모델 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-models/:id - 특정 부품 모델 조회
app.get('/api/part-models/:id', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(
      `SELECT pm.*, pc.name as part_class_name, pc.c_code, pc.category
       FROM part_models pm
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE pm.id = ?`,
      [req.params.id],
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 모델을 찾을 수 없습니다.' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('부품 모델 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-models - 모든 부품 모델 조회 (클래스 정보 포함) - 가장 마지막에 배치
app.get('/api/part-models', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(
      `SELECT pm.*, pc.name as part_class_name, pc.c_code, pc.category
       FROM part_models pm
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       ORDER BY pm.id`,
    )
    res.json(rows)
  } catch (error) {
    console.error('부품 모델 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// 부품 스펙 API

// GET /api/part-specs/model/:modelId - 특정 모델의 스펙 조회 (더 구체적인 라우트를 먼저)
app.get('/api/part-specs/model/:modelId', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(
      `SELECT ps.*, pm.model_name as part_model_name, pm.part_class_id, pc.name as part_class_name
       FROM part_specs ps
       LEFT JOIN part_models pm ON ps.part_model_id = pm.id
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE ps.part_model_id = ?
       ORDER BY ps.id`,
      [req.params.modelId],
    )
    res.json(rows)
  } catch (error) {
    console.error('부품 스펙 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-specs/:id - 특정 부품 스펙 조회
app.get('/api/part-specs/:id', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(
      `SELECT ps.*, pm.model_name as part_model_name, pm.part_class_id, pc.name as part_class_name
       FROM part_specs ps
       LEFT JOIN part_models pm ON ps.part_model_id = pm.id
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE ps.id = ?`,
      [req.params.id],
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 스펙을 찾을 수 없습니다.' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('부품 스펙 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-specs - 모든 부품 스펙 조회 (모델 정보 포함) - 가장 마지막에 배치
app.get('/api/part-specs', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(
      `SELECT ps.*, pm.model_name as part_model_name, pm.part_class_id, pc.name as part_class_name
       FROM part_specs ps
       LEFT JOIN part_models pm ON ps.part_model_id = pm.id
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       ORDER BY ps.id`,
    )
    res.json(rows)
  } catch (error) {
    console.error('부품 스펙 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/part-specs - 부품 스펙 생성
app.post('/api/part-specs', async (req, res) => {
  try {
    const { part_model_id, manufacturer_part_number, value_str, tolerance, voltage_rating, package_type, manufacturer, unit, purchase_vendor, purchase_status, main_specs, additional_info2, additional_info3, safety_stock, stock_quantity, stock_value, stock_alert } = req.body

    if (!manufacturer_part_number) {
      return res.status(400).json({ error: '제조사 품번은 필수입니다.' })
    }

    if (!part_model_id) {
      return res.status(400).json({ error: '부품 모델 ID는 필수입니다.' })
    }

    const [result] = await dbConnection.execute(
      `INSERT INTO part_specs
       (part_model_id, manufacturer_part_number, value_str, tolerance, voltage_rating,
        package_type, manufacturer, unit, purchase_vendor, purchase_status,
        main_specs, additional_info2, additional_info3,
        safety_stock, stock_quantity, stock_value, stock_alert)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        part_model_id,
        manufacturer_part_number,
        value_str || null,
        tolerance || null,
        voltage_rating || null,
        package_type || null,
        manufacturer || null,
        unit || null,
        purchase_vendor || null,
        purchase_status || null,
        main_specs || null,
        additional_info2 || null,
        additional_info3 || null,
        safety_stock || 0,
        stock_quantity || 0,
        stock_value || 0,
        stock_alert || false,
      ],
    )

    const [newRow] = await dbConnection.execute(
      `SELECT ps.*, pm.model_name as part_model_name, pm.part_class_id, pc.name as part_class_name
       FROM part_specs ps
       LEFT JOIN part_models pm ON ps.part_model_id = pm.id
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE ps.id = ?`,
      [result.insertId],
    )

    res.status(201).json(newRow[0])
  } catch (error) {
    console.error('부품 스펙 생성 실패:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: '이미 존재하는 제조사 품번입니다.' })
    }
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/part-specs/:id - 부품 스펙 수정
app.put('/api/part-specs/:id', async (req, res) => {
  try {
    const { manufacturer_part_number, value_str, tolerance, voltage_rating, package_type, manufacturer, unit, purchase_vendor, purchase_status, main_specs, additional_info2, additional_info3, safety_stock, stock_quantity, stock_value, stock_alert } = req.body

    await dbConnection.execute(
      `UPDATE part_specs
       SET manufacturer_part_number = ?, value_str = ?, tolerance = ?, voltage_rating = ?,
           package_type = ?, manufacturer = ?, unit = ?, purchase_vendor = ?, purchase_status = ?,
           main_specs = ?, additional_info2 = ?, additional_info3 = ?,
           safety_stock = ?, stock_quantity = ?, stock_value = ?, stock_alert = ?
       WHERE id = ?`,
      [
        manufacturer_part_number,
        value_str || null,
        tolerance || null,
        voltage_rating || null,
        package_type || null,
        manufacturer || null,
        unit || null,
        purchase_vendor || null,
        purchase_status || null,
        main_specs || null,
        additional_info2 || null,
        additional_info3 || null,
        safety_stock || 0,
        stock_quantity || 0,
        stock_value || 0,
        stock_alert || false,
        req.params.id,
      ],
    )

    const [rows] = await dbConnection.execute(
      `SELECT ps.*, pm.model_name as part_model_name, pm.part_class_id, pc.name as part_class_name
       FROM part_specs ps
       LEFT JOIN part_models pm ON ps.part_model_id = pm.id
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE ps.id = ?`,
      [req.params.id],
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 스펙을 찾을 수 없습니다.' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('부품 스펙 수정 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/part-specs/:id - 부품 스펙 삭제
app.delete('/api/part-specs/:id', async (req, res) => {
  const isPool = dbConnection && typeof dbConnection.getConnection === 'function'
  const connection = isPool ? await dbConnection.getConnection() : dbConnection
  const needsRelease = isPool // pool에서 가져온 connection만 release 필요

  try {
    await connection.beginTransaction()

    // 삭제 전에 관련 파일 조회
    const [files] = await connection.execute('SELECT file_path FROM part_files WHERE part_spec_id = ?', [req.params.id])

    // 물리적 파일 삭제
    for (const file of files) {
      try {
        await deleteFile(file.file_path)
      } catch (error) {
        console.warn(`[Part Spec Delete] 파일 삭제 실패 (계속 진행): ${file.file_path}`, error.message)
        // 파일이 이미 없어도 계속 진행
      }
    }

    // 데이터베이스 레코드 삭제 (CASCADE로 part_files도 자동 삭제됨)
    const [result] = await connection.execute('DELETE FROM part_specs WHERE id = ?', [req.params.id])

    if (result.affectedRows === 0) {
      await connection.rollback()
      return res.status(404).json({ error: '부품 스펙을 찾을 수 없습니다.' })
    }

    await connection.commit()

    res.json({
      message: '삭제되었습니다.',
      deletedFiles: files.length,
    })
  } catch (error) {
    await connection.rollback()
    console.error('부품 스펙 삭제 실패:', error)
    res.status(500).json({ error: error.message })
  } finally {
    // pool에서 가져온 connection만 release
    if (needsRelease && connection && typeof connection.release === 'function') {
      connection.release()
    }
  }
})

// 문서 파일 관리 API
app.use('/api/docs', documentFilesRouter)

// 아카이브 API
app.use('/api', archiveRouter)
app.use('/api', partFilesRouter)
app.use('/api', partsRouter)

// 데이터베이스 스키마 라우터 등록 (데이터베이스 연결 전에도 등록)
// 각 엔드포인트에서 연결 상태를 확인하므로 연결 실패해도 404 방지
// getDbConnection 함수를 전달하여 항상 최신 연결 상태를 참조하도록 함
const databaseSchemaRouter = createDatabaseSchemaRouter(() => dbConnection)
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
// 관리자 설정 API
// ============================================

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

// 간단한 Express API 서버
// 부품 데이터 관리를 위한 REST API

import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import multer from 'multer' // 파일 업로드를 위해 필요
import { getCategoryAbbreviation } from './utils/skuGenerator.js'
import { extractExtension, getFileType, getFileMimeType, getFileMaxSize, generateFolderPath, generateFilename, createSafeFilename, ensureFolderExists, saveFile, deleteFile, getFileSize, generateTempFilePath, moveTempFileToFolder, cleanupOldTempFiles } from './utils/fileUpload.js'
import documentFilesRouter from './routes/documentFiles.js'
import createDatabaseSchemaRouter from './routes/databaseSchema.js'
// 개발 전용 파일 편집 API (프로덕션에서는 라우터 내부에서 차단됨)
import devOnlyFileEditorRouter from './routes/devOnlyFileEditor.js'

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
    const filePath = path.join(__dirname, '../uploads', relativePath)

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
const staticMiddleware = express.static(path.join(__dirname, '../uploads'), {
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
  database: 'nexa_parts_db',
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

// 부품 클래스 API

// GET /api/part-classes - 모든 부품 클래스 조회 (휴지통 제외)
app.get('/api/part-classes', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(
      `SELECT pc.*,
              COALESCE((
                SELECT COUNT(DISTINCT pf.id)
                FROM part_files pf
                WHERE pf.part_class_id = pc.id AND pf.is_editor_image = 0
              ), 0) as file_upload_count
       FROM part_classes pc
       WHERE pc.deleted_at IS NULL
       ORDER BY pc.sort_order ASC, pc.sub_sort_order ASC, pc.updated_at DESC, pc.id ASC`,
    )

    // 개발 모드에서 디버깅
    if (process.env.NODE_ENV !== 'production' && rows.length > 0) {
      console.log('[부품 클래스 조회] 첫 번째 항목:', JSON.stringify(rows[0], null, 2))
      console.log('[부품 클래스 조회] file_upload_count 타입:', typeof rows[0].file_upload_count, '값:', rows[0].file_upload_count)
    }

    res.json(rows)
  } catch (error) {
    console.error('부품 클래스 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-classes/trash - 휴지통 목록 조회 (soft delete 된 항목)
// 주의: /api/part-classes/:id 라우트보다 "먼저" 정의되어야 함 (Express 라우트 매칭 순서)
app.get('/api/part-classes/trash', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(
      `SELECT pc.*,
              COALESCE((
                SELECT COUNT(DISTINCT pf.id)
                FROM part_files pf
                WHERE pf.part_class_id = pc.id AND pf.is_editor_image = 0
              ), 0) as file_upload_count
       FROM part_classes pc
       WHERE pc.deleted_at IS NOT NULL
       ORDER BY pc.deleted_at DESC, pc.sort_order ASC, pc.sub_sort_order ASC, pc.id ASC`,
    )

    res.json(rows)
  } catch (error) {
    console.error('[GET /api/part-classes/trash] 휴지통 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-classes/trash/count - 휴지통 개수 조회
// 주의: /api/part-classes/:id 라우트보다 "먼저" 정의되어야 함
app.get('/api/part-classes/trash/count', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute('SELECT COUNT(*) AS count FROM part_classes WHERE deleted_at IS NOT NULL')
    res.json({ count: rows[0]?.count || 0 })
  } catch (error) {
    console.error('[GET /api/part-classes/trash/count] 휴지통 개수 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-classes/:id - 특정 부품 클래스 조회 (휴지통 제외)
app.get('/api/part-classes/:id', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(
      `SELECT pc.*,
              COALESCE((
                SELECT COUNT(DISTINCT pf.id)
                FROM part_files pf
                WHERE pf.part_class_id = pc.id AND pf.is_editor_image = 0
              ), 0) as file_upload_count
       FROM part_classes pc
       WHERE pc.id = ? AND pc.deleted_at IS NULL`,
      [req.params.id],
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 클래스를 찾을 수 없습니다.' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('부품 클래스 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/part-classes - 부품 클래스 생성
app.post('/api/part-classes', async (req, res) => {
  try {
    console.log('[POST /api/part-classes] 요청 본문:', JSON.stringify(req.body, null, 2))
    const { name, c_code, code_name, description, category, example, sort_order, sub_sort_order, detailed_description } = req.body
    console.log('[POST /api/part-classes] detailed_description:', detailed_description ? `길이: ${detailed_description.length}` : 'null/undefined')

    if (!name) {
      return res.status(400).json({ error: '클래스명은 필수입니다.' })
    }

    if (!category) {
      return res.status(400).json({ error: '대분류명은 필수입니다.' })
    }

    // c_code 길이 검증 (최대 10자)
    if (c_code && c_code.length > 10) {
      return res.status(400).json({ error: 'C Code는 최대 10자까지 입력 가능합니다.' })
    }

    // sort_order가 제공되지 않거나 0이면 최대값 + 10으로 설정 (10단위 증가)
    let finalSortOrder = sort_order
    if (finalSortOrder === undefined || finalSortOrder === null || finalSortOrder === 0) {
      // 일반 추가 모드: sort_order가 0이면 자동 계산
      const [maxResult] = await dbConnection.execute('SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM part_classes WHERE deleted_at IS NULL')
      const maxSortOrder = maxResult[0]?.max_sort || 0
      // 10단위로 증가 (예: 0 -> 10, 10 -> 20, 15 -> 20)
      finalSortOrder = Math.ceil((maxSortOrder + 1) / 10) * 10
    }

    // sub_sort_order는 요청에서 받거나 기본값 0 사용
    const finalSubSortOrder = sub_sort_order !== undefined && sub_sort_order !== null ? Number(sub_sort_order) : 0

    const [result] = await dbConnection.execute(
      `INSERT INTO part_classes
       (name, c_code, code_name, description, category, example, sort_order, sub_sort_order, detailed_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, c_code, code_name, description, category, example, finalSortOrder, finalSubSortOrder, detailed_description !== undefined ? detailed_description : null],
    )

    const [newRow] = await dbConnection.execute('SELECT * FROM part_classes WHERE id = ?', [result.insertId])

    res.status(201).json(newRow[0])
  } catch (error) {
    console.error('부품 클래스 생성 실패:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: '이미 존재하는 클래스명입니다.' })
    }
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/part-classes/reorder - 여러 부품 클래스의 정렬 순서 일괄 변경
// 주의: 이 라우트는 /api/part-classes/:id 보다 먼저 정의되어야 합니다!
app.put('/api/part-classes/reorder', async (req, res) => {
  try {
    const { items } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items 배열이 필요합니다.' })
    }

    // 유효한 항목만 필터링
    const validItems = items.filter(
      (item) =>
        item && typeof item === 'object' && typeof item.id === 'number' && !isNaN(item.id) && item.id > 0 && typeof item.sort_order === 'number' && !isNaN(item.sort_order) && item.sort_order >= 0 && typeof item.sub_sort_order === 'number' && !isNaN(item.sub_sort_order) && item.sub_sort_order >= 0,
    )

    if (validItems.length === 0) {
      return res.status(400).json({ error: '유효한 항목이 없습니다.' })
    }

    // 트랜잭션 시작
    await dbConnection.beginTransaction()

    try {
      // 각 항목의 sort_order와 sub_sort_order 업데이트
      // validItems는 이미 필터링 단계에서 검증되었으므로 추가 검증 불필요
      for (const item of validItems) {
        const id = Number(item.id)
        const sortOrder = Number(item.sort_order)
        const subSortOrder = Number(item.sub_sort_order || 0)

        await dbConnection.execute('UPDATE part_classes SET sort_order = ?, sub_sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [sortOrder, subSortOrder, id])
      }

      await dbConnection.commit()
      res.json({ success: true, message: '정렬 순서가 업데이트되었습니다.' })
    } catch (error) {
      await dbConnection.rollback()
      throw error
    }
  } catch (error) {
    console.error('[API] 정렬 순서 변경 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/part-classes/reinitialize-sort-order - 모든 항목의 sort_order를 10단위로 재정렬
app.post('/api/part-classes/reinitialize-sort-order', async (req, res) => {
  try {
    // 트랜잭션 시작
    await dbConnection.beginTransaction()

    try {
      // 현재 표시 순서대로 모든 항목 조회
      // 중요: 재정렬 전 현재 화면에 표시되는 순서를 유지하기 위해
      // sort_order, updated_at, id 순으로 정렬 (GET /api/part-classes와 동일한 정렬)
      const [rows] = await dbConnection.execute(
        `SELECT id FROM part_classes
         WHERE deleted_at IS NULL
         ORDER BY sort_order ASC, sub_sort_order ASC, updated_at DESC, id ASC`,
      )

      if (rows.length === 0) {
        await dbConnection.commit()
        return res.json({ success: true, message: '재정렬할 항목이 없습니다.', count: 0 })
      }

      // 각 항목을 10, 20, 30, 40... 으로 재정렬 (0이 아닌 10부터 시작)
      // sub_sort_order는 모두 0으로 초기화
      const itemsToUpdate = []
      for (let i = 0; i < rows.length; i++) {
        const newSortOrder = (i + 1) * 10 // 10, 20, 30, 40...
        itemsToUpdate.push({
          id: rows[i].id,
          sort_order: newSortOrder,
          sub_sort_order: 0,
        })
      }

      // 디버깅: 재정렬할 데이터 확인
      if (process.env.NODE_ENV !== 'production') {
        console.log('[재정렬] 항목 수:', itemsToUpdate.length)
        console.log('[재정렬] 첫 5개 항목:', itemsToUpdate.slice(0, 5))
        console.log('[재정렬] 마지막 5개 항목:', itemsToUpdate.slice(-5))
      }

      // 일괄 업데이트
      let updateCount = 0
      const failedUpdates = []
      for (const item of itemsToUpdate) {
        // UPDATE 쿼리 실행
        // 주의: SELECT에서 이미 deleted_at IS NULL로 필터링했으므로, UPDATE에서는 ID만으로 업데이트
        const [updateResult] = await dbConnection.execute('UPDATE part_classes SET sort_order = ?, sub_sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [item.sort_order, item.sub_sort_order || 0, item.id])
        updateCount += updateResult.affectedRows

        // 디버깅: 업데이트 결과 확인
        if (process.env.NODE_ENV !== 'production') {
          if (updateResult.affectedRows === 0) {
            // 업데이트 실패한 항목의 현재 상태 확인
            const [checkRow] = await dbConnection.execute('SELECT id, sort_order, deleted_at FROM part_classes WHERE id = ?', [item.id])
            failedUpdates.push({
              id: item.id,
              expectedSortOrder: item.sort_order,
              currentState: checkRow[0] || null,
            })
            console.log(`[재정렬] 경고: ID ${item.id} 업데이트 실패 (affectedRows: 0)`, {
              expected: item.sort_order,
              current: checkRow[0] || '항목 없음',
            })
          }
        }
      }

      // 실패한 업데이트가 있으면 로그 출력
      if (process.env.NODE_ENV !== 'production' && failedUpdates.length > 0) {
        console.log(`[재정렬] 업데이트 실패한 항목 ${failedUpdates.length}개:`, failedUpdates)
      }

      // 0인 항목 확인 및 재처리
      const [zeroRows] = await dbConnection.execute(
        `SELECT id, sort_order, sub_sort_order FROM part_classes
         WHERE deleted_at IS NULL AND sort_order = 0`,
      )

      if (zeroRows.length > 0) {
        console.log(`[재정렬] 경고: sort_order가 0인 항목이 ${zeroRows.length}개 발견되어 재처리합니다:`, zeroRows)

        // 0인 항목들을 현재 최대값 이후에 배치
        const [maxResult] = await dbConnection.execute('SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM part_classes WHERE deleted_at IS NULL')
        const maxSortOrder = maxResult[0]?.max_sort || 0
        let nextSortOrder = Math.ceil((maxSortOrder + 1) / 10) * 10

        for (const zeroItem of zeroRows) {
          await dbConnection.execute('UPDATE part_classes SET sort_order = ?, sub_sort_order = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nextSortOrder, zeroItem.id])
          updateCount++
          nextSortOrder += 10
        }

        console.log(`[재정렬] sort_order가 0이었던 ${zeroRows.length}개 항목을 재처리했습니다.`)
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('[재정렬] 최종 업데이트된 항목 수:', updateCount)
        const [finalVerifyRows] = await dbConnection.execute(
          `SELECT id, sort_order, sub_sort_order FROM part_classes
           WHERE deleted_at IS NULL
           ORDER BY sort_order ASC, sub_sort_order ASC, id ASC
           LIMIT 10`,
        )
        console.log('[재정렬] 재정렬 후 첫 10개 항목:', finalVerifyRows)
      }

      await dbConnection.commit()
      res.json({
        success: true,
        message: `${updateCount}개 항목이 재정렬되었습니다.`,
        count: updateCount,
      })
    } catch (error) {
      await dbConnection.rollback()
      throw error
    }
  } catch (error) {
    console.error('[API] sort_order 재정렬 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/part-classes/:id - 부품 클래스 수정
// 주의: 이 라우트는 /api/part-classes/reorder 보다 나중에 정의되어야 합니다!
app.put('/api/part-classes/:id', async (req, res) => {
  try {
    console.log(`[PUT /api/part-classes/${req.params.id}] 요청 본문:`, JSON.stringify(req.body, null, 2))
    const { name, c_code, code_name, description, category, example, sort_order, detailed_description, is_active, is_favorite } = req.body
    console.log(`[PUT /api/part-classes/${req.params.id}] detailed_description:`, detailed_description ? `길이: ${detailed_description.length}` : 'null/undefined')

    if (!name) {
      return res.status(400).json({ error: '클래스명은 필수입니다.' })
    }

    if (!category) {
      return res.status(400).json({ error: '대분류명은 필수입니다.' })
    }

    // c_code 길이 검증 (최대 10자)
    if (c_code && c_code.length > 10) {
      return res.status(400).json({ error: 'C Code는 최대 10자까지 입력 가능합니다.' })
    }

    // sort_order가 제공되면 업데이트, 아니면 기존 값 유지
    const updateFields = ['name = ?', 'c_code = ?', 'code_name = ?', 'description = ?', 'category = ?', 'example = ?', 'detailed_description = ?']
    const updateValues = [name, c_code, code_name, description, category, example, detailed_description !== undefined ? detailed_description : null]

    if (sort_order !== undefined && sort_order !== null) {
      updateFields.push('sort_order = ?')
      updateValues.push(sort_order)
    }

    // is_active가 제공되면 업데이트
    if (is_active !== undefined && is_active !== null) {
      updateFields.push('is_active = ?')
      updateValues.push(is_active)
    }

    // is_favorite가 제공되면 업데이트
    if (is_favorite !== undefined && is_favorite !== null) {
      updateFields.push('is_favorite = ?')
      updateValues.push(is_favorite)
    }

    updateValues.push(req.params.id)

    await dbConnection.execute(
      `UPDATE part_classes
       SET ${updateFields.join(', ')}
       WHERE id = ?`,
      updateValues,
    )

    const [rows] = await dbConnection.execute('SELECT * FROM part_classes WHERE id = ?', [req.params.id])

    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 클래스를 찾을 수 없습니다.' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('부품 클래스 수정 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/part-classes/:id - 부품 클래스 삭제
app.delete('/api/part-classes/:id', async (req, res) => {
  const isPool = dbConnection && typeof dbConnection.getConnection === 'function'
  const connection = isPool ? await dbConnection.getConnection() : dbConnection
  const needsRelease = isPool // pool에서 가져온 connection만 release 필요

  try {
    await connection.beginTransaction()

    // Soft delete: 실제 레코드는 유지하고 deleted_at만 설정하여 휴지통으로 이동
    const [result] = await connection.execute('UPDATE part_classes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL', [req.params.id])

    if (result.affectedRows === 0) {
      await connection.rollback()
      return res.status(404).json({ error: '부품 클래스를 찾을 수 없거나 이미 삭제되었습니다.' })
    }

    await connection.commit()

    res.json({
      message: '삭제되었습니다. (휴지통으로 이동됨)',
    })
  } catch (error) {
    await connection.rollback()
    console.error('부품 클래스 삭제 실패:', error)
    res.status(500).json({ error: error.message })
  } finally {
    // pool에서 가져온 connection만 release
    if (needsRelease && connection && typeof connection.release === 'function') {
      connection.release()
    }
  }
})

// POST /api/part-classes/bulk-delete - 부품 클래스 복수 삭제 (soft delete)
app.post('/api/part-classes/bulk-delete', async (req, res) => {
  const isPool = dbConnection && typeof dbConnection.getConnection === 'function'
  const connection = isPool ? await dbConnection.getConnection() : dbConnection
  const needsRelease = isPool

  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids 배열이 필요합니다.' })
    }

    // 숫자 ID만 필터링
    const validIds = ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)

    if (validIds.length === 0) {
      return res.status(400).json({ error: '유효한 id가 없습니다.' })
    }

    await connection.beginTransaction()

    const [result] = await connection.execute(
      `UPDATE part_classes
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE deleted_at IS NULL AND id IN (${validIds.map(() => '?').join(',')})`,
      validIds,
    )

    await connection.commit()

    res.json({
      success: true,
      requested: validIds.length,
      affected: result.affectedRows || 0,
      message: '선택한 부품 분류가 휴지통으로 이동되었습니다.',
    })
  } catch (error) {
    if (connection.rollback) {
      await connection.rollback()
    }
    console.error('[POST /api/part-classes/bulk-delete] 복수 삭제 실패:', error)
    res.status(500).json({ error: error.message })
  } finally {
    if (needsRelease && connection && typeof connection.release === 'function') {
      connection.release()
    }
  }
})

// POST /api/part-classes/:id/restore - 휴지통에서 단일 복구
app.post('/api/part-classes/:id/restore', async (req, res) => {
  try {
    await dbConnection.beginTransaction()

    try {
      // 복구할 항목의 현재 상태 확인 (삭제 전 sort_order 값)
      const [targetRow] = await dbConnection.execute('SELECT id, sort_order FROM part_classes WHERE id = ? AND deleted_at IS NOT NULL', [req.params.id])

      if (targetRow.length === 0) {
        await dbConnection.rollback()
        return res.status(404).json({ error: '부품 클래스를 찾을 수 없거나 삭제되지 않았습니다.' })
      }

      const originalSortOrder = targetRow[0].sort_order || 0

      // 원래 sort_order부터 시작하여 충돌하지 않는 위치 찾기 (+1씩 증가)
      let finalSortOrder = originalSortOrder
      let attempts = 0
      const maxAttempts = 100 // 무한 루프 방지

      while (attempts < maxAttempts) {
        // 현재 sort_order가 활성 항목과 겹치는지 확인
        const [conflictRow] = await dbConnection.execute('SELECT id FROM part_classes WHERE deleted_at IS NULL AND sort_order = ? AND id != ?', [finalSortOrder, req.params.id])

        // 충돌이 없으면 해당 위치 사용
        if (conflictRow.length === 0) {
          break
        }

        // 충돌이 있으면 +1 증가하여 다시 시도
        finalSortOrder += 1
        attempts++
      }

      // 최대 시도 횟수를 초과하면 맨 뒤에 추가 (안전장치)
      if (attempts >= maxAttempts) {
        const [maxResult] = await dbConnection.execute('SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM part_classes WHERE deleted_at IS NULL')
        const maxSortOrder = maxResult[0]?.max_sort || 0
        finalSortOrder = Math.ceil((maxSortOrder + 1) / 10) * 10
      }

      // 복구 및 sort_order, sub_sort_order 설정 (sub_sort_order는 0으로 초기화)
      const [result] = await dbConnection.execute('UPDATE part_classes SET deleted_at = NULL, sort_order = ?, sub_sort_order = 0 WHERE id = ? AND deleted_at IS NOT NULL', [finalSortOrder, req.params.id])

      if (result.affectedRows === 0) {
        await dbConnection.rollback()
        return res.status(404).json({ error: '복구에 실패했습니다.' })
      }

      await dbConnection.commit()

      const [rows] = await dbConnection.execute('SELECT * FROM part_classes WHERE id = ?', [req.params.id])

      res.json({
        message: '복구되었습니다.',
        item: rows[0] || null,
      })
    } catch (error) {
      await dbConnection.rollback()
      throw error
    }
  } catch (error) {
    console.error('[POST /api/part-classes/:id/restore] 복구 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/part-classes/bulk-restore - 휴지통에서 복수 복구
app.post('/api/part-classes/bulk-restore', async (req, res) => {
  const isPool = dbConnection && typeof dbConnection.getConnection === 'function'
  const connection = isPool ? await dbConnection.getConnection() : dbConnection
  const needsRelease = isPool

  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids 배열이 필요합니다.' })
    }

    const validIds = ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)

    if (validIds.length === 0) {
      return res.status(400).json({ error: '유효한 id가 없습니다.' })
    }

    await connection.beginTransaction()

    try {
      // 복구할 항목들의 원래 sort_order 확인
      const [targetRows] = await connection.execute(
        `SELECT id, sort_order FROM part_classes
         WHERE deleted_at IS NOT NULL AND id IN (${validIds.map(() => '?').join(',')})`,
        validIds,
      )

      // 각 항목의 sort_order 충돌 확인 및 조정
      const itemsToRestore = []
      for (const target of targetRows) {
        const originalSortOrder = target.sort_order || 0

        // 원래 sort_order부터 시작하여 충돌하지 않는 위치 찾기 (+1씩 증가)
        let finalSortOrder = originalSortOrder
        let attempts = 0
        const maxAttempts = 100 // 무한 루프 방지

        while (attempts < maxAttempts) {
          // 현재 sort_order가 활성 항목과 겹치는지 확인
          const [conflictRow] = await connection.execute('SELECT id FROM part_classes WHERE deleted_at IS NULL AND sort_order = ?', [finalSortOrder])

          // 충돌이 없으면 해당 위치 사용
          if (conflictRow.length === 0) {
            break
          }

          // 충돌이 있으면 +1 증가하여 다시 시도
          finalSortOrder += 1
          attempts++
        }

        // 최대 시도 횟수를 초과하면 맨 뒤에 추가 (안전장치)
        if (attempts >= maxAttempts) {
          const [maxResult] = await connection.execute('SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM part_classes WHERE deleted_at IS NULL')
          const maxSortOrder = maxResult[0]?.max_sort || 0
          finalSortOrder = Math.ceil((maxSortOrder + 1) / 10) * 10
        }

        itemsToRestore.push({
          id: target.id,
          sort_order: finalSortOrder,
          sub_sort_order: 0,
        })
      }

      // 복구 및 sort_order, sub_sort_order 설정
      for (const item of itemsToRestore) {
        await connection.execute('UPDATE part_classes SET deleted_at = NULL, sort_order = ?, sub_sort_order = 0 WHERE id = ?', [item.sort_order, item.id])
      }

      await connection.commit()

      res.json({
        success: true,
        requested: validIds.length,
        affected: itemsToRestore.length,
        message: '선택한 부품 분류가 복구되었습니다.',
      })
    } catch (error) {
      if (connection.rollback) {
        await connection.rollback()
      }
      throw error
    }
  } catch (error) {
    console.error('[POST /api/part-classes/bulk-restore] 복수 복구 실패:', error)
    res.status(500).json({ error: error.message })
  } finally {
    if (needsRelease && connection && typeof connection.release === 'function') {
      connection.release()
    }
  }
})

// DELETE /api/part-classes/:id/permanent - 휴지통에서 완전 삭제 (파일 포함)
app.delete('/api/part-classes/:id/permanent', async (req, res) => {
  const isPool = dbConnection && typeof dbConnection.getConnection === 'function'
  const connection = isPool ? await dbConnection.getConnection() : dbConnection
  const needsRelease = isPool

  try {
    await connection.beginTransaction()

    // 삭제 대상이 휴지통에 있는지 확인
    const [rows] = await connection.execute('SELECT id FROM part_classes WHERE id = ? AND deleted_at IS NOT NULL FOR UPDATE', [req.params.id])

    if (rows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ error: '휴지통에서 삭제할 부품 클래스를 찾을 수 없습니다.' })
    }

    // 관련 파일 조회
    const [files] = await connection.execute('SELECT file_path FROM part_files WHERE part_class_id = ?', [req.params.id])

    // 물리적 파일 삭제 (실패해도 계속 진행)
    for (const file of files) {
      try {
        await deleteFile(file.file_path)
      } catch (error) {
        console.warn(`[Part Class Permanent Delete] 파일 삭제 실패 (계속 진행): ${file.file_path}`, error.message)
      }
    }

    // part_classes에서 실제 삭제 (CASCADE로 part_files도 삭제)
    const [result] = await connection.execute('DELETE FROM part_classes WHERE id = ? AND deleted_at IS NOT NULL', [req.params.id])

    if (result.affectedRows === 0) {
      await connection.rollback()
      return res.status(404).json({ error: '휴지통에서 삭제할 부품 클래스를 찾을 수 없습니다.' })
    }

    await connection.commit()

    res.json({
      message: '영구 삭제되었습니다.',
      deletedFiles: files.length,
    })
  } catch (error) {
    if (connection.rollback) {
      await connection.rollback()
    }
    console.error('[DELETE /api/part-classes/:id/permanent] 영구 삭제 실패:', error)
    res.status(500).json({ error: error.message })
  } finally {
    if (needsRelease && connection && typeof connection.release === 'function') {
      connection.release()
    }
  }
})

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

// 부품 파일 API

// GET /api/part-files/spec/:specId - 특정 스펙의 파일 조회 (더 구체적인 라우트를 먼저)
app.get('/api/part-files/spec/:specId', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(
      `SELECT pf.*, ps.manufacturer_part_number, ps.part_model_id,
              pm.model_name as part_model_name, pm.part_class_id,
              pc.name as part_class_name
       FROM part_files pf
       LEFT JOIN part_specs ps ON pf.part_spec_id = ps.id
       LEFT JOIN part_models pm ON ps.part_model_id = pm.id
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE pf.part_spec_id = ?
       ORDER BY pf.id`,
      [req.params.specId],
    )
    // 한글 인코딩을 위해 charset 명시
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.json(rows)
  } catch (error) {
    console.error('부품 파일 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-files/:id - 특정 부품 파일 조회
app.get('/api/part-files/:id', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute(
      `SELECT pf.*, ps.manufacturer_part_number, ps.part_model_id,
              pm.model_name as part_model_name, pm.part_class_id,
              pc.name as part_class_name
       FROM part_files pf
       LEFT JOIN part_specs ps ON pf.part_spec_id = ps.id
       LEFT JOIN part_models pm ON ps.part_model_id = pm.id
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE pf.id = ?`,
      [req.params.id],
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 파일을 찾을 수 없습니다.' })
    }
    // 한글 인코딩을 위해 charset 명시
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.json(rows[0])
  } catch (error) {
    console.error('부품 파일 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// 부품 파일 API (새로운 SKU 기반 구조)
// ============================================

// GET /api/part-files - 모든 부품 파일 조회 (새 스키마)
app.get('/api/part-files', async (req, res) => {
  try {
    const { part_class_id, part_model_id, part_spec_id, sku, is_editor_image } = req.query

    let query = `
      SELECT pf.*,
             COALESCE(pc.name, pm.model_name, ps.manufacturer_part_number) as item_name
      FROM part_files pf
      LEFT JOIN part_classes pc ON pf.part_class_id = pc.id
      LEFT JOIN part_models pm ON pf.part_model_id = pm.id
      LEFT JOIN part_specs ps ON pf.part_spec_id = ps.id
      WHERE 1=1
    `
    const params = []

    if (part_class_id) {
      query += ' AND pf.part_class_id = ?'
      params.push(part_class_id)
    }
    if (part_model_id) {
      query += ' AND pf.part_model_id = ?'
      params.push(part_model_id)
    }
    if (part_spec_id) {
      query += ' AND pf.part_spec_id = ?'
      params.push(part_spec_id)
    }
    if (sku) {
      query += ' AND pf.sku = ?'
      params.push(sku)
    }
    // is_editor_image 필터 추가 (0: 일반 파일만, 1: 에디터 이미지만, 없으면 모두)
    if (is_editor_image !== undefined && is_editor_image !== null) {
      query += ' AND pf.is_editor_image = ?'
      params.push(is_editor_image === '1' || is_editor_image === 1 ? 1 : 0)
    }

    query += ' ORDER BY pf.upload_date DESC, pf.id DESC'

    const [rows] = await dbConnection.execute(query, params)
    // 한글 인코딩을 위해 charset 명시
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.json(rows)
  } catch (error) {
    console.error('부품 파일 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// multer 설정 (메모리 스토리지 사용)
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 최대 100MB (파일 타입별 제한은 나중에 확인)
  },
})

// POST /api/part-files/upload - 파일 업로드 (새 스키마)
// FormData 방식으로 파일 업로드 (진행률 표시 지원)
app.post('/api/part-files/upload', upload.single('file'), async (req, res) => {
  // 트랜잭션을 위한 connection 가져오기
  // dbConnection이 pool이면 getConnection(), 아니면 직접 사용
  const isPool = dbConnection && typeof dbConnection.getConnection === 'function'
  const connection = isPool ? await dbConnection.getConnection() : dbConnection
  const needsRelease = isPool // pool에서 가져온 connection만 release 필요

  try {
    await connection.beginTransaction()

    // FormData에서 파일 및 필드 파싱
    if (!req.file) {
      return res.status(400).json({
        error: '파일이 필요합니다.',
      })
    }

    const fileBuffer = req.file.buffer
    // 파일명 우선순위: 쿼리 파라미터 > req.body.filename > req.file.originalname
    const filenameFromQuery = req.query.filename
    const filenameFromBody = req.body.filename
    const filenameFromFile = req.file.originalname

    console.log(`[파일 업로드] req.query.filename: ${filenameFromQuery}`)
    console.log(`[파일 업로드] req.body.filename: ${filenameFromBody}`)
    console.log(`[파일 업로드] req.file.originalname: ${filenameFromFile}`)

    let originalFilename = filenameFromQuery || filenameFromBody || filenameFromFile || 'unknown'

    // 쿼리 파라미터에서 가져온 경우 URL 디코딩
    if (filenameFromQuery) {
      try {
        originalFilename = decodeURIComponent(originalFilename)
        console.log(`[파일 업로드] URL 디코딩 후 파일명: ${originalFilename}`)
      } catch (decodeError) {
        console.warn(`[파일 업로드] URL 디코딩 실패, 원본 사용: ${originalFilename}`, decodeError)
      }
    }

    console.log(`[파일 업로드] 최종 선택된 originalFilename: ${originalFilename}`)

    // 한글 파일명 디코딩 처리
    // multer가 파일명을 받을 때 이미 깨진 상태로 받는 경우가 있음
    try {
      console.log(`[파일 업로드] 원본 파일명 (req.file.originalname): ${req.file.originalname}`)

      // URL 인코딩된 경우 디코딩
      if (originalFilename.includes('%')) {
        originalFilename = decodeURIComponent(originalFilename)
        console.log(`[파일 업로드] URL 디코딩 후: ${originalFilename}`)
      }

      // multer가 latin1로 잘못 인코딩한 경우를 감지하고 수정
      // 깨진 한글 패턴 감지: ì, í, ë 등이 연속으로 나타나는 경우
      const brokenKoreanPattern = /[ìíëêéè]/i
      if (req.file.originalname && brokenKoreanPattern.test(req.file.originalname)) {
        console.log('[파일 업로드] 깨진 한글 패턴 감지, latin1 -> utf8 변환 시도')
        try {
          // latin1로 잘못 인코딩된 utf8 문자열을 복구
          // Buffer.from(string, 'latin1').toString('utf8')로 변환
          const buffer = Buffer.from(req.file.originalname, 'latin1')
          const decoded = buffer.toString('utf8')

          console.log(`[파일 업로드] 디코딩 결과: before=${req.file.originalname}, after=${decoded}, lengthBefore=${req.file.originalname.length}, lengthAfter=${decoded.length}`)

          // 디코딩 결과가 더 의미있고, 실제 한글이 포함되어 있는지 확인
          if (decoded && decoded !== req.file.originalname) {
            // 한글이 포함되어 있는지 확인 (한글 유니코드 범위: \uAC00-\uD7A3)
            const hasKorean = /[\uAC00-\uD7A3]/.test(decoded)
            if (hasKorean || decoded.length > req.file.originalname.length) {
              originalFilename = decoded
              console.log(`[파일 업로드] 디코딩된 파일명 사용: ${originalFilename}`)
            } else {
              console.log('[파일 업로드] 디코딩 결과에 한글이 없음, 원본 유지')
            }
          }
        } catch (decodeError) {
          console.warn('[파일 업로드] 디코딩 실패:', decodeError.message)
        }
      } else {
        // 깨진 패턴이 없으면 그대로 사용
        console.log('[파일 업로드] 깨진 패턴 없음, 원본 사용')
      }

      console.log(`[파일 업로드] 최종 파일명: ${originalFilename}`)
    } catch (error) {
      console.warn('[파일 업로드] 파일명 디코딩 실패, 원본 사용:', error.message)
    }

    const partClassId = req.body.part_class_id ? parseInt(req.body.part_class_id) : null
    const partModelId = req.body.part_model_id ? parseInt(req.body.part_model_id) : null
    const partSpecId = req.body.part_spec_id ? parseInt(req.body.part_spec_id) : null
    const isEditorImage = req.body.is_editor_image === '1' || req.body.is_editor_image === 1 ? 1 : 0

    // 파일 확장자 및 타입 추출 (크기 검증을 위해 먼저 수행)
    const extension = extractExtension(originalFilename)
    const fileType = getFileType(extension)

    // 파일 타입별 크기 제한 확인
    const maxFileSize = getFileMaxSize(fileType)
    if (fileBuffer.length > maxFileSize) {
      await connection.rollback()
      const maxSizeMB = (maxFileSize / 1024 / 1024).toFixed(2)
      const currentSizeMB = (fileBuffer.length / 1024 / 1024).toFixed(2)
      return res.status(400).json({
        error: `파일 크기가 너무 큽니다.`,
        message: `최대 크기: ${maxSizeMB}MB (${fileType}), 현재: ${currentSizeMB}MB`,
      })
    }

    // 하나의 참조 ID만 있어야 함
    const refCount = [partClassId, partModelId, partSpecId].filter(Boolean).length
    if (refCount !== 1) {
      return res.status(400).json({
        error: 'part_class_id, part_model_id, part_spec_id 중 하나만 제공해야 합니다.',
      })
    }

    // 레코드 조회 및 정보 추출
    let record = null
    let cCode = null
    let categoryAbbr = null
    let tableName = null
    let recordId = null

    if (partClassId) {
      const [rows] = await connection.execute('SELECT * FROM part_classes WHERE id = ? FOR UPDATE', [partClassId])
      if (rows.length === 0) {
        return res.status(404).json({ error: '부품 분류를 찾을 수 없습니다.' })
      }
      record = rows[0]
      tableName = 'part_classes'
      recordId = partClassId

      cCode = record.c_code
      categoryAbbr = record.d_code || getCategoryAbbreviation(record.category)
    } else if (partModelId) {
      const [rows] = await connection.execute(
        `SELECT pm.*, pc.category, pc.c_code, pc.d_code
         FROM part_models pm
         LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
         WHERE pm.id = ? FOR UPDATE`,
        [partModelId],
      )
      if (rows.length === 0) {
        return res.status(404).json({ error: '부품 유형을 찾을 수 없습니다.' })
      }
      record = rows[0]
      tableName = 'part_models'
      recordId = partModelId

      cCode = record.c_code
      categoryAbbr = record.d_code || getCategoryAbbreviation(record.category)
    } else if (partSpecId) {
      const [rows] = await connection.execute(
        `SELECT ps.*, pm.part_class_id, pm.id as part_model_id,
                pc.category, pc.c_code, pc.d_code
         FROM part_specs ps
         LEFT JOIN part_models pm ON ps.part_model_id = pm.id
         LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
         WHERE ps.id = ? FOR UPDATE`,
        [partSpecId],
      )
      if (rows.length === 0) {
        return res.status(404).json({ error: '개별 부품을 찾을 수 없습니다.' })
      }
      record = rows[0]
      tableName = 'part_specs'
      recordId = partSpecId

      cCode = record.c_code
      categoryAbbr = record.d_code || getCategoryAbbreviation(record.category)
    }

    // 파일 확장자 및 타입 추출 (이미 위에서 수행됨, 재사용)
    // extension과 fileType은 이미 위에서 추출됨

    // 순차 번호 생성 (동시성 제어)
    // 실제로 사용 중인 최대 sequence를 찾아서 +1
    // FOR UPDATE를 사용하여 동시 요청 간 race condition 방지
    let maxSequenceQuery = ''
    let maxSequenceParams = []

    if (partSpecId) {
      maxSequenceQuery = 'SELECT COALESCE(MAX(file_sequence), 0) as max_seq FROM part_files WHERE part_spec_id = ? AND d_code = ? AND c_code = ? AND file_extension = ? FOR UPDATE'
      maxSequenceParams = [partSpecId, categoryAbbr, cCode, extension]
    } else if (partModelId) {
      maxSequenceQuery = 'SELECT COALESCE(MAX(file_sequence), 0) as max_seq FROM part_files WHERE part_model_id = ? AND d_code = ? AND c_code = ? AND file_extension = ? FOR UPDATE'
      maxSequenceParams = [partModelId, categoryAbbr, cCode, extension]
    } else {
      maxSequenceQuery = 'SELECT COALESCE(MAX(file_sequence), 0) as max_seq FROM part_files WHERE part_class_id = ? AND d_code = ? AND c_code = ? AND file_extension = ? FOR UPDATE'
      maxSequenceParams = [partClassId, categoryAbbr, cCode, extension]
    }

    const [maxSeqRows] = await connection.execute(maxSequenceQuery, maxSequenceParams)
    const maxSequence = maxSeqRows[0]?.max_seq || 0
    let sequence = maxSequence + 1

    // INSERT 시 중복 키 오류를 catch하고 재시도하는 로직
    let insertSuccess = false
    let maxRetries = 10
    let finalSequence = sequence
    let previousFilename = null // 이전 시도에서 생성된 파일명 저장

    while (!insertSuccess && maxRetries > 0) {
      try {
        // 파일명 결정 로직
        // 1. original_filename이 있으면 우선 사용 (에디터 파일 선택/클립보드 붙여넣기/일반 폼 필드)
        // 2. original_filename이 없거나 특수한 경우만 generateFilename 사용

        let filename
        const folderPath = generateFolderPath(categoryAbbr, cCode)
        const absoluteFolderPath = await ensureFolderExists(folderPath)

        // original_filename이 있고 기본값이 아니면 그대로 사용
        // 클립보드 이미지는 클라이언트에서 기본값(image.png 등)을 사용하므로 서버에서 자동 생성
        let finalOriginalFilename = originalFilename
        if (originalFilename && originalFilename !== 'unknown' && !originalFilename.startsWith('image.')) {
          // 에디터 파일 선택/일반 폼 필드: 원본 파일명 사용 (중복 시 시퀀스 번호 추가)
          filename = createSafeFilename(originalFilename, finalSequence)
        } else {
          // original_filename이 없거나 기본값이면 generateFilename으로 생성
          // 클립보드 이미지와 서버 자동 생성 모두 여기서 처리
          // 모든 자동 생성 파일명은 "STUDIO" 사용 (일관성 유지)
          filename = generateFilename(finalSequence, extension)
          // 생성된 파일명을 original_filename으로도 사용 (DB와 서버 파일명 일치)
          finalOriginalFilename = filename
        }

        const absoluteFilePath = path.join(absoluteFolderPath, filename)
        const relativeFilePath = `${folderPath}${filename}`

        // 이전 파일명 저장 (중복 키 오류 시 삭제용)
        previousFilename = filename

        // 파일 저장
        await saveFile(fileBuffer, absoluteFilePath)

        // 파일 크기 확인
        const fileSize = await getFileSize(absoluteFilePath)

        // MIME 타입 가져오기
        const mimeType = getFileMimeType(extension)

        // 데이터베이스에 레코드 삽입
        const [result] = await connection.execute(
          `INSERT INTO part_files
           (part_class_id, part_model_id, part_spec_id, c_code, d_code,
            file_extension, file_sequence, file_path, original_filename, file_type, file_mime_type, file_size, is_editor_image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [partClassId, partModelId, partSpecId, cCode, categoryAbbr, extension, finalSequence, relativeFilePath, finalOriginalFilename, fileType, mimeType, fileSize, isEditorImage],
        )

        // INSERT 성공
        insertSuccess = true

        // file_upload_count 업데이트 (최대 sequence로)
        await connection.execute(`UPDATE ${tableName} SET file_upload_count = ? WHERE id = ?`, [finalSequence, recordId])

        // 응답 데이터 준비
        const [newRow] = await connection.execute('SELECT * FROM part_files WHERE id = ?', [result.insertId])

        await connection.commit()

        res.status(201).json({
          ...newRow[0],
          message: '파일이 성공적으로 업로드되었습니다.',
        })
        return
      } catch (insertError) {
        // 중복 키 오류인 경우 sequence 증가 후 재시도
        if (insertError.code === 'ER_DUP_ENTRY' && insertError.errno === 1062) {
          finalSequence++
          maxRetries--
          // 파일이 저장되었으면 삭제
          if (previousFilename) {
            try {
              const folderPath = generateFolderPath(categoryAbbr, cCode)
              const absoluteFolderPath = await ensureFolderExists(folderPath)
              const absoluteFilePath = path.join(absoluteFolderPath, previousFilename)
              await fs.unlink(absoluteFilePath).catch(() => {
                // 파일 삭제 실패는 무시 (이미 없을 수 있음)
              })
            } catch {
              // 파일 삭제 실패는 무시
            }
          }
          continue
        } else {
          // 다른 오류인 경우 즉시 throw
          throw insertError
        }
      }
    }

    // 재시도 실패 (여기 도달하면 안 됨)
    await connection.rollback()
    throw new Error('순차 번호 생성 실패: 너무 많은 재시도')
  } catch (error) {
    if (connection.rollback) {
      await connection.rollback()
    }
    console.error('[File Upload] 파일 업로드 실패:', error)

    // 데이터베이스 오류인 경우 더 자세한 메시지 제공
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        error: 'part_files 테이블이 존재하지 않습니다. 데이터베이스 스키마를 확인하세요.',
        details: 'database/create_part_files_table.sql 파일을 실행하여 테이블을 생성하세요.',
      })
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({
        error: `데이터베이스 스키마 오류: ${error.message}`,
        details: 'part_files 테이블의 스키마가 최신 버전인지 확인하세요. database/create_part_files_table.sql 파일을 실행하세요.',
      })
    }

    res.status(500).json({ error: error.message })
  } finally {
    // pool에서 가져온 connection만 release
    if (needsRelease && connection && typeof connection.release === 'function') {
      connection.release()
    }
  }
})

// POST /api/part-files/upload-temp - 임시 파일 업로드 (part_class_id 없이도 가능)
app.post('/api/part-files/upload-temp', async (req, res) => {
  try {
    const body = req.body

    if (!body.file_data) {
      return res.status(400).json({
        error: 'file_data가 필요합니다.',
      })
    }

    if (!body.filename) {
      return res.status(400).json({
        error: 'filename이 필요합니다.',
      })
    }

    // base64 데이터를 Buffer로 변환
    const fileBuffer = Buffer.from(body.file_data, 'base64')

    // 확장자 추출
    const extension = extractExtension(body.filename)
    const fileType = getFileType(extension)

    // 파일 타입별 크기 제한 확인
    const maxFileSize = getFileMaxSize(fileType)
    if (fileBuffer.length > maxFileSize) {
      const maxSizeMB = (maxFileSize / 1024 / 1024).toFixed(2)
      const currentSizeMB = (fileBuffer.length / 1024 / 1024).toFixed(2)
      return res.status(400).json({
        error: `파일 크기가 너무 큽니다.`,
        message: `최대 크기: ${maxSizeMB}MB (${fileType}), 현재: ${currentSizeMB}MB`,
      })
    }

    // 임시 파일 경로 생성
    const tempFilePath = generateTempFilePath(body.filename)
    const absoluteTempPath = path.join(__dirname, '../', tempFilePath)

    // 임시 폴더 생성
    const tempFolder = path.dirname(absoluteTempPath)
    await fs.mkdir(tempFolder, { recursive: true })

    // 파일 저장
    await saveFile(fileBuffer, absoluteTempPath)

    // 파일 크기 확인
    const fileSize = await getFileSize(absoluteTempPath)

    // 응답 (DB에 저장하지 않음, 임시 파일이므로)
    res.status(201).json({
      temp_file_path: tempFilePath,
      original_filename: body.filename,
      file_extension: extension,
      file_type: fileType,
      file_size: fileSize,
      message: '임시 파일이 업로드되었습니다.',
    })
  } catch (error) {
    console.error('[Temp File Upload] 임시 파일 업로드 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/part-files/move-temp - 임시 파일을 정식 폴더로 이동하고 DB에 저장
app.post('/api/part-files/move-temp', async (req, res) => {
  const isPool = dbConnection && typeof dbConnection.getConnection === 'function'
  const connection = isPool ? await dbConnection.getConnection() : dbConnection
  const needsRelease = isPool // pool에서 가져온 connection만 release 필요

  try {
    await connection.beginTransaction()

    const body = req.body
    const {
      part_class_id,
      temp_file_path,
      target_filename, // 서버에서 자동 생성 (선택적, 없으면 temp_file_path에서 확장자 추출)
      original_filename,
      is_editor_image = 1,
    } = body
    // target_folder_path는 서버에서 자동 생성되므로 사용하지 않음

    if (!part_class_id || !temp_file_path) {
      await connection.rollback()
      return res.status(400).json({
        error: 'part_class_id와 temp_file_path가 필요합니다.',
      })
    }

    // target_folder_path와 target_filename이 없으면 서버에서 자동 생성 (이미 구현됨)

    // 임시 파일이 실제로 존재하는지 확인
    const absoluteTempPath = path.join(__dirname, '../', temp_file_path)
    try {
      await fs.access(absoluteTempPath)
    } catch {
      await connection.rollback()
      return res.status(404).json({ error: '임시 파일을 찾을 수 없습니다.' })
    }

    // part_class 정보 조회
    const [partClassRows] = await connection.execute('SELECT * FROM part_classes WHERE id = ? FOR UPDATE', [part_class_id])

    if (partClassRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ error: '부품 분류를 찾을 수 없습니다.' })
    }

    const partClass = partClassRows[0]
    const cCode = partClass.c_code
    const categoryAbbr = getCategoryAbbreviation(partClass.category)

    // 파일 확장자 추출 (target_filename이 없으면 temp_file_path에서 추출)
    let extension
    if (target_filename) {
      extension = extractExtension(target_filename)
    } else {
      // 임시 파일 경로에서 확장자 추출
      const tempFileName = path.basename(temp_file_path)
      extension = path.extname(tempFileName).toLowerCase().replace(/^\./, '') || 'jpg'
    }

    const fileType = getFileType(extension)
    const mimeType = getFileMimeType(extension)

    // 파일 시퀀스 번호 조회 (에디터 이미지용)
    const [fileRows] = await connection.execute('SELECT file_sequence FROM part_files WHERE part_class_id = ? AND is_editor_image = 1 ORDER BY file_sequence DESC LIMIT 1', [part_class_id])

    const sequence = fileRows.length > 0 ? fileRows[0].file_sequence + 1 : 1

    // 파일명 결정 로직
    // 1. original_filename이 있으면 우선 사용 (에디터 파일 선택/클립보드 붙여넣기/일반 폼 필드)
    // 2. original_filename이 없거나 특수한 경우만 generateFilename 사용
    let finalFilename
    let finalOriginalFilename
    if (original_filename && original_filename !== 'unknown') {
      // original_filename이 있고 기본값이 아니면 그대로 사용
      // 클립보드 이미지는 클라이언트에서 기본값(image.png 등)을 사용하므로 서버에서 자동 생성
      if (original_filename && original_filename !== 'unknown' && !original_filename.startsWith('image.')) {
        // 에디터 파일 선택/일반 폼 필드: 원본 파일명 사용 (중복 시 시퀀스 번호 추가)
        finalFilename = createSafeFilename(original_filename, sequence)
        finalOriginalFilename = original_filename
      } else {
        // original_filename이 없거나 기본값이면 generateFilename으로 생성
        // 클립보드 이미지와 서버 자동 생성 모두 여기서 처리
        // 모든 자동 생성 파일명은 "STUDIO" 사용 (일관성 유지)
        finalFilename = generateFilename(sequence, extension)
        // 생성된 파일명을 original_filename으로도 사용 (DB와 서버 파일명 일치)
        finalOriginalFilename = finalFilename
      }
    } else {
      // original_filename이 없으면 generateFilename으로 생성
      // 모든 자동 생성 파일명은 "STUDIO" 사용 (일관성 유지)
      finalFilename = generateFilename(sequence, extension)
      // 생성된 파일명을 original_filename으로도 사용 (DB와 서버 파일명 일치)
      finalOriginalFilename = finalFilename
    }

    // 최종 경로
    const finalFolderPath = generateFolderPath(categoryAbbr, cCode)
    const finalFilePath = `${finalFolderPath}${finalFilename}`

    // 파일 이동
    const absoluteTargetFolder = await ensureFolderExists(finalFolderPath)
    const absoluteTargetPath = path.join(absoluteTargetFolder, finalFilename)

    await moveTempFileToFolder(temp_file_path, finalFolderPath, finalFilename)

    // 파일 크기 확인
    const fileSize = await getFileSize(absoluteTargetPath)

    // DB에 레코드 삽입
    const [result] = await connection.execute(
      `INSERT INTO part_files
       (part_class_id, part_model_id, part_spec_id, c_code, d_code,
        file_extension, file_sequence, file_path, original_filename, file_type, file_mime_type, file_size, is_editor_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [part_class_id, null, null, cCode, categoryAbbr, extension, sequence, finalFilePath, finalOriginalFilename, fileType, mimeType, fileSize, is_editor_image],
    )

    // file_upload_count 증가
    await connection.execute(`UPDATE part_classes SET file_upload_count = ? WHERE id = ?`, [sequence, part_class_id])

    await connection.commit()

    // 응답
    const [newRow] = await connection.execute('SELECT * FROM part_files WHERE id = ?', [result.insertId])

    res.status(201).json({
      ...newRow[0],
      message: '임시 파일이 정식 폴더로 이동되었습니다.',
    })
  } catch (error) {
    if (connection.rollback) {
      await connection.rollback()
    }
    console.error('[Move Temp File] 임시 파일 이동 실패:', error)
    res.status(500).json({ error: error.message })
  } finally {
    // pool에서 가져온 connection만 release
    if (needsRelease && connection && typeof connection.release === 'function') {
      connection.release()
    }
  }
})

// POST /api/part-files - 부품 파일 생성 (레거시 - 호환성 유지)
app.post('/api/part-files', async (req, res) => {
  res.status(400).json({
    error: '이 엔드포인트는 더 이상 사용되지 않습니다. /api/part-files/upload를 사용하세요.',
  })
})

// PUT /api/part-files/:id - 부품 파일 수정 (레거시 - 비활성화)
// 파일 수정은 삭제 후 재업로드 방식으로 처리
app.put('/api/part-files/:id', async (req, res) => {
  res.status(400).json({
    error: '파일 수정은 지원하지 않습니다. 파일을 삭제한 후 다시 업로드하세요.',
  })
})

// POST /api/part-files/cleanup-orphaned-editor-images - 사용되지 않는 에디터 이미지 삭제
app.post('/api/part-files/cleanup-orphaned-editor-images', async (req, res) => {
  const isPool = dbConnection && typeof dbConnection.getConnection === 'function'
  const connection = isPool ? await dbConnection.getConnection() : dbConnection
  const needsRelease = isPool // pool에서 가져온 connection만 release 필요

  try {
    await connection.beginTransaction()

    const { part_class_id, current_image_urls } = req.body

    if (!part_class_id) {
      await connection.rollback()
      return res.status(400).json({ error: 'part_class_id가 필요합니다.' })
    }

    if (!Array.isArray(current_image_urls)) {
      await connection.rollback()
      return res.status(400).json({ error: 'current_image_urls는 배열이어야 합니다.' })
    }

    // 현재 사용 중인 이미지 URL에서 파일 경로 추출
    const currentFilePaths = new Set()
    for (const url of current_image_urls) {
      try {
        // URL에서 경로 추출
        let filePath = url
        if (url.startsWith('http://') || url.startsWith('https://')) {
          const urlObj = new URL(url)
          filePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname
        }

        // URL 디코딩
        try {
          filePath = decodeURIComponent(filePath)
        } catch {
          // 디코딩 실패 시 원본 사용
        }

        // uploads/로 시작하는 경로만 추가
        if (filePath.startsWith('uploads/')) {
          currentFilePaths.add(filePath)
        }
      } catch (error) {
        console.warn(`[Cleanup] URL 파싱 실패: ${url}`, error.message)
      }
    }

    console.log(`[Cleanup] 현재 사용 중인 이미지 경로:`, Array.from(currentFilePaths))

    // 해당 part_class_id의 모든 에디터 이미지 조회
    const [allEditorImages] = await connection.execute('SELECT * FROM part_files WHERE part_class_id = ? AND is_editor_image = 1', [part_class_id])

    // 사용되지 않는 이미지 찾기
    // file_path를 직접 비교하거나, URL에서 추출한 경로와 비교
    const orphanedImages = allEditorImages.filter((file) => {
      const filePath = file.file_path

      // 직접 경로 비교
      if (currentFilePaths.has(filePath)) {
        return false // 사용 중
      }

      // URL 인코딩된 경로와도 비교 (한글 경로 처리)
      // DB의 file_path는 디코딩된 상태이므로, URL에서 추출한 경로를 디코딩하여 비교
      for (const currentPath of currentFilePaths) {
        // 경로 정규화 비교
        if (currentPath === filePath) {
          return false // 사용 중
        }

        // URL 인코딩된 부분을 디코딩하여 비교
        try {
          const decodedCurrent = decodeURIComponent(currentPath)
          if (decodedCurrent === filePath) {
            return false // 사용 중
          }
        } catch {
          // 디코딩 실패 시 원본 비교 (이미 위에서 처리됨)
        }
      }

      return true // 사용되지 않음
    })

    console.log(`[Cleanup] 전체 에디터 이미지: ${allEditorImages.length}개, 사용되지 않는 이미지: ${orphanedImages.length}개`)

    let deletedCount = 0
    const deletedFiles = []

    // 사용되지 않는 이미지 삭제
    for (const file of orphanedImages) {
      try {
        // 물리적 파일 삭제
        try {
          await deleteFile(file.file_path)
        } catch (error) {
          console.warn(`[Cleanup] 물리적 파일 삭제 실패 (계속 진행): ${file.file_path}`, error.message)
        }

        // DB 레코드 삭제
        await connection.execute('DELETE FROM part_files WHERE id = ?', [file.id])

        deletedCount++
        deletedFiles.push({
          id: file.id,
          file_path: file.file_path,
        })
      } catch (error) {
        console.error(`[Cleanup] 파일 삭제 실패: ${file.id}`, error)
        // 계속 진행
      }
    }

    await connection.commit()

    res.json({
      message: `${deletedCount}개의 사용되지 않는 이미지가 삭제되었습니다.`,
      deleted_count: deletedCount,
      deleted_files: deletedFiles,
    })
  } catch (error) {
    if (connection.rollback) {
      await connection.rollback()
    }
    console.error('[Cleanup Orphaned Images] 삭제 실패:', error)
    res.status(500).json({ error: error.message })
  } finally {
    // pool에서 가져온 connection만 release
    if (needsRelease && connection && typeof connection.release === 'function') {
      connection.release()
    }
  }
})

// GET /api/part-files/:id/download - 파일 다운로드 (원본 파일명으로)
app.get('/api/part-files/:id/download', async (req, res) => {
  try {
    // 파일 정보 조회
    const [rows] = await dbConnection.execute('SELECT * FROM part_files WHERE id = ?', [req.params.id])

    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 파일을 찾을 수 없습니다.' })
    }

    const fileRecord = rows[0]

    // 파일 경로 확인
    const filePath = fileRecord.file_path
    if (!filePath) {
      return res.status(404).json({ error: '파일 경로를 찾을 수 없습니다.' })
    }

    // 상대 경로를 절대 경로로 변환
    const absoluteFilePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../', filePath)

    // 파일 존재 확인
    try {
      await fs.access(absoluteFilePath)
    } catch {
      return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    }

    // 파일 읽기
    const fileBuffer = await fs.readFile(absoluteFilePath)

    // MIME 타입 설정 (DB에 저장된 값 우선, 없으면 확장자 기반)
    let mimeType = 'application/octet-stream'

    if (fileRecord.file_mime_type) {
      mimeType = fileRecord.file_mime_type
    } else if (fileRecord.file_extension) {
      try {
        mimeType = getFileMimeType(fileRecord.file_extension) || mimeType
      } catch (error) {
        console.warn('MIME 타입 가져오기 실패:', error.message)
        // 확장자로부터 직접 추정
        const ext = fileRecord.file_extension.toLowerCase().replace(/^\./, '')
        if (ext === 'mp3') mimeType = 'audio/mpeg'
        else if (ext === 'mp4') mimeType = 'video/mp4'
        else if (ext === 'pdf') mimeType = 'application/pdf'
        else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`
        }
      }
    } else if (fileRecord.original_filename) {
      // 파일명에서 확장자 추출
      const ext = path.extname(fileRecord.original_filename).toLowerCase().replace(/^\./, '')
      if (ext) {
        try {
          mimeType = getFileMimeType(ext) || mimeType
        } catch (error) {
          console.warn('MIME 타입 가져오기 실패:', error.message)
        }
      }
    }

    // 원본 파일명 (특수 문자 처리)
    const originalFilename = fileRecord.original_filename || 'download'

    // HTTP 헤더의 filename 파라미터는 ASCII만 허용 (한글 등 비ASCII 문자 제거)
    // 제어 문자와 특수 문자 제거
    let safeFilename = originalFilename
      .replace(/"/g, "'") // 따옴표를 작은따옴표로 변경
      .replace(/\r/g, '') // 캐리지 리턴 제거
      .replace(/\n/g, ' ') // 줄바꿈을 공백으로 변경
      .split('')
      .filter((char) => {
        const code = char.charCodeAt(0)
        // ASCII 문자만 허용 (32-126: 공백, 인쇄 가능한 ASCII 문자)
        return code >= 32 && code <= 126
      })
      .join('')

    // 안전한 파일명이 비어있으면 기본값 사용
    if (!safeFilename || safeFilename.trim() === '') {
      safeFilename = 'download'
    }

    // 파일명에 특수 문자가 있으면 인코딩 (filename* 파라미터용)
    const encodedFilename = encodeURIComponent(originalFilename)

    // 응답 헤더 설정
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Content-Length', fileBuffer.length)

    // Content-Disposition 헤더 설정 (ASCII 파일명과 UTF-8 인코딩 파일명 모두 제공)
    // 헤더 값에 잘못된 문자가 없는지 최종 검증
    const contentDisposition = `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`

    // 헤더 값에 제어 문자나 잘못된 문자가 있는지 확인 (문자 코드로 체크)
    let hasInvalidChars = false
    for (let i = 0; i < contentDisposition.length; i++) {
      const code = contentDisposition.charCodeAt(i)
      if (code < 32 || code === 127) {
        hasInvalidChars = true
        break
      }
    }

    if (hasInvalidChars) {
      // 안전한 버전으로 폴백 (ASCII 파일명만 사용)
      const fallbackDisposition = `attachment; filename="${safeFilename}"`
      res.setHeader('Content-Disposition', fallbackDisposition)
    } else {
      res.setHeader('Content-Disposition', contentDisposition)
    }
    res.setHeader('Cache-Control', 'private, max-age=3600')

    // 파일 전송
    res.send(fileBuffer)
  } catch (error) {
    console.error('파일 다운로드 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/part-files/:id - 부품 파일 삭제 (새 스키마)
app.delete('/api/part-files/:id', async (req, res) => {
  try {
    // 파일 정보 조회
    const [rows] = await dbConnection.execute('SELECT * FROM part_files WHERE id = ?', [req.params.id])

    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 파일을 찾을 수 없습니다.' })
    }

    const fileRecord = rows[0]

    // 파일 삭제 (물리적 파일)
    try {
      await deleteFile(fileRecord.file_path)
    } catch (error) {
      console.warn(`[File Delete] 물리적 파일 삭제 실패 (계속 진행): ${error.message}`)
      // 파일이 이미 없어도 DB 레코드는 삭제
    }

    // 데이터베이스 레코드 삭제
    const [result] = await dbConnection.execute('DELETE FROM part_files WHERE id = ?', [req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '부품 파일을 찾을 수 없습니다.' })
    }

    // 주의: file_upload_count는 감소하지 않음 (번호 건너뛰기 정책)

    res.json({ message: '삭제되었습니다.' })
  } catch (error) {
    console.error('부품 파일 삭제 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// 문서 파일 관리 API
app.use('/api/docs', documentFilesRouter)

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

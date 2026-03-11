import { Router } from 'express'
import { errMessage, errCode } from '@/utils/errUtils.js'
import path from 'path'
import fs from 'fs/promises'
import fsSync from 'fs'
import multer from 'multer'
import { randomUUID } from 'crypto'
import { pool } from '@/config/dbConfig.js'

/** DB query row 타입 (pg rows는 Record 형태) */
type DbRow = Record<string, unknown>
import { getCategoryAbbreviation } from '@/utils/skuGenerator.js'
import { extractExtension, getFileType, getFileMimeType, getFileMaxSize, partsGenerateFolderPath, partsGenerateFilename, partsCreateSafeFilename, ensureFolderExists, deleteFile, getFileSize, generateTempFilePath, moveTempFileToFolder, saveFile } from '@/utils/fileUpload.js'
import { resolveUploadAbsolutePath, UPLOAD_BASE_DIR } from '@/config/upload.js'
import { MULTER_MAX_FILE_SIZE } from '@/config/fileTypes.js'

const router = Router()

const DOMAIN = 'parts'

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dest = path.join(UPLOAD_BASE_DIR, '_temp')
    fsSync.mkdirSync(dest, { recursive: true })
    cb(null, dest)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin'
    cb(null, `${randomUUID()}${ext}`)
  },
})

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: MULTER_MAX_FILE_SIZE, // 타입별 상한 중 최대값 (영상 300MB)
  },
})

// GET /api/part-files/spec/:specId - 특정 스펙의 파일 조회
router.get('/part-files/spec/:specId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pf.*, ps.manufacturer_part_number, ps.part_model_id,
              pm.model_name as part_model_name, pm.part_class_id,
              pc.name as part_class_name
       FROM part_files pf
       LEFT JOIN part_specs ps ON pf.part_spec_id = ps.id
       LEFT JOIN part_models pm ON ps.part_model_id = pm.id
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE pf.part_spec_id = $1
       ORDER BY pf.id`,
      [req.params?.specId ?? ''],
    )
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.json(rows)
  } catch (error: unknown) {
    console.error('부품 파일 조회 실패:', error)
    res.status(500).json({ error: errMessage(error) })
  }
})

// GET /api/part-files/:id - 특정 부품 파일 조회
router.get('/part-files/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pf.*, ps.manufacturer_part_number, ps.part_model_id,
              pm.model_name as part_model_name, pm.part_class_id,
              pc.name as part_class_name
       FROM part_files pf
       LEFT JOIN part_specs ps ON pf.part_spec_id = ps.id
       LEFT JOIN part_models pm ON ps.part_model_id = pm.id
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE pf.id = $1`,
      [req.params?.id ?? ''],
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 파일을 찾을 수 없습니다.' })
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.json(rows[0])
  } catch (error: unknown) {
    console.error('부품 파일 조회 실패:', error)
    res.status(500).json({ error: errMessage(error) })
  }
})

// GET /api/part-files - 모든 부품 파일 조회 (새 스키마)
router.get('/part-files', async (req, res) => {
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

    let paramIdx = 1
    if (part_class_id) {
      query += ` AND pf.part_class_id = $${paramIdx++}`
      params.push(part_class_id)
    }
    if (part_model_id) {
      query += ` AND pf.part_model_id = $${paramIdx++}`
      params.push(part_model_id)
    }
    if (part_spec_id) {
      query += ` AND pf.part_spec_id = $${paramIdx++}`
      params.push(part_spec_id)
    }
    if (sku) {
      query += ` AND pf.sku = $${paramIdx++}`
      params.push(sku)
    }
    if (is_editor_image !== undefined && is_editor_image !== null) {
      query += ` AND pf.is_editor_image = $${paramIdx++}`
      params.push(is_editor_image === '1' || is_editor_image === 1)
    }

    query += ' ORDER BY pf.upload_date DESC, pf.id DESC'

    const { rows } = await pool.query(query, params)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.json(rows)
  } catch (error: unknown) {
    console.error('부품 파일 조회 실패:', error)
    res.status(500).json({ error: errMessage(error) })
  }
})

// POST /api/part-files/upload - 파일 업로드 (새 스키마)
router.post('/part-files/upload', upload.single('file'), async (req, res) => {
  const client = await pool.connect()
  const tempRelativePath = req.file ? `uploads/_temp/${path.basename(req.file.path ?? '')}` : null
  let currentRelativePath = null
  try {
    await client.query('BEGIN')

    if (!req.file) {
      client.release()
      return res.status(400).json({ error: '파일이 필요합니다.' })
    }

    const fileSize = (req.file.size as number) || 0
    const filenameFromQuery = req.query.filename
    const filenameFromBody = req.body.filename
    const filenameFromFile = req.file.originalname

    let originalFilename = filenameFromQuery || filenameFromBody || filenameFromFile || 'unknown'
    if (filenameFromQuery) {
      try {
        originalFilename = decodeURIComponent(originalFilename)
      } catch {
        // pass
      }
    }
    if (originalFilename.includes('%')) {
      try {
        originalFilename = decodeURIComponent(originalFilename)
      } catch {
        // pass
      }
    }
    const brokenKoreanPattern = /[ìíëêéè]/i
    if (req.file.originalname && brokenKoreanPattern.test(req.file.originalname)) {
      try {
        const buffer = Buffer.from(req.file.originalname, 'latin1')
        const decoded = buffer.toString('utf8')
        if (decoded && decoded !== req.file.originalname) {
          const hasKorean = /[\uAC00-\uD7A3]/.test(decoded)
          if (hasKorean || decoded.length > req.file.originalname.length) {
            originalFilename = decoded
          }
        }
      } catch {
        // pass
      }
    }

    const partClassId = req.body.part_class_id ? parseInt(req.body.part_class_id) : null
    const partModelId = req.body.part_model_id ? parseInt(req.body.part_model_id) : null
    const partSpecId = req.body.part_spec_id ? parseInt(req.body.part_spec_id) : null
    const isEditorImage = req.body.is_editor_image === '1' || req.body.is_editor_image === 1

    const extension = extractExtension(originalFilename)
    const fileType = getFileType(extension)

    const maxFileSize = getFileMaxSize(fileType)
    if (fileSize > maxFileSize) {
      await client.query('ROLLBACK')
      if (tempRelativePath) await deleteFile(tempRelativePath)
      client.release()
      const maxSizeMB = (maxFileSize / 1024 / 1024).toFixed(2)
      const currentSizeMB = (fileSize / 1024 / 1024).toFixed(2)
      return res.status(400).json({
        error: `파일 크기가 너무 큽니다.`,
        message: `최대 크기: ${maxSizeMB}MB (${fileType}), 현재: ${currentSizeMB}MB`,
      })
    }

    const refCount = [partClassId, partModelId, partSpecId].filter(Boolean).length
    if (refCount !== 1) {
      if (tempRelativePath) await deleteFile(tempRelativePath)
      client.release()
      return res.status(400).json({
        error: 'part_class_id, part_model_id, part_spec_id 중 하나만 제공해야 합니다.',
      })
    }

    let record = null
    let cCode = null
    let categoryAbbr = null
    let tableName = null
    let recordId = null

    if (partClassId) {
      const { rows } = await client.query('SELECT * FROM part_classes WHERE id = $1 FOR UPDATE', [partClassId])
      if (rows.length === 0) {
        if (tempRelativePath) await deleteFile(tempRelativePath)
        client.release()
        return res.status(404).json({ error: '부품 분류를 찾을 수 없습니다.' })
      }
      record = rows[0] as DbRow
      tableName = 'part_classes'
      recordId = partClassId
      cCode = record.c_code as string
      categoryAbbr = (record.d_code as string) || getCategoryAbbreviation(record.category as string)
    } else if (partModelId) {
      const { rows } = await client.query(
        `SELECT pm.*, pc.category, pc.c_code, pc.d_code
         FROM part_models pm
         LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
         WHERE pm.id = $1 FOR UPDATE`,
        [partModelId],
      )
      if (rows.length === 0) {
        if (tempRelativePath) await deleteFile(tempRelativePath)
        client.release()
        return res.status(404).json({ error: '부품 유형을 찾을 수 없습니다.' })
      }
      record = rows[0] as DbRow
      tableName = 'part_models'
      recordId = partModelId
      cCode = record.c_code as string
      categoryAbbr = (record.d_code as string) || getCategoryAbbreviation(record.category as string)
    } else if (partSpecId) {
      const { rows } = await client.query(
        `SELECT ps.*, pm.part_class_id, pm.id as part_model_id,
                pc.category, pc.c_code, pc.d_code
         FROM part_specs ps
         LEFT JOIN part_models pm ON ps.part_model_id = pm.id
         LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
         WHERE ps.id = $1 FOR UPDATE`,
        [partSpecId],
      )
      if (rows.length === 0) {
        if (tempRelativePath) await deleteFile(tempRelativePath)
        client.release()
        return res.status(404).json({ error: '개별 부품을 찾을 수 없습니다.' })
      }
      record = rows[0] as DbRow
      tableName = 'part_specs'
      recordId = partSpecId
      cCode = record.c_code as string
      categoryAbbr = (record.d_code as string) || getCategoryAbbreviation(record.category as string)
    }

    let maxSequenceQuery = ''
    let maxSequenceParams = []
    if (partSpecId) {
      maxSequenceQuery = 'SELECT COALESCE(MAX(file_sequence), 0) as max_seq FROM part_files WHERE part_spec_id = $1 AND d_code = $2 AND c_code = $3 AND file_extension = $4 FOR UPDATE'
      maxSequenceParams = [partSpecId, categoryAbbr, cCode, extension]
    } else if (partModelId) {
      maxSequenceQuery = 'SELECT COALESCE(MAX(file_sequence), 0) as max_seq FROM part_files WHERE part_model_id = $1 AND d_code = $2 AND c_code = $3 AND file_extension = $4 FOR UPDATE'
      maxSequenceParams = [partModelId, categoryAbbr, cCode, extension]
    } else {
      maxSequenceQuery = 'SELECT COALESCE(MAX(file_sequence), 0) as max_seq FROM part_files WHERE part_class_id = $1 AND d_code = $2 AND c_code = $3 AND file_extension = $4 FOR UPDATE'
      maxSequenceParams = [partClassId, categoryAbbr, cCode, extension]
    }

    const { rows: maxSeqRows } = await client.query(maxSequenceQuery, maxSequenceParams)
    const maxSequence = Number((maxSeqRows[0] as DbRow)?.max_seq ?? 0)
    let sequence = maxSequence + 1

    let insertSuccess = false
    let maxRetries = 10
    let finalSequence = sequence

    while (!insertSuccess && maxRetries > 0) {
      try {
        let filename
        const folderPath = partsGenerateFolderPath(String(categoryAbbr ?? ''), String(cCode ?? ''), DOMAIN)
        const absoluteFolderPath = await ensureFolderExists(folderPath)

        let finalOriginalFilename = originalFilename
        if (originalFilename && originalFilename !== 'unknown' && !originalFilename.startsWith('image.')) {
          filename = partsCreateSafeFilename(originalFilename, finalSequence)
        } else {
          filename = partsGenerateFilename(finalSequence, extension, DOMAIN)
          finalOriginalFilename = filename
        }

        const absoluteFilePath = path.join(absoluteFolderPath, filename)
        const relativeFilePath = `${folderPath}${filename}`

        if (currentRelativePath === null && tempRelativePath) {
          currentRelativePath = await moveTempFileToFolder(String(tempRelativePath), folderPath, filename ?? '')
        } else {
          if (!currentRelativePath) throw new Error('currentRelativePath required')
          const currentAbsolutePath = resolveUploadAbsolutePath(currentRelativePath)
          await fs.rename(currentAbsolutePath, absoluteFilePath)
          currentRelativePath = relativeFilePath
        }
        const mimeType = getFileMimeType(extension)

        const { rows: insertRows } = await client.query(
          `INSERT INTO part_files
           (part_class_id, part_model_id, part_spec_id, c_code, d_code,
            file_extension, file_sequence, file_path, original_filename, file_type, file_mime_type, file_size, is_editor_image)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
          [partClassId, partModelId, partSpecId, cCode, categoryAbbr, extension, finalSequence, relativeFilePath, finalOriginalFilename, fileType, mimeType, fileSize, isEditorImage],
        )

        insertSuccess = true
        await client.query(`UPDATE ${tableName} SET file_upload_count = $1 WHERE id = $2`, [finalSequence, recordId])

        res.status(201).json({
          id: (insertRows[0] as DbRow).id,
          file_path: relativeFilePath,
          original_filename: finalOriginalFilename,
          file_extension: extension,
          file_type: fileType,
          file_mime_type: mimeType,
          file_size: fileSize,
          file_sequence: finalSequence,
          message: '파일이 업로드되었습니다.',
        })
      } catch (error: unknown) {
        if (errCode(error) === '23505') {
          maxRetries--
          finalSequence++
          continue
        }

        if (currentRelativePath) {
          try {
            await deleteFile(currentRelativePath)
          } catch {
            // pass
          }
        }
        throw error
      }
    }

    await client.query('COMMIT')
  } catch (error: unknown) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // ignore
    }
    if (tempRelativePath) {
      try {
        await deleteFile(tempRelativePath)
      } catch {
        /* ignore */
      }
    }
    if (currentRelativePath) {
      try {
        await deleteFile(currentRelativePath)
      } catch {
        /* ignore */
      }
    }
    console.error('[File Upload] 파일 업로드 실패:', error)

    if (errCode(error) === '42P01') {
      return res.status(500).json({
        error: 'part_files 테이블이 존재하지 않습니다. 데이터베이스 스키마를 확인하세요.',
        details: 'database/init_postgres.sql 파일을 실행하여 테이블을 생성하세요.',
      })
    }
    if (errCode(error) === '42703') {
      return res.status(500).json({
        error: `데이터베이스 스키마 오류: ${errMessage(error)}`,
        details: 'part_files 테이블의 스키마가 최신 버전인지 확인하세요. database/init_postgres.sql 파일을 실행하세요.',
      })
    }

    res.status(500).json({ error: errMessage(error) })
  } finally {
    client.release()
  }
})

// POST /api/part-files/upload-temp - 임시 파일 업로드
router.post('/part-files/upload-temp', async (req, res) => {
  try {
    const body = req.body

    if (!body.file_data) {
      return res.status(400).json({ error: 'file_data가 필요합니다.' })
    }
    if (!body.filename) {
      return res.status(400).json({ error: 'filename이 필요합니다.' })
    }

    const fileBuffer = Buffer.from(body.file_data, 'base64')
    const extension = extractExtension(body.filename)
    const fileType = getFileType(extension)
    const maxFileSize = getFileMaxSize(fileType)
    if (fileBuffer.length > maxFileSize) {
      const maxSizeMB = (maxFileSize / 1024 / 1024).toFixed(2)
      const currentSizeMB = (fileBuffer.length / 1024 / 1024).toFixed(2)
      return res.status(400).json({
        error: `파일 크기가 너무 큽니다.`,
        message: `최대 크기: ${maxSizeMB}MB (${fileType}), 현재: ${currentSizeMB}MB`,
      })
    }

    const tempFilePath = generateTempFilePath(body.filename)
    const absoluteTempPath = resolveUploadAbsolutePath(tempFilePath)

    const tempFolder = path.dirname(absoluteTempPath)
    await fs.mkdir(tempFolder, { recursive: true })
    await saveFile(fileBuffer, absoluteTempPath)

    const fileSize = await getFileSize(absoluteTempPath)

    res.status(201).json({
      temp_file_path: tempFilePath,
      original_filename: body.filename,
      file_extension: extension,
      file_type: fileType,
      file_size: fileSize,
      message: '임시 파일이 업로드되었습니다.',
    })
  } catch (error: unknown) {
    console.error('[Temp File Upload] 임시 파일 업로드 실패:', error)
    res.status(500).json({ error: errMessage(error) })
  }
})

// POST /api/part-files/move-temp - 임시 파일을 정식 폴더로 이동하고 DB에 저장
router.post('/part-files/move-temp', async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const body = req.body
    const { part_class_id, temp_file_path, target_filename, original_filename, is_editor_image = 1 } = body

    if (!part_class_id || !temp_file_path) {
      await client.query('ROLLBACK')
      client.release()
      return res.status(400).json({ error: 'part_class_id와 temp_file_path가 필요합니다.' })
    }

    const absoluteTempPath = resolveUploadAbsolutePath(temp_file_path)
    try {
      await fs.access(absoluteTempPath)
    } catch {
      await client.query('ROLLBACK')
      client.release()
      return res.status(404).json({ error: '임시 파일을 찾을 수 없습니다.' })
    }

    const { rows: partClassRows } = await client.query('SELECT * FROM part_classes WHERE id = $1 FOR UPDATE', [part_class_id])
    if (partClassRows.length === 0) {
      await client.query('ROLLBACK')
      client.release()
      return res.status(404).json({ error: '부품 분류를 찾을 수 없습니다.' })
    }

    const partClass = partClassRows[0] as DbRow
    const cCode = partClass.c_code as string
    const categoryAbbr = (partClass.d_code as string) || getCategoryAbbreviation(partClass.category as string)

    let extension
    if (target_filename) {
      extension = extractExtension(target_filename)
    } else {
      const tempFileName = path.basename(temp_file_path)
      extension = path.extname(tempFileName).toLowerCase().replace(/^\./, '') || 'jpg'
    }

    const maxSeqQuery = 'SELECT COALESCE(MAX(file_sequence), 0) as max_seq FROM part_files WHERE part_class_id = $1 AND d_code = $2 AND c_code = $3 AND file_extension = $4 FOR UPDATE'
    const { rows: maxSeqRows } = await client.query(maxSeqQuery, [part_class_id, categoryAbbr, cCode, extension])
    const maxSequence = Number((maxSeqRows[0] as DbRow)?.max_seq ?? 0)
    const newSequence = maxSequence + 1

    const folderPath = partsGenerateFolderPath(categoryAbbr, cCode, DOMAIN)
    const targetFolderPath = folderPath
    const targetName = target_filename || partsCreateSafeFilename(original_filename || `file.${extension}`)
    const relativePath = await moveTempFileToFolder(temp_file_path, targetFolderPath, targetName)

    const absoluteFilePath = resolveUploadAbsolutePath(relativePath)
    const fileSize = await getFileSize(absoluteFilePath)
    const mimeType = getFileMimeType(extension)
    const fileType = getFileType(extension)

    const { rows: insertRows } = await client.query(
      `INSERT INTO part_files
       (part_class_id, part_model_id, part_spec_id, c_code, d_code,
        file_extension, file_sequence, file_path, original_filename, file_type, file_mime_type, file_size, is_editor_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      [part_class_id, null, null, cCode, categoryAbbr, extension, newSequence, relativePath, original_filename || targetName, fileType, mimeType, fileSize, is_editor_image === 1 || is_editor_image === '1'],
    )

    await client.query('UPDATE part_classes SET file_upload_count = $1 WHERE id = $2', [newSequence, part_class_id])

    await client.query('COMMIT')

    res.status(201).json({
      id: (insertRows[0] as DbRow).id,
      file_path: relativePath,
      original_filename: original_filename || targetName,
      file_extension: extension,
      file_type: fileType,
      file_mime_type: mimeType,
      file_size: fileSize,
      file_sequence: newSequence,
      message: '임시 파일이 이동되었습니다.',
    })
  } catch (error: unknown) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // ignore
    }
    console.error('[Move Temp File] 실패:', error)
    res.status(500).json({ error: errMessage(error) })
  } finally {
    client.release()
  }
})

// POST /api/part-files/cleanup-orphaned-editor-images - 사용되지 않는 에디터 이미지 삭제
router.post('/part-files/cleanup-orphaned-editor-images', async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const part_class_id = parseInt(req.body.part_class_id)
    if (!part_class_id) {
      await client.query('ROLLBACK')
      client.release()
      return res.status(400).json({ error: 'part_class_id가 필요합니다.' })
    }

    // TODO: archives.part_class_id 연동 후 archive_doc에서 참조 중인 이미지 URL 수집
    // 현재 archives 테이블에 part_class_id가 없어 비활성화. 추후 아카이브 도메인 검토 시 복원
    const currentFilePaths = new Set()
    const { rows: allEditorImages } = await client.query('SELECT * FROM part_files WHERE part_class_id = $1 AND is_editor_image = true', [part_class_id])

    // 아카이브 참조 정보 없으면 삭제하지 않음 (오삭제 방지)
    const orphanedImages =
      currentFilePaths.size === 0 ? [] : (allEditorImages as DbRow[]).filter((file) => {
      const filePath = file.file_path as string
      if (currentFilePaths.has(filePath)) return false
      for (const currentPath of currentFilePaths) {
        if (typeof currentPath !== 'string') continue
        try {
          const decoded = decodeURIComponent(currentPath)
          if (decoded === filePath) return false
        } catch {
          // pass
        }
      }
      return true
    })

    let deletedCount = 0
    const deletedFiles: Array<{ id: unknown; file_path: unknown }> = []
    for (const file of orphanedImages) {
      try {
        try {
          await deleteFile(file.file_path as string)
        } catch (err: unknown) {
          console.warn(`[Cleanup] 물리적 파일 삭제 실패 (계속 진행): ${file.file_path}`, errMessage(err))
        }
        await client.query('DELETE FROM part_files WHERE id = $1', [file.id])
        deletedCount++
        deletedFiles.push({ id: file.id, file_path: file.file_path })
      } catch (err: unknown) {
        console.error(`[Cleanup] 파일 삭제 실패: ${file.id}`, err)
      }
    }

    await client.query('COMMIT')

    res.json({
      message: `${deletedCount}개의 사용되지 않는 이미지가 삭제되었습니다.`,
      deleted_count: deletedCount,
      deleted_files: deletedFiles,
    })
  } catch (error: unknown) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // ignore
    }
    console.error('[Cleanup Orphaned Images] 삭제 실패:', error)
    res.status(500).json({ error: errMessage(error) })
  } finally {
    client.release()
  }
})

// GET /api/part-files/:id/download - 파일 다운로드 (원본 파일명으로)
router.get('/part-files/:id/download', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM part_files WHERE id = $1', [req.params?.id ?? ''])
    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 파일을 찾을 수 없습니다.' })
    }
    const fileRecord = rows[0] as DbRow
    const filePath = fileRecord.file_path as string
    if (!filePath) {
      return res.status(404).json({ error: '파일 경로를 찾을 수 없습니다.' })
    }

    const absoluteFilePath = resolveUploadAbsolutePath(filePath)
    try {
      await fs.access(absoluteFilePath)
    } catch {
      return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    }

    const fileBuffer = await fs.readFile(absoluteFilePath)

    let mimeType = 'application/octet-stream'
    if (fileRecord.file_mime_type) {
      mimeType = fileRecord.file_mime_type as string
    } else if (fileRecord.file_extension) {
      try {
        mimeType = getFileMimeType(fileRecord.file_extension as string) || mimeType
      } catch {
        const ext = (fileRecord.file_extension as string).toLowerCase().replace(/^\./, '')
        if (ext === 'mp3') mimeType = 'audio/mpeg'
        else if (ext === 'mp4') mimeType = 'video/mp4'
        else if (ext === 'pdf') mimeType = 'application/pdf'
        else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`
        }
      }
    } else if (fileRecord.original_filename) {
      const ext = path.extname(fileRecord.original_filename as string).toLowerCase().replace(/^\./, '')
      if (ext) {
        try {
          mimeType = getFileMimeType(ext) || mimeType
        } catch {
          // pass
        }
      }
    }

    const originalFilename = (fileRecord.original_filename as string) || 'download'
    let safeFilename = originalFilename
      .replace(/"/g, "'")
      .replace(/\r/g, '')
      .replace(/\n/g, ' ')
      .split('')
      .filter((char) => {
        const code = char.charCodeAt(0)
        return code >= 32 && code <= 126
      })
      .join('')
    if (!safeFilename || safeFilename.trim() === '') {
      safeFilename = 'download'
    }
    const encodedFilename = encodeURIComponent(originalFilename)
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Content-Length', fileBuffer.length)
    const contentDisposition = `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`
    let hasInvalidChars = false
    for (let i = 0; i < contentDisposition.length; i++) {
      const code = contentDisposition.charCodeAt(i)
      if (code < 32 || code === 127) {
        hasInvalidChars = true
        break
      }
    }
    if (hasInvalidChars) {
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`)
    } else {
      res.setHeader('Content-Disposition', contentDisposition)
    }
    res.setHeader('Cache-Control', 'private, max-age=3600')
    res.send(fileBuffer)
  } catch (error: unknown) {
    console.error('파일 다운로드 실패:', error)
    res.status(500).json({ error: errMessage(error) })
  }
})

// DELETE /api/part-files/:id - 부품 파일 삭제
router.delete('/part-files/:id', async (req, res) => {
  const client = await pool.connect()
  try {
    const { rows } = await client.query('SELECT * FROM part_files WHERE id = $1', [req.params?.id ?? ''])
    if (rows.length === 0) {
      client.release()
      return res.status(404).json({ error: '부품 파일을 찾을 수 없습니다.' })
    }

    const fileRecord = rows[0] as DbRow
    try {
      await deleteFile(fileRecord.file_path as string)
    } catch (err: unknown) {
      console.warn(`[File Delete] 물리적 파일 삭제 실패 (계속 진행): ${errMessage(err)}`)
    }

    const result = await client.query('DELETE FROM part_files WHERE id = $1', [req.params?.id ?? ''])
    if ((result.rowCount ?? 0) === 0) {
      client.release()
      return res.status(404).json({ error: '부품 파일을 찾을 수 없습니다.' })
    }

    res.json({ message: '삭제되었습니다.' })
  } catch (error: unknown) {
    console.error('부품 파일 삭제 실패:', error)
    res.status(500).json({ error: errMessage(error) })
  } finally {
    client.release()
  }
})

// 레거시 안내 엔드포인트
router.post('/part-files', async (req, res) => {
  res.status(400).json({
    error: '이 엔드포인트는 더 이상 사용되지 않습니다. /api/part-files/upload를 사용하세요.',
  })
})

router.put('/part-files/:id', async (req, res) => {
  res.status(400).json({
    error: '파일 수정은 지원하지 않습니다. 파일을 삭제한 후 다시 업로드하세요.',
  })
})

export default router

import express from 'express'
import path from 'path'
import fs from 'fs/promises'
import multer from 'multer'
import { pool } from '../../config/db.js'
import { getCategoryAbbreviation } from '../../utils/skuGenerator.js'
import { extractExtension, getFileType, getFileMimeType, getFileMaxSize, generateFolderPath, generateFilename, createSafeFilename, ensureFolderExists, saveFile, deleteFile, getFileSize, generateTempFilePath, moveTempFileToFolder } from '../../utils/fileUpload.js'
import { resolveUploadAbsolutePath } from '../../config/upload.js'

const router = express.Router()

// multer 설정 (메모리 스토리지 사용)
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 최대 100MB (파일 타입별 제한은 별도 검사)
  },
})

// GET /api/part-files/spec/:specId - 특정 스펙의 파일 조회
router.get('/part-files/spec/:specId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
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
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.json(rows)
  } catch (error) {
    console.error('부품 파일 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-files/:id - 특정 부품 파일 조회
router.get('/part-files/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
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
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.json(rows[0])
  } catch (error) {
    console.error('부품 파일 조회 실패:', error)
    res.status(500).json({ error: error.message })
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
    if (is_editor_image !== undefined && is_editor_image !== null) {
      query += ' AND pf.is_editor_image = ?'
      params.push(is_editor_image === '1' || is_editor_image === 1 ? 1 : 0)
    }

    query += ' ORDER BY pf.upload_date DESC, pf.id DESC'

    const [rows] = await pool.execute(query, params)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.json(rows)
  } catch (error) {
    console.error('부품 파일 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/part-files/upload - 파일 업로드 (새 스키마)
router.post('/part-files/upload', upload.single('file'), async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    if (!req.file) {
      return res.status(400).json({ error: '파일이 필요합니다.' })
    }

    const fileBuffer = req.file.buffer
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
    const isEditorImage = req.body.is_editor_image === '1' || req.body.is_editor_image === 1 ? 1 : 0

    const extension = extractExtension(originalFilename)
    const fileType = getFileType(extension)

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

    const refCount = [partClassId, partModelId, partSpecId].filter(Boolean).length
    if (refCount !== 1) {
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

    let insertSuccess = false
    let maxRetries = 10
    let finalSequence = sequence
    let previousFilename = null

    while (!insertSuccess && maxRetries > 0) {
      try {
        let filename
        const folderPath = generateFolderPath(categoryAbbr, cCode)
        const absoluteFolderPath = await ensureFolderExists(folderPath)

        let finalOriginalFilename = originalFilename
        if (originalFilename && originalFilename !== 'unknown' && !originalFilename.startsWith('image.')) {
          filename = createSafeFilename(originalFilename, finalSequence)
        } else {
          filename = generateFilename(finalSequence, extension)
          finalOriginalFilename = filename
        }

        const absoluteFilePath = path.join(absoluteFolderPath, filename)
        const relativeFilePath = `${folderPath}${filename}`
        previousFilename = filename

        await saveFile(fileBuffer, absoluteFilePath)
        const fileSize = await getFileSize(absoluteFilePath)
        const mimeType = getFileMimeType(extension)

        const [result] = await connection.execute(
          `INSERT INTO part_files
           (part_class_id, part_model_id, part_spec_id, c_code, d_code,
            file_extension, file_sequence, file_path, original_filename, file_type, file_mime_type, file_size, is_editor_image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [partClassId, partModelId, partSpecId, cCode, categoryAbbr, extension, finalSequence, relativeFilePath, finalOriginalFilename, fileType, mimeType, fileSize, isEditorImage],
        )

        insertSuccess = true
        await connection.execute(`UPDATE ${tableName} SET file_upload_count = ? WHERE id = ?`, [finalSequence, recordId])

        res.status(201).json({
          id: result.insertId,
          file_path: relativeFilePath,
          original_filename: finalOriginalFilename,
          file_extension: extension,
          file_type: fileType,
          file_mime_type: mimeType,
          file_size: fileSize,
          file_sequence: finalSequence,
          message: '파일이 업로드되었습니다.',
        })
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          maxRetries--
          finalSequence++
          continue
        }

        if (previousFilename) {
          const folderPath = generateFolderPath(categoryAbbr, cCode)
          const absoluteFolderPath = await ensureFolderExists(folderPath)
          const previousFilePath = path.join(absoluteFolderPath, previousFilename)
          try {
            await fs.unlink(previousFilePath)
          } catch {
            // pass
          }
        }
        throw error
      }
    }

    await connection.commit()
  } catch (error) {
    if (connection.rollback) {
      await connection.rollback()
    }
    console.error('[File Upload] 파일 업로드 실패:', error)

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
    connection.release()
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
  } catch (error) {
    console.error('[Temp File Upload] 임시 파일 업로드 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/part-files/move-temp - 임시 파일을 정식 폴더로 이동하고 DB에 저장
router.post('/part-files/move-temp', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const body = req.body
    const { part_class_id, temp_file_path, target_filename, original_filename, is_editor_image = 1 } = body

    if (!part_class_id || !temp_file_path) {
      await connection.rollback()
      return res.status(400).json({ error: 'part_class_id와 temp_file_path가 필요합니다.' })
    }

    const absoluteTempPath = resolveUploadAbsolutePath(temp_file_path)
    try {
      await fs.access(absoluteTempPath)
    } catch {
      await connection.rollback()
      return res.status(404).json({ error: '임시 파일을 찾을 수 없습니다.' })
    }

    const [partClassRows] = await connection.execute('SELECT * FROM part_classes WHERE id = ? FOR UPDATE', [part_class_id])
    if (partClassRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ error: '부품 분류를 찾을 수 없습니다.' })
    }

    const partClass = partClassRows[0]
    const cCode = partClass.c_code
    const categoryAbbr = partClass.d_code || getCategoryAbbreviation(partClass.category)

    let extension
    if (target_filename) {
      extension = extractExtension(target_filename)
    } else {
      const tempFileName = path.basename(temp_file_path)
      extension = path.extname(tempFileName).toLowerCase().replace(/^\./, '') || 'jpg'
    }

    const maxSeqQuery = 'SELECT COALESCE(MAX(file_sequence), 0) as max_seq FROM part_files WHERE part_class_id = ? AND d_code = ? AND c_code = ? AND file_extension = ? FOR UPDATE'
    const [maxSeqRows] = await connection.execute(maxSeqQuery, [part_class_id, categoryAbbr, cCode, extension])
    const maxSequence = maxSeqRows[0]?.max_seq || 0
    const newSequence = maxSequence + 1

    const folderPath = generateFolderPath(categoryAbbr, cCode)
    const targetFolderPath = folderPath
    const targetName = target_filename || createSafeFilename(original_filename || `file.${extension}`)
    const relativePath = await moveTempFileToFolder(temp_file_path, targetFolderPath, targetName)

    const absoluteFilePath = resolveUploadAbsolutePath(relativePath)
    const fileSize = await getFileSize(absoluteFilePath)
    const mimeType = getFileMimeType(extension)
    const fileType = getFileType(extension)

    const [result] = await connection.execute(
      `INSERT INTO part_files
       (part_class_id, part_model_id, part_spec_id, c_code, d_code,
        file_extension, file_sequence, file_path, original_filename, file_type, file_mime_type, file_size, is_editor_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [part_class_id, null, null, cCode, categoryAbbr, extension, newSequence, relativePath, original_filename || targetName, fileType, mimeType, fileSize, is_editor_image],
    )

    await connection.execute('UPDATE part_classes SET file_upload_count = ? WHERE id = ?', [newSequence, part_class_id])

    await connection.commit()

    res.status(201).json({
      id: result.insertId,
      file_path: relativePath,
      original_filename: original_filename || targetName,
      file_extension: extension,
      file_type: fileType,
      file_mime_type: mimeType,
      file_size: fileSize,
      file_sequence: newSequence,
      message: '임시 파일이 이동되었습니다.',
    })
  } catch (error) {
    if (connection.rollback) {
      await connection.rollback()
    }
    console.error('[Move Temp File] 실패:', error)
    res.status(500).json({ error: error.message })
  } finally {
    connection.release()
  }
})

// POST /api/part-files/cleanup-orphaned-editor-images - 사용되지 않는 에디터 이미지 삭제
router.post('/part-files/cleanup-orphaned-editor-images', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const part_class_id = parseInt(req.body.part_class_id)
    if (!part_class_id) {
      await connection.rollback()
      return res.status(400).json({ error: 'part_class_id가 필요합니다.' })
    }

    const [rows] = await connection.execute('SELECT content_json FROM archive_doc WHERE archive_id IN (SELECT id FROM archives WHERE part_class_id = ?)', [part_class_id])

    const currentFilePaths = new Set()
    for (const row of rows) {
      try {
        const contentJson = row.content_json
        if (!contentJson) continue
        const doc = typeof contentJson === 'string' ? JSON.parse(contentJson) : contentJson
        const urls = JSON.stringify(doc).match(/https?:\/\/[^"'\s)]+/g) || []
        urls.forEach((url) => currentFilePaths.add(url))
      } catch (error) {
        console.warn('[Cleanup] JSON 파싱 실패:', error.message)
      }
    }

    const [allEditorImages] = await connection.execute('SELECT * FROM part_files WHERE part_class_id = ? AND is_editor_image = 1', [part_class_id])

    const orphanedImages = allEditorImages.filter((file) => {
      const filePath = file.file_path
      if (currentFilePaths.has(filePath)) return false
      for (const currentPath of currentFilePaths) {
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
    const deletedFiles = []
    for (const file of orphanedImages) {
      try {
        try {
          await deleteFile(file.file_path)
        } catch (error) {
          console.warn(`[Cleanup] 물리적 파일 삭제 실패 (계속 진행): ${file.file_path}`, error.message)
        }
        await connection.execute('DELETE FROM part_files WHERE id = ?', [file.id])
        deletedCount++
        deletedFiles.push({ id: file.id, file_path: file.file_path })
      } catch (error) {
        console.error(`[Cleanup] 파일 삭제 실패: ${file.id}`, error)
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
    connection.release()
  }
})

// GET /api/part-files/:id/download - 파일 다운로드 (원본 파일명으로)
router.get('/part-files/:id/download', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM part_files WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 파일을 찾을 수 없습니다.' })
    }
    const fileRecord = rows[0]
    const filePath = fileRecord.file_path
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
      mimeType = fileRecord.file_mime_type
    } else if (fileRecord.file_extension) {
      try {
        mimeType = getFileMimeType(fileRecord.file_extension) || mimeType
      } catch {
        const ext = fileRecord.file_extension.toLowerCase().replace(/^\./, '')
        if (ext === 'mp3') mimeType = 'audio/mpeg'
        else if (ext === 'mp4') mimeType = 'video/mp4'
        else if (ext === 'pdf') mimeType = 'application/pdf'
        else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`
        }
      }
    } else if (fileRecord.original_filename) {
      const ext = path.extname(fileRecord.original_filename).toLowerCase().replace(/^\./, '')
      if (ext) {
        try {
          mimeType = getFileMimeType(ext) || mimeType
        } catch {
          // pass
        }
      }
    }

    const originalFilename = fileRecord.original_filename || 'download'
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
  } catch (error) {
    console.error('파일 다운로드 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/part-files/:id - 부품 파일 삭제
router.delete('/part-files/:id', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute('SELECT * FROM part_files WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 파일을 찾을 수 없습니다.' })
    }

    const fileRecord = rows[0]
    try {
      await deleteFile(fileRecord.file_path)
    } catch (error) {
      console.warn(`[File Delete] 물리적 파일 삭제 실패 (계속 진행): ${error.message}`)
    }

    const [result] = await connection.execute('DELETE FROM part_files WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '부품 파일을 찾을 수 없습니다.' })
    }

    res.json({ message: '삭제되었습니다.' })
  } catch (error) {
    console.error('부품 파일 삭제 실패:', error)
    res.status(500).json({ error: error.message })
  } finally {
    connection.release()
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

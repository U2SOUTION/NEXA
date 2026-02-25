/**
 * 전역 files API
 * 도메인 파라미터로 ai, archive, parts 등 지원
 * @see docs/AI_드롭존_첨부_기능_플랜.md
 */

import express from 'express'
import multer from 'multer'
import { pool } from '../config/dbConfig.js'
import { resolveUploadAbsolutePath } from '../config/upload.js'
import {
  extractExtension,
  getFileType,
  getFileMimeType,
  getFileMaxSize,
  generateFolderPath,
  generateTimestampFilename,
  computeContentHash,
  ensureFolderExists,
  saveFile,
  deleteFile,
} from '../utils/fileUpload.js'

const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
})

/**
 * Multer originalname 인코딩 보정
 * UTF-8 파일명이 Latin-1로 잘못 해석될 때 발생하는 깨짐(ì¤í¬ë¦° 등) 수정
 * @see server/domains/parts/partFiles.routes.js, multer UTF-8 filename 이슈
 */
function fixFilenameEncoding(name) {
  if (!name || typeof name !== 'string') return name
  const mojibakePattern = /[ìíëêéè¤¬¦°·]/i
  if (!mojibakePattern.test(name)) return name
  try {
    const decoded = Buffer.from(name, 'latin1').toString('utf8')
    if (decoded && decoded !== name) return decoded
  } catch {
    /* ignore */
  }
  return name
}

/** file_type -> upload category 폴더명 매핑 */
const FILE_TYPE_TO_CATEGORY = {
  image: 'images',
  pdf: 'documents',
  document: 'documents',
  video: 'video',
  audio: 'audio',
  '3d_model': 'documents',
  archive: 'documents',
  other: 'documents',
}

/** POST /api/files/upload */
router.post('/files/upload', upload.single('file'), async (req, res) => {
  try {
    const domain = req.body.domain || req.query.domain
    if (!domain) {
      return res.status(400).json({ code: 'MISSING_DOMAIN', error: 'domain 파라미터가 필요합니다.' })
    }

    if (!req.file) {
      return res.status(400).json({ code: 'INVALID_FILE_TYPE', error: '파일이 필요합니다.' })
    }

    const fileBuffer = req.file.buffer
    const originalName = fixFilenameEncoding(req.file.originalname || 'unknown')

    const extension = extractExtension(originalName)
    const fileType = getFileType(extension)
    const maxSize = getFileMaxSize(fileType)

    if (fileBuffer.length > maxSize) {
      return res.status(400).json({
        code: 'FILE_TOO_LARGE',
        error: `파일 크기가 너무 큽니다. (최대: ${(maxSize / 1024 / 1024).toFixed(1)}MB)`,
      })
    }

    let contentHash
    try {
      contentHash = computeContentHash(fileBuffer)
    } catch (err) {
      return res.status(400).json({ code: 'HASH_COMPUTE_FAILED', error: '파일 해시 계산 실패' })
    }

    const category = FILE_TYPE_TO_CATEGORY[fileType] || 'documents'
    const folderPath = generateFolderPath(domain, category)
    const filename = generateTimestampFilename(extension)
    const filePath = `${folderPath}${filename}`

    let insertId = null
    const connection = await pool.getConnection()
    try {
      const [existing] = await connection.execute(
        'SELECT id, file_path FROM files WHERE content_hash = ?',
        [contentHash],
      )

      if (existing.length > 0) {
        const existingFile = existing[0]
        await connection.execute(
          'INSERT IGNORE INTO file_references (file_id, domain) VALUES (?, ?)',
          [existingFile.id, domain],
        )
        const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
        const url = `${baseUrl}/uploads/${existingFile.file_path.replace(/^uploads\//, '')}`.replace(
          /\/+/g,
          '/',
        )
        return res.status(201).json({
          id: existingFile.id,
          file_path: existingFile.file_path,
          original_name: originalName,
          url,
          content_hash: contentHash,
          duplicate: true,
        })
      }

      await ensureFolderExists(folderPath)
      const absolutePath = resolveUploadAbsolutePath(filePath)
      await saveFile(fileBuffer, absolutePath)

      const mimeType = getFileMimeType(extension)
      const [insertResult] = await connection.execute(
        `INSERT INTO files (file_path, original_name, file_type, mime_type, file_size, category, content_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [filePath, originalName, fileType, mimeType, fileBuffer.length, category, contentHash],
      )
      insertId = insertResult.insertId
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const [rows] = await pool.execute('SELECT id, file_path FROM files WHERE content_hash = ?', [
          contentHash,
        ])
        if (rows.length > 0) {
          try {
            await deleteFile(filePath)
          } catch {
            /* ignore */
          }
          await pool.execute('INSERT IGNORE INTO file_references (file_id, domain) VALUES (?, ?)', [
            rows[0].id,
            domain,
          ])
          const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
          const url = `${baseUrl}/uploads/${rows[0].file_path.replace(/^uploads\//, '')}`.replace(
            /\/+/g,
            '/',
          )
          return res.status(201).json({
            id: rows[0].id,
            file_path: rows[0].file_path,
            original_name: originalName,
            url,
            content_hash: contentHash,
            duplicate: true,
          })
        }
      }
      throw err
    } finally {
      connection.release()
    }

    const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
    const url = `${baseUrl}/uploads/${filePath.replace(/^uploads\//, '')}`.replace(/\/+/g, '/')

    await pool.execute('INSERT INTO file_references (file_id, domain) VALUES (?, ?)', [
      insertId,
      domain,
    ])

    res.status(201).json({
      id: insertId,
      file_path: filePath,
      original_name: originalName,
      url,
      content_hash: contentHash,
    })
  } catch (error) {
    console.error('[files/upload]', error)
    res.status(500).json({ code: 'UPLOAD_FAILED', error: error.message })
  }
})

/** GET /api/files/list */
router.get('/files/list', async (req, res) => {
  try {
    const domain = req.query.domain
    if (!domain) {
      return res.status(400).json({ code: 'MISSING_DOMAIN', error: 'domain 파라미터가 필요합니다.' })
    }

    const category = req.query.category
    const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`

    let query = `
      SELECT f.id, f.file_path, f.original_name, f.file_type, f.category, f.file_size
      FROM files f
      INNER JOIN file_references fr ON f.id = fr.file_id
      WHERE fr.domain = ?
    `
    const params = [domain]

    if (category) {
      query += ' AND f.category = ?'
      params.push(category)
    }

    query += ' ORDER BY f.created_at DESC'

    const [rows] = await pool.execute(query, params)

    const items = rows.map((r) => ({
      id: r.id,
      file_path: r.file_path,
      original_name: r.original_name,
      file_type: r.file_type,
      category: r.category,
      file_size: r.file_size,
      url: `${baseUrl}/uploads/${r.file_path.replace(/^uploads\//, '')}`.replace(/\/+/g, '/'),
    }))

    res.json({ items })
  } catch (error) {
    console.error('[files/list]', error)
    res.status(500).json({ error: error.message })
  }
})

/** DELETE /api/files/:id/reference - 도메인에서 파일 참조 제거 */
router.delete('/files/:id/reference', async (req, res) => {
  try {
    const fileId = parseInt(req.params.id, 10)
    const domain = req.query.domain || req.body?.domain
    if (!domain || isNaN(fileId)) {
      return res.status(400).json({ code: 'INVALID_PARAMS', error: 'file id와 domain이 필요합니다.' })
    }
    const [result] = await pool.execute('DELETE FROM file_references WHERE file_id = ? AND domain = ?', [fileId, domain])
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 'NOT_FOUND', error: '참조를 찾을 수 없습니다.' })
    }
    res.json({ ok: true })
  } catch (error) {
    console.error('[files/delete-reference]', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

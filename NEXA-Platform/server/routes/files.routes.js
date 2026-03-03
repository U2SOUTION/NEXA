/**
 * 전역 files API
 * 도메인 파라미터로 ai, archive, parts 등 지원
 * @see docs/AI_드롭존_첨부_기능_플랜.md
 */

import path from 'path'
import fs from 'fs'
import express from 'express'
import multer from 'multer'
import { randomUUID } from 'crypto'
import { pool } from '../config/dbConfig.js'
import { resolveUploadAbsolutePath, UPLOAD_BASE_DIR } from '../config/upload.js'
import { MULTER_MAX_FILE_SIZE } from '../config/fileTypes.js'
import {
  extractExtension,
  getFileType,
  getFileMimeType,
  getFileMaxSize,
  generateFolderPath,
  generateTimestampFilename,
  computeContentHashFromFile,
  ensureFolderExists,
  deleteFile,
  moveTempFileToFolder,
} from '../utils/fileUpload.js'

const router = express.Router()

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dest = path.join(UPLOAD_BASE_DIR, '_temp')
    fs.mkdirSync(dest, { recursive: true })
    cb(null, dest)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin'
    cb(null, `${randomUUID()}${ext}`)
  },
})

const upload = multer({
  storage: diskStorage,
  limits: { fileSize: MULTER_MAX_FILE_SIZE },
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

    const tempAbsolutePath = req.file.path
    const fileSize = req.file.size
    const tempRelativePath = `uploads/_temp/${path.basename(tempAbsolutePath)}`
    const originalName = fixFilenameEncoding(req.file.originalname || 'unknown')

    const extension = extractExtension(originalName)
    const fileType = getFileType(extension)
    const maxSize = getFileMaxSize(fileType)

    if (fileSize > maxSize) {
      await deleteFile(tempRelativePath)
      return res.status(400).json({
        code: 'FILE_TOO_LARGE',
        error: `파일 크기가 너무 큽니다. (최대: ${(maxSize / 1024 / 1024).toFixed(1)}MB)`,
      })
    }

    let contentHash
    try {
      contentHash = await computeContentHashFromFile(tempAbsolutePath)
    } catch {
      await deleteFile(tempRelativePath)
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
        await deleteFile(tempRelativePath)
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
      await moveTempFileToFolder(tempRelativePath, folderPath, filename)

      const mimeType = getFileMimeType(extension)
      const [insertResult] = await connection.execute(
        `INSERT INTO files (file_path, original_name, file_type, mime_type, file_size, category, content_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [filePath, originalName, fileType, mimeType, fileSize, category, contentHash],
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

/**
 * GET /api/files/explorer
 * 전역 탐색기용: 전 도메인(또는 지정 도메인) + 엣지 파일 목록, 페이지네이션 지원.
 * @query domain - 선택. 비우면 모든 도메인
 * @query category - 선택 (images, documents, audio, video 등)
 * @query source - 선택. files.source 필터
 * @query edge_sid - 선택. files.edge_sid 필터
 * @query q - 선택. original_name 검색 (LIKE)
 * @query limit - 선택. 기본 50
 * @query offset - 선택. 기본 0
 * @returns { items: Array, total: number }
 */
router.get('/files/explorer/debug', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Not found' })
  try {
    const [filesCount] = await pool.execute('SELECT COUNT(*) AS c FROM files')
    const [refsCount] = await pool.execute('SELECT COUNT(*) AS c FROM file_references')
    const [joinedCount] = await pool.execute(
      'SELECT COUNT(*) AS c FROM files f INNER JOIN file_references fr ON f.id = fr.file_id WHERE fr.domain = ?',
      ['ai'],
    )
    const [sample] = await pool.execute(
      'SELECT f.id, f.file_path, fr.domain FROM files f INNER JOIN file_references fr ON f.id = fr.file_id WHERE fr.domain = ? LIMIT 3',
      ['ai'],
    )
    // 고아 파일: files에 있으나 file_references에 없는 레코드 (탐색기에 안 보이는 원인)
    const [orphanedCount] = await pool.execute(
      'SELECT COUNT(*) AS c FROM files f WHERE NOT EXISTS (SELECT 1 FROM file_references fr WHERE fr.file_id = f.id)',
    )
    const [orphanedSample] = await pool.execute(
      'SELECT f.id, f.file_path, f.original_name, f.created_at FROM files f WHERE NOT EXISTS (SELECT 1 FROM file_references fr WHERE fr.file_id = f.id) ORDER BY f.created_at DESC LIMIT 10',
    )
    res.json({
      files_total: filesCount[0]?.c ?? 0,
      file_references_total: refsCount[0]?.c ?? 0,
      joined_ai_count: joinedCount[0]?.c ?? 0,
      sample_rows: sample,
      orphaned_files_count: orphanedCount[0]?.c ?? 0,
      orphaned_sample: orphanedSample,
    })
  } catch (err) {
    console.error('[files/explorer/debug]', err)
    res.status(500).json({ error: err.message })
  }
})

/** POST /api/files/explorer/backfill-references - 고아 파일에 file_references 추가 (dev만) */
router.post('/files/explorer/backfill-references', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Not found' })
  try {
    const [orphaned] = await pool.execute(
      `SELECT f.id, f.file_path FROM files f
       WHERE NOT EXISTS (SELECT 1 FROM file_references fr WHERE fr.file_id = f.id)
       AND f.file_path REGEXP '^uploads/[a-zA-Z0-9_-]+/'`,
    )
    let inserted = 0
    for (const row of orphaned) {
      const match = (row.file_path || '').match(/^uploads\/([a-zA-Z0-9_-]+)\//)
      const domain = match ? match[1] : null
      if (!domain) continue
      const [insResult] = await pool.execute(
        'INSERT IGNORE INTO file_references (file_id, domain) VALUES (?, ?)',
        [row.id, domain],
      )
      if (insResult?.affectedRows > 0) inserted++
    }
    res.json({ orphaned_found: orphaned.length, inserted })
  } catch (err) {
    console.error('[files/explorer/backfill-references]', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/files/explorer', async (req, res) => {
  try {
    const domain = req.query.domain ? String(req.query.domain).trim() : null
    const pathPrefix = req.query.path != null ? String(req.query.path).trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '') : null
    const category = req.query.category ? String(req.query.category).trim() : null
    const source = req.query.source ? String(req.query.source).trim() : null
    const edgeSid = req.query.edge_sid != null ? parseInt(req.query.edge_sid, 10) : null
    const q = req.query.q ? String(req.query.q).trim() : null
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 500)
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0)
    const limitInt = Number(limit) || 50
    const offsetInt = Number(offset) || 0

    const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`

    const conditions = ['(f.deleted_at IS NULL)']
    const params = []

    if (domain) {
      conditions.push('f.file_path LIKE ?')
      params.push(`uploads/${domain}/%`)
    }
    if (domain && pathPrefix && String(pathPrefix).trim()) {
      const folderPrefix = `uploads/${domain}/${pathPrefix}/`
      conditions.push('(f.file_path = ? OR f.file_path LIKE ?)')
      params.push(folderPrefix.slice(0, -1), `${folderPrefix}%`)
    }
    if (category && String(category).trim()) {
      conditions.push('f.category = ?')
      params.push(category.trim())
    }
    if (source && String(source).trim()) {
      conditions.push('f.source = ?')
      params.push(source)
    }
    if (!Number.isNaN(edgeSid) && edgeSid != null) {
      conditions.push('f.edge_sid = ?')
      params.push(edgeSid)
    }
    if (q && String(q).trim()) {
      conditions.push('(f.original_name LIKE ? OR f.file_path LIKE ?)')
      const escaped = q.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
      const likeVal = `%${escaped}%`
      params.push(likeVal, likeVal)
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM files f
      ${whereClause}
    `
    const [countRows] = await pool.execute(countQuery, params)
    const total = countRows[0]?.total ?? 0

    if (process.env.NODE_ENV !== 'production') {
      console.log('[files/explorer]', { domain, pathPrefix, conditions: conditions.length, paramsCount: params.length, total })
    }

    const listQuery = `
      SELECT f.id, f.file_path, f.original_name, f.file_type, f.category, f.file_size, f.source, f.edge_sid, f.created_at
      FROM files f
      ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `
    const [rows] = await pool.execute(listQuery, params)

    const items = rows.map((r) => {
      const fp = r.file_path || ''
      const domainFromPath = fp.startsWith('uploads/') ? fp.split('/')[1] || null : null
      return {
        id: r.id,
        file_path: fp,
        original_name: r.original_name,
        file_type: r.file_type,
        category: r.category,
        file_size: r.file_size,
        domain: domainFromPath,
        source: r.source ?? null,
        edge_sid: r.edge_sid ?? null,
        created_at: r.created_at,
        url: `${baseUrl}/uploads/${fp.replace(/^uploads\//, '')}`.replace(/\/+/g, '/'),
      }
    })

    res.json({ items, total })
  } catch (error) {
    console.error('[files/explorer]', error)
    res.status(500).json({ code: 'EXPLORER_FAILED', error: error.message })
  }
})

/**
 * GET /api/files/explorer/tree
 * 탐색기 좌측 트리용: 도메인별 실제 디렉터리 경로 (file_path 기준)
 * files 테이블 기준 — 사용처(file_references) 없어도 표시
 */
router.get('/files/explorer/tree', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT f.file_path
       FROM files f
       WHERE f.deleted_at IS NULL AND f.file_path LIKE 'uploads/%'`,
    )
    const byDomain = new Map()
    for (const r of rows) {
      const fullPath = (r.file_path || '').replace(/\\/g, '/').trim()
      const uploadsPrefix = 'uploads/'
      if (!fullPath.startsWith(uploadsPrefix)) continue
      const afterUploads = fullPath.slice(uploadsPrefix.length)
      const pathParts = afterUploads.split('/').filter(Boolean)
      const d = pathParts[0] || 'unknown'
      const relativeParts = pathParts.slice(1)
      if (!byDomain.has(d)) byDomain.set(d, new Set())
      byDomain.get(d).add('')
      for (let i = 1; i < relativeParts.length; i++) {
        byDomain.get(d).add(relativeParts.slice(0, i).join('/'))
      }
    }
    const domains = Array.from(byDomain.entries()).map(([domain, pathSet]) => ({
      domain,
      paths: Array.from(pathSet).sort((a, b) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b))),
    }))
    res.json({ domains })
  } catch (error) {
    console.error('[files/explorer/tree]', error)
    res.status(500).json({ code: 'EXPLORER_TREE_FAILED', error: error.message })
  }
})

/** POST /api/files/:id/reference - 도메인에 파일 참조 추가 (탐색기 → 미디어 리스트 등) */
router.post('/files/:id/reference', async (req, res) => {
  try {
    const fileId = parseInt(req.params.id, 10)
    const domain = req.body?.domain || req.query.domain
    if (!domain || isNaN(fileId)) {
      return res.status(400).json({ code: 'INVALID_PARAMS', error: 'file id와 domain이 필요합니다.' })
    }
    const [existing] = await pool.execute('SELECT 1 FROM files WHERE id = ?', [fileId])
    if (existing.length === 0) {
      return res.status(404).json({ code: 'NOT_FOUND', error: '파일을 찾을 수 없습니다.' })
    }
    await pool.execute(
      'INSERT IGNORE INTO file_references (file_id, domain) VALUES (?, ?)',
      [fileId, domain],
    )
    res.status(201).json({ ok: true })
  } catch (error) {
    console.error('[files/post-reference]', error)
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

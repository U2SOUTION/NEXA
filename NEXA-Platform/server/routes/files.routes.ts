/**
 * 전역 files API
 * 도메인 파라미터로 ai, archive, parts 등 지원
 * @see docs/AI_드롭존_첨부_기능_플랜.md
 */

import path from 'path'
import { errMessage } from '@/utils/errUtils.js'
import fs from 'fs'
import { Router } from 'express'
import multer from 'multer'
import { randomUUID } from 'crypto'
import { pool } from '@/config/dbConfig.js'
import { resolveUploadAbsolutePath, UPLOAD_BASE_DIR } from '@/config/upload.js'
import { MULTER_MAX_FILE_SIZE } from '@/config/fileTypes.js'
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
} from '@/utils/fileUpload.js'

const router = Router()

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
function fixFilenameEncoding(name: string | undefined): string | undefined {
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
    const domain = String(req.body?.domain || req.query?.domain || '')
    if (!domain) {
      return res.status(400).json({ code: 'MISSING_DOMAIN', error: 'domain 파라미터가 필요합니다.' })
    }
    const file = (req as { file?: { path?: string; size?: number; originalname?: string } }).file
    if (!file) {
      return res.status(400).json({ code: 'INVALID_FILE_TYPE', error: '파일이 필요합니다.' })
    }

    const tempAbsolutePath = file.path
    if (!tempAbsolutePath) {
      return res.status(400).json({ code: 'INVALID_FILE', error: '파일 경로가 없습니다.' })
    }
    const fileSize = file.size ?? 0
    const tempRelativePath = `uploads/_temp/${path.basename(tempAbsolutePath)}`
    const originalName = fixFilenameEncoding(file.originalname) ?? file.originalname ?? 'unknown'

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

    const category = (FILE_TYPE_TO_CATEGORY as Record<string, string>)[fileType] ?? 'documents'
    const folderPath = generateFolderPath(domain, category)
    const filename = generateTimestampFilename(extension)
    const filePath = `${folderPath}${filename}`

    let insertId = null
    const client = await pool.connect()
    try {
      const { rows: existing } = await client.query(
        'SELECT id, file_path FROM files WHERE content_hash = $1',
        [contentHash],
      )

      if (existing.length > 0) {
        const existingFile = existing[0] as { id: string; file_path: string }
        await deleteFile(tempRelativePath)
        await client.query(
          'INSERT INTO file_references (file_id, domain) VALUES ($1, $2) ON CONFLICT (file_id, domain) DO NOTHING',
          [existingFile.id, domain],
        )
        const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
        const fp = String(existingFile.file_path ?? '')
        const url = `${baseUrl}/uploads/${fp.replace(/^uploads\//, '')}`.replace(
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
      const { rows: insertRows } = await client.query(
        `INSERT INTO files (file_path, original_name, file_type, mime_type, file_size, category, content_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [filePath, originalName, fileType, mimeType, fileSize, category, contentHash],
      )
      insertId = insertRows[0].id
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException & { code?: string }
      if (e?.code === '23505') {
        const { rows } = await pool.query('SELECT id, file_path FROM files WHERE content_hash = $1', [
          contentHash,
        ])
        const fileRows = rows as { id: string; file_path: string }[]
        if (fileRows.length > 0) {
          try {
            await deleteFile(filePath)
          } catch {
            /* ignore */
          }
          await pool.query('INSERT INTO file_references (file_id, domain) VALUES ($1, $2) ON CONFLICT (file_id, domain) DO NOTHING', [
            fileRows[0].id,
            domain,
          ])
          const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
          const r0path = String(fileRows[0].file_path ?? '')
          const url = `${baseUrl}/uploads/${r0path.replace(/^uploads\//, '')}`.replace(
            /\/+/g,
            '/',
          )
          return res.status(201).json({
            id: fileRows[0].id,
            file_path: fileRows[0].file_path,
            original_name: originalName,
            url,
            content_hash: contentHash,
            duplicate: true,
          })
        }
      }
      throw err
    } finally {
      client.release()
    }

    const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
    const url = `${baseUrl}/uploads/${filePath.replace(/^uploads\//, '')}`.replace(/\/+/g, '/')

    await pool.query('INSERT INTO file_references (file_id, domain) VALUES ($1, $2)', [
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
  } catch (error: unknown) {
    console.error('[files/upload]', error)
    res.status(500).json({ code: 'UPLOAD_FAILED', error: errMessage(error) })
  }
})

/** GET /api/files/list */
router.get('/files/list', async (req, res) => {
  try {
    const domainRaw = req.query.domain
    const domain = Array.isArray(domainRaw) ? domainRaw[0] : (typeof domainRaw === 'string' ? domainRaw : '')
    if (!domain) {
      return res.status(400).json({ code: 'MISSING_DOMAIN', error: 'domain 파라미터가 필요합니다.' })
    }

    const category = req.query.category
    const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`

    let paramIdx = 1
    let query = `
      SELECT f.id, f.file_path, f.original_name, f.file_type, f.category, f.file_size
      FROM files f
      INNER JOIN file_references fr ON f.id = fr.file_id
      WHERE fr.domain = $1
    `
    const params = [domain]
    paramIdx++

    const categoryRaw = req.query.category
    const categoryParam = Array.isArray(categoryRaw) ? categoryRaw[0] : (typeof categoryRaw === 'string' ? categoryRaw : '')
    if (categoryParam) {
      query += ` AND f.category = $${paramIdx++}`
      params.push(categoryParam)
    }

    query += ' ORDER BY f.created_at DESC'

    const { rows } = await pool.query(query, params)

    const items = (rows as { id: string; file_path: string; original_name: string; file_type: string; category: string; file_size: number }[]).map((r) => ({
      id: r.id,
      file_path: r.file_path,
      original_name: r.original_name,
      file_type: r.file_type,
      category: r.category,
      file_size: r.file_size,
      url: `${baseUrl}/uploads/${r.file_path.replace(/^uploads\//, '')}`.replace(/\/+/g, '/'),
    }))

    res.json({ items })
  } catch (error: unknown) {
    console.error('[files/list]', error)
    res.status(500).json({ error: errMessage(error) })
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
    const { rows: filesCount } = await pool.query('SELECT COUNT(*) AS c FROM files')
    const { rows: refsCount } = await pool.query('SELECT COUNT(*) AS c FROM file_references')
    const { rows: joinedCount } = await pool.query(
      'SELECT COUNT(*) AS c FROM files f INNER JOIN file_references fr ON f.id = fr.file_id WHERE fr.domain = $1',
      ['ai'],
    )
    const { rows: sample } = await pool.query(
      'SELECT f.id, f.file_path, fr.domain FROM files f INNER JOIN file_references fr ON f.id = fr.file_id WHERE fr.domain = $1 LIMIT 3',
      ['ai'],
    )
    const { rows: orphanedCount } = await pool.query(
      'SELECT COUNT(*) AS c FROM files f WHERE NOT EXISTS (SELECT 1 FROM file_references fr WHERE fr.file_id = f.id)',
    )
    const { rows: orphanedSample } = await pool.query(
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
  } catch (err: unknown) {
    console.error('[files/explorer/debug]', err)
    res.status(500).json({ error: errMessage(err) })
  }
})

/** POST /api/files/explorer/backfill-references - 고아 파일에 file_references 추가 (dev만) */
router.post('/files/explorer/backfill-references', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Not found' })
  try {
    const { rows: orphaned } = await pool.query(
      `SELECT f.id, f.file_path FROM files f
       WHERE NOT EXISTS (SELECT 1 FROM file_references fr WHERE fr.file_id = f.id)
       AND f.file_path ~ '^uploads/[a-zA-Z0-9_-]+/'`,
    )
    let inserted = 0
    const orphanedTyped = orphaned as { id: string; file_path: string }[]
    for (const row of orphanedTyped) {
      const fp = String(row.file_path ?? '')
      const match = fp.match(/^uploads\/([a-zA-Z0-9_-]+)\//)
      const domain = match ? match[1] : null
      if (!domain) continue
      const insResult = await pool.query(
        'INSERT INTO file_references (file_id, domain) VALUES ($1, $2) ON CONFLICT (file_id, domain) DO NOTHING',
        [row.id, domain],
      )
      if ((insResult?.rowCount ?? 0) > 0) inserted++
    }
    res.json({ orphaned_found: orphaned.length, inserted })
    } catch (err: unknown) {
    console.error('[files/explorer/backfill-references]', err)
    res.status(500).json({ error: errMessage(err) })
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
    let paramIdx = 1
    if (domain) {
      conditions.push(`f.file_path LIKE $${paramIdx++}`)
      params.push(`uploads/${domain}/%`)
    }
    if (domain && pathPrefix && String(pathPrefix).trim()) {
      const folderPrefix = `uploads/${domain}/${pathPrefix}/`
      conditions.push(`(f.file_path = $${paramIdx++} OR f.file_path LIKE $${paramIdx++})`)
      params.push(folderPrefix.slice(0, -1), `${folderPrefix}%`)
    }
    if (category && String(category).trim()) {
      conditions.push(`f.category = $${paramIdx++}`)
      params.push(category.trim())
    }
    if (source && String(source).trim()) {
      conditions.push(`f.source = $${paramIdx++}`)
      params.push(source)
    }
    if (!Number.isNaN(edgeSid) && edgeSid != null) {
      conditions.push(`f.edge_sid = $${paramIdx++}`)
      params.push(edgeSid)
    }
    if (q && String(q).trim()) {
      conditions.push(`(f.original_name LIKE $${paramIdx++} OR f.file_path LIKE $${paramIdx++})`)
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
    const { rows: countRows } = await pool.query(countQuery, params)
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
    const { rows } = await pool.query(listQuery, params)

    type FileRow = { id: string; file_path: string; original_name: string; file_type: string; category: string; file_size: number; source?: string; edge_sid?: string; created_at?: unknown }
    const items = (rows as FileRow[]).map((r) => {
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
  } catch (error: unknown) {
    console.error('[files/explorer]', error)
    res.status(500).json({ code: 'EXPLORER_FAILED', error: errMessage(error) })
  }
})

/**
 * GET /api/files/explorer/tree
 * 탐색기 좌측 트리용: 도메인별 실제 디렉터리 경로 (file_path 기준)
 * files 테이블 기준 — 사용처(file_references) 없어도 표시
 */
router.get('/files/explorer/tree', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT f.file_path
       FROM files f
       WHERE f.deleted_at IS NULL AND f.file_path LIKE 'uploads/%'`,
    )
    const byDomain = new Map<string, Set<string>>()
    const rowsTyped = rows as { file_path?: string }[]
    for (const r of rowsTyped) {
      const fullPath = (r.file_path || '').replace(/\\/g, '/').trim()
      const uploadsPrefix = 'uploads/'
      if (!fullPath.startsWith(uploadsPrefix)) continue
      const afterUploads = fullPath.slice(uploadsPrefix.length)
      const pathParts = afterUploads.split('/').filter(Boolean)
      const d = pathParts[0] || 'unknown'
      const relativeParts = pathParts.slice(1)
      if (!byDomain.has(d)) byDomain.set(d, new Set())
      byDomain.get(d)?.add('')
      for (let i = 1; i < relativeParts.length; i++) {
        byDomain.get(d)?.add(relativeParts.slice(0, i).join('/'))
      }
    }
    const domains = Array.from(byDomain.entries()).map(([domain, pathSet]) => ({
      domain,
      paths: Array.from(pathSet).sort((a, b) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b))),
    }))
    res.json({ domains })
  } catch (error: unknown) {
    console.error('[files/explorer/tree]', error)
    res.status(500).json({ code: 'EXPLORER_TREE_FAILED', error: errMessage(error) })
  }
})

/** POST /api/files/:id/reference - 도메인에 파일 참조 추가 (탐색기 → 미디어 리스트 등) */
router.post('/files/:id/reference', async (req, res) => {
  try {
    const fileId = parseInt(req.params?.id ?? '', 10)
    const domainVal = req.body?.domain ?? req.query?.domain
    const domain = Array.isArray(domainVal) ? domainVal[0] : (typeof domainVal === 'string' ? domainVal : '')
    if (!domain || isNaN(fileId)) {
      return res.status(400).json({ code: 'INVALID_PARAMS', error: 'file id와 domain이 필요합니다.' })
    }
    const { rows: existing } = await pool.query('SELECT 1 FROM files WHERE id = $1', [fileId])
    if (existing.length === 0) {
      return res.status(404).json({ code: 'NOT_FOUND', error: '파일을 찾을 수 없습니다.' })
    }
    await pool.query(
      'INSERT INTO file_references (file_id, domain) VALUES ($1, $2) ON CONFLICT (file_id, domain) DO NOTHING',
      [fileId, domain],
    )
    res.status(201).json({ ok: true })
  } catch (error: unknown) {
    console.error('[files/post-reference]', error)
    res.status(500).json({ error: errMessage(error) })
  }
})

/** DELETE /api/files/:id/reference - 도메인에서 파일 참조 제거 */
router.delete('/files/:id/reference', async (req, res) => {
  try {
    const fileId = parseInt(req.params?.id ?? '', 10)
    const domainVal = req.query?.domain ?? req.body?.domain
    const domain = Array.isArray(domainVal) ? domainVal[0] : (typeof domainVal === 'string' ? domainVal : '')
    if (!domain || isNaN(fileId)) {
      return res.status(400).json({ code: 'INVALID_PARAMS', error: 'file id와 domain이 필요합니다.' })
    }
    const result = await pool.query('DELETE FROM file_references WHERE file_id = $1 AND domain = $2', [fileId, domain])
    if ((result.rowCount ?? 0) === 0) {
      return res.status(404).json({ code: 'NOT_FOUND', error: '참조를 찾을 수 없습니다.' })
    }
    res.json({ ok: true })
  } catch (error: unknown) {
    console.error('[files/delete-reference]', error)
    res.status(500).json({ error: errMessage(error) })
  }
})

export default router

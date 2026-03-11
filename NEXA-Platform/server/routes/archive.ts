import { Router } from 'express'
import { pool } from '@/config/dbConfig.js'
import { errMessage } from '@/utils/errUtils.js'

const router = Router()

// 레이아웃 템플릿 목록 (category=LAYOUT)
router.get('/system-templates', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, tpl_name, category, created_at FROM system_templates WHERE category = 'LAYOUT' ORDER BY created_at DESC")
    res.json(rows)
  } catch (err: unknown) {
    console.error('[archive] GET /system-templates', err)
    res.status(500).json({ error: errMessage(err) })
  }
})

// 아카이브 메타 생성
router.post('/archives', async (req, res) => {
  const body = (req.body || {}) as Record<string, unknown>
  const { title, doc_type, status, layout_id } = body
  if (!title) {
    return res.status(400).json({ error: 'title is required' })
  }
  try {
    const { rows: insertRows } = await pool.query(
      'INSERT INTO archives (title, doc_type, status, layout_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, doc_type || 'NOTE', status || 'ACTIVE', layout_id || null]
    )
    const newId = (insertRows[0] as Record<string, unknown>)?.id
    const { rows } = await pool.query('SELECT * FROM archives WHERE id = $1', [newId])
    res.json(rows[0])
  } catch (err: unknown) {
    console.error('[archive] POST /archives', err)
    res.status(500).json({ error: errMessage(err) })
  }
})

// 아카이브 메타 수정
router.put('/archives/:id', async (req, res) => {
  const id = Number(req.params?.id)
  const body = (req.body || {}) as Record<string, unknown>
  const { title, doc_type, status, layout_id } = body
  if (!id || !title) {
    return res.status(400).json({ error: 'invalid payload' })
  }
  try {
    await pool.query(
      'UPDATE archives SET title = $1, doc_type = $2, status = $3, layout_id = $4, updated_at = NOW() WHERE id = $5',
      [title, doc_type || 'NOTE', status || 'ACTIVE', layout_id || null, id]
    )
    const { rows } = await pool.query('SELECT id, title, doc_type, status, layout_id, created_at, updated_at FROM archives WHERE id = $1', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'not found' })
    res.json(rows[0])
  } catch (err: unknown) {
    console.error('[archive] PUT /archives/:id', err)
    res.status(500).json({ error: errMessage(err) })
  }
})

// 아카이브 목록 조회
router.get('/archives', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, doc_type, status, layout_id, created_at, updated_at
       FROM archives
       ORDER BY updated_at DESC, created_at DESC`,
    )
    res.json(rows)
  } catch (err: unknown) {
    console.error('[archive] GET /archives', err)
    res.status(500).json({ error: errMessage(err) })
  }
})

// 아카이브 단건 조회 + 본문 1건(최신 order_idx 기준)
router.get('/archives/:id', async (req, res) => {
  const id = Number(req.params?.id)
  if (!id) {
    return res.status(400).json({ error: 'invalid id' })
  }
  try {
    const { rows: metaRows } = await pool.query(
      `SELECT id, title, doc_type, status, layout_id, created_at, updated_at
       FROM archives
       WHERE id = $1`,
      [id],
    )
    if (metaRows.length === 0) {
      return res.status(404).json({ error: 'not found' })
    }

    const { rows: docRows } = await pool.query(
      `SELECT id, archive_id, content_json, order_idx, created_at, updated_at
       FROM archive_doc
       WHERE archive_id = $1
       ORDER BY order_idx ASC, id ASC
       LIMIT 1`,
      [id],
    )

    res.json({
      archive: metaRows[0],
      doc: docRows[0] || null,
    })
  } catch (err: unknown) {
    console.error('[archive] GET /archives/:id', err)
    res.status(500).json({ error: errMessage(err) })
  }
})

// 아카이브 본문 수정
router.put('/archive-doc/:id', async (req, res) => {
  const id = Number(req.params?.id)
  const body = (req.body || {}) as Record<string, unknown>
  const { content_json, order_idx } = body
  if (!id) {
    return res.status(400).json({ error: 'invalid id' })
  }
  try {
    await pool.query(
      'UPDATE archive_doc SET content_json = $1::jsonb, order_idx = $2, updated_at = NOW() WHERE id = $3',
      [JSON.stringify(content_json || {}), order_idx ?? 0, id]
    )
    const { rows } = await pool.query('SELECT * FROM archive_doc WHERE id = $1', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'not found' })
    res.json(rows[0])
  } catch (err: unknown) {
    console.error('[archive] PUT /archive-doc/:id', err)
    res.status(500).json({ error: errMessage(err) })
  }
})

// 아카이브 본문 생성
router.post('/archive-doc', async (req, res) => {
  const body = (req.body || {}) as Record<string, unknown>
  const { archive_id, content_json, order_idx } = body
  if (!archive_id) {
    return res.status(400).json({ error: 'archive_id is required' })
  }
  try {
    const { rows: insertRows } = await pool.query(
      'INSERT INTO archive_doc (archive_id, content_json, order_idx) VALUES ($1, $2::jsonb, $3) RETURNING id',
      [archive_id, JSON.stringify(content_json || {}), order_idx ?? 0]
    )
    const newId = (insertRows[0] as Record<string, unknown>)?.id
    const { rows } = await pool.query('SELECT * FROM archive_doc WHERE id = $1', [newId])
    res.json(rows[0])
  } catch (err: unknown) {
    console.error('[archive] POST /archive-doc', err)
    res.status(500).json({ error: errMessage(err) })
  }
})

export default router

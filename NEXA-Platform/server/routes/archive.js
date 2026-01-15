import express from 'express'
import mysql from 'mysql2/promise'

const router = express.Router()

// DB 커넥션 설정 (api.js와 동일한 고정값 사용)
// 다른 환경변수 값으로 다른 DB에 붙지 않도록 동일하게 고정
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123412341234',
  database: 'nexa_db',
  port: 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// 커넥션 풀
const pool = mysql.createPool(dbConfig)

// 레이아웃 템플릿 목록 (category=LAYOUT)
router.get('/system-templates', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, tpl_name, category, created_at FROM system_templates WHERE category = 'LAYOUT' ORDER BY created_at DESC")
    res.json(rows)
  } catch (err) {
    console.error('[archive] GET /system-templates', err)
    res.status(500).json({ error: 'failed to fetch templates' })
  }
})

// 아카이브 메타 생성
router.post('/archives', async (req, res) => {
  const { title, doc_type, status, layout_id } = req.body || {}
  if (!title) {
    return res.status(400).json({ error: 'title is required' })
  }
  try {
    const [result] = await pool.query('INSERT INTO archives (title, doc_type, status, layout_id) VALUES (?, ?, ?, ?)', [title, doc_type || 'NOTE', status || 'ACTIVE', layout_id || null])
    const [rows] = await pool.query('SELECT * FROM archives WHERE id = ?', [result.insertId])
    res.json(rows[0])
  } catch (err) {
    console.error('[archive] POST /archives', err)
    res.status(500).json({ error: 'failed to create archive' })
  }
})

// 아카이브 메타 수정
router.put('/archives/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { title, doc_type, status, layout_id } = req.body || {}
  if (!id || !title) {
    return res.status(400).json({ error: 'invalid payload' })
  }
  try {
    await pool.query('UPDATE archives SET title = ?, doc_type = ?, status = ?, layout_id = ?, updated_at = NOW() WHERE id = ?', [title, doc_type || 'NOTE', status || 'ACTIVE', layout_id || null, id])
    const [rows] = await pool.query('SELECT id, title, doc_type, status, layout_id, created_at, updated_at FROM archives WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('[archive] PUT /archives/:id', err)
    res.status(500).json({ error: 'failed to update archive' })
  }
})

// 아카이브 목록 조회
router.get('/archives', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, doc_type, status, layout_id, created_at, updated_at
       FROM archives
       ORDER BY updated_at DESC, created_at DESC`,
    )
    res.json(rows)
  } catch (err) {
    console.error('[archive] GET /archives', err)
    res.status(500).json({ error: 'failed to fetch archives' })
  }
})

// 아카이브 단건 조회 + 본문 1건(최신 order_idx 기준)
router.get('/archives/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!id) {
    return res.status(400).json({ error: 'invalid id' })
  }
  try {
    const [metaRows] = await pool.query(
      `SELECT id, title, doc_type, status, layout_id, created_at, updated_at
       FROM archives
       WHERE id = ?`,
      [id],
    )
    if (metaRows.length === 0) {
      return res.status(404).json({ error: 'not found' })
    }

    const [docRows] = await pool.query(
      `SELECT id, archive_id, content_json, order_idx, created_at, updated_at
       FROM archive_doc
       WHERE archive_id = ?
       ORDER BY order_idx ASC, id ASC
       LIMIT 1`,
      [id],
    )

    res.json({
      archive: metaRows[0],
      doc: docRows[0] || null,
    })
  } catch (err) {
    console.error('[archive] GET /archives/:id', err)
    res.status(500).json({ error: 'failed to fetch archive' })
  }
})

// 아카이브 본문 수정
router.put('/archive-doc/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { content_json, order_idx } = req.body || {}
  if (!id) {
    return res.status(400).json({ error: 'invalid id' })
  }
  try {
    await pool.query('UPDATE archive_doc SET content_json = ?, order_idx = ?, updated_at = NOW() WHERE id = ?', [JSON.stringify(content_json || {}), order_idx || 0, id])
    const [rows] = await pool.query('SELECT * FROM archive_doc WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('[archive] PUT /archive-doc/:id', err)
    res.status(500).json({ error: 'failed to update archive doc' })
  }
})

// 아카이브 본문 생성
router.post('/archive-doc', async (req, res) => {
  const { archive_id, content_json, order_idx } = req.body || {}
  if (!archive_id) {
    return res.status(400).json({ error: 'archive_id is required' })
  }
  try {
    const [result] = await pool.query('INSERT INTO archive_doc (archive_id, content_json, order_idx) VALUES (?, ?, ?)', [archive_id, JSON.stringify(content_json || {}), order_idx || 0])
    const [rows] = await pool.query('SELECT * FROM archive_doc WHERE id = ?', [result.insertId])
    res.json(rows[0])
  } catch (err) {
    console.error('[archive] POST /archive-doc', err)
    res.status(500).json({ error: 'failed to create archive doc' })
  }
})

export default router

import { pool } from '../../config/db.js'

export async function fetchLayouts() {
  const [rows] = await pool.query(
    "SELECT id, tpl_name, category, created_at FROM system_templates WHERE category = 'LAYOUT' ORDER BY created_at DESC",
  )
  return rows
}

export async function createArchiveMeta({ title, doc_type, status, layout_id }) {
  const [result] = await pool.query(
    'INSERT INTO archives (title, doc_type, status, layout_id) VALUES (?, ?, ?, ?)',
    [title, doc_type || 'NOTE', status || 'ACTIVE', layout_id || null],
  )
  const [rows] = await pool.query('SELECT * FROM archives WHERE id = ?', [result.insertId])
  return rows[0]
}

export async function createArchiveDoc({ archive_id, content_json, order_idx }) {
  const [result] = await pool.query(
    'INSERT INTO archive_doc (archive_id, content_json, order_idx) VALUES (?, ?, ?)',
    [archive_id, JSON.stringify(content_json || {}), order_idx || 0],
  )
  const [rows] = await pool.query('SELECT * FROM archive_doc WHERE id = ?', [result.insertId])
  return rows[0]
}

export async function listArchives() {
  const [rows] = await pool.query(
    `SELECT id, title, doc_type, status, layout_id, created_at, updated_at
     FROM archives
     ORDER BY updated_at DESC, created_at DESC`,
  )
  return rows
}

export async function getArchiveWithDoc(id) {
  const [metaRows] = await pool.query(
    `SELECT id, title, doc_type, status, layout_id, created_at, updated_at
     FROM archives
     WHERE id = ?`,
    [id],
  )
  if (metaRows.length === 0) return null

  const [docRows] = await pool.query(
    `SELECT id, archive_id, content_json, order_idx, created_at, updated_at
     FROM archive_doc
     WHERE archive_id = ?
     ORDER BY order_idx ASC, id ASC
     LIMIT 1`,
    [id],
  )

  return {
    archive: metaRows[0],
    doc: docRows[0] || null,
  }
}

export async function updateArchiveMeta(id, { title, doc_type, status, layout_id }) {
  await pool.query(
    'UPDATE archives SET title = ?, doc_type = ?, status = ?, layout_id = ?, updated_at = NOW() WHERE id = ?',
    [title, doc_type || 'NOTE', status || 'ACTIVE', layout_id || null, id],
  )
  const [rows] = await pool.query(
    'SELECT id, title, doc_type, status, layout_id, created_at, updated_at FROM archives WHERE id = ?',
    [id],
  )
  return rows[0] || null
}

export async function updateArchiveDoc(id, { content_json, order_idx }) {
  await pool.query(
    'UPDATE archive_doc SET content_json = ?, order_idx = ?, updated_at = NOW() WHERE id = ?',
    [JSON.stringify(content_json || {}), order_idx || 0, id],
  )
  const [rows] = await pool.query('SELECT * FROM archive_doc WHERE id = ?', [id])
  return rows[0] || null
}

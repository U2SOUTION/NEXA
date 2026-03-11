import { archiveContentJsonSchema } from '@system/schemas/jsonb.js'
import { pool } from '@/config/dbConfig.js'
import { parseJsonb } from '@/utils/parseJsonb.js'

export async function fetchLayouts() {
  const { rows } = await pool.query("SELECT id, tpl_name, category, created_at FROM system_templates WHERE category = 'LAYOUT' ORDER BY created_at DESC")
  return rows
}

export async function createArchiveMeta(payload: {
  title?: unknown
  doc_type?: unknown
  status?: unknown
  layout_id?: unknown
}) {
  const { title, doc_type, status, layout_id } = payload
  const { rows: insertRows } = await pool.query(
    'INSERT INTO archives (title, doc_type, status, layout_id) VALUES ($1, $2, $3, $4) RETURNING id',
    [title, doc_type || 'NOTE', status || 'ACTIVE', layout_id || null],
  )
  const newId = insertRows[0]?.id
  const { rows } = await pool.query('SELECT * FROM archives WHERE id = $1', [newId])
  return rows[0]
}

export async function createArchiveDoc(payload: { archive_id?: unknown; content_json?: unknown; order_idx?: unknown }) {
  const { archive_id, content_json, order_idx } = payload
  const content = typeof content_json === 'string' ? content_json : JSON.stringify(content_json || {})
  const { rows: insertRows } = await pool.query(
    'INSERT INTO archive_doc (archive_id, content_json, order_idx) VALUES ($1, $2::jsonb, $3) RETURNING id',
    [archive_id, content, order_idx ?? 0],
  )
  const newId = insertRows[0]?.id
  const { rows } = await pool.query('SELECT * FROM archive_doc WHERE id = $1', [newId])
  return mapArchiveDocRow(rows[0])
}

function mapArchiveDocRow(row: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!row) return undefined
  const content = parseJsonb(row.content_json, archiveContentJsonSchema)
  return { ...row, content_json: content ?? row.content_json ?? {} }
}

export async function listArchives() {
  const { rows } = await pool.query(
    `SELECT id, title, doc_type, status, layout_id, created_at, updated_at
     FROM archives
     ORDER BY updated_at DESC, created_at DESC`,
  )
  return rows
}

export async function getArchiveWithDoc(id: number | string) {
  const { rows: metaRows } = await pool.query(
    `SELECT id, title, doc_type, status, layout_id, created_at, updated_at
     FROM archives
     WHERE id = $1`,
    [id],
  )
  if (metaRows.length === 0) return null

  const { rows: docRows } = await pool.query(
    `SELECT id, archive_id, content_json, order_idx, created_at, updated_at
     FROM archive_doc
     WHERE archive_id = $1
     ORDER BY order_idx ASC, id ASC
     LIMIT 1`,
    [id],
  )

  return {
    archive: metaRows[0],
    doc: mapArchiveDocRow(docRows[0]) ?? null,
  }
}

export async function updateArchiveMeta(
  id: number | string,
  payload: { title?: unknown; doc_type?: unknown; status?: unknown; layout_id?: unknown },
) {
  const { title, doc_type, status, layout_id } = payload
  await pool.query(
    'UPDATE archives SET title = $1, doc_type = $2, status = $3, layout_id = $4, updated_at = NOW() WHERE id = $5',
    [title, doc_type || 'NOTE', status || 'ACTIVE', layout_id || null, id],
  )
  const { rows } = await pool.query('SELECT id, title, doc_type, status, layout_id, created_at, updated_at FROM archives WHERE id = $1', [id])
  return rows[0] || null
}

export async function updateArchiveDoc(
  id: number | string,
  payload: { content_json?: unknown; order_idx?: unknown },
) {
  const { content_json, order_idx } = payload
  const content = typeof content_json === 'string' ? content_json : JSON.stringify(content_json || {})
  await pool.query('UPDATE archive_doc SET content_json = $1::jsonb, order_idx = $2, updated_at = NOW() WHERE id = $3', [content, order_idx ?? 0, id])
  const { rows } = await pool.query('SELECT * FROM archive_doc WHERE id = $1', [id])
  return mapArchiveDocRow(rows[0]) ?? null
}

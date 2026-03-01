/**
 * ai_user_memos API
 * 사용자가 AI 채팅 응답에서 저장한 메모
 * @see docs/ai_user_memos-기획.md
 */

import express from 'express'
import { pool } from '../config/dbConfig.js'

const router = express.Router()

function toMemo(row) {
  return {
    id: row.id,
    content: row.content,
    source: row.source,
    channelId: row.channel_id,
    chatId: row.chat_id,
    sortOrder: row.sort_order,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : null,
  }
}

/** GET /api/ai-user-memos - 목록 조회 */
router.get('/ai-user-memos', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, content, source, channel_id, chat_id, sort_order, created_at, updated_at
       FROM ai_user_memos
       ORDER BY sort_order ASC, created_at DESC`,
    )
    const items = rows.map(toMemo)
    res.json({ items })
  } catch (err) {
    console.error('[ai-user-memos] list', err)
    res.status(500).json({ error: err.message })
  }
})

/** POST /api/ai-user-memos - 생성 */
router.post('/ai-user-memos', async (req, res) => {
  try {
    const { content, source = 'chat', channel_id, chat_id } = req.body
    const trimmed = (content ?? '').trim()
    if (!trimmed) {
      return res.status(400).json({ error: 'content가 필요합니다.' })
    }
    const [result] = await pool.execute(
      `INSERT INTO ai_user_memos (content, source, channel_id, chat_id, sort_order)
       VALUES (?, ?, ?, ?, 0)`,
      [trimmed, source, channel_id || null, chat_id || null],
    )
    const [rows] = await pool.execute(
      'SELECT id, content, source, channel_id, chat_id, sort_order, created_at, updated_at FROM ai_user_memos WHERE id = ?',
      [result.insertId],
    )
    const item = rows[0] ? toMemo(rows[0]) : null
    res.status(201).json(item)
  } catch (err) {
    console.error('[ai-user-memos] create', err)
    res.status(500).json({ error: err.message })
  }
})

/** PATCH /api/ai-user-memos/:id - 업데이트 */
router.patch('/ai-user-memos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ error: '올바른 id가 필요합니다.' })
    const { content, sort_order } = req.body
    const updates = []
    const params = []
    if (typeof content === 'string') {
      const trimmed = content.trim()
      updates.push('content = ?')
      params.push(trimmed)
    }
    if (typeof sort_order === 'number') {
      updates.push('sort_order = ?')
      params.push(sort_order)
    }
    if (updates.length === 0) return res.status(400).json({ error: '수정할 필드가 없습니다.' })
    params.push(id)
    await pool.execute(
      `UPDATE ai_user_memos SET ${updates.join(', ')} WHERE id = ?`,
      params,
    )
    const [rows] = await pool.execute(
      'SELECT id, content, source, channel_id, chat_id, sort_order, created_at, updated_at FROM ai_user_memos WHERE id = ?',
      [id],
    )
    const item = rows[0] ? toMemo(rows[0]) : null
    res.json(item)
  } catch (err) {
    console.error('[ai-user-memos] update', err)
    res.status(500).json({ error: err.message })
  }
})

/** DELETE /api/ai-user-memos/:id - 삭제 */
router.delete('/ai-user-memos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ error: '올바른 id가 필요합니다.' })
    const [result] = await pool.execute('DELETE FROM ai_user_memos WHERE id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).json({ error: '메모를 찾을 수 없습니다.' })
    res.json({ ok: true })
  } catch (err) {
    console.error('[ai-user-memos] delete', err)
    res.status(500).json({ error: err.message })
  }
})

/** PATCH /api/ai-user-memos/:id/move - 순서 변경 (direction: up | down) */
router.patch('/ai-user-memos/:id/move', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const direction = (req.body?.direction || req.query?.direction || '').toLowerCase()
    if (isNaN(id) || !['up', 'down'].includes(direction)) {
      return res.status(400).json({ error: 'id와 direction(up|down)이 필요합니다.' })
    }
    const [rows] = await pool.execute(
      'SELECT id, sort_order FROM ai_user_memos ORDER BY sort_order ASC, created_at DESC',
    )
    const idx = rows.findIndex((r) => r.id === id)
    if (idx < 0) return res.status(404).json({ error: '메모를 찾을 수 없습니다.' })
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= rows.length) {
      return res.status(400).json({ error: '더 이상 이동할 수 없습니다.' })
    }
    const [a, b] = [rows[idx], rows[swapIdx]]
    await pool.execute('UPDATE ai_user_memos SET sort_order = ? WHERE id = ?', [b.sort_order, a.id])
    await pool.execute('UPDATE ai_user_memos SET sort_order = ? WHERE id = ?', [a.sort_order, b.id])
    res.json({ ok: true })
  } catch (err) {
    console.error('[ai-user-memos] move', err)
    res.status(500).json({ error: err.message })
  }
})

export default router

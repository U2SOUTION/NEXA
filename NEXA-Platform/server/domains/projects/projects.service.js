/**
 * 프로젝트 서비스 [NEXA-AUTH-01] §2.2 3단계
 * projects 테이블 CRUD, user_id 소유자 기준
 */
import { pool } from '../../config/dbConfig.js'
import { generateUuidV7 } from '../../config/uuidUtils.js'

export async function listByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, name, description, created_at, updated_at
     FROM projects
     WHERE user_id = $1
     ORDER BY updated_at DESC NULLS LAST, created_at DESC`,
    [userId]
  )
  return rows
}

export async function create(userId, { name, description } = {}) {
  const id = generateUuidV7()
  await pool.query(
    `INSERT INTO projects (id, user_id, name, description)
     VALUES ($1, $2, $3, $4)`,
    [id, userId, name || '', description || null]
  )
  const { rows } = await pool.query(
    'SELECT id, user_id, name, description, created_at, updated_at FROM projects WHERE id = $1',
    [id]
  )
  return rows[0] || null
}

export async function getById(projectId, userId) {
  const { rows } = await pool.query(
    'SELECT id, user_id, name, description, created_at, updated_at FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  )
  return rows[0] || null
}

export async function update(projectId, userId, { name, description } = {}) {
  const project = await getById(projectId, userId)
  if (!project) return null
  const updates = []
  const values = []
  let i = 1
  if (name !== undefined) {
    updates.push(`name = $${i++}`)
    values.push(name)
  }
  if (description !== undefined) {
    updates.push(`description = $${i++}`)
    values.push(description)
  }
  if (updates.length === 0) return project
  values.push(projectId, userId)
  const idx = values.length - 1
  await pool.query(
    `UPDATE projects SET ${updates.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1}`,
    values
  )
  return getById(projectId, userId)
}

export async function remove(projectId, userId) {
  const { rowCount } = await pool.query(
    'DELETE FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  )
  return rowCount > 0
}

/**
 * 프로젝트 서비스 [NEXA-AUTH-01] §2.2 3단계
 * projects 테이블 CRUD, user_id 소유자 기준
 */
import type { UserId, ProjectId } from '@system/types/ids'
import type { CreateProjectPayload, UpdateProjectPayload } from './project.types.js'
import { pool } from '../../config/dbConfig.js'
import { generateUuidV7 } from '../../config/uuidUtils.js'

export async function listByUserId(userId: UserId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, name, description, created_at, updated_at
     FROM projects
     WHERE user_id = $1
     ORDER BY updated_at DESC NULLS LAST, created_at DESC`,
    [userId]
  )
  return rows
}

export async function create(userId: UserId, payload: CreateProjectPayload = {}) {
  const { name = '', description = null } = payload
  const id = generateUuidV7()
  await pool.query(
    `INSERT INTO projects (id, user_id, name, description)
     VALUES ($1, $2, $3, $4)`,
    [id, userId, name, description]
  )
  const { rows } = await pool.query(
    'SELECT id, user_id, name, description, created_at, updated_at FROM projects WHERE id = $1',
    [id]
  )
  return rows[0] || null
}

export async function getById(projectId: ProjectId | string, userId: UserId) {
  const { rows } = await pool.query(
    'SELECT id, user_id, name, description, created_at, updated_at FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  )
  return rows[0] || null
}

export async function update(projectId: ProjectId | string, userId: UserId, payload: UpdateProjectPayload = {}) {
  const { name, description } = payload
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

export async function remove(projectId: ProjectId | string, userId: UserId) {
  const { rowCount } = await pool.query(
    'DELETE FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  )
  return rowCount > 0
}

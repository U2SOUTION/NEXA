import { pool } from '../../config/dbConfig.js'

export async function listPartClasses({ includeDeleted = false } = {}) {
  const where = includeDeleted ? '1=1' : 'pc.deleted_at IS NULL'
  const { rows } = await pool.query(
    `SELECT pc.*,
            COALESCE((
              SELECT COUNT(DISTINCT pf.id)
              FROM part_files pf
              WHERE pf.part_class_id = pc.id AND pf.is_editor_image = false
            ), 0) as file_upload_count
     FROM part_classes pc
     WHERE ${where}
     ORDER BY pc.sort_order ASC, pc.sub_sort_order ASC, pc.updated_at DESC, pc.id ASC`,
  )
  return rows
}

export async function listPartClassesTrashCount() {
  const { rows } = await pool.query('SELECT COUNT(*) AS count FROM part_classes WHERE deleted_at IS NOT NULL')
  return rows[0]?.count || 0
}

export async function listPartClassesTrash() {
  const { rows } = await pool.query(
    `SELECT pc.*,
            COALESCE((
              SELECT COUNT(DISTINCT pf.id)
              FROM part_files pf
              WHERE pf.part_class_id = pc.id AND pf.is_editor_image = false
            ), 0) as file_upload_count
     FROM part_classes pc
     WHERE pc.deleted_at IS NOT NULL
     ORDER BY pc.deleted_at DESC, pc.sort_order ASC, pc.sub_sort_order ASC, pc.id ASC`,
  )
  return rows
}

export async function getPartClass(id, { includeDeleted = false } = {}) {
  const where = includeDeleted ? 'pc.id = $1' : 'pc.id = $1 AND pc.deleted_at IS NULL'
  const { rows } = await pool.query(
    `SELECT pc.*,
            COALESCE((
              SELECT COUNT(DISTINCT pf.id)
              FROM part_files pf
              WHERE pf.part_class_id = pc.id AND pf.is_editor_image = false
            ), 0) as file_upload_count
     FROM part_classes pc
     WHERE ${where}`,
    [id],
  )
  return rows[0] || null
}

export async function createPartClass(payload) {
  const { name, c_code, code_name, description, category, example, sort_order, sub_sort_order, detailed_description } = payload

  let finalSortOrder = sort_order
  if (finalSortOrder === undefined || finalSortOrder === null || finalSortOrder === 0) {
    const { rows: maxRows } = await pool.query('SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM part_classes WHERE deleted_at IS NULL')
    const maxSortOrder = maxRows[0]?.max_sort || 0
    finalSortOrder = Math.ceil((maxSortOrder + 1) / 10) * 10
  }
  const finalSubSortOrder = sub_sort_order !== undefined && sub_sort_order !== null ? Number(sub_sort_order) : 0

  const { rows: insertRows } = await pool.query(
    `INSERT INTO part_classes
     (name, c_code, code_name, description, category, example, sort_order, sub_sort_order, detailed_description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [name, c_code, code_name, description, category, example, finalSortOrder, finalSubSortOrder, detailed_description !== undefined ? detailed_description : null],
  )
  const newId = insertRows[0]?.id

  const { rows: newRow } = await pool.query('SELECT * FROM part_classes WHERE id = $1', [newId])
  return newRow[0]
}

export async function reorderPartClasses(items) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const item of items) {
      const id = Number(item.id)
      const sortOrder = Number(item.sort_order)
      const subSortOrder = Number(item.sub_sort_order || 0)
      await client.query('UPDATE part_classes SET sort_order = $1, sub_sort_order = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [sortOrder, subSortOrder, id])
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
  return { success: true }
}

export async function reinitializePartClassesSortOrder() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      `SELECT id FROM part_classes
       WHERE deleted_at IS NULL
       ORDER BY sort_order ASC, sub_sort_order ASC, updated_at DESC, id ASC`,
    )
    if (rows.length === 0) {
      await client.query('COMMIT')
      return { success: true, message: '재정렬할 항목이 없습니다.', count: 0 }
    }

    let updateCount = 0
    for (let i = 0; i < rows.length; i++) {
      const newSortOrder = (i + 1) * 10
      await client.query('UPDATE part_classes SET sort_order = $1, sub_sort_order = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newSortOrder, rows[i].id])
      updateCount++
    }

    const { rows: zeroRows } = await client.query(
      `SELECT id FROM part_classes
       WHERE deleted_at IS NULL AND sort_order = 0`,
    )
    if (zeroRows.length > 0) {
      const { rows: maxRows } = await client.query('SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM part_classes WHERE deleted_at IS NULL')
      const maxSortOrder = maxRows[0]?.max_sort || 0
      let nextSortOrder = Math.ceil((maxSortOrder + 1) / 10) * 10
      for (const zeroItem of zeroRows) {
        await client.query('UPDATE part_classes SET sort_order = $1, sub_sort_order = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [nextSortOrder, zeroItem.id])
        updateCount++
        nextSortOrder += 10
      }
    }

    await client.query('COMMIT')
    return { success: true, message: `${updateCount}개 항목이 재정렬되었습니다.`, count: updateCount }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function updatePartClass(id, payload) {
  const { name, c_code, code_name, description, category, example, sort_order, detailed_description, is_active, is_favorite } = payload

  const updateFields = []
  const updateValues = []
  let pos = 1
  updateFields.push(`name = $${pos++}`)
  updateValues.push(name)
  updateFields.push(`c_code = $${pos++}`)
  updateValues.push(c_code)
  updateFields.push(`code_name = $${pos++}`)
  updateValues.push(code_name)
  updateFields.push(`description = $${pos++}`)
  updateValues.push(description)
  updateFields.push(`category = $${pos++}`)
  updateValues.push(category)
  updateFields.push(`example = $${pos++}`)
  updateValues.push(example)
  updateFields.push(`detailed_description = $${pos++}`)
  updateValues.push(detailed_description !== undefined ? detailed_description : null)
  if (sort_order !== undefined && sort_order !== null) {
    updateFields.push(`sort_order = $${pos++}`)
    updateValues.push(sort_order)
  }
  if (is_active !== undefined && is_active !== null) {
    updateFields.push(`is_active = $${pos++}`)
    updateValues.push(is_active)
  }
  if (is_favorite !== undefined && is_favorite !== null) {
    updateFields.push(`is_favorite = $${pos++}`)
    updateValues.push(is_favorite)
  }
  updateValues.push(id)

  await pool.query(
    `UPDATE part_classes SET ${updateFields.join(', ')} WHERE id = $${pos}`,
    updateValues,
  )

  const { rows } = await pool.query('SELECT * FROM part_classes WHERE id = $1', [id])
  return rows[0] || null
}

export async function softDeletePartClass(id) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query('UPDATE part_classes SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL', [id])
    if (result.rowCount === 0) {
      await client.query('ROLLBACK')
      return null
    }
    await client.query('COMMIT')
    return { success: true }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function bulkSoftDeletePartClasses(ids) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',')
    const result = await client.query(
      `UPDATE part_classes SET deleted_at = CURRENT_TIMESTAMP WHERE deleted_at IS NULL AND id IN (${placeholders})`,
      ids,
    )
    await client.query('COMMIT')
    return { affected: result.rowCount }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function restorePartClass(id) {
  const result = await pool.query('UPDATE part_classes SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL', [id])
  return result.rowCount > 0
}

export async function bulkRestorePartClasses(ids) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',')
    const result = await client.query(
      `UPDATE part_classes SET deleted_at = NULL WHERE deleted_at IS NOT NULL AND id IN (${placeholders})`,
      ids,
    )
    await client.query('COMMIT')
    return { affected: result.rowCount }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function permanentDeletePartClass(id) {
  const result = await pool.query('DELETE FROM part_classes WHERE id = $1', [id])
  return result.rowCount > 0
}

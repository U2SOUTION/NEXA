import { pool } from '../../config/dbConfig.js'

export async function listPartClasses({ includeDeleted = false } = {}) {
  const where = includeDeleted ? '1=1' : 'pc.deleted_at IS NULL'
  const [rows] = await pool.query(
    `SELECT pc.*,
            COALESCE((
              SELECT COUNT(DISTINCT pf.id)
              FROM part_files pf
              WHERE pf.part_class_id = pc.id AND pf.is_editor_image = 0
            ), 0) as file_upload_count
     FROM part_classes pc
     WHERE ${where}
     ORDER BY pc.sort_order ASC, pc.sub_sort_order ASC, pc.updated_at DESC, pc.id ASC`,
  )
  return rows
}

export async function listPartClassesTrashCount() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM part_classes WHERE deleted_at IS NOT NULL')
  return rows[0]?.count || 0
}

export async function listPartClassesTrash() {
  const [rows] = await pool.query(
    `SELECT pc.*,
            COALESCE((
              SELECT COUNT(DISTINCT pf.id)
              FROM part_files pf
              WHERE pf.part_class_id = pc.id AND pf.is_editor_image = 0
            ), 0) as file_upload_count
     FROM part_classes pc
     WHERE pc.deleted_at IS NOT NULL
     ORDER BY pc.deleted_at DESC, pc.sort_order ASC, pc.sub_sort_order ASC, pc.id ASC`,
  )
  return rows
}

export async function getPartClass(id, { includeDeleted = false } = {}) {
  const where = includeDeleted ? 'pc.id = ?' : 'pc.id = ? AND pc.deleted_at IS NULL'
  const [rows] = await pool.query(
    `SELECT pc.*,
            COALESCE((
              SELECT COUNT(DISTINCT pf.id)
              FROM part_files pf
              WHERE pf.part_class_id = pc.id AND pf.is_editor_image = 0
            ), 0) as file_upload_count
     FROM part_classes pc
     WHERE ${where}`,
    [id],
  )
  return rows[0] || null
}

export async function createPartClass(payload) {
  const { name, c_code, code_name, description, category, example, sort_order, sub_sort_order, detailed_description } = payload

  // sort_order 기본 계산
  let finalSortOrder = sort_order
  if (finalSortOrder === undefined || finalSortOrder === null || finalSortOrder === 0) {
    const [maxResult] = await pool.query('SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM part_classes WHERE deleted_at IS NULL')
    const maxSortOrder = maxResult[0]?.max_sort || 0
    finalSortOrder = Math.ceil((maxSortOrder + 1) / 10) * 10
  }
  const finalSubSortOrder = sub_sort_order !== undefined && sub_sort_order !== null ? Number(sub_sort_order) : 0

  const [result] = await pool.query(
    `INSERT INTO part_classes
     (name, c_code, code_name, description, category, example, sort_order, sub_sort_order, detailed_description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, c_code, code_name, description, category, example, finalSortOrder, finalSubSortOrder, detailed_description !== undefined ? detailed_description : null],
  )

  const [newRow] = await pool.query('SELECT * FROM part_classes WHERE id = ?', [result.insertId])
  return newRow[0]
}

export async function reorderPartClasses(items) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    for (const item of items) {
      const id = Number(item.id)
      const sortOrder = Number(item.sort_order)
      const subSortOrder = Number(item.sub_sort_order || 0)
      await conn.query('UPDATE part_classes SET sort_order = ?, sub_sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [sortOrder, subSortOrder, id])
    }
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
  return { success: true }
}

export async function reinitializePartClassesSortOrder() {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [rows] = await conn.query(
      `SELECT id FROM part_classes
       WHERE deleted_at IS NULL
       ORDER BY sort_order ASC, sub_sort_order ASC, updated_at DESC, id ASC`,
    )
    if (rows.length === 0) {
      await conn.commit()
      return { success: true, message: '재정렬할 항목이 없습니다.', count: 0 }
    }

    let updateCount = 0
    for (let i = 0; i < rows.length; i++) {
      const newSortOrder = (i + 1) * 10
      await conn.query('UPDATE part_classes SET sort_order = ?, sub_sort_order = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newSortOrder, rows[i].id])
      updateCount++
    }

    // sort_order = 0 복구 처리
    const [zeroRows] = await conn.query(
      `SELECT id FROM part_classes
       WHERE deleted_at IS NULL AND sort_order = 0`,
    )
    if (zeroRows.length > 0) {
      const [maxResult] = await conn.query('SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM part_classes WHERE deleted_at IS NULL')
      const maxSortOrder = maxResult[0]?.max_sort || 0
      let nextSortOrder = Math.ceil((maxSortOrder + 1) / 10) * 10
      for (const zeroItem of zeroRows) {
        await conn.query('UPDATE part_classes SET sort_order = ?, sub_sort_order = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nextSortOrder, zeroItem.id])
        updateCount++
        nextSortOrder += 10
      }
    }

    await conn.commit()
    return { success: true, message: `${updateCount}개 항목이 재정렬되었습니다.`, count: updateCount }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export async function updatePartClass(id, payload) {
  const { name, c_code, code_name, description, category, example, sort_order, detailed_description, is_active, is_favorite } = payload

  const updateFields = ['name = ?', 'c_code = ?', 'code_name = ?', 'description = ?', 'category = ?', 'example = ?', 'detailed_description = ?']
  const updateValues = [name, c_code, code_name, description, category, example, detailed_description !== undefined ? detailed_description : null]

  if (sort_order !== undefined && sort_order !== null) {
    updateFields.push('sort_order = ?')
    updateValues.push(sort_order)
  }
  if (is_active !== undefined && is_active !== null) {
    updateFields.push('is_active = ?')
    updateValues.push(is_active)
  }
  if (is_favorite !== undefined && is_favorite !== null) {
    updateFields.push('is_favorite = ?')
    updateValues.push(is_favorite)
  }

  updateValues.push(id)

  await pool.query(
    `UPDATE part_classes
     SET ${updateFields.join(', ')}
     WHERE id = ?`,
    updateValues,
  )

  const [rows] = await pool.query('SELECT * FROM part_classes WHERE id = ?', [id])
  return rows[0] || null
}

export async function softDeletePartClass(id) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [result] = await conn.query('UPDATE part_classes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL', [id])
    if (result.affectedRows === 0) {
      await conn.rollback()
      return null
    }
    await conn.commit()
    return { success: true }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export async function bulkSoftDeletePartClasses(ids) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [result] = await conn.query(
      `UPDATE part_classes
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE deleted_at IS NULL AND id IN (${ids.map(() => '?').join(',')})`,
      ids,
    )
    await conn.commit()
    return { affected: result.affectedRows }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export async function restorePartClass(id) {
  const [result] = await pool.query('UPDATE part_classes SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL', [id])
  return result.affectedRows > 0
}

export async function bulkRestorePartClasses(ids) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [result] = await conn.query(
      `UPDATE part_classes
       SET deleted_at = NULL
       WHERE deleted_at IS NOT NULL AND id IN (${ids.map(() => '?').join(',')})`,
      ids,
    )
    await conn.commit()
    return { affected: result.affectedRows }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export async function permanentDeletePartClass(id) {
  const [result] = await pool.query('DELETE FROM part_classes WHERE id = ?', [id])
  return result.affectedRows > 0
}

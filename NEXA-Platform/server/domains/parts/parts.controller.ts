import {
  listPartClasses,
  listPartClassesTrash,
  listPartClassesTrashCount,
  getPartClass,
  createPartClass,
  reorderPartClasses,
  reinitializePartClassesSortOrder,
  updatePartClass,
  softDeletePartClass,
  bulkSoftDeletePartClasses,
  restorePartClass,
  bulkRestorePartClasses,
  permanentDeletePartClass,
} from './parts.service.js'

export async function getPartClasses(req, res) {
  try {
    const rows = await listPartClasses({ includeDeleted: false })
    res.json(rows)
  } catch (error) {
    console.error('부품 클래스 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
}

export async function getPartClassesTrash(req, res) {
  try {
    const rows = await listPartClassesTrash()
    res.json(rows)
  } catch (error) {
    console.error('[GET /part-classes/trash] 휴지통 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
}

export async function getPartClassesTrashCount(req, res) {
  try {
    const count = await listPartClassesTrashCount()
    res.json({ count })
  } catch (error) {
    console.error('[GET /part-classes/trash/count] 휴지통 개수 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
}

export async function getPartClassDetail(req, res) {
  try {
    const row = await getPartClass(req.params.id, { includeDeleted: false })
    if (!row) {
      return res.status(404).json({ error: '부품 클래스를 찾을 수 없습니다.' })
    }
    res.json(row)
  } catch (error) {
    console.error('부품 클래스 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
}

export async function postPartClass(req, res) {
  try {
    const { name, c_code, category } = req.body
    if (!name) return res.status(400).json({ error: '클래스명은 필수입니다.' })
    if (!category) return res.status(400).json({ error: '대분류명은 필수입니다.' })
    if (c_code && c_code.length > 10) return res.status(400).json({ error: 'C Code는 최대 10자까지 입력 가능합니다.' })

    const created = await createPartClass(req.body)
    res.status(201).json(created)
  } catch (error) {
    console.error('부품 클래스 생성 실패:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: '이미 존재하는 클래스명입니다.' })
    }
    res.status(500).json({ error: error.message })
  }
}

export async function putPartClassesReorder(req, res) {
  try {
    const { items } = req.body
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items 배열이 필요합니다.' })
    }
    const validItems = items.filter(
      (item) =>
        item && typeof item === 'object' && typeof item.id === 'number' && !isNaN(item.id) && item.id > 0 && typeof item.sort_order === 'number' && !isNaN(item.sort_order) && item.sort_order >= 0 && typeof item.sub_sort_order === 'number' && !isNaN(item.sub_sort_order) && item.sub_sort_order >= 0,
    )
    if (validItems.length === 0) {
      return res.status(400).json({ error: '유효한 항목이 없습니다.' })
    }
    await reorderPartClasses(validItems)
    res.json({ success: true, message: '정렬 순서가 업데이트되었습니다.' })
  } catch (error) {
    console.error('[API] 정렬 순서 변경 실패:', error)
    res.status(500).json({ error: error.message })
  }
}

export async function postPartClassesReinitialize(req, res) {
  try {
    const result = await reinitializePartClassesSortOrder()
    res.json(result)
  } catch (error) {
    console.error('[API] sort_order 재정렬 실패:', error)
    res.status(500).json({ error: error.message })
  }
}

export async function putPartClass(req, res) {
  try {
    const { name, c_code, category } = req.body
    if (!name) return res.status(400).json({ error: '클래스명은 필수입니다.' })
    if (!category) return res.status(400).json({ error: '대분류명은 필수입니다.' })
    if (c_code && c_code.length > 10) return res.status(400).json({ error: 'C Code는 최대 10자까지 입력 가능합니다.' })

    const updated = await updatePartClass(Number(req.params.id), req.body)
    if (!updated) return res.status(404).json({ error: '부품 클래스를 찾을 수 없습니다.' })
    res.json(updated)
  } catch (error) {
    console.error('부품 클래스 수정 실패:', error)
    res.status(500).json({ error: error.message })
  }
}

export async function deletePartClass(req, res) {
  try {
    const deleted = await softDeletePartClass(Number(req.params.id))
    if (!deleted) {
      return res.status(404).json({ error: '부품 클래스를 찾을 수 없거나 이미 삭제되었습니다.' })
    }
    res.json({ message: '삭제되었습니다. (휴지통으로 이동됨)' })
  } catch (error) {
    console.error('부품 클래스 삭제 실패:', error)
    res.status(500).json({ error: error.message })
  }
}

export async function postBulkDelete(req, res) {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids 배열이 필요합니다.' })
    }
    const validIds = ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
    if (validIds.length === 0) {
      return res.status(400).json({ error: '유효한 id가 없습니다.' })
    }
    const result = await bulkSoftDeletePartClasses(validIds)
    res.json({ message: '삭제되었습니다. (휴지통으로 이동됨)', affected: result.affected })
  } catch (error) {
    console.error('[POST /part-classes/bulk-delete] 복수 삭제 실패:', error)
    res.status(500).json({ error: error.message })
  }
}

export async function postRestore(req, res) {
  try {
    const restored = await restorePartClass(Number(req.params.id))
    if (!restored) {
      return res.status(404).json({ error: '복구할 항목을 찾을 수 없습니다.' })
    }
    res.json({ message: '복구되었습니다.' })
  } catch (error) {
    console.error('[POST /part-classes/:id/restore] 복구 실패:', error)
    res.status(500).json({ error: error.message })
  }
}

export async function postBulkRestore(req, res) {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids 배열이 필요합니다.' })
    }
    const validIds = ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
    if (validIds.length === 0) {
      return res.status(400).json({ error: '유효한 id가 없습니다.' })
    }
    const result = await bulkRestorePartClasses(validIds)
    res.json({ message: '복구되었습니다.', affected: result.affected })
  } catch (error) {
    console.error('[POST /part-classes/bulk-restore] 복수 복구 실패:', error)
    res.status(500).json({ error: error.message })
  }
}

export async function deletePermanent(req, res) {
  try {
    const ok = await permanentDeletePartClass(Number(req.params.id))
    if (!ok) {
      return res.status(404).json({ error: '완전 삭제할 항목을 찾을 수 없습니다.' })
    }
    res.json({ message: '완전 삭제되었습니다.' })
  } catch (error) {
    console.error('[DELETE /part-classes/:id/permanent] 완전 삭제 실패:', error)
    res.status(500).json({ error: error.message })
  }
}

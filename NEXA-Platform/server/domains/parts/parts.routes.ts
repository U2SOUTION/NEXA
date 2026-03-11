import { Router } from 'express'
import { getPartClasses, getPartClassesTrash, getPartClassesTrashCount, getPartClassDetail, postPartClass, putPartClassesReorder, postPartClassesReinitialize, putPartClass, deletePartClass, postBulkDelete, postRestore, postBulkRestore, deletePermanent } from './parts.controller.js'

const router = Router()

// 주의: 순서 중요 (trash, reorder 등 상위 라우트를 먼저 배치)
router.get('/part-classes', getPartClasses)
router.get('/part-classes/trash', getPartClassesTrash)
router.get('/part-classes/trash/count', getPartClassesTrashCount)
router.get('/part-classes/:id', getPartClassDetail)

router.post('/part-classes', postPartClass)
router.put('/part-classes/reorder', putPartClassesReorder)
router.post('/part-classes/reinitialize-sort-order', postPartClassesReinitialize)
router.put('/part-classes/:id', putPartClass)
router.delete('/part-classes/:id', deletePartClass)
router.post('/part-classes/bulk-delete', postBulkDelete)
router.post('/part-classes/:id/restore', postRestore)
router.post('/part-classes/bulk-restore', postBulkRestore)
router.delete('/part-classes/:id/permanent', deletePermanent)

export default router

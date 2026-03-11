import express from 'express'
import {
  handleCreateArchive,
  handleCreateArchiveDoc,
  handleFetchLayouts,
  handleGetArchive,
  handleListArchives,
  handleUpdateArchive,
  handleUpdateArchiveDoc,
} from './archive.controller.js'

const router = express.Router()

router.get('/system-templates', handleFetchLayouts)
router.post('/archives', handleCreateArchive)
router.get('/archives', handleListArchives)
router.get('/archives/:id', handleGetArchive)
router.put('/archives/:id', handleUpdateArchive)
router.post('/archive-doc', handleCreateArchiveDoc)
router.put('/archive-doc/:id', handleUpdateArchiveDoc)

export default router

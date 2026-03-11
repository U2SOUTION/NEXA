import express from 'express'
import { pool } from '../../config/dbConfig.js'

const router = express.Router()

// GET /api/part-models/class/:classId - 특정 클래스의 모델 목록
router.get('/part-models/class/:classId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pm.*, pc.name as part_class_name, pc.c_code, pc.category
       FROM part_models pm
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE pm.part_class_id = $1
       ORDER BY pm.id`,
      [req.params.classId],
    )
    res.json(rows)
  } catch (error) {
    console.error('[PartModels] 목록 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-models/:id - 특정 모델 단건
router.get('/part-models/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pm.*, pc.name as part_class_name, pc.c_code, pc.category
       FROM part_models pm
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE pm.id = $1`,
      [req.params.id],
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 모델을 찾을 수 없습니다.' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('[PartModels] 단건 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-models - 전체 모델 목록
router.get('/part-models', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pm.*, pc.name as part_class_name, pc.c_code, pc.category
       FROM part_models pm
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       ORDER BY pm.id`,
    )
    res.json(rows)
  } catch (error) {
    console.error('[PartModels] 전체 목록 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

import express from 'express'
import { pool } from '../../config/dbConfig.js'

const router = express.Router()

// GET /api/part-specs/model/:modelId - 특정 모델의 스펙 목록
router.get('/part-specs/model/:modelId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ps.*, pm.model_name as part_model_name, pm.part_class_id, pc.name as part_class_name
       FROM part_specs ps
       LEFT JOIN part_models pm ON ps.part_model_id = pm.id
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE ps.part_model_id = $1
       ORDER BY ps.id`,
      [req.params.modelId],
    )
    res.json(rows)
  } catch (error) {
    console.error('[PartSpecs] 목록 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-specs/:id - 특정 스펙 단건
router.get('/part-specs/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ps.*, pm.model_name as part_model_name, pm.part_class_id, pc.name as part_class_name
       FROM part_specs ps
       LEFT JOIN part_models pm ON ps.part_model_id = pm.id
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       WHERE ps.id = $1`,
      [req.params.id],
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: '부품 스펙을 찾을 수 없습니다.' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('[PartSpecs] 단건 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/part-specs - 전체 스펙 목록
router.get('/part-specs', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ps.*, pm.model_name as part_model_name, pm.part_class_id, pc.name as part_class_name
       FROM part_specs ps
       LEFT JOIN part_models pm ON ps.part_model_id = pm.id
       LEFT JOIN part_classes pc ON pm.part_class_id = pc.id
       ORDER BY ps.id`,
    )
    res.json(rows)
  } catch (error) {
    console.error('[PartSpecs] 전체 목록 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

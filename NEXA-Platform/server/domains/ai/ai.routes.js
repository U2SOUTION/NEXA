import express from 'express'
import { listModels, showModel, chat, checkConnection } from './ai.service.js'

const router = express.Router()

router.get('/ai/models', async (req, res) => {
  try {
    const data = await listModels()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/ai/model-show', async (req, res) => {
  try {
    const { model } = req.body
    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'model 이름이 필요합니다.' })
    }
    const data = await showModel(model)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/ai/chat', async (req, res) => {
  try {
    const { messages, model, systemInstruction } = req.body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages 배열이 필요합니다.' })
    }
    const data = await chat(messages, model, undefined, systemInstruction)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/ai/check', async (req, res) => {
  try {
    const { url } = req.body
    await checkConnection(url)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router

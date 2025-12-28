// 개발 전용 파일 편집 API
// ⚠️ 이 파일은 개발 환경에서만 사용됩니다. 프로덕션에는 포함되지 않습니다.

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// 개발 환경 체크
const isDev = process.env.NODE_ENV !== 'production'

// 프로덕션 환경에서는 모든 요청 거부
if (!isDev) {
  router.use('*', (req, res) => {
    res.status(403).json({
      error: '이 API는 개발 환경에서만 사용 가능합니다.',
      message: 'NODE_ENV가 production일 때는 이 API를 사용할 수 없습니다.',
    })
  })
}

// ============================================
// 메타데이터 파싱 유틸리티
// ============================================

/**
 * Vue 파일에서 메타데이터 주석 파싱
 * 형식: <!-- @tags: tag1, tag2 @category: category @description: description -->
 */
function parseVueMetadata(content) {
  // 여러 줄 메타데이터 형식 지원
  const multiLineRegex = /<!--\s*@tags:\s*([^\n@]+)\s*@category:\s*([^\n@]+)\s*@description:\s*([^\n@]+)\s*-->/i
  // 한 줄 메타데이터 형식 지원
  const singleLineRegex = /<!--\s*@tags:\s*([^@]+)\s*@category:\s*([^@]+)\s*@description:\s*([^@]+)\s*-->/i

  let match = content.match(multiLineRegex) || content.match(singleLineRegex)

  if (match) {
    return {
      tags: match[1]
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      category: match[2].trim(),
      description: match[3].trim(),
    }
  }
  return null
}

/**
 * Vue 파일에 메타데이터 주석 추가/업데이트
 */
function updateVueMetadata(content, metadata) {
  const metadataComment = `<!--
  @tags: ${metadata.tags?.join(', ') || ''}
  @category: ${metadata.category || ''}
  @description: ${metadata.description || ''}
-->`

  // 기존 메타데이터가 있으면 교체
  const existingMetadataRegex = /<!--\s*@tags:[\s\S]*?-->\s*\n?/

  if (existingMetadataRegex.test(content)) {
    return content.replace(existingMetadataRegex, metadataComment + '\n')
  } else {
    // <template> 태그 앞에 추가
    return content.replace(/<template>/, metadataComment + '\n<template>')
  }
}

/**
 * 파일 확장자에 따른 메타데이터 파서 선택
 */
function getMetadataParser(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.vue') {
    return { parse: parseVueMetadata, update: updateVueMetadata }
  }
  // 향후 다른 파일 형식 지원 가능
  return null
}

// ============================================
// API 엔드포인트
// ============================================

/**
 * GET /api/dev/files/:filePath/metadata
 * 파일의 메타데이터 읽기
 * 경로 예: /api/dev/files/guides/styles/charts/bar/NexaChartBar.vue/metadata
 */
router.get('/*/metadata', async (req, res) => {
  try {
    // req.params[0]에서 파일 경로 가져오기 (슬래시 제거)
    const filePath = req.params[0]?.replace(/^\/+|\/+$/g, '') // 앞뒤 슬래시 제거

    // 보안: 경로 순회 방지
    if (filePath.includes('..') || filePath.startsWith('/') || filePath.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일 경로입니다.' })
    }

    // ⚠️ 중요 : 전체 파일 경로 구성 (src 폴더 기준)
    const fullPath = path.join(__dirname, '../../src', filePath)

    // 파일 읽기
    const content = await fs.readFile(fullPath, 'utf-8')

    // 메타데이터 파서 선택
    const parser = getMetadataParser(filePath)
    if (!parser) {
      return res.json({
        success: true,
        metadata: null,
        message: '이 파일 형식은 메타데이터를 지원하지 않습니다.',
        filePath: filePath,
      })
    }

    // 메타데이터 파싱
    const metadata = parser.parse(content)

    res.json({
      success: true,
      metadata: metadata,
      filePath: filePath,
    })
  } catch (error) {
    console.error('[DevFileEditor] 메타데이터 읽기 실패:', error)
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

/**
 * PUT /api/dev/files/:filePath/metadata
 * 파일의 메타데이터 업데이트
 */
router.put('/*/metadata', express.json(), async (req, res) => {
  try {
    // req.params[0]에서 파일 경로 가져오기 (슬래시 제거)
    const filePath = req.params[0]?.replace(/^\/+|\/+$/g, '') // 앞뒤 슬래시 제거
    const { tags, category, description } = req.body

    // 보안: 경로 순회 방지
    if (filePath.includes('..') || filePath.startsWith('/') || filePath.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일 경로입니다.' })
    }

    // 전체 파일 경로 구성
    const fullPath = path.join(__dirname, '../../src', filePath)

    // 파일 읽기
    const content = await fs.readFile(fullPath, 'utf-8')

    // 메타데이터 파서 선택
    const parser = getMetadataParser(filePath)
    if (!parser) {
      return res.status(400).json({
        error: '이 파일 형식은 메타데이터를 지원하지 않습니다.',
      })
    }

    // 메타데이터 업데이트
    const updatedContent = parser.update(content, {
      tags: tags || [],
      category: category || '',
      description: description || '',
    })

    // 파일 저장
    await fs.writeFile(fullPath, updatedContent, 'utf-8')

    res.json({
      success: true,
      message: '메타데이터가 업데이트되었습니다.',
      filePath: filePath,
    })
  } catch (error) {
    console.error('[DevFileEditor] 메타데이터 업데이트 실패:', error)
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

/**
 * GET /api/dev/files/:filePath/content
 * 파일 내용 읽기
 */
router.get('/*/content', async (req, res) => {
  try {
    // req.params[0]에서 파일 경로 가져오기 (슬래시 제거)
    const filePath = req.params[0]?.replace(/^\/+|\/+$/g, '') // 앞뒤 슬래시 제거

    // 보안: 경로 순회 방지
    if (filePath.includes('..') || filePath.startsWith('/') || filePath.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일 경로입니다.' })
    }

    // 전체 파일 경로 구성
    const fullPath = path.join(__dirname, '../../src', filePath)

    // 파일 읽기
    const content = await fs.readFile(fullPath, 'utf-8')

    res.json({
      success: true,
      content: content,
      filePath: filePath,
    })
  } catch (error) {
    console.error('[DevFileEditor] 파일 내용 읽기 실패:', error)
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

/**
 * PUT /api/dev/files/:filePath/content
 * 파일 내용 업데이트
 */
router.put('/*/content', express.json(), async (req, res) => {
  try {
    // req.params[0]에서 파일 경로 가져오기 (슬래시 제거)
    const filePath = req.params[0]?.replace(/^\/+|\/+$/g, '') // 앞뒤 슬래시 제거
    const { content } = req.body

    // 보안: 경로 순회 방지
    if (filePath.includes('..') || filePath.startsWith('/') || filePath.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일 경로입니다.' })
    }

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'content는 문자열이어야 합니다.' })
    }

    // 전체 파일 경로 구성
    const fullPath = path.join(__dirname, '../../src', filePath)

    // 디렉토리가 없으면 생성
    const dir = path.dirname(fullPath)
    await fs.mkdir(dir, { recursive: true })

    // 파일 저장
    await fs.writeFile(fullPath, content, 'utf-8')

    res.json({
      success: true,
      message: '파일이 업데이트되었습니다.',
      filePath: filePath,
    })
  } catch (error) {
    console.error('[DevFileEditor] 파일 내용 업데이트 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

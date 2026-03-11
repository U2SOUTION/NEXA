// 개발 전용 파일 편집 API
// ⚠️ 이 파일은 개발 환경에서만 사용됩니다. 프로덕션에는 포함되지 않습니다.

import { Router } from 'express'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bodyParser = require('body-parser') as { json: () => (req: unknown, res: unknown, next: (err?: unknown) => void) => void }
import { errMessage } from '@/utils/errUtils.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

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
function parseVueMetadata(content: string): { tags: string[]; category: string; description: string } | null {
  // @tags, @category, @description이 모두 포함된 주석 블록 찾기
  // 여러 줄 형식: <!--\n  @tags: ...\n  @category: ...\n  @description: ...\n-->
  // 각 필드는 줄바꿈을 포함할 수 있으므로 [\s\S]*?를 사용
  const multiLineRegex = /<!--[\s\S]*?@tags:\s*([\s\S]*?)\s*@category:\s*([\s\S]*?)\s*@description:\s*([\s\S]*?)\s*-->/i
  
  // 한 줄 형식: <!-- @tags: ... @category: ... @description: ... -->
  const singleLineRegex = /<!--\s*@tags:\s*([^@]+?)\s*@category:\s*([^@]+?)\s*@description:\s*([^@]+?)\s*-->/i

  let match = content.match(multiLineRegex) || content.match(singleLineRegex)

  if (match) {
    // 각 필드에서 줄바꿈을 공백으로 변환하고 정리
    const tagsStr = match[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    const categoryStr = match[2].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    const descriptionStr = match[3].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()

    return {
      tags: tagsStr
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean),
      category: categoryStr,
      description: descriptionStr,
    }
  }
  return null
}

/**
 * Vue 파일에 메타데이터 주석 추가/업데이트
 */
function updateVueMetadata(
  content: string,
  metadata: { tags?: string[]; category?: string; description?: string },
): string {
  const metadataComment = `<!--
  @tags: ${metadata.tags?.join(', ') || ''}
  @category: ${metadata.category || ''}
  @description: ${metadata.description || ''}
-->`

  // 기존 메타데이터 주석 블록 찾기
  // @tags, @category, @description이 모두 포함된 주석 블록만 찾음 (파일 설명 주석과 구분)
  const existingMetadataRegex = /<!--[\s\S]*?@tags:\s*[\s\S]*?@category:\s*[\s\S]*?@description:\s*[\s\S]*?-->\s*\n?/i

  if (existingMetadataRegex.test(content)) {
    // 기존 메타데이터 주석 블록만 교체
    return content.replace(existingMetadataRegex, metadataComment + '\n')
  } else {
    // 메타데이터가 없으면 첫 번째 주석 블록이 있는지 확인
    const firstCommentRegex = /(<!--[\s\S]*?-->)\s*\n?/
    const firstCommentMatch = content.match(firstCommentRegex)
    
    if (firstCommentMatch && firstCommentMatch.index === 0) {
      // 첫 번째 주석 블록이 있고 파일 시작 부분에 있으면, 그 뒤에 메타데이터 주석 추가
      const insertPosition = firstCommentMatch.index + firstCommentMatch[0].length
      return (
        content.slice(0, insertPosition) +
        '\n' + metadataComment + '\n' +
        content.slice(insertPosition)
      )
    } else {
      // <template> 태그 앞에 추가
      return content.replace(/<template>/, metadataComment + '\n<template>')
    }
  }
}

/**
 * 파일 확장자에 따른 메타데이터 파서 선택
 */
function getMetadataParser(filePath: string): { parse: typeof parseVueMetadata; update: typeof updateVueMetadata } | null {
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
    const params = req.params as Record<string, string | undefined>
    const filePath = (params['0'] ?? '').replace(/^\/+|\/+$/g, '')

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
  } catch (error: unknown) {
    console.error('[DevFileEditor] 메타데이터 읽기 실패:', error)
    const err = error as NodeJS.ErrnoException
    if (err?.code === 'ENOENT') {
      res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    } else {
      res.status(500).json({ error: errMessage(error) })
    }
  }
})

/**
 * PUT /api/dev/files/:filePath/metadata
 * 파일의 메타데이터 업데이트
 */
router.put('/*/metadata', bodyParser.json(), async (req, res) => {
  try {
    const params = req.params as Record<string, string | undefined>
    const filePath = (params['0'] ?? '').replace(/^\/+|\/+$/g, '')
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
  } catch (error: unknown) {
    console.error('[DevFileEditor] 메타데이터 업데이트 실패:', error)
    const err = error as NodeJS.ErrnoException
    if (err?.code === 'ENOENT') {
      res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    } else {
      res.status(500).json({ error: errMessage(error) })
    }
  }
})

/**
 * GET /api/dev/files/:filePath/content
 * 파일 내용 읽기
 */
router.get('/*/content', async (req, res) => {
  try {
    const params = req.params as Record<string, string | undefined>
    const filePath = (params['0'] ?? '').replace(/^\/+|\/+$/g, '')

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
  } catch (error: unknown) {
    console.error('[DevFileEditor] 파일 내용 읽기 실패:', error)
    const err = error as NodeJS.ErrnoException
    if (err?.code === 'ENOENT') {
      res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    } else {
      res.status(500).json({ error: errMessage(error) })
    }
  }
})

/**
 * PUT /api/dev/files/:filePath/content
 * 파일 내용 업데이트
 */
router.put('/*/content', bodyParser.json(), async (req, res) => {
  try {
    const params = req.params as Record<string, string | undefined>
    const filePath = (params['0'] ?? '').replace(/^\/+|\/+$/g, '')
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
  } catch (error: unknown) {
    console.error('[DevFileEditor] 파일 내용 업데이트 실패:', error)
    res.status(500).json({ error: errMessage(error) })
  }
})

export default router

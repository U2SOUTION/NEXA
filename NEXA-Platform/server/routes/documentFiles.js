// 문서 파일 관리 API 라우트 (다중 폴더 지원)
// 경로 형식: {folderId}/{relativePath} 예: nexa-docs/Platform/01-기획/문서.md
// 레거시: 접두사 없으면 첫 번째 폴더로 처리

import express from 'express'
import path from 'path'
import fs from 'fs/promises'
import {
  isSupportedExtension,
  setSupportedExtensions,
  getSupportedExtensions,
  getDocsFolders,
  getDocsBasePathForFolder,
  resolvePrefixedPath,
  addDocsFolder,
  removeDocsFolder,
  updateDocsFolder,
} from '../config/documentConfig.js'

const router = express.Router()

/**
 * 접두사 경로로 실제 파일 시스템 경로 반환
 * @param {string} prefixedPath
 * @returns {{ basePath: string, relativePath: string, fullPath: string } | null}
 */
function resolvePath(prefixedPath) {
  const resolved = resolvePrefixedPath(prefixedPath)
  if (!resolved) return null
  const fullPath = path.join(resolved.basePath, resolved.relativePath)
  return { basePath: resolved.basePath, relativePath: resolved.relativePath, fullPath }
}

/**
 * 폴더 내 재귀 파일 검색
 * @param {object} folder - { id, label, pathPrefix, displayPathPrefix? }
 */
async function findFilesInDir(dir, relativePath = '', depth = 0, folder, isSupportedExtension) {
  const MAX_DEPTH = 10
  if (depth > MAX_DEPTH) return []
  const files = []
  const folderId = folder.id
  const displayPrefix = folder.displayPathPrefix || folder.label || folder.id
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        const subRel = relativePath ? path.join(relativePath, entry.name).replace(/\\/g, '/') : entry.name
        const subFiles = await findFilesInDir(fullPath, subRel, depth + 1, folder, isSupportedExtension)
        files.push(...subFiles)
      } else if (entry.isFile() && isSupportedExtension(entry.name)) {
        const fileRel = relativePath ? path.join(relativePath, entry.name).replace(/\\/g, '/') : entry.name
        const prefixedPath = `${folderId}/${fileRel}`
        const displayPath = `${displayPrefix}/${fileRel}`
        try {
          const stats = await fs.stat(fullPath)
          files.push({
            fileName: entry.name,
            relativePath: prefixedPath,
            displayPath,
            folderId,
            modifiedDate: stats.mtime.toISOString(),
            createdDate: (stats.birthtime || stats.ctime).toISOString(),
          })
        } catch {
          files.push({ fileName: entry.name, relativePath: prefixedPath, displayPath, folderId, modifiedDate: null, createdDate: null })
        }
      }
    }
  } catch (err) {
    console.error(`[Docs] 디렉토리 읽기 실패: ${dir}`, err.message)
  }
  return files
}

// 슬래시 포함 경로용 라우트 (와일드카드) - /f/ 접두사 사용
// GET/PUT/DELETE /api/docs/f/nexa-docs/Platform/... 형태

async function handleGetFile(req, res) {
  const fileName = req.params[0]
  if (!fileName || fileName.includes('..') || fileName.startsWith('/')) {
    return res.status(400).json({ error: '잘못된 파일명입니다.' })
  }
  if (!isSupportedExtension(fileName)) {
    return res.status(400).json({ error: '지원하는 확장자의 파일만 읽을 수 있습니다.' })
  }
  const r = resolvePath(fileName)
  if (!r) return res.status(400).json({ error: '잘못된 경로입니다.' })
  try {
    const content = await fs.readFile(r.fullPath, 'utf-8')
    const lower = fileName.toLowerCase()
    res.setHeader('Content-Type', lower.endsWith('.mermaid.css') ? 'text/css; charset=utf-8' : 'text/plain; charset=utf-8')
    res.send(content)
  } catch (e) {
    if (e.code === 'ENOENT') return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    throw e
  }
}

async function handlePutFile(req, res) {
  const fileName = req.params[0]
  const newFileName = req.body?.newFileName
  const fileContent = typeof req.body === 'string' ? req.body : req.body?.content

  if (!fileName || fileName.includes('..') || fileName.startsWith('/')) {
    return res.status(400).json({ error: '잘못된 파일명입니다.' })
  }

  const r = resolvePath(fileName)
  if (!r) return res.status(400).json({ error: '잘못된 경로입니다.' })

  if (newFileName) {
    // 파일명 변경
    if (newFileName.includes('..') || newFileName.startsWith('/')) {
      return res.status(400).json({ error: '잘못된 새 파일명입니다.' })
    }
    if (!isSupportedExtension(fileName) || !isSupportedExtension(newFileName)) {
      return res.status(400).json({ error: '지원하는 확장자만 사용 가능합니다.' })
    }
    const rNew = resolvePath(newFileName)
    if (!rNew) return res.status(400).json({ error: '잘못된 새 경로입니다.' })
    const folderMatch = fileName.split('/')[0] === newFileName.split('/')[0]
    if (!folderMatch) {
      return res.status(400).json({ error: '다른 폴더로 이동할 수 없습니다.' })
    }
    try {
      const stats = await fs.stat(r.fullPath)
      if (!stats.isFile()) return res.status(404).json({ error: '기존 파일을 찾을 수 없습니다.' })
    } catch (e) {
      if (e.code === 'ENOENT') return res.status(404).json({ error: '기존 파일을 찾을 수 없습니다.' })
      throw e
    }
    await fs.mkdir(path.dirname(rNew.fullPath), { recursive: true })
    await fs.rename(r.fullPath, rNew.fullPath)
    try {
      const now = new Date()
      await fs.utimes(rNew.fullPath, now, now)
    } catch {}
    return res.json({ success: true, message: '파일명이 변경되었습니다.', oldFileName: fileName, newFileName })
  }

  if (fileContent !== undefined) {
    if (!isSupportedExtension(fileName)) return res.status(400).json({ error: '지원하는 확장자만 사용 가능합니다.' })
    await fs.mkdir(path.dirname(r.fullPath), { recursive: true })
    await fs.writeFile(r.fullPath, fileContent, 'utf-8')
    return res.json({ success: true, message: '파일이 저장되었습니다.', fileName })
  }

  return res.status(400).json({ error: 'newFileName 또는 fileContent가 필요합니다.' })
}

async function handleDeleteFile(req, res) {
  const fileName = req.params[0]
  if (!fileName || fileName.includes('..') || fileName.startsWith('/')) {
    return res.status(400).json({ error: '잘못된 파일명입니다.' })
  }
  if (!isSupportedExtension(fileName)) return res.status(400).json({ error: '지원하는 확장자만 삭제 가능합니다.' })
  const r = resolvePath(fileName)
  if (!r) return res.status(400).json({ error: '잘못된 경로입니다.' })
  try {
    const stats = await fs.stat(r.fullPath)
    if (!stats.isFile()) return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
  } catch (e) {
    if (e.code === 'ENOENT') return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    throw e
  }
  await fs.unlink(r.fullPath)
  res.json({ success: true, message: '파일이 영구적으로 삭제되었습니다.', fileName })
}

async function handleTouchFile(req, res) {
  const fileName = req.params[0]
  if (!fileName || fileName.includes('..') || fileName.startsWith('/')) {
    return res.status(400).json({ error: '잘못된 파일명입니다.' })
  }
  if (!isSupportedExtension(fileName)) return res.status(400).json({ error: '지원하는 확장자만 업데이트할 수 있습니다.' })
  const r = resolvePath(fileName)
  if (!r) return res.status(400).json({ error: '잘못된 경로입니다.' })
  try {
    const stats = await fs.stat(r.fullPath)
    if (!stats.isFile()) return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
  } catch (e) {
    if (e.code === 'ENOENT') return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    throw e
  }
  const now = new Date()
  await fs.utimes(r.fullPath, now, now)
  const updated = await fs.stat(r.fullPath)
  res.json({ success: true, message: '파일 수정일이 업데이트되었습니다.', fileName, updatedModifiedDate: updated.mtime.toISOString() })
}

// DELETE /api/docs/:fileName - 파일 영구 삭제 (단일 세그먼트 경로용, 레거시)
router.delete('/:fileName', async (req, res) => {
  try {
    let fileName = req.params.fileName
    try {
      fileName = decodeURIComponent(fileName)
    } catch {}

    if (!fileName || fileName.includes('..') || fileName.startsWith('/') || fileName.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일명입니다.' })
    }
    if (!isSupportedExtension(fileName)) {
      return res.status(400).json({ error: '지원하는 확장자의 파일만 삭제할 수 있습니다.' })
    }

    const r = resolvePath(fileName)
    if (!r) return res.status(400).json({ error: '잘못된 경로입니다.' })

    try {
      const stats = await fs.stat(r.fullPath)
      if (!stats.isFile()) return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    } catch (e) {
      if (e.code === 'ENOENT') return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
      throw e
    }

    await fs.unlink(r.fullPath)
    res.json({ success: true, message: '파일이 영구적으로 삭제되었습니다.', fileName })
  } catch (error) {
    console.error('[Docs Delete]', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/docs/:fileName - 파일명 변경 또는 파일 내용 쓰기
router.put('/:fileName', express.raw({ type: '*/*', limit: '10mb' }), express.json(), async (req, res) => {
  try {
    let fileName = req.params.fileName
    try {
      fileName = decodeURIComponent(fileName)
    } catch {}

    let newFileName = req.body?.newFileName
    let fileContent = typeof req.body === 'string' ? req.body : req.body?.content

    if (!fileName || fileName.includes('..') || fileName.startsWith('/') || fileName.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일명입니다.' })
    }

    const r = resolvePath(fileName)
    if (!r) return res.status(400).json({ error: '잘못된 경로입니다.' })

    if (newFileName) {
      // 파일명 변경
      if (newFileName.includes('..') || newFileName.startsWith('/') || newFileName.startsWith('\\')) {
        return res.status(400).json({ error: '잘못된 새 파일명입니다.' })
      }
      if (!isSupportedExtension(fileName) || !isSupportedExtension(newFileName)) {
        return res.status(400).json({ error: '지원하는 확장자만 사용 가능합니다.' })
      }

      const rNew = resolvePath(newFileName)
      if (!rNew) return res.status(400).json({ error: '잘못된 새 경로입니다.' })
      // 같은 폴더 내에서만 이동 허용
      const folderMatch = fileName.split('/')[0] === newFileName.split('/')[0]
      if (!folderMatch) {
        return res.status(400).json({ error: '다른 폴더로 이동할 수 없습니다.' })
      }

      try {
        const stats = await fs.stat(r.fullPath)
        if (!stats.isFile()) return res.status(404).json({ error: '기존 파일을 찾을 수 없습니다.' })
      } catch (e) {
        if (e.code === 'ENOENT') return res.status(404).json({ error: '기존 파일을 찾을 수 없습니다.' })
        throw e
      }

      const newDir = path.dirname(rNew.fullPath)
      await fs.mkdir(newDir, { recursive: true })
      await fs.rename(r.fullPath, rNew.fullPath)

      try {
        const now = new Date()
        await fs.utimes(rNew.fullPath, now, now)
      } catch {}

      return res.json({ success: true, message: '파일명이 변경되었습니다.', oldFileName: fileName, newFileName })
    }

    if (fileContent !== undefined) {
      // 파일 내용 쓰기
      if (!isSupportedExtension(fileName)) {
        return res.status(400).json({ error: '지원하는 확장자의 파일만 쓰기할 수 있습니다.' })
      }
      const dir = path.dirname(r.fullPath)
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(r.fullPath, fileContent, 'utf-8')
      return res.json({ success: true, message: '파일이 저장되었습니다.', fileName })
    }

    return res.status(400).json({ error: 'newFileName 또는 fileContent가 필요합니다.' })
  } catch (error) {
    console.error('[Docs PUT]', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/docs/metadata - 모든 문서 폴더의 파일 목록 및 메타데이터
router.get('/metadata', async (req, res) => {
  try {
    const folders = getDocsFolders()
    const allFiles = []

    for (const folder of folders) {
      const basePath = getDocsBasePathForFolder(folder.id)
      if (!basePath) continue
      try {
        await fs.access(basePath)
      } catch {
        continue
      }
      const files = await findFilesInDir(basePath, '', 0, folder, isSupportedExtension)
      allFiles.push(...files)
    }

    res.json({ success: true, files: allFiles })
  } catch (error) {
    console.error('[Docs Metadata]', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/docs/:fileName/touch - mtime 업데이트
router.post('/:fileName/touch', async (req, res) => {
  try {
    let fileName = req.params.fileName
    try {
      fileName = decodeURIComponent(fileName)
    } catch {}

    if (!fileName || fileName.includes('..') || fileName.startsWith('/') || fileName.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일명입니다.' })
    }
    if (!isSupportedExtension(fileName)) {
      return res.status(400).json({ error: '지원하는 확장자의 파일만 업데이트할 수 있습니다.' })
    }

    const r = resolvePath(fileName)
    if (!r) return res.status(400).json({ error: '잘못된 경로입니다.' })

    try {
      const stats = await fs.stat(r.fullPath)
      if (!stats.isFile()) return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    } catch (e) {
      if (e.code === 'ENOENT') return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
      throw e
    }

    const now = new Date()
    await fs.utimes(r.fullPath, now, now)
    const updated = await fs.stat(r.fullPath)

    res.json({
      success: true,
      message: '파일 수정일이 업데이트되었습니다.',
      fileName,
      updatedModifiedDate: updated.mtime.toISOString(),
    })
  } catch (error) {
    console.error('[Docs Touch]', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/docs - 새 파일 생성
router.post('/', express.raw({ type: '*/*', limit: '10mb' }), express.json(), async (req, res) => {
  try {
    let fileName = typeof req.body === 'string' ? req.query.fileName || req.headers['x-file-name'] : req.body?.fileName
    let fileContent = typeof req.body === 'string' ? req.body : req.body?.content

    if (Buffer.isBuffer(req.body)) {
      const contentType = req.headers['content-type'] || ''
      if (contentType.includes('application/json')) {
        const b = JSON.parse(req.body.toString())
        fileName = b.fileName
        fileContent = b.content
      } else {
        fileContent = req.body.toString()
        fileName = req.query.fileName || req.headers['x-file-name']
      }
    }

    if (!fileName) return res.status(400).json({ error: 'fileName이 필요합니다.' })
    if (fileName.includes('..') || fileName.startsWith('/') || fileName.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일명입니다.' })
    }
    if (!isSupportedExtension(fileName)) {
      return res.status(400).json({ error: '지원하는 확장자의 파일만 생성할 수 있습니다.' })
    }

    const r = resolvePath(fileName)
    if (!r) return res.status(400).json({ error: '잘못된 경로입니다. 폴더ID/상대경로 형식이어야 합니다.' })

    await fs.mkdir(path.dirname(r.fullPath), { recursive: true })

    try {
      await fs.stat(r.fullPath)
      return res.status(409).json({ error: '이미 동일한 이름의 파일이 존재합니다.' })
    } catch (e) {
      if (e.code !== 'ENOENT') throw e
    }

    await fs.writeFile(r.fullPath, fileContent || '', 'utf-8')
    res.json({ success: true, message: '파일이 생성되었습니다.', fileName })
  } catch (error) {
    console.error('[Docs Create]', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/docs/:fileName - 파일 내용 읽기
router.get('/:fileName', async (req, res) => {
  try {
    let fileName = req.params.fileName
    try {
      fileName = decodeURIComponent(fileName)
    } catch {}

    if (!fileName || fileName.includes('..') || fileName.startsWith('/') || fileName.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일명입니다.' })
    }
    if (!isSupportedExtension(fileName)) {
      return res.status(400).json({ error: '지원하는 확장자의 파일만 읽을 수 있습니다.' })
    }

    const r = resolvePath(fileName)
    if (!r) return res.status(400).json({ error: '잘못된 경로입니다.' })

    const content = await fs.readFile(r.fullPath, 'utf-8')
    const lower = fileName.toLowerCase()
    res.setHeader('Content-Type', lower.endsWith('.mermaid.css') ? 'text/css; charset=utf-8' : 'text/plain; charset=utf-8')
    res.send(content)
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
    console.error('[Docs Get]', error)
    res.status(500).json({ error: error.message })
  }
})

// ========== config: extensions ==========
router.post('/config/extensions', express.json(), async (req, res) => {
  try {
    const { extensions } = req.body
    if (!extensions || !Array.isArray(extensions) || extensions.length === 0) {
      return res.status(400).json({ error: '유효하지 않은 확장자 목록입니다.' })
    }
    setSupportedExtensions(extensions)
    res.json({ success: true, message: '지원 확장자 목록이 업데이트되었습니다.', extensions: getSupportedExtensions() })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/config/extensions', (req, res) => {
  res.json({ success: true, extensions: getSupportedExtensions() })
})

// ========== config: folders (다중 폴더 관리) ==========
router.get('/config/folders', (req, res) => {
  res.json({ success: true, folders: getDocsFolders() })
})

router.post('/config/folders', express.json(), async (req, res) => {
  try {
    const { id, label, pathPrefix } = req.body
    if (!id || !pathPrefix) {
      return res.status(400).json({ error: 'id와 pathPrefix가 필요합니다.' })
    }
    const ok = await addDocsFolder({ id, label, pathPrefix })
    if (!ok) return res.status(400).json({ error: '폴더 추가에 실패했습니다.' })
    res.json({ success: true, message: '폴더가 추가되었습니다.', folders: getDocsFolders() })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/config/folders/:folderId', async (req, res) => {
  try {
    const folderId = req.params.folderId
    const ok = await removeDocsFolder(folderId)
    if (!ok) return res.status(400).json({ error: '폴더 제거에 실패했습니다.' })
    res.json({ success: true, message: '폴더가 제거되었습니다.', folders: getDocsFolders() })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/config/folders/:folderId', express.json(), async (req, res) => {
  try {
    const folderId = req.params.folderId
    const { label, pathPrefix } = req.body || {}
    const ok = await updateDocsFolder(folderId, { label, pathPrefix })
    if (!ok) return res.status(400).json({ error: '폴더 수정에 실패했습니다.' })
    res.json({ success: true, message: '폴더가 수정되었습니다.', folders: getDocsFolders() })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 레거시: 단일 폴더명 (첫 번째 폴더의 pathPrefix 마지막 부분으로 해석)
router.get('/config/folder', (req, res) => {
  const folders = getDocsFolders()
  const first = folders[0]
  res.json({ success: true, folderName: first?.label ?? 'NEXA-Documentation' })
})

router.post('/config/folder', express.json(), (req, res) => {
  const folders = getDocsFolders()
  res.json({ success: true, folderName: folders[0]?.label ?? 'NEXA-Documentation' })
})

// 슬래시 포함 경로용 - /f/ 접두사 (와일드카드)
router.get(/^\/f\/(.+)$/, (req, res, next) => {
  req.params = { 0: req.params[0] }
  handleGetFile(req, res).catch(next)
})
router.put(/^\/f\/(.+)$/, express.raw({ type: '*/*', limit: '10mb' }), express.json(), (req, res, next) => {
  req.params = { 0: req.params[0] }
  handlePutFile(req, res).catch(next)
})
router.delete(/^\/f\/(.+)$/, (req, res, next) => {
  req.params = { 0: req.params[0] }
  handleDeleteFile(req, res).catch(next)
})
router.post(/^\/f\/(.+)\/touch$/, (req, res, next) => {
  req.params = { 0: req.params[0] }
  handleTouchFile(req, res).catch(next)
})

export default router

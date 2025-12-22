// 문서 파일 관리 API 라우트
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { isSupportedExtension, setSupportedExtensions, getSupportedExtensions, getDocsBasePath, setDocsFolderName, getDocsFolderName } from '../config/documentConfig.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// DELETE /api/docs/:relativePath - NEXA-Documentation 폴더의 파일 영구 삭제
// relativePath는 NEXA-Documentation 기준 상대 경로 (예: Platform/01-기획/문서.md)
// 지원 확장자만 삭제 가능 (설정에서 지정)
router.delete('/:fileName', async (req, res) => {
  try {
    // URL 파라미터 디코딩
    let fileName = req.params.fileName
    try {
      const decoded = decodeURIComponent(fileName)
      if (decoded !== fileName) {
        fileName = decoded
      }
    } catch {
      // 이미 디코딩된 경우 무시
    }

    // 파일명 검증 (보안: ../ 등 경로 순회 방지, 하지만 정상적인 하위 디렉토리는 허용)
    // 경로 순회 공격 방지: .. 사용 금지, 절대 경로 금지 (시작이 / 또는 \)
    if (!fileName || fileName.includes('..') || fileName.startsWith('/') || fileName.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일명입니다.' })
    }

    // 지원 확장자 확인
    if (!isSupportedExtension(fileName)) {
      return res.status(400).json({ error: '지원하는 확장자의 파일만 삭제할 수 있습니다.' })
    }

    // 파일 경로 생성 (설정된 문서 폴더 사용)
    const docsPath = path.join(getDocsBasePath(), fileName)

    // 파일 존재 확인
    try {
      const stats = await fs.stat(docsPath)
      if (!stats.isFile()) {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
      }
      throw error
    }

    // 파일 삭제
    await fs.unlink(docsPath)

    res.json({
      success: true,
      message: '파일이 영구적으로 삭제되었습니다.',
      fileName: fileName,
    })
  } catch (error) {
    console.error('[Docs Delete] 파일 삭제 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/docs/:relativePath - NEXA-Documentation 폴더의 파일명 변경 또는 파일 내용 쓰기
// relativePath는 NEXA-Documentation 기준 상대 경로 (예: Platform/01-기획/문서.md)
// 파일 내용 쓰기를 위해 express.raw 또는 express.json 미들웨어 필요
router.put('/:fileName', express.raw({ type: '*/*', limit: '10mb' }), express.json(), async (req, res) => {
  try {
    // Express는 이미 URL 파라미터를 디코딩하지만, 이중 인코딩된 경우를 위해 한 번 더 디코딩 시도
    let fileName = req.params.fileName
    // 이미 디코딩되었으면 그대로, 아니면 디코딩
    try {
      const decoded = decodeURIComponent(fileName)
      if (decoded !== fileName) {
        fileName = decoded
      }
    } catch {
      // 이미 디코딩된 경우 무시
    }

    // req.body 파싱 (JSON 또는 raw text)
    let newFileName
    let fileContent

    if (typeof req.body === 'string') {
      // raw text로 전송된 경우
      fileContent = req.body
    } else if (req.body && typeof req.body === 'object') {
      // JSON으로 전송된 경우
      newFileName = req.body.newFileName
      fileContent = req.body.content
    }

    // 파일명 검증 (보안: ../ 등 경로 순회 방지, 하지만 정상적인 하위 디렉토리는 허용)
    // 경로 순회 공격 방지: .. 사용 금지, 절대 경로 금지 (시작이 / 또는 \)
    if (!fileName || fileName.includes('..') || fileName.startsWith('/') || fileName.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일명입니다.' })
    }

    // newFileName이 있으면 파일명 변경, 없으면 파일 내용 쓰기
    if (newFileName) {
      // ===== 파일명 변경 모드 =====
      if (!newFileName || newFileName.includes('..') || newFileName.startsWith('/') || newFileName.startsWith('\\')) {
        return res.status(400).json({ error: '잘못된 새 파일명입니다.' })
      }

      // 지원 확장자 확인 (파일명 변경)
      if (!isSupportedExtension(fileName)) {
        return res.status(400).json({ error: '기존 파일은 지원하는 확장자여야 합니다.' })
      }

      if (!isSupportedExtension(newFileName)) {
        return res.status(400).json({ error: '새 파일명은 지원하는 확장자를 가져야 합니다.' })
      }

      // 파일 경로 생성 (하위 디렉토리 지원: Platform/01-기획/file.md -> 설정된 문서 폴더/Platform/01-기획/file.md)
      const oldPath = path.join(getDocsBasePath(), fileName)
      const newPath = path.join(getDocsBasePath(), newFileName)

      // 기존 파일 존재 확인
      try {
        const stats = await fs.stat(oldPath)
        if (!stats.isFile()) {
          return res.status(404).json({ error: '기존 파일을 찾을 수 없습니다.' })
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          // 디버깅: NEXA-Documentation 폴더의 파일 목록 출력 (재귀적 검색)
          try {
            const docsDir = getDocsBasePath()
            // 재귀적으로 모든 파일 찾기 (최대 깊이 10 제한)
            async function findFiles(dir, relativePath = '', depth = 0) {
              const MAX_DEPTH = 10
              if (depth > MAX_DEPTH) {
                console.warn(`[Docs Rename] 최대 깊이(${MAX_DEPTH}) 초과: ${dir}`)
                return []
              }
              const files = []
              const entries = await fs.readdir(dir, { withFileTypes: true })
              for (const entry of entries) {
                const fullPath = path.join(dir, entry.name)
                if (entry.isDirectory()) {
                  const subFiles = await findFiles(fullPath, path.join(relativePath, entry.name), depth + 1)
                  files.push(...subFiles)
                } else if (entry.isFile() && isSupportedExtension(entry.name)) {
                  const fileRelativePath = relativePath ? path.join(relativePath, entry.name).replace(/\\/g, '/') : entry.name
                  files.push(fileRelativePath)
                }
              }
              return files
            }
            const allFiles = await findFiles(docsDir)

            // 대소문자 무시하고 부분 일치 검색
            const lowerOldFileName = fileName.toLowerCase()
            const matchingFiles = allFiles.filter((f) => {
              const lowerF = f.toLowerCase()
              const fileNameOnly = f.split('/').pop().toLowerCase()
              return lowerF.includes(lowerOldFileName) || lowerOldFileName.includes(lowerF) || fileNameOnly === lowerOldFileName.split('/').pop()
            })
            if (matchingFiles.length > 0) {
              return res.status(404).json({
                error: `기존 파일을 찾을 수 없습니다. 유사한 파일: ${matchingFiles.join(', ')}`,
                similarFiles: matchingFiles,
              })
            }

            // 파일명의 일부만 검색 (대괄호 이후 부분)
            const fileNameOnly = fileName.split('/').pop()
            const fileNameParts = fileNameOnly
              .split(']')
              .map((p) => p.trim())
              .filter((p) => p.length > 0)
            if (fileNameParts.length > 1) {
              const partialMatches = allFiles.filter((f) => {
                const lowerF = f.toLowerCase()
                return fileNameParts.some((part) => lowerF.includes(part.toLowerCase()))
              })
              if (partialMatches.length > 0) {
                return res.status(404).json({
                  error: `기존 파일을 찾을 수 없습니다. 부분 일치 파일: ${partialMatches.join(', ')}`,
                  similarFiles: partialMatches,
                })
              }
            }
          } catch (dirError) {
            console.error('[Docs Rename] docs 폴더 읽기 실패:', dirError)
          }
          return res.status(404).json({ error: `기존 파일을 찾을 수 없습니다: "${fileName}"` })
        }
        throw error
      }

      // 새 파일명의 디렉토리 경로 추출
      const newFilePathParts = newFileName.split('/')
      const newFileDirectory = newFilePathParts.length > 1 ? newFilePathParts.slice(0, -1).join('/') : ''
      const newFileDirectoryPath = newFileDirectory ? path.join(getDocsBasePath(), newFileDirectory) : null

      // 새 파일 디렉토리가 있고 존재하지 않으면 생성
      if (newFileDirectoryPath) {
        try {
          await fs.mkdir(newFileDirectoryPath, { recursive: true })
        } catch (dirError) {
          if (dirError.code !== 'EEXIST') {
            console.error('[Docs Rename] 디렉토리 생성 실패:', dirError)
            throw dirError
          }
        }
      }

      // 새 파일명 중복 확인
      try {
        await fs.stat(newPath)
        return res.status(409).json({ error: '이미 동일한 이름의 파일이 존재합니다.' })
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error
        }
        // ENOENT는 파일이 없음을 의미하므로 정상 (중복 없음)
      }

      // 파일명 변경
      await fs.rename(oldPath, newPath)

      // 파일명 변경도 수정일 정렬에 반영되도록 수정일을 현재 시간으로 업데이트
      try {
        const now = new Date()
        await fs.utimes(newPath, now, now) // atime과 mtime을 현재 시간으로 설정
      } catch (utimesError) {
        // utimes 실패해도 파일명 변경은 성공했으므로 경고만 출력
        console.warn('[Docs Rename] 수정일 업데이트 실패 (파일명 변경은 성공):', utimesError)
      }

      return res.json({
        success: true,
        message: '파일명이 변경되었습니다.',
        oldFileName: fileName,
        newFileName: newFileName,
      })
    } else if (fileContent !== undefined) {
      // ===== 파일 내용 쓰기 모드 =====
      const lowerFileName = fileName.toLowerCase()

      // 머메이드 스타일 설정 파일 저장 ************************
      // 지원 확장자 확인
      if (!isSupportedExtension(fileName)) {
        return res.status(400).json({ error: '지원하는 확장자의 파일만 쓰기할 수 있습니다.' })
      }

      // 파일 경로 생성
      const filePath = path.join(getDocsBasePath(), fileName)

      // 디렉토리 경로 추출 및 생성
      const filePathParts = fileName.split('/')
      if (filePathParts.length > 1) {
        const fileDirectory = filePathParts.slice(0, -1).join('/')
        const fileDirectoryPath = path.join(getDocsBasePath(), fileDirectory)
        try {
          await fs.mkdir(fileDirectoryPath, { recursive: true })
        } catch (dirError) {
          if (dirError.code !== 'EEXIST') {
            console.error('[Docs Write] 디렉토리 생성 실패:', dirError)
            throw dirError
          }
        }
      }

      // 파일 내용 쓰기
      await fs.writeFile(filePath, fileContent, 'utf-8')

      return res.json({
        success: true,
        message: '파일이 저장되었습니다.',
        fileName: fileName,
      })
    } else {
      return res.status(400).json({ error: 'newFileName 또는 fileContent가 필요합니다.' })
    }
  } catch (error) {
    console.error('[Docs PUT] 처리 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/docs/metadata - NEXA-Documentation 폴더의 모든 마크다운 파일 목록과 메타데이터 반환
router.get('/metadata', async (req, res) => {
  try {
    const docsPath = getDocsBasePath()

    // 재귀적으로 모든 지원 확장자 파일 찾기 (최대 깊이 10 제한)
    // 주의사항:
    // - 빈 폴더는 자동으로 무시됩니다 (하위 파일이 없으면 빈 배열 반환)
    // - 확장자 제한: 지원 확장자를 가진 파일만 검색 대상입니다 (설정에서 지정, 기본값: .md, .mermaid.css)
    async function findFiles(dir, relativePath = '', depth = 0) {
      const MAX_DEPTH = 10
      if (depth > MAX_DEPTH) {
        console.warn(`[Docs Metadata] 최대 깊이(${MAX_DEPTH}) 초과: ${dir}`)
        return []
      }
      const files = []
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            // 디렉토리인 경우 재귀적으로 하위 파일 검색 (빈 폴더는 자동으로 제외됨)
            const subFiles = await findFiles(fullPath, path.join(relativePath, entry.name), depth + 1)
            files.push(...subFiles)
          } else if (entry.isFile() && isSupportedExtension(entry.name)) {
            // 지원 확장자를 가진 파일만 처리 (다른 확장자 파일은 제외)
            const fileRelativePath = relativePath ? path.join(relativePath, entry.name).replace(/\\/g, '/') : entry.name
            const fileFullPath = fullPath // 이미 fullPath가 올바른 전체 경로
            try {
              const stats = await fs.stat(fileFullPath)
              files.push({
                fileName: entry.name,
                relativePath: fileRelativePath,
                modifiedDate: stats.mtime.toISOString(), // 수정일 (mtime)
                createdDate: stats.birthtime ? stats.birthtime.toISOString() : stats.ctime.toISOString(), // 생성일 (birthtime이 없으면 ctime)
              })
            } catch (statError) {
              console.error(`[Docs Metadata] 파일 메타데이터 읽기 실패: ${fileFullPath}`, statError)
              // 메타데이터를 읽을 수 없어도 파일 목록에는 포함
              files.push({
                fileName: entry.name,
                relativePath: fileRelativePath,
                modifiedDate: null,
                createdDate: null,
              })
            }
          }
        }
      } catch (readdirError) {
        console.error(`[Docs Metadata] 디렉토리 읽기 실패: ${dir}`, readdirError)
      }
      return files
    }

    const files = await findFiles(docsPath)

    res.json({
      success: true,
      files: files,
    })
  } catch (error) {
    console.error('[Docs Metadata] 메타데이터 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/docs/:relativePath/touch - NEXA-Documentation 폴더의 파일 mtime을 현재 시간으로 업데이트
// relativePath는 NEXA-Documentation 기준 상대 경로 (예: Platform/01-기획/문서.md)
router.post('/:fileName/touch', async (req, res) => {
  try {
    // URL 파라미터 디코딩
    let fileName = req.params.fileName
    try {
      const decoded = decodeURIComponent(fileName)
      if (decoded !== fileName) {
        fileName = decoded
      }
    } catch {
      // 이미 디코딩된 경우 무시
    }

    // 파일명 검증 (보안: ../ 등 경로 순회 방지, 하지만 정상적인 하위 디렉토리는 허용)
    if (!fileName || fileName.includes('..') || fileName.startsWith('/') || fileName.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일명입니다.' })
    }

    // 지원 확장자 확인
    if (!isSupportedExtension(fileName)) {
      return res.status(400).json({ error: '지원하는 확장자의 파일만 업데이트할 수 있습니다.' })
    }

    // 파일 경로 생성 (하위 디렉토리 지원)
    const filePath = path.join(getDocsBasePath(), fileName)

    // 파일 존재 확인
    try {
      const stats = await fs.stat(filePath)
      if (!stats.isFile()) {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
      }
      throw error
    }

    // 파일의 mtime을 현재 시간으로 업데이트
    try {
      const now = new Date()
      await fs.utimes(filePath, now, now) // atime과 mtime을 현재 시간으로 설정

      // 업데이트된 mtime 확인
      const updatedStats = await fs.stat(filePath)

      res.json({
        success: true,
        message: '파일 수정일이 업데이트되었습니다.',
        fileName: fileName,
        updatedModifiedDate: updatedStats.mtime.toISOString(),
      })
    } catch (utimesError) {
      console.error('[Docs Touch] mtime 업데이트 실패:', utimesError)
      res.status(500).json({ error: '파일 수정일 업데이트 실패: ' + utimesError.message })
    }
  } catch (error) {
    console.error('[Docs Touch] 파일 수정일 업데이트 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/docs - NEXA-Documentation 폴더에 새 파일 생성
router.post('/', express.raw({ type: '*/*', limit: '10mb' }), express.json(), async (req, res) => {
  try {
    let fileName
    let fileContent

    // req.body 파싱 (JSON 또는 raw text)
    // express.json()이 먼저 처리하므로, 이미 파싱된 객체이거나 Buffer일 수 있음
    if (typeof req.body === 'string') {
      // raw text로 전송된 경우 (Buffer.toString() 결과)
      fileContent = req.body
      fileName = req.query.fileName || req.headers['x-file-name']
    } else if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      // JSON으로 전송된 경우 (express.json()이 파싱)
      fileName = req.body.fileName
      fileContent = req.body.content
    } else if (Buffer.isBuffer(req.body)) {
      // Buffer인 경우 (express.raw()가 처리)
      const contentType = req.headers['content-type'] || ''
      if (contentType.includes('application/json')) {
        const body = JSON.parse(req.body.toString())
        fileName = body.fileName
        fileContent = body.content
      } else {
        fileContent = req.body.toString()
        fileName = req.query.fileName || req.headers['x-file-name']
      }
    } else {
      return res.status(400).json({ error: '요청 본문을 파싱할 수 없습니다.' })
    }

    if (!fileName) {
      return res.status(400).json({ error: 'fileName이 필요합니다.' })
    }

    // 파일명 검증
    if (fileName.includes('..') || fileName.startsWith('/') || fileName.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일명입니다.' })
    }

    const lowerFileName = fileName.toLowerCase()

    // 지원 확장자 확인
    if (!isSupportedExtension(fileName)) {
      return res.status(400).json({ error: '지원하는 확장자의 파일만 생성할 수 있습니다.' })
    }

    // 파일 경로 생성
    const filePath = path.join(getDocsBasePath(), fileName)

    // 디렉토리 경로 추출 및 생성
    const filePathParts = fileName.split('/')
    if (filePathParts.length > 1) {
      const fileDirectory = filePathParts.slice(0, -1).join('/')
      const fileDirectoryPath = path.join(getDocsBasePath(), fileDirectory)
      try {
        await fs.mkdir(fileDirectoryPath, { recursive: true })
      } catch (dirError) {
        if (dirError.code !== 'EEXIST') {
          console.error('[Docs Create] 디렉토리 생성 실패:', dirError)
          throw dirError
        }
      }
    }

    // 파일이 이미 존재하는지 확인
    try {
      await fs.stat(filePath)
      return res.status(409).json({ error: '이미 동일한 이름의 파일이 존재합니다. PUT을 사용하여 업데이트하세요.' })
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
      // ENOENT는 파일이 없음을 의미하므로 정상 (새 파일 생성 가능)
    }

    // 파일 생성
    await fs.writeFile(filePath, fileContent || '', 'utf-8')

    res.json({
      success: true,
      message: '파일이 생성되었습니다.',
      fileName: fileName,
    })
  } catch (error) {
    console.error('[Docs Create] 파일 생성 실패:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      error: error,
    })
    res.status(500).json({ error: error.message || '파일 생성 중 알 수 없는 오류가 발생했습니다.' })
  }
})

// GET /api/docs/:relativePath - NEXA-Documentation 폴더의 파일 내용 읽기
// relativePath는 NEXA-Documentation 기준 상대 경로 (예: Platform/01-기획/문서.md)
// 지원 파일 형식: .md (마크다운), .mermaid.css (Mermaid 스타일)
router.get('/:fileName', async (req, res) => {
  try {
    // URL 파라미터 디코딩
    let fileName = req.params.fileName
    try {
      const decoded = decodeURIComponent(fileName)
      if (decoded !== fileName) {
        fileName = decoded
      }
    } catch {
      // 이미 디코딩된 경우 무시
    }

    // 파일명 검증 (보안: ../ 등 경로 순회 방지, 하지만 정상적인 하위 디렉토리는 허용)
    if (!fileName || fileName.includes('..') || fileName.startsWith('/') || fileName.startsWith('\\')) {
      return res.status(400).json({ error: '잘못된 파일명입니다.' })
    }

    // 지원 확장자 확인
    if (!isSupportedExtension(fileName)) {
      return res.status(400).json({ error: '지원하는 확장자의 파일만 읽을 수 있습니다.' })
    }

    const lowerFileName = fileName.toLowerCase()

    // 파일 경로 생성 (설정된 문서 폴더 사용)
    const docsPath = path.join(getDocsBasePath(), fileName)

    // 파일 읽기
    try {
      const fileContent = await fs.readFile(docsPath, 'utf-8')
      // 파일 타입에 따라 Content-Type 설정
      if (lowerFileName.endsWith('.mermaid.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8')
      } else {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      }
      res.send(fileContent)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다.' })
      }
      throw error
    }
  } catch (error) {
    console.error('[Docs Get] 파일 읽기 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/docs/config/extensions - 지원 확장자 목록 설정
// 백엔드는 기본 확장자 사용 (추후 API 연동 가능)
// 프론트엔드에서 설정한 확장자 목록을 백엔드에 동기화
router.post('/config/extensions', express.json(), async (req, res) => {
  try {
    const { extensions } = req.body

    if (!extensions || !Array.isArray(extensions) || extensions.length === 0) {
      return res.status(400).json({ error: '유효하지 않은 확장자 목록입니다.' })
    }

    // 확장자 목록 설정
    setSupportedExtensions(extensions)

    console.log('[Docs Config] 지원 확장자 목록 업데이트:', getSupportedExtensions())

    res.json({
      success: true,
      message: '지원 확장자 목록이 업데이트되었습니다.',
      extensions: getSupportedExtensions(),
    })
  } catch (error) {
    console.error('[Docs Config] 확장자 목록 설정 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/docs/config/extensions - 현재 지원 확장자 목록 조회
router.get('/config/extensions', async (req, res) => {
  try {
    res.json({
      success: true,
      extensions: getSupportedExtensions(),
    })
  } catch (error) {
    console.error('[Docs Config] 확장자 목록 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/docs/config/folder - 문서 폴더명 설정
router.post('/config/folder', express.json(), (req, res) => {
  try {
    const { folderName } = req.body
    if (!folderName || typeof folderName !== 'string') {
      return res.status(400).json({ error: '유효하지 않은 폴더명입니다.' })
    }
    setDocsFolderName(folderName)
    console.log('[Docs Config] 문서 폴더명 업데이트:', getDocsFolderName())
    res.json({
      success: true,
      message: '문서 폴더명이 업데이트되었습니다.',
      folderName: getDocsFolderName(),
    })
  } catch (error) {
    console.error('[Docs Config] 폴더명 설정 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/docs/config/folder - 현재 문서 폴더명 조회
router.get('/config/folder', (req, res) => {
  try {
    res.json({
      success: true,
      folderName: getDocsFolderName(),
    })
  } catch (error) {
    console.error('[Docs Config] 폴더명 조회 실패:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

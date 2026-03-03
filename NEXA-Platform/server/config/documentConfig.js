/**
 * 문서 관리 시스템 설정 (백엔드)
 *
 * - 다중 문서 폴더 지원: NEXA-Documentation, NEXA-Platform/docs 등
 * - 폴더 추가/제거 가능 (런타임 + 설정 파일 영속화)
 * - 지원 확장자: POST /api/docs/config/extensions 로 동기화
 *
 * 경로 규칙: API에서 사용하는 경로는 `{folderId}/{relativePath}` 형식
 * 예: nexa-docs/Platform/01-기획/문서.md, platform-docs/기획서.md
 */

import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FOLDERS_CONFIG_PATH = path.join(__dirname, 'docsFolders.json')

// 기본 문서 폴더 (최초 실행 시 사용)
const DEFAULT_DOCS_FOLDERS = [
  { id: 'nexa-docs', label: 'NEXA-Documentation', pathPrefix: '../../../NEXA-Documentation', displayPathPrefix: 'NEXA-Documentation' },
  { id: 'platform-docs', label: 'Platform docs', pathPrefix: '../../docs', displayPathPrefix: 'NEXA-Platform/docs' },
]

// 기본 지원 확장자 목록 (점 포함)
const DEFAULT_SUPPORTED_EXTENSIONS = ['.md', '.mermaid.css']

// 지원 확장자 목록 (런타임에 업데이트 가능)
let supportedExtensions = [...DEFAULT_SUPPORTED_EXTENSIONS]

// 문서 폴더 목록 (런타임에 업데이트 가능, 설정 파일로 영속화)
let docsFolders = []

/**
 * 설정 파일에서 폴더 목록 로드
 */
async function loadFoldersFromFile() {
  try {
    const data = await fs.readFile(FOLDERS_CONFIG_PATH, 'utf-8')
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed) && parsed.length > 0) {
      docsFolders = parsed
      return
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn('[DocumentConfig] docsFolders.json 로드 실패, 기본값 사용:', err.message)
    }
  }
  docsFolders = [...DEFAULT_DOCS_FOLDERS]
}

/**
 * 설정 파일에 폴더 목록 저장
 */
async function saveFoldersToFile() {
  try {
    await fs.writeFile(FOLDERS_CONFIG_PATH, JSON.stringify(docsFolders, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[DocumentConfig] docsFolders.json 저장 실패:', err.message)
  }
}

/**
 * 폴더 목록 초기화 (서버 시작 시 호출)
 */
export async function initDocsFolders() {
  await loadFoldersFromFile()
}

/**
 * 폴더 ID가 유효한지 확인 (영문/숫자/하이픈만 허용)
 */
function isValidFolderId(id) {
  return typeof id === 'string' && /^[a-z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 64
}

/**
 * 경로 접두사 검증 (절대 경로·위험 문자 제거)
 * 상대 경로(.. 포함)는 허용
 */
function sanitizePathPrefix(prefix) {
  if (!prefix || typeof prefix !== 'string') return ''
  const trimmed = prefix.trim()
  // 절대 경로 금지 (/, \, C: 등)
  if (/^[\/\\]|^\w:/.test(trimmed)) return ''
  return trimmed
}

// ============================================
// 지원 확장자
// ============================================

export function setSupportedExtensions(extensions) {
  if (!Array.isArray(extensions) || extensions.length === 0) {
    console.warn('[DocumentConfig] 유효하지 않은 확장자 목록, 기본값 사용')
    supportedExtensions = [...DEFAULT_SUPPORTED_EXTENSIONS]
    return
  }
  supportedExtensions = extensions.map((ext) => {
    if (!ext.startsWith('.')) return '.' + ext
    return ext.toLowerCase()
  })
}

export function getSupportedExtensions() {
  return [...supportedExtensions]
}

export function isSupportedExtension(fileName) {
  if (!fileName || typeof fileName !== 'string') return false
  const lower = fileName.toLowerCase()
  return supportedExtensions.some((ext) => lower.endsWith(ext))
}

export function getFileExtension(fileName) {
  if (!fileName || typeof fileName !== 'string') return null
  const lower = fileName.toLowerCase()
  for (const ext of supportedExtensions) {
    if (lower.endsWith(ext)) return ext
  }
  return null
}

export function removeExtension(fileName) {
  if (!fileName || typeof fileName !== 'string') return ''
  const lower = fileName.toLowerCase()
  for (const ext of supportedExtensions) {
    if (lower.endsWith(ext)) return fileName.slice(0, -ext.length)
  }
  return fileName
}

// ============================================
// 문서 폴더 (다중)
// ============================================

/**
 * 문서 폴더 목록 조회
 * @returns {Array<{id: string, label: string, pathPrefix: string}>}
 */
export function getDocsFolders() {
  if (docsFolders.length === 0) {
    return [...DEFAULT_DOCS_FOLDERS]
  }
  return [...docsFolders]
}

/**
 * 폴더 ID로 절대 경로 조회
 * @param {string} folderId
 * @returns {string|null} 절대 경로 또는 null
 */
export function getDocsBasePathForFolder(folderId) {
  const list = docsFolders.length > 0 ? docsFolders : DEFAULT_DOCS_FOLDERS
  const folder = list.find((f) => f.id === folderId)
  if (!folder || !folder.pathPrefix) return null
  return path.resolve(__dirname, folder.pathPrefix)
}

/**
 * 접두사 경로를 실제 파일 시스템 경로로 변환
 * @param {string} prefixedPath - 예: "nexa-docs/Platform/01-기획/문서.md" 또는 "Platform/01-기획/문서.md"(레거시)
 * @returns {{ basePath: string, relativePath: string, folderId: string } | null}
 */
export function resolvePrefixedPath(prefixedPath) {
  const list = docsFolders.length > 0 ? docsFolders : DEFAULT_DOCS_FOLDERS
  if (!prefixedPath || typeof prefixedPath !== 'string') return null

  const parts = prefixedPath.split('/').filter(Boolean)
  if (parts.length === 0) return null

  const first = parts[0]
  const folder = list.find((f) => f.id === first)

  let folderId, relativePath
  if (folder) {
    folderId = folder.id
    relativePath = parts.slice(1).join('/')
  } else {
    // 레거시: 접두사 없으면 첫 번째 폴더로 처리
    folderId = list[0].id
    relativePath = prefixedPath
  }

  const basePath = getDocsBasePathForFolder(folderId)
  if (!basePath) return null

  return { basePath, relativePath, folderId }
}

/**
 * 폴더 추가
 * @param {object} entry - { id, label, pathPrefix, displayPathPrefix? }
 * @returns {boolean} 성공 여부
 */
export async function addDocsFolder(entry) {
  if (!entry || typeof entry !== 'object') return false
  const { id, label, pathPrefix, displayPathPrefix } = entry
  if (!isValidFolderId(id)) {
    console.warn('[DocumentConfig] 유효하지 않은 폴더 ID:', id)
    return false
  }
  const list = docsFolders.length > 0 ? docsFolders : DEFAULT_DOCS_FOLDERS
  if (list.some((f) => f.id === id)) {
    console.warn('[DocumentConfig] 이미 존재하는 폴더 ID:', id)
    return false
  }
  const sanitized = sanitizePathPrefix(pathPrefix)
  if (!sanitized) {
    console.warn('[DocumentConfig] 유효하지 않은 경로 접두사')
    return false
  }

  const newFolder = { id, label: label || id, pathPrefix: sanitized }
  if (displayPathPrefix && typeof displayPathPrefix === 'string' && displayPathPrefix.trim()) {
    newFolder.displayPathPrefix = displayPathPrefix.trim()
  }
  if (docsFolders.length === 0) {
    docsFolders = [...DEFAULT_DOCS_FOLDERS]
  }
  docsFolders.push(newFolder)
  await saveFoldersToFile()
  return true
}

/**
 * 폴더 제거
 * @param {string} folderId
 * @returns {boolean} 성공 여부
 */
export async function removeDocsFolder(folderId) {
  if (!isValidFolderId(folderId)) return false
  const list = docsFolders.length > 0 ? docsFolders : DEFAULT_DOCS_FOLDERS
  if (list.length <= 1) {
    console.warn('[DocumentConfig] 최소 1개의 폴더는 유지해야 합니다.')
    return false
  }
  const idx = docsFolders.findIndex((f) => f.id === folderId)
  if (idx === -1) return false
  docsFolders.splice(idx, 1)
  await saveFoldersToFile()
  return true
}

/**
 * 폴더 수정
 * @param {string} folderId
 * @param {object} updates - { label?, pathPrefix? }
 * @returns {boolean} 성공 여부
 */
export async function updateDocsFolder(folderId, updates) {
  if (!isValidFolderId(folderId) || !updates || typeof updates !== 'object') return false
  const list = docsFolders.length > 0 ? docsFolders : DEFAULT_DOCS_FOLDERS
  const folder = list.find((f) => f.id === folderId)
  if (!folder) return false

  if (updates.label !== undefined) {
    folder.label = String(updates.label).trim() || folder.label
  }
  if (updates.pathPrefix !== undefined) {
    const sanitized = sanitizePathPrefix(updates.pathPrefix)
    if (sanitized) folder.pathPrefix = sanitized
  }
  await saveFoldersToFile()
  return true
}

// ============================================
// 하위 호환: 단일 폴더 API (첫 번째 폴더 사용)
// ============================================

/** @deprecated use getDocsFolders / resolvePrefixedPath */
export function getDocsBasePath() {
  const list = docsFolders.length > 0 ? docsFolders : DEFAULT_DOCS_FOLDERS
  const folder = list[0]
  return folder ? path.resolve(__dirname, folder.pathPrefix) : path.resolve(__dirname, DEFAULT_DOCS_FOLDERS[0].pathPrefix)
}

/** @deprecated use getDocsFolders */
export function getDocsFolderName() {
  const list = docsFolders.length > 0 ? docsFolders : DEFAULT_DOCS_FOLDERS
  return list[0]?.label ?? 'NEXA-Documentation'
}

/** @deprecated use addDocsFolder / removeDocsFolder */
export function setDocsFolderName(folderName) {
  // 단일 폴더명 변경은 첫 번째 폴더의 pathPrefix 마지막 부분으로 해석
  if (!folderName || typeof folderName !== 'string') return
  const sanitized = folderName.replace(/\.\./g, '').replace(/[\/\\]/g, '').trim()
  if (!sanitized) return
  const list = docsFolders.length > 0 ? docsFolders : DEFAULT_DOCS_FOLDERS
  const first = list[0]
  if (first) {
    const parent = path.dirname(first.pathPrefix)
    first.pathPrefix = parent ? `${parent}/${sanitized}` : sanitized
    saveFoldersToFile()
  }
}

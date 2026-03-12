/**
 * 문서 관리 시스템 설정 (프론트엔드)
 *
 * 사용자가 DocumentSettingsModal에서 설정한 확장자 목록을 저장하고 로드합니다.
 * localStorage에 저장되며, 백엔드와 동기화됩니다.
 */

// localStorage 키
const STORAGE_KEY = 'dev-document-extensions'

// 기본 지원 확장자 목록 (점 포함)
const DEFAULT_SUPPORTED_EXTENSIONS = ['.md', '.mermaid.css']

/**
 * 지원 확장자 목록 저장
 * @param {string[]} extensions - 확장자 목록 (점 포함, 예: ['.md', '.txt'])
 */
export function saveSupportedExtensions(extensions: string[]): void {
  try {
    if (!Array.isArray(extensions) || extensions.length === 0) {
      console.warn('[DocumentConfig] 유효하지 않은 확장자 목록, 저장하지 않음')
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extensions))
  } catch (error) {
    console.error('[DocumentConfig] 확장자 목록 저장 실패:', error)
  }
}

/**
 * 지원 확장자 목록 불러오기
 * @returns {string[]} 확장자 목록 (점 포함)
 */
export function loadSupportedExtensions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((ext) => {
          // 점이 없으면 추가
          if (!ext.startsWith('.')) {
            return '.' + ext
          }
          return ext.toLowerCase()
        })
      }
    }
  } catch (error) {
    console.error('[DocumentConfig] 확장자 목록 불러오기 실패:', error)
  }
  return [...DEFAULT_SUPPORTED_EXTENSIONS]
}

/**
 * 파일명이 지원되는 확장자인지 확인
 * @param {string} fileName - 파일명
 * @returns {boolean} 지원 여부
 */
export function isSupportedExtension(fileName: string): boolean {
  if (!fileName || typeof fileName !== 'string') {
    return false
  }
  const extensions = loadSupportedExtensions()
  const lowerFileName = fileName.toLowerCase()
  return extensions.some((ext) => lowerFileName.endsWith(ext))
}

/**
 * 파일의 확장자 추출
 * @param {string} fileName - 파일명
 * @returns {string|null} 확장자 (점 포함) 또는 null
 */
export function getFileExtension(fileName: string): string | null {
  if (!fileName || typeof fileName !== 'string') {
    return null
  }
  const extensions = loadSupportedExtensions()
  const lowerFileName = fileName.toLowerCase()
  for (const ext of extensions) {
    if (lowerFileName.endsWith(ext)) {
      return ext
    }
  }
  return null
}

/**
 * 파일명에서 확장자 제거
 * @param {string} fileName - 파일명
 * @returns {string} 확장자 제거된 파일명
 */
export function removeExtension(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return ''
  }
  const extensions = loadSupportedExtensions()
  const lowerFileName = fileName.toLowerCase()
  for (const ext of extensions) {
    if (lowerFileName.endsWith(ext)) {
      return fileName.slice(0, -ext.length)
    }
  }
  return fileName
}

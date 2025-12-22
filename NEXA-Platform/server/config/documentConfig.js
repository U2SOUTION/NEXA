/**
 * 문서 관리 시스템 설정 (백엔드)
 *
 * 백엔드는 기본 확장자 목록을 사용합니다.
 * 프론트엔드에서 POST /api/docs/config/extensions API를 통해 런타임에 업데이트 가능합니다.
 *
 * 기본 확장자: ['.md', '.mermaid.css']
 * API 연동: POST /api/docs/config/extensions (프론트엔드 설정 동기화용)
 */

// 기본 지원 확장자 목록 (점 포함)
const DEFAULT_SUPPORTED_EXTENSIONS = ['.md', '.mermaid.css']

// 지원 확장자 목록 (런타임에 업데이트 가능)
let supportedExtensions = [...DEFAULT_SUPPORTED_EXTENSIONS]

/**
 * 지원 확장자 목록 설정
 * @param {string[]} extensions - 확장자 목록 (점 포함, 예: ['.md', '.txt'])
 */
export function setSupportedExtensions(extensions) {
  if (!Array.isArray(extensions) || extensions.length === 0) {
    console.warn('[DocumentConfig] 유효하지 않은 확장자 목록, 기본값 사용')
    supportedExtensions = [...DEFAULT_SUPPORTED_EXTENSIONS]
    return
  }
  supportedExtensions = extensions.map((ext) => {
    // 점이 없으면 추가
    if (!ext.startsWith('.')) {
      return '.' + ext
    }
    return ext.toLowerCase()
  })
}

/**
 * 지원 확장자 목록 가져오기
 * @returns {string[]} 확장자 목록 (점 포함)
 */
export function getSupportedExtensions() {
  return [...supportedExtensions]
}

/**
 * 파일명이 지원되는 확장자인지 확인
 * @param {string} fileName - 파일명
 * @returns {boolean} 지원 여부
 */
export function isSupportedExtension(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return false
  }
  const lowerFileName = fileName.toLowerCase()
  return supportedExtensions.some((ext) => lowerFileName.endsWith(ext))
}

/**
 * 파일의 확장자 추출
 * @param {string} fileName - 파일명
 * @returns {string|null} 확장자 (점 포함) 또는 null
 */
export function getFileExtension(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return null
  }
  const lowerFileName = fileName.toLowerCase()
  for (const ext of supportedExtensions) {
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
export function removeExtension(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return ''
  }
  const lowerFileName = fileName.toLowerCase()
  for (const ext of supportedExtensions) {
    if (lowerFileName.endsWith(ext)) {
      return fileName.slice(0, -ext.length)
    }
  }
  return fileName
}

/**
 * 경로 카테고리 분류 함수
 * 폴더 구조 기반 동적 카테고리 분류 (하드코딩 제거)
 */
import { loadSupportedExtensions } from 'src/config/documentConfig.js'

/**
 * 경로를 레벨별로 분리
 * @param {string} relativePath - 상대 경로 (예: Platform/01-기획/문서.md)
 * @returns {Object} 레벨별 디렉토리 정보
 */
export function getDirectoryLevels(relativePath) {
  if (!relativePath) {
    return { level1: null, level2: null, level3: null }
  }

  // 경로 정규화: /docs/ 접두사 제거 (안전장치, 현재는 path가 relativePath와 동일하므로 불필요하지만 호환성 유지)
  // 백슬래시를 슬래시로 변환
  let cleanPath = relativePath.replace(/^\/?docs\//, '').replace(/\\/g, '/')

  // 경로를 슬래시로 분리하고 빈 문자열 제거
  const pathParts = cleanPath.split('/').filter((part) => part && part.trim() !== '')

  // 파일명 제거 (마지막 요소가 지원 확장자로 끝나면 제거)
  const supportedExtensions = loadSupportedExtensions()
  const filteredParts = pathParts.filter((part, index) => {
    // 마지막 요소이고 지원 확장자로 끝나면 파일명이므로 제외
    if (index === pathParts.length - 1) {
      const lowerPart = part.toLowerCase()
      const isFile = supportedExtensions.some((ext) => lowerPart.endsWith(ext))
      if (isFile) {
        return false
      }
    }
    return true
  })

  return {
    level1: filteredParts[0] || null,
    level2: filteredParts[1] || null,
    level3: filteredParts[2] || null,
  }
}

/**
 * 1레벨 디렉토리 반환 (메인 카테고리)
 * @param {string} relativePath - 상대 경로
 * @returns {string|null} 1레벨 디렉토리명
 */
export function getMainCategory(relativePath) {
  const levels = getDirectoryLevels(relativePath)
  return levels.level1
}

/**
 * 숫자 접두사 제거 및 가독성 변환
 * @param {string} folderName - 폴더명 (예: 01-기획)
 * @returns {string} 변환된 폴더명 (예: 기획)
 */
function cleanFolderName(folderName) {
  if (!folderName) return ''
  // 숫자 접두사 제거 (01-기획 -> 기획)
  return folderName.replace(/^\d+-/, '').replace(/_/g, ' ').replace(/-/g, ' ')
}

/**
 * 파일 카테고리 분류 (그룹 레벨에 따라)
 * @param {Object} file - 파일 객체 (relativePath 포함)
 * @param {number} groupLevel - 그룹 레벨 (1, 2, 3)
 * @returns {string} 카테고리명
 */
export function getFileCategory(file, groupLevel = 1) {
  // relativePath 우선 사용, 없으면 path에서 추출
  const relativePath = file.relativePath || file.path || ''

  const levels = getDirectoryLevels(relativePath)

  // groupLevel에 따라 카테고리 반환
  if (groupLevel === 1) {
    // 1레벨만 반환
    return levels.level1 || '기타'
  } else if (groupLevel === 2) {
    // 2레벨까지 반환
    if (levels.level1 && levels.level2) {
      const cleanedLevel2 = cleanFolderName(levels.level2)
      return `${levels.level1} - ${cleanedLevel2}`
    } else if (levels.level1) {
      return levels.level1
    }
    return '기타'
  } else if (groupLevel === 3) {
    // 3레벨까지 반환
    if (levels.level1 && levels.level2 && levels.level3) {
      const cleanedLevel2 = cleanFolderName(levels.level2)
      const cleanedLevel3 = cleanFolderName(levels.level3)
      return `${levels.level1} - ${cleanedLevel2} - ${cleanedLevel3}`
    } else if (levels.level1 && levels.level2) {
      const cleanedLevel2 = cleanFolderName(levels.level2)
      return `${levels.level1} - ${cleanedLevel2}`
    } else if (levels.level1) {
      return levels.level1
    }
    return '기타'
  }

  // 기본값: 1레벨
  return levels.level1 || '기타'
}

/**
 * 컴포넌트 경로에서 카테고리 추출
 * @param {string} componentPath - 컴포넌트 경로 (예: 'src/charts/NexaChart.vue' 또는 'src/guides/styles/charts/bar/NexaChartBar.vue')
 * @returns {string|null} 카테고리명
 */
export function getComponentCategory(componentPath) {
  if (!componentPath) return null

  // 경로를 슬래시로 분리하고 빈 문자열 제거
  const parts = componentPath.split('/').filter((part) => part && part.trim() !== '')

  // 'guides' 다음의 첫 번째 디렉토리를 카테고리로 사용 (개발 가이드 샘플용)
  const guidesIndex = parts.findIndex((part) => part === 'guides')
  if (guidesIndex >= 0 && guidesIndex < parts.length - 1) {
    // 최상위 레벨 폴더 (styles, patterns, conventions, best-practices 등)
    const topLevelFolders = ['styles', 'patterns', 'conventions', 'best-practices']
    const topLevelIndex = parts.findIndex((part, idx) => idx > guidesIndex && topLevelFolders.includes(part))
    
    if (topLevelIndex >= 0 && topLevelIndex < parts.length - 1) {
      // 최상위 레벨 다음의 첫 디렉토리를 카테고리로 사용
      // 예: 'guides/styles/charts/...' → 'charts'
      // 예: 'guides/patterns/component-structure/...' → 'component-structure'
      return parts[topLevelIndex + 1]
    }
    
    // 최상위 레벨이 없으면 'guides' 다음의 첫 디렉토리 사용
    return parts[guidesIndex + 1]
  }

  // 'src' 다음의 첫 번째 디렉토리를 카테고리로 사용 (일반 컴포넌트용)
  const srcIndex = parts.findIndex((part) => part === 'src')
  if (srcIndex >= 0 && srcIndex < parts.length - 1) {
    return parts[srcIndex + 1]
  }

  // 'src'가 없으면 첫 번째 디렉토리 사용
  if (parts.length > 1) {
    return parts[0]
  }

  return null
}

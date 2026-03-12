// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * diagramSettings.js
 * 다이어그램 설정 관리 (타입 기반 범용 시스템)
 * localStorage에 저장/로드
 */

import { getDefaultDiagramSettings, validateDiagramSettings } from './diagramSettingsConfig'
import { diagramTypes } from './diagramMetadata'

/**
 * 타입별 localStorage 키 생성
 * @param {String} type - 다이어그램 타입
 * @returns {String} localStorage 키
 */
function getStorageKey(type) {
  return `nexa-diagram-${type}-settings`
}

/**
 * 타입별 설정 로드
 * @param {String} type - 다이어그램 타입 (erd, dependency, filetree, ...)
 * @returns {Object} 설정 객체
 */
export function loadDiagramSettings(type) {
  try {
    const storageKey = getStorageKey(type)
    const stored = localStorage.getItem(storageKey)
    
    if (stored) {
      const parsed = JSON.parse(stored)
      // filetree 타입의 경우 저장된 orientation을 사용하여 기본값 생성 (orientation 기반 nodesep, ranksep 분기)
      const defaults = (type === 'filetree' || type === diagramTypes.FILETREE) && parsed.layout?.orientation
        ? getDefaultDiagramSettings(type, { orientation: parsed.layout.orientation })
        : getDefaultDiagramSettings(type)
      
      if (!defaults) {
        console.warn(`[diagramSettings] 기본 설정을 찾을 수 없음: ${type}`)
        return parsed
      }
      
      // 기본값과 병합하여 누락된 항목 보완
      const merged = deepMerge(defaults, parsed)
      
      // ERD 호환성: selected/unselected가 있으면 단일 크기로 변환
      if (type === diagramTypes.ERD && merged.nodeSize) {
        if (merged.nodeSize.unselected) {
          merged.nodeSize = {
            width: merged.nodeSize.unselected.width || defaults.nodeSize.width,
            height: merged.nodeSize.unselected.height || defaults.nodeSize.height,
          }
        }
      }
      
      // 검증 및 반환
      return validateDiagramSettings(type, merged)
    }
  } catch (error) {
    console.warn(`[diagramSettings] 설정 로드 실패 (${type}):`, error)
  }
  
  // 기본값 반환
  const defaults = getDefaultDiagramSettings(type)
  return defaults || {}
}

/**
 * 타입별 설정 저장
 * @param {String} type - 다이어그램 타입
 * @param {Object} settings - 설정 객체
 */
export function saveDiagramSettings(type, settings) {
  try {
    const storageKey = getStorageKey(type)
    const validated = validateDiagramSettings(type, settings)
    localStorage.setItem(storageKey, JSON.stringify(validated))
  } catch (error) {
    console.error(`[diagramSettings] 설정 저장 실패 (${type}):`, error)
    throw error
  }
}

/**
 * 타입별 기본값 가져오기
 * @param {String} type - 다이어그램 타입
 * @returns {Object} 기본 설정 객체
 */
export function getDefaultDiagramSettingsForType(type) {
  return getDefaultDiagramSettings(type) || {}
}

/**
 * 설정 업데이트 (부분 업데이트 지원)
 * @param {String} type - 다이어그램 타입
 * @param {Object} updates - 업데이트할 설정 (부분 가능)
 * @returns {Object} 업데이트된 설정
 */
export function updateDiagramSettings(type, updates) {
  const current = loadDiagramSettings(type)
  const defaults = getDefaultDiagramSettings(type)
  
  if (!defaults) {
    console.warn(`[diagramSettings] 기본 설정을 찾을 수 없음: ${type}`)
    return current
  }
  
  // 깊은 병합
  const updated = deepMerge(defaults, current, updates)
  
  // 검증 및 저장
  const validated = validateDiagramSettings(type, updated)
  saveDiagramSettings(type, validated)
  
  return validated
}

/**
 * 설정 초기화
 * @param {String} type - 다이어그램 타입
 */
export function resetDiagramSettings(type) {
  try {
    const storageKey = getStorageKey(type)
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error(`[diagramSettings] 설정 초기화 실패 (${type}):`, error)
    throw error
  }
}

/**
 * 깊은 병합 유틸리티
 * @param {...Object} objects - 병합할 객체들
 * @returns {Object} 병합된 객체
 */
function deepMerge(...objects) {
  const result = {}
  
  for (const obj of objects) {
    if (!obj || typeof obj !== 'object') continue
    
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value) && result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
        // 중첩 객체는 재귀적으로 병합
        result[key] = deepMerge(result[key], value)
      } else {
        // 그 외는 덮어쓰기
        result[key] = value
      }
    }
  }
  
  return result
}

// ============================================================================
// ERD 전용 함수 (호환성 유지)
// ============================================================================

/**
 * ERD 기본 설정값 (호환성 유지)
 * @deprecated getDefaultDiagramSettingsForType('erd') 사용 권장
 */
export const defaultERDSettings = getDefaultDiagramSettings(diagramTypes.ERD) || {
  nodeSize: {
    width: 100,
    height: 25,
  },
  layout: {
    nodesep: 200,
    ranksep: 120,
    marginx: 150,
    marginy: 150,
    rankdir: 'LR',
  },
}

/**
 * ERD 설정 로드 (호환성 유지)
 * @deprecated loadDiagramSettings('erd') 사용 권장
 * @returns {Object} 설정 객체
 */
export function loadERDSettings() {
  return loadDiagramSettings(diagramTypes.ERD)
}

/**
 * ERD 설정 저장 (호환성 유지)
 * @deprecated saveDiagramSettings('erd', settings) 사용 권장
 * @param {Object} settings - 설정 객체
 */
export function saveERDSettings(settings) {
  return saveDiagramSettings(diagramTypes.ERD, settings)
}

/**
 * ERD 설정 초기화 (호환성 유지)
 * @deprecated resetDiagramSettings('erd') 사용 권장
 */
export function resetERDSettings() {
  return resetDiagramSettings(diagramTypes.ERD)
}

/**
 * ERD 현재 설정 가져오기 (호환성 유지)
 * @deprecated loadDiagramSettings('erd') 사용 권장
 * @returns {Object} 설정 객체
 */
let currentERDSettings = null

export function getERDSettings() {
  // 항상 최신 설정을 로드 (캐시 무효화)
  currentERDSettings = loadDiagramSettings(diagramTypes.ERD)
  return currentERDSettings
}

/**
 * ERD 설정 업데이트 (호환성 유지)
 * @deprecated updateDiagramSettings('erd', updates) 사용 권장
 * @param {Object} updates - 업데이트할 설정 (부분 업데이트 가능)
 * @returns {Object} 업데이트된 설정
 */
export function updateERDSettings(updates) {
  return updateDiagramSettings(diagramTypes.ERD, updates)
}

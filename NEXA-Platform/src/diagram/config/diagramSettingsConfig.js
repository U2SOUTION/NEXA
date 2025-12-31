/**
 * diagramSettingsConfig.js
 * 다이어그램 타입별 설정 스키마 정의
 * 기본값, 범위, 단위 등 메타데이터 포함
 */

import { diagramTypes } from './diagramMetadata.js'

/**
 * 다이어그램 타입별 설정 스키마
 */
export const diagramSettingsSchemas = {
  [diagramTypes.ERD]: {
    nodeSize: {
      width: { default: 100, min: 1, max: 400, step: 10 },
      height: { default: 25, min: 1, max: 400, step: 5 },
    },
    layout: {
      nodesep: { default: 200, min: 50, max: 500, step: 10 },
      ranksep: { default: 120, min: 50, max: 400, step: 10 },
      marginx: { default: 150, min: 0, max: 300, step: 10 },
      marginy: { default: 150, min: 0, max: 300, step: 10 },
      rankdir: { default: 'LR', options: ['LR', 'TB', 'RL', 'BT'] },
    },
  },
  // 의존성 그래프 (향후 추가)
  dependency: {
    nodeSize: {
      width: { default: 120, min: 1, max: 400, step: 10 },
      height: { default: 40, min: 1, max: 400, step: 5 },
    },
    layout: {
      nodesep: { default: 150, min: 50, max: 500, step: 10 },
      ranksep: { default: 100, min: 50, max: 400, step: 10 },
      marginx: { default: 150, min: 0, max: 300, step: 10 },
      marginy: { default: 150, min: 0, max: 300, step: 10 },
      rankdir: { default: 'LR', options: ['LR', 'TB', 'RL', 'BT'] },
    },
    // 의존성 그래프 전용 설정
    showLabels: { default: true },
    edgeStyle: { default: 'curved', options: ['straight', 'curved', 'bezier'] },
  },
  // 파일 트리 (향후 추가)
  filetree: {
    nodeSize: {
      // width: 각 노드의 너비 (px)
      width: { default: 130, min: 1, max: 200, step: 1 },
      // height: 각 노드의 높이 (px)
      height: { default: 30, min: 20, max: 400, step: 5 },
    },
    layout: {
      // orientation: 레이아웃 방향 ('horizontal': 좌→우, 'vertical': 상→하)
      orientation: { default: 'horizontal', options: ['vertical', 'horizontal'] },
      // nodesep: 같은 rank(층) 내 노드 간 간격 (px) - horizontal: 너비 영향(권장 60-80), vertical: 높이 영향(권장 55-70)
      nodesep: { default: 55, min: 50, max: 300, step: 10 }, // orientation에 따라 기본값 자동 분기됨
      // ranksep: rank(층) 간 간격 (px) - horizontal: 높이 영향(권장 50-70), vertical: 너비 영향(권장 150-200)
      ranksep: { default: 160, min: 20, max: 400, step: 10 }, // orientation에 따라 기본값 자동 분기됨
      // marginx: 그래프 전체의 좌우 여백 (px) (확인은 잘 안됨 , css 스타일 확인해보기)
      marginx: { default: 10, min: 0, max: 300, step: 10 },
      // marginy: 마진 상하 (확인은 잘 안됨 , css 스타일 확인해보기)
      marginy: { default: 1, min: 0, max: 300, step: 10 },
    },
    // 파일 트리 전용 설정
    showFileIcons: { default: true },
    expandLevel: { default: 2, min: 0, max: 10, step: 1 }, // 0 = 모두 닫힘, -1 = 모두 열림
  },
  // Flow (향후 추가)
  [diagramTypes.FLOW]: {
    nodeSize: {
      width: { default: 100, min: 1, max: 400, step: 10 },
      height: { default: 50, min: 1, max: 400, step: 5 },
    },
    layout: {
      nodesep: { default: 150, min: 50, max: 500, step: 10 },
      ranksep: { default: 100, min: 50, max: 400, step: 10 },
      marginx: { default: 150, min: 0, max: 300, step: 10 },
      marginy: { default: 150, min: 0, max: 300, step: 10 },
      rankdir: { default: 'TB', options: ['LR', 'TB', 'RL', 'BT'] },
    },
  },
  // Network (향후 추가)
  [diagramTypes.NETWORK]: {
    nodeSize: {
      width: { default: 80, min: 1, max: 400, step: 10 },
      height: { default: 80, min: 1, max: 400, step: 5 },
    },
    layout: {
      nodesep: { default: 100, min: 50, max: 500, step: 10 },
      ranksep: { default: 100, min: 50, max: 400, step: 10 },
      marginx: { default: 150, min: 0, max: 300, step: 10 },
      marginy: { default: 150, min: 0, max: 300, step: 10 },
      rankdir: { default: 'LR', options: ['LR', 'TB', 'RL', 'BT'] },
    },
  },
}

/**
 * 타입별 기본 설정값 생성 (filetree는 orientation에 따라 nodesep, ranksep 기본값 자동 분기)
 */
export function getDefaultDiagramSettings(type, context = {}) {
  const schema = diagramSettingsSchemas[type]
  if (!schema) {
    console.warn(`[diagramSettingsConfig] 알 수 없는 다이어그램 타입: ${type}`)
    return null
  }

  const settings = {}

  // filetree 타입의 경우 orientation을 먼저 확인하여 nodesep, ranksep 분기
  const filetreeOrientation = type === 'filetree' ? context.orientation || schema.layout?.orientation?.default || 'horizontal' : null

  // 스키마를 순회하며 기본값 추출
  for (const [key, value] of Object.entries(schema)) {
    if (typeof value === 'object' && value !== null) {
      if (value.default !== undefined) {
        settings[key] = value.default
      } else {
        settings[key] = {}
        for (const [subKey, subValue] of Object.entries(value)) {
          if (subValue && typeof subValue === 'object' && subValue.default !== undefined) {
            // filetree 타입의 layout.nodesep, layout.ranksep은 orientation에 따라 기본값 분기
            if (type === 'filetree' && key === 'layout' && filetreeOrientation) {
              if (subKey === 'nodesep') {
                settings[key][subKey] = filetreeOrientation === 'horizontal' ? 60 : 55
              } else if (subKey === 'ranksep') {
                settings[key][subKey] = filetreeOrientation === 'horizontal' ? 50 : 160
              } else {
                settings[key][subKey] = subValue.default
              }
            } else {
              settings[key][subKey] = subValue.default
            }
          }
        }
      }
    }
  }

  return settings
}

/**
 * 설정값 검증
 * @param {String} type - 다이어그램 타입
 * @param {Object} settings - 검증할 설정 객체
 * @returns {Object} 검증된 설정 객체 (범위 내 값으로 조정)
 */
export function validateDiagramSettings(type, settings) {
  const schema = diagramSettingsSchemas[type]
  if (!schema) {
    console.warn(`[diagramSettingsConfig] 알 수 없는 다이어그램 타입: ${type}`)
    return settings
  }

  const validated = { ...settings }

  // 스키마를 순회하며 값 검증
  for (const [key, schemaValue] of Object.entries(schema)) {
    if (typeof schemaValue === 'object' && schemaValue !== null) {
      if (schemaValue.default !== undefined) {
        // 단순 값 검증
        const value = validated[key]
        if (value !== undefined) {
          if (schemaValue.min !== undefined && value < schemaValue.min) {
            validated[key] = schemaValue.min
          } else if (schemaValue.max !== undefined && value > schemaValue.max) {
            validated[key] = schemaValue.max
          }
          // 옵션 리스트가 있으면 검증
          if (schemaValue.options && !schemaValue.options.includes(value)) {
            validated[key] = schemaValue.default
          }
        }
      } else {
        // 중첩 객체 검증
        if (validated[key] && typeof validated[key] === 'object') {
          validated[key] = { ...validated[key] }
          for (const [subKey, subSchemaValue] of Object.entries(schemaValue)) {
            if (subSchemaValue && typeof subSchemaValue === 'object' && subSchemaValue.default !== undefined) {
              const subValue = validated[key][subKey]
              if (subValue !== undefined) {
                if (subSchemaValue.min !== undefined && subValue < subSchemaValue.min) {
                  validated[key][subKey] = subSchemaValue.min
                } else if (subSchemaValue.max !== undefined && subValue > subSchemaValue.max) {
                  validated[key][subKey] = subSchemaValue.max
                }
                // 옵션 리스트가 있으면 검증
                if (subSchemaValue.options && !subSchemaValue.options.includes(subValue)) {
                  validated[key][subKey] = subSchemaValue.default
                }
              }
            }
          }
        }
      }
    }
  }

  return validated
}

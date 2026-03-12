/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * diagramSettingsConfig.js
 * 다이어그램 타입별 설정 스키마 정의
 * 기본값, 범위, 단위 등 메타데이터 포함
 */

import { diagramTypes } from './diagramMetadata'

/**
 * 성능 최적화 임계값 상수 (전역)
 * 노드 수에 따라 UX와 성능의 균형을 조절하는 기준값
 */
export const PERFORMANCE_THRESHOLDS = {
  /**
   * 라벨 자동 숨김 임계값
   * 노드 수가 이 값 이상이면 라벨을 자동으로 숨김 (성능 최적화)
   * 이 값 미만이면 항상 라벨 표시 (UX 향상)
   */
  AUTO_HIDE_LABELS: 200,

  /**
   * 라인 실시간 업데이트 임계값
   * 노드 수가 이 값 미만이면 드래그 중에도 라인을 실시간으로 업데이트 (UX 향상)
   * 이 값 이상이면 드래그 중 라인 업데이트를 스킵하고 종료 시에만 업데이트 (성능 우선)
   */
  REALTIME_LINK_UPDATE: 200,

  /**
   * 대량 데이터 모드 임계값
   * 노드 수가 이 값 이상이면 Canvas 모드나 추가 최적화 고려
   */
  LARGE_DATA_MODE: 500,

  /**
   * 드래그 중 시뮬레이션 정지 임계값
   * 노드 수가 이 값 이상이면 드래그 중 시뮬레이션을 완전히 정지 (성능 최적화, INP 개선)
   * 이 값 미만이면 드래그 중에도 시뮬레이션을 느리게 실행 (UX 향상)
   */
  PAUSE_SIMULATION_ON_DRAG: 500,
}

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
  // 파일 의존성 그래프 (force-directed)
  dependency: {
    nodeSize: {
      width: { default: 80, min: 1, max: 400, step: 10 },
      height: { default: 80, min: 1, max: 400, step: 5 },
    },
    layout: {
      // force-directed 그래프 설정
      force: {
        charge: { default: -300, min: -1000, max: 0, step: 10 }, // 반발력
        linkDistance: { default: 100, min: 10, max: 500, step: 10 }, // 연결된 노드 간 목표 거리
        linkStrength: { default: 0.5, min: 0, max: 1, step: 0.1 }, // 링크 강도
        collision: { default: 5, min: 0, max: 20, step: 1 }, // 충돌 방지 거리 보정값
      },
    },
    // 노드 라벨 표시 여부 (기본값: true, 노드 수가 200개 이상이면 자동으로 숨김)
    showLabels: { default: true },
    // 수동 최적 줌값 (자동 줌 대신 사용, 모든 그래프/모드에 공통 적용)
    // manualZoom: { scale: 1.0, translateX: 0, translateY: 0 } 형태로 저장
    manualZoom: null, // null이면 자동 줌 사용, 값이 있으면 수동 줌 적용
  },
  // 패키지 의존성 그래프 (force-directed)
  [diagramTypes.DEPENDENCY_ANALYSIS]: {
    nodeSize: {
      width: { default: 80, min: 1, max: 400, step: 10 },
      height: { default: 80, min: 1, max: 400, step: 5 },
    },
    layout: {
      // force-directed 그래프 설정 (패키지 의존성 그래프 전용)
      force: {
        charge: { default: -50, min: -100, max: 0, step: 10 }, // 반발력 (기본값: -300 → -150으로 감소)
        linkDistance: { default: 30, min: 10, max: 100, step: 10 }, // 연결된 노드 간 목표 거리
        linkStrength: { default: 0.3, min: 0, max: 1, step: 0.1 }, // 링크 강도
        collision: { default: 5, min: 0, max: 20, step: 1 }, // 충돌 방지 거리 보정값
      },
    },
    // 노드 라벨 표시 여부 (기본값: true, 노드 수가 200개 이상이면 자동으로 숨김)
    showLabels: { default: true },
    // 수동 최적 줌값 (자동 줌 대신 사용, 모든 그래프/모드에 공통 적용)
    manualZoom: null, // null이면 자동 줌 사용, 값이 있으면 수동 줌 적용
  },
  [diagramTypes.IOT_NETWORK]: {
    nodeSize: {
      width: { default: 80, min: 1, max: 400, step: 10 },
      height: { default: 80, min: 1, max: 400, step: 5 },
    },
    layout: {
      force: {
        charge: { default: -150, min: -400, max: 0, step: 10 },
        linkDistance: { default: 80, min: 10, max: 500, step: 10 },
        linkStrength: { default: 0.5, min: 0, max: 1, step: 0.1 },
        collision: { default: 5, min: 0, max: 20, step: 1 },
      },
    },
    showLabels: { default: true },
    manualZoom: null,
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
      // orientation: 레이아웃(데이터의 흐름) 방향 ('horizontal': 좌→우, 'vertical': 상→하)
      orientation: { default: 'horizontal', options: ['vertical', 'horizontal'] },

      //TB(Top to Bottom) 세로 방향 설정
      vertical: {
        widthDistance: 165, //노드간의 가로 간격 (nodesep: 좌우 간격) - 같은 레벨(형제)에서의 간격
        heightDistance: 100, //노드간의 세로 간격 (ranksep: 상하 간격) - 계층(부모-자식)
        maxWidthDistance: 300,
        minHeightDistance: 50,
        maxHeightDistance: 400,
      },
      // LR(Left to Right) 가로 방향 설정
      horizontal: {
        widthDistance: 160, //노드간의 가로 간격 (ranksep: 좌우 간격) - 계층(부모-자식)
        heightDistance: 60, //노드간의 세로 간격 (nodesep: 상하 간격) - 같은 레벨(형제)에서의 간격
        minWidthDistance: 120,
        maxWidthDistance: 400,
        minHeightDistance: 150,
        maxHeightDistance: 300,
      },
      // marginx: 그래프 전체의 좌우 여백 (px) (확인은 잘 안됨 , css 스타일 확인해보기)
      marginx: { default: 10, min: 0, max: 300, step: 10 },
      // marginy: 마진 상하 (확인은 잘 안됨 , css 스타일 확인해보기)
      marginy: { default: 1, min: 0, max: 300, step: 10 },
    },
    // 파일 트리 전용 설정
    showFileIcons: { default: true },
    expandLevel: { default: 2, min: 0, max: 10, step: 1 }, // 0 = 모두 닫힘, -1 = 모두 열림
    // 수동 최적 줌값 (자동 줌 대신 사용, 모든 그래프/모드에 공통 적용)
    // manualZoom: { scale: 1.0, translateX: 0, translateY: 0 } 형태로 저장
    manualZoom: null, // null이면 자동 줌 사용, 값이 있으면 수동 줌 적용
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
        // filetree 타입의 layout은 특별 처리: vertical/horizontal 객체를 먼저 처리한 후 nodesep/ranksep 생성
        if (type === 'filetree' && key === 'layout' && filetreeOrientation) {
          // 1단계: vertical, horizontal 객체와 일반 속성들 처리
          for (const [subKey, subValue] of Object.entries(value)) {
            if (subValue && typeof subValue === 'object') {
              if (subKey === 'vertical' || subKey === 'horizontal') {
                // orientation별 설정 객체를 그대로 사용
                settings[key][subKey] = subValue
              } else if (subKey === 'orientation' || subKey === 'marginx' || subKey === 'marginy') {
                // orientation, marginx, marginy는 default 값 사용
                if (subValue.default !== undefined) {
                  settings[key][subKey] = subValue.default
                }
              }
            }
          }
          // 2단계: orientation에 따라 nodesep, ranksep 동적 생성
          const orientationConfig = settings[key][filetreeOrientation]
          if (orientationConfig) {
            // 주석 기반 매핑: orientation별 widthDistance/heightDistance를 nodesep/ranksep으로 변환
            // vertical: nodesep = 좌우 간격 = widthDistance, ranksep = 상하 간격 = heightDistance
            // horizontal: nodesep = 상하 간격 = heightDistance, ranksep = 좌우 간격 = widthDistance
            settings[key].nodesep = filetreeOrientation === 'vertical' ? orientationConfig.widthDistance : orientationConfig.heightDistance
            settings[key].ranksep = filetreeOrientation === 'vertical' ? orientationConfig.heightDistance : orientationConfig.widthDistance
          }
        } else {
          // 일반 타입 또는 layout이 아닌 경우
          for (const [subKey, subValue] of Object.entries(value)) {
            if (subValue && typeof subValue === 'object') {
              // 중첩 객체인 경우 (예: force 객체)
              if (subValue.default === undefined) {
                // 중첩 객체 재귀 처리 (예: layout.force.charge)
                settings[key][subKey] = {}
                for (const [nestedKey, nestedValue] of Object.entries(subValue)) {
                  if (nestedValue && typeof nestedValue === 'object' && nestedValue.default !== undefined) {
                    settings[key][subKey][nestedKey] = nestedValue.default
                  }
                }
              } else {
                // 단순 값인 경우
                settings[key][subKey] = subValue.default
              }
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

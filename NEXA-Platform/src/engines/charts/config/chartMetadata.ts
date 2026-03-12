// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * chartMetadata.js
 * 차트 타입별 메타데이터 정의
 * 각 차트 타입이 지원하는 설정 옵션과 기본값을 정의
 */

export const CHART_METADATA = {
  line: {
    name: '라인 차트',
    supports: {
      strokeWidth: true, // 선 두께 조정 가능
      dotSize: false, // 데이터 점 크기 (불가)
      nodeSize: true, // 노드 크기 조정 가능
      color: true, // 색상 설정 가능
    },
    defaultStyle: {
      strokeWidth: 2,
      nodeSize: 4,
      color: '#2196F3', // 기본 색상
    },
  },
  scatter: {
    name: '분산 차트',
    supports: {
      strokeWidth: false,
      dotSize: true, // 데이터 점 크기 조정 가능
      nodeSize: false, // 노드 (불가)
      color: true, // 색상 설정 가능 (단일 색상 또는 색상 팔레트)
    },
    defaultStyle: {
      dotSize: 6,
      color: null, // null이면 colorScale 사용 (기본 동작)
    },
  },
  area: {
    name: '영역 차트',
    supports: {
      strokeWidth: true, // 영역의 선 두께만 조정 가능
      dotSize: false,
      nodeSize: true, // 노드 크기 조정 가능
      color: true, // 색상 설정 가능
    },
    defaultStyle: {
      strokeWidth: 2,
      nodeSize: 4,
      color: '#2196F3',
    },
  },
  bar: {
    name: '막대 차트',
    supports: {
      strokeWidth: false,
      dotSize: false,
      nodeSize: false,
      color: false, // 각 막대마다 다른 색상 사용 (설정 불가)
    },
  },
  pie: {
    name: '파이 차트',
    supports: {
      strokeWidth: false,
      dotSize: false,
      nodeSize: false,
      color: false, // 각 조각마다 다른 색상 사용 (설정 불가)
    },
  },
}

/**
 * 차트 타입의 메타데이터 가져오기
 * @param {String} chartType - 차트 타입 ('line', 'bar', 'scatter', 'area', 'pie')
 * @returns {Object} 차트 메타데이터
 */
export function getChartMetadata(chartType) {
  return CHART_METADATA[chartType] || CHART_METADATA.bar
}

/**
 * 선 두께 설정 지원 여부 확인
 * @param {String} chartType - 차트 타입
 * @returns {Boolean} 지원 여부
 */
export function supportsStrokeWidth(chartType) {
  return CHART_METADATA[chartType]?.supports?.strokeWidth || false
}

/**
 * 데이터 점 크기 설정 지원 여부 확인 (분산 차트)
 * @param {String} chartType - 차트 타입
 * @returns {Boolean} 지원 여부
 */
export function supportsDotSize(chartType) {
  return CHART_METADATA[chartType]?.supports?.dotSize || false
}

/**
 * 노드 크기 설정 지원 여부 확인 (라인/영역 차트)
 * @param {String} chartType - 차트 타입
 * @returns {Boolean} 지원 여부
 */
export function supportsNodeSize(chartType) {
  return CHART_METADATA[chartType]?.supports?.nodeSize || false
}

/**
 * 색상 설정 지원 여부 확인
 * @param {String} chartType - 차트 타입
 * @returns {Boolean} 지원 여부
 */
export function supportsColor(chartType) {
  return CHART_METADATA[chartType]?.supports?.color || false
}

/**
 * 차트 타입의 기본 스타일 가져오기
 * @param {String} chartType - 차트 타입
 * @returns {Object} 기본 스타일 객체
 */
export function getDefaultStyle(chartType) {
  return CHART_METADATA[chartType]?.defaultStyle || {}
}

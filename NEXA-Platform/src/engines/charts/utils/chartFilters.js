/**
 * chartFilters.js
 * 차트 필터 효과 공통 유틸리티 (흐리기, 네온 등)
 */
import * as d3 from 'd3'

/**
 * 흐리기 필터 생성
 * @param {Object} svg - D3 선택된 SVG 요소
 * @param {String} filterId - 필터 ID
 * @param {Number} blurAmount - 흐리기 정도 (0-10)
 * @returns {Object} D3 선택된 필터 요소
 */
export function createBlurFilter(svg, filterId, blurAmount) {
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs')

  return defs.append('filter').attr('id', filterId).append('feGaussianBlur').attr('stdDeviation', blurAmount)
}

/**
 * 네온 효과 필터 생성
 * @param {Object} svg - D3 선택된 SVG 요소
 * @param {String} filterId - 필터 ID
 * @param {String} color - 네온 색상 (기본값: '#00ff00')
 * @param {Number} intensity - 네온 강도 (기본값: 3)
 * @returns {Object} D3 선택된 필터 요소
 */
export function createNeonFilter(svg, filterId, color = '#00ff00', intensity = 3) {
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs')

  const filter = defs.append('filter').attr('id', filterId).attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%')

  // 네온 효과: 여러 단계의 블러 + 색상
  filter.append('feGaussianBlur').attr('stdDeviation', intensity).attr('result', 'coloredBlur')

  // 색상 적용
  filter.append('feColorMatrix').attr('in', 'coloredBlur').attr('type', 'matrix').attr('values', getColorMatrixValues(color))

  // 병합
  const merge = filter.append('feMerge')
  merge.append('feMergeNode').attr('in', 'coloredBlur')
  merge.append('feMergeNode').attr('in', 'SourceGraphic')

  return filter
}

/**
 * 레이어 스타일 필터 생성
 * @param {Object} svg - D3 선택된 SVG 요소
 * @param {String} filterId - 필터 ID
 * @param {Object} style - 스타일 옵션
 * @returns {Object} D3 선택된 필터 요소 또는 null
 */
/**
 * 레이어 스타일 필터 생성 (단일 색상용 - 개별 요소에는 사용하지 않음)
 * 주의: 이 함수는 레이어 전체에 단일 색상 네온을 적용할 때 사용
 * 개별 요소에 각 색상에 맞는 네온을 적용하려면 차트 렌더링 함수에서 직접 처리
 */
export function createLayerStyleFilter(svg, filterId, style) {
  if (!style || (!style.blur && !style.neon)) {
    return null
  }

  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs')

  let filter = null

  if (style.blur && style.blur > 0) {
    // 흐리기만 있는 경우
    if (!style.neon) {
      return createBlurFilter(svg, filterId, style.blur)
    }
    // 흐리기 + 네온 (단일 색상)
    filter = defs.append('filter').attr('id', filterId).attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%')

    const neonIntensity = style.neonIntensity || 3
    filter.append('feGaussianBlur').attr('stdDeviation', Math.max(style.blur, neonIntensity)).attr('result', 'coloredBlur')

    // 단일 색상 네온 (기본값, 실제로는 개별 요소에서 각 색상에 맞게 처리)
    filter.append('feColorMatrix').attr('in', 'coloredBlur').attr('type', 'matrix').attr('values', getColorMatrixValues('#00ff00'))

    const merge = filter.append('feMerge')
    merge.append('feMergeNode').attr('in', 'coloredBlur')
    merge.append('feMergeNode').attr('in', 'SourceGraphic')
  } else if (style.neon) {
    // 네온만 있는 경우 (단일 색상)
    const neonIntensity = style.neonIntensity || 3
    return createNeonFilter(svg, filterId, '#00ff00', neonIntensity)
  }

  return filter
}

/**
 * 통합 필터 생성 함수 (개별 요소용)
 * 3가지 필터 타입 지원: neon-only, blur-only, neon-blur
 * @param {Object} svg - D3 선택된 SVG 요소
 * @param {String} filterId - 필터 ID
 * @param {String} color - 요소 색상
 * @param {Number} neonIntensity - 네온 강도 (0이면 네온 효과 없음)
 * @param {Number} blurAmount - 흐리기 강도 (0이면 흐리기 효과 없음)
 * @param {Object} options - 차트 타입별 옵션
 * @param {String} options.chartType - 차트 타입 ('bar', 'line', 'scatter', 'pie', 'area')
 * @returns {Object} D3 선택된 필터 요소 또는 null
 */
export function createElementFilter(svg, filterId, color, neonIntensity = 0, blurAmount = 0, options = {}) {
  if (!svg || svg.empty()) {
    return null
  }

  // 효과가 없으면 null 반환
  if (neonIntensity <= 0 && blurAmount <= 0) {
    return null
  }

  const { chartType = 'bar' } = options
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs')

  // 기존 필터 제거
  const existingFilter = defs.select(`#${filterId}`)
  if (!existingFilter.empty()) {
    existingFilter.remove()
  }

  // 차트 타입별 설정
  const chartConfig = {
    bar: {
      neonBlurMultiplier: 1.0,
      neonColorIntensity: 0.1,
      neonColorMax: 2.5,
      neonStage2Threshold: 5,
      neonStage2Multiplier: 0.5,
      filterPaddingMultiplier: 2,
      minFilterPadding: 50,
    },
    line: {
      neonBlurMultiplier: 4.0,
      neonColorIntensity: 0.25,
      neonColorMax: 4.0,
      neonStage2Threshold: 1,
      neonStage2Multiplier: 2.0,
      neonStage3Threshold: 4,
      neonStage3Multiplier: 1.5,
      neonStage4Threshold: 8,
      neonStage4Multiplier: 1.0,
      neonStage5Threshold: 15,
      neonStage5Multiplier: 0.6,
      filterPaddingMultiplier: 4,
      minFilterPadding: 150,
    },
    scatter: {
      neonBlurMultiplier: 1.5,
      neonColorIntensity: 0.15,
      neonColorMax: 3.0,
      neonStage2Threshold: 3,
      neonStage2Multiplier: 0.8,
      neonStage3Threshold: 8,
      neonStage3Multiplier: 0.5,
      filterPaddingMultiplier: 3,
      minFilterPadding: 100,
    },
    pie: {
      neonBlurMultiplier: 1.0,
      neonColorIntensity: 0.1,
      neonColorMax: 2.5,
      neonStage2Threshold: 5,
      neonStage2Multiplier: 0.5,
      filterPaddingMultiplier: 2,
      minFilterPadding: 50,
    },
    area: {
      neonBlurMultiplier: 1.0,
      neonColorIntensity: 0.1,
      neonColorMax: 2.5,
      neonStage2Threshold: 5,
      neonStage2Multiplier: 0.5,
      filterPaddingMultiplier: 2,
      minFilterPadding: 50,
    },
  }

  const config = chartConfig[chartType] || chartConfig.bar

  // 필터 타입 결정
  const hasNeon = neonIntensity > 0
  const hasBlur = blurAmount > 0

  // 필터 생성
  const filter = defs.append('filter').attr('id', filterId).attr('color-interpolation-filters', 'sRGB')

  // 흐리기 효과가 있으면 먼저 원본에 흐리기 적용
  let sourceForNeon = 'SourceGraphic'
  if (hasBlur) {
    filter.append('feGaussianBlur').attr('stdDeviation', blurAmount).attr('result', 'blurredSource')
    sourceForNeon = 'blurredSource'
  }

  // 네온 효과가 있으면 네온 필터 체인 생성
  let firstBlur = 0
  if (hasNeon) {
    // 첫 번째 블러 (기본 네온)
    firstBlur = Math.min(neonIntensity * config.neonBlurMultiplier, chartType === 'line' ? 40 : 20)
    filter.append('feGaussianBlur').attr('in', sourceForNeon).attr('stdDeviation', firstBlur).attr('result', 'coloredBlur1')

    // 두 번째 블러 (강도가 임계값 이상일 때)
    let lastBlurResult = 'coloredBlur1'
    if (neonIntensity >= (config.neonStage2Threshold || 999)) {
      const secondBlur = Math.min(neonIntensity * config.neonStage2Multiplier, chartType === 'line' ? 30 : 15)
      filter.append('feGaussianBlur').attr('stdDeviation', secondBlur).attr('in', 'coloredBlur1').attr('result', 'coloredBlur2')
      lastBlurResult = 'coloredBlur2'
    }

    // 세 번째 블러 (라인 차트 등)
    if (config.neonStage3Threshold && neonIntensity >= config.neonStage3Threshold) {
      const thirdBlur = Math.min(neonIntensity * config.neonStage3Multiplier, chartType === 'line' ? 25 : 12)
      filter.append('feGaussianBlur').attr('stdDeviation', thirdBlur).attr('in', lastBlurResult).attr('result', 'coloredBlur3')
      lastBlurResult = 'coloredBlur3'
    }

    // 네 번째 블러 (라인 차트 등)
    if (config.neonStage4Threshold && neonIntensity >= config.neonStage4Threshold) {
      const fourthBlur = Math.min(neonIntensity * config.neonStage4Multiplier, chartType === 'line' ? 20 : 10)
      filter.append('feGaussianBlur').attr('stdDeviation', fourthBlur).attr('in', lastBlurResult).attr('result', 'coloredBlur4')
      lastBlurResult = 'coloredBlur4'
    }

    // 다섯 번째 블러 (라인 차트 등)
    if (config.neonStage5Threshold && neonIntensity >= config.neonStage5Threshold) {
      const fifthBlur = Math.min(neonIntensity * config.neonStage5Multiplier, chartType === 'line' ? 15 : 8)
      filter.append('feGaussianBlur').attr('stdDeviation', fifthBlur).attr('in', lastBlurResult).attr('result', 'coloredBlur5')
      lastBlurResult = 'coloredBlur5'
    }

    // 색상 적용
    const colorIntensity = Math.min(1 + neonIntensity * config.neonColorIntensity, config.neonColorMax)
    const colorValues = getColorMatrixValues(color, colorIntensity)
    filter.append('feColorMatrix').attr('in', lastBlurResult).attr('type', 'matrix').attr('values', colorValues).attr('result', 'coloredBlur')

    // 병합: 네온 효과 + 원본 (흐리기가 있으면 흐린 원본, 없으면 원본)
    const merge = filter.append('feMerge')
    merge.append('feMergeNode').attr('in', 'coloredBlur')
    merge.append('feMergeNode').attr('in', sourceForNeon)
  } else if (hasBlur) {
    // 흐리기만 있는 경우
    const merge = filter.append('feMerge')
    merge.append('feMergeNode').attr('in', 'blurredSource')
  }

  // 필터 패딩 계산
  let totalBlur = 0
  if (hasNeon) {
    totalBlur = firstBlur
    if (neonIntensity >= (config.neonStage2Threshold || 999)) {
      totalBlur += neonIntensity * config.neonStage2Multiplier
    }
    if (config.neonStage3Threshold && neonIntensity >= config.neonStage3Threshold) {
      totalBlur += neonIntensity * config.neonStage3Multiplier
    }
    if (config.neonStage4Threshold && neonIntensity >= config.neonStage4Threshold) {
      totalBlur += neonIntensity * config.neonStage4Multiplier
    }
    if (config.neonStage5Threshold && neonIntensity >= config.neonStage5Threshold) {
      totalBlur += neonIntensity * config.neonStage5Multiplier
    }
  }
  const filterPadding = Math.max(totalBlur * config.filterPaddingMultiplier, blurAmount * 2, config.minFilterPadding)

  // 필터 범위 설정
  filter
    .attr('x', `-${filterPadding}%`)
    .attr('y', `-${filterPadding}%`)
    .attr('width', `${100 + filterPadding * 2}%`)
    .attr('height', `${100 + filterPadding * 2}%`)

  return filter
}

/**
 * 색상 매트릭스 값 생성 (네온 효과용) - 강도 파라미터 추가
 * @param {String} color - 색상 (hex, rgb, hsl 등)
 * @param {Number} intensity - 색상 강도 (기본값: 1.0)
 * @returns {String} colorMatrix values
 */
export function getColorMatrixValues(color, intensity = 1.0) {
  // d3.color를 사용하여 모든 색상 포맷(Hex, RGB, HSL 등)을 안전하게 파싱
  const c = d3.color(color)
  if (!c) {
    // 색상 파싱 실패 시 기본값 반환
    console.warn(`[ChartFilters] 색상 파싱 실패: ${color}`)
    return '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0'
  }

  // 0~1 사이의 값으로 정규화 및 강도 적용
  const r = (c.r / 255) * intensity
  const g = (c.g / 255) * intensity
  const b = (c.b / 255) * intensity

  // 네온 효과를 위한 colorMatrix
  // R, G, B 채널에 색상 적용
  return `${r} 0 0 0 0 0 ${g} 0 0 0 0 0 ${b} 0 0 0 0 0 1 0`
}

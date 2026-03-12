/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * chartBackground.js
 * 차트 배경 이미지 렌더링 유틸리티
 */

/**
 * 배경 이미지 렌더링
 * @param {Object} config - 설정 객체
 * @param {Object} config.svg - D3 선택된 SVG 요소
 * @param {Number} config.chartWidth - 차트 너비
 * @param {Number} config.chartHeight - 차트 높이
 * @param {Object} config.background - 배경 설정
 * @returns {Object} D3 선택된 배경 그룹 요소
 */
export function renderBackground({ svg, chartWidth, chartHeight, background }) {
  if (!background || !background.image) return null

  // 배경 레이어 그룹 생성 (최하위)
  const bgGroup = svg.insert('g', ':first-child').attr('class', 'background-layer')

  // 패턴 정의
  const defs = svg.select('defs').empty() ? svg.insert('defs', ':first-child') : svg.select('defs')

  const patternId = 'background-pattern'
  const pattern = defs.append('pattern').attr('id', patternId).attr('x', 0).attr('y', 0).attr('width', 1).attr('height', 1).attr('patternUnits', 'objectBoundingBox')

  // 이미지 추가
  pattern.append('image').attr('href', background.image).attr('preserveAspectRatio', getPreserveAspectRatio(background.position)).attr('x', 0).attr('y', 0).attr('width', 1).attr('height', 1)

  // 스타일 효과 필터 생성
  const filterId = 'background-filter'
  const style = background.style || {}
  let hasFilter = false

  if (style.blur || style.brightness || style.contrast || style.saturation || style.grayscale || style.sepia || style.hueRotate) {
    hasFilter = true
    const filter = defs.append('filter').attr('id', filterId)

    // 흐리기 효과
    if (style.blur && style.blur > 0) {
      filter.append('feGaussianBlur').attr('stdDeviation', style.blur)
    }

    // 색상 조절 효과들 (feColorMatrix 사용)
    if (style.brightness || style.contrast || style.saturation || style.grayscale || style.sepia || style.hueRotate) {
      // 복잡한 색상 효과는 CSS 필터나 여러 feColorMatrix 조합 필요
      // 간단한 구현: grayscale만 지원
      if (style.grayscale && style.grayscale > 0) {
        const gray = style.grayscale
        const r = 0.2126 + 0.7874 * (1 - gray)
        const g = 0.7152 + 0.2848 * (1 - gray)
        const b = 0.0722 + 0.9278 * (1 - gray)
        filter.append('feColorMatrix').attr('type', 'matrix').attr('values', `${r} ${g} ${b} 0 0 ${r} ${g} ${b} 0 0 ${r} ${g} ${b} 0 0 0 0 0 1 0`)
      }
    }
  }

  // 배경 사각형 (차트 영역에 맞춤)
  const bgRect = bgGroup
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .attr('fill', `url(#${patternId})`)
    .attr('opacity', background.opacity || 0.3)

  // 필터 적용
  if (hasFilter) {
    bgRect.attr('filter', `url(#${filterId})`)
  }

  // 배경색 오버레이 (선택적)
  if (background.color) {
    bgGroup
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', background.color)
      .attr('opacity', background.colorOpacity || 0.2)
      .attr('mix-blend-mode', background.blendMode || 'normal')
  }

  return bgGroup
}

/**
 * preserveAspectRatio 값 가져오기
 * @param {String} position - 위치 ('center' | 'cover' | 'contain' | 'repeat')
 * @returns {String} preserveAspectRatio 값
 */
function getPreserveAspectRatio(position) {
  const map = {
    center: 'xMidYMid slice',
    cover: 'xMidYMid slice',
    contain: 'xMidYMid meet',
    repeat: 'none',
  }
  return map[position] || 'xMidYMid slice'
}

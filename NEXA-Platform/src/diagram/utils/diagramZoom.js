/**
 * diagramZoom.js
 * 다이어그램 줌/팬 유틸리티
 */

import * as d3 from 'd3'

/**
 * 줌 객체 생성
 * @param {Function} onZoom - 줌 이벤트 핸들러
 * @param {Object} options - 줌 옵션
 * @returns {Object} D3 zoom 객체
 */
export function createZoom(onZoom, options = {}) {
  const { scaleExtent = [0.1, 3], wheelDelta = null } = options

  const zoom = d3.zoom().scaleExtent(scaleExtent).on('zoom', onZoom)

  if (wheelDelta) {
    zoom.wheelDelta(wheelDelta)
  }

  return zoom
}

/**
 * 초기 줌 설정 (그래프가 화면에 맞도록)
 * @param {Object} svg - D3 SVG 선택자
 * @param {Object} svgGroup - D3 그룹 선택자
 * @param {Number} containerWidth - 컨테이너 너비
 * @param {Number} containerHeight - 컨테이너 높이
 * @param {Object} zoom - D3 zoom 객체
 * @param {Object} options - 옵션
 * @param {Number} options.margin - 여유 공간 비율 (기본값: 0.95)
 * @param {Number} options.delay - 지연 시간 (ms, 기본값: 100)
 * @param {Function} options.onComplete - 줌 설정 완료 후 콜백
 * @param {Boolean} options.immediate - 즉시 실행 여부
 * @param {Boolean} options.animate - 애니메이션 사용 여부
 * @param {Number} options.duration - 애니메이션 지속 시간 (ms)
 * @param {Function|String} options.easing - 이징 함수 또는 문자열
 * @param {Object} options.manualZoom - 수동 줌값 { scale, translateX, translateY } (있으면 자동 계산 대신 사용)
 */
export function fitToScreen(svg, svgGroup, containerWidth, containerHeight, zoom, options = {}) {
  const { margin = 0.95, delay = 100, onComplete = null, animate = true, duration = 750, easing = 'elastic-out', manualZoom = null } = options

  // 이징 함수 매핑
  const easingMap = {
    'cubic-in-out': d3.easeCubicInOut,
    'elastic-out': d3.easeElasticOut,
    'bounce-out': d3.easeBounceOut,
    'back-out': d3.easeBackOut,
    'exp-out': d3.easeExpOut,
  }
  const easingFunction = typeof easing === 'string' ? easingMap[easing] || d3.easeCubicInOut : easing

  const applyFit = () => {
    try {
      let targetTransform

      // 수동 줌값이 있으면 사용, 없으면 자동 계산
      if (manualZoom && manualZoom.scale !== undefined) {
        // 수동 줌값 사용
        const translateX = manualZoom.translateX !== undefined ? manualZoom.translateX : 0
        const translateY = manualZoom.translateY !== undefined ? manualZoom.translateY : 0
        targetTransform = d3.zoomIdentity.translate(translateX, translateY).scale(manualZoom.scale)
        console.log('[diagramZoom] 수동 줌값 적용:', { scale: manualZoom.scale, translateX, translateY })
      } else {
        // 자동 줌 계산
        const bounds = svgGroup.node().getBBox()
        const fullWidth = bounds.width || containerWidth
        const fullHeight = bounds.height || containerHeight

        if (fullWidth > 0 && fullHeight > 0) {
          // 스케일 계산
          const scale = Math.min(containerWidth / fullWidth, containerHeight / fullHeight) * margin

          // 중심점 계산
          const midX = bounds.x + fullWidth / 2
          const midY = bounds.y + fullHeight / 2

          // translate 계산
          const translateX = containerWidth / 2 - scale * midX
          const translateY = containerHeight / 2 - scale * midY

          // transform 생성
          targetTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        } else {
          return // 크기가 0이면 종료
        }
      }

      // targetTransform이 정의된 경우에만 적용
      if (targetTransform) {
        if (animate) {
          svg
            .transition()
            .duration(duration)
            .ease(easingFunction)
            .call(zoom.transform, targetTransform)
            .on('end', () => {
              if (onComplete) onComplete(targetTransform)
            })
        } else {
          svg.call(zoom.transform, targetTransform)
          if (onComplete) onComplete(targetTransform)
        }
      }
    } catch (err) {
      console.warn('[diagramZoom] 초기 줌 설정 실패:', err)
    }
  }

  setTimeout(applyFit, delay)
}

/**
 * 줌 인/아웃
 * @param {Object} svg - D3 SVG 선택자
 * @param {Object} zoom - D3 zoom 객체
 * @param {Number} scale - 스케일 값 (1보다 크면 확대, 작으면 축소)
 */
export function zoomTo(svg, zoom, scale) {
  svg.call(zoom.scaleBy, scale)
}

/**
 * 줌 리셋
 * @param {Object} svg - D3 SVG 선택자
 * @param {Object} zoom - D3 zoom 객체
 */
export function resetZoom(svg, zoom) {
  svg.call(zoom.transform, d3.zoomIdentity)
}

/**
 * 수동 최적 줌 설정 (사용자가 직접 스케일과 위치 조정)
 * @param {Object} svg - D3 SVG 선택자
 * @param {Object} zoom - D3 zoom 객체
 * @param {Number} scale - 스케일 값
 * @param {Number} translateX - X축 이동 값 (선택사항, null이면 자동 중앙정렬 계산)
 * @param {Number} translateY - Y축 이동 값 (선택사항, null이면 자동 중앙정렬 계산)
 * @param {Object} options - 옵션
 * @param {Boolean} options.animate - 애니메이션 사용 여부
 * @param {Number} options.duration - 애니메이션 지속 시간 (ms)
 * @param {Object} options.svgGroup - SVG 그룹 선택자 (자동 중앙정렬 계산용)
 * @param {Number} options.containerWidth - 컨테이너 너비 (자동 중앙정렬 계산용)
 * @param {Number} options.containerHeight - 컨테이너 높이 (자동 중앙정렬 계산용)
 * @returns {Object} 적용된 transform 객체
 */
export function setOptimalZoom(svg, zoom, scale, translateX = null, translateY = null, options = {}) {
  const { animate = true, duration = 750, svgGroup = null, containerWidth = null, containerHeight = null } = options

  let finalTranslateX = translateX
  let finalTranslateY = translateY

  // translate가 null이고 svgGroup이 제공된 경우 자동 중앙정렬 계산
  if ((finalTranslateX === null || finalTranslateY === null) && svgGroup) {
    try {
      const bounds = svgGroup.node().getBBox()
      const fullWidth = bounds.width || containerWidth || 800
      const fullHeight = bounds.height || containerHeight || 600

      if (fullWidth > 0 && fullHeight > 0) {
        const actualContainerWidth = containerWidth || svg.node().parentElement?.clientWidth || 800
        const actualContainerHeight = containerHeight || svg.node().parentElement?.clientHeight || 600

        // 중앙 정렬 계산
        const midX = bounds.x + fullWidth / 2
        const midY = bounds.y + fullHeight / 2
        finalTranslateX = finalTranslateX !== null ? finalTranslateX : actualContainerWidth / 2 - scale * midX
        finalTranslateY = finalTranslateY !== null ? finalTranslateY : actualContainerHeight / 2 - scale * midY
      }
    } catch (err) {
      console.warn('[diagramZoom] 자동 중앙정렬 계산 실패:', err)
      // 실패 시 현재 위치 유지
      const currentTransform = d3.zoomTransform(svg.node())
      finalTranslateX = finalTranslateX !== null ? finalTranslateX : currentTransform.x
      finalTranslateY = finalTranslateY !== null ? finalTranslateY : currentTransform.y
    }
  } else if (finalTranslateX === null || finalTranslateY === null) {
    // svgGroup이 없으면 현재 위치 유지
    const currentTransform = d3.zoomTransform(svg.node())
    finalTranslateX = finalTranslateX !== null ? finalTranslateX : currentTransform.x
    finalTranslateY = finalTranslateY !== null ? finalTranslateY : currentTransform.y
  }

  const targetTransform = d3.zoomIdentity.translate(finalTranslateX, finalTranslateY).scale(scale)

  if (animate) {
    svg.transition().duration(duration).call(zoom.transform, targetTransform)
  } else {
    svg.call(zoom.transform, targetTransform)
  }

  return targetTransform
}

/**
 * 현재 줌 상태 가져오기
 * @param {Object} svg - D3 SVG 선택자
 * @returns {Object} 현재 transform 상태 { scale, translateX, translateY }
 */
export function getCurrentZoom(svg) {
  const transform = d3.zoomTransform(svg.node())
  return {
    scale: transform.k,
    translateX: transform.x,
    translateY: transform.y,
  }
}

/**
 * diagramZoom.js
 * 다이어그램 줌/팬 유틸리티
 */

import * as d3 from 'd3'

/**
 * 줌 객체 생성 (관성 효과 포함)
 * @param {Function} onZoom - 줌 이벤트 핸들러
 * @param {Object} options - 줌 옵션
 * @param {Array<Number>} options.scaleExtent - 줌 스케일 범위 [최소값, 최대값] (기본값: [0.1, 3])
 *   - 최소값: 줌 아웃 최대 한계 (0.1 = 원본 크기의 10%)
 *   - 최대값: 줌 인 최대 한계 (3 = 원본 크기의 300%)
 * @param {Function} options.wheelDelta - 마우스 휠 델타 계산 함수 (기본값: null, D3 기본값 사용)
 * @param {Boolean} options.inertia - 관성 효과 사용 여부 (기본값: true)
 * @param {Number} options.inertiaDecay - 관성 감쇠 계수 (기본값: 0.9, 0~1 사이)
 * @param {Number} options.inertiaDuration - 관성 지속 시간 (ms, 기본값: 300)
 * @param {Function} options.onInertiaStart - 관성 애니메이션 시작 시 콜백 (성능 최적화용)
 * @param {Function} options.onInertiaEnd - 관성 애니메이션 종료 시 콜백 (성능 최적화용)
 * @param {Boolean} options.skipFontUpdateDuringInertia - 관성 애니메이션 중 폰트 업데이트 스킵 (기본값: true)
 * @returns {Object} D3 zoom 객체
 */
export function createZoom(onZoom, options = {}) {
  const {
    scaleExtent = [0.1, 3], // 줌 스케일 범위 [최소값, 최대값]: 0.1(10%) ~ 3(300%)
    wheelDelta = null,
    inertia = true, // 관성 효과 활성화
    inertiaDecay = 0.9, // 관성 감쇠 (0.9 = 매 프레임마다 10% 감소)
    inertiaDuration = 1000, // 관성 지속 시간 (ms)
    onInertiaStart = null, // 관성 애니메이션 시작 콜백
    onInertiaEnd = null, // 관성 애니메이션 종료 콜백
    skipFontUpdateDuringInertia = true, // 관성 중 폰트 업데이트 스킵
  } = options

  // 관성 효과 관련 변수 선언 (줌 핸들러 래퍼에서 사용)
  let isInertiaAnimating = false // 관성 애니메이션 중 여부

  // 줌 핸들러 래퍼 (관성 중 폰트 업데이트 스킵 옵션)
  let wrappedOnZoom = null
  if (inertia) {
    wrappedOnZoom = (event) => {
      // 관성 애니메이션 중이고 폰트 업데이트 스킵 옵션이 활성화된 경우
      // 이벤트에 플래그 추가
      if (isInertiaAnimating && skipFontUpdateDuringInertia) {
        event.skipFontUpdate = true
      }
      onZoom(event)
    }
  }

  const zoom = d3
    .zoom()
    .scaleExtent(scaleExtent)
    .on('zoom', inertia ? wrappedOnZoom : onZoom)

  if (wheelDelta) {
    zoom.wheelDelta(wheelDelta)
  }

  // 관성 효과 추가
  if (inertia) {
    let velocity = { x: 0, y: 0 } // 속도 벡터
    let lastPosition = { x: 0, y: 0, time: Date.now() } // 마지막 위치와 시간
    let isDragging = false // 드래그 중 여부
    let animationFrame = null // 애니메이션 프레임
    let svgElement = null // SVG 요소 참조 저장

    // 드래그 시작
    zoom.on('start', function () {
      isDragging = true
      velocity = { x: 0, y: 0 }
      svgElement = this
      const transform = d3.zoomTransform(this)
      lastPosition = {
        x: transform.x,
        y: transform.y,
        time: Date.now(),
      }

      // 기존 관성 애니메이션 취소
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
        animationFrame = null
      }

      // 관성 애니메이션 종료 처리 (드래그 시작 시 이전 관성 종료)
      if (isInertiaAnimating) {
        isInertiaAnimating = false
        if (onInertiaEnd) onInertiaEnd()
      }
    })

    // 드래그 중 (속도 추적)
    zoom.on('zoom', function (event) {
      // 래핑된 zoom 핸들러 호출
      wrappedOnZoom(event)

      if (isDragging && event.sourceEvent) {
        const now = Date.now()
        const deltaTime = now - lastPosition.time

        if (deltaTime > 0) {
          const transform = d3.zoomTransform(this)
          const deltaX = transform.x - lastPosition.x
          const deltaY = transform.y - lastPosition.y

          // 속도 계산 (픽셀/밀리초)
          velocity = {
            x: deltaX / deltaTime,
            y: deltaY / deltaTime,
          }

          lastPosition = {
            x: transform.x,
            y: transform.y,
            time: now,
          }
        }
      }
    })

    // 드래그 종료 (관성 애니메이션 시작)
    zoom.on('end', function () {
      isDragging = false

      // 속도가 충분히 클 때만 관성 효과 적용
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
      const minSpeed = 0.1 // 최소 속도 (픽셀/밀리초)

      if (speed > minSpeed && svgElement) {
        // 관성 애니메이션 시작 콜백 호출 (Force 시뮬레이션 일시정지 등)
        isInertiaAnimating = true
        if (onInertiaStart) onInertiaStart()

        const startTime = Date.now()
        const startTransform = d3.zoomTransform(svgElement)
        let currentVelocity = { ...velocity }
        let accumulatedX = 0
        let accumulatedY = 0

        // 관성 애니메이션 함수
        const animate = () => {
          const elapsed = Date.now() - startTime

          if (elapsed < inertiaDuration && (Math.abs(currentVelocity.x) > 0.01 || Math.abs(currentVelocity.y) > 0.01)) {
            // 현재 속도로 이동
            const deltaTime = 16 // 약 60fps
            const deltaX = currentVelocity.x * deltaTime
            const deltaY = currentVelocity.y * deltaTime

            accumulatedX += deltaX
            accumulatedY += deltaY

            // 새로운 transform 계산
            const newTransform = d3.zoomIdentity.translate(startTransform.x + accumulatedX, startTransform.y + accumulatedY).scale(startTransform.k)

            // transform 적용 (이벤트에 skipFontUpdate 플래그가 자동으로 추가됨)
            d3.select(svgElement).call(zoom.transform, newTransform)

            // 속도 감쇠
            currentVelocity.x *= inertiaDecay
            currentVelocity.y *= inertiaDecay

            animationFrame = requestAnimationFrame(animate)
          } else {
            // 관성 애니메이션 종료
            animationFrame = null
            isInertiaAnimating = false
            if (onInertiaEnd) onInertiaEnd()
          }
        }

        // 관성 애니메이션 시작
        animationFrame = requestAnimationFrame(animate)
      }
    })
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

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * chartEvents.js
 * 차트 이벤트 핸들러 공통 유틸리티
 */
import * as d3 from 'd3'
import { createTooltipContent, showTooltip, hideTooltip, updateTooltipPosition } from './chartTooltip'

/**
 * 레이어 인터랙션 설정
 * @param {Object} config - 설정 객체
 * @param {Object} config.elements - D3 선택된 요소들
 * @param {Object} config.interaction - 인터랙션 옵션
 * @param {Object} config.tooltip - D3 선택된 툴팁 요소
 * @param {Function} config.onDataClick - 데이터 클릭 콜백
 * @param {Function} config.onDataHover - 데이터 호버 콜백
 * @param {Object} config.dataConfig - 데이터 설정 (xField, yField, columns 등)
 */
export function setupLayerInteraction({ elements, interaction, tooltip, onDataClick, onDataHover, dataConfig, chartType = 'unknown', mode = 'unknown' }) {
  if (!interaction || !elements) {
    console.log(`[${chartType.toUpperCase()}-${mode}] setupLayerInteraction: interaction 또는 elements 없음`, { interaction, elements: !!elements })
    return
  }

  const { xField, yField, columns, aggregation, aggregationOptions } = dataConfig || {}

  // 호버 효과 (시각적 피드백 강화)
  if (interaction.hover !== false) {
    elements
      .on('mouseenter', function (event, d) {
        const element = d3.select(this)

        // 호버 효과: opacity 1, stroke 추가로 강조, 약간 확대
        const originalOpacity = element.attr('opacity')
        element.attr('data-original-opacity', originalOpacity || 'null')
        element.attr('opacity', 1)

        // 요소 타입 확인 (한 번만)
        const nodeName = element.node()?.nodeName

        // circle 요소인 경우 (라인/영역/분산 차트의 점) 크기 증가
        const isCircle = nodeName === 'circle'
        if (isCircle) {
          const originalR = element.attr('r') || '4'
          element.attr('data-original-r', originalR)
          const newR = parseFloat(originalR) * 1.5 // 50% 증가
          element.attr('r', newR)
        }

        // 원래 stroke 상태 저장
        const originalStroke = element.attr('stroke')
        const originalStrokeWidth = element.attr('stroke-width')
        element.attr('data-original-stroke', originalStroke || 'none')
        element.attr('data-original-stroke-width', originalStrokeWidth || '0')

        // stroke가 없거나 none이면 추가 (시각적 강조)
        if (!originalStroke || originalStroke === 'none') {
          const fillColor = element.attr('fill') || '#2196F3'
          // fill 색상을 어둡게 하여 stroke로 사용
          const colorObj = d3.color(fillColor)
          const strokeColor = colorObj ? colorObj.darker(0.8).formatHex() : '#000000'
          element.attr('stroke', strokeColor).attr('stroke-width', 2)
        } else {
          // stroke가 있으면 두께만 증가
          const currentWidth = parseFloat(originalStrokeWidth) || 1
          element.attr('stroke-width', Math.max(2, currentWidth + 1))
        }

        // 막대 차트의 경우 상단으로만 확대 효과 추가
        const isBarChart = element.attr('class')?.includes('bar')
        if (nodeName === 'rect' && isBarChart) {
          const originalX = element.attr('x')
          const originalY = element.attr('y')
          const originalWidth = element.attr('width')
          const originalHeight = element.attr('height')
          element.attr('data-original-x', originalX)
          element.attr('data-original-y', originalY)
          element.attr('data-original-width', originalWidth)
          element.attr('data-original-height', originalHeight)

          // 상단으로만 확대 (높이만 5% 증가, y는 그만큼 위로 이동)
          const scale = 1.05
          const newHeight = parseFloat(originalHeight) * scale
          const heightIncrease = newHeight - parseFloat(originalHeight)

          element.attr('height', newHeight)
          element.attr('y', parseFloat(originalY) - heightIncrease) // 상단으로 이동
        }

        // 툴팁 표시
        if (interaction.tooltip !== false && tooltip) {
          const content = createTooltipContent({
            d,
            xField,
            yField,
            columns,
            aggregation,
            aggregationOptions,
          })
          showTooltip(tooltip, event, content)
        }

        // 데이터 호버 콜백 (사이드바 네비게이션용)
        if (onDataHover) {
          const row = d.originalRows ? d.originalRows[0] : d.originalRow
          onDataHover({ ...d, originalRow: row }, event)
        }
      })
      .on('mouseleave', function () {
        const element = d3.select(this)

        // 호버 효과 제거: opacity, 크기, stroke 원래대로
        const originalOpacity = element.attr('data-original-opacity')
        if (originalOpacity && originalOpacity !== 'null') {
          element.attr('opacity', originalOpacity === '1' ? null : originalOpacity)
        } else {
          element.attr('opacity', null)
        }

        // circle 요소인 경우 크기 원래대로 복원
        const nodeName = element.node()?.nodeName
        const isCircle = nodeName === 'circle'
        if (isCircle) {
          const originalR = element.attr('data-original-r')
          if (originalR) {
            element.attr('r', originalR)
            element.attr('data-original-r', null)
          }
        }

        // stroke 원래대로 복원
        const originalStroke = element.attr('data-original-stroke')
        const originalStrokeWidth = element.attr('data-original-stroke-width')

        if (originalStroke === 'none' || !originalStroke) {
          element.attr('stroke', null).attr('stroke-width', null)
        } else {
          element.attr('stroke', originalStroke)
          if (originalStrokeWidth && originalStrokeWidth !== '0') {
            element.attr('stroke-width', originalStrokeWidth)
          } else {
            element.attr('stroke-width', null)
          }
        }

        // 저장된 데이터 속성 제거
        element.attr('data-original-opacity', null)
        element.attr('data-original-stroke', null)
        element.attr('data-original-stroke-width', null)

        // 막대 차트 확대 효과 제거
        const nodeName2 = element.node()?.nodeName
        if (nodeName2 === 'rect') {
          const originalX = element.attr('data-original-x')
          const originalY = element.attr('data-original-y')
          const originalWidth = element.attr('data-original-width')
          const originalHeight = element.attr('data-original-height')

          if (originalX && originalY && originalWidth && originalHeight) {
            element.attr('x', originalX)
            element.attr('y', originalY)
            element.attr('width', originalWidth)
            element.attr('height', originalHeight)
          }
        }

        // 저장된 데이터 속성 제거
        element.attr('data-original-opacity', null)
        element.attr('data-original-stroke', null)
        element.attr('data-original-stroke-width', null)
        element.attr('data-original-x', null)
        element.attr('data-original-y', null)
        element.attr('data-original-width', null)
        element.attr('data-original-height', null)

        // 툴팁 숨김
        if (tooltip) {
          hideTooltip(tooltip)
        }
      })
      .on('mousemove', function (event) {
        // 툴팁 위치 업데이트
        if (interaction.tooltip !== false && tooltip) {
          updateTooltipPosition(tooltip, event)
        }
      })
  }

  // 클릭 이벤트
  if (interaction.click !== false) {
    elements.on('click', function (event, d) {
      // 데이터 클릭 콜백
      if (onDataClick) {
        const row = d.originalRows ? d.originalRows[0] : d.originalRow
        onDataClick({ ...d, originalRow: row }, event)
      }
    })
      }
}

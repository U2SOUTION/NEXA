/**
 * chartScales.js
 * 차트 스케일 생성 공통 유틸리티
 */
import * as d3 from 'd3'

/**
 * X축 스케일 생성 (범주형)
 * @param {Array} data - 차트 데이터
 * @param {Number} chartWidth - 차트 너비
 * @param {Object} options - 옵션 (padding 등)
 * @returns {Function} D3 scaleBand 함수
 */
export function createXScale(data, chartWidth, options = {}) {
  const padding = options.padding || 0.2
  // 중복 제거하되 첫 번째 등장 순서 유지
  const seen = new Set()
  const domain = []
  for (const d of data) {
    const xValue = String(d.x)
    if (!seen.has(xValue)) {
      seen.add(xValue)
      domain.push(xValue)
    }
  }
  return d3.scaleBand().domain(domain).range([0, chartWidth]).padding(padding)
}

/**
 * Y축 스케일 생성 (수치형)
 * @param {Array} data - 차트 데이터
 * @param {Number} chartHeight - 차트 높이
 * @param {Object} options - 옵션 (paddingTop 등)
 * @returns {Function} D3 scaleLinear 함수
 */
export function createYScale(data, chartHeight, options = {}) {
  const paddingTop = options.paddingTop || 0.1 // 기본 10% 상단 여백
  const yMax = d3.max(data, (d) => d.y) || 0
  return d3
    .scaleLinear()
    .domain([0, yMax * (1 + paddingTop)])
    .range([chartHeight, 0])
}

/**
 * 공유 X축 스케일 계산 (복수 레이어용)
 * @param {Array} allData - 모든 레이어의 데이터를 합친 배열
 * @param {Number} chartWidth - 차트 너비
 * @param {Object} options - 옵션
 * @returns {Function} D3 scaleBand 함수
 */
export function createSharedXScale(allData, chartWidth, options = {}) {
  // 모든 데이터의 x 값 추출 및 중복 제거 (순서 유지)
  // Set을 사용하되, 원본 데이터 순서를 유지하기 위해 순회하면서 첫 번째 등장 순서로 정렬
  const seen = new Set()
  const allXValues = []
  for (const d of allData) {
    const xValue = String(d.x)
    if (!seen.has(xValue)) {
      seen.add(xValue)
      allXValues.push(xValue)
    }
  }
  const padding = options.padding || 0.2

  return d3.scaleBand().domain(allXValues).range([0, chartWidth]).padding(padding)
}

/**
 * 공유 Y축 스케일 계산 (복수 레이어용)
 * @param {Array} allData - 모든 레이어의 데이터를 합친 배열
 * @param {Number} chartHeight - 차트 높이
 * @param {Object} options - 옵션
 * @returns {Function} D3 scaleLinear 함수
 */
export function createSharedYScale(allData, chartHeight, options = {}) {
  const paddingTop = options.paddingTop || 0.1
  // 모든 레이어의 최대값 찾기
  const yMax = d3.max(allData, (d) => d.y) || 0
  return d3
    .scaleLinear()
    .domain([0, yMax * (1 + paddingTop)])
    .range([chartHeight, 0])
}

/**
 * 색상 스케일 생성
 * @param {Array} data - 차트 데이터
 * @param {Array|String} colorScheme - 색상 스킴 (기본값: d3.schemeCategory10)
 * @returns {Function} D3 scaleOrdinal 함수
 */
export function createColorScale(data, colorScheme = d3.schemeCategory10) {
  return d3
    .scaleOrdinal()
    .domain(data.map((d) => d.x))
    .range(colorScheme)
}

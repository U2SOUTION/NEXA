/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * chartTheme.js
 * 차트 테마/디자인 시스템
 */
import * as d3 from 'd3'

/**
 * 기본 차트 테마
 */
export const defaultTheme = {
  // 색상
  colors: {
    primary: '#2196F3',
    secondary: '#FF9800',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    scheme: d3.schemeCategory10,
  },

  // 폰트
  fonts: {
    axis: '13px',
    label: '12px',
    title: '16px',
    small: '11px',
  },

  // 애니메이션
  animation: {
    duration: 800,
    easing: d3.easeCubicOut,
  },

  // 축
  axis: {
    tickSize: 5,
    tickLabelRotation: -45,
    labelOffset: {
      x: 60,
      y: 20,
    },
  },

  // 스타일
  style: {
    defaultOpacity: 0.8,
    hoverOpacity: 1,
    strokeWidth: 2,
  },
}

/**
 * 테마 가져오기
 * @param {String} themeName - 테마 이름 (기본값: 'default')
 * @returns {Object} 테마 객체
 */
export function getTheme(themeName = 'default') {
  const themes = {
    default: defaultTheme,
    // 향후 다른 테마 추가 가능
  }
  return themes[themeName] || defaultTheme
}

/**
 * 색상 스킴 가져오기
 * @param {String} schemeName - 스킴 이름
 * @returns {Array} 색상 배열
 */
export function getColorScheme(schemeName = 'category10') {
  const schemes = {
    category10: d3.schemeCategory10,
    category20: d3.schemeCategory20,
    category20b: d3.schemeCategory20b,
    category20c: d3.schemeCategory20c,
    // 추가 색상 스킴
  }
  return schemes[schemeName] || d3.schemeCategory10
}

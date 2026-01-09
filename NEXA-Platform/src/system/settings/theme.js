/**
 * 테마 설정 목업 데이터
 *
 * 3가지 테마 타입:
 * 1. platform: NEXA Platform 독립 실행 시 사용
 * 2. extension: Chrome Extension iframe 환경
 * 3. webview: Python WebView 환경 (Desktop 프로그램)
 */

export const themeSettings = {
  platform: {
    themes: [
      { id: 'dark', name: '다크', icon: 'dark_mode', description: '어두운 테마', available: true },
      { id: 'light', name: '라이트', icon: 'light_mode', description: '밝은 테마', available: true },
      { id: 'ocean-blue', name: 'Ocean Blue', icon: 'water_drop', description: '파란 바다 테마', available: false },
      { id: 'forest-green', name: 'Forest Green', icon: 'forest', description: '초록 숲 테마', available: false },
      { id: 'sunset-orange', name: 'Sunset Orange', icon: 'wb_twilight', description: '노을 테마', available: false },
      { id: 'midnight-purple', name: 'Midnight Purple', icon: 'nightlight', description: '보라 밤 테마', available: false },
      { id: 'arctic-white', name: 'Arctic White', icon: 'ac_unit', description: '하얀 설원 테마', available: false },
      { id: 'crimson-red', name: 'Crimson Red', icon: 'local_fire_department', description: '붉은 불꽃 테마', available: false },
      { id: 'cyber-punk', name: 'Cyber Punk', icon: 'computer', description: '사이버펑크 테마', available: false },
      { id: 'monochrome', name: 'Monochrome', icon: 'filter_b_and_w', description: '흑백 테마', available: false },
      { id: 'sunrise-yellow', name: 'Sunrise Yellow', icon: 'wb_sunny', description: '노란 새벽 테마', available: false },
    ],
    current: 'dark',
  },
  extension: {
    themes: [
      { id: 'default-blend', name: '기본 (블렌딩)', icon: 'blur_on', description: '브라우저/사이트 테마 자동 블렌딩', available: false },
      { id: 'dark-blend', name: '다크 블렌딩', icon: 'dark_mode', description: '다크 모드 블렌딩', available: false },
      { id: 'light-blend', name: '라이트 블렌딩', icon: 'light_mode', description: '라이트 모드 블렌딩', available: false },
      { id: 'platform-dark', name: '플랫폼 다크', icon: 'dark_mode', description: '플랫폼 다크 테마 사용', available: false },
      { id: 'platform-light', name: '플랫폼 라이트', icon: 'light_mode', description: '플랫폼 라이트 테마 사용', available: false },
    ],
    current: 'default-blend',
  },
  webview: {
    themes: [
      { id: 'default', name: '기본', icon: 'desktop_windows', description: '기본 테마', available: false },
      { id: 'dark', name: '다크', icon: 'dark_mode', description: '어두운 테마', available: false },
      { id: 'light', name: '라이트', icon: 'light_mode', description: '밝은 테마', available: false },
      { id: 'auto', name: '자동', icon: 'brightness_auto', description: '시스템 테마 따라가기', available: false },
    ],
    current: 'default',
  },
}

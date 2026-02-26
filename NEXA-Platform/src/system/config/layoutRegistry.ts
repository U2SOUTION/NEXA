/**
 * 레이아웃 레지스트리
 *
 * 동적으로 레이아웃을 선택하기 위한 레지스트리
 * 수백 개의 특정 영역을 iframe으로 불러올 때 각각 다른 레이아웃을 사용할 수 있도록 확장 가능한 구조
 */

export const layoutRegistry = {
  // 기본 레이아웃 (MainLayout)
  default: () => import('layouts/MainLayout.vue'),

  // U2BEE 전용 레이아웃 (크롬 확장 프로그램용)
  u2bee: () => import('layouts/U2BeeLayout.vue'),

  // 향후 확장 가능한 레이아웃들
  // minimal: () => import('layouts/MinimalLayout.vue'),
  // iot: () => import('layouts/IotLayout.vue'),
  // controller: () => import('layouts/ControllerLayout.vue'),
}

/**
 * 라우트에서 사용할 레이아웃 컴포넌트를 반환
 *
 * @param {Object} route - Vue Router route 객체
 * @returns {Promise<Component>} 레이아웃 컴포넌트
 */
export function getLayoutComponent(route) {
  // 1순위: query parameter (예: ?layout=u2bee)
  if (route.query?.layout) {
    return layoutRegistry[route.query.layout] || layoutRegistry.default
  }

  // 2순위: route meta (예: meta: { layout: 'u2bee' })
  if (route.meta?.layout) {
    return layoutRegistry[route.meta.layout] || layoutRegistry.default
  }

  // 3순위: embed 모드 감지 (예: ?mode=popup, ?mode=sidepanel)
  if (route.query?.mode === 'popup' || route.query?.mode === 'sidepanel') {
    // extension=u2bee인 경우 U2BEE 레이아웃 사용
    if (route.query?.extension === 'u2bee') {
      return layoutRegistry.u2bee
    }
    // 기본적으로 minimal 레이아웃 사용 (향후 구현)
    return layoutRegistry.default
  }

  // 기본값
  return layoutRegistry.default
}

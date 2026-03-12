/**
 * 레이아웃 레지스트리
 *
 * 동적으로 레이아웃을 선택하기 위한 레지스트리
 * 수백 개의 특정 영역을 iframe으로 불러올 때 각각 다른 레이아웃을 사용할 수 있도록 확장 가능한 구조
 */
type LayoutKey = 'default' | 'u2bee'

export const layoutRegistry: Record<LayoutKey, () => Promise<unknown>> = {
  default: () => import('layouts/MainLayout.vue'),
  u2bee: () => import('layouts/U2BeeLayout.vue'),
}

/**
 * 라우트에서 사용할 레이아웃 컴포넌트를 반환
 */
export function getLayoutComponent(route: { query?: { layout?: string; mode?: string; extension?: string }; meta?: { layout?: string } }) {
  const layoutKey = (route.query?.layout ?? route.meta?.layout) as LayoutKey | undefined
  if (layoutKey && layoutKey in layoutRegistry) {
    return layoutRegistry[layoutKey as LayoutKey]
  }

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

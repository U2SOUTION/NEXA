/**
 * 개발 가이드 설정 (Development Guide Configuration)
 *
 * 개발 가이드 관련 모든 설정을 중앙화하여 관리
 * - 단일 진실의 원천 (Single Source of Truth)
 * - 변경 시 한 곳만 수정하면 모든 곳에 반영됨
 *
 * 최상위 카테고리만 한글 매핑하고, 서브 카테고리는 폴더명 그대로 사용
 */

export const devGuideConfig = {
  // 메타데이터
  version: '1.0.0',
  lastUpdated: '2024-12-XX',
  description: '개발 가이드 최상위 카테고리 설정',

  // 최상위 레벨 폴더 정의 (정렬 순서 포함)
  // 모든 폴더 아이콘은 'folder'로 통일
  topLevelCategories: [
    {
      id: 'styles',
      label: 'UI 스타일',
      icon: 'folder',
      description: '컴포턴트를 퀘이사와 적절한 타협과 오버라이드 샘플',
      order: 0,
    },
    {
      id: 'patterns',
      label: '설계 패턴',
      icon: 'folder',
      description: '아키텍처 패턴 가이드',
      order: 1,
    },
    {
      id: 'library',
      label: '컴포넌트 라이브러리',
      icon: 'folder',
      description: '바로 사용할 수 있는 완성된 컴포넌트',
      order: 2,
    },
    {
      id: 'cores',
      label: '핵심 컴포넌트',
      icon: 'folder',
      description: 'NEXA Platform의 핵심 컴포넌트 응용 가이드',
      order: 3,
    },
    {
      id: 'conventions',
      label: '코딩 규칙',
      icon: 'folder',
      description: '코딩 컨벤션 가이드',
      order: 4,
    },
    {
      id: 'practices',
      label: '모범 사례',
      icon: 'folder',
      description: '베스트 프랙티스 가이드',
      order: 5,
    },
  ],
}

// 편의 함수: 빠른 조회를 위한 Map 생성
export const topLevelMap = new Map(devGuideConfig.topLevelCategories.map((cat) => [cat.id.toLowerCase(), cat]))

// 편의 함수: 정렬된 ID 목록 반환
export function getTopLevelOrder() {
  return devGuideConfig.topLevelCategories.sort((a, b) => a.order - b.order).map((cat) => cat.id)
}

// 편의 함수: ID로 카테고리 정보 조회
export function getTopLevelCategory(id) {
  if (!id) return null
  const lowerId = id.toLowerCase()
  return topLevelMap.get(lowerId) || null
}

// 편의 함수: 아이콘 조회
export function getTopLevelIcon(id) {
  const category = getTopLevelCategory(id)
  return category?.icon || 'folder'
}

// 편의 함수: 라벨 조회
export function getTopLevelLabel(id) {
  const category = getTopLevelCategory(id)
  return category?.label || id
}

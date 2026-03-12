/**
 * 파일 정렬 함수들
 * 파일 목록을 다양한 기준으로 정렬하는 함수들
 */

export interface FileItem {
  name: string
  modifiedDate?: string | number
  createdDate?: string | number
}

/**
 * 이름순 정렬
 * @param {Array} files - 파일 배열
 * @param {string} _order - 정렬 방향 ('asc' | 'desc') - 현재는 사용하지 않음 (항상 A→Z 순서 유지)
 * @returns {Array} 정렬된 파일 배열
 */
export function sortByName(files: FileItem[], _order?: string): FileItem[] {
  void _order
  if (!files || !Array.isArray(files) || files.length === 0) {
    return []
  }
  const sorted = [...files].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name, 'ko')
    // 오름차순/내림차순 모두 A→Z 순서 유지 (중요도 관점: A가 더 중요)
    return comparison
  })
  return sorted
}

/**
 * 수정일순 정렬 (파일 메타데이터의 수정일 기준)
 * @param {Array} files - 파일 배열
 * @param {string} order - 정렬 방향 ('asc' | 'desc')
 * @returns {Array} 정렬된 파일 배열
 */
export function sortByModified(files: FileItem[], order: 'asc' | 'desc'): FileItem[] {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return []
  }
  const sorted = [...files].sort((a: FileItem, b: FileItem) => {
    const dateA = a.modifiedDate ? new Date(a.modifiedDate).getTime() : 0
    const dateB = b.modifiedDate ? new Date(b.modifiedDate).getTime() : 0
    
    // 날짜가 둘 다 없으면 이름순으로 정렬
    if (dateA === 0 && dateB === 0) {
      return a.name.localeCompare(b.name, 'ko')
    }
    // 날짜가 하나만 없으면 없는 쪽을 뒤로
    if (dateA === 0) return 1
    if (dateB === 0) return -1
    
    const comparison = dateA - dateB
    // desc: 최신 파일이 먼저 (큰 날짜가 먼저) - comparison을 반전
    // asc: 오래된 파일이 먼저 (작은 날짜가 먼저)
    return order === 'desc' ? -comparison : comparison
  })
  return sorted
}

/**
 * 생성일순 정렬 (파일 메타데이터의 생성일 기준)
 * @param {Array} files - 파일 배열
 * @param {string} order - 정렬 방향 ('asc' | 'desc')
 * @returns {Array} 정렬된 파일 배열
 */
export function sortByCreated(files: FileItem[], order: 'asc' | 'desc'): FileItem[] {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return []
  }
  const sorted = [...files].sort((a: FileItem, b: FileItem) => {
    const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0
    const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0
    
    // 날짜가 둘 다 없으면 이름순으로 정렬
    if (dateA === 0 && dateB === 0) {
      return a.name.localeCompare(b.name, 'ko')
    }
    // 날짜가 하나만 없으면 없는 쪽을 뒤로
    if (dateA === 0) return 1
    if (dateB === 0) return -1
    
    const comparison = dateA - dateB
    return order === 'asc' ? comparison : -comparison
  })
  return sorted
}

/**
 * 사용빈도순 정렬
 * @param {Array} files - 파일 배열
 * @param {string} order - 정렬 방향 ('asc' | 'desc')
 * @param {Object} fileUsageCounts - 파일 사용 빈도 객체
 * @returns {Array} 정렬된 파일 배열
 */
export function sortByUsage(files: FileItem[], order: 'asc' | 'desc', fileUsageCounts: Record<string, number>): FileItem[] {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return []
  }
  const sorted = [...files].sort((a: FileItem, b: FileItem) => {
    const countA = fileUsageCounts[a.name] || 0
    const countB = fileUsageCounts[b.name] || 0
    const comparison = countA - countB
    return order === 'asc' ? comparison : -comparison
  })
  return sorted
}

/**
 * 즐겨찾기순 정렬
 * @param {Array} files - 파일 배열
 * @param {string} order - 정렬 방향 ('asc' | 'desc')
 * @param {Object} favoriteStates - 즐겨찾기 상태 객체
 * @returns {Array} 정렬된 파일 배열
 */
export function sortByFavorite(files: FileItem[], order: 'asc' | 'desc', favoriteStates: Record<string, boolean>): FileItem[] {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return []
  }
  const sorted = [...files].sort((a: FileItem, b: FileItem) => {
    const favoriteA = favoriteStates[a.name] === true ? 1 : 0
    const favoriteB = favoriteStates[b.name] === true ? 1 : 0
    const comparison = favoriteB - favoriteA
    if (comparison !== 0) {
      // 내림차순(desc)일 때 즐겨찾기 한 것이 위로, 오름차순(asc)일 때 즐겨찾기 안 한 것이 위로
      return order === 'desc' ? comparison : -comparison
    }
    // 즐겨찾기 상태가 같으면 이름순으로 정렬
    return a.name.localeCompare(b.name, 'ko')
  })
  return sorted
}

/**
 * 우선순위순 정렬
 * @param {Array} files - 파일 배열
 * @param {string} order - 정렬 방향 ('asc' | 'desc')
 * @param {Object} priorityStates - 우선순위 상태 객체
 * @returns {Array} 정렬된 파일 배열
 */
export function sortByPriority(files: FileItem[], order: 'asc' | 'desc', priorityStates: Record<string, number>): FileItem[] {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return []
  }
  const sorted = [...files].sort((a: FileItem, b: FileItem) => {
    const priorityA = priorityStates[a.name] || 0
    const priorityB = priorityStates[b.name] || 0
    const comparison = priorityB - priorityA
    if (comparison !== 0) {
      // desc: 높은 점수 먼저 (기본값)
      // asc: 낮은 점수 먼저
      return order === 'desc' ? comparison : -comparison
    }
    // 우선순위가 같으면 이름순으로 정렬
    return a.name.localeCompare(b.name, 'ko')
  })
  return sorted
}


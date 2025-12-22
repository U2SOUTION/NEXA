/**
 * 문서 카테고리 분류 함수
 * 파일을 카테고리로 분류하는 함수
 */

/**
 * 파일 카테고리 분류
 * @param {Object} file - 파일 객체 (name, path 포함)
 * @returns {string} 카테고리명
 */
export function getFileCategory(file) {
  // 규칙 1: 폴더 구조 기반 분류
  // /docs/카테고리명/파일.md 형식이면 폴더명을 카테고리로 사용
  const pathParts = file.path.split('/').filter((part) => part && part.trim() !== '')

  // 경로 구조: ['docs', '카테고리', '파일.md'] 또는 ['docs', '파일.md']
  // docs 폴더 바로 아래에 파일이 있으면 pathParts.length === 2
  // docs 폴더 아래에 하위 폴더가 있으면 pathParts.length > 2
  if (pathParts.length > 2) {
    // /docs/카테고리/파일.md 형식
    // pathParts[0] = 'docs', pathParts[1] = '카테고리', pathParts[2] = '파일.md'
    const categoryFolder = pathParts[1] // 두 번째 요소가 카테고리 폴더명

    // 'docs'가 아닌 모든 폴더명을 카테고리로 사용 (대소문자 구분 없이)
    if (categoryFolder && categoryFolder.toLowerCase() !== 'docs') {
      // 폴더명을 가독성 있게 변환 (언더스코어, 하이픈을 공백으로)
      return categoryFolder.replace(/_/g, ' ').replace(/-/g, ' ')
    }
  }

  // 규칙 2: 파일명 구분자 기반 분류
  // 파일명의 첫 번째 부분을 카테고리로 사용
  const fileName = file.name.replace('.md', '')

  // 구분자 우선순위: 언더스코어(_) > 하이픈(-) > 공백
  const separators = ['_', '-', ' ']

  for (const sep of separators) {
    if (fileName.includes(sep)) {
      const parts = fileName.split(sep)
      if (parts[0] && parts[0].trim()) {
        return parts[0].trim()
      }
    }
  }

  // 규칙 3: 카테고리를 찾을 수 없으면 "기타"
  return '기타'
}


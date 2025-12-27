/**
 * 에러 분석 문서 프론트매터 파서
 * 마크다운 문서의 YAML 프론트매터를 파싱하고 에러 ID를 추출
 */

/**
 * 간단한 YAML 프론트매터 파서
 * @param {string} content - 마크다운 문서 내용
 * @returns {Object|null} 파싱된 프론트매터 객체 또는 null
 */
export function parseErrorAnalysisFrontmatter(content) {
  if (!content || typeof content !== 'string') {
    return null
  }

  // 프론트매터 패턴: ---로 시작하고 ---로 끝나는 YAML 블록
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return null
  }

  const yamlContent = match[1]
  const frontmatter = {}

  // 간단한 YAML 파싱 (key: value 형식)
  const lines = yamlContent.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue // 빈 줄이나 주석 건너뛰기
    }

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) {
      continue
    }

    const key = trimmed.substring(0, colonIndex).trim()
    let value = trimmed.substring(colonIndex + 1).trim()

    // 따옴표 제거
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // 배열 파싱 (간단한 형식: ["item1", "item2"])
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        // JSON 파싱 시도
        value = JSON.parse(value)
      } catch {
        // 실패하면 문자열 배열로 처리
        value = value
          .slice(1, -1)
          .split(',')
          .map((item) => item.trim().replace(/^["']|["']$/g, ''))
      }
    } else if (value === 'true' || value === 'True') {
      value = true
    } else if (value === 'false' || value === 'False') {
      value = false
    } else if (!isNaN(value) && value !== '') {
      // 숫자로 변환 시도
      const numValue = Number(value)
      if (!isNaN(numValue)) {
        value = numValue
      }
    }

    frontmatter[key] = value
  }

  return frontmatter
}

/**
 * 문서에서 에러 ID 추출
 * @param {string} content - 마크다운 문서 내용
 * @returns {string|null} 에러 ID 또는 null
 */
export function extractErrorIdFromDocument(content) {
  const frontmatter = parseErrorAnalysisFrontmatter(content)
  return frontmatter?.errorId || null
}

/**
 * 문서 내용에서 프론트매터를 제거하고 본문만 반환
 * @param {string} content - 마크다운 문서 내용
 * @returns {string} 프론트매터가 제거된 본문
 */
export function removeFrontmatter(content) {
  if (!content || typeof content !== 'string') {
    return content || ''
  }

  const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/
  return content.replace(frontmatterRegex, '').trim()
}

/**
 * 에러 ID로 문서 필터링
 * @param {Array<{path: string, content: string}>} documents - 문서 배열
 * @param {string} errorId - 에러 ID
 * @returns {Array<{path: string, content: string, frontmatter: Object}>} 필터링된 문서 배열
 */
export function filterDocumentsByErrorId(documents, errorId) {
  if (!documents || !Array.isArray(documents) || !errorId) {
    return []
  }

  const filtered = []

  for (const doc of documents) {
    const frontmatter = parseErrorAnalysisFrontmatter(doc.content || '')
    if (frontmatter?.errorId === errorId) {
      filtered.push({
        path: doc.path,
        content: doc.content,
        frontmatter,
      })
    }
  }

  return filtered
}

/**
 * 문서 메타데이터 추출
 * @param {string} content - 마크다운 문서 내용
 * @returns {Object} 문서 메타데이터
 */
export function extractDocumentMetadata(content) {
  const frontmatter = parseErrorAnalysisFrontmatter(content) || {}
  const body = removeFrontmatter(content)

  // 본문에서 제목 추출 시도 (첫 번째 # 제목)
  const titleMatch = body.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : null

  return {
    errorId: frontmatter.errorId || null,
    errorMessage: frontmatter.errorMessage || null,
    errorFile: frontmatter.errorFile || null,
    errorLine: frontmatter.errorLine || null,
    errorColumn: frontmatter.errorColumn || null,
    project: frontmatter.project || null,
    createdAt: frontmatter.createdAt || null,
    tags: frontmatter.tags || [],
    title: title || frontmatter.title || null,
    body,
  }
}


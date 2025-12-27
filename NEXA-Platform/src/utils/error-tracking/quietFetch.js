/**
 * 조용한 fetch 래퍼
 * 예상된 실패(400, 404 등)를 조용히 처리하여 콘솔 로그를 최소화합니다.
 * 
 * @param {string|Request} url - 요청 URL
 * @param {RequestInit} options - fetch 옵션
 * @returns {Promise<Response|null>} Response 객체 또는 null (에러 시)
 */
export async function quietFetch(url, options = {}) {
  const urlString = typeof url === 'string' ? url : url.url || 'unknown'
  
  // 조용히 처리할 URL 패턴 확인
  const shouldQuietlyHandle = (url) => {
    // URL 디코딩 (인코딩된 URL도 체크하기 위해)
    let decodedUrl = url
    try {
      decodedUrl = decodeURIComponent(url)
    } catch {
      // 디코딩 실패 시 원본 URL 사용
    }
    
    // 인덱스 파일 요청 (400/404는 예상된 에러)
    if (url.includes('.error-analysis-index.json') || decodedUrl.includes('.error-analysis-index.json')) {
      return true
    }
    // 폴더 스캔 요청 (404는 예상된 에러)
    if ((url.includes('/api/docs/Error/Platform') || decodedUrl.includes('/api/docs/Error/Platform')) && 
        !url.includes('.md') && !decodedUrl.includes('.md') && 
        !url.includes('.json') && !decodedUrl.includes('.json')) {
      return true
    }
    return false
  }

  try {
    const response = await fetch(url, options)
    
    // 예상된 실패는 조용히 처리 (400, 404)
    if (!response.ok && (response.status === 400 || response.status === 404)) {
      if (shouldQuietlyHandle(urlString)) {
        // 조용히 반환 (에러 수집 안 함, 콘솔 로그 최소화)
        return response
      }
    }
    
    return response
  } catch (error) {
    // 예상된 실패는 조용히 처리
    if (shouldQuietlyHandle(urlString)) {
      // 조용히 null 반환 (에러 수집 안 함)
      return null
    }
    
    // 예상되지 않은 에러는 다시 throw
    throw error
  }
}


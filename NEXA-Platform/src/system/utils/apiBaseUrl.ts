export function getApiBaseUrl(): string {
  const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE_URL : ''
  const trimmedEnv = typeof envUrl === 'string' ? envUrl.trim().replace(/\/+$/, '') : ''

  if (trimmedEnv) {
    return trimmedEnv.endsWith('/api') ? trimmedEnv : `${trimmedEnv}/api`
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    const port = (import.meta?.env?.VITE_API_PORT || '3000').toString()
    return `${protocol}//${hostname}:${port}/api`
  }

  return 'http://localhost:3000/api'
}

export function getDocsBaseUrl(): string {
  return `${getApiBaseUrl()}/docs`
}

/** 업로드 파일 URL 베이스 (썸네일 등 - 프론트와 동일 origin/포트 사용) */
export function getUploadsBaseUrl(): string {
  const api = getApiBaseUrl()
  return api.replace(/\/api\/?$/, '') + '/uploads'
}

/** file_path로 업로드 표시용 URL 생성 (상대 경로 사용 → dev 프록시 통해 동일 origin) */
export function getUploadDisplayUrl(filePath: string | null | undefined): string {
  if (!filePath) return ''
  const path = String(filePath).replace(/^uploads\//, '').replace(/\/+/g, '/')
  return `/uploads/${path}`.replace(/\/+/g, '/')
}

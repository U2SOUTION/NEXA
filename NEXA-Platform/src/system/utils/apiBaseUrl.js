export function getApiBaseUrl() {
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

export function getDocsBaseUrl() {
  return `${getApiBaseUrl()}/docs`
}

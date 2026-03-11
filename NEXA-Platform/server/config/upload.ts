import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 프로젝트 루트: server/ 기준 상위 (프로젝트 최상위)
const PROJECT_ROOT = path.join(__dirname, '..', '..')

// 업로드 기본 폴더 (기본: 프로젝트루트/public/uploads)
const UPLOAD_RELATIVE_DIR = process.env.UPLOAD_BASE_DIR || path.join('public', 'uploads')
export const UPLOAD_BASE_DIR = path.join(PROJECT_ROOT, UPLOAD_RELATIVE_DIR)

/**
 * 업로드 경로를 절대 경로로 변환 (../ 차단, uploads/ 프리픽스 허용)
 * @param {string} targetPath - 상대 또는 절대 경로
 * @returns {string} 절대 경로
 */
export function resolveUploadAbsolutePath(targetPath: string): string {
  if (!targetPath) {
    throw new Error('경로는 필수입니다.')
  }

  // 절대 경로면 그대로 반환
  if (path.isAbsolute(targetPath)) {
    return targetPath
  }

  // 역슬래시 → 슬래시 정규화
  const normalized = targetPath.replace(/\\/g, '/')

  // 보안: ../ 차단
  if (normalized.includes('..')) {
    throw new Error('상대 경로에 ".."를 포함할 수 없습니다.')
  }

  // uploads/ 접두사 제거 후 합치기
  const withoutPrefix = normalized.replace(/^uploads\//, '')
  return path.join(UPLOAD_BASE_DIR, withoutPrefix)
}

/**
 * 파일 업로드 유틸리티
 * 문서: file_upload_logic_final.md 참고
 *
 * 파일 저장, 파일명 생성, 폴더 생성 로직을 담당합니다.
 */

import fs from 'fs/promises'
import path from 'path'
import { createHash, randomUUID } from 'crypto'
import { getFileType as getFileTypeFromConfig, getMimeType, getMaxFileSize, isPreviewable, getFileCategory } from '../config/fileTypes.js'
import { resolveUploadAbsolutePath, UPLOAD_BASE_DIR } from '../config/upload.js'

/**
 * 파일 타입 분류 (설정 파일 사용)
 * @param {string} extension - 파일 확장자 (소문자)
 * @returns {string} 파일 타입 (image, pdf, 3d_model 등)
 */
export function getFileType(extension) {
  return getFileTypeFromConfig(extension)
}

/**
 * MIME 타입 가져오기
 * @param {string} extension - 파일 확장자
 * @returns {string} MIME 타입
 */
export function getFileMimeType(extension) {
  return getMimeType(extension)
}

/**
 * 파일 타입별 최대 크기 가져오기
 * @param {string} fileType - 파일 타입
 * @returns {number} 최대 크기 (bytes)
 */
export function getFileMaxSize(fileType) {
  return getMaxFileSize(fileType)
}

/**
 * 파일 타입이 미리보기 가능한지 확인
 * @param {string} fileType - 파일 타입
 * @returns {boolean} 미리보기 가능 여부
 */
export function isFilePreviewable(fileType) {
  return isPreviewable(fileType)
}

/**
 * 파일 타입의 카테고리 가져오기
 * @param {string} fileType - 파일 타입
 * @returns {string} 카테고리
 */
export function getFileTypeCategory(fileType) {
  return getFileCategory(fileType)
}

/**
 * 파일 확장자 추출 (소문자로 정규화)
 * @param {string} filename - 파일명
 * @returns {string} 확장자 (예: 'jpg', 'pdf')
 */
export function extractExtension(filename) {
  if (!filename) {
    throw new Error('파일명은 필수입니다.')
  }

  const ext = path.extname(filename).toLowerCase().replace(/^\./, '')
  if (!ext) {
    throw new Error('파일 확장자를 찾을 수 없습니다.')
  }

  return ext
}

/**
 * 범용: 폴더 경로 생성 (uploads/{domain}/{category}/)
 * files 테이블 기반 업로드용
 *
 * @param {string} domain - 도메인 (ai, archive, parts 등)
 * @param {string} category - 카테고리 (documents, images, audio, video)
 * @param {{ dateFolder?: string }} [options] - dateFolder: 'YYYY-MM-DD' 형식 시 날짜 서브폴더 추가
 * @returns {string} 상대 경로
 */
export function generateFolderPath(domain, category, options = {}) {
  if (!domain || !category) {
    throw new Error('domain과 category는 필수입니다.')
  }
  const base = `uploads/${domain}/${category}/`
  if (options.dateFolder) {
    return `${base}${options.dateFolder}/`
  }
  return base
}

/**
 * 범용: 날짜시간+shortUuid 파일명 생성
 * {YYYYMMDDHHmmss}_{shortUuid}.{ext}
 *
 * @param {string} extension - 확장자
 * @returns {string} 생성된 파일명
 */
export function generateTimestampFilename(extension) {
  if (!extension) {
    throw new Error('확장자는 필수입니다.')
  }
  const ext = extension.toLowerCase().replace(/^\./, '')
  const now = new Date()
  const yyyymmddhhmmss = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0')
  const shortUuid = randomUUID().replace(/-/g, '').slice(0, 8)
  return `${yyyymmddhhmmss}_${shortUuid}.${ext}`
}

/**
 * 범용: content_hash (SHA256) 계산
 * 교차 도메인 중복 검사용
 *
 * @param {Buffer} buffer - 파일 버퍼
 * @returns {string} 64자 hex 해시
 */
export function computeContentHash(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Buffer는 필수입니다.')
  }
  return createHash('sha256').update(buffer).digest('hex')
}

/**
 * 부품 전용: 폴더 경로 생성 (도메인별 분리 가능)
 * - 기본: uploads/{대분류약어}-{C코드}/
 * - 도메인 전달 시: uploads/{domain}/{대분류약어}-{C코드}/
 *   (예: domain='parts' -> uploads/parts/ACP-R001/)
 * @param {string} categoryAbbr - 대분류 약어 (예: 'ACP', 'PAS')
 * @param {string} cCode - C 코드 (예: 'R001')
 * @param {string|null} domain - 도메인 식별자(옵션)
 * @returns {string} 상대 경로
 */
export function partsGenerateFolderPath(categoryAbbr, cCode, domain = null) {
  if (!categoryAbbr || !cCode) {
    throw new Error('대분류 약어와 C 코드는 필수입니다.')
  }

  const domainPrefix = domain ? `uploads/${domain}/` : 'uploads/'
  const folderName = `${categoryAbbr}-${cCode}`
  return `${domainPrefix}${folderName}/`
}

/**
 * 부품 전용: 자동 파일명 생성 (original_filename이 없을 때만 사용)
 * - 기본: NEXA-STUDIO-{seq}-{timestamp}.{ext}
 * - 도메인 전달 시: {DOMAIN}-STUDIO-{seq}-{timestamp}.{ext} (domain은 대문자로 변환)
 *   예: domain='parts' -> PARTS-STUDIO-1-...jpg
 *
 * @param {number} sequence - 순차 번호
 * @param {string} extension - 확장자
 * @param {string|null} domain - 도메인 식별자(옵션)
 * @returns {string} 생성된 파일명
 */
export function partsGenerateFilename(sequence, extension, domain = null) {
  if (sequence === undefined || sequence === null) {
    throw new Error('순차 번호는 필수입니다.')
  }
  if (!extension) {
    throw new Error('확장자는 필수입니다.')
  }

  const ext = extension.toLowerCase().replace(/^\./, '')
  const timestamp = Date.now()
  const prefix = domain ? `${String(domain).toUpperCase()}-STUDIO` : 'NEXA-STUDIO'
  return `${prefix}-${sequence}-${timestamp}.${ext}`
}

/**
 * 부품 전용: 원본 파일명에서 안전한 파일명 생성 (중복 방지)
 * 원본 파일명을 그대로 사용하되, 중복 시 시퀀스 번호 추가
 *
 * @param {string} originalFilename - 원본 파일명
 * @param {number} sequence - 중복 방지를 위한 시퀀스 번호 (기본값: 1)
 * @returns {string} 안전한 파일명
 */
export function partsCreateSafeFilename(originalFilename, sequence = 1) {
  if (!originalFilename) {
    throw new Error('원본 파일명은 필수입니다.')
  }

  // 확장자와 기본 파일명 분리
  const ext = path.extname(originalFilename)
  const baseName = path.basename(originalFilename, ext)

  // 시퀀스가 1이면 원본 파일명 그대로, 2 이상이면 시퀀스 번호 추가
  if (sequence === 1) {
    return originalFilename
  } else {
    return `${baseName}_${String(sequence).padStart(4, '0')}${ext}`
  }
}

/**
 * 폴더 생성 (없으면)
 * @param {string} folderPath - 상대 경로 (예: 'uploads/ACP-R001/')
 * @returns {Promise<string>} 절대 경로
 */
export async function ensureFolderExists(folderPath) {
  if (!folderPath) {
    throw new Error('폴더 경로는 필수입니다.')
  }

  // 상대 경로를 절대 경로로 변환
  const absolutePath = resolveUploadAbsolutePath(folderPath)

  try {
    await fs.mkdir(absolutePath, { recursive: true })
    return absolutePath
  } catch (error) {
    console.error(`[File Upload] 폴더 생성 실패: ${absolutePath}`, error)
    throw new Error(`폴더 생성 실패: ${error.message}`)
  }
}

/**
 * 파일 저장
 * @param {Buffer} fileBuffer - 파일 버퍼
 * @param {string} filePath - 저장할 파일 경로 (절대 경로)
 * @returns {Promise<void>}
 */
export async function saveFile(fileBuffer, filePath) {
  if (!fileBuffer) {
    throw new Error('파일 버퍼는 필수입니다.')
  }
  if (!filePath) {
    throw new Error('파일 경로는 필수입니다.')
  }

  try {
    // 폴더가 없으면 생성
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })

    // 파일 저장
    await fs.writeFile(filePath, fileBuffer)
  } catch (error) {
    console.error(`[File Upload] 파일 저장 실패: ${filePath}`, error)
    throw new Error(`파일 저장 실패: ${error.message}`)
  }
}

/**
 * 파일 삭제
 * @param {string} filePath - 삭제할 파일 경로 (상대 또는 절대)
 * @returns {Promise<void>}
 */
export async function deleteFile(filePath) {
  if (!filePath) {
    throw new Error('파일 경로는 필수입니다.')
  }

  // 상대 경로를 절대 경로로 변환
  const absolutePath = resolveUploadAbsolutePath(filePath)

  try {
    await fs.unlink(absolutePath)
  } catch (error) {
    // 파일이 없으면 무시 (이미 삭제됨)
    if (error.code !== 'ENOENT') {
      console.error(`[File Upload] 파일 삭제 실패: ${absolutePath}`, error)
      throw new Error(`파일 삭제 실패: ${error.message}`)
    }
  }
}

/**
 * 파일 경로 검증 (보안)
 * @param {string} filePath - 파일 경로
 * @returns {boolean} 유효한 경로인지 여부
 */
export function validateFilePath(filePath) {
  if (!filePath) {
    return false
  }

  // 절대 경로 사용 금지
  if (path.isAbsolute(filePath)) {
    return false
  }

  // 상대 경로 공격 방지 (.. 포함 시 거부)
  if (filePath.includes('..')) {
    return false
  }

  // uploads/로 시작해야 함
  if (!filePath.startsWith('uploads/')) {
    return false
  }

  return true
}

/**
 * 파일 크기 확인
 * @param {string} filePath - 파일 경로 (절대 경로)
 * @returns {Promise<number>} 파일 크기 (bytes)
 */
export async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath)
    return stats.size
  } catch (error) {
    console.error(`[File Upload] 파일 크기 확인 실패: ${filePath}`, error)
    throw new Error(`파일 크기 확인 실패: ${error.message}`)
  }
}

/**
 * 임시 파일 경로 생성
 * @param {string} filename - 원본 파일명
 * @returns {string} 임시 파일 경로 (예: 'uploads/_temp/{UUID}.{확장자}')
 */
export function generateTempFilePath(filename) {
  const ext = path.extname(filename).toLowerCase()
  const uuid = randomUUID()
  return `uploads/_temp/${uuid}${ext}`
}

/**
 * 임시 파일을 정식 폴더로 이동
 * @param {string} tempFilePath - 임시 파일 경로 (상대 경로)
 * @param {string} targetFolderPath - 대상 폴더 경로 (상대 경로, 예: 'uploads/ACP-R001/')
 * @param {string} targetFilename - 대상 파일명
 * @returns {Promise<string>} 이동된 파일의 상대 경로
 */
export async function moveTempFileToFolder(tempFilePath, targetFolderPath, targetFilename) {
  if (!tempFilePath.startsWith('uploads/_temp/')) {
    throw new Error('임시 파일만 이동할 수 있습니다.')
  }
  if (!targetFilename || targetFilename.includes('..') || targetFilename.includes('/') || targetFilename.includes('\\')) {
    throw new Error('대상 파일명에 경로 구분자를 포함할 수 없습니다.')
  }

  // 절대 경로 변환
  const absoluteTempPath = resolveUploadAbsolutePath(tempFilePath)
  const absoluteTargetFolder = resolveUploadAbsolutePath(targetFolderPath)

  const absoluteTargetPath = path.join(absoluteTargetFolder, targetFilename)

  try {
    // 대상 폴더 생성
    await fs.mkdir(absoluteTargetFolder, { recursive: true })

    // 파일 이동
    await fs.rename(absoluteTempPath, absoluteTargetPath)

    // 상대 경로 반환
    return `${targetFolderPath}${targetFilename}`
  } catch (error) {
    console.error(`[File Upload] 임시 파일 이동 실패: ${tempFilePath} -> ${absoluteTargetPath}`, error)
    throw new Error(`임시 파일 이동 실패: ${error.message}`)
  }
}

/**
 * 오래된 임시 파일 정리 (24시간 이상 된 파일 삭제)
 * @param {number} maxAgeHours - 최대 보관 시간 (시간 단위, 기본값: 24)
 * @returns {Promise<number>} 삭제된 파일 수
 */
export async function cleanupOldTempFiles(maxAgeHours = 24) {
  const tempFolderPath = path.join(UPLOAD_BASE_DIR, '_temp')
  let deletedCount = 0

  try {
    // 임시 폴더가 없으면 스킵
    try {
      await fs.access(tempFolderPath)
    } catch {
      return 0
    }

    const files = await fs.readdir(tempFolderPath)
    const now = Date.now()
    const maxAge = maxAgeHours * 60 * 60 * 1000 // 밀리초로 변환

    for (const file of files) {
      const filePath = path.join(tempFolderPath, file)
      try {
        const stats = await fs.stat(filePath)
        const fileAge = now - stats.mtimeMs

        if (fileAge > maxAge) {
          await fs.unlink(filePath)
          deletedCount++
          console.log(`[Temp Cleanup] 오래된 임시 파일 삭제: ${file} (${Math.round(fileAge / 1000 / 60 / 60)}시간 전)`)
        }
      } catch (error) {
        console.warn(`[Temp Cleanup] 파일 처리 실패: ${file}`, error.message)
      }
    }

    if (deletedCount > 0) {
      console.log(`[Temp Cleanup] 총 ${deletedCount}개의 오래된 임시 파일이 삭제되었습니다.`)
    }

    return deletedCount
  } catch (error) {
    console.error(`[Temp Cleanup] 임시 파일 정리 실패:`, error)
    return deletedCount
  }
}

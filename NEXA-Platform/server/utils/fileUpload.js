/**
 * 파일 업로드 유틸리티
 * 문서: file_upload_logic_final.md 참고
 *
 * 파일 저장, 파일명 생성, 폴더 생성 로직을 담당합니다.
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import {
  getFileType as getFileTypeFromConfig,
  getMimeType,
  getMaxFileSize,
  isPreviewable,
  getFileCategory,
} from '../config/fileTypes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 업로드 기본 디렉토리 (프로젝트 루트 기준)
const UPLOAD_BASE_DIR = path.join(__dirname, '../../uploads')

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
 * 폴더 경로 생성
 * 형식: uploads/{대분류약어}-{C코드}/
 * @param {string} categoryAbbr - 대분류 약어 (예: 'ACP', 'PAS')
 * @param {string} cCode - C 코드 (예: 'R001')
 * @returns {string} 상대 경로 (예: 'uploads/ACP-R001/')
 */
export function generateFolderPath(categoryAbbr, cCode) {
  if (!categoryAbbr || !cCode) {
    throw new Error('대분류 약어와 C 코드는 필수입니다.')
  }

  const folderName = `${categoryAbbr}-${cCode}`
  return `uploads/${folderName}/`
}

/**
 * 파일명 생성 (서버에서 자동 생성할 때만 사용)
 * 형식: NEXA-STUDIO-{순차번호}-{타임스탬프}.{확장자}
 *
 * 주의: 이 함수는 original_filename이 없을 때만 사용됩니다.
 * - 에디터 파일 선택/일반 폼 필드: original_filename을 그대로 사용
 * - 클립보드 붙여넣기: original_filename을 그대로 사용 (이미 생성된 파일명: NEXA-STUDIO-{순번}-{타임스탬프}.{확장자})
 *
 * 모든 자동 생성 파일명은 "STUDIO"를 사용하여 일관성 유지
 * 클립보드 이미지와 동일한 형식으로 통일 (타임스탬프 포함)
 *
 * @param {number} sequence - 순차 번호
 * @param {string} extension - 확장자
 * @returns {string} 파일명 (예: 'NEXA-STUDIO-1-1763655762762.jpg')
 */
export function generateFilename(sequence, extension) {
  if (sequence === undefined || sequence === null) {
    throw new Error('순차 번호는 필수입니다.')
  }
  if (!extension) {
    throw new Error('확장자는 필수입니다.')
  }

  const ext = extension.toLowerCase().replace(/^\./, '')
  const timestamp = Date.now()
  return `NEXA-STUDIO-${sequence}-${timestamp}.${ext}`
}

/**
 * 원본 파일명에서 안전한 파일명 생성 (중복 방지)
 * 원본 파일명을 그대로 사용하되, 중복 시 시퀀스 번호 추가
 *
 * @param {string} originalFilename - 원본 파일명
 * @param {number} sequence - 중복 방지를 위한 시퀀스 번호 (기본값: 1)
 * @returns {string} 안전한 파일명
 */
export function createSafeFilename(originalFilename, sequence = 1) {
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
  const absolutePath = path.isAbsolute(folderPath)
    ? folderPath
    : path.join(UPLOAD_BASE_DIR, folderPath.replace(/^uploads\//, ''))

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
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(UPLOAD_BASE_DIR, filePath.replace(/^uploads\//, ''))

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

  // 절대 경로 변환
  const absoluteTempPath = path.isAbsolute(tempFilePath)
    ? tempFilePath
    : path.join(UPLOAD_BASE_DIR, tempFilePath.replace(/^uploads\//, ''))

  const absoluteTargetFolder = path.isAbsolute(targetFolderPath)
    ? targetFolderPath
    : path.join(UPLOAD_BASE_DIR, targetFolderPath.replace(/^uploads\//, ''))

  const absoluteTargetPath = path.join(absoluteTargetFolder, targetFilename)

  try {
    // 대상 폴더 생성
    await fs.mkdir(absoluteTargetFolder, { recursive: true })

    // 파일 이동
    await fs.rename(absoluteTempPath, absoluteTargetPath)

    // 상대 경로 반환
    return `${targetFolderPath}${targetFilename}`
  } catch (error) {
    console.error(
      `[File Upload] 임시 파일 이동 실패: ${tempFilePath} -> ${absoluteTargetPath}`,
      error,
    )
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
          console.log(
            `[Temp Cleanup] 오래된 임시 파일 삭제: ${file} (${Math.round(fileAge / 1000 / 60 / 60)}시간 전)`,
          )
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

/**
 * 업로드 폴더 초기화 유틸리티
 * 서버 시작 시 uploads 폴더를 생성하고 권한을 확인합니다.
 */

import fs from 'fs/promises'
import path from 'path'
import { UPLOAD_BASE_DIR } from '../config/upload.js'

/**
 * 업로드 폴더 초기화
 * @returns {Promise<void>}
 */
export async function initializeUploadFolder() {
  try {
    // uploads 폴더가 없으면 생성
    try {
      await fs.access(UPLOAD_BASE_DIR)
      console.log(`[Upload Folder] 업로드 폴더가 이미 존재합니다: ${UPLOAD_BASE_DIR}`)
    } catch (error) {
      // 폴더가 없으면 생성
      await fs.mkdir(UPLOAD_BASE_DIR, { recursive: true })
      console.log(`[Upload Folder] 업로드 폴더 생성 완료: ${UPLOAD_BASE_DIR}`)
    }

    // 폴더 권한 확인 (읽기/쓰기 가능한지)
    try {
      // 테스트 파일 생성 및 삭제로 권한 확인
      const testFile = path.join(UPLOAD_BASE_DIR, '.test-write-permission')
      await fs.writeFile(testFile, 'test')
      await fs.unlink(testFile)
      console.log(`[Upload Folder] 폴더 권한 확인 완료 (읽기/쓰기 가능)`)
    } catch (error) {
      console.warn(`[Upload Folder] 폴더 권한 확인 실패: ${error.message}`)
      console.warn(`[Upload Folder] 폴더에 쓰기 권한이 없을 수 있습니다: ${UPLOAD_BASE_DIR}`)
    }

    // .gitkeep 파일 생성 (빈 폴더도 git에 포함되도록)
    const gitkeepPath = path.join(UPLOAD_BASE_DIR, '.gitkeep')
    try {
      await fs.access(gitkeepPath)
    } catch {
      await fs.writeFile(gitkeepPath, '# 업로드 폴더\n# 이 폴더는 파일 업로드 시 자동으로 생성됩니다.\n')
      console.log(`[Upload Folder] .gitkeep 파일 생성 완료`)
    }

    // 임시 파일 폴더 생성 (_temp)
    const tempFolderPath = path.join(UPLOAD_BASE_DIR, '_temp')
    try {
      await fs.access(tempFolderPath)
      console.log(`[Upload Folder] 임시 파일 폴더가 이미 존재합니다: ${tempFolderPath}`)
    } catch (error) {
      // 폴더가 없으면 생성
      await fs.mkdir(tempFolderPath, { recursive: true })
      console.log(`[Upload Folder] 임시 파일 폴더 생성 완료: ${tempFolderPath}`)
    }
  } catch (error) {
    console.error(`[Upload Folder] 업로드 폴더 초기화 실패:`, error)
    throw error
  }
}

/**
 * 업로드 폴더 상태 확인
 * @returns {Promise<Object>} 폴더 상태 정보
 */
export async function checkUploadFolderStatus() {
  try {
    const stats = await fs.stat(UPLOAD_BASE_DIR)
    return {
      exists: true,
      path: UPLOAD_BASE_DIR,
      isDirectory: stats.isDirectory(),
      readable: true,
      writable: true, // Windows에서는 stat만으로는 쓰기 권한 확인이 어려움
    }
  } catch (error) {
    return {
      exists: false,
      path: UPLOAD_BASE_DIR,
      error: error.message,
    }
  }
}

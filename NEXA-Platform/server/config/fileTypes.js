/**
 * 파일 타입 설정 (서버)
 *
 * 파일 타입별 확장자, MIME 타입, 카테고리, 크기 제한, 아이콘 등을 정의합니다.
 * 프론트엔드의 src/config/fileTypes.js와 동일한 구조를 유지합니다.
 * 새로운 파일 타입 추가 시 이 파일과 프론트엔드 파일 모두 수정해야 합니다.
 *
 * 아이콘 설정:
 * - Material Icons: 'image', 'picture_as_pdf' 등 (문자열)
 * - 상대 경로 이미지: '/icons/image.png', '/icons/pdf.png' 등 (public/icons/ 폴더 기준)
 * - 절대 URL 이미지: 'http://...' 또는 'https://...'로 시작하는 문자열
 * - 프론트엔드와 동일한 아이콘 값을 사용하여 일관성 유지
 */

export const FILE_TYPE_CONFIG = {
  image: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/x-icon',
    ],
    category: 'media',
    previewable: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    description: '이미지 파일',
    icon: '/icons/image.png', // public/icons/image.png 파일 사용 (프론트엔드와 동일하게 유지)
  },
  pdf: {
    extensions: ['pdf'],
    mimeTypes: ['application/pdf'],
    category: 'document',
    previewable: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    description: 'PDF 문서',
    icon: '/icons/pdf.png', // public/icons/pdf.png 파일 사용 (프론트엔드와 동일하게 유지)
  },
  '3d_model': {
    extensions: ['stl', 'obj', 'step', 'iges', '3mf', 'ply'],
    mimeTypes: [
      'model/stl',
      'model/obj',
      'application/step',
      'model/iges',
      'model/3mf',
      'model/ply',
    ],
    category: 'model',
    previewable: false,
    maxSize: 100 * 1024 * 1024, // 100MB
    description: '3D 모델 파일',
    icon: '/icons/3d_model.png', // public/icons/3d_model.png 파일 사용 (프론트엔드와 동일하게 유지)
  },
  document: {
    extensions: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf'],
    mimeTypes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/rtf',
    ],
    category: 'document',
    previewable: true,
    maxSize: 20 * 1024 * 1024, // 20MB
    description: '문서 파일',
    icon: '/icons/document.png', // public/icons/document.png 파일 사용 (프론트엔드와 동일하게 유지)
  },
  archive: {
    extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'],
    mimeTypes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-bzip2',
      'application/x-xz',
    ],
    category: 'archive',
    previewable: false,
    maxSize: 100 * 1024 * 1024, // 100MB
    description: '압축 파일',
    icon: '/icons/archive.png', // public/icons/archive.png 파일 사용 (프론트엔드와 동일하게 유지)
  },
  video: {
    extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'],
    mimeTypes: [
      'video/mp4',
      'video/x-msvideo',
      'video/quicktime',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/webm',
      'video/x-matroska',
    ],
    category: 'media',
    previewable: true,
    maxSize: 500 * 1024 * 1024, // 500MB
    description: '비디오 파일',
    icon: '/icons/video.png', // public/icons/video.png 파일 사용 (프론트엔드와 동일하게 유지)
  },
  audio: {
    extensions: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'],
    mimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/flac',
      'audio/aac',
      'audio/mp4',
      'audio/x-ms-wma',
    ],
    category: 'media',
    previewable: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    description: '오디오 파일',
    icon: '/icons/audio.png', // public/icons/audio.png 파일 사용 (프론트엔드와 동일하게 유지)
  },
  other: {
    extensions: [],
    mimeTypes: [],
    category: 'other',
    previewable: false,
    maxSize: 10 * 1024 * 1024, // 10MB (기본값)
    description: '기타 파일',
    icon: '/icons/file.png', // public/icons/file.png 파일 사용 (프론트엔드와 동일하게 유지)
  },
}

/**
 * 확장자로 파일 타입 찾기
 * @param {string} extension - 파일 확장자 (소문자, 점 제거)
 * @returns {string} 파일 타입 (image, pdf, 3d_model 등)
 */
export function getFileType(extension) {
  const ext = extension.toLowerCase().replace(/^\./, '')

  // 각 파일 타입의 확장자 목록에서 찾기
  for (const [type, config] of Object.entries(FILE_TYPE_CONFIG)) {
    if (config.extensions.includes(ext)) {
      return type
    }
  }

  // 찾지 못하면 'other' 반환
  return 'other'
}

/**
 * 확장자로 MIME 타입 찾기
 * @param {string} extension - 파일 확장자
 * @returns {string} MIME 타입 (기본값: 'application/octet-stream')
 */
export function getMimeType(extension) {
  const ext = extension.toLowerCase().replace(/^\./, '')
  const fileType = getFileType(ext)
  const config = FILE_TYPE_CONFIG[fileType]

  if (!config || config.mimeTypes.length === 0) {
    return 'application/octet-stream'
  }

  // 확장자에 맞는 MIME 타입 찾기 (간단한 매핑)
  const mimeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    stl: 'model/stl',
    obj: 'model/obj',
    step: 'application/step',
  }

  return mimeMap[ext] || config.mimeTypes[0] || 'application/octet-stream'
}

/**
 * 파일 타입별 최대 크기 가져오기
 * @param {string} fileType - 파일 타입
 * @returns {number} 최대 크기 (bytes)
 */
export function getMaxFileSize(fileType) {
  const config = FILE_TYPE_CONFIG[fileType]
  return config ? config.maxSize : FILE_TYPE_CONFIG.other.maxSize
}

/**
 * 파일 타입이 미리보기 가능한지 확인
 * @param {string} fileType - 파일 타입
 * @returns {boolean} 미리보기 가능 여부
 */
export function isPreviewable(fileType) {
  const config = FILE_TYPE_CONFIG[fileType]
  return config ? config.previewable : false
}

/**
 * 파일 타입의 카테고리 가져오기
 * @param {string} fileType - 파일 타입
 * @returns {string} 카테고리 (media, document, model, archive, other)
 */
export function getFileCategory(fileType) {
  const config = FILE_TYPE_CONFIG[fileType]
  return config ? config.category : 'other'
}

/**
 * 모든 파일 타입 목록 가져오기
 * @returns {Array<string>} 파일 타입 목록
 */
export function getAllFileTypes() {
  return Object.keys(FILE_TYPE_CONFIG)
}

/**
 * 특정 카테고리의 파일 타입 목록 가져오기
 * @param {string} category - 카테고리
 * @returns {Array<string>} 파일 타입 목록
 */
export function getFileTypesByCategory(category) {
  return Object.entries(FILE_TYPE_CONFIG)
    .filter(([, config]) => config.category === category)
    .map(([type]) => type)
}

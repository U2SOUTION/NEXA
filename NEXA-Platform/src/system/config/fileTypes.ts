/**
 * 파일 타입 설정 (프론트엔드)
 *
 * 파일 타입별 확장자, MIME 타입, 카테고리, 크기 제한, 아이콘 등을 정의합니다.
 * 서버의 server/config/fileTypes.js와 동일한 구조를 유지합니다.
 * 새로운 파일 타입 추가 시 이 파일과 서버 파일 모두 수정해야 합니다.
 *
 * 아이콘 설정:
 * - Material Icons: 'image', 'picture_as_pdf' 등 (문자열)
 * - 상대 경로 이미지: '/icons/image.png', '/icons/pdf.png' 등 (public/icons/ 폴더 기준)
 * - 절대 URL 이미지: 'http://...' 또는 'https://...'로 시작하는 문자열
 * - URL이면 자동으로 <img> 태그로 렌더링, 아니면 Material Icons로 렌더링
 *
 * 커스텀 아이콘 사용 예시:
 *   icon: '/icons/pdf.png'  // public/icons/pdf.png 파일 사용
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
    icon: '/icons/image.png', // public/icons/image.png 파일 사용
    color: '#4CAF50', // 초록색
  },
  pdf: {
    extensions: ['pdf'],
    mimeTypes: ['application/pdf'],
    category: 'document',
    previewable: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    description: 'PDF 문서',
    icon: '/icons/pdf.png', // public/icons/pdf.png 파일 사용
    color: '#F44336', // 빨간색
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
    icon: '/icons/3d_model.png', // public/icons/3d_model.png 파일 사용
    color: '#9C27B0', // 보라색
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
    icon: '/icons/document.png', // public/icons/document.png 파일 사용
    color: '#2196F3', // 파란색
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
    icon: '/icons/archive.png', // public/icons/archive.png 파일 사용
    color: '#ff3333', // 핑크
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
    icon: '/icons/video.png', // public/icons/video.png 파일 사용
    color: '#E91E63', // 분홍색
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
    icon: '/icons/audio.png', // public/icons/audio.png 파일 사용
    color: '#00BCD4', // 청록색
  },
  other: {
    extensions: [],
    mimeTypes: [],
    category: 'other',
    previewable: false,
    maxSize: 10 * 1024 * 1024, // 10MB (기본값)
    description: '기타 파일',
    icon: '/icons/file.png', // public/icons/file.png 파일 사용
    color: '#9E9E9E', // 회색
  },
} as const

export type FileTypeKey = keyof typeof FILE_TYPE_CONFIG

/**
 * 확장자로 파일 타입 찾기
 * @param {string} extension - 파일 확장자 (소문자, 점 제거)
 * @returns {string} 파일 타입 (image, pdf, 3d_model 등)
 */
export function getFileType(extension: string): FileTypeKey {
  const ext = extension.toLowerCase().replace(/^\./, '')

  // 각 파일 타입의 확장자 목록에서 찾기
  for (const [type, config] of Object.entries(FILE_TYPE_CONFIG)) {
    if ((config.extensions as readonly string[]).includes(ext)) {
      return type as FileTypeKey
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
export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase().replace(/^\./, '')
  const fileType = getFileType(ext)
  const config = FILE_TYPE_CONFIG[fileType]

  if (!config || config.mimeTypes.length === 0) {
    return 'application/octet-stream'
  }

  // 확장자에 맞는 MIME 타입 찾기 (간단한 매핑)
  const mimeMap: Record<string, string> = {
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

  return (mimeMap[ext] ?? config.mimeTypes[0]) || 'application/octet-stream'
}

/**
 * 파일 타입별 최대 크기 가져오기
 * @param {string} fileType - 파일 타입
 * @returns {number} 최대 크기 (bytes)
 */
export function getMaxFileSize(fileType: FileTypeKey): number {
  const config = FILE_TYPE_CONFIG[fileType]
  return config ? config.maxSize : FILE_TYPE_CONFIG.other.maxSize
}

/**
 * 파일 타입이 미리보기 가능한지 확인
 * @param {string} fileType - 파일 타입
 * @returns {boolean} 미리보기 가능 여부
 */
export function isPreviewable(fileType: FileTypeKey): boolean {
  const config = FILE_TYPE_CONFIG[fileType]
  return config ? config.previewable : false
}

/**
 * 파일 타입의 카테고리 가져오기
 * @param {string} fileType - 파일 타입
 * @returns {string} 카테고리 (media, document, model, archive, other)
 */
export function getFileCategory(fileType: FileTypeKey): string {
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
export function getFileTypesByCategory(category: string): string[] {
  return Object.entries(FILE_TYPE_CONFIG)
    .filter(([, config]) => config.category === category)
    .map(([type]) => type)
}

/**
 * 파일 타입별 아이콘 가져오기
 * @param {string} fileType - 파일 타입
 * @returns {string} 아이콘 (Material Icons 이름 또는 URL)
 */
export function getFileIconByType(fileType: FileTypeKey): string {
  const config = FILE_TYPE_CONFIG[fileType]
  return config ? config.icon : FILE_TYPE_CONFIG.other.icon
}

/**
 * 확장자로 파일 아이콘 가져오기
 * @param {string} extension - 파일 확장자
 * @returns {string} 아이콘 (Material Icons 이름 또는 URL)
 */
export function getFileIconByExtension(extension: string): string {
  const fileType = getFileType(extension)
  return getFileIconByType(fileType)
}

/**
 * MIME 타입으로 파일 아이콘 가져오기
 * @param {string} mimeType - MIME 타입
 * @returns {string} 아이콘 (Material Icons 이름 또는 URL)
 */
export function getFileIconByMimeType(mimeType: string): string {
  if (!mimeType) return FILE_TYPE_CONFIG.other.icon

  // MIME 타입으로 파일 타입 찾기
  for (const [, config] of Object.entries(FILE_TYPE_CONFIG)) {
    if ((config.mimeTypes as readonly string[]).includes(mimeType)) {
      return config.icon
    }
  }

  // MIME 타입의 기본 타입으로 추정
  if (mimeType.startsWith('image/')) {
    return FILE_TYPE_CONFIG.image.icon
  }
  if (mimeType.startsWith('video/')) {
    return FILE_TYPE_CONFIG.video.icon
  }
  if (mimeType.startsWith('audio/')) {
    return FILE_TYPE_CONFIG.audio.icon
  }

  return FILE_TYPE_CONFIG.other.icon
}

/**
 * 파일 객체로 아이콘 가져오기 (가장 편리한 함수)
 * file_mime_type, file_type, file_extension, original_filename 순서로 확인
 * @param {Object} file - 파일 객체
 * @returns {string} 아이콘 (Material Icons 이름 또는 URL)
 */
export function getFileIcon(file: { file_mime_type?: string; file_type?: string; file_extension?: string; original_filename?: string } | null | undefined): string {
  if (!file) return FILE_TYPE_CONFIG.other.icon

  // file_mime_type 우선 확인
  if (file.file_mime_type) {
    const icon = getFileIconByMimeType(file.file_mime_type)
    if (icon) return icon
  }

  if (file.file_type) {
    const type = String(file.file_type).toLowerCase().trim() as FileTypeKey
    const icon = type in FILE_TYPE_CONFIG ? getFileIconByType(type) : FILE_TYPE_CONFIG.other.icon
    if (icon) return icon
  }

  // file_extension 확인
  if (file.file_extension) {
    const extension = String(file.file_extension).toLowerCase().trim()
    const icon = getFileIconByExtension(extension)
    if (icon) return icon
  }

  // original_filename에서 확장자 추출
  if (file.original_filename) {
    const filename = String(file.original_filename).toLowerCase()
    const extension = filename.split('.').pop() || ''
    if (extension) {
      const icon = getFileIconByExtension(extension)
      if (icon) return icon
    }
  }

  return FILE_TYPE_CONFIG.other.icon
}

/**
 * 아이콘이 URL인지 확인 (상대 경로 또는 절대 URL)
 * @param {string} icon - 아이콘 문자열
 * @returns {boolean} URL 여부 (상대 경로 /icons/ 또는 http/https로 시작)
 */
export function isIconUrl(icon: string | null | undefined): boolean {
  if (!icon || typeof icon !== 'string') return false
  // 상대 경로 (/icons/...) 또는 절대 URL (http://, https://)
  return icon.startsWith('/icons/') || icon.startsWith('http://') || icon.startsWith('https://')
}

/**
 * 파일 타입별 색상 가져오기
 * @param {object} file - 파일 객체 (file_mime_type, file_type, file_extension, original_filename 포함)
 * @returns {string} 색상 코드 (hex)
 */
export function getFileColor(file: { file_mime_type?: string; file_type?: string; file_extension?: string; original_filename?: string } | null | undefined): string {
  if (!file) return FILE_TYPE_CONFIG.other.color

  // file_mime_type 우선 확인
  if (file.file_mime_type) {
    const mimeType = String(file.file_mime_type).toLowerCase().trim()
    for (const [, config] of Object.entries(FILE_TYPE_CONFIG)) {
      if ((config.mimeTypes as readonly string[]).includes(mimeType)) {
        return config.color
      }
    }
  }

  // file_type 확인
  if (file.file_type) {
    const type = String(file.file_type).toLowerCase().trim() as FileTypeKey
    const config = type in FILE_TYPE_CONFIG ? FILE_TYPE_CONFIG[type] : undefined
    if (config) return config.color
  }

  // file_extension 확인
  let extension = ''
  if (file.file_extension) {
    extension = String(file.file_extension).toLowerCase().trim()
  } else if (file.original_filename) {
    extension = file.original_filename.split('.').pop()?.toLowerCase() || ''
  }

  if (extension) {
    for (const [, config] of Object.entries(FILE_TYPE_CONFIG)) {
      if ((config.extensions as readonly string[]).includes(extension)) {
        return config.color
      }
    }
  }

  return FILE_TYPE_CONFIG.other.color
}

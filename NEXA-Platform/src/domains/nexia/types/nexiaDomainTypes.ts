/**
 * AI 도메인 공통 타입 정의
 */

/** 파일 API에서 반환하는 자산 아이템 */
export interface NexiaAssetItem {
  id: number
  original_name: string
  url: string
  file_path?: string
}

/** 채널 (채팅 그룹) */
export interface Channel {
  id: string
  name: string
  chats: Chat[]
  instruction?: string
}

/** 대화 (채팅 세션) */
export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  instruction?: string
}

export interface ChatMessage {
  role: string
  content?: string
  [key: string]: unknown
}

/** 탐색기 파일 선택 API 파일 객체 */
export interface ExplorerFile {
  id?: number
  original_name?: string
  url?: string
  file_path?: string
  category?: string
  file_type?: string
  [key: string]: unknown
}

/** 업로드 진행률 항목 */
export interface UploadProgressItem {
  name: string
  progress: number
  completed?: boolean
  error?: string
  speed?: string
  eta?: string
}

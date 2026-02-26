/**
 * AI 도메인 패널 ID → 컴포넌트 매핑.
 */
import AiChatPanel from '../components/AiChatPanel.vue'
import AiEditorPanel from '../components/AiEditorPanel.vue'
import AiCodeEditorPanel from '../components/AiCodeEditorPanel.vue'
import AiImageEditorPanel from '../components/AiImageEditorPanel.vue'
import AiAudioEditorPanel from '../components/AiAudioEditorPanel.vue'
import AiVideoEditorPanel from '../components/AiVideoEditorPanel.vue'
import AiExplorerPanel from '../components/AiExplorerPanel.vue'

export const PANEL_LABELS: Record<string, string> = {
  chat: '채팅',
  editor: '에디터',
  code: '코드',
  image: '이미지',
  audio: '음원',
  video: '영상',
  explorer: '탐색기',
}

export const PANEL_ICONS: Record<string, string> = {
  chat: 'chat',
  editor: 'edit_note',
  code: 'code',
  image: 'image',
  audio: 'graphic_eq',
  video: 'videocam',
  explorer: 'folder_open',
}

export const PANEL_COMPONENTS: Record<string, object> = {
  chat: AiChatPanel,
  editor: AiEditorPanel,
  code: AiCodeEditorPanel,
  image: AiImageEditorPanel,
  audio: AiAudioEditorPanel,
  video: AiVideoEditorPanel,
  explorer: AiExplorerPanel,
}

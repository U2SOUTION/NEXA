/**
 * AI 도메인 패널 ID → 컴포넌트 매핑.
 * 탭 네이밍: [NEXA-AI-03] §1.4 기준 (Dialogue, Narrative, Logic, Vision, Sense, Nexus, Explorer)
 * Vision: 이미지·음원·영상 통합, 하위 패널로 파일 타입별 분기.
 */
import AiChatPanel from '../components/AiChatPanel.vue'
import AiEditorPanel from '../components/AiEditorPanel.vue'
import AiCodeEditorPanel from '../components/AiCodeEditorPanel.vue'
import AiVisionPanel from '../components/AiVisionPanel.vue'
import AiExplorerPanel from '../components/AiExplorerPanel.vue'
import AiUniversalViewerPanel from '../components/AiUniversalViewerPanel.vue'
import AiNexusPanel from '../components/AiNexusPanel.vue'

export const PANEL_LABELS: Record<string, string> = {
  dialogue: 'Dialogue',
  narrative: 'Narrative',
  logic: 'Logic',
  vision: 'Vision',
  sense: 'Sense',
  nexus: 'Nexus',
  explorer: 'Explorer',
}

export const PANEL_ICONS: Record<string, string> = {
  dialogue: 'chat',
  narrative: 'edit_note',
  logic: 'code',
  vision: 'image',
  sense: 'visibility',
  nexus: 'account_tree',
  explorer: 'folder_open',
}

export const PANEL_COMPONENTS: Record<string, object> = {
  dialogue: AiChatPanel,
  narrative: AiEditorPanel,
  logic: AiCodeEditorPanel,
  vision: AiVisionPanel,
  sense: AiUniversalViewerPanel,
  nexus: AiNexusPanel,
  explorer: AiExplorerPanel,
}

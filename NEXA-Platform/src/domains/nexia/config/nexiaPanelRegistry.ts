/**
 * AI 도메인 패널 ID → 컴포넌트 매핑.
 * 주의: 내부 panelId는 하위 호환을 위해 유지하고, UI 라벨만 최신 탭 명칭으로 노출한다.
 * Aionos는 별도 패널 분리 전까지 이번 매핑에서 제외한다.
 */
import NexiaChatPanel from '../components/NexiaChatPanel.vue'
import NexiaEditorPanel from '../components/NexiaEditorPanel.vue'
import NexiaCodeEditorPanel from '../components/NexiaCodeEditorPanel.vue'
import NexiaMediaPanel from '../components/NexiaMediaPanel.vue'
import NexiaExplorerPanel from '../components/NexiaExplorerPanel.vue'
import NexiaUniversalViewerPanel from '../components/NexiaUniversalViewerPanel.vue'
import NexiaNexusPanel from '../components/NexiaNexusPanel.vue'

export const PANEL_LABELS: Record<string, string> = {
  dialogue: 'Cockpit',
  narrative: 'Ethos',
  logic: 'Glos',
  media: 'Physis',
  sense: 'Sense',
  nexus: 'Synapse',
  explorer: 'Navis',
}

export const PANEL_ICONS: Record<string, string> = {
  dialogue: 'chat',
  narrative: 'edit_note',
  logic: 'code',
  media: 'image',
  sense: 'visibility',
  nexus: 'account_tree',
  explorer: 'folder_open',
}

export const PANEL_COMPONENTS: Record<string, object> = {
  dialogue: NexiaChatPanel,
  narrative: NexiaEditorPanel,
  logic: NexiaCodeEditorPanel,
  media: NexiaMediaPanel,
  sense: NexiaUniversalViewerPanel,
  nexus: NexiaNexusPanel,
  explorer: NexiaExplorerPanel,
}

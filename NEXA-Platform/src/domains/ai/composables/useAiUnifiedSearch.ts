/**
 * AI 도메인 통합 검색·필터
 * 왼쪽 드로어에서 채널/메모/미디어/파일 검색을 단일 UI로 관리.
 * 타겟별 확장 가능한 구조.
 */
import { ref, watch } from 'vue'
import { useGlobalFileExplorer } from '@system/composables/useGlobalFileExplorer'

export type UnifiedSearchTarget = 'chat' | 'note' | 'media' | 'files'
export type ChatSearchTarget = 'both' | 'channel' | 'chat'

const searchQuery = ref('')
const searchTarget = ref<UnifiedSearchTarget>('chat')
const chatSearchTarget = ref<ChatSearchTarget>('both')

/** 통합 검색 타겟 옵션 (확장 시 여기에 추가) */
export const SEARCH_TARGET_OPTIONS: { value: UnifiedSearchTarget; icon: string; label: string }[] = [
  { value: 'chat', icon: 'chat', label: '채팅' },
  { value: 'note', icon: 'sticky_note_2', label: '노트' },
  { value: 'media', icon: 'photo_library', label: '미디어' },
  { value: 'files', icon: 'folder_open', label: '파일' },
]

/** 채팅 검색 하위 타겟 */
export const CHAT_SEARCH_TARGET_OPTIONS: { value: ChatSearchTarget; icon: string; label: string }[] = [
  { value: 'both', icon: 'view_list', label: '전체' },
  { value: 'channel', icon: 'folder', label: '채널' },
  { value: 'chat', icon: 'chat_bubble_outline', label: '대화' },
]

/** 파일 필터 정렬 옵션 */
export const FILE_SORT_OPTIONS = [
  { label: '최신순', value: 'date_desc' },
  { label: '오래된순', value: 'date_asc' },
  { label: '이름순', value: 'name_asc' },
  { label: '이름 역순', value: 'name_desc' },
  { label: '크기순', value: 'size_asc' },
  { label: '크기 역순', value: 'size_desc' },
]

/** 파일 필터 카테고리 옵션 */
export const FILE_CATEGORY_OPTIONS = [
  { label: '전체', value: '' },
  { label: '이미지', value: 'image' },
  { label: '문서', value: 'document' },
  { label: '오디오', value: 'audio' },
  { label: '영상', value: 'video' },
]

let channelsSearchQueryRef: { value: string } | null = null
let channelsSearchTargetRef: { value: string } | null = null

/** useAiChannels와 동기화용 등록 (AiLeftNav에서 호출) */
export function registerChannelsSync(searchQueryRef: { value: string }, searchTargetRef: { value: string }) {
  channelsSearchQueryRef = searchQueryRef
  channelsSearchTargetRef = searchTargetRef
  if (searchTarget.value === 'chat' || searchTarget.value === 'note' || searchTarget.value === 'media') {
    syncToChannels()
  }
}

function syncToChannels() {
  if (channelsSearchQueryRef) channelsSearchQueryRef.value = searchQuery.value
  if (channelsSearchTargetRef && searchTarget.value === 'chat') {
    channelsSearchTargetRef.value = chatSearchTarget.value
  }
}

function syncToFileExplorer() {
  if (searchTarget.value !== 'files') return
  const fe = useGlobalFileExplorer()
  fe.setSearchQuery(searchQuery.value || '')
}

watch(
  [searchQuery, searchTarget, chatSearchTarget],
  () => {
    if (searchTarget.value === 'chat' || searchTarget.value === 'note' || searchTarget.value === 'media') {
      syncToChannels()
    }
    if (searchTarget.value === 'files') {
      syncToFileExplorer()
    }
  },
  { immediate: true },
)

export function useAiUnifiedSearch() {
  const fe = useGlobalFileExplorer()

  function setSearchQuery(q: string) {
    searchQuery.value = q ?? ''
  }

  function setSearchTarget(target: UnifiedSearchTarget) {
    searchTarget.value = target
  }

  function setChatSearchTarget(target: ChatSearchTarget) {
    chatSearchTarget.value = target
    if (channelsSearchTargetRef) channelsSearchTargetRef.value = target
  }

  function setFileFilter(keys: { sortBy?: string; filterCategory?: string; scopeDomain?: string }) {
    if (keys.sortBy !== undefined) fe.sortBy.value = keys.sortBy
    if (keys.filterCategory !== undefined) fe.filterCategory.value = keys.filterCategory
    if (keys.scopeDomain !== undefined) fe.scopeDomain.value = keys.scopeDomain
  }

  return {
    searchQuery,
    searchTarget,
    chatSearchTarget,
    fileFiltersRefs: { sortBy: fe.sortBy, filterCategory: fe.filterCategory, scopeDomain: fe.scopeDomain },
    setSearchQuery,
    setSearchTarget,
    setChatSearchTarget,
    setFileFilter,
    fileExplorer: fe,
  }
}

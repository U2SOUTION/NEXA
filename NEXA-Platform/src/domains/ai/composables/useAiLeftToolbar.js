/**
 * useAiLeftToolbar - AI 왼쪽 패널 툴바·검색 폼 설정
 * 탭별 버튼 정의와 검색 폼을 중앙 관리. 모든 탭에서 공유 사용.
 *
 * @param {Object} ctx - { leftMainTab, searchQuery, searchTarget, showAddChannel, ... }
 * @returns {Object} { toolbarItems, toolbarLabel, searchPlaceholder, showSearchTargetMenu, searchTargetOptions }
 */
import { computed } from 'vue'

const SEARCH_TARGET_OPTIONS = [
  { value: 'both', icon: 'view_list', label: 'Both' },
  { value: 'channel', icon: 'folder', label: 'Channel' },
  { value: 'chat', icon: 'chat_bubble_outline', label: 'Chat' },
]

const TAB_SEARCH_PLACEHOLDERS = {
  chat: 'Search channels & chats',
  note: 'Search memos',
  media: '미디어 검색',
}

export function useAiLeftToolbar(ctx) {
  const toolbarLabel = computed(() => {
    const tab = ctx.leftMainTab?.value
    const labels = { chat: '채팅', note: '노트', media: '미디어' }
    return labels[tab] || 'TOOLbar'
  })

  const toolbarItems = computed(() => {
    const tab = ctx.leftMainTab?.value
    if (tab === 'chat') return getChatItems(ctx)
    if (tab === 'note') return getNoteItems(ctx)
    if (tab === 'media') return getMediaItems(ctx)
    return []
  })

  const searchPlaceholder = computed(() => {
    const tab = ctx.leftMainTab?.value
    return TAB_SEARCH_PLACEHOLDERS[tab] || 'Search'
  })

  const showSearchTargetMenu = computed(() => ctx.leftMainTab?.value === 'chat')

  const searchTargetOptions = computed(() =>
    SEARCH_TARGET_OPTIONS.map((opt) => ({
      ...opt,
      isActive: opt.value === (ctx.searchTarget?.value ?? 'both'),
      select: () => {
        if (ctx.searchTarget) ctx.searchTarget.value = opt.value
      },
    }))
  )

  const searchTargetIcon = computed(() => {
    const v = ctx.searchTarget?.value ?? 'both'
    return SEARCH_TARGET_OPTIONS.find((o) => o.value === v)?.icon ?? 'view_list'
  })

  return {
    toolbarItems,
    toolbarLabel,
    searchPlaceholder,
    showSearchTargetMenu,
    searchTargetOptions,
    searchTargetIcon,
  }
}

function getChatItems(ctx) {
  const items = []
  items.push({
    id: 'add',
    type: 'menu',
    icon: 'add',
    size: 'md',
    title: 'Add',
    menuItems: [
      { icon: 'folder', label: '채널 추가', onClick: () => { ctx.showAddChannel.value = true } },
      { icon: 'chat_bubble_outline', label: '대화 추가', onClick: ctx.handleAddChatFromToolbar },
    ],
  })
  const selChat = ctx.selectedChat?.value
  const selCh = ctx.selectedChannel?.value
  if (selChat) {
    items.push(
      { id: 'edit', type: 'button', icon: 'edit', title: 'Edit', size: 'sm', onClick: ctx.openEditChat },
      { id: 'up', type: 'button', icon: 'arrow_upward', title: 'Move up', size: 'sm', disabled: !ctx.canMoveChatUp?.value, onClick: () => ctx.moveChatUp(ctx.selectedChannelId.value, ctx.selectedChatId.value) },
      { id: 'down', type: 'button', icon: 'arrow_downward', title: 'Move down', size: 'sm', disabled: !ctx.canMoveChatDown?.value, onClick: () => ctx.moveChatDown(ctx.selectedChannelId.value, ctx.selectedChatId.value) },
      { id: 'delete', type: 'button', icon: 'delete_outline', title: 'Delete', size: 'sm', color: 'negative', onClick: () => ctx.confirmDeleteChat(ctx.selectedChannelId.value, selChat) },
    )
  } else if (selCh) {
    items.push(
      { id: 'edit', type: 'button', icon: 'edit', title: 'Edit', size: 'sm', onClick: ctx.openEditChannel },
      { id: 'up', type: 'button', icon: 'arrow_upward', title: 'Move up', size: 'sm', disabled: !ctx.canMoveChannelUp?.value, onClick: () => ctx.moveChannelUp(ctx.selectedChannelId.value) },
      { id: 'down', type: 'button', icon: 'arrow_downward', title: 'Move down', size: 'sm', disabled: !ctx.canMoveChannelDown?.value, onClick: () => ctx.moveChannelDown(ctx.selectedChannelId.value) },
      { id: 'delete', type: 'button', icon: 'delete_outline', title: 'Delete', size: 'sm', color: 'negative', onClick: () => ctx.confirmDeleteChannel(selCh) },
    )
  }
  return items
}

function getNoteItems(ctx) {
  return [
    { id: 'add', type: 'button', icon: 'add', size: 'md', title: '메모 추가 (에디터 열기)', onClick: ctx.handleNoteAdd },
    { id: 'edit', type: 'button', icon: 'edit', title: '편집 (에디터 열기)', size: 'sm', disabled: !ctx.selectedMemo?.value, onClick: ctx.handleNoteEdit },
    { id: 'up', type: 'button', icon: 'arrow_upward', title: '위로', size: 'sm', disabled: !ctx.canMoveMemoUp?.value, onClick: ctx.handleNoteMoveUp },
    { id: 'down', type: 'button', icon: 'arrow_downward', title: '아래로', size: 'sm', disabled: !ctx.canMoveMemoDown?.value, onClick: ctx.handleNoteMoveDown },
    { id: 'delete', type: 'button', icon: 'delete_outline', title: '삭제', size: 'sm', color: 'negative', disabled: !ctx.selectedMemo?.value, onClick: ctx.handleNoteDelete },
  ]
}

function getMediaItems(ctx) {
  return [
    { id: 'up', type: 'button', icon: 'arrow_upward', title: '위로', size: 'sm', disabled: !ctx.canMoveMediaUp?.value, onClick: ctx.handleMediaMoveUp },
    { id: 'down', type: 'button', icon: 'arrow_downward', title: '아래로', size: 'sm', disabled: !ctx.canMoveMediaDown?.value, onClick: ctx.handleMediaMoveDown },
    { id: 'delete', type: 'button', icon: 'delete_outline', title: '삭제', size: 'sm', color: 'negative', disabled: !ctx.selectedMediaItem?.value, onClick: ctx.handleMediaDelete },
  ]
}

<!-- ThemeManagerList.vue
  테마 색상 리스트 표시 및 관리 컴포넌트
  통계, 최근 사용, 즐겨찾기 탭 포함
-->
<template>
  <div class="theme-manager-list">
    <q-scroll-area class="list-scroll-area">
      <!-- 색상 리스트 아코디언 -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="palette" label="색상 리스트" default-opened class="colors-expansion">
          <q-tabs v-model="activeTab" dense class="colors-tabs" @update:model-value="handleTabChange">
            <q-tab name="recent" label="최근" icon="schedule" />
            <q-tab name="favorite" label="즐겨찾기" icon="star" />
          </q-tabs>

          <q-tab-panels v-model="activeTab" class="colors-tab-panels">
            <q-tab-panel name="recent" class="q-pa-sm">
              <div v-if="recentColors.length > 0" class="recent-colors-list">
                <div
                  v-for="(color, index) in recentColors"
                  :key="color.id"
                  :draggable="true"
                  class="recent-color-item"
                  :class="{ 'is-dragging': draggedIndex === index }"
                  @dragstart="handleDragStart(index, $event)"
                  @dragend="handleDragEnd"
                  @dragover.prevent
                  @dragenter.prevent="handleDragEnter(index)"
                  @drop="handleDrop(index, $event)"
                >
                  <div class="color-preview" :style="{ backgroundColor: color.value }" @click="handleColorClick(color, $event)"></div>
                  <div class="color-info" @click="handleColorClick(color, $event)">
                    <div class="color-name-row">
                      <span class="color-category">{{ getCategory(color.name) }}</span>
                      <span class="color-name">{{ getVariableNameWithoutCategory(color.name) }}</span>
                    </div>
                    <div class="color-value">{{ color.value }}</div>
                    <div class="color-time">{{ formatTime(color.timestamp) }}</div>
                  </div>
                  <q-btn flat dense round :icon="isFavorite(color.name) ? 'star' : 'star_border'" size="sm" :class="isFavorite(color.name) ? 'favorite-btn active' : 'favorite-btn'" @click.stop="handleToggleFavorite(color)" />
                  <q-btn flat dense round icon="close" size="sm" class="delete-btn" @click.stop="handleDeleteColor(color.id)" />
                </div>
              </div>
              <div v-else class="empty-state">
                <q-icon name="schedule" size="48px" class="q-mb-sm" />
                <div class="empty-message">최근 사용한 색상이 없습니다.</div>
                <div class="empty-hint">색상을 클릭하여 복사하면 여기에 표시됩니다.</div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="favorite" class="q-pa-sm">
              <div v-if="favoriteColors.length > 0" class="recent-colors-list">
                <div
                  v-for="(color, index) in favoriteColors"
                  :key="color.id"
                  :draggable="true"
                  class="recent-color-item"
                  :class="{ 'is-dragging': favoriteDraggedIndex === index }"
                  @dragstart="handleFavoriteDragStart(index, $event)"
                  @dragend="handleFavoriteDragEnd"
                  @dragover.prevent
                  @dragenter.prevent="handleFavoriteDragEnter(index)"
                  @drop="handleFavoriteDrop(index, $event)"
                >
                  <div class="color-preview" :style="{ backgroundColor: color.value }" @click="handleColorClick(color, $event)"></div>
                  <div class="color-info" @click="handleColorClick(color, $event)">
                    <div class="color-name-row">
                      <span class="color-category">{{ getCategory(color.name) }}</span>
                      <span class="color-name">{{ getVariableNameWithoutCategory(color.name) }}</span>
                    </div>
                    <div class="color-value">{{ color.value }}</div>
                    <div class="color-time">{{ formatTime(color.timestamp) }}</div>
                  </div>
                  <q-btn flat dense round icon="star" size="sm" class="favorite-btn active" @click.stop="handleToggleFavorite(color)" />
                  <q-btn flat dense round icon="close" size="sm" class="delete-btn" @click.stop="handleDeleteFavoriteColor(color.id)" />
                </div>
              </div>
              <div v-else class="empty-state">
                <q-icon name="star" size="48px" class="q-mb-sm" />
                <div class="empty-message">즐겨찾기 색상이 없습니다.</div>
                <div class="empty-hint">최근 색상 목록에서 별 아이콘을 클릭하여 즐겨찾기에 추가하세요.</div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-expansion-item>
      </div>

      <!-- 통계 아코디언 -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="analytics" label="통계" class="statistics-expansion">
          <div class="statistics-actions q-pa-sm">
            <q-btn outlined dense icon="analytics" label="전체 통계 분석" class="accordion-action-btn" @click="handleStatisticsAction('full-analysis')" />
            <q-btn outlined dense icon="trending_up" label="인기 색상" class="accordion-action-btn" @click="handleStatisticsAction('popular')" />
            <q-btn outlined dense icon="delete_outline" label="미사용 색상" class="accordion-action-btn" @click="handleStatisticsAction('unused')" />
            <q-btn outlined dense icon="description" label="파일별 사용 현황" class="accordion-action-btn" @click="handleStatisticsAction('by-file')" />
            <q-btn outlined dense icon="widgets" label="컴포넌트별 사용 현황" class="accordion-action-btn" @click="handleStatisticsAction('by-component')" />
            <q-btn outlined dense icon="category" label="카테고리별 통계" class="accordion-action-btn" @click="handleStatisticsAction('by-category')" />
          </div>
        </q-expansion-item>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { getRecentColors, removeRecentColor, reorderRecentColors } from '@domains/dev/modules/theme-manager/services/recentColorsManager'
import { getFavoriteColors, toggleFavoriteColor, removeFavoriteColor, reorderFavoriteColors } from '@domains/dev/modules/theme-manager/services/favoriteColorsManager'

const $q = useQuasar()

const props = defineProps({
  activeTab: {
    type: String,
    default: 'recent',
  },
  statisticsData: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['colorSelected', 'fileClicked', 'statisticsAction', 'tabChange'])

// 활성 탭 상태 (내부 관리)
const activeTab = ref(props.activeTab)

// 탭 변경 핸들러
function handleTabChange(value) {
  activeTab.value = value
  emit('tabChange', value)
}

// props.activeTab 변경 감시
watch(
  () => props.activeTab,
  (newTab) => {
    if (activeTab.value !== newTab) {
      activeTab.value = newTab
    }
    if (newTab === 'recent') {
      loadRecentColors()
    } else if (newTab === 'favorite') {
      loadFavoriteColors()
    }
  },
)

// 최근 색상 상태
const recentColors = ref([])
const draggedIndex = ref(-1)
const dragOverIndex = ref(-1)

// 즐겨찾기 색상 상태
const favoriteColors = ref([])
const favoriteDraggedIndex = ref(-1)
const favoriteDragOverIndex = ref(-1)

// "-- 제거 복사" 설정 상태
function getInitialRemoveDashValue() {
  try {
    const stored = localStorage.getItem('theme-manager-remove-dash-on-copy')
    return stored === 'true'
  } catch {
    return false
  }
}
const removeDashOnCopy = ref(getInitialRemoveDashValue())

// 최근 색상 로드
function loadRecentColors() {
  recentColors.value = getRecentColors()
}

// 최근 색상 변경 이벤트 리스너
function handleRecentColorsChanged(event) {
  recentColors.value = event.detail.colors || []
}

// "-- 제거 복사" 설정 변경 이벤트 리스너
function handleRemoveDashChanged(event) {
  removeDashOnCopy.value = event.detail.removeDash
}

// 색상 클릭 핸들러 (복사만 수행, 순서 변경 안 함)
async function handleColorClick(color, event) {
  // 변수명 복사 (키 조합에 따라 단계별 제거)
  await copyVariableName(color.name, event)

  // 오른쪽 패널에 색상 전달
  emit('colorSelected', color)
}

// 변수명을 클립보드에 복사
async function copyVariableName(variableName, event) {
  let textToCopy = variableName
  const isCtrlClick = event?.ctrlKey || event?.metaKey // Mac에서는 metaKey (Cmd)
  const isAltClick = event?.altKey

  // 키 조합에 따른 단계별 제거
  if (isCtrlClick || isAltClick) {
    // 접두사 '--' 제거 (0단계)
    let processed = variableName.startsWith('--') ? variableName.slice(2) : variableName

    // Strip이 체크되어 있고 Ctrl+클릭이면 1단계까지 제거
    const shouldRemoveLevel1 = isAltClick || (removeDashOnCopy.value && isCtrlClick)

    if (shouldRemoveLevel1) {
      // 1단계까지 제거 (--와 첫 번째 - 이전까지 제거)
      // 예: --nexa-primary-color -> primary-color
      const parts = processed.split('-')
      if (parts.length > 1) {
        // 첫 번째 부분(nexa) 제거, 나머지 결합
        processed = parts.slice(1).join('-')
      }
    }
    // Ctrl+클릭 (Strip 체크 안 함): 0단계만 (--만 제거, 이미 처리됨)

    textToCopy = processed
  } else {
    // 일반 클릭: 체크박스 옵션 확인
    if (removeDashOnCopy.value && variableName.startsWith('--')) {
      textToCopy = variableName.slice(2)
    }
  }

  const clickY = event?.clientY || 100
  const viewportHeight = window.innerHeight

  let position = 'top'
  if (clickY > (viewportHeight * 2) / 3) {
    position = 'bottom'
  }

  const showNotification = (message, type = 'positive') => {
    $q.notify({
      message,
      type,
      position,
      timeout: 2000,
      icon: 'content_copy',
      iconSize: '16px',
      actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
    })

    nextTick(() => {
      const notifyEl = document.querySelector('.q-notification')
      if (notifyEl) {
        if (event) {
          const clickX = event.clientX
          const clickY = event.clientY
          notifyEl.style.position = 'fixed'
          notifyEl.style.top = `${Math.min(clickY + 20, viewportHeight - 100)}px`
          notifyEl.style.left = `${Math.max(20, clickX - 150)}px`
          notifyEl.style.transform = 'none'
        }

        const closeBtn = notifyEl.querySelector('.q-btn')
        if (closeBtn) {
          closeBtn.style.width = '20px'
          closeBtn.style.height = '20px'
          closeBtn.style.minWidth = '20px'
          const closeIcon = closeBtn.querySelector('.q-icon')
          if (closeIcon) {
            closeIcon.style.fontSize = '14px'
          }
        }
      }
    })
  }

  try {
    await navigator.clipboard.writeText(textToCopy)
    showNotification(`${textToCopy}`)
  } catch {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = textToCopy
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showNotification(`${textToCopy}`)
    } catch {
      showNotification('복사 실패', 'negative')
    }
  }
}

// 색상 삭제 핸들러
function handleDeleteColor(colorId) {
  removeRecentColor(colorId)
  loadRecentColors()
}

// 즐겨찾기 색상 로드
function loadFavoriteColors() {
  favoriteColors.value = getFavoriteColors()
}

// 즐겨찾기 색상 변경 이벤트 리스너
function handleFavoriteColorsChanged(event) {
  favoriteColors.value = event.detail.colors || []
}

// 즐겨찾기 토글 핸들러
function handleToggleFavorite(color) {
  toggleFavoriteColor(color)
  // 즐겨찾기 목록 즉시 리로드하여 UI에 즉시 반영
  loadFavoriteColors()
}

// 즐겨찾기 여부 확인 (즐겨찾기 목록에서 직접 확인하여 즉시 반영)
function isFavorite(colorName) {
  return favoriteColors.value.some((color) => color.name === colorName)
}

// 즐겨찾기 색상 삭제 핸들러
function handleDeleteFavoriteColor(colorId) {
  removeFavoriteColor(colorId)
  loadFavoriteColors()
}

// 즐겨찾기 드래그 시작
function handleFavoriteDragStart(index, event) {
  favoriteDraggedIndex.value = index
  favoriteDragOverIndex.value = -1
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index.toString())
  event.target.style.opacity = '0.5'
}

// 즐겨찾기 드래그 종료
function handleFavoriteDragEnd(event) {
  favoriteDraggedIndex.value = -1
  favoriteDragOverIndex.value = -1
  event.target.style.opacity = '1'
}

// 즐겨찾기 드래그 오버
function handleFavoriteDragEnter(index) {
  if (favoriteDraggedIndex.value !== -1 && favoriteDraggedIndex.value !== index) {
    favoriteDragOverIndex.value = index
  }
}

// 즐겨찾기 드롭
function handleFavoriteDrop(dropIndex, event) {
  event.preventDefault()
  if (favoriteDraggedIndex.value === -1 || favoriteDraggedIndex.value === dropIndex) {
    return
  }

  reorderFavoriteColors(favoriteDraggedIndex.value, dropIndex)
  loadFavoriteColors()

  favoriteDraggedIndex.value = -1
  favoriteDragOverIndex.value = -1
}

// 드래그 시작
function handleDragStart(index, event) {
  draggedIndex.value = index
  dragOverIndex.value = -1
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index.toString())
  // 드래그 중 시각적 피드백
  event.target.style.opacity = '0.5'
}

// 드래그 종료
function handleDragEnd(event) {
  draggedIndex.value = -1
  dragOverIndex.value = -1
  event.target.style.opacity = '1'
}

// 드래그 오버
function handleDragEnter(index) {
  if (draggedIndex.value !== -1 && draggedIndex.value !== index) {
    dragOverIndex.value = index
  }
}

// 드롭
function handleDrop(dropIndex, event) {
  event.preventDefault()
  if (draggedIndex.value === -1 || draggedIndex.value === dropIndex) {
    return
  }

  reorderRecentColors(draggedIndex.value, dropIndex)
  loadRecentColors()

  draggedIndex.value = -1
  dragOverIndex.value = -1
}

// 변수명에서 카테고리 추출
function getCategory(varName) {
  // --nexa- 접두사 제거
  const name = varName.replace(/^--nexa-/, '')

  let category = ''

  // 하이픈이 없으면 전체를 카테고리로 (예: background)
  if (!name.includes('-')) {
    category = name
  } else {
    // 첫 번째 하이픈 전까지가 카테고리
    const parts = name.split('-')
    category = parts[0] || 'other'
  }

  // 첫 글자 대문자로 변환
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
}

// 카테고리를 제외한 변수명 부분 반환
function getVariableNameWithoutCategory(varName) {
  // --nexa- 접두사 제거
  const name = varName.replace(/^--nexa-/, '')

  // 하이픈이 없으면 빈 문자열
  if (!name.includes('-')) {
    return ''
  }

  // 첫 번째 하이픈 이후 부분 반환 (앞에 - 추가)
  const parts = name.split('-')
  if (parts.length > 1) {
    return '-' + parts.slice(1).join('-')
  }

  return ''
}

// 시간 포맷
function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 1분 이내
  if (diff < 60000) {
    return '방금 전'
  }
  // 1시간 이내
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}분 전`
  }
  // 24시간 이내
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}시간 전`
  }
  // 그 외
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${month}/${day} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// handleFileClick은 통계 탭 제거로 인해 현재 사용되지 않음 (향후 통계 기능에서 재사용 가능)
// function handleFileClick(filePath) {
//   emit('fileClicked', filePath)
// }

// 통계 액션 핸들러
function handleStatisticsAction(actionType) {
  emit('statisticsAction', actionType)
}

// 컴포넌트 마운트 시 최근 색상 및 즐겨찾기 로드, 이벤트 리스너 등록
onMounted(() => {
  loadRecentColors()
  loadFavoriteColors()
  window.addEventListener('recent-colors-changed', handleRecentColorsChanged)
  window.addEventListener('favorite-colors-changed', handleFavoriteColorsChanged)
  window.addEventListener('theme-manager-remove-dash-changed', handleRemoveDashChanged)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onBeforeUnmount(() => {
  window.removeEventListener('recent-colors-changed', handleRecentColorsChanged)
  window.removeEventListener('favorite-colors-changed', handleFavoriteColorsChanged)
  window.removeEventListener('theme-manager-remove-dash-changed', handleRemoveDashChanged)
})
</script>

<style lang="scss" scoped>
.theme-manager-list {
  height: 100%;
  display: flex;
  flex-direction: column;

  .list-scroll-area {
    flex: 1;
    height: 100%;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    color: var(--nexa-text-secondary);

    .empty-message {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      color: var(--nexa-text-secondary);
    }

    .empty-hint {
      font-size: 0.75rem;
      color: var(--nexa-text-hint);
    }
  }

  .stat-item {
    padding: 0.75rem;
    background-color: var(--nexa-item-bg);
    border: 1px solid var(--nexa-item-border);
    border-radius: 6px;

    .stat-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;

      .color-preview {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        border: 1px solid var(--nexa-border-color);
        flex-shrink: 0;
      }

      .stat-info {
        flex: 1;

        .stat-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--nexa-text-primary);
          margin-bottom: 0.25rem;
        }

        .stat-count {
          font-size: 0.75rem;
          color: var(--nexa-text-secondary);
        }
      }
    }

    .stat-files {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--nexa-border-color);

      .file-item {
        font-size: 0.75rem;
        color: var(--nexa-text-secondary);
        padding: 0.25rem 0;
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover {
          color: var(--nexa-primary);
        }
      }
    }
  }

  // 최근 색상 리스트
  .recent-colors-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .recent-color-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: var(--nexa-item-bg);
    border: 1px solid var(--nexa-item-border);
    border-radius: 6px;
    cursor: move;
    transition:
      background-color 0.2s ease,
      transform 0.2s ease,
      opacity 0.2s ease;
    position: relative;

    &:hover {
      background-color: var(--nexa-surface-hover);
    }

    &.is-dragging {
      opacity: 0.5;
      transform: scale(0.95);
    }

    .color-preview {
      width: 48px;
      height: 48px;
      border-radius: 4px;
      border: 1px solid var(--nexa-border-color);
      flex-shrink: 0;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .color-info {
      flex: 1;
      cursor: pointer;
      min-width: 0; // 텍스트 오버플로우 방지

      .color-name-row {
        display: flex;
        align-items: baseline;
        gap: 0.25rem;
        margin-bottom: 0.15rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .color-category {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--nexa-accent);
        flex-shrink: 0;
      }

      .color-name {
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--nexa-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .color-value {
        font-size: 0.7rem;
        color: var(--nexa-text-secondary);
        margin-bottom: 0.1rem;
        font-family: 'Courier New', monospace;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .color-time {
        font-size: 0.65rem;
        color: var(--nexa-text-hint);
      }
    }

    .delete-btn {
      flex-shrink: 0;
      opacity: 0;
      transition:
        opacity 0.2s ease,
        color 0.2s ease;

      &:hover {
        color: var(--nexa-error) !important;
      }
    }

    .favorite-btn {
      flex-shrink: 0;
      opacity: 0;
      transition:
        opacity 0.2s ease,
        color 0.2s ease;

      &:hover {
        color: var(--nexa-warning) !important;
      }

      &.active {
        opacity: 1;
        color: var(--nexa-warning) !important;
      }
    }

    &:hover .favorite-btn {
      opacity: 1;
    }

    &:hover .delete-btn {
      opacity: 1;
    }
  }

  // 아코디언 wrapper는 전역 스타일(_expansion-item.scss)에 정의됨

  // 색상 리스트 아코디언 스타일 (컴포넌트별 커스텀 - 탭 포함)
  .colors-expansion {
    .colors-tabs {
      border-bottom: 1px solid var(--nexa-border-color);

      :deep(.q-tab) {
        flex: 1;
        padding: 0.375rem 0.5rem; // 크기 줄임
        min-height: auto;

        .q-tab__content {
          flex-direction: row !important; // 아이콘과 라벨을 가로로 배치
          align-items: center !important;
          gap: 0.375rem !important; // 아이콘과 텍스트 사이 간격
        }

        .q-tab__icon {
          margin: 0 !important;
          font-size: 14px !important; // 아이콘 크기 줄임
          width: 14px !important;
          height: 14px !important;
        }

        .q-tab__label {
          margin: 0 !important;
          font-size: 0.875rem !important; // 텍스트 크기 줄임
        }
      }
    }

    .colors-tab-panels {
      background-color: var(--nexa-background);
    }
  }

  .statistics-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

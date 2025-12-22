<!-- DocumentManagerList.vue
  문서 관리 리스트 컴포넌트
  문서 목록 헤더, 모드 선택, 통계, 문서 목록 포함
-->

<template>
  <q-scroll-area class="file-list-scroll-area">
    <!-- 문서 목록 헤더 (모드 선택 + 정렬 방향) -->
    <div class="file-list-header q-px-sm q-pt-sm q-pb-xs row items-center q-gutter-xs">
      <div class="row items-center q-gutter-xs cursor-pointer" @click="toggleListMode">
        <q-btn flat dense round :icon="getListModeIcon()" @click.stop="toggleListMode" class="btn-primary" size="sm">
          <q-tooltip>{{ getListModeLabel() }}</q-tooltip>
        </q-btn>
        <div class="list-mode-label">{{ getListModeLabel() }}</div>
      </div>
      <q-space />
      <!-- 멀티 셀렉션 모드 표시 -->
      <div v-if="multiSelectMode" class="multi-select-mode-badge" @click="clearSelection">
        <q-tooltip>멀티 셀렉션 (ESC 키로 해제)</q-tooltip>
        <q-icon name="checklist" size="14px" class="q-mr-xs" />
        <span>멀티 선택</span>
      </div>
      <q-btn v-if="listMode !== 'group'" flat dense round :icon="sortOrder === 'asc' ? 'arrow_downward' : 'arrow_upward'" @click="toggleSortOrder" class="btn-primary" size="sm">
        <q-tooltip>{{ sortOrder === 'asc' ? '오름차순' : '내림차순' }}</q-tooltip>
      </q-btn>
      <q-btn v-if="listMode === 'default' || listMode === 'group'" flat dense round :icon="getSortTypeIcon()" @click="toggleSortType" class="btn-primary" size="sm">
        <q-tooltip>{{ getSortTypeLabel() }}</q-tooltip>
      </q-btn>
    </div>
    <!-- 모드 아이콘 그리드 (라벨 없이, 반응형) -->
    <div class="mode-icon-grid q-px-sm q-pt-xs q-pb-sm">
      <div class="row icon-grid-row">
        <div v-for="mode in listModeOptions" :key="mode.value" class="col mode-grid-item" :class="{ 'mode-active': listMode === mode.value }" @click="setListMode(mode.value)">
          <q-btn flat dense :icon="mode.icon" :class="listMode === mode.value ? 'mode-icon-btn-active' : 'mode-icon-btn-inactive'" class="mode-icon-btn">
            <q-tooltip>{{ mode.label }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
    <!-- 전체 통계 요약 (정렬 액션 그룹 아래) -->
    <div class="progress-stats-section q-px-sm q-pt-xs q-pb-sm">
      <div class="row items-center q-gutter-xs q-mb-none">
        <q-icon name="trending_up" size="16px" class="progress-icon" />
        <q-linear-progress :value="overallProgress / 100" class="progress-bar col" size="8px" rounded />
        <div class="text-caption progress-text text-weight-bold">{{ overallProgress }}%</div>
      </div>
      <div class="row items-center justify-center q-gutter-sm q-pt-xs">
        <div class="text-caption stats-label">전체 진행률</div>
        <div class="text-caption stats-label">
          완료: <span class="stats-completed text-weight-bold">{{ totalCompleted }}</span>
        </div>
        <div class="text-caption stats-label">
          미완료: <span class="text-weight-bold">{{ totalPending }}</span>
        </div>
        <div class="text-caption stats-label">
          전체: <span class="text-weight-bold">{{ totalItems }}</span>
        </div>
      </div>
    </div>
    <q-separator />

    <!-- 멀티 셀렉션 액션 바 (멀티 셀렉션 모드일 때만 표시) -->
    <div v-if="multiSelectMode && selectedCount > 0" class="multi-selection-bar q-pa-sm">
      <div class="row items-center q-gutter-sm no-wrap">
        <div class="multi-select-label">
          <q-icon name="check_circle" class="multi-select-icon" />
          <span class="multi-select-text">{{ selectedCount || 0 }}개 선택</span>
        </div>
        <q-space />
        <template v-if="!isTrashView">
          <q-btn flat dense icon="delete" label="휴지통 이동" class="btn-error" size="sm" @click="handleMoveSelectedToTrash" />
        </template>
        <template v-else>
          <q-btn flat dense icon="restore" label="복원" class="btn-primary" size="sm" @click="handleRestoreSelected" />
          <q-btn flat dense icon="delete_forever" label="영구 삭제" class="btn-error" size="sm" @click="handlePermanentlyDeleteSelected" />
        </template>
        <q-btn flat dense icon="close" label="선택 해제" class="btn-secondary" size="sm" @click="clearSelection" />
      </div>
    </div>
    <q-separator v-if="multiSelectMode && selectedCount > 0" />

    <q-list separator @dragover.prevent.stop @drop.prevent.stop @mouseup="handleMultiSelectMouseUp">
      <!-- 검색 결과 문서 (상단에 표시) -->
      <template v-if="sortedSearchResults.length > 0">
        <q-item-label header class="text-caption search-result-header q-pa-sm">검색어 포함한 검색 결과 ({{ sortedSearchResults.length }})</q-item-label>
        <q-item
          v-for="result in sortedSearchResults"
          :key="result.file.name"
          clickable
          v-ripple
          :active="documentStore.selectedFile?.name === result.file.name && !multiSelectMode"
          active-class="item-active"
          :class="{
            'multi-selected': isFileSelected(result.file.name) && multiSelectMode,
            'drag-over': dragOverFileName === result.file.name,
            dragging: draggedFileName === result.file.name,
            'recently-moved': lastMovedFileName === result.file.name,
          }"
          @click="handleMultiSelectClick($event, { ...result.file, id: result.file.name })"
          @mousedown="handleMultiSelectMouseDown($event, { ...result.file, id: result.file.name })"
          draggable="true"
          @dragstart="handleDragStart($event, result.file)"
          @dragend="handleDragEnd($event)"
          @dragover="handleDragOver($event, result.file)"
          @dragleave="handleDragLeave($event)"
          @drop="
            handleDrop(
              $event,
              result.file,
              sortedSearchResults.map((r) => r.file),
            )
          "
        >
          <q-item-section avatar class="file-list-icon-section">
            <q-icon :name="isFavorite(result.file.name) ? 'star' : 'description'" :class="isFavorite(result.file.name) ? 'icon-favorite' : 'icon-default'" @click.stop="toggleFileFavorite(result.file, $event)" class="cursor-pointer" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="relative-position">
              {{ result.file.displayName }}
              <span class="match-count">{{ result.matchCount }}</span>
              <span class="usage-count">{{ result.file.usageCount || 0 }}</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-my-sm" />
      </template>
      <!-- 검색 제외 목록 (옵션에 따라 표시) -->
      <template v-if="showExcludedFiles && filteredSearchExcluded.length > 0">
        <q-item-label header class="text-caption search-excluded-header q-pa-sm">검색어 제외한 검색 결과 ({{ filteredSearchExcluded.length }})</q-item-label>
        <q-item
          v-for="file in filteredSearchExcluded"
          :key="file.name"
          clickable
          v-ripple
          :active="documentStore.selectedFile?.name === file.name && !multiSelectMode"
          active-class="item-active"
          :class="{ 'multi-selected': isFileSelected(file.name) && multiSelectMode }"
          @click="handleMultiSelectClick($event, { ...file, id: file.name })"
          @mousedown="handleMultiSelectMouseDown($event, { ...file, id: file.name })"
        >
          <q-item-section avatar class="file-list-icon-section">
            <q-icon :name="isFavorite(file.name) ? 'star' : 'description'" :color="isFavorite(file.name) ? 'amber' : undefined" @click.stop="toggleFileFavorite(file, $event)" class="cursor-pointer" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="item-label-secondary">{{ file.displayName }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-my-sm" />
      </template>
      <!-- 전체 문서 목록 (검색 중이 아닐 때만 표시) -->
      <template v-if="!props.globalSearchQuery || props.globalSearchQuery.trim() === ''">
        <!-- 휴지통 모드 -->
        <template v-if="isTrashView">
          <q-item v-if="displayFiles.length === 0" class="q-pa-md text-center empty-state">
            <q-item-label caption>휴지통이 비어있습니다</q-item-label>
          </q-item>
          <q-item
            v-for="file in displayFiles"
            :key="file.name"
            clickable
            v-ripple
            :active="documentStore.selectedFile?.name === file.name && !multiSelectMode"
            active-class="item-active"
            :class="{ 'multi-selected': isFileSelected(file.name) && multiSelectMode }"
            @click="handleMultiSelectClick($event, { ...file, id: file.name })"
            @mousedown="handleMultiSelectMouseDown($event, { ...file, id: file.name })"
          >
            <q-item-section avatar class="file-list-icon-section">
              <q-icon name="delete" class="icon-trash" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ file.displayName }}</q-item-label>
              <q-item-label caption class="item-label-secondary">휴지통에 있음</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <!-- 일반 모드 -->
        <template v-else>
          <!-- 그룹 모드 -->
          <template v-if="listMode === 'group'">
            <template v-for="category in filteredGroupedFiles" :key="category.name">
              <q-item-label header class="text-caption category-header q-pa-sm">{{ category.name }} ({{ category.files.length }})</q-item-label>
              <q-item
                v-for="file in category.files"
                :key="file.name"
                clickable
                v-ripple
                :active="documentStore.selectedFile?.name === file.name && !multiSelectMode"
                active-class="item-active"
                :class="{
                  'multi-selected': isFileSelected(file.name) && multiSelectMode,
                  'drag-over': dragOverFileName === file.name,
                  dragging: draggedFileName === file.name,
                  'recently-moved': lastMovedFileName === file.name,
                }"
                @click="handleMultiSelectClick($event, { ...file, id: file.name })"
                @mousedown="handleMultiSelectMouseDown($event, { ...file, id: file.name })"
                draggable="true"
                @dragstart="handleDragStart($event, file)"
                @dragend="handleDragEnd($event)"
                @dragover="handleDragOver($event, file)"
                @dragleave="handleDragLeave($event)"
                @drop="handleDrop($event, file, allFilesForDragDrop)"
              >
                <q-item-section avatar class="file-list-icon-section">
                  <q-icon :name="isFavorite(file.name) ? 'star' : 'description'" :color="isFavorite(file.name) ? 'amber' : undefined" @click.stop="toggleFileFavorite(file, $event)" class="cursor-pointer" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="relative-position">
                    {{ file.displayName }}
                    <span v-if="getFileTotalCount(file) > 0" class="file-progress-inline"> {{ getFileCompletedCount(file) }}/{{ getFileTotalCount(file) }} </span>
                    <span class="usage-count">{{ file.usageCount || 0 }}</span>
                  </q-item-label>
                  <q-item-label v-if="sortType === 'modified'" caption class="item-date-label">{{ formatDate(file.modifiedDate) }}</q-item-label>
                  <q-item-label v-if="sortType === 'created'" caption class="item-date-label">{{ formatDate(file.createdDate) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator class="q-my-sm" />
            </template>
          </template>
          <!-- 정렬 모드 (이름순, 수정일순, 사용빈도순, 우선순위순) -->
          <template v-else>
            <q-item
              v-for="file in displayFiles"
              :key="file.name"
              clickable
              v-ripple
              :active="documentStore.selectedFile?.name === file.name && !multiSelectMode"
              active-class="item-active"
              :class="{
                'multi-selected': isFileSelected(file.name) && multiSelectMode,
                'drag-over': dragOverFileName === file.name,
                dragging: draggedFileName === file.name,
                'recently-moved': lastMovedFileName === file.name,
              }"
              @click="handleMultiSelectClick($event, { ...file, id: file.name })"
              @mousedown="handleMultiSelectMouseDown($event, { ...file, id: file.name })"
              draggable="true"
              @dragstart="handleDragStart($event, file)"
              @dragend="handleDragEnd($event)"
              @dragover="handleDragOver($event, file)"
              @dragleave="handleDragLeave($event)"
              @drop="handleDrop($event, file, displayFiles)"
            >
              <q-item-section avatar class="file-list-icon-section">
                <q-icon :name="isFavorite(file.name) ? 'star' : 'description'" :color="isFavorite(file.name) ? 'amber' : undefined" @click.stop="toggleFileFavorite(file, $event)" class="cursor-pointer" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="relative-position">
                  <span v-if="listMode === 'priority'" class="usage-count priority-mode">{{ file.usageCount || 0 }}</span>
                  <span v-if="listMode === 'priority' && getPriority(file.name) > 0" class="priority-badge">{{ getPriority(file.name) }}</span>
                  {{ file.displayName }}
                  <span v-if="getFileTotalCount(file) > 0" class="file-progress-inline"> {{ getFileCompletedCount(file) }}/{{ getFileTotalCount(file) }} </span>
                  <span v-if="listMode !== 'priority'" class="usage-count">{{ file.usageCount || 0 }}</span>
                </q-item-label>
                <q-item-label v-if="listMode === 'modified'" caption class="item-date-label">{{ formatDate(file.modifiedDate) }}</q-item-label>
                <q-item-label v-if="listMode === 'created'" caption class="item-date-label">{{ formatDate(file.createdDate) }}</q-item-label>
                <q-item-label v-if="listMode === 'priority' && getPriority(file.name) === 0" caption class="item-label-secondary">우선순위 없음</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </template>
      </template>
    </q-list>
    <div v-if="documentStore.markdownFiles.length === 0" class="q-pa-md text-center empty-state">문서를 찾을 수 없습니다.</div>
    <div v-if="props.globalSearchQuery && props.globalSearchQuery.trim() !== '' && sortedSearchResults.length === 0 && filteredSearchExcluded.length === 0" class="q-pa-md text-center empty-state">검색 결과가 없습니다.</div>
  </q-scroll-area>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, toRef } from 'vue'
/**
 * ⭐ 드래그 앤 드롭을 통한 우선순위 관리 시스템
 *
 * 목표:
 * 1. 모든 모드에서 드래그 앤 드롭으로 우선순위 점수를 올리거나 내릴 수 있다 (점수 저장)
 * 2. 순위 모드가 아닐 때: 시각적으로만 상대적 순위를 예측 가능 (실제 정렬은 자동 기준 유지)
 * 3. 순위 모드일 때: 절대 순위로 정렬되며, 이동 시 3초 후 절대 순위로 재정렬 (이동 대상만)
 *
 * 동작 방식:
 * - 드롭 시: 우선순위 점수 계산 및 저장 → manualOrder 설정 (시각적 피드백)
 * - 우선순위 모드: 3초 후 manualOrder 초기화하여 절대 순위 정렬로 복귀
 * - 다른 모드: manualOrder 유지 (시각적 피드백만), 정렬 기준 변경 시 자동 정렬로 복귀
 * - 모드 전환: 항상 manualOrder 초기화하여 깨끗한 상태에서 시작
 */

import { useDocumentManagerStore } from 'src/stores/documentManagerStore.js'
import { loadCheckboxStates, loadTOCSettings, saveTOCSettings, loadFileUsageCounts, incrementFileUsage, saveFileUsageCounts, loadFavoriteStates, toggleFavorite, loadPriorityStates, setFilePriority, loadTrashFiles } from 'src/modules/document-manager/services/documentStorage.js'
import { useDocumentStats } from 'src/modules/document-manager/composables/useDocumentStats.js'
import { useDocumentList } from 'src/modules/document-manager/composables/useDocumentList.js'
import { useMultiSelection } from 'src/composables/useMultiSelection.js'
import { useQuasar } from 'quasar'
import { sortByName, sortByModified, sortByCreated, sortByUsage, sortByFavorite, sortByPriority } from 'src/modules/document-manager/utils/documentSorter.js'

// Props
const props = defineProps({
  globalSearchQuery: {
    type: String,
    default: '',
  },
  globalSearchResults: {
    type: Array,
    default: () => [],
  },
  globalSearchExcluded: {
    type: Array,
    default: () => [],
  },
  searchMode: {
    type: String,
    default: 'both',
  },
  showExcludedFiles: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['move-to-trash', 'restore', 'permanently-delete'])

// Quasar 인스턴스
const $q = useQuasar()

// Store 사용
const documentStore = useDocumentManagerStore()

// Store에서 함수만 가져오기 (상태는 직접 참조하여 반응성 유지)
// selectedFile은 구조 분해하면 반응성을 잃을 수 있으므로 직접 참조
const { loadMarkdownFiles: loadMarkdownFilesFromStore, selectFile: selectFileFromStore } = documentStore

// 로컬 상태
const listMode = ref('default') // 문서 목록 모드: 'default', 'group', 'name', 'modified', 'usage'
const sortOrder = ref('asc') // 정렬 방향: 'asc', 'desc'
const sortType = ref('name') // 정렬 기준: 'name', 'modified', 'usage'
const fileUsageCounts = ref({}) // 파일 사용 빈도 (로컬 스토리지)
const favoriteStates = ref({}) // 즐겨찾기 상태 (로컬 스토리지)
const priorityStates = ref({}) // 우선순위 상태 (로컬 스토리지)
// trashFiles는 store에서 직접 참조하여 사용 (반응성 보장)
const isTrashView = ref(false) // 휴지통 보기 모드
const draggedFileName = ref(null)
const dragOverFileName = ref(null)
const lastMovedFileName = ref(null)
const manualOrder = ref(null)
let autoSortTimer = null

// 현재 표시 중인 모든 파일 목록 (멀티 셀렉션용)
const allDisplayedFiles = computed(() => {
  const files = []

  // 검색 결과 추가
  if (sortedSearchResults.value.length > 0) {
    sortedSearchResults.value.forEach((result) => {
      if (!files.find((f) => f.name === result.file.name)) {
        files.push({ ...result.file, id: result.file.name })
      }
    })
  }

  // 검색 제외 목록 추가
  if (props.showExcludedFiles && filteredSearchExcluded.value.length > 0) {
    filteredSearchExcluded.value.forEach((file) => {
      if (!files.find((f) => f.name === file.name)) {
        files.push({ ...file, id: file.name })
      }
    })
  }

  // 일반 목록 추가 (검색 중이 아닐 때만)
  if (!props.globalSearchQuery || props.globalSearchQuery.trim() === '') {
    if (isTrashView.value) {
      // 휴지통 모드
      displayFiles.value.forEach((file) => {
        if (!files.find((f) => f.name === file.name)) {
          files.push({ ...file, id: file.name })
        }
      })
    } else {
      // 일반 모드
      if (listMode.value === 'group') {
        filteredGroupedFiles.value.forEach((category) => {
          category.files.forEach((file) => {
            if (!files.find((f) => f.name === file.name)) {
              files.push({ ...file, id: file.name })
            }
          })
        })
      } else {
        displayFiles.value.forEach((file) => {
          if (!files.find((f) => f.name === file.name)) {
            files.push({ ...file, id: file.name })
          }
        })
      }
    }
  }

  return files
})

// 멀티 셀렉션 설정
const {
  selectedRows,
  selectedCount,
  multiSelectMode,
  onRowClick: handleMultiSelectClick,
  onRowMouseDown: handleMultiSelectMouseDown,
  onRowMouseUp: handleMultiSelectMouseUp,
  clearSelection,
  cleanup: cleanupMultiSelection,
} = useMultiSelection({
  items: allDisplayedFiles,
  onSelectionChange: () => {
    // 선택 변경 시 처리 (필요 시)
  },
  onRowClick: (file) => {
    // onRowClick 콜백은 단일 선택 모드에서만 호출됨 (useMultiSelection 내부 로직)
    // 멀티 셀렉션 모드에서는 이 콜백이 호출되지 않으므로 안전하게 파일 선택
    selectFile(file)
  },
  onRowDoubleClick: (file) => {
    // 더블 클릭 시 파일 선택 (멀티 셀렉션 모드 해제)
    clearSelection()
    selectFile(file)
  },
})

// 파일이 선택되었는지 확인
function isFileSelected(fileName) {
  return selectedRows.value.some((file) => file.name === fileName)
}

// 파일 선택 래퍼 (파일 사용 빈도 증가 포함)
async function selectFile(file) {
  await selectFileFromStore(file, fileUsageCounts, incrementFileUsage)
  // 멀티 셀렉션 모드가 아니면 선택 해제
  if (!multiSelectMode.value) {
    clearSelection()
  }
}

// 설정 열기는 DevSidebar에서 처리

// 즐겨찾기 토글
function toggleFileFavorite(file, event) {
  event.stopPropagation()
  toggleFavorite(file.name, favoriteStates)
}

// 즐겨찾기 상태 확인
function isFavorite(fileName) {
  return favoriteStates.value[fileName] === true
}

// 우선순위 점수 가져오기
function getPriority(fileName) {
  return priorityStates.value[fileName] || 0
}

// 드래그 시작
function handleDragStart(event, file) {
  draggedFileName.value = file.name
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('application/json', JSON.stringify({ fileName: file.name }))
  event.stopPropagation()
  if (event.currentTarget) {
    event.currentTarget.style.opacity = '0.5'
  }
}

// 드래그 종료
function handleDragEnd(event) {
  if (event.currentTarget) {
    event.currentTarget.style.opacity = ''
    event.currentTarget.removeAttribute('data-drop-position')
  }
  draggedFileName.value = null
  dragOverFileName.value = null
}

// 드래그 오버
function handleDragOver(event, file) {
  if (draggedFileName.value && draggedFileName.value !== file.name) {
    // 마우스 위치에 따라 드롭 위치 시각적 표시 (위쪽 절반인지 아래쪽 절반인지)
    const targetElement = event.currentTarget
    const rect = targetElement.getBoundingClientRect()
    const mouseY = event.clientY
    const itemCenterY = rect.top + rect.height / 2

    // 드롭 위치를 클래스로 표시 (CSS에서 border-top 또는 border-bottom으로 표시 가능)
    if (mouseY < itemCenterY) {
      targetElement.setAttribute('data-drop-position', 'before')
    } else {
      targetElement.setAttribute('data-drop-position', 'after')
    }

    dragOverFileName.value = file.name
    event.dataTransfer.dropEffect = 'move'
    event.preventDefault()
    event.stopPropagation()
  }
}

// 드래그 리브
function handleDragLeave(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    dragOverFileName.value = null
    // 드롭 위치 표시 제거
    if (event.currentTarget) {
      event.currentTarget.removeAttribute('data-drop-position')
    }
  }
}

// ⭐ 드롭 처리: 우선순위 점수 저장 및 수동 순서 적용
function handleDrop(event, targetFile, currentFiles) {
  event.preventDefault()
  event.stopPropagation()

  if (!draggedFileName.value || draggedFileName.value === targetFile.name) {
    dragOverFileName.value = null
    draggedFileName.value = null
    return
  }

  try {
    const dragData = JSON.parse(event.dataTransfer.getData('application/json'))
    const sourceFileName = dragData.fileName || draggedFileName.value

    if (!sourceFileName || sourceFileName === targetFile.name) {
      dragOverFileName.value = null
      draggedFileName.value = null
      return
    }

    const sourceIndex = currentFiles.findIndex((f) => f.name === sourceFileName)
    const targetIndex = currentFiles.findIndex((f) => f.name === targetFile.name)

    if (sourceIndex === -1 || targetIndex === -1) {
      dragOverFileName.value = null
      draggedFileName.value = null
      return
    }

    // 마우스 위치를 기반으로 드롭 위치 결정 (항목의 위쪽 절반이면 앞에, 아래쪽 절반이면 뒤에)
    const targetElement = event.currentTarget
    const rect = targetElement.getBoundingClientRect()
    const mouseY = event.clientY
    const itemCenterY = rect.top + rect.height / 2
    const dropBeforeTarget = mouseY < itemCenterY

    // 실제 삽입 인덱스 계산 (소스를 제거하기 전 기준)
    let finalTargetIndex
    if (dropBeforeTarget) {
      // 항목 위쪽에 드롭: 해당 위치에 삽입
      finalTargetIndex = targetIndex
    } else {
      // 항목 아래쪽에 드롭: 다음 위치에 삽입
      finalTargetIndex = targetIndex + 1
    }

    // 소스를 제거한 후의 실제 삽입 인덱스로 조정
    // 소스가 타겟보다 앞에 있으면, 소스를 제거하면 타겟 인덱스가 1 감소
    if (sourceIndex < finalTargetIndex) {
      finalTargetIndex -= 1
    }

    // 배열 범위 체크
    finalTargetIndex = Math.max(0, Math.min(finalTargetIndex, currentFiles.length - 1))

    // ⭐ 범용 값 조정 함수 호출 (정렬 모드에 따라 적절한 값 조정)
    const result = calculateValueOnDrop(sourceFileName, targetFile, sourceIndex, finalTargetIndex, currentFiles)
    lastMovedFileName.value = sourceFileName
    // ⭐ 수동 순서 적용 (시각적 피드백) - 계산된 finalTargetIndex 사용
    applyManualOrder(sourceFileName, finalTargetIndex, currentFiles)

    // ⭐ 토스트 메시지 표시 (설정값 사용)
    if (showToastMessages.value) {
      const timeoutMs = toastTimeoutSeconds.value * 1000
      const sourceDisplayName = sourceFileName.replace(/\.md$/, '')
      const targetDisplayName = targetFile.name.replace(/\.md$/, '')
      const action = sourceIndex < targetIndex ? '내려서' : '올려서'

      switch (result.type) {
        case 'priority':
          if (result.value === 0) {
            $q.notify({
              type: 'info',
              message: `[${sourceDisplayName}] 점수가 0이 되어 우선순위에서 제외 되었습니다`,
              position: 'top',
              timeout: timeoutMs,
            })
          } else if (listMode.value === 'priority') {
            const reorderDelay = 3000
            $q.notify({
              type: 'info',
              message: `[${sourceDisplayName}] ${reorderDelay / 1000}초 후에 자동 절대 순위로 정렬 됩니다`,
              position: 'top',
              timeout: timeoutMs,
            })
          } else {
            $q.notify({
              type: 'positive',
              message: `[${sourceDisplayName}]을(를) [${targetDisplayName}] 보다 순위를 ${action} 현재 ${result.value}순위로 조정 되었습니다`,
              position: 'top',
              timeout: timeoutMs,
            })
          }
          break

        case 'usage':
          $q.notify({
            type: 'positive',
            message: `[${sourceDisplayName}]의 사용 빈도가 ${result.value}로 조정되었습니다`,
            position: 'top',
            timeout: timeoutMs,
          })
          break

        case 'favorite':
          $q.notify({
            type: 'positive',
            message: `[${sourceDisplayName}]의 즐겨찾기 상태가 ${result.value ? '설정' : '해제'}되었습니다`,
            position: 'top',
            timeout: timeoutMs,
          })
          break

        case 'modified':
          $q.notify({
            type: 'positive',
            message: `[${sourceDisplayName}]의 수정일이 갱신되었습니다`,
            position: 'top',
            timeout: timeoutMs,
          })
          break

        case 'created':
          $q.notify({
            type: 'info',
            message: `[${sourceDisplayName}] 생성일은 변경할 수 없지만, 수정일이 갱신되어 정렬에 반영됩니다`,
            position: 'top',
            timeout: timeoutMs,
          })
          break

        case 'name':
          $q.notify({
            type: 'info',
            message: `[${sourceDisplayName}] 이름은 변경할 수 없지만, 우선순위가 조정되어 정렬에 반영됩니다`,
            position: 'top',
            timeout: timeoutMs,
          })
          break
      }
    }

    // ⭐ 우선순위 모드: 3초 후 절대 순위로 재정렬 (이동 대상만)
    if (listMode.value === 'priority') {
      if (autoSortTimer) {
        clearTimeout(autoSortTimer)
      }
      autoSortTimer = setTimeout(() => {
        applyAutoSort()
      }, 3000)
    }
    // ⭐ 우선순위 모드가 아닐 때: manualOrder 유지 (시각적 피드백만), 정렬 기준 변경 시 watch에서 초기화
  } catch (error) {
    console.error('드롭 처리 오류:', error)
  }

  dragOverFileName.value = null
  draggedFileName.value = null
}

// ⭐ 수동 순서 적용: 드래그한 파일을 목표 위치로 이동하여 manualOrder 생성 (시각적 피드백용)
function applyManualOrder(sourceFileName, targetIndex, currentFiles) {
  const baseFiles = manualOrder.value ? currentFiles : sortedFiles.value
  const newOrder = [...baseFiles]

  const sourceIndex = newOrder.findIndex((f) => f.name === sourceFileName)
  if (sourceIndex === -1) return

  const [movedFile] = newOrder.splice(sourceIndex, 1)
  // targetIndex는 이미 최종 삽입 위치로 계산되어 전달됨
  newOrder.splice(targetIndex, 0, movedFile)

  manualOrder.value = newOrder.map((f) => f.name)
}

// ⭐ 자동 정렬 적용: manualOrder 초기화하여 sortedFiles(절대 정렬)로 복귀
function applyAutoSort() {
  manualOrder.value = null
  autoSortTimer = null
}

// ⭐ 드롭 시 우선순위 점수 계산: 대상 파일의 우선순위 기준으로 소스 파일의 점수 계산 및 저장 (새 점수 반환)
function calculatePriorityOnDrop(sourceFileName, targetFileName, sourceIndex, finalTargetIndex) {
  // 최고 위로 올리는 경우 (finalTargetIndex === 0): 가장 높은 우선순위로 설정
  if (finalTargetIndex === 0) {
    // 현재 가장 높은 우선순위 찾기
    const priorities = Object.values(priorityStates.value).filter((p) => p > 0)
    const maxPriority = priorities.length > 0 ? Math.max(...priorities) : 0
    const newPriority = maxPriority + 1
    setFilePriority(sourceFileName, newPriority, priorityStates)
    return newPriority
  }

  // 일반적인 경우: 타겟 파일의 우선순위 기준으로 계산
  const targetPriority = getPriority(targetFileName)
  let newPriority

  if (sourceIndex < finalTargetIndex) {
    // 아래로 이동: 타겟 위치의 우선순위보다 1 낮게
    newPriority = targetPriority > 0 ? targetPriority - 1 : 0
  } else {
    // 위로 이동: 타겟 위치의 우선순위보다 1 높게
    newPriority = targetPriority + 1
  }

  newPriority = Math.max(0, newPriority)
  setFilePriority(sourceFileName, newPriority, priorityStates)
  return newPriority
}

// ⭐ 사용 빈도 설정 함수 (직접 값 설정)
function setFileUsage(fileName, usageCount, fileUsageCounts) {
  fileUsageCounts.value[fileName] = usageCount
  saveFileUsageCounts(fileUsageCounts)
}

// ⭐ 수정일 갱신 함수 (드롭 시 사용)
async function updateFileModifiedDateOnDrop(sourceFileName) {
  try {
    // path에서 직접 실제 파일명 추출
    const filePath = sourceFileName.includes('/') ? sourceFileName : sourceFileName
    const pathParts = filePath.split('/')
    const actualFileName = pathParts[pathParts.length - 1]

    // 디렉토리가 있는 경우 전체 경로 사용
    const directoryPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : ''
    const fullRelativePath = directoryPath ? `${directoryPath}/${actualFileName}` : actualFileName

    const encodedFileName = encodeURIComponent(fullRelativePath)
    const response = await fetch(`http://localhost:3000/api/docs/${encodedFileName}/touch`, {
      method: 'POST',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `서버 오류: ${response.status}`)
    }

    await response.json()

    // 파일 목록 재로드하여 수정일 반영
    const { loadMarkdownFiles } = documentStore
    if (loadMarkdownFiles) {
      await loadMarkdownFiles()
    }

    return true
  } catch (error) {
    console.error('수정일 갱신 실패:', error)
    throw error
  }
}

// ⭐ 범용 값 조정 함수: 정렬 모드에 따라 적절한 값을 조정
function calculateValueOnDrop(sourceFileName, targetFile, sourceIndex, finalTargetIndex) {
  const currentSortType = listMode.value === 'default' ? sortType.value : listMode.value
  const targetFileName = targetFile.name

  switch (currentSortType) {
    case 'priority': {
      // 우선순위 모드: 기존 로직 사용
      return {
        type: 'priority',
        value: calculatePriorityOnDrop(sourceFileName, targetFileName, sourceIndex, finalTargetIndex),
      }
    }

    case 'usage': {
      // 사용 빈도 모드: 타겟 파일의 사용 빈도 기준으로 조정
      const targetUsage = fileUsageCounts.value[targetFileName] || 0
      let newUsage
      if (sourceIndex < finalTargetIndex) {
        // 아래로 이동: 타겟보다 1 낮게
        newUsage = Math.max(0, targetUsage - 1)
      } else {
        // 위로 이동: 타겟보다 1 높게
        newUsage = targetUsage + 1
      }
      setFileUsage(sourceFileName, newUsage, fileUsageCounts)
      return {
        type: 'usage',
        value: newUsage,
      }
    }

    case 'favorite': {
      // 즐겨찾기 모드: 타겟 파일의 즐겨찾기 상태에 맞춰 조정
      const targetFavorite = favoriteStates.value[targetFileName] === true
      const sourceFavorite = favoriteStates.value[sourceFileName] === true
      if (targetFavorite && !sourceFavorite) {
        toggleFavorite(sourceFileName, favoriteStates)
        return { type: 'favorite', value: true }
      } else if (!targetFavorite && sourceFavorite) {
        toggleFavorite(sourceFileName, favoriteStates)
        return { type: 'favorite', value: false }
      }
      return { type: 'favorite', value: sourceFavorite }
    }

    case 'modified': {
      // 수정일 모드: 수정일 갱신
      updateFileModifiedDateOnDrop(sourceFileName)
      return {
        type: 'modified',
        value: 'updated',
      }
    }

    case 'created': {
      // 생성일 모드: 수정일 갱신으로 간접 반영
      updateFileModifiedDateOnDrop(sourceFileName)
      return {
        type: 'created',
        value: 'updated',
      }
    }

    case 'name': {
      // 이름 모드: 우선순위 조정으로 간접 반영
      const newPriority = calculatePriorityOnDrop(sourceFileName, targetFileName, sourceIndex, finalTargetIndex)
      return {
        type: 'name',
        value: newPriority,
      }
    }

    default: {
      // 기본값: 우선순위 조정
      const defaultPriority = calculatePriorityOnDrop(sourceFileName, targetFileName, sourceIndex, finalTargetIndex)
      return {
        type: 'priority',
        value: defaultPriority,
      }
    }
  }
}

// 마크다운 파일 로드 래퍼
async function loadMarkdownFiles() {
  await loadMarkdownFilesFromStore()
}

// 설정 저장 콜백 함수
const saveSettings = () => {
  saveTOCSettings({
    tocAutoCloseOnContentClick: documentStore.tocAutoCloseOnContentClick,
    hideCompleted: documentStore.hideCompleted,
    autoHighlightOnScroll: documentStore.autoHighlightOnScroll,
    // showExcludedFiles와 searchMode는 DevSidebar에서 관리하므로 여기서는 저장하지 않음
    listMode: listMode.value,
    sortOrder: sortOrder.value,
    sortType: sortType.value,
  })
}

// 토스트 메시지 설정 (localStorage에서 불러오기)
const showToastMessages = ref(true)
const toastTimeoutSeconds = ref(3.5) // 초 단위

function loadToastSettings() {
  try {
    const saved = localStorage.getItem('dev-toast-settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.showToastMessages !== undefined) {
        showToastMessages.value = parsed.showToastMessages
      }
      if (parsed.toastTimeoutSeconds !== undefined) {
        toastTimeoutSeconds.value = parsed.toastTimeoutSeconds
      }
    }
  } catch (error) {
    console.error('토스트 메시지 설정 불러오기 실패:', error)
  }
}

// 설정 모달 저장 핸들러 (DocumentListSidebar에서 처리)

// 통계 계산 (store에서 직접 참조하여 반응성 유지)
const { getFileTotalCount, getFileCompletedCount, overallProgress, totalCompleted, totalPending, totalItems } = useDocumentStats(toRef(documentStore, 'markdownFiles'), toRef(documentStore, 'fileContents'), toRef(documentStore, 'checkboxStates'))

// 검색 기능은 DevSidebar에서 관리하고 props로 전달받음

// 검색 결과 필터링 (휴지통 검색 모드가 아닐 때만 휴지통 제외)
const filteredSearchResults = computed(() => {
  // 휴지통 검색 모드이거나 휴지통 보기 모드: 그대로 표시 (이미 검색 단계에서 필터링됨)
  if (props.searchMode === 'trash' || isTrashView.value) {
    return props.globalSearchResults
  }
  // 일반 검색 모드: 휴지통 파일 제외
  return props.globalSearchResults.filter((result) => !documentStore.trashFiles.includes(result.file.name))
})

const filteredSearchExcluded = computed(() => {
  // 휴지통 검색 모드이거나 휴지통 보기 모드: 그대로 표시
  if (props.searchMode === 'trash' || isTrashView.value) {
    return props.globalSearchExcluded
  }
  // 일반 검색 모드: 휴지통 파일 제외
  return props.globalSearchExcluded.filter((file) => !documentStore.trashFiles.includes(file.name))
})

// 검색 결과 정렬: 사용자 정렬 기준 적용 + matchCount를 보조 정렬 기준으로 사용
const sortedSearchResults = computed(() => {
  if (!filteredSearchResults.value || filteredSearchResults.value.length === 0) {
    return []
  }

  // 검색 결과를 파일 배열로 변환
  const files = filteredSearchResults.value.map((result) => result.file)

  // 정렬 기준에 따라 정렬
  let sorted = []
  const currentSortType = listMode.value === 'default' ? sortType.value : listMode.value

  switch (currentSortType) {
    case 'name':
      sorted = sortByName(files, sortOrder.value)
      break
    case 'modified':
      sorted = sortByModified(files, sortOrder.value)
      break
    case 'created':
      sorted = sortByCreated(files, sortOrder.value)
      break
    case 'usage':
      sorted = sortByUsage(files, sortOrder.value, fileUsageCounts.value)
      break
    case 'favorite':
      sorted = sortByFavorite(files, sortOrder.value, favoriteStates.value)
      break
    case 'priority':
      sorted = sortByPriority(files, sortOrder.value, priorityStates.value)
      break
    default:
      sorted = files
  }

  // 정렬된 파일 배열을 다시 검색 결과 형태로 변환하고, matchCount를 보조 정렬 기준으로 사용
  const resultMap = new Map(filteredSearchResults.value.map((result) => [result.file.name, result]))
  const sortedResults = sorted.map((file) => resultMap.get(file.name)).filter((result) => result !== undefined)

  // 같은 정렬 값일 때 matchCount를 보조 정렬 기준으로 사용
  // 이미 정렬된 결과에서 같은 값인 경우 matchCount로 재정렬
  const finalSorted = [...sortedResults].sort((a, b) => {
    // 먼저 정렬 기준으로 비교
    let comparison = 0
    const currentSortType = listMode.value === 'default' ? sortType.value : listMode.value

    switch (currentSortType) {
      case 'name':
        comparison = a.file.name.localeCompare(b.file.name, 'ko')
        // 오름차순/내림차순 모두 A→Z 순서 유지 (중요도 관점: A가 더 중요)
        // comparison 값은 그대로 사용 (역전하지 않음)
        break
      case 'modified': {
        const dateA = a.file.modifiedDate ? new Date(a.file.modifiedDate).getTime() : 0
        const dateB = b.file.modifiedDate ? new Date(b.file.modifiedDate).getTime() : 0
        comparison = dateA - dateB
        comparison = sortOrder.value === 'desc' ? -comparison : comparison
        break
      }
      case 'created': {
        const createdA = a.file.createdDate ? new Date(a.file.createdDate).getTime() : 0
        const createdB = b.file.createdDate ? new Date(b.file.createdDate).getTime() : 0
        comparison = createdA - createdB
        comparison = sortOrder.value === 'asc' ? comparison : -comparison
        break
      }
      case 'usage': {
        const usageA = fileUsageCounts.value[a.file.name] || 0
        const usageB = fileUsageCounts.value[b.file.name] || 0
        comparison = usageA - usageB
        comparison = sortOrder.value === 'asc' ? comparison : -comparison
        break
      }
      case 'favorite': {
        const favA = favoriteStates.value[a.file.name] === true ? 1 : 0
        const favB = favoriteStates.value[b.file.name] === true ? 1 : 0
        comparison = favB - favA
        // 내림차순(desc)일 때 즐겨찾기 한 것이 위로, 오름차순(asc)일 때 즐겨찾기 안 한 것이 위로
        comparison = sortOrder.value === 'desc' ? comparison : -comparison
        break
      }
      case 'priority': {
        const priA = priorityStates.value[a.file.name] || 0
        const priB = priorityStates.value[b.file.name] || 0
        comparison = priB - priA
        comparison = sortOrder.value === 'desc' ? comparison : -comparison
        break
      }
    }

    // 정렬 기준이 같으면 matchCount로 비교 (내림차순: 높은 matchCount가 먼저)
    if (comparison === 0) {
      return b.matchCount - a.matchCount
    }

    return comparison
  })

  // manualOrder가 있으면 검색 결과에도 적용
  if (manualOrder.value && manualOrder.value.length > 0) {
    const orderMap = new Map(manualOrder.value.map((name, index) => [name, index]))
    const orderedResults = []
    const unorderedResults = []

    finalSorted.forEach((result) => {
      if (orderMap.has(result.file.name)) {
        orderedResults.push({ result, index: orderMap.get(result.file.name) })
      } else {
        unorderedResults.push(result)
      }
    })

    // manualOrder에 있는 결과는 순서대로, 없는 결과는 뒤에 추가
    orderedResults.sort((a, b) => a.index - b.index)
    return [...orderedResults.map((item) => item.result), ...unorderedResults]
  }

  return finalSorted
})

// 리스트 모드 및 정렬 기능
const { toggleListMode, toggleSortOrder, toggleSortType, getSortTypeIcon, getSortTypeLabel, getListModeIcon, getListModeLabel, formatDate, groupedFiles, sortedFiles } = useDocumentList(
  toRef(documentStore, 'markdownFiles'),
  fileUsageCounts,
  favoriteStates,
  priorityStates,
  listMode,
  sortOrder,
  sortType,
  saveSettings,
)

// 모드 옵션 배열 (기존 모드 배열 순서대로)
const listModeOptions = [
  { value: 'default', label: '기본 순서 정렬', icon: 'list' },
  { value: 'group', label: '카테고리별 그룹 정렬', icon: 'folder' },
  { value: 'name', label: '이름순 정렬', icon: 'sort_by_alpha' },
  { value: 'modified', label: '수정일순 정렬', icon: 'schedule' },
  { value: 'created', label: '생성일순 정렬', icon: 'add_circle' },
  { value: 'usage', label: '사용빈도순 정렬', icon: 'trending_up' },
  { value: 'favorite', label: '즐겨찾기순 정렬', icon: 'star' },
  { value: 'priority', label: '우선순위순 정렬', icon: 'flag' },
]

// 모드를 직접 설정하는 함수
function setListMode(modeValue) {
  listMode.value = modeValue
  saveSettings()
}

// ⭐ 표시할 파일 목록: manualOrder가 있으면 수동 순서 사용(시각적 피드백), 없으면 sortedFiles(자동 정렬) 사용
// 휴지통 모드일 때는 휴지통 파일만, 일반 모드일 때는 휴지통 파일 제외
const displayFiles = computed(() => {
  let files = []

  if (manualOrder.value) {
    // manualOrder에 있는 파일은 수동 순서대로, 없는 파일은 뒤에 추가
    const orderMap = new Map(manualOrder.value.map((name, index) => [name, index]))
    const orderedFiles = []
    const unorderedFiles = []

    sortedFiles.value.forEach((file) => {
      if (orderMap.has(file.name)) {
        orderedFiles.push({ file, index: orderMap.get(file.name) })
      } else {
        unorderedFiles.push(file)
      }
    })

    orderedFiles.sort((a, b) => a.index - b.index)
    files = [...orderedFiles.map((item) => item.file), ...unorderedFiles]
  } else {
    files = sortedFiles.value || []
  }

  // 휴지통 필터링
  const trashFilesArray = documentStore.trashFiles

  if (isTrashView.value) {
    // 휴지통 모드: 휴지통에 있는 파일만 표시
    return files.filter((file) => trashFilesArray.includes(file.name))
  } else {
    // 일반 모드: 휴지통에 없는 파일만 표시
    return files.filter((file) => !trashFilesArray.includes(file.name))
  }
})

// 그룹 모드에서 휴지통 필터링 적용
const filteredGroupedFiles = computed(() => {
  return groupedFiles.value
    .map((category) => ({
      ...category,
      files: isTrashView.value ? category.files.filter((file) => documentStore.trashFiles.includes(file.name)) : category.files.filter((file) => !documentStore.trashFiles.includes(file.name)),
    }))
    .filter((category) => category.files.length > 0) // 빈 그룹 제거
})

// 그룹 모드에서 드래그 앤 드롭 시 사용할 전체 파일 목록 (그룹을 평탄화)
// 휴지통 모드에서는 드래그 앤 드롭 비활성화
const allFilesForDragDrop = computed(() => {
  if (isTrashView.value) {
    return [] // 휴지통 모드에서는 드래그 앤 드롭 비활성화
  }
  if (listMode.value === 'group') {
    // filteredGroupedFiles를 평탄화하여 전체 파일 목록 반환
    return filteredGroupedFiles.value.flatMap((category) => category.files)
  }
  return displayFiles.value
})

// ⭐ 모드 전환 감지: 우선순위 모드 전환 시 desc 정렬, 모든 모드 전환 시 manualOrder 초기화
watch(listMode, (newMode) => {
  if (newMode === 'priority' && sortOrder.value === 'asc') {
    sortOrder.value = 'desc'
    saveSettings()
  }
  // ⭐ 모드 전환 시 manualOrder 초기화하여 깨끗한 상태에서 시작
  if (autoSortTimer) {
    clearTimeout(autoSortTimer)
    autoSortTimer = null
  }
  manualOrder.value = null
})

// ⭐ 정렬 기준 변경 감지: 우선순위 모드가 아닐 때 manualOrder 초기화하여 자동 정렬로 복귀
watch([sortOrder, sortType, listMode], () => {
  if (listMode.value !== 'priority') {
    if (autoSortTimer) {
      clearTimeout(autoSortTimer)
      autoSortTimer = null
    }
    manualOrder.value = null
  }
})

onMounted(async () => {
  loadCheckboxStates(documentStore.checkboxStates)
  loadToastSettings()
  loadTOCSettings({
    tocAutoCloseOnContentClick: documentStore.tocAutoCloseOnContentClick,
    hideCompleted: toRef(documentStore, 'hideCompleted'),
    autoHighlightOnScroll: toRef(documentStore, 'autoHighlightOnScroll'),
    // showExcludedFiles와 searchMode는 DevSidebar에서 관리하므로 여기서는 로드하지 않음
    listMode,
    sortOrder,
    sortType,
  })
  loadFileUsageCounts(fileUsageCounts)
  loadFavoriteStates(favoriteStates)
  loadPriorityStates(priorityStates)
  loadTrashFiles(documentStore)

  await loadMarkdownFiles()

  // 파일명 변경 이벤트 리스너 등록
  window.addEventListener('file-renamed', handleFileRenamed)
})

onBeforeUnmount(() => {
  // 이벤트 리스너 제거
  window.removeEventListener('file-renamed', handleFileRenamed)
  // 멀티 셀렉션 정리 (ESC 키 이벤트 리스너도 함께 제거됨)
  cleanupMultiSelection()
})

// 파일명 변경 시 사이드바 refs 업데이트
function handleFileRenamed(event) {
  const { oldFileName, newFileName } = event.detail

  // 파일명에서 파일명만 추출 (하위 디렉토리 경로 제거)
  const oldFileNameOnly = oldFileName.split('/').pop()
  const newFileNameOnly = newFileName.split('/').pop()

  // markdownFiles 배열에서 파일 찾아서 이름만 업데이트 (전체 리프레시 방지)
  if (documentStore.markdownFiles && Array.isArray(documentStore.markdownFiles)) {
    const fileIndex = documentStore.markdownFiles.findIndex((f) => {
      const fileNameOnly = f.name.split('/').pop()
      return fileNameOnly === oldFileNameOnly
    })

    if (fileIndex !== -1) {
      const file = documentStore.markdownFiles[fileIndex]
      // 파일명만 업데이트 (반응성 유지)
      file.name = newFileNameOnly
      file.displayName = newFileNameOnly.replace('.md', '').replace(/_/g, ' ')
      // path도 업데이트
      if (file.path) {
        const pathParts = file.path.split('/')
        pathParts[pathParts.length - 1] = newFileNameOnly
        file.path = pathParts.join('/')
      }
    }
  }

  // localStorage에서 다시 로드 (이미 renameFile에서 localStorage가 업데이트됨)
  loadFileUsageCounts(fileUsageCounts)
  loadFavoriteStates(favoriteStates)
  loadPriorityStates(priorityStates)
  loadTrashFiles(documentStore)
}

// 필터 토글 함수들은 DevSidebar에서 처리됨
// (toggleHideCompleted, toggleHighlight, toggleExcludedFiles, toggleTrashView)

// 사용빈도 초기화 핸들러 (DocumentListSidebar에서 처리)
// 우선순위 초기화 핸들러 (DocumentListSidebar에서 처리)

// 멀티 셀렉션 일괄 작업 함수들 - emit으로 전달
async function handleMoveSelectedToTrash() {
  emit('move-to-trash', selectedRows.value)
}

async function handleRestoreSelected() {
  emit('restore', selectedRows.value)
}

async function handlePermanentlyDeleteSelected() {
  emit('permanently-delete', selectedRows.value)
}

// Expose 멀티 셀렉션 관련 값들
defineExpose({
  selectedRows,
  selectedCount,
  multiSelectMode,
  clearSelection,
  isTrashView,
  handleMoveSelectedToTrash,
  handleRestoreSelected,
  handlePermanentlyDeleteSelected,
})
</script>

<style lang="scss" scoped>
// 파일 리스트 스크롤 영역
.file-list-scroll-area {
  height: 100%;
  flex: 1;
  :deep(.q-scrollarea__thumb) {
    // 스크롤바 폭 1px
    width: 3px;
  }
  :deep(.q-scrollarea__bar) {
    width: 2px;
  }
}

.file-list-header {
  background: var(--nexa-background-lower);
  padding-top: 0px !important; // 상단 패딩 최소화
  padding-bottom: 0px !important; // 하단 패딩 최소화
  margin-top: 0 !important; // 상단 마진 제거

  .list-mode-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--nexa-primary);
  }

  .multi-select-mode-badge {
    display: flex;
    align-items: center;
    padding: 2px 8px;
    background: var(--nexa-surface);
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    color: var(--nexa-primary);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--nexa-surface-hover);
    }

    .q-icon {
      font-size: 14px;
      margin-right: 4px;

      &:last-child {
        margin-right: 0;
        margin-left: 4px;
        font-size: 12px;
      }
    }
  }
}

.filter-stats-section {
  background: var(--nexa-background-lower);
  border-top: 1px solid var(--nexa-border-color);
}

.progress-stats-section {
  background: var(--nexa-background-lower);
  border-bottom: 1px solid var(--nexa-border-color);

  // 진행률 바와 라벨 간격 최소화
  .row.items-center {
    margin-bottom: 0 !important;
  }

  .row.items-center.justify-center {
    padding-top: 0px !important;
  }

  .progress-icon {
    color: var(--nexa-primary);
  }

  .progress-bar {
    :deep(.q-linear-progress__track) {
      background-color: var(--nexa-progress-bg);
    }
    :deep(.q-linear-progress__model) {
      background-color: var(--nexa-progress-value-bg);
    }
  }

  .progress-text {
    color: var(--nexa-primary);
  }

  .stats-label {
    color: var(--nexa-text-secondary);
  }

  .stats-completed {
    color: var(--nexa-success);
  }
}

// 멀티 셀렉션 액션 바
.multi-selection-bar {
  background: var(--nexa-background-darker);
  border: 1px solid var(--nexa-border-active);

  .multi-select-label {
    display: flex;
    align-items: center;
    color: var(--nexa-primary);
    font-size: 14px;
    font-weight: 500;
  }

  .multi-select-icon {
    font-size: 16px;
    margin-right: 0 !important;
  }

  .multi-select-text {
    margin-left: 0;
  }

  // 액션 버튼 아이콘-라벨 간격 0으로 설정 및 폰트 크기 증가
  :deep(.q-btn) {
    .q-icon {
      margin-right: 0 !important;
      font-size: 18px !important;
    }
    .q-btn__content {
      font-size: 14px !important;
    }
    // 버튼이 줄바꿈되지 않도록
    flex-shrink: 0;
    white-space: nowrap;
  }
}

.file-list-icon-section {
  min-width: 20px;
  max-width: 40px;
  width: 26px;

  .q-icon {
    font-size: 22px;
    width: 22px;
    height: 22px;
  }
}

.match-count-label {
  color: var(--nexa-primary);
  font-weight: 600;
  font-size: 0.85em;
}

.match-count {
  position: absolute;
  right: -10px;
  top: -4px; // usage-count 위에 배치
  font-size: 12px;
  color: var(--nexa-item-selected-text);
  background-color: var(--nexa-accent);
  font-weight: normal;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 3px;
  z-index: 1;
}

.file-progress-inline {
  font-size: 0.85em;
  font-weight: 500;
  margin-left: 8px;
  color: var(--nexa-accent);
}

.usage-count {
  position: absolute;
  right: -4px;
  top: 0;
  font-size: 11px;
  color: var(--nexa-button-secondary-text);
  font-weight: normal;
  line-height: 1;
  padding: 0;
  margin: 0;

  // 우선순위 모드에서 사용빈도 라벨 위치 조정 (현제는 우선순의 모드에서는 가려짐, 보이게 하려면 주석제거)
  // &.priority-mode {
  //   right: 1px; // 우선순위 뱃지(left: -10px 기준) 왼쪽에 위치
  //   left: auto;
  // }
}

.priority-badge {
  position: absolute;
  right: -10px;
  top: -8px;
  background-color: var(--nexa-button-primary-bg);
  color: var(--nexa-button-primary-text);
  border-radius: 2px;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  padding: 0;
  min-width: 14px;
  margin: 0;
}

// 파일 리스트 아이템 구분선 색상 (Quasar separator는 border-top 사용)
:deep(.q-item:not(:first-child)) {
  border-top-color: var(--nexa-border-color);
  border-top-width: 1px;
}

:deep(.q-item) {
  color: var(--nexa-text-secondary);
  padding-left: 6px;
  box-sizing: border-box; // border 추가 시 레이아웃 시프트 방지
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  .q-item__section {
    position: relative;
    overflow: visible;
  }

  .q-item__label {
    color: var(--nexa-text-secondary);
  }

  .q-icon {
    color: var(--nexa-text-secondary);
    opacity: 0.7;
    cursor: pointer;
  }

  &:hover {
    background-color: var(--nexa-surface);
    color: var(--nexa-text-primary);

    .q-item__label {
      color: var(--nexa-text-primary);
    }

    .q-icon {
      color: var(--nexa-text-primary);
      opacity: 1;
    }
  }

  &.q-item--active,
  &.bg-primary,
  &.item-active {
    background-color: var(--nexa-item-selected-bg);
    color: var(--nexa-item-selected-text);

    .q-item__label {
      color: var(--nexa-item-selected-text);
    }

    .q-icon {
      color: var(--nexa-item-selected-text);
      opacity: 1;
    }
  }

  &[draggable='true'] {
    cursor: move;

    &:hover {
      background-color: var(--nexa-surface);
    }
  }

  &.drag-over {
    background-color: var(--nexa-item-dragover-bg);

    &[data-drop-position='before'] {
      border-top: 4px solid var(--nexa-primary);
    }

    &[data-drop-position='after'] {
      border-bottom: 4px solid var(--nexa-primary);
    }
  }

  &.dragging {
    opacity: 0.5;
  }

  &.recently-moved {
    background-color: var(--nexa-surface);
    box-sizing: border-box;
    border: 2px solid var(--nexa-primary);
    animation: recentlyMovedBorderBlink 1s ease-in-out infinite;
    // transform, opacity transition 제거하여 레이아웃 시프트 방지
  }
}

:deep(.q-item-label--header) {
  background-color: var(--nexa-background-darker);
  padding: 1px 5px 3px 5px;
}

.search-result-header,
.category-header {
  color: var(--nexa-primary);
}

.search-excluded-header {
  color: var(--nexa-text-secondary);
}

.item-label-secondary {
  color: var(--nexa-text-secondary);
}

.item-date-label {
  color: var(--nexa-text-dark) !important;
}

.empty-state {
  color: var(--nexa-text-secondary);
}

:deep(.q-item-label.header ~ .q-separator),
:deep(.q-item__label--header ~ .q-separator) {
  background-color: var(--nexa-border-color);
  color: var(--nexa-border-color);
  height: 3px;
  padding: 0;
  margin: 0;
}

@keyframes recentlyMovedBorderBlink {
  0% {
    border-color: var(--nexa-primary);
  }
  50% {
    border-color: transparent;
  }
  100% {
    border-color: var(--nexa-primary);
  }
}

// ============================================
// 아이콘 그리드 스타일
// ============================================

// 모드 아이콘 그리드
.mode-icon-grid {
  background: var(--nexa-background-lower);
  border-bottom: 1px solid var(--nexa-border-color);
  padding-top: 0px !important; // 상단 패딩 최소화

  .mode-grid-item {
    border: 1px solid var(--nexa-border-color);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex: 1;
    min-width: 0; // 반응형을 위해 필요
    padding: 4px;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;

    &:hover {
      background-color: var(--nexa-surface);
      border-color: var(--nexa-border-active);
    }

    // 활성화된 모드 하일라이트
    &.mode-active {
      background-color: var(--nexa-item-selected-bg);
      border-color: var(--nexa-border-active);
    }
  }

  .mode-icon-btn {
    width: 100%;
    height: 100%;
    min-height: auto;
    padding: 0px;
    pointer-events: none; // 클릭 이벤트를 부모로 전달
    height: auto;

    // 아이콘 크기 반응형 (컨테이너 크기에 따라 자동 조정)
    :deep(.q-icon) {
      font-size: clamp(16px, 2.5vw, 22px);
      width: clamp(16px, 2.5vw, 22px);
      height: clamp(16px, 2.5vw, 22px);
    }

    &.mode-icon-btn-active {
      :deep(.q-icon) {
        color: var(--nexa-primary);
      }
    }

    &.mode-icon-btn-inactive {
      :deep(.q-icon) {
        color: var(--nexa-text-secondary);
      }
    }
  }
}

// 멀티 셀렉션된 항목 스타일
:deep(.q-item.multi-selected) {
  background-color: var(--nexa-item-selected-bg);
  // border-left 대신 box-shadow 사용하여 레이아웃 시프트 방지
  box-shadow: inset 3px 0 0 var(--nexa-primary);
}

:deep(.q-item.multi-selected:hover) {
  background-color: var(--nexa-item-selected-hover-bg);
}

// active 상태와 multi-selected가 동시에 적용될 때 처리
:deep(.q-item.bg-primary.multi-selected),
:deep(.q-item.item-active.multi-selected) {
  // active 상태일 때는 border-left 효과만 유지 (배경색은 active 우선)
  box-shadow: inset 3px 0 0 var(--nexa-primary);
}

// 버튼 스타일
.btn-primary {
  :deep(.q-icon) {
    color: var(--nexa-primary);
  }
  :deep(.q-btn__content) {
    color: var(--nexa-primary);
  }
}

.btn-secondary {
  :deep(.q-icon) {
    color: var(--nexa-primary);
  }
  :deep(.q-btn__content) {
    color: var(--nexa-primary);
  }
}

.btn-error {
  :deep(.q-icon) {
    color: var(--nexa-warning);
  }
  :deep(.q-btn__content) {
    color: var(--nexa-warning);
  }
}

// 아이콘 스타일
.icon-favorite {
  color: var(--nexa-warning);
}

.icon-default {
  color: var(--nexa-text-secondary);
}

.icon-trash {
  color: var(--nexa-text-secondary);
}
</style>

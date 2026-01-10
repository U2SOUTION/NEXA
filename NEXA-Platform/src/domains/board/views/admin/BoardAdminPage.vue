<template>
  <q-page padding class="column no-wrap" style="padding: 10px">
    <!-- 해더 영역: 페이지 타이틀 및 최상위 만들기 버튼 -->
    <div class="q-mb-md">
      <div class="row items-center justify-between">
        <div class="row items-center">
          <div class="text-h5 board-title" @click="goToBaseStep" style="cursor: pointer; display: flex; align-items: center">
            <q-icon name="dashboard" class="board-title-icon q-mr-sm" />
            보드 관리
          </div>
          <div class="step-indicator-container q-ml-md">
            <!-- 1단계 -->
            <div class="step-wrapper" :class="{ 'active-step': currentStep === 'directory' || currentStep === null }" @click="navigateToStep('directory')">
              <q-icon name="filter_1" class="step-number-icon" />
              <span class="step-text">디렉토리 선택</span>
            </div>

            <q-icon name="chevron_right" class="step-separator-icon" />

            <!-- 2단계 -->
            <div class="step-wrapper" :class="{ 'active-step': currentStep === 'type' }" @click="navigateToStep('type')">
              <q-icon name="filter_2" class="step-number-icon" />
              <span class="step-text">작업 타입 선택</span>
            </div>

            <q-icon name="chevron_right" class="step-separator-icon" />

            <!-- 3단계 -->
            <div class="step-wrapper" :class="{ 'active-step': currentStep === 'form' }" @click="navigateToStep('form')">
              <q-icon name="filter_3" class="step-number-icon" />
              <span class="step-text">정보입력 및 수정</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 메인영역: 좌측 폼 + 우측 가이드 -->
    <div class="row q-col-gutter-md full-height" style="flex-grow: 1; min-height: calc(100vh - 120px)">
      <!-- 메인 왼쪽 컬럼: 입력 폼 영역 -->
      <div class="col-xs-12 col-md-8 column" style="padding-top: 3px">
        <q-card class="step-form-container column items-center justify-center q-pa-md full-height">
          <!-- 단계 1: 디렉토리 선택 -->
          <div
            v-if="currentStep === 'directory'"
            class="step-wrapper column items-center full-width q-mt-lg"
            :class="{
              'q-mb-md': currentStep === 'directory',
            }"
          >
            <directory-selection key="dir-selection" v-model="selectedDirectoryType" @update:modelValue="handleDirectorySelect" @highlight-guide="handleGuideHighlight" :is-selectable="true" :is-parent-group-selection-pending="isParentGroupSelectionPending" />
            <!-- 안내 메시지 추가 -->
            <div v-if="isParentGroupSelectionPending" class="text-amber-7 q-mt-md q-pa-md bg-grey-2 rounded-borders shadow-1 text-center" style="max-width: 420px; margin-left: auto; margin-right: auto">
              <div class="row items-center no-wrap">
                <q-icon name="info" :style="'font-size: 3rem !important;'" class="q-mr-md" />
                <div class="column text-left">
                  <div class="text-h6 text-weight-bold">부모 그룹을 선택해주세요.</div>
                  <div class="text-body2 text-grey-8 q-mt-xs">왼쪽 사이드바의 그룹 목록에서 현재 항목을 추가할 상위 그룹을 클릭하세요.</div>
                  <div class="text-body2 text-grey-8">선택된 그룹 하위에 새 항목이 생성됩니다.</div>
                </div>
              </div>
            </div>
            <!-- 유효하지 않은 부모 선택 시 안내 메시지 -->
            <div v-if="showInvalidParentSelectionMessage" class="text-negative q-mt-sm q-pa-sm bg-red-1 rounded-borders shadow-1 text-center" style="max-width: 420px; margin-left: auto; margin-right: auto">
              <q-icon name="error_outline" size="sm" class="q-mr-xs" />
              선택하신 항목은 '그룹'이 아닙니다. 다시 선택해주세요.
            </div>
          </div>

          <!-- 단계 2: 타입 선택 -->
          <div v-show="currentStep === 'type'" class="step-wrapper text-center full-width q-mt-xl" :class="{ 'q-mb-md': currentStep === 'type' }" style="display: flex; flex-direction: column; align-items: center; width: 100%">
            <type-selection
              :key="typeSelectionKey"
              v-model="selectedItemType"
              @update:modelValue="handleTypeSelect"
              @delete-item="handleDeleteItemRequest"
              @rename-item="handleRenameItemRequest"
              @go-prev-step="resetToDirectorySelection"
              @highlight-guide="handleGuideHighlight"
              :is-selectable="true"
              :selected-directory-type="selectedDirectoryType"
              :selected-parent-group-name="selectedParentGroupName"
              :drawer-context-type="boardEditorStore.getDrawerSelectionContextForAdmin"
              :is-editing-possible="boardEditorStore.isActualNodeSelectedForAdmin"
            />
          </div>

          <!-- 단계 3: 폼 입력 -->
          <div v-if="currentStep === 'form'" class="step-wrapper column items-center full-width q-mt-xl" style="width: 100%; max-width: 700px">
            <add-group-form v-if="selectedItemType === 'group'" @save="handleSaveGroup" @cancel="resetToTypeSelection" @go-prev-step="resetToTypeSelection" :parent-node="selectedNode" :is-editing="isEditing" :initial-data="isEditing ? selectedNode : null" />

            <add-board-form v-else-if="selectedItemType === 'board'" @save="handleSaveBoard" @cancel="resetToTypeSelection" @go-prev-step="resetToTypeSelection" :parent-node="selectedNode" :is-editing="isEditing" :initial-data="isEditing ? selectedNode : null" />
          </div>
        </q-card>
      </div>

      <!-- 매인 오른쪽 컬럼: 가이드 영역 (데스크톱에서만 보임) -->
      <div class="col-xs-12 col-md-4 column" v-if="$q.screen.gt.sm" style="padding-top: 3px; padding-left: 3px">
        <board-guide ref="boardGuideRef" :current-step="currentStep" :highlighted-node="highlightedNode" class="full-height guide-container" />
      </div>
    </div>

    <!-- 모바일용 가이드 버튼 -->
    <q-btn v-if="$q.screen.lt.md" flat icon="help_outline" label="편집 가이드" color="primary" class="fixed-bottom-right q-ma-md" style="display: flex; align-items: center; justify-content: center" @click="showMobileGuide = true" />

    <!-- 모바일용 가이드 다이얼로그 -->
    <q-dialog v-model="showMobileGuide">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">편집 가이드</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <board-guide :current-step="currentStep" :highlighted-node="highlightedNode" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useBoardMenuStore } from '@system/store/boardMenuStore.js'
import { useDashboardLayoutStore } from '@system/store/dashboardLayoutStore.js'
import { useQuasar } from 'quasar'
import DirectorySelection from '@system/components/ui/DirectorySelection.vue'
import TypeSelection from '@system/components/ui/TypeSelection.vue'
import BoardGuide from '../../components/BoardGuide.vue'
import AddGroupForm from '../../components/AddGroupForm.vue'
import AddBoardForm from '../../components/AddBoardForm.vue'
import { useBoardEditorStore } from '@system/store/boardEditorStore.js'

const boardMenuStore = useBoardMenuStore()
const dashboardLayoutStore = useDashboardLayoutStore()
const boardEditorStore = useBoardEditorStore()
const $q = useQuasar()

const showMobileGuide = ref(false)

const selectedNodeId = computed(() => dashboardLayoutStore.selectedNodeIdForEditor)
const selectedNode = computed(() => {
  if (isEditing.value && boardEditorStore.drawerSelectionForAdmin?.id) {
    return boardMenuStore.getNodeById(boardEditorStore.drawerSelectionForAdmin.id)
  }
  return selectedParentGroupIdFromDrawer.value ? boardMenuStore.getNodeById(selectedParentGroupIdFromDrawer.value) : null
})

const currentStep = ref(null)
const selectedDirectoryType = ref(null)
const selectedItemType = ref(null)
const highlightedNode = ref(null)
const isParentGroupSelectionPending = ref(false)
const selectedParentGroupIdFromDrawer = ref(null)
const showInvalidParentSelectionMessage = ref(false)
const selectedParentGroupName = ref(null)
const isEditing = ref(false)
const typeSelectionKey = ref(0)

const boardGuideRef = ref(null)

watch(
  selectedNodeId,
  () => {
    // newItem.value = { name: '', type: 'group' }
  },
  { immediate: true },
)

watch(
  () => boardEditorStore.drawerSelectionForAdmin,
  (newSelection, oldSelection) => {
    console.log('BoardAdminPage: drawerSelectionForAdmin changed from', oldSelection, 'to:', newSelection)

    selectedItemType.value = null
    isParentGroupSelectionPending.value = false
    showInvalidParentSelectionMessage.value = false
    isEditing.value = false

    if (newSelection === null) {
      currentStep.value = 'directory'
      selectedDirectoryType.value = null
      selectedParentGroupIdFromDrawer.value = null
      selectedParentGroupName.value = null
      console.log('Drawer selection cleared, going to directory step (root context)')
    } else if (newSelection.type === 'root-context') {
      currentStep.value = 'type'
      selectedDirectoryType.value = 'root'
      selectedParentGroupIdFromDrawer.value = null
      selectedParentGroupName.value = null
      console.log('Root context selected from drawer, going to type step (root)')
    } else if (newSelection.id && newSelection.type && newSelection.name) {
      currentStep.value = 'type'
      selectedDirectoryType.value = 'sub'
      selectedParentGroupName.value = newSelection.name
      selectedParentGroupIdFromDrawer.value = newSelection.id
      console.log(`Node ${newSelection.name} selected from drawer, going to type step (sub context)`)
    } else {
      currentStep.value = 'directory'
      selectedDirectoryType.value = null
      selectedParentGroupIdFromDrawer.value = null
      selectedParentGroupName.value = null
      console.warn('Unexpected drawerSelectionForAdmin value, defaulting to directory step:', newSelection)
    }
  },
  { immediate: true, deep: true },
)

watch(currentStep, (newStep) => {
  if (newStep === 'type') {
    typeSelectionKey.value++
  }
})

watch(
  () => boardEditorStore.selectedPotentialParentInDrawer,
  (newPotentialParent) => {
    if (isParentGroupSelectionPending.value) {
      showInvalidParentSelectionMessage.value = false
      if (newPotentialParent && newPotentialParent.id) {
        if (newPotentialParent.type === 'group') {
          selectedParentGroupIdFromDrawer.value = newPotentialParent.id
          selectedParentGroupName.value = newPotentialParent.name
          isParentGroupSelectionPending.value = false
          currentStep.value = 'type'
        } else {
          selectedParentGroupIdFromDrawer.value = null
          selectedParentGroupName.value = null
          showInvalidParentSelectionMessage.value = true
        }
      }
    }
  },
  { deep: true },
)

onMounted(() => {
  if (!currentStep.value) {
    if (boardEditorStore.drawerSelectionForAdmin) {
      // drawerSelectionForAdmin watch의 immediate:true 옵션으로 인해
      // 이 블록이 실행될 시점에는 이미 currentStep 등이 설정되었을 가능성이 높음.
    } else {
      currentStep.value = 'directory'
    }
  }
})

function handleDirectorySelect(type) {
  boardEditorStore.clearDrawerSelectionForAdmin()
  boardEditorStore.clearPotentialParentInDrawer()

  selectedDirectoryType.value = type
  selectedItemType.value = null
  isEditing.value = false

  if (type === 'sub') {
    isParentGroupSelectionPending.value = true
    currentStep.value = 'directory'
  } else if (type === 'root') {
    isParentGroupSelectionPending.value = false
    currentStep.value = 'type'
    selectedParentGroupIdFromDrawer.value = null
    selectedParentGroupName.value = null
  } else {
    isParentGroupSelectionPending.value = false
    currentStep.value = 'directory'
    selectedParentGroupIdFromDrawer.value = null
    selectedParentGroupName.value = null
  }
}

function handleTypeSelect(typeFromSelection) {
  if (typeFromSelection === 'edit') {
    if (boardEditorStore.isActualNodeSelectedForAdmin) {
      isEditing.value = true
      selectedItemType.value = boardEditorStore.drawerSelectionForAdmin.type
    } else {
      console.error('Edit type selected, but no actual node selected in drawer for editing.')
      resetToDirectorySelection()
      return
    }
  } else {
    isEditing.value = false
    selectedItemType.value = typeFromSelection
  }
  currentStep.value = 'form'
}

function handleDeleteItemRequest({ id, name }) {
  $q.dialog({
    title: '항목 삭제 확인',
    message: `정말로 '${name}' 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다. 그룹인 경우 하위 항목들도 모두 함께 삭제됩니다.`,
    persistent: true,
    ok: {
      label: '삭제',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: false,
    },
  }).onOk(async () => {
    try {
      await boardMenuStore.removeNode(id)
      $q.notify({ type: 'positive', message: `'${name}' 항목이 삭제되었습니다.` })
      boardEditorStore.clearDrawerSelectionForAdmin()
    } catch (error) {
      console.error('Error deleting item:', error)
      $q.notify({
        type: 'negative',
        message: `항목 삭제 중 오류 발생: ${error.message || '알 수 없는 오류'}`,
      })
    }
  })
}

function handleRenameItemRequest({ id, currentName }) {
  $q.dialog({
    title: '이름 변경',
    message: `'${currentName}' 항목의 새 이름을 입력하세요:`,
    prompt: {
      model: currentName,
      type: 'text',
      isValid: (val) => !!val.trim(),
      attrs: { maxlength: 50 },
    },
    persistent: true,
    ok: {
      label: '변경',
      color: 'primary',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: false,
    },
  }).onOk(async (newName) => {
    if (!newName || !newName.trim()) {
      $q.notify({ type: 'warning', message: '이름은 비워둘 수 없습니다.' })
      return
    }
    if (newName.trim() === currentName) {
      $q.notify({ type: 'info', message: '이름이 변경되지 않았습니다.' })
      return
    }

    try {
      const updatedNode = await boardMenuStore.updateNode(id, { name: newName.trim() })
      if (updatedNode) {
        $q.notify({
          type: 'positive',
          message: `'${currentName}'이(가) '${newName.trim()}'(으)로 변경되었습니다.`,
        })
        if (boardEditorStore.drawerSelectionForAdmin && boardEditorStore.drawerSelectionForAdmin.id === id) {
          boardEditorStore.setDrawerItemSelectionForAdmin({
            ...boardEditorStore.drawerSelectionForAdmin,
            name: newName.trim(),
          })
        }
        if (selectedParentGroupIdFromDrawer.value === id) {
          selectedParentGroupName.value = newName.trim()
        }
      } else {
        $q.notify({
          type: 'negative',
          message: '이름 변경 중 오류가 발생했습니다 (노드 업데이트 실패).',
        })
      }
    } catch (error) {
      console.error('Error renaming item:', error)
      $q.notify({
        type: 'negative',
        message: `이름 변경 중 오류 발생: ${error.message || '알 수 없는 오류'}`,
      })
    }
  })
}

function resetFormAndState() {
  selectedItemType.value = null
  isEditing.value = false
  resetToDirectorySelection()
}

function handleSaveGroup(formData) {
  let parentId = null
  if (isEditing.value) {
    try {
      boardMenuStore.updateNode(boardEditorStore.drawerSelectionForAdmin.id, { ...formData })
      $q.notify({ type: 'positive', message: '그룹이 수정되었습니다.' })
      resetFormAndState()
    } catch (error) {
      console.error('Error updating group:', error)
      $q.notify({ type: 'negative', message: '그룹 수정 중 오류 발생' })
    }
    return
  }

  if (boardEditorStore.drawerSelectionForAdmin) {
    if (boardEditorStore.drawerSelectionForAdmin.type === 'group') {
      parentId = boardEditorStore.drawerSelectionForAdmin.id
    } else if (boardEditorStore.drawerSelectionForAdmin.type === 'root-context') {
      parentId = null
    } else if (boardEditorStore.drawerSelectionForAdmin.type === 'board') {
      const selectedBoardNode = boardMenuStore.getNodeById(boardEditorStore.drawerSelectionForAdmin.id)
      parentId = selectedBoardNode ? selectedBoardNode.parentId : null
    }
  } else {
    if (selectedDirectoryType.value === 'root') {
      parentId = null
    } else if (selectedDirectoryType.value === 'sub' && selectedParentGroupIdFromDrawer.value) {
      parentId = selectedParentGroupIdFromDrawer.value
    }
  }

  try {
    const newNode = boardMenuStore.addNode({ ...formData, type: 'group', parentId })
    if (newNode) {
      $q.notify({ type: 'positive', message: '그룹이 저장되었습니다.' })
      boardEditorStore.setNodeToExpandAndHighlight({
        nodeId: newNode.id,
        parentId: newNode.parentId,
      })
      resetFormAndState()
    } else {
      $q.notify({ type: 'negative', message: '그룹 저장 중 문제가 발생했습니다.' })
    }
  } catch (error) {
    console.error('Error saving group:', error)
    $q.notify({ type: 'negative', message: '그룹 저장 중 오류 발생' })
  }
}

function handleSaveBoard(formData) {
  let parentId = null

  if (isEditing.value) {
    try {
      const updatePayload = { ...formData }
      if (Object.prototype.hasOwnProperty.call(updatePayload, 'boardName')) {
        updatePayload.name = updatePayload.boardName
        delete updatePayload.boardName
      }

      boardMenuStore.updateNode(boardEditorStore.drawerSelectionForAdmin.id, updatePayload)
      $q.notify({ type: 'positive', message: '보드가 수정되었습니다.' })
      resetFormAndState()
    } catch (error) {
      console.error('Error updating board:', error)
      $q.notify({ type: 'negative', message: '보드 수정 중 오류 발생' })
    }
    return
  }

  if (boardEditorStore.drawerSelectionForAdmin) {
    if (boardEditorStore.drawerSelectionForAdmin.type === 'group') {
      parentId = boardEditorStore.drawerSelectionForAdmin.id
    } else if (boardEditorStore.drawerSelectionForAdmin.type === 'board') {
      const selectedBoardNode = boardMenuStore.getNodeById(boardEditorStore.drawerSelectionForAdmin.id)
      parentId = selectedBoardNode ? selectedBoardNode.parentId : null
    } else if (boardEditorStore.drawerSelectionForAdmin.type === 'root-context') {
      parentId = null
    }
  } else {
    if (selectedDirectoryType.value === 'root') {
      parentId = null
    } else if (selectedDirectoryType.value === 'sub' && selectedParentGroupIdFromDrawer.value) {
      const parentNode = boardMenuStore.getNodeById(selectedParentGroupIdFromDrawer.value)
      if (parentNode && parentNode.type === 'group') {
        parentId = selectedParentGroupIdFromDrawer.value
      } else {
        $q.notify({
          type: 'negative',
          message: '보드를 생성할 유효한 상위 그룹이 선택되지 않았습니다.',
        })
        return
      }
    }
  }

  const createPayload = { ...formData, type: 'board', parentId }
  if (Object.prototype.hasOwnProperty.call(createPayload, 'boardName')) {
    createPayload.name = createPayload.boardName
    delete createPayload.boardName
  }

  try {
    const newNode = boardMenuStore.addNode(createPayload)
    if (newNode) {
      $q.notify({ type: 'positive', message: '보드가 저장되었습니다.' })
      boardEditorStore.setNodeToExpandAndHighlight({
        nodeId: newNode.id,
        parentId: newNode.parentId,
      })
      resetFormAndState()
    } else {
      $q.notify({ type: 'negative', message: '보드 저장 중 문제가 발생했습니다.' })
    }
  } catch (error) {
    console.error('Error saving board:', error)
    $q.notify({ type: 'negative', message: '보드 저장 중 오류 발생' })
  }
}

function resetToTypeSelection() {
  currentStep.value = 'type'
  selectedItemType.value = null
  isEditing.value = false
}

function resetToDirectorySelection() {
  boardEditorStore.clearDrawerSelectionForAdmin()
  boardEditorStore.clearPotentialParentInDrawer()

  currentStep.value = 'directory'
  selectedDirectoryType.value = null
  selectedItemType.value = null
  isParentGroupSelectionPending.value = false
  selectedParentGroupIdFromDrawer.value = null
  showInvalidParentSelectionMessage.value = false
  selectedParentGroupName.value = null
  isEditing.value = false
}

function goToBaseStep() {
  resetToDirectorySelection()
}

function navigateToStep(stepName) {
  console.log(`Attempting to navigate to step: ${stepName}`)
}

function handleGuideHighlight(type) {
  if (type === 'root') {
    boardGuideRef.value?.highlightTopDirectory()
  } else if (type === 'sub') {
    boardGuideRef.value?.highlightSubDirectory()
  } else if (type === 'group') {
    boardGuideRef.value?.highlightGroup()
  } else if (type === 'board') {
    boardGuideRef.value?.highlightBoard()
  } else {
    boardGuideRef.value?.resetHighlight()
  }
}
</script>

<style scoped>
.sticky-guide {
  position: sticky;
  top: 16px;
}

.col-auto {
  flex-grow: 0;
}

/* 모바일 가이드 버튼 스타일 */
.fixed-bottom-right {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 1000;
}

/* T자형 레이아웃 스타일 */
.full-height {
  height: 100%;
}

/* 하단 폼 영역 최소 높이 설정 */
.col-auto {
  min-height: 300px;
}

/* 디렉토리 선택 및 타입 선택 컴포넌트 스타일 */
.directory-selection,
.type-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
}

.directory-selection :deep(.q-icon),
.type-selection :deep(.q-icon) {
  font-size: 48px;
  margin-bottom: 16px;
}

.directory-selection :deep(.q-btn),
.type-selection :deep(.q-btn) {
  margin: 8px;
  min-width: 120px;
}

/* 가이드 컨테이너 스타일 */
.guide-container {
  background: var(--nexa-background);
}

.guide-container :deep(.q-card),
.guide-container :deep(.q-card__section),
.guide-container :deep(.q-card__actions),
.guide-container :deep(.q-tree),
.guide-container :deep(.q-tree__node),
.guide-container :deep(.q-tree__node-header),
.guide-container :deep(.q-tree__node-body),
.guide-container :deep(.q-tree__node-content),
.guide-container :deep(.q-tree__node-icon),
.guide-container :deep(.q-tree__node-label),
.guide-container :deep(.q-tree__node-children),
.guide-container :deep(.q-tree__node-toggle),
.guide-container :deep(.q-tree__node-toggle-icon) {
  background: var(--nexa-background) !important;
  box-shadow: none !important;
}

.guide-container :deep(.q-card) {
  border: none;
}

.guide-container :deep(.q-tree__node-header) {
  border: none;
  padding: 4px 0;
}

.guide-container :deep(.q-tree__node-content) {
  border: none;
  margin: 0;
  padding: 0;
}

.guide-container :deep(.q-tree__node-children) {
  margin-left: 24px;
}

/* 단계 번호 스타일 */
.step-number {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

/* 상단 스텝 인디케이터 스타일 */
.board-title {
  transition: color 0.3s ease;
}
.board-title:hover {
  color: var(--nexa-primary);
}

.board-title-icon {
  font-size: 1em;
}

.step-indicator-container {
  display: flex;
  align-items: center;
}

/* 각 단계를 감싸는 div (아이콘 + 텍스트) */
.step-wrapper {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.step-number-icon {
  font-size: 1.3em;
  color: var(--nexa-text-secondary);
  margin-right: 5px;
  transition: color 0.3s ease;
}

.step-text {
  font-size: 0.95em;
  color: var(--nexa-text-secondary);
  transition:
    color 0.3s ease,
    font-weight 0.3s ease;
}

/* 활성화된 단계 스타일 */
.step-wrapper.active-step .step-number-icon {
  color: var(--nexa-primary);
}

.step-wrapper.active-step .step-text {
  color: var(--nexa-primary);
  font-weight: bold;
}

.step-wrapper.active-step {
  background-color: var(--nexa-surface);
}

/* 구분자 아이콘 스타일 */
.step-separator-icon {
  font-size: 1.5em;
  color: var(--nexa-border-color);
  margin: 0 2px;
}

.step-form-container.q-card {
  box-shadow: none !important;
  border: none !important;
  background-color: transparent !important;
}

.step-form-container .q-card__section {
  border-bottom: none !important;
  box-shadow: none !important;
}
</style>

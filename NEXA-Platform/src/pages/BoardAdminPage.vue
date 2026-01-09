<template>
  <q-page padding class="column no-wrap" style="padding: 10px">
    <!-- 해더 영역: 페이지 타이틀 및 최상위 만들기 버튼 -->
    <div class="q-mb-md">
      <div class="row items-center justify-between">
        <!-- <div class="text-h5">
          보드 관리
          <span class="text-h7"> 디렉토리 선택 > 작업 타입 선택 > 정보입력 및 수정 </span>
        </div> -->
        <div class="row items-center">
          <!-- 전체를 감싸는 div 추가 (스타일링 용이) -->
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
      <!-- 메인의 왼쪽 컬럼 영역 -->
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
import { useBoardMenuStore } from 'src/system/store/boardMenuStore'
import { useDashboardLayoutStore } from 'src/system/store/dashboardLayoutStore'
import { useQuasar } from 'quasar'
import DirectorySelection from 'src/components/DirectorySelection.vue'
import TypeSelection from 'src/components/TypeSelection.vue'
import BoardGuide from 'src/components/BoardGuide.vue'
import AddGroupForm from 'src/components/form/AddGroupForm.vue'
import AddBoardForm from 'src/components/form/AddBoardForm.vue'
import { useBoardEditorStore } from 'src/system/store/boardEditorStore'

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
      // 따라서 여기서 특별한 추가 동작이 필요 없을 수 있음.
      // console.log('onMounted: drawerSelectionForAdmin exists, step should be set by watch.');
    } else {
      // 스토어에도 없고 currentStep도 없으면 기본 1단계
      currentStep.value = 'directory'
      // selectedDirectoryType.value = 'root' // 초기 'root' 자동 선택 제거
      // console.log('onMounted: No drawer selection, defaulting to directory step.');
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
      await boardMenuStore.removeNode(id) // 비동기 처리가 될 수 있으므로 await 사용 고려
      $q.notify({ type: 'positive', message: `'${name}' 항목이 삭제되었습니다.` })
      boardEditorStore.clearDrawerSelectionForAdmin() // 드로어 선택 해제
      // resetToDirectorySelection(); // 1단계로 돌아가거나, 드로어 선택이 해제되면 watch 로직에 의해 자동으로 1단계로 갈 수 있음.
      // clearDrawerSelectionForAdmin() 호출 후의 동작을 확인하고 이 부분 결정.
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
      model: currentName, // 입력 필드의 초기값
      type: 'text', // 입력 타입
      isValid: (val) => !!val.trim(), // 간단한 유효성 검사 (빈 값 방지)
      attrs: { maxlength: 50 }, // 최대 길이 제한 (옵션)
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
        // 드로어 선택 정보 업데이트 (중요)
        if (boardEditorStore.drawerSelectionForAdmin && boardEditorStore.drawerSelectionForAdmin.id === id) {
          boardEditorStore.setDrawerItemSelectionForAdmin({
            ...boardEditorStore.drawerSelectionForAdmin,
            name: newName.trim(),
          })
        }
        // selectedParentGroupName도 업데이트 (만약 현재 이름 변경 대상이 부모 그룹이었다면)
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
  console.log('Save Group:', formData, 'isEditing:', isEditing.value)
  console.log('Context - selectedDirectoryType:', selectedDirectoryType.value, 'selectedParentGroupId:', selectedParentGroupIdFromDrawer.value, 'DrawerSelection:', boardEditorStore.drawerSelectionForAdmin)

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
      console.warn("Creating a group under a board context. Parent determined by selected board's parent.")
    }
  } else {
    if (selectedDirectoryType.value === 'root') {
      parentId = null
    } else if (selectedDirectoryType.value === 'sub' && selectedParentGroupIdFromDrawer.value) {
      parentId = selectedParentGroupIdFromDrawer.value
    }
  }
  console.log('Final Parent ID for new group:', parentId)

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
  console.log('Save Board:', formData, 'isEditing:', isEditing.value)
  console.log('Context - selectedDirectoryType:', selectedDirectoryType.value, 'selectedParentGroupId:', selectedParentGroupIdFromDrawer.value, 'DrawerSelection:', boardEditorStore.drawerSelectionForAdmin)

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
        console.error('Cannot create board under non-group or invalid parent from 1-step sub selection.')
        $q.notify({
          type: 'negative',
          message: '보드를 생성할 유효한 상위 그룹이 선택되지 않았습니다.',
        })
        return
      }
    }
  }
  console.log('Final Parent ID for new board:', parentId)

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
  resetToDirectorySelection() // "보드 관리" 클릭 시 1단계 초기 상태로 돌아감
}

function navigateToStep(stepName) {
  // 현재는 직접 네비게이션을 구현하지 않으므로, 필요한 경우 아래 주석을 참고하여 확장합니다.
  console.log(`Attempting to navigate to step: ${stepName} (Direct navigation is complex and currently limited)`)

  // 예시: 1단계로만 이동 허용 (다른 단계는 현재 상태 유지)
  // if (stepName === 'directory') {
  //   resetToDirectorySelection();
  // }

  // 경고: 아래와 같이 단순히 currentStep.value를 변경하는 것은
  // 해당 단계에 필요한 데이터 (selectedDirectoryType, selectedItemType 등)가
  // 설정되지 않은 상태로 이동할 수 있어 문제를 일으킬 수 있습니다.
  // 신중한 상태 관리가 필요합니다.
  // currentStep.value = stepName;
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
  width: 100%; /* 부모 너비를 채우도록 명시하여 카드 크기 문제 해결 시도 */
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
  background: var(--nexa-card-bg);
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
  background: var(--nexa-card-bg) !important;
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

/* 단계 번호 스타일 (재추가) */
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
  /* 현재 크기 유지를 위해 특별한 스타일 추가 안 함. 필요시 추가 */
  transition: color 0.3s ease;
}
.board-title:hover {
  color: var(--nexa-primary); /* 호버 시 색상 변경 (선택 사항) */
}

.board-title-icon {
  font-size: 1em; /* text-h5 폰트 크기에 맞춤 */
  /* color: var(--nexa-primary); */ /* 필요시 색상 지정 */
}

.step-indicator-container {
  display: flex;
  align-items: center;
}

/* 각 단계를 감싸는 div (아이콘 + 텍스트) */
.step-wrapper {
  display: flex;
  align-items: center;
  padding: 4px 8px; /* 패딩 조정 */
  border-radius: 4px;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  /* cursor: pointer; */ /* 네비게이션 기능 시 주석 해제 */
}

.step-number-icon {
  font-size: 1.3em; /* 아이콘 크기 (step-text와 비율 맞춤) */
  color: #757575;
  margin-right: 5px;
  transition: color 0.3s ease;
}

.step-text {
  font-size: 0.95em; /* 이전 0.85em보다 글씨 크기 키움 */
  color: #757575;
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
  background-color: rgba(var(--nexa-primary-rgb), 0.1);
}

/* 구분자 아이콘 스타일 */
.step-separator-icon {
  font-size: 1.5em; /* 화살표 아이콘 크기 */
  color: #bdbdbd;
  margin: 0 2px; /* 좌우 마진 약간 줄임 */
}

.step-form-container.q-card {
  box-shadow: none !important;
  border: none !important;
}

.step-form-container .q-card__section {
  border-bottom: none !important;
  box-shadow: none !important;
}
</style>

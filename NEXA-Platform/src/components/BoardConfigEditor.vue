<!-- src/components/BoardConfigEditor.vue
이 컴포넌트는 props로 editingNodeId를 받아, 해당 ID로 boardMenuStore.getNodeById를 호출하여 노드(메뉴 항목) 정보를 가져오고, 폼(이름, 타입 등)에 현재 값을 채웁니다.
"저장" 버튼 클릭 시 boardMenuStore.updateNode를 호출하여 변경 사항을 저장합니다.
"삭제" 버튼 클릭 시 boardMenuStore.removeNode를 호출합니다. (삭제 확인 다이얼로그 추가 권장)
BoardAdminPage.vue에서 dashboardLayoutStore.selectedNodeIdForEditor 값이 있을 때, 이 BoardConfigEditor.vue를 표시하도록 하고 editingNodeId를 전달합니다. selectedNodeIdForEditor가 null이면 기존의 "최상위 항목 생성" UI를 표시합니다.
-->

<template>
  <q-card v-if="nodeData" flat bordered>
    <q-card-section>
      <div class="text-h6">{{ nodeData.type === 'group' ? '그룹' : '보드' }} 편집: {{ originalName }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section class="q-gutter-md">
      <q-input filled v-model="editableName" label="이름" dense :rules="[(val) => !!val || '이름은 필수입니다.']" ref="nameInputRef" />
      <q-input filled v-model="editableDescription" label="설명 (선택 사항)" type="textarea" autogrow dense />

      <div v-if="nodeData.type === 'board'" class="q-mt-md q-gutter-y-md">
        <div class="text-subtitle2">보드 상세 설정</div>
        <q-select filled v-model="editableDashboardPreset" :options="dashboardLayoutStore.presets" label="대시보드 레이아웃" dense emit-value map-options />

        <q-select filled v-model="editableDevices" :options="availableDevices" label="연결 디바이스 (다중 선택 가능)" multiple dense emit-value map-options use-chips stack-label>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.value }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-banner dense class="bg-blue-1 text-primary q-mt-sm">
          <template v-slot:avatar>
            <q-icon name="dashboard_customize" />
          </template>
          위젯 초기 구성 기능은 여기에 추가될 예정입니다.
        </q-banner>
      </div>
    </q-card-section>

    <q-card-actions align="right" class="q-pa-md">
      <q-btn label="저장" color="primary" @click="handleSaveChanges" :disable="!isChanged || !editableName" />
      <q-btn label="취소" flat color="grey-8" @click="resetForm" v-if="isChanged" />
      <q-btn label="삭제" color="negative" flat @click="confirmDeleteNode" class="q-ml-md" icon="delete" />
    </q-card-actions>
  </q-card>
  <div v-else class="text-center q-pa-md">
    <q-spinner color="primary" size="3em" />
    <p class="q-mt-sm text-grey-7">노드 정보를 불러오는 중...</p>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useBoardMenuStore } from 'src/stores/boardMenuStore'
import { useDashboardLayoutStore } from 'src/stores/dashboardLayoutStore' // 대시보드 프리셋 목록 가져오기용
import { useQuasar, Notify } from 'quasar'
import _isEqual from 'lodash/isEqual' // 배열/객체 비교를 위해 lodash.isEqual 사용

const props = defineProps({
  editingNodeId: {
    type: String,
    required: true,
  },
})

const boardMenuStore = useBoardMenuStore()
const dashboardLayoutStore = useDashboardLayoutStore() // 스토어 인스턴스
const $q = useQuasar()

const nodeData = ref(null) // 편집할 노드의 전체 데이터
const originalName = ref('')
const editableName = ref('')
const editableDescription = ref('')
const originalDashboardPreset = ref('single') // 보드용
const editableDashboardPreset = ref('single')
const originalDevices = ref([])
const editableDevices = ref([])

const nameInputRef = ref(null) // 이름 입력 필드 ref

// 임시 사용 가능한 디바이스 목록
const availableDevices = ref([
  { label: '거실 온도 센서', value: 'living_temp_sensor_01' },
  { label: '현관문 카메라', value: 'front_door_cam_alpha' },
  { label: '안방 조명 스위치', value: 'master_room_light_switch' },
  { label: '주방 가스 감지기', value: 'kitchen_gas_detector_v2' },
  { label: '정원 스프링클러', value: 'garden_sprinkler_main' },
])

// 폼 내용이 원본과 다른지 여부 계산
const isChanged = computed(() => {
  if (!nodeData.value) return false
  let boardFieldsChanged = false
  if (nodeData.value.type === 'board') {
    // 디바이스 배열 비교 (순서 무관하게 내용만 비교하려면 정렬 후 비교 또는 Set 사용)
    // 여기서는 lodash isEqual을 사용하여 순서와 내용 모두 비교
    boardFieldsChanged = originalDashboardPreset.value !== editableDashboardPreset.value || !_isEqual([...originalDevices.value].sort(), [...editableDevices.value].sort()) // 정렬 후 비교
  }
  return originalName.value !== editableName.value.trim() || (nodeData.value.description || '') !== (editableDescription.value || '').trim() || boardFieldsChanged
})

// editingNodeId prop이 변경될 때마다 노드 데이터를 다시 로드하고 폼 상태 초기화
watch(
  () => props.editingNodeId,
  async (newNodeId) => {
    if (newNodeId) {
      // console.log('[Editor] watching newNodeId:', newNodeId);
      const fetchedNode = boardMenuStore.getNodeById(newNodeId)
      if (fetchedNode) {
        nodeData.value = { ...fetchedNode } // 복사본 사용
        originalName.value = fetchedNode.name
        editableName.value = fetchedNode.name
        editableDescription.value = fetchedNode.description || ''
        if (fetchedNode.type === 'board') {
          originalDashboardPreset.value = fetchedNode.dashboardPreset || 'single'
          editableDashboardPreset.value = fetchedNode.dashboardPreset || 'single'
          originalDevices.value = fetchedNode.devices ? [...fetchedNode.devices] : []
          editableDevices.value = fetchedNode.devices ? [...fetchedNode.devices] : []
        } else {
          // 그룹일 경우 보드 관련 필드 초기화 (선택적)
          originalDashboardPreset.value = 'single'
          editableDashboardPreset.value = 'single'
          originalDevices.value = []
          editableDevices.value = []
        }
        await nextTick() // DOM 업데이트 기다림
        if (nameInputRef.value) {
          nameInputRef.value.focus() // 이름 필드에 포커스
        }
      } else {
        nodeData.value = null // 노드를 찾지 못하면 폼 비우기
        if ($q && typeof $q.notify === 'function') {
          $q.notify({
            type: 'negative',
            message: `ID [${newNodeId}]에 해당하는 노드를 찾을 수 없습니다. (watch)`,
          })
        } else {
          console.error('[Editor Watch] $q.notify is not a function. Node not found message for ID:', newNodeId)
          alert(`[Editor Watch] $q.notify is not a function. Node not found message for ID: ${newNodeId}`)
        }
      }
    } else {
      nodeData.value = null // ID가 없으면 폼 비우기
    }
  },
  { immediate: true }, // 컴포넌트 마운트 시 즉시 실행
)

function resetForm() {
  if (nodeData.value) {
    editableName.value = originalName.value
    editableDescription.value = nodeData.value.description || ''
    if (nodeData.value.type === 'board') {
      editableDashboardPreset.value = originalDashboardPreset.value
      editableDevices.value = [...originalDevices.value]
    }
  }
}

// Notify 함수를 안전하게 호출하는 래퍼
function safeNotify(options) {
  if ($q && typeof $q.notify === 'function') {
    $q.notify(options)
  } else if (typeof Notify !== 'undefined' && typeof Notify.create === 'function') {
    // Quasar Notify 플러그인을 직접 임포트하여 사용하는 대체 방식
    Notify.create(options)
    console.warn('[BoardConfigEditor] Fallback: Used direct Notify.create()')
  } else {
    console.error('[BoardConfigEditor] $q.notify and Notify.create are not available. Message:', options.message)
    // 최후의 수단으로 alert 사용
    const messagePrefix = options.type === 'positive' ? '성공: ' : options.type === 'negative' ? '오류: ' : '정보: '
    alert(messagePrefix + options.message)
  }
}

function handleSaveChanges() {
  if (!nodeData.value || !editableName.value.trim()) {
    safeNotify({ type: 'negative', message: '이름은 비워둘 수 없습니다.' })
    return
  }

  const updates = {
    name: editableName.value.trim(),
    description: (editableDescription.value || '').trim(),
  }

  if (nodeData.value.type === 'board') {
    updates.dashboardPreset = editableDashboardPreset.value
    updates.devices = [...editableDevices.value]
  }

  try {
    boardMenuStore.updateNode(props.editingNodeId, updates)
    originalName.value = updates.name // 저장 후 원본 이름도 업데이트 (isChanged 반영 위함)
    if (nodeData.value.type === 'board') {
      originalDashboardPreset.value = updates.dashboardPreset
      originalDevices.value = updates.devices ? [...updates.devices] : []
    }
    nodeData.value.description = updates.description // nodeData도 동기화 (선택적)
    safeNotify({ type: 'positive', message: `'${updates.name}' 정보가 성공적으로 저장되었습니다.` })
  } catch (error) {
    console.error('[BoardConfigEditor] Error saving node:', error)
    safeNotify({ type: 'negative', message: '정보 저장 중 오류가 발생했습니다. (catch 블록)' })
  }
}

function confirmDeleteNode() {
  if (!nodeData.value) return

  $q.dialog({
    title: '삭제 확인',
    message: `'${originalName.value}' (${nodeData.value.type}) 항목 및 모든 하위 항목을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    cancel: true,
    persistent: true,
    ok: {
      label: '삭제',
      color: 'negative',
      flat: false,
    },
    dark: true, // 현재 테마에 맞게 조절
  })
    .onOk(async () => {
      const nameToDelete = nodeData.value?.name || '알 수 없는 항목' // 삭제 전 이름 저장
      try {
        boardMenuStore.removeNode(props.editingNodeId)
        $q.notify({
          type: 'positive',
          icon: 'check_circle',
          message: `'${nameToDelete}' 항목이 삭제되었습니다.`,
          position: 'top',
          timeout: 5000,
        })
        emit('node-deleted', props.editingNodeId) // 삭제 이벤트 발생
        nodeData.value = null // 내부 상태 즉시 초기화
      } catch (error) {
        console.error('[Editor] Error deleting node:', error)
        $q.notify({
          type: 'negative',
          icon: 'error',
          message: `'${nameToDelete}' 항목 삭제 중 오류가 발생했습니다: ${error.message}`,
          position: 'top',
          timeout: 7000,
        })
      }
    })
    .onCancel(() => {
      console.log('Deletion cancelled')
    })
    .onDismiss(() => {
      console.log('Delete dialog dismissed')
    })
}

const emit = defineEmits(['node-updated', 'node-deleted', 'cancel-edit'])
</script>

<style scoped>
/* 필요한 스타일 추가 */
</style>

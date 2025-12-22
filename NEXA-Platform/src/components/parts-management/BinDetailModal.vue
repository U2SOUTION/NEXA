<!-- BinDetailModal.vue
  부품함 상세 정보 모달
  부품함의 정보, 위치, 내용물을 표시하고 입출고 기능 제공
-->

<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card style="min-width: 500px; max-width: 600px" class="modal-card">
      <q-card-section class="modal-header">
        <div class="row items-start justify-between">
          <transition name="fade" mode="out-in">
            <div :key="hasBin ? 'detail' : 'create'" class="modal-title">
              {{ binInfo && hasBin ? 'BIN DETAIL' : 'CREATE BIN' }}
            </div>
          </transition>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            class="modal-close-btn"
            @click="handleClose"
          />
        </div>
      </q-card-section>

      <q-card-section class="modal-content" v-if="binInfo">
        <transition name="fade" mode="out-in">
          <!-- 부품함이 없는 상태 (빈 셀) -->
          <div v-if="!hasBin" :key="'empty'" class="empty-bin-state">
            <q-icon name="add_box" size="48px" color="grey-6" />
            <div class="empty-cell-title">EMPTY CELL</div>
            <div class="text-caption text-grey-6 q-mt-sm q-mb-md">
              이 위치에는 부품함이 없습니다. 새 부품함을 생성하거나 기존 부품함을 배치할 수
              있습니다.
            </div>
            <div class="info-section location-section">
              <div class="section-title location-title">위치 정보</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-value">{{ currentLocationPath }}</div>
                </div>
              </div>
            </div>
            <!-- 선반 타입인 경우 모델 선택 폼 -->
            <div v-if="isShelfType" class="info-section model-selection-section">
              <div class="section-title">모델 선택</div>
              <q-select
                v-model="selectedBinModelId"
                :options="binModelOptions"
                label="부품함 모델 *"
                emit-value
                map-options
                :rules="[(val) => !!val || '모델을 선택하세요']"
                class="model-select"
                dense
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" class="model-select-option">
                    <q-item-section>
                      <q-item-label class="model-option-label">{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption class="model-option-caption">
                        SKU: {{ scope.opt.sku }} | 크기: {{ scope.opt.size }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <!-- 부품함이 있는 상태 -->
          <div v-else :key="'has-bin'">
            <!-- 부품함 기본 정보 -->
            <div class="info-section">
              <div class="section-title">기본 정보</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">SKU</div>
                  <div class="info-value">{{ binInfo.binData?.sku || 'N/A' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">이름</div>
                  <div class="info-value">{{ binInfo.binData?.name || 'N/A' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">현재 위치</div>
                  <div class="info-value">{{ currentLocationPath }}</div>
                </div>
              </div>
            </div>

            <hr class="q-my-md custom-separator" />

            <!-- 부품함 내용물 -->
            <div class="info-section">
              <div class="section-title">내용물</div>
              <div v-if="binContents.length === 0" class="empty-contents">
                <q-icon name="inventory_2" size="48px" color="grey-6" />
                <div class="text-caption text-grey-6 q-mt-sm">내용물이 없습니다</div>
              </div>
              <div v-else class="contents-list">
                <q-list bordered separator>
                  <q-item v-for="(content, index) in binContents" :key="index" class="content-item">
                    <q-item-section>
                      <q-item-label>{{ content.name || '부품' }}</q-item-label>
                      <q-item-label caption>
                        <q-chip dense size="sm" color="primary">{{ content.sku || 'N/A' }}</q-chip>
                        <span class="q-ml-sm">수량: {{ content.quantity || 0 }}</span>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat round dense icon="more_vert" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </div>
        </transition>
      </q-card-section>

      <q-card-section v-else class="modal-content">
        <div class="text-center text-grey-6 q-pa-lg">부품함 정보를 불러올 수 없습니다</div>
      </q-card-section>

      <q-card-actions align="center" class="modal-actions">
        <transition name="fade" mode="out-in">
          <div v-if="!hasBin" :key="'new-bin'" class="button-group">
            <q-btn
              flat
              label="NEW BIN"
              color="primary"
              icon="add_box"
              class="modal-btn"
              @click="handleCreateBin"
            />
          </div>
          <div v-else :key="'has-bin'" class="button-group">
            <q-btn
              flat
              label="입고"
              color="primary"
              icon="add"
              class="modal-btn"
              @click="handleInbound"
            />
            <q-btn
              flat
              label="출고"
              color="negative"
              icon="remove"
              class="modal-btn"
              :disable="binContents.length === 0"
              @click="handleOutbound"
            />
          </div>
        </transition>
        <q-btn
          flat
          label="CLOSE"
          color="grey"
          v-close-popup
          class="modal-btn"
          @click="handleClose"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { usePartsManagementStore } from 'src/stores/partsManagementStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const partsStore = usePartsManagementStore()

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 선택된 부품함 정보
const binInfo = computed(() => partsStore.selectedBin)

// 부품함이 있는지 확인
const hasBin = computed(() => {
  return binInfo.value && binInfo.value.binData !== null && binInfo.value.binData !== undefined
})

// 현재 위치 경로 생성
const currentLocationPath = computed(() => {
  if (!binInfo.value || !binInfo.value.position) return 'Unknown'

  const { blockId, rowId, cellIndex } = binInfo.value.position

  // 블록 정보 가져오기
  const block = partsStore.getNodeById(blockId)
  if (!block) return 'Unknown'

  let path = block.name || 'Unknown'

  // 행(층) 정보 가져오기
  const row = partsStore.getNodeById(rowId)
  if (row) {
    const floorLabel = row.row_identifier ? `${row.row_identifier}층` : row.name || 'Unknown'
    path += ` > ${floorLabel}`
  }

  // 셀 인덱스 추가
  if (cellIndex) {
    path += ` > ${cellIndex}`
  }

  return path
})

// 부품함 내용물 (현재는 테스트 데이터, 나중에 실제 데이터로 교체)
const binContents = computed(() => {
  // TODO: 실제 부품함 내용물 데이터로 교체
  // 현재는 빈 배열 반환
  return []
})

// 선반 타입인지 확인
const isShelfType = computed(() => {
  if (!binInfo.value || !binInfo.value.position) return false
  const { blockId } = binInfo.value.position
  const block = partsStore.getNodeById(blockId)
  return block && (block.storage_type === 'SHELF_UNIT' || block.storage_type === 'CABINET')
})

// 빈 모델 목록
const binModels = computed(() => partsStore.binModels || [])

// 빈 모델 선택 옵션
const binModelOptions = computed(() => {
  return binModels.value.map((model) => ({
    label: model.name,
    value: model.id,
    sku: model.sku,
    size: `${model.width_mm}mm × ${model.height_mm}mm × ${model.depth_mm}mm`,
  }))
})

// 선택된 빈 모델 ID
const selectedBinModelId = ref(null)

// 모달 닫기
function handleClose() {
  partsStore.clearSelectedBin()
  emit('update:modelValue', false)
}

// 입고 처리 (나중에 구현)
function handleInbound() {
  // TODO: 입고 모달 열기
  // 개발 모드에서만 로그 출력
  if (import.meta.env.DEV) {
  console.log('입고 처리 (구현 예정)')
  }
}

// 출고 처리 (나중에 구현)
function handleOutbound() {
  // TODO: 출고 모달 열기
  // 개발 모드에서만 로그 출력
  if (import.meta.env.DEV) {
  console.log('출고 처리 (구현 예정)')
  }
}

// 새 부품함 생성 (빈 셀 상태에서)
function handleCreateBin() {
  if (!binInfo.value || !binInfo.value.position) {
    // 개발 모드에서만 에러 로그 출력
    if (import.meta.env.DEV) {
    console.error('[BinDetailModal] 부품함 위치 정보가 없습니다')
    }
    return
  }

  // 선반 타입인 경우 모델 선택 필수
  if (isShelfType.value && !selectedBinModelId.value) {
    // 개발 모드에서만 에러 로그 출력
    if (import.meta.env.DEV) {
    console.error('[BinDetailModal] 모델을 선택해주세요')
    }
    // TODO: 사용자에게 에러 메시지 표시 (Quasar Notify 등)
    return
  }

  const { blockId, rowId, cellIndex } = binInfo.value.position

  // 블록 정보 가져오기
  const block = partsStore.getNodeById(blockId)
  const isShelfTypeValue =
    block && (block.storage_type === 'SHELF_UNIT' || block.storage_type === 'CABINET')

  let actualCellIndex = 0

  if (isShelfTypeValue) {
    // 선반형의 경우: 해당 층에 있는 모든 빈을 확인하고 다음 사용 가능한 cellIndex 찾기
    // 최대 20개까지 빈 배치 가능 (필요시 조정)
    let foundEmptySlot = false
    for (let i = 0; i < 20; i++) {
      const existingBin = partsStore.getCellData(blockId, rowId, i)
      if (!existingBin) {
        actualCellIndex = i
        foundEmptySlot = true
        break
      }
    }
    // 모든 위치가 차있으면 마지막 인덱스에 추가 (컴팩트 모드에서 스케일 축소로 모두 표시됨)
    if (!foundEmptySlot) {
      actualCellIndex = 20 // 다음 사용 가능한 위치에 추가
    }
  } else {
    // 렉형의 경우: cellIndex 그대로 사용
    if (typeof cellIndex === 'number') {
      actualCellIndex = cellIndex
    } else if (typeof cellIndex === 'string') {
      // "층수-칸수" 형식에서 칸수 부분 추출
      const match = cellIndex.match(/\d+-(\d+)/)
      actualCellIndex = match ? parseInt(match[1]) - 1 : 0
    }
  }

  // 빈 생성 (선반 타입인 경우 모델 정보 포함)
  const binData = {}
  if (isShelfTypeValue && selectedBinModelId.value) {
    const selectedModel = binModels.value.find((m) => m.id === selectedBinModelId.value)
    if (selectedModel) {
      binData.bin_model_id = selectedModel.id
      binData.width_mm = selectedModel.width_mm
      binData.height_mm = selectedModel.height_mm
      binData.depth_mm = selectedModel.depth_mm
    }
  }

  const result = partsStore.createBin(blockId, rowId, actualCellIndex, binData)

  if (result.success) {
    // 생성된 빈 정보로 선택된 빈 업데이트
    const row = partsStore.getNodeById(rowId)
    const floorLabel = row?.row_identifier ? `${row.row_identifier}층` : row?.name || 'Unknown'
    const newCellIndex = isShelfTypeValue
      ? `${floorLabel}-${actualCellIndex + 1}`
      : binInfo.value.position.cellIndex

    partsStore.setSelectedBin(result.binData, {
      blockId,
      rowId,
      cellIndex: newCellIndex,
    })

    // 성공 메시지 (나중에 Quasar Notify로 교체 가능)
    // 개발 모드에서만 로그 출력
    if (import.meta.env.DEV) {
    console.log('[BinDetailModal] 부품함 생성 성공:', result.message)
    }
  } else {
    // 실패 메시지
    // 개발 모드에서만 에러 로그 출력
    if (import.meta.env.DEV) {
    console.error('[BinDetailModal] 부품함 생성 실패:', result.message)
    }
    // TODO: 사용자에게 에러 메시지 표시 (Quasar Notify 등)
  }
}

// 모달이 닫힐 때 선택 해제 및 폼 초기화
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      partsStore.clearSelectedBin()
      selectedBinModelId.value = null
    }
  },
)
</script>

<style lang="scss" scoped>
.modal-card {
  padding: 40px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 0;
  box-shadow: none;
  background: rgba(56, 56, 56, 0.5) !important; /* 50% 투명 배경 */
}

.modal-header {
  padding-bottom: 20px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1.2;
  flex: 1;
  margin-right: 16px;
}

.modal-close-btn {
  flex-shrink: 0;
  margin-top: 5px;
  color: rgba(147, 147, 147, 0.5);
}

.modal-content {
  padding: 20px 0;
}

.info-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(6, 6, 6, 0.7);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(31, 164, 46, 0.678);
}

.empty-bin-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.empty-cell-title {
  font-size: 1.2rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.14);
  margin-top: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.location-section {
  margin-top: 16px;
  margin-bottom: 0;
}

.location-title {
  margin-bottom: 2px;
}

.model-selection-section {
  margin-top: 24px;
}

.model-select {
  width: 100%;
  min-width: 400px;

  :deep(.q-field__control::after),
  :deep(.q-field__control::before) {
    display: none !important;
    border: none !important;
  }

  :deep(.q-field__control) {
    min-width: 400px;
    border: none !important;
    border-bottom: none !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.446) !important;
  }

  :deep(.q-field--highlighted .q-field__control) {
    border-bottom: 2px solid var(--q-primary) !important;
  }

  :deep(.q-field__native) {
    min-width: 400px;
    white-space: nowrap;
    overflow: visible;
  }

  :deep(.q-field__label) {
    white-space: nowrap;
  }
}

.model-select-option {
  min-width: 400px;
  white-space: nowrap;
}

.model-option-label {
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
}

.model-option-caption {
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
}

.empty-contents {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.contents-list {
  margin-top: 16px;
}

.content-item {
  padding: 12px;
}

.action-section {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
}

.action-btn {
  min-width: 120px;
  min-height: 28px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid rgba(0, 0, 0, 0.446);
  padding: 12px 24px;
}

.modal-actions {
  padding-top: 16px;
  gap: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.custom-separator {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.446);
  background: none;
  margin: 16px 0;
  height: 0;
  width: 100%;
}

.modal-btn {
  min-width: 120px;
  min-height: 28px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid rgba(0, 0, 0, 0.446);
  padding: 12px 24px;
}

/* 트랜지션 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>

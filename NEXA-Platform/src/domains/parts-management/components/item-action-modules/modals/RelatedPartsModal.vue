<!-- RelatedPartsModal.vue
  관련 부품 보기 모달
-->
<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card class="related-parts-dialog-card">
      <q-card-section class="related-parts-section">
        <div class="related-parts-title">
          <span class="related-parts-title-en">RELATED PARTS</span>
          <span class="related-parts-title-ko">관련 부품 보기</span>
        </div>

        <!-- 항목 정보 -->
        <div v-if="target" class="q-mt-md">
          <div class="related-parts-item-info">
            <div class="related-parts-item-name">{{ target.name || '-' }}</div>
            <div v-if="target.category" class="related-parts-item-category">
              {{ target.category }}
            </div>
          </div>

          <!-- 개발 상태 안내 -->
          <div class="related-parts-dev-notice q-mt-lg">
            <q-icon name="info" size="24px" color="primary" class="q-mr-sm" />
            <div class="related-parts-dev-notice-text">
              <div class="related-parts-dev-notice-title">개발 예정 기능</div>
              <div class="related-parts-dev-notice-desc">
                이 기능은 현재 개발 중입니다. 아래는 UI 미리보기입니다.
              </div>
            </div>
          </div>

          <!-- 개별 부품 목록 (임시 데이터) -->
          <div class="related-parts-list q-mt-lg">
            <div class="related-parts-list-header">
              <q-icon name="inventory_2" size="20px" color="primary" class="q-mr-sm" />
              <span class="related-parts-list-title">개별 부품 목록</span>
              <q-chip size="sm" color="primary" text-color="white" class="q-ml-sm">
                {{ mockRelatedParts.length }}개
              </q-chip>
            </div>

            <div class="related-parts-table q-mt-md">
              <q-table
                :rows="mockRelatedParts"
                :columns="relatedPartsColumns"
                row-key="id"
                flat
                dense
                hide-pagination
                :rows-per-page-options="[0]"
                class="related-parts-table-inner"
              >
                <template v-slot:body-cell-location="props">
                  <q-td :props="props">
                    <div class="related-parts-location">
                      <q-icon name="location_on" size="16px" class="q-mr-xs" />
                      <span>{{ props.value }}</span>
                    </div>
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>

          <!-- 부품함 정보 (임시 데이터) -->
          <div class="related-parts-storage q-mt-lg">
            <div class="related-parts-list-header">
              <q-icon name="warehouse" size="20px" color="primary" class="q-mr-sm" />
              <span class="related-parts-list-title">부품함 정보</span>
              <q-chip size="sm" color="primary" text-color="white" class="q-ml-sm">
                {{ mockStorageLocations.length }}개
              </q-chip>
            </div>

            <div class="related-parts-storage-list q-mt-md">
              <div
                v-for="storage in mockStorageLocations"
                :key="storage.id"
                class="related-parts-storage-item"
              >
                <div class="related-parts-storage-name">
                  <q-icon name="warehouse" size="18px" class="q-mr-xs" />
                  {{ storage.name }}
                </div>
                <div class="related-parts-storage-details">
                  <div class="related-parts-storage-detail-item">
                    <span class="related-parts-storage-label">위치:</span>
                    <span class="related-parts-storage-value">{{ storage.location }}</span>
                  </div>
                  <div class="related-parts-storage-detail-item">
                    <span class="related-parts-storage-label">수량:</span>
                    <span class="related-parts-storage-value">{{ storage.quantity }}개</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 투두 리스트 -->
          <div class="related-parts-todo q-mt-lg">
            <div class="related-parts-todo-header">
              <q-icon name="checklist" size="20px" color="primary" class="q-mr-sm" />
              <span class="related-parts-list-title">구현 예정 기능</span>
            </div>
            <div class="related-parts-todo-list q-mt-md">
              <div class="related-parts-todo-item">
                <q-icon name="radio_button_unchecked" size="18px" class="q-mr-sm" />
                <span>개별 부품 관리 테이블과의 연동 (part_models, part_specs)</span>
              </div>
              <div class="related-parts-todo-item">
                <q-icon name="radio_button_unchecked" size="18px" class="q-mr-sm" />
                <span>부품함 정보 테이블 생성 및 연동</span>
              </div>
              <div class="related-parts-todo-item">
                <q-icon name="radio_button_unchecked" size="18px" class="q-mr-sm" />
                <span>부품함별 수량 집계 및 표시</span>
              </div>
              <div class="related-parts-todo-item">
                <q-icon name="radio_button_unchecked" size="18px" class="q-mr-sm" />
                <span>부품함 위치 정보 관리</span>
              </div>
              <div class="related-parts-todo-item">
                <q-icon name="radio_button_unchecked" size="18px" class="q-mr-sm" />
                <span>개별 부품 상세 정보 조회</span>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="center" class="related-parts-actions">
        <q-btn
          flat
          label="닫기"
          v-close-popup
          class="related-parts-close-btn"
          @click="$emit('close')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  target: {
    type: Object,
    default: null,
  },
})

defineEmits(['update:modelValue', 'close'])

// 관련 부품 임시 데이터 (UI 미리보기용)
const mockRelatedParts = ref([
  {
    id: 1,
    partNumber: 'RES-001',
    modelName: '0603 저항',
    manufacturer: 'Samsung',
    value: '10kΩ',
    location: 'A-1-2',
    quantity: 150,
  },
  {
    id: 2,
    partNumber: 'RES-002',
    modelName: '0805 저항',
    manufacturer: 'Yageo',
    value: '1kΩ',
    location: 'A-1-3',
    quantity: 200,
  },
  {
    id: 3,
    partNumber: 'RES-003',
    modelName: '1206 저항',
    manufacturer: 'Vishay',
    value: '100Ω',
    location: 'B-2-1',
    quantity: 75,
  },
])

// 부품함 정보 임시 데이터 (UI 미리보기용)
const mockStorageLocations = ref([
  {
    id: 1,
    name: '부품함 A-1',
    location: '작업실 1층 북쪽 벽',
    quantity: 350,
  },
  {
    id: 2,
    name: '부품함 B-2',
    location: '작업실 2층 남쪽 벽',
    quantity: 75,
  },
])

// 관련 부품 테이블 컬럼 정의
const relatedPartsColumns = [
  {
    name: 'partNumber',
    label: '부품 번호',
    field: 'partNumber',
    align: 'left',
    sortable: true,
  },
  {
    name: 'modelName',
    label: '모델명',
    field: 'modelName',
    align: 'left',
    sortable: true,
  },
  {
    name: 'manufacturer',
    label: '제조사',
    field: 'manufacturer',
    align: 'left',
    sortable: true,
  },
  {
    name: 'value',
    label: '값',
    field: 'value',
    align: 'left',
    sortable: true,
  },
  {
    name: 'location',
    label: '위치',
    field: 'location',
    align: 'left',
    sortable: true,
  },
  {
    name: 'quantity',
    label: '수량',
    field: 'quantity',
    align: 'right',
    sortable: true,
  },
]
</script>

<style lang="scss" scoped>
.related-parts-dialog-card {
  min-width: 800px;
  max-width: 95vw;
  width: 900px;
  border-radius: 8px;
  border: 2px solid var(--q-primary);

  @media (max-width: 800px) {
    min-width: 95vw;
    width: 95vw;
    max-width: 95vw;
  }
}

.related-parts-section {
  padding: 100px;
  max-height: 80vh;
  overflow-y: auto;

  @media (max-width: 600px) {
    padding: 50px;
  }
}

.related-parts-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
}

.related-parts-title-en {
  font-size: 3.5em;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--q-primary);
}

.related-parts-title-ko {
  font-size: 24px;
  font-weight: 600;
  color: var(--q-primary);
}

.related-parts-item-info {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid var(--nexa-border-color);
}

.related-parts-item-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 8px;
}

.related-parts-item-category {
  font-size: 14px;
  color: var(--nexa-text-primary);
  opacity: 0.7;
}

.related-parts-dev-notice {
  padding: 16px;
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.related-parts-dev-notice-text {
  flex: 1;
}

.related-parts-dev-notice-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 4px;
}

.related-parts-dev-notice-desc {
  font-size: 14px;
  color: var(--nexa-text-primary);
  opacity: 0.8;
}

.related-parts-list-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--nexa-text-primary);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--nexa-border-color);
}

.related-parts-list-title {
  color: var(--q-primary);
}

.related-parts-table {
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.related-parts-table-inner {
  :deep(.q-table__top) {
    display: none;
  }

  :deep(.q-table thead th) {
    background-color: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    border-bottom: 1px solid var(--nexa-border-color);
  }

  :deep(.q-table tbody td) {
    background-color: transparent;
    border-bottom: 1px solid var(--nexa-border-color);
    color: var(--nexa-text-primary);
  }

  :deep(.q-table tbody tr:hover) {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

.related-parts-location {
  display: flex;
  align-items: center;
  color: var(--q-primary);
}

.related-parts-storage-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-parts-storage-item {
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
}

.related-parts-storage-name {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 12px;
}

.related-parts-storage-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 24px;
}

.related-parts-storage-detail-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.related-parts-storage-label {
  color: var(--nexa-text-primary);
  opacity: 0.7;
  min-width: 50px;
}

.related-parts-storage-value {
  color: var(--q-primary);
  font-weight: 500;
}

.related-parts-todo {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px dashed var(--nexa-border-color);
  border-radius: 8px;
}

.related-parts-todo-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--nexa-text-primary);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--nexa-border-color);
}

.related-parts-todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
}

.related-parts-todo-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--nexa-text-primary);
  opacity: 0.8;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.02);
}

.related-parts-actions {
  padding: 0 100px 100px 100px;
  gap: 16px;

  @media (max-width: 600px) {
    padding: 0 50px 50px 50px;
  }
}

.related-parts-close-btn {
  min-width: 120px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  border: 1px solid var(--q-primary);
  background-color: transparent;
  color: var(--q-primary);

  :deep(.q-btn__content) {
    color: var(--q-primary);
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>


<template>
  <div class="part-classes-trash-view">
    <div class="trash-inner q-pa-md">
      <!-- 타이틀 -->
      <div class="trash-header q-mb-lg">
        <div class="trash-title-en">PART CLASSES TRASH</div>
        <div class="trash-title-ko">부품 분류 휴지통</div>
      </div>

      <!-- 내용 영역 -->
      <div class="trash-content column">
        <div class="trash-list-wrapper">
          <div class="trash-list column items-center">
            <!-- 수량 + 전체 비우기: 아이템들과 동일 폭 안에서 정렬 -->
            <div class="trash-header-row q-mb-md">
              <div class="trash-summary">
                <span class="trash-summary-label">삭제된 부품 분류 수량</span>
                <span class="trash-summary-value">{{ items.length }}개</span>
              </div>

              <div v-if="items.length > 0" class="trash-actions">
                <q-btn
                  flat
                  dense
                  no-caps
                  size="md"
                  icon="restore_from_trash"
                  label="모두 복원"
                  color="green-6"
                  class="trash-restore-all-btn q-mr-sm"
                  @click="handleRestoreAll"
                  :disable="isProcessing"
                />

                <q-btn
                  flat
                  dense
                  no-caps
                  size="md"
                  icon="delete_sweep"
                  label="휴지통 비우기"
                  color="grey-6"
                  class="trash-empty-all-btn"
                  @click="handleEmptyTrash"
                  :disable="isProcessing"
                />
              </div>
            </div>

            <!-- 비어 있을 때 메시지 -->
            <div
              v-if="items.length === 0"
              class="trash-empty q-pa-xl column items-center justify-center"
            >
              <q-icon name="inbox" size="48px" color="grey-6" class="q-mb-sm" />
              <div class="text-subtitle2 text-grey-5 q-mb-xs">휴지통이 비어 있습니다.</div>
              <div class="text-caption text-grey-6">삭제된 부품 분류가 이곳에 표시됩니다.</div>
            </div>

            <!-- 아이템 리스트 -->
            <div v-else class="trash-items-wrapper column items-center">
              <div
                v-for="item in items"
                :key="item.id"
                class="trash-item row items-center justify-between q-pa-sm q-mb-xs"
              >
                <div class="trash-item-main column">
                  <div class="trash-item-name">
                    <span class="trash-item-id">#{{ item.id }}</span>
                    <span class="trash-item-text">{{ item.name || '(이름 없음)' }}</span>
                  </div>
                  <div class="trash-item-meta text-caption">
                    <span class="trash-item-category">{{ item.category || '-' }}</span>
                    <span class="trash-item-code" v-if="item.c_code"> · {{ item.c_code }}</span>
                  </div>
                </div>

                <!-- 아이템별 액션 영역 -->
                <div class="trash-item-actions row items-center q-ml-md">
                  <q-btn
                    flat
                    round
                    dense
                    size="md"
                    icon="restore_from_trash"
                    color="green-6"
                    @click="handleRestore(item)"
                    :disable="isProcessing"
                    class="q-mr-xs"
                  >
                    <q-tooltip>복원</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    dense
                    size="md"
                    icon="delete_forever"
                    color="orange-6"
                    @click="handlePermanentDelete(item)"
                    :disable="isProcessing"
                  >
                    <q-tooltip>완전 삭제</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePartsDataStore } from '@system/store/partsDataStore.js'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const partsDataStore = usePartsDataStore()

// 휴지통에 있는 부품 분류 목록
const items = computed(() => partsDataStore.trashPartClasses || [])

// 처리 중 상태 (복원/삭제/전체 비우기 공용)
const isProcessing = ref(false)

// 단일 복원
async function handleRestore(item) {
  if (!item || !item.id || isProcessing.value) return

  try {
    isProcessing.value = true
    await partsDataStore.restorePartClass(item.id)
    await partsDataStore.fetchTrashCount().catch(() => {})
    $q.notify({
      type: 'positive',
      message: `"${item.name || item.id}" 항목이 복원되었습니다.`,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '복원에 실패했습니다.',
      caption: error.message,
    })
  } finally {
    isProcessing.value = false
  }
}

// 휴지통 전체 복원 (현재는 "모두 복원"용, 이후 선택 복원으로 확장 가능)
async function handleRestoreAll() {
  if (!items.value || items.value.length === 0 || isProcessing.value) return

  $q.dialog({
    title: '모두 복원',
    message: `휴지통의 모든 항목(${items.value.length}개)을 복원하시겠습니까?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      isProcessing.value = true
      const currentItems = [...items.value]
      for (const item of currentItems) {
        try {
          await partsDataStore.restorePartClass(item.id)
        } catch (e) {
          console.error('[handleRestoreAll] 단일 복원 실패:', e)
        }
      }
      await partsDataStore.fetchTrashCount().catch(() => {})
      $q.notify({
        type: 'positive',
        message: '휴지통의 모든 항목이 복원되었습니다.',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: '모두 복원에 실패했습니다.',
        caption: error.message,
      })
    } finally {
      isProcessing.value = false
    }
  })
}

// 단일 영구 삭제
async function handlePermanentDelete(item) {
  if (!item || !item.id || isProcessing.value) return

  $q.dialog({
    title: '완전 삭제 확인',
    message: `정말로 "${item.name || item.id}" 항목을 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      isProcessing.value = true
      await partsDataStore.permanentDeletePartClass(item.id)
      await partsDataStore.fetchTrashCount().catch(() => {})
      $q.notify({
        type: 'positive',
        message: `"${item.name || item.id}" 항목이 완전히 삭제되었습니다.`,
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: '완전 삭제에 실패했습니다.',
        caption: error.message,
      })
    } finally {
      isProcessing.value = false
    }
  })
}

// 휴지통 비우기 (전체 영구 삭제)
async function handleEmptyTrash() {
  if (!items.value || items.value.length === 0 || isProcessing.value) return

  $q.dialog({
    title: '휴지통 비우기',
    message: `정말로 휴지통의 모든 항목(${items.value.length}개)을 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      isProcessing.value = true
      // 현재 리스트 기준으로 순차 삭제
      const currentItems = [...items.value]
      for (const item of currentItems) {
        try {
          await partsDataStore.permanentDeletePartClass(item.id)
        } catch (e) {
          console.error('[handleEmptyTrash] 단일 영구 삭제 실패:', e)
        }
      }
      await partsDataStore.fetchTrashCount().catch(() => {})
      $q.notify({
        type: 'positive',
        message: '휴지통이 비워졌습니다.',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: '휴지통 비우기에 실패했습니다.',
        caption: error.message,
      })
    } finally {
      isProcessing.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.part-classes-trash-view {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trash-inner {
  width: 100%;
  max-width: 1000px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.trash-header {
  text-align: center;

  .trash-title-en {
    text-transform: uppercase;
    font-weight: 900;
    font-size: 3.5rem;
    letter-spacing: 0.08em;
    color: var(--nexa-text-primary);
    opacity: 0.4;
  }

  .trash-title-ko {
    margin-top: -4px;
    font-size: 1.2rem;
    color: var(--nexa-text-primary, rgba(185, 185, 185, 0.7));
  }
}

.trash-content {
  flex: 1;
  min-height: 0;
}

.trash-summary {
  text-align: left;

  .trash-summary-label {
    font-size: 1rem;
    color: var(--nexa-text-secondary, rgba(185, 185, 185, 0.7));
    margin-right: 6px;
  }

  .trash-summary-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--nexa-text-primary);
    opacity: 0.5;
  }
}

.trash-list-wrapper {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.trash-empty {
  text-align: center;
}

.trash-list {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 4px 0 12px;
}

.trash-items-wrapper {
  width: 100%; // 아이템 카드들이 trash-list의 전체 폭을 사용하도록 보장
}

.trash-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 80%;
  margin: 0 auto;
}

.trash-item {
  width: 80%;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background-color: rgba(0, 0, 0, 0.15);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.18);
  }
}

.trash-item-main {
  flex: 1 1 auto;
}

.trash-item-name {
  display: flex;
  align-items: baseline;
  gap: 6px;

  .trash-item-id {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .trash-item-text {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.9);
  }
}

.trash-item-meta {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.55);
}

.trash-item-actions {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
}

.trash-actions {
  display: flex;
  justify-content: flex-end;
}

.trash-restore-all-btn {
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
}

.trash-empty-all-btn {
  opacity: 0.75;

  &:hover {
    opacity: 1;
  }
}
</style>

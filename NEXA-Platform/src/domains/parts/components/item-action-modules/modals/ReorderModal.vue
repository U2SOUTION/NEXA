<!-- ReorderModal.vue
  순서 변경 모달
-->
<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="reorder-dialog-card">
      <q-card-section class="reorder-section">
        <div class="reorder-title">
          <span class="reorder-title-en">REORDER</span>
          <span class="reorder-title-ko">순서 변경</span>
        </div>

        <!-- 항목 정보 -->
        <div v-if="targets.length > 0" class="q-mt-md">
          <!-- 단일 선택 -->
          <div v-if="targets.length === 1" class="reorder-item-info">
            <div class="reorder-item-name">{{ targets[0].name || '-' }}</div>
            <div v-if="targets[0].category" class="reorder-item-category">
              {{ targets[0].category }}
            </div>
          </div>

          <!-- 멀티 선택 -->
          <div v-else class="reorder-item-info">
            <div class="reorder-item-name">{{ targets.length }}개 항목 선택됨</div>
            <div class="reorder-item-list q-mt-sm">
              <div
                v-for="(item, index) in targets.slice(0, 5)"
                :key="item.id"
                class="reorder-item-list-item"
              >
                <span class="reorder-item-list-number">{{ index + 1 }}.</span>
                <span class="reorder-item-list-name">{{ item.name || '-' }}</span>
                <span v-if="item.category" class="reorder-item-list-category">
                  ({{ item.category }})
                </span>
              </div>
              <div v-if="targets.length > 5" class="reorder-item-list-more">
                외 {{ targets.length - 5 }}개 항목...
              </div>
            </div>
          </div>

          <!-- 필터 상태 안내 -->
          <div v-if="hasActiveFilter" class="reorder-filter-notice q-mt-md">
            <q-icon name="info" size="20px" color="primary" class="q-mr-sm" />
            <span class="reorder-filter-notice-text">
              현재 필터가 적용되어 있습니다. 이동 기준을 선택해주세요.
            </span>
          </div>

          <!-- 특정 항목 기준 이동 -->
          <div class="reorder-options q-mt-lg">
            <div class="reorder-options-header">
              <q-icon name="search" size="20px" color="primary" class="q-mr-sm" />
              <span class="reorder-options-title">이동 위치를 검색 후 선택 하세요</span>
            </div>

            <div class="reorder-options-list q-mt-md">
              <!-- 검색 입력 필드 -->
              <div class="reorder-search-wrapper">
                <q-input
                  v-model="searchKeyword"
                  placeholder="항목 이름, 코드, 설명으로 검색..."
                  outlined
                  dense
                  clearable
                  class="reorder-search-input"
                  @update:model-value="handleSearch"
                  @focus="handleSearchFocus"
                  @blur="handleSearchBlur"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <!-- 검색 결과 오버레이 -->
                <div v-if="isSearchFocused && searchKeyword" class="reorder-search-results-overlay">
                  <div v-if="searchResults.length > 0" class="reorder-search-results-list">
                    <q-item
                      v-for="item in searchResults"
                      :key="item.id"
                      clickable
                      v-ripple
                      @click="selectTargetItem(item)"
                      class="reorder-search-result-item"
                    >
                      <q-item-section>
                        <q-item-label class="reorder-search-item-name">{{
                          item.name || '-'
                        }}</q-item-label>
                        <q-item-label caption class="reorder-search-item-info">
                          <span v-if="item.category">{{ item.category }}</span>
                          <span v-if="item.c_code" class="q-ml-xs">({{ item.c_code }})</span>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div v-else class="reorder-search-empty">검색 결과가 없습니다.</div>
                </div>

                <!-- 선택된 항목 표시 -->
                <div v-if="selectedTargetItem" class="reorder-selected-target q-mt-md">
                  <div class="reorder-selected-target-info">
                    <q-icon name="check_circle" size="20px" color="positive" class="q-mr-sm" />
                    <span class="reorder-selected-target-name">{{
                      selectedTargetItem.name || '-'
                    }}</span>
                    <span
                      v-if="selectedTargetItem.category"
                      class="reorder-selected-target-category"
                    >
                      ({{ selectedTargetItem.category }})
                    </span>
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      size="sm"
                      class="q-ml-auto reorder-selected-target-close"
                      @click="clearSelectedTarget"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 이동 옵션 -->
          <div class="reorder-options q-mt-lg">
            <div class="reorder-options-header">
              <q-icon name="swap_vert" size="20px" color="primary" class="q-mr-sm" />
              <span class="reorder-options-title">이동 옵션 선택</span>
            </div>

            <div class="reorder-options-list q-mt-md">
              <!-- 맨 위로 이동 / 특정 항목 앞으로 이동 -->
              <q-item clickable v-ripple @click="handleTopMove" class="reorder-option-item">
                <q-item-section avatar>
                  <q-icon
                    :name="selectedTargetItem ? 'arrow_upward' : 'vertical_align_top'"
                    size="24px"
                    color="primary"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="reorder-option-label">
                    {{ selectedTargetItem ? '선택 아이템 위로 이동' : '테이블 맨 위로 이동' }}
                  </q-item-label>
                  <q-item-label caption class="reorder-option-desc">
                    <span v-if="selectedTargetItem">
                      "{{ selectedTargetItem.name }}"의 위로 이동
                    </span>
                    <span v-else>
                      {{
                        hasActiveFilter
                          ? '필터 결과 내에서 테이블 맨 위로'
                          : '전체 목록의 테이블 맨 위로'
                      }}
                    </span>
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="hasActiveFilter && !selectedTargetItem"
                clickable
                v-ripple
                @click="$emit('reorder', 'top', 'all')"
                class="reorder-option-item"
              >
                <q-item-section avatar>
                  <q-icon name="vertical_align_top" size="24px" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="reorder-option-label"
                    >테이블 맨 위로 이동 (전체 기준)</q-item-label
                  >
                  <q-item-label caption class="reorder-option-desc">
                    필터와 관계없이 전체 목록의 테이블 맨 위로
                  </q-item-label>
                </q-item-section>
              </q-item>

              <!-- 맨 아래로 이동 / 특정 항목 뒤로 이동 -->
              <q-item clickable v-ripple @click="handleBottomMove" class="reorder-option-item">
                <q-item-section avatar>
                  <q-icon
                    :name="selectedTargetItem ? 'arrow_downward' : 'vertical_align_bottom'"
                    size="24px"
                    color="primary"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="reorder-option-label">
                    {{ selectedTargetItem ? '선택 아이템 아래로 이동' : '테이블 맨 아래로 이동' }}
                  </q-item-label>
                  <q-item-label caption class="reorder-option-desc">
                    <span v-if="selectedTargetItem">
                      "{{ selectedTargetItem.name }}"의 아래로 이동
                    </span>
                    <span v-else>
                      {{
                        hasActiveFilter
                          ? '필터 결과 내에서 테이블 맨 아래로'
                          : '전체 목록의 테이블 맨 아래로'
                      }}
                    </span>
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="hasActiveFilter && !selectedTargetItem"
                clickable
                v-ripple
                @click="$emit('reorder', 'bottom', 'all')"
                class="reorder-option-item"
              >
                <q-item-section avatar>
                  <q-icon name="vertical_align_bottom" size="24px" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="reorder-option-label"
                    >테이블 맨 아래로 이동 (전체 기준)</q-item-label
                  >
                  <q-item-label caption class="reorder-option-desc">
                    필터와 관계없이 전체 목록의 테이블 맨 아래로
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="center" class="reorder-actions">
        <q-btn
          v-if="canUndo"
          flat
          label="되돌리기"
          icon="undo"
          class="reorder-undo-btn"
          :disable="isReordering"
          @click="$emit('undo')"
        />
        <q-btn
          flat
          label="닫기"
          v-close-popup
          class="reorder-close-btn"
          :disable="isReordering"
          @click="$emit('close')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  targets: {
    type: Array,
    default: () => [],
  },
  hasActiveFilter: {
    type: Boolean,
    default: false,
  },
  isReordering: {
    type: Boolean,
    default: false,
  },
  canUndo: {
    type: Boolean,
    default: false,
  },
  allItems: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'reorder', 'undo', 'close', 'moveToItem'])

// 검색 관련
const searchKeyword = ref('')
const isSearchFocused = ref(false)
const searchResults = ref([])
const selectedTargetItem = ref(null)

// 검색 실행
function handleSearch() {
  if (!searchKeyword.value || searchKeyword.value.trim() === '') {
    searchResults.value = []
    // 검색어를 지우면 선택된 항목도 자동 초기화
    selectedTargetItem.value = null
    return
  }

  // 검색어가 변경되면 선택된 항목 초기화 (새로운 검색을 위해)
  if (selectedTargetItem.value) {
    selectedTargetItem.value = null
  }

  const keyword = searchKeyword.value.toLowerCase().trim()
  const selectedIds = new Set(props.targets.map((t) => t.id))

  // 전체 목록에서 검색 (선택된 항목 제외)
  searchResults.value = props.allItems
    .filter((item) => {
      // 선택된 항목은 제외
      if (selectedIds.has(item.id)) return false

      // 검색어 매칭
      const nameMatch = item.name?.toLowerCase().includes(keyword)
      const codeMatch = item.c_code?.toLowerCase().includes(keyword)
      const descMatch = item.description?.toLowerCase().includes(keyword)

      return nameMatch || codeMatch || descMatch
    })
    .slice(0, 10) // 최대 10개만 표시
}

// 검색 필드 focus 처리
function handleSearchFocus() {
  isSearchFocused.value = true
  // 검색어가 있으면 검색 결과를 다시 표시
  if (searchKeyword.value && searchKeyword.value.trim() !== '') {
    handleSearch()
  }
}

// 검색 필드 blur 처리 (약간의 지연을 두어 클릭 이벤트가 먼저 실행되도록)
function handleSearchBlur() {
  setTimeout(() => {
    isSearchFocused.value = false
  }, 200)
}

// 대상 항목 선택
function selectTargetItem(item) {
  selectedTargetItem.value = item
  searchKeyword.value = item.name || ''
  isSearchFocused.value = false
  searchResults.value = []
}

// 선택된 항목 취소 (X 버튼 클릭)
function clearSelectedTarget() {
  selectedTargetItem.value = null
  // 검색어는 유지 (사용자가 다시 검색할 수 있도록)
  // 검색 결과는 포커스 시 자동으로 표시됨
}

// 이동 실행
function executeMoveToItem(position) {
  if (!selectedTargetItem.value) return
  emit('moveToItem', position, selectedTargetItem.value)
  // 이동 후 초기화
  selectedTargetItem.value = null
  searchKeyword.value = ''
}

// 맨 위로 이동 / 특정 항목 앞으로 이동 처리
function handleTopMove() {
  if (selectedTargetItem.value) {
    executeMoveToItem('before')
  } else {
    emit('reorder', 'top', 'filter')
  }
}

// 맨 아래로 이동 / 특정 항목 뒤로 이동 처리
function handleBottomMove() {
  if (selectedTargetItem.value) {
    executeMoveToItem('after')
  } else {
    emit('reorder', 'bottom', 'filter')
  }
}

// 모달이 닫히면 검색 상태 초기화
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      searchKeyword.value = ''
      isSearchFocused.value = false
      searchResults.value = []
      selectedTargetItem.value = null
    }
  },
)
</script>

<style lang="scss" scoped>
.reorder-dialog-card {
  min-width: 600px;
  max-width: 90vw;
  width: 700px;
  border-radius: 8px;
  border: 2px solid var(--q-primary);

  @media (max-width: 600px) {
    min-width: 95vw;
    width: 95vw;
    max-width: 95vw;
  }
}

.reorder-section {
  padding: 100px;

  @media (max-width: 600px) {
    padding: 50px;
  }
}

.reorder-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
}

.reorder-title-en {
  font-size: 3.5em;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--q-primary);
}

.reorder-title-ko {
  font-size: 24px;
  font-weight: 600;
  color: var(--q-primary);
}

.reorder-item-info {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid var(--nexa-border-color);
}

.reorder-item-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 8px;
}

.reorder-item-category {
  font-size: 14px;
  color: var(--nexa-text-primary);
  opacity: 0.7;
}

.reorder-item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--nexa-border-color);
}

.reorder-item-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--nexa-text-primary);
  opacity: 0.9;
}

.reorder-item-list-number {
  color: var(--q-primary);
  font-weight: 600;
  min-width: 20px;
}

.reorder-item-list-name {
  color: var(--nexa-text-primary);
  font-weight: 500;
}

.reorder-item-list-category {
  color: var(--nexa-text-primary);
  opacity: 0.6;
  font-size: 12px;
}

.reorder-item-list-more {
  font-size: 13px;
  color: var(--nexa-text-primary);
  opacity: 0.6;
  font-style: italic;
  margin-top: 4px;
}

.reorder-filter-notice {
  padding: 12px;
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.reorder-filter-notice-text {
  font-size: 14px;
  color: var(--nexa-text-primary);
  opacity: 0.9;
}

.reorder-options {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
}

.reorder-options-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--nexa-text-primary);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--nexa-border-color);
}

.reorder-options-title {
  color: var(--q-primary);
}

.reorder-options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reorder-option-item {
  padding: 16px;
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: var(--q-primary);
  }
}

.reorder-option-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--nexa-text-primary);
}

.reorder-option-desc {
  font-size: 13px;
  color: var(--nexa-text-primary);
  opacity: 0.7;
  margin-top: 4px;
}

.reorder-actions {
  padding: 0 100px 100px 100px;
  gap: 16px;

  @media (max-width: 600px) {
    padding: 0 50px 50px 50px;
  }
}

.reorder-undo-btn {
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

.reorder-close-btn {
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

.reorder-future-options {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px dashed var(--nexa-border-color);
  border-radius: 8px;
}

.reorder-future-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--nexa-text-primary);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--nexa-border-color);
}

.reorder-future-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
}

.reorder-future-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--nexa-text-primary);
  opacity: 0.6;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.02);
}

.reorder-search-wrapper {
  position: relative;
}

.reorder-search-input {
  width: 100%;
}

.reorder-search-results-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  background-color: var(--q-dark-page);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-height: 300px;
  overflow-y: auto;
}

.reorder-search-results-list {
  display: flex;
  flex-direction: column;
}

.reorder-search-result-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--nexa-border-color);
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
}

.reorder-search-item-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--nexa-text-primary);
}

.reorder-search-item-info {
  font-size: 13px;
  color: var(--nexa-text-primary);
  opacity: 0.7;
  margin-top: 4px;
}

.reorder-search-empty {
  padding: 20px;
  text-align: center;
  color: var(--nexa-text-primary);
  opacity: 0.6;
  font-size: 14px;
}

.reorder-selected-target {
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
}

.reorder-selected-target-info {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: var(--nexa-text-primary);
  width: 100%;
}

.reorder-selected-target-close {
  margin-left: auto;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.reorder-selected-target-name {
  font-weight: 600;
  margin-right: 8px;
}

.reorder-selected-target-category {
  opacity: 0.7;
  font-size: 13px;
}

.reorder-move-buttons {
  display: flex;
  gap: 8px;
}

.reorder-move-btn {
  flex: 1;
  border: 1px solid var(--q-primary);
  background-color: transparent;
  color: var(--q-primary);

  :deep(.q-btn__content) {
    color: var(--q-primary);
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
  }
}
</style>

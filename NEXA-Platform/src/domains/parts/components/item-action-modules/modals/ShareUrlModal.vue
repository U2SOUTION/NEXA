<!-- ShareUrlModal.vue
  선택 항목 공유 URL 생성 모달
-->
<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="share-url-dialog-card" style="min-width: 600px; max-width: 800px">
      <q-card-section class="share-url-section">
        <div class="share-url-title">
          <span class="share-url-title-en">SHARE URL</span>
          <span class="share-url-title-ko">
            {{
              mode === 'combined'
                ? '필터 및 선택 항목 공유 URL'
                : mode === 'filter'
                  ? '필터 결과 공유 URL'
                  : '선택 항목 공유 URL'
            }}
          </span>
        </div>

        <!-- 필터 모드: 필터 조건 표시 -->
        <div v-if="(mode === 'filter' || mode === 'combined') && filterConditions" class="q-mt-md">
          <div class="share-url-items-header">
            <q-icon name="filter_alt" size="18px" color="primary" class="q-mr-sm" />
            <span class="share-url-items-count">필터 조건</span>
          </div>

          <div class="share-url-filter-list q-mt-sm">
            <div v-if="filterConditions.search" class="share-url-filter-item q-pa-sm q-mb-xs">
              <div class="share-url-filter-label">검색어:</div>
              <div class="share-url-filter-value">{{ filterConditions.search }}</div>
            </div>
            <div v-if="filterConditions.category" class="share-url-filter-item q-pa-sm q-mb-xs">
              <div class="share-url-filter-label">카테고리:</div>
              <div class="share-url-filter-value">{{ filterConditions.category }}</div>
            </div>
            <div v-if="filterConditions.status" class="share-url-filter-item q-pa-sm q-mb-xs">
              <div class="share-url-filter-label">상태:</div>
              <div class="share-url-filter-value">{{ filterConditions.status }}</div>
            </div>
          </div>
        </div>

        <!-- 선택 모드: 선택된 항목 목록 -->
        <div
          v-if="(mode === 'selected' || mode === 'combined') && selectedItems.length > 0"
          class="q-mt-md"
        >
          <div class="share-url-items-header">
            <q-icon name="check_circle" size="18px" color="primary" class="q-mr-sm" />
            <span class="share-url-items-count">선택된 항목: {{ selectedItems.length }}개</span>
          </div>

          <div class="share-url-items-list q-mt-sm">
            <div
              v-for="item in selectedItems"
              :key="item.id"
              class="share-url-item q-pa-sm q-mb-xs"
            >
              <div class="share-url-item-name">{{ item.name || '-' }}</div>
              <div v-if="item.category" class="share-url-item-category text-caption text-grey-6">
                {{ item.category }}
              </div>
            </div>
          </div>
          <div v-if="selectedItems.length > 5" class="text-caption text-grey-6 q-mt-xs text-center">
            (총 {{ selectedItems.length }}개 항목 중 {{ Math.min(selectedItems.length, 10) }}개
            표시)
          </div>
        </div>

        <!-- 공유 URL -->
        <div class="q-mt-lg">
          <div class="share-url-label q-mb-sm">
            <q-icon name="link" size="16px" color="primary" class="q-mr-xs" />
            <span>공유 URL</span>
          </div>
          <div class="share-url-input-container">
            <q-input
              v-model="shareUrl"
              readonly
              outlined
              dense
              type="textarea"
              autogrow
              class="share-url-input"
              :input-style="{
                wordBreak: 'break-all',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
              }"
            >
              <template v-slot:append>
                <q-btn
                  flat
                  dense
                  round
                  icon="content_copy"
                  color="primary"
                  @click="copyToClipboard"
                  :disable="!shareUrl"
                  class="q-mt-xs"
                >
                  <q-tooltip>클립보드에 복사</q-tooltip>
                </q-btn>
              </template>
            </q-input>
          </div>
          <div v-if="copied" class="share-url-copied-message q-mt-xs text-positive text-caption">
            <q-icon name="check_circle" size="14px" class="q-mr-xs" />
            URL이 클립보드에 복사되었습니다
          </div>
        </div>

        <!-- 안내 메시지 -->
        <div class="share-url-info q-mt-md">
          <q-icon name="info" size="16px" color="primary" class="q-mr-xs" />
          <span class="text-caption text-grey-6">
            {{
              hasFilter && selectedItems.length > 0
                ? '이 URL을 공유하면 필터 조건이 적용된 후 선택된 항목만 표시됩니다.'
                : hasFilter
                  ? '이 URL을 공유하면 동일한 필터 조건이 적용된 결과가 표시됩니다.'
                  : '이 URL을 공유하면 선택된 항목만 필터링되어 표시됩니다.'
            }}
          </span>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="share-url-actions q-pa-md">
        <q-btn flat label="닫기" color="primary" @click="$emit('update:modelValue', false)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { getDefaultShareView, getURLStateParamName } from '@system/config/url-state/index.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  selectedItems: {
    type: Array,
    default: () => [],
  },
  filterConditions: {
    type: Object,
    default: null, // { search: string, category: string, status: string }
  },
})

const $q = useQuasar()
const route = useRoute()

const shareUrl = ref('')
const copied = ref(false)

// 필터가 있는지 확인
const hasFilter = computed(() => {
  return (
    props.filterConditions &&
    (props.filterConditions.search ||
      props.filterConditions.category ||
      props.filterConditions.status)
  )
})

// 모드 결정: 필터만 있으면 'filter', 선택만 있으면 'selected', 둘 다 있으면 'combined'
const mode = computed(() => {
  if (hasFilter.value && props.selectedItems.length > 0) {
    return 'combined'
  } else if (hasFilter.value) {
    return 'filter'
  } else if (props.selectedItems.length > 0) {
    return 'selected'
  }
  return null
})

// 공유 URL 생성
function generateShareUrl() {
  // 현재 경로와 쿼리 파라미터 가져오기
  const baseUrl = window.location.origin

  // 해시 라우터 모드에서는 fullPath에 #이 포함되어 있음
  // fullPath에서 쿼리 파라미터를 제거한 경로만 사용
  let currentPath = route.path
  if (!currentPath.startsWith('#')) {
    currentPath = `#${currentPath}`
  }

  // 공유 URL 파라미터 이름 가져오기 (짧은 이름 사용)
  const categoryParam = getURLStateParamName('category')
  const statusParam = getURLStateParamName('status')
  const viewParam = getURLStateParamName('view')
  const selectedParam = getURLStateParamName('selected')
  const searchParam = getURLStateParamName('search')

  const query = {}

  // view 파라미터 추가 (서버 측 파싱을 위해 테이블 정보 필요)
  const currentView = route.query[getURLStateParamName('view')] || route.query.view
  if (currentView) {
    query[viewParam] = currentView
  } else {
    // view가 없으면 설정 파일의 기본값 사용
    query[viewParam] = getDefaultShareView()
  }

  // 필터 조건 포함 (필터가 있는 경우)
  if (hasFilter.value && props.filterConditions) {
    // 검색어
    if (props.filterConditions.search) {
      query[searchParam] = props.filterConditions.search
    }
    // 카테고리
    if (props.filterConditions.category) {
      query[categoryParam] = props.filterConditions.category
    }
    // 상태 필터
    if (props.filterConditions.status) {
      query[statusParam] = props.filterConditions.status
    }
  }

  // 선택된 항목 포함 (선택이 있는 경우)
  if (props.selectedItems.length > 0) {
    // 선택된 항목의 ID 배열
    const selectedIds = props.selectedItems.map((item) => item.id).filter((id) => id != null)

    if (selectedIds.length > 0) {
      // selected 파라미터 추가 (하이픈으로 구분된 ID 목록)
      query[selectedParam] = selectedIds.join('-')
    }
  }

  // 필터도 선택도 없으면 URL 생성 불가
  if (!hasFilter.value && props.selectedItems.length === 0) {
    shareUrl.value = ''
    return
  }

  // URL 생성
  const queryString = Object.keys(query)
    .map((key) => {
      const value = query[key]
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .join('&')

  shareUrl.value = `${baseUrl}${currentPath}${queryString ? `?${queryString}` : ''}`
}

// 클립보드에 복사
async function copyToClipboard() {
  if (!shareUrl.value) return

  try {
    // 실제 URL(인코딩된 형태)을 클립보드에 복사
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    $q.notify({
      type: 'positive',
      message: 'URL이 클립보드에 복사되었습니다',
      position: 'top',
      timeout: 2000,
    })

    // 3초 후 복사 메시지 숨기기
    setTimeout(() => {
      copied.value = false
    }, 3000)
  } catch (error) {
    console.error('클립보드 복사 실패:', error)
    $q.notify({
      type: 'negative',
      message: 'URL 복사에 실패했습니다',
      position: 'top',
      timeout: 2000,
    })
  }
}

// 모달이 열릴 때마다 URL 생성
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      generateShareUrl()
      copied.value = false
    }
  },
  { immediate: true },
)

// 선택된 항목 또는 필터 조건이 변경될 때마다 URL 재생성
watch(
  () => [props.selectedItems, props.filterConditions],
  () => {
    if (props.modelValue) {
      generateShareUrl()
    }
  },
  { deep: true },
)
</script>

<style scoped lang="scss">
.share-url-dialog-card {
  border-radius: 8px;
}

.share-url-section {
  padding: 24px;
}

.share-url-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.share-url-title-en {
  font-size: 14px;
  font-weight: 700;
  color: var(--nexa-text-primary);
  opacity: 0.6;
  text-transform: uppercase;
}

.share-url-title-ko {
  font-size: 20px;
  font-weight: 600;
  color: var(--nexa-text-primary);
}

.share-url-items-header {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.share-url-items-count {
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.share-url-items-list {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}

.share-url-item {
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(25, 118, 210, 0.06);
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.share-url-item:hover {
  background-color: rgba(25, 118, 210, 0.12);
  border-color: rgba(25, 118, 210, 0.3);
}

.share-url-item-name {
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.share-url-item-category {
  margin-top: 4px;
}

.share-url-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--nexa-text-primary);
}

.share-url-input-container {
  width: 100%;
}

.share-url-input {
  font-family: monospace;
  font-size: 11px;

  :deep(.q-field__control) {
    min-height: auto;
  }

  :deep(.q-field__native) {
    word-break: break-all;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    line-height: 1.4;
    min-height: 40px;
    max-height: 200px;
    overflow-y: auto;
    resize: none;
  }
}

.share-url-copied-message {
  display: flex;
  align-items: center;
}

.share-url-info {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background-color: rgba(25, 118, 210, 0.05);
  border-radius: 4px;
  border-left: 3px solid var(--nexa-ui-primary);
}

.share-url-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

// 필터 모드 스타일
.share-url-filter-list {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}

.share-url-filter-item {
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(25, 118, 210, 0.06);
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.share-url-filter-item:hover {
  background-color: rgba(25, 118, 210, 0.12);
  border-color: rgba(25, 118, 210, 0.3);
}

.share-url-filter-label {
  font-size: 12px;
  color: var(--nexa-text-primary);
  opacity: 0.7;
  margin-bottom: 4px;
}

.share-url-filter-value {
  font-weight: 500;
  color: var(--nexa-text-primary);
}
</style>

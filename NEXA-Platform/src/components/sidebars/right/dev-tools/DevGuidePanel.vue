<!-- DevGuidePanel.vue
  개발 가이드 오른쪽 사이드바 패널
  선택된 샘플의 상세 정보 표시
-->
<template>
  <div class="dev-guide-panel">
    <!-- 선택된 샘플이 있을 때 -->
    <template v-if="selectedSample">
      <!-- AI 참조 키워드 -->
      <div class="panel-section q-pa-md">
        <div class="section-header">
          <q-icon name="smart_toy" class="section-icon" />
          <div class="section-title">AI 참조 키워드</div>
        </div>
        <q-input :model-value="`@${selectedSample.name}`" readonly outlined dense class="q-mt-sm">
          <template v-slot:append>
            <q-btn flat dense icon="content_copy" @click="handleCopyKeyword" />
          </template>
        </q-input>
        <p class="section-note q-mt-xs text-caption text-grey-6">AI에게 "{{ `@${selectedSample.name}` }} 샘플 참고"라고 말하면 됩니다.</p>
      </div>

      <q-separator />

      <!-- 태그 관리 -->
      <div class="panel-section q-pa-md">
        <div class="section-header">
          <q-icon name="label" class="section-icon" />
          <div class="section-title">태그 관리</div>
        </div>
        <div v-if="selectedSample.tags && selectedSample.tags.length > 0" class="tags-display q-mt-sm">
          <q-chip v-for="tag in selectedSample.tags" :key="tag" class="tag-chip">
            {{ tag }}
            <q-icon name="close" class="tag-remove-icon" @click="handleRemoveTag(tag)" />
          </q-chip>
        </div>
        <div v-else class="q-mt-sm text-caption text-grey-6">태그가 없습니다.</div>
        <q-input v-model="newTag" placeholder="새 태그 추가" dense outlined class="q-mt-sm tag-input" @keyup.enter="handleAddTag">
          <template v-slot:append>
            <q-btn flat dense icon="add_box" @click="handleAddTag" class="tag-add-btn" />
          </template>
        </q-input>
      </div>

      <q-separator />

      <!-- 샘플 정보 -->
      <div class="panel-section q-pa-md">
        <div class="section-header">
          <q-icon name="info" class="section-icon" />
          <div class="section-title">샘플 정보</div>
        </div>
        <div class="info-list q-mt-sm">
          <div class="info-item">
            <span class="info-label">카테고리:</span>
            <span class="info-value">{{ selectedSample.category || 'N/A' }}</span>
          </div>
          <div v-if="selectedSample.hierarchy" class="info-item">
            <span class="info-label">계층:</span>
            <span class="info-value"> {{ selectedSample.hierarchy.type }} > {{ selectedSample.hierarchy.subType }} > {{ selectedSample.hierarchy.variant }} </span>
          </div>
          <div v-if="selectedSample.componentPath" class="info-item">
            <span class="info-label">컴포넌트:</span>
            <span class="info-value">{{ selectedSample.componentPath }}</span>
          </div>
        </div>
      </div>

      <q-separator />

      <!-- 사용 통계 (향후 구현) -->
      <div class="panel-section q-pa-md">
        <div class="section-header">
          <q-icon name="analytics" class="section-icon" />
          <div class="section-title">사용 통계</div>
        </div>
        <div class="statistics-placeholder q-mt-sm text-grey-6 text-caption">사용 통계는 향후 구현 예정입니다.</div>
      </div>
    </template>

    <!-- 선택된 샘플이 없을 때 -->
    <div v-else class="no-selection q-pa-md text-center">
      <q-icon name="style" size="48px" class="q-mb-sm" />
      <p>샘플을 선택하면 상세 정보가 표시됩니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useDevGuide } from 'src/composables/dev-tools/useDevGuide'
import { copyTextToClipboard } from 'src/utils/clipboard'

const $q = useQuasar()
const { selectedSample } = useDevGuide()

const newTag = ref('')
const isSaving = ref(false)

// 키워드 복사 핸들러
async function handleCopyKeyword() {
  if (selectedSample.value?.name) {
    await copyTextToClipboard(`@${selectedSample.value.name}`)
  }
}

// 파일에 메타데이터 저장
async function saveMetadataToFile() {
  if (!selectedSample.value?.componentPath) return

  // 개발 환경에서만 API 호출
  if (!import.meta.env.DEV) {
    console.warn('[DevGuidePanel] 개발 환경에서만 파일 저장이 가능합니다.')
    return
  }

  if (isSaving.value) return // 이미 저장 중이면 무시

  try {
    isSaving.value = true

    const filePath = selectedSample.value.componentPath
    const response = await fetch(`http://localhost:3000/api/dev/files/${filePath}/metadata`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags: selectedSample.value.tags || [],
        category: selectedSample.value.category || '',
        description: selectedSample.value.description || '',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '메타데이터 저장 실패')
    }

    // 성공 알림은 생략 (너무 자주 발생할 수 있음)
  } catch (error) {
    console.error('[DevGuidePanel] 메타데이터 저장 실패:', error)
    $q.notify({
      type: 'negative',
      message: `태그 저장 실패: ${error.message}`,
      position: 'top',
      timeout: 2000,
    })
  } finally {
    isSaving.value = false
  }
}

// 태그 추가 핸들러
async function handleAddTag() {
  if (newTag.value.trim() && selectedSample.value) {
    if (!selectedSample.value.tags) {
      selectedSample.value.tags = []
    }
    if (!selectedSample.value.tags.includes(newTag.value.trim())) {
      selectedSample.value.tags.push(newTag.value.trim())
      newTag.value = ''
      // 파일에 저장
      await saveMetadataToFile()
    }
  }
}

// 태그 제거 핸들러
async function handleRemoveTag(tag) {
  if (selectedSample.value?.tags) {
    const index = selectedSample.value.tags.indexOf(tag)
    if (index >= 0) {
      selectedSample.value.tags.splice(index, 1)
      // 파일에 저장
      await saveMetadataToFile()
    }
  }
}

// 파일에서 메타데이터 읽기
async function loadMetadataFromFile() {
  if (!selectedSample.value?.componentPath) return

  // 개발 환경에서만 API 호출
  if (!import.meta.env.DEV) return

  try {
    const filePath = selectedSample.value.componentPath
    const response = await fetch(`http://localhost:3000/api/dev/files/${filePath}/metadata`)

    if (!response.ok) {
      // 파일에 메타데이터가 없거나 읽기 실패 시 무시 (기본값 사용)
      return
    }

    const data = await response.json()
    if (data.success && data.metadata) {
      // 파일에서 읽은 메타데이터로 업데이트
      if (data.metadata.tags && data.metadata.tags.length > 0) {
        selectedSample.value.tags = data.metadata.tags
      }
      if (data.metadata.category) {
        selectedSample.value.category = data.metadata.category
      }
      if (data.metadata.description) {
        selectedSample.value.description = data.metadata.description
      }
    }
  } catch (error) {
    // 파일 읽기 실패는 무시 (기본값 사용)
    console.debug('[DevGuidePanel] 메타데이터 읽기 실패 (무시됨):', error.message)
  }
}

// 샘플 선택 이벤트 리스너
function handleSampleSelected() {
  // selectedSample은 useDevGuide에서 관리되므로 자동으로 업데이트됨
  // 파일에서 메타데이터 로드
  loadMetadataFromFile()
}

// selectedSample 변경 감시
watch(
  () => selectedSample.value?.componentPath,
  () => {
    if (selectedSample.value?.componentPath) {
      loadMetadataFromFile()
    }
  },
)

onMounted(() => {
  window.addEventListener('dev-guide-sample-selected', handleSampleSelected)
  // 초기 로드
  if (selectedSample.value?.componentPath) {
    loadMetadataFromFile()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('dev-guide-sample-selected', handleSampleSelected)
})
</script>

<style lang="scss" scoped>
.dev-guide-panel {
  width: 100%;
  min-width: 0; // flex 컨테이너가 줄어들 수 있도록
  overflow: hidden; // 내용이 넘치지 않도록

  .panel-section {
    width: 100%;
    min-width: 0; // flex 컨테이너가 줄어들 수 있도록
    overflow: hidden; // 내용이 넘치지 않도록

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      .section-icon {
        margin-right: 8px;
        color: var(--nexa-text-secondary);
      }

      .section-title {
        color: var(--nexa-text-primary);
        font-weight: 600;
      }
    }

    .section-note {
      color: var(--nexa-text-secondary);
    }

    .tags-display {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      min-width: 0; // flex 컨테이너가 줄어들 수 있도록
      overflow: hidden; // 내용이 넘치지 않도록

      .tag-chip {
        color: var(--nexa-primary);

        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding-right: 4px;

        .tag-remove-icon {
          opacity: 0.5;
          font-size: 20px;
          cursor: pointer;
          transition: opacity 0.5s ease;
          margin-left: 2px;
          color: var(--nexa-warning);

          &:hover {
            opacity: 1;
          }
        }
      }
    }

    .tag-input {
      .tag-add-btn {
        :deep(.q-icon) {
          font-size: 24px !important;
        }
      }
    }

    .info-list {
      .info-item {
        display: flex;
        margin-bottom: 8px;
        min-width: 0; // flex 아이템이 줄어들 수 있도록

        .info-label {
          color: var(--nexa-text-secondary);
          font-weight: 500;
          min-width: 80px;
          flex-shrink: 0; // 레이블은 줄어들지 않도록
        }

        .info-value {
          color: var(--nexa-text-primary);
          flex: 1;
          min-width: 0; // flex 아이템이 줄어들 수 있도록
          word-break: break-word; // 단어 단위로 줄바꿈
          overflow-wrap: break-word; // 긴 단어도 줄바꿈
          hyphens: auto; // 하이픈으로 단어 분리 (선택사항)
        }
      }
    }

    .statistics-placeholder {
      color: var(--nexa-text-disabled);
    }
  }

  .no-selection {
    color: var(--nexa-text-secondary);
    text-align: center;
    padding: 32px 16px;
  }
}
</style>

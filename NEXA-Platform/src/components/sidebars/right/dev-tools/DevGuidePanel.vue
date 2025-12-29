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
          <div class="section-header-right">
            <span class="keyword-text" @click="handleCopyKeyword">@{{ selectedSample.name }}</span>
            <q-btn flat dense icon="content_copy" size="sm" @click="handleCopyKeyword" />
          </div>
        </div>
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
        <div v-else class="q-mt-sm text-caption">태그가 없습니다.</div>
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
            <span class="info-value" @click="handleCopyInfoValue(selectedSample.category || 'N/A')">{{ selectedSample.category || 'N/A' }}</span>
          </div>
          <div v-if="selectedSample.hierarchy" class="info-item">
            <span class="info-label">계층:</span>
            <span class="info-value" @click="handleCopyInfoValue(`${selectedSample.hierarchy.type} > ${selectedSample.hierarchy.subType} > ${selectedSample.hierarchy.variant}`)">
              {{ selectedSample.hierarchy.type }} > {{ selectedSample.hierarchy.subType }} > {{ selectedSample.hierarchy.variant }}
            </span>
          </div>
          <div v-if="selectedSample.displayName || selectedSample.name" class="info-item">
            <span class="info-label">컴포넌트:</span>
            <span class="info-value" @click="handleCopyInfoValue(selectedSample.displayName || selectedSample.name)">{{ selectedSample.displayName || selectedSample.name }}</span>
          </div>
          <div v-if="fileName" class="info-item">
            <span class="info-label">파일명:</span>
            <span class="info-value" @click="handleCopyInfoValue(fileName)">{{ fileName }}</span>
          </div>
          <div v-if="selectedSample.componentPath" class="info-item">
            <span class="info-label">파일 경로:</span>
            <span class="info-value" @click="handleCopyInfoValue(selectedSample.componentPath)">{{ selectedSample.componentPath }}</span>
          </div>
        </div>
      </div>

      <q-separator />

      <!-- 전역 SCSS 변수 사용 -->
      <div v-if="scssDependencies && scssDependencies.usesGlobalVariables" class="panel-section q-pa-md">
        <div class="section-header">
          <q-icon name="palette" class="section-icon" />
          <div class="section-title">사용된 CSS 전역변수</div>
        </div>
        <div v-if="scssDependencies.variables && scssDependencies.variables.length > 0" class="scss-variables-list q-mt-sm">
          <div v-for="(variable, index) in scssDependencies.variables" :key="index" class="scss-variable-item">
            <q-icon name="palette" size="14px" class="item-icon" />
            <span class="scss-variable-name" @click="handleCopyVariableName(variable)">{{ getVariableName(variable) }}</span>
            <div class="scss-variable-color-box" :style="{ backgroundColor: getVariableColor(variable) }" :title="getVariableColor(variable)" />
          </div>
        </div>
        <div v-else class="q-mt-sm text-caption">사용된 변수가 없습니다.</div>
      </div>

      <q-separator v-if="scssDependencies && scssDependencies.usesGlobalVariables" />

      <!-- 임포트 정보 -->
      <div v-if="selectedSample" class="panel-section q-pa-md">
        <div class="section-header">
          <q-icon name="import_export" class="section-icon" />
          <div class="section-title">임포트 정보</div>
        </div>

        <!-- 로딩 중 -->
        <div v-if="isLoadingDependencies" class="q-mt-sm text-caption">
          <q-spinner size="16px" class="q-mr-xs" />
          의존성 정보를 로드하는 중...
        </div>

        <!-- 의존성 정보가 로드된 경우 -->
        <template v-else-if="dependencies">
          <!-- 스타일 의존성 (CSS) - 가장 위에 위치 -->
          <template v-if="dependencies.styles && dependencies.styles.length > 0">
            <div class="dependency-group q-mt-sm">
              <div class="dependency-list">
                <div v-for="(style, index) in dependencies.styles" :key="index" class="dependency-item">
                  <q-icon name="style" size="14px" class="item-icon" />
                  <span class="dependency-path" @click="handleCopyDependencyPath(style.fullPath)">{{ style.fullPath }}</span>
                  <q-btn flat dense icon="content_copy" size="sm" @click="handleCopyDependencyPath(style.fullPath)" />
                </div>
              </div>
            </div>
          </template>
          <div v-else-if="!isLoadingDependencies" class="dependency-empty-message">
            <q-icon name="style" size="14px" class="q-mr-xs" />
            사용하는 스타일이 없습니다.
          </div>

          <!-- 컴포넌트 의존성 -->
          <template v-if="dependencies.components && dependencies.components.length > 0">
            <div class="dependency-group q-mt-sm">
              <div class="dependency-list">
                <div v-for="(comp, index) in dependencies.components" :key="index" class="dependency-item">
                  <q-icon name="widgets" size="14px" class="item-icon" />
                  <span class="dependency-path" @click="handleCopyDependencyPath(comp.fullPath)">{{ comp.fullPath }}</span>
                  <q-btn flat dense icon="content_copy" size="sm" @click="handleCopyDependencyPath(comp.fullPath)" />
                </div>
              </div>
            </div>
          </template>
          <div v-else-if="!isLoadingDependencies" class="dependency-empty-message">
            <q-icon name="widgets" size="14px" class="q-mr-xs" />
            사용하는 컴포넌트가 없습니다.
          </div>

          <!-- 유틸리티 의존성 -->
          <template v-if="dependencies.utilities && dependencies.utilities.length > 0">
            <div class="dependency-group q-mt-sm">
              <div class="dependency-list">
                <div v-for="(util, index) in dependencies.utilities" :key="index" class="dependency-item">
                  <q-icon name="build" size="14px" class="item-icon" />
                  <span class="dependency-path" @click="handleCopyDependencyPath(util.fullPath)">{{ util.fullPath }}</span>
                  <q-btn flat dense icon="content_copy" size="sm" @click="handleCopyDependencyPath(util.fullPath)" />
                </div>
              </div>
            </div>
          </template>
          <div v-else-if="!isLoadingDependencies" class="dependency-empty-message">
            <q-icon name="build" size="14px" class="q-mr-xs" />
            사용하는 유틸리티가 없습니다.
          </div>

          <!-- 스토어 의존성 -->
          <template v-if="dependencies.stores && dependencies.stores.length > 0">
            <div class="dependency-group q-mt-sm">
              <div class="dependency-list">
                <div v-for="(store, index) in dependencies.stores" :key="index" class="dependency-item">
                  <q-icon name="storage" size="14px" class="item-icon" />
                  <span class="dependency-path" @click="handleCopyDependencyPath(store.fullPath)">{{ store.fullPath }}</span>
                  <q-btn flat dense icon="content_copy" size="sm" @click="handleCopyDependencyPath(store.fullPath)" />
                </div>
              </div>
            </div>
          </template>
          <div v-else-if="!isLoadingDependencies" class="dependency-empty-message">
            <q-icon name="storage" size="14px" class="q-mr-xs" />
            사용하는 스토어가 없습니다.
          </div>
        </template>

        <!-- 데이터 없음 (의존성 정보를 불러올 수 없는 경우) -->
        <div v-else-if="!isLoadingDependencies" class="dependency-empty-message">의존성 정보를 불러올 수 없습니다.</div>
      </div>

      <q-separator v-if="selectedSample" />
    </template>

    <!-- 선택된 샘플이 없을 때 -->
    <div v-if="!selectedSample" class="no-selection q-pa-md text-center">
      <q-icon name="style" size="48px" class="q-mb-sm" />
      <p>샘플을 선택하면 상세 정보가 표시됩니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useDevGuide } from 'src/composables/dev-tools/useDevGuide'
import { copyTextToClipboard } from 'src/utils/clipboard'
import { analyzeSampleDependencies } from 'src/utils/dev-guide/dependency-analyzer.js'

const $q = useQuasar()
const { selectedSample } = useDevGuide()

const newTag = ref('')
const isSaving = ref(false)
const scssDependencies = ref(null)
const dependencies = ref(null)
const isLoadingDependencies = ref(false)

// 파일명 추출 (componentPath에서)
const fileName = computed(() => {
  if (!selectedSample.value?.componentPath) return ''
  const path = selectedSample.value.componentPath
  const parts = path.split('/')
  return parts[parts.length - 1] || ''
})

// CSS 변수명에서 var() 제거하고 순수 변수명만 반환
// 예: "var(--nexa-background)" -> "--nexa-background"
function getVariableName(variableName) {
  if (!variableName) return ''

  const trimmed = variableName.trim()
  const varMatch = trimmed.match(/var\(([^)]+)\)/)

  // var() 형식이면 내부 변수명만 추출, 아니면 그대로 반환
  return varMatch ? varMatch[1].trim() : trimmed
}

// CSS 변수의 실제 색상 값 가져오기
function getVariableColor(variableName) {
  if (!variableName) return 'transparent'

  try {
    // 변수명에서 var() 제거 (공통 함수 사용)
    const actualVarName = getVariableName(variableName)
    if (!actualVarName) return 'transparent'

    // document.documentElement에서 CSS 변수 값 가져오기
    const rootStyle = getComputedStyle(document.documentElement)
    let colorValue = rootStyle.getPropertyValue(actualVarName)?.trim()

    // body에서도 시도
    if (!colorValue) {
      const bodyStyle = getComputedStyle(document.body)
      colorValue = bodyStyle.getPropertyValue(actualVarName)?.trim()
    }

    // 스타일시트에서 직접 찾기
    if (!colorValue) {
      for (const stylesheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(stylesheet.cssRules)) {
            if (rule.style) {
              const value = rule.style.getPropertyValue(actualVarName)?.trim()
              if (value) {
                colorValue = value
                break
              }
            }
          }
          if (colorValue) break
        } catch {
          // CORS 오류 등 무시
          continue
        }
      }
    }

    // 중첩된 var() 참조가 있으면 재귀적으로 해석 (공통 함수 사용)
    if (colorValue && colorValue.includes('var(')) {
      const nestedVarName = getVariableName(colorValue)
      if (nestedVarName) {
        return getVariableColor(nestedVarName)
      }
    }

    // 값이 없을 때 경고
    if (!colorValue) {
      console.warn('[DevGuidePanel] CSS 변수 값을 찾을 수 없음:', actualVarName)
    }

    return colorValue || 'transparent'
  } catch (error) {
    console.error('[DevGuidePanel] CSS 변수 값 가져오기 실패:', variableName, error)
    return 'transparent'
  }
}

// 파일에서 의존성 로드 (컴포넌트, 유틸리티, SCSS)
async function loadDependencies() {
  if (!selectedSample.value?.componentPath) {
    dependencies.value = null
    scssDependencies.value = null
    isLoadingDependencies.value = false
    return
  }

  // 개발 환경에서만 API 호출
  if (!import.meta.env.DEV) {
    dependencies.value = null
    scssDependencies.value = null
    isLoadingDependencies.value = false
    return
  }

  isLoadingDependencies.value = true

  try {
    const filePath = selectedSample.value.componentPath
    const response = await fetch(`http://localhost:3000/api/dev/files/${filePath}/content`)

    if (!response.ok) {
      dependencies.value = null
      scssDependencies.value = null
      return
    }

    const data = await response.json()
    if (data.success && data.content) {
      const deps = analyzeSampleDependencies(data.content, selectedSample.value.componentPath)
      dependencies.value = deps
      scssDependencies.value = deps?.scss || null
      console.log('[DevGuidePanel] 의존성 로드 완료:', deps)
    } else {
      dependencies.value = null
      scssDependencies.value = null
    }
  } catch (error) {
    console.error('[DevGuidePanel] 의존성 로드 실패:', error)
    dependencies.value = null
    scssDependencies.value = null
  } finally {
    isLoadingDependencies.value = false
  }
}

// 범용 복사 핸들러
async function handleCopy(value, message = '복사되었습니다.') {
  if (!value) return

  // 문자열인 경우 trim 처리
  const textToCopy = typeof value === 'string' ? value.trim() : String(value)

  // 'N/A'나 빈 문자열은 복사하지 않음
  if (!textToCopy || textToCopy === 'N/A') return

  try {
    await copyTextToClipboard(textToCopy)
    $q.notify({
      type: 'positive',
      message,
      position: 'top',
      timeout: 1000,
    })
  } catch (error) {
    console.error('[DevGuidePanel] 복사 실패:', error)
    $q.notify({
      type: 'negative',
      message: '복사에 실패했습니다.',
      position: 'top',
      timeout: 2000,
    })
  }
}

// 의존성 경로 복사 핸들러
async function handleCopyDependencyPath(path) {
  await handleCopy(path, '경로가 복사되었습니다.')
}

// 키워드 복사 핸들러
async function handleCopyKeyword() {
  if (selectedSample.value?.name) {
    await handleCopy(`@${selectedSample.value.name}`, 'AI 참조 키워드가 복사되었습니다.')
  }
}

// 샘플 정보 값 복사 핸들러
async function handleCopyInfoValue(value) {
  if (!value || (typeof value === 'string' && value.trim() === 'N/A')) return

  const textToCopy = typeof value === 'string' ? value.trim() : String(value)
  await handleCopy(textToCopy, `"${textToCopy}" 복사되었습니다.`)
}

// CSS 변수명 복사 핸들러
async function handleCopyVariableName(variable) {
  const variableName = getVariableName(variable)
  if (variableName) {
    await handleCopy(variableName, `"${variableName}" 복사되었습니다.`)
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
  loadDependencies()
}

// selectedSample 변경 감시
watch(
  () => selectedSample.value?.componentPath,
  () => {
    if (selectedSample.value?.componentPath) {
      loadMetadataFromFile()
      loadDependencies()
    } else {
      dependencies.value = null
      scssDependencies.value = null
    }
  },
)

onMounted(() => {
  window.addEventListener('dev-guide-sample-selected', handleSampleSelected)
  // 초기 로드
  if (selectedSample.value?.componentPath) {
    loadMetadataFromFile()
    loadDependencies()
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
      justify-content: space-between;

      .section-icon {
        margin-right: 8px;
        color: var(--nexa-text-secondary);
      }

      .section-title {
        color: var(--nexa-text-primary);
        font-weight: 600;
        flex: 1;
      }

      .section-header-right {
        display: flex;
        align-items: center;
        gap: 8px;

        .keyword-text {
          color: var(--nexa-text-secondary);
          font-size: 0.9rem;
          transition: color 0.2s;

          &:hover {
            color: var(--nexa-text-primary);
          }
        }
      }
    }

    .section-note {
      color: var(--nexa-text-primary);
      font-size: 0.875rem;
      line-height: 1.4;
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
        min-width: 0; // flex 아이템이 줄어들 수 있도록
        padding: 4px 0;

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
          transition: color 0.2s;

          &:hover {
            color: var(--nexa-text-secondary);
          }
        }
      }
    }

    .statistics-placeholder {
      color: var(--nexa-text-disabled);
    }

    // 캐시 최적화 정보 스타일
    .cache-info-content {
      .cache-info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 12px;

        .cache-info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .cache-info-label {
            font-size: 0.75rem;
            color: var(--nexa-text-secondary);
          }

          .cache-info-value {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--nexa-text-primary);
          }
        }
      }

      .cache-info-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-start;
      }
    }

    // 공통 아이템 스타일
    .dependency-item,
    .scss-variable-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-left: 16px;
      min-width: 0;
      line-height: 1 !important;

      .item-icon {
        color: var(--nexa-text-secondary);
        font-size: 10px;
        margin-right: 6px;
        flex-shrink: 0;
      }
    }

    // 공통 텍스트 스타일 (의존성 경로, 변수명)
    .dependency-path,
    .scss-variable-name {
      font-family: 'Courier New', monospace;
      font-size: 0.8125rem;
      color: var(--nexa-text-primary);
      flex: 1;
      min-width: 0;
      word-break: break-word;
      overflow-wrap: break-word;
      transition: color 0.2s;
      cursor: pointer;

      &:hover {
        color: var(--nexa-text-secondary);
      }
    }

    .dependency-empty-message {
      color: var(--nexa-text-secondary) !important;
      font-size: 0.8125rem;
      opacity: 0.5;
      margin-left: 16px;

      .q-icon {
        color: var(--nexa-text-secondary) !important;
      }
    }

    .scss-variable-color-box {
      width: 50px;
      height: 10px;
      min-width: 30px;
      min-height: 10px;
      border: 1px solid var(--nexa-border-color);
      border-radius: 3px;
      flex-shrink: 0;
      margin-left: 8px;
    }
  }

  .no-selection {
    color: var(--nexa-text-secondary);
    text-align: center;
    padding: 32px 16px;
  }
}
</style>

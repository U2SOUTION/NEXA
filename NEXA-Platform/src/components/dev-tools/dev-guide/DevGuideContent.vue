<!-- DevGuideContent.vue
  개발 가이드 메인 컨텐츠 컴포넌트
  샘플 라이브러리 및 상세 뷰 관리
-->
<template>
  <div class="dev-guide-content">
    <!-- 샘플이 선택되지 않았을 때: 샘플 라이브러리 -->
    <div v-if="!selectedSample" class="sample-library-view">
      <div class="library-header">
        <h2 class="library-title">개발 가이드 샘플 라이브러리</h2>
        <p class="library-description">NEXA 시스템의 디자인 샘플을 탐색하고 참고하세요.</p>
      </div>

      <!-- 샘플 그리드 -->
      <div v-if="filteredSamples.length > 0" class="sample-grid">
        <div v-for="sample in filteredSamples" :key="sample.id" class="sample-card" @click="handleSampleSelect(sample)">
          <div class="sample-card-header">
            <q-icon :name="sample.icon || 'style'" class="sample-card-icon" />
            <div class="sample-card-title">{{ sample.displayName || sample.name }}</div>
          </div>
          <div class="sample-card-body">
            <div class="sample-card-category">{{ sample.category }}</div>
            <div class="sample-card-description">{{ sample.description || '설명 없음' }}</div>
            <div v-if="sample.tags && sample.tags.length > 0" class="sample-card-tags">
              <q-chip v-for="tag in sample.tags.slice(0, 3)" :key="tag" dense size="sm">
                {{ tag }}
              </q-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- 샘플이 없을 때 -->
      <div v-else class="no-samples q-pa-lg text-center">
        <q-icon name="style" size="64px" color="grey-5" class="q-mb-md" />
        <p class="no-samples-message">검색 결과가 없습니다.</p>
        <p class="no-samples-hint">샘플을 등록하면 여기에 표시됩니다.</p>
      </div>
    </div>

    <!-- 샘플이 선택되었을 때: 샘플 상세 뷰 -->
    <div v-else class="sample-detail-view">
      <div class="detail-header">
        <q-btn flat icon="arrow_back" @click="handleBack" />
        <h2 class="detail-title">{{ selectedSample.displayName || selectedSample.name }}</h2>
      </div>

      <div class="detail-content">
        <!-- 샘플 미리보기 -->
        <div class="detail-section">
          <h3 class="section-title">미리보기</h3>
          <div class="sample-preview">
            <!-- 샘플 컴포넌트 실제 렌더링 -->
            <component v-if="sampleComponent && !isLoading && !loadError" :is="sampleComponent" />
            <!-- 로딩 상태 -->
            <div v-else-if="isLoading" class="preview-loading">
              <q-spinner color="primary" size="48px" />
              <p class="preview-text">샘플 로딩 중...</p>
            </div>
            <!-- 에러 상태 -->
            <div v-else-if="loadError" class="preview-error">
              <q-icon name="error" size="48px" color="negative" />
              <p class="preview-text">컴포넌트를 로드할 수 없습니다</p>
              <p class="preview-note">{{ loadError }}</p>
            </div>
            <!-- 플레이스홀더 (초기 상태) -->
            <div v-else class="preview-placeholder">
              <q-icon name="image" size="48px" color="grey-5" />
              <p class="preview-text">미리보기 영역</p>
              <p class="preview-note">컴포넌트: {{ selectedSample.componentPath || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- 사용 예제 & Import 정보 -->
        <div v-if="selectedSample?.componentPath" class="detail-section">
          <h3 class="section-title">사용 예제 & Import 정보</h3>
          
          <!-- Import 정보 -->
          <div class="import-info-section">
            <div class="import-item">
              <div class="import-label">Import 경로:</div>
              <div class="import-value">
                <code>{{ importPath }}</code>
                <q-btn flat dense icon="content_copy" size="sm" @click="handleCopyImportPath" />
              </div>
            </div>
            <div class="import-item">
              <div class="import-label">파일명:</div>
              <div class="import-value">
                <code>{{ fileName }}</code>
                <q-btn flat dense icon="content_copy" size="sm" @click="handleCopyFileName" />
              </div>
            </div>
          </div>

          <!-- 사용 예제 코드 -->
          <div class="usage-example-section">
            <div class="usage-example-header">
              <span class="usage-label">사용 예제:</span>
              <q-btn flat dense icon="content_copy" size="sm" label="전체 복사" @click="handleCopyUsageExample" />
            </div>
            <div class="usage-example-code">
              <pre><code>{{ usageExampleCode }}</code></pre>
            </div>
          </div>
        </div>

        <!-- 디자인 결정 요소 -->
        <div v-if="selectedSample.designDecisions" class="detail-section">
          <h3 class="section-title">디자인 결정 요소</h3>
          <div class="design-decisions">
            <div v-for="(value, key) in selectedSample.designDecisions" :key="key" class="decision-item">
              <div class="decision-key">{{ key }}:</div>
              <div class="decision-value">{{ value }}</div>
            </div>
          </div>
        </div>

        <!-- 코드 에디터 -->
        <div class="detail-section">
          <h3 class="section-title">원본 코드 편집</h3>
          <div class="code-editor-section">
            <CodeEditor
              v-if="fileContent && selectedSample?.componentPath"
              :file-path="selectedSample.componentPath"
              :file-content="fileContent"
              @save="handleFileSave"
              @reload="handleFileReload"
            />
            <div v-else-if="isLoadingFile" class="file-loading">
              <q-spinner color="primary" size="32px" />
              <p class="file-loading-text">파일 로딩 중...</p>
            </div>
            <div v-else-if="fileLoadError" class="file-error">
              <q-icon name="error" size="32px" color="negative" />
              <p class="file-error-text">{{ fileLoadError }}</p>
            </div>
          </div>
        </div>

        <!-- AI 참조 키워드 -->
        <div class="detail-section">
          <h3 class="section-title">AI 참조 키워드</h3>
          <div class="ai-reference">
            <q-input :model-value="`@${selectedSample.name}`" readonly outlined dense>
              <template v-slot:append>
                <q-btn flat dense icon="content_copy" @click="handleCopyKeyword" />
              </template>
            </q-input>
            <p class="ai-reference-note">AI에게 "{{ `@${selectedSample.name}` }} 샘플 참고"라고 말하면 됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, shallowRef, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useDevGuide } from 'src/composables/dev-tools/useDevGuide'
import { copyTextToClipboard } from 'src/utils/clipboard'
import CodeEditor from './CodeEditor.vue'
import { generateUsageExample } from 'src/utils/dev-guide/usage-example-generator.js'

const $q = useQuasar()
const { selectedSample, filteredSamples, handleSampleSelect } = useDevGuide()

// 샘플 컴포넌트 로딩 상태
const sampleComponent = shallowRef(null)
const isLoading = ref(false)
const loadError = ref(null)

// 파일 내용 로딩 상태
const fileContent = ref('')
const isLoadingFile = ref(false)
const fileLoadError = ref(null)

// Import 정보 및 사용 예제
const importPath = computed(() => {
  if (!selectedSample.value?.componentPath) return ''
  // componentPath에서 import 경로 생성
  // 예: "guides/styles/buttons/IconButton.vue" -> "src/guides/styles/buttons/IconButton.vue"
  const path = selectedSample.value.componentPath
  return path.startsWith('src/') ? path : `src/${path}`
})

const fileName = computed(() => {
  if (!selectedSample.value?.componentPath) return ''
  const path = selectedSample.value.componentPath
  const parts = path.split('/')
  return parts[parts.length - 1] || ''
})

const componentName = computed(() => {
  if (!fileName.value) return ''
  // 파일명에서 확장자 제거하고 PascalCase로 변환
  const name = fileName.value.replace(/\.vue$/, '')
  return name
})

const usageExampleCode = computed(() => {
  if (!selectedSample.value || !componentName.value) return ''
  
  const displayName = selectedSample.value.displayName || selectedSample.value.name || componentName.value
  
  // 외부 유틸리티 함수 사용 (Vue 컴파일러 오류 방지)
  return generateUsageExample(componentName.value, importPath.value, displayName)
})

// Vite의 import.meta.glob을 사용하여 모든 샘플 컴포넌트 미리 등록
const guideModules = import.meta.glob('/src/guides/**/*.vue', { eager: false })

// 샘플 컴포넌트 로드 함수
async function loadSampleComponent() {
  if (!selectedSample.value?.componentPath) {
    sampleComponent.value = null
    loadError.value = null
    return
  }

  isLoading.value = true
  loadError.value = null
  sampleComponent.value = null

  try {
    // componentPath에서 전체 경로 구성
    // 예: "guides/styles/charts/bar/NexaChartBar.vue" -> "/src/guides/styles/charts/bar/NexaChartBar.vue"
    let fullPath = selectedSample.value.componentPath
    
    // src/ 접두사가 없으면 추가
    if (!fullPath.startsWith('src/')) {
      fullPath = `src/${fullPath}`
    }
    
    // /src/로 시작하도록 정규화
    if (!fullPath.startsWith('/src/')) {
      fullPath = `/${fullPath}`
    }

    // import.meta.glob으로 등록된 모듈 찾기
    const moduleLoader = guideModules[fullPath]
    
    if (!moduleLoader) {
      throw new Error(`컴포넌트를 찾을 수 없습니다: ${fullPath}`)
    }

    // 모듈 로드
    const module = await moduleLoader()
    
    // 모듈에서 default export 또는 named export 가져오기
    sampleComponent.value = module.default || module
  } catch (error) {
    console.error('[DevGuideContent] 컴포넌트 로드 실패:', error)
    loadError.value = error.message || '컴포넌트를 로드할 수 없습니다. 파일 경로를 확인해주세요.'
    sampleComponent.value = null
  } finally {
    isLoading.value = false
  }
}

// 파일 내용 로드 함수
async function loadFileContent() {
  if (!selectedSample.value?.componentPath) {
    fileContent.value = ''
    fileLoadError.value = null
    return
  }

  isLoadingFile.value = true
  fileLoadError.value = null

  try {
    const response = await fetch(
      `http://localhost:3000/api/dev/files/${selectedSample.value.componentPath}/content`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.success && data.content) {
      fileContent.value = data.content
    } else {
      throw new Error('파일 내용을 가져올 수 없습니다.')
    }
  } catch (error) {
    console.error('[DevGuideContent] 파일 로드 실패:', error)
    fileLoadError.value = error.message || '파일을 로드할 수 없습니다.'
    fileContent.value = ''
  } finally {
    isLoadingFile.value = false
  }
}

// 파일 저장 핸들러
function handleFileSave(newContent) {
  // 파일이 저장되면 컴포넌트도 다시 로드
  fileContent.value = newContent
  loadSampleComponent()
}

// 파일 새로고침 핸들러
function handleFileReload() {
  loadFileContent()
}

// selectedSample 변경 감시
watch(
  () => selectedSample.value?.componentPath,
  (newPath, oldPath) => {
    if (newPath && newPath !== oldPath) {
      loadSampleComponent()
      loadFileContent()
    } else if (!newPath) {
      sampleComponent.value = null
      loadError.value = null
      isLoading.value = false
      fileContent.value = ''
      fileLoadError.value = null
      isLoadingFile.value = false
    }
  },
  { immediate: true }
)

// 뒤로 가기 핸들러
function handleBack() {
  selectedSample.value = null
  window.dispatchEvent(new CustomEvent('dev-guide-sample-deselected'))
}

// Import 경로 복사 핸들러
async function handleCopyImportPath() {
  if (importPath.value) {
    await copyTextToClipboard(importPath.value)
    $q.notify({
      type: 'positive',
      message: 'Import 경로가 복사되었습니다.',
      position: 'top',
      timeout: 1000,
    })
  }
}

// 파일명 복사 핸들러
async function handleCopyFileName() {
  if (fileName.value) {
    await copyTextToClipboard(fileName.value)
    $q.notify({
      type: 'positive',
      message: '파일명이 복사되었습니다.',
      position: 'top',
      timeout: 1000,
    })
  }
}

// 사용 예제 코드 복사 핸들러
async function handleCopyUsageExample() {
  if (usageExampleCode.value) {
    await copyTextToClipboard(usageExampleCode.value)
    $q.notify({
      type: 'positive',
      message: '사용 예제 코드가 복사되었습니다.',
      position: 'top',
      timeout: 1000,
    })
  }
}

// 키워드 복사 핸들러
async function handleCopyKeyword() {
  if (selectedSample.value?.name) {
    await copyTextToClipboard(`@${selectedSample.value.name}`)
    $q.notify({
      type: 'positive',
      message: 'AI 참조 키워드가 복사되었습니다.',
      position: 'top',
      timeout: 1000,
    })
  }
}

// 샘플 선택 이벤트 리스너
function handleSampleSelected() {
  // selectedSample은 useDevGuide에서 관리되므로 자동으로 업데이트됨
  // watch가 자동으로 컴포넌트를 로드함
}

onMounted(() => {
  window.addEventListener('dev-guide-sample-selected', handleSampleSelected)
  // 초기 로드
  if (selectedSample.value?.componentPath) {
    loadSampleComponent()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('dev-guide-sample-selected', handleSampleSelected)
})
</script>

<style lang="scss" scoped>
.dev-guide-content {
  height: 100%;
  padding: 24px;

  .sample-library-view {
    .library-header {
      margin-bottom: 24px;

      .library-title {
        color: var(--nexa-text-primary);
        font-size: 2rem;
        font-weight: 900;
        margin-bottom: 8px;
      }

      .library-description {
        color: var(--nexa-text-secondary);
        font-size: 1rem;
      }
    }

    .sample-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .sample-card {
      background-color: var(--nexa-surface);
      border: 1px solid var(--nexa-border-color);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: var(--nexa-surface-hover);
        border-color: var(--nexa-border-hover);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .sample-card-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .sample-card-icon {
          margin-right: 8px;
          color: var(--nexa-text-secondary);
        }

        .sample-card-title {
          color: var(--nexa-text-primary);
          font-size: 1.1rem;
          font-weight: 600;
        }
      }

      .sample-card-body {
        .sample-card-category {
          color: var(--nexa-text-secondary);
          font-size: 0.875rem;
          margin-bottom: 8px;
        }

        .sample-card-description {
          color: var(--nexa-text-secondary);
          font-size: 0.875rem;
          margin-bottom: 8px;
        }

        .sample-card-tags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
      }
    }

    .no-samples {
      .no-samples-message {
        color: var(--nexa-text-primary);
        font-size: 1.1rem;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .no-samples-hint {
        color: var(--nexa-text-secondary);
        font-size: 0.875rem;
      }
    }
  }

  .sample-detail-view {
    .detail-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;

      .detail-title {
        color: var(--nexa-text-primary);
        font-size: 1.75rem;
        font-weight: 900;
        margin-left: 8px;
      }
    }

    .detail-content {
      .detail-section {
        margin-bottom: 32px;

        .section-title {
          color: var(--nexa-text-primary);
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .sample-preview {
          background-color: var(--nexa-surface);
          border: 1px solid var(--nexa-border-color);
          border-radius: 8px;
          padding: 32px;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;

          // 실제 컴포넌트가 렌더링될 때는 정렬 제거
          > :deep(*) {
            width: 100%;
          }

          .preview-placeholder,
          .preview-loading,
          .preview-error {
            text-align: center;
            color: var(--nexa-text-secondary);

            .preview-text {
              margin: 8px 0 4px;
              font-weight: 500;
            }

            .preview-note {
              font-size: 0.875rem;
              color: var(--nexa-text-disabled);
            }
          }

          .preview-loading {
            .preview-text {
              margin-top: 16px;
            }
          }

          .preview-error {
            .preview-text {
              color: var(--nexa-error);
              font-weight: 600;
            }
          }
        }

        .import-info-section {
          background-color: var(--nexa-surface);
          border: 1px solid var(--nexa-border-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;

          .import-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            .import-label {
              color: var(--nexa-text-secondary);
              font-size: 0.875rem;
              font-weight: 500;
              min-width: 100px;
              margin-right: 12px;
            }

            .import-value {
              display: flex;
              align-items: center;
              gap: 8px;
              flex: 1;

              code {
                font-family: 'Courier New', monospace;
                font-size: 0.875rem;
                color: var(--nexa-text-primary);
                background-color: var(--nexa-background);
                padding: 4px 8px;
                border-radius: 4px;
                flex: 1;
              }
            }
          }
        }

        .usage-example-section {
          background-color: var(--nexa-surface);
          border: 1px solid var(--nexa-border-color);
          border-radius: 8px;
          padding: 16px;

          .usage-example-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .usage-label {
              color: var(--nexa-text-secondary);
              font-size: 0.875rem;
              font-weight: 500;
            }
          }

          .usage-example-code {
            pre {
              margin: 0;
              overflow-x: auto;
              background-color: var(--nexa-background);
              padding: 12px;
              border-radius: 4px;

              code {
                font-family: 'Courier New', monospace;
                font-size: 0.875rem;
                color: var(--nexa-text-primary);
                line-height: 1.6;
              }
            }
          }
        }

        .design-decisions {
          .decision-item {
            display: flex;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--nexa-border-color);

            &:last-child {
              border-bottom: none;
            }

            .decision-key {
              color: var(--nexa-text-secondary);
              font-weight: 500;
              min-width: 120px;
            }

            .decision-value {
              color: var(--nexa-text-primary);
              flex: 1;
            }
          }
        }

        .code-editor-section {
          background-color: var(--nexa-surface);
          border: 1px solid var(--nexa-border-color);
          border-radius: 8px;
          padding: 16px;
          min-height: 500px;
          display: flex;
          flex-direction: column;

          .file-loading,
          .file-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            color: var(--nexa-text-secondary);

            .file-loading-text,
            .file-error-text {
              margin-top: 16px;
              font-size: 0.875rem;
            }

            .file-error-text {
              color: var(--nexa-error);
            }
          }
        }

        .ai-reference {
          .ai-reference-note {
            color: var(--nexa-text-secondary);
            font-size: 0.875rem;
            margin-top: 8px;
          }
        }
      }
    }
  }
}
</style>


<!-- GraphDocSidebar.vue
  그래프독 왼쪽 사이드바 통합 컴포넌트
  아코디언 구조: 의존성 그래프, 의존성 분석, 파일 구조, 코드 검색
  헤더 + 목록
-->

<template>
  <div class="graph-doc-sidebar">
    <!-- 아코디언 동작 옵션 -->
    <div class="accordion-options q-pa-sm">
      <div class="row items-center justify-between q-gutter-xs">
        <div class="row items-center q-gutter-xs">
          <!-- 단일 열림 모드 토글 -->
          <q-btn flat dense size="sm" :icon="singleMode ? 'radio_button_checked' : 'radio_button_unchecked'" :label="singleMode ? '단일' : '다중'" :class="{ 'option-active': singleMode, 'option-inactive': !singleMode }" class="option-btn" @click="handleSingleModeToggle">
            <q-tooltip>{{ singleMode ? '단일 열림 모드 (하나만 열기)' : '다중 열림 모드 (여러 개 열기)' }}</q-tooltip>
          </q-btn>

          <!-- 모든 항목 열기/닫기 -->
          <q-btn flat dense size="sm" icon="unfold_more" label="모두 열기" class="option-btn" @click="handleExpandAll">
            <q-tooltip>모든 항목 열기</q-tooltip>
          </q-btn>
          <q-btn flat dense size="sm" icon="unfold_less" label="모두 닫기" class="option-btn" @click="handleCollapseAll">
            <q-tooltip>모든 항목 닫기</q-tooltip>
          </q-btn>
        </div>

        <!-- 설정 버튼 -->
        <q-btn flat dense round size="sm" icon="settings" @click="handleSettings">
          <q-tooltip>설정</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 아코디언 메뉴 -->
    <q-list>
      <!-- 의존성 그래프 -->
      <q-expansion-item v-model="expandedItems.dependencyGraph" icon="account_tree" label="의존성 그래프" header-class="accordion-header" @update:model-value="handleExpansionChange('dependencyGraph', $event)">
        <DependencyGraphHeader :analysis-target="props.dependencyGraphAnalysisTarget" :is-analyzing="props.dependencyGraphIsAnalyzing" @analyze="handleDependencyGraphAnalyze" @analysis-target-change="handleDependencyGraphAnalysisTargetChange" />
        <DependencyGraphList :graph-data="props.dependencyGraphData" :selected-node="props.dependencyGraphSelectedNode" :is-loading="props.dependencyGraphIsLoading" @node-selected="handleDependencyGraphNodeSelected" />
      </q-expansion-item>

      <!-- 의존성 분석 -->
      <q-expansion-item v-model="expandedItems.dependencyAnalysis" icon="hub" label="의존성 분석" header-class="accordion-header" @update:model-value="handleExpansionChange('dependencyAnalysis', $event)">
        <DependencyAnalysisHeader @refresh="handleDependencyAnalysisRefresh" @settings="handleDependencyAnalysisSettings" />
        <DependencyAnalysisList :analysis-results="props.dependencyAnalysisResults" :selected-result="props.dependencyAnalysisSelectedResult" :is-loading="props.dependencyAnalysisIsLoading" @result-selected="handleDependencyAnalysisResultSelected" />
      </q-expansion-item>

      <!-- 파일 구조 -->
      <q-expansion-item v-model="expandedItems.fileStructure" icon="view_module" label="파일 구조" header-class="accordion-header" @update:model-value="handleExpansionChange('fileStructure', $event)">
        <FileStructureHeader @refresh="handleFileStructureRefresh" @settings="handleFileStructureSettings" />
        <FileStructureList :file-structure="props.fileStructureData" :selected-file="props.fileStructureSelectedFile" :is-loading="props.fileStructureIsLoading" @file-selected="handleFileStructureFileSelected" />
      </q-expansion-item>

      <!-- 코드 검색 -->
      <q-expansion-item v-model="expandedItems.codeSearch" icon="search" label="코드 검색" header-class="accordion-header" @update:model-value="handleExpansionChange('codeSearch', $event)">
        <CodeSearchHeader :search-query="props.codeSearchQuery" @search-change="handleCodeSearchChange" @search="handleCodeSearch" @settings="handleCodeSearchSettings" />
        <CodeSearchList :search-results="props.codeSearchResults" :selected-result="props.codeSearchSelectedResult" :is-loading="props.codeSearchIsLoading" @result-selected="handleCodeSearchResultSelected" />
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import DependencyGraphHeader from './DependencyGraphHeader.vue'
import DependencyGraphList from './DependencyGraphList.vue'
import DependencyAnalysisHeader from './DependencyAnalysisHeader.vue'
import DependencyAnalysisList from './DependencyAnalysisList.vue'
import FileStructureHeader from './FileStructureHeader.vue'
import FileStructureList from './FileStructureList.vue'
import CodeSearchHeader from './CodeSearchHeader.vue'
import CodeSearchList from './CodeSearchList.vue'

// 단일 열림 모드 (하나만 열기)
const singleMode = ref(false)

// 아코디언 확장 상태
const expandedItems = ref({
  dependencyGraph: false,
  dependencyAnalysis: false,
  fileStructure: false,
  codeSearch: false,
})

// Props
const props = defineProps({
  // 의존성 그래프
  dependencyGraphAnalysisTarget: {
    type: String,
    default: '',
  },
  dependencyGraphIsAnalyzing: {
    type: Boolean,
    default: false,
  },
  dependencyGraphData: {
    type: Object,
    default: null,
  },
  dependencyGraphSelectedNode: {
    type: Object,
    default: null,
  },
  dependencyGraphIsLoading: {
    type: Boolean,
    default: false,
  },
  // 의존성 분석
  dependencyAnalysisResults: {
    type: Array,
    default: () => [],
  },
  dependencyAnalysisSelectedResult: {
    type: Object,
    default: null,
  },
  dependencyAnalysisIsLoading: {
    type: Boolean,
    default: false,
  },
  // 파일 구조
  fileStructureData: {
    type: Object,
    default: null,
  },
  fileStructureSelectedFile: {
    type: Object,
    default: null,
  },
  fileStructureIsLoading: {
    type: Boolean,
    default: false,
  },
  // 코드 검색
  codeSearchQuery: {
    type: String,
    default: '',
  },
  codeSearchResults: {
    type: Array,
    default: () => [],
  },
  codeSearchSelectedResult: {
    type: Object,
    default: null,
  },
  codeSearchIsLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  // 의존성 그래프
  'dependency-graph-analyze',
  'dependency-graph-analysis-target-change',
  'dependency-graph-node-selected',
  // 의존성 분석
  'dependency-analysis-refresh',
  'dependency-analysis-settings',
  'dependency-analysis-result-selected',
  // 파일 구조
  'file-structure-refresh',
  'file-structure-settings',
  'file-structure-file-selected',
  // 코드 검색
  'code-search-change',
  'code-search',
  'code-search-settings',
  'code-search-result-selected',
  // 아코디언 확장 변경
  'accordion-change',
  // 설정
  'settings',
])

// 단일 열림 모드 토글
function handleSingleModeToggle() {
  singleMode.value = !singleMode.value
  // localStorage에 저장
  try {
    localStorage.setItem('graph-doc-single-mode', String(singleMode.value))
  } catch (error) {
    console.error('[GraphDocSidebar] 단일 모드 설정 저장 실패:', error)
  }
}

// 모든 항목 열기
function handleExpandAll() {
  Object.keys(expandedItems.value).forEach((key) => {
    expandedItems.value[key] = true
  })
}

// 모든 항목 닫기
function handleCollapseAll() {
  Object.keys(expandedItems.value).forEach((key) => {
    expandedItems.value[key] = false
  })
}

// 설정 핸들러
function handleSettings() {
  emit('settings')
}

// 아코디언 확장 변경 핸들러
function handleExpansionChange(item, expanded) {
  expandedItems.value[item] = expanded
  emit('accordion-change', { item, expanded })

  // 단일 열림 모드일 때 다른 항목 자동으로 닫기
  if (singleMode.value && expanded) {
    Object.keys(expandedItems.value).forEach((key) => {
      if (key !== item) {
        expandedItems.value[key] = false
      }
    })
  }
}

// 단일 모드 설정 로드
function loadSingleMode() {
  try {
    const saved = localStorage.getItem('graph-doc-single-mode')
    if (saved !== null) {
      singleMode.value = saved === 'true'
    }
  } catch (error) {
    console.error('[GraphDocSidebar] 단일 모드 설정 로드 실패:', error)
  }
}

// 아코디언 상태 저장
function saveAccordionState() {
  try {
    localStorage.setItem('graph-doc-accordion-state', JSON.stringify(expandedItems.value))
  } catch (error) {
    console.error('[GraphDocSidebar] 아코디언 상태 저장 실패:', error)
  }
}

// 아코디언 상태 복원
function loadAccordionState() {
  try {
    const saved = localStorage.getItem('graph-doc-accordion-state')
    if (saved) {
      const parsed = JSON.parse(saved)
      Object.keys(expandedItems.value).forEach((key) => {
        if (parsed[key] !== undefined) {
          expandedItems.value[key] = parsed[key]
        }
      })
    }
  } catch (error) {
    console.error('[GraphDocSidebar] 아코디언 상태 복원 실패:', error)
  }
}

// 아코디언 상태 변경 감지하여 저장
watch(
  expandedItems,
  () => {
    saveAccordionState()
  },
  { deep: true },
)

// 컴포넌트 마운트 시 설정 로드
onMounted(() => {
  loadSingleMode()
  loadAccordionState()
})

// 의존성 그래프 핸들러
function handleDependencyGraphAnalyze() {
  emit('dependency-graph-analyze')
}

function handleDependencyGraphAnalysisTargetChange(value) {
  emit('dependency-graph-analysis-target-change', value)
}

function handleDependencyGraphNodeSelected(node) {
  emit('dependency-graph-node-selected', node)
}

// 의존성 분석 핸들러
function handleDependencyAnalysisRefresh() {
  emit('dependency-analysis-refresh')
}

function handleDependencyAnalysisSettings() {
  emit('dependency-analysis-settings')
}

function handleDependencyAnalysisResultSelected(result) {
  emit('dependency-analysis-result-selected', result)
}

// 파일 구조 핸들러
function handleFileStructureRefresh() {
  emit('file-structure-refresh')
}

function handleFileStructureSettings() {
  emit('file-structure-settings')
}

function handleFileStructureFileSelected(file) {
  emit('file-structure-file-selected', file)
}

// 코드 검색 핸들러
function handleCodeSearchChange(value) {
  emit('code-search-change', value)
}

function handleCodeSearch() {
  emit('code-search', props.codeSearchQuery)
}

function handleCodeSearchSettings() {
  emit('code-search-settings')
}

function handleCodeSearchResultSelected(result) {
  emit('code-search-result-selected', result)
}
</script>

<style lang="scss" scoped>
.graph-doc-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);

  // Container Query 활성화 (사이드바 너비 기준)
  container-type: inline-size;
  container-name: graph-doc-sidebar;
}

.accordion-options {
  background: var(--nexa-background-darker);
  border-bottom: 1px solid var(--nexa-border-color);
}

.option-btn {
  font-size: 0.75rem;
  color: var(--nexa-text-secondary);
  padding: 4px 8px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    color: var(--nexa-primary);
    background-color: color-mix(in srgb, var(--nexa-primary) 10%, transparent);
  }

  &.option-active {
    background-color: var(--nexa-button-primary-bg);
    color: var(--nexa-button-primary-text);

    :deep(.q-icon) {
      color: var(--nexa-button-primary-text);
    }
  }

  &.option-inactive {
    background-color: var(--nexa-surface);
    color: var(--nexa-text-secondary);

    :deep(.q-icon) {
      color: var(--nexa-text-secondary);
    }
  }

  :deep(.q-btn__content) {
    font-size: 0.75rem;
    padding: 0 4px;
  }

  :deep(.q-icon) {
    font-size: 16px;
    margin-right: 4px;
  }
}

.accordion-header {
  background: var(--nexa-background-darker);
  border-bottom: 1px solid var(--nexa-border-color);
}
</style>

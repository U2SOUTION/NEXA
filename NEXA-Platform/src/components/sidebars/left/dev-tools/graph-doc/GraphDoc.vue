<!-- GraphDoc.vue
  GraphDoc 통합 컴포넌트
  아코디언 구조: 의존성 그래프, 의존성 분석, 파일 구조, 코드 검색
  헤더 + 목록
-->

<template>
  <div class="graph-doc">
    <!-- 전체 헤더 -->
    <GraphDocHeader :single-mode="singleMode" @single-mode-toggle="handleSingleModeToggleFromHeader" @expand-all="handleExpandAll" @collapse-all="handleCollapseAll" @settings="handleSettings" />

    <!-- 아코디언 메뉴 -->
    <q-list>
      <!-- 파일 의존성 그래프 -->
      <q-expansion-item v-model="expandedItems.dependencyGraph" icon="account_tree" label="파일 의존성 그래프" header-class="accordion-header" @update:model-value="handleExpansionChange('dependencyGraph', $event)">
        <FileDependency :analysis-target="props.dependencyGraphAnalysisTarget" :is-analyzing="props.dependencyGraphIsAnalyzing" @analyze="handleDependencyGraphAnalyze" @analysis-target-change="handleDependencyGraphAnalysisTargetChange" />
        <DependencyGraphList :graph-data="props.dependencyGraphData" :selected-node="props.dependencyGraphSelectedNode" :is-loading="props.dependencyGraphIsLoading" @node-selected="handleDependencyGraphNodeSelected" />
      </q-expansion-item>

      <!-- 패키지 의존성 그래프 -->
      <q-expansion-item v-model="expandedItems.dependencyAnalysis" icon="hub" label="패키지 의존성 그래프" header-class="accordion-header" @update:model-value="handleExpansionChange('dependencyAnalysis', $event)">
        <PackageDependency
          :is-analyzing="props.dependencyAnalysisIsLoading"
          @analyze="handleDependencyAnalysisAnalyze"
          @project-root-change="handleDependencyAnalysisProjectRootChange"
          @settings="handleDependencyAnalysisSettings"
        />
        <DependencyAnalysisList :analysis-results="props.dependencyAnalysisResults" :selected-result="props.dependencyAnalysisSelectedResult" :is-loading="props.dependencyAnalysisIsLoading" @result-selected="handleDependencyAnalysisResultSelected" />
      </q-expansion-item>

      <!-- 파일 구조 -->
      <q-expansion-item v-model="expandedItems.fileStructure" icon="view_module" label="파일 구조" header-class="accordion-header" @update:model-value="handleExpansionChange('fileStructure', $event)">
        <FileStructure :analysis-target="fileStructureAnalysisTarget" :is-analyzing="props.fileStructureIsLoading" @analyze="handleFileStructureAnalyze" @analysis-target-change="handleFileStructureAnalysisTargetChange" />
        <FileStructureList :file-structure="props.fileStructureData" :selected-file="props.fileStructureSelectedFile" :is-loading="props.fileStructureIsLoading" @file-selected="handleFileStructureFileSelected" />
      </q-expansion-item>

      <!-- 코드 검색 -->
      <q-expansion-item v-model="expandedItems.codeSearch" icon="search" label="코드 검색" header-class="accordion-header" @update:model-value="handleExpansionChange('codeSearch', $event)">
        <CodeSearch :search-query="props.codeSearchQuery" @search-change="handleCodeSearchChange" @search="handleCodeSearch" @settings="handleCodeSearchSettings" />
        <CodeSearchList :search-results="props.codeSearchResults" :selected-result="props.codeSearchSelectedResult" :is-loading="props.codeSearchIsLoading" @result-selected="handleCodeSearchResultSelected" />
      </q-expansion-item>
    </q-list>

    <!-- 간단한 메뉴 항목 (아코디언 아님) -->
    <q-separator class="q-my-sm" />
    <div class="simple-menu-items q-pa-sm">
      <q-item clickable @click="handleCircularDependencies">
        <q-item-section avatar>
          <q-icon name="sync" color="warning" />
        </q-item-section>
        <q-item-section>
          <q-item-label>순환 의존성 감지</q-item-label>
          <q-item-label caption>순환 참조를 찾아 표시합니다</q-item-label>
        </q-item-section>
      </q-item>

      <q-item clickable @click="handleUnusedFiles">
        <q-item-section avatar>
          <q-icon name="delete_outline" color="negative" />
        </q-item-section>
        <q-item-section>
          <q-item-label>사용되지 않는 파일</q-item-label>
          <q-item-label caption>import되지 않는 파일을 찾습니다</q-item-label>
        </q-item-section>
      </q-item>

      <q-item clickable @click="handleDependencyStats">
        <q-item-section avatar>
          <q-icon name="bar_chart" color="info" />
        </q-item-section>
        <q-item-section>
          <q-item-label>의존성 통계</q-item-label>
          <q-item-label caption>의존성 관계 통계를 보여줍니다</q-item-label>
        </q-item-section>
      </q-item>

      <q-item clickable @click="handleCodeComplexity">
        <q-item-section avatar>
          <q-icon name="trending_up" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>코드 복잡도 분석</q-item-label>
          <q-item-label caption>코드 복잡도를 분석합니다</q-item-label>
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import GraphDocHeader from './GraphDocHeader.vue'
import FileDependency from './FileDependency.vue'
import DependencyGraphList from './DependencyGraphList.vue'
import PackageDependency from './PackageDependency.vue'
import DependencyAnalysisList from './DependencyAnalysisList.vue'
import FileStructure from './FileStructure.vue'
import FileStructureList from './FileStructureList.vue'
import CodeSearch from './CodeSearch.vue'
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
  'dependency-analysis-analyze',
  'dependency-analysis-project-root-change',
  'dependency-analysis-settings',
  'dependency-analysis-result-selected',
  // 파일 구조
  'file-structure-analyze',
  'file-structure-analysis-target-change',
  'file-structure-file-selected',
  // 코드 검색
  'code-search-change',
  'code-search',
  'code-search-settings',
  'code-search-result-selected',
  // 아코디언 확장 변경
  'accordion-change',
  // 간단한 메뉴 항목
  'circular-dependencies',
  'unused-files',
  'dependency-stats',
  'code-complexity',
  // 설정
  'settings',
])

// 헤더에서 전달받은 단일 모드 토글
function handleSingleModeToggleFromHeader(value) {
  singleMode.value = value
  // localStorage에 저장
  try {
    localStorage.setItem('graph-doc-single-mode', String(singleMode.value))
  } catch (error) {
    console.error('[GraphDoc] 단일 모드 설정 저장 실패:', error)
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
    console.error('[GraphDoc] 단일 모드 설정 로드 실패:', error)
  }
}

// 아코디언 상태 저장
function saveAccordionState() {
  try {
    localStorage.setItem('graph-doc-accordion-state', JSON.stringify(expandedItems.value))
  } catch (error) {
    console.error('[GraphDoc] 아코디언 상태 저장 실패:', error)
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
    console.error('[GraphDoc] 아코디언 상태 복원 실패:', error)
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
function handleDependencyGraphAnalyze(target) {
  // 사이드바의 현재 입력값을 전달 (없으면 props에서 가져옴)
  const analysisTarget = target || props.dependencyGraphAnalysisTarget
  emit('dependency-graph-analyze', analysisTarget)
}

function handleDependencyGraphAnalysisTargetChange(value) {
  emit('dependency-graph-analysis-target-change', value)
}

function handleDependencyGraphNodeSelected(node) {
  emit('dependency-graph-node-selected', node)
}

// 의존성 분석 핸들러
function handleDependencyAnalysisAnalyze(projectRoot) {
  emit('dependency-analysis-analyze', projectRoot)
}

function handleDependencyAnalysisProjectRootChange(value) {
  emit('dependency-analysis-project-root-change', value)
}

function handleDependencyAnalysisSettings() {
  emit('dependency-analysis-settings')
}

function handleDependencyAnalysisResultSelected(result) {
  emit('dependency-analysis-result-selected', result)
}

// 파일 구조 분석 대상 (로컬 상태)
const fileStructureAnalysisTarget = ref('')

// 파일 구조 핸들러
function handleFileStructureAnalyze(target) {
  emit('file-structure-analyze', target)
}

function handleFileStructureAnalysisTargetChange(value) {
  fileStructureAnalysisTarget.value = value
  emit('file-structure-analysis-target-change', value)
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

// 간단한 메뉴 항목 핸들러
function handleCircularDependencies() {
  emit('circular-dependencies')
}

function handleUnusedFiles() {
  emit('unused-files')
}

function handleDependencyStats() {
  emit('dependency-stats')
}

function handleCodeComplexity() {
  emit('code-complexity')
}
</script>

<style lang="scss" scoped>
.graph-doc {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);

  // Container Query 활성화 (사이드바 너비 기준)
  container-type: inline-size;
  container-name: graph-doc;
}


.accordion-header {
  background: var(--nexa-background-darker);
  border-bottom: 1px solid var(--nexa-border-color);
}

.simple-menu-items {
  background: var(--nexa-background-darker);
  
  .q-item {
    border-radius: 4px;
    margin-bottom: 4px;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: var(--nexa-surface-hover);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>

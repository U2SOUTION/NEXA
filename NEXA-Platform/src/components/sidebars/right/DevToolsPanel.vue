<!-- DevToolsPanel.vue
  DEV 메뉴 전용 우측 도구 패널
  Mermaid 차트 스타일 편집 등 개발 도구 제공
-->

<template>
  <div class="dev-tools-panel">
    <!-- 공통 헤더 (헤더 + Push/Overlay 토글) -->
    <RightSidebarHeader title="Tools Panel" subtitle="Control & Customize Your Documents" push-icon="menu_open" />
    <q-scroll-area class="fit">
      <!-- 아코디언 방식으로 모든 섹션 나열 -->
      <!-- 목차 섹션 (문서 관리자 메뉴이고 목차가 있을 때만 표시) -->
      <div v-if="activeMenu === 'document-manager' && hasTOCItems" class="accordion-wrapper">
        <q-expansion-item ref="tocExpansionRef" icon="menu" label="목차" :model-value="tocShouldAutoExpand" @update:model-value="onTOCExpansionChange">
          <div class="section-content">
            <PanelTOC
              :items="documentStore.tocItems || []"
              :current-section-id="documentStore.currentSectionId"
              :auto-collapse="tocAutoCollapse"
              :is-all-expanded="documentStore.isAllTOCExpanded"
              :toc-expanded-map="documentStore.tocExpanded"
              @toggle="documentStore.toggleTOCItem"
              @scroll-to="documentStore.scrollToHeading"
              @toggle-all="documentStore.toggleAllTOC"
              @auto-collapse-change="(value) => { documentStore.setAutoCollapse(value) }"
            />
          </div>
        </q-expansion-item>
      </div>

      <!-- Mermaid 스타일 섹션 (문서 관리자 메뉴이고 Mermaid 블록이 있을 때만 표시) -->
      <div v-if="activeMenu === 'document-manager' && hasMermaidBlocks" class="accordion-wrapper">
        <q-expansion-item ref="mermaidStyleExpansionRef" icon="palette" label="Mermaid 차트 스타일" :model-value="shouldAutoExpand" @update:model-value="onExpansionChange">
          <div class="section-content">
            <PanelMermaidStyle :file-path="documentStore.selectedFile?.name || ''" :content="documentStore.displayContent || ''" />
          </div>
        </q-expansion-item>
      </div>

      <!-- 테마 색상 패널 (activeMenu === 'theme-manager') -->
      <div v-if="activeMenu === 'theme-manager'" class="accordion-wrapper">
        <q-expansion-item icon="palette" label="테마 색상" :model-value="themeColorPanelExpanded" @update:model-value="themeColorPanelExpanded = $event">
          <div class="section-content">
            <ThemeColorPanel :selected-color="selectedColor" :usage-count="usageCount" :usage-files="usageFiles" @file-clicked="handleFileClick" />
          </div>
        </q-expansion-item>
      </div>

      <!-- 데이터베이스 테이블 상세 정보 패널 (activeMenu === 'database-viewer') -->
      <div v-if="activeMenu === 'database-viewer'" class="accordion-wrapper">
        <q-expansion-item icon="table_view" label="DB 테이블 상세 정보" :model-value="databaseTableDetailExpanded" @update:model-value="databaseTableDetailExpanded = $event">
          <div class="section-content">
            <DatabaseTableDetailSimple :table-name="selectedTableName" />
          </div>
        </q-expansion-item>
      </div>

      <!-- ERD 다이어그램 설정 패널 (activeMenu === 'database-viewer') -->
      <div v-if="activeMenu === 'database-viewer'" class="accordion-wrapper">
        <q-expansion-item icon="tune" label="ERD 다이어그램 설정" :model-value="erdSettingsExpanded" @update:model-value="erdSettingsExpanded = $event">
          <div class="section-content">
            <ERDDiagramSettingsPanel />
          </div>
        </q-expansion-item>
      </div>

      <!-- 샘플 기능 섹션 (테스트용) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="extension" label="샘플 아코디언">
          <div class="section-content">
            <SampleSection />
          </div>
        </q-expansion-item>
      </div>

      <!-- 향후 추가 가능한 섹션들 -->
      <!--
      <div class="accordion-wrapper">
        <q-expansion-item icon="settings" label="문서 설정">
          <div class="section-content">
            <DocumentSettingsSection />
          </div>
        </q-expansion-item>
      </div>
      -->
    </q-scroll-area>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useDocumentManagerStore } from 'src/stores/documentManagerStore'
import { QExpansionItem, QScrollArea } from 'quasar'
import RightSidebarHeader from './RightSidebarHeader.vue'
import PanelMermaidStyle from 'src/panel/components/PanelMermaidStyle.vue'
import PanelTOC from 'src/panel/components/PanelTOC.vue'
import ThemeColorPanel from './dev-tools/ThemeColorPanel.vue'
import ERDDiagramSettingsPanel from './dev-tools/ERDDiagramSettingsPanel.vue'
import SampleSection from 'src/modules/document-manager/components/sections/SampleSection.vue'
import DatabaseTableDetailSimple from 'src/components/dev-tools/database-viewer/TableDetailSimple.vue'

const documentStore = useDocumentManagerStore()
const mermaidStyleExpansionRef = ref(null)
const tocExpansionRef = ref(null)
const shouldAutoExpand = ref(false)
const tocShouldAutoExpand = ref(false)

// 아코디언 상태를 computed로 감싸서 반응성 보장
const tocAutoCollapse = computed(() => documentStore.tocAutoCollapse)

// Active menu 상태
const activeMenu = ref('document-manager')
console.log('[DevToolsPanel] 초기 activeMenu:', activeMenu.value)

// 테마 색상 패널 상태
const selectedColor = ref(null)
const usageCount = ref(0)
const usageFiles = ref([])
const themeColorPanelExpanded = ref(true)

// 데이터베이스 테이블 상세 정보 패널 상태
const selectedTableName = ref(null)
const databaseTableDetailExpanded = ref(false)

// ERD 다이어그램 설정 패널 상태
const erdSettingsExpanded = ref(false)

// Active menu 변경 이벤트 리스너
function handleActiveMenuChange(event) {
  console.log('[DevToolsPanel] dev-menu-changed 이벤트 수신:', event.detail)
  activeMenu.value = event.detail.activeMenu
  console.log('[DevToolsPanel] activeMenu 업데이트:', activeMenu.value)
  // 테마 관리 메뉴로 변경 시 아코디언 자동으로 열기
  if (activeMenu.value === 'theme-manager') {
    themeColorPanelExpanded.value = true
  }
  // 데이터베이스 뷰어 메뉴로 변경 시 아코디언 닫기 (테이블 선택 시 자동으로 열림)
  if (activeMenu.value === 'database-viewer') {
    databaseTableDetailExpanded.value = false
  }
}

// 데이터베이스 테이블 선택 이벤트 리스너
function handleDatabaseTableSelected(event) {
  console.log('[DevToolsPanel] database-table-selected 이벤트 수신:', event.detail)
  selectedTableName.value = event.detail.tableName
  console.log('[DevToolsPanel] selectedTableName 업데이트:', selectedTableName.value)
  // 테이블이 선택되면 아코디언 자동으로 열기
  if (selectedTableName.value) {
    databaseTableDetailExpanded.value = true
    // 원본 버전은 수동으로 열어야 함 (비교용)
  }
}

// 테마 색상 선택 이벤트 리스너
function handleThemeColorSelected(event) {
  console.log('[DevToolsPanel] theme-color-selected 이벤트 수신:', event.detail)
  selectedColor.value = event.detail.color
  console.log('[DevToolsPanel] selectedColor 업데이트:', selectedColor.value)
  // TODO: usageCount와 usageFiles는 나중에 통계 분석 결과에서 가져오기
  usageCount.value = 0
  usageFiles.value = []
}

// 파일 클릭 핸들러
function handleFileClick(filePath) {
  // TODO: 파일 경로로 이동 구현
  console.log('파일 클릭:', filePath)
}

// Mermaid 블록 존재 여부 확인
const hasMermaidBlocks = computed(() => {
  if (!documentStore.selectedFile) return false
  return (documentStore.displayContent || '').includes('mermaid-block')
})

// 목차 항목 존재 여부 확인
const hasTOCItems = computed(() => {
  return documentStore.tocItems && documentStore.tocItems.length > 0
})

// 전역 이벤트 리스너 등록 (헤더 아이콘 클릭 시 아코디언 펼치기)
function handleExpandMermaidSection() {
  shouldAutoExpand.value = true
  nextTick(() => mermaidStyleExpansionRef.value?.show())
}

function handleExpandTOCSection() {
  tocShouldAutoExpand.value = true
  nextTick(() => tocExpansionRef.value?.show())
}

onMounted(() => {
  // 전역 이벤트 리스너 등록
  window.addEventListener('expand-mermaid-section', handleExpandMermaidSection)
  window.addEventListener('expand-toc-section', handleExpandTOCSection)
  window.addEventListener('dev-menu-changed', handleActiveMenuChange)
  window.addEventListener('theme-color-selected', handleThemeColorSelected)
  window.addEventListener('database-table-selected', handleDatabaseTableSelected)
})

onUnmounted(() => {
  window.removeEventListener('expand-mermaid-section', handleExpandMermaidSection)
  window.removeEventListener('expand-toc-section', handleExpandTOCSection)
  window.removeEventListener('dev-menu-changed', handleActiveMenuChange)
  window.removeEventListener('theme-color-selected', handleThemeColorSelected)
  window.removeEventListener('database-table-selected', handleDatabaseTableSelected)
})

// 아코디언 상태 변경 핸들러
function onExpansionChange(value) {
  shouldAutoExpand.value = value
}

function onTOCExpansionChange(value) {
  tocShouldAutoExpand.value = value
}

// 외부에서 아코디언 펼치기 함수 노출 (선택적)
defineExpose({
  expandMermaidSection: () => {
    shouldAutoExpand.value = true
  },
})
</script>

<style lang="scss" scoped>
// Quasar 기본 동작 존중 - 최소한의 커스터마이징만
// 아코디언 스타일은 전역 스타일(_expansion-item.scss)에 의존
.dev-tools-panel {
  height: 100%;
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden !important;
  box-sizing: border-box !important;

  .q-scroll-area {
    height: calc(100% - 60px - 60px); // 헤더(60px) + Push/Overlay 버튼 영역(60px) 제외
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
  }

  // q-scroll-area 내부 요소들도 제한
  :deep(.q-scroll-area__content) {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
  }

  // 섹션 컨텐츠 패딩 (필요시 조정)
  .section-content {
    box-sizing: border-box;
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important; // 가로 스크롤 방지 (강제)
    overflow-y: visible; // 세로 스크롤은 허용
    // 사이드바 너비를 넘지 않도록 강제
    min-width: 0 !important; // flexbox에서 오버플로우 작동을 위해 필요
  }

  // 아코디언 래퍼와 확장 아이템에 너비 제한
  .accordion-wrapper {
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    min-width: 0 !important;
  }

  // Quasar 확장 아이템의 컨텐츠 영역 제한
  :deep(.q-expansion-item) {
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    min-width: 0 !important;
  }

  :deep(.q-expansion-item__content) {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    overflow-y: visible !important;
    box-sizing: border-box !important;
    min-width: 0 !important;
  }

  // // 아코디언 컨텐츠 영역이 오른쪽을 넘지 않도록
  // :deep(.q-expansion-item__content) {
  //   overflow-x: hidden !important;
  //   overflow-y: visible;
  //   box-sizing: border-box;
  //   width: 100%;
  //   max-width: 100%;
  //   padding: 0 !important; // section-content가 패딩을 담당하므로 제거
  // }
}
</style>

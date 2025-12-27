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
          <PanelTOC
            :items="documentStore.tocItems || []"
            :current-section-id="documentStore.currentSectionId"
            :auto-collapse="tocAutoCollapse"
            :is-all-expanded="documentStore.isAllTOCExpanded"
            :toc-expanded-map="documentStore.tocExpanded"
            @toggle="documentStore.toggleTOCItem"
            @scroll-to="documentStore.scrollToHeading"
            @toggle-all="documentStore.toggleAllTOC"
            @auto-collapse-change="
              (value) => {
                documentStore.setAutoCollapse(value)
              }
            "
          />
        </q-expansion-item>
      </div>

      <!-- Mermaid 스타일 섹션 (문서 관리자 메뉴이고 Mermaid 블록이 있을 때만 표시) -->
      <div v-if="activeMenu === 'document-manager' && hasMermaidBlocks" class="accordion-wrapper">
        <q-expansion-item ref="mermaidStyleExpansionRef" icon="palette" label="Mermaid 차트 스타일" :model-value="shouldAutoExpand" @update:model-value="onExpansionChange">
          <PanelMermaidStyle :file-path="documentStore.selectedFile?.name || ''" :content="documentStore.displayContent || ''" />
        </q-expansion-item>
      </div>

      <!-- 테마 색상 패널 (activeMenu === 'theme-manager') -->
      <div v-if="activeMenu === 'theme-manager'" class="accordion-wrapper">
        <q-expansion-item icon="palette" label="테마 색상" :model-value="themeColorPanelExpanded" @update:model-value="themeColorPanelExpanded = $event">
          <ThemeColorPanel :selected-color="selectedColor" :usage-count="usageCount" :usage-files="usageFiles" @file-clicked="handleFileClick" />
        </q-expansion-item>
      </div>

      <!-- 데이터베이스 테이블 상세 정보 패널 (activeMenu === 'database-viewer') -->
      <div v-if="activeMenu === 'database-viewer'" class="accordion-wrapper">
        <q-expansion-item icon="table_view" label="DB 테이블 상세 정보" :model-value="databaseTableDetailExpanded" @update:model-value="databaseTableDetailExpanded = $event">
          <DatabaseTableDetailSimple :table-name="selectedTableName" />
        </q-expansion-item>
      </div>

      <!-- ERD 다이어그램 설정 패널 (activeMenu === 'database-viewer') -->
      <div v-if="activeMenu === 'database-viewer'" class="accordion-wrapper">
        <q-expansion-item icon="tune" label="ERD 다이어그램 설정" :model-value="erdSettingsExpanded" @update:model-value="erdSettingsExpanded = $event">
          <ERDDiagramSettingsPanel />
        </q-expansion-item>
      </div>

      <!-- 컴포넌트 라이브러리 패널들 (activeMenu === 'component-library') -->
      <template v-if="activeMenu === 'component-library'">
        <!-- 규칙 위반 경고 -->
        <div v-if="componentLibrarySelectedComponent || componentLibrarySelectedViolation" class="accordion-wrapper">
          <q-expansion-item icon="warning" label="규칙 위반 경고" :model-value="componentLibraryWarningExpanded" @update:model-value="componentLibraryWarningExpanded = $event">
            <ComponentLibraryWarning :selected-component="componentLibrarySelectedComponent" :selected-violation="componentLibrarySelectedViolation" />
          </q-expansion-item>
        </div>

        <!-- 이동 관리 -->
        <div v-if="componentLibrarySelectedComponent" class="accordion-wrapper">
          <q-expansion-item icon="drive_file_move" label="이동 관리" :model-value="componentLibraryMoveExpanded" @update:model-value="componentLibraryMoveExpanded = $event">
            <ComponentLibraryMoveManagement :selected-component="componentLibrarySelectedComponent" @open-file="handleComponentLibraryOpenFile" @show-move-dialog="handleComponentLibraryShowMoveDialog" />
          </q-expansion-item>
        </div>

        <!-- 구조 개선 제안 -->
        <div class="accordion-wrapper">
          <q-expansion-item icon="merge_type" label="구조 개선 제안" :model-value="componentLibraryMergeSplitExpanded" @update:model-value="componentLibraryMergeSplitExpanded = $event">
            <ComponentLibraryMergeSplit @show-suggestions="handleComponentLibraryShowSuggestions" />
          </q-expansion-item>
        </div>

        <!-- 컴포넌트 인터페이스 -->
        <div v-if="componentLibrarySelectedComponent" class="accordion-wrapper">
          <q-expansion-item icon="settings_input_component" label="컴포넌트 인터페이스" :model-value="componentLibraryInterfaceExpanded" @update:model-value="componentLibraryInterfaceExpanded = $event">
            <ComponentLibraryInterface :selected-component="componentLibrarySelectedComponent" />
          </q-expansion-item>
        </div>

        <!-- 빠른 액션 -->
        <div class="accordion-wrapper">
          <q-expansion-item icon="flash_on" label="빠른 액션" :model-value="componentLibraryQuickActionsExpanded" @update:model-value="componentLibraryQuickActionsExpanded = $event">
            <ComponentLibraryQuickActions :selected-component="componentLibrarySelectedComponent" :is-scanning="componentLibraryIsScanning" @copy-path="handleComponentLibraryCopyPath" @scan-and-validate="handleComponentLibraryScanAndValidate" @show-rule-settings="handleComponentLibraryShowRuleSettings" @show-file-structure="handleComponentLibraryShowFileStructure" />
          </q-expansion-item>
        </div>

        <!-- 관련 문서 -->
        <div class="accordion-wrapper">
          <q-expansion-item icon="description" label="관련 문서" :model-value="componentLibraryRelatedDocsExpanded" @update:model-value="componentLibraryRelatedDocsExpanded = $event">
            <ComponentLibraryRelatedDocs @open-document="handleComponentLibraryOpenDocument" />
          </q-expansion-item>
        </div>
      </template>

      <!-- 개발 가이드 패널 (activeMenu === 'dev-guide') -->
      <div v-if="activeMenu === 'dev-guide'" class="accordion-wrapper">
        <q-expansion-item icon="style" label="개발 가이드" :model-value="devGuidePanelExpanded" @update:model-value="devGuidePanelExpanded = $event">
          <DevGuidePanel />
        </q-expansion-item>
      </div>

      <!-- 에러 트래킹 패널들 (activeMenu === 'error-tracking') -->
      <template v-if="activeMenu === 'error-tracking'">
        <!-- 에러 설정 패널 -->
        <div class="accordion-wrapper">
          <q-expansion-item icon="settings" label="에러 설정" :model-value="errorTrackingSettingsExpanded" @update:model-value="errorTrackingSettingsExpanded = $event">
            <div class="q-pa-md">
              <div class="text-body2 q-mb-sm text-weight-medium">에러 수집 설정</div>
              <ul class="text-body2 text-grey-7 q-pl-md q-mb-md">
                <li>에러 수집 활성화/비활성화</li>
                <li>수집할 에러 레벨 선택</li>
                <li>최대 저장 에러 수 (메모리 관리)</li>
                <li>자동 정리 기간 설정</li>
              </ul>

              <div class="text-body2 q-mb-sm text-weight-medium">알림 설정</div>
              <ul class="text-body2 text-grey-7 q-pl-md q-mb-md">
                <li>에러 발생 시 알림 표시 여부</li>
                <li>중요 에러만 알림</li>
                <li>알림 사운드 설정</li>
              </ul>

              <div class="text-body2 q-mb-sm text-weight-medium">저장 설정</div>
              <ul class="text-body2 text-grey-7 q-pl-md q-mb-md">
                <li>localStorage 사용 여부</li>
                <li>IndexedDB 사용 여부 (대용량)</li>
                <li>자동 내보내기 설정</li>
              </ul>

              <div class="text-body2 q-mb-sm text-weight-medium">필터 기본값 설정</div>
              <ul class="text-body2 text-grey-7 q-pl-md">
                <li>기본 시간 범위</li>
                <li>기본 정렬 옵션</li>
              </ul>
            </div>
          </q-expansion-item>
        </div>

        <!-- 에러 액션 패널 -->
        <div class="accordion-wrapper">
          <q-expansion-item icon="flash_on" label="에러 액션" :model-value="errorTrackingActionsExpanded" @update:model-value="errorTrackingActionsExpanded = $event">
            <div class="q-pa-md">
              <div class="text-body2 q-mb-sm text-weight-medium">일괄 작업</div>
              <ul class="text-body2 text-grey-7 q-pl-md q-mb-md">
                <li>모든 에러 해결 표시</li>
                <li>모든 에러 무시</li>
                <li>오래된 에러 삭제 (30일 이상)</li>
              </ul>

              <div class="text-body2 q-mb-sm text-weight-medium">내보내기/가져오기</div>
              <ul class="text-body2 text-grey-7 q-pl-md q-mb-md">
                <li>선택한 에러 내보내기 (JSON)</li>
                <li>모든 에러 내보내기 (CSV)</li>
                <li>에러 데이터 가져오기</li>
              </ul>

              <div class="text-body2 q-mb-sm text-weight-medium">데이터 관리</div>
              <ul class="text-body2 text-grey-7 q-pl-md">
                <li>에러 데이터 초기화</li>
                <li>통계 데이터 초기화</li>
                <li>저장소 사용량 확인</li>
              </ul>
            </div>
          </q-expansion-item>
        </div>

        <!-- 에러 분석 패널 -->
        <div class="accordion-wrapper">
          <q-expansion-item icon="analytics" label="에러 분석" :model-value="errorTrackingAnalysisExpanded" @update:model-value="errorTrackingAnalysisExpanded = $event">
            <div class="q-pa-md">
              <div class="text-body2 q-mb-sm text-weight-medium">에러 발생 위치 히트맵</div>
              <ul class="text-body2 text-grey-7 q-pl-md q-mb-md">
                <li>파일별 에러 발생 빈도 시각화</li>
                <li>컴포넌트별 에러 발생 빈도</li>
              </ul>

              <div class="text-body2 q-mb-sm text-weight-medium">에러 의존성 다이어그램</div>
              <ul class="text-body2 text-grey-7 q-pl-md q-mb-md">
                <li>에러 간 연관성 시각화</li>
                <li>에러 체인 다이어그램</li>
                <li>원인-결과 관계 표시</li>
              </ul>

              <div class="text-body2 q-mb-sm text-weight-medium">패턴 분석</div>
              <ul class="text-body2 text-grey-7 q-pl-md">
                <li>반복 발생하는 에러 패턴</li>
                <li>시간대별 에러 패턴</li>
                <li>사용자 액션별 에러 패턴</li>
              </ul>
            </div>
          </q-expansion-item>
        </div>
      </template>

      <!-- 샘플 기능 섹션 (테스트용) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="extension" label="샘플 아코디언">
          <SampleSection />
        </q-expansion-item>
      </div>

      <!-- 향후 추가 가능한 섹션들 -->
      <!--
      <div class="accordion-wrapper">
        <q-expansion-item icon="settings" label="문서 설정">
          <DocumentSettingsSection />
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
import ComponentLibraryWarning from './dev-tools/component-library/ComponentLibraryWarning.vue'
import ComponentLibraryMoveManagement from './dev-tools/component-library/ComponentLibraryMoveManagement.vue'
import ComponentLibraryMergeSplit from './dev-tools/component-library/ComponentLibraryMergeSplit.vue'
import ComponentLibraryInterface from './dev-tools/component-library/ComponentLibraryInterface.vue'
import ComponentLibraryQuickActions from './dev-tools/component-library/ComponentLibraryQuickActions.vue'
import ComponentLibraryRelatedDocs from './dev-tools/component-library/ComponentLibraryRelatedDocs.vue'
import DevGuidePanel from './dev-tools/DevGuidePanel.vue'

const documentStore = useDocumentManagerStore()
const mermaidStyleExpansionRef = ref(null)
const tocExpansionRef = ref(null)
const shouldAutoExpand = ref(false)
const tocShouldAutoExpand = ref(false)

// 아코디언 상태를 computed로 감싸서 반응성 보장
const tocAutoCollapse = computed(() => documentStore.tocAutoCollapse)

// 초기 activeMenu 로드 함수 (DevelopmentPage와 동일한 로직)
function getInitialActiveMenu() {
  try {
    // 이전 메뉴 복원 옵션 확인
    const restoreOption = localStorage.getItem('dev-restore-last-menu')
    const shouldRestore = restoreOption === null || restoreOption === 'true' // 기본값: true

    if (shouldRestore) {
      const saved = localStorage.getItem('dev-active-menu')
      if (saved) {
        // 유효한 메뉴 ID인지 확인
        const validMenus = [
          'document-manager',
          'theme-manager',
          'dev-guide',
          'component-library',
          'database-viewer',
          'api-tester',
          'log-viewer',
          'performance-monitor',
          'error-tracking',
          'settings-manager',
          'test-runner',
          'build-tools',
          'network-monitor',
          'environment-variables',
          'package-manager',
          'document-generator',
          'deployment-manager',
        ]
        if (validMenus.includes(saved)) {
          return saved
        }
      }
    }
  } catch (error) {
    console.error('[DevToolsPanel] 초기 메뉴 로드 실패:', error)
  }
  return null
}

// Active menu 상태 (DevelopmentPage와 동기화)
const activeMenu = ref(getInitialActiveMenu())

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

// 컴포넌트 라이브러리 패널 상태
const componentLibrarySelectedComponent = ref(null)
const componentLibrarySelectedViolation = ref(null)
const componentLibraryIsScanning = ref(false)
const componentLibraryWarningExpanded = ref(false)
const componentLibraryMoveExpanded = ref(false)
const componentLibraryMergeSplitExpanded = ref(false)
const componentLibraryInterfaceExpanded = ref(false)
const componentLibraryQuickActionsExpanded = ref(false)
const componentLibraryRelatedDocsExpanded = ref(false)

// 에러 트래킹 패널 상태
const errorTrackingSettingsExpanded = ref(false)
const errorTrackingActionsExpanded = ref(false)
const errorTrackingAnalysisExpanded = ref(false)

// 개발 가이드 패널 상태
const devGuidePanelExpanded = ref(true)

// Active menu 변경 이벤트 리스너
function handleActiveMenuChange(event) {
  const menuId = event.detail.activeMenu
  // null 포함하여 항상 동기화 (메인 페이지로 리셋 시에도 처리)
  activeMenu.value = menuId
  // 테마 관리 메뉴로 변경 시 아코디언 자동으로 열기
  if (menuId === 'theme-manager') {
    themeColorPanelExpanded.value = true
  }
  // 데이터베이스 뷰어 메뉴로 변경 시 아코디언 닫기 (테이블 선택 시 자동으로 열림)
  if (activeMenu.value === 'database-viewer') {
    databaseTableDetailExpanded.value = false
  }
  // 컴포넌트 라이브러리 메뉴로 변경 시 상태 초기화
  if (activeMenu.value === 'component-library') {
    componentLibrarySelectedComponent.value = null
    componentLibrarySelectedViolation.value = null
    componentLibraryWarningExpanded.value = false
    componentLibraryMoveExpanded.value = false
  }
  // 에러 트래킹 메뉴로 변경 시 상태 초기화
  if (activeMenu.value === 'error-tracking') {
    errorTrackingSettingsExpanded.value = false
    errorTrackingActionsExpanded.value = false
    errorTrackingAnalysisExpanded.value = false
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

// 컴포넌트 라이브러리 이벤트 핸들러
function handleComponentLibraryComponentSelected(event) {
  console.log('[DevToolsPanel] component-library-component-selected 이벤트 수신:', event.detail)
  componentLibrarySelectedComponent.value = event.detail.component
  componentLibrarySelectedViolation.value = null
  // 컴포넌트 선택 시 관련 아코디언 자동으로 열기
  if (componentLibrarySelectedComponent.value) {
    componentLibraryWarningExpanded.value = true
    componentLibraryMoveExpanded.value = true
  }
}

function handleComponentLibraryViolationSelected(event) {
  console.log('[DevToolsPanel] component-library-violation-selected 이벤트 수신:', event.detail)
  componentLibrarySelectedViolation.value = event.detail.violation
  componentLibrarySelectedComponent.value = null
  // 위반 항목 선택 시 경고 아코디언 자동으로 열기
  if (componentLibrarySelectedViolation.value) {
    componentLibraryWarningExpanded.value = true
  }
}

function handleComponentLibraryOpenFile(path) {
  console.log('[DevToolsPanel] 파일 열기:', path)
  // TODO: 파일 열기 구현
}

function handleComponentLibraryShowMoveDialog() {
  console.log('[DevToolsPanel] 이동 다이얼로그 표시')
  // TODO: 이동 다이얼로그 구현
}

function handleComponentLibraryShowSuggestions() {
  console.log('[DevToolsPanel] 제안 보기')
  // TODO: 제안 보기 구현
}

function handleComponentLibraryCopyPath() {
  console.log('[DevToolsPanel] 경로 복사')
  // TODO: 경로 복사 구현
}

function handleComponentLibraryScanAndValidate() {
  console.log('[DevToolsPanel] 전체 재검사')
  componentLibraryIsScanning.value = true
  // TODO: 실제 스캔 로직 구현
  setTimeout(() => {
    componentLibraryIsScanning.value = false
  }, 1000)
}

function handleComponentLibraryShowRuleSettings() {
  console.log('[DevToolsPanel] 규칙 설정 표시')
  // TODO: 규칙 설정 다이얼로그 구현
}

function handleComponentLibraryShowFileStructure() {
  console.log('[DevToolsPanel] 파일 구조 표시')
  // TODO: 파일 구조 표시 구현
}

function handleComponentLibraryOpenDocument(docType) {
  console.log('[DevToolsPanel] 문서 열기:', docType)
  // TODO: 문서 열기 구현
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
  window.addEventListener('component-library-component-selected', handleComponentLibraryComponentSelected)
  window.addEventListener('component-library-violation-selected', handleComponentLibraryViolationSelected)
})

onUnmounted(() => {
  window.removeEventListener('expand-mermaid-section', handleExpandMermaidSection)
  window.removeEventListener('expand-toc-section', handleExpandTOCSection)
  window.removeEventListener('dev-menu-changed', handleActiveMenuChange)
  window.removeEventListener('theme-color-selected', handleThemeColorSelected)
  window.removeEventListener('database-table-selected', handleDatabaseTableSelected)
  window.removeEventListener('component-library-component-selected', handleComponentLibraryComponentSelected)
  window.removeEventListener('component-library-violation-selected', handleComponentLibraryViolationSelected)
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
// 절대 여기서 아코디언 내부 스타일을 수정하지 말 것
.dev-tools-panel {
  height: 100%;
  width: 100%;
  max-width: 100%;
  overflow-x: visible; // 보더가 잘리지 않도록 visible로 변경
  overflow-y: hidden; // 세로 스크롤은 q-scroll-area가 처리
  box-sizing: border-box;

  .q-scroll-area {
    height: calc(100% - 60px - 60px); // 헤더(60px) + Push/Overlay 버튼 영역(60px) 제외
    width: 100%;
    max-width: 100%;
    overflow-x: visible; // 보더가 잘리지 않도록 visible로 변경
    overflow-y: auto; // 세로 스크롤은 유지
    box-sizing: border-box;
  }
}
</style>

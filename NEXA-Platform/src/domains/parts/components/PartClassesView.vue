<!-- PartClassesView.vue
  부품 분류 관리 화면
-->
<template>
  <div class="part-classes-view" @contextmenu.prevent="handleContextMenu">
    <div class="q-pa-md">
      <!-- 타이틀 -->
      <div class="text-h3 q-mb-md" style="text-transform: uppercase; font-weight: 900; color: var(--nexa-text-primary); opacity: 0.6; margin-top: 10px">PART CLASSES MANAGEMENT</div>

      <!-- 필터 바 (범용 컴포넌트) -->
      <TableFilterBar
        ref="filterBarRef"
        v-model:search-text="searchText"
        :search-placeholder="'검색...'"
        :filters="filterBarFilters"
        :selected-count="selectedCount"
        :filtered-count="filteredClasses.length"
        :has-active-filter="hasActiveFilter"
        :presets-storage-key="'NEXA-part-classes-filter-presets'"
        :current-filter-state="currentFilterState"
        :autocomplete-data="partClasses"
        :autocomplete-fields="['name', 'c_code', 'description', 'category']"
        :search-field-labels="{
          name: '이름',
          c_code: '코드',
          description: '설명',
          category: '카테고리',
        }"
        :history-storage-key="'NEXA-part-classes-search-history'"
        :search-fields-storage-key="'NEXA-part-classes-search-fields'"
        :max-history-items="10"
        :max-autocomplete-items="5"
        @update:filter="handleFilterUpdate"
        @update:search-fields="handleSearchFieldsUpdate"
        @load-preset="handleLoadPreset"
        @save-preset="handleSavePreset"
        @remove-preset="handleRemovePreset"
      >
        <template #actions>
          <PartClassesActionsBar
            :current-view-mode="currentViewMode"
            :selected-row-id="selectedRowId"
            :selected-count="selectedCount"
            :has-active-filter="hasActiveFilter"
            :work-action-menu-items="workActionMenuItems"
            :add-menu-items="addMenuItems"
            :menu-background-color="menuBackgroundColor"
            :disabled-menu-item-color="disabledMenuItemColor"
            :activate-status-menu-label="activateStatusMenuLabel"
            :favorite-menu-item-label="favoriteMenuItemLabel"
            :print-menu-label="printMenuLabel"
            :export-menu-label="exportMenuLabel"
            @view-mode-change="handleViewModeChange"
            @open-settings="openViewModeSettings"
            @insert-above="handleInsertAbove"
            @insert-below="handleInsertBelow"
            @edit="editSelectedClass"
            @delete="deleteSelectedClass"
            @reorder="openReorderDialog"
            @duplicate="duplicateSelectedClass"
            @toggle-activate="toggleActivateStatus"
            @toggle-favorite="toggleFavorite"
            @view-detail="openDetailModal"
            @view-history="openHistoryDialog"
            @view-related="openRelatedPartsDialog"
            @share="openShareUrlDialog"
            @print="openPrintModal"
            @export="exportData"
            @work-action-click="handleWorkActionClick"
            @add-menu-item-click="handleAddMenuItemClick"
          />
        </template>
      </TableFilterBar>

      <!-- 데이터 테이블 -->
      <div ref="tableWrapperRef" class="parts-table-wrapper" tabindex="-1" @mouseleave="onTableMouseLeave" :style="{ boxShadow: 'none', outline: 'none' }">
        <!-- 빈 상태: 데이터 없음 (우선순위 1 - 실제 데이터가 없을 때) -->
        <TableEmptyState :visible="!!(!loading && partClasses.length === 0 && !searchText && !selectedCategory && !statusFilter)" icon="category" title="데이터가 없습니다" message='MySQL Workbench에서 데이터를 입력하거나 "추가" 버튼을 클릭하세요.'>
          <template #actions>
            <q-btn flat dense color="primary" label="데이터 새로고침" icon="refresh" @click="loadData" class="q-mt-sm" />
          </template>
        </TableEmptyState>

        <!-- 빈 상태: 검색 + 필터 결과 없음 (우선순위 2) -->
        <TableEmptyState :visible="!!(!loading && filteredClasses.length === 0 && searchText && selectedCategory)" icon="search_off" title="검색 및 필터 결과가 없습니다" :message="`&quot;${searchText}&quot; 검색어와 &quot;${selectedCategory}&quot; 필터 조건에 맞는 데이터가 없습니다.`">
          <template #actions>
            <div class="q-gutter-sm q-mt-md">
              <q-btn flat dense color="primary" label="검색 초기화" icon="search_off" @click="clearSearch" />
              <q-btn flat dense color="primary" label="필터 초기화" icon="filter_alt_off" @click="clearFilter" />
              <q-btn flat dense color="primary" label="전체 초기화" icon="refresh" @click="clearAllFilters" />
            </div>
          </template>
        </TableEmptyState>

        <!-- 빈 상태: 검색 결과 없음 (우선순위 3) -->
        <TableEmptyState :visible="!!(!loading && filteredClasses.length === 0 && searchText && !selectedCategory)" icon="search_off" title="검색 결과가 없습니다" :message="`&quot;${searchText}&quot;에 대한 검색 결과를 찾을 수 없습니다.`">
          <template #actions>
            <q-btn flat dense color="primary" label="검색 초기화" icon="refresh" @click="clearSearch" class="q-mt-sm" />
          </template>
        </TableEmptyState>

        <!-- 빈 상태: 공유 URL 모드에서 선택된 항목이 없을 때 (우선순위 4) -->
        <TableEmptyState :visible="!!(!loading && filteredClasses.length === 0 && isSelectedItemsOnlyMode && !searchText && !selectedCategory && !statusFilter)" icon="link_off" title="공유된 항목을 찾을 수 없습니다" message="공유 URL에 포함된 항목이 삭제되었거나 더 이상 존재하지 않습니다.">
          <template #actions>
            <q-btn flat dense color="primary" label="전체 목록 보기" icon="list" @click="clearSharedUrlFilter" class="q-mt-sm" />
          </template>
        </TableEmptyState>

        <!-- 빈 상태: 필터 결과 없음 (우선순위 5) -->
        <TableEmptyState
          :visible="!!(!loading && filteredClasses.length === 0 && !searchText && !!(selectedCategory || statusFilter))"
          icon="filter_alt_off"
          title="필터 조건에 맞는 데이터가 없습니다"
          :message="`&quot;${selectedCategory || statusFilter}&quot; 필터 조건에 해당하는 데이터가 없습니다.`"
        >
          <template #actions>
            <q-btn flat dense color="primary" label="필터 초기화" icon="refresh" @click="clearFilter" class="q-mt-sm" />
          </template>
        </TableEmptyState>

        <!-- 카드 뷰 (DataCardRenderer 사용) -->
        <DataCardRenderer
          ref="cardViewRef"
          v-if="currentViewMode === 'card' && (loading || filteredClasses.length > 0)"
          :rows="filteredClasses"
          :row-key="'id'"
          :loading="loading"
          :settings="cardViewSettings"
          :field-mapping="fieldMapping"
          :available-fields="columns"
          :selected-rows="selectedRows"
          :long-pressing-row-id="longPressingRowId"
          :selected-row-id="selectedRowId"
          v-model:pagination="pagination"
          :rows-per-page-options="cardViewSettings.rowsPerPageOptions || [10, 25, 50, 100]"
          :features="cardFeatures"
          @update:selectedRows="handleCardViewSelectedRowsUpdate"
          @row-click="handleCardRowClick"
          @row-double-click="handleCardRowDoubleClick"
          @row-context-menu="handleRowContextMenu"
          @row-mouse-down="handleRowMouseDown"
          @row-mouse-up="handleRowMouseUp"
          @row-mouse-enter="onRowMouseEnter"
          @row-mouse-move="onRowMouseMove"
          @row-mouse-leave="onRowMouseLeave"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
          @drag-over="handleDragOver"
          @drag-enter="handleDragEnter"
          @drag-leave="handleDragLeave"
          @drag-drop="handleDragDrop"
          @calculation-complete="handleCalculationComplete"
        />

        <!-- 리스트 뷰 (DataListRenderer 사용) -->
        <DataListRenderer
          ref="listViewRef"
          v-if="currentViewMode === 'list' && (loading || filteredClasses.length > 0)"
          :rows="filteredClasses"
          :row-key="'id'"
          :loading="loading"
          :settings="listViewSettings"
          :field-mapping="fieldMapping"
          :available-fields="columns"
          :selected-rows="selectedRows"
          :long-pressing-row-id="longPressingRowId"
          :selected-row-id="selectedRowId"
          v-model:pagination="pagination"
          :rows-per-page-options="listViewSettings.rowsPerPageOptions || [10, 25, 50, 100]"
          :features="listFeatures"
          @update:selectedRows="handleListViewSelectedRowsUpdate"
          @row-click="handleListRowClick"
          @row-double-click="handleListRowDoubleClick"
          @row-context-menu="handleRowContextMenu"
          @row-mouse-down="handleRowMouseDown"
          @row-mouse-up="handleRowMouseUp"
          @row-mouse-enter="onRowMouseEnter"
          @row-mouse-move="onRowMouseMove"
          @row-mouse-leave="onRowMouseLeave"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
          @drag-over="handleDragOver"
          @drag-enter="handleDragEnter"
          @drag-leave="handleDragLeave"
          @drag-drop="handleDragDrop"
          @calculation-complete="handleCalculationComplete"
        />

        <!-- 테이블 뷰 (DataTableRenderer 사용) -->
        <DataTableRenderer
          v-if="currentViewMode === 'table' && (loading || filteredClasses.length > 0)"
          :rows="filteredClasses"
          :columns="columns"
          :row-key="'id'"
          :loading="loading"
          v-model:pagination="pagination"
          v-model:selectedRows="selectedRows"
          :field-mapping="fieldMapping"
          :features="tableFeatures"
          :view-settings="tableViewSettings"
          :row-class="getRowClass"
          :external-table-wrapper-ref="tableWrapperRef"
          :long-pressing-row-id="longPressingRowId"
          @row-click="handleTableRowClick"
          @row-context-menu="handleRowContextMenu"
          @row-mouse-down="handleRowMouseDown"
          @row-mouse-up="handleRowMouseUp"
          @row-mouse-enter="onRowMouseEnter"
          @row-mouse-move="onRowMouseMove"
          @row-mouse-leave="onRowMouseLeave"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
          @drag-over="handleDragOver"
          @drag-enter="handleDragEnter"
          @drag-leave="handleDragLeave"
          @drag-drop="handleDragDrop"
          @calculation-complete="handleCalculationComplete"
        >
          <!-- 커스텀 헤더: id 컬럼만 'No.'로 표시 -->
          <template #header="{ props, getColumnClass }">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" :class="getColumnClass(col)" :style="col.headerStyle || col.style">
                <template v-if="col.name === 'id'">No.</template>
                <template v-else>{{ col.label }}</template>
              </q-th>
            </q-tr>
          </template>

          <!-- 커스텀 페이징 레이아웃 -->
          <template #bottom="{ total, tableWrapperRef: wrapperRef }">
            <DataPageNavigation ref="paginationTableRef" v-model="pagination" :total="total" :table-wrapper-ref="wrapperRef" :rows-per-page-options="tableViewSettings.rowsPerPageOptions || [10, 25, 50, 100]" :auto-calculate-rows="true" @calculation-complete="handleCalculationComplete" />
          </template>

          <!-- 특화 슬롯: body-cell-id -->
          <template #body-cell-id="{ props }">
            {{ getRowNumber(props.rowIndex) }}
          </template>

          <!-- 특화 슬롯: body-cell-name -->
          <template #body-cell-name="{ props, col }">
            <div class="row items-center q-gutter-xs">
              <q-icon v-if="props.row.is_favorite === 1 || props.row.is_favorite === true" name="star" size="16px" color="warning" class="favorite-icon" />
              <span>{{ col.value }}</span>
            </div>
          </template>

          <!-- 특화 슬롯: body-cell-code_name -->
          <template #body-cell-code_name="{ col }">
            <span class="text-grey-6">{{ col.value }}</span>
          </template>

          <!-- 특화 슬롯: body-cell-example -->
          <template #body-cell-example="{ col }">
            <div class="text-caption text-grey-6" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis">
              {{ col.value }}
            </div>
          </template>

          <!-- 특화 슬롯: body-cell-description -->
          <template #body-cell-description="{ col }">
            <div class="text-caption text-grey-7" style="max-width: 300px; overflow: hidden; text-overflow: ellipsis">
              {{ col.value }}
            </div>
          </template>

          <!-- 특화 슬롯: body-cell-created_at, updated_at -->
          <template #body-cell-created_at="{ col }">
            <div class="text-caption text-grey-6">
              {{ col.value ? formatDateTime(col.value) : '-' }}
            </div>
          </template>
          <template #body-cell-updated_at="{ col }">
            <div class="text-caption text-grey-6">
              {{ col.value ? formatDateTime(col.value) : '-' }}
            </div>
          </template>

          <!-- 특화 슬롯: body-cell-sort_order, sub_sort_order -->
          <template #body-cell-sort_order="{ col }">
            <div :style="{ fontWeight: 'bold', fontSize: '14px' }">
              {{ col.value ?? '-' }}
            </div>
          </template>
          <template #body-cell-sub_sort_order="{ col }">
            <div :style="{ fontWeight: 'bold', fontSize: '14px' }">
              {{ col.value ?? '-' }}
            </div>
          </template>
        </DataTableRenderer>

        <!-- 차트 뷰 (DataChartRenderer 사용) -->
        <DataChartRenderer
          v-if="currentViewMode === 'chart' && (loading || filteredClasses.length > 0)"
          :rows="filteredClasses"
          :columns="columns"
          :row-key="'id'"
          :loading="loading"
          :view-settings="chartViewSettings"
          :show-chart-type-selector="true"
          @chart-type-change="handleChartTypeChange"
          @data-click="handleChartDataClick"
          @data-hover="handleChartDataHover"
          @settings-change="handleChartSettingsChange"
        />
      </div>

      <!-- 컨텍스트 메뉴 -->
      <ContextMenu :visible="contextMenuVisible" :position="contextMenuPosition" :items="contextMenuItems" @item-click="handleMenuItemClick" @update:visible="handleContextMenuVisibilityChange" />

      <!-- 작업 아이콘 오버레이 (범용 컴포넌트) -->
      <TableActionsOverlay
        ref="actionsOverlayRef"
        :visible="!!(hoveredRowId || selectedCount > 0)"
        :hovered-row-id="hoveredRowId"
        :selected-count="selectedCount"
        :position="actionsOverlayStyle"
        @edit="editHoveredClass"
        @delete="deleteHoveredClass"
        @insert-below="insertBelowHoveredClass"
        @mouseenter="onActionsOverlayEnter"
        @mouseleave="onActionsOverlayLeave"
      />
    </div>

    <!-- 추가/수정 모달 -->
    <AddEditPartClassModal v-model="showAddDialog" :editing-item="editingClass" :part-classes="partClasses" :insert-mode="insertMode" :insert-target-item="insertTargetItem" @saved="handleAddEditSaved" @cancel="handleAddEditCancel" />

    <!-- 삭제 확인 모달 -->
    <DeleteModal v-model="showDeleteDialog" :targets="deleteTargets" :is-deleting="isDeleting" :is-delete-completed="isDeleteCompleted" :deleted-items="deletedItems" @confirm="confirmDelete" @close="closeDeleteDialog" @restore="restoreDeletedItems" />

    <!-- 활성화/비활성화 확인 모달 -->
    <ActivateStatusModal v-model="showActivateStatusDialog" :targets="activateStatusTargets" :type="activateStatusType" :is-processing="isTogglingStatus" @confirm="confirmToggleActivateStatus" @close="closeActivateStatusDialog" />

    <!-- 즐겨찾기 확인 모달 -->
    <FavoriteModal v-model="showFavoriteDialog" :targets="favoriteTargets" :type="favoriteType" :is-processing="isTogglingFavorite" @confirm="confirmToggleFavorite" @close="closeFavoriteDialog" />

    <!-- 변경 이력 모달 -->
    <HistoryModal v-model="showHistoryDialog" :target="historyTarget" @close="closeHistoryDialog" />

    <!-- 관련 부품 보기 모달 -->
    <RelatedPartsModal v-model="showRelatedPartsDialog" :target="relatedPartsTarget" @close="closeRelatedPartsDialog" />

    <!-- 순서 변경 모달 -->
    <ReorderModal
      v-model="showReorderDialog"
      :targets="reorderTargets"
      :has-active-filter="hasActiveFilter"
      :is-reordering="isReordering"
      :can-undo="!!reorderHistory"
      :all-items="partClasses"
      @reorder="executeReorder"
      @undo="undoReorder"
      @close="closeReorderDialog"
      @move-to-item="handleMoveToItem"
    />

    <!-- 출력 모달 (바코드/QR 코드/라벨/데이터 인쇄) -->
    <PrintModal v-model="showPrintModal" :mode="printModalMode" :targets="printModalTargets" :data-print-type="exportType" :data-print-count="exportCount" :print-options="printOptions" :preview-data="getPreviewData()" @close="closePrintModal" @confirm-print="handlePrintConfirm" />

    <!-- 상세보기 모달 -->
    <DetailModal v-model="showDetailModal" :target="detailModalTarget" @close="closeDetailModal" />

    <!-- 공유 URL 모달 (필터/선택/조합 자동 판단) -->
    <ShareUrlModal v-model="showShareUrlDialog" :selected-items="selectedRows" :filter-conditions="filterConditions" @close="closeModal('shareUrl')" />

    <!-- 내보내기 모달 -->
    <ExportModal
      v-model="showExportPrintDialog"
      :type-label="exportTypeLabel"
      :count="exportCount"
      :format="exportFormat"
      :format-options="exportFormatOptions"
      :is-processing="isExporting"
      :preview-data="getPreviewData()"
      @update:format="exportFormat = $event"
      @confirm="confirmExportPrint"
      @close="closeExportPrintDialog"
    />

    <!-- 뷰 모드 설정 모달 -->
    <ViewModeSettingsModal v-model="showViewModeSettingsModal" :current-view-mode="currentViewMode" :available-columns="columns" :available-fields="columns" storage-key="part-classes-view-mode-settings" @settings-change="handleViewModeSettingsChange" @save="handleViewModeSettingsSave" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePartsDataStore } from '@system/store/partsDataStore.js'
import { usePartsManagementStore } from '@system/store/partsManagementStore.js'
import { DEFAULT_CATEGORIES } from '@system/constants/categories.js'
import AddEditPartClassModal from './item-action-modules/modals/AddEditPartClassModal.vue'
import DataPageNavigation from '@system/components/ui/DataPageNavigation.vue'
import PrintModal from './PrintModal.vue'
import { useSkeletonLoader } from '@system/composables/useSkeletonLoader.js'
import PartClassesActionsBar from './PartClassesActionsBar.vue'
import DeleteModal from './item-action-modules/modals/DeleteModal.vue'
import ActivateStatusModal from './item-action-modules/modals/ActivateStatusModal.vue'
import FavoriteModal from './item-action-modules/modals/FavoriteModal.vue'
import HistoryModal from './item-action-modules/modals/HistoryModal.vue'
import RelatedPartsModal from './item-action-modules/modals/RelatedPartsModal.vue'
import ReorderModal from './item-action-modules/modals/ReorderModal.vue'
import DetailModal from './item-action-modules/modals/DetailModal.vue'
import ExportModal from './item-action-modules/modals/ExportModal.vue'
import ShareUrlModal from './item-action-modules/modals/ShareUrlModal.vue'
import ViewModeSettingsModal from './item-action-modules/modals/ViewModeSettingsModal.vue'
import DataTableRenderer from '@engines/renderers/DataTableRenderer.vue'
import DataCardRenderer from '@engines/renderers/DataCardRenderer.vue'
import DataListRenderer from '@engines/renderers/DataListRenderer.vue'
import DataChartRenderer from '@engines/renderers/DataChartRenderer.vue'
import { partClassesFields } from './config/partClassesFields'
import { getRowNumber, formatDateTime } from '@system/utils/dataViewUtils.js'
import { loadViewModeSettings, saveViewModeSettings, VIEW_MODES, defaultTableViewSettings, defaultCardViewSettings, defaultListViewSettings, defaultChartViewSettings } from './config/viewModeSettings'
import { useTableFilter } from '@system/composables/useTableFilter.js'
import { usePaginationControl } from '@system/composables/usePaginationControl.js'
import { useTableKeyboard } from '@system/composables/useTableKeyboard.js'
import { useMultiSelection } from '@system/composables/useMultiSelection.js'
import { useTableDragDrop } from '@system/composables/useTableDragDrop.js'
import { useTableDuplicate } from '@system/composables/useTableDuplicate.js'
import { useSidebarNavigation } from '@system/composables/useSidebarNavigation.js'
import { useURLStateManagement } from '@system/composables/url-state/index.js'
import { useModalManager } from '@system/composables/useModalManager.js'
import { useDynamicLabel } from '@system/composables/useDynamicLabel.js'
import ContextMenu from '@system/components/ui/ContextMenu.vue'
import TableFilterBar from '@system/components/ui/TableFilterBar.vue'
import TableEmptyState from '@system/components/ui/TableEmptyState.vue'
import TableActionsOverlay from '@system/components/ui/TableActionsOverlay.vue'
import { useContextMenu } from '@system/composables/useContextMenu.js'
import { getPartClassesContextMenuItems } from './config/partsManagementContextMenu'
import { exportData as exportDataUtil } from '@system/utils/export/index.js'
import { getURLStateParamName } from '@system/config/url-state/index.js'
import { addActionMenuItems, workActionAdditionalItems, getMenuItems } from './config/partClassesMenuConfig'

const $q = useQuasar()
const partsDataStore = usePartsDataStore()
const partsManagementStore = usePartsManagementStore()
const { showSkeleton, hideSkeleton } = useSkeletonLoader()

// 컨텍스트 메뉴
const { showContextMenu, hideContextMenu, contextMenuState } = useContextMenu()
const contextMenuVisible = computed(() => contextMenuState.visible.value)
const contextMenuPosition = computed(() => contextMenuState.position.value)
const contextMenuItems = computed(() => contextMenuState.items.value)

// 상태
const loading = ref(false)
const searchText = ref('')
const selectedCategory = ref(null)
// 통합 상태 필터 (파일, 활성, 즐겨찾기)
const statusFilter = ref(null) // 'has_files' | 'no_files' | 'active' | 'inactive' | 'favorite' | null

// 기존 필터와의 호환성을 위한 computed (composable에서 사용)
const fileFilter = computed(() => {
  if (statusFilter.value === 'has_files' || statusFilter.value === 'no_files') {
    return statusFilter.value
  }
  return null
})

const activeFilter = computed(() => {
  if (statusFilter.value === 'active' || statusFilter.value === 'inactive') {
    return statusFilter.value
  }
  return null
})

const favoriteFilter = computed(() => {
  return statusFilter.value === 'favorite'
})

// 모달 관리 (useModalManager 사용)
const { openModal, closeModal, getModalComputed } = useModalManager(['add', 'delete', 'activateStatus', 'favorite', 'history', 'relatedParts', 'reorder', 'shareUrl', 'exportPrint', 'print', 'detail', 'viewModeSettings'])

// 끼워넣기 관련 상태
const insertMode = ref(null) // null | 'insert-above' | 'insert-below' | 'add-to-top' | 'add-to-bottom'
const insertTargetItem = ref(null) // 끼워넣기 기준 항목

// 끼워넣기 모드 초기화
function resetInsertMode() {
  insertMode.value = null
  insertTargetItem.value = null
}

// 끼워넣기 다이얼로그 열기 (공통 함수)
function openInsertDialog(mode, targetItem = null, hideOverlay = false) {
  insertMode.value = mode
  insertTargetItem.value = targetItem
  editingClass.value = null
  openModal('add')
  if (hideOverlay) hideActionsOverlay()
}

// 모달별 데이터 관리 (모달에 전달할 데이터)
const deleteTargets = ref([]) // 삭제 대상 목록 (단일/복수 공용)
const isDeleting = ref(false) // 삭제 진행 상태
const isDeleteCompleted = ref(false) // 삭제 완료 여부 (버튼 라벨/동작 분기용)

// 내보내기 모달 관련 상태
const exportFormat = ref('csv') // 내보내기 형식: csv, excel, pdf
const isExporting = ref(false) // 내보내기 진행 상태
const exportFormatOptions = [
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'excel' },
  { label: 'PDF', value: 'pdf' },
]

// 인쇄 옵션 (PrintModal에서 사용)
const printOptions = ref({
  paperSize: 'a4', // a4, a3, letter
  orientation: 'portrait', // portrait, landscape
  color: 'color', // color, grayscale
  pages: 'all', // all, current, range
  pageRange: '', // 페이지 범위 (예: "1-5,10")
})

// 활성화/비활성화 관련 상태
const activateStatusTargets = ref([]) // 활성화/비활성화 대상 목록
const isTogglingStatus = ref(false) // 상태 변경 진행 상태
const activateStatusType = ref('activate') // 'activate' | 'deactivate' - 현재 상태에 따라 결정

// 즐겨찾기 관련 상태
const favoriteTargets = ref([]) // 즐겨찾기 대상 목록
const favoriteType = ref('add') // 'add' | 'remove' - 현재 상태에 따라 결정
const isTogglingFavorite = ref(false) // 즐겨찾기 변경 진행 상태

// 상세보기 모달 관련 상태
const detailModalTarget = ref(null) // 상세보기 대상 항목

// 출력 모달 관련 상태
const printModalMode = ref('barcode') // 'barcode' | 'qrcode' | 'label'
const printModalTargets = ref([]) // 출력 대상 항목들

// 변경 이력 다이얼로그 관련 상태
const historyTarget = ref(null) // 변경 이력 조회 대상 항목

// 관련 부품 보기 다이얼로그 관련 상태
const relatedPartsTarget = ref(null) // 관련 부품 조회 대상 항목

// 순서 변경 다이얼로그 관련 상태
const reorderTargets = ref([]) // 순서 변경 대상 항목들 (단일/복수 공용)
const reorderHistory = ref(null) // 순서 변경 이력 (되돌리기용) { items: [{ id, sort_order }] }

// 편집 중인 클래스 (모달 컴포넌트에 전달)
const editingClass = ref(null)

// 뷰 모드 상태
// Phase 3: 완성된 뷰모드 및 선택 가능한 뷰모드 사용 (Table, Card, List, Gallery, Timeline)
// Chart는 구현 예정, Layout, Compact는 별도 프로그램으로 구현 예정
const currentViewMode = ref('table') // 'table' | 'card' | 'list' | 'gallery' | 'timeline'

// 모달 computed (v-model 바인딩용)
const showAddDialog = getModalComputed('add')
const showDeleteDialog = getModalComputed('delete')
const showActivateStatusDialog = getModalComputed('activateStatus')
const showFavoriteDialog = getModalComputed('favorite')
const showHistoryDialog = getModalComputed('history')
const showRelatedPartsDialog = getModalComputed('relatedParts')
const showReorderDialog = getModalComputed('reorder')
const showShareUrlDialog = getModalComputed('shareUrl')
const showExportPrintDialog = getModalComputed('exportPrint')
const showPrintModal = getModalComputed('print')
const showDetailModal = getModalComputed('detail')
const showViewModeSettingsModal = getModalComputed('viewModeSettings')

// ViewModeSelector 컴포넌트에서 enabledViewModes를 직접 관리하므로 제거됨

// 뷰 모드 설정 (테이블 뷰)
const tableViewSettings = ref({ ...defaultTableViewSettings })
const cardViewSettings = ref({ ...defaultCardViewSettings })
const listViewSettings = ref({ ...defaultListViewSettings })
const chartViewSettings = ref({ ...defaultChartViewSettings })
const viewModeSettingsStorageKey = 'part-classes-view-mode-settings'

// 뷰 모드 설정 로드
function loadTableViewSettings() {
  tableViewSettings.value = loadViewModeSettings(viewModeSettingsStorageKey, VIEW_MODES.TABLE)
}

function loadCardViewSettings() {
  cardViewSettings.value = loadViewModeSettings(viewModeSettingsStorageKey, VIEW_MODES.CARD)
}

function loadListViewSettings() {
  listViewSettings.value = loadViewModeSettings(viewModeSettingsStorageKey, VIEW_MODES.LIST)
}

function loadChartViewSettings() {
  chartViewSettings.value = loadViewModeSettings(viewModeSettingsStorageKey, VIEW_MODES.CHART)
}

// 필드명 매핑
const fieldMapping = {
  id: 'id',
  favorite: 'is_favorite',
  active: 'is_active',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}

// 기능 플래그
const tableFeatures = {
  draggable: true,
  selectable: true,
  hoverable: true,
  contextMenu: true,
}

const cardFeatures = {
  selectable: true,
  hoverable: true,
}

const listFeatures = {
  draggable: true,
  selectable: true,
  hoverable: true,
  contextMenu: true,
}

// 비활성화된 메뉴 항목 색상 (전역 변수)
const disabledMenuItemColor = '#777777'

// 작업 메뉴 배경색 (다크 모드 대응)
const menuBackgroundColor = computed(() => {
  return $q.dark.isActive ? '#3a3a3a' : '#f5f5f5'
})

// 작업 메뉴 항목 스타일 (간단화 - 인라인 스타일로 처리)

// 작업 아이콘 오버레이 관련
const actionsOverlayRef = ref(null) // TableActionsOverlay 컴포넌트 ref
const actionsOverlayStyle = ref({
  top: '0px',
  right: '26px', // 16px + 10px = 26px (왼쪽으로 10px 이동)
})

// 테이블 컬럼 정의
const columns = partClassesFields

// 행 클래스 함수 (row-class prop용)
function getRowClass(row) {
  const isInactive = row.is_active === 0 || row.is_active === false
  if (import.meta.env.DEV && isInactive) {
    console.log('[getRowClass] 비활성 항목:', row.id, row.name, 'is_active:', row.is_active)
  }
  return isInactive ? 'nexa-item-inactive' : ''
}

// 페이지네이션
const pagination = ref({
  sortBy: null,
  descending: false,
  page: 1,
  rowsPerPage: 25,
})

// 페이지 정보는 DataPageNavigation의 paginationInfo를 직접 사용
// (별도 계산 제거 - DataPageNavigation이 정확하게 계산하고 있음)

// 테이블 컨테이너 참조
const tableWrapperRef = ref(null)
const cardViewRef = ref(null) // 카드 뷰 ref
const filterBarRef = ref(null)
const searchInputRef = computed(() => filterBarRef.value?.searchInputRef)
const paginationTableRef = ref(null)

// 부품 클래스 목록 (store에서 가져오기)
const partClasses = computed(() => partsDataStore.partClasses)

// 카테고리 옵션 (필터링용) - DEFAULT_CATEGORIES 순서 유지
const categoryOptions = computed(() => {
  const existingCategories = [...new Set(partClasses.value.map((c) => c.category).filter(Boolean))]

  // DEFAULT_CATEGORIES의 순서를 유지하고, 그 뒤에 기존 카테고리 중 없는 것만 추가
  const defaultSet = new Set(DEFAULT_CATEGORIES)
  const additionalCategories = existingCategories.filter((cat) => !defaultSet.has(cat))

  // DEFAULT_CATEGORIES 순서 유지 + 추가 카테고리
  return [...DEFAULT_CATEGORIES, ...additionalCategories]
})

// 통합 상태 필터 옵션 (파일, 활성, 즐겨찾기)
const statusFilterOptions = [
  { label: '파일 있음', value: 'has_files' },
  { label: '파일 없음', value: 'no_files' },
  { label: '활성 항목만', value: 'active' },
  { label: '비활성 항목만', value: 'inactive' },
  { label: '즐겨찾기만', value: 'favorite' },
]

// 필터 바 필터 설정
const filterBarFilters = computed(() => [
  {
    key: 'category',
    model: selectedCategory,
    options: categoryOptions,
    label: '대분류 필터',
    clearable: true,
    class: 'category-filter',
  },
  {
    key: 'status',
    model: statusFilter,
    options: statusFilterOptions,
    optionValue: 'value',
    optionLabel: 'label',
    emitValue: true,
    mapOptions: true,
    label: '상태 필터',
    clearable: true,
    class: 'status-filter',
  },
])

// 필터 업데이트 핸들러
function handleFilterUpdate({ key, value }) {
  if (key === 'category') {
    selectedCategory.value = value
  } else if (key === 'status') {
    statusFilter.value = value
  }
}

// 검색 필드 선택 상태
const selectedSearchFields = ref(['name', 'c_code', 'description'])

// 검색 필드 업데이트 핸들러
function handleSearchFieldsUpdate(fields) {
  selectedSearchFields.value = fields
}

// 필터링 로직 (범용 composable 사용)
const { filteredItems, hasActiveFilter } = useTableFilter({
  items: partClasses,
  searchText,
  searchFields: selectedSearchFields,
  filters: {
    category: selectedCategory,
  },
  customFilters: [
    // 파일 필터
    {
      key: 'fileFilter',
      value: fileFilter,
      condition: (item, value) => {
        if (value === 'has_files') {
          const fileCount = Number(item.file_upload_count) || 0
          return fileCount > 0
        } else if (value === 'no_files') {
          const fileCount = Number(item.file_upload_count) || 0
          return fileCount === 0
        }
        return true
      },
    },
    // 활성 상태 필터
    {
      key: 'activeFilter',
      value: activeFilter,
      condition: (item, value) => {
        if (value === 'active') {
          return item.is_active === 1 || item.is_active === true
        } else if (value === 'inactive') {
          return item.is_active === 0 || item.is_active === false
        }
        return true
      },
    },
    // 즐겨찾기 필터
    {
      key: 'favoriteFilter',
      value: favoriteFilter,
      condition: (item, value) => {
        if (value) {
          return item.is_favorite === 1 || item.is_favorite === true
        }
        return true
      },
    },
  ],
  sortConfig: {
    primary: 'sort_order',
    secondary: 'sub_sort_order',
    fallback: ['updated_at', 'id'],
  },
})

// URL에서 선택된 항목 ID 파싱 (공유 URL용)
const urlSelectedIds = ref([])

// URL에서 selected 파라미터 파싱
const route = useRoute()

// 공유 URL 파라미터 이름 가져오기
const selectedParam = getURLStateParamName('selected')

// URL 상태 제거 (useClearURLState 사용)
// clearState는 useURLStateManagement에서 제공됨

watch(
  () => route.query[selectedParam],
  (selectedValue) => {
    if (selectedValue) {
      // 하이픈으로 구분된 ID 문자열을 배열로 변환
      // 하이픈(-)은 URL에서 안전한 문자이므로 인코딩 없이 사용 가능
      const ids = String(selectedValue)
        .split('-')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id) && id > 0)
      urlSelectedIds.value = ids
    } else {
      // selectedValue가 없거나 빈 문자열이면 필터 초기화
      urlSelectedIds.value = []
    }
  },
  { immediate: true },
)

// 뷰 변경 시 공유 URL 필터 초기화
watch(
  () => partsManagementStore.selectedPartsDataView,
  (newView) => {
    // 뷰가 변경되면 공유 URL 필터 초기화
    if (newView !== 'part-classes') {
      urlSelectedIds.value = []
    }
  },
)

// URL에서 선택된 항목만 필터링하는 경우
const isSelectedItemsOnlyMode = computed(() => {
  return urlSelectedIds.value.length > 0
})

// 최종 필터링된 목록 (URL 선택 모드일 때는 선택된 항목만 표시)
const filteredClasses = computed(() => {
  if (isSelectedItemsOnlyMode.value) {
    // URL에서 선택된 항목만 필터링
    return filteredItems.value.filter((item) => urlSelectedIds.value.includes(item.id))
  }
  return filteredItems.value
})

// 테이블 복제 관리 (범용 composable 사용)
// PartClasses 특화 설정: name과 c_code 중복 체크
const { duplicateItem: duplicateTableItem } = useTableDuplicate({
  items: partClasses,
  filteredItems: filteredClasses,
  // 기본 uniqueFields 사용 (name: " (복사본)", c_code: 숫자 접미사)
  // 향후 다른 테이블에서 다른 접두어/접미사가 필요하면 여기서 설정 가능
  onDuplicate: (duplicatedData, sourceItem) => {
    // 복제 완료 시 끼워넣기 다이얼로그 열기
    insertMode.value = 'insert-below'
    insertTargetItem.value = sourceItem
    editingClass.value = duplicatedData
    openModal('add')

    $q.notify({
      type: 'info',
      message: '항목이 복제되었습니다. 정보를 확인하고 저장해주세요.',
      position: 'top',
      timeout: 2000,
    })
  },
  onError: (error) => {
    $q.notify({
      type: 'negative',
      message: '복제 중 오류가 발생했습니다.',
      caption: error.message,
      position: 'top',
      timeout: 2000,
    })
  },
})

// 행 클릭 핸들러는 composable에서 제공 (handleRowClick)

// 카드 뷰 선택 업데이트 핸들러 (ID 배열을 객체 배열로 변환)
function handleCardViewSelectedRowsUpdate(selectedIds) {
  // ID 배열을 객체 배열로 변환
  const newSelectedRows = filteredClasses.value.filter((row) => selectedIds.includes(row.id))
  selectedRows.value = newSelectedRows
}

// 카드 뷰 이벤트 핸들러 (useMultiSelection에 연결)
function handleCardRowClick(event, row) {
  handleTableRowClick(event, row)
}

function handleCardRowDoubleClick(event, row) {
  handleRowDoubleClick(row)
}

// 리스트 뷰 선택 업데이트 핸들러
function handleListViewSelectedRowsUpdate(selectedIds) {
  // selectedIds는 선택된 행의 ID 배열
  const selectedItems = filteredClasses.value.filter((item) => selectedIds.includes(item.id))
  selectedRowsRef.value = selectedItems
  selectedRowIdRef.value = selectedItems[0]?.id || null

  if (selectedItems.length > 0) {
    partsDataStore.selectedPartClasses = [...selectedItems]
    if (selectedItems.length === 1) {
      partsDataStore.selectedPartClass = selectedItems[0]
    }
  } else {
    if (!hoveredRowId.value) {
      partsDataStore.selectedPartClasses = []
      partsDataStore.selectedPartClass = null
    }
  }
}

// 리스트 뷰 행 클릭 핸들러
function handleListRowClick(event, row) {
  handleTableRowClick(event, row)
}

// 리스트 뷰 행 더블 클릭 핸들러
function handleListRowDoubleClick(event, row) {
  handleRowDoubleClick(row)
}

// 차트 타입 변경 핸들러
function handleChartTypeChange(chartType) {
  chartViewSettings.value = {
    ...chartViewSettings.value,
    chartType,
  }
  // 설정 저장
  saveViewModeSettings(viewModeSettingsStorageKey, VIEW_MODES.CHART, chartViewSettings.value)
}

/**
 * 차트 데이터 호버 핸들러 (사이드바 호버 뷰)
 * 차트 뷰에서 데이터 포인트에 마우스 오버 시 사이드바 호버 뷰를 표시합니다.
 *
 * 주요 처리 로직:
 * 1. 상세 뷰가 활성화되어 있으면 호버 이벤트 차단 (클릭으로 열린 상세 뷰 유지)
 * 2. 클릭된 항목에 대한 호버는 무시 (클릭 직후 호버 이벤트 발생 방지)
 * 3. 단일 항목이면 단일 선택, 멀티 항목이면 멀티 셀렉션 뷰로 표시
 *
 * 멀티 차트 모드인 경우 { layer, data } 형태로 전달됩니다.
 */
function handleChartDataHover(data) {
  // 차트에서 데이터 포인트에 마우스 오버 시 사이드바 호버 뷰 표시
  // 멀티 차트 모드인 경우 { layer, data } 형태로 전달됨
  const chartData = data.layer ? data.data : data

  if (!chartData) {
    return
  }

  // originalRows가 있으면 모두 사용, 없으면 originalRow 사용
  const rows = chartData.originalRows && chartData.originalRows.length > 0 ? chartData.originalRows : chartData.originalRow ? [chartData.originalRow] : []

  if (rows.length === 0) {
    return
  }

  // 사이드바 상세 뷰가 활성화되어 있으면 호버 뷰를 중단 (클릭으로 열린 상세 뷰 유지)
  // partsDataStore.isSidebarDetailViewActive를 직접 확인하여 확실하게 체크
  // 이 체크를 가장 먼저 수행하여 호버 이벤트를 완전히 차단
  if (partsDataStore.isSidebarDetailViewActive) {
    return // 상세 뷰가 활성화되어 있으면 호버 뷰 작동 중단
  }

  // 클릭된 항목에 대한 호버는 무시 (클릭 직후 호버 이벤트가 발생하는 경우 방지)
  // 멀티 항목인 경우도 체크 (rows에 포함된 항목 중 하나라도 클릭된 항목이면 차단)
  if (chartClickedRowId.value) {
    const clickedRowIds = rows.map((r) => r.id)
    if (clickedRowIds.includes(chartClickedRowId.value)) {
      return // 클릭된 항목에 대한 호버는 무시
    }
  }

  // 사이드바 모드/뷰 확인
  if (partsManagementStore.sidebarMode !== 'parts-data') {
    partsManagementStore.setSidebarMode('parts-data')
  }
  if (partsManagementStore.selectedPartsDataView !== 'part-classes') {
    partsManagementStore.setSelectedPartsDataView('part-classes')
  }

  // 데이터가 1개면 단일, 2개 이상이면 멀티로 표시
  if (rows.length === 1) {
    // 단일 항목: 호버 뷰
    partsDataStore.selectedPartClass = rows[0]
    partsDataStore.selectedPartClasses = [rows[0]]
  } else {
    // 멀티 항목: 멀티 셀렉션 뷰 (selectedPartClass는 null로 설정하여 멀티 모드 활성화)
    partsDataStore.selectedPartClass = null
    partsDataStore.selectedPartClasses = rows
  }
}

/**
 * 차트 데이터 클릭 핸들러 (사이드바 상세 뷰)
 *
 * 차트 뷰에서 데이터 포인트 클릭 시 사이드바 상세 뷰를 활성화합니다.
 *
 * 주요 처리 로직:
 * 1. 클릭된 항목 ID를 저장하여 호버 이벤트 차단 (chartClickedRowId)
 * 2. 사이드바 상세 뷰 활성화 (isSidebarDetailViewActive = true)
 * 3. 모든 항목을 멀티 셀렉션으로 선택 (originalRows가 여러 개인 경우 모두 선택)
 * 4. handleRowClick 호출 후 멀티 셀렉션 상태 복원 (handleRowClick이 덮어쓰는 것을 방지)
 *
 * 문제 해결을 위한 핵심 처리:
 * - 멀티 항목인 경우에도 첫 번째 항목으로 handleRowClick 호출하여 상세 뷰 활성화
 * - handleRowClick이 selectedPartClasses를 덮어쓰므로 호출 후 멀티 셀렉션 상태 복원
 * - chartClickedRowId를 설정하여 클릭 직후 호버 이벤트 차단
 *
 * 멀티 차트 모드인 경우 { layer, data } 형태로 전달됩니다.
 */
function handleChartDataClick(data) {
  // 차트에서 데이터 포인트 클릭 시 사이드바 상세 뷰 활성화
  // 멀티 차트 모드인 경우 { layer, data } 형태로 전달됨
  const chartData = data.layer ? data.data : data

  if (!chartData) {
    return
  }

  // originalRows가 있으면 모두 사용, 없으면 originalRow 사용
  const allRows = chartData.originalRows && chartData.originalRows.length > 0 ? chartData.originalRows : chartData.originalRow ? [chartData.originalRow] : []

  if (allRows.length === 0) {
    return
  }

  // 사이드바 모드/뷰 확인
  if (partsManagementStore.sidebarMode !== 'parts-data') {
    partsManagementStore.setSidebarMode('parts-data')
  }
  if (partsManagementStore.selectedPartsDataView !== 'part-classes') {
    partsManagementStore.setSelectedPartsDataView('part-classes')
  }

  // 차트 클릭 시 모든 항목을 멀티 셀렉션으로 선택하고 상세 뷰 활성화
  // (originalRows가 여러 개이면 모두 선택하여 멀티 셀렉션 뷰로 표시)
  const firstRow = allRows[0]
  const firstRowId = firstRow.id

  // 0. 클릭된 항목 ID 저장 (호버 차단용) - 첫 번째 항목 ID 저장
  // 이렇게 하면 클릭 직후 호버 이벤트가 발생해도 차단됨
  chartClickedRowId.value = firstRowId

  // 1. 사이드바 상세 뷰 활성화 (가장 먼저 설정하여 호버 핸들러가 체크할 때 이미 true로 설정되어 있음)
  // 이렇게 하면 호버 핸들러에서 isSidebarDetailViewActive를 체크할 때 이미 차단됨
  partsDataStore.isSidebarDetailViewActive = true

  // 2. 선택 상태 업데이트 - 모든 항목 선택 (멀티 셀렉션)
  selectedRowsRef.value = [...allRows]
  selectedRowIdRef.value = firstRowId

  // 3. onSelectionChange 콜백과 동일한 로직 실행
  if (allRows.length === 1) {
    // 단일 항목: 단일 선택
    partsDataStore.selectedPartClasses = [firstRow]
    partsDataStore.selectedPartClass = firstRow
  } else {
    // 멀티 항목: 멀티 셀렉션 (selectedPartClass는 null로 설정하여 멀티 모드 활성화)
    partsDataStore.selectedPartClasses = [...allRows]
    partsDataStore.selectedPartClass = null
  }

  // 4. handleRowClick 호출 (사이드바 상세 뷰 활성화)
  // 멀티 항목이어도 첫 번째 항목으로 handleRowClick 호출하여 상세 뷰 활성화
  // 단, handleRowClick 내부에서 selectedPartClass와 selectedPartClasses를 덮어쓰므로
  // 호출 후 다시 멀티 셀렉션 상태로 복원해야 함
  //
  // 문제 해결: 원래는 멀티 항목인 경우 handleRowClick을 호출하지 않았지만,
  // 이렇게 하면 상세 뷰가 활성화되지 않아 "사이드바 호버 뷰로 전환" 버튼이 표시되지 않음
  // 따라서 멀티 항목이어도 첫 번째 항목으로 handleRowClick을 호출하고,
  // 호출 후 멀티 셀렉션 상태를 복원하여 두 가지 요구사항을 모두 만족시킴
  const wasMultiSelection = allRows.length > 1
  const savedSelectedPartClasses = wasMultiSelection ? [...partsDataStore.selectedPartClasses] : null

  handleRowClick(firstRow)

  // 멀티 항목이었으면 선택 상태 복원 (handleRowClick이 덮어쓴 것을 복원)
  if (wasMultiSelection && savedSelectedPartClasses) {
    partsDataStore.selectedPartClasses = savedSelectedPartClasses
    partsDataStore.selectedPartClass = null // 멀티 셀렉션 모드 유지
  }
}

// 차트 설정 변경 핸들러
function handleChartSettingsChange(settings) {
  chartViewSettings.value = {
    ...chartViewSettings.value,
    ...settings,
  }
  // 설정 저장
  saveViewModeSettings(viewModeSettingsStorageKey, VIEW_MODES.CHART, chartViewSettings.value)
}

// 행 더블 클릭 핸들러 (composable 함수 사용, 추가 처리: selectedRows 초기화)
function handleRowDoubleClick(row) {
  handleRowDoubleClickComposable(row)
  // 더블클릭으로 상세 뷰 해제 시 선택도 초기화
  if (isSidebarDetailViewActive.value) {
    selectedRows.value = []
  }
}

// 테이블 선택 관리 (범용 composable 사용) - filteredClasses 정의 이후에 호출
// selectedRowId를 먼저 생성하여 useSidebarNavigation에 전달
const selectedRowIdRef = ref(null)
const selectedRowsRef = ref([])

/**
 * 차트에서 클릭된 항목 ID 추적 (호버 차단용)
 *
 * 차트 아이템을 클릭하면 해당 항목의 ID를 저장하여,
 * 클릭 직후 호버 이벤트가 발생해도 차단합니다.
 *
 * 문제 해결: 버튼 클릭으로 호버 뷰로 전환할 때 chartClickedRowId가 초기화되지 않아
 * 클릭했던 아이템에 대한 호버가 작동하지 않는 문제를 해결하기 위해
 * isSidebarDetailViewActive가 false로 변경되면 자동으로 초기화합니다.
 */
const chartClickedRowId = ref(null)

/**
 * isSidebarDetailViewActive가 false로 변경되면 chartClickedRowId 초기화
 *
 * 버튼 클릭으로 호버 뷰로 전환 시 호버 이벤트가 다시 활성화되도록 합니다.
 *
 * 문제 해결: PartsManagementSidebar.vue의 버튼에서 exitSidebarDetailView()를 호출할 때
 * chartClickedRowId를 직접 초기화할 수 없으므로, watch를 통해 자동으로 초기화합니다.
 * 이렇게 하면 버튼 클릭과 ESC 키 모두 동일하게 동작합니다.
 */
watch(
  () => partsDataStore.isSidebarDetailViewActive,
  (newValue) => {
    if (newValue === false) {
      // 상세 뷰가 해제되면 차트 클릭 추적 초기화
      chartClickedRowId.value = null
    }
  },
)

// 사이드바 네비게이션 (composable 사용)
// useMultiSelection보다 먼저 호출하여 handleRowClick, handleRowDoubleClick을 먼저 정의
const {
  hoveredRowId,
  // sidebarDetailViewRowId, // composable에서 관리 (필요시 사용)
  isSidebarDetailViewActive,
  onRowMouseEnter: onRowMouseEnterComposable,
  // onRowMouseLeave: onRowMouseLeaveComposable, // onContainerMouseLeave에서 처리되므로 사용하지 않음
  onRowMouseMove: onRowMouseMoveComposable,
  onContainerMouseLeave: onContainerMouseLeaveComposable,
  handleRowClick,
  handleRowDoubleClick: handleRowDoubleClickComposable,
  exitSidebarDetailView,
  cleanup: cleanupSidebarNavigation,
} = useSidebarNavigation({
  items: filteredClasses,
  itemIdKey: 'id',
  sidebarMode: 'parts-data',
  selectedView: 'part-classes',
  partsManagementStore,
  partsDataStore,
  selectedRowId: selectedRowIdRef,
  hoverDebounceTime: 50,
  containerRef: computed(() => {
    // 현재 뷰 모드에 따라 적절한 컨테이너 ref 반환
    if (currentViewMode.value === 'card') {
      return cardViewRef.value?.containerRef || null
    }
    return tableWrapperRef.value
  }),
  onHover: (item, evt) => {
    // 오버레이 위치 업데이트
    updateActionsOverlayPositionFromMouse(evt)
  },
  onMouseLeave: () => {
    // 오버레이 숨김 처리
    if (!isMouseOverActionsOverlay.value) {
      const hoveredRow = hoveredRowId.value ? document.querySelector(`[data-row-id="${hoveredRowId.value}"]`) : null
      if (!hoveredRow) {
        hideActionsOverlay()
      }
    }
  },
})

// 테이블 선택 관리 (범용 composable 사용)
const {
  selectedRows,
  selectedRowId,
  selectedCount,
  multiSelectMode,
  lastSelectedIndex,
  longPressingRowId, // DataTableRenderer에 전달하여 롱프레스 스타일 적용
  onRowClick: handleTableRowClick,
  onRowMouseDown: handleRowMouseDown,
  onRowMouseUp: handleRowMouseUp,
  clearSelection, // useTableKeyboard에 전달하여 ESC 키 처리
} = useMultiSelection({
  items: filteredClasses,
  onSelectionChange: (newSelectedRows) => {
    // 선택 변경 시 store 동기화
    selectedRowsRef.value = newSelectedRows
    selectedRowIdRef.value = newSelectedRows[0]?.id || null

    if (newSelectedRows.length > 0) {
      partsDataStore.selectedPartClasses = [...newSelectedRows]
      if (newSelectedRows.length === 1) {
        partsDataStore.selectedPartClass = newSelectedRows[0]
      }
    } else {
      if (!hoveredRowId.value) {
        partsDataStore.selectedPartClasses = []
        partsDataStore.selectedPartClass = null
      }
    }
  },
  onRowClick: handleRowClick,
  onRowDoubleClick: handleRowDoubleClickComposable,
})

// 동적 라벨 생성 (useDynamicLabel 사용) - selectedCount 정의 이후
const { getLabel, getCount, getType } = useDynamicLabel({
  selectedCount,
  hasActiveFilter,
  getFilteredCount: () => filteredClasses.value.length,
  getTotalCount: () => partClasses.value.length,
})

// 내보내기 타입 및 개수 계산
const exportType = computed(() => getType())
const exportCount = computed(() => getCount())
const exportTypeLabel = computed(() => {
  const count = exportCount.value
  switch (exportType.value) {
    case 'selected':
      return count > 1 ? `선택 항목 내보내기 (${count}개)` : '선택 항목 내보내기'
    case 'filtered':
      return `필터 결과 내보내기 (${count}개)`
    case 'all':
      return '전체 내보내기'
    default:
      return '데이터 내보내기'
  }
})

// 동적 라벨 (useDynamicLabel 사용)
const exportMenuLabel = computed(() => getLabel('export', '내보내기'))
const printMenuLabel = computed(() => getLabel('print', '인쇄'))
const activateStatusMenuLabel = computed(() => {
  if (selectedCount.value > 0) {
    return selectedCount.value > 1 ? `일괄 활성화/비활성화 (${selectedCount.value}개)` : '활성화/비활성화'
  } else if (hasActiveFilter.value) {
    return `필터 결과 활성화/비활성화 (${filteredClasses.value.length}개)`
  } else {
    return '활성화/비활성화'
  }
})

// 활성화/비활성화 대상 개수
const activateStatusCount = computed(() => {
  if (selectedCount.value > 0) {
    return selectedCount.value
  } else if (hasActiveFilter.value) {
    return filteredClasses.value.length
  } else {
    return 0
  }
})

// 즐겨찾기 메뉴 라벨
const favoriteMenuItemLabel = computed(() => {
  if (selectedCount.value > 1) {
    return `일괄 즐겨찾기 (${selectedCount.value}개)`
  } else {
    return '즐겨찾기'
  }
})

// 추가 메뉴 아이템 (partClassesMenuConfig 사용) - selectedRowId, selectedCount 정의 이후
const addMenuItems = computed(() => {
  return getMenuItems(addActionMenuItems, {
    selectedRowId: selectedRowId.value,
    selectedCount: selectedCount.value,
  })
})

// 작업 메뉴 추가 아이템 (partClassesMenuConfig 사용)
const workActionMenuItems = computed(() => {
  return getMenuItems(workActionAdditionalItems, {
    selectedRowId: selectedRowId.value,
    selectedCount: selectedCount.value,
  })
})

// 추가 메뉴 아이템 클릭 핸들러
function handleAddMenuItemClick(item) {
  const actionMap = {
    'add-to-top': handleAddToTop,
    'insert-above': handleInsertAbove,
    'insert-below': handleInsertBelow,
    'add-to-bottom': handleAddToBottom,
  }
  const handler = actionMap[item.id]
  if (handler) {
    handler()
  }
}

// 작업 메뉴 추가 아이템 클릭 핸들러
function handleWorkActionClick(item) {
  const actionMap = {
    'reinitialize-sort': reinitializeSortOrder,
    // 향후 다른 액션들 추가 가능
    // 'location-info': handleLocationInfo,
    // 'location-move': handleLocationMove,
    // ...
  }
  const handler = actionMap[item.id]
  if (handler) {
    handler()
  } else {
    // 핸들러가 없는 경우 (향후 구현 예정)
    console.warn(`[PartClassesView] 작업 액션 "${item.id}"의 핸들러가 아직 구현되지 않았습니다.`)
  }
}

// 드래그 앤 드롭 관리 (범용 composable 사용) - filteredClasses 정의 이후에 호출
const {
  // eslint-disable-next-line no-unused-vars
  draggedRowId, // DataTableRenderer에서 관리하므로 사용하지 않음
  // eslint-disable-next-line no-unused-vars
  dragOverRowId, // DataTableRenderer에서 관리하므로 사용하지 않음
  isReordering,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDrop: handleDragDrop,
  cleanup: cleanupDragDrop,
} = useTableDragDrop({
  items: filteredClasses,
  onDrop: async (movedItem, targetRow, _newOrder, _sourceIndex, targetIndex) => {
    // 변경 전 이력 저장 (되돌리기용)
    const latestMovedItem = partClasses.value.find((item) => item.id === movedItem.id)
    reorderHistory.value = {
      items: [
        {
          id: Number(movedItem.id),
          sort_order: latestMovedItem?.sort_order || movedItem.sort_order || 0,
          sub_sort_order: latestMovedItem?.sub_sort_order || movedItem.sub_sort_order || 0,
        },
      ],
    }

    // 목표 위치의 주변 항목 찾기
    let newSortOrder

    if (targetIndex === 0) {
      // 첫 번째 위치로 이동
      const firstItem = filteredClasses.value[0]
      newSortOrder = (firstItem?.sort_order || 0) - 10
      if (newSortOrder < 0) newSortOrder = 0
    } else if (targetIndex >= filteredClasses.value.length - 1) {
      // 마지막 위치로 이동
      const lastItem = filteredClasses.value[filteredClasses.value.length - 1]
      newSortOrder = (lastItem?.sort_order || 0) + 10
    } else {
      // 중간 위치로 이동
      const prevItem = filteredClasses.value[targetIndex - 1]
      const nextItem = filteredClasses.value[targetIndex]

      const prevSortOrder = prevItem?.sort_order || 0
      const nextSortOrder = nextItem?.sort_order || prevSortOrder + 10

      newSortOrder = Math.round((prevSortOrder + nextSortOrder) / 2)

      if (newSortOrder <= prevSortOrder || newSortOrder >= nextSortOrder) {
        newSortOrder = prevSortOrder + 1
      }
    }

    // 변경된 항목만 업데이트
    const itemsToUpdate = [
      {
        id: Number(movedItem.id),
        sort_order: newSortOrder,
        sub_sort_order: 0,
      },
    ]

    // API 호출하여 순서 업데이트
    await partsDataStore.reorderPartClasses(itemsToUpdate)

    $q.notify({
      type: 'positive',
      message: '정렬 순서가 변경되었습니다.',
      position: 'top',
      timeout: 1500,
    })
  },
})

// 페이지네이션 제어 (composable 사용) - filteredClasses 정의 이후에 호출
const { handleCalculationComplete, setupPaginationWatchers, setKeepCurrentPage } = usePaginationControl({
  pagination,
  filteredClasses,
})

// 페이지네이션 watcher 설정 (composable에서 처리)
setupPaginationWatchers()

// URL 상태 동기화 (쿼리 파라미터와 상태 동기화)
// - 새로고침 시 상태 복원
// - 북마크 및 URL 공유 가능
// - 필터링 결과를 URL로 동기화 (검색어, 카테고리, 상태 필터)
const { clearState } = useURLStateManagement({
  stateMap: {
    search: searchText,
    category: selectedCategory,
    status: statusFilter,
  },
  clearOptions: {
    useNextTick: false, // PartClassesView에서는 직접 호출하므로 불필요
  },
})
// 키보드 이벤트 핸들러 (composable 사용)
const { setupKeyboardListeners, cleanupKeyboardListeners } = useTableKeyboard({
  filteredClasses,
  selectedRows,
  multiSelectMode,
  lastSelectedIndex,
  pagination,
  isSidebarDetailViewActive,
  exitSidebarDetailView: exitSidebarDetailViewWithSelectionClear,
  partsDataStore,
  clearSelection, // ESC 키로 선택 해제 시 multiSelectMode도 초기화
})

// 데이터 로드
async function loadData() {
  // 전역 스켈레톤 로더 표시 (심플 라인)
  showSkeleton({
    type: 'simple',
    message: '부품 분류를 불러오는 중...',
  })

  // 기존 로딩 상태도 유지 (테이블의 loading prop용)
  loading.value = true

  try {
    await partsDataStore.fetchPartClasses()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '데이터를 불러오는데 실패했습니다.',
      caption: error.message,
    })
  } finally {
    // 전역 스켈레톤 로더 숨기기
    hideSkeleton()
    loading.value = false
  }
}

// 마우스 이벤트 핸들러 (composable에서 가져온 함수 사용)
// 오버레이 위치 업데이트를 위해 래퍼 함수 사용
// DataTableRenderer는 (event, row) 형태로 emit하므로 두 인자를 모두 전달
function onRowMouseEnter(evt, row) {
  onRowMouseEnterComposable(evt, row)
}

function onRowMouseMove(evt, row) {
  onRowMouseMoveComposable(evt, row)
}

function onRowMouseLeave() {
  // onContainerMouseLeave에서 처리되므로 여기서는 아무것도 하지 않음
  // DataTableRenderer에서 emit되지만 실제로는 onContainerMouseLeave에서 처리됨
}

// 테이블 마우스 떠남 핸들러 (composable 사용)
function onTableMouseLeave(evt) {
  onContainerMouseLeaveComposable(evt)
}

// 작업 아이콘 오버레이 위치 업데이트 (마우스 위치 기준)
function updateActionsOverlayPositionFromMouse(evt) {
  if (!evt) return

  // 화면 오른쪽에서 26px 떨어진 위치 (16px + 10px)
  const right = 26
  // 마우스 Y 위치를 기준으로 오버레이 위치 설정 (아이콘 중앙이 마우스 위치에 오도록)
  const mouseY = evt.clientY
  const offsetY = 20 // 아이콘 높이의 절반 정도 (오버레이 중앙이 마우스 위치에 오도록)
  const top = mouseY - offsetY

  // 화면 경계 체크
  const maxTop = window.innerHeight - 60 // 최소 여유 공간
  const minTop = 10
  const finalTop = Math.max(minTop, Math.min(maxTop, top))

  actionsOverlayStyle.value = {
    top: `${finalTop}px`,
    right: `${right}px`,
    opacity: 1,
    visibility: 'visible',
  }
}

// 작업 아이콘 오버레이 위치 업데이트 (행 기준 - 호환성 유지)
function updateActionsOverlayPosition(row) {
  if (!row) return

  const rect = row.getBoundingClientRect()
  // 테이블 뷰와 카드 뷰 모두 지원
  const tableContainer = row.closest('.q-table__middle') || row.closest('.parts-table') || row.closest('.data-card-container')
  const containerRect = tableContainer?.getBoundingClientRect()

  if (!containerRect) return

  // 화면 오른쪽에서 26px 떨어진 위치 (16px + 10px)
  const right = 26
  // 행/카드의 중앙 높이
  const top = rect.top + rect.height / 2 - 20 // 아이콘 높이의 절반 정도

  // 화면 경계 체크
  const maxTop = window.innerHeight - 60 // 최소 여유 공간
  const minTop = 10
  const finalTop = Math.max(minTop, Math.min(maxTop, top))

  actionsOverlayStyle.value = {
    top: `${finalTop}px`,
    right: `${right}px`,
    opacity: 1,
    visibility: 'visible',
  }
}

// 마우스 위치 추적 (선택된 항목이 있을 때 오버레이 위치 업데이트용)
const mousePosition = ref({ x: 0, y: 0 })

// 마우스 이동 이벤트 핸들러
function handleMouseMove(event) {
  mousePosition.value = { x: event.clientX, y: event.clientY }

  // 선택된 항목이 있고 호버된 행이 없을 때만 마우스 위치에 따라 오버레이 업데이트
  if (selectedCount.value > 0 && !hoveredRowId.value) {
    const right = 26
    const offsetY = 20 // 마우스 커서에서 약간 위쪽에 표시
    const top = Math.max(10, Math.min(window.innerHeight - 60, event.clientY - offsetY))

    actionsOverlayStyle.value = {
      top: `${top}px`,
      right: `${right}px`,
    }
  }
}

// 선택된 항목이 있을 때 오버레이 위치 업데이트
function updateOverlayForSelectedItems() {
  if (selectedCount.value === 0) {
    // 선택된 항목이 없고 호버된 행도 없으면 숨김
    if (!hoveredRowId.value) {
      hideActionsOverlay()
    }
    return
  }

  // 호버된 행이 있으면 해당 행 위치에 표시
  if (hoveredRowId.value) {
    const hoveredRow = document.querySelector(`[data-row-id="${hoveredRowId.value}"]`)
    if (hoveredRow) {
      updateActionsOverlayPosition(hoveredRow)
      return
    }
  }

  // 선택된 첫 번째 항목의 위치에 오버레이 표시
  const firstSelectedId = selectedRows.value[0]?.id
  if (firstSelectedId) {
    const selectedRow = document.querySelector(`[data-row-id="${firstSelectedId}"]`)
    if (selectedRow) {
      updateActionsOverlayPosition(selectedRow)
    } else {
      // 선택된 행이 DOM에 없으면 (예: 필터링으로 숨겨진 경우) 마우스 위치 근처에 표시
      const right = 26
      const top = Math.max(10, Math.min(window.innerHeight - 60, mousePosition.value.y - 20))
      actionsOverlayStyle.value = {
        top: `${top}px`,
        right: `${right}px`,
      }
    }
  }
}

// 작업 아이콘 오버레이 숨기기
function hideActionsOverlay() {
  // 선택된 항목이 있으면 숨기지 않음
  if (selectedCount.value > 0) {
    updateOverlayForSelectedItems()
    return
  }

  hoveredRowId.value = null
  actionsOverlayStyle.value = {
    top: '0px',
    right: '26px',
  }
}

// 마우스가 작업 아이콘 위에 있는지 확인
const isMouseOverActionsOverlay = ref(false)
// 마우스 떠남 타이머
let mouseLeaveTimer = null

// 작업 아이콘 마우스 진입/떠남
function onActionsOverlayEnter() {
  isMouseOverActionsOverlay.value = true
  // 타이머 취소
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer)
    mouseLeaveTimer = null
  }
}

function onActionsOverlayLeave() {
  isMouseOverActionsOverlay.value = false
  // 약간의 지연 후 숨김 (다른 행으로 이동할 수 있으므로)
  mouseLeaveTimer = setTimeout(() => {
    if (!isMouseOverActionsOverlay.value) {
      hideActionsOverlay()
    }
  }, 150)
}

// 호버된 행 편집
function editHoveredClass() {
  if (!hoveredRowId.value) return
  const row = filteredClasses.value.find((c) => c.id === hoveredRowId.value)
  if (row) {
    editClass(row)
    hideActionsOverlay()
  }
}

// 호버된 행 삭제
function deleteHoveredClass() {
  if (!hoveredRowId.value) return
  const row = filteredClasses.value.find((c) => c.id === hoveredRowId.value)
  if (row) {
    deleteClass(row)
    hideActionsOverlay()
  }
}

// 호버된 행 아래에 끼워넣기
function insertBelowHoveredClass() {
  if (!hoveredRowId.value) return
  const row = filteredClasses.value.find((c) => c.id === hoveredRowId.value)
  if (row) {
    openInsertDialog('insert-below', row, true)
  }
}

// 선택된 항목 위에 끼워넣기
function handleInsertAbove() {
  if (selectedCount.value !== 1 || !selectedRowId.value) return
  const row = filteredClasses.value.find((c) => c.id === selectedRowId.value)
  if (row) {
    openInsertDialog('insert-above', row)
  }
}

// 선택된 항목 아래에 끼워넣기
function handleInsertBelow() {
  if (selectedCount.value !== 1 || !selectedRowId.value) return
  const row = filteredClasses.value.find((c) => c.id === selectedRowId.value)
  if (row) {
    openInsertDialog('insert-below', row)
  }
}

// 상단에 추가
function handleAddToTop() {
  openInsertDialog('add-to-top', null)
}

// 하단에 추가
function handleAddToBottom() {
  openInsertDialog('add-to-bottom', null)
}

// 드래그 앤 드롭 관련 함수는 useTableDragDrop composable에서 제공됨
// PartClasses 특화 로직(순서 계산, API 호출)은 composable의 콜백에서 처리됨

// 순서 변경 다이얼로그 열기
async function openReorderDialog() {
  if (selectedCount.value === 0 || selectedRows.value.length === 0) return

  // 중요: 다이얼로그가 열릴 때 DB에서 최신 데이터를 다시 가져와서 원래 값 보존
  // 이렇게 하면 이전에 변경된 값이 아닌 실제 DB의 현재 값을 저장할 수 있음
  try {
    // DB에서 최신 데이터 가져오기
    await partsDataStore.fetchPartClasses()

    // 선택된 항목들을 복사하되, DB에서 가져온 최신 sort_order 값 사용
    reorderTargets.value = selectedRows.value.map((row) => {
      // DB에서 가져온 최신 데이터 찾기
      const latestItem = partClasses.value.find((item) => item.id === row.id)
      const originalSortOrder = latestItem?.sort_order ?? row.sort_order ?? 0

      // 디버깅: 다이얼로그 열 때 값 확인
      if (import.meta.env.DEV) {
        console.log(`[되돌리기] 다이얼로그 열기 - 항목 ID ${row.id}:`, {
          DB에서가져온값: latestItem?.sort_order,
          selectedRows값: row.sort_order,
          저장할원래값: originalSortOrder,
          이름: row.name,
        })
      }

      const originalSubSortOrder = latestItem?.sub_sort_order ?? row.sub_sort_order ?? 0

      return {
        ...row,
        // DB에서 가져온 최신 sort_order와 sub_sort_order 값으로 덮어쓰기 (원래 값 보존)
        sort_order: originalSortOrder,
        sub_sort_order: originalSubSortOrder,
      }
    })

    openModal('reorder')
  } catch (error) {
    console.error('순서 변경 다이얼로그 열기 실패:', error)
    $q.notify({
      type: 'negative',
      message: '데이터를 불러오는데 실패했습니다.',
      caption: error.message,
    })
  }
}

// 순서 변경 다이얼로그 닫기
function closeReorderDialog() {
  if (!isReordering.value) {
    closeModal('reorder')
    reorderTargets.value = []
    // 모달이 닫힐 때 이력 초기화
    reorderHistory.value = null
  }
}

// 순서 변경 되돌리기
async function undoReorder() {
  if (!reorderHistory.value || !reorderHistory.value.items || reorderHistory.value.items.length === 0) {
    $q.notify({
      type: 'warning',
      message: '되돌릴 이력이 없습니다.',
      position: 'top',
      timeout: 1500,
    })
    return
  }

  try {
    isReordering.value = true

    // 이전 sort_order와 sub_sort_order 값으로 복원
    const itemsToRestore = reorderHistory.value.items.map((item) => ({
      id: item.id,
      sort_order: item.sort_order,
      sub_sort_order: item.sub_sort_order || 0,
    }))

    // 디버깅: 복원할 데이터 확인
    if (import.meta.env.DEV) {
      console.log('[되돌리기] 복원할 데이터 (전체):', JSON.stringify(itemsToRestore, null, 2))
      itemsToRestore.forEach((item) => {
        const found = partClasses.value.find((p) => p.id === item.id)
        console.log(`[되돌리기] 항목 ID ${item.id}:`, {
          복원할값: item.sort_order,
          현재값: found?.sort_order,
          이름: found?.name,
          일치여부: item.sort_order === found?.sort_order,
        })
      })
    }

    // 디버깅: API 호출 전 확인
    if (import.meta.env.DEV) {
      console.log('[되돌리기] API 호출 직전:', {
        itemsToRestore: JSON.stringify(itemsToRestore, null, 2),
        reorderHistory: JSON.stringify(reorderHistory.value, null, 2),
      })
    }

    await partsDataStore.reorderPartClasses(itemsToRestore)

    // fetchPartClasses 완료 후 데이터 확인 (약간의 지연 추가)
    await new Promise((resolve) => setTimeout(resolve, 200))

    // 디버깅: 복원 후 데이터 확인
    if (import.meta.env.DEV) {
      await nextTick()
      console.log('[되돌리기] 복원 후 데이터 확인:')
      itemsToRestore.forEach((item) => {
        const found = partClasses.value.find((p) => p.id === item.id)
        console.log(`[되돌리기] 항목 ID ${item.id}:`, {
          예상값: item.sort_order,
          실제값: found?.sort_order,
          이름: found?.name,
          일치여부: item.sort_order === found?.sort_order,
        })
      })
    }

    $q.notify({
      type: 'positive',
      message: '순서 변경이 되돌려졌습니다.',
      position: 'top',
      timeout: 1500,
    })

    // 이력 초기화 (되돌리기 완료 후)
    reorderHistory.value = null
  } catch (error) {
    console.error('되돌리기 오류:', error)
    $q.notify({
      type: 'negative',
      message: '되돌리기 중 오류가 발생했습니다.',
      position: 'top',
      timeout: 2000,
    })
  } finally {
    isReordering.value = false
  }
}

// 순서 변경 실행
async function executeReorder(position, scope) {
  if (reorderTargets.value.length === 0) return

  let targetList

  // 범위에 따라 대상 목록 결정
  if (scope === 'all') {
    // 전체 DB 기준
    targetList = partClasses.value
  } else {
    // 필터 기준
    targetList = filteredClasses.value
  }

  // 선택된 항목들이 목록에 모두 있는지 확인
  const validTargets = reorderTargets.value.filter((target) => targetList.some((item) => item.id === target.id))

  if (validTargets.length === 0) {
    $q.notify({
      type: 'negative',
      message: '선택된 항목을 찾을 수 없습니다.',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  try {
    isReordering.value = true

    // 변경 전 이력 저장 (되돌리기용) - 순서 변경 실행 직전에 현재 DB의 실제 값 저장
    // 중요: validTargets는 이미 필터링된 목록이므로, partClasses에서 최신 값을 가져와야 함
    reorderHistory.value = {
      items: validTargets.map((target) => {
        // partClasses에서 최신 데이터 찾기 (DB의 실제 현재 값)
        const currentItem = partClasses.value.find((item) => item.id === target.id)
        const originalSortOrder = currentItem?.sort_order ?? target.sort_order ?? 0
        const originalSubSortOrder = currentItem?.sub_sort_order ?? target.sub_sort_order ?? 0

        // 디버깅: 이력 저장 시점의 값 확인
        if (import.meta.env.DEV) {
          console.log(`[되돌리기] 이력 저장 - 항목 ID ${target.id}:`, {
            partClasses값: currentItem?.sort_order,
            target값: target.sort_order,
            reorderTargets값: reorderTargets.value.find((t) => t.id === target.id)?.sort_order,
            저장할값: originalSortOrder,
            이름: target.name,
          })
        }

        return {
          id: Number(target.id),
          sort_order: Number(originalSortOrder),
          sub_sort_order: Number(originalSubSortOrder),
        }
      }),
    }

    // 디버깅: 이력 저장 확인
    if (import.meta.env.DEV) {
      console.log('[되돌리기] 저장된 이력 (전체):', JSON.stringify(reorderHistory.value, null, 2))
      reorderHistory.value.items.forEach((item) => {
        const originalTarget = reorderTargets.value.find((t) => t.id === item.id)
        const targetItem = validTargets.find((t) => t.id === item.id)
        const foundInTargetList = targetList.find((p) => p.id === item.id)
        console.log(`[되돌리기] 항목 ID ${item.id} 저장 정보:`, {
          저장된값: item.sort_order,
          reorderTargets원래값: originalTarget?.sort_order,
          validTargets값: targetItem?.sort_order,
          targetList값: foundInTargetList?.sort_order,
          이름: originalTarget?.name,
        })
      })
    }

    const itemsToUpdate = []
    const selectedIds = new Set(validTargets.map((t) => t.id))

    // 전체 또는 필터 기준 처리
    if (position === 'top') {
      // 선택된 항목들을 제외한 나머지 항목들 중 첫 번째 항목 찾기
      const remainingItems = targetList.filter((item) => !selectedIds.has(item.id))

      let baseSortOrder
      if (remainingItems.length > 0) {
        // 선택되지 않은 첫 번째 항목의 sort_order - 10
        const firstRemainingItem = remainingItems[0]
        baseSortOrder = (firstRemainingItem?.sort_order || 0) - 10
        if (baseSortOrder < 0) baseSortOrder = 0
      } else {
        // 모든 항목이 선택된 경우: 0부터 시작
        baseSortOrder = 0
      }

      // 모든 선택된 항목에 동일한 sort_order와 sub_sort_order 값 할당 (최상위로 이동)
      validTargets.forEach((target) => {
        itemsToUpdate.push({
          id: Number(target.id),
          sort_order: baseSortOrder,
          sub_sort_order: 0,
        })
      })
    } else {
      // 선택된 항목들을 제외한 나머지 항목들 중 마지막 항목 찾기
      const remainingItems = targetList.filter((item) => !selectedIds.has(item.id))

      let baseSortOrder
      if (remainingItems.length > 0) {
        // 선택되지 않은 마지막 항목의 sort_order + 10
        const lastRemainingItem = remainingItems[remainingItems.length - 1]
        baseSortOrder = (lastRemainingItem?.sort_order || 0) + 10
      } else {
        // 모든 항목이 선택된 경우: 마지막 항목의 sort_order + 10
        const lastItem = targetList[targetList.length - 1]
        baseSortOrder = (lastItem?.sort_order || 0) + 10
      }

      // 모든 선택된 항목에 동일한 sort_order와 sub_sort_order 값 할당 (최하위로 이동)
      validTargets.forEach((target) => {
        itemsToUpdate.push({
          id: Number(target.id),
          sort_order: baseSortOrder,
          sub_sort_order: 0,
        })
      })
    }

    // API 호출하여 순서 업데이트
    await partsDataStore.reorderPartClasses(itemsToUpdate)

    const scopeText = scope === 'all' ? '전체 기준으로 ' : ''
    const positionText = position === 'top' ? '맨 위로' : '맨 아래로'
    const countText = validTargets.length > 1 ? ` (${validTargets.length}개)` : ''

    $q.notify({
      type: 'positive',
      message: `${scopeText}${positionText} 이동되었습니다${countText}.`,
      position: 'top',
      timeout: 1500,
    })

    // 모달 닫기
    closeReorderDialog()
  } catch (error) {
    console.error('순서 변경 오류:', error)
    $q.notify({
      type: 'negative',
      message: '순서 변경 중 오류가 발생했습니다.',
      position: 'top',
      timeout: 2000,
    })
  } finally {
    isReordering.value = false
  }
}

// 특정 항목 기준 이동
async function handleMoveToItem(position, targetItem) {
  if (reorderTargets.value.length === 0 || !targetItem) return

  try {
    isReordering.value = true

    // 변경 전 이력 저장 (되돌리기용)
    const validTargets = reorderTargets.value
    reorderHistory.value = {
      items: validTargets.map((target) => {
        const currentItem = partClasses.value.find((item) => item.id === target.id)
        const originalSortOrder = currentItem?.sort_order ?? target.sort_order ?? 0
        const originalSubSortOrder = currentItem?.sub_sort_order ?? target.sub_sort_order ?? 0

        return {
          id: Number(target.id),
          sort_order: Number(originalSortOrder),
          sub_sort_order: Number(originalSubSortOrder),
        }
      }),
    }

    // 전체 목록에서 대상 항목 찾기 (최신 데이터)
    const targetItemInList = partClasses.value.find((item) => item.id === targetItem.id)
    if (!targetItemInList) {
      $q.notify({
        type: 'negative',
        message: '대상 항목을 찾을 수 없습니다.',
        position: 'top',
        timeout: 2000,
      })
      return
    }

    const selectedIds = new Set(validTargets.map((t) => t.id))
    const itemsToUpdate = []

    // 대상 항목의 sort_order와 sub_sort_order
    const targetSortOrder = targetItemInList.sort_order || 0
    const targetSubSortOrder = targetItemInList.sub_sort_order || 0

    if (position === 'before') {
      // 대상 항목 앞으로 이동
      // 같은 sort_order를 가진 항목들 중에서 대상 항목보다 앞에 있는 항목 찾기
      const sameSortOrderItems = partClasses.value.filter((item) => !selectedIds.has(item.id) && (item.sort_order || 0) === targetSortOrder && (item.sub_sort_order || 0) < targetSubSortOrder).sort((a, b) => (b.sub_sort_order || 0) - (a.sub_sort_order || 0))

      let newSubSortOrder
      if (sameSortOrderItems.length > 0) {
        // 같은 sort_order 내에서 대상 항목보다 앞에 있는 항목이 있는 경우
        // 이전 항목의 sub_sort_order와 대상 항목의 sub_sort_order 사이의 값 사용
        const prevSubSortOrder = sameSortOrderItems[0].sub_sort_order || 0
        newSubSortOrder = Math.max(0, prevSubSortOrder)
      } else {
        // 같은 sort_order 내에서 대상 항목이 첫 번째인 경우
        // 대상 항목의 sub_sort_order를 사용 (같은 위치에 배치)
        newSubSortOrder = targetSubSortOrder
      }

      // 모든 선택된 항목에 동일한 sort_order와 sub_sort_order 값 할당
      validTargets.forEach((target) => {
        itemsToUpdate.push({
          id: Number(target.id),
          sort_order: targetSortOrder,
          sub_sort_order: newSubSortOrder,
        })
      })
    } else {
      // 대상 항목 뒤로 이동
      // 같은 sort_order를 가진 항목들 중에서 대상 항목보다 뒤에 있는 항목 찾기
      const sameSortOrderItems = partClasses.value.filter((item) => !selectedIds.has(item.id) && (item.sort_order || 0) === targetSortOrder && (item.sub_sort_order || 0) > targetSubSortOrder).sort((a, b) => (a.sub_sort_order || 0) - (b.sub_sort_order || 0))

      let newSubSortOrder
      if (sameSortOrderItems.length > 0) {
        // 같은 sort_order 내에서 대상 항목보다 뒤에 있는 항목이 있는 경우
        // 대상 항목의 sub_sort_order와 다음 항목의 sub_sort_order 사이의 값 사용
        const nextSubSortOrder = sameSortOrderItems[0].sub_sort_order || 0
        newSubSortOrder = nextSubSortOrder
      } else {
        // 같은 sort_order 내에서 대상 항목이 마지막인 경우
        // 대상 항목의 sub_sort_order + 1 사용
        newSubSortOrder = targetSubSortOrder + 1
      }

      // 모든 선택된 항목에 동일한 sort_order와 sub_sort_order 값 할당
      validTargets.forEach((target) => {
        itemsToUpdate.push({
          id: Number(target.id),
          sort_order: targetSortOrder,
          sub_sort_order: newSubSortOrder,
        })
      })
    }

    // API 호출하여 순서 업데이트
    await partsDataStore.reorderPartClasses(itemsToUpdate)

    const positionText = position === 'before' ? '앞으로' : '뒤로'
    const countText = validTargets.length > 1 ? ` (${validTargets.length}개)` : ''

    $q.notify({
      type: 'positive',
      message: `"${targetItem.name}"의 ${positionText} 이동되었습니다${countText}.`,
      position: 'top',
      timeout: 2000,
    })
  } catch (error) {
    console.error('특정 항목 기준 이동 오류:', error)
    $q.notify({
      type: 'negative',
      message: '순서 변경 중 오류가 발생했습니다.',
      position: 'top',
      timeout: 2000,
    })
  } finally {
    isReordering.value = false
  }
}

// 선택 관련 함수는 useMultiSelection composable에서 제공됨
// PartClasses 특화 로직은 composable의 콜백에서 처리됨

// 선택된 로우 편집
function editSelectedClass() {
  if (!selectedRowId.value) return
  const selectedClass = filteredClasses.value.find((c) => c.id === selectedRowId.value)
  if (selectedClass) {
    editClass(selectedClass)
  }
}

// 선택된 항목 복제 (범용 composable 사용)
function duplicateSelectedClass() {
  if (!selectedRowId.value) {
    $q.notify({
      type: 'warning',
      message: '복제할 항목을 선택해주세요.',
      position: 'top',
      timeout: 1000,
    })
    return
  }

  const selectedClass = filteredClasses.value.find((c) => c.id === selectedRowId.value)
  if (!selectedClass) {
    $q.notify({
      type: 'warning',
      message: '선택된 항목을 찾을 수 없습니다.',
      position: 'top',
      timeout: 1000,
    })
    return
  }

  // 범용 composable 사용
  duplicateTableItem(selectedClass, {
    excludeFields: ['id', 'created_at', 'updated_at'],
  })
}

// 컨텍스트 메뉴: 행에서 우클릭
function handleRowContextMenu(evt, row) {
  evt.preventDefault()
  evt.stopPropagation()

  // 행 선택 (단일 선택) - composable 함수 사용
  if (!selectedRows.value.find((r) => r.id === row.id)) {
    // composable의 selectRow는 내부적으로 사용하므로 직접 selectedRows 업데이트
    selectedRows.value = [row]
    const rowIndex = filteredClasses.value.findIndex((r) => r.id === row.id)
    lastSelectedIndex.value = rowIndex
  }
  partsDataStore.selectedPartClass = row

  // 메뉴 아이템 생성 (다음 틱에서 선택 상태 반영)
  nextTick(() => {
    const items = getPartClassesContextMenuItems({
      selectedRow: row,
      selectedRows: selectedRows.value,
      selectedRowId: selectedRowId.value,
      selectedCount: selectedCount.value,
      hasActiveFilter: hasActiveFilter.value,
      activateStatusMenuLabel: activateStatusMenuLabel.value,
      favoriteMenuItemLabel: favoriteMenuItemLabel.value,
      printMenuLabel: printMenuLabel.value,
      exportMenuLabel: exportMenuLabel.value,
      disabledMenuItemColor,
      context: { mode: 'single' },
    })

    showContextMenu(evt, items)
  })
}

// 컨텍스트 메뉴: 일반 영역에서 우클릭
function handleContextMenu(evt) {
  evt.preventDefault()
  evt.stopPropagation()

  // 메뉴 아이템 생성
  const items = getPartClassesContextMenuItems({
    selectedRow: null,
    selectedRows: selectedRows.value,
    selectedRowId: selectedRowId.value,
    selectedCount: selectedCount.value,
    hasActiveFilter: hasActiveFilter.value,
    activateStatusMenuLabel: activateStatusMenuLabel.value,
    favoriteMenuItemLabel: favoriteMenuItemLabel.value,
    printMenuLabel: printMenuLabel.value,
    exportMenuLabel: exportMenuLabel.value,
    disabledMenuItemColor,
    context: { mode: selectedRows.value.length > 0 ? 'multiple' : 'none' },
  })

  showContextMenu(evt, items)
}

// 컨텍스트 메뉴: 표시 상태 변경 처리
function handleContextMenuVisibilityChange(visible) {
  if (!visible) {
    hideContextMenu()
  }
}

// 컨텍스트 메뉴: 아이템 클릭 처리
// eslint-disable-next-line no-unused-vars
function handleMenuItemClick(item, _event) {
  switch (item.action) {
    // 기본 작업
    case 'insert-above':
      handleInsertAbove()
      break
    case 'insert-below':
      handleInsertBelow()
      break
    case 'edit':
      editSelectedClass()
      break
    case 'delete':
      deleteSelectedClass()
      break
    case 'reorder':
      openReorderDialog()
      break
    case 'duplicate':
      duplicateSelectedClass()
      break

    // 상태 관리
    case 'toggle-activate':
      toggleActivateStatus()
      break
    case 'toggle-favorite':
      toggleFavorite()
      break

    // 조회
    case 'view-detail':
      openDetailModal()
      break
    case 'view-history':
      openHistoryDialog()
      break
    case 'view-related':
      openRelatedPartsDialog()
      break

    // 출력/내보내기/공유
    case 'share':
      openShareUrlDialog()
      break
    case 'print-barcode':
      openPrintModal('barcode')
      break
    case 'print-qrcode':
      openPrintModal('qrcode')
      break
    case 'print-label':
      openPrintModal('label')
      break
    case 'print-data':
      openPrintModal('data-print')
      break
    case 'export':
      exportData()
      break

    // 위치 관리
    case 'location-info':
      // TODO: 위치 정보 관리 기능 구현
      $q.notify({ message: '위치 정보 관리 기능은 준비 중입니다.', type: 'info' })
      break
    case 'location-move':
      // TODO: 위치 이동 기능 구현
      $q.notify({ message: '위치 이동 기능은 준비 중입니다.', type: 'info' })
      break
    case 'location-duplicate':
      // TODO: 위치 복제 기능 구현
      $q.notify({ message: '위치 복제 기능은 준비 중입니다.', type: 'info' })
      break

    // 재고 관리
    case 'inventory':
      // TODO: 재고 관리 기능 구현
      $q.notify({ message: '재고 관리 기능은 준비 중입니다.', type: 'info' })
      break

    // 추가 메뉴
    case 'add-to-top':
      handleAddToTop()
      break
    case 'add-to-bottom':
      handleAddToBottom()
      break
    case 'refresh':
      partsDataStore.fetchPartClasses()
      break
    default:
      console.warn('[ContextMenu] Unknown action:', item.action)
  }

  hideContextMenu()
}

// 선택된 로우 삭제
function deleteSelectedClass() {
  // 선택된 행이 없으면 종료
  if (!selectedRows.value || selectedRows.value.length === 0) {
    if (!selectedRowId.value) return
  }

  // 복수 선택 우선: selectedRows를 기반으로 삭제 대상 구성
  if (selectedRows.value && selectedRows.value.length > 1) {
    // 현재 필터된 목록에서 선택된 ID에 해당하는 실제 객체만 모음
    const selectedIdSet = new Set(selectedRows.value.map((row) => row.id))
    deleteTargets.value = filteredClasses.value.filter((row) => selectedIdSet.has(row.id))
    isDeleteCompleted.value = false
    showDeleteDialog.value = true
    return
  }

  // 단일 선택 (selectedRowId 기준)
  const targetId = selectedRows.value?.[0]?.id || selectedRowId.value
  if (!targetId) return

  const selectedClass = filteredClasses.value.find((c) => c.id === targetId)
  if (selectedClass) {
    deleteClass(selectedClass)
    // 삭제 후 선택 해제는 실제 삭제(confirmDelete) 후 loadData에서 자연스럽게 정리됨
  }
}

// 편집
function editClass(item) {
  editingClass.value = item
  resetInsertMode()
  openModal('add')
}

// 삭제 확인 모달 열기
function deleteClass(item) {
  deleteTargets.value = item ? [item] : []
  isDeleteCompleted.value = false
  showDeleteDialog.value = true
}

// 삭제된 항목 ID 추적 (다중 삭제 시 흐려지게 표시용)
const deletedItems = ref(new Set())

// 삭제 확인 및 실행
async function confirmDelete() {
  // 이미 삭제 진행 중이면 재실행 방지
  if (isDeleting.value) return
  if (!deleteTargets.value || deleteTargets.value.length === 0) return

  try {
    isDeleting.value = true
    isDeleteCompleted.value = false
    deletedItems.value.clear() // 삭제 시작 시 초기화

    if (deleteTargets.value.length === 1) {
      // 단일 삭제: 기존 로직 유지
      const target = deleteTargets.value[0]
      await partsDataStore.deletePartClass(target.id)

      // 사이드바에서 즉시 제거 (실시간 업데이트)
      const deletedId = target.id
      partsDataStore.selectedPartClasses = partsDataStore.selectedPartClasses.filter((item) => item.id !== deletedId)
      if (partsDataStore.selectedPartClass?.id === deletedId) {
        partsDataStore.selectedPartClass = null
      }
      selectedRows.value = selectedRows.value.filter((item) => item.id !== deletedId)

      // 현재 페이지 유지 플래그 설정 (유효 범위를 벗어나면 자동 조정)
      setKeepCurrentPage()

      // 휴지통 수량 업데이트
      await partsDataStore.fetchTrashCount().catch(() => {})

      // 데이터 다시 로드 (watch가 페이지 조정 처리)
      await loadData()

      // 모달 닫기 (단일은 자동 닫기)
      showDeleteDialog.value = false
      deleteTargets.value = []
      deletedItems.value.clear()

      $q.notify({
        type: 'positive',
        message: '삭제되었습니다.',
      })
      isDeleteCompleted.value = true
    } else {
      // 복수 삭제: 각 항목을 순차적으로 삭제 (서버 bulk API 대신 안정적인 단건 API 재사용)
      let successCount = 0
      let failCount = 0
      const deletedIds = []

      for (const item of deleteTargets.value) {
        try {
          await partsDataStore.deletePartClass(item.id)
          deletedItems.value.add(item.id) // 삭제 완료된 항목 추적
          deletedIds.push(item.id)
          successCount++
        } catch (e) {
          console.error('[confirmDelete] 복수 삭제 중 단일 삭제 실패:', e)
          failCount++
        }
      }

      // 사이드바에서 즉시 제거 (실시간 업데이트)
      partsDataStore.selectedPartClasses = partsDataStore.selectedPartClasses.filter((item) => !deletedIds.includes(item.id))
      if (partsDataStore.selectedPartClass && deletedIds.includes(partsDataStore.selectedPartClass.id)) {
        partsDataStore.selectedPartClass = null
      }
      selectedRows.value = selectedRows.value.filter((item) => !deletedIds.includes(item.id))

      // 현재 페이지 유지 플래그 설정 (유효 범위를 벗어나면 자동 조정)
      setKeepCurrentPage()

      // 휴지통 수량 업데이트
      await partsDataStore.fetchTrashCount().catch(() => {})

      // 데이터 다시 로드
      await loadData()

      $q.notify({
        type: failCount === 0 ? 'positive' : 'warning',
        message: failCount === 0 ? `${successCount}개 항목이 삭제되었습니다.` : `총 ${deleteTargets.value.length}개 중 ${successCount}개 삭제, ${failCount}개 실패했습니다.`,
      })
      // 복수 삭제는 모달을 유지(사용자가 직접 닫기)하므로 deleteTargets는 그대로 두어 목록을 확인할 수 있게 함
      isDeleteCompleted.value = true
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '삭제에 실패했습니다.',
      caption: error.message,
    })
  } finally {
    isDeleting.value = false
  }
}

// 삭제 다이얼로그 닫기 및 상태 초기화
function closeDeleteDialog() {
  closeModal('delete')
  deleteTargets.value = []
  isDeleting.value = false
  isDeleteCompleted.value = false
  deletedItems.value.clear()
}

// 되돌리기 (복원) 함수
async function restoreDeletedItems() {
  if (isDeleting.value) return
  if (deletedItems.value.size === 0) return

  try {
    isDeleting.value = true
    const idsToRestore = Array.from(deletedItems.value)

    if (idsToRestore.length === 1) {
      // 단일 복원
      await partsDataStore.restorePartClass(idsToRestore[0])
    } else {
      // 복수 복원
      await partsDataStore.bulkRestorePartClasses(idsToRestore)
    }

    // 복원 완료 후 상태 초기화
    deletedItems.value.clear()
    isDeleteCompleted.value = false

    // 휴지통 수량 업데이트
    await partsDataStore.fetchTrashCount().catch(() => {})

    // 데이터 다시 로드
    await loadData()

    $q.notify({
      type: 'positive',
      message: `${idsToRestore.length}개 항목이 복원되었습니다.`,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '복원에 실패했습니다.',
      caption: error.message,
    })
  } finally {
    isDeleting.value = false
  }
}

// 모달 저장 완료 핸들러
async function handleAddEditSaved(savedClass) {
  // 데이터 다시 로드
  await loadData()

  if (savedClass) {
    // 수정된 항목이 있는 페이지로 이동
    const updatedItemIndex = filteredClasses.value.findIndex((c) => c.id === savedClass.id)
    if (updatedItemIndex !== -1) {
      const rowsPerPage = pagination.value.rowsPerPage
      const targetPage = Math.ceil((updatedItemIndex + 1) / rowsPerPage) || 1
      pagination.value.page = targetPage

      // 수정된 ROW 하이라이트를 위한 플래그 설정
      nextTick(() => {
        const rowElement = document.querySelector(`[data-row-id="${savedClass.id}"]`)
        if (rowElement) {
          rowElement.classList.add('updated-row-highlight')
          setTimeout(() => {
            rowElement.classList.remove('updated-row-highlight')
          }, 2000)
        }
      })
    }
  }

  // 편집 후 선택 해제
  selectedRows.value = []
  editingClass.value = null
  // 끼워넣기 모드 초기화
  resetInsertMode()
}

// 모달 취소 핸들러
function handleAddEditCancel() {
  editingClass.value = null
  resetInsertMode()
}

// 모달 저장 완료 핸들러에서 끼워넣기 모드 초기화 추가

// 순서 재정렬 (10단위로 재정렬)
const isReinitializingSortOrder = ref(false)
async function reinitializeSortOrder() {
  try {
    isReinitializingSortOrder.value = true

    // 재정렬 전 현재 상태 확인
    if (import.meta.env.DEV) {
      console.log('[재정렬] 재정렬 전 상태:', {
        총항목수: partClasses.value.length,
        sort_order분포: partClasses.value.reduce((acc, item) => {
          const so = item.sort_order || 0
          acc[so] = (acc[so] || 0) + 1
          return acc
        }, {}),
      })
    }

    const result = await partsDataStore.reinitializeSortOrder()

    // 재정렬 후 데이터 확인
    await nextTick()
    if (import.meta.env.DEV) {
      console.log('[재정렬] 재정렬 후 상태:', {
        총항목수: partClasses.value.length,
        sort_order분포: partClasses.value.reduce((acc, item) => {
          const so = item.sort_order || 0
          acc[so] = (acc[so] || 0) + 1
          return acc
        }, {}),
      })
    }

    $q.notify({
      type: 'positive',
      message: `${result.count}개 항목이 10단위로 재정렬되었습니다.`,
      position: 'top',
      timeout: 2000,
    })
  } catch (error) {
    console.error('순서 재정렬 오류:', error)
    $q.notify({
      type: 'negative',
      message: '순서 재정렬 중 오류가 발생했습니다.',
      caption: error.message,
      position: 'top',
      timeout: 2000,
    })
  } finally {
    isReinitializingSortOrder.value = false
  }
}

// 내보내기 (선택 여부에 따라 해당 항목 또는 전체)
function exportData() {
  openModal('exportPrint')
}

// 활성화/비활성화 (선택 여부에 따라 해당 항목 또는 필터 결과)
function toggleActivateStatus() {
  // 데이터 준비
  let targets = []
  if (selectedCount.value > 0) {
    targets = selectedRows.value
  } else if (hasActiveFilter.value) {
    targets = filteredClasses.value
  }

  if (targets.length === 0) return

  //[주의] 주석을 삭제하지 마시오!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // 관리 버튼의 활성화/비활성화 결정: 하나라도 비활성화되어 있으면 "활성화", 모두 활성화되어 있으면 "비활성화"
  // 비활성화는 특별한 상태이므로, 하나라도 비활성화된 항목이 있으면 활성화하는 것이 직관적
  const inactiveCount = targets.filter((item) => !item.is_active || item.is_active === 0).length
  activateStatusType.value = inactiveCount > 0 ? 'activate' : 'deactivate'

  activateStatusTargets.value = targets
  openModal('activateStatus')
}

// 활성화/비활성화 다이얼로그 닫기
function closeActivateStatusDialog() {
  if (!isTogglingStatus.value) {
    closeModal('activateStatus')
    activateStatusTargets.value = []
  }
}

// 활성화/비활성화 확인 및 실행
async function confirmToggleActivateStatus() {
  if (isTogglingStatus.value) return
  if (!activateStatusTargets.value || activateStatusTargets.value.length === 0) return

  try {
    isTogglingStatus.value = true
    const isActivating = activateStatusType.value === 'activate'

    if (activateStatusTargets.value.length === 1) {
      // 단일 활성화/비활성화
      const target = activateStatusTargets.value[0]
      await partsDataStore.togglePartClassActiveStatus(target.id, isActivating)
    } else {
      // 복수 활성화/비활성화
      const ids = activateStatusTargets.value.map((item) => item.id)
      await partsDataStore.bulkTogglePartClassesActiveStatus(ids, isActivating)
    }

    // 선택 해제 (UI 갱신을 위해)
    selectedRows.value = []

    // updatePartClass가 이미 로컬 상태를 업데이트하므로 loadData() 호출 불필요
    // 다만 Vue의 반응성을 보장하기 위해 nextTick 사용
    await nextTick()

    $q.notify({
      type: 'positive',
      message: `${activateStatusCount.value}개 항목이 ${isActivating ? '활성화' : '비활성화'}되었습니다.`,
    })

    // 모달 닫기
    closeModal('activateStatus')
    activateStatusTargets.value = []
  } catch (error) {
    console.error('활성화/비활성화 오류:', error)
    $q.notify({
      type: 'negative',
      message: '상태 변경 중 오류가 발생했습니다.',
      caption: error.message,
    })
  } finally {
    isTogglingStatus.value = false
  }
}

// 즐겨찾기 (선택 항목만 지원)
function toggleFavorite() {
  if (selectedCount.value === 0) return

  // 선택된 항목만 대상
  const targets = selectedRows.value

  // 즐겨찾기 추가/제거 결정: 하나라도 즐겨찾기가 아니면 "추가", 모두 즐겨찾기면 "제거"
  // 활성/비활성화와 동일한 로직: 특별한 상태(즐겨찾기)가 하나라도 없으면 추가하는 것이 직관적
  const notFavoriteCount = targets.filter((item) => !item.is_favorite || item.is_favorite === 0).length
  favoriteType.value = notFavoriteCount > 0 ? 'add' : 'remove'

  favoriteTargets.value = targets
  openModal('favorite')
}

// 즐겨찾기 다이얼로그 닫기
function closeFavoriteDialog() {
  if (!isTogglingFavorite.value) {
    closeModal('favorite')
    favoriteTargets.value = []
  }
}

// 즐겨찾기 확인 및 실행
async function confirmToggleFavorite() {
  if (isTogglingFavorite.value) return
  if (!favoriteTargets.value || favoriteTargets.value.length === 0) return

  try {
    isTogglingFavorite.value = true
    const isAdding = favoriteType.value === 'add'

    if (favoriteTargets.value.length === 1) {
      // 단일 즐겨찾기 토글
      const target = favoriteTargets.value[0]
      await partsDataStore.togglePartClassFavoriteStatus(target.id, isAdding)
    } else {
      // 복수 즐겨찾기 토글
      const ids = favoriteTargets.value.map((item) => item.id)
      await partsDataStore.bulkTogglePartClassesFavoriteStatus(ids, isAdding)
    }

    // 선택 해제 (UI 갱신을 위해)
    selectedRows.value = []

    // updatePartClass가 이미 로컬 상태를 업데이트하므로 loadData() 호출 불필요
    // 다만 Vue의 반응성을 보장하기 위해 nextTick 사용
    await nextTick()

    $q.notify({
      type: 'positive',
      message: `${favoriteTargets.value.length}개 항목이 즐겨찾기에 ${isAdding ? '추가' : '제거'}되었습니다.`,
    })

    // 모달 닫기
    closeModal('favorite')
    favoriteTargets.value = []
  } catch (error) {
    console.error('즐겨찾기 오류:', error)
    $q.notify({
      type: 'negative',
      message: '즐겨찾기 변경 중 오류가 발생했습니다.',
      caption: error.message,
    })
  } finally {
    isTogglingFavorite.value = false
  }
}

// 상세보기 모달 열기
function openDetailModal() {
  if (selectedCount.value !== 1 || !selectedRows.value[0]) return
  detailModalTarget.value = selectedRows.value[0]
  openModal('detail')
}

// 공유 URL 다이얼로그 열기 (필터/선택/조합 자동 판단)
function openShareUrlDialog() {
  // 필터 또는 선택이 하나라도 있으면 열기
  // selectedRows를 직접 확인하여 더 정확하게 판단
  const hasSelection = selectedRows.value && selectedRows.value.length > 0
  if (hasActiveFilter.value || hasSelection) {
    openModal('shareUrl')
  } else {
    $q.notify({
      type: 'warning',
      message: '공유할 항목이 없습니다. 필터를 적용하거나 항목을 선택해주세요.',
      position: 'top',
      timeout: 2000,
    })
  }
}

// 필터 조건 객체 (공유 URL용)
const filterConditions = computed(() => {
  const conditions = {}
  if (searchText.value) {
    conditions.search = searchText.value
  }
  if (selectedCategory.value) {
    conditions.category = selectedCategory.value
  }
  if (statusFilter.value) {
    conditions.status = statusFilter.value
  }
  return Object.keys(conditions).length > 0 ? conditions : null
})

// 현재 필터 상태 (프리셋 저장용)
const currentFilterState = computed(() => {
  return {
    searchText: searchText.value || '',
    category: selectedCategory.value || null,
    statusFilter: statusFilter.value || null,
    selectedSearchFields: selectedSearchFields.value || [],
  }
})

// 필터 프리셋 불러오기
function handleLoadPreset(preset) {
  if (!preset || !preset.filterState) return

  const state = preset.filterState
  // 프리셋에 저장된 상태로 완전히 교체 (값이 없으면 초기화)
  searchText.value = state.searchText !== undefined ? state.searchText : ''
  selectedCategory.value = state.category !== undefined ? state.category : null
  statusFilter.value = state.statusFilter !== undefined ? state.statusFilter : null
  // 검색 필드 선택도 프리셋에 저장되어 있으면 적용
  if (state.selectedSearchFields !== undefined) {
    selectedSearchFields.value = state.selectedSearchFields
  }

  $q.notify({
    type: 'positive',
    message: `프리셋 "${preset.name}"을 불러왔습니다.`,
    position: 'top',
    timeout: 1500,
  })
}

// 필터 프리셋 저장
function handleSavePreset(preset) {
  $q.notify({
    type: 'positive',
    message: `프리셋 "${preset.name}"이 저장되었습니다.`,
    position: 'top',
    timeout: 1500,
  })
}

// 필터 프리셋 삭제
// eslint-disable-next-line no-unused-vars
function handleRemovePreset(presetId) {
  $q.notify({
    type: 'info',
    message: '프리셋이 삭제되었습니다.',
    position: 'top',
    timeout: 1500,
  })
}

// 상세보기 모달 닫기
function closeDetailModal() {
  closeModal('detail')
  detailModalTarget.value = null
}

// 변경 이력 다이얼로그 열기
function openHistoryDialog() {
  if (selectedCount.value !== 1 || !selectedRows.value[0]) return
  historyTarget.value = selectedRows.value[0]
  openModal('history')
}

// 변경 이력 다이얼로그 닫기
function closeHistoryDialog() {
  closeModal('history')
  historyTarget.value = null
}

// 관련 부품 보기 다이얼로그 열기
function openRelatedPartsDialog() {
  if (selectedCount.value !== 1 || !selectedRows.value[0]) return
  relatedPartsTarget.value = selectedRows.value[0]
  openModal('relatedParts')
}

// 관련 부품 보기 다이얼로그 닫기
function closeRelatedPartsDialog() {
  closeModal('relatedParts')
  relatedPartsTarget.value = null
}

// 출력 모달 열기
function openPrintModal(mode) {
  if (mode === 'data-print') {
    // 데이터 인쇄 모드: 항상 허용 (선택/필터 없어도 전체 인쇄 가능)
    printModalMode.value = mode
    printModalTargets.value = selectedCount.value > 0 ? [...selectedRows.value] : []
    openModal('print')
  } else {
    // 물리적 출력 모드: 선택 필수
    if (selectedCount.value === 0 || selectedRows.value.length === 0) return
    printModalMode.value = mode
    printModalTargets.value = [...selectedRows.value]
    openModal('print')
  }
}

// 출력 모달 닫기
function closePrintModal() {
  closeModal('print')
  printModalTargets.value = []
}

// 인쇄 확인 처리 (PrintModal에서 발생)
async function handlePrintConfirm({ options, columns, formatting, type, onWindowOpen }) {
  try {
    // 데이터 준비
    let dataToProcess = []
    switch (type) {
      case 'selected':
        dataToProcess = selectedRows.value
        break
      case 'filtered':
        dataToProcess = filteredClasses.value
        break
      case 'all':
        dataToProcess = partClasses.value
        break
    }

    if (dataToProcess.length === 0) {
      $q.notify({
        type: 'warning',
        message: '인쇄할 데이터가 없습니다.',
        position: 'top',
        timeout: 2000,
      })
      return
    }

    // 인쇄 옵션 업데이트
    printOptions.value = { ...options }

    // 인쇄 실행
    const { printData } = await import('src/system/utils/print/index.js')
    printData({
      data: dataToProcess,
      columnDefinitions: partClassesFields,
      columns: columns || [],
      options: options || {},
      formattingOptions: formatting || {},
      onWindowOpen: () => {
        // 인쇄 창이 열리면 PrintModal의 isPrinting 상태 리셋
        if (onWindowOpen) {
          onWindowOpen()
        }
      },
      onClose: () => {
        // 인쇄 창이 닫혀도 모달은 유지 (사용자가 설정을 다시 수정할 수 있도록)
        // isPrinting 상태는 PrintModal에서 자동으로 리셋됨
      },
    })

    // 인쇄 창이 열렸음을 알림 (에러가 발생하지 않았다면)
    $q.notify({
      type: 'positive',
      message: '인쇄 미리보기 창이 열렸습니다.',
      position: 'top',
      timeout: 1500,
    })
  } catch (error) {
    console.error('인쇄 오류:', error)
    $q.notify({
      type: 'negative',
      message: error.message || '인쇄 중 오류가 발생했습니다.',
      position: 'top',
      timeout: 2000,
    })
  }
}

// 내보내기 다이얼로그 닫기
function closeExportPrintDialog() {
  if (!isExporting.value) {
    showExportPrintDialog.value = false
    exportFormat.value = 'csv' // 기본값으로 리셋
  }
}

// 미리보기 데이터 가져오기
function getPreviewData() {
  let dataToProcess = []
  switch (exportType.value) {
    case 'selected':
      dataToProcess = selectedRows.value
      break
    case 'filtered':
      dataToProcess = filteredClasses.value
      break
    case 'all':
      dataToProcess = partClasses.value
      break
  }
  return dataToProcess
}

// 내보내기 확인 및 실행
async function confirmExportPrint(exportOptions) {
  if (isExporting.value) return

  try {
    isExporting.value = true

    // 데이터 준비
    let dataToProcess = []
    switch (exportType.value) {
      case 'selected':
        dataToProcess = selectedRows.value
        break
      case 'filtered':
        dataToProcess = filteredClasses.value
        break
      case 'all':
        dataToProcess = partClasses.value
        break
    }

    if (dataToProcess.length === 0) {
      $q.notify({
        type: 'warning',
        message: '내보낼 데이터가 없습니다.',
        position: 'top',
        timeout: 2000,
      })
      return
    }

    // 내보내기 실행
    await exportDataUtil({
      data: dataToProcess,
      columns: exportOptions.columns || [],
      columnDefinitions: partClassesFields,
      format: exportOptions.format || 'csv',
      type: exportType.value,
      count: dataToProcess.length,
      tableName: '부품분류',
      options: {
        csv: exportOptions.csv || {},
        excel: exportOptions.excel || {},
        pdf: exportOptions.pdf || {},
      },
      formattingOptions: exportOptions.formatting || {},
      onProgress: (progress) => {
        // 진행률 업데이트 (필요시 사용)
        console.log('내보내기 진행률:', progress)
      },
    })

    $q.notify({
      type: 'positive',
      message: `${exportTypeLabel.value} 완료되었습니다.`,
      position: 'top',
      timeout: 1500,
    })

    // 모달 닫기
    showExportPrintDialog.value = false
    exportFormat.value = 'csv'
    // 인쇄 옵션 기본값으로 리셋
    printOptions.value = {
      paperSize: 'a4',
      orientation: 'portrait',
      color: 'color',
      pages: 'all',
      pageRange: '',
    }
  } catch (error) {
    console.error('내보내기 오류:', error)
    $q.notify({
      type: 'negative',
      message: error.message || '내보내기 중 오류가 발생했습니다.',
      position: 'top',
      timeout: 2000,
    })
  } finally {
    isExporting.value = false
  }
}

// 검색 초기화
function clearSearch() {
  searchText.value = ''
}

// 필터 초기화
function clearFilter() {
  searchText.value = ''
  selectedCategory.value = null
  statusFilter.value = null
}

// 공유 URL 필터 초기화 (전체 목록 보기)
function clearSharedUrlFilter() {
  clearState(['selected'])
}

// 전체 필터 초기화
function clearAllFilters() {
  searchText.value = ''
  selectedCategory.value = null
  statusFilter.value = null
}

// 뷰 모드 변경
function handleViewModeChange(mode) {
  currentViewMode.value = mode
  // localStorage에 저장
  try {
    const storageKey = 'part-classes-view-mode'
    localStorage.setItem(storageKey, mode)
    // 구형 키 제거 (마이그레이션)
    const oldKey = 'NEXA-part-classes-view-mode'
    if (localStorage.getItem(oldKey)) {
      localStorage.removeItem(oldKey)
    }
  } catch (error) {
    console.error('뷰 모드 저장 실패:', error)
  }
  $q.notify({
    type: 'info',
    message: `${getViewModeLabel(mode)}로 전환되었습니다.`,
    position: 'top',
    timeout: 1000,
  })
}

// 뷰 모드 라벨 가져오기
function getViewModeLabel(mode) {
  const labels = {
    table: '테이블 뷰',
    card: '카드 뷰',
    list: '리스트 뷰',
    chart: '차트 뷰',
    // Phase 3: 비활성화된 뷰모드 (렌더러 없음 또는 미구현)
    // gallery: '갤러리 뷰', // 보류
    // timeline: '타임라인 뷰', // 보류
    // layout: '레이아웃 뷰', // 제거 권장
    // compact: '컴팩트 뷰', // 제거 권장
  }
  return labels[mode] || '테이블 뷰'
}

// 뷰 모드 설정 모달 열기
function openViewModeSettings() {
  openModal('viewModeSettings')
}

// 뷰 모드 설정 실시간 변경 (프리뷰용)
// - ViewModeSettingsModal에서 settings-change 이벤트를 통해 전달됨
// - 현재는 테이블 뷰 설정만 사용
function handleViewModeSettingsChange(payload) {
  if (!payload || !payload.viewMode || !payload.settings) {
    return
  }

  // 테이블 뷰 설정 실시간 프리뷰
  if (payload.viewMode === VIEW_MODES.TABLE) {
    tableViewSettings.value = { ...payload.settings }
  }

  // 카드 뷰 설정 실시간 프리뷰
  if (payload.viewMode === VIEW_MODES.CARD) {
    cardViewSettings.value = { ...payload.settings }
  }
  if (payload.viewMode === VIEW_MODES.LIST) {
    listViewSettings.value = { ...payload.settings }
  }
  if (payload.viewMode === VIEW_MODES.CHART) {
    chartViewSettings.value = { ...payload.settings }
  }
}

// 뷰 모드 설정 저장 (localStorage에 저장된 값을 최종 확정하는 역할)
function handleViewModeSettingsSave(settings) {
  // localStorage에서 최신 설정을 다시 로드하여 반영
  // (ViewModeSettingsModal에서 이미 localStorage에 저장했으므로)
  if (settings.table) {
    tableViewSettings.value = loadViewModeSettings(viewModeSettingsStorageKey, VIEW_MODES.TABLE)
  }
  if (settings.card) {
    cardViewSettings.value = loadViewModeSettings(viewModeSettingsStorageKey, VIEW_MODES.CARD)
  }
  if (settings.list) {
    listViewSettings.value = loadViewModeSettings(viewModeSettingsStorageKey, VIEW_MODES.LIST)
  }
  if (settings.chart) {
    chartViewSettings.value = loadViewModeSettings(viewModeSettingsStorageKey, VIEW_MODES.CHART)
  }
}

// TODO: 테이블에서 직접 정렬 변경 시 설정 업데이트 및 저장
// - 테이블 헤더 클릭으로 정렬 변경 시 자동으로 설정에 저장
// - 이후 페이지 로드 시 저장된 정렬 설정이 자동 적용
// function handleTableViewSettingsUpdate(newSettings) {
//   tableViewSettings.value = { ...newSettings }
//   saveViewModeSettings(viewModeSettingsStorageKey, VIEW_MODES.TABLE, newSettings)
// }

// 유틸리티 함수는 tableUtils.js에서 import하여 사용

// 스크롤 이벤트 처리
function handleScroll() {
  if (hoveredRowId.value) {
    const row = document.querySelector(`[data-row-id="${hoveredRowId.value}"]`)
    if (row) {
      updateActionsOverlayPosition(row)
    } else {
      hideActionsOverlay()
    }
  } else if (selectedCount.value > 0) {
    // 선택된 항목이 있을 때도 위치 업데이트
    updateOverlayForSelectedItems()
  }
}

// 선택된 항목 변경 감지: 오버레이 위치 업데이트 및 store 동기화
watch(
  () => selectedRows.value,
  (newRows) => {
    // 실제 클릭 선택된 항목만 store에 동기화
    // 사이드바 호버 뷰(마우스 오버)와 구분하기 위해 selectedRows가 있을 때만 동기화
    if (newRows.length > 0) {
      partsDataStore.selectedPartClasses = [...newRows]

      // 단일 선택 시 기존 selectedPartClass도 업데이트 (하위 호환성)
      if (newRows.length === 1) {
        partsDataStore.selectedPartClass = newRows[0]
      }
    } else {
      // 선택 해제 시, 사이드바 호버 뷰가 아닐 때만 초기화
      // (사이드바 호버 뷰는 hoveredRowId로 관리되므로 별도 처리)
      if (!hoveredRowId.value) {
        partsDataStore.selectedPartClasses = []
        partsDataStore.selectedPartClass = null
      }
    }

    nextTick(() => {
      updateOverlayForSelectedItems()
    })
  },
  { deep: true },
)

// 사이드바 상세 뷰 변경 감지: 사이드바 호버 뷰로 전환 시 selectedRows 초기화
watch(
  () => partsDataStore.isSidebarDetailViewActive,
  (newValue) => {
    // 사이드바 상세 뷰가 해제되면 selectedRows 초기화하여 사이드바 호버 뷰 활성화
    if (!newValue) {
      selectedRows.value = []
      // sidebarDetailViewRowId는 composable에서 관리
    }
  },
)

// 필터링 변경 감지: 필터가 변경되면 선택 해제 및 테이블 포커스
watch([() => selectedCategory.value, () => statusFilter.value], () => {
  // 필터가 변경되면 모든 선택 해제
  selectedRows.value = []
  lastSelectedIndex.value = -1
  multiSelectMode.value = false

  // 검색 필드가 포커스되어 있지 않을 때만 테이블 컨테이너에 포커스 이동
  nextTick(() => {
    // 검색 필드가 포커스되어 있는지 확인
    const searchInput = searchInputRef.value
    let isSearchFocused = false

    if (searchInput) {
      // Quasar q-input의 실제 input 요소 찾기
      const inputElement = searchInput.$el?.querySelector('input') || searchInput.$el?.querySelector('.q-field__native')

      // 현재 포커스된 요소가 검색 필드인지 확인
      isSearchFocused = inputElement && document.activeElement === inputElement
    }

    // 검색 필드가 포커스되어 있지 않을 때만 테이블 컨테이너에 포커스
    if (!isSearchFocused) {
      const tableContainer = tableWrapperRef.value
      if (tableContainer) {
        // tabindex가 없으면 추가
        if (!tableContainer.hasAttribute('tabindex')) {
          tableContainer.setAttribute('tabindex', '-1')
        }
        tableContainer.focus()
      }
    }
  })
})

// searchText 변경 감지: 검색어 변경 시에는 포커스 유지 (별도 watch)
watch(
  () => searchText.value,
  () => {
    // 검색어 변경 시에는 선택 해제만 하고 포커스는 유지
    // (타이핑 중일 때는 포커스를 해제하지 않음)
  },
)

// 리사이즈 옵저버 (단일 옵저버로 통합)
let resizeObserver = null
// 키보드 이벤트 핸들러는 useTableKeyboard composable에서 처리

onMounted(async () => {
  // 키보드 이벤트 리스너 설정 (composable 사용)
  setupKeyboardListeners()

  // 전역 mouseup 리스너 추가 (롱 프레스 해제용)
  // 카드 밖에서 마우스를 놓을 경우에도 롱 프레스 상태를 해제하기 위함
  window.addEventListener('mouseup', handleRowMouseUp)

  // 뷰 모드 로드
  try {
    const storageKey = 'part-classes-view-mode'
    let savedViewMode = localStorage.getItem(storageKey)
    
    // 새 키에 없으면 구형 키에서 확인 (하위 호환성)
    if (!savedViewMode) {
      const oldKey = 'NEXA-part-classes-view-mode'
      savedViewMode = localStorage.getItem(oldKey)
      // 구형 키에서 찾았으면 새 키로 마이그레이션
      if (savedViewMode) {
        localStorage.setItem(storageKey, savedViewMode)
        localStorage.removeItem(oldKey)
      }
    }
    
    // Phase 3: 완성된 뷰모드 및 선택 가능한 뷰모드 허용 (Table, Card, List, Gallery, Timeline)
    if (savedViewMode && ['table', 'card', 'list', 'gallery', 'timeline', 'chart'].includes(savedViewMode)) {
      currentViewMode.value = savedViewMode
    }
  } catch (error) {
    console.error('뷰 모드 로드 실패:', error)
  }
  // 뷰 모드 설정 로드
  loadTableViewSettings()
  loadCardViewSettings()
  loadListViewSettings()
  loadChartViewSettings()
  await loadData()

  // 스크롤 이벤트 리스너 추가
  const tableContainer = document.querySelector('.parts-table .q-table__middle')
  if (tableContainer) {
    tableContainer.addEventListener('scroll', handleScroll, { passive: true })
  }
  window.addEventListener('scroll', handleScroll, { passive: true })

  // 전역 더블 클릭 감지 (상세 모드 해제용)
  document.addEventListener('dblclick', handleGlobalDoubleClick)

  // 마우스 이동 이벤트 리스너 추가 (선택된 항목이 있을 때 오버레이 위치 업데이트용)
  document.addEventListener('mousemove', handleMouseMove, { passive: true })

  // 사이드바에서 발생한 편집/삭제 이벤트 리스너 추가
  window.addEventListener('edit-part-class', handleSidebarEditEvent)
  window.addEventListener('delete-part-class', handleSidebarDeleteEvent)
})

// 사이드바에서 편집 요청 처리
function handleSidebarEditEvent(event) {
  const item = event.detail
  if (item) {
    editClass(item)
  }
}

// 사이드바에서 삭제 요청 처리
function handleSidebarDeleteEvent(event) {
  const item = event.detail
  if (item) {
    deleteClass(item)
  }
}

/**
 * 사이드바 상세 뷰 해제 함수 (추가 처리 포함)
 *
 * composable에서 제공하는 exitSidebarDetailView()를 호출하고,
 * 추가로 selectedRows와 chartClickedRowId를 초기화합니다.
 *
 * 주의: chartClickedRowId는 watch를 통해 자동으로 초기화되지만,
 * ESC 키로 호출될 때는 명시적으로 초기화하여 즉시 호버 이벤트가 활성화되도록 합니다.
 * (버튼 클릭으로 호출될 때는 watch가 자동으로 처리)
 */
function exitSidebarDetailViewWithSelectionClear() {
  exitSidebarDetailView()
  // 차트 클릭 추적 초기화 (호버 뷰로 전환 시 호버 이벤트 다시 활성화)
  // 주의: watch를 통해 자동으로 초기화되지만, ESC 키로 호출될 때는 명시적으로 초기화
  chartClickedRowId.value = null
  selectedRows.value = []
}

// 전역 더블 클릭 핸들러 (상세 모드 해제용)
function handleGlobalDoubleClick(evt) {
  // 사이드바 상세 뷰가 활성화되지 않았으면 무시
  if (!isSidebarDetailViewActive.value) {
    return
  }

  // 테이블 내부 더블 클릭은 onRowClick에서 처리하므로 무시
  const tableWrapper = tableWrapperRef.value
  if (tableWrapper && tableWrapper.contains(evt.target)) {
    return
  }

  // 작업 아이콘 영역 더블 클릭은 무시
  if (evt.target.closest('.row-actions-overlay-fixed') || evt.target.closest('.action-btn')) {
    return
  }

  // 전역 더블 클릭: 사이드바 상세 뷰 해제 (사이드바 호버 뷰로 전환)
  exitSidebarDetailViewWithSelectionClear()
}

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  // 키보드 이벤트 리스너 제거 (composable 사용)
  cleanupKeyboardListeners()

  // 전역 mouseup 리스너 제거
  window.removeEventListener('mouseup', handleRowMouseUp)

  // composable 정리
  cleanupDragDrop()
  cleanupSidebarNavigation()

  const tableContainer = document.querySelector('.parts-table .q-table__middle')
  if (tableContainer) {
    tableContainer.removeEventListener('scroll', handleScroll)
  }
  window.removeEventListener('scroll', handleScroll)
  // 마우스 이동 이벤트 리스너 제거
  document.removeEventListener('mousemove', handleMouseMove)
  // 사이드바 이벤트 리스너 제거
  window.removeEventListener('edit-part-class', handleSidebarEditEvent)
  window.removeEventListener('delete-part-class', handleSidebarDeleteEvent)

  // 전역 더블 클릭 리스너 제거
  document.removeEventListener('dblclick', handleGlobalDoubleClick)

  // 리사이즈 옵저버 제거
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style lang="scss" scoped>
@import './PartClassesView.scss';
</style>

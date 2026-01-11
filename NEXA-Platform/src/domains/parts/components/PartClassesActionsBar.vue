<!-- PartClassesActionsBar.vue
  PartClassesView의 Actions 영역 컴포넌트
  뷰 모드, 관리작업, 분류추가 버튼을 통합 관리
-->
<template>
  <div class="part-classes-actions-bar">
    <!-- 뷰 모드 관리 -->
    <ViewModeSelector :current-view-mode="currentViewMode" :menu-background-color="menuBackgroundColor" @view-mode-change="$emit('view-mode-change', $event)" @open-settings="$emit('open-settings')" />

    <!-- 작업 셀렉트 -->
    <q-btn-dropdown flat dense icon="work" label="관리작업" class="work-action-dropdown" menu-class="work-action-menu" :menu-style="{ backgroundColor: menuBackgroundColor }">
      <q-list :style="{ backgroundColor: menuBackgroundColor }">
        <!-- 기본 작업 모듈 -->
        <BasicActionsModule
          :selected-row-id="selectedRowId"
          :selected-count="selectedCount"
          :disabled-menu-item-color="disabledMenuItemColor"
          @insert-above="$emit('insert-above')"
          @insert-below="$emit('insert-below')"
          @edit="$emit('edit')"
          @delete="$emit('delete')"
          @reorder="$emit('reorder')"
          @duplicate="$emit('duplicate')"
        />

        <q-separator />

        <!-- 상태 관리 모듈 -->
        <StatusManagementModule
          :selected-count="selectedCount"
          :has-active-filter="hasActiveFilter"
          :activate-status-menu-label="activateStatusMenuLabel"
          :favorite-menu-item-label="favoriteMenuItemLabel"
          :disabled-menu-item-color="disabledMenuItemColor"
          @toggle-activate="$emit('toggle-activate')"
          @toggle-favorite="$emit('toggle-favorite')"
        />

        <q-separator />

        <!-- 조회 모듈 -->
        <ViewModule
          :selected-row-id="selectedRowId"
          :selected-count="selectedCount"
          :disabled-menu-item-color="disabledMenuItemColor"
          @view-detail="$emit('view-detail')"
          @view-history="$emit('view-history')"
          @view-related="$emit('view-related')"
        />

        <q-separator />

        <!-- 출력/내보내기/공유 모듈 -->
        <PrintExportModule
          :selected-count="selectedCount"
          :has-active-filter="hasActiveFilter"
          :print-menu-label="printMenuLabel"
          :export-menu-label="exportMenuLabel"
          :disabled-menu-item-color="disabledMenuItemColor"
          @share="$emit('share')"
          @print="$emit('print')"
          @export="$emit('export')"
        />

        <q-separator />

        <!-- 작업 메뉴 추가 아이템 (배열화) -->
        <template v-for="item in workActionMenuItems" :key="item.id">
          <!-- 구분선 -->
          <q-separator v-if="item.separator" />

          <!-- 메뉴 아이템 -->
          <q-item
            v-else
            clickable
            v-close-popup
            :disable="item.isDisabled"
            :style="item.isDisabled ? { color: disabledMenuItemColor } : { color: 'var(--nexa-text-primary)' }"
            @click="$emit('work-action-click', item)"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" :style="item.isDisabled ? { color: disabledMenuItemColor } : { color: 'var(--nexa-ui-primary)' }" />
            </q-item-section>
            <q-item-section>
              <q-item-label :style="item.isDisabled ? { color: disabledMenuItemColor } : { color: 'var(--nexa-text-primary)' }">
                {{ item.label }}
              </q-item-label>
              <q-item-label v-if="item.caption" caption :style="{ color: 'var(--nexa-text-primary)', opacity: 0.7 }">
                {{ item.caption }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-btn-dropdown>

    <!-- 오른쪽: 추가 버튼 (드롭다운) -->
    <q-btn-dropdown icon="add" label="분류추가" class="add-button" menu-class="add-action-menu" :menu-style="{ backgroundColor: menuBackgroundColor }">
      <q-list :style="{ backgroundColor: menuBackgroundColor }">
        <!-- 추가 메뉴 아이템 (배열화) -->
        <q-item
          v-for="item in addMenuItems"
          :key="item.id"
          clickable
          v-close-popup
          :disable="item.isDisabled"
          :style="item.isDisabled ? { color: disabledMenuItemColor } : { color: 'var(--nexa-text-primary)' }"
          @click="$emit('add-menu-item-click', item)"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" :style="item.isDisabled ? { color: disabledMenuItemColor } : { color: 'var(--nexa-ui-primary)' }" />
          </q-item-section>
          <q-item-section>
            <q-item-label :style="item.isDisabled ? { color: disabledMenuItemColor } : { color: 'var(--nexa-text-primary)' }">
              {{ item.label }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script setup>
import ViewModeSelector from './ViewModeSelector.vue'
import BasicActionsModule from './item-action-modules/BasicActionsModule.vue'
import StatusManagementModule from './item-action-modules/StatusManagementModule.vue'
import ViewModule from './item-action-modules/ViewModule.vue'
import PrintExportModule from './item-action-modules/PrintExportModule.vue'

defineProps({
  // 뷰 모드 관련
  currentViewMode: {
    type: String,
    required: true,
  },
  // 선택 관련
  selectedRowId: {
    type: [String, Number],
    default: null,
  },
  selectedCount: {
    type: Number,
    default: 0,
  },
  // 필터 관련
  hasActiveFilter: {
    type: Boolean,
    default: false,
  },
  // 메뉴 아이템 배열
  workActionMenuItems: {
    type: Array,
    required: true,
  },
  addMenuItems: {
    type: Array,
    required: true,
  },
  // 스타일 관련
  menuBackgroundColor: {
    type: String,
    default: 'var(--nexa-surface)',
  },
  disabledMenuItemColor: {
    type: String,
    default: 'var(--nexa-text-disabled)',
  },
  // 동적 라벨
  activateStatusMenuLabel: {
    type: String,
    default: '',
  },
  favoriteMenuItemLabel: {
    type: String,
    default: '',
  },
  printMenuLabel: {
    type: String,
    default: '',
  },
  exportMenuLabel: {
    type: String,
    default: '',
  },
})

defineEmits([
  'view-mode-change',
  'open-settings',
  'insert-above',
  'insert-below',
  'edit',
  'delete',
  'reorder',
  'duplicate',
  'toggle-activate',
  'toggle-favorite',
  'view-detail',
  'view-history',
  'view-related',
  'share',
  'print',
  'export',
  'work-action-click',
  'add-menu-item-click',
])
</script>

<style lang="scss" scoped>
.part-classes-actions-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

// ===== 분류추가 버튼 배경색 (타이틀과 동일) =====
.add-button {
  background-color: var(--nexa-ui-primary);
  opacity: 0.6;
  color: var(--nexa-background);
  padding-left: 6px;
  padding-right: 6px;
  max-width: 120px;
  min-width: auto;

  :deep(.q-btn__content) {
    padding: 0;
    font-size: 13px;

    .q-icon {
      margin: 0;
      padding: 0;
    }

    .q-btn__label {
      margin: 0;
      padding: 0;
    }
  }

  &:hover {
    opacity: 0.8;
  }
}
</style>


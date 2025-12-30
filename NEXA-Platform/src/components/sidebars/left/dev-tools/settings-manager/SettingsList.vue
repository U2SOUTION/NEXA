<!-- SettingsList.vue
  설정 관리 리스트 컴포넌트 (셋팅관리 탭용)
  설정 목록 표시
-->
<template>
  <q-scroll-area class="settings-list-scroll-area">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-state q-pa-lg text-center">
      <q-spinner size="32px" color="primary" />
      <div class="q-mt-md text-caption">설정을 스캔하는 중...</div>
    </div>

    <!-- 설정 목록 -->
    <div v-else-if="filteredSettings.length > 0" class="settings-list">
      <q-list separator>
        <q-item
          v-for="setting in filteredSettings"
          :key="setting.id"
          :class="{ 'settings-item-selected': selectedSetting?.id === setting.id }"
          clickable
          @click="handleSettingClick(setting)"
        >
          <q-item-section avatar>
            <q-icon :name="getTypeIcon(setting.type)" :color="getTypeColor(setting.type)" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="settings-item-name">{{ setting.name }}</q-item-label>
            <q-item-label caption class="settings-item-path">{{ setting.path }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-chip :color="getCategoryColor(setting.category)" text-color="white" size="sm" dense>
              {{ setting.category }}
            </q-chip>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state q-pa-lg text-center">
      <q-icon name="settings" size="48px" color="grey-5" class="q-mb-sm" />
      <div class="empty-message">설정이 없습니다</div>
      <div class="empty-hint">새로고침 버튼을 눌러 설정을 스캔하세요.</div>
    </div>
  </q-scroll-area>
</template>

<script setup>
defineProps({
  filteredSettings: {
    type: Array,
    default: () => [],
  },
  selectedSetting: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['setting-selected'])

// 설정 클릭 핸들러
function handleSettingClick(setting) {
  emit('setting-selected', setting)
}

// 타입별 아이콘
function getTypeIcon(type) {
  const iconMap = {
    'config-file': 'description',
    'localStorage': 'storage',
    'system-config': 'settings',
  }
  return iconMap[type] || 'settings'
}

// 타입별 색상
function getTypeColor(type) {
  const colorMap = {
    'config-file': 'primary',
    'localStorage': 'secondary',
    'system-config': 'accent',
  }
  return colorMap[type] || 'grey'
}

// 카테고리별 색상
function getCategoryColor(category) {
  const colorMap = {
    '개발 가이드': 'blue',
    '개발 도구': 'green',
    '사용자 설정': 'purple',
    '부품 관리': 'orange',
    '보드 메뉴': 'teal',
    'Mermaid 스타일': 'cyan',
    '테마 관리': 'pink',
    '에러 추적': 'red',
    '성능 모니터': 'amber',
    '문서 관리': 'indigo',
    '시스템': 'grey-8',
    '기타': 'grey-6',
  }
  return colorMap[category] || 'grey'
}
</script>

<style lang="scss" scoped>
.settings-list-scroll-area {
  height: calc(100vh - 200px);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.settings-list {
  .settings-item-selected {
    background-color: var(--nexa-surface-hover);
  }

  .settings-item-name {
    font-weight: 600;
    color: var(--nexa-text-primary);
  }

  .settings-item-path {
    color: var(--nexa-text-secondary);
    font-size: 0.75rem;
  }
}

.empty-state {
  .empty-message {
    color: var(--nexa-text-primary);
    font-weight: 600;
    margin-bottom: 4px;
  }

  .empty-hint {
    color: var(--nexa-text-secondary);
    font-size: 0.875rem;
  }
}
</style>

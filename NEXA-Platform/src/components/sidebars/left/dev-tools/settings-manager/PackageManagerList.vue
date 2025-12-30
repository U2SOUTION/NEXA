<!-- PackageManagerList.vue
  패키지 관리 리스트 컴포넌트
  패키지 목록 표시
-->
<template>
  <q-scroll-area class="package-manager-list-scroll-area">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-state q-pa-lg text-center">
      <q-spinner size="32px" color="primary" />
      <div class="q-mt-md text-caption">패키지를 스캔하는 중...</div>
    </div>

    <!-- 패키지 목록 -->
    <div v-else-if="packages.length > 0" class="packages-list">
      <q-list separator>
        <q-item
          v-for="packageItem in packages"
          :key="packageItem.id"
          :class="{ 'package-item-selected': selectedPackage?.id === packageItem.id }"
          clickable
          @click="handlePackageClick(packageItem)"
        >
          <q-item-section avatar>
            <q-icon name="inventory_2" color="secondary" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="package-item-name">{{ packageItem.name }}</q-item-label>
            <q-item-label caption class="package-item-version">{{ packageItem.version }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-chip :color="getPackageTypeColor(packageItem.type)" text-color="white" size="sm" dense>
              {{ packageItem.type }}
            </q-chip>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state q-pa-lg text-center">
      <q-icon name="inventory_2" size="48px" color="grey-5" class="q-mb-sm" />
      <div class="empty-message">패키지가 없습니다</div>
      <div class="empty-hint">새로고침 버튼을 눌러 패키지를 스캔하세요.</div>
    </div>
  </q-scroll-area>
</template>

<script setup>
defineProps({
  packages: {
    type: Array,
    default: () => [],
  },
  selectedPackage: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['package-selected'])

// 패키지 클릭 핸들러
function handlePackageClick(packageItem) {
  emit('package-selected', packageItem)
}

// 패키지 타입별 색상
function getPackageTypeColor(type) {
  const colorMap = {
    'dependencies': 'primary',
    'devDependencies': 'secondary',
    'peerDependencies': 'accent',
    'optionalDependencies': 'positive',
  }
  return colorMap[type] || 'grey'
}
</script>

<style lang="scss" scoped>
.package-manager-list-scroll-area {
  height: calc(100vh - 200px);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.packages-list {
  .package-item-selected {
    background-color: var(--nexa-surface-hover);
  }

  .package-item-name {
    font-weight: 600;
    color: var(--nexa-text-primary);
  }

  .package-item-version {
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

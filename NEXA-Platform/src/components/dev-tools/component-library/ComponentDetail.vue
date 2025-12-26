<!-- ComponentDetail.vue
  컴포넌트 상세 정보 컴포넌트
-->

<template>
  <div class="component-detail">
    <!-- 탭 정보 (선택된 항목이 없을 때) -->
    <TabInfo v-if="!selectedComponent && !selectedViolation" tab-name="all" :statistics="statistics" />

    <!-- 선택된 항목이 있을 때는 기존 상세 정보 표시 -->

    <!-- 규칙 위반 상세 (위반 항목 선택 시) -->
    <div v-else-if="selectedViolation" class="content-section violation-detail q-pa-md">
      <div class="content-header q-mb-md">
        <h4 class="content-title">
          <q-icon name="warning" color="negative" />
          규칙 위반 상세
        </h4>
      </div>
      <div class="violation-detail-content">
        <div class="component-info-card q-pa-md q-mb-md">
          <h5 class="card-title q-mb-sm">컴포넌트 정보</h5>
          <div class="info-row q-mb-sm">
            <span class="info-label">이름:</span>
            <span class="info-value">{{ selectedViolation.component.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">경로:</span>
            <span class="info-value code">{{ selectedViolation.component.path }}</span>
          </div>
        </div>

        <div class="violations-list-detail">
          <h5 class="card-title q-mb-sm">위반 사항</h5>
          <div v-for="(violation, index) in selectedViolation.violations" :key="index" class="violation-card q-pa-md q-mb-sm" :class="`violation-${violation.severity.toLowerCase()}`">
            <div class="violation-header q-mb-sm">
              <q-icon :name="violation.severity === 'ERROR' ? 'error' : 'warning'" :color="violation.severity === 'ERROR' ? 'negative' : 'warning'" />
              <span class="violation-type q-ml-sm">{{ violation.type }}</span>
              <q-badge :color="violation.severity === 'ERROR' ? 'negative' : 'warning'" :label="violation.severity" class="q-ml-sm" />
            </div>
            <div class="violation-message">{{ violation.message }}</div>
            <div v-if="violation.suggestedLocation" class="violation-suggestion q-mt-sm">
              <q-icon name="lightbulb" color="info" />
              <span class="q-ml-sm"
                >제안 위치: <code>{{ violation.suggestedLocation }}</code></span
              >
            </div>
            <div v-if="violation.fixable" class="violation-actions q-mt-sm">
              <q-btn flat dense color="primary" icon="build" label="자동 수정" @click="fixViolation(selectedViolation.component, violation)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 컴포넌트 상세 정보 (컴포넌트 선택 시) -->
    <div v-else-if="selectedComponent" class="content-section component-detail-content q-pa-md">
      <div class="content-header q-mb-md">
        <h4 class="content-title">
          <q-icon :name="selectedComponent.icon || 'widgets'" />
          {{ selectedComponent.displayName || selectedComponent.name }}
        </h4>
        <div class="content-actions">
          <q-btn flat dense icon="content_copy" label="경로 복사" @click="copyComponentPath(selectedComponent.path)" />
        </div>
      </div>
      <div class="component-detail-content">
        <div class="info-card q-pa-md q-mb-md">
          <h5 class="card-title q-mb-sm">기본 정보</h5>
          <div class="info-row q-mb-sm">
            <span class="info-label">이름:</span>
            <span class="info-value">{{ selectedComponent.name }}</span>
          </div>
          <div class="info-row q-mb-sm">
            <span class="info-label">경로:</span>
            <span class="info-value code">{{ selectedComponent.path }}</span>
          </div>
        </div>

        <div class="info-card q-pa-md">
          <h5 class="card-title q-mb-sm">분류 정보</h5>
          <div class="info-row q-mb-sm">
            <span class="info-label">기능별:</span>
            <span class="info-value">-</span>
          </div>
          <div class="info-row q-mb-sm">
            <span class="info-label">위치별:</span>
            <span class="info-value">-</span>
          </div>
          <div class="info-row">
            <span class="info-label">용도별:</span>
            <span class="info-value">-</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import TabInfo from './TabInfo.vue'

const $q = useQuasar()

const selectedComponent = ref(null)
const selectedViolation = ref(null)

// 통계 데이터 상태
const totalComponentCount = ref(0)
const scannedComponentCount = ref(0)
const categorizedComponents = ref(0)
const uncategorizedComponents = ref(0)
const duplicateMappedComponents = ref(0)

// 통계 데이터
const statistics = computed(() => {
  const stats = {
    totalComponents: { label: '전체 컴포넌트', value: String(totalComponentCount.value), description: '프로젝트 내 모든 Vue 컴포넌트' },
    scannedComponents: { label: '스캔된 컴포넌트', value: String(scannedComponentCount.value), description: '자동 스캔으로 발견된 컴포넌트' },
  }

  // 분류된 컴포넌트가 있으면 추가 통계 표시
  if (categorizedComponents.value > 0 || uncategorizedComponents.value > 0) {
    stats.categorizedComponents = {
      label: '분류된 컴포넌트',
      value: String(categorizedComponents.value),
      description: '시스템 카테고리에 매핑된 컴포넌트',
    }
    stats.uncategorizedComponents = {
      label: '미분류 컴포넌트',
      value: String(uncategorizedComponents.value),
      description: '시스템 카테고리에 매핑되지 않은 컴포넌트',
    }
  }

  // 중복 매핑된 컴포넌트가 있으면 표시
  if (duplicateMappedComponents.value > 0) {
    stats.duplicateMappedComponents = {
      label: '중복 매핑',
      value: String(duplicateMappedComponents.value),
      description: '여러 시스템 카테고리에 중복 매핑된 컴포넌트',
    }
  }

  return stats
})

// 통계 업데이트 이벤트 리스너
function handleStatisticsUpdate(event) {
  if (event.detail) {
    if (event.detail.totalComponents !== undefined) {
      totalComponentCount.value = event.detail.totalComponents
    }
    if (event.detail.scannedComponents !== undefined) {
      scannedComponentCount.value = event.detail.scannedComponents
    }
    if (event.detail.categorizedComponents !== undefined) {
      categorizedComponents.value = event.detail.categorizedComponents
    }
    if (event.detail.uncategorizedComponents !== undefined) {
      uncategorizedComponents.value = event.detail.uncategorizedComponents
    }
    if (event.detail.duplicateMappedComponents !== undefined) {
      duplicateMappedComponents.value = event.detail.duplicateMappedComponents
    }
  }
}

function handleComponentSelected(event) {
  selectedComponent.value = event.detail.component
  selectedViolation.value = null
}

function handleViolationSelected(event) {
  selectedViolation.value = event.detail.violation
  selectedComponent.value = null
}

function fixViolation(component, violation) {
  console.log('[ComponentDetail] fixViolation:', component, violation)
  $q.notify({
    message: '자동 수정 기능은 추후 구현 예정입니다.',
    type: 'info',
    timeout: 2000,
  })
}

async function copyComponentPath(path) {
  try {
    await navigator.clipboard.writeText(path)
    $q.notify({
      message: `경로 복사됨: ${path}`,
      type: 'positive',
      timeout: 2000,
      icon: 'content_copy',
      position: 'top',
    })
  } catch {
    $q.notify({
      message: '복사 실패',
      type: 'negative',
      timeout: 2000,
    })
  }
}

onMounted(() => {
  console.log('[ComponentDetail] 마운트됨')
  window.addEventListener('component-library-component-selected', handleComponentSelected)
  window.addEventListener('component-library-violation-selected', handleViolationSelected)
  window.addEventListener('component-library-statistics-updated', handleStatisticsUpdate)

  // 마운트 시 통계 요청
  window.dispatchEvent(new CustomEvent('component-library-statistics-request'))
})

onUnmounted(() => {
  window.removeEventListener('component-library-component-selected', handleComponentSelected)
  window.removeEventListener('component-library-violation-selected', handleViolationSelected)
  window.removeEventListener('component-library-statistics-updated', handleStatisticsUpdate)
})
</script>

<style lang="scss" scoped>
.component-detail {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--nexa-text-secondary);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--nexa-border-color);
}

.content-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin: 0;
}

.info-card,
.component-info-card {
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin: 0;
}

.info-row {
  display: flex;
  gap: 1rem;
}

.info-label {
  font-weight: 500;
  color: var(--nexa-text-secondary);
  min-width: 100px;
}

.info-value {
  color: var(--nexa-text-primary);
  flex: 1;

  &.code {
    font-family: monospace;
    font-size: 0.9rem;
    background-color: var(--nexa-background);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }
}

.violation-card {
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;

  &.violation-error {
    border-left: 4px solid var(--nexa-error);
  }

  &.violation-warning {
    border-left: 4px solid var(--nexa-warning);
  }
}

.violation-header {
  display: flex;
  align-items: center;
}

.violation-type {
  font-weight: 600;
  color: var(--nexa-text-primary);
  flex: 1;
}

.violation-message {
  color: var(--nexa-text-primary);
}

.violation-suggestion {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--nexa-background);
  border-radius: 4px;
  color: var(--nexa-text-secondary);
  font-size: 0.9rem;

  code {
    font-family: monospace;
    color: var(--nexa-text-primary);
    background-color: var(--nexa-surface);
    padding: 0.125rem 0.25rem;
    border-radius: 2px;
  }
}
</style>

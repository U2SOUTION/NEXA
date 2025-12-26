<template>
  <div class="component-library-content">
    <!-- 툴바 -->
    <div class="component-library-toolbar q-pa-md row items-center justify-between">
      <div class="row items-center q-gutter-md">
        <q-icon name="widgets" size="24px" />
        <h3 class="component-library-toolbar-title">Component Library</h3>
        <p class="component-library-toolbar-subtitle">컴포넌트 라이브러리 구조 관리 도구</p>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn flat icon="refresh" label="재검사" @click="scanAndValidate" :loading="isScanning" />
        <q-btn flat icon="settings" label="규칙 설정" @click="showRuleSettings = true" />
      </div>
    </div>

    <!-- 메인 컨텐츠 영역: 상세 정보 -->
    <div class="component-library-main-content">
      <!-- 규칙 위반 상세 (위반 항목 선택 시) -->
      <div v-if="selectedViolation" class="content-section violation-detail">
        <div class="content-header">
          <h4 class="content-title">
            <q-icon name="warning" color="negative" />
            규칙 위반 상세
          </h4>
        </div>
        <div class="violation-detail-content">
          <div class="component-info-card">
            <h5 class="card-title">컴포넌트 정보</h5>
            <div class="info-row">
              <span class="info-label">이름:</span>
              <span class="info-value">{{ selectedViolation.component.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">경로:</span>
              <span class="info-value code">{{ selectedViolation.component.path }}</span>
            </div>
          </div>

          <div class="violations-list-detail">
            <h5 class="card-title">위반 사항</h5>
            <div v-for="(violation, index) in selectedViolation.violations" :key="index" class="violation-card" :class="`violation-${violation.severity.toLowerCase()}`">
              <div class="violation-header">
                <q-icon :name="violation.severity === 'ERROR' ? 'error' : 'warning'" :color="violation.severity === 'ERROR' ? 'negative' : 'warning'" />
                <span class="violation-type">{{ violation.type }}</span>
                <q-badge :color="violation.severity === 'ERROR' ? 'negative' : 'warning'" :label="violation.severity" />
              </div>
              <div class="violation-message">{{ violation.message }}</div>
              <div v-if="violation.suggestedLocation" class="violation-suggestion">
                <q-icon name="lightbulb" color="info" />
                <span
                  >제안 위치: <code>{{ violation.suggestedLocation }}</code></span
                >
              </div>
              <div v-if="violation.fixable" class="violation-actions">
                <q-btn flat dense color="primary" icon="build" label="자동 수정" @click="fixViolation(selectedViolation.component, violation)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 컴포넌트 상세 정보 (컴포넌트 선택 시) -->
      <div v-else-if="selectedComponent" class="content-section component-detail">
        <div class="content-header">
          <h4 class="content-title">
            <q-icon :name="selectedComponent.icon || 'widgets'" />
            {{ selectedComponent.displayName || selectedComponent.name }}
          </h4>
          <div class="content-actions">
            <q-btn flat dense icon="content_copy" label="경로 복사" @click="copyComponentPath(selectedComponent.path)" />
          </div>
        </div>
        <div class="component-detail-content">
          <div class="info-card">
            <h5 class="card-title">기본 정보</h5>
            <div class="info-row">
              <span class="info-label">이름:</span>
              <span class="info-value">{{ selectedComponent.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">경로:</span>
              <span class="info-value code">{{ selectedComponent.path }}</span>
            </div>
          </div>

          <!-- 분류 정보 (추후 구현) -->
          <div class="info-card">
            <h5 class="card-title">분류 정보</h5>
            <div class="info-row">
              <span class="info-label">기능별:</span>
              <span class="info-value">-</span>
            </div>
            <div class="info-row">
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

      <!-- 빈 상태 -->
      <div v-else class="empty-state">
        <q-icon name="info" size="64px" color="grey-7" class="q-mb-md" />
        <p class="empty-state-text">왼쪽에서 카테고리나 컴포넌트를 선택하세요</p>
      </div>
    </div>

    <!-- 규칙 설정 다이얼로그 (추후 구현) -->
    <q-dialog v-model="showRuleSettings">
      <q-card style="width: 800px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">규칙 설정</div>
        </q-card-section>
        <q-card-section>
          <p>규칙 설정 UI는 추후 구현 예정입니다.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="닫기" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 상태
const isScanning = ref(false)
const selectedComponent = ref(null)
const selectedViolation = ref(null)
const showRuleSettings = ref(false)

// 컴포넌트/위반 항목 선택 이벤트 리스너
function handleComponentSelected(event) {
  selectedComponent.value = event.detail.component
  selectedViolation.value = null
}

function handleViolationSelected(event) {
  selectedViolation.value = event.detail.violation
  selectedComponent.value = null
}

// 규칙 위반 수정 (추후 구현)
function fixViolation(component, violation) {
  // TODO: 실제 수정 로직 구현
  console.log('[ComponentLibrary] fixViolation:', component, violation)
  $q.notify({
    message: '자동 수정 기능은 추후 구현 예정입니다.',
    type: 'info',
    timeout: 2000,
  })
}

// 전체 스캔 및 검증 (추후 구현)
async function scanAndValidate() {
  isScanning.value = true
  // TODO: 실제 스캔 로직 구현
  setTimeout(() => {
    isScanning.value = false
    $q.notify({
      message: '스캔 완료',
      type: 'positive',
      timeout: 2000,
    })
  }, 1000)
}

// 컴포넌트 경로 복사
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
    try {
      const textArea = document.createElement('textarea')
      textArea.value = path
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

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
}

onMounted(() => {
  // 컴포넌트/위반 항목 선택 이벤트 리스너 등록
  window.addEventListener('component-library-component-selected', handleComponentSelected)
  window.addEventListener('component-library-violation-selected', handleViolationSelected)
})

onUnmounted(() => {
  window.removeEventListener('component-library-component-selected', handleComponentSelected)
  window.removeEventListener('component-library-violation-selected', handleViolationSelected)
})
</script>

<style lang="scss" scoped>
.component-library-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background);
}

.component-library-toolbar {
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
  flex-shrink: 0;
}

.component-library-toolbar-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin: 0;
}

.component-library-toolbar-subtitle {
  font-size: 0.875rem;
  color: var(--nexa-text-secondary);
  margin: 0;
}

.search-input {
  min-width: 250px;
}

// 3단계 계층 구조 레이아웃
.component-library-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

// 왼쪽 사이드바
.left-sidebar {
  width: 280px;
  min-width: 280px;
  border-right: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-section {
  padding: 1rem;
  border-bottom: 1px solid var(--nexa-border-color);

  &:last-child {
    border-bottom: none;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    .section-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--nexa-text-primary);
      margin: 0;
      flex: 1;
    }
  }
}

.violations-section {
  background-color: var(--nexa-surface);
  border-bottom: 2px solid var(--nexa-error);
}

.violations-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.violation-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--nexa-surface-hover);
  }

  &.violation-item-selected {
    background-color: var(--nexa-surface-hover);
    border-left: 3px solid var(--nexa-error);
  }

  .violation-item-info {
    flex: 1;
    min-width: 0;

    .violation-item-name {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--nexa-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .violation-item-count {
      font-size: 0.75rem;
      color: var(--nexa-text-secondary);
    }
  }
}

.category-item,
.component-item {
  border-radius: 4px;
  margin-bottom: 0.25rem;

  &.q-item--active {
    background-color: var(--nexa-surface-hover);
  }

  .component-path {
    font-family: monospace;
    font-size: 0.7rem;
    opacity: 0.7;
  }
}

// 중간 컨텐츠 영역
.middle-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: var(--nexa-background);
  min-width: 0;
}

.content-section {
  padding: 1.5rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--nexa-border-color);

  .content-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--nexa-text-primary);
    margin: 0;
  }

  .content-actions {
    display: flex;
    gap: 0.5rem;
  }
}

.violation-detail-content,
.component-detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card,
.component-info-card {
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  padding: 1rem;

  .card-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--nexa-text-primary);
    margin: 0 0 1rem 0;
  }

  .info-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;

    &:last-child {
      margin-bottom: 0;
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
  }
}

.violations-list-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.violation-card {
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  padding: 1rem;

  &.violation-error {
    border-left: 4px solid var(--nexa-error);
  }

  &.violation-warning {
    border-left: 4px solid var(--nexa-warning);
  }

  .violation-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    .violation-type {
      font-weight: 600;
      color: var(--nexa-text-primary);
      flex: 1;
    }
  }

  .violation-message {
    color: var(--nexa-text-primary);
    margin-bottom: 0.75rem;
  }

  .violation-suggestion {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: var(--nexa-background);
    border-radius: 4px;
    margin-bottom: 0.75rem;
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

  .violation-actions {
    display: flex;
    gap: 0.5rem;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  .empty-state-text {
    color: var(--nexa-text-secondary);
    font-size: 1rem;
    margin: 0;
  }
}
</style>

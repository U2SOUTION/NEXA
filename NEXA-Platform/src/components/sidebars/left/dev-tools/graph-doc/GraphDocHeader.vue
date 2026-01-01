<!-- GraphDocHeader.vue
  GraphDoc 전체 헤더 컴포넌트
  아코디언 옵션, 설정 버튼 등
-->
<template>
  <div class="graph-doc-header">
    <!-- 아코디언 동작 옵션 -->
    <div class="accordion-options q-pa-sm">
      <div class="row items-center justify-between q-gutter-xs">
        <div class="row items-center q-gutter-xs">
          <!-- 단일 열림 모드 토글 -->
          <q-btn flat dense size="sm" :icon="localSingleMode ? 'radio_button_checked' : 'radio_button_unchecked'" :label="localSingleMode ? '단일' : '다중'" :class="{ 'option-active': localSingleMode, 'option-inactive': !localSingleMode }" class="option-btn" @click="handleSingleModeToggle">
            <q-tooltip>{{ localSingleMode ? '단일 열림 모드 (하나만 열기)' : '다중 열림 모드 (여러 개 열기)' }}</q-tooltip>
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
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  singleMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['single-mode-toggle', 'expand-all', 'collapse-all', 'settings'])

// 로컬 singleMode 상태 (props와 동기화)
const localSingleMode = ref(props.singleMode)

// props 변경 시 동기화
watch(
  () => props.singleMode,
  (newValue) => {
    localSingleMode.value = newValue
  },
  { immediate: true },
)

// 단일 열림 모드 토글
function handleSingleModeToggle() {
  localSingleMode.value = !localSingleMode.value
  emit('single-mode-toggle', localSingleMode.value)
}

// 모든 항목 열기
function handleExpandAll() {
  emit('expand-all')
}

// 모든 항목 닫기
function handleCollapseAll() {
  emit('collapse-all')
}

// 설정 핸들러
function handleSettings() {
  emit('settings')
}

// singleMode는 props로 전달받으므로 별도 로드 불필요
</script>

<style lang="scss" scoped>
.graph-doc-header {
  background: var(--nexa-background);
  border-bottom: 1px solid var(--nexa-border-color);
}

.accordion-options {
  .option-btn {
    font-size: 0.75rem;
  }

  .option-active {
    color: var(--nexa-button-primary-text);
    background-color: var(--nexa-button-primary-bg);
  }

  .option-inactive {
    color: var(--nexa-text-secondary);
  }
}
</style>

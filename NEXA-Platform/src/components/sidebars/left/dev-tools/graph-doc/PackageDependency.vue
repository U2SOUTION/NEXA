<!-- PackageDependency.vue
  패키지 의존성 그래프 컴포넌트
  분석
-->

<template>
  <div class="package-dependency">
    <div class="header-content q-pa-md">
      <div class="row items-center q-gutter-md">
        <div class="col">
          <q-input
            v-model="localProjectRoot"
            label="프로젝트 루트 (선택사항)"
            placeholder="예: / (기본값: 현재 프로젝트)"
            outlined
            dense
            @update:model-value="handleProjectRootChange"
            @keyup.enter="handleAnalyze"
          >
            <template #prepend>
              <q-icon name="folder" />
            </template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            label="분석"
            icon="play_arrow"
            :loading="isAnalyzing"
            @click="handleAnalyze"
          />
        </div>
      </div>
      <div class="hint-text">
        비워두면 현재 프로젝트의 package.json 사용
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  projectRoot: {
    type: String,
    default: '',
  },
  isAnalyzing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['analyze', 'project-root-change'])

// 로컬 입력값 상태
const localProjectRoot = ref(props.projectRoot || '')

// props 변경 시 로컬 상태 동기화
watch(
  () => props.projectRoot,
  (newValue) => {
    localProjectRoot.value = newValue || ''
  },
  { immediate: true },
)

function handleAnalyze() {
  // 로컬 상태의 최신 입력값을 전달
  emit('analyze', localProjectRoot.value.trim() || '')
}

function handleProjectRootChange(value) {
  // 로컬 상태 업데이트
  localProjectRoot.value = value
  // 부모에게 변경 사항 알림
  emit('project-root-change', value)
}
</script>

<style lang="scss" scoped>
.package-dependency {
  background: var(--nexa-background-darker);
  border-bottom: 1px solid var(--nexa-border-color);
}

.header-content {
  .header-title {
    color: var(--nexa-text-primary);
    font-size: 0.875rem;
    font-weight: 600;
  }
}

.hint-text {
  font-size: 0.75rem;
  color: var(--nexa-text-secondary);
  margin-top: 4px;
  padding-left: 4px;
}
</style>

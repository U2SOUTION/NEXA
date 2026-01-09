<template>
  <q-card flat bordered class="board-guide full-height">
    <div class="title-section">
      <q-card-section class="text-h5 text-center">
        <q-icon name="help_outline" class="q-mr-sm" />
        보드 관리 가이드
      </q-card-section>
    </div>

    <q-separator spaced color="grey-10" />

    <!-- 현재 단계별 안내 -->
    <q-card-section class="guide-content text-center">
      <div v-if="currentStep === 'directory'" class="text-subtitle1 q-mb-sm">
        <q-icon name="filter_1" class="q-mr-sm" />
        디렉토리 선택 단계
      </div>
      <div v-else-if="currentStep === 'type'" class="text-subtitle1 q-mb-sm">
        <q-icon name="filter_2" class="q-mr-sm" />
        타입 선택 단계
      </div>
      <div v-else-if="currentStep === 'form'" class="text-subtitle1 q-mb-sm">
        <q-icon name="filter_3" class="q-mr-sm" />
        항목 생성 단계
      </div>

      <p class="text-caption text-grey-8">
        {{ currentGuideText }}
      </p>
    </q-card-section>

    <!-- SVG 트리 구조 -->
    <q-card-section class="tree-diagram q-mb-lg">
      <BoardGuideSVG ref="structureGuideRef" :highlightNode="highlightedNode" />
    </q-card-section>

    <!-- 푸터 텍스트 -->
    <div class="footer-text text-center q-mb-xl">
      <div class="footer-box">
        <div class="text-caption" style="color: rgba(0, 0, 0, 0.6)">NAXA SYSTEM GUIDE</div>
        <div class="text-caption text-grey-7 solution-text">U2 SOLUTION</div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import BoardGuideSVG from './BoardGuideSVG.vue'

const props = defineProps({
  currentStep: {
    type: String,
    required: true,
  },
  highlightedNode: {
    type: String,
    default: null,
  },
})

const structureGuideRef = ref(null)

// 외부에서 호출할 수 있는 메서드들
const highlightTopDirectory = () => {
  structureGuideRef.value?.highlightTopDirectory()
}
const highlightSubDirectory = () => {
  structureGuideRef.value?.highlightSubDirectory()
}
const highlightGroup = () => {
  structureGuideRef.value?.highlightGroup()
}
const highlightBoard = () => {
  structureGuideRef.value?.highlightBoard()
}
const resetHighlight = () => {
  structureGuideRef.value?.resetHighlight()
}

// 외부에서 사용할 수 있도록 expose
defineExpose({
  highlightTopDirectory,
  highlightSubDirectory,
  highlightGroup,
  highlightBoard,
  resetHighlight,
})

const currentGuideText = computed(() => {
  switch (props.currentStep) {
    case 'directory':
      return '새 항목을 생성할 위치를 선택하세요. 최상위에 생성하거나 기존 그룹 하위에 생성할 수 있습니다.'
    case 'type':
      return '생성할 항목의 타입을 선택하세요. 그룹은 다른 항목을 포함할 수 있고, 보드는 실제 작업 단위입니다.'
    case 'form':
      return '선택한 위치와 타입에 맞는 항목의 상세 정보를 입력하세요.'
    default:
      return '보드 관리 시스템에서 항목을 생성하고 관리하는 방법을 안내합니다.'
  }
})
</script>

<style scoped>
.board-guide {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #454545 !important;
  border: none !important;
}

.title-section {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-section :deep(.q-card__section) {
  padding: 0;
}

.tree-diagram {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.highlighted rect {
  filter: drop-shadow(0 0 5px rgba(33, 150, 243, 0.5));
}

.guide-content {
  padding: 16px;
  background: #2a2a2a;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.guide-content :deep(.text-subtitle1) {
  margin-bottom: 8px;
}

.guide-content :deep(.text-caption) {
  max-width: 80%;
  margin: 0 auto;
}

.full-height {
  height: 100%;
}

.footer-text {
  color: rgba(255, 255, 255, 0.6);
}

.footer-box {
  border: 1px solid rgba(0, 0, 0, 0.289);
  border-radius: 4px;
  padding: 4px 8px;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.289) 50%);
  display: inline-block;
  min-width: 140px;
}

.footer-text .text-caption {
  font-size: 0.6rem;
  letter-spacing: 0.5px;
  line-height: 1.3;
}

.footer-text .solution-text {
  letter-spacing: 4px;
  line-height: 0.8;
  padding-top: 6px;
}
</style>

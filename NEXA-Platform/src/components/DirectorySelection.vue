<template>
  <div
    class="directory-selection-component-wrapper"
    :class="{ 'selection-complete': modelValue !== null }"
  >
    <div class="step-header row items-center justify-center q-mb-xs">
      <div class="step-number bg-primary text-white q-mr-lg">1</div>
      <div class="text-h4 text-weight-bold text-grey-4">디렉토리 선택</div>
    </div>
    <div class="text-grey-7 q-mt-xs q-mb-lg text-center full-width">
      그룹 또는 프로젝트를 생성할 디렉토리를 선택하세요. <br />
      또는 기존 그룹 또는 프로젝트를 선택하세요.
    </div>

    <div class="directory-selection" :class="{ 'selection-disabled': !isSelectable }">
      <div class="row q-col-gutter-sm justify-center full-height-row">
        <div class="col-xs-12 col-sm-6 full-center-col">
          <q-card
            :class="getCardClasses('root').value"
            class="directory-card"
            @click="handleCardClick('root')"
            @mouseover="handleCardHover('root')"
            @mouseleave="handleCardLeave"
          >
            <q-card-section class="card-content-center text-center">
              <q-icon
                :class="['icon-animate', { 'icon-animate-active': false }]"
                name="home"
                size="4rem"
                :color="modelValue === 'root' ? 'primary' : 'grey-7'"
              />
              <div class="text-h6 q-mt-md">최상위 디렉토리</div>
              <div class="text-caption text-grey-7 description">
                최상위에 그룹이나 프로젝트를 생성합니다.
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-xs-12 col-sm-6 full-center-col">
          <q-card
            :class="getCardClasses('sub').value"
            class="directory-card"
            @click="handleCardClick('sub')"
            @mouseover="handleCardHover('sub')"
            @mouseleave="handleCardLeave"
          >
            <q-card-section class="card-content-center text-center">
              <q-icon
                name="create_new_folder"
                size="4rem"
                :color="modelValue === 'sub' ? 'primary' : 'grey-7'"
              />
              <div class="text-h6 q-mt-md">서브 디렉토리</div>
              <div class="text-caption text-grey-7 description">
                선택한 그룹 하위에 새 항목을 생성합니다.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, null],
    default: null,
  },
  isSelectable: {
    type: Boolean,
    default: true,
  },
  isParentGroupSelectionPending: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'highlight-guide'])

function handleCardClick(type) {
  if (props.isSelectable) {
    emit('update:modelValue', type)
  }
}

function handleCardHover(type) {
  if (props.isSelectable) {
    emit('highlight-guide', type)
  }
}

function handleCardLeave() {
  emit('highlight-guide', null)
}

const getCardClasses = (type) => {
  return computed(() => ({
    selected: props.modelValue === type,
    'non-selectable': !props.isSelectable,
    'deselected-when-disabled': !props.isSelectable && props.modelValue !== type,
  }))
}
</script>

<style scoped>
/* 단계 번호 스타일 추가 */
/* .step-header 규칙 제거 */

.step-number {
  width: 44px; /* 크기 증가 */
  height: 44px; /* 크기 증가 */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem; /* 글꼴 크기 증가 */
  font-weight: bold;
}

.directory-selection-component-wrapper {
  width: 100%;
  transition: margin-bottom 1s ease-out; /* 하단 마진 변경 애니메이션 */
}

.directory-selection-component-wrapper.selection-complete {
  margin-bottom: 0px; /* 선택 완료 시 하단 마진을 줄임 (값 조절 필요). 예: -20px 또는 원하는 만큼 */
  /* 또는 padding-bottom: 0; 등으로 내부 간격을 줄일 수도 있습니다. */
}

.directory-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: auto;
}

/* 전체 컴포넌트가 비활성화(선택 완료) 상태일 때 약간 축소되는 효과 (선택적) */
/* .directory-selection.selection-disabled { */
/* transform: scale(0.95); */
/* margin-bottom: -20px; */ /* 축소 시 레이아웃 보정용 (필요시) */
/* } */

.full-height-row {
  height: 100%;
  justify-content: center;
  /* gap: 1px; */ /* gutter 클래스 사용을 위해 주석 처리 */
  flex-wrap: wrap; /* nowrap에서 wrap으로 변경 */
  width: 100%;
  max-width: 650px; /* 카드 2개가 보기 좋게 들어갈 최대 너비로 조절 (기존 700px) */
}

.full-center-col {
  display: flex;
  align-items: stretch; /* 카드가 열의 높이를 채우도록 */
  justify-content: center;
  /* flex: none; */ /* 주석 처리 또는 삭제 */
  padding-bottom: 16px; /* 카드들이 여러 줄로 나올 때 상하 간격을 위해 추가. 좌우 패딩은 없음 */
  /* padding-left: 0; */ /* 명시적으로 좌우 패딩 없음을 확인 (필요시) */
  /* padding-right: 0; */ /* 명시적으로 좌우 패딩 없음을 확인 (필요시) */
}

.directory-card {
  width: 100%;
  max-width: 300px;
  max-height: 180px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  border: 2px solid #1d1d1d; /* 블랙톤 테두리 */
  padding: 4px;
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
  box-shadow:
    0 2px 6px rgba(203, 203, 203, 0.112),
    0 1.5px 0px 0px rgba(255, 255, 255, 0.08) inset;
  transition:
    transform 0.2s ease-out,
    box-shadow 0.2s ease-out;
}

/* 일반 hover 효과 (TypeSelection.vue 참고하여 단순화) */
.directory-card:not(.non-selectable):hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.1),
    0 6px 6px rgba(0, 0, 0, 0.15);
}

.directory-card.selected {
  border: 2px solid var(--nexa-primary) !important; /* TypeSelection의 selected 스타일 유지 */
  box-shadow: 0 0 8px rgba(var(--nexa-primary-rgb), 0.5);
}

/* non-selectable 관련 스타일은 일단 유지 */
.directory-card.non-selectable {
  cursor: default;
}
.directory-card.non-selectable:hover {
  transform: none;
  box-shadow: none; /* TypeSelection.vue에 non-selectable 시 box-shadow 없음 참고 */
}
.directory-card.deselected-when-disabled {
  opacity: 0.6;
}
.directory-card.selected.non-selectable {
  opacity: 1;
}

.card-content-center {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* padding: 20px; */ /* .directory-card에 이미 padding이 있음 */
}

.directory-card .text-h6 {
  font-size: clamp(0.9rem, 0.7rem + 0.8vw, 1.15rem);
  margin-top: 8px; /* 아이콘과 제목 사이 간격 조정 (기존 0px에서 변경) */
  margin-bottom: 4px;
  /* transition 유지 */
}

.description {
  min-height: 2.2em;
  text-align: center;
  font-size: 0.8rem;
  width: 100%;
  padding-left: 3px;
  padding-right: 3px;
  /* transition 유지 */
}

/* 제목 텍스트(h6) 반응형 크기 설정 - 중복 제거 */
/* .directory-card .text-h6 {
  font-size: clamp(0.9rem, 0.7rem + 0.8vw, 1.15rem);
} */

/* 아이콘 애니메이션 관련 - isSelectable과 연동 필요 */
/* .icon-animate ... */
/* .icon-animate-active ... */

.directory-card:not(.non-selectable):hover .q-icon {
  color: var(--nexa-accent) !important;
}
</style>

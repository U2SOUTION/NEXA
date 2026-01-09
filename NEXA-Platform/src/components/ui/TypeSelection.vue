<template>
  <div class="type-selection-component-wrapper" :class="{ 'selection-complete': modelValue !== null }">
    <div class="step-header row items-center justify-center q-mb-sm">
      <div class="step-number bg-primary text-white q-mr-lg">2</div>
      <div class="text-h4 text-weight-bold text-grey-4">작업 타입 선택</div>
    </div>

    <!-- 안내 메시지와 뒤로가기 버튼을 카드 행과 동일한 col row 구조로 배치 -->
    <div class="desc-header-row row q-col-gutter-sm items-center q-mb-lg" style="max-width: 900px; margin: 0 auto">
      <div class="col text-center">
        <span class="text-subtitle1 text-grey-6" v-if="isSelectable && modelValue === null" v-html="guideMessage"></span>
      </div>
      <div class="col-auto">
        <q-btn icon="arrow_back" label="이전" flat color="grey-6" @click="$emit('go-prev-step')" />
      </div>
    </div>

    <div class="type-selection q-mt-md" :class="{ 'selection-disabled': !isSelectable }" style="margin-top: 16px; margin-bottom: 2px">
      <div class="row q-col-gutter-sm justify-center full-height-row items-stretch" style="max-width: 900px; margin: 0 auto">
        <!-- 그룹 카드 -->
        <div class="col-xs-12 col-sm-6 col-md-4 full-center-col">
          <q-card :class="getCardClasses('group').value" class="type-card" @click="handleCardClick('group')" @mouseover="emit('highlight-guide', 'group')" @mouseleave="emit('highlight-guide', null)">
            <q-card-section class="card-content-center text-center">
              <q-icon :class="['icon-animate', { 'icon-animate-active': false }]" name="folder" size="4rem" :color="getIconColor('group').value" />
              <div class="text-h6 q-mt-md">그룹 만들기</div>
              <div class="text-caption text-grey-7 description">다른 항목들을을포함할 수 있는 그룹을 생성.</div>
            </q-card-section>
          </q-card>
        </div>
        <!-- 보드 카드 -->
        <div class="col-xs-12 col-sm-6 col-md-4 full-center-col">
          <q-card :class="getCardClasses('board').value" class="type-card" @click="handleCardClick('board')" @mouseover="emit('highlight-guide', 'board')" @mouseleave="emit('highlight-guide', null)">
            <q-card-section class="card-content-center text-center">
              <q-icon name="dashboard" size="4rem" :color="getIconColor('board').value" />
              <div class="text-h6 q-mt-md">보드 생성</div>
              <div class="text-caption text-grey-7 description">실제 보드를 생성합니다.</div>
            </q-card-section>
          </q-card>
        </div>
        <!-- 편집하기 카드 (isEditingPossible 조건에 따라 표시) -->
        <div v-if="isEditingPossible" class="col-xs-12 col-sm-6 col-md-4 full-center-col">
          <q-card :class="getCardClasses('edit').value" class="type-card" @click="handleCardClick('edit')">
            <q-card-section class="card-content-center text-center">
              <q-icon name="edit_note" size="4rem" :color="getIconColor('edit').value" />
              <div class="text-h6 q-mt-md">선택항목 수정</div>
              <div class="text-caption text-grey-7 description">선택된 항목({{ selectedParentGroupName }})을 수정합니다.</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- 추가 관리 액션 카드들 (버튼 대신 카드) -->
    <div v-if="boardEditorStore.isActualNodeSelectedForAdmin" class="action-cards-row row q-col-gutter-sm q-mt-sm" style="max-width: 900px; margin: 0 auto; width: 100%; flex-wrap: wrap">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="action-card" @click="handleAction('delete')">
          <q-card-section class="row items-center justify-center">
            <q-icon name="delete" class="action-icon" />
            <span class="action-label">삭제</span>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="action-card" @click="handleAction('rename')" :class="{ 'disabled-card': !canPerformAction('rename') }">
          <q-card-section class="row items-center justify-center">
            <q-icon name="drive_file_rename_outline" class="action-icon" />
            <span class="action-label">이름변경</span>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="action-card" @click="handleAction('move')" :class="{ 'disabled-card': !canPerformAction('move') }">
          <q-card-section class="row items-center justify-center">
            <q-icon name="drive_file_move_outline" class="action-icon" />
            <span class="action-label">이동</span>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="action-card" @click="handleAction('duplicate')" :class="{ 'disabled-card': !canPerformAction('duplicate') }">
          <q-card-section class="row items-center justify-center">
            <q-icon name="content_copy" class="action-icon" />
            <span class="action-label">복제</span>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBoardEditorStore } from '@system/store/boardEditorStore.js'

const props = defineProps({
  modelValue: {
    type: String,
    // required: true, // modelValue는 초기에 null일 수 있으므로 false로 변경하거나, BoardAdminPage에서 초기값을 확실히 주도록 합니다.
    default: null,
  },
  isSelectable: {
    type: Boolean,
    default: true,
  },
  selectedDirectoryType: {
    type: String,
    default: 'root',
  },
  selectedParentGroupName: {
    type: String,
    default: null,
  },
  drawerContextType: {
    type: String,
    default: null,
  },
  isEditingPossible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'delete-item', 'rename-item', 'go-prev-step', 'highlight-guide'])
const boardEditorStore = useBoardEditorStore()

// const selectedType = ref(null) // 사용되지 않으므로 이 줄을 삭제합니다.

// 안내 메시지 computed 속성 (개선된 버전)
const guideMessage = computed(() => {
  if (!props.isSelectable || props.modelValue !== null) return '' // 선택 불가능하거나 이미 선택된 경우 메시지 없음

  if (props.selectedParentGroupName && (props.drawerContextType === 'group' || props.drawerContextType === 'board')) {
    return `<span class="text-weight-bold">${props.selectedParentGroupName}</span> 컨텍스트에서 작업할 항목 타입을 선택하세요.`
  } else if (props.drawerContextType === 'root-context' || (!props.drawerContextType && props.selectedDirectoryType === 'root')) {
    return '최상위 레벨에서 생성할 항목 타입을 선택하세요.'
  } else if (!props.drawerContextType && props.selectedDirectoryType === 'sub' && !props.selectedParentGroupName) {
    // 1단계에서 sub를 선택했지만 아직 부모 그룹을 선택하지 않은 경우 (BoardAdminPage에서 안내)
    return '상위 그룹을 선택한 후 진행해주세요.' // 이 메시지는 BoardAdminPage에서 더 자세히 안내함
  }
  return '생성 또는 수정할 항목의 타입을 선택하세요.' // 기본 메시지
})

function handleCardClick(type) {
  if (props.isSelectable) {
    // "편집하기" 카드는 isEditingPossible이 true일 때만 보이므로, 여기서 별도 조건검사 불필요.
    emit('update:modelValue', type)
  }
}

function handleAction(actionType) {
  const selectedNode = boardEditorStore.drawerSelectionForAdmin
  if (!selectedNode || !selectedNode.id) {
    console.warn(`[TypeSelection] Cannot perform action '${actionType}' without a selected node.`)
    return
  }

  if (actionType === 'delete') {
    emit('delete-item', { id: selectedNode.id, name: selectedNode.name })
  } else if (actionType === 'rename') {
    // console.log(`Rename action triggered for: ${selectedNode.name}`)
    emit('rename-item', { id: selectedNode.id, currentName: selectedNode.name })
  } else if (actionType === 'move') {
    console.log(`Move action triggered for: ${selectedNode.name}`)
    // emit('move-item', selectedNode.id);
  } else if (actionType === 'duplicate') {
    console.log(`Duplicate action triggered for: ${selectedNode.name}`)
    // emit('duplicate-item', selectedNode.id);
  }
  // 다른 액션 타입들은 추후 구현
}

function canPerformAction(actionType) {
  const selectedNode = boardEditorStore.drawerSelectionForAdmin
  if (!selectedNode || !selectedNode.id) return false

  // 현재는 모든 액션을 허용하지만, 파라미터를 사용하여 Linter 에러 해결
  switch (actionType) {
    case 'delete':
    case 'rename':
    case 'move':
    case 'duplicate':
      return true
    default:
      return false
  }
}

const getIconColor = (type) => {
  return computed(() => {
    if (props.modelValue === type) return 'primary'
    if (!props.isSelectable) return 'grey-5'
    if (type === 'edit' && !props.isEditingPossible) return 'grey-5'
    return 'grey-7'
  })
}

const getCardClasses = (type) => {
  return computed(() => ({
    selected: props.modelValue === type,
    // shrunken 클래스 제거
    'non-selectable': !props.isSelectable || (type === 'edit' && !props.isEditingPossible),
    'disabled-look': type === 'edit' && !props.isEditingPossible,
  }))
}
</script>

<style scoped>
/* 카드를 감싸는 행(row)이 flex 역할을 하고, 내부 아이템(열)들이 공간을 차지하도록 합니다. */
.row {
  /* TypeSelection.vue 템플릿의 <div class="row q-col-gutter-md justify-center full-height-row items-stretch"> 에 해당 */
  display: flex;
  flex-wrap: wrap; /* 화면이 작을 때 카드가 다음 줄로 넘어가도록 */
  width: 100%; /* 부모(.type-selection)의 너비를 채우도록 */
}

/* 타입 선택 카드 자체 스타일 */
.type-card {
  width: 100%;
  max-width: 300px;
  max-height: 180px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  border: 2px solid #1d1d1d;
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

/* 단계 번호 스타일 추가 */
/* .step-header 규칙 제거 */

.step-number {
  width: 44px; /* 크기 동일하게 */
  height: 44px; /* 크기 동일하게 */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem; /* 글꼴 크기 동일하게 */
  font-weight: bold;
}

.type-selection-component-wrapper {
  width: 100%;
  transition: margin-bottom 1s ease-out; /* 하단 마진 변경 애니메이션 */
}

.type-selection-component-wrapper.selection-complete {
  margin-bottom: 0px; /* 선택 완료 시 하단 마진을 줄임 (값 조절 필요). 예: -20px 또는 원하는 만큼 */
  /* 또는 padding-bottom: 0; 등으로 내부 간격을 줄일 수도 있습니다. */
}

.type-selection {
  display: flex;
  flex-direction: column;
  align-items: center; /* 내부 .full-height-row가 중앙에 오도록 */
  justify-content: center;
  width: 100%; /* 부모 너비를 채우도록 명시 (기존 auto에서 변경) */
  transition: transform 1s ease-out; /* 축소 애니메이션 대비 */
}

/* 전체 컴포넌트가 비활성화(선택 완료) 상태일 때 약간 축소되는 효과 (선택적) */
/* .type-selection.selection-disabled { */
/* transform: scale(0.95); */
/* margin-bottom: -20px; */ /* 축소 시 레이아웃 보정용 (필요시) */
/* } */

.full-height-row {
  height: 100%;
  justify-content: center; /* 이 부분은 flex-start로 바꿀 수도 있음 */
  /* gap: 1px; */ /* q-col-gutter 클래스의 효과를 위해 주석 처리 */
  flex-wrap: wrap; /* nowrap에서 wrap으로 변경 또는 삭제 고려 (우선 wrap으로) */
  width: 100%; /* 부모(.type-selection) 너비를 따르도록 */
  max-width: 900px; /* 카드들을 포함하는 행 전체의 최대 너비 설정 (예: 3개의 카드가 적절히 들어갈 너비 + gutter) */
  /* items-stretch: true; CSS 속성 대신 클래스로 적용되었으므로 이 라인은 불필요 */
}

.full-center-col {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  max-width: none;
  /* flex: none; */ /* Quasar 그리드 시스템이 열의 flex를 제어하도록 이 줄을 주석 처리 또는 삭제 */
}

/* 일반 hover 효과 */
.type-card:not(.non-selectable):hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.1),
    0 6px 6px rgba(0, 0, 0, 0.15);
}

.type-card:not(.non-selectable):hover .q-icon {
  color: var(--nexa-accent) !important;
}

.type-card.selected {
  border: 2px solid var(--nexa-primary) !important;
  box-shadow: 0 0 8px rgba(var(--nexa-primary-rgb), 0.5);
}

/* isSelectable이 false일 때 (선택 불가능 상태) */
.type-card.non-selectable {
  cursor: default;
}

/* isSelectable이 false이고, 해당 카드가 선택되지 않았을 때 */
.type-card.deselected-when-disabled {
  opacity: 0.6;
}

/* isSelectable이 false이고, 해당 카드가 선택되었을 때 (여전히 강조) */
.type-card.selected.non-selectable {
  opacity: 1;
}

.card-content-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px; /* DirectorySelection.vue와 일치 (기존 TypeSelection은 20px 또는 25px였음) */
  transition: padding 0.3s ease;
}

/* .type-card 내부의 아이콘, 제목, 설명 스타일 (DirectorySelection.vue 기반으로 통일) */
.type-card .q-icon {
  /* font-size: 4rem; 이미 q-icon 태그에 size="4rem"으로 명시됨 */
  /* margin-bottom: -10px; DirectorySelection.vue에는 없었음. TypeSelection.vue의 shrunken 아닌 상태와 비교 필요. 우선 DirectorySelection.vue 기준 */
  /* 기본 상태 아이콘 스타일은 DirectorySelection.vue의 .directory-card .q-icon을 참고해야하는데, 해당 스타일 없음. */
  /* q-icon 태그 자체의 props와 shrunken 상태의 스타일로 대부분 제어됨. */
  transition: /* DirectorySelection.vue에 없음, 필요시 추가 */
    font-size 0.3s ease,
    margin-bottom 0.3s ease;
}

.type-card .text-h6 {
  font-size: clamp(0.9rem, 0.7rem + 0.8vw, 1.15rem);
  margin-top: 0px; /* DirectorySelection.vue와 일치 */
  margin-bottom: 4px; /* DirectorySelection.vue와 일치 */
  transition:
    font-size 0.3s ease,
    margin 0.3s ease;
}

.type-card .description {
  min-height: 1.1em; /* 최소 높이는 유지하되, 내용이 한 줄을 넘지 않도록 함 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* 내용이 넘칠 경우 숨김 */
  text-overflow: ellipsis; /* 넘치는 내용은 말줄임표로 표시 */
  font-size: 0.8rem;
  white-space: nowrap; /* 줄바꿈 방지 */
  width: 100%; /* 부모 너비에 맞춤 */
  transition:
    font-size 0.3s ease,
    min-height 0.3s ease;
}

/* 아이콘 애니메이션 관련 - isSelectable과 연동 필요 */
/* .icon-animate ... */
/* .icon-animate-active ... */

/* 카드와 동일한 버튼 스타일 및 hover 효과 */
.action-button.card-border {
  border: 2px solid #1d1d1d;
  border-radius: 8px;
  background: transparent;
  box-shadow:
    0 2px 6px rgba(203, 203, 203, 0.112),
    0 1.5px 0px 0px rgba(255, 255, 255, 0.08) inset;
  transition:
    transform 0.2s ease-out,
    box-shadow 0.2s ease-out;
}
.action-button.card-border:hover,
.action-button.card-border:focus,
.action-button.card-border:active {
  background: transparent !important;
}
.action-button.card-border:hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.1),
    0 6px 6px rgba(0, 0, 0, 0.15);
}
.action-button.card-border:hover .q-icon {
  color: var(--nexa-accent) !important;
}

/* Quasar 버튼 내부 래퍼까지 완전히 배경 제거 */
.action-button.card-border .q-btn__wrapper,
.action-button.card-border:hover .q-btn__wrapper,
.action-button.card-border:focus .q-btn__wrapper,
.action-button.card-border:active .q-btn__wrapper {
  background: transparent !important;
  box-shadow: none !important;
}

/* action-buttons-row 스타일 수정 */
.action-buttons-row {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

/* action-card 스타일 */
.action-cards-row {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}
.action-card {
  /* flex: 1 1 0; */
  min-width: 80px;
  max-width: 100%;
  margin: 0;
  border: 2px solid #1d1d1d;
  border-radius: 8px;
  box-shadow:
    0 2px 6px rgba(203, 203, 203, 0.112),
    0 1.5px 0px 0px rgba(255, 255, 255, 0.08) inset;
  background: transparent;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  padding: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.action-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.1),
    0 6px 6px rgba(0, 0, 0, 0.15);
}
.action-card .action-icon {
  color: grey;
  font-size: 28px;
  margin-right: 8px;
  transition: color 0.2s;
}
.action-card:hover .action-icon {
  color: var(--nexa-accent) !important;
}
.action-label {
  font-size: 1rem;
  color: #a8a8a8;
  font-weight: 500;
}
.disabled-card {
  opacity: 0.5;
  pointer-events: none;
}
</style>

<template>
  <div class="multi-direction-tabs-container" :class="{ 'injected-mode': isInjectedMode }">
    <div v-if="allTabs.length > 0" class="tabs-section">
      <div class="tabs-wrapper" :class="{ 'tabs-hidden': !isTabsVisible }" :style="{ transform: `translateY(${titlePosition}px)` }">
        <div class="title-container" @mousedown="startDrag">
          <div class="nexa-title">NEXA</div>
          <div class="nexa-subtitle">U2 SOLUTION</div>
        </div>

        <transition name="fade-tabs">
          <div v-show="isTabsVisible" class="tabs-container">
            <button v-for="tab in allTabs" :key="tab.name" :class="['tab-button', { active: activeTab === tab.name }]" @click="selectTab(tab.name)">
              <q-icon v-if="tab.icon" :name="tab.icon" :size="isInjectedMode ? '20px' : '16px'" />
              <span class="tab-label" :class="{ 'injected-label': isInjectedMode }">
                {{ tab.label }}
              </span>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useTabConfig } from 'src/composables/extension/u2bee/useTabConfig'

defineProps({
  activeTab: { type: String, required: true },
  isInjectedMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:activeTab'])
const { visibleTabs } = useTabConfig()

// 상태 관리
const isTabsVisible = ref(true)
const titlePosition = ref(0)
const isDragging = ref(false)
const dragStartY = ref(0)
const dragStartPosition = ref(0)
const STORAGE_KEY = 'u2bee_title_position'
const DRAG_THRESHOLD = 5

const allTabs = computed(() => visibleTabs.value)

// 위치 로드 및 저장
const loadPos = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) titlePosition.value = parseInt(saved, 10)
}
const savePos = () => localStorage.setItem(STORAGE_KEY, titlePosition.value.toString())

// 드래그 로직
const startDrag = (e) => {
  isDragging.value = true
  dragStartY.value = e.clientY
  dragStartPosition.value = titlePosition.value
  e.preventDefault()
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return
  const deltaY = e.clientY - dragStartY.value
  const newPos = dragStartPosition.value + deltaY

  // 경계 제한 (뷰포트 기준 상하 40%)
  const limit = window.innerHeight * 0.4
  titlePosition.value = Math.max(-limit, Math.min(limit, newPos))
}

const handleMouseUp = (e) => {
  if (!isDragging.value) return
  const dist = Math.abs(e.clientY - dragStartY.value)
  isDragging.value = false

  if (dist < DRAG_THRESHOLD) {
    isTabsVisible.value = !isTabsVisible.value
  } else {
    savePos()
  }
}

onMounted(() => {
  loadPos()
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})

// 탭 선택 및 외부 통신
const selectTab = (tabName) => {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'OPEN_SIDE_PANEL', tabName }, '*')
  }
  emit('update:activeTab', tabName)
}
</script>

<style lang="scss" scoped>
// 최상위 투명화 통합
:deep(.q-layout),
:deep(.q-page-container),
:deep(.q-page) {
  background: transparent !important;
}

.multi-direction-tabs-container {
  pointer-events: none;
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: flex-end; // 우측 정렬 고정
}

.tabs-section {
  width: 80px;
  pointer-events: auto;
  display: flex;
  justify-content: center;
}

.tabs-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  will-change: transform; // 성능 최적화
}

.title-container {
  cursor: pointer;
  background: rgba(45, 137, 62, 0.8);
  padding: 4px 8px;
  border-radius: 4px 0 0 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: background 0.2s;

  &:hover {
    background: rgba(45, 137, 62, 1);
  }
  &:active {
    cursor: grabbing;
  }
}

.nexa-title {
  font-size: 13px;
  font-weight: 900;
  color: white;
  letter-spacing: 1px;
}
.nexa-subtitle {
  font-size: 5px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: -2px;
}

.tabs-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tab-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  min-height: 40px;
  border: none;
  background: rgba(45, 137, 62, 0.5);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(45, 137, 62, 0.9);
    transform: scale(1.1);
  }

  &.active {
    background: #1e5a28;
    border-radius: 12px 0 0 12px;
    width: 46px;
    margin-left: -6px; // 살짝 튀어나오는 효과
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.4);
  }
}

.tab-label {
  font-size: 7px;
  writing-mode: vertical-rl;
  &.injected-label {
    writing-mode: horizontal-tb;
    font-size: 8px;
  }
}

// 애니메이션 간소화
.fade-tabs-enter-from,
.fade-tabs-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.fade-tabs-enter-active,
.fade-tabs-leave-active {
  transition: all 0.3s ease;
}
</style>

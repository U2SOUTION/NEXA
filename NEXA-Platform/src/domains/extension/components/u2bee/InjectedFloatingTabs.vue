<template>
  <div class="multi-direction-tabs-container" :class="{ 'injected-mode': isInjectedMode }">
    <div v-if="allTabs.length > 0" class="tabs-section">
      <div class="tabs-wrapper" :style="{ transform: `translateY(${titlePosition}px)` }">
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
import { useTabConfig } from '@system/composables/extension/u2bee/useTabConfig.js'

defineProps({
  activeTab: { type: String, required: true },
  isInjectedMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:activeTab'])
const { visibleTabs } = useTabConfig()

const isTabsVisible = ref(true)
const titlePosition = ref(0)
const isDragging = ref(false)
const dragStartY = ref(0)
const dragStartPosition = ref(0)
const STORAGE_KEY = 'u2bee_title_position'
const DRAG_THRESHOLD = 5

const allTabs = computed(() => visibleTabs.value)

const loadPos = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) titlePosition.value = parseInt(saved, 10)
}
const savePos = () => localStorage.setItem(STORAGE_KEY, titlePosition.value.toString())

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

  // 뷰포트 내에서만 움직이도록 제한
  const limit = window.innerHeight * 0.45
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
  window.addEventListener('mousemove', handleMouseMove, { passive: false })
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})

const selectTab = (tabName) => {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'OPEN_SIDE_PANEL', tabName }, '*')
  }
  emit('update:activeTab', tabName)
}
</script>

<style lang="scss" scoped>
:deep(.q-layout),
:deep(.q-page-container),
:deep(.q-page) {
  background: transparent !important;
}

.multi-direction-tabs-container {
  pointer-events: none;
  display: flex;
  height: 100vh;
  /* 핵심 1: center를 제거하고 flex-start로 고정하여 부모의 자동 높이 계산 차단 */
  align-items: flex-start;
  justify-content: flex-end;
  overflow: hidden;
  /* 핵심 2: 시작 위치를 화면 중앙 부근으로 설정 (필요 시 조정) */
  padding-top: 30vh;
}

.tabs-section {
  width: 80px;
  pointer-events: auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 6px;
}

.tabs-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  will-change: transform;
  /* 내부 정렬도 상단 기준으로 고정 */
  justify-content: flex-start;
}

.title-container {
  cursor: pointer;
  background: rgba(45, 137, 62, 0.9);
  padding: 6px 10px;
  border-radius: 6px 0 0 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  z-index: 10;
  /* 타이틀 크기가 변하지 않도록 강제 */
  flex-shrink: 0;
  width: 60px;
}

.nexa-title {
  font-size: 13px;
  font-weight: 900;
  color: white;
  letter-spacing: 1.2px;
  line-height: 1.2;
}
.nexa-subtitle {
  font-size: 6px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: -1px;
}

.tabs-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  /* 탭이 생겨도 상단 타이틀을 밀어내지 않음 */
}

.tab-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: none;
  background: rgba(45, 137, 62, 0.6);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(45, 137, 62, 1);
    transform: scale(1.1);
  }
  &.active {
    background: #1e5a28;
    border-radius: 12px 0 0 12px;
    width: 50px;
    height: 36px;
    margin-left: -6px;
    margin-right: -10px;
    align-self: flex-end;
  }
}

.tab-label {
  font-size: 8px;
  writing-mode: horizontal-tb;
  text-orientation: mixed;
  margin-top: -2px;
  line-height: 1;
}

/* 애니메이션 설정 */
.fade-tabs-enter-from,
.fade-tabs-leave-to {
  opacity: 0;
  transform: translateY(-10px); /* 위에서 아래로 살짝 움직이며 등장 */
}
.fade-tabs-enter-active,
.fade-tabs-leave-active {
  transition: all 0.3s ease;
}
</style>

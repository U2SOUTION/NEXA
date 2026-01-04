<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="multi-direction-tabs-container" :class="{ 'injected-mode': isInjectedMode }">
    <!-- 탭만 표시 (콘텐츠 패널 제거) -->
    <div v-if="allTabs.length > 0" class="tabs-section tabs-right">
      <div class="tabs-wrapper" :class="{ 'tabs-hidden': !isTabsVisible }">
        <div class="title-container" @click="toggleTabs">
          <div class="nexa-title">NEXA</div>
          <div class="nexa-subtitle">U2 SOLUTION</div>
        </div>
        <transition name="fade-tabs">
          <div v-show="isTabsVisible" class="tabs-container">
            <button v-for="tab in allTabs" :key="tab.name" :class="['tab-button', 'tab-right', { active: activeTab === tab.name }]" @click="selectTab(tab.name)">
              <q-icon v-if="tab.icon" :name="tab.icon" :size="isInjectedMode ? '20px' : '16px'" class="tab-icon-vertical" />
              <span class="tab-label-vertical" :class="{ 'injected-label': isInjectedMode }">{{ tab.label }}</span>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useTabConfig } from 'src/composables/extension/u2bee/useTabConfig'

defineProps({
  activeTab: {
    type: String,
    required: true,
  },
  isInjectedMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:activeTab'])

const { visibleTabs } = useTabConfig()

// 아이콘 표시/숨김 상태
const isTabsVisible = ref(true)

// 타이틀 클릭 시 토글
function toggleTabs() {
  isTabsVisible.value = !isTabsVisible.value
}

// 모든 탭을 우측에 세로로 배치
const allTabs = computed(() => {
  return visibleTabs.value
})

function selectTab(tabName) {
  // 탭 클릭 시 부모 창(Content Script)에 메시지 전송
  // Content Script에서 Chrome 사이드 패널을 열도록 요청
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'OPEN_SIDE_PANEL',
          tabName: tabName,
        },
        '*',
      )
    } else {
      // 직접 Chrome API 사용 시도 (일반 모드일 경우)
      if (typeof chrome !== 'undefined' && chrome.sidePanel) {
        chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
          if (tabs.length > 0 && tabs[0].windowId) {
            chrome.sidePanel.open({ windowId: tabs[0].windowId }).then(() => {
              setTimeout(() => {
                chrome.runtime
                  .sendMessage({
                    type: 'SWITCH_TAB',
                    tabName: tabName,
                    windowId: tabs[0].windowId,
                  })
                  .catch((error) => {
                    console.error('[MultiDirectionTabs] 탭 전환 메시지 전송 실패:', error)
                  })
              }, 100)
            })
          }
        })
      }
    }

    // 로컬 상태도 업데이트 (탭 활성화 표시용)
    emit('update:activeTab', tabName)
  } catch (error) {
    console.error('[MultiDirectionTabs] 사이드 패널 열기 실패:', error)
  }
}
</script>

<style lang="scss" scoped>
// 전체 배경 투명화
:deep(html),
:deep(body),
:deep(#q-app),
:deep(.q-page),
:deep(.q-page-container),
:deep(.q-layout),
:deep(.q-layout__section),
:deep(.q-layout__container) {
  background: transparent !important;
}

.multi-direction-tabs-container {
  background: transparent !important;
  pointer-events: none;
  display: flex;
  height: 100vh;
  align-items: center;
}

.tabs-right {
  width: 80px;
  height: 100%;
  border: none !important;
  background: transparent !important;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;

  .tabs-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1px 0;
    gap: 1px;
    height: auto;
    background: transparent !important;
    justify-content: flex-start;
    transition: justify-content 0.9s ease;
    margin-left: 10px;

    &.tabs-hidden {
      justify-content: center;
    }
  }

  .title-container {
    pointer-events: auto;
    cursor: pointer;
    user-select: none;
    background: rgba(45, 137, 62, 0.7);
    padding: 3px 8px;
    border-radius: 4px 0 0 4px;
    transition: all 0.9s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 3px;

    &:hover {
      background: rgba(45, 137, 62, 0.85);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }

  .nexa-title {
    font-size: 14px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.95);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    line-height: 1.2;
  }

  .nexa-subtitle {
    font-size: 5px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 1px;
    line-height: 1;
    margin-top: -2px;
  }

  .tabs-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
  }

  // 아이콘 사라질 때: 먼저 사라지고, 그 후 NEXA가 센터로 이동
  .fade-tabs-leave-active {
    transition:
      opacity 0.3s ease,
      transform 0.9s ease;
  }

  /* 탭 아이콘 사라질 때 */
  .fade-tabs-leave-to {
    opacity: 0;
    transform: translateX(10px);
  }

  // 아이콘 나타날 때: NEXA가 먼저 상단으로 이동한 후 나타남
  .fade-tabs-enter-active {
    transition:
      opacity 0.3s ease 0.3s,
      transform 0.3s ease 0.9s;
  }

  // 탭 아이콘 나타날 때
  .fade-tabs-enter-from {
    opacity: 0;
    transform: translateX(10px);
  }

  .tab-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 38px;
    min-height: 38px;
    padding: 2px;
    border: none;
    background: rgba(45, 137, 62, 0.4);
    color: #ffffff;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s ease;
    gap: 0;
    margin: 2px auto;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

    // .multi-direction-tabs-container.injected-mode & {
    //   padding: 0 2px 0 1px;
    // }

    &:hover {
      background: rgba(37, 107, 50, 0.95);
      transform: scale(1.05);
    }

    &.active {
      background: rgba(30, 90, 40, 1);
      font-weight: 700;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.9);
      transform: scale(1.1);
      border-radius: 16px 0 0 16px;
      width: 40px;
      padding-left: 12px;
      align-items: flex-start;
    }

    .tab-label-vertical {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      text-align: center;
      line-height: 1;
      letter-spacing: 0.5px;
      font-size: 7px;
      //margin-top: -1px;

      &.injected-label {
        writing-mode: horizontal-tb;
        font-size: 6px;
        line-height: 1;
        white-space: nowrap;
        margin-top: -2px;
      }
    }
  }
}
</style>

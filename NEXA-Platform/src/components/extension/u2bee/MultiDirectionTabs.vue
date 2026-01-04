<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="multi-direction-tabs-container" :class="{ 'injected-mode': isInjectedMode }">
    <!-- 탭만 표시 (콘텐츠 패널 제거) -->
    <div v-if="allTabs.length > 0" class="tabs-section tabs-right">
      <div class="tabs-wrapper">
        <button
          v-for="tab in allTabs"
          :key="tab.name"
          :class="['tab-button', 'tab-right', { active: activeTab === tab.name }]"
          @click="selectTab(tab.name)"
        >
          <span class="tab-label-vertical">{{ tab.label }}</span>
          <q-icon v-if="tab.icon" :name="tab.icon" size="16px" class="tab-icon-vertical" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
        '*'
      )
    } else {
      // 직접 Chrome API 사용 시도 (일반 모드일 경우)
      if (typeof chrome !== 'undefined' && chrome.sidePanel) {
        chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
          if (tabs.length > 0 && tabs[0].windowId) {
            chrome.sidePanel.open({ windowId: tabs[0].windowId }).then(() => {
              setTimeout(() => {
                chrome.runtime.sendMessage({
                  type: 'SWITCH_TAB',
                  tabName: tabName,
                  windowId: tabs[0].windowId,
                }).catch((error) => {
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
.multi-direction-tabs-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  box-sizing: border-box;

  &.injected-mode {
    min-height: 100%;
    height: 100vh;
    overflow: hidden;
  }
}

// 우측 탭 (세로, 둥근 왼쪽 모서리)
.tabs-right {
  width: 100%;
  height: 100%;
  border-left: 1px solid var(--nexa-border-color);
  background: var(--nexa-background);

  .tabs-wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 8px 0;
    gap: 8px;
    height: 100%;
  }

  .tab-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 80px;
    padding: 12px 8px;
    border: none;
    background: #2d893e; // 녹색 배경
    color: #ffffff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 20px 0 0 20px; // 왼쪽만 둥글게
    transition: all 0.2s ease;
    gap: 6px;
    margin-right: 0; // 오른쪽 경계선에 붙임
    position: relative;

    // 왼쪽 둥근 부분 강조
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 20px;
      border-radius: 20px 0 0 20px;
      background: inherit;
    }

    &:hover {
      background: #256b32; // 더 어두운 녹색
      transform: translateX(-2px); // 약간 왼쪽으로 이동
    }

    &.active {
      background: #1e5a28; // 가장 어두운 녹색
      font-weight: 700;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
      transform: translateX(-4px); // 활성화 시 더 왼쪽으로
    }

    .tab-label-vertical {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      text-align: center;
      line-height: 1.4;
      letter-spacing: 1px;
    }

    .tab-icon-vertical {
      margin-top: 4px;
    }
  }
}
</style>

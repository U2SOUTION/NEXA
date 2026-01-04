<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="multi-direction-tabs-container" :class="{ 'injected-mode': isInjectedMode }">
    <!-- 탭만 표시 (콘텐츠 패널 제거) -->
    <div v-if="allTabs.length > 0" class="tabs-section tabs-right">
      <div class="tabs-wrapper">
        <button v-for="tab in allTabs" :key="tab.name" :class="['tab-button', 'tab-right', { active: activeTab === tab.name }]" @click="selectTab(tab.name)">
          <span v-if="!isInjectedMode" class="tab-label-vertical">{{ tab.label }}</span>
          <q-icon v-if="tab.icon" :name="tab.icon" :size="isInjectedMode ? '20px' : '16px'" class="tab-icon-vertical" />
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
// 전체 배경 완전히 제거
:deep(html),
:deep(body),
:deep(#q-app),
:deep(.q-page),
:deep(.q-page-container),
:deep(.q-layout),
:deep(.q-layout__section),
:deep(.q-layout__container) {
  background: transparent !important;
  background-color: transparent !important;
}

.multi-direction-tabs-container {
  background: transparent !important;
  pointer-events: none; // 배경은 클릭 통과
  display: flex; // flex container로 설정
  height: 100vh; // 전체 높이 사용
  align-items: center; // 상하 중앙 정렬

  &.injected-mode {
    background: transparent !important;
    pointer-events: none;
    height: 100vh; // injected 모드에서도 전체 높이 사용
    display: flex;
    align-items: center;
  }
}

// 우측 탭 (세로, 원형 아이콘)
.tabs-right {
  width: 100px;
  height: 100%; // 부모의 전체 높이 사용
  border: none !important;
  background: transparent !important;
  pointer-events: auto; // 탭은 클릭 가능
  display: flex; // flex container로 설정
  align-items: center; // 상하 중앙 정렬
  justify-content: center; // 좌우 중앙 정렬

  .tabs-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
    gap: 8px;
    height: auto; // 높이를 auto로 변경하여 내용에 맞춤
    background: transparent !important;
    justify-content: center; // 상하 중앙 정렬
  }

  .tab-right {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 60px; // 원형 아이콘 크기
    min-height: 60px; // 원형 아이콘 크기
    padding: 8px;
    border: none;
    background: rgba(45, 137, 62, 0.9); // 탭 자체만 배경색
    color: #ffffff;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 50%; // 원형 아이콘
    transition: all 0.2s ease;
    gap: 4px;
    margin: 4px auto; // 중앙 정렬
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

    // Injected 모드에서 아이콘만 표시하도록 조정
    .multi-direction-tabs-container.injected-mode & {
      gap: 0;
      padding: 12px;
    }

    &:hover {
      background: rgba(37, 107, 50, 0.95);
      transform: scale(1.1);
    }

    &.active {
      background: rgba(30, 90, 40, 1);
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transform: scale(1.15);
      border-radius: 20px 0 0 20px; // 활성화 시 왼쪽으로 확장
      width: 80px; // 확장된 너비
    }

    .tab-label-vertical {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      text-align: center;
      line-height: 1.4;
      letter-spacing: 1px;
      font-size: 10px;

      // Injected 모드에서는 텍스트 레이블 숨기기 (아이콘만 표시)
      .multi-direction-tabs-container.injected-mode & {
        display: none !important;
      }
    }

    // Injected 모드에서 아이콘만 표시
    .multi-direction-tabs-container.injected-mode & {
      .tab-label-vertical {
        display: none !important;
      }

      // 아이콘만 중앙 정렬
      .tab-icon-vertical {
        margin: 0;
      }
    }

    .tab-icon-vertical {
      margin-top: 4px;
    }
  }
}
</style>

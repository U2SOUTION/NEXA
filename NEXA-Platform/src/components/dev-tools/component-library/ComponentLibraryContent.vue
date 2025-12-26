<template>
  <div class="component-library-content">
    <!-- 메인 컨텐츠: 탭에 따라 다른 컴포넌트 표시 -->
    <div class="component-library-main">
      <!-- 디버깅 정보 (개발 중에만 표시) -->
      <!-- <div style="position: fixed; top: 0; right: 0; background: rgba(0,0,0,0.8); color: white; padding: 8px; z-index: 9999;">
        activeTab: {{ activeTab }}
      </div> -->

      <!-- 전체 컴포넌트 상세 -->
      <ComponentDetail v-if="activeTab === 'all'" />

      <!-- 시스템 상세 (NEXA 시스템 기준 수동 분류) -->
      <CategoryDetail v-else-if="activeTab === 'systems'" tab-name="systems" />

      <!-- 디렉토리 상세 (디렉토리 기반 자동 분류) -->
      <CategoryDetail v-else-if="activeTab === 'directory'" tab-name="directory" />

      <!-- 체계분석 상세 (다차원 분류 + 적합성 평가) -->
      <TaxonomyDetail v-else-if="activeTab === 'analysis'" />

      <!-- 디버깅: 어떤 탭도 매칭되지 않을 때 -->
      <div v-else style="padding: 2rem; text-align: center; color: var(--nexa-text-secondary);">
        <q-icon name="warning" size="48px" class="q-mb-md" />
        <div>알 수 없는 탭: {{ activeTab }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import CategoryDetail from './CategoryDetail.vue'
import ComponentDetail from './ComponentDetail.vue'
import TaxonomyDetail from './TaxonomyDetail.vue'

// 탭 상태 (기본값: 전체)
const activeTab = ref('all')

// activeTab 변경 감지
watch(activeTab, (newValue, oldValue) => {
  console.log('[ComponentLibraryContent] activeTab 변경:', oldValue, '->', newValue)
})

// 탭 변경 이벤트 리스너
function handleTabChanged(event) {
  console.log('[ComponentLibraryContent] 탭 변경 이벤트 수신:', event.detail)
  activeTab.value = event.detail.tab || 'all'
  console.log('[ComponentLibraryContent] activeTab 업데이트:', activeTab.value)
}

onMounted(() => {
  console.log('[ComponentLibraryContent] 마운트됨, 초기 activeTab:', activeTab.value)
  window.addEventListener('component-library-tab-changed', handleTabChanged)
  
  // 초기 탭 설정 확인
  console.log('[ComponentLibraryContent] 현재 activeTab 값:', activeTab.value)
  console.log('[ComponentLibraryContent] ComponentDetail 렌더링 조건:', activeTab.value === 'all')
})

onUnmounted(() => {
  window.removeEventListener('component-library-tab-changed', handleTabChanged)
})
</script>

<style lang="scss" scoped>
.component-library-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background);
  min-height: 0; // flex item이 축소될 수 있도록
  height: 100%;
  overflow: hidden; // q-page의 overflow-y: auto를 오버라이드
}

.component-library-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0; // flex item이 축소될 수 있도록
}
</style>

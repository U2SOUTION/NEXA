<!-- ExtensionSidebar.vue
  확장 프로그램 페이지 왼쪽 사이드바
  확장 프로그램 카테고리 네비게이션
-->

<template>
  <div class="extension-sidebar">
    <q-list>
      <!-- 헤더 -->
      <div class="sidebar-header q-pa-md">
        <div class="text-h4 text-primary q-mb-xs text-bold">Extension</div>
        <div class="text-caption text-grey-7">NEXA Platform 확장 프로그램</div>
      </div>

      <q-separator />

      <!-- 확장 프로그램 카테고리 -->
      <div class="q-pa-sm">
        <q-btn flat dense @click="selectTab('chrome')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'chrome' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="extension" class="q-mr-sm" />
              <span>크롬 확장 프로그램</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('desktop')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': activeTab === 'desktop' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="desktop_windows" class="q-mr-sm" />
              <span>NEXA Desktop</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="selectTab('others')" :class="['btn-nexa-primary text-bold full-width q-py-xs', { 'active-menu': activeTab === 'others' }]">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="apps" class="q-mr-sm" />
              <span>기타 확장 프로그램</span>
            </div>
          </template>
        </q-btn>
      </div>

      <q-separator />

      <!-- 확장 프로그램 목록 (서브메뉴) -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">확장 프로그램</div>

        <!-- 크롬 확장 프로그램 서브메뉴 -->
        <template v-if="activeTab === 'chrome'">
          <q-btn flat dense @click="goToExtension('chrome', 'u2bee')" class="btn-nexa-secondary q-mb-xs full-width q-py-xs q-pl-md">
            <template v-slot:default>
              <div class="full-width row items-center">
                <q-icon name="video_library" class="q-mr-sm" size="18px" />
                <span>U2BEE</span>
              </div>
            </template>
          </q-btn>
        </template>

        <!-- NEXA Desktop 서브메뉴 -->
        <template v-if="activeTab === 'desktop'">
          <q-btn flat dense @click="goToExtension('desktop', 'nexa-desktop')" class="btn-nexa-secondary q-mb-xs full-width q-py-xs q-pl-md">
            <template v-slot:default>
              <div class="full-width row items-center">
                <q-icon name="computer" class="q-mr-sm" size="18px" />
                <span>NEXA Desktop Client</span>
              </div>
            </template>
          </q-btn>
        </template>

        <!-- 기타 확장 프로그램 서브메뉴 -->
        <template v-if="activeTab === 'others'">
          <q-btn flat dense @click="goToExtension('others', 'screendraw')" class="btn-nexa-secondary q-mb-xs full-width q-py-xs q-pl-md">
            <template v-slot:default>
              <div class="full-width row items-center">
                <q-icon name="draw" class="q-mr-sm" size="18px" />
                <span>ScreenDraw</span>
              </div>
            </template>
          </q-btn>
          <q-btn flat dense @click="goToExtension('others', 'mexa-break')" class="btn-nexa-secondary full-width q-py-xs q-pl-md">
            <template v-slot:default>
              <div class="full-width row items-center">
                <q-icon name="timer" class="q-mr-sm" size="18px" />
                <span>MEXA Break</span>
              </div>
            </template>
          </q-btn>
        </template>
      </div>
    </q-list>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// URL query parameter에서 activeTab 초기화
const activeTab = ref(route.query.tab || 'chrome')

// URL query parameter 변경 감지
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) {
      activeTab.value = newTab
    }
  },
  { immediate: true },
)

function selectTab(tab) {
  activeTab.value = tab

  // 각 카테고리의 기본 확장 프로그램 설정
  const defaultExtensions = {
    chrome: 'u2bee',
    desktop: 'nexa-desktop',
    others: null, // others는 기본 확장 프로그램이 없으므로 메인 페이지 유지
  }

  const defaultExtension = defaultExtensions[tab]
  const query = defaultExtension ? { tab, extension: defaultExtension } : { tab }

  // URL query parameter 업데이트
  router.push({
    path: '/extension',
    query,
  })
}

function goToExtension(category, extensionId) {
  // 확장 프로그램 상세 페이지로 이동 (현재는 탭만 변경)
  // 추후 확장 프로그램별 상세 페이지가 생기면 해당 경로로 이동
  router.push({
    path: '/extension',
    query: { tab: category, extension: extensionId },
  })
}
</script>

<style lang="scss" scoped>
.extension-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    background: var(--nexa-surface-header-bg);
    border-bottom: 1px solid var(--nexa-border-color);
  }

  .q-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .active-menu {
    background-color: rgba(65, 170, 223, 0.15) !important;
    border-left: 3px solid var(--nexa-button-primary-bg);
  }

  .btn-nexa-secondary {
    text-align: left;
    justify-content: flex-start;
    color: var(--nexa-text-primary);

    &:hover {
      background-color: var(--nexa-surface-hover);
    }
  }
}
</style>

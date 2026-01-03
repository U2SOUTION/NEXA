<template>
  <q-page class="extension-page">
    <div class="q-pa-lg">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary q-mb-sm">Extension</h1>
        <p class="text-body1 text-grey-7">NEXA Platform 확장 프로그램 관리</p>
      </div>

      <q-tabs v-model="activeTab" class="q-mb-none">
        <q-tab name="chrome" label="크롬 확장 프로그램" />
        <q-tab name="desktop" label="NEXA Desktop" />
        <q-tab name="others" label="기타 확장 프로그램" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <!-- 크롬 확장 프로그램 -->
        <q-tab-panel name="chrome" class="network-tab-panel">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6 col-lg-4 solution-item">
              <div class="text-h6 q-mb-sm">U2BEE</div>
              <ul class="text-body2 text-grey-7">
                <li>콘텐츠 수집 및 관리 확장 프로그램</li>
                <li>YouTube, TikTok 등 플랫폼 지원</li>
                <li>실시간 정보 추출 및 분석</li>
              </ul>
            </div>
          </div>
        </q-tab-panel>

        <!-- NEXA Desktop -->
        <q-tab-panel name="desktop" class="network-tab-panel">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6 col-lg-4 solution-item">
              <div class="text-h6 q-mb-sm">NEXA Desktop Client</div>
              <ul class="text-body2 text-grey-7">
                <li>Python 기반 데스크톱 애플리케이션</li>
                <li>플랫폼 통합 데스크톱 클라이언트</li>
                <li>웹뷰 기반 UI 구성</li>
              </ul>
            </div>
          </div>
        </q-tab-panel>

        <!-- 기타 확장 프로그램 -->
        <q-tab-panel name="others" class="network-tab-panel">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6 col-lg-4 solution-item">
              <div class="text-h6 q-mb-sm">ScreenDraw</div>
              <ul class="text-body2 text-grey-7">
                <li>화면 그리기 및 주석 도구</li>
                <li>실시간 화면 캡처 및 편집</li>
              </ul>
            </div>

            <div class="col-12 col-md-6 col-lg-4 solution-item">
              <div class="text-h6 q-mb-sm">MEXA Break</div>
              <ul class="text-body2 text-grey-7">
                <li>작업 효율화 타이머</li>
                <li>쾌적한 작업 환경 유지</li>
              </ul>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('chrome')
</script>

<style lang="scss" scoped>
.extension-page {
  background: var(--nexa-background);
  min-height: 100vh;
}

.network-tab-panel {
  counter-reset: section-counter;
  border-radius: 4px;
  padding: 16px 35px;
}

// 탭 패널 배경 제거 및 간격 제거
:deep(.q-tab-panels) {
  background: transparent;
}

:deep(.q-tab-panel) {
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
}

.solution-item {
  cursor: pointer;
  padding: 1rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: var(--nexa-surface-hover);
  }
}
</style>

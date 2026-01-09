<template>
  <q-page class="help-page">
    <div class="q-pa-lg">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary q-mb-sm">HELP</h1>
        <p class="text-body1 text-grey-7">사용 가이드 및 지원</p>
      </div>

      <q-tabs v-model="helpTab" class="q-mb-none">
        <q-tab name="guide" label="사용 가이드" icon="menu_book" />
        <q-tab name="tutorial" label="튜토리얼" icon="school" />
        <q-tab name="faq" label="FAQ" icon="help_outline" />
        <q-tab name="api" label="API 문서" icon="code" />
        <q-tab name="feedback" label="피드백/문의" icon="feedback" />
        <q-tab name="version" label="버전 정보" icon="info" />
      </q-tabs>

      <q-tab-panels v-model="helpTab" animated>
        <!-- 사용 가이드 -->
        <q-tab-panel name="guide" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="menu_book" size="24px" class="q-mr-sm" />
            사용 가이드
          </h3>
          <ul class="text-body2 text-grey-7">
            <li>시작하기</li>
            <li>NEXA BOARD 가이드</li>
            <li>자동화 가이드</li>
            <li>API 사용법</li>
          </ul>
        </q-tab-panel>

        <!-- 튜토리얼 -->
        <q-tab-panel name="tutorial" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="school" size="24px" class="q-mr-sm" />
            튜토리얼
          </h3>
          <ul class="text-body2 text-grey-7">
            <li>첫 보드 만들기</li>
            <li>패널 추가하기</li>
            <li>자동화 규칙 작성하기</li>
            <li>프로젝트 관리하기</li>
          </ul>
        </q-tab-panel>

        <!-- FAQ -->
        <q-tab-panel name="faq" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="help_outline" size="24px" class="q-mr-sm" />
            FAQ
          </h3>
          <p class="text-body2 text-grey-7">자주 묻는 질문과 답변을 확인하세요.</p>
        </q-tab-panel>

        <!-- API 문서 -->
        <q-tab-panel name="api" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="code" size="24px" class="q-mr-sm" />
            API 문서
          </h3>
          <p class="text-body2 text-grey-7">NEXA Platform API 사용법을 확인하세요.</p>
        </q-tab-panel>

        <!-- 피드백/문의 -->
        <q-tab-panel name="feedback" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="feedback" size="24px" class="q-mr-sm" />
            피드백/문의
          </h3>
          <p class="text-body2 text-grey-7">문제를 신고하거나 개선 사항을 제안하세요.</p>
        </q-tab-panel>

        <!-- 버전 정보 -->
        <q-tab-panel name="version" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="info" size="24px" class="q-mr-sm" />
            버전 정보
          </h3>
          <p class="text-body2 text-grey-7">현재 버전 및 업데이트 내역을 확인하세요.</p>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// HELP 페이지
// 사용 가이드 및 지원

const helpTab = ref('guide')
</script>

<style lang="scss" scoped>
.help-page {
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
</style>

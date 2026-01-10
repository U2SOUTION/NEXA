<!-- eslint-disable vue/multi-word-component-names -->
<!-- Spinner.vue
  Quasar 스피너 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 스피너, 로딩, 로딩 인디케이터
  @category: feedback
  @description: Quasar Spinner 컴포넌트 사용 예시
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">스피너 샘플</h3>
    <p class="sample-description">Quasar 스피너 컴포넌트를 사용한 로딩 인디케이터 예시</p>
  </div>
  <div class="sample-container">
    <!-- 버튼 내부 사용: 일반 button (실용적인 예제 - 최우선) -->
    <div class="spinner-section">
      <h4 class="section-title">버튼 내부 사용 (일반 button)</h4>
      <p class="section-note">간단하고 제어하기 쉬운 방식</p>
      <div class="spinner-examples">
        <button type="button" class="text-hover-btn" :class="{ 'is-loading': isLoading1 }" @click="handleLoading1">
          <q-spinner v-if="isLoading1" size="16px" color="primary" class="btn-icon" />
          <q-icon v-else name="refresh" class="btn-icon" />
          <span>캐시 정리</span>
        </button>
        <button type="button" class="text-hover-btn" :class="{ 'is-loading': isLoading2 }" @click="handleLoading2">
          <q-spinner v-if="isLoading2" size="16px" color="primary" class="btn-icon" />
          <q-icon v-else name="cleaning_services" class="btn-icon" />
          <span>캐시 초기화</span>
        </button>
      </div>
    </div>

    <!-- 기본 스피너 -->
    <div class="spinner-section">
      <h4 class="section-title">기본 스피너</h4>
      <div class="spinner-examples">
        <div class="example-item">
          <q-spinner />
          <span class="example-label">기본</span>
        </div>
        <div class="example-item">
          <q-spinner color="primary" />
          <span class="example-label">Primary 색상</span>
        </div>
        <div class="example-item">
          <q-spinner color="secondary" />
          <span class="example-label">Secondary 색상</span>
        </div>
      </div>
    </div>

    <!-- 다양한 크기 -->
    <div class="spinner-section">
      <h4 class="section-title">다양한 크기</h4>
      <div class="spinner-examples">
        <div class="example-item">
          <q-spinner size="16px" color="primary" />
          <span class="example-label">16px</span>
        </div>
        <div class="example-item">
          <q-spinner size="24px" color="primary" />
          <span class="example-label">24px</span>
        </div>
        <div class="example-item">
          <q-spinner size="32px" color="primary" />
          <span class="example-label">32px</span>
        </div>
        <div class="example-item">
          <q-spinner size="48px" color="primary" />
          <span class="example-label">48px</span>
        </div>
        <div class="example-item">
          <q-spinner size="3em" color="primary" />
          <span class="example-label">3em</span>
        </div>
      </div>
    </div>

    <!-- 다양한 색상 -->
    <div class="spinner-section">
      <h4 class="section-title">다양한 색상</h4>
      <div class="spinner-examples">
        <div class="example-item">
          <q-spinner size="24px" color="primary" />
          <span class="example-label">Primary</span>
        </div>
        <div class="example-item">
          <q-spinner size="24px" color="secondary" />
          <span class="example-label">Secondary</span>
        </div>
        <div class="example-item">
          <q-spinner size="24px" color="accent" />
          <span class="example-label">Accent</span>
        </div>
        <div class="example-item">
          <q-spinner size="24px" color="positive" />
          <span class="example-label">Positive</span>
        </div>
        <div class="example-item">
          <q-spinner size="24px" color="negative" />
          <span class="example-label">Negative</span>
        </div>
        <div class="example-item">
          <q-spinner size="24px" color="warning" />
          <span class="example-label">Warning</span>
        </div>
        <div class="example-item">
          <q-spinner size="24px" color="info" />
          <span class="example-label">Info</span>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 표시 -->
    <div class="spinner-section">
      <h4 class="section-title">로딩 상태 표시</h4>
      <div class="spinner-examples">
        <div class="loading-example">
          <q-spinner size="32px" color="primary" />
          <p class="loading-text">데이터를 불러오는 중...</p>
        </div>
      </div>
    </div>

    <!-- 버튼 내부 사용: Quasar 버튼 (비교용) -->
    <div class="spinner-section">
      <h4 class="section-title">비교: Quasar 버튼</h4>
      <p class="section-note">오버라이딩이 복잡하고 호버 배경 제거가 어려움</p>
      <div class="spinner-examples">
        <q-btn flat dense :loading="isLoading3" @click="handleLoading3" icon="refresh" label="캐시 정리" />
        <q-btn flat dense :loading="isLoading4" @click="handleLoading4" icon="cleaning_services" label="캐시 초기화" />
        <q-btn outlined dense :loading="isLoading5" @click="handleLoading5" icon="refresh" label="캐시 정리" />
        <q-btn outlined dense :loading="isLoading6" @click="handleLoading6" icon="cleaning_services" label="캐시 초기화" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 로딩 상태
const isLoading1 = ref(false)
const isLoading2 = ref(false)
const isLoading3 = ref(false)
const isLoading4 = ref(false)
const isLoading5 = ref(false)
const isLoading6 = ref(false)

// 로딩 시뮬레이션
function handleLoading1() {
  if (isLoading1.value) return
  isLoading1.value = true
  setTimeout(() => {
    isLoading1.value = false
  }, 2000)
}

function handleLoading2() {
  if (isLoading2.value) return
  isLoading2.value = true
  setTimeout(() => {
    isLoading2.value = false
  }, 2000)
}

function handleLoading3() {
  if (isLoading3.value) return
  isLoading3.value = true
  setTimeout(() => {
    isLoading3.value = false
  }, 2000)
}

function handleLoading4() {
  if (isLoading4.value) return
  isLoading4.value = true
  setTimeout(() => {
    isLoading4.value = false
  }, 2000)
}

function handleLoading5() {
  if (isLoading5.value) return
  isLoading5.value = true
  setTimeout(() => {
    isLoading5.value = false
  }, 2000)
}

function handleLoading6() {
  if (isLoading6.value) return
  isLoading6.value = true
  setTimeout(() => {
    isLoading6.value = false
  }, 2000)
}
</script>

<style lang="scss" scoped>
.sample-header {
  margin-bottom: 24px;
  text-align: center;

  .sample-title {
    color: var(--nexa-text-primary);
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .sample-description {
    color: var(--nexa-text-secondary);
    font-size: 0.875rem;
  }
}

.sample-container {
  .spinner-section {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      color: var(--nexa-text-primary);
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 6px;
      text-align: center;
    }

    .section-note {
      color: var(--nexa-text-secondary);
      font-size: 0.75rem;
      margin-bottom: 12px;
      font-style: italic;
      text-align: center;
    }

    .spinner-examples {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;

      .example-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .example-label {
          color: var(--nexa-text-secondary);
          font-size: 0.75rem;
        }
      }

      .loading-example {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background-color: var(--nexa-surface);
        border-radius: 8px;

        .loading-text {
          color: var(--nexa-text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }
      }

      /* 버튼 호버 스타일: 배경 없이 텍스트 색상만 변화 */
      .text-hover-btn {
        border: solid 1px var(--nexa-border-color);
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background-color: var(--nexa-surface);
        color: var(--nexa-text-primary);
        transition: color 0.2s ease;

        .btn-icon {
          font-size: 18px;
        }

        &.is-loading {
          opacity: 0.6;
        }
      }
    }
  }
}
</style>

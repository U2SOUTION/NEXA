<!-- GlobalSkeletonLoader.vue
  전역 스켈레톤 로더 컴포넌트
  화면 중앙에 오버레이로 표시되는 로딩 스켈레톤
-->
<template>
  <transition name="fade">
    <div v-if="isLoading" class="global-skeleton-loader">
      <!-- 배경 오버레이 -->
      <div class="skeleton-overlay" @click.self="handleOverlayClick"></div>

      <!-- 스켈레톤 컨텐츠 -->
      <div class="skeleton-content">
        <!-- 심플 라인 스켈레톤 (기본) -->
        <div
          v-if="skeletonConfig.type === 'simple' || skeletonConfig.type === 'default'"
          class="skeleton-simple"
        >
          <div v-if="skeletonConfig.message" class="skeleton-message q-mb-sm">
            <q-spinner color="primary" size="16px" class="q-mr-xs" />
            <span class="text-caption">{{ skeletonConfig.message }}</span>
          </div>
          <q-skeleton type="rect" width="100%" height="4px" class="skeleton-line" />
        </div>

        <!-- 테이블 스켈레톤 -->
        <div v-else-if="skeletonConfig.type === 'table'" class="skeleton-table">
          <div class="skeleton-table-header q-mb-md">
            <q-skeleton
              v-for="i in skeletonConfig.columns"
              :key="`header-${i}`"
              type="rect"
              :width="`${100 / skeletonConfig.columns}%`"
              height="40px"
              class="q-mr-xs"
            />
          </div>
          <div
            v-for="row in skeletonConfig.rows"
            :key="`row-${row}`"
            class="skeleton-table-row q-mb-sm"
          >
            <q-skeleton
              v-for="col in skeletonConfig.columns"
              :key="`cell-${row}-${col}`"
              type="rect"
              :width="`${100 / skeletonConfig.columns}%`"
              height="48px"
              class="q-mr-xs"
            />
          </div>
        </div>

        <!-- 카드 스켈레톤 -->
        <div v-else-if="skeletonConfig.type === 'card'" class="skeleton-cards">
          <div v-for="i in skeletonConfig.cards" :key="`card-${i}`" class="skeleton-card q-mb-md">
            <q-skeleton type="rect" width="100%" height="150px" class="q-mb-sm" />
            <q-skeleton type="text" width="80%" class="q-mb-xs" />
            <q-skeleton type="text" width="60%" />
          </div>
        </div>

        <!-- 리스트 스켈레톤 -->
        <div v-else-if="skeletonConfig.type === 'list'" class="skeleton-list">
          <div
            v-for="i in skeletonConfig.rows"
            :key="`list-item-${i}`"
            class="skeleton-list-item q-mb-md"
          >
            <q-skeleton type="circle" size="40px" class="q-mr-md" />
            <div class="col">
              <q-skeleton type="text" width="80%" class="q-mb-xs" />
              <q-skeleton type="text" width="60%" />
            </div>
          </div>
        </div>

        <!-- 커스텀 스켈레톤 -->
        <div v-else-if="skeletonConfig.type === 'custom' && skeletonConfig.customTemplate">
          <component :is="skeletonConfig.customTemplate" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useSkeletonLoader } from 'src/composables/useSkeletonLoader'

const { isLoading, skeletonConfig } = useSkeletonLoader()

// 오버레이 클릭 시 동작 (선택 사항)
const handleOverlayClick = () => {
  // 기본적으로는 아무 동작도 하지 않음
  // 필요시 설정으로 제어 가능
}
</script>

<style lang="scss" scoped>
.global-skeleton-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.skeleton-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
}

.skeleton-content {
  position: relative;
  z-index: 1;
  background-color: transparent;
  border-radius: 0;
  padding: 0;
  max-width: 400px;
  min-width: 200px;
  box-shadow: none;
}

.skeleton-simple {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.skeleton-message {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--nexa-text-primary);
  font-weight: 400;
  opacity: 0.7;
  margin-bottom: 8px;
}

.skeleton-line {
  border-radius: 2px;
  width: 100%;
}

.skeleton-default {
  width: 100%;
}

.skeleton-table {
  width: 100%;

  .skeleton-table-header {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }

  .skeleton-table-row {
    display: flex;
    gap: 6px;
    margin-bottom: 4px;
  }
}

.skeleton-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.skeleton-list {
  width: 100%;

  .skeleton-list-item {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 12px;
  }
}

// 페이드 트랜지션
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

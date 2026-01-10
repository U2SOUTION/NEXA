<!-- StandardLeftHeader.vue
  왼쪽 사이드바 도메인 표준 헤더 컴포넌트
  - 구성: 아이콘 + 제목(Title) + 서브제목(SubMenu) + 보조문구(Subtitle) + 액션 슬롯
-->
<template>
  <div class="standard-left-header" @mouseenter="$emit('header-hover', true)" @mouseleave="$emit('header-hover', false)">
    <div class="sidebar-header-container q-pa-md">
      <div class="header-main-row items-center no-wrap">
        <div class="title-section col">
          <div class="row items-center no-wrap q-gutter-x-xs">
            <!-- 메인 아이콘 -->
            <q-icon v-if="icon" :name="icon" size="24px" color="primary" class="q-mr-xs" />
            
            <!-- 메인 제목 -->
            <div 
              class="text-h4 text-primary text-bold title-text cursor-pointer" 
              @click="$emit('title-click')"
            >
              {{ title }}
            </div>

            <!-- 서브 제목 (옵션) -->
            <div 
              v-if="subMenuTitle" 
              class="text-subtitle1 sub-menu-title cursor-pointer q-ml-xs"
              @click="$emit('sub-menu-click')"
            >
              {{ subMenuTitle }}
            </div>
          </div>
          
          <!-- 보조 문구 -->
          <div v-if="subtitle" class="text-caption text-grey-7 q-mt-xs subtitle-text">{{ subtitle }}</div>
        </div>
        
        <!-- 액션 버튼 영역 -->
        <div class="action-section col-auto">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
    <q-separator class="header-separator" />
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: null
  },
  subMenuTitle: {
    type: String,
    default: null
  }
})

defineEmits(['header-hover', 'title-click', 'sub-menu-click'])
</script>

<style lang="scss" scoped>
.standard-left-header {
  .sidebar-header-container {
    background: var(--nexa-surface-header-bg, var(--nexa-background-darker));
    transition: background 0.2s ease;
  }

  .header-main-row {
    display: flex;
    min-height: 48px;
  }

  .title-text {
    line-height: 1;
    letter-spacing: 1px;
    white-space: nowrap;
    
    &:hover {
      opacity: 0.8;
      text-decoration: underline;
    }
  }

  .sub-menu-title {
    color: var(--nexa-text-primary);
    line-height: 1;
    white-space: nowrap;
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--nexa-surface);
      color: var(--nexa-primary);
    }
  }

  .subtitle-text {
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .header-separator {
    opacity: 0.6;
  }
}
</style>

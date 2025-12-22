<template>
  <div class="layout-settings">
    <div class="settings-section">
      <div class="text-h6 q-mb-md">헤더 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>헤더 높이</q-item-label>
            <q-item-label caption>상단 헤더의 높이를 설정합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="headerHeight" type="number" dense outlined class="input-field" suffix="px" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div class="settings-section">
      <div class="text-h6 q-mb-md">사이드바 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>사이드바 너비</q-item-label>
            <q-item-label caption>사이드바의 너비를 설정합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="sidebarWidth" type="number" dense outlined class="input-field" suffix="px" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
})

const headerHeight = ref(props.settings.header.height)
const sidebarWidth = ref(props.settings.sidebar.width)

watch([headerHeight, sidebarWidth], ([newHeight, newWidth]) => {
  // 레이아웃 설정 변경 처리
  document.documentElement.style.setProperty('--header-height', `${newHeight}px`)
  document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`)
})
</script>

<style lang="scss" scoped>
.layout-settings {
  .settings-section {
    margin-bottom: 2rem;

    &:last-child {
      margin-bottom: 0;
    }

    .text-h6 {
      color: var(--nexa-text-primary);
      font-weight: 600;
    }

    .q-item {
      .q-item__label {
        color: var(--nexa-text-primary);
      }

      .q-item__label--caption {
        color: var(--nexa-text-secondary);
      }
    }

    .q-item-label {
      color: var(--nexa-text-primary);
    }

    .q-item-label--caption {
      color: var(--nexa-text-secondary);
    }

    .input-field {
      width: 150px;

      // 입력 필드 텍스트 색상
      :deep(.q-field__native) {
        color: var(--nexa-text-hint);
      }

      // 셀렉트 선택된 값 색상
      :deep(.q-field__native) {
        color: var(--nexa-text-hint);
      }
    }
  }
}
</style>

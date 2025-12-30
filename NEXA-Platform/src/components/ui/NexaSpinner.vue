<!-- NexaSpinner.vue
  NEXA 커스텀 스피너 컴포넌트
  일관된 스타일의 로딩 인디케이터
-->
<template>
  <div :class="['nexa-spinner', `nexa-spinner--${size}`, { 'nexa-spinner--centered': centered, 'nexa-spinner--overlay': overlay }]">
    <div class="nexa-spinner-container">
      <div class="nexa-spinner-wrapper">
        <q-spinner :color="color" :size="spinnerSize" class="nexa-spinner-icon" />
        <span class="nexa-spinner-title">NEXA</span>
      </div>
      <div v-if="message" class="nexa-spinner-message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 스피너 크기: 'sm' | 'md' | 'lg' | 'xl'
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
  },
  // 색상 (Quasar 색상 또는 NEXA 테마 변수)
  color: {
    type: String,
    default: 'primary',
  },
  // 메시지 텍스트
  message: {
    type: String,
    default: '',
  },
  // 중앙 정렬 (부모 컨테이너 기준)
  centered: {
    type: Boolean,
    default: false,
  },
  // 오버레이 모드 (배경과 함께 표시)
  overlay: {
    type: Boolean,
    default: false,
  },
})

// Quasar 스피너 크기 계산
const spinnerSize = computed(() => {
  const sizeMap = {
    sm: '24px',
    md: '48px',
    lg: '64px',
    xl: '80px',
  }
  return sizeMap[props.size] || sizeMap.md
})
</script>

<style lang="scss" scoped>
.nexa-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &--centered {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
  }

  &--overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2px);
    z-index: 1000;
  }

  &--sm {
    .nexa-spinner-container {
      gap: 8px;
    }

    .nexa-spinner-message {
      font-size: 0.75rem;
    }
  }

  &--md {
    .nexa-spinner-container {
      gap: 16px;
    }

    .nexa-spinner-message {
      font-size: 0.875rem;
    }
  }

  &--lg {
    .nexa-spinner-container {
      gap: 20px;
    }

    .nexa-spinner-message {
      font-size: 1rem;
    }
  }

  &--xl {
    .nexa-spinner-container {
      gap: 24px;
    }

    .nexa-spinner-message {
      font-size: 1.125rem;
    }
  }
}

.nexa-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 40px;
  //background-color: var(--nexa-background);
  border: 2px solid var(--nexa-primary);
  border-radius: 8px;
  box-shadow:
    0 0 5px var(--nexa-primary),
    0 0 10px var(--nexa-primary),
    0 0 15px var(--nexa-primary),
    0 0 20px var(--nexa-primary),
    0 4px 12px rgba(0, 0, 0, 0.15);
  animation: borderNeonGlow 1.2s ease-in-out infinite alternate;
}

.nexa-spinner-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.nexa-spinner-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.nexa-spinner-title {
  font-size: 3rem;
  font-weight: 900;
  color: var(--nexa-text-primary);
  letter-spacing: 0.5em;
  text-transform: uppercase;
  line-height: 1;
  position: relative;
  z-index: 2;
  opacity: 0.9;
  text-align: center;
  display: inline-block;
  margin-left: 0.25em; /* letter-spacing으로 인한 시각적 중심 보정 */
  text-shadow:
    0 0 10px var(--nexa-text-primary),
    0 0 20px var(--nexa-text-primary),
    0 0 30px var(--nexa-text-primary),
    0 0 40px var(--nexa-primary),
    0 0 70px var(--nexa-primary),
    0 0 100px var(--nexa-primary);
  animation: neonGlow 0.8s ease-in-out infinite alternate;
}

@keyframes neonGlow {
  from {
    text-shadow:
      0 0 10px var(--nexa-text-primary),
      0 0 20px var(--nexa-text-primary),
      0 0 30px var(--nexa-text-primary),
      0 0 40px var(--nexa-primary),
      0 0 70px var(--nexa-primary),
      0 0 100px var(--nexa-primary);
    opacity: 0.5;
  }
  to {
    text-shadow:
      0 0 5px var(--nexa-text-primary),
      0 0 10px var(--nexa-text-primary),
      0 0 15px var(--nexa-text-primary),
      0 0 20px var(--nexa-primary),
      0 0 35px var(--nexa-primary),
      0 0 50px var(--nexa-primary);
    opacity: 1;
  }
}

@keyframes borderNeonGlow {
  from {
    border-color: var(--nexa-primary);
    box-shadow:
      0 0 5px var(--nexa-primary),
      0 0 10px var(--nexa-primary),
      0 0 15px var(--nexa-primary),
      0 0 20px var(--nexa-primary),
      0 4px 12px var(--nexa-primary);
    opacity: 0.6;
  }
  to {
    border-color: var(--nexa-text-primary);
    box-shadow:
      0 0 10px var(--nexa-primary),
      0 0 20px var(--nexa-primary),
      0 0 30px var(--nexa-primary),
      0 0 40px var(--nexa-primary),
      0 4px 12px var(--nexa-primary);
    opacity: 1;
  }
}

.nexa-spinner-message {
  color: var(--nexa-text-primary);
  font-weight: 500;
  text-align: center;
}
</style>

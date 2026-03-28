<template>
  <div class="nxf-color-swatch">
    <q-btn
      round
      flat
      dense
      padding="2px"
      class="nxf-color-swatch__btn"
      :aria-label="ariaLabel"
    >
      <div class="nxf-color-swatch__fill" :class="{ 'nxf-color-swatch__fill--empty': isEmpty }" :style="fillStyle" />
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-color
          :model-value="effectiveModel"
          default-view="palette"
          @update:model-value="onColorPick"
        />
      </q-popup-proxy>
    </q-btn>
    <q-btn
      v-if="clearable && !isEmpty"
      flat
      dense
      round
      size="sm"
      icon="close"
      class="nxf-color-swatch__clear"
      aria-label="색 지우기"
      @click.stop="$emit('update:modelValue', '')"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  /** 비었을 때 팔레트 기본값(미선택 시 회색) */
  fallbackForPicker: {
    type: String,
    default: '#1976d2',
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: '색 선택',
  },
})

const emit = defineEmits(['update:modelValue'])

const isEmpty = computed(() => !props.modelValue?.trim())

const effectiveModel = computed(() =>
  isEmpty.value ? props.fallbackForPicker : props.modelValue.trim(),
)

const fillStyle = computed(() => {
  if (isEmpty.value) return {}
  const c = props.modelValue.trim()
  return { backgroundColor: c }
})

function onColorPick(v) {
  emit('update:modelValue', v ?? '')
}
</script>

<style lang="scss" scoped>
.nxf-color-swatch {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 2px;
}

.nxf-color-swatch__btn {
  min-width: 28px;
  min-height: 28px;
  width: 28px;
  height: 28px;
}

.nxf-color-swatch__fill {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.22));
  box-sizing: border-box;
}

.nxf-color-swatch__fill--empty {
  background: repeating-conic-gradient(#bdbdbd 0% 25%, #e0e0e0 0% 50%) 50% / 8px 8px;
}

.body--dark .nxf-color-swatch__fill--empty {
  background: repeating-conic-gradient(#5a5a5a 0% 25%, #424242 0% 50%) 50% / 8px 8px;
}

.nxf-color-swatch__clear {
  min-width: 22px;
  min-height: 22px;
}
</style>

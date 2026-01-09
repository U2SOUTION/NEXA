<template>
  <component :is="blockComponent" v-bind="blockProps" v-if="blockComponent" />
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => {
      return ['time', 'weather', 'chart', 'board', 'device'].includes(value)
    },
  },
  // 블록별 공통 props
  variant: {
    type: String,
    default: 'default',
    validator: (value) => {
      return ['default', 'main', 'sidebar', 'compact'].includes(value)
    },
  },
})

const emit = defineEmits(['update', 'error', 'click'])

// 동적 컴포넌트 로딩
const blockComponent = computed(() => {
  const blockMap = {
    time: defineAsyncComponent(() => import('./time/TimeBlock.vue')),
    weather: defineAsyncComponent(() => import('./weather/WeatherBlock.vue')),
    chart: defineAsyncComponent(() => import('./chart/ChartBlock.vue')),
    board: defineAsyncComponent(() => import('./board/BoardBlock.vue')),
    device: defineAsyncComponent(() => import('./device/DeviceBlock.vue')),
  }

  const component = blockMap[props.type]
  if (!component) {
    console.warn(`Unknown block type: ${props.type}`)
    return null
  }

  return component
})

// 블록별 props 전달 (type 제외)
const blockProps = computed(() => {
  // eslint-disable-next-line no-unused-vars
  const { type, ...rest } = props
  return {
    ...rest,
    variant: props.variant,
    onUpdate: (data) => emit('update', data),
    onError: (error) => emit('error', error),
    onClick: (event) => emit('click', event),
  }
})
</script>

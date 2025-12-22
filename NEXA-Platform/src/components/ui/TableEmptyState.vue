<template>
  <div v-if="visible" class="table-empty-state text-center q-pa-xl">
    <q-icon :name="icon" :size="iconSize" :color="iconColor" class="q-mb-md" />
    <div class="text-h6 text-grey-6 q-mb-sm">{{ title }}</div>
    <div v-if="message" class="text-caption text-grey-6 q-mb-md">{{ message }}</div>
    <div v-if="$slots.actions" class="q-mt-md">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: 'inbox',
  },
  iconSize: {
    type: String,
    default: '64px',
  },
  iconColor: {
    type: String,
    default: 'grey-5',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped>
@import './TableEmptyState.scss';
</style>


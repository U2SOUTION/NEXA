<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center">
        <div class="text-h6">넥사패널 추가</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">패널 유형 선택</div>
        <q-list>
          <q-item
            v-for="panel in panelTypes"
            :key="panel.id"
            clickable
            v-close-popup
            @click="onSelectPanel(panel)"
          >
            <q-item-section avatar>
              <q-icon :name="panel.icon" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ panel.name }}</q-item-label>
              <q-item-label caption>{{ panel.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { panelTypes } from '@domains/panel/components/config/panelTypes'
import { computed } from 'vue'

export default {
  name: 'AddNexaPanelDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:modelValue', 'addNexaPanel'],
  setup(props, { emit }) {
    const dialogModel = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    function onSelectPanel(panel) {
      emit('addNexaPanel', {
        ...panel,
        i: Date.now().toString(),
        x: 0,
        y: 0,
        w: 6,  // 너비 6칸 (전체 12칸 중 절반)
        h: 5,  // 높이 5칸 (row-height 30px 기준 150px)
      })
      emit('update:modelValue', false)
    }

    return {
      panelTypes,
      onSelectPanel,
      dialogModel,
    }
  },
}
</script>

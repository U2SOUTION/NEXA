<template>
  <div class="device-tree q-pa-sm">
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-subtitle2 text-bold">장치 트리</div>
      <q-btn flat dense icon="refresh" size="sm" @click="refreshTree">
        <q-tooltip>새로고침</q-tooltip>
      </q-btn>
    </div>

    <q-input v-model="filterText" dense outlined placeholder="장치 검색..." class="q-mb-md">
      <template v-slot:append>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-tree
      :nodes="treeNodes"
      node-key="id"
      label-key="label"
      v-model:selected="selectedId"
      :filter="filterText"
      default-expand-all
      class="text-body2"
    >
      <template v-slot:default-header="prop">
        <div class="row items-center">
          <q-icon :name="prop.node.icon || 'devices'" :color="prop.node.color || 'primary'" size="xs" class="q-mr-sm" />
          <div :class="{ 'text-bold': prop.node.id === selectedId }">{{ prop.node.label }}</div>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const filterText = ref('')
const selectedId = ref(null)

const treeNodes = ref([
  {
    id: 'root',
    label: '전체 인프라',
    icon: 'hub',
    children: [
      {
        id: 'gw-01',
        label: 'Gateway 01',
        icon: 'router',
        color: 'positive',
        children: [
          { id: 'sn-01', label: '온도 센서 01', icon: 'thermostat', color: 'orange' },
          { id: 'sn-02', label: '습도 센서 01', icon: 'water_drop', color: 'info' }
        ]
      },
      {
        id: 'gw-02',
        label: 'Gateway 02',
        icon: 'router',
        color: 'grey-7',
        children: [
          { id: 'ac-01', label: '밸브 컨트롤러 01', icon: 'settings_input_component', color: 'negative' }
        ]
      }
    ]
  }
])

function refreshTree() {
  console.log('Refreshing device tree...')
}

watch(selectedId, (newId) => {
  if (newId) {
    console.log('Selected device:', newId)
    // TODO: 전역 상태 또는 이벤트를 통해 상세 정보 및 리스트 업데이트
  }
})
</script>

<style lang="scss" scoped>
.device-tree {
  height: 100%;
}
</style>

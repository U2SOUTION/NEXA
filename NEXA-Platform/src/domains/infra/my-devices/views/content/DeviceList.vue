<template>
  <div class="device-list q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-bold">장치 목록</div>
      <div class="q-gutter-sm">
        <q-btn color="primary" icon="add" label="장치 추가" @click="addDevice" />
        <q-btn outline icon="download" label="내보내기" />
      </div>
    </div>

    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      class="nexa-table"
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.value)" :label="props.value" />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn flat dense round icon="edit" size="sm" @click="editDevice(props.row)" />
          <q-btn flat dense round icon="delete" size="sm" color="negative" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const columns = [
  { name: 'name', align: 'left', label: '장치 이름', field: 'name', sortable: true },
  { name: 'category', align: 'left', label: '카테고리', field: 'category', sortable: true },
  { name: 'address', align: 'left', label: '주소/IP', field: 'address' },
  { name: 'status', align: 'center', label: '상태', field: 'status', sortable: true },
  { name: 'lastSeen', align: 'left', label: '최근 수신', field: 'lastSeen', sortable: true },
  { name: 'actions', align: 'right', label: '작업', field: 'actions' }
]

const rows = ref([
  { id: 'gw-01', name: 'Gateway 01', category: 'GATEWAY', address: '192.168.1.100', status: 'ONLINE', lastSeen: '2024-01-10 14:30:22' },
  { id: 'gw-02', name: 'Gateway 02', category: 'GATEWAY', address: '192.168.1.101', status: 'OFFLINE', lastSeen: '2024-01-09 23:15:00' },
  { id: 'sn-01', name: '온도 센서 01', category: 'SENSOR', address: 'MQTT: temp/01', status: 'ONLINE', lastSeen: '2024-01-10 14:31:05' },
  { id: 'sn-02', name: '습도 센서 01', category: 'SENSOR', address: 'MQTT: humi/01', status: 'ONLINE', lastSeen: '2024-01-10 14:31:08' },
  { id: 'ac-01', name: '밸브 컨트롤러 01', category: 'ACTUATOR', address: 'MQTT: valve/01', status: 'ERROR', lastSeen: '2024-01-10 12:00:10' }
])

const pagination = { rowsPerPage: 10 }

function getStatusColor(status) {
  switch (status) {
    case 'ONLINE': return 'positive'
    case 'OFFLINE': return 'grey-7'
    case 'ERROR': return 'negative'
    default: return 'warning'
  }
}

function addDevice() { console.log('Add Device Clicked') }
function editDevice(row) { console.log('Edit Device:', row) }
function confirmDelete(row) { console.log('Delete Device:', row) }
</script>

<style lang="scss" scoped>
.nexa-table {
  background: var(--nexa-surface);
}
</style>

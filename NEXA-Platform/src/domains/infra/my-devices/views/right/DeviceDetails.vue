<template>
  <div class="device-details q-pa-md">
    <div class="text-subtitle1 text-bold q-mb-md">장치 상세 정보</div>
    
    <div v-if="!selectedDevice" class="empty-state text-center q-pa-xl text-grey-7">
      <q-icon name="info" size="48px" class="q-mb-md" />
      <div>목록에서 장치를 선택하면<br>상세 정보가 표시됩니다.</div>
    </div>

    <div v-else class="details-content">
      <!-- 기본 정보 섹션 -->
      <section class="q-mb-lg">
        <div class="section-title text-primary text-bold q-mb-sm">기본 정보</div>
        <div class="row q-col-gutter-xs">
          <div class="col-4 text-grey-7 text-caption">장치명</div>
          <div class="col-8 text-body2">{{ selectedDevice.name }}</div>
          
          <div class="col-4 text-grey-7 text-caption">모델명</div>
          <div class="col-8 text-body2">{{ selectedDevice.model || 'N/A' }}</div>
          
          <div class="col-4 text-grey-7 text-caption">카테고리</div>
          <div class="col-8 text-body2">
            <q-badge outline color="primary" :label="selectedDevice.category" />
          </div>
        </div>
      </section>

      <!-- 통신 정보 섹션 -->
      <section class="q-mb-lg">
        <div class="section-title text-primary text-bold q-mb-sm">통신 상태</div>
        <div class="row q-col-gutter-xs">
          <div class="col-4 text-grey-7 text-caption">연결 방식</div>
          <div class="col-8 text-body2">{{ selectedDevice.connectionType || 'MQTT' }}</div>
          
          <div class="col-4 text-grey-7 text-caption">IP/주소</div>
          <div class="col-8 text-body2">{{ selectedDevice.address }}</div>
          
          <div class="col-4 text-grey-7 text-caption">상태</div>
          <div class="col-8">
            <q-badge :color="statusColor" :label="selectedDevice.status" />
          </div>
        </div>
      </section>

      <!-- 리소스 상태 (실시간 가상 데이터) -->
      <section class="q-mb-lg">
        <div class="section-title text-primary text-bold q-mb-sm">시스템 리소스</div>
        <div class="resource-item q-mb-sm">
          <div class="row justify-between text-caption q-mb-xs">
            <span>CPU 사용률</span>
            <span>45%</span>
          </div>
          <q-linear-progress :value="0.45" color="primary" rounded />
        </div>
        <div class="resource-item">
          <div class="row justify-between text-caption q-mb-xs">
            <span>메모리 사용률</span>
            <span>62%</span>
          </div>
          <q-linear-progress :value="0.62" color="accent" rounded />
        </div>
      </section>

      <!-- 액션 버튼 -->
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-btn outline color="primary" label="원격 재부팅" class="full-width" size="sm" icon="restart_alt" />
        </div>
        <div class="col-6">
          <q-btn outline color="warning" label="로그 보기" class="full-width" size="sm" icon="description" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// TODO: 실제 데이터는 store에서 가져와야 함
const selectedDevice = ref({
  id: 'gw-01',
  name: 'Gateway 01',
  model: 'NEXA-GW-v1',
  category: 'GATEWAY',
  connectionType: 'MQTT',
  address: '192.168.1.100',
  status: 'ONLINE'
})

const statusColor = computed(() => {
  if (!selectedDevice.value) return 'grey'
  switch (selectedDevice.value.status) {
    case 'ONLINE': return 'positive'
    case 'OFFLINE': return 'grey-7'
    case 'ERROR': return 'negative'
    default: return 'warning'
  }
})
</script>

<style lang="scss" scoped>
.device-details {
  height: 100%;
  
  .section-title {
    font-size: 0.8rem;
    border-bottom: 1px solid var(--nexa-border-color);
    padding-bottom: 2px;
  }
}
</style>

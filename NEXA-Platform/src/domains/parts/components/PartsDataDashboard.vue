<!-- PartsDataDashboard.vue
  부품 데이터 메인 대시보드
-->
<template>
  <div class="parts-data-dashboard">
    <div class="q-pa-lg">
      <div class="row items-center justify-between q-mb-lg">
        <div class="text-h4 text-primary text-bold">부품 데이터 관리</div>
      </div>

      <!-- 통계 카드 -->
      <div class="row q-gutter-md q-mb-lg">
        <q-card class="stat-card col-12 col-md-4" @click="goToPartClasses" style="cursor: pointer">
          <q-card-section>
            <div class="row items-center">
              <q-icon name="category" size="48px" color="primary" class="q-mr-md" />
              <div>
                <div class="text-h6 text-grey-7 q-mb-xs">부품 분류</div>
                <div class="text-h3 text-primary">{{ stats.totalClasses }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card col-12 col-md-4" @click="goToPartTypes" style="cursor: pointer">
          <q-card-section>
            <div class="row items-center">
              <q-icon name="inventory" size="48px" color="primary" class="q-mr-md" />
              <div>
                <div class="text-h6 text-grey-7 q-mb-xs">부품 유형</div>
                <div class="text-h3 text-primary">{{ stats.totalTypes }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card col-12 col-md-4" @click="goToPartSpecs" style="cursor: pointer">
          <q-card-section>
            <div class="row items-center">
              <q-icon name="description" size="48px" color="primary" class="q-mr-md" />
              <div>
                <div class="text-h6 text-grey-7 q-mb-xs">개별 부품</div>
                <div class="text-h3 text-primary">{{ stats.totalParts }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 빠른 접근 버튼 -->
      <div class="row q-gutter-md">
        <q-card class="quick-access-card col-12">
          <q-card-section>
            <div class="text-h6 q-mb-md">빠른 접근</div>
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                icon="category"
                label="부품 분류 관리"
                @click="goToPartClasses"
                class="col-12 col-md-4"
              />
              <q-btn
                color="primary"
                icon="inventory"
                label="부품 유형 관리"
                @click="goToPartTypes"
                class="col-12 col-md-4"
              />
              <q-btn
                color="primary"
                icon="description"
                label="개별 부품 관리"
                @click="goToPartSpecs"
                class="col-12 col-md-4"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePartsManagementStore } from '@system/store/partsManagementStore.js'
import { usePartsDataStore } from '@system/store/partsDataStore.js'

const partsManagementStore = usePartsManagementStore()
const partsDataStore = usePartsDataStore()

// 통계 데이터
const stats = ref({
  totalClasses: 0,
  totalTypes: 0,
  totalParts: 0,
})

// 통계 데이터 로드
async function loadStats() {
  try {
    await Promise.all([
      partsDataStore.fetchPartClasses(),
      partsDataStore.fetchPartModels(),
      partsDataStore.fetchPartSpecs(),
    ])

    stats.value = {
      totalClasses: partsDataStore.partClasses.length,
      totalTypes: partsDataStore.partModels.length,
      totalParts: partsDataStore.partSpecs.length,
    }
  } catch (error) {
    console.error('통계 데이터 로드 실패:', error)
  }
}

// 네비게이션 함수들
function goToPartClasses() {
  partsManagementStore.setSelectedPartsDataView('part-classes')
}

function goToPartTypes() {
  partsManagementStore.setSelectedPartsDataView('part-models')
}

function goToPartSpecs() {
  partsManagementStore.setSelectedPartsDataView('part-specs')
}

onMounted(() => {
  loadStats()
})
</script>

<style lang="scss" scoped>
.parts-data-dashboard {
  height: 100%;
  overflow-y: auto;
}

.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.quick-access-card {
  min-height: 150px;
}
</style>


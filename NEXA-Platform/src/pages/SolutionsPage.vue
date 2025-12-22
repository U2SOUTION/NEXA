<template>
  <q-page class="solutions-page">
    <div class="q-pa-lg">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary q-mb-sm">SOLUTIONS</h1>
        <p class="text-body1 text-grey-7">NEXA Platform 기반 확장 솔루션</p>
      </div>

      <q-tabs v-model="activeTab" class="q-mb-none">
        <q-tab name="industrial" label="Industrial Systems" />
        <q-tab name="living" label="Living Solutions" />
        <q-tab name="media" label="Media & Interaction" />
        <q-tab name="art" label="Media Art" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <!-- Industrial Systems -->
        <q-tab-panel name="industrial" class="network-tab-panel">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6 col-lg-4 solution-item">
              <div class="text-h6 q-mb-sm">Precision Control (정밀제어)</div>
              <ul class="text-body2 text-grey-7">
                <li>Nexa Tensor (와이어 제어)</li>
                <li>Nexa Lift (기중 시스템)</li>
                <li>Nexa Trek (트랙 시스템)</li>
              </ul>
            </div>

            <div class="col-12 col-md-6 col-lg-4 solution-item">
              <div class="text-h6 q-mb-sm">Energy Management (에너지 관리)</div>
              <ul class="text-body2 text-grey-7">
                <li>Nexa Solar (태양광)</li>
                <li>Nexa Energy (에너지 최적화)</li>
              </ul>
            </div>

            <div class="col-12 col-md-6 col-lg-4 solution-item">
              <div class="text-h6 q-mb-sm">Logistics (물류)</div>
              <ul class="text-body2 text-grey-7">
                <li>Nexa Stock (재고 관리)</li>
                <li>Nexa Transport (운송 시스템)</li>
              </ul>
            </div>
          </div>
        </q-tab-panel>

        <!-- Living Solutions -->
        <q-tab-panel name="living" class="network-tab-panel">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6 col-lg-4 solution-item">
              <div class="text-h6 q-mb-sm">Residential (주거지)</div>
              <ul class="text-body2 text-grey-7">
                <li>Nexa Home (홈 오토메이션)</li>
                <li>Nexa Camper (모바일 홈)</li>
              </ul>
            </div>

            <div class="col-12 col-md-6 col-lg-4 solution-item">
              <div class="text-h6 q-mb-sm">Productivity (생산성)</div>
              <ul class="text-body2 text-grey-7">
                <li>Nexa Break (작업 효율화)</li>
              </ul>
            </div>

            <div class="col-12 col-md-6 col-lg-4 solution-item">
              <div class="text-h6 q-mb-sm">Agriculture (농업)</div>
              <ul class="text-body2 text-grey-7">
                <li>Nexa Farm (스마트팜)</li>
                <li>Nexa Hive (양봉 관리)</li>
              </ul>
            </div>
          </div>
        </q-tab-panel>

        <!-- Media & Interaction -->
        <q-tab-panel name="media" class="network-tab-panel">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6 solution-item">
              <div class="text-h6 q-mb-sm">Audio Systems (오디오 시스템)</div>
              <ul class="text-body2 text-grey-7">
                <li>Nexa Audio (음향 시스템)</li>
                <li>Nexa Voice (보이스컨트롤, 피드백)</li>
              </ul>
            </div>

            <div class="col-12 col-md-6 solution-item">
              <div class="text-h6 q-mb-sm">Visual Systems (비주얼 시스템)</div>
              <ul class="text-body2 text-grey-7">
                <li>Nexa Visual (데이터 시각화, 환경상태)</li>
                <li>Nexa Lighting (조명)</li>
                <li>Nexa Facade (파사드)</li>
              </ul>
            </div>
          </div>
        </q-tab-panel>

        <!-- Media Art -->
        <q-tab-panel name="art" class="network-tab-panel">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-4 solution-item">
              <div class="text-h6 q-mb-sm">Nexa Nature Art</div>
              <p class="text-body2 text-grey-7">환경 미술</p>
            </div>

            <div class="col-12 col-md-4 solution-item">
              <div class="text-h6 q-mb-sm">Nexa Urban Art</div>
              <p class="text-body2 text-grey-7">공공미술</p>
            </div>

            <div class="col-12 col-md-4 solution-item">
              <div class="text-h6 q-mb-sm">Nexa Flow Art</div>
              <p class="text-body2 text-grey-7">상호작용</p>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('industrial')
</script>

<style lang="scss" scoped>
.solutions-page {
  background: var(--nexa-background);
  min-height: 100vh;
}

.network-tab-panel {
  counter-reset: section-counter;
  border-radius: 4px;
  padding: 16px 35px;
}

// 탭 패널 배경 제거 및 간격 제거
:deep(.q-tab-panels) {
  background: transparent;
}

:deep(.q-tab-panel) {
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
}

.solution-item {
  cursor: pointer;
  padding: 1rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: var(--nexa-surface-hover);
  }
}
</style>

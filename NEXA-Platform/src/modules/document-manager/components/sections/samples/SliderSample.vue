<!-- SliderSample.vue
  슬라이더 샘플 (q-slider, q-range)
  아코디언 화살표 가려짐 테스트용
-->
<template>
  <div>
    <form @submit.prevent>
      <!-- 슬라이더 (q-slider) -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">슬라이더 (q-slider)</div>

        <div class="row q-col-gutter-sm">
          <!-- 기본 슬라이더 -->
          <div class="col-12 col-sm-6">
            <div class="text-caption q-mb-xs">기본 슬라이더</div>
            <q-slider v-model="formData.sliderBasic" :min="0" :max="100" />
          </div>

          <!-- 라벨 표시 -->
          <div class="col-12 col-sm-6">
            <div class="text-caption q-mb-xs">라벨 표시</div>
            <q-slider v-model="formData.sliderLabel" :min="0" :max="100" label label-always />
          </div>
        </div>
      </div>

      <!-- 슬라이더 (q-slider, q-range) -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">슬라이더 (q-slider, q-range)</div>

        <div class="row q-col-gutter-sm">
          <!-- 기본 슬라이더 -->
          <div class="col-12">
            <div class="text-caption q-mb-xs">기본 슬라이더</div>
            <q-slider v-model="formData.sliderSingle" :min="0" :max="100" label />
          </div>

          <!-- 범위 슬라이더 (q-range) -->
          <div class="col-12">
            <div class="text-caption q-mb-xs">범위 슬라이더 (q-range)</div>
            <q-range v-model="formData.range" :min="0" :max="100" label />
          </div>

          <!-- 라벨과 슬라이더 한 줄 배치 -->
          <div class="col-12">
            <div class="text-caption q-mb-xs">라벨과 슬라이더 한 줄 배치</div>
            <div class="row items-center q-gutter-sm">
              <div class="text-caption slider-label">슬라이더 값 (0 - 100)</div>
              <q-slider v-model="formData.sliderInline" :min="0" :max="100" class="col" />
              <div class="text-caption text-weight-medium slider-value">{{ formData.sliderInline }}</div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  sliderBasic: 50,
  sliderLabel: 50,
  sliderSingle: 50,
  sliderInline: 50,
  range: {
    min: 20,
    max: 80,
  },
})
</script>

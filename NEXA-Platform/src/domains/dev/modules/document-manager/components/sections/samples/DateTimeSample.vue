<!-- DateTimeSample.vue
  날짜/시간 선택 샘플 (q-date, q-time)
  아코디언 화살표 가려짐 테스트용
-->
<template>
  <div class="datetime-sample">
    <form @submit.prevent>
      <div class="form-group">
        <div class="text-subtitle2 q-mb-sm">날짜/시간 선택 (q-date, q-time)</div>

        <!-- 기본 날짜 선택 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">기본 날짜 선택</div>
          <q-input v-model="formData.date" label="날짜 선택" outlined dense readonly>
            <template v-slot:append>
              <q-icon name="calendar_today" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="formData.date" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="닫기" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- 날짜 범위 선택 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">날짜 범위 선택</div>
          <q-input :model-value="dateRangeDisplay" label="날짜 범위 선택" outlined dense readonly>
            <template v-slot:append>
              <q-icon name="calendar_today" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="formData.dateRange" range mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="닫기" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- 최소/최대 날짜 제한 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">최소/최대 날짜 제한</div>
          <q-input v-model="formData.dateLimited" label="날짜 선택 (제한)" outlined dense readonly>
            <template v-slot:append>
              <q-icon name="calendar_today" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="formData.dateLimited" :min="minDate" :max="maxDate" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="닫기" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- 기본 시간 선택 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">기본 시간 선택</div>
          <q-input v-model="formData.time" label="시간 선택" outlined dense readonly>
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="formData.time" mask="HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="닫기" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- 시간 포맷 설정 (12시간 형식) -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">시간 포맷 설정 (12시간 형식)</div>
          <q-input v-model="formData.time12" label="시간 선택 (12시간 형식)" outlined dense readonly>
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="formData.time12" format24h mask="hh:mm A">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="닫기" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- 긴 라벨 날짜 선택 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">매우 긴 라벨 텍스트: 이 라벨은 가로로 매우 길게 확장될 수 있어서 아코디언 화살표를 가릴 수 있습니다</div>
          <q-input v-model="formData.dateLongLabel" label="매우 긴 라벨 텍스트: 이 라벨은 가로로 매우 길게 확장될 수 있어서 아코디언 화살표를 가릴 수 있습니다" outlined dense readonly>
            <template v-slot:append>
              <q-icon name="calendar_today" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="formData.dateLongLabel" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="닫기" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const formData = ref({
  date: '',
  dateRange: {
    from: '',
    to: '',
  },
  dateLimited: '',
  time: '',
  time12: '',
  dateLongLabel: '',
})

// 날짜 범위를 문자열로 변환하여 표시
const dateRangeDisplay = computed(() => {
  if (!formData.value.dateRange.from && !formData.value.dateRange.to) {
    return ''
  }
  if (formData.value.dateRange.from && formData.value.dateRange.to) {
    return `${formData.value.dateRange.from} ~ ${formData.value.dateRange.to}`
  }
  if (formData.value.dateRange.from) {
    return `${formData.value.dateRange.from} ~`
  }
  if (formData.value.dateRange.to) {
    return `~ ${formData.value.dateRange.to}`
  }
  return ''
})

// 날짜 제한 설정 (오늘부터 1년 후까지)
const today = new Date()
const minDate = today.toISOString().split('T')[0]
const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().split('T')[0]
</script>

<style lang="scss" scoped>
.datetime-sample {
  width: 100%;
  overflow: hidden;
  min-width: 0;

  .form-group {
    width: 100%;
    overflow: hidden;
    min-width: 0;
  }
}
</style>


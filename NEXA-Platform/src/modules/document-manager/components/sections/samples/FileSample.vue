<!-- FileSample.vue
  파일 선택 샘플 (q-file, q-uploader)
  아코디언 화살표 가려짐 테스트용
-->
<template>
  <div class="file-sample">
    <form @submit.prevent>
      <div class="form-group">
        <div class="text-subtitle2 q-mb-sm">파일 선택 (q-file, q-uploader)</div>

        <!-- 단일 파일 선택 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">단일 파일 선택</div>
          <q-file v-model="formData.fileSingle" label="파일 선택" outlined dense class="q-mb-sm" />
        </div>

        <!-- 다중 파일 선택 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">다중 파일 선택</div>
          <q-file v-model="formData.fileMultiple" label="파일 선택 (다중)" multiple outlined dense class="q-mb-sm" />
        </div>

        <!-- 파일 타입 제한 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">파일 타입 제한 (이미지만)</div>
          <q-file v-model="formData.fileImageOnly" label="이미지 파일 선택" accept="image/*" outlined dense class="q-mb-sm" />
        </div>

        <!-- 최대 파일 크기 제한 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">최대 파일 크기 제한 (5MB)</div>
          <q-file v-model="formData.fileSizeLimit" label="파일 선택 (최대 5MB)" outlined dense max-file-size="5242880" class="q-mb-sm" />
        </div>

        <!-- q-uploader 기본 사용 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">q-uploader 기본 사용</div>
          <q-uploader v-model="formData.uploader" label="파일 업로드" outlined dense class="q-mb-sm uploader-no-progress" />
        </div>

        <!-- 자동 업로드 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">자동 업로드 (URL 설정 필요)</div>
          <q-uploader v-model="formData.uploaderAuto" label="자동 업로드" auto-upload outlined dense class="q-mb-sm" />
        </div>

        <!-- 진행률 표시 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">진행률 표시</div>
          <q-uploader v-model="formData.uploaderProgress" label="진행률 표시 업로드" show-upload-progress outlined dense class="q-mb-sm" />
        </div>

        <!-- 긴 라벨 파일 선택 -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">매우 긴 라벨 텍스트: 이 라벨은 가로로 매우 길게 확장될 수 있어서 아코디언 화살표를 가릴 수 있습니다</div>
          <q-file v-model="formData.fileLongLabel" label="매우 긴 라벨 텍스트: 이 라벨은 가로로 매우 길게 확장될 수 있어서 아코디언 화살표를 가릴 수 있습니다" outlined dense class="q-mb-sm" />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  fileSingle: null,
  fileMultiple: null,
  fileImageOnly: null,
  fileSizeLimit: null,
  uploader: null,
  uploaderAuto: null,
  uploaderProgress: null,
  fileLongLabel: null,
})
</script>

<style lang="scss" scoped>
// 첫 번째 q-uploader의 진행률 강제 제거
.uploader-no-progress {
  // 헤더 내부 두 번째 div 숨김 (진행률 요소)
  :deep(.q-uploader__header div:nth-of-type(2)),
  :deep(.q-uploader__header div:nth-child(2)) {
    display: none !important;
  }
}
</style>

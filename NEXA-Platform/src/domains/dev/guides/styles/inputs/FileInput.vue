<!-- FileInput.vue
  파일 입력 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 입력, 파일 입력
  @category: inputs
  @description: File Input 샘플 컴포넌트
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">파일 입력 샘플</h3>
    <p class="sample-description">파일 업로드 입력 필드 예시</p>
  </div>
  <div class="sample-container">
    <div class="input-examples">
      <q-file v-model="file" label="기본 파일 선택" outlined />
      <q-file v-model="files" label="다중 파일 선택" multiple outlined />
      <q-file v-model="imageFile" label="이미지 파일만" accept="image/*" outlined>
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>
      <q-uploader :url="`${apiBaseOrigin}/upload`" label="드래그 앤 드롭 업로드" style="max-width: 300px" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl'

const file = ref(null)
const files = ref(null)
const imageFile = ref(null)
const apiBaseOrigin = getApiBaseUrl().replace(/\/api\/?$/, '')
</script>

<style lang="scss" scoped>
.sample-header {
  margin-bottom: 16px;

  .sample-title {
    color: var(--nexa-text-primary);
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .sample-description {
    color: var(--nexa-text-secondary);
    font-size: 0.875rem;
  }
}

.sample-container {
  .input-examples {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>

<template>
  <div class="ai-right-panel">
    <StandardRightHeader
      title="설정"
      subtitle="Ollama 연결 및 모델 설정"
      push-icon="menu_open"
    />
    <div class="panel-scroll-area">
      <div class="q-pa-md">
        <q-expansion-item icon="settings" label="연결 설정" default-opened>
          <div class="q-pa-sm">
            <q-input
              v-model="ollamaBaseUrl"
              label="Ollama URL"
              outlined
              dense
              hint="예: http://192.168.0.15:11434"
              class="q-mb-sm"
            />
            <q-btn
              label="연결 확인"
              flat
              dense
              color="primary"
              :loading="isChecking"
              @click="checkConnection"
            />
            <div v-if="connectionStatus" class="text-caption q-mt-xs" :class="connectionStatus.ok ? 'text-positive' : 'text-negative'">
              {{ connectionStatus.message }}
            </div>
          </div>
        </q-expansion-item>

        <q-expansion-item icon="psychology" label="모델">
          <div class="q-pa-sm">
            <q-select
              v-model="selectedModel"
              :options="models"
              label="모델 선택"
              outlined
              dense
              use-input
              input-debounce="300"
              option-value="name"
              option-label="name"
              emit-value
              map-options
              :loading="isLoadingModels"
              @focus="loadModels"
            />
          </div>
        </q-expansion-item>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StandardRightHeader from '@frame/layout/components/StandardRightHeader.vue'
import { aiApi } from '../../services/aiApi.js'
import { useAiSettings } from '../../composables/useAiSettings.js'

const { selectedModel } = useAiSettings()
const ollamaBaseUrl = ref('http://192.168.0.15:11434')
const models = ref([])
const isLoadingModels = ref(false)
const isChecking = ref(false)
const connectionStatus = ref(null)

onMounted(() => {
  loadModels()
})

async function loadModels() {
  if (models.value.length > 0) return
  isLoadingModels.value = true
  try {
    const list = await aiApi.listModels()
    models.value = list?.models ?? []
    if (models.value.length > 0 && !selectedModel.value) {
      selectedModel.value = models.value[0].name
    }
  } catch {
    models.value = []
  } finally {
    isLoadingModels.value = false
  }
}

async function checkConnection() {
  isChecking.value = true
  connectionStatus.value = null
  try {
    await aiApi.checkConnection(ollamaBaseUrl.value)
    connectionStatus.value = { ok: true, message: '연결 성공' }
  } catch (err) {
    connectionStatus.value = { ok: false, message: err.message || '연결 실패' }
  } finally {
    isChecking.value = false
  }
}
</script>

<style lang="scss" scoped>
.ai-right-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .panel-scroll-area {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
}
</style>

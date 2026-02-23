<template>
  <div class="ai-right-panel">
    <StandardRightHeader
      title="설정"
      subtitle="Ollama, 모델, Instruction 설정"
      push-icon="menu_open"
    />
    <div class="panel-scroll-area">
      <div class="q-pa-md">
        <q-expansion-item default-opened>
          <template #header>
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>연결 설정</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-caption" :class="connectionStatusClass">{{ connectionStatusDisplay }}</span>
            </q-item-section>
          </template>
          <div class="q-pa-sm">
            <q-input
              v-model="ollamaBaseUrl"
              outlined
              dense
              label="Ollama URL"
              @update:model-value="scheduleConnectionCheck"
            />
          </div>
        </q-expansion-item>

        <q-expansion-item icon="psychology" label="모델" default-opened>
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

        <q-expansion-item icon="terminal" label="INSTRUCTION" default-opened>
          <div class="instruction-section q-pa-sm">
            <div class="instruction-block q-mb-md">
              <div class="text-caption text-grey-7 text-uppercase q-mb-xs">System</div>
              <q-input
                :model-value="systemInstruction"
                outlined
                dense
                type="textarea"
                placeholder="Platform-wide default instruction"
                rows="2"
                @update:model-value="updateSystemInstruction"
              />
            </div>
            <div v-if="selectedChannel" class="instruction-block q-mb-md">
              <div class="text-caption text-grey-7 text-uppercase q-mb-xs">Channel</div>
              <q-input
                :model-value="selectedChannel.instruction ?? ''"
                outlined
                dense
                type="textarea"
                :placeholder="`Channel instruction: ${selectedChannel.name}`"
                rows="2"
                @update:model-value="(v) => updateChannelInstruction(selectedChannel.id, v)"
              />
            </div>
            <div v-if="selectedChat" class="instruction-block">
              <div class="text-caption text-grey-7 text-uppercase q-mb-xs">Chat</div>
              <q-input
                :model-value="selectedChat.instruction ?? ''"
                outlined
                dense
                type="textarea"
                :placeholder="`Chat instruction: ${selectedChat.title}`"
                rows="2"
                @update:model-value="(v) => updateChatInstruction(selectedChannelId, selectedChat.id, v)"
              />
            </div>
          </div>
        </q-expansion-item>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StandardRightHeader from '@frame/layout/components/StandardRightHeader.vue'
import { aiApi } from '../../services/aiApi.js'
import { useAiSettings } from '../../composables/useAiSettings.js'
import { useAiChannels } from '../../composables/useAiChannels.js'

const { selectedModel } = useAiSettings()
const {
  selectedChannel,
  selectedChat,
  selectedChannelId,
  systemInstruction,
  updateSystemInstruction,
  updateChannelInstruction,
  updateChatInstruction,
} = useAiChannels()
const ollamaBaseUrl = ref('http://192.168.0.15:11434')
const models = ref([])
const isLoadingModels = ref(false)
const connectionStatus = ref(null)
const isCheckingConnection = ref(false)
let connectionCheckTimer = null

const connectionStatusDisplay = computed(() => {
  if (isCheckingConnection.value) return '확인 중...'
  if (!connectionStatus.value) return '—'
  return connectionStatus.value.ok ? '연결됨' : '연결 실패'
})

const connectionStatusClass = computed(() => {
  if (isCheckingConnection.value || !connectionStatus.value) return 'text-grey-6'
  return connectionStatus.value.ok ? 'text-positive' : 'text-negative'
})

function scheduleConnectionCheck() {
  if (connectionCheckTimer) clearTimeout(connectionCheckTimer)
  connectionCheckTimer = setTimeout(checkConnection, 500)
}

onMounted(() => {
  loadModels()
  checkConnection()
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
  isCheckingConnection.value = true
  try {
    await aiApi.checkConnection(ollamaBaseUrl.value)
    connectionStatus.value = { ok: true, message: 'OK' }
  } catch (err) {
    connectionStatus.value = { ok: false, message: err.message || 'Fail' }
  } finally {
    isCheckingConnection.value = false
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

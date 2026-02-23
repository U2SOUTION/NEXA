<template>
  <div class="ai-right-panel">
    <StandardRightHeader title="설정" subtitle="Ollama, 모델, Instruction 설정" push-icon="menu_open" />
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
            <q-input v-model="ollamaBaseUrl" outlined dense label="Ollama URL" @update:model-value="scheduleConnectionCheck" />
          </div>
        </q-expansion-item>

        <q-expansion-item icon="psychology" label="모델" default-opened>
          <div class="q-pa-sm">
            <q-select v-model="selectedModel" :options="models" label="모델 선택" outlined dense option-value="name" option-label="name" emit-value map-options hide-bottom-space :loading="isLoadingModels" @focus="loadModels">
              <template #selected>
                <span v-if="selectedModel" class="model-select-selected row items-center no-wrap">
                  <span class="model-select-name col">{{ models.find((m) => m.name === selectedModel)?.name ?? selectedModel }}</span>
                  <span class="model-capability-icons q-ml-xs">
                    <q-icon v-for="item in getCapabilityIcons(selectedModel)" :key="item.icon" :name="item.icon" size="18px" class="q-mr-xs" :title="item.title" />
                  </span>
                </span>
              </template>
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <span class="model-capability-icons">
                      <q-icon v-for="item in getCapabilityIcons(scope.opt.name)" :key="item.icon" :name="item.icon" size="18px" class="q-mr-xs" :title="item.title" />
                    </span>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </q-expansion-item>

        <q-expansion-item icon="terminal" label="INSTRUCTION" default-opened>
          <div class="instruction-section q-pa-sm">
            <div class="instruction-block q-mb-md">
              <div class="text-caption text-grey-7 text-uppercase q-mb-xs">System</div>
              <q-input :model-value="systemInstruction" outlined dense type="textarea" placeholder="시스템의 전역 지침서를 입력 하세요" rows="2" @update:model-value="updateSystemInstruction" />
            </div>
            <div v-if="selectedChannel" class="instruction-block q-mb-md">
              <div class="text-caption text-grey-7 text-uppercase q-mb-xs">Channel</div>
              <q-input :model-value="selectedChannel.instruction ?? ''" outlined dense type="textarea" placeholder="이 채널에 적용되는 지침서를 입력 하세요" rows="2" @update:model-value="(v) => updateChannelInstruction(selectedChannel.id, v)" />
            </div>
            <div v-if="selectedChat" class="instruction-block">
              <div class="text-caption text-grey-7 text-uppercase q-mb-xs">Chat</div>
              <q-input :model-value="selectedChat.instruction ?? ''" outlined dense type="textarea" placeholder="이 대화에만 적용되는 지침서를 입력 하세요" rows="2" @update:model-value="(v) => updateChatInstruction(selectedChannelId, selectedChat.id, v)" />
            </div>
          </div>
        </q-expansion-item>

        <q-expansion-item icon="chat" label="채팅" default-opened>
          <div class="chat-settings q-pa-sm">
            <div class="chat-setting-row q-mb-md">
              <div class="text-caption text-grey-7 q-mb-xs">입력창 최대 줄 수</div>
              <div class="row items-center no-wrap q-gutter-sm">
                <q-slider v-model="chatInputMaxRows" :min="2" :max="20" :step="1" class="col" />
                <span class="text-caption text-grey-7" style="min-width: 2em">{{ chatInputMaxRows }}</span>
              </div>
            </div>
            <div class="chat-setting-row q-mb-md">
              <div class="text-caption text-grey-7 q-mb-xs">메시지 폰트 크기 (px)</div>
              <div class="row items-center no-wrap q-gutter-sm">
                <q-slider v-model="chatFontSize" :min="12" :max="24" :step="1" class="col" />
                <span class="text-caption text-grey-7" style="min-width: 2.5em">{{ chatFontSize }}px</span>
              </div>
            </div>
            <div class="chat-setting-row">
              <div class="text-caption text-grey-7 q-mb-xs">메시지 최대 길이 (0=제한없음)</div>
              <div class="row items-center no-wrap q-gutter-sm">
                <q-slider v-model="chatMessageMaxLength" :min="0" :max="10000" :step="500" class="col" />
                <span class="text-caption text-grey-7" style="min-width: 3.5em">{{ chatMessageMaxLength === 0 ? '없음' : chatMessageMaxLength.toLocaleString() }}</span>
              </div>
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

const { selectedModel, chatInputMaxRows, chatFontSize, chatMessageMaxLength, modelCapabilities, setModelCapabilities } = useAiSettings()
const { selectedChannel, selectedChat, selectedChannelId, systemInstruction, updateSystemInstruction, updateChannelInstruction, updateChatInstruction } = useAiChannels()
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

const CAPABILITY_ICONS = {
  completion: { icon: 'chat_bubble', title: '채팅' },
  vision: { icon: 'image', title: '이미지 지원' },
  audio: { icon: 'mic', title: '음성 지원' },
}

function getCapabilityIcons(modelName) {
  const caps = modelCapabilities.value?.[modelName] ?? []
  if (caps.length === 0) return [CAPABILITY_ICONS.completion]
  const order = ['completion', 'vision', 'audio']
  return order.filter((k) => caps.includes(k)).map((k) => CAPABILITY_ICONS[k])
}

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
    const modelList = list?.models ?? []
    models.value = modelList
    if (modelList.length > 0 && !selectedModel.value) {
      selectedModel.value = modelList[0].name
    }
    const capsMap = {}
    await Promise.all(
      modelList.map(async (m) => {
        try {
          const info = await aiApi.getModelShow(m.name)
          capsMap[m.name] = info?.capabilities ?? []
        } catch {
          capsMap[m.name] = []
        }
      })
    )
    setModelCapabilities(capsMap)
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

  .chat-settings {
    padding-left: 15px;
  }

  .model-select-selected {
    width: 100%;
    min-width: 0;
  }

  .model-select-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .model-capability-icons {
    flex-shrink: 0;
  }
}
</style>

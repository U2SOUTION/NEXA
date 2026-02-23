<template>
  <div class="ai-right-panel column">
    <StandardRightHeader :title="rightHeaderTitle" :subtitle="rightHeaderSubtitle" push-icon="menu_open" />
    <q-tabs v-model="rightMainTab" dense class="right-main-tabs" active-color="primary" indicator-color="primary" align="left">
      <q-tab name="agents" label="에이전트" icon="smart_toy" />
      <q-tab name="settings" label="설정" icon="settings" />
    </q-tabs>
    <q-tab-panels v-model="rightMainTab" animated class="col right-main-panels">
      <q-tab-panel name="agents" class="q-pa-none right-panel-inner">
        <div class="panel-scroll-area">
          <div class="ai-panel-padding">
            <q-expansion-item v-for="item in AI_AGENT_TABS" :key="item.id" :icon="item.icon" :label="item.label" :default-opened="item.id === 'skill'">
              <div class="ai-accordion-content">
                <component :is="agentPanels[item.id]" />
              </div>
            </q-expansion-item>
          </div>
        </div>
      </q-tab-panel>
      <q-tab-panel name="settings" class="q-pa-none right-panel-inner">
        <div class="panel-scroll-area">
          <div class="ai-panel-padding">
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
              <div class="ai-accordion-content">
                <q-input v-model="ollamaBaseUrl" outlined dense label="Ollama URL" @update:model-value="scheduleConnectionCheck" />
              </div>
            </q-expansion-item>

            <q-expansion-item icon="psychology" label="모델" default-opened>
              <div class="ai-accordion-content">
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
              <div class="instruction-section ai-accordion-content">
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

            <q-expansion-item @hide="stopWebcam">
              <template #header>
                <q-item-section avatar>
                  <q-icon name="videocam" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>웹캠</q-item-label>
                </q-item-section>
                <q-item-section side @click.stop class="webcam-toggle-wrap" :class="{ 'webcam-on': webcamStream }">
                  <q-toggle dense :model-value="!!webcamStream" :label="webcamStream ? '켜짐' : '꺼짐'" @update:model-value="onWebcamToggle" />
                </q-item-section>
              </template>
              <div class="webcam-section ai-accordion-content">
                <div class="webcam-video-wrap">
                  <video v-show="webcamStream" ref="webcamVideoRef" autoplay playsinline muted class="webcam-video" :style="webcamVideoStyle" />
                  <div v-if="!webcamStream && !webcamError" class="webcam-placeholder">웹캠을 켜면 영상이 표시됩니다</div>
                  <div v-if="webcamError" class="webcam-error text-caption text-negative">{{ webcamError }}</div>
                </div>
                <div class="webcam-buttons row items-center justify-between q-mt-sm">
                  <q-btn v-if="supportsVision" outline dense color="primary" icon="camera_alt" label="캡처첨부" :disable="!webcamStream" @click="captureAndSend" />
                  <q-btn round dense flat size="sm" icon="settings" title="웹캠 설정" @click="webcamSettingsModalOpen = true" />
                </div>
              </div>
            </q-expansion-item>

            <q-dialog v-model="webcamSettingsModalOpen" class="webcam-settings-dialog">
              <q-card class="webcam-settings-card" style="padding: 20px">
                <q-card-section class="row items-center q-pb-none">
                  <div>
                    <div class="webcam-modal-title">Webcam Settings</div>
                    <div class="webcam-modal-subtitle">웹캠 설정</div>
                  </div>
                  <q-space />
                  <q-btn icon="close" flat round dense @click="webcamSettingsModalOpen = false" />
                </q-card-section>
                <q-card-section class="q-pt-none">
                  <div class="webcam-setting-block q-mb-lg">
                    <div class="text-caption text-grey-7 text-uppercase q-mb-sm">화면 반전</div>
                    <q-select v-model="webcamFlipMode" :options="webcamFlipOptions" outlined dense emit-value map-options hide-bottom-space />
                  </div>
                  <div class="webcam-setting-block q-mb-lg">
                    <div class="text-caption text-grey-7 text-uppercase q-mb-sm">해상도</div>
                    <q-select v-model="webcamResolution" :options="webcamResolutionOptions" outlined dense emit-value map-options hide-bottom-space @update:model-value="onResolutionChange" />
                  </div>
                  <div class="webcam-setting-block">
                    <div class="text-caption text-grey-7 text-uppercase q-mb-sm">필터</div>
                    <div class="webcam-filter-row q-mb-md">
                      <div class="text-body2 q-mb-xs">밝기</div>
                      <div class="row items-center no-wrap q-gutter-sm">
                        <q-slider v-model="webcamFilterBrightness" :min="0" :max="200" :step="5" class="col" />
                        <span class="text-caption" style="min-width: 2.5em">{{ webcamFilterBrightness }}%</span>
                      </div>
                    </div>
                    <div class="webcam-filter-row q-mb-md">
                      <div class="text-body2 q-mb-xs">대비</div>
                      <div class="row items-center no-wrap q-gutter-sm">
                        <q-slider v-model="webcamFilterContrast" :min="0" :max="200" :step="5" class="col" />
                        <span class="text-caption" style="min-width: 2.5em">{{ webcamFilterContrast }}%</span>
                      </div>
                    </div>
                    <div class="webcam-filter-row q-mb-md">
                      <div class="text-body2 q-mb-xs">채도</div>
                      <div class="row items-center no-wrap q-gutter-sm">
                        <q-slider v-model="webcamFilterSaturate" :min="0" :max="200" :step="5" class="col" />
                        <span class="text-caption" style="min-width: 2.5em">{{ webcamFilterSaturate }}%</span>
                      </div>
                    </div>
                    <div class="webcam-filter-row">
                      <q-toggle v-model="webcamFilterGrayscale" label="흑백" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-dialog>

            <q-expansion-item icon="chat" label="채팅" default-opened>
              <div class="chat-settings ai-accordion-content">
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
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import StandardRightHeader from '@frame/layout/components/StandardRightHeader.vue'
import { AI_AGENT_TABS } from '../../config/aiAgentTabRegistry.js'
import AiAgentSkillPanel from './agent/AiAgentSkillPanel.vue'
import AiAgentTaskPanel from './agent/AiAgentTaskPanel.vue'
import AiAgentWorkcardPanel from './agent/AiAgentWorkcardPanel.vue'
import { aiApi } from '../../services/aiApi.js'
import { useAiSettings } from '../../composables/useAiSettings.js'
import { useAiChannels } from '../../composables/useAiChannels.js'

const { selectedModel, selectedModelCapabilities, chatInputMaxRows, chatFontSize, chatMessageMaxLength, modelCapabilities, setModelCapabilities, pendingWebcamCapture, webcamFlipMode, webcamResolution, webcamFilterBrightness, webcamFilterContrast, webcamFilterSaturate, webcamFilterGrayscale } =
  useAiSettings()
const { selectedChannel, selectedChat, selectedChannelId, systemInstruction, updateSystemInstruction, updateChannelInstruction, updateChatInstruction } = useAiChannels()
const ollamaBaseUrl = ref('http://192.168.0.15:11434')
const models = ref([])
const isLoadingModels = ref(false)
const connectionStatus = ref(null)
const isCheckingConnection = ref(false)
let connectionCheckTimer = null

const rightMainTab = ref('agents')

const agentPanels = {
  skill: AiAgentSkillPanel,
  task: AiAgentTaskPanel,
  workcard: AiAgentWorkcardPanel,
}

const rightHeaderTitle = computed(() => (rightMainTab.value === 'settings' ? '설정' : '에이전트'))
const rightHeaderSubtitle = computed(() => (rightMainTab.value === 'settings' ? 'Ollama, 모델, Instruction 설정' : '스킬, 테스크, 업무카드'))

const connectionStatusDisplay = computed(() => {
  if (isCheckingConnection.value) return '확인 중...'
  if (!connectionStatus.value) return '—'
  return connectionStatus.value.ok ? '연결됨' : '연결 실패'
})

const connectionStatusClass = computed(() => {
  if (isCheckingConnection.value || !connectionStatus.value) return 'text-grey-6'
  return connectionStatus.value.ok ? 'text-positive' : 'text-negative'
})

const supportsVision = computed(() => (selectedModelCapabilities.value || []).includes('vision'))

const webcamVideoRef = ref(null)
const webcamStream = ref(null)
const webcamError = ref('')
const webcamSettingsModalOpen = ref(false)

const webcamFlipOptions = [
  { label: '없음', value: 'none' },
  { label: '좌우 반전 (거울)', value: 'horizontal' },
  { label: '상하 반전', value: 'vertical' },
  { label: '좌우+상하', value: 'both' },
]

const webcamResolutionOptions = [
  { label: '640 × 480', value: '640x480' },
  { label: '800 × 600', value: '800x600' },
  { label: '1280 × 720', value: '1280x720' },
  { label: '1920 × 1080', value: '1920x1080' },
]

const webcamVideoStyle = computed(() => {
  const mode = webcamFlipMode.value
  let transform = ''
  if (mode === 'horizontal') transform = 'scaleX(-1)'
  else if (mode === 'vertical') transform = 'scaleY(-1)'
  else if (mode === 'both') transform = 'scale(-1, -1)'
  const b = (webcamFilterBrightness.value / 100).toFixed(2)
  const c = (webcamFilterContrast.value / 100).toFixed(2)
  const s = (webcamFilterSaturate.value / 100).toFixed(2)
  const g = webcamFilterGrayscale.value ? 1 : 0
  const filter = `brightness(${b}) contrast(${c}) saturate(${s}) grayscale(${g})`
  return { transform: transform || undefined, filter }
})

function getWebcamCaptureFilter() {
  const b = (webcamFilterBrightness.value / 100).toFixed(2)
  const c = (webcamFilterContrast.value / 100).toFixed(2)
  const s = (webcamFilterSaturate.value / 100).toFixed(2)
  const g = webcamFilterGrayscale.value ? 1 : 0
  return `brightness(${b}) contrast(${c}) saturate(${s}) grayscale(${g})`
}

function onWebcamToggle(on) {
  if (on) startWebcam()
  else stopWebcam()
}

function onResolutionChange() {
  if (webcamStream.value) {
    stopWebcam()
    nextTick(() => startWebcam())
  }
}

async function startWebcam() {
  stopWebcam()
  webcamError.value = ''
  const [w, h] = (webcamResolution.value || '640x480').split('x').map(Number)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: w }, height: { ideal: h } },
    })
    webcamStream.value = stream
    await nextTick()
    if (webcamVideoRef.value) {
      webcamVideoRef.value.srcObject = stream
    }
  } catch (err) {
    webcamError.value = err.message || '웹캠을 사용할 수 없습니다.'
    webcamStream.value = null
  }
}

function stopWebcam() {
  const stream = webcamStream.value
  if (stream) {
    stream.getTracks().forEach((t) => t.stop())
    webcamStream.value = null
  }
  if (webcamVideoRef.value) {
    webcamVideoRef.value.srcObject = null
  }
}

function captureAndSend() {
  const video = webcamVideoRef.value
  if (!video || !webcamStream.value || video.readyState < 2) return
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const mode = webcamFlipMode.value
  const flipH = mode === 'horizontal' || mode === 'both'
  const flipV = mode === 'vertical' || mode === 'both'
  if (flipH || flipV) {
    ctx.translate(flipH ? canvas.width : 0, flipV ? canvas.height : 0)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  }
  ctx.filter = getWebcamCaptureFilter()
  ctx.drawImage(video, 0, 0)
  const dataUrl = canvas.toDataURL('image/png')
  pendingWebcamCapture.value = dataUrl
}

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

onBeforeUnmount(() => {
  stopWebcam()
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
      }),
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
  min-height: 0;
  overflow: hidden;

  .right-main-tabs {
    flex-shrink: 0;
  }

  .right-main-panels {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .right-panel-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .panel-scroll-area {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .ai-panel-padding {
    padding: 3px 0px;
  }

  .ai-accordion-content {
    padding: 3px 0px;
  }

  .chat-settings {
    padding-left: 6px;
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

  // deep 사용 이유: Quasar q-toggle 내부 라벨에 경고색 적용
  .webcam-toggle-wrap.webcam-on :deep(.q-toggle__label) {
    color: var(--nexa-warning);
  }

  .webcam-section {
    .webcam-buttons {
      min-height: 36px;
    }

    .webcam-video-wrap {
      position: relative;
      background: #111;
      border-radius: 8px;
      overflow: hidden;
      aspect-ratio: 4/3;

      .webcam-placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.4);
        padding: 16px;
      }
    }

    .webcam-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .webcam-error {
      position: absolute;
      bottom: 8px;
      left: 8px;
      right: 8px;
    }
  }
}
</style>

<!-- 다이얼로그는 body로 teleport되어 scoped 미적용 → 전역 스타일 필요 -->
<style lang="scss">
.webcam-settings-dialog .webcam-settings-card {
  min-width: 320px;

  .webcam-modal-title {
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: -1px;
    color: var(--nexa-text-primary);
  }

  .webcam-modal-subtitle {
    font-size: 0.75rem;
    color: var(--nexa-text-primary);
    margin-bottom: 10px;
  }
}
</style>

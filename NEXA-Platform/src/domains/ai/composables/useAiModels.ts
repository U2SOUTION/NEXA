import { ref } from 'vue'
import { aiApi } from '../services/aiApi'
import { useAiSettings } from './useAiSettings'

export interface AiModelInfo {
  name: string
  [key: string]: unknown
}

export interface AiModelsResponse {
  models?: AiModelInfo[]
}

const models = ref<AiModelInfo[]>([])
const isLoadingModels = ref(false)

export function useAiModels() {
  const { selectedModel, setModelCapabilities } = useAiSettings()

  async function loadModels(force = false): Promise<void> {
    if (!force && models.value.length > 0) return
    isLoadingModels.value = true
    try {
      const list = (await aiApi.listModels()) as AiModelsResponse
      const modelList = list?.models ?? []
      models.value = modelList
      if (modelList.length > 0 && !selectedModel.value) {
        selectedModel.value = modelList[0].name
      }
      const capsMap: Record<string, string[]> = {}
      await Promise.all(
        modelList.map(async (m: AiModelInfo) => {
          try {
            const info = (await aiApi.getModelShow(m.name)) as { capabilities?: string[] }
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

  return { models, isLoadingModels, loadModels }
}

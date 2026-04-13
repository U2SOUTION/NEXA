import { ref } from 'vue'
import { nexiaApi } from '../services/nexiaApi'
import { useNexiaSettings } from './useNexiaSettings'

export interface NexiaModelInfo {
  name: string
  [key: string]: unknown
}

export interface NexiaModelsResponse {
  models?: NexiaModelInfo[]
}

const models = ref<NexiaModelInfo[]>([])
const isLoadingModels = ref(false)

export function useNexiaModels() {
  const { selectedModel, setModelCapabilities } = useNexiaSettings()

  async function loadModels(force = false): Promise<void> {
    if (!force && models.value.length > 0) return
    isLoadingModels.value = true
    try {
      const list = (await nexiaApi.listModels()) as NexiaModelsResponse
      const modelList = list?.models ?? []
      models.value = modelList
      if (modelList.length > 0 && !selectedModel.value) {
        selectedModel.value = modelList[0].name
      }
      const capsMap: Record<string, string[]> = {}
      await Promise.all(
        modelList.map(async (m: NexiaModelInfo) => {
          try {
            const info = (await nexiaApi.getModelShow(m.name)) as { capabilities?: string[] }
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

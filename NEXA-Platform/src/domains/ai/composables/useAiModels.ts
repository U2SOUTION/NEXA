import { ref } from 'vue'
import { aiApi } from '../services/aiApi'
import { useAiSettings } from './useAiSettings'

const models = ref([])
const isLoadingModels = ref(false)

export function useAiModels() {
  const { selectedModel, setModelCapabilities } = useAiSettings()

  async function loadModels(force = false) {
    if (!force && models.value.length > 0) return
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

  return { models, isLoadingModels, loadModels }
}

import { ref } from 'vue'

const selectedModel = ref('')

export function useAiSettings() {
  return { selectedModel }
}

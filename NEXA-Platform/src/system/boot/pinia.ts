import type { App } from 'vue'
import { createPinia } from 'pinia'

// "async" is optional
export default ({ app }: { app: App }) => {
  // something to do
  const pinia = createPinia()
  app.use(pinia)
}

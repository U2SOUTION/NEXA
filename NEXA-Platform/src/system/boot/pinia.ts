import { createPinia } from 'pinia'

// "async" is optional
export default ({ app }) => {
  // something to do
  const pinia = createPinia()
  app.use(pinia)
}

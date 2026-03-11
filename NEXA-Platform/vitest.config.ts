// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node', // 엔진 로직 테스트이므로 node 환경 사용
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@system': path.resolve(__dirname, './src/system'),
    },
  },
})

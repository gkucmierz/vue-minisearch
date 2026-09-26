import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    port: 34081
  },
  resolve: {
    alias: {
      'vue-minisearch': path.resolve(__dirname, '../src/index.ts')
    }
  }
})

import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      // 将 /api 代理到后端 Spring Boot
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 去掉前缀 /api，再转发给后端
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

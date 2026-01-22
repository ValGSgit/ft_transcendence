import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true, // Listen on 0.0.0.0 (All IP addresses)
    port: 5173,
    watch: {
      usePolling: true // Essential for Docker on Windows/Mac to see code changes
    }
  }
})
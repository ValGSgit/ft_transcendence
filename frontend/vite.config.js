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
    host: true, // Listen on 0.0.0.0 for Docker
    port: 5173,
    watch: {
      usePolling: true // Required for Docker volume mounts
    },
    // HMR works through nginx WebSocket proxy on port 8080
    hmr: {
      clientPort: 8080
    },
    // Proxy for local dev without Docker (optional fallback)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
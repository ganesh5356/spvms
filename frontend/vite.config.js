import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:8082',
      '/api': 'http://localhost:8082',
      '/swagger-ui': 'http://localhost:8082',
      '/v3': 'http://localhost:8082'
    }
  }
})


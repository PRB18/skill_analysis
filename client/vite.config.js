import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy configuration to forward API calls to backend
    // This avoids CORS issues during development
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Backend server URL
        changeOrigin: true,              // Needed for virtual hosted sites
        secure: false                    // Don't verify SSL certificate
      }
    },
    // Frontend runs on port 3000 (backend is on 5000)
    port: 3000,
    // Automatically open browser on dev start
    open: true
  }
})

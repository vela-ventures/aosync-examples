import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [
      '6459-2a01-14-8063-d2d0-2105-23bf-3646-9cb9.ngrok-free.app'
    ]
  },
  plugins: [react()],
})

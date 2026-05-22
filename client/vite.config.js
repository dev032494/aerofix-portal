import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5001,
    allowHosts: ['localhost', '127.0.0.1','welcoming-smile-production-5339.up.railway.app'],
  },
})

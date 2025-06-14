import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Necessário para o ngrok
    port: 3000,
    allowedHosts: [
      'localhost',
      '.ngrok-free.app', // Permite qualquer subdomínio do ngrok
    ],
  },
  base: '/horario/',
}) 
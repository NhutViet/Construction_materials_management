import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  server: {
    host: '0.0.0.0', // Cho phép truy cập từ mạng local
    port: 5173, // Port mặc định của Vite
  }
})

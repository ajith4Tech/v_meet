import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/assets/v_meet/react_app/dist/',  // VERY IMPORTANT
  build: {
    outDir: 'dist',
  }
})
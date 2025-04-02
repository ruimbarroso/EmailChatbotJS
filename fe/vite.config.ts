import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // This makes the server accessible from outside the container
    port: 3000, // This ensures it's running on port 3000
    strictPort: true, // Ensures it doesn't fall back to another port
    watch: {
      usePolling: true,
      interval: 100, // you can adjust the interval as needed
    },
  },


})

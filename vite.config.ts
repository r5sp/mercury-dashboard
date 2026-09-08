import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so `dist/` works from a subdirectory or a file:// open.
  base: './',
  build: {
    // Recharts is ~150 kB gzipped on its own and is split into its own chunk
    // above, so the default 500 kB warning has nothing left to tell us.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
})

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Framework core
          'react-vendor': ['react', 'react-dom'],
          // Routing
          'router':       ['react-router-dom'],
          // Icons
          'icons':        ['lucide-react'],
          // QR scanner (besar, pisahkan sendiri)
          'qr-scanner':   ['react-qr-barcode-scanner'],
        },
      },
    },
  },
})

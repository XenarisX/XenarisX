import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Le site est servi sous /exams/ (xenaris.org/exams) : les fichiers sont produits dans dist/exams.
export default defineConfig({
  base: '/exams/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist/exams',
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory') || id.includes('node_modules/lodash')) return 'graphiques'
          if (id.includes('prism-react-renderer')) return 'prism'
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react'
          if (id.includes('/src/contenu/')) return 'contenu'
        },
      },
    },
  },
})

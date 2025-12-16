import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['better-sqlite3', 'chokidar', 'pdf-parse', 'mammoth', 'tesseract.js']
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        external: []
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer')
      }
    },
    plugins: [react()]
  }
})

/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    // Lets us write `import x from '@/services/api'` instead of '../../services/api'
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom', // a fake browser DOM for component tests
    setupFiles: ['./src/test/setup.ts'],
    // Node 25+ has its own global localStorage that hides jsdom's one; turn Node's off in tests.
    execArgv: ['--no-experimental-webstorage'],
  },
})

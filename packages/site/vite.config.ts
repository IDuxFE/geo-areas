import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { localizedArchive } from './scripts/localized-archive.mjs'

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/geo-areas/' : '/',
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  plugins: [localizedArchive(), vue({ include: [/\.(vue|md)$/] })],
}))

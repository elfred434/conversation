import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base './' : fonctionne en dev, sur GitHub Pages (/conversation/) et partout ailleurs.
export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})

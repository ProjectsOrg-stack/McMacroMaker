import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  oxc: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
})

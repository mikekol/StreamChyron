import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/config.json': 'http://localhost:3000',
      '/config': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})

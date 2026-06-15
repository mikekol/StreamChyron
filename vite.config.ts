import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/state':       'http://localhost:3000',
      '/stop':        'http://localhost:3000',
      '/config.json': 'http://localhost:3000',
      '/config':      'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})

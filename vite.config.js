import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Expone POST /api/scan en `npm run dev` y `npm run preview`.
function scanApi() {
  const attach = async (server) => {
    const { scanMiddleware } = await import('./server/scan.js')
    server.middlewares.use('/api/scan', scanMiddleware)
  }
  return { name: 'scan-api', configureServer: attach, configurePreviewServer: attach }
}

export default defineConfig({
  plugins: [react(), scanApi()],
})

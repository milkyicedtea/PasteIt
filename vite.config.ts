import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({ target: 'react', autoCodeSplitting: true, routesDirectory: 'src/client/routes', generatedRouteTree: 'src/client/routeTree.gen.ts' }),
    viteReact()
  ],

  resolve: {
    tsconfigPaths: true
  },

  server: {
    // vite was reloading when editing files unrelated to frontend
    watch: {
      ignored: (path)  => {
        const allow = ['/src/client/', '/public/', 'vite.config', 'index.html']
        return !allow.some(p => path.includes(p))
      }
    },
    forwardConsole: false,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
})

export default config

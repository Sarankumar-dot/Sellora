import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://sellora-backend-u514.onrender.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            if (proxyRes.headers['set-cookie']) {
              proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie => 
                cookie
                  .replace(/;\s*Secure/gi, '')
                  .replace(/;\s*SameSite=(None|Lax|Strict)/gi, '; SameSite=Lax')
                  .replace(/;\s*Path=[^;]+/gi, '; Path=/')
              );
            }
          });
        }
      }
    }
  },
})

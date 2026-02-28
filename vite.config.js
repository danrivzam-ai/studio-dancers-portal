import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Build timestamp — changes every build so sw.js is always unique → browser always updates
const BUILD_TS = Date.now()

export default defineConfig({
  define: {
    __BUILD_TS__: JSON.stringify(BUILD_TS),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Studio Dancers - Portal de Pagos',
        short_name: 'Studio Dancers',
        description: 'Portal de pagos para alumnos y representantes',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#7e22ce',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      // Use injectManifest for full control over service worker
      strategies: 'generateSW',
      workbox: {
        // NO precaching of JS/CSS — avoids stale cached bundles causing gray screen
        globPatterns: ['**/*.{html,png,ico,svg}'],
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        // All JS/CSS served NetworkFirst — always fresh from server
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-assets',
              expiration: { maxEntries: 30, maxAgeSeconds: 86400 },
              networkTimeoutSeconds: 5,
            }
          },
          {
            urlPattern: /^https:\/\/.*supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 5,
            }
          }
        ]
      }
    })
  ],
})

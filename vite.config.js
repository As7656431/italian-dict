import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['data/all_words.json', 'data/words_index.json'],
      manifest: {
        name: '意大利语 CEFR 词典',
        short_name: '意语词典',
        description: '2100+ 核心词汇深度解析，构词拆解 + 英语同源 + 动词全变位',
        theme_color: '#2d6a4f',
        background_color: '#f8faf9',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB，确保词典JSON被缓存
      }
    })
  ],
})

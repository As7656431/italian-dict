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
        globPatterns: ['**/*.{js,css,html,png,svg}'], // 不预缓存 JSON 数据文件
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        skipWaiting: true,      // 新 SW 立即激活，不等旧的退出
        clientsClaim: true,     // 激活后立即接管所有页面
        runtimeCaching: [{
          urlPattern: /\/data\/.*\.json$/,
          handler: 'NetworkFirst', // 数据文件优先从网络拉，离线时用缓存
          options: {
            cacheName: 'dict-data',
            expiration: {
              maxAgeSeconds: 86400 // 缓存 24 小时
            }
          }
        }]
      }
    })
  ],
})

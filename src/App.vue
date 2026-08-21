<template>
  <div class="min-h-screen flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 bg-gradient-to-r from-[#2d6a4f] to-[#40916c] shadow-lg">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <router-link to="/" class="flex items-center gap-2 text-white no-underline">
            <span class="text-2xl">🇮🇹</span>
            <h1 class="text-lg font-bold text-white tracking-wide">意大利语 CEFR 词典</h1>
          </router-link>
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <span v-if="!store.state.loading">{{ store.state.allWords.length }} 词</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- 底部 -->
    <footer class="text-center py-4 text-xs text-gray-400 border-t border-gray-200">
      意大利语 CEFR 词典 · 数据由 GPT-5.5 深度增强生成 · {{ store.state.allWords.length }} 词条
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import store from './store/dictionary.js'

onMounted(() => {
  store.loadDictionary()
})
</script>

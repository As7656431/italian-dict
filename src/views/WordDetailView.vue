<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <!-- 返回按钮 -->
    <router-link to="/" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 no-underline mb-4">
      ← 返回词表
    </router-link>

    <!-- 加载中 -->
    <div v-if="store.state.loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
    </div>

    <!-- 未找到 -->
    <div v-else-if="!wordData" class="text-center py-20">
      <p class="text-6xl mb-4">😕</p>
      <p class="text-gray-400">未找到词条: {{ word }}</p>
      <router-link to="/" class="text-emerald-600 hover:underline mt-4 inline-block no-underline">返回首页</router-link>
    </div>

    <!-- 词条详情 -->
    <WordCard v-else :word="wordData" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import store from '../store/dictionary.js'
import WordCard from '../components/WordCard.vue'

const props = defineProps({
  word: { type: String, required: true },
})

const wordData = computed(() => store.getWordByName(props.word))
</script>

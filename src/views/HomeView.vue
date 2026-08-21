<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- 加载状态 -->
    <div v-if="store.state.loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
        <p class="text-gray-400">正在加载词典数据...</p>
      </div>
    </div>

    <template v-else>
      <!-- 搜索 + 筛选区 -->
      <div class="sticky top-[60px] z-40 bg-[#f8faf9] pb-4 pt-2 space-y-3">
        <SearchBar v-model="searchText" />
        <div class="flex flex-wrap items-center gap-4">
          <LevelFilter
            :selected="store.state.selectedLevels"
            :counts="store.state.totalByLevel"
            @toggle="store.toggleLevel"
          />
          <div class="h-6 w-px bg-gray-200 hidden sm:block"></div>
          <PosFilter
            :selected="store.state.selectedPos"
            @select="store.setPos"
          />
        </div>
        <div class="text-xs text-gray-400">
          共 {{ store.state.filteredWords.length }} 个词条
        </div>
      </div>

      <!-- 词条列表 -->
      <div v-if="store.state.filteredWords.length === 0" class="text-center py-16">
        <p class="text-6xl mb-4">🔍</p>
        <p class="text-gray-400">没有找到匹配的词条</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WordCard
          v-for="word in displayedWords"
          :key="word.word"
          :word="word"
        />
      </div>

      <!-- 加载更多 -->
      <div v-if="displayedWords.length < store.state.filteredWords.length" class="text-center py-8">
        <button
          @click="loadMore"
          class="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
        >
          加载更多 ({{ displayedWords.length }} / {{ store.state.filteredWords.length }})
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import store from '../store/dictionary.js'
import SearchBar from '../components/SearchBar.vue'
import LevelFilter from '../components/LevelFilter.vue'
import PosFilter from '../components/PosFilter.vue'
import WordCard from '../components/WordCard.vue'

const searchText = ref('')
const pageSize = 20
const currentPage = ref(1)

let debounceTimer = null
watch(searchText, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    store.setSearch(val)
    currentPage.value = 1
  }, 200)
})

// Watch for filter changes to reset pagination
watch(() => [store.state.selectedLevels.length, store.state.selectedPos], () => {
  currentPage.value = 1
})

const displayedWords = computed(() => {
  return store.state.filteredWords.slice(0, currentPage.value * pageSize)
})

function loadMore() {
  currentPage.value++
}
</script>

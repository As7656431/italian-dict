<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- 加载状态 -->
    <div v-if="store.state.loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
        <p class="text-gray-400">正在加载词典数据...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="store.state.error" class="flex items-center justify-center py-20">
      <div class="text-center">
        <p class="text-5xl mb-4">⚠️</p>
        <p class="text-gray-600 mb-2">{{ store.state.error }}</p>
        <button @click="store.loadDictionary()" class="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors cursor-pointer">
          点击重试
        </button>
      </div>
    </div>

    <template v-else>
      <!-- 今日一词 -->
      <div v-if="store.state.wordOfTheDay && !store.state.searchQuery" class="mb-6 bg-gradient-to-r from-[#2d6a4f] to-[#40916c] rounded-2xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-widest opacity-80">📖 今日一词</span>
          <span class="text-xs opacity-60">{{ todayDate }}</span>
        </div>
        <div class="flex items-baseline gap-3 mb-2">
          <router-link :to="`/word/${encodeURIComponent(store.state.wordOfTheDay.word)}`" class="text-3xl font-bold text-white no-underline hover:underline" lang="it">
            {{ store.state.wordOfTheDay.word }}
          </router-link>
          <span class="text-white/60 text-sm" lang="it">{{ store.state.wordOfTheDay.ipa }}</span>
          <span class="text-xs bg-white/20 px-2 py-0.5 rounded-full">{{ store.state.wordOfTheDay.level }}</span>
        </div>
        <p class="text-white/90 text-sm leading-relaxed">{{ store.state.wordOfTheDay.translation }}</p>
        <div v-if="store.state.wordOfTheDay.mnemonic" class="mt-3 text-xs text-white/70 leading-relaxed bg-white/10 rounded-lg p-3">
          💡 {{ store.state.wordOfTheDay.mnemonic.split('\n')[0] }}
        </div>
      </div>

      <!-- 搜索 + 筛选区 -->
      <div class="sticky top-[60px] z-40 bg-[#f8faf9] pb-4 pt-2 space-y-3">
        <SearchBar v-model="searchText" />

        <!-- 手机端：折叠按钮 -->
        <div class="md:hidden">
          <button
            @click="showFilters = !showFilters"
            class="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm cursor-pointer"
          >
            <div class="flex items-center gap-2">
              <span class="text-gray-500">🔽 筛选</span>
              <!-- 激活的筛选标签 -->
              <span v-if="activeFilterTags.length" class="flex items-center gap-1 flex-wrap">
                <span v-for="tag in activeFilterTags" :key="tag" class="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">{{ tag }}</span>
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400">{{ store.state.filteredWords.length }} 词</span>
              <span class="text-gray-400 text-xs">{{ showFilters ? '▲' : '▼' }}</span>
            </div>
          </button>
        </div>

        <!-- 筛选按钮组：手机端折叠，桌面端始终显示 -->
        <div :class="[showFilters ? 'block' : 'hidden', 'md:block']">
          <div class="flex flex-wrap items-center gap-3">
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
            <div class="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <!-- 收藏筛选按钮 -->
            <button
              @click="store.toggleShowFavorites()"
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border',
                store.state.showFavoritesOnly
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              ]"
            >
              ⭐ 收藏 <span class="opacity-70">{{ store.state.favorites.size }}</span>
            </button>
          </div>
        </div>

        <!-- 词条数（桌面端显示） -->
        <div class="hidden md:block text-xs text-gray-400">
          共 {{ store.state.filteredWords.length }} 个词条
          <span v-if="store.state.showFavoritesOnly" class="text-yellow-600">（仅显示收藏）</span>
        </div>
      </div>

      <!-- 词条列表 -->
      <div v-if="store.state.filteredWords.length === 0" class="text-center py-16">
        <p class="text-6xl mb-4">{{ store.state.showFavoritesOnly ? '⭐' : '🔍' }}</p>
        <p class="text-gray-400">{{ store.state.showFavoritesOnly ? '还没有收藏的词条，点击词条右上角 ☆ 收藏' : '没有找到匹配的词条' }}</p>
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
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import store from '../store/dictionary.js'
import SearchBar from '../components/SearchBar.vue'
import LevelFilter from '../components/LevelFilter.vue'
import PosFilter from '../components/PosFilter.vue'
import WordCard from '../components/WordCard.vue'

const searchText = ref(store.state.searchQuery)
const pageSize = 20
const currentPage = ref(1)
const showFilters = ref(false)

const todayDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
})

// 手机端折叠时显示的激活筛选标签
const activeFilterTags = computed(() => {
  const tags = []
  if (store.state.selectedLevels.length < 4) {
    tags.push(...store.state.selectedLevels)
  }
  if (store.state.selectedPos !== '') {
    const posNames = { 'v.': '动词', 's.': '名词', 'agg.': '形容词', 'avv.': '副词' }
    tags.push(posNames[store.state.selectedPos] || store.state.selectedPos)
  }
  if (store.state.showFavoritesOnly) {
    tags.push('⭐ 收藏')
  }
  return tags
})

let debounceTimer = null
watch(searchText, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    store.setSearch(val)
    currentPage.value = 1
  }, 200)
})

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
})

watch(() => [...store.state.selectedLevels, store.state.selectedPos, store.state.showFavoritesOnly], () => {
  currentPage.value = 1
})

const displayedWords = computed(() => {
  return store.state.filteredWords.slice(0, currentPage.value * pageSize)
})

function loadMore() {
  currentPage.value++
}
</script>

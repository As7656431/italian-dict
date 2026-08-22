import { reactive, markRaw } from 'vue'
import Fuse from 'fuse.js'

const FAVORITES_KEY = 'italian-dict-favorites'

const state = reactive({
  allWords: [],
  filteredWords: [],
  loading: true,
  error: null,
  searchQuery: '',
  selectedLevels: ['A1', 'A2', 'B1', 'B2'],
  selectedPos: 'all',
  showFavoritesOnly: false,
  totalByLevel: { A1: 0, A2: 0, B1: 0, B2: 0 },
  favorites: new Set(),
  wordOfTheDay: null,
})

let fuse = null
let allWordsRaw = []

// ========== 收藏功能 ==========
function loadFavorites() {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY)
    if (saved) {
      state.favorites = new Set(JSON.parse(saved))
    }
  } catch (e) {
    console.warn('Failed to load favorites:', e)
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...state.favorites]))
  } catch (e) {
    console.warn('Failed to save favorites:', e)
  }
}

function toggleFavorite(word) {
  if (state.favorites.has(word)) {
    state.favorites.delete(word)
  } else {
    state.favorites.add(word)
  }
  // 触发响应式更新
  state.favorites = new Set(state.favorites)
  saveFavorites()
  if (state.showFavoritesOnly) {
    applyFilters()
  }
}

function isFavorite(word) {
  return state.favorites.has(word)
}

function toggleShowFavorites() {
  state.showFavoritesOnly = !state.showFavoritesOnly
  applyFilters()
}

// ========== 今日一词 ==========
function pickWordOfTheDay() {
  if (allWordsRaw.length === 0) return
  // 基于日期的稳定随机（同一天返回同一个词）
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const index = seed % allWordsRaw.length
  state.wordOfTheDay = allWordsRaw[index]
}

// ========== 词性分类 ==========
function getPosCategory(pos) {
  if (!pos) return 'other'
  const p = pos.toLowerCase()
  if (p.startsWith('v')) return 'v'
  if (p.startsWith('s')) return 's'
  if (p.startsWith('agg')) return 'agg'
  if (p.startsWith('avv')) return 'avv'
  return 'other'
}

// ========== 数据加载 ==========
async function loadDictionary() {
  state.loading = true
  state.error = null
  loadFavorites()
  try {
    const baseUrl = import.meta.env.BASE_URL || '/'
    const res = await fetch(`${baseUrl}data/all_words.json`)
    if (!res.ok) {
      throw new Error(`无法获取词典数据 (HTTP ${res.status})`)
    }
    const data = await res.json()
    allWordsRaw = markRaw(data)

    state.totalByLevel = { A1: 0, A2: 0, B1: 0, B2: 0 }
    allWordsRaw.forEach(w => {
      if (state.totalByLevel[w.level] !== undefined) {
        state.totalByLevel[w.level]++
      }
    })

    fuse = new Fuse(allWordsRaw, {
      keys: [
        { name: 'word', weight: 3 },
        { name: 'translation', weight: 2 },
        { name: 'definition_it', weight: 1 },
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 1,
    })

    state.allWords = allWordsRaw
    pickWordOfTheDay()
    applyFilters()
  } catch (err) {
    console.error('Failed to load dictionary data:', err)
    state.error = err.message || '词典加载失败，请检查网络连接'
  } finally {
    state.loading = false
  }
}

// ========== 筛选 ==========
function applyFilters() {
  let results = allWordsRaw

  if (state.searchQuery.trim() && fuse) {
    const fuseResults = fuse.search(state.searchQuery.trim())
    results = fuseResults.map(r => r.item)
  }

  if (state.selectedLevels.length < 4) {
    results = results.filter(w => state.selectedLevels.includes(w.level))
  }

  if (state.selectedPos !== 'all') {
    results = results.filter(w => getPosCategory(w.pos) === state.selectedPos)
  }

  if (state.showFavoritesOnly) {
    results = results.filter(w => state.favorites.has(w.word))
  }

  state.filteredWords = markRaw(results)
}

function setSearch(query) {
  state.searchQuery = query
  applyFilters()
}

function toggleLevel(level) {
  const idx = state.selectedLevels.indexOf(level)
  if (idx >= 0) {
    if (state.selectedLevels.length > 1) {
      state.selectedLevels.splice(idx, 1)
    }
  } else {
    state.selectedLevels.push(level)
  }
  applyFilters()
}

function setPos(pos) {
  state.selectedPos = pos
  applyFilters()
}

function getWordByName(wordName) {
  if (!wordName || !allWordsRaw.length) return null
  const target = wordName.trim().toLowerCase()
  return allWordsRaw.find(w => w.word.toLowerCase() === target)
}

function getRandomWord() {
  if (allWordsRaw.length === 0) return null
  return allWordsRaw[Math.floor(Math.random() * allWordsRaw.length)]
}

export default {
  state,
  loadDictionary,
  setSearch,
  toggleLevel,
  setPos,
  getWordByName,
  getRandomWord,
  getPosCategory,
  applyFilters,
  toggleFavorite,
  isFavorite,
  toggleShowFavorites,
}

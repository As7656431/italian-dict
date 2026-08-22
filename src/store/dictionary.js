import { reactive, markRaw } from 'vue'
import Fuse from 'fuse.js'

const state = reactive({
  allWords: [],
  filteredWords: [],
  loading: true,
  error: null,
  searchQuery: '',
  selectedLevels: ['A1', 'A2', 'B1', 'B2'],
  selectedPos: 'all', // 'all' | 'v' | 's' | 'agg' | 'avv' | 'other'
  totalByLevel: { A1: 0, A2: 0, B1: 0, B2: 0 },
})

let fuse = null
let allWordsRaw = []

function getPosCategory(pos) {
  if (!pos) return 'other'
  const p = pos.toLowerCase()
  if (p.startsWith('v')) return 'v'
  if (p.startsWith('s')) return 's'
  if (p.startsWith('agg')) return 'agg'
  if (p.startsWith('avv')) return 'avv'
  return 'other'
}

async function loadDictionary() {
  state.loading = true
  state.error = null
  try {
    const baseUrl = import.meta.env.BASE_URL || '/'
    const res = await fetch(`${baseUrl}data/all_words.json`)
    if (!res.ok) {
      throw new Error(`无法获取词典数据 (HTTP ${res.status})`)
    }
    const data = await res.json()
    // 使用 markRaw 避免 Vue 对 5.7MB 数据做深度响应式代理
    allWordsRaw = markRaw(data)

    // 重置并统计各级别词数
    state.totalByLevel = { A1: 0, A2: 0, B1: 0, B2: 0 }
    allWordsRaw.forEach(w => {
      if (state.totalByLevel[w.level] !== undefined) {
        state.totalByLevel[w.level]++
      }
    })

    // 初始化 Fuse 模糊搜索
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
    applyFilters()
  } catch (err) {
    console.error('Failed to load dictionary data:', err)
    state.error = err.message || '词典加载失败，请检查网络连接'
  } finally {
    state.loading = false
  }
}

function applyFilters() {
  let results = allWordsRaw

  // 搜索过滤（加空指针防护）
  if (state.searchQuery.trim() && fuse) {
    const fuseResults = fuse.search(state.searchQuery.trim())
    results = fuseResults.map(r => r.item)
  }

  // 级别过滤
  if (state.selectedLevels.length < 4) {
    results = results.filter(w => state.selectedLevels.includes(w.level))
  }

  // 词性过滤
  if (state.selectedPos !== 'all') {
    results = results.filter(w => getPosCategory(w.pos) === state.selectedPos)
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
}

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
    <!-- 卡片头部 -->
    <div :class="['px-5 py-4', levelGradient]">
      <div class="flex items-baseline flex-wrap gap-x-3 gap-y-1">
        <router-link :to="`/word/${encodeURIComponent(word.word)}`" class="text-2xl font-bold text-white no-underline hover:underline" lang="it">
          {{ word.word }}
        </router-link>
        <span class="text-white/70 text-sm" lang="it">{{ word.ipa }}</span>
        <span class="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{{ word.pos }}</span>
        <span class="text-xs font-bold bg-white text-gray-700 px-2 py-0.5 rounded-full">{{ word.level }}</span>
        <!-- 收藏按钮 -->
        <button
          @click.prevent="store.toggleFavorite(word.word)"
          :aria-label="store.isFavorite(word.word) ? '取消收藏' : '收藏'"
          class="ml-auto text-lg cursor-pointer bg-transparent border-none p-1 transition-transform hover:scale-125"
        >
          {{ store.isFavorite(word.word) ? '⭐' : '☆' }}
        </button>
      </div>
      <p class="text-white/90 text-sm mt-2 leading-relaxed">{{ word.translation }}</p>
    </div>

    <!-- 卡片主体 -->
    <div class="px-5 py-4 space-y-4">
      <!-- 意大利语释义 -->
      <div v-if="word.definition_it">
        <p class="text-xs text-gray-400 italic leading-relaxed" lang="it">{{ word.definition_it }}</p>
      </div>

      <!-- 构词拆解 -->
      <div v-if="word.roots && word.roots.parts">
        <SectionTitle icon="🧩" title="构词拆解" />
        <MorphemeBreakdown :roots="word.roots" />
      </div>

      <!-- 例句 -->
      <div v-if="word.examples && word.examples.length">
        <SectionTitle icon="💬" title="双语例句" />
        <ExampleList :examples="word.examples" />
      </div>

      <!-- 助记 -->
      <div v-if="word.mnemonic">
        <SectionTitle icon="💡" title="记忆技巧" />
        <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 leading-relaxed whitespace-pre-line">
          {{ word.mnemonic }}
        </div>
      </div>

      <!-- 动词变位 -->
      <div v-if="word.conjugation">
        <button @click="showConj = !showConj" :aria-expanded="showConj" class="w-full cursor-pointer bg-transparent border-none p-0">
          <SectionTitle icon="📐" title="动词变位" :collapsible="true" :open="showConj" />
        </button>
        <ConjugationTable v-if="showConj" :conjugation="word.conjugation" />
      </div>

      <!-- 搭配 + 近反义词 -->
      <div v-if="word.collocations || word.synonyms || word.antonyms">
        <div v-if="word.collocations && word.collocations.length" class="mb-3">
          <SectionTitle icon="🔗" title="高频搭配" />
          <div class="flex flex-wrap gap-1.5">
            <span v-for="c in word.collocations" :key="c" class="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600" lang="it">{{ c }}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <span v-for="s in (word.synonyms || [])" :key="'s'+s" class="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700" lang="it">≈ {{ s }}</span>
          <span v-for="a in (word.antonyms || [])" :key="'a'+a" class="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700" lang="it">⇋ {{ a }}</span>
        </div>
      </div>

      <!-- 派生词族 -->
      <div v-if="word.related && word.related.length">
        <button @click="showRelated = !showRelated" :aria-expanded="showRelated" class="w-full cursor-pointer bg-transparent border-none p-0">
          <SectionTitle icon="🌿" title="派生词族" :collapsible="true" :open="showRelated" />
        </button>
        <div v-if="showRelated" class="space-y-1">
          <div v-for="r in word.related" :key="r.word" class="flex items-baseline gap-2 text-sm">
            <router-link :to="`/word/${encodeURIComponent(r.word)}`" class="font-semibold text-emerald-700 hover:underline no-underline" lang="it">{{ r.word }}</router-link>
            <span class="text-xs text-gray-400">{{ r.pos }}</span>
            <span class="text-gray-500">{{ r.meaning }}</span>
          </div>
        </div>
      </div>

      <!-- 用法注意 -->
      <div v-if="word.usage_notes">
        <button @click="showUsage = !showUsage" :aria-expanded="showUsage" class="w-full cursor-pointer bg-transparent border-none p-0">
          <SectionTitle icon="📝" title="用法注意" :collapsible="true" :open="showUsage" />
        </button>
        <p v-if="showUsage" class="text-sm text-gray-500 leading-relaxed">{{ word.usage_notes }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import store from '../store/dictionary.js'
import MorphemeBreakdown from './MorphemeBreakdown.vue'
import ExampleList from './ExampleList.vue'
import ConjugationTable from './ConjugationTable.vue'
import SectionTitle from './SectionTitle.vue'

const props = defineProps({
  word: { type: Object, required: true },
})

const showConj = ref(false)
const showRelated = ref(false)
const showUsage = ref(false)

const levelGradient = computed(() => {
  const gradients = {
    A1: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
    A2: 'bg-gradient-to-r from-sky-600 to-sky-500',
    B1: 'bg-gradient-to-r from-amber-600 to-amber-500',
    B2: 'bg-gradient-to-r from-purple-600 to-purple-500',
  }
  return gradients[props.word.level] || gradients.A1
})
</script>

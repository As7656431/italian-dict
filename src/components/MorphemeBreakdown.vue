<template>
  <div class="bg-[#f0fdf4] border border-emerald-200 rounded-xl p-4">
    <!-- 拆解展示 -->
    <div class="text-xl font-semibold text-emerald-800 tracking-wider mb-3" lang="it">
      <template v-for="(part, i) in roots.parts" :key="i">
        <span :class="partColors[i % partColors.length]">{{ part.part }}</span>
        <span v-if="i < roots.parts.length - 1" class="text-emerald-300 mx-0.5">-</span>
      </template>
    </div>
    <ul class="space-y-1.5">
      <li v-for="(part, i) in roots.parts" :key="i" class="flex items-start gap-2 text-sm">
        <span :class="['font-mono font-bold px-2 py-0.5 rounded text-xs whitespace-nowrap', partBgColors[i % partBgColors.length]]">
          {{ part.part }}
        </span>
        <span class="text-gray-700">{{ part.meaning }}</span>
      </li>
    </ul>

    <!-- 英语同源词（安全文本渲染，不用 v-html） -->
    <div v-if="cognateWords.length" class="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
      <div class="text-xs font-semibold text-blue-700 mb-1">🔗 英语同源词</div>
      <div class="text-sm text-blue-800">
        <template v-for="(word, i) in cognateWords" :key="i">
          <span class="font-semibold bg-blue-100 px-1 rounded" lang="en">{{ word }}</span>
          <span v-if="i < cognateWords.length - 1" class="mx-1">·</span>
        </template>
      </div>
    </div>

    <!-- 拉丁语折叠 -->
    <button
      v-if="roots.explanation"
      @click="showLatin = !showLatin"
      :aria-expanded="showLatin"
      class="mt-2 text-xs text-gray-400 hover:text-gray-500 cursor-pointer bg-transparent border-none p-0"
    >
      📜 {{ showLatin ? '收起' : '查看' }}拉丁语词源 {{ showLatin ? '▾' : '▸' }}
    </button>
    <div v-if="showLatin && roots.explanation" class="mt-2 text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-lg p-3 border border-dashed border-gray-200">
      {{ roots.explanation }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  roots: { type: Object, required: true },
})

const showLatin = ref(false)

const partColors = ['text-emerald-700', 'text-sky-700', 'text-purple-700', 'text-amber-700']
const partBgColors = ['bg-emerald-100 text-emerald-700', 'bg-sky-100 text-sky-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700']

// 安全提取英语同源词（纯文本，不用 v-html）
const cognateWords = computed(() => {
  if (!props.roots.explanation) return []
  const exp = props.roots.explanation
  // 匹配常见英语词（3个字母以上的拉丁字母词）
  const matches = exp.match(/\b[a-zA-Z]{3,}\b/g)
  if (!matches) return []
  // 过滤掉常见非英语词和拉丁语标记词
  const exclude = new Set(['the', 'and', 'from', 'via', 'etc', 'con', 'per', 'che', 'del', 'non', 'una', 'sono', 'lat', 'hab', 'tion', 'ment'])
  return [...new Set(matches.filter(w => !exclude.has(w.toLowerCase()) && w.length >= 4))].slice(0, 6)
})
</script>

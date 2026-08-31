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

    <!-- 构词说明折叠 -->
    <button
      v-if="roots.explanation"
      @click="showExplanation = !showExplanation"
      :aria-expanded="showExplanation"
      class="mt-2 text-xs text-gray-400 hover:text-gray-500 cursor-pointer bg-transparent border-none p-0"
    >
      📜 {{ showExplanation ? '收起' : '查看' }}构词说明 {{ showExplanation ? '▾' : '▸' }}
    </button>
    <div v-if="showExplanation && roots.explanation" class="mt-2 text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-lg p-3 border border-dashed border-gray-200">
      {{ roots.explanation }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  roots: { type: Object, required: true },
})

const showExplanation = ref(false)

const partColors = ['text-emerald-700', 'text-sky-700', 'text-purple-700', 'text-amber-700']
const partBgColors = ['bg-emerald-100 text-emerald-700', 'bg-sky-100 text-sky-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700']

// 英语同源词直接取 v2 数据字段（纯文本渲染，不用 v-html）
const cognateWords = computed(() => {
  const list = props.roots.cognates
  return Array.isArray(list) ? list.filter(w => typeof w === 'string' && w.trim()) : []
})
</script>

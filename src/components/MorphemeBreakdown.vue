<template>
  <div class="bg-[#f0fdf4] border border-emerald-200 rounded-xl p-4">
    <!-- 拆解展示 -->
    <div class="text-xl font-semibold text-emerald-800 tracking-wider mb-3">
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

    <!-- 英语同源词 -->
    <div v-if="englishCognates" class="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
      <div class="text-xs font-semibold text-blue-700 mb-1">🔗 英语同源词</div>
      <div class="text-sm text-blue-800" v-html="englishCognates"></div>
    </div>

    <!-- 拉丁语折叠 -->
    <button
      v-if="latinExplanation"
      @click="showLatin = !showLatin"
      class="mt-2 text-xs text-gray-400 hover:text-gray-500 cursor-pointer bg-transparent border-none p-0"
    >
      📜 {{ showLatin ? '收起' : '查看' }}拉丁语词源 {{ showLatin ? '▾' : '▸' }}
    </button>
    <div v-if="showLatin && latinExplanation" class="mt-2 text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-lg p-3 border border-dashed border-gray-200">
      {{ latinExplanation }}
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

const englishCognates = computed(() => {
  if (!props.roots.explanation) return ''
  // 提取英语同源词部分
  const exp = props.roots.explanation
  const engMatch = exp.match(/(?:与英语|英语|English)[^。]*同源[^。]*/i)
    || exp.match(/(?:与英语|英语)\s*(.+?)(?:同源|cognate)/i)
  if (engMatch) {
    // 高亮英语单词
    return engMatch[0].replace(/([a-zA-Z]{3,})/g, '<em class="not-italic font-semibold bg-blue-100 px-1 rounded">$1</em>')
  }
  // 尝试提取括号中的英语词
  const words = exp.match(/\b[A-Z]?[a-z]{3,}(?:tion|ment|ness|able|ible|ive|ous|al|ance|ence|ful|less|ly|er|or|ate|ize|ise|ure|ary|ory)\b/g)
  if (words && words.length > 0) {
    return words.map(w => `<em class="not-italic font-semibold bg-blue-100 px-1 rounded">${w}</em>`).join(' · ')
  }
  return ''
})

const latinExplanation = computed(() => {
  if (!props.roots.explanation) return ''
  return props.roots.explanation
})
</script>

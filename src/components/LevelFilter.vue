<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="level in levels"
      :key="level"
      @click="$emit('toggle', level)"
      :class="[
        'px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer border',
        selected.includes(level)
          ? levelColors[level].active
          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
      ]"
    >
      {{ level }}
      <span class="ml-1 text-xs opacity-70">{{ counts[level] || 0 }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  selected: { type: Array, default: () => [] },
  counts: { type: Object, default: () => ({}) },
})
defineEmits(['toggle'])

const levels = ['A1', 'A2', 'B1', 'B2']
const levelColors = {
  A1: { active: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  A2: { active: 'bg-sky-100 text-sky-800 border-sky-300' },
  B1: { active: 'bg-amber-100 text-amber-800 border-amber-300' },
  B2: { active: 'bg-purple-100 text-purple-800 border-purple-300' },
}
</script>

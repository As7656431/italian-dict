<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="opt in options"
      :key="opt.value"
      @click="$emit('select', opt.value)"
      :class="[
        'px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border',
        selected === opt.value
          ? 'bg-gray-800 text-white border-gray-800'
          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
      ]"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  selected: { type: String, default: 'all' },
})
defineEmits(['select'])

const options = [
  { value: 'all', label: '全部' },
  { value: 'v', label: '🔵 动词' },
  { value: 's', label: '🟢 名词' },
  { value: 'agg', label: '🟠 形容词' },
  { value: 'avv', label: '🟣 副词' },
  { value: 'other', label: '⚪ 其他' },
]
</script>

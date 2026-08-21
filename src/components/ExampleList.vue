<template>
  <div class="space-y-3">
    <div v-for="(ex, i) in examples" :key="i" class="pl-3 border-l-3 border-emerald-300">
      <p class="text-sm text-gray-800 italic leading-relaxed">{{ ex.it }}</p>
      <p class="text-sm text-gray-500 mt-0.5">{{ ex.zh }}</p>
      <span v-if="ex.note" class="inline-block mt-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
        📌 {{ ex.note }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  examples: { type: Array, required: true },
})
</script>

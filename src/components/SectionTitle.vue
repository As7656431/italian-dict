<template>
  <div class="flex items-center gap-1.5 mb-2">
    <span class="text-base">{{ icon }}</span>
    <span class="text-xs font-bold text-[#2d6a4f] uppercase tracking-widest">{{ title }}</span>
    <span v-if="collapsible" class="text-xs text-gray-400 ml-auto">{{ open ? '▾' : '▸' }}</span>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  title: String,
  collapsible: { type: Boolean, default: false },
  open: { type: Boolean, default: false },
})
</script>

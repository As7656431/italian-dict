<template>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      placeholder="搜索意大利语单词或中文释义..."
      class="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40916c] focus:border-transparent text-base transition-all"
    />
    <button
      v-if="modelValue"
      @click="$emit('update:modelValue', '')"
      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({ modelValue: String })
defineEmits(['update:modelValue'])
</script>

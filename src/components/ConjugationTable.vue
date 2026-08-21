<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm border-collapse">
      <thead>
        <tr>
          <th class="text-left py-1.5 px-2 text-xs text-gray-400 font-semibold bg-gray-50 rounded-tl-lg" colspan="2">Presente 现在时</th>
          <th class="text-left py-1.5 px-2 text-xs text-gray-400 font-semibold bg-gray-50 rounded-tr-lg" colspan="2">其他时态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in tableRows" :key="i" class="border-t border-gray-100">
          <td class="py-1 px-2 text-xs text-gray-400 w-16">{{ row.person }}</td>
          <td class="py-1 px-2 font-medium">{{ row.form }}</td>
          <td class="py-1 px-2 text-xs text-gray-400" v-if="row.tenseLabel">{{ row.tenseLabel }}</td>
          <td class="py-1 px-2 font-medium" v-if="row.tenseForm">{{ row.tenseForm }}</td>
          <td v-if="!row.tenseLabel" colspan="2"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  conjugation: { type: Object, required: true },
})

const persons = ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro']
const tenses = [
  { key: 'passato_prossimo', label: '近过去时' },
  { key: 'imperfetto', label: '未完成时' },
  { key: 'futuro', label: '将来时' },
]

const tableRows = computed(() => {
  const presente = props.conjugation.presente || {}
  return persons.map((p, i) => ({
    person: p,
    form: presente[p] || '-',
    tenseLabel: tenses[i] ? tenses[i].label : '',
    tenseForm: tenses[i] ? (props.conjugation[tenses[i].key] || '-') : '',
  }))
})
</script>

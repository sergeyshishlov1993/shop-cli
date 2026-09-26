<script setup lang="ts">
interface TabItem {
  key: string | number
  label: string
  disabled?: boolean
  count?: number
}

interface Props {
  modelValue: string | number
  tabs: TabItem[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <div v-drag-scroll class="flex gap-6 overflow-x-auto border-b border-secondary-200 scrollbar-none" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-selected="tab.key === modelValue"
      :disabled="tab.disabled"
      class="relative shrink-0 whitespace-nowrap pb-3 pt-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      :class="tab.key === modelValue ? 'text-secondary-900' : 'text-secondary-500 hover:text-secondary-800'"
      @click="emit('update:modelValue', tab.key)"
    >
      {{ tab.label }}
      <span v-if="tab.count !== undefined" class="ml-1.5 text-secondary-400">
        {{ tab.count }}
      </span>
      <span
        v-if="tab.key === modelValue"
        class="absolute inset-x-0 -bottom-px h-px bg-secondary-900"
      />
    </button>
  </div>
</template>

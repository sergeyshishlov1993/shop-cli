<script setup lang="ts">
interface Tab {
  key: string | number
  label: string
  disabled?: boolean
  count?: number
}

interface Props {
  modelValue: string | number
  tabs: Tab[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function selectTab(tab: Tab) {
  if (tab.disabled) return
  emit('update:modelValue', tab.key)
}
</script>

<template>
  <div class="border-b border-secondary-200">
    <div class="-mb-px flex gap-1 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :disabled="tab.disabled"
        class="relative shrink-0 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
        :class="[
          modelValue === tab.key
            ? 'border-b-2 border-primary-600 text-primary-700'
            : tab.disabled
              ? 'cursor-not-allowed text-secondary-300'
              : 'text-secondary-500 hover:text-secondary-700 hover:border-b-2 hover:border-secondary-300',
        ]"
        @click="selectTab(tab)"
      >
        {{ tab.label }}

        <span
          v-if="tab.count !== undefined"
          class="ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium"
          :class="
            modelValue === tab.key
              ? 'bg-primary-100 text-primary-700'
              : 'bg-secondary-100 text-secondary-500'
          "
        >
          {{ tab.count }}
        </span>
      </button>
    </div>
  </div>
</template>

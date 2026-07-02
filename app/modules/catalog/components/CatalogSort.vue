<script setup lang="ts">
import type { SortOption } from './CatalogFiltersContent.vue'

interface SortOptionItem {
  value: SortOption
  label: string
}

const props = defineProps<{
  modelValue: SortOption | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SortOption]
}>()

const sortOptions: SortOptionItem[] = [
  { value: 'newest', label: 'За новизною' },
  { value: 'price_asc', label: 'Ціна ↑' },
  { value: 'price_desc', label: 'Ціна ↓' },
]

const selectedSort = computed<SortOption>({
  get: () => props.modelValue ?? 'newest',
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <div class="catalog-sort">
    <div class="hidden md:flex items-center gap-2">
      <span class="text-sm text-gray-600">Сортувати:</span>
      <div class="flex gap-2">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          type="button"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            selectedSort === option.value
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          ]"
          @click="selectedSort = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="md:hidden">
      <BSelect
        v-model="selectedSort"
        :options="sortOptions"
        label="Сортування"
      />
    </div>
  </div>
</template>

<style scoped>
.catalog-sort {
  @apply w-full;
}
</style>

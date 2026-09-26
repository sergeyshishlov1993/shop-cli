<script setup lang="ts">
import type { SortOption } from './CatalogFiltersContent.vue'

interface MobileSortOptionItem {
  value: SortOption | ''
  label: string
  icon: string
}

const props = defineProps<{
  modelValue: SortOption | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SortOption | undefined]
}>()

const mobileSortOptions: MobileSortOptionItem[] = [
  { value: '', label: 'За популярністю', icon: 'lucide:arrow-up-down' },
  { value: 'newest', label: 'Новинки', icon: 'lucide:calendar-days' },
  { value: 'price_asc', label: 'Дешевші', icon: 'lucide:arrow-down-narrow-wide' },
  { value: 'price_desc', label: 'Дорожчі', icon: 'lucide:arrow-up-wide-narrow' },
  { value: 'name_asc', label: 'За назвою', icon: 'lucide:arrow-down-a-z' },
]

const mobileSelectedSort = computed<SortOption | ''>({
  get: () => props.modelValue ?? '',
  set: (value) => emit('update:modelValue', value === '' ? undefined : value),
})

const activeMobileSortOption = computed(() =>
  mobileSortOptions.find(option => option.value === mobileSelectedSort.value) ?? mobileSortOptions[0]!,
)
</script>

<template>
  <div class="catalog-sort">
    <!-- Один випадаючий сортер для всіх ширин -->
    <div class="w-full lg:w-60">
      <BSelect
        v-model="mobileSelectedSort"
        :options="mobileSortOptions"
        placeholder="За популярністю"
      >
        <template #value>
          <span class="flex min-w-0 items-center justify-between gap-3">
            <span class="truncate">{{ activeMobileSortOption.label }}</span>
            <Icon
              :name="activeMobileSortOption.icon"
              size="20"
              class="shrink-0 text-secondary-900"
            />
          </span>
        </template>

        <template #option="{ option }">
          <span class="flex min-w-0 items-center gap-3">
            <Icon
              :name="option.icon"
              size="18"
              class="shrink-0 text-secondary-500"
            />
            <span class="truncate">{{ option.label }}</span>
          </span>
        </template>

        <template #dropdownicon>
          <span class="hidden" />
        </template>
      </BSelect>
    </div>
  </div>
</template>

<style scoped>
.catalog-sort {
  @apply w-full;
}

.catalog-sort :deep(.p-select-label) {
  width: 100%;
}

.catalog-sort :deep(.p-select-dropdown) {
  display: none;
}
</style>

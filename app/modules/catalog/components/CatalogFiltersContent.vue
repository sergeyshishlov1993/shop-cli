<script setup lang="ts">
export type SortOption = 'newest' | 'price_asc' | 'price_desc'

export interface CatalogAvailableFilters {
  priceRange: { min: number; max: number } | null
  colors: { id: number; name: string; hexCode: string | null; count: number }[]
  sizes: { id: number; name: string; count: number }[]
  brands: { value: string; count: number }[]
  seasons: { value: string; count: number }[]
  materials: { value: string; count: number }[]
}

export interface CatalogFilterState {
  sort: SortOption
  priceMin: number | null
  priceMax: number | null
  isNew: boolean
  isHit: boolean
  isSeasonal: boolean
  colors: number[]
  sizes: number[]
  brands: string[]
}

interface SortOptionItem {
  value: SortOption
  label: string
}

interface PriceRangeValue {
  min: number
  max: number
}

interface AccordionItem {
  key: string
  title: string
}

const SORT_OPTIONS: readonly SortOptionItem[] = [
  { value: 'newest', label: 'Новинки' },
  { value: 'price_asc', label: 'Ціна за зростанням' },
  { value: 'price_desc', label: 'Ціна за спаданням' },
] as const

const props = defineProps<{
  modelValue: CatalogFilterState
  filtersData: CatalogAvailableFilters
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: CatalogFilterState): void
}>()

const state = reactive<CatalogFilterState>({
  sort: props.modelValue.sort,
  priceMin: props.modelValue.priceMin,
  priceMax: props.modelValue.priceMax,
  isNew: props.modelValue.isNew,
  isHit: props.modelValue.isHit,
  isSeasonal: props.modelValue.isSeasonal,
  colors: [...props.modelValue.colors],
  sizes: [...props.modelValue.sizes],
  brands: [...props.modelValue.brands],
})

watch(
    () => props.modelValue,
    (next: CatalogFilterState) => {
      state.sort = next.sort
      state.priceMin = next.priceMin
      state.priceMax = next.priceMax
      state.isNew = next.isNew
      state.isHit = next.isHit
      state.isSeasonal = next.isSeasonal
      state.colors.splice(0, state.colors.length, ...next.colors)
      state.sizes.splice(0, state.sizes.length, ...next.sizes)
      state.brands.splice(0, state.brands.length, ...next.brands)
    },
    { deep: true },
)

watch(
    state,
    () => {
      emit('update:modelValue', {
        sort: state.sort,
        priceMin: state.priceMin,
        priceMax: state.priceMax,
        isNew: state.isNew,
        isHit: state.isHit,
        isSeasonal: state.isSeasonal,
        colors: [...state.colors],
        sizes: [...state.sizes],
        brands: [...state.brands],
      })
    },
    { deep: true },
)

const defaultPriceMin = computed<number>(() => props.filtersData.priceRange?.min ?? 0)
const defaultPriceMax = computed<number>(() => props.filtersData.priceRange?.max ?? 0)

const priceRangeModel = computed<PriceRangeValue>({
  get: () => ({
    min: state.priceMin ?? defaultPriceMin.value,
    max: state.priceMax ?? defaultPriceMax.value,
  }),
  set: (value: PriceRangeValue) => {
    state.priceMin = value.min === defaultPriceMin.value ? null : value.min
    state.priceMax = value.max === defaultPriceMax.value ? null : value.max
  },
})

const accordionItems = computed<AccordionItem[]>(() => {
  const items: AccordionItem[] = [
    { key: 'sort', title: 'Сортування' },
  ]

  if (props.filtersData.sizes.length) {
    items.push({ key: 'sizes', title: 'Розмір' })
  }

  if (props.filtersData.colors.length) {
    items.push({ key: 'colors', title: 'Колір' })
  }

  if (props.filtersData.brands.length) {
    items.push({ key: 'brands', title: 'Бренди' })
  }

  if (props.filtersData.priceRange) {
    items.push({ key: 'price', title: 'Ціна' })
  }

  return items
})

const toggleNumberItem = (key: 'colors' | 'sizes', value: number): void => {
  const collection = state[key]
  const index = collection.indexOf(value)

  if (index === -1) {
    collection.push(value)
    return
  }

  collection.splice(index, 1)
}

const toggleStringItem = (key: 'brands', value: string): void => {
  const collection = state[key]
  const index = collection.indexOf(value)

  if (index === -1) {
    collection.push(value)
    return
  }

  collection.splice(index, 1)
}

const isNumberSelected = (key: 'colors' | 'sizes', value: number): boolean => state[key].includes(value)
const isStringSelected = (key: 'brands', value: string): boolean => state[key].includes(value)
</script>

<template>
  <BAccordion :items="accordionItems" multiple>
    <template #item="{ item }">
      <template v-if="item.key === 'sort'">
        <div class="flex gap-2.5 overflow-x-auto scrollbar-none">
          <button
              v-for="option in SORT_OPTIONS"
              :key="option.value"
              type="button"
              class="inline-flex shrink-0 items-center justify-center rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors"
              :class="[
              state.sort === option.value
                ? 'border-primary-200 bg-primary-100 text-primary-700'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
            ]"
              @click="state.sort = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </template>

      <template v-else-if="item.key === 'sizes'">
        <div class="flex flex-wrap gap-2.5">
          <button
              v-for="size in filtersData.sizes"
              :key="size.id"
              type="button"
              class="inline-flex min-w-[2.75rem] items-center justify-center rounded-full border px-3.5 py-2 text-sm font-medium transition-colors"
              :class="[
              isNumberSelected('sizes', size.id)
                ? 'border-primary-200 bg-primary-100 text-primary-700'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
            ]"
              @click="toggleNumberItem('sizes', size.id)"
          >
            {{ size.name }}
          </button>
        </div>
      </template>

      <template v-else-if="item.key === 'colors'">
        <div class="flex gap-2.5 overflow-x-auto scrollbar-none">
          <button
              v-for="color in filtersData.colors"
              :key="color.id"
              type="button"
              class="inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors"
              :class="[
              isNumberSelected('colors', color.id)
                ? 'border-primary-200 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
            ]"
              @click="toggleNumberItem('colors', color.id)"
          >
            <span
                class="size-3 flex-none rounded-full border border-black/10"
                :style="{ backgroundColor: color.hexCode || '#ffffff' }"
            />
            {{ color.name }}
          </button>
        </div>
      </template>

      <template v-else-if="item.key === 'brands'">
        <div class="flex flex-wrap gap-2.5">
          <button
              v-for="brand in filtersData.brands"
              :key="brand.value"
              type="button"
              class="inline-flex min-w-0 max-w-full items-center justify-center rounded-full border px-3.5 py-2 text-sm font-medium transition-colors"
              :class="[
              isStringSelected('brands', brand.value)
                ? 'border-primary-200 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
            ]"
              @click="toggleStringItem('brands', brand.value)"
          >
            <span class="truncate">{{ brand.value }}</span>
          </button>
        </div>
      </template>

      <template v-else-if="item.key === 'price'">
        <div class="flex flex-col gap-4">
          <BPriceRange
              v-if="filtersData.priceRange"
              v-model="priceRangeModel"
              :min="filtersData.priceRange.min"
              :max="filtersData.priceRange.max"
          />
        </div>
      </template>
    </template>
  </BAccordion>
</template>

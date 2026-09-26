<script setup lang="ts">
export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

export interface CatalogAvailableFilters {
  priceRange: { min: number; max: number } | null
  colors: { id: number; name: string; hexCode: string | null; count: number }[]
  sizes: { id: number; name: string; count: number }[]
  brands: { value: string; count: number }[]
  seasons: { value: string; count: number }[]
  materials: { value: string; count: number }[]
}

export interface CatalogFilterState {
  sort?: SortOption
  priceMin: number | null
  priceMax: number | null
  isNew: boolean
  isHit: boolean
  isSeasonal: boolean
  colors: number[]
  sizes: number[]
  brands: string[]
  seasons: string[]
  materials: string[]
}

type StringFilterKey = 'brands' | 'seasons' | 'materials'

const SEASON_LABELS: Record<string, string> = {
  SPRING: 'Весна',
  SUMMER: 'Літо',
  AUTUMN: 'Осінь',
  FALL: 'Осінь',
  WINTER: 'Зима',
  ALL_SEASON: 'Всесезон',
  DEMI: 'Демісезон',
}

interface PriceRangeValue {
  min: number
  max: number
}

interface AccordionItem {
  key: string
  title: string
}

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
  seasons: [...props.modelValue.seasons],
  materials: [...props.modelValue.materials],
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
      state.seasons.splice(0, state.seasons.length, ...next.seasons)
      state.materials.splice(0, state.materials.length, ...next.materials)
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
        seasons: [...state.seasons],
        materials: [...state.materials],
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
    { key: 'quick', title: 'Швидкі фільтри' },
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

  if (props.filtersData.seasons.length) {
    items.push({ key: 'seasons', title: 'Сезон' })
  }

  if (props.filtersData.materials.length) {
    items.push({ key: 'materials', title: 'Матеріал' })
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

const toggleStringItem = (key: StringFilterKey, value: string): void => {
  const collection = state[key]
  const index = collection.indexOf(value)

  if (index === -1) {
    collection.push(value)
    return
  }

  collection.splice(index, 1)
}

const quickFilters: { key: 'isNew' | 'isHit' | 'isSeasonal', label: string }[] = [
  { key: 'isNew', label: 'Новинки' },
  { key: 'isHit', label: 'Хіти продажу' },
  { key: 'isSeasonal', label: 'Сезонна добірка' },
]

const toggleQuickFilter = (key: 'isNew' | 'isHit' | 'isSeasonal'): void => {
  state[key] = !state[key]
}

const isNumberSelected = (key: 'colors' | 'sizes', value: number): boolean => state[key].includes(value)
const isStringSelected = (key: StringFilterKey, value: string): boolean => state[key].includes(value)

const seasonLabel = (value: string): string => SEASON_LABELS[value] ?? value

interface DragScrollState {
  element: HTMLElement
  pointerId: number
  startX: number
  startY: number
  scrollLeft: number
  isDragging: boolean
}

const dragScrollState = shallowRef<DragScrollState | null>(null)
let suppressClickUntil = 0

const getFilterValuesElement = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof Element)) return null

  return target.closest<HTMLElement>('.catalog-filter-values')
}

const stopDragScroll = (): void => {
  dragScrollState.value?.element.classList.remove('is-dragging')
  dragScrollState.value = null
  document.removeEventListener('pointermove', onDocumentPointerMove)
  document.removeEventListener('pointerup', onDocumentPointerUp)
  document.removeEventListener('pointercancel', onDocumentPointerUp)
}

const onDocumentPointerMove = (event: PointerEvent): void => {
  const dragState = dragScrollState.value
  if (!dragState || event.pointerId !== dragState.pointerId) return

  const deltaX = event.clientX - dragState.startX
  const deltaY = event.clientY - dragState.startY

  if (!dragState.isDragging) {
    if (Math.abs(deltaX) <= 4 || Math.abs(deltaX) <= Math.abs(deltaY)) return

    dragState.isDragging = true
    dragState.element.classList.add('is-dragging')
  }

  event.preventDefault()
  dragState.element.scrollLeft = dragState.scrollLeft - deltaX
}

const onDocumentPointerUp = (event: PointerEvent): void => {
  const dragState = dragScrollState.value
  if (!dragState || event.pointerId !== dragState.pointerId) return

  if (dragState.isDragging) {
    suppressClickUntil = window.performance.now() + 350
  }

  stopDragScroll()
}

const onFilterValuesPointerDown = (event: PointerEvent): void => {
  if (event.pointerType === 'mouse' && event.button !== 0) return

  const element = getFilterValuesElement(event.target)
  if (!element || element.scrollWidth <= element.clientWidth) return

  dragScrollState.value = {
    element,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: element.scrollLeft,
    isDragging: false,
  }

  document.addEventListener('pointermove', onDocumentPointerMove, { passive: false })
  document.addEventListener('pointerup', onDocumentPointerUp)
  document.addEventListener('pointercancel', onDocumentPointerUp)
}

const onFilterValuesClick = (event: MouseEvent): void => {
  if (window.performance.now() > suppressClickUntil || !getFilterValuesElement(event.target)) return

  event.preventDefault()
  event.stopPropagation()
}

onBeforeUnmount(stopDragScroll)
</script>

<template>
  <BAccordion
      :items="accordionItems"
      class="catalog-filter-accordion"
      multiple
      :default-open="['quick']"
      @click.capture="onFilterValuesClick"
      @pointerdown.capture="onFilterValuesPointerDown"
  >
    <template #item="{ item }">
      <template v-if="item.key === 'quick'">
        <div class="catalog-filter-values flex gap-2.5">
          <button
              v-for="filter in quickFilters"
              :key="filter.key"
              type="button"
              class="inline-flex shrink-0 items-center justify-center rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors"
              :class="state[filter.key]
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-transparent bg-secondary-100 text-secondary-700 hover:bg-primary-100 hover:text-primary-800'"
              :aria-pressed="state[filter.key]"
              @click="toggleQuickFilter(filter.key)"
          >
            {{ filter.label }}
          </button>
        </div>
      </template>

      <template v-else-if="item.key === 'sizes'">
        <div class="catalog-filter-values flex gap-2.5">
          <button
              v-for="size in filtersData.sizes"
              :key="size.id"
              type="button"
              class="inline-flex min-w-[2.75rem] shrink-0 items-center justify-center rounded-full border px-3.5 py-2 text-sm font-medium transition-colors"
              :class="[
              isNumberSelected('sizes', size.id)
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-transparent bg-secondary-100 text-secondary-700 hover:bg-primary-100 hover:text-primary-800',
            ]"
              @click="toggleNumberItem('sizes', size.id)"
          >
            {{ size.name }}
            <span class="ml-1.5 text-xs opacity-70">{{ size.count }}</span>
          </button>
        </div>
      </template>

      <template v-else-if="item.key === 'colors'">
        <div class="catalog-filter-values flex gap-2.5">
          <button
              v-for="color in filtersData.colors"
              :key="color.id"
              type="button"
              class="inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors"
              :class="[
              isNumberSelected('colors', color.id)
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-transparent bg-secondary-100 text-secondary-700 hover:bg-primary-100 hover:text-primary-800',
            ]"
              @click="toggleNumberItem('colors', color.id)"
          >
            <span
                class="size-3 flex-none rounded-full border border-black/10"
                :style="{ backgroundColor: color.hexCode || '#ffffff' }"
            />
            {{ color.name }}
            <span class="text-xs opacity-70">{{ color.count }}</span>
          </button>
        </div>
      </template>

      <template v-else-if="item.key === 'brands'">
        <div class="catalog-filter-values flex gap-2.5">
          <button
              v-for="brand in filtersData.brands"
              :key="brand.value"
              type="button"
              class="inline-flex max-w-full shrink-0 items-center justify-center rounded-full border px-3.5 py-2 text-sm font-medium transition-colors"
              :class="[
              isStringSelected('brands', brand.value)
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-transparent bg-secondary-100 text-secondary-700 hover:bg-primary-100 hover:text-primary-800',
            ]"
              @click="toggleStringItem('brands', brand.value)"
          >
            <span class="truncate">{{ brand.value }}</span>
            <span class="ml-1.5 text-xs opacity-70">{{ brand.count }}</span>
          </button>
        </div>
      </template>

      <template v-else-if="item.key === 'seasons'">
        <div class="catalog-filter-values flex gap-2.5">
          <button
              v-for="season in filtersData.seasons"
              :key="season.value"
              type="button"
              class="inline-flex max-w-full shrink-0 items-center justify-center rounded-full border px-3.5 py-2 text-sm font-medium transition-colors"
              :class="[
              isStringSelected('seasons', season.value)
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-transparent bg-secondary-100 text-secondary-700 hover:bg-primary-100 hover:text-primary-800',
            ]"
              @click="toggleStringItem('seasons', season.value)"
          >
            <span class="truncate">{{ seasonLabel(season.value) }}</span>
            <span class="ml-1.5 text-xs opacity-70">{{ season.count }}</span>
          </button>
        </div>
      </template>

      <template v-else-if="item.key === 'materials'">
        <div class="catalog-filter-values flex gap-2.5">
          <button
              v-for="material in filtersData.materials"
              :key="material.value"
              type="button"
              class="inline-flex max-w-full shrink-0 items-center justify-center rounded-full border px-3.5 py-2 text-sm font-medium transition-colors"
              :class="[
              isStringSelected('materials', material.value)
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-transparent bg-secondary-100 text-secondary-700 hover:bg-primary-100 hover:text-primary-800',
            ]"
              @click="toggleStringItem('materials', material.value)"
          >
            <span class="truncate">{{ material.value }}</span>
            <span class="ml-1.5 text-xs opacity-70">{{ material.count }}</span>
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

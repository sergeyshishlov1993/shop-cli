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

type ListKey = 'colors' | 'sizes' | 'brands' | 'seasons' | 'materials'
type FlagKey = 'isNew' | 'isHit' | 'isSeasonal'

const SORT_OPTIONS: { value: SortOption | undefined; label: string }[] = [
  { value: undefined, label: 'За популярністю' },
  { value: 'newest', label: 'Новинки' },
  { value: 'price_asc', label: 'Дешевші' },
  { value: 'price_desc', label: 'Дорожчі' },
  { value: 'name_asc', label: 'За назвою' },
]

const FLAGS: { key: FlagKey; label: string }[] = [
  { key: 'isNew', label: 'Новинки' },
  { key: 'isHit', label: 'Хіти продажу' },
  { key: 'isSeasonal', label: 'Сезонна добірка' },
]

const SEASON_LABELS: Record<string, string> = {
  SPRING: 'Весна',
  SUMMER: 'Літо',
  AUTUMN: 'Осінь',
  FALL: 'Осінь',
  WINTER: 'Зима',
  ALL_SEASON: 'Всесезон',
  DEMI: 'Демісезон',
}

const props = defineProps<{ filtersData: CatalogAvailableFilters }>()
const model = defineModel<CatalogFilterState>({ required: true })

const patch = (next: Partial<CatalogFilterState>) => (model.value = { ...model.value, ...next })

function toggle<K extends ListKey>(key: K, value: CatalogFilterState[K][number]) {
  const list = model.value[key] as (typeof value)[]
  patch({ [key]: list.includes(value) ? list.filter(item => item !== value) : [...list, value] })
}

const isOn = (key: ListKey, value: number | string) => (model.value[key] as (number | string)[]).includes(value)

const stringGroups = computed(() => [
  { key: 'brands' as const, title: 'Бренд', items: props.filtersData.brands },
  { key: 'seasons' as const, title: 'Сезон', items: props.filtersData.seasons },
  { key: 'materials' as const, title: 'Матеріал', items: props.filtersData.materials },
].filter(group => group.items.length))

const price = computed({
  get: () => ({
    min: model.value.priceMin ?? props.filtersData.priceRange?.min ?? 0,
    max: model.value.priceMax ?? props.filtersData.priceRange?.max ?? 0,
  }),
  set: (value: { min: number | null; max: number | null }) => patch({
    priceMin: value.min === props.filtersData.priceRange?.min ? null : value.min,
    priceMax: value.max === props.filtersData.priceRange?.max ? null : value.max,
  }),
})

const chip = (active: boolean) => 'inline-flex items-center justify-center rounded-full border px-3.5 py-2 text-sm transition-colors ' + (active
  ? 'border-secondary-900 bg-secondary-900 text-white'
  : 'border-secondary-200 text-secondary-800 hover:border-secondary-900')
</script>

<template>
  <div class="flex flex-col divide-y divide-secondary-100">
    <section class="flex flex-col gap-3 py-5">
      <h3 class="text-xs font-semibold uppercase tracking-widest text-secondary-900">Сортування</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in SORT_OPTIONS"
          :key="option.label"
          type="button"
          :class="chip(model.sort === option.value)"
          :aria-pressed="model.sort === option.value"
          @click="patch({ sort: option.value })"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section v-if="filtersData.colors.length" class="flex flex-col gap-3 py-5">
      <h3 class="text-xs font-semibold uppercase tracking-widest text-secondary-900">Колір</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="color in filtersData.colors"
          :key="color.id"
          type="button"
          class="gap-2"
          :class="chip(isOn('colors', color.id))"
          :aria-pressed="isOn('colors', color.id)"
          @click="toggle('colors', color.id)"
        >
          <span class="size-3.5 rounded-full border border-black/10" :style="{ backgroundColor: color.hexCode || '#fff' }" />
          {{ color.name }}
        </button>
      </div>
    </section>

    <section v-if="filtersData.sizes.length" class="flex flex-col gap-3 py-5">
      <h3 class="text-xs font-semibold uppercase tracking-widest text-secondary-900">Розмір</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="size in filtersData.sizes"
          :key="size.id"
          type="button"
          class="min-w-11"
          :class="chip(isOn('sizes', size.id))"
          :aria-pressed="isOn('sizes', size.id)"
          @click="toggle('sizes', size.id)"
        >
          {{ size.name }}
        </button>
      </div>
    </section>

    <section v-if="filtersData.priceRange" class="flex flex-col gap-3 py-5">
      <h3 class="text-xs font-semibold uppercase tracking-widest text-secondary-900">Ціна, ₴</h3>
      <BPriceRange v-model="price" :min="filtersData.priceRange.min" :max="filtersData.priceRange.max" />
    </section>

    <section class="flex flex-col gap-3 py-5">
      <h3 class="text-xs font-semibold uppercase tracking-widest text-secondary-900">Добірки</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="flag in FLAGS"
          :key="flag.key"
          type="button"
          :class="chip(model[flag.key])"
          :aria-pressed="model[flag.key]"
          @click="patch({ [flag.key]: !model[flag.key] })"
        >
          {{ flag.label }}
        </button>
      </div>
    </section>

    <section v-for="group in stringGroups" :key="group.key" class="flex flex-col gap-3 py-5">
      <h3 class="text-xs font-semibold uppercase tracking-widest text-secondary-900">{{ group.title }}</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in group.items"
          :key="item.value"
          type="button"
          :class="chip(isOn(group.key, item.value))"
          :aria-pressed="isOn(group.key, item.value)"
          @click="toggle(group.key, item.value)"
        >
          {{ group.key === 'seasons' ? SEASON_LABELS[item.value] ?? item.value : item.value }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { catalogApi, type CatalogQuery } from '../catalogApi'
import CatalogFiltersContent, { type CatalogAvailableFilters, type CatalogFilterState } from './CatalogFiltersContent.vue'

const props = defineProps<{
  filters: CatalogAvailableFilters
  params: CatalogQuery
  total: number
}>()

const emit = defineEmits<{ apply: [patch: Partial<CatalogQuery>] }>()

const isOpen = ref(false)
const draft = ref<CatalogFilterState>(fromParams())
const draftCount = ref<number | null>(null)

function fromParams(): CatalogFilterState {
  const p = props.params
  return {
    sort: p.sort,
    priceMin: p.priceMin ?? null,
    priceMax: p.priceMax ?? null,
    isNew: p.isNew ?? false,
    isHit: p.isHit ?? false,
    isSeasonal: p.isSeasonal ?? false,
    colors: p.color ?? [],
    sizes: p.size ?? [],
    brands: p.brand ?? [],
    seasons: p.season ?? [],
    materials: p.material ?? [],
  }
}

const list = <T>(items: T[]) => (items.length ? [...items] : undefined)

function toQuery(s: CatalogFilterState): Partial<CatalogQuery> {
  return {
    sort: s.sort,
    priceMin: s.priceMin ?? undefined,
    priceMax: s.priceMax ?? undefined,
    isNew: s.isNew || undefined,
    isHit: s.isHit || undefined,
    isSeasonal: s.isSeasonal || undefined,
    color: list(s.colors),
    size: list(s.sizes),
    brand: list(s.brands),
    season: list(s.seasons),
    material: list(s.materials),
  }
}

const activeCount = computed(() => {
  const s = fromParams()
  return Number(s.isNew) + Number(s.isHit) + Number(s.isSeasonal)
    + Number(s.priceMin !== null || s.priceMax !== null)
    + s.colors.length + s.sizes.length + s.brands.length + s.seasons.length + s.materials.length
})

function open() {
  draft.value = fromParams()
  draftCount.value = props.total
  isOpen.value = true
}

// Живий підрахунок результатів для кнопки «Показати (N)»
const countDraft = useDebounceFn(async () => {
  const { category, search, productType } = props.params
  try {
    const res = await catalogApi.getProducts({ category, search, productType, ...toQuery(draft.value), page: 1, limit: 1 })
    draftCount.value = res.totalCount
  }
  catch {
    draftCount.value = null
  }
}, 300)

watch(draft, () => isOpen.value && countDraft(), { deep: true })

function reset() {
  draft.value = { ...fromParams(), sort: undefined, priceMin: null, priceMax: null, isNew: false, isHit: false, isSeasonal: false, colors: [], sizes: [], brands: [], seasons: [], materials: [] }
}

function apply() {
  emit('apply', toQuery(draft.value))
  isOpen.value = false
}
</script>

<template>
  <button
    type="button"
    class="inline-flex h-10 items-center gap-2 rounded-full border border-secondary-900 px-4 text-sm font-medium text-secondary-900 transition-colors hover:bg-secondary-900 hover:text-white"
    @click="open"
  >
    <Icon name="lucide:sliders-horizontal" size="16" />
    Фільтри
    <span v-if="activeCount" class="inline-flex size-5 items-center justify-center rounded-full bg-secondary-900 text-[11px] text-white">{{ activeCount }}</span>
  </button>

  <BDrawer v-model="isOpen" title="Фільтри" width="w-screen sm:w-[28rem]">
    <div class="px-5">
      <CatalogFiltersContent v-model="draft" :filters-data="filters" />
    </div>

    <template #footer>
      <div class="flex gap-3">
        <BBtn variant="outline" size="lg" class="flex-1" @click="reset">Скинути</BBtn>
        <BBtn variant="primary" size="lg" class="flex-[2] !border-secondary-900 !bg-secondary-900 hover:!bg-secondary-700" @click="apply">
          Показати{{ draftCount !== null ? ` (${draftCount})` : '' }}
        </BBtn>
      </div>
    </template>
  </BDrawer>
</template>

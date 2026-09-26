<script setup lang="ts">
import type { CatalogQuery } from '../catalogApi'
import CatalogFiltersContent from './CatalogFiltersContent.vue'
import CatalogSort from './CatalogSort.vue'
import type {
  CatalogAvailableFilters,
  CatalogFilterState,
} from './CatalogFiltersContent.vue'

const props = defineProps<{
  filters: CatalogAvailableFilters
  params: CatalogQuery
  mobile?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:filter', key: keyof CatalogQuery, value: CatalogQuery[keyof CatalogQuery]): void
  (event: 'reset'): void
}>()

const isDrawerOpen = ref(false)

const modelValue = computed<CatalogFilterState>(() => ({
  sort: props.params.sort,
  priceMin: props.params.priceMin ?? null,
  priceMax: props.params.priceMax ?? null,
  isNew: props.params.isNew ?? false,
  isHit: props.params.isHit ?? false,
  isSeasonal: props.params.isSeasonal ?? false,
  colors: props.params.color ?? [],
  sizes: props.params.size ?? [],
  brands: props.params.brand ?? [],
  seasons: props.params.season ?? [],
  materials: props.params.material ?? [],
}))

const sameValues = (a: (number | string)[], b: (number | string)[]): boolean =>
  a.length === b.length && a.every((item, index) => item === b[index])

const activeCount = computed<number>(() => {
  let count = 0

  if (modelValue.value.isNew) count += 1
  if (modelValue.value.isHit) count += 1
  if (modelValue.value.isSeasonal) count += 1
  if (modelValue.value.priceMin !== null || modelValue.value.priceMax !== null) count += 1
  count += modelValue.value.colors.length
  count += modelValue.value.sizes.length
  count += modelValue.value.brands.length
  count += modelValue.value.seasons.length
  count += modelValue.value.materials.length

  return count
})

const syncModelValue = (next: CatalogFilterState): void => {
  if (next.sort !== props.params.sort) {
    emit('update:filter', 'sort', next.sort)
  }
  if (next.priceMin !== (props.params.priceMin ?? null)) {
    emit('update:filter', 'priceMin', next.priceMin ?? undefined)
  }
  if (next.priceMax !== (props.params.priceMax ?? null)) {
    emit('update:filter', 'priceMax', next.priceMax ?? undefined)
  }
  if (next.isNew !== (props.params.isNew ?? false)) {
    emit('update:filter', 'isNew', next.isNew || undefined)
  }
  if (next.isHit !== (props.params.isHit ?? false)) {
    emit('update:filter', 'isHit', next.isHit || undefined)
  }
  if (next.isSeasonal !== (props.params.isSeasonal ?? false)) {
    emit('update:filter', 'isSeasonal', next.isSeasonal || undefined)
  }

  if (!sameValues(next.colors, props.params.color ?? [])) {
    emit('update:filter', 'color', next.colors.length ? [...next.colors] : undefined)
  }

  if (!sameValues(next.sizes, props.params.size ?? [])) {
    emit('update:filter', 'size', next.sizes.length ? [...next.sizes] : undefined)
  }

  if (!sameValues(next.brands, props.params.brand ?? [])) {
    emit('update:filter', 'brand', next.brands.length ? [...next.brands] : undefined)
  }

  if (!sameValues(next.seasons, props.params.season ?? [])) {
    emit('update:filter', 'season', next.seasons.length ? [...next.seasons] : undefined)
  }

  if (!sameValues(next.materials, props.params.material ?? [])) {
    emit('update:filter', 'material', next.materials.length ? [...next.materials] : undefined)
  }
}

const resetAllFilters = (): void => {
  emit('reset')
}

const applyFilters = (): void => {
  isDrawerOpen.value = false
}
</script>

<template>
  <div class="w-full min-w-0">
    <template v-if="mobile">
      <button
          type="button"
          class="relative inline-flex size-10 items-center justify-center text-secondary-800"
          aria-label="Фільтри та сортування"
          @click="isDrawerOpen = true"
      >
        <Icon name="lucide:sliders-horizontal" size="22" />
        <span
            v-if="activeCount > 0"
            class="absolute right-0 top-0 inline-flex size-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-semibold text-white"
        >
          {{ activeCount }}
        </span>
      </button>

      <BDrawer
          v-model="isDrawerOpen"
          side="left"
          title="Фільтри та сортування"
          width="w-screen max-w-full sm:max-w-[40rem]"
      >
        <div class="w-full min-w-0 px-5 pb-4 pt-1">
          <CatalogSort
              class="mb-4"
              :model-value="params.sort"
              @update:model-value="emit('update:filter', 'sort', $event)"
          />
          <CatalogFiltersContent
              :model-value="modelValue"
              :filters-data="filters"
              @update:model-value="syncModelValue"
          />
        </div>

        <template #footer>
          <div class="flex items-center gap-3">
            <BBtn v-if="activeCount > 0" variant="outline" size="lg" class="shrink-0" @click="resetAllFilters">
              Очистити
            </BBtn>
            <BBtn variant="primary" size="lg" class="min-w-0 flex-1" @click="applyFilters">
              Застосувати{{ activeCount > 0 ? ` · ${activeCount}` : '' }}
            </BBtn>
          </div>
        </template>
      </BDrawer>
    </template>

    <template v-else>
      <div class="w-full min-w-0">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold text-gray-500">Фільтри</h3>

          <button
              v-if="activeCount > 0"
              type="button"
              class="text-sm font-medium text-primary-700"
              @click="resetAllFilters"
          >
            Очистити
          </button>
        </div>

        <CatalogFiltersContent
            :model-value="modelValue"
            :filters-data="filters"
            @update:model-value="syncModelValue"
        />
      </div>
    </template>
  </div>
</template>

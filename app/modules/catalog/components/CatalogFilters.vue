<script setup lang="ts">
import type { CatalogQuery } from '../catalogApi'
import CatalogFiltersContent from './CatalogFiltersContent.vue'
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
  sort: props.params.sort ?? 'newest',
  priceMin: props.params.priceMin ?? null,
  priceMax: props.params.priceMax ?? null,
  isNew: props.params.isNew ?? false,
  isHit: props.params.isHit ?? false,
  isSeasonal: props.params.isSeasonal ?? false,
  colors: props.params.color ? [props.params.color] : [],
  sizes: props.params.size ? [props.params.size] : [],
  brands: props.params.brand ? [props.params.brand] : [],
}))

const activeCount = computed<number>(() => {
  let count = 0

  if (modelValue.value.isNew) count += 1
  if (modelValue.value.isHit) count += 1
  if (modelValue.value.isSeasonal) count += 1
  if (modelValue.value.priceMin !== null || modelValue.value.priceMax !== null) count += 1
  if (modelValue.value.colors.length) count += 1
  if (modelValue.value.sizes.length) count += 1
  if (modelValue.value.brands.length) count += 1

  return count
})

const syncModelValue = (next: CatalogFilterState): void => {
  if (next.sort !== (props.params.sort ?? 'newest')) {
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

  const nextColor = next.colors[0]
  if (nextColor !== props.params.color) {
    emit('update:filter', 'color', nextColor)
  }

  const nextSize = next.sizes[0]
  if (nextSize !== props.params.size) {
    emit('update:filter', 'size', nextSize)
  }

  const nextBrand = next.brands[0]
  if (nextBrand !== props.params.brand) {
    emit('update:filter', 'brand', nextBrand)
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
          class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700"
          @click="isDrawerOpen = true"
      >
        <span>Фільтри</span>
        <span
            v-if="activeCount > 0"
            class="inline-flex size-5 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white"
        >
          {{ activeCount }}
        </span>
      </button>

      <BDrawer
          v-model="isDrawerOpen"
          side="left"
          title="Фільтри"
          width="w-screen max-w-full sm:max-w-[40rem]"
      >
        <div class="w-full min-w-0">
          <div v-if="activeCount > 0" class="mb-3 flex justify-end">
            <button
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

        <template #footer>
          <div class="flex flex-col gap-3">
            <button
                v-if="activeCount > 0"
                type="button"
                class="text-sm font-medium text-primary-700"
                @click="resetAllFilters"
            >
              Очистити
            </button>

            <button
                type="button"
                class="w-full rounded-full bg-gray-700 py-3.5 text-sm font-medium text-white md:py-4 md:text-base"
                @click="applyFilters"
            >
              Застосувати
            </button>
          </div>
        </template>
      </BDrawer>
    </template>

    <template v-else>
      <div class="w-full min-w-0">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Фільтри</h3>

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

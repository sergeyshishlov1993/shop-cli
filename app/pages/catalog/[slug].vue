<script setup lang="ts">
import CatalogFilters from '~/modules/catalog/components/CatalogFilters.vue'
import CatalogSort from '~/modules/catalog/components/CatalogSort.vue'
import ProductGrid from '~/modules/catalog/components/ProductGrid/ProductGrid.vue'
import CategoryNav from '~/modules/catalog/components/CategoryNav.vue'
import { useCategoryTree } from '~/modules/catalog/composables/useCategoryTree'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { findBySlug, loadCategories } = useCategoryTree()
await loadCategories()
const category = computed(() => findBySlug(slug.value))

const {
  products,
  filters,
  totalCount,
  totalPages,
  loading,
  params,
  setFilter,
  setPage,
  setSort,
  resetFilters,
} = useProductList()

const mobileColumns = useLocalStorage<1 | 2>('catalog-mobile-columns', 2, { initOnMounted: true })

// Пошук у тулбарі каталогу (десктоп): оновлює ?search= з невеликою затримкою
const searchQuery = ref(params.search ?? '')
const applySearch = useDebounceFn((value: string) => setFilter('search', value.trim() || undefined), 400)
watch(searchQuery, applySearch)

const breadcrumbs = computed(() => [
  { label: 'Головна', to: '/' },
  { label: 'Каталог', to: '/catalog' },
  { label: category.value?.name ?? slug.value },
])

useHead(computed(() => ({
  title: category.value?.metaTitle ?? category.value?.name ?? slug.value,
  meta: [{ name: 'description', content: category.value?.metaDescription ?? `Каталог товарів категорії ${category.value?.name ?? slug.value}` }],
})))
</script>

<template>
  <div class="store-page store-container py-3 sm:py-4 lg:py-8">
    <div class="max-lg:text-xs max-lg:text-secondary-400 max-lg:[&_*]:!text-xs"><BBreadcrumbs :items="breadcrumbs" /></div>

    <h1 class="store-title mb-3 mt-2 text-xl font-medium text-gray-900 lg:mb-8 lg:mt-7 lg:text-3xl lg:font-normal">
      {{ category?.name ?? slug }}
    </h1>

    <div class="flex gap-6">
      <aside class="hidden w-64 shrink-0 lg:block">
        <div class="catalog-sidebar-scroll sticky top-28 max-h-[calc(100dvh-20rem)] overflow-x-hidden overflow-y-scroll overscroll-contain pr-3">
          <CategoryNav :active-slug="slug" class="mb-6" />
          <CatalogFilters
            v-if="filters"
            :filters="filters"
            :params="params"
            @update:filter="setFilter"
            @reset="resetFilters"
          />
        </div>
      </aside>

      <div class="flex-1 min-w-0">
        <div class="mb-3 flex flex-row items-center justify-between gap-3 lg:mb-4 lg:items-end lg:gap-4">
          <div class="flex items-center gap-1 md:hidden" role="group" aria-label="Вигляд каталогу">
            <button
              v-for="columns in [1, 2] as const"
              :key="columns"
              type="button"
              class="inline-flex size-9 items-center justify-center transition-opacity"
              :class="mobileColumns === columns ? 'text-secondary-900' : 'text-secondary-400'"
              :aria-label="columns === 1 ? 'Одна колонка' : 'Дві колонки'"
              :aria-pressed="mobileColumns === columns"
              @click="mobileColumns = columns"
            >
              <Icon :name="columns === 1 ? 'lucide:square' : 'lucide:columns-2'" size="22" />
            </button>
          </div>
          <span class="ml-auto text-xs text-secondary-500 lg:hidden">{{ totalCount }} товарів</span>
          <div class="shrink-0 lg:hidden">
            <CatalogFilters
              v-if="filters"
              :filters="filters"
              :params="params"
              mobile
              @update:filter="setFilter"
              @reset="resetFilters"
            />
          </div>
          <div class="flex w-full items-center justify-between gap-4 max-lg:!hidden">
            <CatalogSort :model-value="params.sort" @update:model-value="setSort" />
            <label class="glass flex h-11 w-72 shrink-0 items-center gap-2 rounded-full px-4 text-sm">
              <Icon name="lucide:search" size="18" class="text-secondary-500" />
              <input v-model="searchQuery" type="search" placeholder="Пошук у каталозі" class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-secondary-400" aria-label="Пошук у каталозі">
            </label>
          </div>
        </div>

        <ProductGrid
          :products="products"
          :loading="loading"
          :page="params.page ?? 1"
          :total-pages="totalPages"
          @update:page="setPage"
        />
      </div>
    </div>
  </div>
</template>

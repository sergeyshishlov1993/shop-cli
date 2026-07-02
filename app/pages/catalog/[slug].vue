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
  totalPages,
  loading,
  params,
  setFilter,
  setPage,
  setSort,
  resetFilters,
} = useProductList()

params.category = slug.value

const breadcrumbs = computed(() => [
  { label: 'Головна', to: '/' },
  { label: 'Каталог', to: '/catalog' },
  { label: category.value?.name ?? slug.value },
])

useHead(computed(() => ({
  title: category.value?.name ?? slug.value,
  meta: [{ name: 'description', content: `Каталог товарів категорії ${category.value?.name ?? slug.value}` }],
})))
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <BBreadcrumbs :items="breadcrumbs" />

    <h1 class="mt-4 mb-6 text-2xl font-bold text-gray-900">
      {{ category?.name ?? slug }}
    </h1>

    <div class="flex gap-6">
      <aside class="hidden lg:block w-64 shrink-0">
        <CategoryNav :active-slug="slug" class="mb-6" />
        <CatalogFilters
          v-if="filters"
          :filters="filters"
          :params="params"
          @update:filter="setFilter"
          @reset="resetFilters"
        />
      </aside>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-4 gap-4">
          <div class="lg:hidden">
            <CatalogFilters
              v-if="filters"
              :filters="filters"
              :params="params"
              mobile
              @update:filter="setFilter"
              @reset="resetFilters"
            />
          </div>
          <CatalogSort :model-value="params.sort" @update:model-value="setSort" />
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

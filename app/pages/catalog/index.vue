<script setup lang="ts">
import CatalogFilters from '~/modules/catalog/components/CatalogFilters.vue'
import CatalogSort from '~/modules/catalog/components/CatalogSort.vue'
import ProductGrid from '~/modules/catalog/components/ProductGrid/ProductGrid.vue'
import CategoryNav from '~/modules/catalog/components/CategoryNav.vue'

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

useHead({
  title: 'Каталог',
  meta: [{ name: 'description', content: 'Каталог товарів нашого магазину' }],
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <BBreadcrumbs :items="[{ label: 'Головна', to: '/' }, { label: 'Каталог' }]" />

    <h1 class="mt-4 mb-6 text-2xl font-bold text-gray-900">Каталог</h1>

    <div class="flex gap-6">
      <aside class="hidden lg:block w-64 shrink-0">
        <CategoryNav class="mb-6" />
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

<script setup lang="ts">
import CatalogFilters from './CatalogFilters.vue'
import CategoryNav from './CategoryNav.vue'
import ProductGrid from './ProductGrid/ProductGrid.vue'

defineProps<{
  title: string
  breadcrumbs: { label: string; to?: string }[]
}>()

const { products, filters, totalCount, totalPages, loading, params, setPage, applyFilters } = useProductList()

// Щільність сітки: 4/2 колонки на десктопі, 2/1 на мобільному
const large = ref(false)
onMounted(() => {
  try { large.value = localStorage.getItem('catalog-grid-large') === '1' } catch {}
})
function setLarge(value: boolean) {
  large.value = value
  try { localStorage.setItem('catalog-grid-large', value ? '1' : '0') } catch {}
}
</script>

<template>
  <div class="store-page store-container py-3 sm:py-4 lg:py-6">
    <div class="max-lg:text-xs max-lg:[&_*]:!text-xs"><BBreadcrumbs :items="breadcrumbs" /></div>

    <h1 class="store-title mb-4 mt-2 text-xl font-medium uppercase tracking-wide text-secondary-900 lg:mb-6 lg:mt-4 lg:text-3xl">{{ title }}</h1>

    <CategoryNav class="mb-4" />

    <div class="mb-4 flex items-center justify-end gap-3 lg:mb-6 lg:gap-5">
      <div class="mr-auto flex items-center gap-1 lg:mr-0" role="group" aria-label="Вигляд каталогу">
        <button
          v-for="isLarge in [false, true]"
          :key="String(isLarge)"
          type="button"
          class="inline-flex size-9 items-center justify-center rounded-full transition-colors"
          :class="large === isLarge ? 'bg-secondary-900 text-white' : 'text-secondary-400 hover:text-secondary-900'"
          :aria-label="isLarge ? 'Великі картки' : 'Малі картки'"
          :aria-pressed="large === isLarge"
          @click="setLarge(isLarge)"
        >
          <Icon :name="isLarge ? 'lucide:columns-2' : 'lucide:layout-grid'" size="18" />
        </button>
      </div>
      <span class="text-sm text-secondary-500">{{ totalCount }} товарів</span>
      <CatalogFilters v-if="filters" :filters="filters" :params="params" :total="totalCount" @apply="applyFilters" />
    </div>

    <ProductGrid
      :products="products"
      :loading="loading"
      :page="params.page ?? 1"
      :total-pages="totalPages"
      :large="large"
      @update:page="setPage"
    />
  </div>
</template>

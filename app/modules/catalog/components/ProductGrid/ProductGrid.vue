<script setup lang="ts">
import ProductCard from '../ProductCard.vue'

interface Props {
  products: ProductListItem[]
  loading?: boolean
  loadingMore?: boolean
  hasMore?: boolean
  // Великі картки: 2 колонки на десктопі, 1 на мобільному
  large?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingMore: false,
  hasMore: false,
  large: false,
})

const emit = defineEmits<{ loadMore: [] }>()

// Безкінечна прокрутка: коли сторінка добігла до «маячка» під сіткою — просимо наступну порцію.
// Перевіряємо й після кожного завантаження: маячок міг лишитись у зоні видимості.
const sentinel = ref<HTMLElement | null>(null)
const sentinelVisible = ref(false)
useIntersectionObserver(sentinel, ([entry]) => { sentinelVisible.value = !!entry?.isIntersecting }, { rootMargin: '0px 0px 600px 0px' })
watch([sentinelVisible, () => props.loadingMore, () => props.loading, () => props.products.length], () => {
  if (sentinelVisible.value && props.hasMore && !props.loading && !props.loadingMore) emit('loadMore')
})
</script>

<template>
  <div :aria-busy="loading">
    <div v-if="loading && products.length === 0" class="relative">
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
        <div
          v-for="skeletonIndex in 8"
          :key="skeletonIndex"
          class="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse"
        />
      </div>

      <div
        class="pointer-events-none absolute inset-0 z-20 flex min-h-60 items-start justify-center bg-white/60 pt-16 backdrop-blur-[1px]"
        aria-live="polite"
      >
        <div class="flex size-14 items-center justify-center rounded-full border border-primary-100 bg-white shadow-sm">
          <span class="size-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <span class="sr-only">Оновлюємо каталог</span>
        </div>
      </div>
    </div>

    <template v-else-if="products.length > 0">
      <div class="relative">
        <div
          v-if="loading"
          class="pointer-events-none absolute inset-0 z-20 flex min-h-60 items-start justify-center pt-16"
          aria-live="polite"
        >
          <div class="flex size-14 items-center justify-center rounded-full border border-primary-100 bg-white shadow-sm">
            <span class="size-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            <span class="sr-only">Оновлюємо каталог</span>
          </div>
        </div>

        <div
          class="loading-blur catalog-grid grid gap-x-0.5 gap-y-5 -mx-4 sm:-mx-6 lg:mx-0 lg:gap-x-4 lg:gap-y-8"
          :class="[large ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4', { 'pointer-events-none': loading }]"
        >
          <!-- ProductCard має кілька кореневих вузлів, тож v-reveal вішаємо на обгортку -->
          <div v-for="(product, index) in products" :key="product.id" v-reveal="(index % 4) * 80">
            <ProductCard :product="product" />
          </div>
        </div>
      </div>

      <div ref="sentinel" class="mt-8 flex min-h-10 justify-center">
        <BSpinner v-if="loadingMore" />
      </div>
    </template>


    <BEmptyState
      v-else
      title="Товарів не знайдено"
      description="Спробуйте змінити параметри пошуку або скинути фільтри"
      icon="search"
    />
  </div>
</template>

<style scoped>
@media (max-width: 1023px) {
  .catalog-grid :deep(.product-card__image) {
    border-radius: 0;
  }

  .catalog-grid :deep(.product-card > div.mt-3) {
    margin-top: 0.5rem;
    padding-inline: 0.5rem;
  }

  .catalog-grid :deep(.product-card > div.mt-3 > span:first-child) {
    display: none;
  }

  .catalog-grid :deep(.product-card__name) {
    display: block;
    min-height: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--color-secondary-600);
  }
}
</style>

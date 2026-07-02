<script setup lang="ts">
import ProductCard from '../ProductCard.vue'

interface Props {
  products: ProductListItem[]
  loading?: boolean
  page: number
  totalPages: number
}

interface Emits {
  (event: 'update:page', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

defineEmits<Emits>()
</script>

<template>
  <div>
    <div v-if="loading" class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
      <div
        v-for="skeletonIndex in 8"
        :key="skeletonIndex"
        class="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse"
      />
    </div>

    <template v-else-if="products.length > 0">
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>

      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <BPagination
          :page="page"
          :total-pages="totalPages"
          @update:page="$emit('update:page', $event)"
        />
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

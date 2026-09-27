<script setup lang="ts">
import ProductCard from '~/modules/catalog/components/ProductCard.vue'
import ProductGrid from '~/modules/catalog/components/ProductGrid/ProductGrid.vue'
import { useFavoritesStore } from '~/modules/favorites/favoritesStore'
import { useConfirm } from '~/modules/ui/composables/useConfirm'

definePageMeta({ layout: 'account', middleware: 'auth' })

const favoritesStore = useFavoritesStore()
const page = ref(1)
const limit = 20
const totalPages = computed(() => Math.max(1, Math.ceil(favoritesStore.totalCount / limit)))

// Варіанти відображення: сітка (як у каталозі), великі картки (2 в ряд), список із діями
type FavoritesView = 'grid' | 'large' | 'list'
const view = useLocalStorage<FavoritesView>('favorites-view', 'grid', { initOnMounted: true })
const viewOptions: Array<{ value: FavoritesView, label: string, icon: string }> = [
  { value: 'grid', label: 'Сітка', icon: 'lucide:layout-grid' },
  { value: 'large', label: 'Великі', icon: 'lucide:square' },
  { value: 'list', label: 'Список', icon: 'lucide:list' },
]
const { confirm } = useConfirm()

async function removeFavorite(product: ProductListItem) {
  if (!(await confirm({ title: 'Прибрати з обраного?', message: product.name, confirmText: 'Прибрати', variant: 'warning' }))) return
  await favoritesStore.toggle(product.id)
  await loadFavorites()
}

async function loadFavorites() {
  await favoritesStore.fetchAll({ page: page.value, limit })
}

watch(page, loadFavorites)
await useAsyncData('favorites', async () => {
  await Promise.all([loadFavorites(), favoritesStore.fetchRecommendations()])
  return true
})

useSeoMeta({
  title: 'Обране',
  description: 'Збережені товари вашого списку бажань.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="store-page store-container py-6 lg:py-10">
    <!-- Вкладки кабінету — у layouts/account.vue -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3 lg:mb-8">
      <div class="flex items-baseline gap-3">
        <h1 class="store-title text-2xl lg:text-3xl">Обране</h1>
        <span class="text-sm text-secondary-500">{{ favoritesStore.totalCount }} товарів</span>
      </div>
      <div v-if="favoritesStore.items.length" class="glass flex gap-1 rounded-full p-1" role="group" aria-label="Вигляд">
        <button
          v-for="option in viewOptions"
          :key="option.value"
          type="button"
          class="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm transition-colors"
          :class="view === option.value ? 'bg-secondary-900 text-white' : 'text-secondary-700 hover:text-primary-700'"
          :aria-pressed="view === option.value"
          @click="view = option.value"
        >
          <Icon :name="option.icon" size="16" />
          <span class="max-sm:hidden">{{ option.label }}</span>
        </button>
      </div>
    </div>

    <div v-if="favoritesStore.loading" class="flex justify-center py-20">
      <BSpinner size="lg" />
    </div>

    <BEmptyState
      v-else-if="!favoritesStore.items.length"
      title="В обраному поки порожньо"
      description="Додавайте товари за допомогою кнопки з сердечком."
    >
      <template #action>
        <BBtn to="/catalog" variant="primary">Перейти в каталог</BBtn>
      </template>
    </BEmptyState>

    <template v-else>
      <!-- Сітка: та сама, що й у каталозі -->
      <ProductGrid
        v-if="view === 'grid'"
        :products="favoritesStore.items"
        :page="page"
        :total-pages="totalPages"
        @update:page="page = $event"
      />

      <!-- Великі картки: 2 в ряд, фото на всю ширину -->
      <div v-else-if="view === 'large'" class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <ProductCard v-for="product in favoritesStore.items" :key="product.id" :product="product" />
      </div>

      <!-- Список: фото, назва, ціна, кнопки -->
      <ul v-else class="divide-y divide-secondary-200 border-y border-secondary-200">
        <li v-for="product in favoritesStore.items" :key="product.id" class="flex gap-4 py-4">
          <div class="relative shrink-0">
            <NuxtLink :to="`/product/${product.slug}`">
              <img :src="getFileUrl(product.mainImage, 'thumb')" :alt="product.name" class="h-32 w-24 rounded-xl object-cover sm:h-40 sm:w-30">
            </NuxtLink>
            <BBtn variant="icon" size="sm" class="absolute left-1 top-1 !bg-white/80 text-primary-600" title="Прибрати з обраного" aria-label="Прибрати з обраного" @click="removeFavorite(product)">
              <Icon name="lucide:heart" size="16" class="fill-current" />
            </BBtn>
          </div>
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <h2 class="text-sm sm:text-base"><NuxtLink :to="`/product/${product.slug}`" class="line-clamp-2 text-secondary-900">{{ product.name }}</NuxtLink></h2>
            <p class="flex items-baseline gap-2">
              <span class="font-semibold text-secondary-900">{{ formatPrice(product.effectivePrice) }}</span>
              <span v-if="product.oldPrice" class="text-xs text-secondary-400 line-through">{{ formatPrice(product.oldPrice) }}</span>
            </p>
            <div class="mt-auto flex flex-wrap gap-2">
              <BBtn :to="`/product/${product.slug}`" variant="primary" size="sm">Обрати розмір</BBtn>
            </div>
          </div>
        </li>
      </ul>

      <BPagination
        v-if="view !== 'grid' && totalPages > 1"
        :page="page"
        :total-pages="totalPages"
        class="mt-8"
        @update:page="page = $event"
      />
    </template>

    <section v-if="favoritesStore.recommendations.length" class="mt-10 border-t border-secondary-200 pt-8 lg:mt-14 lg:pt-10">
      <div class="mb-3 lg:mb-6"><p class="text-xs text-secondary-400 max-lg:hidden">На основі обраного</p><h2 class="text-base font-medium text-secondary-900 lg:mt-2 lg:text-2xl lg:font-semibold"><NuxtLink to="/catalog" class="group inline-flex items-center gap-1 transition-colors hover:text-primary-700">Можуть сподобатися <Icon name="lucide:chevron-right" size="20" class="transition-transform group-hover:translate-x-0.5" /></NuxtLink></h2></div>
      <ProductRail>
        <ProductCard v-for="product in favoritesStore.recommendations" :key="product.id" :product="product" compact />
      </ProductRail>
    </section>
  </div>
</template>

<script setup lang="ts">
import QuickAddModal from '~/modules/catalog/components/QuickAddModal.vue'
import { useAuthStore } from '~/modules/auth/authStore'
import { useFavoritesStore } from '~/modules/favorites/favoritesStore'

interface Props {
  product: ProductListItem
  compact?: boolean
  // Горизонтальна міні-картка (шторка кошика, як у Gepur): фото зліва, назва/ціна і кнопка кошика праворуч
  mini?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  mini: false,
})

const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const router = useRouter()
const toast = useToast()

const isModalOpen = ref(false)
const isHovered = ref(false)
const isFavorite = computed(() => favoritesStore.isFavorite(props.product.id))

const hasDiscount = computed(() => props.product.oldPrice !== null)

const discountPercent = computed(() => {
  if (!props.product.oldPrice) return 0
  return Math.round((1 - props.product.effectivePrice / props.product.oldPrice) * 100)
})

const mainImageUrl = computed(() => getFileUrl(props.product.mainImage, 'medium') || null)

const hoverImageUrl = computed(() => getFileUrl(props.product.hoverImage, 'medium') || null)

const hoverVideoUrl = computed(() => getFileUrl(props.product.hoverVideo) || null)

const displayImage = computed(() => {
  if (isHovered.value && hoverImageUrl.value) return hoverImageUrl.value
  return mainImageUrl.value
})
// srcset має йти за тим самим файлом, що й src, інакше ховер-фото не підміниться
const displaySrcset = computed(() =>
  getFileSrcset(isHovered.value && hoverImageUrl.value ? props.product.hoverImage : props.product.mainImage))

function openQuickAdd() {
  isModalOpen.value = true
}

async function toggleWishlist() {
  if (!authStore.isAuthenticated) {
    await router.push({ path: '/login', query: { redirect: `/product/${props.product.slug}` } })
    return
  }

  try {
    await favoritesStore.toggle(props.product.id)
    const payload = { image: getFileUrl(props.product.mainImage, 'thumb') || null, name: props.product.name, price: props.product.effectivePrice }
    if (isFavorite.value) toast.product({ ...payload, title: 'Додано в обране', icon: 'mdi:heart', link: { label: 'До обраного', to: '/favorites' } })
    else toast.product({ ...payload, title: 'Прибрано з обраного', icon: 'mdi:heart-outline', link: { label: 'До обраного', to: '/favorites' } })
  }
  catch {
    toast.error('Не вдалося оновити обране')
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    favoritesStore.checkProducts([props.product.id]).catch(() => undefined)
  }
})
</script>

<template>
  <div v-if="mini" class="flex h-full gap-3">
    <NuxtLink :to="`/product/${product.slug}`" class="aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-md bg-secondary-100">
      <img v-if="mainImageUrl" :src="mainImageUrl" :srcset="getFileSrcset(product.mainImage)" sizes="80px" :alt="product.name" class="size-full object-cover" loading="lazy" decoding="async">
    </NuxtLink>
    <div class="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
      <NuxtLink :to="`/product/${product.slug}`" class="line-clamp-2 text-xs leading-snug text-secondary-800 hover:text-primary-700">{{ product.name }}</NuxtLink>
      <span class="text-sm font-bold" :class="hasDiscount ? 'text-danger' : 'text-secondary-950'">
        {{ product.effectivePrice }} ₴
        <span v-if="hasDiscount" class="ml-1 font-normal text-secondary-400 line-through">{{ product.oldPrice }} ₴</span>
      </span>
      <button type="button" class="mt-auto flex size-8 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700" aria-label="Додати в кошик" title="Додати в кошик" @click="openQuickAdd">
        <Icon name="lucide:shopping-bag" size="15" />
      </button>
    </div>
  </div>
  <div v-else :class="['product-card group relative flex h-full flex-col', { 'product-card--compact': compact }]">
    <div class="relative" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <NuxtLink
        :to="`/product/${product.slug}`"
        class="product-card__image relative block aspect-[3/4] overflow-hidden rounded-sm bg-secondary-100"
    >
      <video
          v-if="isHovered && hoverVideoUrl"
          :src="hoverVideoUrl"
          :poster="mainImageUrl ?? undefined"
          class="h-full w-full object-cover"
          autoplay
          muted
          loop
          playsinline
      />
      <img
          v-else-if="displayImage"
          :src="displayImage"
          :srcset="displaySrcset"
          sizes="(min-width: 1024px) 25vw, 50vw"
          :alt="product.name"
          class="h-full w-full object-cover transition-opacity duration-300"
          loading="lazy"
          decoding="async"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-secondary-400">
        <Icon name="mdi:image-outline" size="48" />
      </div>

      <div class="absolute left-2 top-2 flex flex-wrap gap-1 pr-10">
        <span
            v-if="hasDiscount"
            class="rounded-sm bg-primary-700 px-1.5 py-0.5 text-[10px] font-medium tracking-widest text-white"
        >
          -{{ discountPercent }}%
        </span>
        <span
            v-if="product.isNew"
            class="rounded-sm bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-secondary-800"
        >
          New
        </span>
        <span
            v-if="product.isHit"
            class="rounded-sm bg-primary-300 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-secondary-900"
        >
          Hit
        </span>
      </div>

      <!-- Рейтинг на своєму місці (знизу зліва); клік — одразу до відгуків товару -->
      <button
          type="button"
          class="absolute bottom-2 left-2 flex items-center gap-1 rounded-sm bg-primary-700 px-1.5 py-0.5 text-[11px] font-medium text-white"
          :title="`Відгуків: ${product.reviewCount ?? 0}`"
          @click.prevent.stop="navigateTo(`/product/${product.slug}#reviews`)"
      >
        {{ Number((product.averageRating ?? 0).toFixed(1)) }}
        <Icon name="mdi:star" size="13" class="text-primary-200" />
      </button>

      <button
          type="button"
          class="glass absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:text-primary-700"
          :class="isFavorite ? 'text-primary-700' : 'text-secondary-700'"
          :aria-label="isFavorite ? 'Видалити з обраного' : 'Додати до обраного'"
          @click.prevent="toggleWishlist"
      >
        <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" size="20" />
      </button>
    </NuxtLink>

    <template v-if="!compact">
      <!-- Мобільний (без hover): маленька кнопка швидкого додавання -->
      <button
          type="button"
          class="glass absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full text-secondary-900 lg:hidden"
          aria-label="Швидке додавання"
          @click="openQuickAdd"
      >
        <Icon name="lucide:shopping-bag" size="16" />
      </button>
    </template>
    </div>

    <div v-if="compact" class="mt-2 flex flex-col gap-2">
      <NuxtLink :to="`/product/${product.slug}`" class="flex min-w-0 flex-col gap-0.5">
        <span class="truncate text-[13px] text-secondary-700">{{ product.name }}</span>
        <span class="flex items-baseline gap-2">
          <span class="text-base font-bold" :class="hasDiscount ? 'text-danger' : 'text-secondary-950'">{{ product.effectivePrice }} ₴</span>
          <span v-if="hasDiscount" class="text-xs text-secondary-400 line-through">{{ product.oldPrice }} ₴</span>
        </span>
      </NuxtLink>
      <BBtn variant="primary" size="sm" block @click="openQuickAdd">
        <Icon name="mdi:cart-outline" size="16" /> Додати в кошик
      </BBtn>
    </div>

    <div v-if="!compact" class="mt-3 flex flex-1 flex-col gap-1">
      <span v-if="product.brand" class="truncate text-xs text-secondary-500">
        {{ product.brand }}
      </span>
      <span v-else class="h-4" aria-hidden="true" />

      <NuxtLink
          :to="`/product/${product.slug}`"
          class="product-card__name text-sm font-medium text-secondary-800 transition-colors hover:text-primary-500"
      >
        {{ product.name }}
      </NuxtLink>

      <!-- Ціна крупно й жирно; акційна — червона, стара закреслена -->
      <div class="flex items-baseline gap-2">
        <span class="text-lg font-bold" :class="hasDiscount ? 'text-danger' : 'text-secondary-950'">
          {{ product.effectivePrice }} ₴
        </span>
        <span v-if="hasDiscount" class="text-sm text-secondary-400 line-through">
          {{ product.oldPrice }} ₴
        </span>
      </div>

      <BBtn variant="primary" size="sm" block class="mt-auto" @click="openQuickAdd">
        <Icon name="lucide:shopping-bag" size="16" />
        Додати в кошик
      </BBtn>
    </div>

  </div>


  <QuickAddModal v-model:open="isModalOpen" :product="product" />
</template>

<style scoped>
.product-card__name {
  display: -webkit-box;
  min-height: 2.5rem;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-card--compact .product-card__image {
  background: #f5ede8;
}
</style>

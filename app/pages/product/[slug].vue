<script setup lang="ts">
import { getInstagramEmbedUrl } from '~/modules/common/helpers/fileUrl'
import { useProductDetail } from '~/modules/catalog/composables/useProductDetail'
import { useCatalogStore } from '~/modules/catalog/catalogStore'
import { useCartStore } from '~/modules/cart/cartStore'
import { useAuthStore } from '~/modules/auth/authStore'
import { useFavoritesStore } from '~/modules/favorites/favoritesStore'
import { orderApi } from '~/modules/order/orderApi'
import AddToCartBtn from '~/modules/cart/components/AddToCartBtn.vue'
import ReviewsList from '~/modules/review/components/ReviewsList.vue'
import { catalogApi } from '~/modules/catalog/catalogApi'
import ProductGallery from '~/modules/catalog/components/ProductGallery/ProductGallery.vue'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)
const catalogStore = useCatalogStore()

await useAsyncData(`product-${slug.value}`, async () => {
  await Promise.all([
    catalogStore.fetchProductBySlug(slug.value),
    catalogStore.fetchRelated(slug.value),
  ])
  return true
})

const {
  product,
  relatedProducts,
  loading,
  colors,
  sizes,
  selectedColorId,
  selectedSizeId,
  currentVariant,
  price,
  availability,
  media,
  selectColor,
  selectSize,
  isColorAvailable,
  isSizeAvailable,
} = useProductDetail(slug)

const cartStore = useCartStore()
const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const toast = useToast()

const isSizeChartOpen = ref(false)
const isFavorite = computed(() => product.value ? favoritesStore.isFavorite(product.value.id) : false)
const isQuickBuyOpen = ref(false)
const isQuickBuySubmitting = ref(false)
const sizeChart = ref<SizeChart | null>(null)
const sizeChartLoading = ref(false)
const sizeChartLoaded = ref(false)

const quickBuyForm = ref({
  name: '',
  phone: '',
})

const breadcrumbs = computed(() => {
  const items: { label: string; to?: string }[] = [
    { label: 'Головна', to: '/' },
    { label: 'Каталог', to: '/catalog' },
  ]
  if (product.value?.category) {
    for (const crumb of product.value.category.breadcrumb) {
      items.push({ label: crumb.name, to: `/catalog?category=${crumb.slug}` })
    }
  }
  if (product.value) {
    items.push({ label: product.value.name })
  }
  return items
})

const article = computed(() => currentVariant.value?.sku ?? null)
const similarProducts = computed(() => relatedProducts.value?.similar ?? [])
const wearWithProducts = computed(() => relatedProducts.value?.wearWith ?? [])

const selectedColorName = computed(() => colors.value.find(c => c.id === selectedColorId.value)?.name ?? null)

const availabilityLabel = computed(() => {
  if (availability.value === 'IN_STOCK') return 'В наявності'
  if (availability.value === 'LOW_STOCK') return 'Залишилось мало'
  return 'Немає в наявності'
})

const isSizeSheetOpen = ref(false)
const isDescriptionOpen = ref(false)
const galleryRef = ref<HTMLElement | null>(null)
// Головне медіа зліва: фото isMain → перше фото → перше відео → Instagram (у товару може не бути фото)
const mainMedia = computed(() => {
  const images = media.value.filter(m => m.mediaType === 'IMAGE' && m.file)
  return images.find(m => m.isMain) ?? images[0] ?? media.value.find(m => m.mediaType === 'VIDEO' && m.file) ?? media.value.find(m => m.externalUrl)
})
const infoDrawer = ref<'care' | 'delivery' | null>(null)
const infoRows = computed(() => [
  { key: 'care', title: 'Склад та догляд', icon: 'lucide:shirt' },
  { key: 'sizes', title: 'Таблиця розмірів', icon: 'lucide:ruler' },
  { key: 'delivery', title: 'Доставка та повернення', icon: 'lucide:truck' },
  { key: 'reviews', title: `Відгуки (${product.value?.reviewCount ?? 0})`, icon: 'lucide:message-square' },
] as const)
function openInfo(key: (typeof infoRows.value)[number]['key']) {
  if (key === 'sizes') isSizeChartOpen.value = true
  else if (key === 'reviews') document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })
  else infoDrawer.value = key
}
const isBarVisible = ref(false)
useIntersectionObserver(galleryRef, ([entry]) => { isBarVisible.value = !!entry && !entry.isIntersecting && entry.boundingClientRect.top < 0 })
const askSize = () => { isSizeSheetOpen.value = true; toast.warning('Оберіть розмір') }

const hasOldPrice = computed(() => Boolean(product.value?.oldPrice && product.value.oldPrice > price.value))

const discountPercent = computed(() => {
  if (!product.value?.oldPrice || product.value.oldPrice <= price.value) return null

  return Math.round(((product.value.oldPrice - price.value) / product.value.oldPrice) * 100)
})

const availabilityTone = computed(() => {
  if (availability.value === 'IN_STOCK') return 'bg-success/10 text-success'
  if (availability.value === 'LOW_STOCK') return 'bg-warning/10 text-warning'
  return 'bg-danger/10 text-danger'
})

const isPurchasable = computed(() => Boolean(currentVariant.value) && availability.value !== 'OUT_OF_STOCK')

const showScrollTop = ref(false)
const onScroll = () => {
  showScrollTop.value = window.scrollY > 600
}

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

async function toggleFavorite() {
  if (!product.value) return
  if (!authStore.isAuthenticated) {
    await router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  try {
    await favoritesStore.toggle(product.value.id)
    toast.success(favoritesStore.isFavorite(product.value.id) ? 'Додано в обране' : 'Прибрано з обраного')
  }
  catch {
    toast.error('Не вдалося оновити обране')
  }
}

function openQuickBuy() {
  if (!currentVariant.value) return
  const user = authStore.user
  quickBuyForm.value = {
    name: user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : '',
    phone: user?.phone ?? '',
  }
  isQuickBuyOpen.value = true
}

async function submitQuickBuy() {
  if (!currentVariant.value || !quickBuyForm.value.name.trim() || !quickBuyForm.value.phone.trim()) return

  isQuickBuySubmitting.value = true
  try {
    await cartStore.addToCart(currentVariant.value.id, 1)
    await orderApi.create(
        {
          customerName: quickBuyForm.value.name.trim(),
          customerPhone: quickBuyForm.value.phone.trim(),
          deliveryProvider: 'PHONE_CONFIRMATION',
        },
        crypto.randomUUID(),
    )
    cartStore.clearCart()
    isQuickBuyOpen.value = false
    toast.success('Замовлення оформлено!')
    await router.push('/')
  } catch {
    toast.error('Помилка при оформленні замовлення')
  } finally {
    isQuickBuySubmitting.value = false
  }
}

// JSON-LD строим в setup-скоупе (где доступен Nuxt-контекст для getFileUrl),
// useHead ниже лишь читает готовую строку — иначе SSR head-резолвинг падает.
const jsonLdScript = ref('')

watchEffect(() => {
  const p = product.value
  if (!p) return
  const mainImage = p.media?.[0]?.file ? getFileUrl(p.media[0].file, 'large') : undefined
  useSeoMeta({
    title: p.seo.metaTitle ?? p.name,
    description: p.seo.metaDescription ?? p.description ?? undefined,
    ogTitle: p.seo.metaTitle ?? p.name,
    ogDescription: p.seo.metaDescription ?? p.description ?? undefined,
    ogType: 'website',
    ogImage: mainImage,
    twitterCard: 'summary_large_image',
  })

  const inStock = p.variants.some(v => v.availableQty > 0)
  const minPrice = p.variants.length ? Math.min(...p.variants.map(v => v.price)) : p.basePrice
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': p.name,
    ...(mainImage ? { image: [mainImage] } : {}),
    ...(p.description ? { description: p.description } : {}),
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'UAH',
      'price': minPrice,
      'availability': inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(p.reviewCount
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.averageRating, reviewCount: p.reviewCount } }
      : {}),
  }
  jsonLdScript.value = JSON.stringify(jsonLd)
})

useHead(() => (jsonLdScript.value
  ? { script: [{ type: 'application/ld+json', innerHTML: jsonLdScript.value }] }
  : {}))

// Back-in-stock: подписка на надходження, когда товар недоступен.
const stockEmail = ref('')
const stockSubscribed = ref(false)
const stockLoading = ref(false)
async function subscribeStock() {
  if (!product.value || !stockEmail.value.trim()) return
  stockLoading.value = true
  try {
    await catalogApi.subscribeStock(product.value.id, stockEmail.value.trim())
    stockSubscribed.value = true
  }
  catch { /* показываем нейтрально, деталь не критична */ }
  finally { stockLoading.value = false }
}

// «Ви переглядали» (1.2). addRecent сам читает localStorage, отдельная загрузка не нужна.
const { items: recentItems, add: addRecent } = useRecentlyViewed()
const recentToShow = computed(() => recentItems.value.filter(i => i.slug !== product.value?.slug).slice(0, 8))
onMounted(() => {
  const p = product.value
  if (!p) return
  addRecent({
    slug: p.slug,
    name: p.name,
    image: p.media?.[0]?.file ? getFileUrl(p.media[0].file, 'thumb') : '',
    price: p.variants.length ? Math.min(...p.variants.map(v => v.price)) : p.basePrice,
  })
})

watch(
  () => product.value?.id,
  (productId) => {
    if (productId && authStore.isAuthenticated) {
      favoritesStore.checkProducts([productId]).catch(() => undefined)
    }
  },
  { immediate: true },
)

watch(isSizeChartOpen, async (isOpen) => {
  if (!isOpen || !product.value || sizeChartLoaded.value) return
  sizeChartLoading.value = true
  try {
    sizeChart.value = await catalogApi.getSizeChart(product.value.category.id)
  }
  catch {
    sizeChart.value = null
  }
  finally {
    sizeChartLoading.value = false
    sizeChartLoaded.value = true
  }
})
</script>

<template>
  <div class="store-page product-page flex flex-col pb-40 md:pb-28">
    <div v-if="loading && !product" class="flex justify-center py-24">
      <BSpinner size="lg" />
    </div>

    <template v-else-if="product">
      <section ref="galleryRef">
        <ProductGallery v-if="media.length" :media="media" :product-name="product.name" editorial />
        <div v-else class="flex aspect-[3/4] w-full items-center justify-center bg-secondary-100 text-secondary-400 lg:aspect-[3/1]">
          <Icon name="mdi:image-outline" size="64" />
        </div>
      </section>

      <section class="store-container grid gap-8 py-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-12 lg:py-10 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <div class="hidden md:block lg:col-span-full"><BBreadcrumbs :items="breadcrumbs" /></div>

        <!-- Головне фото (isMain) зліва, як у референсі; на мобільному його вже показує слайдер -->
        <div v-if="mainMedia" class="hidden lg:block">
          <div class="sticky top-28 aspect-[3/4] w-full overflow-hidden rounded-2xl bg-secondary-100">
            <iframe v-if="mainMedia.externalUrl" :src="getInstagramEmbedUrl(mainMedia.externalUrl) ?? undefined" class="size-full border-0" loading="lazy" :title="`${product.name} — Instagram`" />
            <video v-else-if="mainMedia.mediaType === 'VIDEO'" :src="getFileUrl(mainMedia.file)" class="size-full object-cover" controls playsinline preload="metadata" />
            <img v-else :src="getFileUrl(mainMedia.file, 'large')" :alt="product.name" class="size-full object-cover">
          </div>
        </div>

        <!-- Інфо, а під ним вибір і покупка — одна колонка праворуч від головного фото -->
        <div class="flex min-w-0 flex-col gap-8" :class="{ 'lg:col-span-full': !mainMedia }">
          <div class="flex min-w-0 flex-col gap-4">

            <div class="flex items-start justify-between gap-4">
              <h1 class="store-title text-2xl md:text-4xl">{{ product.name }}</h1>
              <button
                  type="button"
                  class="flex size-11 shrink-0 items-center justify-center rounded-full border border-secondary-200 text-secondary-900 transition-colors hover:border-primary-300 hover:bg-primary-50"
                  :class="{ 'border-primary-200 bg-primary-50 text-primary-700': isFavorite }"
                  aria-label="Обране"
                  @click="toggleFavorite"
              >
                <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" size="21" />
              </button>
            </div>

            <a v-if="product.reviewCount" href="#reviews" class="flex w-fit items-center gap-2 text-sm text-secondary-600 transition hover:text-primary-700">
              <BRating :value="product.averageRating ?? 0" readonly size="sm" />
              <span>{{ Number((product.averageRating ?? 0).toFixed(1)) }} · {{ product.reviewCount }} відгуків</span>
            </a>

            <p class="flex items-baseline gap-3">
              <span class="text-2xl font-semibold text-secondary-950">{{ price }} ₴</span>
              <span v-if="hasOldPrice" class="text-base text-secondary-400 line-through">{{ product.oldPrice }} ₴</span>
              <BTag v-if="discountPercent" size="sm">-{{ discountPercent }}%</BTag>
            </p>

            <div v-if="product.description" class="text-sm leading-relaxed text-secondary-700 md:text-base">
              <p :class="{ 'line-clamp-4': !isDescriptionOpen }">{{ product.description }}</p>
              <button v-if="product.description.length > 240" type="button" class="mt-1 text-sm font-medium text-primary-700 underline-offset-4 hover:underline" @click="isDescriptionOpen = !isDescriptionOpen">
                {{ isDescriptionOpen ? 'Згорнути' : 'Детальніше' }}
              </button>
            </div>

            <p class="text-xs font-medium text-secondary-500">
              {{ [selectedColorName, article && `Артикул ${article}`, product.material, product.brand].filter(Boolean).join(' • ') }}
            </p>
          </div>

          <div class="flex min-w-0 flex-col gap-5">
            <div v-if="colors.length" class="flex flex-col gap-3">
              <span class="text-sm font-medium text-secondary-500">
                Колір <span v-if="selectedColorName" class="text-secondary-950">· {{ selectedColorName }}</span>
              </span>
              <div class="flex flex-wrap gap-2">
                <button
                    v-for="color in colors"
                    :key="color.id"
                    type="button"
                    :disabled="!isColorAvailable(color.id)"
                    class="flex size-11 items-center justify-center rounded-full border transition-all"
                    :class="selectedColorId === color.id ? 'border-secondary-900 ring-2 ring-secondary-900 ring-offset-2' : 'border-secondary-200 hover:border-secondary-400'"
                    :aria-label="color.name"
                    :aria-pressed="selectedColorId === color.id"
                    @click="selectColor(color.id)"
                >
                  <span class="size-8 rounded-full border border-black/10" :style="{ backgroundColor: color.hexCode ?? '#fff' }" />
                </button>
              </div>
            </div>

            <div v-if="sizes.length" class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-secondary-500">Оберіть розмір</span>
                <button type="button" class="text-sm font-medium text-primary-700 underline-offset-4 hover:underline" @click="isSizeChartOpen = true">
                  Таблиця розмірів
                </button>
              </div>
              <div class="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap">
                <button
                    v-for="size in sizes"
                    :key="size.id"
                    type="button"
                    class="min-w-14 rounded-lg border px-4 py-3 text-sm font-medium transition"
                    :class="selectedSizeId === size.id ? 'border-secondary-900 bg-secondary-900 text-white' : 'border-secondary-200 text-secondary-800 hover:border-secondary-500'"
                    :disabled="!isSizeAvailable(size.id)"
                    :aria-pressed="selectedSizeId === size.id"
                    @click="selectSize(size.id)"
                >
                  {{ size.name }}
                </button>
              </div>
            </div>

            <span class="w-fit rounded-full px-3 py-1 text-sm font-semibold" :class="availabilityTone">{{ availabilityLabel }}</span>

            <!-- Кнопки покупки в самому блоці: нижня панель з'являється лише після прокрутки фото -->
            <div class="grid grid-cols-2 gap-2 [&_button:disabled]:pointer-events-none" @click="sizes.length && !selectedSizeId && askSize()">
              <AddToCartBtn compact :variant-id="currentVariant?.id ?? null" :disabled="!isPurchasable" />
              <BBtn variant="outline" :disabled="!isPurchasable" @click="openQuickBuy">Купити в 1 клік</BBtn>
            </div>

            <div v-if="product.outOfStock" class="rounded-lg border border-amber-300 bg-amber-50 p-4">
              <p class="mb-2 font-semibold text-amber-900">Немає в наявності</p>
              <p v-if="stockSubscribed" class="text-sm text-amber-800">
                Ми повідомимо вас на пошту, щойно товар зʼявиться.
              </p>
              <template v-else>
                <p class="mb-2 text-sm text-amber-800">Підпишіться — повідомимо про надходження.</p>
                <div class="flex gap-2">
                  <BInput v-model="stockEmail" type="email" placeholder="Ваш email" class="flex-1" />
                  <BBtn :disabled="!stockEmail.trim()" :loading="stockLoading" @click="subscribeStock">Підписатися</BBtn>
                </div>
              </template>
            </div>

            <!-- Як у референсі: рядки відкривають шторку з інфо, «Відгуки» — скрол до блоку -->
            <ul class="divide-y divide-secondary-200 border-y border-secondary-200">
              <li v-for="row in infoRows" :key="row.key">
                <button type="button" class="flex w-full items-center gap-3 py-4 text-left text-sm uppercase tracking-[0.12em] text-secondary-900 transition-colors hover:text-primary-700" @click="openInfo(row.key)">
                  <Icon :name="row.icon" size="18" class="shrink-0 text-primary-600" />
                  <span class="flex-1">{{ row.title }}</span>
                  <Icon name="lucide:chevron-right" size="18" class="shrink-0 text-secondary-400" />
                </button>
              </li>
            </ul>

            <BDrawer :model-value="infoDrawer !== null" side="right" :title="infoDrawer === 'care' ? 'Склад та догляд' : 'Доставка та повернення'" @update:model-value="infoDrawer = null">
              <ul v-if="infoDrawer === 'care'" class="space-y-2 p-5 text-sm text-secondary-700">
                <li v-if="product.material">Матеріал: {{ product.material }}</li>
                <li>Прання при температурі до 30°C</li>
                <li>Не використовувати відбілювачі</li>
              </ul>
              <ul v-else class="space-y-2 p-5 text-sm text-secondary-700">
                <li>Нова Пошта — 1–3 дні</li>
                <li>Укрпошта — 3–7 днів</li>
                <li>Оплата карткою або при отриманні</li>
              </ul>
            </BDrawer>
          </div>
        </div>
      </section>

      <!-- Нижня панель покупки: з'являється, коли галерея прокручена вгору за екран -->
      <div
          class="glass fixed inset-x-0 bottom-0 z-40 rounded-t-2xl motion-safe:transition-transform motion-safe:duration-300 md:rounded-none"
          :class="{ 'pointer-events-none translate-y-full': !isBarVisible }"
          :inert="!isBarVisible"
      >
        <div class="store-container flex flex-col gap-2 py-2.5 md:flex-row md:items-center md:gap-4 md:py-3">
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <BTag v-if="discountPercent" size="sm">-{{ discountPercent }}%</BTag>
            <BTag v-if="product.isNew" size="sm" variant="secondary">NEW</BTag>
            <BTag v-if="product.isHit" size="sm" variant="warning">HIT</BTag>
            <span class="min-w-0 truncate text-sm text-secondary-800">{{ product.name }}</span>
            <span class="ml-auto shrink-0 text-base font-semibold text-secondary-950 md:ml-2">{{ price }} ₴</span>
            <span v-if="hasOldPrice" class="shrink-0 text-xs text-secondary-400 line-through">{{ product.oldPrice }} ₴</span>
          </div>

          <div v-if="sizes.length" class="gap-1.5 overflow-x-auto" :class="isSizeSheetOpen ? 'flex' : 'hidden lg:flex'">
            <button
                v-for="size in sizes"
                :key="size.id"
                type="button"
                class="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full border px-3 text-sm transition-colors disabled:opacity-40"
                :class="selectedSizeId === size.id ? 'border-secondary-900 bg-secondary-900 text-white' : 'border-secondary-300 text-secondary-900 hover:border-secondary-600'"
                :disabled="!isSizeAvailable(size.id)"
                :aria-pressed="selectedSizeId === size.id"
                @click="selectSize(size.id); isSizeSheetOpen = false"
            >
              {{ size.name }}
            </button>
          </div>

          <!-- Розмір не обрано: кнопки неактивні, натиск показує розміри (моб.) і підказку -->
          <div class="flex shrink-0 items-center gap-2">
          <button
              type="button"
              class="flex size-11 shrink-0 items-center justify-center rounded-full border border-secondary-300 text-secondary-900 transition-colors hover:border-primary-300 hover:bg-primary-50"
              :class="{ 'border-primary-200 bg-primary-50 text-primary-700': isFavorite }"
              :aria-label="isFavorite ? 'Прибрати з обраного' : 'Додати в обране'"
              :aria-pressed="isFavorite"
              @click="toggleFavorite"
          >
            <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" size="20" />
          </button>
          <div class="grid min-w-0 flex-1 shrink-0 grid-cols-2 items-center gap-2 md:flex max-md:[&_.b-btn]:!px-2 max-md:[&_.b-btn]:!text-[11px] max-md:[&_.b-btn]:!tracking-normal [&_button:disabled]:pointer-events-none" @click="sizes.length && !selectedSizeId && askSize()">
            <BBtn variant="outline" class="min-w-0 whitespace-nowrap md:w-56" :disabled="!isPurchasable" @click="openQuickBuy">Купити в 1 клік</BBtn>
            <div class="min-w-0 whitespace-nowrap md:w-56">
              <AddToCartBtn compact :variant-id="currentVariant?.id ?? null" :disabled="!isPurchasable" />
            </div>
          </div>
          </div>
        </div>
      </div>

      <section class="store-container flex flex-col gap-6 pb-16">
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-secondary-200 pt-8">
          <h2 class="store-title text-xl md:text-2xl">Відгуки та питання</h2>
          <div v-if="product.averageRating" class="flex items-center gap-2">
            <BRating :value="product.averageRating" readonly />
            <span class="text-sm text-secondary-600">({{ product.reviewCount }})</span>
          </div>
        </div>
        <ReviewsList :product-id="product.id" />
      </section>

      <section v-if="wearWithProducts.length" class="store-container flex flex-col gap-6 pb-16" data-testid="wear-with">
        <h2 class="store-title border-t border-secondary-200 pt-8 text-xl md:text-2xl">З чим носити</h2>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <ProductCard v-for="item in wearWithProducts.slice(0, 4)" :key="item.id" :product="item" />
        </div>
      </section>

      <section v-if="recentToShow.length" class="store-container flex flex-col gap-6 pb-16">
        <h2 class="store-title border-t border-secondary-200 pt-8 text-xl md:text-2xl">Переглянуті</h2>
        <div v-drag-scroll class="flex gap-4 overflow-x-auto pb-2">
          <NuxtLink v-for="i in recentToShow" :key="i.slug" :to="`/product/${i.slug}`" class="w-32 shrink-0">
            <img v-if="i.image" :src="i.image" :alt="i.name" class="aspect-[3/4] w-full rounded object-cover">
            <p class="mt-1 line-clamp-2 text-xs text-secondary-700">{{ i.name }}</p>
            <p class="text-sm font-semibold">{{ i.price }} ₴</p>
          </NuxtLink>
        </div>
      </section>

      <section v-if="similarProducts.length" class="store-container flex flex-col gap-6 pb-16">
        <h2 class="store-title border-t border-secondary-200 pt-8 text-xl md:text-2xl">Тебе може зацікавити</h2>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <ProductCard v-for="item in similarProducts.slice(0, 4)" :key="item.id" :product="item" />
        </div>
      </section>

      <button
          v-if="showScrollTop"
          type="button"
          class="fixed bottom-40 right-3 z-30 flex size-11 items-center justify-center rounded-full bg-primary-50 text-secondary-900 shadow-md transition-colors hover:bg-primary-100 md:bottom-28 md:right-6 md:size-12"
          aria-label="Наверх"
          @click="scrollToTop"
      >
        <Icon name="mdi:arrow-up" size="20" />
      </button>

      <BModal v-model="isSizeChartOpen" title="Таблиця розмірів">
        <div class="p-4">
          <div v-if="sizeChartLoading" class="flex justify-center py-8">
            <BSpinner />
          </div>
          <div v-else-if="sizeChart" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
              <tr class="border-b border-gray-200">
                <th v-for="column in sizeChart.columns" :key="column" class="whitespace-nowrap px-3 py-2 text-left font-medium text-gray-500">
                  {{ column }}
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(row, rowIndex) in sizeChart.rows" :key="rowIndex" class="border-b border-gray-100">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="whitespace-nowrap px-3 py-2 text-gray-700">
                  {{ cell }}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <div v-else-if="sizes.length" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="border-b border-gray-200"><th class="px-3 py-2 text-left font-medium text-gray-500">Розмір</th><th class="px-3 py-2 text-left font-medium text-gray-500">Тип</th></tr></thead>
              <tbody><tr v-for="size in sizes" :key="size.id" class="border-b border-gray-100"><td class="px-3 py-2 text-gray-900">{{ size.name }}</td><td class="px-3 py-2 text-gray-600">{{ size.sizeType }}</td></tr></tbody>
            </table>
          </div>
          <p v-else class="text-sm text-gray-500">Розмірна сітка для цієї категорії ще не заповнена.</p>
        </div>
      </BModal>

      <BModal v-model="isQuickBuyOpen" title="Купити в 1 клік">
        <div class="flex flex-col gap-4 p-4">
          <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <span class="min-w-0 flex-1 truncate text-sm text-gray-700">{{ product.name }}</span>
            <span class="text-sm font-semibold text-gray-950">{{ price }} ₴</span>
          </div>

          <BInput
              v-model="quickBuyForm.name"
              label="Ім'я та прізвище"
              placeholder="Введіть ім'я"
          />

          <BInput
              v-model="quickBuyForm.phone"
              mode="phone"
              label="Телефон"
              placeholder="+380"
          />
        </div>

        <template #footer>
          <BBtn
              variant="primary"
              block
              :loading="isQuickBuySubmitting"
              :disabled="!quickBuyForm.name.trim() || !quickBuyForm.phone.trim()"
              @click="submitQuickBuy"
          >
            Оформити замовлення
          </BBtn>
        </template>
      </BModal>

    </template>
  </div>
</template>


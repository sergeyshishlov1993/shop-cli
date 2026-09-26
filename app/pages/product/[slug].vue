<script setup lang="ts">
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

const article = computed(() => currentVariant.value?.sku ?? product.value?.variants[0]?.sku ?? null)
const similarProducts = computed(() => relatedProducts.value?.similar ?? [])
const boughtTogetherProducts = computed(() => relatedProducts.value?.boughtTogether ?? [])

const selectedColorName = computed(() => {
  if (!selectedColorId.value) return null
  return colors.value.find(c => c.id === selectedColorId.value)?.name ?? null
})

const availabilityLabel = computed(() => {
  if (availability.value === 'IN_STOCK') return 'В наявності'
  if (availability.value === 'LOW_STOCK') return 'Залишилось мало'
  return 'Немає в наявності'
})

const selectedSizeName = computed(() => {
  if (!selectedSizeId.value) return null
  return sizes.value.find(size => size.id === selectedSizeId.value)?.name ?? null
})

const isSizeOpen = ref(false)
const isSizeSheetOpen = ref(false)
const sizeSelectRef = useTemplateRef<HTMLElement>('sizeSelectRef')
onClickOutside(sizeSelectRef, () => { isSizeOpen.value = false })
function pickSize(sizeId: number) {
  selectSize(sizeId)
  isSizeOpen.value = false
}

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
const showDesktopSticky = ref(false)
const purchaseBlockRef = ref<HTMLElement | null>(null)
const onScroll = () => {
  showScrollTop.value = window.scrollY > 600
  const purchaseBlock = purchaseBlockRef.value
  const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
  showDesktopSticky.value = Boolean(
    purchaseBlock && purchaseBlock.getBoundingClientRect().bottom <= headerBottom,
  )
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

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
  if (!currentVariant.value) return
  if (!quickBuyForm.value.name.trim() || !quickBuyForm.value.phone.trim()) return

  isQuickBuySubmitting.value = true
  try {
    await cartStore.addToCart(currentVariant.value.id, 1)
    const idempotencyKey = crypto.randomUUID()
    await orderApi.create(
        {
          customerName: quickBuyForm.value.name.trim(),
          customerPhone: quickBuyForm.value.phone.trim(),
          deliveryProvider: 'PHONE_CONFIRMATION',
        },
        idempotencyKey,
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
  <div class="store-page product-page flex flex-col pb-32 md:pb-24">
    <div v-if="loading && !product" class="flex justify-center py-24">
      <BSpinner size="lg" />
    </div>

    <template v-else-if="product">
      <section class="store-container hidden pt-4 md:block">
        <BBreadcrumbs :items="breadcrumbs" />
      </section>

      <section class="store-container product-page-grid py-2 md:py-10">
        <div class="product-page-gallery flex min-w-0 flex-col gap-2">
          <ProductGallery
              v-if="media.length"
              :media="media"
              :product-name="product.name"
          />
          <div
              v-else
              class="flex aspect-[3/4] w-full items-center justify-center bg-gray-100 text-gray-400"
          >
            <Icon name="mdi:image-outline" size="64" />
          </div>
        </div>

        <div class="product-page-details flex min-w-0 flex-col gap-5">
          <div ref="purchaseBlockRef" class="flex flex-col gap-5">
            <div class="flex flex-col gap-3 border-b border-gray-200 pb-5">
            <div class="flex items-start justify-between gap-4">
              <h1 class="store-title max-w-xl text-2xl md:text-3xl">
                {{ product.name }}
              </h1>

              <button
                  type="button"
                  class="flex size-11 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-900 transition-colors hover:border-primary-300 hover:bg-primary-50"
                  :class="isFavorite ? 'border-primary-200 bg-primary-50 text-primary-700' : ''"
                  aria-label="Обране"
                  @click="toggleFavorite"
              >
                <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" size="21" />
              </button>
            </div>

            <span
                class="w-fit rounded-full px-3 py-1 text-sm font-semibold"
                :class="availabilityTone"
            >
              {{ availabilityLabel }}
            </span>

            <div class="flex flex-wrap items-end gap-3">
              <span class="text-3xl font-semibold text-gray-950">{{ price }} ₴</span>
              <span v-if="hasOldPrice" class="pb-1 text-base text-gray-400 line-through">
                {{ product.oldPrice }} ₴
              </span>
              <span
                  v-if="discountPercent"
                  class="mb-1 rounded-full bg-primary-100 px-2.5 py-1 text-sm font-semibold text-primary-700"
              >
                -{{ discountPercent }}%
              </span>
            </div>

            <div class="flex flex-wrap gap-2 text-xs font-medium text-gray-500">
              <span v-if="article" class="rounded-full bg-gray-100 px-3 py-1">Артикул: {{ article }}</span>
              <span v-if="product.brand" class="rounded-full bg-gray-100 px-3 py-1">{{ product.brand }}</span>
              <span v-if="product.season" class="rounded-full bg-gray-100 px-3 py-1">{{ product.season }}</span>
            </div>
            </div>

            <div class="flex flex-col gap-5">
              <div v-if="colors.length" class="flex flex-col gap-3">
            <span class="text-sm font-medium text-gray-500">
              Колір: <span class="text-gray-950">{{ selectedColorName }}</span>
            </span>
            <div class="flex flex-wrap gap-2">
              <button
                  v-for="color in colors"
                  :key="color.id"
                  type="button"
                  class="flex size-11 items-center justify-center rounded-full border transition-all"
                  :class="selectedColorId === color.id ? 'border-gray-950 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-400'"
                  :aria-label="color.name"
                  @click="selectColor(color.id)"
              >
                <span
                    class="size-8 rounded-full border border-black/10"
                    :style="{ backgroundColor: color.hexCode ?? '#fff' }"
                />
              </button>
            </div>
              </div>

              <div v-if="sizes.length" class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-500">
                Розмір<span v-if="selectedSizeName" class="text-gray-950">: {{ selectedSizeName }}</span>
              </span>
              <button
                  type="button"
                  class="text-sm font-medium text-primary-700 underline-offset-4 hover:underline"
                  @click="isSizeChartOpen = true"
              >
                Таблиця розмірів
              </button>
            </div>
            <div ref="sizeSelectRef" class="relative">
              <button
                  type="button"
                  class="glass flex h-11 w-full items-center justify-between rounded-xl px-4 text-sm text-gray-900 transition hover:border-primary-400"
                  @click="isSizeOpen = !isSizeOpen"
              >
                <span :class="{ 'text-gray-400': !selectedSizeName }">{{ selectedSizeName ?? 'Оберіть розмір' }}</span>
                <Icon name="lucide:chevron-down" class="h-4 w-4 shrink-0 transition-transform" :class="{ 'rotate-180': isSizeOpen }" />
              </button>
              <Transition name="size-glass">
                <div
                    v-if="isSizeOpen"
                    class="glass glass--strong absolute left-0 top-full z-30 mt-2 w-full overflow-hidden rounded-xl"
                >
                  <button
                      v-for="size in sizes"
                      :key="size.id"
                      type="button"
                      class="flex w-full items-center justify-between px-4 py-3 text-sm text-gray-900 transition-colors hover:bg-white/60"
                      :class="{ 'bg-white/40 font-semibold': selectedSizeId === size.id }"
                      @click="pickSize(size.id)"
                  >
                    {{ size.name }}
                    <Icon v-if="selectedSizeId === size.id" name="lucide:check" class="h-4 w-4" />
                  </button>
                </div>
              </Transition>
            </div>
              </div>

              <div class="hidden flex-col gap-3 md:flex">
              <AddToCartBtn
                  :variant-id="currentVariant?.id ?? null"
                  :disabled="!isPurchasable"
              />
              <BBtn variant="outline" size="md" block :disabled="!isPurchasable" @click="openQuickBuy">
                Купити в 1 клік
              </BBtn>
              </div>
            </div>

            <div v-if="product.outOfStock" class="rounded-lg border border-amber-300 bg-amber-50 p-4">
              <p class="mb-2 font-semibold text-amber-900">Немає в наявності</p>
              <p v-if="stockSubscribed" class="text-sm text-amber-800">
                Ми повідомимо вас на пошту, щойно товар зʼявиться.
              </p>
              <template v-else>
                <p class="mb-2 text-sm text-amber-800">Підпишіться — повідомимо про надходження.</p>
                <div class="flex gap-2">
                  <BInput
                    v-model="stockEmail"
                    type="email"
                    placeholder="Ваш email"
                    class="flex-1"
                  />
                  <BBtn
                    :disabled="!stockEmail.trim()"
                    :loading="stockLoading"
                    @click="subscribeStock"
                  >
                    Підписатися
                  </BBtn>
                </div>
              </template>
            </div>

            <p v-if="product.description" class="text-sm leading-relaxed text-gray-700 md:text-base">
              {{ product.description }}
            </p>
          </div>

          <!-- Колір, артикул і бренд уже показані вгорі — тут лише тканина -->
          <p v-if="product.material" class="text-sm text-gray-500">Тканина: <span class="text-gray-900">{{ product.material }}</span></p>

          <!-- Інфо-блоки сіткою, без акордеонів — щоб не було порожнього місця -->
          <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <section class="rounded-xl border border-secondary-200 p-4">
              <h3 class="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-secondary-800">
                <Icon name="lucide:shirt" size="16" class="text-primary-600" /> Склад та догляд
              </h3>
              <ul class="space-y-1 text-sm text-secondary-600">
                <li v-if="product.material">Матеріал: {{ product.material }}</li>
                <li>Прання при температурі до 30°C</li>
                <li>Не використовувати відбілювачі</li>
              </ul>
            </section>
            <section class="rounded-xl border border-secondary-200 p-4">
              <h3 class="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-secondary-800">
                <Icon name="lucide:truck" size="16" class="text-primary-600" /> Доставка та оплата
              </h3>
              <ul class="space-y-1 text-sm text-secondary-600">
                <li>Нова Пошта — 1–3 дні</li>
                <li>Укрпошта — 3–7 днів</li>
                <li>Оплата карткою або при отриманні</li>
              </ul>
            </section>
          </div>
        </div>
      </section>

      <section v-if="similarProducts.length" class="store-container flex flex-col gap-6 pb-16">
        <div class="flex items-end justify-between border-t border-gray-200 pt-8">
          <h2 class="store-title text-xl md:text-2xl"><NuxtLink :to="product.category ? `/catalog/${product.category.slug}` : '/catalog'" class="group inline-flex items-center gap-1 transition-colors hover:text-primary-700">З чим носити <Icon name="lucide:chevron-right" size="20" class="transition-transform group-hover:translate-x-0.5" /></NuxtLink></h2>
          <span class="text-sm text-gray-500">{{ similarProducts.length }} товарів</span>
        </div>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <ProductCard
              v-for="item in similarProducts.slice(0, 4)"
              :key="item.id"
              :product="item"
          />
        </div>
      </section>

      <section v-if="boughtTogetherProducts.length" class="store-container flex flex-col gap-6 pb-16">
        <div class="flex items-end justify-between border-t border-gray-200 pt-8">
          <h2 class="store-title text-xl md:text-2xl"><NuxtLink :to="product.category ? `/catalog/${product.category.slug}` : '/catalog'" class="group inline-flex items-center gap-1 transition-colors hover:text-primary-700">З цим купують <Icon name="lucide:chevron-right" size="20" class="transition-transform group-hover:translate-x-0.5" /></NuxtLink></h2>
          <span class="text-sm text-gray-500">{{ boughtTogetherProducts.length }} товарів</span>
        </div>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <ProductCard
              v-for="item in boughtTogetherProducts.slice(0, 4)"
              :key="item.id"
              :product="item"
          />
        </div>
      </section>

      <section class="store-container flex flex-col gap-6 pb-16">
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-8">
          <h2 class="text-xl font-semibold text-gray-950 md:text-2xl">
            Відгуки та питання
          </h2>
          <div v-if="product.averageRating" class="flex items-center gap-2">
            <BRating :value="product.averageRating" readonly />
            <span class="text-sm text-gray-600">({{ product.reviewCount }})</span>
          </div>
        </div>
        <ReviewsList :product-id="product.id" />
      </section>

      <div v-if="showDesktopSticky" class="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-gray-200 bg-white/95 backdrop-blur md:block">
        <div class="store-container flex items-center gap-3 py-3 lg:gap-6">
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-sm text-gray-900">{{ product.name }}</span>
            <div class="flex items-baseline gap-2">
              <span class="text-base font-semibold text-gray-950">{{ price }} ₴</span>
              <span v-if="hasOldPrice" class="text-xs text-gray-400 line-through">{{ product.oldPrice }} ₴</span>
            </div>
          </div>

          <div class="hidden max-w-md items-center gap-2 overflow-x-auto xl:flex">
            <button
                v-for="size in sizes"
                :key="size.id"
                type="button"
                class="flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition-colors"
                :class="selectedSizeId === size.id
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-gray-300 text-gray-900 hover:border-primary-500'"
                @click="selectSize(size.id)"
            >
              {{ size.name }}
            </button>
          </div>

          <div class="flex shrink-0 items-center gap-2 lg:gap-3">
            <button
                type="button"
                class="shrink-0 whitespace-nowrap rounded-full border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-950 disabled:cursor-not-allowed disabled:opacity-50 lg:px-6"
                :disabled="!isPurchasable"
                @click="openQuickBuy"
            >
              Купити в 1 клік
            </button>
            <div class="w-44 lg:w-52">
              <AddToCartBtn
                  :variant-id="currentVariant?.id ?? null"
                  :disabled="!isPurchasable"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Мобільна шторка покупки (як у Gepur): назва, ціна, обране і «Обрати розмір» → розміри → у кошик -->
      <div class="product-sheet glass fixed inset-x-0 bottom-0 z-40 rounded-t-2xl px-4 pb-3 pt-1.5 md:hidden">
        <button
            type="button"
            class="mx-auto mb-1.5 block h-1 w-10 rounded-full bg-secondary-300"
            :aria-label="isSizeSheetOpen ? 'Згорнути' : 'Розгорнути'"
            @click="isSizeSheetOpen = !isSizeSheetOpen"
        />
        <div class="flex items-center gap-2">
        <p class="min-w-0 flex-1 truncate text-sm text-secondary-800">{{ product.name }}</p>
        <div v-if="product.isNew || product.isHit || discountPercent" class="flex shrink-0 gap-1">
          <span v-if="discountPercent" class="rounded-sm bg-primary-700 px-2 py-0.5 text-[10px] font-medium text-white">-{{ discountPercent }}%</span>
          <span v-if="product.isNew" class="rounded-sm bg-secondary-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white">New</span>
          <span v-if="product.isHit" class="rounded-sm bg-primary-300 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-secondary-900">Hit</span>
        </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-base font-semibold text-secondary-900">{{ price }} ₴</span>
          <span v-if="hasOldPrice" class="text-xs text-secondary-400 line-through">{{ product.oldPrice }} ₴</span>
        </div>

        <div v-if="isSizeSheetOpen && sizes.length" class="mt-3">
          <div class="mb-2 flex items-center justify-between text-xs text-secondary-500">
            <span>Розмір</span>
            <button type="button" class="font-medium text-primary-700" @click="isSizeChartOpen = true">Таблиця розмірів</button>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <button
                v-for="size in sizes"
                :key="size.id"
                type="button"
                class="h-11 rounded-sm border text-sm transition-colors"
                :class="selectedSizeId === size.id ? 'border-secondary-900 bg-secondary-900 text-white' : 'border-secondary-300 text-secondary-900'"
                @click="selectSize(size.id); isSizeSheetOpen = false"
            >
              {{ size.name }}
            </button>
          </div>
        </div>

        <div class="mt-2 flex items-center gap-3">
          <button
              type="button"
              class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 transition-colors"
              :class="isFavorite ? 'text-primary-700' : 'text-secondary-800'"
              aria-label="Обране"
              @click="toggleFavorite"
          >
            <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" size="22" />
          </button>
          <BBtn
              v-if="sizes.length && !selectedSizeId"
              variant="primary"
              size="md"
              block
              @click="isSizeSheetOpen = true"
          >
            Обрати розмір
          </BBtn>
          <div v-else class="min-w-0 flex-1">
            <AddToCartBtn
                :variant-id="currentVariant?.id ?? null"
                :disabled="!isPurchasable"
            />
          </div>
        </div>
      </div>

      <div class="fixed bottom-24 right-3 z-30 flex flex-col gap-2 md:bottom-6 md:right-6">
        <button
            v-if="showScrollTop"
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-full bg-pink-50 text-gray-900 shadow-md transition-colors hover:bg-pink-100 md:h-12 md:w-12"
            aria-label="Наверх"
            @click="scrollToTop"
        >
          <Icon name="mdi:arrow-up" size="20" />
        </button>
      </div>

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

      <section v-if="recentToShow.length" class="store-container mt-12">
        <h2 class="mb-4 text-lg font-semibold">Ви переглядали</h2>
        <div v-drag-scroll class="flex gap-4 overflow-x-auto pb-2">
          <NuxtLink
            v-for="i in recentToShow"
            :key="i.slug"
            :to="`/product/${i.slug}`"
            class="w-32 shrink-0"
          >
            <img v-if="i.image" :src="i.image" :alt="i.name" class="aspect-[3/4] w-full rounded object-cover">
            <p class="mt-1 line-clamp-2 text-xs text-gray-700">{{ i.name }}</p>
            <p class="text-sm font-semibold">{{ i.price }} ₴</p>
          </NuxtLink>
        </div>
      </section>

    </template>
  </div>
</template>

<style scoped>
.product-page-grid {
  display: grid;
  grid-template-columns: auto minmax(360px, 560px);
  justify-content: center;
  align-items: start;
  gap: 56px;
}

/* Фото 3:4 цілком вміщується у висоту екрана (мінус шапка), щоб товар було видно одразу */
@media (min-width: 1024px) {
  .product-page-gallery {
    width: min(58vw, calc((100svh - 14rem) * 0.75 + 84px));
  }
}

/* Фото «липне» під шапкою, поки гортаємо довгий опис праворуч — без порожнечі під галереєю */
@media (min-width: 768px) {
  .product-page-gallery {
    position: sticky;
    top: 8.5rem;
  }
}

/* Планшет: дві колонки (фото + опис) замість однієї з порожніми полями */
@media (min-width: 768px) and (max-width: 1023px) {
  .product-page-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    justify-content: stretch;
    gap: 28px;
  }
}

/* Телефон: одна колонка, галерея на всю ширину екрана */
@media (max-width: 767px) {
  .product-page-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
    padding-top: 0;
  }

  .product-page-gallery {
    width: calc(100% + 2rem);
    margin-inline: -1rem;
  }
}

.size-glass-enter-active,
.size-glass-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.size-glass-enter-from,
.size-glass-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>

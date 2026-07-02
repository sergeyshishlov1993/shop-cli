<!--<script setup lang="ts">-->
<!--import { useProductDetail } from '~/modules/catalog/composables/useProductDetail'-->
<!--import { useCartStore } from '~/modules/cart/cartStore'-->
<!--import { useAuthStore } from '~/modules/auth/authStore'-->
<!--import { orderApi } from '~/modules/order/orderApi'-->

<!--const route = useRoute()-->
<!--const router = useRouter()-->
<!--const slug = computed(() => route.params.slug as string)-->

<!--const {-->
<!--  product,-->
<!--  relatedProducts,-->
<!--  loading,-->
<!--  colors,-->
<!--  sizes,-->
<!--  selectedColorId,-->
<!--  selectedSizeId,-->
<!--  currentVariant,-->
<!--  price,-->
<!--  availability,-->
<!--  media,-->
<!--  selectColor,-->
<!--  selectSize,-->
<!--} = useProductDetail(slug)-->

<!--const cartStore = useCartStore()-->
<!--const authStore = useAuthStore()-->
<!--const toast = useToast()-->

<!--const isMobileSizeSheetOpen = ref(false)-->
<!--const isSizeChartOpen = ref(false)-->
<!--const isFavorite = ref(false)-->
<!--const isQuickBuyOpen = ref(false)-->
<!--const isQuickBuySubmitting = ref(false)-->

<!--const quickBuyForm = ref({-->
<!--  name: '',-->
<!--  phone: '',-->
<!--})-->

<!--const breadcrumbs = computed(() => {-->
<!--  const items: { label: string; to?: string }[] = [-->
<!--    { label: 'Головна', to: '/' },-->
<!--    { label: 'Каталог', to: '/catalog' },-->
<!--  ]-->
<!--  if (product.value?.category) {-->
<!--    for (const crumb of product.value.category.breadcrumb) {-->
<!--      items.push({ label: crumb.name, to: `/catalog?category=${crumb.slug}` })-->
<!--    }-->
<!--  }-->
<!--  if (product.value) {-->
<!--    items.push({ label: product.value.name })-->
<!--  }-->
<!--  return items-->
<!--})-->

<!--const article = computed(() => currentVariant.value?.sku ?? product.value?.variants[0]?.sku ?? null)-->
<!--const similarProducts = computed(() => relatedProducts.value?.similar ?? [])-->
<!--const boughtTogetherProducts = computed(() => relatedProducts.value?.boughtTogether ?? [])-->

<!--const selectedColorName = computed(() => {-->
<!--  if (!selectedColorId.value) return null-->
<!--  return colors.value.find(c => c.id === selectedColorId.value)?.name ?? null-->
<!--})-->

<!--const availabilityLabel = computed(() => {-->
<!--  if (availability.value === 'IN_STOCK') return 'В наявності'-->
<!--  if (availability.value === 'LOW_STOCK') return 'Залишилось мало'-->
<!--  return 'Немає в наявності'-->
<!--})-->

<!--const showScrollTop = ref(false)-->
<!--const onScroll = () => {-->
<!--  showScrollTop.value = window.scrollY > 600-->
<!--}-->

<!--const scrollToTop = () => {-->
<!--  window.scrollTo({ top: 0, behavior: 'smooth' })-->
<!--}-->

<!--onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))-->
<!--onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))-->

<!--function onSelectSize(id: number) {-->
<!--  selectSize(id)-->
<!--  isMobileSizeSheetOpen.value = false-->
<!--}-->

<!--function toggleFavorite() {-->
<!--  isFavorite.value = !isFavorite.value-->
<!--}-->

<!--function openQuickBuy() {-->
<!--  if (!currentVariant.value) return-->
<!--  const user = authStore.user-->
<!--  quickBuyForm.value = {-->
<!--    name: user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : '',-->
<!--    phone: user?.phone ?? '',-->
<!--  }-->
<!--  isQuickBuyOpen.value = true-->
<!--}-->

<!--async function submitQuickBuy() {-->
<!--  if (!currentVariant.value) return-->
<!--  if (!quickBuyForm.value.name.trim() || !quickBuyForm.value.phone.trim()) return-->

<!--  isQuickBuySubmitting.value = true-->
<!--  try {-->
<!--    await cartStore.addToCart(currentVariant.value.id, 1)-->
<!--    const idempotencyKey = crypto.randomUUID()-->
<!--    await orderApi.create(-->
<!--        {-->
<!--          customerName: quickBuyForm.value.name.trim(),-->
<!--          customerPhone: quickBuyForm.value.phone.trim(),-->
<!--        },-->
<!--        idempotencyKey,-->
<!--    )-->
<!--    cartStore.clearCart()-->
<!--    isQuickBuyOpen.value = false-->
<!--    toast.success('Замовлення оформлено!')-->
<!--    await router.push('/')-->
<!--  } catch {-->
<!--    toast.error('Помилка при оформленні замовлення')-->
<!--  } finally {-->
<!--    isQuickBuySubmitting.value = false-->
<!--  }-->
<!--}-->

<!--watchEffect(() => {-->
<!--  if (!product.value) return-->
<!--  useSeoMeta({-->
<!--    title: product.value.seo.metaTitle ?? product.value.name,-->
<!--    description: product.value.seo.metaDescription ?? product.value.description ?? undefined,-->
<!--  })-->
<!--})-->
<!--</script>-->

<!--<template>-->
<!--  <div class="flex flex-col bg-white pb-32 md:pb-24">-->
<!--    <div v-if="loading && !product" class="flex justify-center py-24">-->
<!--      <BSpinner size="lg" />-->
<!--    </div>-->

<!--    <template v-else-if="product">-->
<!--      <section class="container mx-auto px-4 pt-4">-->
<!--        <BBreadcrumbs :items="breadcrumbs" />-->
<!--      </section>-->

<!--      <section class="container mx-auto grid gap-6 px-4 py-6 md:gap-10 md:py-10 lg:grid-cols-[1.1fr_1fr]">-->
<!--        <div class="flex flex-col gap-2">-->
<!--          <template v-if="media.length">-->
<!--            <div-->
<!--                v-for="item in media"-->
<!--                :key="item.id"-->
<!--                class="aspect-[3/4] w-full overflow-hidden bg-gray-50"-->
<!--            >-->
<!--              <img-->
<!--                  :src="getFileUrl(item.file, 'large')"-->
<!--                  :alt="product.name"-->
<!--                  class="h-full w-full object-cover"-->
<!--                  loading="lazy"-->
<!--              />-->
<!--            </div>-->
<!--          </template>-->
<!--          <div-->
<!--              v-else-->
<!--              class="flex aspect-[3/4] w-full items-center justify-center bg-gray-100 text-gray-400"-->
<!--          >-->
<!--            <Icon name="mdi:image-outline" size="64" />-->
<!--          </div>-->
<!--        </div>-->

<!--        <div class="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">-->
<!--          <h1 class="text-2xl font-light uppercase tracking-wide text-black md:text-3xl">-->
<!--            {{ product.name }}-->
<!--          </h1>-->

<!--          <div class="flex items-baseline gap-3">-->
<!--            <span class="text-2xl font-medium text-black">{{ price }} ₴</span>-->
<!--            <span v-if="product.oldPrice" class="text-base text-gray-400 line-through">-->
<!--              {{ product.oldPrice }} ₴-->
<!--            </span>-->
<!--          </div>-->

<!--          <p v-if="product.description" class="text-sm leading-relaxed text-gray-700 md:text-base">-->
<!--            {{ product.description }}-->
<!--          </p>-->

<!--          <div v-if="colors.length" class="flex flex-col gap-2">-->
<!--            <span class="text-sm text-gray-500">-->
<!--              Колір: <span class="text-gray-900">{{ selectedColorName }}</span>-->
<!--            </span>-->
<!--            <div class="flex flex-wrap gap-2">-->
<!--              <button-->
<!--                  v-for="color in colors"-->
<!--                  :key="color.id"-->
<!--                  type="button"-->
<!--                  class="h-10 w-10 rounded-full border-2 transition-all"-->
<!--                  :class="selectedColorId === color.id ? 'border-black' : 'border-gray-200 hover:border-gray-400'"-->
<!--                  :style="{ backgroundColor: color.hexCode ?? '#fff' }"-->
<!--                  :aria-label="color.name"-->
<!--                  @click="selectColor(color.id)"-->
<!--              />-->
<!--            </div>-->
<!--          </div>-->

<!--          <div v-if="sizes.length" class="flex flex-col gap-2">-->
<!--            <div class="flex items-center justify-between">-->
<!--              <span class="text-sm text-gray-500">Розмір</span>-->
<!--              <button-->
<!--                  type="button"-->
<!--                  class="text-sm text-gray-600 underline"-->
<!--                  @click="isSizeChartOpen = true"-->
<!--              >-->
<!--                Таблиця розмірів-->
<!--              </button>-->
<!--            </div>-->
<!--            <div class="flex flex-wrap gap-2">-->
<!--              <button-->
<!--                  v-for="size in sizes"-->
<!--                  :key="size.id"-->
<!--                  type="button"-->
<!--                  class="flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm transition-colors"-->
<!--                  :class="selectedSizeId === size.id-->
<!--                  ? 'border-black bg-black text-white'-->
<!--                  : 'border-gray-300 text-gray-900 hover:border-black'"-->
<!--                  @click="selectSize(size.id)"-->
<!--              >-->
<!--                {{ size.name }}-->
<!--              </button>-->
<!--            </div>-->
<!--          </div>-->

<!--          <div class="hidden flex-col gap-3 md:flex">-->
<!--            <AddToCartBtn :variant-id="currentVariant?.id ?? null" />-->
<!--            <button-->
<!--                type="button"-->
<!--                class="rounded-full border border-gray-300 px-6 py-3 text-sm uppercase tracking-wide text-gray-900 transition-colors hover:border-black disabled:opacity-50"-->
<!--                :disabled="!currentVariant"-->
<!--                @click="openQuickBuy"-->
<!--            >-->
<!--              Купити в 1 клік-->
<!--            </button>-->
<!--          </div>-->

<!--          <dl class="flex flex-col gap-2 border-t border-gray-200 pt-6 text-sm">-->
<!--            <div v-if="selectedColorName" class="flex gap-2">-->
<!--              <dt class="text-gray-500">Колір:</dt>-->
<!--              <dd class="text-gray-900">{{ selectedColorName }}</dd>-->
<!--            </div>-->
<!--            <div v-if="article" class="flex gap-2">-->
<!--              <dt class="text-gray-500">Артикул:</dt>-->
<!--              <dd class="text-gray-900">{{ article }}</dd>-->
<!--            </div>-->
<!--            <div v-if="product.material" class="flex gap-2">-->
<!--              <dt class="text-gray-500">Тканина:</dt>-->
<!--              <dd class="text-gray-900">{{ product.material }}</dd>-->
<!--            </div>-->
<!--            <div v-if="product.brand" class="flex gap-2">-->
<!--              <dt class="text-gray-500">Бренд:</dt>-->
<!--              <dd class="text-gray-900">{{ product.brand }}</dd>-->
<!--            </div>-->
<!--          </dl>-->

<!--          <div class="flex flex-col">-->
<!--            <BAccordion title="Склад та догляд">-->
<!--              <div class="flex flex-col gap-2 text-sm text-gray-700">-->
<!--                <p v-if="product.material">Матеріал: {{ product.material }}</p>-->
<!--                <p>Прання при температурі до 30°C</p>-->
<!--                <p>Не використовувати відбілювачі</p>-->
<!--              </div>-->
<!--            </BAccordion>-->

<!--            <BAccordion title="Доставка та оплата">-->
<!--              <div class="flex flex-col gap-2 text-sm text-gray-700">-->
<!--                <p>Нова Пошта — 1–3 дні</p>-->
<!--                <p>Укрпошта — 3–7 днів</p>-->
<!--                <p>Оплата карткою або при отриманні</p>-->
<!--              </div>-->
<!--            </BAccordion>-->
<!--          </div>-->
<!--        </div>-->
<!--      </section>-->

<!--      <section v-if="similarProducts.length" class="container mx-auto flex flex-col gap-6 px-4 pb-16">-->
<!--        <h2 class="text-xl font-light uppercase tracking-wide text-black md:text-2xl">-->
<!--          З чим носити-->
<!--        </h2>-->
<!--        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">-->
<!--          <ProductCard-->
<!--              v-for="item in similarProducts.slice(0, 4)"-->
<!--              :key="item.id"-->
<!--              :product="item"-->
<!--          />-->
<!--        </div>-->
<!--      </section>-->

<!--      <section v-if="boughtTogetherProducts.length" class="container mx-auto flex flex-col gap-6 px-4 pb-16">-->
<!--        <h2 class="text-xl font-light uppercase tracking-wide text-black md:text-2xl">-->
<!--          З цим купують-->
<!--        </h2>-->
<!--        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">-->
<!--          <ProductCard-->
<!--              v-for="item in boughtTogetherProducts.slice(0, 4)"-->
<!--              :key="item.id"-->
<!--              :product="item"-->
<!--          />-->
<!--        </div>-->
<!--      </section>-->

<!--      <section class="container mx-auto flex flex-col gap-6 px-4 pb-16">-->
<!--        <div class="flex items-center justify-between">-->
<!--          <h2 class="text-xl font-light uppercase tracking-wide text-black md:text-2xl">-->
<!--            Відгуки та питання-->
<!--          </h2>-->
<!--          <div v-if="product.averageRating" class="flex items-center gap-2">-->
<!--            <BRating :value="product.averageRating" readonly />-->
<!--            <span class="text-sm text-gray-600">({{ product.reviewCount }})</span>-->
<!--          </div>-->
<!--        </div>-->
<!--        <ReviewsList :product-id="product.id" />-->
<!--      </section>-->

<!--      &lt;!&ndash; Desktop sticky bar &ndash;&gt;-->
<!--      <div class="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-gray-200 bg-white md:block">-->
<!--        <div class="container mx-auto flex items-center gap-6 px-4 py-3">-->
<!--          <div class="flex min-w-0 flex-1 flex-col">-->
<!--            <span class="truncate text-sm text-gray-900">{{ product.name }}</span>-->
<!--            <span class="text-base font-medium text-black">{{ price }} ₴</span>-->
<!--          </div>-->

<!--          <div class="flex items-center gap-2">-->
<!--            <button-->
<!--                v-for="size in sizes"-->
<!--                :key="size.id"-->
<!--                type="button"-->
<!--                class="flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition-colors"-->
<!--                :class="selectedSizeId === size.id-->
<!--                ? 'border-black bg-black text-white'-->
<!--                : 'border-gray-300 text-gray-900 hover:border-black'"-->
<!--                @click="selectSize(size.id)"-->
<!--            >-->
<!--              {{ size.name }}-->
<!--            </button>-->
<!--          </div>-->

<!--          <div class="flex items-center gap-3">-->
<!--            <button-->
<!--                type="button"-->
<!--                class="rounded-full border border-gray-300 px-6 py-3 text-sm uppercase tracking-wide text-gray-900 transition-colors hover:border-black disabled:opacity-50"-->
<!--                :disabled="!currentVariant"-->
<!--                @click="openQuickBuy"-->
<!--            >-->
<!--              Купити в 1 клік-->
<!--            </button>-->
<!--            <AddToCartBtn :variant-id="currentVariant?.id ?? null" />-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->

<!--      &lt;!&ndash; Mobile sticky bar &ndash;&gt;-->
<!--      <div class="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white md:hidden">-->
<!--        <div class="flex items-center gap-2 px-3 py-3">-->
<!--          <button-->
<!--              type="button"-->
<!--              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-300"-->
<!--              aria-label="Обране"-->
<!--              @click="toggleFavorite"-->
<!--          >-->
<!--            <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" size="20" />-->
<!--          </button>-->
<!--          <button-->
<!--              type="button"-->
<!--              class="flex-1 rounded-full bg-black px-4 py-3 text-sm uppercase tracking-wide text-white"-->
<!--              @click="isMobileSizeSheetOpen = true"-->
<!--          >-->
<!--            {{ selectedSizeId ? `Додати в кошик — ${price} ₴` : 'Вибрати розмір' }}-->
<!--          </button>-->
<!--        </div>-->
<!--      </div>-->

<!--      &lt;!&ndash; FAB buttons &ndash;&gt;-->
<!--      <div class="fixed bottom-24 right-3 z-30 flex flex-col gap-2 md:bottom-24 md:right-4">-->
<!--        <button-->
<!--            v-if="showScrollTop"-->
<!--            type="button"-->
<!--            class="flex h-11 w-11 items-center justify-center rounded-full bg-pink-50 text-gray-900 shadow-md transition-colors hover:bg-pink-100 md:h-12 md:w-12"-->
<!--            aria-label="Наверх"-->
<!--            @click="scrollToTop"-->
<!--        >-->
<!--          <Icon name="mdi:arrow-up" size="20" />-->
<!--        </button>-->
<!--        <button-->
<!--            type="button"-->
<!--            class="hidden h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-gray-900 shadow-md transition-colors hover:bg-pink-100 md:flex"-->
<!--            aria-label="Обране"-->
<!--            @click="toggleFavorite"-->
<!--        >-->
<!--          <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" size="20" />-->
<!--        </button>-->
<!--      </div>-->

<!--      <div class="fixed bottom-24 left-3 z-30 md:bottom-24 md:left-4">-->
<!--        <button-->
<!--            type="button"-->
<!--            class="flex h-11 w-11 items-center justify-center rounded-full bg-pink-50 text-gray-900 shadow-md transition-colors hover:bg-pink-100 md:h-12 md:w-12"-->
<!--            aria-label="Чат"-->
<!--        >-->
<!--          <Icon name="mdi:message-text-outline" size="20" />-->
<!--        </button>-->
<!--      </div>-->

<!--      &lt;!&ndash; Mobile size sheet &ndash;&gt;-->
<!--      <BDrawer v-model="isMobileSizeSheetOpen" position="bottom" title="Оберіть розмір">-->
<!--        <div class="flex flex-col gap-6 p-4">-->
<!--          <div class="flex items-center justify-between">-->
<!--            <span class="text-lg font-medium text-black">{{ price }} ₴</span>-->
<!--            <button-->
<!--                type="button"-->
<!--                class="text-sm text-gray-600 underline"-->
<!--                @click="isSizeChartOpen = true"-->
<!--            >-->
<!--              Таблиця розмірів-->
<!--            </button>-->
<!--          </div>-->

<!--          <div class="grid grid-cols-4 gap-2">-->
<!--            <button-->
<!--                v-for="size in sizes"-->
<!--                :key="size.id"-->
<!--                type="button"-->
<!--                class="flex h-12 items-center justify-center rounded-full border text-sm transition-colors"-->
<!--                :class="selectedSizeId === size.id-->
<!--                ? 'border-black bg-black text-white'-->
<!--                : 'border-gray-300 text-gray-900'"-->
<!--                @click="onSelectSize(size.id)"-->
<!--            >-->
<!--              {{ size.name }}-->
<!--            </button>-->
<!--          </div>-->

<!--          <AddToCartBtn :variant-id="currentVariant?.id ?? null" />-->

<!--          <button-->
<!--              type="button"-->
<!--              class="w-full rounded-full border border-gray-300 py-3 text-sm uppercase tracking-wide text-gray-900 transition-colors hover:border-black disabled:opacity-50"-->
<!--              :disabled="!currentVariant"-->
<!--              @click="isMobileSizeSheetOpen = false; openQuickBuy()"-->
<!--          >-->
<!--            Купити в 1 клік-->
<!--          </button>-->
<!--        </div>-->
<!--      </BDrawer>-->

<!--      &lt;!&ndash; Size chart modal &ndash;&gt;-->
<!--      <BModal v-model="isSizeChartOpen" title="Таблиця розмірів">-->
<!--        <div class="p-4">-->
<!--          <div v-if="sizes.length" class="overflow-x-auto">-->
<!--            <table class="w-full text-sm">-->
<!--              <thead>-->
<!--              <tr class="border-b border-gray-200">-->
<!--                <th class="px-3 py-2 text-left font-medium text-gray-500">Розмір</th>-->
<!--                <th class="px-3 py-2 text-left font-medium text-gray-500">Тип</th>-->
<!--              </tr>-->
<!--              </thead>-->
<!--              <tbody>-->
<!--              <tr-->
<!--                  v-for="size in sizes"-->
<!--                  :key="size.id"-->
<!--                  class="border-b border-gray-100"-->
<!--              >-->
<!--                <td class="px-3 py-2 text-gray-900">{{ size.name }}</td>-->
<!--                <td class="px-3 py-2 text-gray-600">{{ size.sizeType }}</td>-->
<!--              </tr>-->
<!--              </tbody>-->
<!--            </table>-->
<!--          </div>-->
<!--          <p v-else class="text-sm text-gray-500">Розміри відсутні</p>-->
<!--        </div>-->
<!--      </BModal>-->

<!--      &lt;!&ndash; Quick buy modal &ndash;&gt;-->
<!--      <BModal v-model="isQuickBuyOpen" title="Купити в 1 клік">-->
<!--        <div class="flex flex-col gap-4 p-4">-->
<!--          <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">-->
<!--            <span class="text-sm text-gray-700">{{ product.name }}</span>-->
<!--            <span class="ml-auto text-sm font-medium text-black">{{ price }} ₴</span>-->
<!--          </div>-->

<!--          <BInput-->
<!--              v-model="quickBuyForm.name"-->
<!--              label="Ім'я та прізвище"-->
<!--              placeholder="Введіть ім'я"-->
<!--          />-->

<!--          <BInput-->
<!--              v-model="quickBuyForm.phone"-->
<!--              label="Телефон"-->
<!--              placeholder="+380"-->
<!--          />-->
<!--        </div>-->

<!--        <template #footer>-->
<!--          <BBtn-->
<!--              variant="primary"-->
<!--              block-->
<!--              :loading="isQuickBuySubmitting"-->
<!--              :disabled="!quickBuyForm.name.trim() || !quickBuyForm.phone.trim()"-->
<!--              @click="submitQuickBuy"-->
<!--          >-->
<!--            Оформити замовлення-->
<!--          </BBtn>-->
<!--        </template>-->
<!--      </BModal>-->
<!--    </template>-->
<!--  </div>-->
<!--</template>-->

<script setup lang="ts">
import { useProductDetail } from '~/modules/catalog/composables/useProductDetail'
import { useCartStore } from '~/modules/cart/cartStore'
import { useAuthStore } from '~/modules/auth/authStore'
import { orderApi } from '~/modules/order/orderApi'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

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
const toast = useToast()

const isMobileSizeSheetOpen = ref(false)
const isSizeChartOpen = ref(false)
const isFavorite = ref(false)
const isQuickBuyOpen = ref(false)
const isQuickBuySubmitting = ref(false)
const isGalleryOpen = ref(false)
const galleryIndex = ref(0)

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

const showScrollTop = ref(false)
const onScroll = () => {
  showScrollTop.value = window.scrollY > 600
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

function onSelectSize(id: number) {
  selectSize(id)
  isMobileSizeSheetOpen.value = false
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value
}

function openGallery(index: number) {
  galleryIndex.value = index
  isGalleryOpen.value = true
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

watchEffect(() => {
  if (!product.value) return
  useSeoMeta({
    title: product.value.seo.metaTitle ?? product.value.name,
    description: product.value.seo.metaDescription ?? product.value.description ?? undefined,
  })
})
</script>

<template>
  <div class="flex flex-col bg-white pb-32 md:pb-24">
    <div v-if="loading && !product" class="flex justify-center py-24">
      <BSpinner size="lg" />
    </div>

    <template v-else-if="product">
      <section class="container mx-auto px-4 pt-4">
        <BBreadcrumbs :items="breadcrumbs" />
      </section>

      <section class="container mx-auto grid gap-6 px-4 py-6 md:gap-10 md:py-10 lg:grid-cols-[1.1fr_1fr]">
        <div class="flex flex-col gap-2">
          <BSlider
              v-if="media.length"
              :items="media"
              mode="product"
              :alt="product.name"
              @open-gallery="openGallery"
          />
          <div
              v-else
              class="flex aspect-[3/4] w-full items-center justify-center bg-gray-100 text-gray-400"
          >
            <Icon name="mdi:image-outline" size="64" />
          </div>
        </div>

        <div class="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <h1 class="text-2xl font-light uppercase tracking-wide text-black md:text-3xl">
            {{ product.name }}
          </h1>

          <div class="flex items-baseline gap-3">
            <span class="text-2xl font-medium text-black">{{ price }} ₴</span>
            <span v-if="product.oldPrice" class="text-base text-gray-400 line-through">
              {{ product.oldPrice }} ₴
            </span>
          </div>

          <p v-if="product.description" class="text-sm leading-relaxed text-gray-700 md:text-base">
            {{ product.description }}
          </p>

          <div v-if="colors.length" class="flex flex-col gap-2">
            <span class="text-sm text-gray-500">
              Колір: <span class="text-gray-900">{{ selectedColorName }}</span>
            </span>
            <div class="flex flex-wrap gap-2">
              <button
                  v-for="color in colors"
                  :key="color.id"
                  type="button"
                  class="h-10 w-10 rounded-full border-2 transition-all"
                  :class="selectedColorId === color.id ? 'border-black' : 'border-gray-200 hover:border-gray-400'"
                  :style="{ backgroundColor: color.hexCode ?? '#fff' }"
                  :aria-label="color.name"
                  @click="selectColor(color.id)"
              />
            </div>
          </div>

          <div v-if="sizes.length" class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Розмір</span>
              <button
                  type="button"
                  class="text-sm text-gray-600 underline"
                  @click="isSizeChartOpen = true"
              >
                Таблиця розмірів
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                  v-for="size in sizes"
                  :key="size.id"
                  type="button"
                  class="flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm transition-colors"
                  :class="selectedSizeId === size.id
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 text-gray-900 hover:border-black'"
                  @click="selectSize(size.id)"
              >
                {{ size.name }}
              </button>
            </div>
          </div>

          <div class="hidden flex-col gap-3 md:flex">
            <AddToCartBtn :variant-id="currentVariant?.id ?? null" />
            <button
                type="button"
                class="rounded-full border border-gray-300 px-6 py-3 text-sm uppercase tracking-wide text-gray-900 transition-colors hover:border-black disabled:opacity-50"
                :disabled="!currentVariant"
                @click="openQuickBuy"
            >
              Купити в 1 клік
            </button>
          </div>

          <dl class="flex flex-col gap-2 border-t border-gray-200 pt-6 text-sm">
            <div v-if="selectedColorName" class="flex gap-2">
              <dt class="text-gray-500">Колір:</dt>
              <dd class="text-gray-900">{{ selectedColorName }}</dd>
            </div>
            <div v-if="article" class="flex gap-2">
              <dt class="text-gray-500">Артикул:</dt>
              <dd class="text-gray-900">{{ article }}</dd>
            </div>
            <div v-if="product.material" class="flex gap-2">
              <dt class="text-gray-500">Тканина:</dt>
              <dd class="text-gray-900">{{ product.material }}</dd>
            </div>
            <div v-if="product.brand" class="flex gap-2">
              <dt class="text-gray-500">Бренд:</dt>
              <dd class="text-gray-900">{{ product.brand }}</dd>
            </div>
          </dl>

          <div class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <Icon name="mdi:credit-card-outline" size="24" class="text-gray-700" />
            <div class="flex flex-col text-sm">
              <span class="font-medium text-gray-900">Оплата частинами</span>
              <span class="text-gray-600">Monobank, ПриватБанк — до 12 місяців</span>
            </div>
          </div>

          <div class="flex flex-col">
            <BAccordion title="Склад та догляд">
              <div class="flex flex-col gap-2 text-sm text-gray-700">
                <p v-if="product.material">Матеріал: {{ product.material }}</p>
                <p>Прання при температурі до 30°C</p>
                <p>Не використовувати відбілювачі</p>
              </div>
            </BAccordion>

            <BAccordion title="Доставка та оплата">
              <div class="flex flex-col gap-2 text-sm text-gray-700">
                <p>Нова Пошта — 1–3 дні</p>
                <p>Укрпошта — 3–7 днів</p>
                <p>Оплата карткою або при отриманні</p>
              </div>
            </BAccordion>
          </div>
        </div>
      </section>

      <section v-if="similarProducts.length" class="container mx-auto flex flex-col gap-6 px-4 pb-16">
        <h2 class="text-xl font-light uppercase tracking-wide text-black md:text-2xl">
          З чим носити
        </h2>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <ProductCard
              v-for="item in similarProducts.slice(0, 4)"
              :key="item.id"
              :product="item"
          />
        </div>
      </section>

      <section v-if="boughtTogetherProducts.length" class="container mx-auto flex flex-col gap-6 px-4 pb-16">
        <h2 class="text-xl font-light uppercase tracking-wide text-black md:text-2xl">
          З цим купують
        </h2>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <ProductCard
              v-for="item in boughtTogetherProducts.slice(0, 4)"
              :key="item.id"
              :product="item"
          />
        </div>
      </section>

      <section class="container mx-auto flex flex-col gap-6 px-4 pb-16">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-light uppercase tracking-wide text-black md:text-2xl">
            Відгуки та питання
          </h2>
          <div v-if="product.averageRating" class="flex items-center gap-2">
            <BRating :value="product.averageRating" readonly />
            <span class="text-sm text-gray-600">({{ product.reviewCount }})</span>
          </div>
        </div>
        <ReviewsList :product-id="product.id" />
      </section>

      <div class="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-gray-200 bg-white md:block">
        <div class="container mx-auto flex items-center gap-6 px-4 py-3">
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-sm text-gray-900">{{ product.name }}</span>
            <span class="text-base font-medium text-black">{{ price }} ₴</span>
          </div>

          <div class="flex items-center gap-2">
            <button
                v-for="size in sizes"
                :key="size.id"
                type="button"
                class="flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition-colors"
                :class="selectedSizeId === size.id
                ? 'border-black bg-black text-white'
                : 'border-gray-300 text-gray-900 hover:border-black'"
                @click="selectSize(size.id)"
            >
              {{ size.name }}
            </button>
          </div>

          <div class="flex items-center gap-3">
            <button
                type="button"
                class="rounded-full border border-gray-300 px-6 py-3 text-sm uppercase tracking-wide text-gray-900 transition-colors hover:border-black disabled:opacity-50"
                :disabled="!currentVariant"
                @click="openQuickBuy"
            >
              Купити в 1 клік
            </button>
            <AddToCartBtn :variant-id="currentVariant?.id ?? null" />
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white md:hidden">
        <div class="flex items-center gap-2 px-3 py-3">
          <button
              type="button"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-300"
              aria-label="Обране"
              @click="toggleFavorite"
          >
            <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" size="20" />
          </button>
          <button
              type="button"
              class="flex-1 rounded-full bg-black px-4 py-3 text-sm uppercase tracking-wide text-white"
              @click="isMobileSizeSheetOpen = true"
          >
            {{ selectedSizeId ? `Додати в кошик — ${price} ₴` : 'Вибрати розмір' }}
          </button>
        </div>
      </div>

      <div class="fixed bottom-24 right-3 z-30 flex flex-col gap-2 md:bottom-24 md:right-4">
        <button
            v-if="showScrollTop"
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-full bg-pink-50 text-gray-900 shadow-md transition-colors hover:bg-pink-100 md:h-12 md:w-12"
            aria-label="Наверх"
            @click="scrollToTop"
        >
          <Icon name="mdi:arrow-up" size="20" />
        </button>
        <button
            type="button"
            class="hidden h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-gray-900 shadow-md transition-colors hover:bg-pink-100 md:flex"
            aria-label="Обране"
            @click="toggleFavorite"
        >
          <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" size="20" />
        </button>
      </div>

      <div class="fixed bottom-24 left-3 z-30 md:bottom-24 md:left-4">
        <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-full bg-pink-50 text-gray-900 shadow-md transition-colors hover:bg-pink-100 md:h-12 md:w-12"
            aria-label="Чат"
        >
          <Icon name="mdi:message-text-outline" size="20" />
        </button>
      </div>

      <BDrawer v-model="isMobileSizeSheetOpen" position="bottom" title="Оберіть розмір">
        <div class="flex flex-col gap-6 p-4">
          <div class="flex items-center justify-between">
            <span class="text-lg font-medium text-black">{{ price }} ₴</span>
            <button
                type="button"
                class="text-sm text-gray-600 underline"
                @click="isSizeChartOpen = true"
            >
              Таблиця розмірів
            </button>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <button
                v-for="size in sizes"
                :key="size.id"
                type="button"
                class="flex h-12 items-center justify-center rounded-full border text-sm transition-colors"
                :class="selectedSizeId === size.id
                ? 'border-black bg-black text-white'
                : 'border-gray-300 text-gray-900'"
                @click="onSelectSize(size.id)"
            >
              {{ size.name }}
            </button>
          </div>

          <AddToCartBtn :variant-id="currentVariant?.id ?? null" />

          <button
              type="button"
              class="w-full rounded-full border border-gray-300 py-3 text-sm uppercase tracking-wide text-gray-900 transition-colors hover:border-black disabled:opacity-50"
              :disabled="!currentVariant"
              @click="isMobileSizeSheetOpen = false; openQuickBuy()"
          >
            Купити в 1 клік
          </button>
        </div>
      </BDrawer>

      <BModal v-model="isSizeChartOpen" title="Таблиця розмірів">
        <div class="p-4">
          <div v-if="sizes.length" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
              <tr class="border-b border-gray-200">
                <th class="px-3 py-2 text-left font-medium text-gray-500">Розмір</th>
                <th class="px-3 py-2 text-left font-medium text-gray-500">Тип</th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="size in sizes"
                  :key="size.id"
                  class="border-b border-gray-100"
              >
                <td class="px-3 py-2 text-gray-900">{{ size.name }}</td>
                <td class="px-3 py-2 text-gray-600">{{ size.sizeType }}</td>
              </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-sm text-gray-500">Розміри відсутні</p>
        </div>
      </BModal>

      <BModal v-model="isQuickBuyOpen" title="Купити в 1 клік">
        <div class="flex flex-col gap-4 p-4">
          <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <span class="text-sm text-gray-700">{{ product.name }}</span>
            <span class="ml-auto text-sm font-medium text-black">{{ price }} ₴</span>
          </div>

          <BInput
              v-model="quickBuyForm.name"
              label="Ім'я та прізвище"
              placeholder="Введіть ім'я"
          />

          <BInput
              v-model="quickBuyForm.phone"
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

      <BModal v-model="isGalleryOpen" fullscreen>
        <BSlider
            :items="media"
            mode="gallery"
            :alt="product.name"
            :initial-index="galleryIndex"
            @close="isGalleryOpen = false"
        />
      </BModal>
    </template>
  </div>
</template>
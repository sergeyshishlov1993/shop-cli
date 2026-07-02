<script setup lang="ts">
import { useCatalogStore } from '~/modules/catalog/catalogStore'
import { useCartStore } from '~/modules/cart/cartStore'

interface Props {
  product: ProductListItem
}

const props = defineProps<Props>()

const catalogStore = useCatalogStore()
const cartStore = useCartStore()
const router = useRouter()

const isModalOpen = ref(false)
const selectedVariant = ref<StorefrontVariant | null>(null)
const quantity = ref(1)
const loadingVariants = ref(false)
const isAdded = ref(false)
const isHovered = ref(false)
const selectedColor = ref<number | null>(null)
const selectedSizeName = ref<string | null>(null)

const productDetail = computed(() => catalogStore.currentProduct)
const variants = computed(() => productDetail.value?.variants ?? [])

const colors = computed(() => {
  const map = new Map<number, StorefrontVariant['color']>()
  for (const v of variants.value) {
    if (v.color && !map.has(v.color.id)) {
      map.set(v.color.id, v.color)
    }
  }
  return [...map.values()]
})

const filteredByColor = computed(() => {
  if (!selectedColor.value) return variants.value
  return variants.value.filter(v => v.color?.id === selectedColor.value)
})

const uniqueSizes = computed(() => {
  const map = new Map<string, StorefrontVariant>()
  for (const v of filteredByColor.value) {
    const key = v.size?.name ?? v.sku
    if (!map.has(key)) {
      map.set(key, v)
    }
  }
  return [...map.values()]
})

const maxQuantity = computed(() => selectedVariant.value?.availableQty ?? 1)

const hasDiscount = computed(() => props.product.oldPrice !== null)

const discountPercent = computed(() => {
  if (!props.product.oldPrice) return 0
  return Math.round((1 - props.product.effectivePrice / props.product.oldPrice) * 100)
})

const mainImageUrl = computed(() => {
  const img = props.product.mainImage
  return img?.s3KeyMedium ?? img?.s3Key ?? null
})

const hoverImageUrl = computed(() => {
  const img = props.product.hoverImage
  return img?.s3KeyMedium ?? img?.s3Key ?? null
})

const displayImage = computed(() => {
  if (isHovered.value && hoverImageUrl.value) return hoverImageUrl.value
  return mainImageUrl.value
})

function resolveVariant() {
  const match = variants.value.find(v =>
      (!selectedColor.value || v.color?.id === selectedColor.value) &&
      (!selectedSizeName.value || (v.size?.name ?? v.sku) === selectedSizeName.value),
  )
  selectedVariant.value = match ?? null
  if (selectedVariant.value && quantity.value > selectedVariant.value.availableQty) {
    quantity.value = Math.max(1, selectedVariant.value.availableQty)
  }
}

function selectColor(colorId: number) {
  selectedColor.value = colorId
  resolveVariant()
}

function selectSize(sizeName: string) {
  selectedSizeName.value = sizeName
  resolveVariant()
}

async function openQuickAdd() {
  isModalOpen.value = true
  isAdded.value = false
  loadingVariants.value = true
  try {
    await catalogStore.fetchProductBySlug(props.product.slug)

    if (colors.value.length >= 1) {
      selectedColor.value = colors.value[0]!.id
    }

    const sizeNames = new Set(variants.value.map(v => v.size?.name ?? v.sku))
    if (sizeNames.size === 1) {
      selectedSizeName.value = [...sizeNames][0]
    }

    resolveVariant()

    if (variants.value.length === 1) {
      selectedVariant.value = variants.value[0]
    }
  } finally {
    loadingVariants.value = false
  }
}

function closeModal() {
  isModalOpen.value = false
  selectedVariant.value = null
  selectedColor.value = null
  selectedSizeName.value = null
  quantity.value = 1
  isAdded.value = false
}

async function addToCart() {
  if (!selectedVariant.value) return
  await cartStore.addToCart(selectedVariant.value.id, quantity.value)
  isAdded.value = true
}

function goToCart() {
  closeModal()
  router.push('/cart')
}

function incrementQuantity() {
  if (quantity.value < maxQuantity.value) {
    quantity.value++
  }
}

function decrementQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function toggleWishlist() {
  // TODO: wishlist integration
}
</script>

<template>
  <div class="group relative flex flex-col">
    <NuxtLink
        :to="`/product/${product.slug}`"
        class="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary-100"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
    >
      <img
          v-if="displayImage"
          :src="displayImage"
          :alt="product.name"
          class="h-full w-full object-cover transition-opacity duration-300"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-secondary-400">
        <Icon name="mdi:image-outline" size="48" />
      </div>

      <div class="absolute left-3 top-3 flex flex-col gap-1">
        <span
            v-if="hasDiscount"
            class="rounded-lg bg-danger px-2 py-0.5 text-xs font-semibold text-white"
        >
          -{{ discountPercent }}%
        </span>
        <span
            v-if="product.isNew"
            class="rounded-lg bg-primary-500 px-2 py-0.5 text-xs font-semibold text-white"
        >
          New
        </span>
        <span
            v-if="product.isHit"
            class="rounded-lg bg-warning px-2 py-0.5 text-xs font-semibold text-white"
        >
          Hit
        </span>
      </div>

      <button
          class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-secondary-500 shadow-sm transition-colors hover:text-danger"
          @click.prevent="toggleWishlist"
      >
        <Icon name="mdi:heart-outline" size="20" />
      </button>
    </NuxtLink>

    <div class="mt-3 flex flex-col gap-1">
      <span v-if="product.brand" class="text-xs text-secondary-500">
        {{ product.brand }}
      </span>

      <NuxtLink
          :to="`/product/${product.slug}`"
          class="text-sm font-medium text-secondary-800 transition-colors hover:text-primary-500"
      >
        {{ product.name }}
      </NuxtLink>

      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-secondary-900">
          {{ product.effectivePrice }} ₴
        </span>
        <span v-if="hasDiscount" class="text-xs text-secondary-400 line-through">
          {{ product.oldPrice }} ₴
        </span>
      </div>

      <div v-if="product.averageRating" class="flex items-center gap-1">
        <Icon name="mdi:star" size="14" class="text-warning" />
        <span class="text-xs text-secondary-500">
          {{ product.averageRating }} ({{ product.reviewCount }})
        </span>
      </div>

      <BBtn
          variant="primary"
          size="sm"
          block
          class="mt-2"
          @click="openQuickAdd"
      >
        <Icon name="mdi:cart-outline" size="16" />
        Додати в кошик
      </BBtn>
    </div>

    <BModal
        v-model="isModalOpen"
        title="Оберіть варіант"
        size="md"
        @update:model-value="!$event && closeModal()"
    >
      <div v-if="loadingVariants" class="flex items-center justify-center py-8">
        <BSpinner size="lg" />
      </div>

      <div v-else class="flex flex-col gap-5">
        <div class="flex gap-4">
          <div class="h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary-100">
            <img
                v-if="mainImageUrl"
                :src="mainImageUrl"
                :alt="product.name"
                class="h-full w-full object-cover"
            />
          </div>
          <div class="flex flex-col gap-1">
            <span v-if="product.brand" class="text-xs text-secondary-500">
              {{ product.brand }}
            </span>
            <span class="text-sm font-medium text-secondary-800">
              {{ product.name }}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-secondary-900">
                {{ selectedVariant?.price ?? product.effectivePrice }} ₴
              </span>
              <span v-if="hasDiscount" class="text-xs text-secondary-400 line-through">
                {{ product.oldPrice }} ₴
              </span>
            </div>
          </div>
        </div>

        <div v-if="colors.length > 0" class="flex flex-col gap-2">
          <span class="text-sm font-medium text-secondary-700">Колір</span>
          <div class="flex flex-wrap gap-2">
            <button
                v-for="color in colors"
                :key="color!.id"
                class="h-8 w-8 rounded-full border-2 transition-colors"
                :class="selectedColor === color!.id ? 'border-primary-500' : 'border-secondary-200'"
                :style="{ backgroundColor: color!.hexCode ?? '#ccc' }"
                :title="color!.name"
                @click="selectColor(color!.id)"
            />
          </div>
        </div>

        <div v-if="uniqueSizes.length > 0" class="flex flex-col gap-2">
          <span class="text-sm font-medium text-secondary-700">Розмір</span>
          <div class="flex flex-wrap gap-2">
            <button
                v-for="variant in uniqueSizes"
                :key="variant.size?.name ?? variant.sku"
                class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
                :class="
                selectedSizeName === (variant.size?.name ?? variant.sku)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-secondary-200 text-secondary-700 hover:border-secondary-400'
              "
                @click="selectSize(variant.size?.name ?? variant.sku)"
            >
              {{ variant.size?.name ?? variant.sku }}
            </button>
          </div>
        </div>

        <div v-if="selectedVariant?.availabilityStatus === 'LOW_STOCK'" class="flex items-center gap-1 text-xs text-warning">
          <Icon name="mdi:alert-circle-outline" size="14" />
          <span>Закінчується — залишилось {{ selectedVariant.availableQty }} шт.</span>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-sm font-medium text-secondary-700">Кількість</span>
          <div class="flex items-center gap-3">
            <button
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary-200 text-secondary-700 transition-colors hover:border-secondary-400 disabled:opacity-35"
                :disabled="quantity <= 1"
                @click="decrementQuantity"
            >
              −
            </button>
            <span class="min-w-[20px] text-center text-sm font-medium">{{ quantity }}</span>
            <button
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary-200 text-secondary-700 transition-colors hover:border-secondary-400 disabled:opacity-35"
                :disabled="!selectedVariant || quantity >= maxQuantity"
                @click="incrementQuantity"
            >
              +
            </button>
          </div>
          <span
              v-if="selectedVariant"
              class="text-xs text-secondary-400"
          >
            Доступно: {{ selectedVariant.availableQty }} шт.
          </span>
        </div>
      </div>

      <template #footer>
        <div v-if="!isAdded" class="w-full">
          <BBtn
              variant="primary"
              block
              :disabled="!selectedVariant"
              :loading="cartStore.isLoading"
              @click="addToCart"
          >
            <Icon name="mdi:cart-outline" size="18" />
            Додати в кошик
          </BBtn>
        </div>
        <div v-else class="flex w-full gap-3">
          <BBtn
              variant="outline"
              block
              @click="closeModal"
          >
            Продовжити покупки
          </BBtn>
          <BBtn
              variant="primary"
              block
              @click="goToCart"
          >
            Перейти в кошик
          </BBtn>
        </div>
      </template>
    </BModal>
  </div>
</template>
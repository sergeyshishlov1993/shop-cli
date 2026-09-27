<script setup lang="ts">
import { catalogApi } from '~/modules/catalog/catalogApi'
import { useCartStore } from '~/modules/cart/cartStore'

// Швидке додавання в кошик: вибір кольору/розміру/кількості (каталог, обране)
const props = defineProps<{ product: ProductListItem }>()
const open = defineModel<boolean>('open', { default: false })

const cartStore = useCartStore()
const router = useRouter()
const toast = useToast()

const selectedVariant = ref<StorefrontVariant | null>(null)
const quantity = ref(1)
const loadingVariants = ref(false)
const isAdded = ref(false)
const selectedColor = ref<number | null>(null)
const selectedSizeName = ref<string | null>(null)
// Локально, а не в catalogStore.currentProduct: інакше швидке додавання з рейки підміняє товар сторінки
const productDetail = ref<ProductDetail | null>(null)
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
const mainImageUrl = computed(() => getFileUrl(props.product.mainImage, 'medium') || null)

function showAdded(meta: (string | null | undefined)[], price: number) {
  toast.product({
    image: getFileUrl(props.product.mainImage, 'thumb') || null,
    title: 'Товар додано в кошик',
    name: props.product.name,
    meta: meta.filter(Boolean).join(' · ') || null,
    price,
  })
}

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
  isAdded.value = false
  loadingVariants.value = true
  try {
    productDetail.value = await catalogApi.getProductBySlug(props.product.slug)

    // За замовчуванням — перший доступний колір і розмір
    const firstAvailable = variants.value.find(v => v.availableQty > 0)
    selectedColor.value = firstAvailable?.color?.id ?? colors.value[0]?.id ?? null
    const sized = uniqueSizes.value.find(v => v.availableQty > 0)
    selectedSizeName.value = sized ? (sized.size?.name ?? sized.sku) : null

    resolveVariant()
  } finally {
    loadingVariants.value = false
  }
}

function closeModal() {
  open.value = false
  selectedVariant.value = null
  selectedColor.value = null
  selectedSizeName.value = null
  quantity.value = 1
  isAdded.value = false
}

async function addToCart() {
  const variant = selectedVariant.value
  if (!variant) return
  try {
    await cartStore.addToCart(variant.id, quantity.value)
    closeModal()
    showAdded([variant.color?.name, variant.size?.name], variant.price)
  }
  catch {
    toast.error('Не вдалося додати товар у кошик')
  }
}

function goToCart() {
  closeModal()
  router.push('/cart')
}

function incrementQuantity() {
  if (quantity.value < maxQuantity.value) quantity.value++
}

function decrementQuantity() {
  if (quantity.value > 1) quantity.value--
}

watch(open, (value) => {
  if (value) openQuickAdd()
}, { immediate: true })
</script>

<template>
  <BModal
      v-model="open"
      title="Оберіть варіант"
      size="md"
      on-top
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
              :class="selectedColor === color!.id ? 'border-secondary-900' : 'border-secondary-200'"
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
                ? 'border-secondary-900 bg-secondary-900 text-white'
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
</template>

import { storeToRefs } from 'pinia'
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useCatalogStore } from '~/modules/catalog/catalogStore'

export function useProductDetail(slug: MaybeRefOrGetter<string>) {
const store = useCatalogStore()
const { currentProduct, relatedProducts, loading } = storeToRefs(store)

const selectedColorId = ref<number | null>(null)
const selectedSizeId = ref<number | null>(null)

const variants = computed<StorefrontVariant[]>(
() => currentProduct.value?.variants ?? [],
)

const hasColors = computed(() => variants.value.some(v => v.color))
const hasSizes = computed(() => variants.value.some(v => v.size))

const colors = computed(() => {
const map = new Map<number, NonNullable<StorefrontVariant['color']>>()
for (const v of variants.value) {
if (v.color && !map.has(v.color.id)) map.set(v.color.id, v.color)
}
return [...map.values()]
})

const sizesForSelectedColor = computed(() => {
const map = new Map<number, NonNullable<StorefrontVariant['size']>>()
for (const v of variants.value) {
if (selectedColorId.value && v.color?.id !== selectedColorId.value) continue
if (v.size && !map.has(v.size.id)) map.set(v.size.id, v.size)
}
return [...map.values()]
})

const matchingVariants = computed(() => variants.value.filter(v =>
(!selectedColorId.value || v.color?.id === selectedColorId.value)
&& (!selectedSizeId.value || v.size?.id === selectedSizeId.value),
))

const currentVariant = computed<StorefrontVariant | null>(() => {
if (hasColors.value && !selectedColorId.value) return null
if (hasSizes.value && !selectedSizeId.value) return null
return matchingVariants.value.find(v => v.availableQty > 0) ?? null
})

const price = computed(
() => currentVariant.value?.price ?? currentProduct.value?.basePrice ?? 0,
)

const availability = computed<AvailabilityStatus>(() => {
const availableVariants = matchingVariants.value.filter(v => v.availableQty > 0)
if (!availableVariants.length) return 'OUT_OF_STOCK'
return availableVariants.some(v => v.availabilityStatus === 'IN_STOCK')
? 'IN_STOCK'
: 'LOW_STOCK'
})

const media = computed<ProductMedia[]>(() => {
const all = currentProduct.value?.media ?? []
const hoverVideo = currentProduct.value?.hoverVideo
const videoMedia: ProductMedia | null = hoverVideo
? {
id: -hoverVideo.id,
mediaType: 'VIDEO' as const,
isMain: true,
sortOrder: -1,
variantId: null,
file: hoverVideo,
}
: null
if (!selectedColorId.value) return videoMedia ? [videoMedia, ...all] : all
const variantIds = variants.value
.filter(v => v.color?.id === selectedColorId.value)
.map(v => v.id)
const filtered = all.filter(m => m.variantId && variantIds.includes(m.variantId))
const selectedMedia = filtered.length ? filtered : all
return videoMedia ? [videoMedia, ...selectedMedia] : selectedMedia
})

function selectColor(id: number) {
selectedColorId.value = id
if (!sizesForSelectedColor.value.some(s => s.id === selectedSizeId.value)) {
selectedSizeId.value = null
}
}

const selectSize = (id: number) => (selectedSizeId.value = id)

function isColorAvailable(colorId: number) {
return variants.value.some(v =>
v.color?.id === colorId
&& v.availableQty > 0
&& (!selectedSizeId.value || v.size?.id === selectedSizeId.value),
)
}

function isSizeAvailable(sizeId: number) {
return variants.value.some(v =>
v.size?.id === sizeId
&& v.availableQty > 0
&& (!selectedColorId.value || v.color?.id === selectedColorId.value),
)
}

watch(
() => toValue(slug),
async (value) => {
if (!value) return
const requests: Promise<unknown>[] = []
if (store.currentProduct?.slug !== value) {
requests.push(store.fetchProductBySlug(value))
}
if (store.currentProduct?.slug !== value || !store.relatedProducts) {
requests.push(store.fetchRelated(value))
}
if (requests.length) await Promise.all(requests)
 selectedSizeId.value = null
 selectedColorId.value = colors.value.find(color => isColorAvailable(color.id))?.id ?? colors.value[0]?.id ?? null
},
{ immediate: true },
)

return {
product: currentProduct,
relatedProducts,
loading,
colors,
sizes: sizesForSelectedColor,
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
}
}

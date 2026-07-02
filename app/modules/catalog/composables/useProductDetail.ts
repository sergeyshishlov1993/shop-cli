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

const currentVariant = computed<StorefrontVariant | null>(() => {
if (!selectedColorId.value && !selectedSizeId.value) return null
return variants.value.find(v =>
(!selectedColorId.value || v.color?.id === selectedColorId.value)
&& (!selectedSizeId.value || v.size?.id === selectedSizeId.value),
) ?? null
})

const price = computed(
() => currentVariant.value?.price ?? currentProduct.value?.basePrice ?? 0,
)

const availability = computed<AvailabilityStatus>(() => {
if (currentVariant.value) return currentVariant.value.availabilityStatus
if (!variants.value.length) return 'OUT_OF_STOCK'
return variants.value.some(v => v.availabilityStatus === 'IN_STOCK')
? 'IN_STOCK'
: 'LOW_STOCK'
})

const media = computed<ProductMedia[]>(() => {
const all = currentProduct.value?.media ?? []
if (!selectedColorId.value) return all
const variantIds = variants.value
.filter(v => v.color?.id === selectedColorId.value)
.map(v => v.id)
const filtered = all.filter(m => m.variantId && variantIds.includes(m.variantId))
return filtered.length ? filtered : all
})

function selectColor(id: number) {
selectedColorId.value = id
if (!sizesForSelectedColor.value.some(s => s.id === selectedSizeId.value)) {
selectedSizeId.value = null
}
}

function selectSize(id: number) {
selectedSizeId.value = id
}

watch(
() => toValue(slug),
async (value) => {
if (!value) return
await Promise.all([
store.fetchProductBySlug(value),
store.fetchRelated(value),
])
selectedColorId.value = colors.value[0]?.id ?? null
selectedSizeId.value = null
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
}
}

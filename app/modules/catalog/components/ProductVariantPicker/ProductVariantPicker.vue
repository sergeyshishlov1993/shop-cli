<script setup lang="ts">
interface Props {
  variants: StorefrontVariant[]
  lowStockThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  lowStockThreshold: 3,
})

const emit = defineEmits<{
  select: [variantId: number | null]
}>()

const selectedColorId = ref<number | null>(null)
const selectedSizeId = ref<number | null>(null)

const hasColors = computed(() => props.variants.some(v => v.color))
const hasSizes = computed(() => props.variants.some(v => v.size))

const colors = computed(() => {
  const map = new Map<number, NonNullable<StorefrontVariant['color']>>()
  for (const v of props.variants) {
    if (v.color && !map.has(v.color.id)) map.set(v.color.id, v.color)
  }
  return Array.from(map.values())
})

const sizes = computed(() => {
  const map = new Map<number, NonNullable<StorefrontVariant['size']>>()
  for (const v of props.variants) {
    if (v.size && !map.has(v.size.id)) map.set(v.size.id, v.size)
  }
  return Array.from(map.values())
})

const availableSizeIds = computed(() => {
  const ids = new Set<number>()
  for (const v of props.variants) {
    if (!v.size) continue
    if (selectedColorId.value && v.color?.id !== selectedColorId.value) continue
    ids.add(v.size.id)
  }
  return ids
})

const availableColorIds = computed(() => {
  const ids = new Set<number>()
  for (const v of props.variants) {
    if (!v.color) continue
    if (selectedSizeId.value && v.size?.id !== selectedSizeId.value) continue
    ids.add(v.color.id)
  }
  return ids
})

const selectedVariant = computed<StorefrontVariant | null>(() => {
  if (hasColors.value && !selectedColorId.value) return null
  if (hasSizes.value && !selectedSizeId.value) return null
  return (
      props.variants.find(v => {
        const colorMatch = hasColors.value ? v.color?.id === selectedColorId.value : true
        const sizeMatch = hasSizes.value ? v.size?.id === selectedSizeId.value : true
        return colorMatch && sizeMatch
      }) ?? null
  )
})

const stockLabel = computed(() => {
  if (!selectedVariant.value) return ''
  return selectedVariant.value.availabilityStatus === 'LOW_STOCK' ? 'Закінчується' : 'Є в наявності'
})

function selectColor(colorId: number) {
  selectedColorId.value = selectedColorId.value === colorId ? null : colorId
  if (selectedSizeId.value && !availableSizeIds.value.has(selectedSizeId.value)) {
    selectedSizeId.value = null
  }
}

function selectSize(sizeId: number) {
  if (!availableSizeIds.value.has(sizeId)) return
  selectedSizeId.value = selectedSizeId.value === sizeId ? null : sizeId
}

watch(selectedVariant, v => emit('select', v?.id ?? null))
</script>

<template>
  <div class="flex flex-col gap-5">
    <div v-if="hasColors" class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700">Колір:</span>
        <span v-if="selectedColorId" class="text-sm text-gray-500">
          {{ colors.find(c => c.id === selectedColorId)?.name }}
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
            v-for="color in colors"
            :key="color.id"
            type="button"
            :disabled="!availableColorIds.has(color.id)"
            :title="color.name"
            :class="[
            'h-10 w-10 rounded-full border-2 transition',
            selectedColorId === color.id ? 'border-primary-600 ring-2 ring-primary-200' : 'border-gray-200',
            !availableColorIds.has(color.id) && 'cursor-not-allowed opacity-30',
          ]"
            :style="{ backgroundColor: color.hexCode ?? '#e5e7eb' }"
            @click="selectColor(color.id)"
        />
      </div>
    </div>

    <div v-if="hasSizes" class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700">Розмір:</span>
        <span v-if="selectedSizeId" class="text-sm text-gray-500">
          {{ sizes.find(s => s.id === selectedSizeId)?.name }}
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
            v-for="size in sizes"
            :key="size.id"
            type="button"
            :disabled="!availableSizeIds.has(size.id)"
            :class="[
            'min-w-[48px] rounded-lg border px-3 py-2 text-sm font-medium transition',
            selectedSizeId === size.id
              ? 'border-primary-600 bg-primary-50 text-primary-700'
              : 'border-gray-200 text-gray-700 hover:border-gray-400',
            !availableSizeIds.has(size.id) && 'cursor-not-allowed opacity-40 line-through hover:border-gray-200',
          ]"
            @click="selectSize(size.id)"
        >
          {{ size.name }}
        </button>
      </div>
    </div>

    <div v-if="selectedVariant" class="flex flex-col gap-1 text-sm">
      <div class="flex items-center gap-2">
        <span
            :class="[
            'inline-block h-2 w-2 rounded-full',
            selectedVariant.availabilityStatus === 'IN_STOCK' && 'bg-success',
            selectedVariant.availabilityStatus === 'LOW_STOCK' && 'bg-warning',
          ]"
        />
        <span
            :class="[
            'font-medium',
            selectedVariant.availabilityStatus === 'IN_STOCK' && 'text-success',
            selectedVariant.availabilityStatus === 'LOW_STOCK' && 'text-warning',
          ]"
        >
          {{ stockLabel }}
        </span>
      </div>
      <span class="text-gray-500">Артикул: {{ selectedVariant.sku }}</span>
    </div>
  </div>
</template>
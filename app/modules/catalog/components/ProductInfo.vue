<script setup lang="ts">
interface Props {
product: ProductDetail
}

const props = defineProps<Props>()

const hasDiscount = computed(
() => props.product.oldPrice !== null && props.product.oldPrice > props.product.basePrice,
)

const characteristics = computed(() => {
const items: { label: string, value: string }[] = []
if (props.product.season) items.push({ label: 'Сезон', value: props.product.season })
if (props.product.material) items.push({ label: 'Матеріал', value: props.product.material })
return items
})
</script>

<template>
<div class="flex flex-col gap-6">
<div class="flex flex-col gap-2">
<span v-if="product.brand" class="text-sm text-secondary-500">{{ product.brand }}</span>
<h1 class="text-2xl font-semibold text-secondary-900 md:text-3xl">{{ product.name }}</h1>
</div>

<div class="flex items-center gap-3">
  <BRating :model-value="product.averageRating ?? 0" readonly size="sm" />
  <span class="text-sm text-secondary-500">{{ product.reviewCount }} відгуків</span>
</div>

<div class="flex items-end gap-3">
  <span class="text-3xl font-bold text-secondary-900">{{ product.basePrice }} ₴</span>
  <span v-if="hasDiscount" class="text-lg text-secondary-400 line-through">{{ product.oldPrice }} ₴</span>
</div>

<p v-if="product.description" class="text-base leading-relaxed text-secondary-700">
  {{ product.description }}
</p>

<dl v-if="characteristics.length" class="flex flex-col gap-2">
  <div
    v-for="item in characteristics"
    :key="item.label"
    class="flex items-center justify-between border-b border-secondary-100 py-2"
  >
    <dt class="text-sm text-secondary-500">{{ item.label }}</dt>
    <dd class="text-sm font-medium text-secondary-900">{{ item.value }}</dd>
  </div>
</dl>
</div>
</template>

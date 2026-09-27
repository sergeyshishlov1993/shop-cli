<script setup lang="ts">
import CatalogLayout from '~/modules/catalog/components/CatalogLayout.vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { findBySlug, loadCategories } = useCategoryTree()
await loadCategories()
const category = computed(() => findBySlug(slug.value))

const breadcrumbs = computed(() => [
  { label: 'Головна', to: '/' },
  { label: 'Каталог', to: '/catalog' },
  { label: category.value?.name ?? slug.value },
])

useHead(computed(() => ({
  title: category.value?.metaTitle ?? category.value?.name ?? slug.value,
  meta: [{ name: 'description', content: category.value?.metaDescription ?? `Каталог товарів категорії ${category.value?.name ?? slug.value}` }],
})))
</script>

<template>
  <CatalogLayout :title="category?.name ?? slug" :breadcrumbs="breadcrumbs" />
</template>

<script setup lang="ts">
import CatalogLayout from '~/modules/catalog/components/CatalogLayout.vue'

const route = useRoute()
const title = computed(() => (route.query.search ? `Пошук: «${route.query.search}»` : 'Каталог'))

useHead({
  title: 'Каталог',
  meta: [{ name: 'description', content: 'Каталог товарів нашого магазину' }],
})
</script>

<template>
  <CatalogLayout :title="title" :breadcrumbs="[{ label: 'Головна', to: '/' }, { label: 'Каталог' }]" />
</template>

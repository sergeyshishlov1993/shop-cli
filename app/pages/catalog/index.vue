<script setup lang="ts">
import CatalogLayout from '~/modules/catalog/components/CatalogLayout.vue'

const route = useRoute()
// Заголовок відповідає пункту меню, з якого прийшли
const collectionTitles: Record<string, string> = { isNew: 'Новинки', isHit: 'Хіти', isSeasonal: 'Сезонна добірка' }
const title = computed(() => route.query.search
  ? `Пошук: «${route.query.search}»`
  : Object.entries(collectionTitles).find(([key]) => route.query[key] === 'true')?.[1] ?? 'Каталог')

useHead({
  title: 'Каталог',
  meta: [{ name: 'description', content: 'Каталог товарів нашого магазину' }],
})
</script>

<template>
  <CatalogLayout :title="title" :breadcrumbs="[{ label: 'Головна', to: '/' }, { label: 'Каталог' }]" />
</template>

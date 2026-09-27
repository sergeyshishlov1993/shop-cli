<script setup lang="ts">
import CatalogLayout from '~/modules/catalog/components/CatalogLayout.vue'
import { contentApi } from '~/modules/content/contentApi'

const route = useRoute()
// Заголовок відповідає пункту меню, з якого прийшли
const collectionTitles: Record<string, string> = { isNew: 'Новинки', isHit: 'Хіти', isSeasonal: 'Сезонна добірка' }
// Добірка з промо-блоку «Своє» — заголовок = назва блоку
const { data: promoBlocks } = await useAsyncData('catalog-promo-blocks', () => contentApi.getPromoBlocks().catch(() => []), { default: () => [] })
const promoTitle = computed(() => route.query.promo ? promoBlocks.value.find(b => b.id === Number(route.query.promo))?.title : undefined)
const title = computed(() => route.query.search
  ? `Пошук: «${route.query.search}»`
  : promoTitle.value ?? Object.entries(collectionTitles).find(([key]) => route.query[key] === 'true')?.[1] ?? 'Каталог')

useHead({
  title,
  meta: [{ name: 'description', content: 'Каталог товарів нашого магазину' }],
})
</script>

<template>
  <CatalogLayout :title="title" :breadcrumbs="[{ label: 'Головна', to: '/' }, { label: 'Каталог' }]" />
</template>

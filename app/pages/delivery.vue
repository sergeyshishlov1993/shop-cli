<script setup lang="ts">
import { contentApi } from '~/modules/content/contentApi'

const { data: page, pending, error } = await useAsyncData('content-delivery', () => contentApi.getPage('delivery'))

useSeoMeta({
  title: () => page.value?.metaTitle ?? page.value?.title ?? 'Доставка і оплата',
  description: () => page.value?.metaDescription ?? 'Умови доставки та оплати замовлень.',
})
</script>

<template>
  <div class="store-page store-container py-8 lg:py-14 [&>*]:max-w-4xl">
    <BBreadcrumbs :items="[{ label: 'Головна', to: '/' }, { label: page?.title ?? 'Доставка' }]" />
    <div v-if="pending" class="flex justify-center py-20"><BSpinner size="lg" /></div>
    <BEmptyState v-else-if="error || !page" class="mt-8" title="Сторінка тимчасово недоступна" />
    <article v-else class="mt-8">
      <p class="text-sm font-semibold text-primary-600">Покупцям</p>
      <h1 class="mt-3 text-4xl font-semibold text-secondary-950">{{ page.title }}</h1>
      <div v-if="Object.keys(page.contentJson ?? {}).length" class="mt-8 rounded-xl bg-secondary-50 p-6 text-secondary-700">
        Умови доставки завантажено з системи керування магазину.
      </div>
      <p v-else class="mt-6 leading-7 text-secondary-600">Умови доставки й оплати готуються до публікації.</p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { contentApi } from '~/modules/content/contentApi'

const { data: page, pending, error } = await useAsyncData('content-about', () => contentApi.getPage('about'))

useSeoMeta({
  title: () => page.value?.metaTitle ?? page.value?.title ?? 'Про нас',
  description: () => page.value?.metaDescription ?? 'Інформація про наш магазин і бренд.',
})
</script>

<template>
  <div class="store-page store-container py-8 lg:py-14 [&>*]:max-w-4xl">
    <BBreadcrumbs :items="[{ label: 'Головна', to: '/' }, { label: page?.title ?? 'Про нас' }]" />
    <div v-if="pending" class="flex justify-center py-20"><BSpinner size="lg" /></div>
    <BEmptyState v-else-if="error || !page" class="mt-8" title="Сторінка тимчасово недоступна" />
    <article v-else class="mt-8">
      <p class="text-sm font-semibold text-primary-600">Наш бренд</p>
      <h1 class="mt-3 text-4xl font-semibold text-secondary-950">{{ page.title }}</h1>
      <div v-if="Object.keys(page.contentJson ?? {}).length" class="mt-8 rounded-xl bg-secondary-50 p-6 text-secondary-700">
        Контент сторінки завантажено з системи керування магазину.
      </div>
      <p v-else class="mt-6 leading-7 text-secondary-600">Інформація про бренд готується до публікації.</p>
    </article>
  </div>
</template>

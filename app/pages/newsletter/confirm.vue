<script setup lang="ts">
import { newsletterApi } from '~/modules/newsletter/newsletterApi'

const route = useRoute()
const state = ref<'loading' | 'ok' | 'error'>('loading')

onMounted(async () => {
  const token = route.query.token as string | undefined
  if (!token) { state.value = 'error'; return }
  try {
    await newsletterApi.confirm(token)
    state.value = 'ok'
  }
  catch {
    state.value = 'error'
  }
})

useSeoMeta({ title: 'Підтвердження підписки', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="store-container py-16 text-center">
    <p v-if="state === 'loading'">Підтверджуємо…</p>
    <template v-else-if="state === 'ok'">
      <h1 class="mb-2 text-2xl font-semibold">Підписку підтверджено</h1>
      <p class="text-gray-600">Дякуємо! Тепер ви отримуватимете новини та акції.</p>
    </template>
    <template v-else>
      <h1 class="mb-2 text-2xl font-semibold">Не вдалося підтвердити</h1>
      <p class="text-gray-600">Посилання недійсне або застаріле.</p>
    </template>
    <NuxtLink to="/" class="mt-6 inline-block underline">На головну</NuxtLink>
  </div>
</template>

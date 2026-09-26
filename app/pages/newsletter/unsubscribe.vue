<script setup lang="ts">
import { newsletterApi } from '~/modules/newsletter/newsletterApi'

const route = useRoute()
const state = ref<'loading' | 'ok' | 'error'>('loading')

onMounted(async () => {
  const token = route.query.token as string | undefined
  if (!token) { state.value = 'error'; return }
  try {
    await newsletterApi.unsubscribe(token)
    state.value = 'ok'
  }
  catch {
    state.value = 'error'
  }
})

useSeoMeta({ title: 'Відписка від розсилки', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="store-container py-16 text-center">
    <p v-if="state === 'loading'">Обробляємо…</p>
    <h1 v-else-if="state === 'ok'" class="mb-2 text-2xl font-semibold">Ви відписані</h1>
    <h1 v-else class="mb-2 text-2xl font-semibold">Посилання недійсне</h1>
    <NuxtLink to="/" class="mt-6 inline-block underline">На головну</NuxtLink>
  </div>
</template>

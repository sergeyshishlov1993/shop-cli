<script setup lang="ts">
import { useSettingsStore } from '~/modules/settings/settingsStore'
import { getPublicMediaUrl } from '~/modules/common/helpers/fileUrl'
import { useCartStore } from '~/modules/cart/cartStore'

const settingsStore = useSettingsStore()

// Кошик гостя живе в сесійній cookie — підтягуємо його при старті, інакше після перезавантаження він «порожній».
const cartStore = useCartStore()
onMounted(() => {
  cartStore.fetchCart().catch(() => {})
})
await useAsyncData('storefront-settings', async () => {
  try {
    return await Promise.race([
      settingsStore.fetch(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 800)),
    ])
  }
  catch {
    return null
  }
})
const theme = computed(() => settingsStore.settings?.themeJson)
const backgroundMediaUrl = computed(() => getPublicMediaUrl(theme.value?.backgroundMediaUrl))

// Відносна яскравість #rrggbb (0 — чорний, 1 — білий)
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

// Нейтральна шкала з кольорів теми, щоб пресети не лишали пудрові сірі поверх свого фону
const secondaryMix: Record<number, number> = { 50: 0, 100: 6, 200: 13, 300: 24, 400: 45, 500: 65, 600: 80, 700: 92, 800: 100 }

const themeStyle = computed(() => {
  const value = theme.value
  if (!value) return {}

  const secondary = Object.fromEntries(Object.entries(secondaryMix).map(([step, pct]) =>
    [`--color-secondary-${step}`, `color-mix(in srgb, ${value.textColor} ${pct}%, ${value.backgroundColor})`]))

  return {
    ...secondary,
    '--color-secondary-900': `color-mix(in srgb, ${value.textColor} 60%, #000)`,
    '--color-secondary-950': `color-mix(in srgb, ${value.textColor} 40%, #000)`,
    // Темний акцент (Графіт) зливається з темним фоном — у dark-режимі беремо освітлений
    '--theme-primary-on-dark': luminance(value.primaryColor) < 0.25 ? `color-mix(in srgb, ${value.primaryColor} 45%, #fff)` : value.primaryColor,
    '--theme-primary': value.primaryColor,
    '--store-background': value.backgroundColor,
    '--store-surface': value.surfaceColor,
    '--store-text': value.textColor,
    '--color-primary-50': value.primarySoftColor,
    '--color-primary-100': value.primarySoftColor,
    '--color-primary-200': value.primarySoftColor,
    '--color-primary-300': value.primaryColor,
    '--color-primary-400': value.primaryColor,
    '--color-primary-500': value.primaryColor,
    '--color-primary-600': value.primaryStrongColor,
    '--color-primary-700': value.primaryStrongColor,
    '--color-primary-800': value.primaryStrongColor,
    '--color-primary-900': value.primaryStrongColor,
  }
})

// Змінні теми з адмінки ставимо на <html>, а не на обгортку: так їх отримують і модалки/меню,
// що телепортуються в <body>, і фон сторінки.
useHead(() => ({
  htmlAttrs: {
    style: Object.entries(themeStyle.value).filter(([, v]) => v).map(([k, v]) => `${k}:${v}`).join(';'),
  },
}))
</script>

<template>
  <div class="store-theme">
    <div
      v-if="theme?.backgroundMediaType === 'IMAGE' && backgroundMediaUrl"
      class="pointer-events-none fixed inset-0 z-0 bg-cover bg-no-repeat"
      :style="{
        backgroundImage: `url(${JSON.stringify(backgroundMediaUrl)})`,
        backgroundPosition: theme.backgroundMediaPosition || 'center center',
        opacity: theme.backgroundMediaOpacity || '1',
      }"
    />
    <video
      v-else-if="theme?.backgroundMediaType === 'VIDEO' && backgroundMediaUrl"
      :src="backgroundMediaUrl"
      class="pointer-events-none fixed inset-0 z-0 size-full object-cover"
      :style="{
        objectPosition: theme.backgroundMediaPosition || 'center center',
        opacity: theme.backgroundMediaOpacity || '1',
      }"
      autoplay
      muted
      loop
      playsinline
    />
    <div class="relative z-[1]">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
    <BToast />
    <BConfirmDialog />
    <CookieConsent />
  </div>
</template>

<style>
.store-theme {
  position: relative;
  isolation: isolate;
  min-height: 100dvh;
  color: var(--store-text, #3a3230);
  background: var(--store-background, #fff);
}
</style>

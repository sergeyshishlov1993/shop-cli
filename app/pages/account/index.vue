<script setup lang="ts">
import AccountAvatarEditor from '~/modules/account/components/AccountAvatarEditor.vue'
import { useAccountStore } from '~/modules/account/accountStore'
import { useFavoritesStore } from '~/modules/favorites/favoritesStore'
import { getFileUrl } from '~/modules/common/helpers/fileUrl'

definePageMeta({ layout: 'account', middleware: 'auth' })

const accountStore = useAccountStore()
const favoritesStore = useFavoritesStore()

await useAsyncData('account-overview', async () => {
  await Promise.all([
    accountStore.fetchProfile(),
    accountStore.fetchOrders({ page: 1, limit: 3 }),
    accountStore.fetchDeliveryProfiles(),
    favoritesStore.fetchAll({ page: 1, limit: 4 }),
  ])
  return true
})

const displayName = computed(() => {
  const profile = accountStore.profile
  return profile ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email : ''
})
const favoritePreview = computed(() => favoritesStore.items.slice(0, 4))
const latestOrder = computed(() => accountStore.orders[0] ?? null)

const overviewCards = computed(() => [
  { to: '/account/orders', icon: 'lucide:package', value: accountStore.ordersTotalCount, label: 'Замовлень', hint: latestOrder.value ? `Останнє: № ${latestOrder.value.orderNumber}` : 'Історія покупок' },
  { to: '/favorites', icon: 'lucide:heart', value: favoritesStore.totalCount, label: 'В обраному', hint: 'Ваш список бажань' },
  { to: '/account/delivery', icon: 'lucide:map-pin', value: accountStore.deliveryProfiles.length, label: 'Адрес доставки', hint: 'Для швидкого оформлення' },
])

useSeoMeta({ title: 'Особистий кабінет', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="store-page store-container py-6 lg:py-10">
    <div class="flex items-center gap-4">
      <AccountAvatarEditor small />
      <div class="min-w-0">
        <h1 class="store-title truncate text-2xl lg:text-3xl">{{ displayName }}</h1>
        <p class="truncate text-sm text-secondary-500">{{ accountStore.profile?.email }}</p>
      </div>
      <p v-if="accountStore.profile?.personalDiscountPercent" class="glass ml-auto hidden shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm text-secondary-800 sm:flex">
        Знижка
        <strong class="text-primary-700">{{ accountStore.profile.personalDiscountPercent }}%</strong>
      </p>
    </div>
    <p v-if="accountStore.profile?.personalDiscountPercent" class="glass mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm text-secondary-800 sm:hidden">
      Персональна знижка
      <strong class="text-primary-700">{{ accountStore.profile.personalDiscountPercent }}%</strong>
    </p>

    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <NuxtLink
        v-for="card in overviewCards"
        :key="card.to"
        :to="card.to"
        class="group glass flex min-h-36 flex-col justify-between rounded-xl p-5 transition hover:-translate-y-0.5"
      >
        <div class="flex items-start justify-between gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <Icon :name="card.icon" size="20" />
          </span>
          <Icon name="lucide:arrow-up-right" size="18" class="text-secondary-300 transition group-hover:text-primary-700" />
        </div>
        <div class="mt-5">
          <strong class="text-2xl font-semibold text-secondary-950">{{ card.value }}</strong>
          <span class="ml-2 text-sm font-medium text-secondary-700">{{ card.label }}</span>
          <p class="mt-1 truncate text-xs text-secondary-500">{{ card.hint }}</p>
        </div>
      </NuxtLink>
    </div>

    <section class="mt-8 rounded-xl border border-secondary-200 p-5 sm:p-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="text-xs font-medium text-secondary-400">Список бажань</p>
          <h2 class="store-title mt-1 text-xl lg:text-2xl">Обрані товари</h2>
        </div>
        <NuxtLink to="/favorites" class="inline-flex items-center gap-1 text-sm font-semibold text-secondary-800 hover:text-primary-700">
          Переглянути всі
          <Icon name="lucide:arrow-right" size="16" />
        </NuxtLink>
      </div>

      <ProductRail v-if="favoritePreview.length" class="mt-6 sm:hidden">
        <NuxtLink v-for="product in favoritePreview" :key="product.id" :to="`/product/${product.slug}`" class="min-w-0">
          <img :src="getFileUrl(product.mainImage, 'medium')" :alt="product.name" class="aspect-[3/4] w-full object-cover" />
          <p class="mt-2 truncate text-[13px] text-secondary-700">{{ product.name }}</p>
          <p class="text-sm font-semibold text-secondary-900">{{ formatPrice(product.effectivePrice) }}</p>
        </NuxtLink>
      </ProductRail>

      <div v-if="favoritePreview.length" class="mt-6 hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-4 sm:gap-4">
        <NuxtLink v-for="product in favoritePreview" :key="product.id" :to="`/product/${product.slug}`" class="group min-w-0">
          <div class="aspect-[3/4] overflow-hidden rounded-xl bg-secondary-100">
            <img
              v-if="getFileUrl(product.mainImage, 'medium')"
              :src="getFileUrl(product.mainImage, 'medium')"
              :alt="product.name"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
            <div v-else class="flex h-full items-center justify-center text-secondary-300">
              <Icon name="lucide:image" size="28" />
            </div>
          </div>
          <h3 class="mt-3 truncate text-sm font-medium text-secondary-900">{{ product.name }}</h3>
          <p class="mt-1 text-sm font-semibold text-secondary-950">{{ formatPrice(product.effectivePrice) }}</p>
        </NuxtLink>
      </div>

      <div v-else class="mt-6 flex flex-col items-center justify-center rounded-xl bg-secondary-50 px-5 py-10 text-center">
        <span class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-secondary-500 shadow-sm">
          <Icon name="lucide:heart" size="22" />
        </span>
        <h3 class="mt-4 font-semibold text-secondary-900">Список бажань порожній</h3>
        <p class="mt-1 text-sm text-secondary-500">Зберігайте товари серцем, щоб повернутися до них пізніше.</p>
        <BBtn to="/catalog" variant="primary" size="sm" class="mt-5">Перейти в каталог</BBtn>
      </div>
    </section>
  </div>
</template>

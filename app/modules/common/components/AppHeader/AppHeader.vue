<script setup lang="ts">
import { computed, ref } from 'vue'
import MobileMenu from '~/modules/common/components/AppHeader/MobileMenu.vue'
import HeaderCart from '~/modules/common/components/AppHeader/HeaderCart.vue'
import SearchOverlay from '~/modules/common/components/AppHeader/SearchOverlay.vue'
import { useAuthStore } from '~/modules/auth/authStore'

const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const route = useRoute()
// Активний пункт меню: добірка за ?isNew/isHit/isSeasonal, «Каталог» — каталог без добірки
const collections = ['isNew', 'isHit', 'isSeasonal'] as const
const isNavActive = (flag?: (typeof collections)[number]) => route.path.startsWith('/catalog')
  && (flag ? route.query[flag] === 'true' : !collections.some(key => route.query[key] === 'true'))
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isHome = computed(() => route.path === '/')

const toggleSearch = () => (isSearchOpen.value = !isSearchOpen.value)


</script>
<template>
  <header :class="['store-header', { 'store-header--overlay': isHome }]">
    <p class="store-announce">Шовк · Мереживо · Ніжність — нова колекція вже на сайті</p>
    <div class="store-header__bar store-container">
      <div class="flex items-center gap-2 justify-self-start">
        <button type="button" class="store-header__menu" aria-label="Відкрити меню" @click="isMobileMenuOpen = true">
          <span /><span /><span />
        </button>
        <button type="button" class="store-header__icon md:hidden" aria-label="Пошук" @click="toggleSearch">
          <Icon name="lucide:search" />
        </button>
      </div>

      <NuxtLink to="/" class="store-logo" aria-label="Stella — на головну">STELLA</NuxtLink>

      <nav class="store-header__actions" aria-label="Основна навігація">
        <button type="button" class="store-header__icon max-md:hidden" aria-label="Пошук" @click="toggleSearch">
          <Icon name="lucide:search" />
        </button>
        <NuxtLink :to="isAuthenticated ? '/account' : '/login?redirect=/account'" class="store-header__icon max-md:hidden" :aria-label="isAuthenticated ? 'Особистий кабінет' : 'Увійти'">
          <Icon name="lucide:user" />
        </NuxtLink>
        <ThemeToggle class="store-header__icon" />
        <NuxtLink to="/favorites" class="store-header__icon" aria-label="Обране">
          <Icon name="lucide:heart" />
        </NuxtLink>
        <HeaderCart />
      </nav>
    </div>

    <nav class="store-nav store-container hidden md:flex" aria-label="Категорії">
      <NuxtLink to="/catalog?isNew=true" :class="{ 'is-active': isNavActive('isNew') }">Новинки</NuxtLink>
      <NuxtLink to="/catalog" :class="{ 'is-active': isNavActive() }">Каталог</NuxtLink>
      <NuxtLink to="/catalog?isHit=true" :class="{ 'is-active': isNavActive('isHit') }">Хіти</NuxtLink>
      <NuxtLink to="/catalog?isSeasonal=true" class="is-sale" :class="{ 'is-active': isNavActive('isSeasonal') }">Сезонна добірка</NuxtLink>
      <NuxtLink to="/about" :class="{ 'is-active': route.path === '/about' }">Про нас</NuxtLink>
      <NuxtLink to="/delivery" :class="{ 'is-active': route.path === '/delivery' }">Доставка</NuxtLink>
    </nav>

    <!-- Пошук — окремий повноекранний оверлей -->
    <SearchOverlay v-model="isSearchOpen" />

    <MobileMenu v-model="isMobileMenuOpen" />
  </header>
</template>

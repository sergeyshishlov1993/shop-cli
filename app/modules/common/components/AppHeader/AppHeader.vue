<script setup lang="ts">
import { ref } from 'vue'
import MobileMenu from '~/modules/common/components/AppHeader/MobileMenu.vue'
import HeaderCart from '~/modules/common/components/AppHeader/HeaderCart.vue'
import CatalogSearch from '~/modules/catalog/components/CatalogSearch.vue'

const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const search = ref('')

function toggleSearch() {
  isSearchOpen.value = !isSearchOpen.value
}

function closeSearch() {
  isSearchOpen.value = false
}
</script>
<template>
  <header class="sticky top-0 z-50 bg-white">
    <div class="border-b border-gray-200 bg-[#f8f6f4]">
      <div class="mx-auto flex min-h-10 max-w-screen-2xl items-center justify-center px-3 text-center text-xs text-gray-900 sm:min-h-12 sm:px-4 sm:text-sm lg:text-base">
        EASTER HOME 1+1 | -50% на другий товар у чеку | 1-11.04
      </div>
    </div>

    <div class="border-b border-gray-200 bg-white">
      <div class="mx-auto grid h-16 max-w-screen-2xl grid-cols-[40px_1fr_auto] items-center gap-3 px-3 sm:h-20 sm:grid-cols-[48px_1fr_auto] sm:gap-4 sm:px-6 lg:h-24 lg:px-8">
        <button
            type="button"
            class="flex h-10 w-10 items-center justify-center text-gray-900 transition hover:opacity-70 sm:h-12 sm:w-12"
            aria-label="Відкрити меню"
            @click="isMobileMenuOpen = true"
        >
          <span class="flex flex-col gap-1.5">
            <span class="block h-0.5 w-6 bg-current sm:w-7" />
            <span class="block h-0.5 w-6 bg-current sm:w-7" />
            <span class="block h-0.5 w-6 bg-current sm:w-7" />
          </span>
        </button>

        <div class="flex justify-center">
          <NuxtLink
              to="/"
              class="text-xl font-light uppercase tracking-[0.2em] text-black sm:text-3xl sm:tracking-[0.28em] lg:text-5xl lg:tracking-[0.35em]"
          >
            GEPUR
          </NuxtLink>
        </div>

        <nav class="flex items-center justify-end gap-3 text-gray-900 sm:gap-4 lg:gap-5">
          <button
              type="button"
              class="transition hover:opacity-70"
              aria-label="Пошук"
              @click="toggleSearch"
          >
            <svg class="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20L16.65 16.65" />
            </svg>
          </button>

          <NuxtLink to="/login" class="transition hover:opacity-70" aria-label="Профіль">
            <svg class="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20C5.8 16.8 8.5 15 12 15C15.5 15 18.2 16.8 20 20" />
            </svg>
          </NuxtLink>

          <NuxtLink to="/account/favorites" class="relative transition hover:opacity-70" aria-label="Обране">
            <svg class="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 20.5L4.9 13.86C3.1 12.17 2 10.53 2 8.5C2 5.46 4.42 3 7.4 3C9.13 3 10.8 3.81 12 5.09C13.2 3.81 14.87 3 16.6 3C19.58 3 22 5.46 22 8.5C22 10.53 20.9 12.17 19.1 13.86L12 20.5Z" />
            </svg>
            <span class="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f7d9d3] px-1 text-[9px] leading-none text-black sm:h-5 sm:min-w-5 sm:text-[10px]">
              0
            </span>
          </NuxtLink>

          <HeaderCart />
        </nav>
      </div>
    </div>

    <div
        v-show="isSearchOpen"
        class="border-b border-gray-200 bg-white"
    >
      <div class="mx-auto flex max-w-screen-2xl items-start gap-3 px-3 py-4 sm:gap-4 sm:px-6 sm:py-6 lg:px-8">
        <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-900 transition hover:opacity-70 sm:h-12 sm:w-12"
            aria-label="Закрити пошук"
            @click="closeSearch"
        >
          <svg class="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M19 12H5" />
            <path d="M12 19L5 12L12 5" />
          </svg>
        </button>

        <div class="min-w-0 flex-1">
          <CatalogSearch
              v-model="search"
              @select="closeSearch"
          />
        </div>
      </div>
    </div>

    <MobileMenu v-model="isMobileMenuOpen" />
  </header>
</template>
<script setup lang="ts">
const router = useRouter()

// Назад, якщо прийшли зі сторінки сайту; інакше — на головну.
function close() {
  if (import.meta.client && window.history.state?.back) router.back()
  else navigateTo('/')
}
</script>

<template>
  <div class="auth-shell flex min-h-screen items-center justify-center bg-white px-4 py-10">
    <div class="relative w-full max-w-md border border-gray-200 bg-white p-6 sm:p-8">
      <button
        type="button"
        class="absolute right-3 top-3 inline-flex size-9 items-center justify-center text-secondary-500 transition-colors hover:text-secondary-900"
        aria-label="Закрити"
        @click="close"
      >
        <Icon name="lucide:x" size="22" />
      </button>
      <slot />
    </div>
  </div>
</template>

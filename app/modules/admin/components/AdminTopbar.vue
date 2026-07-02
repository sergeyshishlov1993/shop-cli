<template>
  <header class="flex min-h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
    <div class="text-lg font-semibold text-gray-900">
      Адмін-панель
    </div>

    <div class="flex items-center gap-4">
      <NuxtLink to="/" class="text-sm text-gray-700 transition hover:text-gray-900">
        На сайт
      </NuxtLink>

      <button
        type="button"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
      >
        Вийти
      </button>
    </div>
  </header>
</template>

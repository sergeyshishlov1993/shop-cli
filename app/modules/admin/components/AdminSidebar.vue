<template>
  <aside class="flex h-full w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
    <div class="border-b border-gray-200 px-6 py-5">
      <NuxtLink to="/admin" class="text-2xl font-semibold text-gray-900">
        Admin Panel
      </NuxtLink>
    </div>

    <nav class="flex flex-1 flex-col gap-1 px-4 py-4">
      <NuxtLink to="/admin" class="rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900">
        Дашборд
      </NuxtLink>
      <NuxtLink to="/admin/products" class="rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900">
        Товари
      </NuxtLink>
      <NuxtLink to="/admin/orders" class="rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900">
        Замовлення
      </NuxtLink>
      <NuxtLink to="/admin/categories" class="rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900">
        Категорії
      </NuxtLink>
      <NuxtLink to="/admin/users" class="rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900">
        Користувачі
      </NuxtLink>
      <NuxtLink to="/admin/reviews" class="rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900">
        Відгуки
      </NuxtLink>
      <NuxtLink to="/admin/feedback" class="rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900">
        Зворотний зв'язок
      </NuxtLink>
      <NuxtLink to="/admin/expenses" class="rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900">
        Витрати
      </NuxtLink>
      <NuxtLink to="/admin/reports" class="rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900">
        Звіти
      </NuxtLink>
      <NuxtLink to="/admin/settings" class="rounded-lg px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900">
        Налаштування
      </NuxtLink>
    </nav>
  </aside>
</template>

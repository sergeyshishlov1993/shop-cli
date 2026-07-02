<template>
  <footer class="mt-auto border-t border-gray-200 bg-white">
    <div class="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div class="grid gap-10 lg:grid-cols-[1fr_1fr_1fr_1fr_1.4fr]">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-800">
            Центр підтримки
          </h3>
          <div class="space-y-2 text-sm text-gray-700">
            <NuxtLink to="/" class="block transition hover:text-black">Viber</NuxtLink>
            <NuxtLink to="/" class="block transition hover:text-black">Telegram</NuxtLink>
            <NuxtLink to="/" class="block transition hover:text-black">Передзвоніть мені</NuxtLink>
            <NuxtLink to="/" class="block transition hover:text-black">Контакти</NuxtLink>
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-800">
            Про компанію
          </h3>
          <div class="space-y-2 text-sm text-gray-700">
            <NuxtLink to="/" class="block transition hover:text-black">Про бренд</NuxtLink>
            <NuxtLink to="/" class="block transition hover:text-black">Sisters Club</NuxtLink>
            <NuxtLink to="/" class="block transition hover:text-black">Магазини</NuxtLink>
            <NuxtLink to="/" class="block transition hover:text-black">Блог</NuxtLink>
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-800">
            Покупцям
          </h3>
          <div class="space-y-2 text-sm text-gray-700">
            <NuxtLink to="/" class="block transition hover:text-black">Доставка</NuxtLink>
            <NuxtLink to="/" class="block transition hover:text-black">Оплата</NuxtLink>
            <NuxtLink to="/" class="block transition hover:text-black">Вибір розміру</NuxtLink>
            <NuxtLink to="/" class="block transition hover:text-black">Обмін та повернення</NuxtLink>
            <NuxtLink to="/" class="block transition hover:text-black">Сертифікати</NuxtLink>
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-800">
            Категорії
          </h3>
          <div class="space-y-2 text-sm text-gray-700">
            <NuxtLink to="/catalog" class="block transition hover:text-black">Новинки</NuxtLink>
            <NuxtLink to="/catalog" class="block transition hover:text-black">Сукні</NuxtLink>
            <NuxtLink to="/catalog" class="block transition hover:text-black">Верхній одяг</NuxtLink>
            <NuxtLink to="/catalog" class="block transition hover:text-black">Корсети</NuxtLink>
            <NuxtLink to="/catalog" class="block transition hover:text-black">BLACK FRIDAY</NuxtLink>
          </div>
        </div>

        <div class="space-y-6">
          <div class="space-y-3">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-800">
              Підписатися на розсилку новин
            </h3>

            <div>
              <div class="flex items-center gap-3 border-b border-gray-400 pb-2">
                <input
                    type="email"
                    placeholder="Введіть E-mail"
                    class="w-full border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                >
                <button type="button" class="shrink-0 text-gray-800 transition hover:opacity-70" aria-label="Підписатися">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M5 12H19" />
                    <path d="M13 6L19 12L13 18" />
                  </svg>
                </button>
              </div>

              <p class="mt-3 text-xs text-gray-500">
                Наші листи знаходять шлях до тебе завдяки eSputnik
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <NuxtLink
                to="/"
                class="flex min-h-10 min-w-[160px] items-center justify-center rounded-md border border-gray-400 px-4 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
            >
              Google Play
            </NuxtLink>

            <NuxtLink
                to="/"
                class="flex min-h-10 min-w-[160px] items-center justify-center rounded-md border border-gray-400 px-4 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
            >
              App Store
            </NuxtLink>
          </div>

          <div class="flex items-center gap-3">
            <NuxtLink to="/" class="flex h-9 w-9 items-center justify-center rounded-full bg-[#4d4343] text-xs text-white transition hover:opacity-80">
              IG
            </NuxtLink>
            <NuxtLink to="/" class="flex h-9 w-9 items-center justify-center rounded-full bg-[#4d4343] text-xs text-white transition hover:opacity-80">
              FB
            </NuxtLink>
            <NuxtLink to="/" class="flex h-9 w-9 items-center justify-center rounded-full bg-[#4d4343] text-xs text-white transition hover:opacity-80">
              YT
            </NuxtLink>
            <NuxtLink to="/" class="flex h-9 w-9 items-center justify-center rounded-full bg-[#4d4343] text-xs text-white transition hover:opacity-80">
              P
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200">
      <div class="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-3 px-4 py-4 text-center text-xs text-gray-600 sm:px-6 lg:flex-row lg:px-8">
        <div>
          © 2011-2026 Gepur
        </div>

        <div class="flex flex-wrap items-center justify-center gap-2">
          <NuxtLink to="/" class="transition hover:text-black">
            Політика конфіденційності
          </NuxtLink>
          <span>|</span>
          <NuxtLink to="/" class="transition hover:text-black">
            Публічна оферта
          </NuxtLink>
          <span>|</span>
          <NuxtLink to="/" class="transition hover:text-black">
            Cookies policy
          </NuxtLink>
        </div>

        <div class="flex items-center gap-2 text-xs text-gray-400">
          <span>Mastercard</span>
          <span>Visa</span>
          <span>eSputnik</span>
        </div>
      </div>
    </div>
  </footer>
</template>
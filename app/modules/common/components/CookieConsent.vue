<script setup lang="ts">
// Cookie-consent (0.4). Privacy-first: по умолчанию только необходимые.
// Значение читает аналитика (2.2) перед инициализацией пикселей.
type Consent = 'all' | 'necessary'
const STORAGE_KEY = 'cookie-consent'

const visible = ref(false)

onMounted(() => {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) visible.value = true
  }
  catch {
    // localStorage недоступен (приватный режим) — баннер просто не показываем.
  }
})

function decide(choice: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, choice)
  }
  catch { /* игнорируем — не критично */ }
  visible.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-x-0 bottom-0 z-[100] border-t border-black/10 bg-[var(--store-surface,#fff)] px-4 py-4 shadow-lg"
      role="dialog"
      aria-live="polite"
      aria-label="Згода на використання cookie"
    >
      <div class="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-[var(--store-text,#3a3230)]">
          Ми використовуємо cookie для роботи сайту та аналітики.
          <NuxtLink to="/privacy" class="underline">Детальніше</NuxtLink>.
        </p>
        <div class="flex shrink-0 gap-2">
          <button
            type="button"
            class="b-btn b-btn--outline b-btn--md"
            @click="decide('necessary')"
          >
            Лише необхідні
          </button>
          <button
            type="button"
            class="b-btn b-btn--primary b-btn--md"
            @click="decide('all')"
          >
            Прийняти всі
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

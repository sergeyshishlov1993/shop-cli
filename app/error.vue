<script setup lang="ts">
import type { NuxtError } from '#app'
import { useAuthStore } from '~/modules/auth/authStore'

const props = defineProps<{ error: NuxtError }>()
const route = useRoute()
const authStore = useAuthStore()

type Action = 'home' | 'catalog' | 'retry' | 'login'
type View = { icon: string, title: string, text: string, actions: Action[] }

// Тексти й іконки для кожного коду; невідомі 4xx/5xx — як 404/500
const views: Record<number, View> = {
  404: {
    icon: 'lucide:search-x',
    title: 'Сторінку не знайдено',
    text: 'Можливо, товар уже знято з продажу або посилання застаріло. Загляньте в каталог — там багато нового.',
    actions: ['catalog', 'home'],
  },
  403: {
    icon: 'lucide:lock-keyhole',
    title: 'Доступ обмежено',
    text: 'Ця сторінка доступна лише за наявності відповідних прав.',
    actions: ['login', 'home'],
  },
  429: {
    icon: 'lucide:hourglass',
    title: 'Забагато запитів',
    text: 'Ви робите це надто часто. Зачекайте хвилину й спробуйте ще раз.',
    actions: ['retry', 'home'],
  },
  503: {
    icon: 'lucide:wrench',
    title: 'Технічні роботи',
    text: 'Ми оновлюємо магазин і скоро повернемося. Спробуйте за кілька хвилин.',
    actions: ['retry'],
  },
  500: {
    icon: 'lucide:triangle-alert',
    title: 'Щось пішло не так',
    text: 'Ми вже знаємо про проблему й виправляємо її. Спробуйте оновити сторінку трохи згодом.',
    actions: ['retry', 'home'],
  },
}

const status = computed(() => props.error.statusCode || 500)
const view = computed(() => views[status.value] ?? (status.value < 500 ? views[404]! : views[500]!))
// Увійти має сенс лише гостю; авторизованому без прав — тільки на головну
const actions = computed(() => view.value.actions.filter(a => a !== 'login' || !authStore.isAuthenticated))

useHead({ title: view.value.title })

function run(action: Action) {
  if (action === 'retry') return clearError({ redirect: route.fullPath })
  if (action === 'login') return clearError({ redirect: `/login?redirect=${encodeURIComponent(route.fullPath)}` })
  clearError({ redirect: action === 'catalog' ? '/catalog' : '/' })
}

const labels: Record<Action, string> = {
  home: 'На головну',
  catalog: 'До каталогу',
  retry: 'Спробувати ще раз',
  login: 'Увійти',
}
</script>

<template>
  <NuxtLayout name="default">
    <section class="store-container flex flex-col items-center gap-5 py-20 text-center sm:py-28">
      <div class="flex size-20 items-center justify-center rounded-full bg-secondary-100 text-primary-700">
        <Icon :name="view.icon" size="36" />
      </div>
      <p class="store-eyebrow">Помилка {{ status }}</p>
      <h1 class="store-title text-3xl sm:text-5xl">{{ view.title }}</h1>
      <p class="max-w-md text-secondary-500">{{ view.text }}</p>
      <div class="mt-2 flex flex-wrap justify-center gap-3">
        <BBtn
          v-for="(action, i) in actions"
          :key="action"
          :variant="i === 0 ? 'primary' : 'outline'"
          @click="run(action)"
        >
          {{ labels[action] }}
        </BBtn>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useConfirm } from '~/modules/ui/composables/useConfirm'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/modules/auth/authStore'
import { useCatalogStore } from '~/modules/catalog/catalogStore'
import BDrawer from '~/modules/ui/components/BDrawer/BDrawer.vue'
import BAccordion from '~/modules/ui/components/BAccordion/BAccordion.vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()

const authStore = useAuthStore()
const catalogStore = useCatalogStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)

const categories = computed(() => {
  return catalogStore.categories
    .filter((category) => category.isActive && !category.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
})

const accordionItems = computed(() => [
  {
    key: 'categories',
    title: 'Каталог',
  },
])

function navigateAndClose(path: string) {
  emit('update:modelValue', false)
  router.push(path)
}

const { confirm } = useConfirm()

async function handleLogout() {
  if (!(await confirm({ title: 'Вийти з акаунта?', message: 'Ви зможете увійти знову будь-коли.', confirmText: 'Вийти', variant: 'warning' }))) return
  authStore.logout()
  emit('update:modelValue', false)
}

onMounted(() => {
  catalogStore.fetchCategories().catch(() => undefined)
})
</script>

<template>
  <BDrawer
    :model-value="props.modelValue"
    side="left"
    title="Меню"
    width="w-[min(20rem,88vw)]"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex flex-col h-full">
      <div class="flex-1 overflow-y-auto px-4 pb-4">
        <BAccordion :items="accordionItems" :multiple="false">
          <template #item="{ item, isOpen }">
            <div v-if="item.key === 'categories' && isOpen" class="space-y-1 pb-2">
              <button
                v-for="category in categories"
                :key="category.id"
                type="button"
                class="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-primary-700"
                @click="navigateAndClose(`/catalog/${category.slug}`)"
              >
                {{ category.name }}
              </button>
            </div>
          </template>
        </BAccordion>

        <nav class="mt-2 flex flex-col gap-0.5 border-t border-secondary-200 pt-3">
          <button
            v-if="isAuthenticated"
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-primary-700"
            @click="navigateAndClose('/account')"
          >
            <Icon name="lucide:user" size="20" />
            <span>Особистий кабінет</span>
          </button>

          <button
            v-if="isAdmin"
            type="button"
            class="flex w-full items-center gap-3 rounded-xl bg-primary-100 px-3 py-3 text-sm font-medium text-primary-800 transition hover:bg-primary-200"
            @click="navigateAndClose('/admin')"
          >
            <Icon name="lucide:shield" size="20" />
            <span>Адмін-панель</span>
          </button>

          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-primary-700"
            @click="navigateAndClose('/favorites')"
          >
            <Icon name="lucide:heart" size="20" />
            <span>Обране</span>
          </button>

          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-primary-700"
            @click="navigateAndClose('/catalog')"
          >
            <Icon name="lucide:layout-grid" size="20" />
            <span>Каталог</span>
          </button>

          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-primary-700"
            @click="navigateAndClose('/catalog?isNew=true')"
          >
            <Icon name="lucide:sparkles" size="20" />
            <span>Новинки</span>
          </button>

          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-primary-700"
            @click="navigateAndClose('/catalog?isHit=true')"
          >
            <Icon name="lucide:flame" size="20" />
            <span>Хіти продажів</span>
          </button>

          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-primary-700"
            @click="navigateAndClose('/catalog?isSeasonal=true')"
          >
            <Icon name="lucide:shirt" size="20" />
            <span>Сезонна добірка</span>
          </button>
        </nav>
      </div>

      <div class="border-t border-secondary-200 p-4">
        <button
          v-if="isAuthenticated"
          type="button"
          class="b-btn b-btn--outline b-btn--md b-btn--block"
          @click="handleLogout"
        >
          <Icon name="lucide:log-out" size="18" />
          <span>Вийти</span>
        </button>

        <button
          v-else
          type="button"
          class="b-btn b-btn--primary b-btn--md b-btn--block"
          @click="navigateAndClose('/login?redirect=/account')"
        >
          <Icon name="lucide:user" size="18" />
          <span>Увійти</span>
        </button>

        <button
          v-if="!isAuthenticated"
          type="button"
          class="b-btn b-btn--outline b-btn--md b-btn--block mt-3"
          @click="navigateAndClose('/register')"
        >
          <Icon name="lucide:user-plus" size="18" />
          <span>Зареєструватися</span>
        </button>
      </div>
    </div>
  </BDrawer>
</template>

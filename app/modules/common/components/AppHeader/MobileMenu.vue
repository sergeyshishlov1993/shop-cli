<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/modules/auth/authStore'
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
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)

const categories = ref([
  { label: 'Новинки', slug: 'novinki' },
  { label: 'Сукні', slug: 'sukni' },
  { label: 'Верхній одяг', slug: 'verkhnij-odyag' },
  { label: 'Корсети', slug: 'korsety' },
  { label: 'Спідниці', slug: 'spidnyci' },
  { label: 'Блузи', slug: 'bluzy' },
  { label: 'Штани', slug: 'shtany' },
])

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

function handleLogout() {
  authStore.logout()
  emit('update:modelValue', false)
}
</script>

<template>
  <BDrawer
    :model-value="props.modelValue"
    side="left"
    title=""
    width="w-80"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex flex-col h-full">
      <div class="flex-1 overflow-y-auto">
        <BAccordion :items="accordionItems" :multiple="false">
          <template #item="{ item, isOpen }">
            <div v-if="item.key === 'categories' && isOpen" class="space-y-1 pb-2">
              <button
                v-for="category in categories"
                :key="category.slug"
                type="button"
                class="block w-full px-4 py-2.5 text-left text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-secondary-900"
                @click="navigateAndClose(`/catalog/${category.slug}`)"
              >
                {{ category.label }}
              </button>
            </div>
          </template>
        </BAccordion>

        <nav class="border-t border-gray-200 py-2">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-3 text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-secondary-900"
            @click="navigateAndClose('/catalog')"
          >
            <Icon name="lucide:layout-grid" size="20" />
            <span>Каталог</span>
          </button>

          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-3 text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-secondary-900"
            @click="navigateAndClose('/account/favorites')"
          >
            <Icon name="lucide:heart" size="20" />
            <span>Обране</span>
          </button>

          <template v-if="isAuthenticated">
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-3 text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-secondary-900"
              @click="navigateAndClose('/account/orders')"
            >
              <Icon name="lucide:package" size="20" />
              <span>Замовлення</span>
            </button>

            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-3 text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-secondary-900"
              @click="navigateAndClose('/account')"
            >
              <Icon name="lucide:user" size="20" />
              <span>Профіль</span>
            </button>

            <button
              v-if="isAdmin"
              type="button"
              class="flex w-full items-center gap-3 px-4 py-3 text-sm text-secondary-700 transition hover:bg-primary-50 hover:text-secondary-900"
              @click="navigateAndClose('/admin')"
            >
              <Icon name="lucide:shield" size="20" />
              <span>Адмінка</span>
            </button>
          </template>
        </nav>
      </div>

      <div class="border-t border-gray-200 p-4">
        <button
          v-if="isAuthenticated"
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm text-secondary-700 transition hover:bg-primary-50"
          @click="handleLogout"
        >
          <Icon name="lucide:log-out" size="18" />
          <span>Вийти</span>
        </button>

        <button
          v-else
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-800 py-2.5 text-sm text-white transition hover:bg-secondary-900"
          @click="navigateAndClose('/login')"
        >
          <Icon name="lucide:user" size="18" />
          <span>Увійти</span>
        </button>
      </div>
    </div>
  </BDrawer>
</template>

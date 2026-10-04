<script setup lang="ts">
import { computed } from 'vue'
import { useCatalogStore } from '~/modules/catalog/catalogStore'
import { useSettingsStore } from '~/modules/settings/settingsStore'
import { newsletterApi } from '~/modules/newsletter/newsletterApi'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'

const catalogStore = useCatalogStore()
const settingsStore = useSettingsStore()

const settings = computed(() => settingsStore.settings)

const nlEmail = ref('')
const nlState = ref<'idle' | 'sent' | 'done' | 'error'>('idle')
const nlLoading = ref(false)
const nlV = useFormValidation({
  email: [() => nlEmail.value, [rules.required('Вкажіть email'), rules.email()]],
})
async function subscribeNewsletter() {
  if (!nlV.validate()) return
  nlState.value = 'idle'
  nlLoading.value = true
  try {
    const r = await newsletterApi.subscribe(nlEmail.value.trim(), 'footer')
    nlState.value = r.status === 'already_confirmed' ? 'done' : 'sent'
  }
  catch (e) {
    const rest = nlV.applyServerErrors(e)
    if (rest.length || !nlV.errors.email) nlState.value = 'error'
  }
  finally {
    nlLoading.value = false
  }
}

const catalogLinks = computed(() => {
  const categoryLinks = catalogStore.categories
    .filter((category) => category.isActive && !category.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 5)
    .map((category) => ({
      label: category.name,
      to: `/catalog/${category.slug}`,
    }))

  return [
    { label: 'Новинки', to: '/catalog?isNew=true' },
    { label: 'Хіти продажу', to: '/catalog?isHit=true' },
    ...categoryLinks,
    { label: 'Сезон', to: '/catalog?isSeasonal=true' },
  ]
})

const companyLinks = [
  { label: 'Про бренд', to: '/about' },
  { label: 'Sisters Club', to: '/about' },
  { label: 'Магазини', to: '/contacts' },
  { label: 'Блог', to: '/about' },
]

const buyerLinks = [
  { label: 'Доставка', to: '/delivery' },
  { label: 'Оплата', to: '/delivery' },
  { label: 'Вибір розміру', to: '/delivery' },
  { label: 'Обмін та повернення', to: '/delivery' },
  { label: 'Сертифікати', to: '/about' },
]

const contacts = computed(() => {
  const items: { label: string, value: string, href: string, icon: string }[] = []

  if (settings.value?.storePhone) {
    items.push({
      label: 'Телефон',
      value: settings.value.storePhone,
      href: `tel:${settings.value.storePhone.replace(/[^\d+]/g, '')}`,
      icon: 'lucide:phone',
    })
  }

  if (settings.value?.storeEmail) {
    items.push({
      label: 'Email',
      value: settings.value.storeEmail,
      href: `mailto:${settings.value.storeEmail}`,
      icon: 'lucide:mail',
    })
  }

  if (settings.value?.storeAddress) {
    items.push({
      label: 'Адреса',
      value: settings.value.storeAddress,
      href: `https://maps.google.com/?q=${encodeURIComponent(settings.value.storeAddress)}`,
      icon: 'lucide:map-pin',
    })
  }

  return items
})

const socialIconMap: Record<string, string> = {
  instagram: 'mdi:instagram',
  facebook: 'mdi:facebook',
  youtube: 'mdi:youtube',
  tiktok: 'lucide:music-2',
  telegram: 'mdi:telegram',
}

const socialLinks = computed(() => {
  return Object.entries(settings.value?.socialLinksJson ?? {})
    .filter(([, href]) => Boolean(href))
    .map(([name, href]) => ({
      name,
      href,
      icon: socialIconMap[name.toLowerCase()] ?? 'lucide:external-link',
    }))
})

await useAsyncData('footer-data', async () => {
  await Promise.race([
    Promise.allSettled([settingsStore.fetch(), catalogStore.fetchCategories()]),
    new Promise((resolve) => setTimeout(resolve, 800)),
  ])
  return true
})
</script>

<template>
  <footer class="store-footer mt-auto">
    <div class="store-container py-10 lg:py-14">
      <div class="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_1fr_1.2fr]">
        <section class="space-y-4">
          <NuxtLink
              to="/"
              class="store-wordmark inline-flex text-2xl text-secondary-800"
          >
            STELLA
          </NuxtLink>

          <p class="max-w-sm text-sm leading-6 text-gray-600">
            STELLA — шовкові комплекти, пеньюари, піжами та образи для нареченої. Ніжність, яку хочеться носити щодня.
          </p>

          <div class="max-w-sm">
            <p v-if="nlState === 'sent'" class="text-sm text-gray-700">
              Перевірте пошту — ми надіслали лист для підтвердження підписки.
            </p>
            <p v-else-if="nlState === 'done'" class="text-sm text-gray-700">
              Ви вже підписані. Дякуємо!
            </p>
            <form novalidate v-else class="flex flex-col gap-2" @submit.prevent="subscribeNewsletter">
              <BInput
                v-model="nlEmail"
                type="email"
                required
                placeholder="Email для новин та акцій"
                class="min-w-0"
                :error="nlV.errors.email"
                @blur="nlV.touch('email')"
              />
              <BBtn
                type="submit"
                class="w-full"
                :loading="nlLoading"
              >
                Підписатися
              </BBtn>
            </form>
            <p v-if="nlState === 'error'" class="mt-1 text-xs text-danger">Не вдалося підписатися, спробуйте пізніше.</p>
          </div>

          <div class="flex flex-wrap gap-2 text-xs font-medium text-gray-500">
            <span class="rounded-full border border-secondary-300 px-3 py-1.5">{{ settings?.currency ?? 'UAH' }}</span>
            <span class="rounded-full border border-secondary-300 px-3 py-1.5">Visa</span>
            <span class="rounded-full border border-secondary-300 px-3 py-1.5">Mastercard</span>
          </div>
        </section>

        <section class="space-y-4">
          <h3 class="text-sm font-semibold text-gray-900">
            Центр підтримки
          </h3>

          <nav class="space-y-2 text-sm text-gray-700" aria-label="Каталог у футері">
            <NuxtLink
                v-for="link in [{ label: 'Telegram', to: '/contacts' }, { label: 'Передзвоніть мені', to: '/contacts' }, { label: 'Контакти', to: '/contacts' }]"
                :key="link.to"
                :to="link.to"
                class="block transition hover:text-primary-600"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </section>

        <section class="space-y-4">
          <h3 class="text-sm font-semibold text-gray-900">
            Про компанію
          </h3>

          <nav class="space-y-2 text-sm text-gray-700" aria-label="Покупцю">
            <NuxtLink
                v-for="link in companyLinks"
                :key="link.to"
                :to="link.to"
                class="block transition hover:text-primary-600"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </section>

        <section class="space-y-4">
          <h3 class="text-sm font-semibold text-gray-900">
            Покупцям
          </h3>

          <nav class="space-y-2 text-sm text-gray-700" aria-label="Покупцям">
            <NuxtLink
                v-for="link in buyerLinks"
                :key="link.label"
                :to="link.to"
                class="block transition"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </section>

        <section class="space-y-5">
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900">
              Категорії
            </h3>

            <nav v-if="catalogLinks.length" class="space-y-2 text-sm text-gray-700" aria-label="Категорії у футері">
              <NuxtLink
                  v-for="link in catalogLinks.slice(0, 5)"
                  :key="link.to"
                  :to="link.to"
                  class="block transition"
              >
                {{ link.label }}
              </NuxtLink>
            </nav>
          </div>

          <div v-if="socialLinks.length" class="space-y-3 border-t border-gray-200 pt-5">
            <h3 class="text-sm font-semibold text-gray-900">
              Соціальні мережі
            </h3>
            <div class="flex flex-wrap gap-3">
              <a v-for="social in socialLinks" :key="social.name" :href="social.href" class="flex size-10 items-center justify-center rounded-full border border-secondary-300 text-secondary-800 transition hover:border-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer" :aria-label="social.name">
                <Icon :name="social.icon" size="20" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="border-t border-gray-200">
      <div class="store-container flex flex-col gap-3 py-5 text-xs text-gray-500 lg:flex-row lg:items-center lg:justify-between">
        <p>
          © 2026 Stella-shop
        </p>

        <p>
          Політика конфіденційності · Публічна оферта · Cookies policy
        </p>
      </div>
    </div>
  </footer>
</template>

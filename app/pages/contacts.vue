<script setup lang="ts">
import { useFeedbackStore } from '~/modules/feedback/feedbackStore'
import { useSettingsStore } from '~/modules/settings/settingsStore'

const feedbackStore = useFeedbackStore()
const settingsStore = useSettingsStore()
const form = reactive({ name: '', email: '', phone: '', message: '' })
const errorMessage = ref('')

await useAsyncData('contacts-settings', async () => {
  await settingsStore.fetch()
  return true
})

async function submit() {
  errorMessage.value = ''
  if (!form.name.trim() || !form.message.trim()) {
    errorMessage.value = 'Заповніть імʼя та повідомлення.'
    return
  }

  try {
    await feedbackStore.send({
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone || undefined,
      message: form.message.trim(),
    })
  }
  catch {
    errorMessage.value = 'Не вдалося надіслати звернення. Спробуйте ще раз.'
  }
}

onBeforeUnmount(feedbackStore.reset)

useSeoMeta({ title: 'Контакти', description: 'Контакти магазину та форма зворотного звʼязку.' })
</script>

<template>
  <div class="store-page store-container py-8 lg:py-14">
    <BBreadcrumbs :items="[{ label: 'Головна', to: '/' }, { label: 'Контакти' }]" />
    <h1 class="mb-8 mt-4 text-4xl font-semibold text-secondary-950">Контакти</h1>

    <div class="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <section class="rounded-xl bg-secondary-950 p-6 text-white sm:p-8">
        <h2 class="text-xl font-semibold">Ми на звʼязку</h2>
        <div class="mt-6 space-y-5 text-sm text-white/80">
          <a v-if="settingsStore.settings?.storePhone" :href="`tel:${settingsStore.settings.storePhone}`" class="flex items-center gap-3 hover:text-white"><Icon name="lucide:phone" />{{ settingsStore.settings.storePhone }}</a>
          <a v-if="settingsStore.settings?.storeEmail" :href="`mailto:${settingsStore.settings.storeEmail}`" class="flex items-center gap-3 hover:text-white"><Icon name="lucide:mail" />{{ settingsStore.settings.storeEmail }}</a>
          <p v-if="settingsStore.settings?.storeAddress" class="flex items-start gap-3"><Icon name="lucide:map-pin" class="mt-0.5 shrink-0" />{{ settingsStore.settings.storeAddress }}</p>
          <p v-if="!settingsStore.settings?.storePhone && !settingsStore.settings?.storeEmail && !settingsStore.settings?.storeAddress" class="leading-6">Контактні дані ще не заповнені в налаштуваннях магазину.</p>
        </div>
      </section>

      <section class="rounded-xl border border-secondary-200 p-6 sm:p-8">
        <BEmptyState v-if="feedbackStore.sent" title="Повідомлення надіслано" description="Ми звʼяжемося з вами найближчим часом.">
          <template #action><BBtn variant="outline" @click="feedbackStore.reset">Нове звернення</BBtn></template>
        </BEmptyState>
        <form v-else class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
          <h2 class="text-xl font-semibold text-secondary-900 sm:col-span-2">Напишіть нам</h2>
          <BInput v-model="form.name" label="Імʼя" required />
          <BPhoneInput v-model="form.phone" label="Телефон" />
          <BInput v-model="form.email" type="email" label="Email" class="sm:col-span-2" />
          <BTextarea v-model="form.message" label="Повідомлення" required class="sm:col-span-2" />
          <p v-if="errorMessage" class="text-sm text-danger sm:col-span-2">{{ errorMessage }}</p>
          <BBtn type="submit" :loading="feedbackStore.sending" class="sm:col-span-2">Надіслати</BBtn>
        </form>
      </section>
    </div>
  </div>
</template>

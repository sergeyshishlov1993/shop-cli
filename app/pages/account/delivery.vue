<script setup lang="ts">
import { useAccountStore } from '~/modules/account/accountStore'

definePageMeta({ layout: 'account', middleware: 'auth' })

const accountStore = useAccountStore()
const toast = useToast()
const isFormOpen = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const form = reactive({
  title: '',
  recipientFirstName: '',
  recipientLastName: '',
  recipientPhone: '',
  deliveryProvider: 'NOVA_POSHTA',
  city: '',
  warehouse: '',
  addressLine: '',
  postalCode: '',
  comment: '',
  isDefault: false,
})

const providerOptions = [
  { label: 'Нова Пошта', value: 'NOVA_POSHTA' },
  { label: 'Курʼєрська доставка', value: 'COURIER' },
]

await useAsyncData('delivery-profiles', async () => {
  await accountStore.fetchDeliveryProfiles()
  return true
})

function resetForm() {
  editingId.value = null
  Object.assign(form, {
    title: '', recipientFirstName: '', recipientLastName: '', recipientPhone: '',
    deliveryProvider: 'NOVA_POSHTA', city: '', warehouse: '', addressLine: '',
    postalCode: '', comment: '', isDefault: false,
  })
}

function openCreate() {
  resetForm()
  isFormOpen.value = true
}

function openEdit(profile: DeliveryProfile) {
  editingId.value = profile.id
  Object.assign(form, {
    title: profile.title,
    recipientFirstName: profile.recipientFirstName,
    recipientLastName: profile.recipientLastName,
    recipientPhone: profile.recipientPhone,
    deliveryProvider: profile.deliveryProvider,
    city: profile.city,
    warehouse: profile.warehouse ?? '',
    addressLine: profile.addressLine ?? '',
    postalCode: profile.postalCode ?? '',
    comment: profile.comment ?? '',
    isDefault: profile.isDefault,
  })
  isFormOpen.value = true
}

async function saveProfile() {
  if (!form.title.trim() || !form.recipientFirstName.trim() || !form.recipientLastName.trim() || !form.recipientPhone || !form.city.trim()) return
  saving.value = true
  const dto = {
    title: form.title.trim(),
    recipientFirstName: form.recipientFirstName.trim(),
    recipientLastName: form.recipientLastName.trim(),
    recipientPhone: form.recipientPhone,
    deliveryProvider: form.deliveryProvider,
    city: form.city.trim(),
    warehouse: form.warehouse.trim() || undefined,
    addressLine: form.addressLine.trim() || undefined,
    postalCode: form.postalCode.trim() || undefined,
    comment: form.comment.trim() || undefined,
    isDefault: form.isDefault,
  }
  try {
    if (editingId.value) await accountStore.updateDeliveryProfile(editingId.value, dto)
    else await accountStore.createDeliveryProfile(dto)
    isFormOpen.value = false
    toast.success('Адресу збережено')
  }
  catch {
    toast.error('Не вдалося зберегти адресу')
  }
  finally {
    saving.value = false
  }
}

async function removeProfile(profileId: number) {
  try {
    await accountStore.deleteDeliveryProfile(profileId)
    toast.success('Адресу видалено')
  }
  catch {
    toast.error('Не вдалося видалити адресу')
  }
}

useSeoMeta({ title: 'Адреси доставки', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="store-page store-container py-6 lg:py-10">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="store-title text-2xl lg:text-3xl">Адреси доставки</h1>
      <BBtn @click="openCreate"><Icon name="lucide:plus" size="18" /> Додати адресу</BBtn>
    </div>

    <BEmptyState v-if="!accountStore.deliveryProfiles.length" class="mt-8" title="Збережених адрес немає" description="Додайте адресу, щоб швидше оформлювати замовлення.">
      <template #action>
        <BBtn variant="primary" @click="openCreate">Додати адресу</BBtn>
      </template>
    </BEmptyState>
    <div v-else class="mt-8 grid gap-4 md:grid-cols-2">
      <article v-for="profile in accountStore.deliveryProfiles" :key="profile.id" class="glass rounded-xl p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-semibold text-secondary-900">{{ profile.title }}</h2>
              <BBadge v-if="profile.isDefault" variant="success" size="sm">Основна</BBadge>
            </div>
            <p class="mt-2 text-sm text-secondary-600">{{ profile.recipientFirstName }} {{ profile.recipientLastName }}</p>
            <p class="text-sm text-secondary-600">{{ profile.recipientPhone }}</p>
            <p class="mt-2 text-sm text-secondary-600">{{ profile.city }}<span v-if="profile.warehouse">, {{ profile.warehouse }}</span><span v-if="profile.addressLine">, {{ profile.addressLine }}</span></p>
          </div>
          <div class="flex gap-1">
            <BBtn variant="ghost" size="sm" aria-label="Редагувати" @click="openEdit(profile)"><Icon name="lucide:pencil" size="17" /></BBtn>
            <BBtn variant="ghost" size="sm" aria-label="Видалити" @click="removeProfile(profile.id)"><Icon name="lucide:trash-2" size="17" /></BBtn>
          </div>
        </div>
      </article>
    </div>

    <BModal v-model="isFormOpen" :title="editingId ? 'Редагувати адресу' : 'Нова адреса'" size="lg">
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveProfile">
        <BInput v-model="form.title" label="Назва адреси" required class="sm:col-span-2" />
        <BInput v-model="form.recipientFirstName" label="Імʼя отримувача" required />
        <BInput v-model="form.recipientLastName" label="Прізвище отримувача" required />
        <BPhoneInput v-model="form.recipientPhone" label="Телефон" required />
        <BSelect v-model="form.deliveryProvider" :options="providerOptions" label="Спосіб доставки" required />
        <BInput v-model="form.city" label="Місто" required />
        <BInput v-if="form.deliveryProvider === 'NOVA_POSHTA'" v-model="form.warehouse" label="Відділення" />
        <BInput v-else v-model="form.addressLine" label="Адреса" />
        <BInput v-model="form.postalCode" label="Поштовий індекс" />
        <BTextarea v-model="form.comment" label="Коментар" class="sm:col-span-2" />
        <BCheckbox v-model="form.isDefault" label="Основна адреса" class="sm:col-span-2" />
      </form>
      <template #footer>
        <BBtn variant="ghost" @click="isFormOpen = false">Скасувати</BBtn>
        <BBtn :loading="saving" @click="saveProfile">Зберегти</BBtn>
      </template>
    </BModal>
  </div>
</template>

<script setup lang="ts">
import AccountAvatarEditor from '~/modules/account/components/AccountAvatarEditor.vue'
import { useAccountStore } from '~/modules/account/accountStore'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'

definePageMeta({ layout: 'account', middleware: 'auth' })

const accountStore = useAccountStore()
const toast = useToast()
const saving = ref(false)
const changingPassword = ref(false)

const profileForm = reactive({ firstName: '', lastName: '', phone: '' })
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })

const profileV = useFormValidation({
  firstName: [() => profileForm.firstName, [rules.required('Імʼя обовʼязкове')]],
  lastName: [() => profileForm.lastName, [rules.required('Прізвище обовʼязкове')]],
  phone: [() => profileForm.phone, [rules.required('Телефон обовʼязковий'), rules.phoneUa()]],
})
const passwordV = useFormValidation({
  currentPassword: [() => passwordForm.currentPassword, [rules.required('Введіть поточний пароль')]],
  newPassword: [() => passwordForm.newPassword, [rules.required('Введіть новий пароль'), rules.minLength(8)]],
  confirmPassword: [() => passwordForm.confirmPassword, [rules.required('Підтвердіть пароль'), rules.sameAs(() => passwordForm.newPassword, 'Паролі не збігаються')]],
})

const { data: profileData } = await useAsyncData('account-profile', async () => {
  await accountStore.fetchProfile()
  return accountStore.profile
})

const initialProfile = profileData.value ?? accountStore.profile
if (initialProfile) {
  profileForm.firstName = initialProfile.firstName ?? ''
  profileForm.lastName = initialProfile.lastName ?? ''
  profileForm.phone = initialProfile.phone ?? ''
}

async function saveProfile() {
  if (!profileV.validate()) return
  saving.value = true
  try {
    await accountStore.updateProfile({
      firstName: profileForm.firstName.trim() || undefined,
      lastName: profileForm.lastName.trim() || undefined,
      phone: profileForm.phone || undefined,
    })
    toast.success('Профіль оновлено')
  }
  catch (e) {
    const rest = profileV.applyServerErrors(e)
    if (rest.length || !Object.values(profileV.errors).some(Boolean)) toast.error(rest.join('. ') || 'Не вдалося оновити профіль')
  }
  finally {
    saving.value = false
  }
}

async function changePassword() {
  if (!passwordV.validate()) return

  changingPassword.value = true
  try {
    await accountStore.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordV.reset()
    toast.success('Пароль змінено')
  }
  catch (e) {
    const rest = passwordV.applyServerErrors(e)
    if (rest.length || !Object.values(passwordV.errors).some(Boolean)) toast.error(rest.join('. ') || 'Не вдалося змінити пароль. Перевірте поточний пароль.')
  }
  finally {
    changingPassword.value = false
  }
}

useSeoMeta({ title: 'Мій профіль', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="store-page store-container py-6 lg:py-10">
    <h1 class="store-title mb-6 text-2xl lg:text-3xl">Мій профіль</h1>

    <div class="grid gap-6 lg:grid-cols-2">
      <form novalidate class="rounded-xl border border-secondary-200 p-5 sm:p-6" @submit.prevent="saveProfile">
        <h2 class="mb-5 text-lg font-semibold text-secondary-900">Контактні дані</h2>
        <div class="mb-6 border-b border-secondary-200 pb-6">
          <AccountAvatarEditor />
        </div>
        <div class="space-y-4">
          <BInput v-model="profileForm.firstName" label="Імʼя" required :error="profileV.errors.firstName" @blur="profileV.touch('firstName')" />
          <BInput v-model="profileForm.lastName" label="Прізвище" required :error="profileV.errors.lastName" @blur="profileV.touch('lastName')" />
          <BPhoneInput v-model="profileForm.phone" label="Телефон" required :error="profileV.errors.phone" />
          <BInput :model-value="accountStore.profile?.email ?? ''" label="Email" disabled />
          <BBtn type="submit" :loading="saving">Зберегти</BBtn>
        </div>
      </form>

      <form novalidate class="rounded-xl border border-secondary-200 p-5 sm:p-6" @submit.prevent="changePassword">
        <h2 class="mb-5 text-lg font-semibold text-secondary-900">Зміна пароля</h2>
        <div class="space-y-4">
          <BPasswordInput v-model="passwordForm.currentPassword" label="Поточний пароль" required :error="passwordV.errors.currentPassword" @blur="passwordV.touch('currentPassword')" />
          <BPasswordInput v-model="passwordForm.newPassword" label="Новий пароль" required :error="passwordV.errors.newPassword" @blur="passwordV.touch('newPassword')" />
          <BPasswordInput v-model="passwordForm.confirmPassword" label="Повторіть новий пароль" required :error="passwordV.errors.confirmPassword" @blur="passwordV.touch('confirmPassword')" />
          <BBtn type="submit" :loading="changingPassword">Змінити пароль</BBtn>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/modules/auth/authStore'
import { useToast } from '~/modules/ui/composables/useToast'

const emit = defineEmits<{
  success: []
}>()

const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
})

const isLoading = ref(false)

function validate(): boolean {
  let isValid = true
  errors.firstName = ''
  errors.lastName = ''
  errors.email = ''
  errors.phone = ''
  errors.password = ''

  if (!form.firstName.trim()) {
    errors.firstName = 'Ім\'я обов\'язкове'
    isValid = false
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Прізвище обов\'язкове'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Email обов\'язковий'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Невірний формат email'
    isValid = false
  }

  const rawPhone = form.phone.replace(/\D/g, '')
  if (!rawPhone) {
    errors.phone = 'Телефон обов\'язковий'
    isValid = false
  } else if (rawPhone.length < 12) {
    errors.phone = 'Введіть повний номер'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Пароль обов\'язковий'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Мінімум 6 символів'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validate()) return

  isLoading.value = true
  try {
    await authStore.register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
    })
    emit('success')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Помилка реєстрації'
    toast.error(message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form
    class="space-y-5"
    @submit.prevent="handleSubmit"
  >
    <h1 class="text-2xl font-bold text-secondary-900 text-center">
      Реєстрація
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <BInput
        v-model="form.firstName"
        label="Ім'я"
        placeholder="Ваше ім'я"
        :error="errors.firstName"
        required
      />
      <BInput
        v-model="form.lastName"
        label="Прізвище"
        placeholder="Ваше прізвище"
        :error="errors.lastName"
        required
      />
    </div>

    <BInput
      v-model="form.email"
      type="email"
      label="Email"
      placeholder="your@email.com"
      :error="errors.email"
      required
    />

    <BPhoneInput
      v-model="form.phone"
      label="Телефон"
      :error="errors.phone"
      required
    />

    <BPasswordInput
      v-model="form.password"
      label="Пароль"
      placeholder="Мінімум 6 символів"
      :error="errors.password"
      required
    />

    <BBtn
      type="submit"
      variant="primary"
      block
      :loading="isLoading"
    >
      Зареєструватися
    </BBtn>

    <p class="text-sm text-center text-secondary-500">
      Вже є акаунт?
      <NuxtLink
        to="/login"
        class="text-primary-600 hover:text-primary-700 transition-colors"
      >
        Увійти
      </NuxtLink>
    </p>
  </form>
</template>

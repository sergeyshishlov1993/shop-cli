<script setup lang="ts">
import { useAuthStore } from '~/modules/auth/authStore'
import { useToast } from '~/modules/ui/composables/useToast'

const emit = defineEmits<{
  success: []
}>()

const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const isLoading = ref(false)

function validate(): boolean {
  let isValid = true
  errors.email = ''
  errors.password = ''

  if (!form.email.trim()) {
    errors.email = 'Email обов\'язковий'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Невірний формат email'
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
    await authStore.login(form.email, form.password)
    emit('success')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Помилка входу'
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
      Вхід
    </h1>

    <BInput
      v-model="form.email"
      type="email"
      label="Email"
      placeholder="your@email.com"
      :error="errors.email"
      required
    />

    <BPasswordInput
      v-model="form.password"
      label="Пароль"
      placeholder="Введіть пароль"
      :error="errors.password"
      required
    />

    <BBtn
      type="submit"
      variant="primary"
      block
      :loading="isLoading"
    >
      Увійти
    </BBtn>

    <div class="flex items-center justify-between text-sm">
      <NuxtLink
        to="/register"
        class="text-primary-600 hover:text-primary-700 transition-colors"
      >
        Створити акаунт
      </NuxtLink>
      <NuxtLink
        to="/forgot-password"
        class="text-secondary-500 hover:text-secondary-700 transition-colors"
      >
        Забули пароль?
      </NuxtLink>
    </div>
  </form>
</template>

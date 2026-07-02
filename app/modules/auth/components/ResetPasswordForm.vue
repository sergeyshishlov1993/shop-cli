<script setup lang="ts">
import { useToast } from '~/modules/ui/composables/useToast'

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const toast = useToast()

const token = computed(() => route.query.token as string)

const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  newPassword: '',
  confirmPassword: '',
})

const isLoading = ref(false)

function validate(): boolean {
  let isValid = true
  errors.newPassword = ''
  errors.confirmPassword = ''

  if (!form.newPassword) {
    errors.newPassword = 'Пароль обов\'язковий'
    isValid = false
  } else if (form.newPassword.length < 6) {
    errors.newPassword = 'Мінімум 6 символів'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Підтвердіть пароль'
    isValid = false
  } else if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = 'Паролі не співпадають'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validate()) return

  if (!token.value) {
    toast.error('Невірне посилання для зміни паролю')
    return
  }

  isLoading.value = true
  try {
    await $api('/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        newPassword: form.newPassword,
      },
    })
    toast.success('Пароль успішно змінено')
    await router.push('/login')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Помилка зміни паролю'
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
      Новий пароль
    </h1>

    <p class="text-sm text-secondary-500 text-center">
      Введіть новий пароль для вашого акаунту.
    </p>

    <BPasswordInput
      v-model="form.newPassword"
      label="Новий пароль"
      placeholder="Мінімум 6 символів"
      :error="errors.newPassword"
      required
    />

    <BPasswordInput
      v-model="form.confirmPassword"
      label="Підтвердіть пароль"
      placeholder="Повторіть пароль"
      :error="errors.confirmPassword"
      required
    />

    <BBtn
      type="submit"
      variant="primary"
      block
      :loading="isLoading"
    >
      Змінити пароль
    </BBtn>

    <NuxtLink
      to="/login"
      class="block text-center text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
    >
      Повернутися до входу
    </NuxtLink>
  </form>
</template>

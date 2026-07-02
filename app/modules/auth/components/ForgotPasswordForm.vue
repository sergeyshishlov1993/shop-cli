<script setup lang="ts">
import { useToast } from '~/modules/ui/composables/useToast'

const { $api } = useNuxtApp()
const toast = useToast()

const email = ref('')
const emailError = ref('')
const isLoading = ref(false)
const isSubmitted = ref(false)

function validate(): boolean {
  emailError.value = ''

  if (!email.value.trim()) {
    emailError.value = 'Email обов\'язковий'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Невірний формат email'
    return false
  }

  return true
}

async function handleSubmit() {
  if (!validate()) return

  isLoading.value = true
  try {
    await $api('/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    })
    isSubmitted.value = true
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Помилка відправки'
    toast.error(message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold text-secondary-900 text-center">
      Відновлення паролю
    </h1>

    <template v-if="isSubmitted">
      <div class="rounded-xl bg-success/10 border border-success/30 p-5 text-center space-y-2">
        <BIcon
          name="check-circle"
          :size="48"
          class="text-success mx-auto"
        />
        <p class="text-secondary-800 font-medium">
          Лист надіслано
        </p>
        <p class="text-sm text-secondary-500">
          Перевірте вашу пошту {{ email }} та перейдіть за посиланням для зміни паролю.
        </p>
      </div>

      <NuxtLink
        to="/login"
        class="block text-center text-sm text-primary-600 hover:text-primary-700 transition-colors"
      >
        Повернутися до входу
      </NuxtLink>
    </template>

    <form
      v-else
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <p class="text-sm text-secondary-500 text-center">
        Введіть email, і ми надішлемо посилання для зміни паролю.
      </p>

      <BInput
        v-model="email"
        type="email"
        label="Email"
        placeholder="your@email.com"
        :error="emailError"
        required
      />

      <BBtn
        type="submit"
        variant="primary"
        block
        :loading="isLoading"
      >
        Надіслати посилання
      </BBtn>

      <NuxtLink
        to="/login"
        class="block text-center text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
      >
        Повернутися до входу
      </NuxtLink>
    </form>
  </div>
</template>

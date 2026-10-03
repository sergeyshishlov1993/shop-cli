<script setup lang="ts">
import { useAuthStore } from '~/modules/auth/authStore'
import { useToast } from '~/modules/ui/composables/useToast'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'

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

const isLoading = ref(false)

const { errors, validate, touch, applyServerErrors } = useFormValidation({
  firstName: [() => form.firstName, [rules.required('Ім\'я обов\'язкове')]],
  lastName: [() => form.lastName, [rules.required('Прізвище обов\'язкове')]],
  email: [() => form.email, [rules.required('Email обов\'язковий'), rules.email()]],
  phone: [() => form.phone, [rules.required('Телефон обов\'язковий'), rules.phoneUa()]],
  password: [() => form.password, [rules.required('Пароль обов\'язковий'), rules.minLength(8)]],
})

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
    const rest = applyServerErrors(error)
    if (rest.length || !Object.values(errors).some(Boolean)) {
      toast.error(rest.join(', ') || (error instanceof Error ? error.message : 'Помилка реєстрації'))
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form novalidate
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
      @blur="touch('firstName')"
        required
      />
      <BInput
        v-model="form.lastName"
        label="Прізвище"
        placeholder="Ваше прізвище"
        :error="errors.lastName"
      @blur="touch('lastName')"
        required
      />
    </div>

    <BInput
      v-model="form.email"
      type="email"
      label="Email"
      placeholder="your@email.com"
      :error="errors.email"
      @blur="touch('email')"
      required
    />

    <BPhoneInput
      v-model="form.phone"
      label="Телефон"
      :error="errors.phone"
      @blur="touch('phone')"
      required
    />

    <BPasswordInput
      v-model="form.password"
      label="Пароль"
      placeholder="Мінімум 8 символів"
      :error="errors.password"
      @blur="touch('password')"
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

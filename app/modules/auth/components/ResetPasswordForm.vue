<script setup lang="ts">
import { useToast } from '~/modules/ui/composables/useToast'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const toast = useToast()

const token = computed(() => route.query.token as string)

const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const isLoading = ref(false)

const { errors, validate, touch, applyServerErrors } = useFormValidation({
  newPassword: [() => form.newPassword, [rules.required('Пароль обов\'язковий'), rules.minLength(8)]],
  confirmPassword: [() => form.confirmPassword, [rules.required('Підтвердіть пароль'), rules.sameAs(() => form.newPassword, 'Паролі не співпадають')]],
})

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
    const rest = applyServerErrors(error)
    if (rest.length) toast.error(rest.join('. '))
    else if (!errors.newPassword) toast.error(error instanceof Error ? error.message : 'Помилка зміни паролю')
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
      Новий пароль
    </h1>

    <p class="text-sm text-secondary-500 text-center">
      Введіть новий пароль для вашого акаунту.
    </p>

    <BPasswordInput
      v-model="form.newPassword"
      label="Новий пароль"
      placeholder="Мінімум 8 символів"
      :error="errors.newPassword"
      required
      @blur="touch('newPassword')"
    />

    <BPasswordInput
      v-model="form.confirmPassword"
      label="Підтвердіть пароль"
      placeholder="Повторіть пароль"
      :error="errors.confirmPassword"
      required
      @blur="touch('confirmPassword')"
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

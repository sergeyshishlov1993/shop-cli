<script setup lang="ts">
import ForgotPasswordForm from '~/modules/auth/components/ForgotPasswordForm.vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})
</script>

<template>
  <ForgotPasswordForm />
</template>

<script setup lang="ts">
import ResetPasswordForm from '~/modules/auth/components/ResetPasswordForm.vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})
</script>

<template>
  <ResetPasswordForm />
</template>

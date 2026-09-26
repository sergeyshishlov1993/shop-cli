<script setup lang="ts">
import RegisterForm from '~/modules/auth/components/RegisterForm.vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const router = useRouter()

const handleSuccess = () => router.push('/')
</script>

<template>
  <RegisterForm @success="handleSuccess" />
</template>

<script setup lang="ts">
import RegisterForm from '~/modules/auth/components/RegisterForm.vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const router = useRouter()

function handleSuccess() {
  router.push('/')
}
</script>

<template>
  <RegisterForm @success="handleSuccess" />
</template>

<script setup lang="ts">
import LoginForm from '~/modules/auth/components/LoginForm.vue'

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
  <LoginForm @success="handleSuccess" />
</template>

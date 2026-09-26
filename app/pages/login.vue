<script setup lang="ts">
import LoginForm from '~/modules/auth/components/LoginForm.vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const router = useRouter()
const route = useRoute()

function handleSuccess() {
  const requestedPath = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : null
  router.push(requestedPath ?? '/account')
}
</script>

<template>
  <LoginForm @success="handleSuccess" />
</template>

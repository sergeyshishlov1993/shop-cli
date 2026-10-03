<script setup lang="ts">
import LoginForm from '~/modules/auth/components/LoginForm.vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const router = useRouter()
const route = useRoute()

function handleSuccess() {
  const redirect = route.query.redirect
  // Лише внутрішній шлях: //evil.com і /\evil.com браузер трактує як зовнішню адресу
  const requestedPath = typeof redirect === 'string' && /^\/(?![/\\])/.test(redirect)
    ? redirect
    : null
  router.push(requestedPath ?? '/account')
}
</script>

<template>
  <LoginForm @success="handleSuccess" />
</template>

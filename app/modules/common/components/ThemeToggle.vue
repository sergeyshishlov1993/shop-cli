<script setup lang="ts">
// Перемикач світлої/темної теми (auto за замовчуванням), ставить data-theme на <html>.
const colorMode = useColorMode({ attribute: 'data-theme', modes: { light: 'light', dark: 'dark' } })
const isDark = computed(() => colorMode.value === 'dark')
</script>

<template>
  <button type="button" :aria-label="isDark ? 'Світла тема' : 'Темна тема'" @click="colorMode = isDark ? 'light' : 'dark'">
    <ClientOnly><Icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" size="19" /></ClientOnly>
  </button>
</template>

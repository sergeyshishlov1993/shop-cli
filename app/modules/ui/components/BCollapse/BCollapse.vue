<script setup lang="ts">
// Плавне розкриття/згортання за висотою. Вміст завжди в DOM (inert, коли закрито).
// gap — відступ, який батьківський flex/grid додає перед блоком: згортаємо й його, щоб не лишався зазор.
defineProps<{
  open: boolean
  gap?: string
}>()
</script>

<template>
  <div class="b-collapse" :data-open="open" :style="gap ? { '--b-collapse-gap': gap } : undefined">
    <div :inert="!open">
      <slot />
    </div>
  </div>
</template>

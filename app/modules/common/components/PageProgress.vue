<script setup lang="ts">
// Смуга завантаження переходу між сторінками: під шапкою (її нижній край), а якщо шапку прокрутили геть — вгорі.
// Кольори — з теми сайту (primary), стан бере готовий Nuxt-індикатор.
// duration — за який час смуга «доповзає» до ~70%: більше значення = повільніше
const { progress, isLoading, error } = useLoadingIndicator({ duration: 6000 })
const top = ref(0)

watch(isLoading, (loading) => {
  if (!loading || !import.meta.client) return
  top.value = Math.max(0, document.querySelector('.store-header')?.getBoundingClientRect().bottom ?? 0)
})
</script>

<template>
  <div
    class="page-progress"
    :class="{ 'page-progress--error': error }"
    :style="{
      top: `${top}px`,
      opacity: isLoading ? 1 : 0,
      transform: `scaleX(${progress}%)`,
      backgroundSize: `${progress > 0 ? 10000 / progress : 0}% auto`,
    }"
    aria-hidden="true"
  />
</template>

<style>
.page-progress {
  position: fixed;
  right: 0;
  left: 0;
  z-index: 60;
  height: 3px;
  pointer-events: none;
  transform-origin: left;
  background-image: linear-gradient(to right, var(--color-primary-300), var(--color-primary-500), var(--color-primary-700));
  transition: transform 0.5s ease-out, opacity 0.4s;
}

.page-progress--error {
  background-image: linear-gradient(to right, var(--color-danger), var(--color-danger));
}
</style>

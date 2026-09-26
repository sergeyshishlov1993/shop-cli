<script setup lang="ts">
// Горизонтальна стрічка товарів: одна строка, гортання вбік, стрілки на десктопі.
const track = useTemplateRef<HTMLElement>('track')

function scrollBy(direction: 1 | -1) {
  const el = track.value
  if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
}
</script>

<template>
  <div class="product-rail relative">
    <div ref="track" v-drag-scroll class="home-product-rail">
      <slot />
    </div>
    <button type="button" class="product-rail__arrow glass left-0 -translate-x-1/2" aria-label="Назад" @click="scrollBy(-1)">
      <Icon name="lucide:chevron-left" size="20" />
    </button>
    <button type="button" class="product-rail__arrow glass right-0 translate-x-1/2" aria-label="Далі" @click="scrollBy(1)">
      <Icon name="lucide:chevron-right" size="20" />
    </button>
  </div>
</template>

<style scoped>
.product-rail__arrow {
  position: absolute;
  top: 38%;
  z-index: 2;
  display: none;
  width: 2.5rem;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: var(--color-secondary-800);
  transition: color 0.2s ease;
}

.product-rail__arrow:hover {
  color: var(--color-primary-700);
}

@media (min-width: 768px) {
  .product-rail__arrow {
    display: inline-flex;
  }
}
</style>

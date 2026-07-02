<script setup lang="ts">
interface Props {
  name: string
  size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24
})

const iconSize = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size
)
</script>

<template>
  <svg
    :width="iconSize"
    :height="iconSize"
    viewBox="0 0 24 24"
    aria-hidden="true"
    class="inline-block shrink-0 align-middle fill-current"
  >
    <use :href="`/sprite.svg#${props.name}`" />
  </svg>
</template>

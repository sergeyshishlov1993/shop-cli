<script setup lang="ts">
// Пикер точки фокуса (0..1): клик по изображению задаёт focalX/focalY.
// Изображение показываем целиком (contain), чтобы кликнуть по главному объекту.
const props = defineProps<{ src: string, focalX: number, focalY: number }>()
const emit = defineEmits<{ 'update:focalX': [number], 'update:focalY': [number] }>()

const dotStyle = computed(() => ({
  left: `${(props.focalX ?? 0.5) * 100}%`,
  top: `${(props.focalY ?? 0.5) * 100}%`,
}))

function pick(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
  emit('update:focalX', Math.round(x * 100) / 100)
  emit('update:focalY', Math.round(y * 100) / 100)
}
</script>

<template>
  <div
    class="relative inline-block w-full cursor-crosshair select-none overflow-hidden rounded border border-black/15"
    @click="pick"
  >
    <img :src="src" class="block max-h-64 w-full object-contain" alt="Точка фокуса">
    <span
      class="pointer-events-none absolute -ml-2 -mt-2 size-4 rounded-full border-2 border-white bg-black/70 shadow"
      :style="dotStyle"
    />
  </div>
</template>

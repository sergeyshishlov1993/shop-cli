<script setup lang="ts">
export interface BarDatum { label: string, value: number, hint?: string }

const props = withDefaults(defineProps<{
  items: BarDatum[]
  format?: (value: number) => string
  emptyText?: string
}>(), {
  format: (value: number) => String(value),
  emptyText: 'Немає даних за період',
})

const ROW = 36
const BAR = 14
const max = computed(() => Math.max(0, ...props.items.map(item => Math.abs(item.value))) || 1)
const height = computed(() => props.items.length * ROW)
const hovered = ref<number | null>(null)
</script>

<template>
  <div v-if="!items.length" class="flex h-32 items-center justify-center text-sm text-secondary-500">{{ emptyText }}</div>
  <div v-else class="relative">
    <svg :viewBox="`0 0 100 ${height}`" preserveAspectRatio="none" class="absolute inset-0 h-full w-full" aria-hidden="true">
      <rect
        v-for="(item, i) in items"
        :key="item.label"
        x="0"
        :y="i * ROW + ROW - BAR - 4"
        :width="Math.max(0.5, (Math.abs(item.value) / max) * 100)"
        :height="BAR"
        rx="0"
        :fill="item.value < 0 ? 'var(--color-secondary-500)' : 'var(--color-primary-500)'"
        :opacity="hovered === null || hovered === i ? 1 : 0.55"
      />
    </svg>
    <ul class="relative" role="list">
      <li
        v-for="(item, i) in items"
        :key="item.label"
        class="flex items-start justify-between gap-3 text-xs"
        :style="{ height: `${ROW}px` }"
        :title="item.hint ? `${item.label}: ${format(item.value)} · ${item.hint}` : `${item.label}: ${format(item.value)}`"
        @mouseenter="hovered = i"
        @mouseleave="hovered = null"
      >
        <span class="truncate text-secondary-600">{{ item.label }}</span>
        <span class="shrink-0 font-semibold text-secondary-900">{{ format(item.value) }}<span v-if="item.hint" class="ml-1 font-normal text-secondary-500">{{ item.hint }}</span></span>
      </li>
    </ul>
  </div>
</template>

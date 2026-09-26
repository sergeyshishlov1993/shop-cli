<script setup lang="ts">
export interface DonutDatum { key: string, label: string, value: number }

const props = withDefaults(defineProps<{
  items: DonutDatum[]
  centerLabel?: string
  emptyText?: string
}>(), {
  centerLabel: 'Усього',
  emptyText: 'Немає даних',
})

// Fixed categorical order — color follows position in `items`, which callers keep stable.
const COLORS = [
  'var(--color-primary-500)',
  'var(--color-secondary-500)',
  'var(--color-primary-300)',
  'var(--color-secondary-700)',
  'var(--color-primary-700)',
  'var(--color-secondary-300)',
]

const R = 40
const C = 2 * Math.PI * R
const total = computed(() => props.items.reduce((sum, item) => sum + item.value, 0))
const segments = computed(() => {
  let offset = 0
  return props.items.map((item, i) => {
    const length = total.value ? (item.value / total.value) * C : 0
    const seg = { ...item, color: COLORS[i % COLORS.length], length, offset }
    offset += length
    return seg
  })
})
const hovered = ref<string | null>(null)
const active = computed(() => segments.value.find(seg => seg.key === hovered.value))
const percent = (value: number) => total.value ? Math.round((value / total.value) * 100) : 0
</script>

<template>
  <div v-if="!total" class="flex h-40 items-center justify-center text-sm text-secondary-500">{{ emptyText }}</div>
  <div v-else class="flex flex-col items-center gap-5 sm:flex-row">
    <div class="relative w-40 shrink-0">
      <svg viewBox="0 0 100 100" class="block w-full -rotate-90" role="img" :aria-label="centerLabel">
        <circle
          v-for="seg in segments.filter(s => s.length > 0)"
          :key="seg.key"
          cx="50" cy="50" :r="R" fill="none"
          :stroke="seg.color"
          stroke-width="14"
          :stroke-dasharray="`${Math.max(0, seg.length - 1)} ${C}`"
          :stroke-dashoffset="-seg.offset"
          :opacity="hovered === null || hovered === seg.key ? 1 : 0.4"
          class="cursor-pointer transition-opacity"
          @mouseenter="hovered = seg.key"
          @mouseleave="hovered = null"
        />
      </svg>
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <template v-if="active">
          <span class="text-xl font-bold text-secondary-900">{{ active.value }}</span>
          <span class="text-[11px] text-secondary-500">{{ active.label }} · {{ percent(active.value) }}%</span>
        </template>
        <template v-else>
          <span class="text-xl font-bold text-secondary-900">{{ total }}</span>
          <span class="text-[11px] text-secondary-500">{{ centerLabel }}</span>
        </template>
      </div>
    </div>
    <ul class="w-full space-y-2 text-sm">
      <li
        v-for="seg in segments"
        :key="seg.key"
        class="flex items-center gap-2 rounded-md px-1"
        :class="hovered === seg.key ? 'bg-secondary-100' : ''"
        @mouseenter="hovered = seg.key"
        @mouseleave="hovered = null"
      >
        <span class="size-2.5 shrink-0 rounded-sm" :style="{ background: seg.color }" />
        <span class="flex-1 text-secondary-600">{{ seg.label }}</span>
        <span class="font-semibold text-secondary-900">{{ seg.value }}</span>
        <span class="w-10 text-right text-xs text-secondary-500">{{ percent(seg.value) }}%</span>
      </li>
    </ul>
  </div>
</template>

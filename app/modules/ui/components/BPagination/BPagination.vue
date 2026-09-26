<script setup lang="ts">
interface Props {
  page?: number
  totalPages: number
}

const props = withDefaults(defineProps<Props>(), {
  page: 1,
})

const emit = defineEmits<{
  'update:page': [value: number]
}>()

const pages = computed<Array<number | '...'>>(() => {
  const total = props.totalPages
  const current = props.page

  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)

  const items: Array<number | '...'> = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) items.push('...')
  for (let page = start; page <= end; page++) items.push(page)
  if (end < total - 1) items.push('...')

  items.push(total)

  return items
})

function go(page: number) {
  if (page < 1 || page > props.totalPages || page === props.page) return
  emit('update:page', page)
  // Після зміни сторінки — одразу до початку сторінки (для всього застосунку)
  if (import.meta.client) window.scrollTo({ top: 0 })
}
</script>

<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1" aria-label="Пагінація">
    <button
      type="button"
      class="flex size-10 items-center justify-center border border-secondary-200 text-secondary-700 transition-colors hover:border-secondary-900 disabled:pointer-events-none disabled:opacity-35"
      :disabled="page <= 1"
      aria-label="Попередня сторінка"
      @click="go(page - 1)"
    >
      <Icon name="lucide:chevron-left" class="size-4" />
    </button>

    <template v-for="(item, index) in pages" :key="`${item}-${index}`">
      <span
        v-if="item === '...'"
        class="flex size-10 items-center justify-center text-sm text-secondary-400"
      >
        …
      </span>
      <button
        v-else
        type="button"
        class="flex size-10 items-center justify-center border text-sm transition-colors"
        :class="item === page
          ? 'border-secondary-900 bg-secondary-900 text-white'
          : 'border-secondary-200 text-secondary-700 hover:border-secondary-900'"
        @click="go(item)"
      >
        {{ item }}
      </button>
    </template>

    <button
      type="button"
      class="flex size-10 items-center justify-center border border-secondary-200 text-secondary-700 transition-colors hover:border-secondary-900 disabled:pointer-events-none disabled:opacity-35"
      :disabled="page >= totalPages"
      aria-label="Наступна сторінка"
      @click="go(page + 1)"
    >
      <Icon name="lucide:chevron-right" class="size-4" />
    </button>
  </nav>
</template>

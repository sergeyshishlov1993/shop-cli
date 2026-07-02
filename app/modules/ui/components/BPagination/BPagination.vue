<script setup lang="ts">
interface Props {
  page: number
  totalPages: number
  siblingsCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  siblingsCount: 1,
})

const emit = defineEmits<{
  'update:page': [value: number]
}>()

const ELLIPSIS = '...' as const

const pages = computed<Array<number | typeof ELLIPSIS>>(() => {
  const total = props.totalPages
  const current = props.page
  const siblings = props.siblingsCount

  const totalNumbers = siblings * 2 + 3
  const totalBlocks = totalNumbers + 2

  if (total <= totalBlocks) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const leftSiblingIndex = Math.max(current - siblings, 1)
  const rightSiblingIndex = Math.min(current + siblings, total)

  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < total - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblings
    const leftRange = Array.from({ length: leftItemCount }, (_, index) => index + 1)
    return [...leftRange, ELLIPSIS, total]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblings
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, index) => total - rightItemCount + index + 1,
    )
    return [1, ELLIPSIS, ...rightRange]
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, index) => leftSiblingIndex + index,
  )
  return [1, ELLIPSIS, ...middleRange, ELLIPSIS, total]
})

const isFirstPage = computed(() => props.page === 1)
const isLastPage = computed(() => props.page === props.totalPages)

function goToPage(pageNumber: number) {
  if (pageNumber < 1 || pageNumber > props.totalPages || pageNumber === props.page) return
  emit('update:page', pageNumber)
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    aria-label="Пагінація"
    class="flex items-center justify-center gap-1"
  >
    <button
      :disabled="isFirstPage"
      class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
      :class="
        isFirstPage
          ? 'cursor-not-allowed text-secondary-300'
          : 'text-secondary-600 hover:bg-primary-100 hover:text-primary-700'
      "
      @click="goToPage(page - 1)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="h-5 w-5"
      >
        <path
          fill-rule="evenodd"
          d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <template v-for="(pageItem, index) in pages" :key="index">
      <span
        v-if="pageItem === '...'"
        class="flex h-9 w-9 items-center justify-center text-sm text-secondary-400"
      >
        …
      </span>

      <button
        v-else
        class="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors"
        :class="
          pageItem === page
            ? 'bg-primary-600 text-white'
            : 'text-secondary-700 hover:bg-primary-100 hover:text-primary-700'
        "
        @click="goToPage(pageItem)"
      >
        {{ pageItem }}
      </button>
    </template>

    <button
      :disabled="isLastPage"
      class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
      :class="
        isLastPage
          ? 'cursor-not-allowed text-secondary-300'
          : 'text-secondary-600 hover:bg-primary-100 hover:text-primary-700'
      "
      @click="goToPage(page + 1)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="h-5 w-5"
      >
        <path
          fill-rule="evenodd"
          d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </nav>
</template>

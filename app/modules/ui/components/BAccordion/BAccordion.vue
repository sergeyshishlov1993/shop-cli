<script setup lang="ts">
interface AccordionItem {
  key: string | number
  title: string
  content?: string
}

interface Props {
  items: AccordionItem[]
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
})

const openKeys = ref<Set<string | number>>(new Set())

function toggle(key: string | number) {
  if (openKeys.value.has(key)) {
    openKeys.value.delete(key)
  } else {
    if (!props.multiple) {
      openKeys.value.clear()
    }
    openKeys.value.add(key)
  }
}

function isOpen(key: string | number): boolean {
  return openKeys.value.has(key)
}
</script>

<template>
  <div class="divide-y divide-secondary-200 border-y border-secondary-200">
    <div
      v-for="item in items"
      :key="item.key"
    >
      <button
        class="flex w-full items-center justify-between gap-3 py-4 px-1 text-left text-sm font-medium text-secondary-800 transition-colors hover:text-primary-700"
        @click="toggle(item.key)"
      >
        <span>{{ item.title }}</span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="h-5 w-5 shrink-0 text-secondary-400 transition-transform duration-200"
          :class="isOpen(item.key) ? 'rotate-180' : ''"
        >
          <path
            fill-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <div
        class="grid transition-[grid-template-rows] duration-200"
        :class="isOpen(item.key) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      >
        <div class="overflow-hidden">
          <div class="px-1 pb-4 text-sm text-secondary-600">
            <slot
              name="item"
              :item="item"
              :is-open="isOpen(item.key)"
            >
              {{ item.content }}
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

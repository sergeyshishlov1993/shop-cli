<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  wide?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[99] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-5"
      @click.self="$emit('update:modelValue', false)"
    >
      <section
        class="admin-dialog h-dvh max-h-dvh w-full overflow-y-auto glass glass--strong sm:h-auto sm:max-h-[92dvh] sm:rounded-2xl"
        :class="wide ? 'max-w-4xl' : 'max-w-xl'"
      >
        <header class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/60 bg-transparent px-5 py-4 backdrop-blur-xl">
          <h2 class="text-lg font-semibold text-gray-950">{{ title }}</h2>
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
            aria-label="Закрити"
            @click="$emit('update:modelValue', false)"
          >
            <Icon name="lucide:x" size="18" />
          </button>
        </header>
        <div class="p-5 sm:p-6">
          <slot />
        </div>
      </section>
    </div>
  </Teleport>
</template>

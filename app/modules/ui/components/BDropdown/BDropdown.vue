<script setup lang="ts">
interface Props {
  align?: 'left' | 'right'
}

withDefaults(defineProps<Props>(), {
  align: 'left',
})

const root = useTemplateRef<HTMLElement>('root')
const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

onClickOutside(root, close)

defineExpose({ toggle, close })
</script>

<template>
  <span ref="root" class="relative inline-flex">
    <span @click="toggle">
      <slot name="trigger" />
    </span>

    <Transition name="b-zoom">
      <div
        v-if="isOpen"
        class="absolute top-full z-40 mt-2 min-w-48 glass glass--strong rounded-xl overflow-hidden"
        :class="align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'"
        @click="close"
      >
        <slot />
      </div>
    </Transition>
  </span>
</template>

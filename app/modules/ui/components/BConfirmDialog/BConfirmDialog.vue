<script setup lang="ts">
import {useConfirm} from '~/modules/ui/composables/useConfirm'
const { state, accept, cancel } = useConfirm()

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') cancel()
}

watch(() => state.value.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onEscape)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onEscape)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="state.isOpen"
        class="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4"
        @click.self="cancel"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <div
            v-if="state.isOpen"
            class="w-full max-w-sm rounded-xl border border-secondary-200 bg-white p-6 shadow-xl"
          >
            <div class="mb-1 flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                :class="
                  state.options.variant === 'danger'
                    ? 'bg-danger/10'
                    : 'bg-primary-100'
                "
              >
                <svg
                  v-if="state.options.variant === 'danger'"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="h-5 w-5 text-danger"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    clip-rule="evenodd"
                  />
                </svg>

                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="h-5 w-5 text-primary-600"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>

              <h3 class="text-base font-semibold text-secondary-800">
                {{ state.options.title }}
              </h3>
            </div>

            <p class="mb-6 pl-[52px] text-sm text-secondary-500">
              {{ state.options.message }}
            </p>

            <div class="flex items-center justify-end gap-3">
              <button
                class="rounded-lg px-4 py-2 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-100"
                @click="cancel"
              >
                {{ state.options.cancelText }}
              </button>

              <button
                class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                :class="
                  state.options.variant === 'danger'
                    ? 'bg-danger hover:bg-red-500'
                    : 'bg-primary-600 hover:bg-primary-700'
                "
                @click="accept"
              >
                {{ state.options.confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

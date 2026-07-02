<script setup lang="ts">
import {useToast} from "~/modules/ui/composables/useToast";

const { toasts, remove } = useToast()

const icons: Record<string, string> = {
  success: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z',
  error: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z',
  warning: 'M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  info: 'M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z',
}

const variantClasses: Record<string, string> = {
  success: 'border-success/30 bg-success/10 text-green-800',
  error: 'border-danger/30 bg-danger/10 text-red-800',
  warning: 'border-warning/30 bg-warning/10 text-amber-800',
  info: 'border-info/30 bg-info/10 text-sky-800',
}

const iconClasses: Record<string, string> = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
}

function onEnter(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement
  htmlEl.style.transform = 'translateX(100%)'
  htmlEl.style.opacity = '0'
  htmlEl.offsetHeight // force reflow
  htmlEl.style.transition = 'transform 300ms ease-out, opacity 300ms ease-out'
  htmlEl.style.transform = 'translateX(0)'
  htmlEl.style.opacity = '1'
  htmlEl.addEventListener('transitionend', done, { once: true })
}

function onLeave(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement
  htmlEl.style.transition = 'transform 200ms ease-in, opacity 200ms ease-in'
  htmlEl.style.transform = 'translateX(100%)'
  htmlEl.style.opacity = '0'
  htmlEl.addEventListener('transitionend', done, { once: true })
}

function startTimer(id: number, duration: number) {
  setTimeout(() => {
    remove(id)
  }, duration)
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] flex w-80 flex-col gap-2">
      <TransitionGroup
        :css="false"
        @enter="onEnter"
        @leave="onLeave"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :ref="() => startTimer(toast.id, toast.duration)"
          class="flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg"
          :class="variantClasses[toast.variant]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="mt-0.5 h-5 w-5 shrink-0"
            :class="iconClasses[toast.variant]"
          >
            <path
              fill-rule="evenodd"
              :d="icons[toast.variant]"
              clip-rule="evenodd"
            />
          </svg>

          <p class="flex-1 text-sm font-medium">
            {{ toast.message }}
          </p>

          <button
            class="shrink-0 rounded-lg p-0.5 transition-colors hover:bg-black/10"
            @click="remove(toast.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-4 w-4"
            >
              <path
                d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { instagramApi } from '~/modules/content/instagramApi'
import { useSettingsStore } from '~/modules/settings/settingsStore'

const settingsStore = useSettingsStore()
const { data: posts } = await useAsyncData('instagram-posts', async () => {
  try {
    return await Promise.race([
      instagramApi.list(),
      new Promise<never[]>((resolve) => setTimeout(() => resolve([]), 800)),
    ])
  }
  catch {
    return []
  }
}, { default: () => [] })

const instagramUrl = computed(() => settingsStore.settings?.socialLinksJson?.instagram ?? 'https://instagram.com')
const handle = computed(() => {
  const match = instagramUrl.value.match(/instagram\.com\/([^/?]+)/)
  return match ? `@${match[1]}` : 'INSTAGRAM'
})

// Перегляд постів у слайдері: клік по плитці відкриває лайтбокс зі стрілками, свайпом і клавішами ←/→/Esc
const openIndex = ref<number | null>(null)

// Офіційний вбудований плеєр Instagram для постів-відео: https://www.instagram.com/p/<code>/embed/
function embedUrl(link: string | null) {
  const code = link?.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)?.[1]
  return code ? `https://www.instagram.com/p/${code}/embed/` : null
}
const current = computed(() => (openIndex.value === null ? null : posts.value[openIndex.value] ?? null))

// 1214 → «1,2 тис.»
const formatCount = (value?: number | null) => (value ?? 0) >= 1000
  ? `${(value! / 1000).toFixed(1).replace('.', ',').replace(',0', '')} тис.`
  : String(value ?? 0)

const open = (index: number) => (openIndex.value = index)
const close = () => (openIndex.value = null)
function step(delta: number) {
  if (openIndex.value === null || !posts.value.length) return
  openIndex.value = (openIndex.value + delta + posts.value.length) % posts.value.length
}

let touchX = 0
function onTouchStart(e: TouchEvent) {
  touchX = e.touches[0]?.clientX ?? 0
}
function onTouchEnd(e: TouchEvent) {
  const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX
  if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1)
}

function onKey(e: KeyboardEvent) {
  if (openIndex.value === null) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') step(1)
  if (e.key === 'ArrowLeft') step(-1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (import.meta.client) document.body.style.overflow = ''
})
watch(openIndex, (value) => {
  if (import.meta.client) document.body.style.overflow = value === null ? '' : 'hidden'
})
</script>

<template>
  <section v-if="posts.length" class="store-container py-12">
    <div class="mb-6 text-center">
      <!-- Заголовок сам є посиланням на профіль; без дубля «INSTAGRAM» під ним -->
      <h2 class="store-title text-2xl md:text-3xl">
        <a :href="instagramUrl" target="_blank" rel="noopener" class="group inline-flex items-center gap-1 transition-colors hover:text-primary-700">
          {{ handle === 'INSTAGRAM' ? 'Instagram' : handle }}
          <Icon name="lucide:chevron-right" size="20" class="transition-transform group-hover:translate-x-0.5" />
        </a>
      </h2>
    </div>
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <button
        v-for="(post, index) in posts"
        :key="post.id"
        type="button"
        class="group relative block aspect-[4/5] overflow-hidden"
        :aria-label="`Переглянути пост ${index + 1}`"
        @click="open(index)"
      >
        <img :src="getFileUrl(post.file, 'medium')" :alt="handle" class="h-full w-full object-cover transition duration-300 group-hover:scale-105">
        <span class="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          <Icon name="lucide:instagram" size="28" />
        </span>
        <span v-if="post.likesCount != null" class="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/55 to-transparent px-3 pb-2 pt-6 text-xs text-white">
          <span class="flex items-center gap-1"><Icon name="lucide:heart" size="14" />{{ formatCount(post.likesCount) }}</span>
          <span class="flex items-center gap-1"><Icon name="lucide:message-circle" size="14" />{{ formatCount(post.commentsCount) }}</span>
        </span>
        <span v-if="post.isVideo" class="glass absolute right-2 top-2 flex size-8 items-center justify-center rounded-full text-white" aria-hidden="true">
          <Icon name="lucide:play" size="16" />
        </span>
      </button>
    </div>
    <div class="mt-6 text-center">
      <BBtn :to="instagramUrl" target="_blank" rel="noopener" variant="outline">
        <Icon name="lucide:instagram" size="18" /> Перейти в Instagram
      </BBtn>
    </div>

    <Teleport to="body">
      <Transition name="b-fade">
        <div
          v-if="current"
          class="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          :aria-label="`Instagram ${handle}`"
          @click.self="close"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <button type="button" class="glass absolute right-4 top-4 flex size-11 items-center justify-center rounded-full text-white" aria-label="Закрити" @click="close">
            <Icon name="lucide:x" size="22" />
          </button>

          <iframe
            v-if="current.isVideo && embedUrl(current.link)"
            :key="current.id"
            :src="embedUrl(current.link)!"
            class="h-[75dvh] w-full max-w-[26rem] rounded-lg bg-white"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
            loading="lazy"
            :title="`Відео Instagram ${handle}`"
          />
          <img v-else :src="getFileUrl(current.file, 'large')" :alt="handle" class="max-h-[75dvh] max-w-full rounded-lg object-contain">

          <button v-if="posts.length > 1" type="button" class="glass absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-white sm:left-6" aria-label="Попередній" @click="step(-1)">
            <Icon name="lucide:chevron-left" size="24" />
          </button>
          <button v-if="posts.length > 1" type="button" class="glass absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-white sm:right-6" aria-label="Наступний" @click="step(1)">
            <Icon name="lucide:chevron-right" size="24" />
          </button>

          <div class="mt-4 flex items-center gap-4 text-sm text-white/80">
            <span>{{ (openIndex ?? 0) + 1 }} / {{ posts.length }}</span>
            <span v-if="current.likesCount != null" class="flex items-center gap-1"><Icon name="lucide:heart" size="16" />{{ formatCount(current.likesCount) }}</span>
            <span v-if="current.commentsCount != null" class="flex items-center gap-1"><Icon name="lucide:message-circle" size="16" />{{ formatCount(current.commentsCount) }}</span>
            <BBtn :to="current.link ?? instagramUrl" target="_blank" rel="noopener" variant="primary" size="sm">
              <Icon name="lucide:instagram" size="16" /> Перейти в Instagram
            </BBtn>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

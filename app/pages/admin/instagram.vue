<script setup lang="ts">
import { adminApi, getAdminError, type AdminInstagramPost } from '~/modules/admin/adminApi'
import { useConfirm } from '~/modules/ui/composables/useConfirm'

const { confirm } = useConfirm()

definePageMeta({ layout: 'admin', middleware: 'admin' })

const toast = useToast()
const posts = ref<AdminInstagramPost[]>([])
const loading = ref(true)
const file = shallowRef<File | null>(null)
const link = ref('')
const saving = ref(false)

const INSTAGRAM_LINK_REGEX = /^https:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+/
const isValidLink = computed(() => INSTAGRAM_LINK_REGEX.test(link.value.trim()))
const canAdd = computed(() => !!file.value || isValidLink.value)

async function load() {
  loading.value = true
  try {
    posts.value = await adminApi.instagramPosts()
  }
  catch (error) {
    toast.error(getAdminError(error))
  }
  finally {
    loading.value = false
  }
}

async function add() {
  if (!canAdd.value) {
    toast.error('Оберіть фото або вставте посилання на пост')
    return
  }
  saving.value = true
  try {
    if (file.value) {
      const uploaded = await adminApi.uploadFile(file.value)
      await adminApi.createInstagramPost({ fileId: uploaded.id, link: link.value.trim() || undefined, sortOrder: posts.value.length })
    }
    else {
      await adminApi.createInstagramPostFromLink({ link: link.value.trim(), sortOrder: posts.value.length })
    }
    file.value = null
    link.value = ''
    toast.success('Пост додано')
    await load()
  }
  catch (error) {
    toast.error(getAdminError(error))
  }
  finally {
    saving.value = false
  }
}

const refreshing = ref(false)
async function refreshStats() {
  refreshing.value = true
  try {
    const res = await adminApi.refreshInstagramStats()
    toast.success(`Оновлено ${res.updated} з ${res.total}`)
    await load()
  }
  catch (error) {
    toast.error(getAdminError(error))
  }
  finally {
    refreshing.value = false
  }
}

async function toggleActive(post: AdminInstagramPost) {
  try {
    await adminApi.updateInstagramPost(post.id, { isActive: !post.isActive })
    await load()
  }
  catch (error) {
    toast.error(getAdminError(error))
  }
}

async function remove(post: AdminInstagramPost) {
  if (!(await confirm({ title: 'Видалити пост?', message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Видалити' }))) return
  try {
    await adminApi.deleteInstagramPost(post.id)
    await load()
  }
  catch (error) {
    toast.error(getAdminError(error))
  }
}

onMounted(load)
</script>

<template>
  <div class="p-4">
    <h1 class="mb-1 text-xl font-semibold">Instagram-блок</h1>
    <div class="mb-4 flex flex-wrap items-start justify-between gap-3"><p class="text-sm text-secondary-500">Фото для блоку на головній. Посилання — на пост в Instagram (необовʼязково).</p><BBtn variant="outline" size="sm" :loading="refreshing" @click="refreshStats"><Icon name="lucide:refresh-cw" size="14" /> Оновити лайки</BBtn></div>

    <div class="mb-6 grid gap-4 rounded-xl border border-secondary-200 bg-white p-4 md:grid-cols-[16rem_1fr] md:items-end">
      <BFile v-model="file" label="Фото" accept="image/*" :max-size="10 * 1024 * 1024" />
      <div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <BInput v-model="link" label="Посилання на пост" placeholder="https://instagram.com/p/..." />
        <BBtn :loading="saving" :disabled="!canAdd" class="max-sm:w-full" @click="add">Додати</BBtn>
        <p class="text-xs text-secondary-400 sm:col-span-2">Можна лише вставити посилання — фото підтягнеться автоматично (для відео — обкладинка й плеєр Instagram).</p>
      </div>
    </div>

    <BSpinner v-if="loading" />
    <!-- Сітка 4:5 як у стрічці Instagram; medium-версія без квадратного кропу thumb; дії — скляні іконки поверх фото -->
    <div v-else-if="posts.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <div v-for="post in posts" :key="post.id" class="group relative overflow-hidden rounded-xl border border-secondary-200 bg-secondary-100" :class="{ 'opacity-50': !post.isActive }">
        <img :src="getFileUrl(post.file, 'medium')" alt="" class="aspect-[4/5] w-full object-cover">
        <span v-if="post.likesCount != null" class="glass absolute right-2 top-2 flex items-center gap-2 rounded-full px-2 py-1 text-xs text-secondary-800">
          <span class="flex items-center gap-0.5"><Icon name="lucide:heart" size="12" />{{ post.likesCount }}</span>
          <span class="flex items-center gap-0.5"><Icon name="lucide:message-circle" size="12" />{{ post.commentsCount ?? 0 }}</span>
        </span>
        <span v-if="post.isVideo" class="glass absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs text-secondary-800">
          <Icon name="lucide:play" size="12" /> Відео
        </span>
        <div class="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
          <a v-if="post.link" :href="post.link" target="_blank" rel="noopener" class="glass flex size-9 items-center justify-center rounded-full text-secondary-800" aria-label="Відкрити пост">
            <Icon name="lucide:external-link" size="16" />
          </a>
          <span v-else />
          <div class="flex gap-2">
            <button type="button" class="glass flex size-9 items-center justify-center rounded-full text-secondary-800" :aria-label="post.isActive ? 'Сховати' : 'Показати'" @click="toggleActive(post)">
              <Icon :name="post.isActive ? 'lucide:eye-off' : 'lucide:eye'" size="16" />
            </button>
            <button type="button" class="glass flex size-9 items-center justify-center rounded-full text-danger" aria-label="Видалити" @click="remove(post)">
              <Icon name="lucide:trash-2" size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-secondary-400">Постів ще немає</p>
  </div>
</template>

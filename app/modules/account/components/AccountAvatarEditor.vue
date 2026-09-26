<script setup lang="ts">
import { useAccountStore } from '~/modules/account/accountStore'
import { getFileUrl } from '~/modules/common/helpers/fileUrl'

const props = defineProps<{ compact?: boolean, small?: boolean }>()
const accountStore = useAccountStore()
const toast = useToast()
const avatarFile = ref<File | null>(null)
const localPreviewUrl = ref('')
const uploading = ref(false)
const removing = ref(false)

const profile = computed(() => accountStore.profile)
const displayName = computed(() => {
  const value = profile.value
  return value ? [value.firstName, value.lastName].filter(Boolean).join(' ') || value.email : ''
})
const initials = computed(() => {
  const value = displayName.value.trim()
  return value ? value.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() : '?'
})
const storedAvatarUrl = computed(() => getFileUrl(profile.value?.avatarFile, 'medium'))
const avatarUrl = computed(() => localPreviewUrl.value || storedAvatarUrl.value)

watch(avatarFile, (file) => {
  if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value)
  localPreviewUrl.value = file && import.meta.client ? URL.createObjectURL(file) : ''
})
// Клік по кругу аватара відкриває вибір файлу; обране фото одразу завантажується.
function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  avatarFile.value = input.files?.[0] ?? null
  input.value = ''
  if (avatarFile.value) uploadAvatar()
}

onBeforeUnmount(() => {
  if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value)
})

async function uploadAvatar() {
  const file = avatarFile.value
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    toast.error('Оберіть зображення JPEG, PNG або WebP')
    avatarFile.value = null
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    toast.error('Максимальний розмір фото — 10 МБ')
    avatarFile.value = null
    return
  }

  uploading.value = true
  try {
    await accountStore.uploadAvatar(file)
    avatarFile.value = null
    toast.success('Фото профілю оновлено')
  }
  catch {
    toast.error('Не вдалося оновити фото')
  }
  finally {
    uploading.value = false
  }
}

async function removeAvatar() {
  if (avatarFile.value) {
    avatarFile.value = null
    return
  }
  removing.value = true
  try {
    await accountStore.deleteAvatar()
    toast.success('Фото профілю видалено')
  }
  catch {
    toast.error('Не вдалося видалити фото')
  }
  finally {
    removing.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-2" :class="props.compact ? '' : 'sm:flex-row sm:gap-5'">
    <div class="relative">
      <label
          class="group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full bg-secondary-100 text-2xl font-semibold text-secondary-700 ring-1 ring-secondary-200 focus-within:ring-2 focus-within:ring-primary-400"
          :class="[props.small ? 'size-16 text-base' : 'size-36', { 'pointer-events-none': uploading || removing }]"
      >
        <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="size-full object-cover" />
        <span v-else>{{ initials }}</span>
        <span class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-secondary-900/45 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <Icon name="lucide:camera" :size="props.small ? 18 : 22" />
          <template v-if="!props.small">{{ avatarUrl ? 'Змінити фото' : 'Додати фото' }}</template>
        </span>
        <span v-if="uploading || removing" class="absolute inset-0 flex items-center justify-center bg-white/75">
          <BSpinner size="sm" />
        </span>
        <input
            type="file"
            class="sr-only"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Фото профілю"
            :disabled="uploading || removing"
            @change="onPick"
        />
      </label>
      <button
          v-if="storedAvatarUrl && !props.small"
          type="button"
          class="glass absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full text-secondary-700 transition-colors hover:text-danger"
          aria-label="Видалити фото"
          :disabled="removing"
          @click="removeAvatar"
      >
        <Icon name="lucide:trash-2" size="16" />
      </button>
    </div>
    <p v-if="!props.small" class="text-center text-xs text-secondary-500" :class="props.compact ? '' : 'sm:text-left'">
      Натисніть на фото, щоб змінити.<br />JPEG, PNG або WebP, до 10 МБ.
    </p>
  </div>
</template>

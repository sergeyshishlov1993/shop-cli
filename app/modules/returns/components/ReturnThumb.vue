<script setup lang="ts">
import type { ReturnFile } from '~/modules/returns/returns'

defineProps<{ image: ReturnFile | Pick<FileRecord, 's3Key' | 's3KeyThumb' | 's3KeyMedium' | 's3KeyLarge'> | null | undefined, alt?: string }>()
</script>

<template>
  <img v-if="image" :src="getFileUrl(image, 'thumb')" :alt="alt || ''" loading="lazy" class="h-16 w-12 shrink-0 rounded-lg object-cover">
  <span v-else class="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary-100 text-secondary-400" aria-hidden="true">
    <Icon name="lucide:image" size="18" />
  </span>
</template>

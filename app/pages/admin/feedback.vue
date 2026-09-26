<script setup lang="ts">
import { adminApi, getAdminError, type AdminFeedback } from '~/modules/admin/adminApi'
import { useConfirm } from '~/modules/ui/composables/useConfirm'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { confirm: confirmDialog } = useConfirm()
const toast = useToast(); const items = ref<AdminFeedback[]>([]); const status = ref('')
const statusOptions = [{ label: 'Усі', value: '' }, { label: 'Нові', value: 'NEW' }, { label: 'В роботі', value: 'IN_PROGRESS' }, { label: 'Завершені', value: 'DONE' }]
async function load() { try { const r = await adminApi.feedback({ status: status.value || undefined, limit: 100 }); items.value = r.items } catch (e) { toast.error(getAdminError(e)) } }
async function update(item: AdminFeedback, next: AdminFeedback['status']) { try { await adminApi.updateFeedbackStatus(item.id, next); await load() } catch (e) { toast.error(getAdminError(e)) } }
async function remove(item: AdminFeedback) { if (!(await confirmDialog({ title: 'Приховати звернення?', message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Приховати' }))) return; await adminApi.deleteFeedback(item.id); await load() }
await load()
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold">Звернення</h1>
        <p class="text-sm text-secondary-500">Повідомлення з форми зворотного зв’язку.</p>
      </div>
      <BSelect v-model="status" class="w-full sm:w-48" :options="statusOptions" @update:model-value="load" />
    </div>

    <div class="grid gap-4">
      <article v-for="item in items" :key="item.id" class="rounded-xl border border-secondary-200 bg-white p-5">
        <div class="flex flex-wrap justify-between gap-3">
          <div>
            <b>{{ item.name }}</b>
            <p class="text-xs text-secondary-500">{{ item.email || 'без email' }} · {{ item.phone || 'без телефону' }}</p>
          </div>
          <span class="text-xs text-secondary-500">{{ new Date(item.createdAt).toLocaleString('uk-UA') }}</span>
        </div>
        <p class="my-4 whitespace-pre-wrap text-sm">{{ item.message }}</p>
        <div class="flex items-center gap-2">
          <BBtn variant="outline" size="sm" @click="update(item, 'IN_PROGRESS')">В роботу</BBtn>
          <BBtn variant="outline" size="sm" class="!bg-emerald-50 !text-emerald-700 !border-emerald-50" @click="update(item, 'DONE')">Завершити</BBtn>
          <BBtn variant="icon" size="sm" class="ml-auto !text-red-600" @click="remove(item)"><Icon name="lucide:trash-2" /></BBtn>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { adminApi, getAdminError, type AdminFeedback } from '~/modules/admin/adminApi'
import { useConfirm } from '~/modules/ui/composables/useConfirm'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { confirm: confirmDialog } = useConfirm()
const toast = useToast(); const items = ref<AdminFeedback[]>([]); const status = ref(''); const deletedOnly = ref(false)
const statusOptions = [{ label: 'Усі', value: '' }, { label: 'Нові', value: 'NEW' }, { label: 'В роботі', value: 'IN_PROGRESS' }, { label: 'Завершені', value: 'DONE' }]
async function load() { try { const r = await adminApi.feedback({ status: status.value || undefined, limit: 100, deletedOnly: deletedOnly.value }); items.value = r.items } catch (e) { toast.error(getAdminError(e)) } }
async function toggleDeleted() { deletedOnly.value = !deletedOnly.value; status.value = ''; await load() }
const badgesTick = useState('admin-badges-tick', () => 0)
async function update(item: AdminFeedback, next: AdminFeedback['status']) { try { await adminApi.updateFeedbackStatus(item.id, next); badgesTick.value++; await load() } catch (e) { toast.error(getAdminError(e)) } }
async function remove(item: AdminFeedback) { if (!(await confirmDialog({ title: 'Приховати звернення?', message: 'Звернення можна буде відновити зі списку прихованих.', variant: 'danger', confirmText: 'Приховати' }))) return; await adminApi.deleteFeedback(item.id); await load() }
async function restore(item: AdminFeedback) { try { await adminApi.restoreFeedback(item.id); await load(); toast.success('Звернення відновлено') } catch (e) { toast.error(getAdminError(e)) } }
await load()
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold">Звернення</h1>
        <p class="text-sm text-secondary-500">Повідомлення з форми зворотного зв’язку.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <BSelect v-if="!deletedOnly" v-model="status" class="w-full sm:w-48" :options="statusOptions" @update:model-value="load" />
        <BBtn variant="outline" size="sm" @click="toggleDeleted">{{ deletedOnly ? 'Показати активні' : 'Показати приховані' }}</BBtn>
      </div>
    </div>

    <div class="grid gap-4">
      <article v-for="item in items" :key="item.id" class="rounded-xl border border-secondary-200 bg-white p-5">
        <div class="flex flex-wrap justify-between gap-3">
          <div>
            <b>{{ item.name }}</b>
            <p class="text-xs text-secondary-500">{{ item.email || 'без email' }} · {{ item.phone || 'без телефону' }}</p>
          </div>
          <div class="flex items-center gap-2">
            <BBadge v-if="item.deletedAt" variant="secondary">Приховано</BBadge>
            <span class="text-xs text-secondary-500">{{ new Date(item.createdAt).toLocaleString('uk-UA') }}</span>
          </div>
        </div>
        <p class="my-4 whitespace-pre-wrap text-sm">{{ item.message }}</p>
        <div class="flex items-center gap-2">
          <template v-if="item.deletedAt">
            <BBtn variant="outline" size="sm" @click="restore(item)">Відновити</BBtn>
          </template>
          <template v-else>
            <BBtn variant="outline" size="sm" @click="update(item, 'IN_PROGRESS')">В роботу</BBtn>
            <BBtn variant="outline" size="sm" class="!bg-emerald-50 !text-emerald-700 !border-emerald-50" @click="update(item, 'DONE')">Завершити</BBtn>
            <BBtn variant="icon" size="sm" class="ml-auto !text-red-600" aria-label="Приховати звернення" @click="remove(item)"><Icon name="lucide:trash-2" /></BBtn>
          </template>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { adminApi, getAdminError, type AdminColor, type AdminSize } from '~/modules/admin/adminApi'
import AdminDialog from '~/modules/admin/components/AdminDialog.vue'
import { useConfirm } from '~/modules/ui/composables/useConfirm'

definePageMeta({ layout: 'admin', middleware: 'admin' })
const toast = useToast()
const { confirm } = useConfirm()
const colors = ref<AdminColor[]>([])
const sizes = ref<AdminSize[]>([])
const colorDialog = ref(false)
const sizeDialog = ref(false)
const colorId = ref<number | null>(null)
const sizeId = ref<number | null>(null)
const colorForm = reactive({ name: '', hexCode: '#000000', isActive: true })
const sizeForm = reactive({ name: '', sizeType: 'CLOTHING' as AdminSize['sizeType'], sortOrder: 0, isActive: true })

async function load() { [colors.value, sizes.value] = await Promise.all([adminApi.colors(), adminApi.sizes()]) }
function editColor(item?: AdminColor) { colorId.value = item?.id ?? null; Object.assign(colorForm, item ? { name: item.name, hexCode: item.hexCode || '#000000', isActive: item.isActive } : { name: '', hexCode: '#000000', isActive: true }); colorDialog.value = true }
function editSize(item?: AdminSize) { sizeId.value = item?.id ?? null; Object.assign(sizeForm, item ? { name: item.name, sizeType: item.sizeType, sortOrder: item.sortOrder, isActive: item.isActive } : { name: '', sizeType: 'CLOTHING', sortOrder: 0, isActive: true }); sizeDialog.value = true }
async function saveColor() { try { if (colorId.value) await adminApi.updateColor(colorId.value, colorForm); else await adminApi.createColor(colorForm); colorDialog.value = false; await load() } catch (error) { toast.error(getAdminError(error)) } }
async function saveSize() { try { if (sizeId.value) await adminApi.updateSize(sizeId.value, sizeForm); else await adminApi.createSize(sizeForm); sizeDialog.value = false; await load() } catch (error) { toast.error(getAdminError(error)) } }
async function removeColor(id: number) { if (!(await confirm({ title: 'Видалити колір?', message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Видалити' }))) return; try { await adminApi.deleteColor(id); await load() } catch (error) { toast.error(getAdminError(error, 'Колір використовується у варіантах')) } }
async function removeSize(id: number) { if (!(await confirm({ title: 'Видалити розмір?', message: 'Цю дію не можна скасувати.', variant: 'danger', confirmText: 'Видалити' }))) return; try { await adminApi.deleteSize(id); await load() } catch (error) { toast.error(getAdminError(error, 'Розмір використовується у варіантах')) } }
await load()
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-8">
    <div>
      <h1 class="text-3xl font-bold">Кольори й розміри</h1>
      <p class="mt-1 text-sm text-secondary-500">Довідники, які використовуються у варіантах товарів і фільтрах каталогу.</p>
    </div>
    <div class="grid gap-6 xl:grid-cols-2">
      <section class="overflow-hidden rounded-xl border border-secondary-200 bg-white">
        <div class="flex items-center justify-between border-b border-secondary-200 p-5">
          <h2 class="text-lg font-semibold">Кольори</h2>
          <BBtn size="sm" @click="editColor()">Додати</BBtn>
        </div>
        <table class="admin-table w-full text-sm">
          <tbody class="divide-y divide-secondary-100">
            <tr v-for="item in colors" :key="item.id">
              <td data-label="Колір" class="p-4"><span class="inline-flex items-center gap-3"><i class="size-6 rounded-full border border-secondary-200" :style="{ background: item.hexCode || '#fff' }" />{{ item.name }}</span></td>
              <td data-label="Статус" class="p-4 text-secondary-500">{{ item.isActive ? 'Активний' : 'Прихований' }}</td>
              <td class="admin-table__actions p-4 text-right">
                <BBtn variant="icon" size="sm" @click="editColor(item)"><Icon name="lucide:pencil" /></BBtn>
                <BBtn variant="icon" size="sm" class="text-red-600" @click="removeColor(item.id)"><Icon name="lucide:trash-2" /></BBtn>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <section class="overflow-hidden rounded-xl border border-secondary-200 bg-white">
        <div class="flex items-center justify-between border-b border-secondary-200 p-5">
          <h2 class="text-lg font-semibold">Розміри</h2>
          <BBtn size="sm" @click="editSize()">Додати</BBtn>
        </div>
        <table class="admin-table w-full text-sm">
          <tbody class="divide-y divide-secondary-100">
            <tr v-for="item in sizes" :key="item.id">
              <td data-label="Розмір" class="p-4 font-semibold">{{ item.name }}</td>
              <td data-label="Тип" class="p-4 text-secondary-500">{{ item.sizeType }} · №{{ item.sortOrder }}</td>
              <td data-label="Статус" class="p-4 text-secondary-500">{{ item.isActive ? 'Активний' : 'Прихований' }}</td>
              <td class="admin-table__actions p-4 text-right">
                <BBtn variant="icon" size="sm" @click="editSize(item)"><Icon name="lucide:pencil" /></BBtn>
                <BBtn variant="icon" size="sm" class="text-red-600" @click="removeSize(item.id)"><Icon name="lucide:trash-2" /></BBtn>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
    <AdminDialog v-model="colorDialog" :title="colorId ? 'Редагувати колір' : 'Новий колір'">
      <form class="space-y-4" @submit.prevent="saveColor">
        <BInput v-model="colorForm.name" label="Назва" required />
        <label class="block space-y-1">
          <span class="text-sm">HEX</span>
          <div class="flex gap-3">
            <input v-model="colorForm.hexCode" type="color" class="h-11 w-16 rounded border border-secondary-200">
            <BInput v-model="colorForm.hexCode" pattern="#[0-9A-Fa-f]{6}" class="flex-1" />
          </div>
        </label>
        <BCheckbox v-model="colorForm.isActive" label="Активний" />
        <div class="flex justify-end"><BBtn type="submit">Зберегти</BBtn></div>
      </form>
    </AdminDialog>
    <AdminDialog v-model="sizeDialog" :title="sizeId ? 'Редагувати розмір' : 'Новий розмір'">
      <form class="space-y-4" @submit.prevent="saveSize">
        <BInput v-model="sizeForm.name" label="Назва" required />
        <BSelect v-model="sizeForm.sizeType" label="Тип" :options="[{ label: 'Одяг', value: 'CLOTHING' }, { label: 'Взуття', value: 'SHOES' }, { label: 'Аксесуари', value: 'ACCESSORY' }]" />
        <BInput v-model.number="sizeForm.sortOrder" type="number" label="Порядок" />
        <BCheckbox v-model="sizeForm.isActive" label="Активний" />
        <div class="flex justify-end"><BBtn type="submit">Зберегти</BBtn></div>
      </form>
    </AdminDialog>
  </div>
</template>

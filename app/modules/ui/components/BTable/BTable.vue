<script setup lang="ts" generic="RowType extends Record<string, unknown>">
interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
}

interface Props {
  columns: TableColumn[]
  rows: RowType[]
  rowKey?: keyof RowType
  empty?: string
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: undefined,
  empty: 'Немає даних',
})

function alignClass(align?: 'left' | 'right' | 'center'): string {
  if (align === 'right') return 'text-right'
  if (align === 'center') return 'text-center'
  return 'text-left'
}

function rowKeyValue(row: RowType, index: number): string | number {
  return props.rowKey ? String(row[props.rowKey]) : index
}
</script>

<template>
  <!-- На мобільному рядки стають картками (клас admin-table у main.css); колонка без заголовка — дії -->
  <div class="lg:overflow-x-auto">
    <table class="b-table admin-table w-full text-sm">
      <thead>
        <tr class="text-secondary-500">
          <th
            v-for="column in columns"
            :key="column.key"
            class="whitespace-nowrap py-2 pr-4 font-medium"
            :class="alignClass(column.align)"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="rowKeyValue(row, index)"
          class="border-t border-secondary-200"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="py-2 pr-4"
            :class="[alignClass(column.align), { 'admin-table__actions': !column.label }]"
            :data-label="column.label || undefined"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="py-6 text-center text-secondary-400">
            <slot name="empty">{{ empty }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

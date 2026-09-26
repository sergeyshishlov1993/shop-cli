import { useSettingsStore } from '~/modules/settings/settingsStore'

// Повернення можна повністю вимкнути в адмінці (Налаштування → Повернення)
export function useReturnsEnabled() {
  const settingsStore = useSettingsStore()
  return computed(() => settingsStore.settings?.returnsEnabled !== false)
}

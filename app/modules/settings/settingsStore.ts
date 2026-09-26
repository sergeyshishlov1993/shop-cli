import { settingsApi } from '~/modules/settings/settingsApi'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<PublicSettings | null>(null)
  const loading = ref(false)

  async function fetch(force = false) {
    if (settings.value && !force) return settings.value
    loading.value = true
    try {
      settings.value = await settingsApi.getPublic()
      return settings.value
    }
    finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    fetch,
  }
})
